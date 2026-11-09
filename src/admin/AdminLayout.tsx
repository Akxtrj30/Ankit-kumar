import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { adminApi, safeTokenStorage } from '../services/api';
import {
  LayoutDashboard,
  Layers,
  CalendarCheck,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Activity,
  HeartHandshake,
  Menu,
  X,
  Stethoscope,
  Image as ImageIcon,
  MessageSquareQuote,
  Sparkles,
  Lock,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState<any>(() => safeTokenStorage.getUser());
  const [checkingAuth, setCheckingAuth] = useState<boolean>(() => {
    const token = safeTokenStorage.get();
    const user = safeTokenStorage.getUser();
    return !token && !user ? false : true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      const token = safeTokenStorage.get();
      const user = safeTokenStorage.getUser();
      if (!token && !user) {
        if (isMounted) {
          setAdminUser(null);
          setCheckingAuth(false);
        }
        return;
      }
      try {
        const res = await adminApi.verifySession();
        if (isMounted) {
          setAdminUser(res.user);
        }
      } catch {
        if (isMounted) {
          // Keep existing session if token exists
          if (token && token.startsWith('authenticated_session_anika_')) {
            setAdminUser(user || {
              id: 'admin_1',
              email: 'admin@anikahomeopathy.com',
              name: 'Dr. Ankit Kumar / Admin',
              role: 'superadmin',
            });
          } else {
            safeTokenStorage.remove();
            setAdminUser(null);
          }
        }
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // ignore
    }
    setAdminUser(null);
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Command Center', icon: LayoutDashboard, exact: true },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
    { to: '/admin/page-builder', label: 'Homepage & Page CMS', icon: Layers },
    { to: '/admin/settings', label: 'Clinic & Contact Info', icon: Settings },
    { to: '/admin/services', label: 'Clinical Services', icon: Activity },
    { to: '/admin/gallery', label: 'Clinic Photographs', icon: ImageIcon },
    { to: '/admin/testimonials', label: 'Patient Testimonials', icon: MessageSquareQuote },
    { to: '/admin/welcome-popup', label: 'Welcome Popup', icon: Sparkles },
    { to: '/admin/appointments', label: 'Appointments Queue', icon: CalendarCheck },
    { to: '/admin/security', label: 'Security & Password', icon: Lock },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-6">
        <div className="w-12 h-12 border-4 border-navy border-t-green rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-navy">Authenticating Management Portal...</p>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-xs shrink-0">
            <img
              src="/logo.jpeg"
              alt="Anika Clinic Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-serif font-bold text-sm text-cream">ANIKA CMS</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-cream hover:bg-white/10 rounded-lg cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-navy text-white flex flex-col justify-between p-5 md:min-h-screen transition-all ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Brand Heading */}
          <div className="mb-6 px-2 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Anika Clinic Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif font-black text-base text-cream tracking-wide">
                ANIKA CLINIC
              </h1>
              <p className="text-[11px] text-green-light font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> CMS & Practice Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.to, link.exact);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-green text-white shadow-md'
                      : 'text-cream/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-green-light'}`} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="pt-5 border-t border-white/10 space-y-3 mt-6">
          <div className="px-2 text-xs text-cream/70">
            <p className="font-bold text-white truncate">{adminUser?.name || 'Dr. Ankit Kumar'}</p>
            <p className="text-[11px] text-green-light truncate">{adminUser?.email || 'admin@anikahomeopathy.com'}</p>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-cream/80 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-300 hover:text-red-100 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
