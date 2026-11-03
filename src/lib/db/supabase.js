/**
 * Supabase (Postgres + Auth) data adapter — the production backend.
 *
 * All authorization is enforced by RLS policies in `supabase/schema.sql`.
 * The browser only ever holds the public anon key.
 */
import {
  aggregateAllBusinessStats,
  aggregateBusinessStats,
  aggregateOverview,
  getTimeRangeStart,
} from '../analyticsShared';
import {
  createUniqueSlug,
  toSlug,
  validateBusinessInput,
} from '../validation';

const ALLOWED_EVENT_TYPES = new Set([
  'page_visit',
  'page_view',
  'google_review_click',
  'google_click',
]);

const BUSINESS_COLUMNS = [
  'id',
  'business_name',
  'slug',
  'industry_key',
  'category',
  'description',
  'contact_info',
  'logo_url',
  'primary_color',
  'secondary_color',
  'background_color',
  'button_color',
  'google_review_url',
  'welcome_heading',
  'welcome_description',
  'welcome_message',
  'default_language',
  'review_options',
  'review_templates',
  'is_active',
  'created_at',
  'updated_at',
].join(', ');

function normalizeBusiness(row) {
  if (!row) return null;
  return {
    ...row,
    // The UI historically used both `name` and `business_name`.
    name: row.business_name,
    contact_info:
      row.contact_info && typeof row.contact_info === 'object' ? row.contact_info : {},
  };
}

function toRow(value) {
  return {
    business_name: value.business_name,
    slug: value.slug,
    industry_key: value.industry_key,
    category: value.category,
    description: value.description,
    contact_info: value.contact_info,
    logo_url: value.logo_url,
    primary_color: value.primary_color,
    secondary_color: value.secondary_color,
    background_color: value.background_color,
    button_color: value.button_color,
    google_review_url: value.google_review_url,
    welcome_heading: value.welcome_heading,
    welcome_description: value.welcome_description,
    welcome_message: value.welcome_message,
    default_language: value.default_language,
    review_options: value.review_options,
    review_templates: value.review_templates,
    is_active: value.is_active,
  };
}

function mapError(error, fallbackMessage) {
  if (!error) return null;

  if (error.code === '23505') {
    const conflict = new Error('That slug is already in use by another business.');
    conflict.fieldErrors = { slug: conflict.message };
    return conflict;
  }

  if (error.code === '42501' || error.code === 'PGRST301') {
    return new Error('You do not have permission to perform this action.');
  }

  if (
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('NetworkError')
  ) {
    return new Error('Unable to reach the server. Check your connection and try again.');
  }

  return new Error(error.message || fallbackMessage);
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',
    isAdmin: user.app_metadata?.role === 'admin',
  };
}

function buildEventFilter(client, timeRange, businessId = null) {
  let query = client
    .from('analytics_events')
    .select('business_id, event_type, created_at');

  if (businessId) query = query.eq('business_id', businessId);

  const threshold = getTimeRangeStart(timeRange);
  if (threshold) query = query.gte('created_at', new Date(threshold).toISOString());

  return query;
}

