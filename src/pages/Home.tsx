import React, { useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import {
  ClinicSettings,
  DoctorProfile,
  ServiceItem,
  GalleryItem,
  TestimonialItem,
  PageData,
} from '../types/schema';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { WelcomePopup } from '../components/WelcomePopup';

export const Home: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBookedToken, setRecentBookedToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, doctorsRes, servicesRes, galleryRes, testimonialsRes, pageRes] =
          await Promise.all([
            publicApi.getSettings(),
            publicApi.getDoctors(),
            publicApi.getServices(),
            publicApi.getGallery(),
            publicApi.getTestimonials(),
            publicApi.getPage('home'),
          ]);
        setSettings(settingsRes.data);
        setDoctors(doctorsRes.data || []);
        setServices(servicesRes.data || []);
        setGallery(galleryRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setPage(pageRes.data);
      } catch (err) {
        console.error('[Home Page] Data fetching error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 border-4 border-navy border-t-green rounded-full animate-spin mb-4" />
        <h1 className="font-serif font-black text-navy text-xl tracking-wide">
          ANIKA HOMEOPATHIC CLINIC
        </h1>
        <p className="text-xs font-semibold text-green mt-1">
          Loading Clinical Records & 3D Environment...
        </p>
      </div>
    );
  }

  const chiefDoctor = doctors.find((d) => d.isChief) || doctors[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Automatic Welcome Announcement Popup with 3D glassmorphic styling */}
      <WelcomePopup
        settings={settings?.welcomePopup}
        clinicName={settings?.clinicName}
        logoUrl={settings?.logoUrl || '/logo.jpeg'}
      />

      <Navbar settings={settings} doctor={chiefDoctor} />

      {/* Floating Notification if recently booked */}
      {recentBookedToken && (
        <div className="bg-green text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <span>Active Appointment Queued: <strong>{recentBookedToken}</strong></span>
          <button
            onClick={() => setRecentBookedToken(null)}
            className="underline text-cream hover:text-white ml-2 text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-grow">
        {page && (
          <DynamicSectionRenderer
            blocks={page.blocks}
            settings={settings}
            doctors={doctors}
            services={services}
            gallery={gallery}
            testimonials={testimonials}
            onAppointmentBooked={(token) => setRecentBookedToken(token)}
          />
        )}
      </main>

      <Footer settings={settings} doctor={chiefDoctor} />
    </div>
  );
};
