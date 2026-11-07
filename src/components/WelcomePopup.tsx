import React, { useState, useEffect } from 'react';
import { WelcomePopupSettings } from '../types/schema';
import { Award, CheckCircle, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomePopupProps {
  settings?: WelcomePopupSettings;
  clinicName?: string;
  logoUrl?: string;
  onClose?: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({
  settings,
  clinicName = 'ANIKA HOMEOPATHIC CLINIC',
  logoUrl = '/logo.jpeg',
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show on every page open / reload as explicitly requested
    if (settings && settings.isEnabled === false) {
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [settings]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const hindiText =
    settings?.hindiHeading || 'बिहार के एकमात्र गवर्नमेंट कॉलेज से पढ़े हुए डॉक्टर';
  const englishSub =
    settings?.englishSubheading ||
    'Led by Dr. Ankit Kumar (BHMS) — Alumnus of R B T S Govt. Homeopathic Medical College & Hospital, Muzaffarpur';
  const badge = settings?.badgeText || 'Govt. AYUSH Registered Medical Leadership';
  const highlight =
    settings?.highlightNotice || '100% Gentle, Non-Suppressive Classical Constitutional Treatment';
  const btnText = settings?.buttonText || 'Explore Website & Consult Doctors';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-navy-dark/75 backdrop-blur-md animate-in fade-in duration-300 select-none"
    >
      {/* 3D Glassmorphic Modal Card with Golden Highlights */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-white via-cream-light to-white rounded-3xl border-2 border-amber-300/60 shadow-[0_25px_60px_-15px_rgba(23,59,120,0.5),0_0_30px_rgba(212,175,55,0.25)] p-6 sm:p-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-400">
        
        {/* Subtle Decorative Golden/Emerald Ambient Radial Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-green/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close welcome popup"
          className="absolute top-4 right-4 p-2 text-navy/60 hover:text-navy hover:bg-navy/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Official Clinic Logo Emblem (Clean, zero circular badges or frames) */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-lg border-2 border-amber-300/70 flex items-center justify-center transform hover:scale-105 transition-transform">
              <img
                src={logoUrl}
                alt={clinicName}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Clinic Name & AYUSH Badge */}
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-green" />
              <span>{badge}</span>
            </span>
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-navy/60 pt-1">
              {clinicName}
            </h3>
          </div>

          {/* The Exact Mandatory Hindi Message Highlight */}
          <div className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-amber-400/40 shadow-inner">
            <h2
              id="welcome-popup-title"
              className="text-2xl sm:text-3xl lg:text-3xl font-serif font-black text-navy leading-snug tracking-tight"
            >
              "{hindiText}"
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-green-dark mt-2">
              आर. बी. टी. एस. राजकीय होम्योपैथिक मेडिकल कॉलेज एवं अस्पताल, मुजफ्फरपुर
            </p>
          </div>

          {/* Subheading Information */}
          <p className="text-xs sm:text-sm text-navy/80 leading-relaxed max-w-md">
            {englishSub}
          </p>

          {/* Quality Highlights */}
          <div className="grid grid-cols-2 gap-2.5 w-full text-[11px] sm:text-xs text-navy font-semibold pt-1">
            <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-navy/10">
              <CheckCircle className="w-4 h-4 text-green shrink-0" />
              <span>NCH Reg: NRH/0107331</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-navy/10">
              <CheckCircle className="w-4 h-4 text-green shrink-0" />
              <span>State Reg: 36822</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-navy via-navy-light to-navy text-white rounded-xl font-bold text-sm shadow-xl shadow-navy/25 hover:shadow-navy/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
          >
            <span>{btnText}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
