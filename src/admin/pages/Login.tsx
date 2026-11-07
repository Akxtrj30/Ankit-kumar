import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import {
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Zap,
  CheckCircle2,
  Laptop,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@anikahomeopathy.com');
  const [password, setPassword] = useState('SecureClinic2025!#');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const performLogin = async (userValue: string, passValue: string) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmailOrUser = userValue.trim();
    const cleanPassword = passValue.trim();

    if (!cleanEmailOrUser) {
      setErrorMsg('Please enter your administrator email or username.');
      setSubmitting(false);
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Please enter your password.');
      setSubmitting(false);
      return;
    }

    try {
      await adminApi.login({ email: cleanEmailOrUser, password: cleanPassword });
      setSuccessMsg('Access granted. Entering management dashboard...');
      setTimeout(() => {
        navigate('/admin');
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied. Please check your credentials or use Quick Access.');
      setSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setEmail(u);
    setPassword(p);
    performLogin(u, p);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream/70 px-4 py-8">
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Public Website
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-navy/10 p-6 sm:p-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 mb-3 shadow-md border border-navy/10 overflow-hidden">
            <img
              src="/logo.jpeg"
              alt="Anika Homeopathic Clinic Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-serif font-black text-navy">ANIKA CLINIC</h1>
          <p className="text-xs font-semibold text-green mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Doctor & Practice Management Portal
          </p>
        </div>

        {/* 1-Tap Quick Access Button for Mobile & Secondary Devices */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Multi-Device Instant Access
            </span>
            <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
              Mobile Ready
            </span>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleQuickLogin('admin', 'SecureClinic2025!#')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-emerald-100 fill-emerald-100" />
            <span>1-Tap Instant Admin Login</span>
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3.5 bg-green/10 border border-green text-green font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
            <p>{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>{errorMsg}</p>
              <p className="text-[11px] text-red-600/80 mt-1 font-normal">
                Tip: Tap <strong className="font-semibold text-red-800">1-Tap Instant Admin Login</strong> above, or use username <strong className="font-semibold text-red-800">admin</strong> with password <strong className="font-semibold text-red-800">SecureClinic2025!#</strong>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Email, Username, or Mobile
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-navy/40" />
              <input
                id="login-email"
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-navy/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green bg-slate-50/50"
                placeholder="admin or admin@anikahomeopathy.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-navy/40" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 border border-navy/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green bg-slate-50/50 font-mono"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-navy/50 hover:text-navy p-1.5 rounded-lg hover:bg-slate-200/60 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label
              htmlFor="show-password-checkbox"
              className="flex items-center gap-2 cursor-pointer text-navy/80 hover:text-navy font-semibold select-none"
            >
              <input
                id="show-password-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded text-green focus:ring-green border-navy/30 cursor-pointer accent-green"
              />
              <span>Show password</span>
            </label>
            <span className="flex items-center gap-1 text-[11px] text-green font-medium">
              <Smartphone className="w-3.5 h-3.5" /> Any Device Supported
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy hover:bg-navy-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Verifying Identity...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Credential Presets */}
        <div className="mt-6 pt-5 border-t border-navy/10 text-center space-y-3">
          <p className="text-xs font-bold text-navy flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-green" /> Tap to Fill & Login:
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'SecureClinic2025!#')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-navy/15 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-navy group-hover:text-green">Superadmin</span>
                <Laptop className="w-3 h-3 text-navy/40" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">admin</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-navy/15 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-navy group-hover:text-green">Simple Login</span>
                <Smartphone className="w-3 h-3 text-navy/40" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">admin / admin123</p>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-navy/10 text-left text-xs space-y-1">
            <p className="font-semibold text-navy text-[11px]">Accepted Credentials across all devices:</p>
            <p className="text-[11px] text-navy/80">
              • Username: <code className="bg-white px-1.5 py-0.5 rounded border border-navy/15 font-mono text-green font-bold">admin</code> or <code className="bg-white px-1.5 py-0.5 rounded border border-navy/15 font-mono text-navy font-bold">admin@anikahomeopathy.com</code>
            </p>
            <p className="text-[11px] text-navy/80">
              • Password: <code className="bg-white px-1.5 py-0.5 rounded border border-navy/15 font-mono text-navy font-bold">SecureClinic2025!#</code> or <code className="bg-white px-1.5 py-0.5 rounded border border-navy/15 font-mono text-navy font-bold">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
