import React, { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../services/api';
import { ServiceItem } from '../../types/schema';
import {
  Activity,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

export const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await publicApi.getServices();
      setServices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenNew = () => {
    setEditingItem({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      orderIndex: services.length,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title?.trim()) return;

    setSaving(true);
    try {
      const slug =
        editingItem.slug ||
        editingItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingItem._id) {
        // Edit existing with updateService
        await adminApi.updateService(editingItem._id, { ...editingItem, slug });
        setToast('Clinical specialty updated successfully!');
      } else {
        // Create new
        await adminApi.createService({ ...editingItem, slug } as any);
        setToast('New clinical specialty added successfully!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setTimeout(() => setToast(null), 3000);
      fetchServices();
    } catch (err: any) {
      console.error(err);
      setToast(err.message || 'Failed to save clinical specialty.');
      setTimeout(() => setToast(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await adminApi.deleteService(serviceToDelete._id);
      setToast(`"${serviceToDelete.title}" has been deleted.`);
      setServiceToDelete(null);
      setTimeout(() => setToast(null), 3000);
      fetchServices();
    } catch (err: any) {
      console.error(err);
      setToast(err.message || 'Failed to delete service.');
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 text-green font-bold text-xs uppercase tracking-wider mb-2">
            <HeartPulse className="w-3.5 h-3.5" /> Practice Clinical Specialties
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Clinical Services & Treatments
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Add or curate specialized classical homeopathy treatments displayed on the public portal.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Clinical Area
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-green/10 border border-green/30 text-green-dark rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item, index) => (
          <div
            key={item._id}
            className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-cream text-navy flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </span>
                <span className="text-[10px] bg-green/10 text-green px-2 py-0.5 rounded-full font-bold">
                  {item.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>

              <h3 className="font-serif font-bold text-navy text-base mb-2">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{item.shortDescription}</p>
              {item.fullDescription && (
                <p className="text-[11px] text-gray-400 italic line-clamp-2 mb-4">
                  {item.fullDescription}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400">/{item.slug}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-navy cursor-pointer"
                  title="Edit service"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setServiceToDelete(item)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
                  title="Delete service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-lg font-serif font-black text-navy">
                {editingItem._id ? 'Edit Clinical Specialty' : 'Add New Clinical Specialty'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-navy text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                  Specialty Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Thyroid & Metabolic Disorders"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                  Short Clinical Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingItem.shortDescription || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, shortDescription: e.target.value })
                  }
                  placeholder="Constitutional homeopathy management addressing chronic root causes..."
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1.5">
                  Detailed Medical Overview (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editingItem.fullDescription || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, fullDescription: e.target.value })
                  }
                  placeholder="In-depth explanation of constitutional remedy selection and symptom recovery..."
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-green hover:bg-green-dark text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Specialty'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* IN-APP DELETE SERVICE MODAL */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy">
              Delete Clinical Specialty?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-navy">"{serviceToDelete.title}"</span>? This will remove this specialty and its details from the clinic's public website.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteService}
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
