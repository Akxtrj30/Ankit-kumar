import React, { useState, useEffect } from 'react';
import { publicApi, adminApi } from '../../services/api';
import { ClinicSettings, ClinicPillar } from '../../types/schema';
import {
  Settings,
  Save,
  Check,
  Building,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Upload,
  IndianRupee,
  Info,
  Bell,
  Share2,
  Plus,
  Trash2,
} from 'lucide-react';

export const ClinicSettingsEditor: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'timings' | 'about' | 'announcement'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await publicApi.getSettings();
        setSettings(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (!file || !settings) return;
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await adminApi.uploadImage(uploadData);
      const uploadedUrl = res.imageUrl || res.url;
      if (uploadedUrl) {
        setSettings({ ...settings, logoUrl: uploadedUrl });
        setMessage('Logo uploaded successfully! Click "Save Changes" to apply.');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage('Failed to upload logo.');
    } finally {
      if (target) target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.updateSettings(settings);
      setMessage('Clinic settings and configuration successfully updated!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to persist settings changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPillar = () => {
    if (!settings) return;
    const currentPillars = settings.about?.pillars || [];
    setSettings({
      ...settings,
      about: {
        ...settings.about,
        pillars: [...currentPillars, { title: 'Holistic Modality', description: 'Personalized therapeutic regimen.' }],
      },
    });
  };

  const handleRemovePillar = (index: number) => {
    if (!settings) return;
    const updated = [...(settings.about?.pillars || [])];
    updated.splice(index, 1);
    setSettings({
      ...settings,
      about: { ...settings.about, pillars: updated },
    });
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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5 text-green" /> Practice Metadata & CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Clinic Settings & Front Page Content
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Edit clinic branding, contact channels, About Us section, consultation fees, and emergency notices.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green/10 border border-green/30 text-green-dark rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'general'
              ? 'bg-navy text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Clinic Branding & Contacts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'timings'
              ? 'bg-navy text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          OPD Hours & Consultation Fees
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'about'
              ? 'bg-navy text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          About Us Section & Pillars
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'announcement'
              ? 'bg-navy text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Notice & Announcement Banner
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: General & Contact */}
        {activeTab === 'general' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Building className="w-5 h-5 text-green" />
              <h2 className="text-lg font-serif font-bold text-navy">Clinic Brand & Contact Coordinates</h2>
            </div>

            {/* Logo Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-300 p-2 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={settings.logoUrl || '/logo.jpeg'}
                  alt="Clinic Logo Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <label className="block font-bold text-navy uppercase tracking-wider">
                  Clinic Logo (Applied in 3D Hero, Navbar, Footer, and Popup)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-green" /> Upload New Logo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl || '/logo.jpeg'}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Default: /logo.jpeg (High-resolution blue & emerald 3D emblem).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Clinic Official Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Tagline (Hindi)
                </label>
                <input
                  type="text"
                  value={settings.taglineHindi}
                  onChange={(e) => setSettings({ ...settings, taglineHindi: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Tagline (English)
                </label>
                <input
                  type="text"
                  value={settings.taglineEnglish}
                  onChange={(e) => setSettings({ ...settings, taglineEnglish: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Calling Telephone / Mobile *
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  WhatsApp Hotline Number *
                </label>
                <input
                  type="text"
                  required
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="font-serif font-bold text-sm text-navy">Physical Practice Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">Street & Ward</label>
                  <input
                    type="text"
                    value={settings.address.street}
                    onChange={(e) => setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">Municipality / Bazar</label>
                  <input
                    type="text"
                    value={settings.address.municipality}
                    onChange={(e) => setSettings({ ...settings, address: { ...settings.address, municipality: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">District</label>
                  <input
                    type="text"
                    value={settings.address.district}
                    onChange={(e) => setSettings({ ...settings, address: { ...settings.address, district: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    value={settings.address.state}
                    onChange={(e) => setSettings({ ...settings, address: { ...settings.address, state: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">Postal Pincode</label>
                  <input
                    type="text"
                    value={settings.address.pincode}
                    onChange={(e) => setSettings({ ...settings, address: { ...settings.address, pincode: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1 text-xs">
                  Google Maps Embed URL / Location Link
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={settings.address.googleMapsEmbedUrl || ''}
                  onChange={(e) => setSettings({ ...settings, address: { ...settings.address, googleMapsEmbedUrl: e.target.value } })}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="font-serif font-bold text-sm text-navy">Social Media Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagram || ''}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={settings.facebook || ''}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={settings.youtube || ''}
                    onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Timings & Consultation Fees */}
        {activeTab === 'timings' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Clock className="w-5 h-5 text-green" />
              <h2 className="text-lg font-serif font-bold text-navy">OPD Timings & Consultation Fees</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Morning OPD Session
                </label>
                <input
                  type="text"
                  value={settings.timings.morning}
                  onChange={(e) => setSettings({ ...settings, timings: { ...settings.timings, morning: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Evening OPD Session
                </label>
                <input
                  type="text"
                  value={settings.timings.evening}
                  onChange={(e) => setSettings({ ...settings, timings: { ...settings.timings, evening: e.target.value } })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Consultation Fees Section */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="font-serif font-bold text-sm text-navy flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-green" /> Consultation Fees & Medicines Policy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    First / New Patient Consultation Fee
                  </label>
                  <input
                    type="text"
                    value={settings.consultationFee?.firstVisit || '₹300'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        consultationFee: {
                          ...settings.consultationFee,
                          firstVisit: e.target.value,
                          followUp: settings.consultationFee?.followUp || '₹200',
                          medicinePolicy: settings.consultationFee?.medicinePolicy || 'Genuine German & SBL remedies included or dispensed at nominal cost',
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-green"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Follow-Up Consultation Fee
                  </label>
                  <input
                    type="text"
                    value={settings.consultationFee?.followUp || '₹200'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        consultationFee: {
                          ...settings.consultationFee,
                          firstVisit: settings.consultationFee?.firstVisit || '₹300',
                          followUp: e.target.value,
                          medicinePolicy: settings.consultationFee?.medicinePolicy || 'Genuine German & SBL remedies included or dispensed at nominal cost',
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-green"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Homeopathic Remedy & Dispensing Policy
                  </label>
                  <input
                    type="text"
                    value={settings.consultationFee?.medicinePolicy || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        consultationFee: {
                          ...settings.consultationFee,
                          firstVisit: settings.consultationFee?.firstVisit || '₹300',
                          followUp: settings.consultationFee?.followUp || '₹200',
                          medicinePolicy: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: About Us Section */}
        {activeTab === 'about' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Info className="w-5 h-5 text-green" />
              <h2 className="text-lg font-serif font-bold text-navy">About Us Section & Clinical Pillars</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  About Section Heading
                </label>
                <input
                  type="text"
                  value={settings.about?.heading || 'Root-Cause Homeopathy Tailored to You'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, heading: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Established Year
                </label>
                <input
                  type="text"
                  value={settings.about?.establishedYear || '2019'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, establishedYear: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={settings.about?.subheading || 'Evidence-informed classical Hahnemannian medicine in Begusarai, Bihar'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, subheading: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Detailed Clinic Story & Methodology
                </label>
                <textarea
                  rows={4}
                  value={settings.about?.description || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, description: e.target.value },
                    })
                  }
                  className="w-full p-3.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Pillars Editor */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-navy">Clinical Pillars & Distinctive Standards</h3>
                <button
                  type="button"
                  onClick={handleAddPillar}
                  className="px-3 py-1 bg-green/10 text-green font-bold text-xs rounded-lg hover:bg-green/20 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Pillar
                </button>
              </div>

              <div className="space-y-3">
                {(settings.about?.pillars || []).map((pillar, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Pillar Title"
                        value={pillar.title}
                        onChange={(e) => {
                          const updated = [...(settings.about?.pillars || [])];
                          updated[idx].title = e.target.value;
                          setSettings({ ...settings, about: { ...settings.about, pillars: updated } });
                        }}
                        className="px-3 py-1.5 border rounded-lg bg-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={pillar.description}
                        onChange={(e) => {
                          const updated = [...(settings.about?.pillars || [])];
                          updated[idx].description = e.target.value;
                          setSettings({ ...settings, about: { ...settings.about, pillars: updated } });
                        }}
                        className="sm:col-span-2 px-3 py-1.5 border rounded-lg bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePillar(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Announcement Banner */}
        {activeTab === 'announcement' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Bell className="w-5 h-5 text-green" />
              <h2 className="text-lg font-serif font-bold text-navy">Special Offers & Clinical Announcements</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-200">
              <div>
                <span className="font-bold text-navy text-sm block">Show Top Announcement Banner</span>
                <p className="text-[11px] text-gray-500">
                  Displays a prominent headline at the very top of all website pages.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcement?.isActive || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement: {
                        ...settings.announcement,
                        isActive: e.target.checked,
                        text: settings.announcement?.text || '',
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green"></div>
              </label>
            </div>

            <div>
              <label className="block font-bold text-navy uppercase tracking-wider mb-1.5 text-xs">
                Announcement Text / Health Camp Alert / Offer
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Free Health Checkup Camp this Sunday. Book early tokens via online form."
                value={settings.announcement?.text || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      isActive: settings.announcement?.isActive ?? true,
                      text: e.target.value,
                    },
                  })
                }
                className="w-full p-3.5 border rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Persisting Records...' : 'Save All Clinic & Front Page Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
