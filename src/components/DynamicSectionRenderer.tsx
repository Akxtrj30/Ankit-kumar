import React, { useState } from 'react';
import { HeroCanvas } from './3d/HeroCanvas';
import {
  PageBlock,
  ClinicSettings,
  DoctorProfile,
  ServiceItem,
  GalleryItem,
  TestimonialItem,
} from '../types/schema';
import { publicApi } from '../services/api';
import { isValidIndianPhone, isValidAge } from '../utils/appointment';
import {
  Award,
  CheckCircle,
  Calendar,
  Send,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  MessageCircle,
  Star,
  Image as ImageIcon,
  Info,
  UserCheck,
  IndianRupee,
} from 'lucide-react';

interface Props {
  blocks: PageBlock[];
  settings: ClinicSettings | null;
  doctors: DoctorProfile[];
  services: ServiceItem[];
  gallery?: GalleryItem[];
  testimonials?: TestimonialItem[];
  onAppointmentBooked?: (reference: string) => void;
}

export const DynamicSectionRenderer: React.FC<Props> = ({
  blocks,
  settings,
  doctors,
  services,
  gallery = [],
  testimonials = [],
  onAppointmentBooked,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const handleSelectDoctorForBooking = (docId: string) => {
    setSelectedDoctorId(docId);
    const element = document.getElementById('appointment-booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col">
      {blocks
        .filter((block) => block.isVisible)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((block) => {
          switch (block.type) {
            case 'HeroBlock':
              return <HeroSection key={block.id} block={block} settings={settings} />;
            case 'AboutBlock':
              return <AboutSection key={block.id} block={block} settings={settings} />;
            case 'DoctorBlock':
              return (
                <DoctorSection
                  key={block.id}
                  block={block}
                  doctors={doctors}
                  onSelectDoctor={handleSelectDoctorForBooking}
                />
              );
            case 'ServicesBlock':
              return <ServicesSection key={block.id} block={block} services={services} />;
            case 'GalleryBlock':
              return <GallerySection key={block.id} block={block} gallery={gallery} />;
            case 'TestimonialsBlock':
              return (
                <TestimonialsSection key={block.id} block={block} testimonials={testimonials} />
              );
            case 'AppointmentBlock':
              return (
                <AppointmentSection
                  key={block.id}
                  block={block}
                  settings={settings}
                  doctors={doctors}
                  preselectedDoctorId={selectedDoctorId}
                  onAppointmentBooked={onAppointmentBooked}
                />
              );
            case 'ContactBlock':
              return <ContactSection key={block.id} block={block} settings={settings} />;
            default:
              return null;
          }
        })}
    </div>
  );
};

// 1. HERO BLOCK COMPONENT
const HeroSection: React.FC<{ block: PageBlock; settings: ClinicSettings | null }> = ({
  block,
  settings,
}) => {
  return (
    <section
      id="hero-section"
      style={{ backgroundColor: block.styles?.backgroundColor || '#F8F3E7' }}
      className={`relative overflow-hidden ${block.styles?.paddingY || 'py-16'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border border-green/30 text-green font-semibold text-xs shadow-xs">
              <img
                src={settings?.logoUrl || '/logo.jpeg'}
                alt="Anika Clinic Logo"
                className="w-5 h-5 object-contain rounded-xs"
              />
              <span className="text-navy font-bold">{settings?.clinicName || 'ANIKA CLINIC'}</span>
              <span className="text-gray-300">•</span>
              <Award className="w-4 h-4 text-green" />
              <span>Ministry of AYUSH & NCH Registered</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-serif font-black text-navy leading-tight tracking-tight">
                {block.title || 'Your Health, Our Priority'}
              </h1>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-green">
                {block.subtitle || settings?.taglineHindi || 'आपका स्वास्थ्य, हमारी प्राथमिकता'}
              </p>
            </div>

            <p className="text-base text-navy/75 leading-relaxed max-w-xl">
              {block.content?.subheading ||
                settings?.taglineEnglish ||
                'Individualized, gentle, and constitutional homeopathic treatment tailored precisely for long-term health, cellular restoration, and chronic disease relief.'}
            </p>

            {/* Quick Practice Highlights */}
            <div className="grid grid-cols-2 gap-3 py-2 border-y border-navy/10 text-xs font-semibold text-navy/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green shrink-0" />
                <span>Govt. College Alumnus Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green shrink-0" />
                <span>Classical Hahnemannian</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green shrink-0" />
                <span>Zero Chemical Toxicity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green shrink-0" />
                <span>Chronic Root-Cause Care</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#appointment-booking"
                className="bg-navy hover:bg-navy-dark text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-navy/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{block.content?.ctaPrimaryText || 'Book Consultation'}</span>
              </a>
              <a
                href={`tel:${settings?.phone || '+919122999656'}`}
                className="bg-white hover:bg-cream-light text-navy border-2 border-navy/20 px-6 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-green" />
                <span>{block.content?.ctaSecondaryText || 'Direct Call'}</span>
              </a>
            </div>
          </div>

          {/* Hero Right: 3D Style Logo Emblem Showcase */}
          <div className="lg:col-span-6 relative">
            <HeroCanvas logoUrl={settings?.logoUrl || '/logo.jpeg'} />
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. ABOUT CLINIC SECTION
const AboutSection: React.FC<{ block: PageBlock; settings: ClinicSettings | null }> = ({
  block,
  settings,
}) => {
  const about = settings?.about;
  return (
    <section
      id="about-clinic"
      style={{ backgroundColor: block.styles?.backgroundColor || '#FFFFFF' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" /> About Anika Homeopathic Clinic
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy leading-tight">
              {block.title || about?.heading || 'Root-Cause Homeopathy Tailored to You'}
            </h2>

            <p className="text-sm font-semibold text-green">
              {block.subtitle || about?.subheading || 'Serving patients across Bihar since ' + (about?.establishedYear || '2019')}
            </p>

            <p className="text-sm sm:text-base text-navy/80 leading-relaxed">
              {about?.description ||
                block.content?.description ||
                'Founded on the purest principles of classical Hahnemannian homeopathy, Anika Homeopathic Clinic delivers individualized holistic medical care. We focus on gently stimulating the natural vital force to eradicate acute afflictions and deep-seated chronic diseases without pharmaceutical suppression.'}
            </p>

            {/* Consultation Fee Badge */}
            <div className="p-4 bg-cream/70 rounded-2xl border border-navy/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green text-white flex items-center justify-center font-bold text-lg shrink-0">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-navy block text-sm">
                  First Visit: {settings?.consultationFee?.firstVisit || '₹300'} • Follow-up: {settings?.consultationFee?.followUp || '₹200'}
                </span>
                <p className="text-navy/70 mt-0.5">
                  {settings?.consultationFee?.medicinePolicy || 'Genuine German & SBL homeopathic medicines provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif font-bold text-navy text-lg mb-2">Our Clinical Principles</h3>
            {(about?.pillars && about.pillars.length > 0
              ? about.pillars
              : [
                  { title: 'Classical Hahnemannian Law', description: 'Single, constitutional, minimum dose therapeutics respecting the vital force.' },
                  { title: 'Root-Cause Holistic Healing', description: 'Eliminating the chronic diathesis rather than temporarily masking superficial symptoms.' },
                  { title: 'Non-Toxic & Safe Remedies', description: 'Zero systemic toxicity, chemical side-effects, or pharmaceutical dependency.' },
                  { title: 'Govt. AYUSH Registered Team', description: 'Consultations conducted by physicians trained in premier government medical institutions.' },
                ]
            ).map((pillar, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-2xl border border-gray-200/80 flex items-start gap-3 hover:bg-cream/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-green/10 text-green flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy">{pillar.title}</h4>
                  <p className="text-xs text-navy/70 mt-0.5">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// 3. DOCTORS DIRECTORY SECTION (MULTI-DOCTOR SUPPORT)
const DoctorSection: React.FC<{
  block: PageBlock;
  doctors: DoctorProfile[];
  onSelectDoctor?: (doctorId: string) => void;
}> = ({ block, doctors, onSelectDoctor }) => {
  const activeDoctors = doctors.filter((d) => d.isActive !== false);

  return (
    <section
      id="doctors"
      style={{ backgroundColor: block.styles?.backgroundColor || '#F8F3E7' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5 text-green" /> Our Medical Specialists
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy mb-3">
            {block.title || 'Meet Our Homeopathic Physicians'}
          </h2>
          <p className="text-sm sm:text-base text-navy/70">
            {block.subtitle || 'Experienced physicians graduated from premier Government Homeopathic Colleges'}
          </p>
        </div>

        {/* Multi-Doctor Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-navy/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Doctor Header with Photo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-5 border-b border-navy/10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-cream border-2 border-green/30 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                    {doc.imageUrl && !doc.imageUrl.startsWith('C:') && !doc.imageUrl.startsWith('c:') ? (
                      <img
                        src={doc.imageUrl.replace(/^["']|["']$/g, '')}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.doctor-fallback-avatar')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'doctor-fallback-avatar w-full h-full flex items-center justify-center bg-navy text-cream font-serif font-black text-2xl';
                            fallback.innerText = doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy text-cream font-serif font-black text-2xl">
                        {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green/10 text-green">
                        {doc.qualification}
                      </span>
                      {doc.isChief && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          Chief Physician
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-gray-500">
                        {doc.experienceYears} Experience
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-navy">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-green mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-navy/70 mt-0.5">
                      {doc.designation}
                    </p>
                  </div>
                </div>

                {/* Doctor Statutory Qualifications Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-4 text-[11px] text-navy/80">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Alma Mater</span>
                    <span className="font-semibold">{doc.college}</span>
                    <span className="text-gray-500 block">{doc.collegeLocation}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Statutory Registrations</span>
                    <span className="font-mono font-bold text-navy block">State Reg: {doc.registrationNumber}</span>
                    <span className="font-mono font-bold text-green block">NCH Reg: {doc.nchRegistrationNumber}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                    <span className="font-bold text-green text-xs">{doc.consultationFee}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">OPD Schedule</span>
                    <span className="font-semibold text-navy">{doc.availableDays}</span>
                    <span className="text-gray-500 block text-[10px]">{doc.availableTimings}</span>
                  </div>
                </div>

                {/* Bio text */}
                {doc.bio && (
                  <p className="text-xs text-navy/80 leading-relaxed italic mb-5 line-clamp-3">
                    "{doc.bio}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-navy/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-navy/70">
                  {doc.phone && (
                    <a
                      href={`tel:${doc.phone}`}
                      className="flex items-center gap-1 font-semibold hover:text-green"
                    >
                      <Phone className="w-3.5 h-3.5 text-green" /> {doc.phone}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onSelectDoctor && onSelectDoctor(doc._id)}
                  className="px-5 py-2.5 bg-navy hover:bg-navy-dark text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-green-light" />
                  <span>Consult with {doc.name.split(' ')[1] || doc.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. SERVICES BLOCK COMPONENT
const ServicesSection: React.FC<{ block: PageBlock; services: ServiceItem[] }> = ({
  block,
  services,
}) => {
  return (
    <section
      id="services"
      style={{ backgroundColor: block.styles?.backgroundColor || '#FFFFFF' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-green" /> Clinical Specialties
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy mb-3">
            {block.title || 'Specialized Clinical Areas'}
          </h2>
          <p className="text-sm sm:text-base text-navy/70">
            {block.subtitle || 'Holistic clinical interventions rooted in modern AYUSH standards'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <div
              key={service._id}
              className="bg-white p-7 rounded-2xl border border-navy/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-cream text-navy flex items-center justify-center font-bold text-lg group-hover:bg-green group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <span className="text-[11px] font-semibold text-green bg-green/10 px-2.5 py-1 rounded-full">
                    AYUSH Protocol
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-navy mb-2.5">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-navy/70 leading-relaxed mb-4">
                  {service.shortDescription}
                </p>
                {service.fullDescription && (
                  <p className="text-xs text-navy/60 italic border-l-2 border-green/30 pl-3 mb-4">
                    {service.fullDescription}
                  </p>
                )}
              </div>

              <a
                href="#appointment-booking"
                className="pt-3 border-t border-navy/10 text-xs font-bold text-green uppercase tracking-wider inline-flex items-center gap-1.5 group-hover:text-navy transition-colors"
              >
                <span>Consult For This Condition</span>
                <span>&rarr;</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. GALLERY BLOCK COMPONENT
const GallerySection: React.FC<{ block: PageBlock; gallery: GalleryItem[] }> = ({
  block,
  gallery,
}) => {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section
      id="gallery"
      style={{ backgroundColor: block.styles?.backgroundColor || '#F8F3E7' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" /> Clinic Photographs
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy mb-3">
            {block.title || 'Clinic Infrastructure & Facilities'}
          </h2>
          <p className="text-sm sm:text-base text-navy/70">
            {block.subtitle || 'Experience our patient-friendly chambers, hygienic dispensary, and consultation desks'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl overflow-hidden shadow-xs border border-navy/10 group flex flex-col justify-between"
            >
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-navy/85 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-sm text-navy">{item.title}</h3>
                {item.caption && (
                  <p className="text-xs text-navy/70 mt-1 line-clamp-2">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 6. TESTIMONIALS BLOCK COMPONENT
const TestimonialsSection: React.FC<{
  block: PageBlock;
  testimonials: TestimonialItem[];
}> = ({ block, testimonials }) => {
  const approvedTestimonials = testimonials.filter((t) => t.isApproved);
  if (approvedTestimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      style={{ backgroundColor: block.styles?.backgroundColor || '#FFFFFF' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Patient Recovery Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-navy mb-3">
            {block.title || 'Verified Patient Testimonials'}
          </h2>
          <p className="text-sm sm:text-base text-navy/70">
            {block.subtitle || 'Real feedback from chronic patients treated at Anika Homeopathic Clinic'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {approvedTestimonials.map((item) => (
            <div
              key={item._id}
              className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-navy/10 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-navy/80 italic leading-relaxed mb-6">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-navy/10 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-navy">{item.patientName}</h4>
                  <p className="text-[11px] text-gray-500">{item.location}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-green text-[11px] block">
                    {item.conditionTreated}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 7. APPOINTMENT BLOCK WITH DOCTOR SELECTION & VALIDATION
const AppointmentSection: React.FC<{
  block: PageBlock;
  settings: ClinicSettings | null;
  doctors: DoctorProfile[];
  preselectedDoctorId?: string;
  onAppointmentBooked?: (reference: string) => void;
}> = ({ block, settings, doctors, preselectedDoctorId, onAppointmentBooked }) => {
  const activeDoctors = doctors.filter((d) => d.isActive !== false);

  const [formData, setFormData] = useState({
    patientName: '',
    mobileNumber: '',
    age: '',
    preferredDoctorId: preselectedDoctorId || (activeDoctors[0]?._id || ''),
    preferredDoctorName: activeDoctors[0]?.name || 'Dr. Ankit Kumar',
    preferredDate: '',
    preferredTimeSlot: 'Morning (09:00 AM - 02:00 PM)',
    reasonForConsultation: '',
  });

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedDoctorId) {
      const match = activeDoctors.find((d) => d._id === preselectedDoctorId);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          preferredDoctorId: match._id,
          preferredDoctorName: match.name,
        }));
      }
    }
  }, [preselectedDoctorId, activeDoctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.patientName.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }
    if (!isValidIndianPhone(formData.mobileNumber)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isValidAge(formData.age)) {
      setErrorMsg('Please enter a valid patient age (1–120 years).');
      return;
    }
    if (!formData.preferredDate) {
      setErrorMsg('Please select a preferred consultation date.');
      return;
    }
    if (!formData.reasonForConsultation.trim()) {
      setErrorMsg('Please describe your symptoms or reason for consultation.');
      return;
    }

    setLoading(true);
    try {
      const response = await publicApi.bookAppointment({
        ...formData,
        age: Number(formData.age),
      });
      const token = response.referenceNumber;
      setSuccessRef(token);
      if (onAppointmentBooked) {
        onAppointmentBooked(token);
      }
      setFormData({
        patientName: '',
        mobileNumber: '',
        age: '',
        preferredDoctorId: activeDoctors[0]?._id || '',
        preferredDoctorName: activeDoctors[0]?.name || 'Dr. Ankit Kumar',
        preferredDate: '',
        preferredTimeSlot: 'Morning (09:00 AM - 02:00 PM)',
        reasonForConsultation: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit appointment request. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="appointment-booking"
      style={{ backgroundColor: block.styles?.backgroundColor || '#F8F3E7' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-navy/15 shadow-xl p-6 sm:p-12 relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" /> Direct Clinical Queue
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-navy mb-2">
              {block.title || 'Schedule a Homeopathic Consultation'}
            </h2>
            <p className="text-xs sm:text-sm text-navy/70">
              {block.subtitle || 'Reserve your consultation slot with our Government College Alumnus Physicians'}
            </p>
          </div>

          {successRef ? (
            <div className="bg-green/10 border-2 border-green/30 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-serif font-black text-navy">Consultation Queue Confirmed!</h3>
              <p className="text-sm text-navy/80 max-w-md mx-auto">
                Your consultation reference token has been generated:
              </p>
              <div className="inline-block px-6 py-2.5 bg-white border-2 border-green rounded-xl font-mono text-xl font-black text-green tracking-wider shadow-xs">
                {successRef}
              </div>
              <p className="text-xs text-navy/70 max-w-md mx-auto pt-2">
                Please present this reference code or quote your registered mobile number upon arrival at Anika Homeopathic Clinic, Bakhri Bazar during your selected slot.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSuccessRef(null)}
                  className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-dark transition-all cursor-pointer"
                >
                  Book Another Appointment
                </button>
                <a
                  href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}?text=Hello%20Anika%20Clinic,%20I%20have%20booked%20consultation%20token%20${successRef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-green text-white text-xs font-bold rounded-xl hover:bg-green-dark transition-all inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Select Doctor Option */}
              {activeDoctors.length > 0 && (
                <div>
                  <label htmlFor="doctor-select" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Select Consulting Physician *
                  </label>
                  <select
                    id="doctor-select"
                    value={formData.preferredDoctorId}
                    onChange={(e) => {
                      const doc = activeDoctors.find((d) => d._id === e.target.value);
                      setFormData({
                        ...formData,
                        preferredDoctorId: e.target.value,
                        preferredDoctorName: doc?.name || '',
                      });
                    }}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm bg-white font-semibold text-navy"
                  >
                    {activeDoctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} ({doc.qualification}) — {doc.specialization} • Fee: {doc.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="patient-name" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Patient Full Name *
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm"
                    placeholder="e.g. Rameshwar Kumar"
                  />
                </div>

                <div>
                  <label htmlFor="patient-mobile" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Mobile Number (Calling/WhatsApp) *
                  </label>
                  <input
                    id="patient-mobile"
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm"
                    placeholder="10 digit valid mobile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="patient-age" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Patient Age (Years) *
                  </label>
                  <input
                    id="patient-age"
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm"
                    placeholder="Years"
                  />
                </div>

                <div>
                  <label htmlFor="consultation-date" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Consultation Date *
                  </label>
                  <input
                    id="consultation-date"
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="time-slot" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    Consultation Slot *
                  </label>
                  <select
                    id="time-slot"
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm bg-white"
                  >
                    <option value="Morning (09:00 AM - 02:00 PM)">Morning (09:00 AM - 02:00 PM)</option>
                    <option value="Evening (03:00 PM - 08:00 PM)">Evening (03:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Symptoms, Chief Health Complaints or Duration *
                </label>
                <textarea
                  id="symptoms"
                  required
                  rows={3}
                  value={formData.reasonForConsultation}
                  onChange={(e) => setFormData({ ...formData, reasonForConsultation: e.target.value })}
                  className="w-full px-4 py-3 border border-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green text-sm"
                  placeholder="Describe your health symptoms, chronicity, previous treatments or specific difficulties..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green hover:bg-green-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-green/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Securing Consultation Slot...' : (
                  <>
                    <span>Submit Consultation Request</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// 8. CONTACT & CLINIC COORDINATES BLOCK
const ContactSection: React.FC<{ block: PageBlock; settings: ClinicSettings | null }> = ({
  block,
  settings,
}) => {
  return (
    <section
      id="location"
      style={{ backgroundColor: block.styles?.backgroundColor || '#173B78' }}
      className={block.styles?.paddingY || 'py-20'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Coordinates Details */}
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-green-light">
              Location & Contact Coordinates
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-cream">
              {block.title || 'Visit Anika Homeopathic Clinic'}
            </h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              Serving patients across Begusarai, Khagaria, Samastipur, and Bihar with classical holistic homeopathic healing.
            </p>

            <div className="space-y-4 text-cream/90 text-sm">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <MapPin className="w-5 h-5 text-green-light shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Clinic Address:</strong>
                  <span>
                    {settings?.address?.street}, {settings?.address?.municipality}, {settings?.address?.district}, {settings?.address?.state} – {settings?.address?.pincode}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Phone className="w-5 h-5 text-green-light shrink-0" />
                <div>
                  <strong className="text-white block mb-0.5">Telephone & WhatsApp:</strong>
                  <span>{settings?.phone} / {settings?.whatsapp}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green hover:bg-green-dark text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> Message on WhatsApp
              </a>
              <a
                href={`tel:${settings?.phone}`}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call Clinic Desk
              </a>
            </div>
          </div>

          {/* Timings & Map Card */}
          <div className="bg-navy-dark rounded-3xl p-7 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-green-light font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Official Registered Timings
            </div>

            <div className="divide-y divide-white/10 text-sm">
              <div className="py-3 flex justify-between items-center">
                <span className="text-cream/70">Morning OPD Consultation</span>
                <span className="font-semibold text-white">{settings?.timings?.morning || '09:00 AM – 02:00 PM'}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-cream/70">Evening OPD Consultation</span>
                <span className="font-semibold text-white">{settings?.timings?.evening || '03:00 PM – 08:00 PM'}</span>
              </div>
              <div className="py-3 flex justify-between items-center text-green-light">
                <span>Working Days</span>
                <span className="font-semibold">Monday – Saturday</span>
              </div>
            </div>

            {/* Visual Clinic Locator Badge */}
            <div className="p-4 bg-navy rounded-2xl border border-white/10 text-xs text-cream/70 space-y-2">
              <p className="font-semibold text-cream flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-light" /> Landmark: Bakhri Bazar Main Road
              </p>
              <p>Located centrally in Bakhri Bazar, Nagar Parishad Ward No. 26. Accessible via all Begusarai district transit routes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
