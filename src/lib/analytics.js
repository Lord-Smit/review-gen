import db from './db';
import { EVENT_TYPES } from './analyticsShared';

const VISIT_KEY_PREFIX = 'reviewgen:page-visit:';
const CLICK_KEY_PREFIX = 'reviewgen:google-click:';

/**
 * Analytics writes are best-effort: a failure must never break the customer
 * review flow. Reads are allowed to throw so the admin UI can show an error.
 */
async function trackOnce(businessId, eventType, keyPrefix) {
  if (!businessId) return null;

  const key = `${keyPrefix}${businessId}`;
  try {
    // Deduplicate per browser session so React StrictMode double-effects and
    // refreshes don't inflate the funnel metrics.
    if (sessionStorage.getItem(key)) return null;
    sessionStorage.setItem(key, '1');
  } catch {
    // Storage can be unavailable in private/embedded contexts; still track.
  }

  try {
    return await db.analytics.trackEvent(businessId, eventType);
  } catch (error) {
    console.warn('Analytics event could not be recorded:', error);
    return null;
  }
}

/** Track an anonymous page visit for a business (once per session). */
export function trackPageVisit(businessId) {
  return trackOnce(businessId, EVENT_TYPES.PAGE_VISIT, VISIT_KEY_PREFIX);
}

/** Backward-compatible alias. */
export function trackPageView(businessId) {
  return trackPageVisit(businessId);
}

/** Track a click on the Google review destination link (once per session). */
export function trackGoogleClick(businessId) {
  return trackOnce(businessId, EVENT_TYPES.GOOGLE_CLICK, CLICK_KEY_PREFIX);
}

/**
 * Retrieve aggregated overview metrics.
 * @param {'all'|'today'|'7d'|'30d'} timeRange
 */
export function getOverviewStats(timeRange = 'all') {
  return db.analytics.getStats(timeRange);
}

export function getBusinessStats(businessId, timeRange = 'all') {
  return db.analytics.getBusinessStats(businessId, timeRange);
}

export function getAllBusinessesStats(timeRange = 'all') {
  return db.analytics.getAllBusinessesStats(timeRange);
}

export default {
  trackPageVisit,
  trackPageView,
  trackGoogleClick,
  getOverviewStats,
  getBusinessStats,
  getAllBusinessesStats,
};
