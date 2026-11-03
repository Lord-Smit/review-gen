/**
 * Pure analytics helpers shared by the local and Supabase adapters.
 * Keeping aggregation here avoids subtly different metrics between backends.
 */

export const EVENT_TYPES = Object.freeze({
  PAGE_VISIT: 'page_visit',
  GOOGLE_CLICK: 'google_review_click',
});

const PAGE_VISIT_TYPES = new Set(['page_visit', 'page_view']);
const GOOGLE_CLICK_TYPES = new Set(['google_review_click', 'google_click']);

export function getEventType(event) {
  return event?.event_type || event?.eventType || '';
}

export function getBusinessId(event) {
  return event?.business_id || event?.businessId || '';
}

export function getCreatedAt(event) {
  return event?.created_at || event?.createdAt || '';
}

export function isPageVisitEvent(event) {
  return PAGE_VISIT_TYPES.has(getEventType(event));
}

export function isGoogleClickEvent(event) {
  return GOOGLE_CLICK_TYPES.has(getEventType(event));
}

/**
 * Start timestamp (ms) for a supported range. `0` means "all time".
 * @param {'all'|'today'|'7d'|'30d'} timeRange
 * @param {number} now
 */
export function getTimeRangeStart(timeRange, now = Date.now()) {
  if (!timeRange || timeRange === 'all') return 0;

  if (timeRange === 'today') {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    return startOfToday.getTime();
  }

  if (timeRange === '7d') return now - 7 * 24 * 60 * 60 * 1000;
  if (timeRange === '30d') return now - 30 * 24 * 60 * 60 * 1000;

  return 0;
}

export function filterEventsByTimeRange(events, timeRange = 'all', now = Date.now()) {
  const threshold = getTimeRangeStart(timeRange, now);
  if (!threshold) return events;

  return events.filter((event) => {
    const timestamp = Date.parse(getCreatedAt(event));
    return Number.isFinite(timestamp) && timestamp >= threshold;
  });
}

export function toConversionRate(googleClicks, pageVisits) {
  if (!pageVisits) return '0.0%';
  return `${((googleClicks / pageVisits) * 100).toFixed(1)}%`;
}

function countEvents(events) {
  let pageVisits = 0;
  let googleClicks = 0;

  for (const event of events) {
    if (isPageVisitEvent(event)) pageVisits += 1;
    else if (isGoogleClickEvent(event)) googleClicks += 1;
  }

  return { pageVisits, googleClicks };
}

/**
 * @param {{ businesses: object[], events: object[], timeRange: string }} input
 */
export function aggregateOverview({ businesses = [], events = [], timeRange = 'all' }) {
  const filtered = filterEventsByTimeRange(events, timeRange);
  const { pageVisits, googleClicks } = countEvents(filtered);

  return {
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter((business) => business.is_active).length,
    inactiveBusinesses: businesses.filter((business) => !business.is_active).length,
    totalPageViews: pageVisits,
    totalGoogleClicks: googleClicks,
    conversionRate: toConversionRate(googleClicks, pageVisits),
    timeRange,
  };
}

export function aggregateBusinessStats({ businessId, events = [], timeRange = 'all' }) {
  const filtered = filterEventsByTimeRange(
    events.filter((event) => getBusinessId(event) === businessId),
    timeRange
  );
  const { pageVisits, googleClicks } = countEvents(filtered);

  return {
    businessId,
    pageVisits,
    googleClicks,
    conversionRate: toConversionRate(googleClicks, pageVisits),
    timeRange,
  };
}

/**
 * Aggregate once for all businesses (O(businesses + events) instead of
 * O(businesses * events)).
 */
export function aggregateAllBusinessStats({ businesses = [], events = [], timeRange = 'all' }) {
  const filtered = filterEventsByTimeRange(events, timeRange);
  const byBusiness = new Map();

  for (const business of businesses) {
    byBusiness.set(business.id, {
      id: business.id,
      name: business.name || business.business_name || 'Untitled Business',
      slug: business.slug,
      is_active: Boolean(business.is_active),
      category: business.category || '',
      pageVisits: 0,
      googleClicks: 0,
    });
  }

  for (const event of filtered) {
    const stats = byBusiness.get(getBusinessId(event));
    if (!stats) continue;
    if (isPageVisitEvent(event)) stats.pageVisits += 1;
    else if (isGoogleClickEvent(event)) stats.googleClicks += 1;
  }

  return Array.from(byBusiness.values()).map((stats) => ({
    ...stats,
    conversionRate: toConversionRate(stats.googleClicks, stats.pageVisits),
  }));
}
