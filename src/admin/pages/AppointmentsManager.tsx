import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Appointment } from '../../types/schema';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Filter,
  Check,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const AppointmentsManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await adminApi.getAppointments({ search, status: statusFilter });
      setAppointments(res.data || []);
    } catch (err: any) {
      if (err?.status !== 401) {
        console.warn('Could not fetch appointments:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateAppointment(id, { status: newStatus });
      setToast(`Appointment updated to ${newStatus}`);
      setTimeout(() => setToast(null), 3000);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNote(true);
    try {
      await adminApi.updateAppointment(selectedApp._id, { adminNotes: notesInput });
      setSelectedApp(null);
      setToast('Doctor clinical notes saved successfully.');
      setTimeout(() => setToast(null), 3000);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" /> Patient Queues & Consultation Registry
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
              Appointment Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review consultation requests, search by AHC token, update patient status, or document clinical notes.
            </p>
          </div>

          <div className="text-xs font-semibold text-gray-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-gray-200">
            Total Displayed: <strong className="text-navy">{appointments.length}</strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference token (AHC-...), patient name, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:inline-block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed Slots</option>
              <option value="Completed">Completed Treatments</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-green/10 border border-green/30 text-green-dark rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Appointments Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200 text-gray-600 text-xs font-bold uppercase">
                <th className="py-3.5 px-4">Ref Token</th>
                <th className="py-3.5 px-4">Patient Information</th>
                <th className="py-3.5 px-4">Scheduled Slot</th>
                <th className="py-3.5 px-4">Symptoms / Reason</th>
                <th className="py-3.5 px-4">Clinical Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    Loading clinical consultation records...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    No clinical appointment entries matching search criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy whitespace-nowrap">
                      {app.referenceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{app.patientName}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-green" />
                        <a href={`tel:${app.mobileNumber}`} className="hover:underline">
                          {app.mobileNumber}
                        </a>
                        <span>• {app.age} yrs</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-navy">{app.preferredDate}</p>
                      <p className="text-[11px] text-gray-500">{app.preferredTimeSlot}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-gray-700" title={app.reasonForConsultation}>
                        {app.reasonForConsultation}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {app.adminNotes ? (
                        <p
                          onClick={() => {
                            setSelectedApp(app);
                            setNotesInput(app.adminNotes);
                          }}
                          className="line-clamp-1 text-green text-[11px] font-medium bg-green/5 p-1.5 rounded-lg border border-green/20 cursor-pointer hover:bg-green/10"
                          title="Click to edit notes"
                        >
                          {app.adminNotes}
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setNotesInput('');
                          }}
                          className="text-[11px] text-gray-400 hover:text-navy flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Add note</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {app.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus(app._id, 'Confirmed')}
                          className="px-2.5 py-1 bg-green hover:bg-green-dark text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}

                      {app.status === 'Confirmed' && (
                        <button
                          onClick={() => updateStatus(app._id, 'Completed')}
                          className="px-2.5 py-1 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Complete
                        </button>
                      )}

                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => updateStatus(app._id, 'Cancelled')}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Clinical Notes Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-green uppercase tracking-wider">
                  Clinical Case Notes
                </span>
                <h3 className="text-base font-serif font-black text-navy">
                  {selectedApp.patientName} ({selectedApp.referenceNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-navy text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-gray-600">
                <strong>Chief Complaint:</strong> {selectedApp.reasonForConsultation}
              </p>
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Doctor / Treatment Notes & Prescriptions
                </label>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Advised dietary restrictions, prescribed constitutional remedy, follow-up date..."
                  className="w-full p-3 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNote}
                className="px-5 py-1.5 bg-green hover:bg-green-dark text-white rounded-xl text-xs font-bold"
              >
                {savingNote ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
