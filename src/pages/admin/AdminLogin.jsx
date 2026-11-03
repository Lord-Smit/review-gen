import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  IS_DEMO_MODE,
} from '../../config/app';

export default function AdminLogin() {
  const { user, signIn, resetDemoData, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta({
    title: 'Sign in — ReviewGen Admin',
    description: 'Sign in to manage businesses and review analytics.',
    noIndex: true,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result?.error) {
        setError(result.error);
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetDemoData = async () => {
    const confirmed = window.confirm(
      'Reset all local demo data? This deletes the businesses and analytics saved in this browser and restores the default demo admin.'
    );
    if (!confirmed) return;

    setError('');
    setNotice('');
    setResetting(true);

    try {
      await resetDemoData();
      setEmail('');
      setPassword('');
      setNotice('Demo data reset. Sign in with the demo credentials below.');
    } catch (err) {
      setError(err?.message || 'Unable to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3 shadow-xs">
            RG
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ReviewGen Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage businesses and reviews</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {IS_DEMO_MODE && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
            <p className="font-medium text-gray-700">Demo mode</p>
            <p className="mt-1 text-gray-500">
              Data is stored in this browser only. Use the default demo admin:
            </p>
            <dl className="mt-2 space-y-1 font-mono text-xs text-gray-700">
              <div className="flex gap-2">
                <dt className="text-gray-500">Email</dt>
                <dd className="break-all">{DEMO_ADMIN_EMAIL}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Password</dt>
                <dd className="break-all">{DEMO_ADMIN_PASSWORD}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_ADMIN_EMAIL);
                  setPassword(DEMO_ADMIN_PASSWORD);
                  setError('');
                  setNotice('');
                }}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Fill demo credentials
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resetting}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
              >
                {resetting && <Loader2 className="w-3 h-3 animate-spin" />}
                <RotateCcw className="w-3 h-3" />
                <span>{resetting ? 'Resetting...' : 'Reset demo data'}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Reset deletes locally saved businesses and analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
