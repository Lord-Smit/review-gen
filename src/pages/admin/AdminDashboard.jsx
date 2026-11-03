import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  TrendingUp,
  Calendar,
  Loader2,
  Copy,
  Check,
  Search,
  Info,
  Utensils,
  Car,
  Bike,
} from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import { getOverviewStats, getAllBusinessesStats } from '../../lib/analytics';
import { copyToClipboard } from '../../utils/clipboard';
import { getBusinessUrl } from '../../config/app';

const TIME_RANGE_LABELS = {
  all: 'All Time',
  today: 'Today',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
};

function getIndustryBadge(industryKey, category) {
  const key = industryKey || (category ? category.toLowerCase() : 'generic');
  if (key.includes('restaurant') || key.includes('food') || key.includes('dining')) {
    return {
      label: 'Restaurant',
      icon: Utensils,
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
    };
  }
  if (key.includes('bike') || key.includes('two-wheeler')) {
    return {
      label: 'Bike Showroom',
      icon: Bike,
      className: 'bg-amber-50 text-amber-700 border-amber-200/80',
    };
  }
  if (key.includes('car') || key.includes('auto')) {
    return {
      label: 'Car Showroom',
      icon: Car,
      className: 'bg-blue-50 text-blue-700 border-blue-200/80',
    };
  }
  return {
    label: category || 'General',
    icon: Building2,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('all');
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    inactiveBusinesses: 0,
    totalPageViews: 0,
    totalGoogleClicks: 0,
    conversionRate: '0.0%',
  });
  const [businessAnalytics, setBusinessAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);

  const fetchDashboardData = useCallback(async (range) => {
    try {
      setLoading(true);
      setLoadError('');
      const [overviewData, breakdownData] = await Promise.all([
        getOverviewStats(range),
        getAllBusinessesStats(range),
      ]);

      if (overviewData) setStats(overviewData);
      if (breakdownData) setBusinessAnalytics(breakdownData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoadError(err?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchDashboardData(timeRange);
  }, [timeRange, fetchDashboardData]);

  const handleCopyUrl = async (slug) => {
    const url = getBusinessUrl(slug);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businessAnalytics;
    const q = searchQuery.toLowerCase().trim();
    return businessAnalytics.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
    );
  }, [businessAnalytics, searchQuery]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Date Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Analytics Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track customer page visits, review drafts, and Google review conversions.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs self-start sm:self-auto">
          <Calendar className="ml-2 mr-1.5 h-3.5 w-3.5 text-slate-400" />
          {Object.entries(TIME_RANGE_LABELS).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTimeRange(id)}
              aria-pressed={timeRange === id}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                timeRange === id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800"
        >
          <div className="flex items-start gap-2.5">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="font-semibold">Couldn't load analytics</p>
              <p className="mt-0.5 text-rose-700">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData(timeRange)}
            className="shrink-0 rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Global Overview Metric Cards */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatsCard
            title="Total Businesses"
            value={stats.totalBusinesses}
            icon={Building2}
            color="border-blue-100 bg-blue-50 text-blue-600"
          />
          <StatsCard
            title="Active Businesses"
            value={stats.activeBusinesses}
            icon={CheckCircle}
            color="border-emerald-100 bg-emerald-50 text-emerald-600"
          />
          <StatsCard
            title="Review Page Visits"
            value={stats.totalPageViews}
            icon={Eye}
            color="border-purple-100 bg-purple-50 text-purple-600"
          />
          <StatsCard
            title="Google Link Clicks"
            value={stats.totalGoogleClicks}
            icon={ExternalLink}
            color="border-amber-100 bg-amber-50 text-amber-600"
          />
          <StatsCard
            title="Conversion Rate"
            value={stats.conversionRate}
            icon={TrendingUp}
            color="border-indigo-100 bg-indigo-50 text-indigo-600"
          />
        </div>
      )}

      {/* Accuracy Disclosure Notice */}
      <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Conversion Tracking:</strong> &ldquo;Google Link Clicks&rdquo; counts customers who tap the &ldquo;Submit Review on Google&rdquo; button, which copies their drafted review to the clipboard and directs them to your Google review page.
        </p>
      </div>

      {/* Individual Business Performance Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Business Performance Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Traffic and Google review conversion per business ({TIME_RANGE_LABELS[timeRange]})
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, slug or category..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Business & Category</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Visits</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Google Clicks</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Conversion Rate</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((b) => {
                  const badge = getIndustryBadge(b.industry_key, b.category);
                  const BadgeIcon = badge.icon;
                  const rateNum = parseFloat(b.conversionRate) || 0;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200/80">
                            {b.name ? b.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-sm block">
                              {b.name || 'Untitled Business'}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${badge.className}`}
                              >
                                <BadgeIcon className="h-2.5 w-2.5" />
                                {badge.label}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                /{b.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            b.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              b.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {b.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {b.pageVisits}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-blue-600">
                        {b.googleClicks}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, rateNum)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 text-xs">
                            {b.conversionRate}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(b.slug)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Copy customer review link"
                          >
                            {copiedSlug === b.slug ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold text-[11px]">
                                  Copied
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[11px]">Copy Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={getBusinessUrl(b.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Open customer review page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              {searchQuery ? 'No matching businesses found' : 'No businesses yet'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try refining your search terms or clearing the filter.'
                : 'Create your first business to begin collecting customer reviews and tracking analytics.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
