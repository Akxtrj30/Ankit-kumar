import React from 'react';
import { MapPin, Phone, Mail, Instagram, ShieldCheck, Award } from 'lucide-react';
import { ClinicSettings, DoctorProfile } from '../../types/schema';

interface FooterProps {
  settings: ClinicSettings | null;
  doctor: DoctorProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ settings, doctor }) => {
  return (
    <footer className="bg-navy text-white pt-16 pb-10 border-t-4 border-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Identity Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden">
                <img
                  src={settings?.logoUrl || '/logo.jpeg'}
                  alt={settings?.clinicName || 'Anika Homeopathic Clinic Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-serif font-bold text-cream">
                {settings?.clinicName || 'ANIKA HOMEOPATHIC CLINIC'}
              </h3>
            </div>
            <p className="text-sm text-cream/70 mb-5 italic">
              "{settings?.taglineHindi || 'आपका स्वास्थ्य, हमारी प्राथमिकता'}"
            </p>
            <div className="bg-navy-dark p-4 rounded-xl border border-white/10 text-xs space-y-1.5 text-cream/80">
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-light" />
                {doctor?.name || 'Dr. Ankit Kumar'} ({doctor?.qualification || 'BHMS'})
              </p>
              <p>{doctor?.designation || 'Chief Homeopathic Physician'} • {doctor?.college || 'R.B.T.S. Govt. Medical College'}</p>
              <p className="font-mono text-cream/90">
                State Reg: <span className="text-white font-semibold">{doctor?.registrationNumber || '36822'}</span>
              </p>
              <p className="font-mono text-cream/90">
                NCH Reg: <span className="text-white font-semibold">{doctor?.nchRegistrationNumber || 'NRH/0107331'}</span>
              </p>
              <p className="text-green-light font-semibold pt-1 border-t border-white/10">
                {doctor?.ministry || 'Ministry of AYUSH, Govt. of India'} Registered
              </p>
            </div>
          </div>

          {/* Quick Clinic Timings & Consultation Fees */}
          <div>
            <h4 className="text-base font-semibold text-cream mb-4 border-b border-white/10 pb-2">
              OPD Timings & Consultation Fees
            </h4>
            <div className="text-sm space-y-2.5 text-cream/80">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-cream/70">Morning Session:</span>
                <span className="font-semibold text-white">{settings?.timings?.morning || '09:00 AM – 02:00 PM'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-cream/70">Evening Session:</span>
                <span className="font-semibold text-white">{settings?.timings?.evening || '03:00 PM – 08:00 PM'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-cream/70">Consultation Fee:</span>
                <span className="font-semibold text-green-light">{settings?.consultationFee?.firstVisit || '₹300'} (First Visit)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-cream/70">Working Days:</span>
                <span className="font-semibold text-green-light">Monday – Saturday</span>
              </div>
              <p className="text-xs text-cream/60 mt-3 pt-2">
                Emergency attention is available on call for registered acute cases.
              </p>
            </div>
          </div>

          {/* Location & Verified Coordinates */}
          <div>
            <h4 className="text-base font-semibold text-cream mb-4 border-b border-white/10 pb-2">
              Practice Location & Connect
            </h4>
            <div className="space-y-3.5 text-sm text-cream/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-green-light shrink-0 mt-0.5" />
                <span>
                  {settings?.address?.street}, {settings?.address?.municipality}, {settings?.address?.district}, {settings?.address?.state} – {settings?.address?.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-green-light shrink-0" />
                <a href={`tel:${settings?.phone}`} className="hover:text-green-light transition-colors">
                  {settings?.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-green-light shrink-0" />
                <a href={`mailto:${settings?.email}`} className="hover:text-green-light transition-colors">
                  {settings?.email}
                </a>
              </div>
              {settings?.instagram && (
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-green-light shrink-0" />
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-green-light transition-colors">
                    Instagram: @anika_homeopathy
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-cream/60 space-y-2">
          <p className="max-w-3xl mx-auto">
            Legal & Medical Notice: Homeopathic consultations are conducted under statutory professional standards established by the Ministry of AYUSH and the National Commission for Homeopathy (NCH), Government of India.
          </p>
          <p>© {new Date().getFullYear()} Anika Homeopathic Clinic • All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
