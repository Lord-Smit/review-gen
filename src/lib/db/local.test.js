import { describe, expect, it } from 'vitest';
import { createLocalAdapter, createMemoryStorage } from './local';

const FIXED_NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const STORAGE_KEY = 'reviewgen_db';

function setup(overrides = {}) {
  const storage = overrides.storage ?? createMemoryStorage();
  const sessionStorage = overrides.sessionStorage ?? createMemoryStorage();
  let counter = 0;

  const adapter = createLocalAdapter({
    storage,
    sessionStorage,
    seedAdminEmail: 'admin@test.local',
    seedAdminPassword: 'correct horse',
    pbkdf2Iterations: 1000,
    now: () => FIXED_NOW,
    generateId: () => `generated-${(counter += 1)}`,
    ...overrides,
  });

  return { adapter, storage, sessionStorage };
}

const validBusiness = {
  business_name: 'Royal Salon',
  slug: 'royal-salon',
  google_review_url: 'https://g.page/r/abc/review',
  contact_info: { email: 'owner@example.com', phone: '+1 555 0100' },
};

describe('local adapter — auth', () => {
  it('has no session before signing in', async () => {
    const { adapter } = setup();
    await expect(adapter.auth.getSession()).resolves.toBeNull();
  });

  it('rejects invalid credentials and accepts the seeded admin', async () => {
    const { adapter } = setup();

    const bad = await adapter.auth.signIn('admin@test.local', 'wrong');
    expect(bad.user).toBeNull();
    expect(bad.error).toBe('Invalid email or password.');

    const good = await adapter.auth.signIn('admin@test.local', 'correct horse');
    expect(good.error).toBeNull();
    expect(good.user).toMatchObject({ isAdmin: true, email: 'admin@test.local' });

    const session = await adapter.auth.getSession();
    expect(session).toMatchObject({ isAdmin: true, email: 'admin@test.local' });
  });

  it('invalidates the session on sign out', async () => {
    const { adapter } = setup();
    await adapter.auth.signIn('admin@test.local', 'correct horse');
    await adapter.auth.signOut();
    await expect(adapter.auth.getSession()).resolves.toBeNull();
  });

  it('locks out after repeated failures', async () => {
    const { adapter } = setup();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await adapter.auth.signIn('admin@test.local', 'wrong');
    }

    const locked = await adapter.auth.signIn('admin@test.local', 'correct horse');
    expect(locked.user).toBeNull();
    expect(locked.error).toMatch(/Too many failed attempts/);
  });

  it('upgrades a legacy plaintext password to a salted hash', async () => {
    const storage = createMemoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        businesses: [],
        analytics_events: [],
        admin: { email: 'admin@test.local', password: 'legacy-password' },
      })
    );

    const { adapter } = setup({ storage });
    const result = await adapter.auth.signIn('admin@test.local', 'legacy-password');

    expect(result.error).toBeNull();
    expect(result.user?.isAdmin).toBe(true);

    const persisted = JSON.parse(storage.getItem(STORAGE_KEY));
    expect(persisted.admin.password).toBeUndefined();
    expect(persisted.admin.passwordHash).toBeTruthy();
    expect(persisted.admin.passwordSalt).toBeTruthy();
  });
});

describe('local adapter — businesses', () => {
  it('creates, reads, updates, and deletes a business', async () => {
    const { adapter } = setup();

    const created = await adapter.businesses.create(validBusiness);
    expect(created).toMatchObject({
      business_name: 'Royal Salon',
      name: 'Royal Salon',
      slug: 'royal-salon',
      is_active: true,
    });
    expect(created.id).toBeTruthy();
    expect(created.created_at).toBe(new Date(FIXED_NOW).toISOString());

    const fetched = await adapter.businesses.getBySlug('royal-salon');
    expect(fetched.id).toBe(created.id);

    const updated = await adapter.businesses.update(created.id, { is_active: false });
    expect(updated.is_active).toBe(false);
    expect(updated.slug).toBe('royal-salon');

    await expect(adapter.businesses.delete(created.id)).resolves.toBe(true);
    await expect(adapter.businesses.getBySlug('royal-salon')).resolves.toBeNull();
  });

  it('blocks duplicate slugs with a field error', async () => {
    const { adapter } = setup();
    await adapter.businesses.create(validBusiness);

    await expect(
      adapter.businesses.create({ ...validBusiness, business_name: 'Another Salon' })
    ).rejects.toMatchObject({
      fieldErrors: { slug: expect.stringContaining('already in use') },
    });
  });

  it('generates a non-conflicting slug', async () => {
    const { adapter } = setup();
    await adapter.businesses.create(validBusiness);

    await expect(adapter.businesses.generateUniqueSlug('Royal Salon')).resolves.toBe(
      'royal-salon-1'
    );
    await expect(adapter.businesses.isSlugAvailable('royal-salon')).resolves.toBe(false);
    await expect(adapter.businesses.isSlugAvailable('other')).resolves.toBe(true);
  });

  it('searches by name, slug, and status', async () => {
    const { adapter } = setup();
    const first = await adapter.businesses.create(validBusiness);
    await adapter.businesses.create({
      ...validBusiness,
      business_name: 'Blue Diner',
      slug: 'blue-diner',
    });
    await adapter.businesses.update(first.id, { is_active: false });

    expect(await adapter.businesses.search('blue')).toHaveLength(1);
    expect(await adapter.businesses.search('royal')).toHaveLength(1);
    expect(await adapter.businesses.search('', 'inactive')).toHaveLength(1);
    expect(await adapter.businesses.search('', 'active')).toHaveLength(1);
  });

  it('returns null for unknown ids and slugs', async () => {
    const { adapter } = setup();
    await expect(adapter.businesses.getById('missing')).resolves.toBeNull();
    await expect(adapter.businesses.getBySlug('missing')).resolves.toBeNull();
  });

  it('stores the industry key and defaults to generic', async () => {
    const { adapter } = setup();
    const created = await adapter.businesses.create(validBusiness);
    expect(created.industry_key).toBe('generic');

    const updated = await adapter.businesses.update(created.id, {
      industry_key: 'car-showroom',
    });
    expect(updated.industry_key).toBe('car-showroom');

    const reloaded = await adapter.businesses.getBySlug('royal-salon');
    expect(reloaded.industry_key).toBe('car-showroom');
  });
});

