import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Building2,
  Loader2,
  AlertTriangle,
  Filter,
  Utensils,
  Car,
  Bike,
} from 'lucide-react';
import BusinessCard from '../../components/admin/BusinessCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { db } from '../../lib/db';

const INDUSTRY_FILTERS = [
  { id: 'all', label: 'All Industries' },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'car-showroom', label: 'Car Showrooms', icon: Car },
  { id: 'bike-showroom', label: 'Bike Showrooms', icon: Bike },
  { id: 'generic', label: 'General', icon: Building2 },
];

export default function AdminBusinessList() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [industryFilter, setIndustryFilter] = useState('all');
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [error, setError] = useState('');

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await db.businesses.getAll();
      setBusinesses(data || []);
    } catch (err) {
      console.error('Failed to load businesses:', err);
      setError(err?.message || 'Failed to load businesses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    loadBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // Status filter
      if (statusFilter === 'active' && !b.is_active) return false;
      if (statusFilter === 'inactive' && b.is_active) return false;

      // Industry filter
      if (industryFilter !== 'all') {
        const ind = b.industry_key || 'generic';
        if (ind !== industryFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = b.name?.toLowerCase().includes(q) || b.business_name?.toLowerCase().includes(q);
        const slugMatch = b.slug?.toLowerCase().includes(q);
        const categoryMatch = b.category?.toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !categoryMatch) return false;
      }

      return true;
    });
  }, [businesses, searchQuery, statusFilter, industryFilter]);

  const handleToggleActive = async (business) => {
    try {
      await db.businesses.update(business.id, {
        is_active: !business.is_active,
      });
      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? { ...b, is_active: !b.is_active } : b))
      );
    } catch (err) {
      console.error('Failed to toggle business status:', err);
      setError(err?.message || 'Failed to update this business.');
    }
  };

  const handleEdit = (business) => {
    navigate(`/admin/businesses/${business.id}`);
  };

  const handleDeleteRequest = (business) => {
    setBusinessToDelete(business);
  };

  const handleConfirmDelete = async () => {
    if (!businessToDelete) return;
    try {
      await db.businesses.delete(businessToDelete.id);
      setBusinesses((prev) => prev.filter((b) => b.id !== businessToDelete.id));
    } catch (err) {
      console.error('Failed to delete business:', err);
      setError(err?.message || 'Failed to delete this business.');
    } finally {
      setBusinessToDelete(null);
    }
  };

  const statusCounts = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter((b) => b.is_active).length;
    const inactive = total - active;
    return { all: total, active, inactive };
  }, [businesses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Businesses
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Create and manage client review collection portals, custom branding, and industry options.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/businesses/new')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Business</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadBusinesses}
            className="text-xs font-semibold text-rose-700 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, slug, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200/90 bg-slate-50 p-1 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({statusCounts.active})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-white text-slate-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive ({statusCounts.inactive})
            </button>
          </div>
        </div>

        {/* Industry Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Industry:
          </span>
          {INDUSTRY_FILTERS.map((ind) => {
            const Icon = ind.icon;
            const isActive = industryFilter === ind.id;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setIndustryFilter(ind.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{ind.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading businesses...</p>
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {searchQuery || industryFilter !== 'all' || statusFilter !== 'all'
              ? 'No matching businesses'
              : 'No businesses yet'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || industryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search filters to find what you are looking for.'
              : 'Get started by creating your first business to generate custom Google reviews.'}
          </p>
          {!searchQuery && industryFilter === 'all' && statusFilter === 'all' && (
            <button
              type="button"
              onClick={() => navigate('/admin/businesses/new')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Business</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(businessToDelete)}
        title="Delete Business"
        message={`Are you sure you want to delete "${businessToDelete?.name || businessToDelete?.business_name || 'this business'}"? This action cannot be undone and will delete all associated data.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDelete}
        onClose={() => setBusinessToDelete(null)}
      />
    </div>
  );
}
