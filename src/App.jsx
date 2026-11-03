import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBusinessList from './pages/admin/AdminBusinessList';
import BusinessForm from './pages/admin/BusinessForm';
import BusinessReviewPage from './pages/BusinessReviewPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Root redirects to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="businesses" element={<AdminBusinessList />} />
          <Route path="businesses/new" element={<BusinessForm />} />
          <Route path="businesses/:id" element={<BusinessForm />} />
        </Route>
      </Route>

      {/* Customer-facing review page (dynamic slug) */}
      <Route path="/:slug" element={<BusinessReviewPage />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
