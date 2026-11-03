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
  Info
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

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'today' | '7d' | '30d'
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
    // Data fetching legitimately starts a loading state; the rule targets
    // derived-state writes that should happen during render instead.
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
    return businessAnalytics.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.slug?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  }, [businessAnalytics, searchQuery]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Date Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer page visits, Google review link clicks, and business performance metrics
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs self-start md:self-auto">
          <Calendar className="w-4 h-4 text-gray-400 ml-2 mr-1" />
          {Object.entries(TIME_RANGE_LABELS).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTimeRange(id)}
              aria-pressed={timeRange === id}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                timeRange === id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
          className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <div className="flex items-start gap-2.5">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Couldn&apos;t load analytics</p>
              <p className="mt-0.5 text-red-700">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData(timeRange)}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Accuracy Disclosure Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold">Analytics Note:</strong> &ldquo;Google Review Link Clicks&rdquo; represents visitors who clicked the &ldquo;Submit Review on Google&rdquo; button to open their Google review destination. ReviewGen copies their drafted review to their clipboard; it does not track or verify whether the customer finalized their submission on Google.
        </p>
      </div>

      {/* Global Overview Metric Cards */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard
            title="Total Businesses"
            value={stats.totalBusinesses}
            icon={Building2}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Active Businesses"
            value={stats.activeBusinesses}
            icon={CheckCircle}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatsCard
            title="Total Review-Page Visits"
            value={stats.totalPageViews}
            icon={Eye}
            color="bg-purple-100 text-purple-600"
          />
          <StatsCard
            title="Google Link Clicks"
            value={stats.totalGoogleClicks}
            icon={ExternalLink}
            color="bg-amber-100 text-amber-600"
          />
          <StatsCard
            title="Click-Through Rate"
            value={stats.conversionRate}
            icon={TrendingUp}
            color="bg-indigo-100 text-indigo-600"
          />
        </div>
      )}

      {/* Individual Business Analytics Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Individual Business Performance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Traffic and Google link click conversion per business ({TIME_RANGE_LABELS[timeRange]})
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business analytics..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3">Business</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Page Visits</th>
                  <th scope="col" className="px-5 py-3 text-right">Google Clicks</th>
                  <th scope="col" className="px-5 py-3 text-right">Click Rate</th>
                  <th scope="col" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm block">
                          {b.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-gray-500">
                            /{b.slug}
                          </span>
                          {b.category && (
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                              {b.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          b.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {b.pageVisits}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="font-semibold text-blue-600 text-sm">
                        {b.googleClicks}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                        {b.conversionRate}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(b.slug)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                            copiedSlug === b.slug
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 shadow-2xs'
                          }`}
                          title="Copy customer ReviewGen URL"
                        >
                          {copiedSlug === b.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="View customer review page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery
              ? 'No business matches your search.'
              : 'No businesses registered yet. Create your first business to start tracking analytics.'}
          </div>
        )}
      </div>
    </div>
  );
}
