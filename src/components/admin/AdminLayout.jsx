import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle, LayoutDashboard, Building2, LogOut, Menu, X } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 tracking-tight">ReviewGen</span>
              <span className="text-xs uppercase font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-sm text-gray-600 hidden sm:inline max-w-[200px] truncate" title={user.email}>
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {dbMode === 'local' && (
        <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 sm:px-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            <strong className="font-semibold">Demo mode:</strong> data is stored only in this
            browser and is not visible to customers on other devices. Configure Supabase
            before using this with real businesses.
          </p>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 flex-col bg-gray-100 border-r border-gray-200 p-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/70'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Slide-Over Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-100 border-r border-gray-200 p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">ReviewGen Admin</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
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
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/70'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {user?.email && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
