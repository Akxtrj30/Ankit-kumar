import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Save,
  Clock,
  Fingerprint,
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Profile Update State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await adminApi.verifySession();
        setCurrentUser(res.user);
        setName(res.user?.name || '');
        setEmail(res.user?.email || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    setChangingPassword(true);
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      setPasswordFeedback({
        type: 'success',
        message: 'Password successfully changed and re-hashed with bcrypt! Use your new password on next login.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 5000);
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        message: err.message || 'Failed to change password. Please verify current password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setUpdatingProfile(true);
    try {
      const res = await adminApi.updateProfile({ name, email });
      setCurrentUser(res.user);
      setProfileFeedback({
        type: 'success',
        message: 'Admin credentials and email profile updated successfully.',
      });
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err: any) {
      setProfileFeedback({
        type: 'error',
        message: err.message || 'Failed to update admin profile.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-green" /> Authentication & Hardening
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
          Admin Security & Access Controls
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Manage administrator passwords, session token lifecycles, and brute-force defenses.
        </p>
      </div>

      {/* Security Status Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green/10 text-green flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-navy">Bcrypt Password Hashing</h4>
            <p className="text-[11px] text-green font-semibold">Active (10 salt rounds)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-navy">Brute Force Protection</h4>
            <p className="text-[11px] text-amber-600 font-semibold">Active (5 Attempts Lockout)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 text-green" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-navy">Session Bearer Token</h4>
            <p className="text-[11px] text-navy font-semibold">Role: {currentUser?.role || 'Superadmin'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <KeyRound className="w-5 h-5 text-green" />
            <h2 className="text-lg font-serif font-bold text-navy">Change Master Admin Password</h2>
          </div>

          {passwordFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
                passwordFeedback.type === 'success'
                  ? 'bg-green/10 border border-green/30 text-green-dark'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter existing password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                New Password * (Min. 6 chars)
              </label>
              <input
                type="password"
                required
                placeholder="Enter strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <p className="text-[11px] text-gray-500 italic">
              Your password will be encrypted using standard one-way bcrypt salting with 10 rounds. It will never be stored in plain text.
            </p>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{changingPassword ? 'Hashing & Updating...' : 'Update Admin Password'}</span>
            </button>
          </form>
        </div>

        {/* Profile Information Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <UserCheck className="w-5 h-5 text-green" />
            <h2 className="text-lg font-serif font-bold text-navy">Administrator Identity Profile</h2>
          </div>

          {profileFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
                profileFeedback.type === 'success'
                  ? 'bg-green/10 border border-green/30 text-green-dark'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {profileFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Administrator Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Administrator Login Email / Username *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 text-[11px] space-y-1">
              <span className="font-bold text-navy block">Security Protocol Notice</span>
              <p className="text-gray-600">
                Unauthorized access attempts are logged and automatically rejected after 5 sequential failures. To reset credentials if locked out, restart the server process.
              </p>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 bg-green hover:bg-green-dark text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
