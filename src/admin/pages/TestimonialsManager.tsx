import React, { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../services/api';
import { TestimonialItem } from '../../types/schema';
import {
  MessageSquareQuote,
  Star,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  X,
  Edit2,
} from 'lucide-react';

export const TestimonialsManager: React.FC = () => {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    patientName: '',
    location: '',
    conditionTreated: '',
    rating: 5,
    review: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    isApproved: true,
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTestimonials();
      setItems(res.data || []);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to fetch testimonials.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      patientName: '',
      location: 'Begusarai, Bihar',
      conditionTreated: 'Chronic Skin Allergy & Eczema',
      rating: 5,
      review: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isApproved: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData({
      patientName: item.patientName,
      location: item.location,
      conditionTreated: item.conditionTreated,
      rating: item.rating,
      review: item.review,
      date: item.date,
      isApproved: item.isApproved,
    });
    setShowModal(true);
  };

  const handleToggleApprove = async (item: TestimonialItem) => {
    try {
      const updated = { ...item, isApproved: !item.isApproved };
      await adminApi.updateTestimonial(item._id, updated);
      setFeedback({
        type: 'success',
        message: `Review by ${item.patientName} is now ${updated.isApproved ? 'published on the website' : 'hidden'}.`,
      });
      fetchTestimonials();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update testimonial.' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await adminApi.deleteTestimonial(id);
      setFeedback({ type: 'success', message: 'Testimonial deleted.' });
      fetchTestimonials();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete testimonial.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.review.trim()) {
      alert('Patient name and review text are required.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      if (editingItem) {
        await adminApi.updateTestimonial(editingItem._id, formData);
        setFeedback({ type: 'success', message: 'Testimonial updated successfully!' });
      } else {
        await adminApi.createTestimonial(formData);
        setFeedback({ type: 'success', message: 'New patient testimonial added!' });
      }
      setShowModal(false);
      fetchTestimonials();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save testimonial.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy font-bold text-xs uppercase tracking-wider mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5 text-green" /> Patient Recovery Stories
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy">
            Patient Testimonials & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage real patient feedback, star ratings, and cured chronic case stories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-green hover:bg-green-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Testimonial</span>
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
            <MessageSquareQuote className="w-8 h-8 text-green" />
          </div>
          <h3 className="text-lg font-serif font-bold text-navy">No Patient Testimonials Added</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Add patient recovery feedback to build trust on the public website.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-green text-white text-xs font-bold rounded-xl hover:bg-green-dark"
          >
            Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between ${
                item.isApproved ? 'border-gray-200' : 'border-dashed border-amber-300 bg-amber-50/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleApprove(item)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        item.isApproved
                          ? 'text-green hover:bg-green/10'
                          : 'text-amber-600 hover:bg-amber-100'
                      }`}
                      title={item.isApproved ? 'Approved & Visible' : 'Hidden / Unapproved'}
                    >
                      {item.isApproved ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.patientName)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-navy/80 italic line-clamp-4 mb-4">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <div>
                  <h4 className="font-bold text-navy">{item.patientName}</h4>
                  <p className="text-gray-500">{item.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-green font-semibold block">{item.conditionTreated}</span>
                  <span className="text-gray-400 text-[10px]">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-cream">
                {editingItem ? 'Edit Testimonial' : 'Add Patient Testimonial'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-cream/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Sah"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Begusarai, Bihar"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Health Condition Treated
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chronic Asthma / Skin Allergy"
                    value={formData.conditionTreated}
                    onChange={(e) => setFormData({ ...formData, conditionTreated: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Patient Review / Recovery Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe patient's feedback on homeopathic consultation, relief, duration of cure..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full p-3 border rounded-xl text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  className="w-4 h-4 text-green rounded"
                />
                <span className="font-bold text-navy">
                  Approved & Display on Public Website
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-green text-white font-bold rounded-xl hover:bg-green-dark"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Review' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
