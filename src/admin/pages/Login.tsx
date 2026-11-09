import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import {
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmailOrUser = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmailOrUser) {
      setErrorMsg('Please enter your administrator email or username.');
      setSubmitting(false);
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Please enter your administrator password.');
      setSubmitting(false);
      return;
    }

    try {
      await adminApi.login({ email: cleanEmailOrUser, password: cleanPassword });
      setSuccessMsg('Identity verified. Accessing practice command center...');
      setTimeout(() => {
        navigate('/admin');
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied. Invalid email/username or password.');
      setSubmitting(false);
    }
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
            <ShieldCheck className="w-3.5 h-3.5 text-green" /> Restricted Administrator Portal
          </p>
        </div>

        {successMsg && (
          <div className="mb-5 p-3.5 bg-green/10 border border-green text-green font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
            <p>{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p>{errorMsg}</p>
              <p className="text-[11px] text-red-600/80 mt-1 font-normal">
                Please check your credentials and try again. Contact the Chief Administrator if you lost your password.
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Administrator Email or Username
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
                placeholder="Enter email or username"
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
                placeholder="Enter password"
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
            <span className="flex items-center gap-1 text-[11px] text-navy/60 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-green" /> Hashed Authentication
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy hover:bg-navy-dark text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Authenticating Identity...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-navy/10 text-center">
          <p className="text-[11px] text-navy/60 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green" /> Restricted to Authorized Clinic Physicians & Staff
          </p>
        </div>
      </div>
    </div>
  );
};
