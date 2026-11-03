import { describe, expect, it } from 'vitest';
import {
  aggregateAllBusinessStats,
  aggregateBusinessStats,
  aggregateOverview,
  filterEventsByTimeRange,
  getTimeRangeStart,
  toConversionRate,
} from './analyticsShared';

const NOW = new Date('2026-06-15T12:00:00.000Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

function event(business_id, event_type, created_at) {
  return { business_id, event_type, created_at };
}

describe('getTimeRangeStart', () => {
  it('returns 0 for all time and unknown ranges', () => {
    expect(getTimeRangeStart('all', NOW)).toBe(0);
    expect(getTimeRangeStart('nonsense', NOW)).toBe(0);
  });

  it('returns the start of the local day for "today"', () => {
    const start = new Date(getTimeRangeStart('today', NOW));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it('returns rolling windows for 7d and 30d', () => {
    expect(getTimeRangeStart('7d', NOW)).toBe(NOW - 7 * DAY);
    expect(getTimeRangeStart('30d', NOW)).toBe(NOW - 30 * DAY);
  });
});

describe('filterEventsByTimeRange', () => {
  const events = [
    event('b1', 'page_visit', new Date(NOW - 1 * DAY).toISOString()),
    event('b1', 'page_visit', new Date(NOW - 10 * DAY).toISOString()),
    event('b1', 'page_visit', 'not-a-date'),
  ];

  it('keeps everything for all time', () => {
    expect(filterEventsByTimeRange(events, 'all', NOW)).toHaveLength(3);
  });

  it('drops events outside the window and malformed timestamps', () => {
    expect(filterEventsByTimeRange(events, '7d', NOW)).toHaveLength(1);
    expect(filterEventsByTimeRange(events, '30d', NOW)).toHaveLength(2);
  });
});

describe('toConversionRate', () => {
  it('avoids division by zero and formats one decimal', () => {
    expect(toConversionRate(0, 0)).toBe('0.0%');
    expect(toConversionRate(1, 3)).toBe('33.3%');
    expect(toConversionRate(5, 5)).toBe('100.0%');
  });
});

describe('aggregateOverview', () => {
  it('counts legacy event names and computes the funnel', () => {
    const result = aggregateOverview({
      businesses: [{ id: 'b1', is_active: true }, { id: 'b2', is_active: false }],
      events: [
        event('b1', 'page_visit', new Date(NOW - DAY).toISOString()),
        event('b1', 'page_view', new Date(NOW - DAY).toISOString()),
        event('b2', 'google_click', new Date(NOW - DAY).toISOString()),
        event('b2', 'other', new Date(NOW - DAY).toISOString()),
      ],
      timeRange: 'all',
    });

    expect(result).toMatchObject({
      totalBusinesses: 2,
      activeBusinesses: 1,
      inactiveBusinesses: 1,
      totalPageViews: 2,
      totalGoogleClicks: 1,
      conversionRate: '50.0%',
    });
  });
});

describe('per-business aggregation', () => {
  const businesses = [
    { id: 'b1', name: 'One', slug: 'one', is_active: true, category: 'Cafe' },
    { id: 'b2', business_name: 'Two', slug: 'two', is_active: false },
  ];

  const events = [
    event('b1', 'page_visit', new Date(NOW - DAY).toISOString()),
    event('b1', 'google_review_click', new Date(NOW - DAY).toISOString()),
    event('b2', 'page_visit', new Date(NOW - DAY).toISOString()),
    event('missing', 'page_visit', new Date(NOW - DAY).toISOString()),
  ];

  it('filters by business id', () => {
    expect(aggregateBusinessStats({ businessId: 'b1', events, timeRange: 'all' })).toMatchObject({
      pageVisits: 1,
      googleClicks: 1,
      conversionRate: '100.0%',
    });
  });

  it('aggregates once for every known business and ignores orphan events', () => {
    const result = aggregateAllBusinessStats({ businesses, events, timeRange: 'all' });
    const byId = Object.fromEntries(result.map((row) => [row.id, row]));

    expect(result).toHaveLength(2);
    expect(byId.b1).toMatchObject({ pageVisits: 1, googleClicks: 1, name: 'One' });
    expect(byId.b2).toMatchObject({ pageVisits: 1, googleClicks: 0, name: 'Two' });
  });
});
