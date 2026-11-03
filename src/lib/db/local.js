/**
 * Local demo data adapter.
 *
 * This backend exists so the app can run without any external services. It is
 * NOT suitable for production customer data: `localStorage` is per-browser,
 * client-controlled, and cannot be shared between a business owner and their
 * customers. Configure Supabase for any real deployment.
 */
import { SESSION_TTL_MS } from '../../config/app';
import {
  aggregateAllBusinessStats,
  aggregateBusinessStats,
  aggregateOverview,
} from '../analyticsShared';
import {
  constantTimeEqual,
  createSalt,
  DEFAULT_ITERATIONS,
  hashPassword,
} from '../crypto';
import {
  createUniqueSlug,
  normalizeEmail,
  toSlug,
  validateBusinessInput,
} from '../validation';

const STORAGE_KEY = 'reviewgen_db';
const SESSION_KEY = 'reviewgen_auth';
const SCHEMA_VERSION = 2;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 60_000;
const MAX_METADATA_BYTES = 2048;

const ALLOWED_EVENT_TYPES = new Set([
  'page_visit',
  'page_view',
  'google_review_click',
  'google_click',
]);

export function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function getDefaultStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function getDefaultSessionStorage() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function defaultGenerateId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  // RFC-4122-ish fallback for environments without randomUUID.
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function blankData() {
  return {
    version: SCHEMA_VERSION,
    businesses: [],
    analytics_events: [],
    admin: null,
  };
}

