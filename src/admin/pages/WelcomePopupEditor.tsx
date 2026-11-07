import React, { useState, useEffect } from 'react';
import { publicApi, adminApi } from '../../services/api';
import { WelcomePopupSettings, ClinicSettings } from '../../types/schema';
import {
  Sparkles,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';

export const WelcomePopupEditor: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [popup, setPopup] = useState<WelcomePopupSettings>({
    isEnabled: true,
    badgeText: 'Govt. AYUSH Registered Medical Leadership',
    hindiHeading: 'बिहार के एकमात्र गवर्नमेंट कॉलेज से पढ़े हुए डॉक्टर',
    englishSubheading:
      'Led by Dr. Ankit Kumar (BHMS) — Alumnus of R B T S Govt. Homeopathic Medical College & Hospital, Muzaffarpur',
    highlightNotice: '100% Gentle, Non-Suppressive Classical Constitutional Treatment',
    buttonText: 'Explore Website & Consult Doctors',
    accentColor: '#D4AF37',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await publicApi.getSettings();
        if (res.data) {
          setSettings(res.data);
          if (res.data.welcomePopup) {
            setPopup(res.data.welcomePopup);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    try {
      const updatedSettings = {
        ...settings,
        welcomePopup: popup,
      };
      await adminApi.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      setFeedback({
        type: 'success',
        message: 'Welcome Popup configuration successfully saved! Changes are live on the website.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update popup settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Patient First Impression Modal
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Automatic Welcome Announcement Popup
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configure the 3D gold-highlighted modal shown to visitors when they open or reload the website.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Popup'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-green/10 border border-green/30 text-green-dark'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-xs">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-200">
              <div>
                <span className="font-bold text-navy text-sm block">Display Popup on Website Open</span>
                <p className="text-[11px] text-gray-500">
                  When enabled, popup triggers automatically every time someone loads or refreshes.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={popup.isEnabled}
                  onChange={(e) => setPopup({ ...popup, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green"></div>
              </label>
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Top Credential Badge Text
              </label>
              <input
                type="text"
                value={popup.badgeText}
                onChange={(e) => setPopup({ ...popup, badgeText: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Exact Hindi Headline *
              </label>
              <input
                type="text"
                required
                value={popup.hindiHeading}
                onChange={(e) => setPopup({ ...popup, hindiHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-navy bg-amber-50/50 border-amber-300"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Default exact prompt requirement: "बिहार के एकमात्र गवर्नमेंट कॉलेज से पढ़े हुए डॉक्टर"
              </p>
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                English Subheading & Doctor Credential
              </label>
              <textarea
                rows={3}
                value={popup.englishSubheading}
                onChange={(e) => setPopup({ ...popup, englishSubheading: e.target.value })}
                className="w-full p-3.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Highlight Notice Bar
              </label>
              <input
                type="text"
                value={popup.highlightNotice}
                onChange={(e) => setPopup({ ...popup, highlightNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                Call-to-Action Button Label
              </label>
              <input
                type="text"
                value={popup.buttonText}
                onChange={(e) => setPopup({ ...popup, buttonText: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-green hover:bg-green-dark text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Popup Changes'}</span>
            </button>
          </form>
        </div>

        {/* Live Interactive Preview Column */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-green" /> Live Interactive Preview
            </span>
            <span className="text-[11px] text-gray-400">Renders as shown to visitors</span>
          </div>

          <div className="p-6 bg-slate-900/90 rounded-3xl flex items-center justify-center min-h-[460px]">
            {/* Mock Glassmorphism Card */}
            <div className="relative w-full max-w-md bg-gradient-to-b from-white via-cream-light to-white rounded-3xl border-2 border-amber-300 shadow-2xl p-6 text-center space-y-4">
              {/* Close Button Preview */}
              <div className="absolute top-3 right-3 p-1.5 text-navy/40 rounded-full hover:bg-navy/5">
                <X className="w-4 h-4" />
              </div>

              {/* Logo Emblem (Clean, zero circular badges) */}
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md border-2 border-amber-300 flex items-center justify-center mx-auto">
                  <img
                    src={settings.logoUrl || '/logo.jpeg'}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase">
                  <ShieldCheck className="w-3 h-3 text-green" />
                  <span>{popup.badgeText}</span>
                </span>
                <p className="text-[10px] uppercase font-black text-navy/60 tracking-wider mt-1">
                  {settings.clinicName}
                </p>
              </div>

              {/* Exact Hindi Notice */}
              <div className="py-3 px-4 rounded-xl bg-amber-400/20 border border-amber-400/50">
                <h3 className="text-lg font-serif font-black text-navy leading-snug">
                  "{popup.hindiHeading}"
                </h3>
                <p className="text-[10px] font-bold text-green mt-1">
                  आर. बी. टी. एस. राजकीय होम्योपैथिक मेडिकल कॉलेज एवं अस्पताल
                </p>
              </div>

              {/* Subheading */}
              <p className="text-xs text-navy/80 leading-relaxed">
                {popup.englishSubheading}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-navy">
                <div className="bg-white p-2 rounded-lg border border-navy/10 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green shrink-0" />
                  <span>NCH: NRH/0107331</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-navy/10 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green shrink-0" />
                  <span>State Reg: 36822</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="w-full py-3 bg-navy text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{popup.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
