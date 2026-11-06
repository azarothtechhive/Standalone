// src/pages/admin/AdminInsightsManager.tsx
import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Save,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { useCMS } from '../CMSContext';
import { CmsInsight } from '../cmsService';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { ImageUpload } from '../../components/common/ImageUpload';

export const AdminInsightsManager: React.FC = () => {
  const { insights, saveInsight, deleteInsight } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<CmsInsight> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredInsights = insights.filter((i) => {
    return i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           i.authorName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingArticle({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '/images/insights/cover-default.jpg',
      authorName: 'Faizur Rahman',
      authorRole: 'Principal Solutions Architect',
      category: 'System Architecture',
      tags: ['Architecture', 'Engineering', 'Cloud'],
      sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'architecture', title: 'Architecture Pattern' },
        { id: 'takeaways', title: 'Key Takeaways' },
      ],
      readTime: '6 min read',
      isFeatured: true,
      status: 'PUBLISHED',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art: CmsInsight) => {
    setEditingArticle({ ...art });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove article "${title}"?`)) {
      try {
        await deleteInsight(id);
        setNotification(`Article "${title}" removed.`);
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.slug) {
      alert('Article title and slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      await saveInsight(editingArticle);
      setIsModalOpen(false);
      setEditingArticle(null);
      setNotification(`Article "${editingArticle.title}" saved successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: 'clamp(1rem, 2vw, 2rem)', padding: 'clamp(0.5rem, 1vw, 0)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color={adminColors.indigo.text} />
            </div>
            Technology Insights & Research Articles
          </h1>
          <p style={{ fontSize: '0.875rem', color: adminColors.slate.textMuted, marginTop: '0.5rem', marginLeft: '3.25rem' }}>
            Publish engineering whitepapers, architectural case notes, and technical articles to the Resource Hub.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={adminStyles.primaryButton}
        >
          <Plus size={18} /> Publish New Article
        </button>
      </div>

      {notification && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', backgroundColor: adminColors.emerald.light, border: `1px solid ${adminColors.emerald.border}`, borderRadius: '10px', color: adminColors.emerald.text, marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} color={adminColors.emerald.base} /> {notification}
        </div>
      )}

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: adminColors.slate.card,
          padding: '0.875rem 1.25rem',
          borderRadius: '10px',
          border: `1px solid ${adminColors.slate.border}`,
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Search size={18} color={adminColors.slate.textLight} />
        <input
          type="text"
          placeholder="Search articles by title, author, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: adminColors.slate.textPrimary, fontSize: '0.875rem', outline: 'none' }}
        />
      </div>

      {/* Articles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {filteredInsights.map((art) => (
          <div
            key={art.id}
            style={{
              backgroundColor: adminColors.slate.card,
              border: `1px solid ${adminColors.slate.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: adminColors.amber.light, border: `1px solid ${adminColors.amber.border}`, color: adminColors.amber.text }}>
                  {art.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {art.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                {art.title}
              </h3>

              <div style={{ fontSize: '0.75rem', color: adminColors.slate.textSecondary, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={13} color={adminColors.indigo.base} /> {art.authorName}  {art.authorRole}
              </div>

              <p style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, margin: '0 0 1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {art.excerpt}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {(art.tags || []).map((t, idx) => (
                  <span key={idx} style={{ fontSize: '0.6875rem', color: adminColors.slate.textSecondary, backgroundColor: adminColors.slate.cardMuted, border: `1px solid ${adminColors.slate.borderLight}`, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '1rem' }}>
              <a
                href={`/technology-insights/${art.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', fontWeight: 600, color: adminColors.indigo.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View article <ExternalLink size={12} />
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleOpenEdit(art)}
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
                  onClick={() => handleDelete(art.id, art.title)}
                  style={{
                    ...adminStyles.dangerButton,
                    padding: '0.35rem 0.55rem',
                  }}
                  title="Delete article"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingArticle && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${adminColors.slate.border}`, borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `1px solid ${adminColors.slate.borderLight}`, paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0 }}>
                {editingArticle.id ? `Edit Article: ${editingArticle.title}` : 'Publish New Article'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: adminColors.slate.textMuted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={adminStyles.label}>Article Title</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  style={adminStyles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.slug || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    style={{ ...adminStyles.input, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Category</label>
                  <input
                    type="text"
                    value={editingArticle.category || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>Author Name</label>
                  <input
                    type="text"
                    value={editingArticle.authorName || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, authorName: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Author Role</label>
                  <input
                    type="text"
                    value={editingArticle.authorRole || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, authorRole: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Read Time</label>
                  <input
                    type="text"
                    value={editingArticle.readTime || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
              </div>

              <div>
                <label style={adminStyles.label}>Short Excerpt</label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  style={adminStyles.textarea}
                />
              </div>

              <div>
                <label style={adminStyles.label}>Article Content (Full Text / Markdown)</label>
                <textarea
                  rows={8}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  style={{ ...adminStyles.textarea, fontFamily: 'monospace', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={adminStyles.label}>
                  Table of Contents Sections (one per line, e.g. "Architecture Pattern", "Key Takeaways")
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview&#10;Architecture Pattern&#10;Key Takeaways"
                  value={(editingArticle.sections || []).map((s: any) => typeof s === 'string' ? s : s.title).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                    const sections = lines.map((title) => {
                      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return { id: id || `sec-${Date.now()}`, title };
                    });
                    setEditingArticle({ ...editingArticle, sections });
                  }}
                  style={{ ...adminStyles.textarea, fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={adminStyles.label}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(editingArticle.tags || []).join(', ')}
                  onChange={(e) => setEditingArticle({ ...editingArticle, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  style={adminStyles.input}
                />
              </div>

              <div>
                <ImageUpload
                  value={editingArticle.coverImage || ''}
                  onChange={(url) => setEditingArticle({ ...editingArticle, coverImage: url })}
                  label="Article Featured Cover Image"
                  description="Upload article banner or illustration (PNG, JPG, WebP, SVG)"
                  aspectRatioHint="Recommended: 16:9 banner"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={adminStyles.secondaryButton}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={adminStyles.primaryButton}>
                  <Save size={16} /> {isSaving ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

