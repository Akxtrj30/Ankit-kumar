import React, { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../services/api';
import { DoctorProfile } from '../../types/schema';
import {
  UserPlus,
  Stethoscope,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  IndianRupee,
  Award,
  Sparkles,
  Upload,
  Search,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export const DoctorsManager: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorProfile | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const initialForm: Partial<DoctorProfile> = {
    name: '',
    designation: 'Homeopathic Physician & Consultant',
    qualification: 'BHMS',
    specialization: 'Classical Homeopathy & Chronic Care',
    experienceYears: '5+ Years',
    college: 'R. B. T. S. Govt. Homeopathic Medical College & Hospital',
    collegeLocation: 'Muzaffarpur, Bihar',
    registrationNumber: '',
    nchRegistrationNumber: '',
    ministry: 'Ministry of AYUSH, Govt. of India',
    bio: '',
    consultationFee: '₹300',
    availableDays: 'Monday to Saturday',
    availableTimings: '09:00 AM – 02:00 PM & 03:00 PM – 08:00 PM',
    phone: '+91 9122999656',
    email: 'info@anikahomeopathy.com',
    imageUrl: '',
    isActive: true,
    isChief: false,
    orderIndex: 0,
  };

  const [formData, setFormData] = useState<Partial<DoctorProfile>>(initialForm);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDoctors();
      setDoctors(res.data || []);
    } catch (err: any) {
      console.error('Failed to load doctors:', err);
      setFeedback({ type: 'error', message: 'Failed to load doctors list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      ...initialForm,
      orderIndex: doctors.length,
    });
    setShowModal(true);
  };

  const openEditModal = (doc: DoctorProfile) => {
    setEditingDoctor(doc);
    setFormData({ ...doc });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  const handleToggleStatus = async (doctor: DoctorProfile) => {
    try {
      const updated = { ...doctor, isActive: !doctor.isActive };
      await adminApi.updateDoctor(doctor._id, updated);
      setFeedback({
        type: 'success',
        message: `${doctor.name} is now ${updated.isActive ? 'active on the public website' : 'deactivated'}.`,
      });
      fetchDoctors();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      await adminApi.deleteDoctor(doctorToDelete._id);
      setFeedback({ type: 'success', message: `${doctorToDelete.name} has been permanently deleted.` });
      setDoctorToDelete(null);
      fetchDoctors();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete doctor.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, WebP).' });
      if (target) target.value = '';
      return;
    }

    try {
      setUploadingPhoto(true);

      // Attempt 1: Upload to server API
      let uploadedUrl: string | null = null;
      try {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const res = await adminApi.uploadImage(uploadData);
        uploadedUrl = res.imageUrl || res.url || null;
      } catch (serverErr) {
        console.warn('Server upload not reachable or read-only, using resilient embedded image fallback:', serverErr);
      }

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl! }));
        setFeedback({ type: 'success', message: 'Doctor portrait uploaded and saved successfully!' });
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      // Attempt 2: Resilient client-side FileReader with canvas compression for mobile & serverless
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const rawResult = loadEvent.target?.result as string;
        if (!rawResult) {
          setFeedback({ type: 'error', message: 'Could not process image file.' });
          return;
        }

        // Optimize image size via canvas to avoid storage bloat (<400KB)
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setFormData((prev) => ({ ...prev, imageUrl: optimizedDataUrl }));
            setFeedback({ type: 'success', message: 'Doctor portrait embedded and ready to publish!' });
            setTimeout(() => setFeedback(null), 3000);
          } else {
            setFormData((prev) => ({ ...prev, imageUrl: rawResult }));
            setFeedback({ type: 'success', message: 'Doctor portrait loaded successfully!' });
            setTimeout(() => setFeedback(null), 3000);
          }
        };
        img.onerror = () => {
          setFormData((prev) => ({ ...prev, imageUrl: rawResult }));
          setFeedback({ type: 'success', message: 'Doctor portrait attached!' });
          setTimeout(() => setFeedback(null), 3000);
        };
        img.src = rawResult;
      };
      reader.onerror = () => {
        setFeedback({ type: 'error', message: 'Failed to read image. Please paste an image URL instead.' });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Image upload failed. You can paste an image URL instead.' });
    } finally {
      setUploadingPhoto(false);
      if (target) target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFeedback({ type: 'error', message: 'Doctor Full Name is required.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      if (editingDoctor) {
        await adminApi.updateDoctor(editingDoctor._id, formData);
        setFeedback({ type: 'success', message: `Profile for ${formData.name} successfully updated!` });
      } else {
        await adminApi.createDoctor(formData);
        setFeedback({ type: 'success', message: `New doctor ${formData.name} added and published!` });
      }
      closeModal();
      fetchDoctors();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save doctor.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.qualification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-green" /> Medical Staff & Doctors
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Doctor Profiles & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Add multiple homeopathic physicians. Active doctors appear automatically on the public website.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Doctor</span>
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
          {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Search doctors by name, specialization, or qualification..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Doctors Grid / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-navy border-t-green rounded-full animate-spin" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream text-navy flex items-center justify-center mx-auto">
            <Stethoscope className="w-8 h-8 text-green" />
          </div>
          <h3 className="text-lg font-serif font-bold text-navy">No Doctor Profiles Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchTerm
              ? 'No doctors match your search query.'
              : 'No doctors are currently added. Click "Add New Doctor" to publish a physician.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-green text-white text-xs font-bold rounded-xl hover:bg-green-dark"
          >
            Add First Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className={`bg-white rounded-3xl border p-6 shadow-xs transition-all relative flex flex-col justify-between ${
                doc.isActive ? 'border-gray-200/90' : 'border-dashed border-gray-300 opacity-70 bg-gray-50/50'
              }`}
            >
              <div>
                {/* Top Badges & Actions */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        doc.isActive
                          ? 'bg-green/10 text-green-dark border border-green/20'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {doc.isActive ? <CheckCircle2 className="w-3 h-3 text-green" /> : <XCircle className="w-3 h-3" />}
                      <span>{doc.isActive ? 'Active on Website' : 'Deactivated'}</span>
                    </span>

                    {doc.isChief && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" /> Chief Physician
                      </span>
                    )}
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(doc)}
                      title="Edit Doctor Details"
                      className="p-2 text-navy/70 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(doc)}
                      title={doc.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        doc.isActive
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-green hover:bg-green/10'
                      }`}
                    >
                      {doc.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDoctorToDelete(doc)}
                      title="Delete Doctor"
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cream border border-navy/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {doc.imageUrl ? (
                      <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-navy font-serif font-black text-xl">
                        {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-serif font-bold text-navy truncate">
                      {doc.name}
                    </h2>
                    <p className="text-xs font-semibold text-green">
                      {doc.qualification} • {doc.specialization}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {doc.designation} ({doc.experienceYears})
                    </p>
                  </div>
                </div>

                {/* Credentials & Details Box */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-gray-200/80 text-[11px] space-y-1.5 mb-4 text-navy/80">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">College:</span>
                    <span className="font-semibold text-right truncate max-w-[200px]">{doc.college}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Reg Numbers:</span>
                    <span className="font-mono font-bold text-navy">
                      State: {doc.registrationNumber} | NCH: {doc.nchRegistrationNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Consultation Fee:</span>
                    <span className="font-bold text-green">{doc.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Available Days:</span>
                    <span className="font-medium text-navy">{doc.availableDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Timings:</span>
                    <span className="font-medium text-navy">{doc.availableTimings}</span>
                  </div>
                </div>

                {/* Short Bio */}
                {doc.bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 italic mb-4">
                    "{doc.bio}"
                  </p>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-green" /> {doc.phone || 'Clinic Desk'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-navy" /> {doc.email || 'Direct'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT DOCTOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-green-light" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-cream">
                    {editingDoctor ? `Edit Profile: ${editingDoctor.name}` : 'Add New Doctor to Clinic'}
                  </h2>
                  <p className="text-[11px] text-cream/70">
                    All fields will be saved directly to the database and updated on the public site.
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-cream/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                <div className="w-20 h-20 rounded-2xl bg-white border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block font-bold text-navy uppercase tracking-wider">
                    Doctor Portrait Photo (Upload or URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className={`px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shadow-xs ${uploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                      <Upload className="w-3.5 h-3.5 text-green" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingPhoto}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. /assets/uploads/...)"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  {uploadingPhoto && (
                    <div className="flex items-center gap-2 text-xs text-green font-semibold animate-pulse">
                      <div className="w-3.5 h-3.5 border-2 border-green border-t-transparent rounded-full animate-spin" />
                      <span>Uploading photograph to clinic storage...</span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Recommended: Square format (1:1), clear professional headshot.
                  </p>
                </div>
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ankit Kumar"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Qualifications * (e.g. BHMS, MD)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHMS (Gold Medalist)"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Homeopathic Physician"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chronic Diseases & Skin Disorders"
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Clinical Experience (Years)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6+ Years"
                    value={formData.experienceYears || ''}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Consultation Fee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹300 (First Visit)"
                    value={formData.consultationFee || ''}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-green"
                  />
                </div>
              </div>

              {/* Statutory Registrations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Medical College / Institution
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R. B. T. S. Govt. Homeopathic Medical College"
                    value={formData.college || ''}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Muzaffarpur, Bihar"
                    value={formData.collegeLocation || ''}
                    onChange={(e) => setFormData({ ...formData, collegeLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    State Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36822"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    NCH (National Commission) Reg Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NRH/0107331"
                    value={formData.nchRegistrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, nchRegistrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* Timings and Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Available Days
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monday to Saturday"
                    value={formData.availableDays || ''}
                    onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Available Timings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM – 02:00 PM & 03:00 PM – 08:00 PM"
                    value={formData.availableTimings || ''}
                    onChange={(e) => setFormData({ ...formData, availableTimings: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Direct Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9122999656"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. dr.ankit@anikahomeopathy.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Short Biography */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Short Clinical Biography & Treatment Approach
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe educational background, clinical philosophy, classical approach, cases treated..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3.5 border rounded-xl text-sm"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green rounded"
                  />
                  <span className="font-bold text-navy">
                    Active & Displayed on Public Website
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isChief || false}
                    onChange={(e) => setFormData({ ...formData, isChief: e.target.checked })}
                    className="w-4 h-4 text-green rounded"
                  />
                  <span className="font-bold text-navy">
                    Chief Homeopathic Physician
                  </span>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Publish New Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy">
              Permanently Delete Doctor Profile?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-navy">{doctorToDelete.name}</span>? This will immediately remove their profile, qualifications, and timings from the clinic website.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDoctorToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDoctor}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
