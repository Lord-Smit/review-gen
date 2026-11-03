import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dbMode } from '../../lib/db';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useDocumentMeta({
    title: 'Admin — ReviewGen',
    description: 'Manage businesses, branding, and review analytics.',
    noIndex: true,
  });

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { name: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Businesses', to: '/admin/businesses', icon: Building2 },
  ];

  const userInitial = user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'A';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white font-bold text-sm shadow-sm shadow-blue-500/25">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  ReviewGen
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Right Header: System Status & User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Database indicator badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                dbMode === 'supabase'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
              title={
                dbMode === 'supabase'
                  ? 'Connected to Supabase PostgreSQL'
                  : 'Local browser storage mode'
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  dbMode === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <Database className="h-3 w-3" />
              <span>{dbMode === 'supabase' ? 'Supabase Cloud' : 'Demo Mode'}</span>
            </div>

            {/* User Avatar & Info */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-xs">
                {userInitial}
              </div>
              {user?.email && (
                <div className="hidden lg:flex flex-col text-left">
                  <span
                    className="max-w-[150px] truncate text-xs font-semibold text-slate-800"
                    title={user.email}
                  >
                    {user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Administrator
                  </span>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Demo Mode Notice */}
      {dbMode === 'local' && (
        <div className="flex items-start gap-2.5 border-b border-amber-200/90 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-900 sm:px-6 lg:px-8">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p>
            <strong className="font-semibold">Demo mode active:</strong> Business and analytics data are stored in this browser only. Connect your Supabase environment variables in Vercel to sync across all devices.
          </p>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-4">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Menu
              </p>
              <nav className="mt-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>ReviewGen System</span>
              <span className="text-[10px] text-emerald-600 font-mono">v1.0</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Google review generation & customer analytics platform.
            </p>
          </div>
        </aside>

        {/* Mobile Slide-Over Sidebar */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                      RG
                    </div>
                    <span className="font-bold text-slate-900 text-base">
                      ReviewGen Admin
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {user?.email && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
