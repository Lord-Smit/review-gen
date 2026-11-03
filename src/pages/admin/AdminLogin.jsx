import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, RotateCcw, Sparkles, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-8 sm:p-10 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ReviewGen Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to manage business portals and customer analytics
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 leading-relaxed"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-700 leading-relaxed"
          >
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {IS_DEMO_MODE && (
          <div className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Demo Mode Active
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-600">
                Local Only
              </span>
            </div>
            <p className="text-amber-800/80 leading-relaxed text-[11px]">
              No Supabase credentials detected. You can use the local demo account:
            </p>
            <div className="rounded-lg bg-white/80 p-2.5 font-mono text-[11px] space-y-1 border border-amber-200/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-700">{DEMO_ADMIN_EMAIL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="font-semibold text-slate-700">{DEMO_ADMIN_PASSWORD}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_ADMIN_EMAIL);
                  setPassword(DEMO_ADMIN_PASSWORD);
                  setError('');
                  setNotice('');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-amber-800 hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                Auto-fill Demo
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resetting}
                className="py-1.5 px-3 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-amber-800 hover:bg-amber-100/70 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                title="Reset demo data"
              >
                {resetting && <Loader2 className="w-3 h-3 animate-spin" />}
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
