// src/pages/admin/AdminTestimonialsManager.tsx
import React, { useState } from 'react';
import { MessageSquareQuote, Plus, Edit2, Trash2, CheckCircle2, X, Save, Star } from 'lucide-react';
import { useCMS } from '../CMSContext';
import { CmsTestimonial } from '../cmsService';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { ImageUpload } from '../../components/common/ImageUpload';

export const AdminTestimonialsManager: React.FC = () => {
  const { testimonials, saveTestimonial, deleteTestimonial } = useCMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<CmsTestimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingTestimonial({
      clientName: '',
      role: 'VP of Engineering',
      organization: '',
      quote: '',
      rating: 5,
      avatarUrl: '/images/testimonials/avatar-default.jpg',
      isFeatured: true,
      order: testimonials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: CmsTestimonial) => {
    setEditingTestimonial({ ...t });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete review from "${name}"?`)) {
      try {
        await deleteTestimonial(id);
        setNotification(`Testimonial removed.`);
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.clientName || !editingTestimonial?.quote) {
      alert('Client name and quote are required.');
      return;
    }

    setIsSaving(true);
    try {
      await saveTestimonial(editingTestimonial);
      setIsModalOpen(false);
      setEditingTestimonial(null);
      setNotification(`Review from "${editingTestimonial.clientName}" saved!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1rem, 2vw, 2rem)', padding: 'clamp(0.5rem, 1vw, 0)', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: adminColors.amber.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquareQuote size={22} color={adminColors.amber.text} />
            </div>
            Client Testimonials & Endorsements
          </h1>
          <p style={{ fontSize: '0.875rem', color: adminColors.slate.textMuted, marginTop: '0.5rem', marginLeft: '3.25rem' }}>
            Manage verified client reviews and executive endorsements featured across the site.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={adminStyles.warningButton}
        >
          <Plus size={18} /> Add Review
        </button>
      </div>

      {notification && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', backgroundColor: adminColors.emerald.light, border: `1px solid ${adminColors.emerald.border}`, borderRadius: '10px', color: adminColors.emerald.text, marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} color={adminColors.emerald.base} /> {notification}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        {testimonials.map((t) => (
          <div key={t.id} style={{ backgroundColor: adminColors.slate.card, border: `1px solid ${adminColors.slate.border}`, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={16} fill={adminColors.amber.base} color={adminColors.amber.base} />
                ))}
              </div>
              <p style={{ fontSize: '0.875rem', color: adminColors.slate.textSecondary, fontStyle: 'italic', margin: '0 0 1rem', lineHeight: 1.6 }}>
                "{t.quote}"
              </p>
              <div style={{ borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>{t.clientName}</div>
                <div style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>{t.role}  {t.organization}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '0.75rem' }}>
              <button
                onClick={() => handleOpenEdit(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  backgroundColor: adminColors.indigo.light,
                  border: `1px solid ${adminColors.indigo.border}`,
                  color: adminColors.indigo.text,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(t.id, t.clientName)}
                style={{
                  ...adminStyles.dangerButton,
                  padding: '0.35rem 0.55rem',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingTestimonial && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${adminColors.slate.border}`, borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `1px solid ${adminColors.slate.borderLight}`, paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0 }}>
                {editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: adminColors.slate.textMuted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={adminStyles.label}>Client Full Name</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.clientName || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                  style={adminStyles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>Role / Title</label>
                  <input
                    type="text"
                    value={editingTestimonial.role || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Company Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.organization || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, organization: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
              </div>

              <div>
                <label style={adminStyles.label}>Endorsement Quote</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  style={adminStyles.textarea}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>Star Rating (1-5)</label>
                  <select
                    value={editingTestimonial.rating ?? 5}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                    style={adminStyles.input}
                  >
                    <option value={5}>5 Stars â˜…â˜…â˜…â˜…â˜…</option>
                    <option value={4}>4 Stars â˜…â˜…â˜…â˜…â˜†</option>
                    <option value={3}>3 Stars â˜…â˜…â˜…â˜†â˜†</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingTestimonial.verified ?? true}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, verified: e.target.checked })}
                    />
                    Verified Client
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingTestimonial.isFeatured ?? true}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isFeatured: e.target.checked })}
                    />
                    Featured on Home
                  </label>
                </div>
              </div>

              <div>
                <ImageUpload
                  value={editingTestimonial.avatarUrl || ''}
                  onChange={(url) => setEditingTestimonial({ ...editingTestimonial, avatarUrl: url })}
                  label="Client Profile Avatar"
                  description="Upload client headshot or photo (PNG, JPG, WebP)"
                  aspectRatioHint="Recommended: 1:1 square avatar"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={adminStyles.secondaryButton}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={adminStyles.warningButton}>
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