export function createLocalAdapter(options = {}) {
  const storage = options.storage ?? getDefaultStorage();
  const sessionStorage = options.sessionStorage ?? getDefaultSessionStorage();
  const seedAdminEmail = normalizeEmail(options.seedAdminEmail || 'admin@reviewgen.local');
  const seedAdminPassword = options.seedAdminPassword || 'reviewgen-demo';
  const pbkdf2Iterations = Math.max(1000, Number(options.pbkdf2Iterations) || DEFAULT_ITERATIONS);
  const sessionTtlMs = Number(options.sessionTtlMs) || SESSION_TTL_MS;
  const generateId = options.generateId || defaultGenerateId;
  const now = options.now || (() => Date.now());

  let readyPromise = null;
  let failedAttempts = 0;
  let lockedUntil = 0;

  function assertStorage() {
    if (!storage) {
      throw new Error(
        'Browser storage is unavailable. Enable localStorage or configure Supabase for production.'
      );
    }
  }

  function persist(data) {
    assertStorage();
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      throw new Error(
        'Unable to save data. Browser storage may be full or disabled.',
        { cause: error }
      );
    }
  }

  function readData() {
    assertStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return blankData();

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error('Stored application data is corrupted and could not be read.', {
        cause: error,
      });
    }
  }

  async function initialize() {
    assertStorage();

    const raw = storage.getItem(STORAGE_KEY);
    let data = blankData();
    let needsSave = !raw;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          data = { ...blankData(), ...parsed };
        } else {
          needsSave = true;
        }
      } catch {
        // Preserve the corrupt payload for debugging instead of silently
        // destroying the user's data.
        try {
          storage.setItem(`${STORAGE_KEY}_corrupt_${now()}`, raw);
        } catch {
          // Ignore backup failures.
        }
        needsSave = true;
      }
    }

    if (!Array.isArray(data.businesses)) {
      data.businesses = [];
      needsSave = true;
    }

    if (!Array.isArray(data.analytics_events)) {
      data.analytics_events = [];
      needsSave = true;
    }

    // Canonicalise analytics events written by older versions.
    data.analytics_events = data.analytics_events
      .filter((event) => event && typeof event === 'object')
      .map((event) => ({
        ...event,
        business_id: event.business_id || event.businessId,
        event_type: event.event_type || event.eventType,
        metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
        created_at: event.created_at || new Date(now()).toISOString(),
      }));

    if (data.version !== SCHEMA_VERSION) {
      data.version = SCHEMA_VERSION;
      needsSave = true;
    }

    const existingAdmin = data.admin && typeof data.admin === 'object' ? data.admin : null;
    const admin = {
      email: normalizeEmail(existingAdmin?.email) || seedAdminEmail,
      passwordSalt: typeof existingAdmin?.passwordSalt === 'string' ? existingAdmin.passwordSalt : '',
      passwordHash: typeof existingAdmin?.passwordHash === 'string' ? existingAdmin.passwordHash : '',
      passwordIterations:
        Number(existingAdmin?.passwordIterations) > 0
          ? Number(existingAdmin.passwordIterations)
          : pbkdf2Iterations,
    };

    // Upgrade legacy plaintext passwords on first load.
    if (!admin.passwordHash && typeof existingAdmin?.password === 'string' && existingAdmin.password) {
      admin.passwordSalt = createSalt();
      admin.passwordHash = await hashPassword(
        existingAdmin.password,
        admin.passwordSalt,
        admin.passwordIterations
      );
      needsSave = true;
    }

    // First run: seed the demo admin from configuration.
    if (!admin.passwordHash && seedAdminPassword) {
      admin.passwordSalt = createSalt();
      admin.passwordHash = await hashPassword(
        seedAdminPassword,
        admin.passwordSalt,
        admin.passwordIterations
      );
      needsSave = true;
    }

    if (
      !existingAdmin ||
      existingAdmin.email !== admin.email ||
      existingAdmin.passwordSalt !== admin.passwordSalt ||
      existingAdmin.passwordHash !== admin.passwordHash ||
      existingAdmin.passwordIterations !== admin.passwordIterations ||
      Object.hasOwn(existingAdmin, 'password')
    ) {
      needsSave = true;
    }

    data.admin = admin;

    if (needsSave) persist(data);
    return data;
  }

  function ensureReady() {
    if (!readyPromise) {
      readyPromise = initialize().catch((error) => {
        readyPromise = null;
        throw error;
      });
    }
    return readyPromise;
  }

  async function loadData() {
    await ensureReady();
    return readData();
  }

  function getTakenSlugs(data, excludeId = null) {
    return data.businesses
      .filter((business) => business.id !== excludeId)
      .map((business) => business.slug);
  }

  function assertUniqueSlug(data, slug, excludeId = null) {
    const normalized = toSlug(slug);
    const conflict = data.businesses.some(
      (business) =>
        business.id !== excludeId && String(business.slug || '').toLowerCase() === normalized
    );

    if (conflict) {
      const error = new Error(`The slug "${normalized}" is already in use by another business.`);
      error.fieldErrors = { slug: error.message };
      throw error;
    }
  }

  const businesses = {
    async getAll() {
      const data = await loadData();
      return clone(
        [...data.businesses].sort(
          (left, right) =>
            new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
        )
      );
    },

    async getBySlug(slug) {
      if (!slug) return null;
      const data = await loadData();
      const normalized = toSlug(slug);
      const business = data.businesses.find(
        (item) => String(item.slug || '').toLowerCase() === normalized
      );
      return business ? clone(business) : null;
    },

    async getById(id) {
      if (!id) return null;
      const data = await loadData();
      const business = data.businesses.find((item) => item.id === id);
      return business ? clone(business) : null;
    },

    async isSlugAvailable(slug, excludeId = null) {
      if (!slug) return false;
      const data = await loadData();
      const normalized = toSlug(slug);
      return !data.businesses.some(
        (business) =>
          business.id !== excludeId &&
          String(business.slug || '').toLowerCase() === normalized
      );
    },

    async generateUniqueSlug(nameOrSlug, excludeId = null) {
      const data = await loadData();
      return createUniqueSlug(nameOrSlug, getTakenSlugs(data, excludeId));
    },

    async create(businessData = {}) {
      const data = await loadData();
      const { valid, errors, value } = validateBusinessInput(businessData);

      if (!valid) {
        const error = new Error('Please fix the highlighted fields and try again.');
        error.fieldErrors = errors;
        throw error;
      }

      assertUniqueSlug(data, value.slug);

      const timestamp = new Date(now()).toISOString();
      const business = {
        ...value,
        id: businessData.id || generateId(),
        name: value.business_name,
        created_at: timestamp,
        updated_at: timestamp,
      };

      data.businesses.push(business);
      persist(data);
      return clone(business);
    },

    async update(id, updates = {}) {
      const data = await loadData();
      const index = data.businesses.findIndex((business) => business.id === id);
      if (index === -1) return null;

      const existing = data.businesses[index];
      const merged = { ...existing, ...updates, id: existing.id };
      const { valid, errors, value } = validateBusinessInput(merged);

      if (!valid) {
        const error = new Error('Please fix the highlighted fields and try again.');
        error.fieldErrors = errors;
        throw error;
      }

      if (value.slug !== existing.slug) {
        assertUniqueSlug(data, value.slug, id);
      }

      const updated = {
        ...value,
        id: existing.id,
        name: value.business_name,
        created_at: existing.created_at,
        updated_at: new Date(now()).toISOString(),
      };

      data.businesses[index] = updated;
      persist(data);
      return clone(updated);
    },

    async delete(id) {
      const data = await loadData();
      const initialLength = data.businesses.length;
      data.businesses = data.businesses.filter((business) => business.id !== id);

      if (data.businesses.length === initialLength) return false;

      data.analytics_events = data.analytics_events.filter(
        (event) => (event.business_id || event.businessId) !== id
      );

      persist(data);
      return true;
    },

    async search(query = '', statusFilter = 'all') {
      const list = await businesses.getAll();
      const normalizedQuery = String(query ?? '').trim().toLowerCase();

      return list.filter((business) => {
        const name = business.name || business.business_name || '';
        const matchesQuery =
          !normalizedQuery ||
          name.toLowerCase().includes(normalizedQuery) ||
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

      const data = await loadData();
      const businessExists = data.businesses.some((business) => business.id === businessId);
      if (!businessExists) return null;

      let safeMetadata = {};
      if (metadata && typeof metadata === 'object') {
        try {
          safeMetadata =
            JSON.stringify(metadata).length <= MAX_METADATA_BYTES ? metadata : {};
        } catch {
          safeMetadata = {};
        }
      }

      const event = {
        id: generateId(),
        business_id: businessId,
        event_type: eventType,
        metadata: safeMetadata,
        created_at: new Date(now()).toISOString(),
      };

      data.analytics_events.push(event);
      persist(data);
      return clone(event);
    },

    async getStats(timeRange = 'all') {
      const data = await loadData();
      return aggregateOverview({
        businesses: data.businesses,
        events: data.analytics_events,
        timeRange,
      });
    },

    async getBusinessStats(businessId, timeRange = 'all') {
      const data = await loadData();
      return aggregateBusinessStats({
        businessId,
        events: data.analytics_events,
        timeRange,
      });
    },

    async getAllBusinessesStats(timeRange = 'all') {
      const data = await loadData();
      return aggregateAllBusinessStats({
        businesses: data.businesses,
        events: data.analytics_events,
        timeRange,
      });
    },

    async getEventsByBusiness(businessId) {
      const data = await loadData();
      return clone(
        data.analytics_events.filter(
          (event) => (event.business_id || event.businessId) === businessId
        )
      );
    },
  };

  const auth = {
    async getSession() {
      await ensureReady();
      if (!sessionStorage) return null;

      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const session = JSON.parse(raw);
        const data = readData();
        const currentEmail = normalizeEmail(data.admin?.email);

        const isValid =
          session?.email &&
          normalizeEmail(session.email) === currentEmail &&
          Number(session.expiresAt) > now();

        if (!isValid) {
          sessionStorage.removeItem(SESSION_KEY);
          return null;
        }

        return {
          id: 'local-admin',
          email: currentEmail,
          isAdmin: true,
          expiresAt: Number(session.expiresAt),
        };
      } catch {
        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {
          // Ignore storage failures.
        }
        return null;
      }
    },

    async signIn(email, password) {
      await ensureReady();

      const currentTime = now();
      if (currentTime < lockedUntil) {
        const seconds = Math.ceil((lockedUntil - currentTime) / 1000);
        return {
          user: null,
          error: `Too many failed attempts. Please try again in ${seconds}s.`,
        };
      }

      const data = readData();
      const admin = data.admin;
      const normalizedEmail = normalizeEmail(email);

      // Always run the KDF so a missing/mismatched account does not produce a
      // noticeably faster response.
      const salt = admin?.passwordSalt || 'reviewgen-invalid-account-salt';
      const iterations = admin?.passwordIterations || pbkdf2Iterations;
      const candidateHash = await hashPassword(String(password ?? ''), salt, iterations);

      const emailMatches = Boolean(admin) && normalizeEmail(admin.email) === normalizedEmail;
      const passwordMatches = Boolean(admin) && constantTimeEqual(candidateHash, admin.passwordHash);

      if (!emailMatches || !passwordMatches) {
        failedAttempts += 1;
        if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
          failedAttempts = 0;
          lockedUntil = currentTime + LOGIN_LOCK_MS;
        }
        return { user: null, error: 'Invalid email or password.' };
      }

      failedAttempts = 0;
      lockedUntil = 0;

      const user = {
        id: 'local-admin',
        email: normalizeEmail(admin.email),
        isAdmin: true,
      };
      const expiresAt = currentTime + sessionTtlMs;

      if (sessionStorage) {
        try {
          sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ email: user.email, issuedAt: currentTime, expiresAt })
          );
        } catch {
          // A login without persistence still works for this page load.
        }
      }

      return { user: { ...user, expiresAt }, error: null };
    },

    async signOut() {
      try {
        sessionStorage?.removeItem(SESSION_KEY);
      } catch {
        // Ignore storage failures.
      }
      return true;
    },

    /**
     * localStorage does not emit changes within the same tab. This hook exists
     * to keep the adapter interface identical to Supabase.
     */
    onAuthStateChange() {
      return () => {};
    },
  };

  /**
   * Wipes all local demo data (businesses, analytics, and the seeded admin) so
   * the next load re-seeds from configuration. Exposed only by this adapter —
   * it exists to recover from stale data created by older builds.
   */
  async function resetDemoData() {
    try {
      storage?.removeItem(STORAGE_KEY);
      sessionStorage?.removeItem(SESSION_KEY);
    } catch (error) {
      throw new Error('Unable to reset demo data. Browser storage may be disabled.', {
        cause: error,
      });
    }

    readyPromise = null;
    failedAttempts = 0;
    lockedUntil = 0;
  }

  return {
    mode: 'local',
    businesses,
    analytics,
    auth,
    resetDemoData,
  };
}

export default createLocalAdapter;
