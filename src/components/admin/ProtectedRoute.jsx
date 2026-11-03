import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Require administrator privileges, not merely an authenticated session.
  // A non-admin Supabase user must never reach the admin UI.
  if (!user || !user.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
