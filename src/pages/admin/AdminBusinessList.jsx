import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Loader2, AlertTriangle } from 'lucide-react';
import BusinessCard from '../../components/admin/BusinessCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { db } from '../../lib/db';

export default function AdminBusinessList() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
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
    // Initial load from the backend; not a derived-state update.
    // oxlint-disable-next-line react/set-state-in-effect
    loadBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // Status filter
      if (statusFilter === 'active' && !b.is_active) return false;
      if (statusFilter === 'inactive' && b.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = b.name?.toLowerCase().includes(q);
        const slugMatch = b.slug?.toLowerCase().includes(q);
        const categoryMatch = b.category?.toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !categoryMatch) return false;
      }

      return true;
    });
  }, [businesses, searchQuery, statusFilter]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Businesses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all client business profiles and review configurations</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/businesses/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Business</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={loadBusinesses}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, slug, or category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Tab-style status filters */}
        <div className="flex items-center bg-gray-200/80 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({statusCounts.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'inactive'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inactive ({statusCounts.inactive})
          </button>
        </div>
      </div>

      {/* Business Cards Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No businesses found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search query or filter to find what you are looking for.'
              : 'Get started by creating your first business profile to manage reviews.'}
          </p>
          {searchQuery || statusFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin/businesses/new')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(businessToDelete)}
        onClose={() => setBusinessToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Business"
        message={`Are you sure you want to delete "${businessToDelete?.name}"? All associated settings and analytics will be permanently removed.`}
        confirmLabel="Delete Business"
        variant="danger"
      />
    </div>
  );
}
