import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Home } from './pages/Home';
import { Login } from './admin/pages/Login';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardOverview } from './admin/pages/DashboardOverview';
import { DoctorsManager } from './admin/pages/DoctorsManager';
import { VisualPageBuilder } from './admin/pages/VisualPageBuilder';
import { AppointmentsManager } from './admin/pages/AppointmentsManager';
import { ServicesManager } from './admin/pages/ServicesManager';
import { ClinicSettingsEditor } from './admin/pages/ClinicSettingsEditor';
import { GalleryManager } from './admin/pages/GalleryManager';
import { TestimonialsManager } from './admin/pages/TestimonialsManager';
import { WelcomePopupEditor } from './admin/pages/WelcomePopupEditor';
import { SecuritySettings } from './admin/pages/SecuritySettings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Clinical Website */}
        <Route path="/" element={<Home />} />

        {/* Admin Login Gateway */}
        <Route path="/admin/login" element={<Login />} />

        {/* Dynamic Authenticated Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="doctors" element={<DoctorsManager />} />
          <Route path="page-builder" element={<VisualPageBuilder />} />
          <Route path="settings" element={<ClinicSettingsEditor />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="welcome-popup" element={<WelcomePopupEditor />} />
          <Route path="appointments" element={<AppointmentsManager />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
