import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Lock, Mail, ShieldAlert, ShieldCheck, ArrowLeft, KeyRound, Eye, EyeOff, Smartphone } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@anikahomeopathy.com');
  const [password, setPassword] = useState('SecureClinic2025!#');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const cleanEmailOrUser = email.trim();
    const cleanPassword = password.trim();

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
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrefill = () => {
    setEmail('admin@anikahomeopathy.com');
    setPassword('SecureClinic2025!#');
    setErrorMsg('');
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

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-navy/10 p-8 sm:p-10">
        <div className="text-center mb-8">
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

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>{errorMsg}</p>
              <p className="text-[11px] text-red-600/80 mt-1 font-normal">
                Tip: You can use username <strong className="font-semibold">admin</strong> or email <strong className="font-semibold">admin@anikahomeopathy.com</strong>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Email or Username
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
                placeholder="admin@anikahomeopathy.com or admin"
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
                className="w-full pl-10 pr-11 py-3 border border-navy/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green bg-slate-50/50"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-navy/40 hover:text-navy focus:outline-none p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-navy/70 pt-1">
            <span className="flex items-center gap-1 text-[11px] text-green font-medium">
              <Smartphone className="w-3.5 h-3.5" /> Mobile & Multi-Device Enabled
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy hover:bg-navy-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Verifying Identity...' : 'Access Dashboard Portal'}
          </button>
        </form>

        {/* Quick Demo Pre-fill Helper */}
        <div className="mt-6 pt-5 border-t border-navy/10 text-center">
          <button
            type="button"
            onClick={handlePrefill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream hover:bg-cream-light text-navy text-xs font-semibold rounded-lg border border-navy/15 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-green" />
            <span>Load Default Doctor Credentials</span>
          </button>
          <p className="text-[11px] text-navy/60 mt-2">
            Default credentials: <span className="font-mono">admin@anikahomeopathy.com</span> (or <span className="font-mono">admin</span>)
          </p>
        </div>
      </div>
    </div>
  );
};
