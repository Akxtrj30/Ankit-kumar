import React, { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../services/api';
import { GalleryItem } from '../../types/schema';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

export const GalleryManager: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryItem | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialForm = {
    title: '',
    caption: '',
    category: 'Consultation & Clinic',
    imageUrl: '',
    orderIndex: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  const categories = [
    'Consultation & Clinic',
    'Homeopathic Pharmacy',
    'Doctor & Patient Care',
    'Medicines & Herbal Preparations',
    'Infrastructure & Facilities',
  ];

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getGallery();
      setItems(res.data || []);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to fetch gallery photos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialForm,
      orderIndex: items.length,
    });
    setShowModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      caption: item.caption || '',
      category: item.category,
      imageUrl: item.imageUrl,
      orderIndex: item.orderIndex,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await adminApi.uploadImage(uploadData);
      const uploadedUrl = res.imageUrl || res.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        setFeedback({ type: 'success', message: 'Photograph uploaded successfully!' });
        setTimeout(() => setFeedback(null), 2500);
      } else {
        setFeedback({ type: 'error', message: 'Upload succeeded but no image URL was returned.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload image file.' });
    } finally {
      setUploadingPhoto(false);
      if (target) target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Photo title is required.' });
      return;
    }
    if (!formData.imageUrl.trim()) {
      setFeedback({ type: 'error', message: 'Photo image URL or uploaded file is required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      if (editingItem) {
        // Edit existing photograph
        await adminApi.updateGalleryItem(editingItem._id, formData);
        setFeedback({ type: 'success', message: `Photograph "${formData.title}" updated successfully!` });
      } else {
        // Create new photograph
        await adminApi.createGalleryItem({
          ...formData,
          orderIndex: items.length,
        });
        setFeedback({ type: 'success', message: 'New clinic photograph added to gallery!' });
      }
      closeModal();
      fetchGallery();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save photograph.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    try {
      await adminApi.deleteGalleryItem(photoToDelete._id);
      setFeedback({ type: 'success', message: `Photograph "${photoToDelete.title}" deleted from gallery.` });
      setPhotoToDelete(null);
      fetchGallery();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete photo.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-green" /> Practice Photographs
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Clinic Photographs & Gallery
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Add, edit, or delete photos of the clinic chambers, dispensary, pharmacy, and patient amenities.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
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
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-navy border-t-green rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream text-navy flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-green" />
          </div>
          <h3 className="text-lg font-serif font-bold text-navy">No Photographs in Gallery</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Upload photographs of Anika Homeopathic Clinic to display them on the public gallery section.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-green text-white text-xs font-bold rounded-xl hover:bg-green-dark"
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs group flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-navy/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {item.category}
                </span>

                {/* Edit & Delete Action Buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 bg-white/95 text-navy rounded-lg hover:bg-white transition-colors shadow-sm cursor-pointer"
                    title="Edit Photo Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPhotoToDelete(item)}
                    className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-sm font-serif font-bold text-navy truncate">{item.title}</h3>
                {item.caption && (
                  <p className="text-xs text-gray-500 line-clamp-2">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-cream">
                {editingItem ? `Edit Photograph: ${editingItem.title}` : 'Add Clinic Photograph'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-cream/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {/* Photo Preview if image exists */}
              {formData.imageUrl && (
                <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-100 border border-gray-200">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px]">
                    Current Image
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Consultation Chamber"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Upload Photo or Paste URL *
                </label>
                <div className="space-y-2">
                  <label className={`w-full px-3 py-2 bg-slate-50 border border-dashed border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-2 ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-4 h-4 text-green" />
                    <span>{uploadingPhoto ? 'Uploading image...' : 'Select File from Computer'}</span>
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
                    required
                    placeholder="Or enter image URL (e.g. /assets/uploads/...)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                {uploadingPhoto && (
                  <p className="text-xs text-green font-semibold mt-1 animate-pulse">
                    Uploading image file to clinic storage...
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief context or description of this clinic photograph..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
                  className="px-5 py-2 bg-green text-white font-bold rounded-xl hover:bg-green-dark disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Photograph' : 'Add Photograph'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE PHOTO MODAL */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy">
              Delete Clinic Photograph?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-navy">"{photoToDelete.title}"</span>? This will remove the photograph from the public clinic gallery.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePhoto}
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
