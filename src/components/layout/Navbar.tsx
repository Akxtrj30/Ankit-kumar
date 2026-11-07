import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, Menu, X, ShieldCheck, Stethoscope, Sparkles } from 'lucide-react';
import { ClinicSettings, DoctorProfile } from '../../types/schema';

interface NavbarProps {
  settings: ClinicSettings | null;
  doctor?: DoctorProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, doctor }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-cream shadow-sm">
      {/* Top Notice Banner if Active */}
      {settings?.announcement?.isActive && settings.announcement.text && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 font-bold text-center flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{settings.announcement.text}</span>
        </div>
      )}

      {/* Top Clinical Announcement & Timings Banner */}
      <div className="bg-navy text-white text-xs px-4 py-2 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-cream">
              <Clock className="w-3.5 h-3.5 text-green-light shrink-0" />
              <span>Timings: {settings?.timings?.morning || '09:00 AM – 02:00 PM'} & {settings?.timings?.evening || '03:00 PM – 08:00 PM'}</span>
            </span>
            <span className="hidden md:inline-block text-white/30">•</span>
            <span className="hidden md:inline-block text-white/80">Begusarai, Bihar</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings?.phone || '+919122999656'}`}
              className="flex items-center gap-1 font-semibold text-green-light hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call: {settings?.phone || '+91 9122999656'}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-white border border-navy/15 flex items-center justify-center p-1 shadow-sm overflow-hidden group-hover:border-green/40 transition-all shrink-0">
            <img
              src={settings?.logoUrl || '/logo.jpeg'}
              alt={settings?.clinicName || 'Anika Homeopathic Clinic Logo'}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="block font-serif font-black text-navy text-base sm:text-lg leading-tight tracking-wide">
              {settings?.clinicName || 'ANIKA HOMEOPATHIC CLINIC'}
            </span>
            <span className="block text-[11px] font-semibold text-green">
              {settings?.taglineHindi || 'आपका स्वास्थ्य, हमारी प्राथमिकता'}
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 font-medium text-navy/80 text-sm">
          <a href="#hero-section" className="hover:text-green transition-colors">Home</a>
          <a href="#about-clinic" className="hover:text-green transition-colors">About Us</a>
          <a href="#doctors" className="hover:text-green transition-colors flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-green" /> Our Doctors
          </a>
          <a href="#services" className="hover:text-green transition-colors">Specialties</a>
          <a href="#gallery" className="hover:text-green transition-colors">Gallery</a>
          <a href="#testimonials" className="hover:text-green transition-colors">Patient Stories</a>
          <a href="#appointment-booking" className="hover:text-green transition-colors">Book OPD</a>
          <a href="#location" className="hover:text-green transition-colors">Location</a>
          
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold border border-navy/20 bg-cream/50 text-navy px-3.5 py-2 rounded-lg hover:bg-navy hover:text-white transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-green" /> Doctor / Admin CMS
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden p-2 text-navy hover:bg-cream rounded-lg transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-navy/10 px-6 py-4 space-y-3 shadow-lg">
          <a href="#hero-section" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Home</a>
          <a href="#about-clinic" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">About Us</a>
          <a href="#doctors" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Our Doctors</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Clinical Specialties</a>
          <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Clinic Photographs</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Patient Testimonials</a>
          <a href="#appointment-booking" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Book Consultation</a>
          <a href="#location" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-navy font-medium text-sm">Location & Timings</a>
          <div className="pt-2 border-t border-navy/10">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-green font-bold text-sm"
            >
              <ShieldCheck className="w-4 h-4" /> Doctor / CMS Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