export function createSupabaseAdapter(client) {
  if (!client) {
    throw new Error('A Supabase client is required.');
  }

  async function getAllBusinessRows() {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw mapError(error, 'Failed to load businesses.');
    return data || [];
  }

  async function getEvents(timeRange, businessId = null) {
    let query = buildEventFilter(client, timeRange, businessId);
    const { data, error } = await query;
    if (error) throw mapError(error, 'Failed to load analytics.');
    return data || [];
  }

  const businesses = {
    async getAll() {
      const rows = await getAllBusinessRows();
      return rows.map(normalizeBusiness);
    },

    async getBySlug(slug) {
      if (!slug) return null;
      const { data, error } = await client
        .from('businesses')
        .select('*')
        .eq('slug', toSlug(slug))
        .maybeSingle();

      if (error) throw mapError(error, 'Failed to load business.');
      return normalizeBusiness(data);
    },

    async getById(id) {
      if (!id) return null;
      const { data, error } = await client
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw mapError(error, 'Failed to load business.');
      return normalizeBusiness(data);
    },

    async isSlugAvailable(slug, excludeId = null) {
      if (!slug) return false;
      let query = client
        .from('businesses')
        .select('id')
        .eq('slug', toSlug(slug))
        .limit(1);

      if (excludeId) query = query.neq('id', excludeId);

      const { data, error } = await query;
      if (error) throw mapError(error, 'Failed to check slug availability.');
      return !data || data.length === 0;
    },

    async generateUniqueSlug(nameOrSlug, excludeId = null) {
      let query = client.from('businesses').select('slug');
      if (excludeId) query = query.neq('id', excludeId);

      const { data, error } = await query;
      if (error) throw mapError(error, 'Failed to generate a slug.');

      return createUniqueSlug(
        nameOrSlug,
        (data || []).map((row) => row.slug)
      );
    },

    async create(businessData = {}) {
      const { valid, errors, value } = validateBusinessInput(businessData);
      if (!valid) {
        const error = new Error('Please fix the highlighted fields and try again.');
        error.fieldErrors = errors;
        throw error;
      }

      const { data, error } = await client
        .from('businesses')
        .insert(toRow(value))
        .select(BUSINESS_COLUMNS)
        .single();

      if (error) throw mapError(error, 'Failed to create business.');
      return normalizeBusiness(data);
    },

    async update(id, updates = {}) {
      const existing = await businesses.getById(id);
      if (!existing) return null;

      const { valid, errors, value } = validateBusinessInput({
        ...existing,
        ...updates,
        id: existing.id,
      });

      if (!valid) {
        const error = new Error('Please fix the highlighted fields and try again.');
        error.fieldErrors = errors;
        throw error;
      }

      const { data, error } = await client
        .from('businesses')
        .update(toRow(value))
        .eq('id', id)
        .select(BUSINESS_COLUMNS)
        .single();

      if (error) throw mapError(error, 'Failed to update business.');
      return normalizeBusiness(data);
    },

    async delete(id) {
      const { data, error } = await client
        .from('businesses')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw mapError(error, 'Failed to delete business.');
      return Array.isArray(data) && data.length > 0;
    },

    async search(query = '', statusFilter = 'all') {
      const list = await businesses.getAll();
      const normalizedQuery = String(query ?? '').trim().toLowerCase();

      return list.filter((business) => {
        const matchesQuery =
          !normalizedQuery ||
          String(business.business_name || '').toLowerCase().includes(normalizedQuery) ||
          String(business.slug || '').toLowerCase().includes(normalizedQuery) ||
          String(business.category || '').toLowerCase().includes(normalizedQuery);

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = business.is_active === true;
        if (statusFilter === 'inactive') matchesStatus = business.is_active === false;

        return matchesQuery && matchesStatus;
      });
    },
  };

  const analytics = {
    async trackEvent(businessId, eventType, metadata = {}) {
      if (!businessId) throw new Error('A business id is required to track analytics.');
      if (!ALLOWED_EVENT_TYPES.has(eventType)) {
        throw new Error(`Unsupported analytics event type: ${eventType}`);
      }

      // Do NOT chain `.select()` here: anonymous visitors have INSERT but no
      // SELECT permission on analytics_events, and requesting the row back
      // would make the insert fail with a permission error.
      const { error } = await client
        .from('analytics_events')
        .insert({
          business_id: businessId,
          event_type: eventType,
          metadata: metadata && typeof metadata === 'object' ? metadata : {},
        });

      if (error) throw mapError(error, 'Failed to record analytics event.');
      return { business_id: businessId, event_type: eventType };
    },

    async getStats(timeRange = 'all') {
      const [businessesResult, events] = await Promise.all([
        client.from('businesses').select('id, is_active'),
        getEvents(timeRange),
      ]);

      if (businessesResult.error) {
        throw mapError(businessesResult.error, 'Failed to load analytics.');
      }

      return aggregateOverview({
        businesses: businessesResult.data || [],
        events,
        timeRange,
      });
    },

    async getBusinessStats(businessId, timeRange = 'all') {
      const events = await getEvents(timeRange, businessId);
      return aggregateBusinessStats({ businessId, events, timeRange });
    },

    async getAllBusinessesStats(timeRange = 'all') {
      const [businessesResult, events] = await Promise.all([
        client
          .from('businesses')
          .select('id, business_name, slug, is_active, category')
          .order('created_at', { ascending: false }),
        getEvents(timeRange),
      ]);

      if (businessesResult.error) {
        throw mapError(businessesResult.error, 'Failed to load analytics.');
      }

      return aggregateAllBusinessStats({
        businesses: (businessesResult.data || []).map(normalizeBusiness),
        events,
        timeRange,
      });
    },

    async getEventsByBusiness(businessId) {
      const { data, error } = await client
        .from('analytics_events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw mapError(error, 'Failed to load analytics.');
      return data || [];
    },
  };

  const auth = {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) return null;
      return mapUser(data.session?.user);
    },

    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email ?? '').trim(),
        password: String(password ?? ''),
      });

      if (error) {
        const message = error.message?.includes('Invalid login credentials')
          ? 'Invalid email or password.'
          : mapError(error, 'Unable to sign in.').message;
        return { user: null, error: message };
      }

      const user = mapUser(data.user);
      if (!user?.isAdmin) {
        await client.auth.signOut();
        return {
          user: null,
          error: 'This account does not have administrator access.',
        };
      }

      return { user, error: null };
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw mapError(error, 'Failed to sign out.');
      return true;
    },

    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(mapUser(session?.user));
      });

      return () => {
        data?.subscription?.unsubscribe?.();
      };
    },
  };

  return {
    mode: 'supabase',
    businesses,
    analytics,
    auth,
  };
}

export default createSupabaseAdapter;