describe('local adapter — analytics', () => {
  it('records events and aggregates stats', async () => {
    const { adapter } = setup();
    const business = await adapter.businesses.create(validBusiness);

    await adapter.analytics.trackEvent(business.id, 'page_visit');
    await adapter.analytics.trackEvent(business.id, 'google_review_click');

    const overview = await adapter.analytics.getStats('all');
    expect(overview).toMatchObject({
      totalBusinesses: 1,
      activeBusinesses: 1,
      totalPageViews: 1,
      totalGoogleClicks: 1,
      conversionRate: '100.0%',
    });

    const perBusiness = await adapter.analytics.getBusinessStats(business.id, 'all');
    expect(perBusiness).toMatchObject({ pageVisits: 1, googleClicks: 1 });

    const breakdown = await adapter.analytics.getAllBusinessesStats('all');
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0]).toMatchObject({ id: business.id, pageVisits: 1, googleClicks: 1 });
  });

  it('rejects unknown event types and missing businesses', async () => {
    const { adapter } = setup();
    const business = await adapter.businesses.create(validBusiness);

    await expect(adapter.analytics.trackEvent(business.id, 'hacked')).rejects.toThrow(
      /Unsupported analytics event type/
    );
    await expect(adapter.analytics.trackEvent('missing-id', 'page_visit')).resolves.toBeNull();
  });

  it('drops oversized metadata instead of failing the event', async () => {
    const { adapter } = setup();
    const business = await adapter.businesses.create(validBusiness);

    const event = await adapter.analytics.trackEvent(business.id, 'page_visit', {
      blob: 'x'.repeat(5000),
    });

    expect(event.metadata).toEqual({});
  });

  it('removes analytics when a business is deleted', async () => {
    const { adapter } = setup();
    const business = await adapter.businesses.create(validBusiness);
    await adapter.analytics.trackEvent(business.id, 'page_visit');

    await adapter.businesses.delete(business.id);
    await expect(adapter.analytics.getEventsByBusiness(business.id)).resolves.toEqual([]);
  });
});

describe('local adapter — persistence', () => {
  it('persists data across adapter instances', async () => {
    const storage = createMemoryStorage();
    const first = setup({ storage }).adapter;
    await first.businesses.create(validBusiness);

    const second = setup({ storage }).adapter;
    const businesses = await second.businesses.getAll();
    expect(businesses).toHaveLength(1);
    expect(businesses[0].slug).toBe('royal-salon');
  });

  it('recovers from corrupted storage without losing the backup', async () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');

    const { adapter } = setup({ storage });
    await expect(adapter.businesses.getAll()).resolves.toEqual([]);
    expect(storage.getItem(`${STORAGE_KEY}_corrupt_${FIXED_NOW}`)).toBe('{not json');
  });

  it('resets demo data and re-seeds the admin', async () => {
    const { adapter, storage, sessionStorage } = setup();
    await adapter.auth.signIn('admin@test.local', 'correct horse');
    await adapter.businesses.create(validBusiness);

    await adapter.resetDemoData();

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem('reviewgen_auth')).toBeNull();
    await expect(adapter.auth.getSession()).resolves.toBeNull();
    await expect(adapter.businesses.getAll()).resolves.toEqual([]);

    const signIn = await adapter.auth.signIn('admin@test.local', 'correct horse');
    expect(signIn.error).toBeNull();
    expect(signIn.user).toMatchObject({ isAdmin: true });
  });

  it('clears the login lockout when demo data is reset', async () => {
    const { adapter } = setup();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await adapter.auth.signIn('admin@test.local', 'wrong');
    }
    await expect(
      adapter.auth.signIn('admin@test.local', 'correct horse')
    ).resolves.toMatchObject({ user: null });

    await adapter.resetDemoData();

    const afterReset = await adapter.auth.signIn('admin@test.local', 'correct horse');
    expect(afterReset.error).toBeNull();
    expect(afterReset.user?.isAdmin).toBe(true);
  });
});
