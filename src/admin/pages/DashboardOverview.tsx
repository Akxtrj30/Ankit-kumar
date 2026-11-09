import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Appointment } from '../../types/schema';
import {
  CalendarCheck,
  ShieldCheck,
  Activity,
  Layers,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Stethoscope,
  Image as ImageIcon,
  MessageSquareQuote,
  Sparkles,
  Lock,
  UserPlus,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await adminApi.getAppointments();
      setAppointments(res.data || []);
    } catch (err: any) {
      if (err?.status !== 401) {
        console.warn('Could not load appointment stats:', err?.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateAppointment(id, { status });
      await loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-2">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Administrative Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Clinical Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Anika Homeopathic Clinic • Practice Portal & CMS Management
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/doctors"
            className="px-4 py-2 bg-green hover:bg-green-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Doctor
          </Link>
          <Link
            to="/admin/page-builder"
            className="px-4 py-2 bg-navy hover:bg-navy-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-green-light" /> Edit Homepage
          </Link>
          <Link
            to="/admin/welcome-popup"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Welcome Popup
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Bookings</p>
            <h2 className="text-2xl font-black text-navy">{appointments.length}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending Review</p>
            <h2 className="text-2xl font-black text-amber-600">{pendingCount}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green/10 text-green flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Confirmed Slots</p>
            <h2 className="text-2xl font-black text-green">{confirmedCount}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cream text-navy flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed Cases</p>
            <h2 className="text-2xl font-black text-navy">{completedCount}</h2>
          </div>
        </div>
      </div>

      {/* Quick Access Management Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/doctors"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-green hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-green/10 text-green flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-navy text-sm mb-1">Manage Doctors</h3>
          <p className="text-xs text-gray-500">Add physicians, edit credentials, fees, and schedules.</p>
        </Link>

        <Link
          to="/admin/page-builder"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-navy hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-navy text-sm mb-1">Edit Homepage</h3>
          <p className="text-xs text-gray-500">Customize blocks, headings, copy, and layout order.</p>
        </Link>

        <Link
          to="/admin/welcome-popup"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-navy text-sm mb-1">Welcome Popup</h3>
          <p className="text-xs text-gray-500">Edit Hindi headline, gold badge, and instant modal.</p>
        </Link>

        <Link
          to="/admin/security"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-navy hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-navy text-sm mb-1">Security & Password</h3>
          <p className="text-xs text-gray-500">Update bcrypt password and admin identity.</p>
        </Link>
      </div>

      {/* Doctor & NCH Statutory Credentials Box */}
      <div className="bg-gradient-to-r from-navy to-navy-dark text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-bold text-green-light uppercase tracking-wider">
              Statutory Practitioner Profile
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-cream mt-1">
              Dr. Ankit Kumar (BHMS)
            </h3>
            <p className="text-xs text-cream/70 mt-1">
              R B T S Government Homeopathic Medical College & Hospital, Muzaffarpur
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/15 text-xs space-y-1.5 text-cream/90">
            <p className="flex justify-between">
              <span className="text-cream/70">State Reg No:</span>
              <span className="font-mono font-bold text-white">36822</span>
            </p>
            <p className="flex justify-between">
              <span className="text-cream/70">National Commission (NCH):</span>
              <span className="font-mono font-bold text-green-light">NRH/0107331</span>
            </p>
            <p className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-cream/70">Governing Ministry:</span>
              <span className="font-semibold text-white">Ministry of AYUSH</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
            <Link
              to="/admin/doctors"
              className="px-4 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Manage All Doctors
            </Link>
            <Link
              to="/"
              target="_blank"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-cream rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Public Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Appointments Preview */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-navy">Recent Patient Consultation Requests</h2>
            <p className="text-xs text-gray-500">Live feed from public appointment booking engine</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-bold text-green hover:underline flex items-center gap-1"
          >
            <span>View All Records ({appointments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase font-bold">
                <th className="py-3 px-3">Token</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Preferred Slot</th>
                <th className="py-3 px-3">Doctor</th>
                <th className="py-3 px-3">Chief Complaint</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.slice(0, 5).map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-mono font-bold text-navy">{app.referenceNumber}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-navy">{app.patientName}</p>
                    <p className="text-[11px] text-gray-500">{app.mobileNumber} • {app.age} yrs</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-navy">{app.preferredDate}</p>
                    <p className="text-[11px] text-gray-500">{app.preferredTimeSlot}</p>
                  </td>
                  <td className="py-3 px-3 text-xs font-semibold text-green">
                    {app.preferredDoctorName || 'Chief Doctor'}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-gray-600" title={app.reasonForConsultation}>
                    {app.reasonForConsultation}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === 'Confirmed'
                          ? 'bg-green/10 text-green'
                          : app.status === 'Completed'
                          ? 'bg-navy/10 text-navy'
                          : app.status === 'Cancelled'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {app.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                        className="px-2.5 py-1 bg-green hover:bg-green-dark text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {app.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'Completed')}
                        className="px-2.5 py-1 bg-navy hover:bg-navy-dark text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
