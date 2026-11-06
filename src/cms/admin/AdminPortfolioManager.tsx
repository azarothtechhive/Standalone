// src/pages/admin/AdminPortfolioManager.tsx
import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Search, CheckCircle2, X, Save } from 'lucide-react';
import { useCMS } from '../CMSContext';
import { CmsPortfolio } from '../cmsService';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { ImageUpload } from '../../components/common/ImageUpload';

export const AdminPortfolioManager: React.FC = () => {
  const { portfolio, savePortfolio, deletePortfolio } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<CmsPortfolio> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredPortfolio = portfolio.filter((p) => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.industry.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingProject({
      name: '',
      slug: '',
      clientName: '',
      clientType: 'Enterprise',
      industry: 'Logistics',
      category: 'Cloud Engineering',
      summary: '',
      challenge: '',
      solution: '',
      outcomes: ['Zero downtime during transition', '50% reduction in processing latency'],
      technologies: ['Kubernetes', 'Go', 'Kafka', 'PostgreSQL'],
      coverImage: '/images/portfolio/project-1.jpg',
      isFeatured: true,
      order: portfolio.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: CmsPortfolio) => {
    setEditingProject({ ...proj });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove case study "${name}"?`)) {
      try {
        await deletePortfolio(id);
        setNotification(`Case study "${name}" removed.`);
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.name || !editingProject?.slug) {
      alert('Project name and slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      await savePortfolio(editingProject);
      setIsModalOpen(false);
      setEditingProject(null);
      setNotification(`Case study "${editingProject.name}" saved successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: 'clamp(1rem, 2vw, 2rem)', padding: 'clamp(0.5rem, 1vw, 0)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} color={adminColors.indigo.text} />
            </div>
            Case Studies & Portfolio
          </h1>
          <p style={{ fontSize: '0.875rem', color: adminColors.slate.textMuted, marginTop: '0.5rem', marginLeft: '3.25rem' }}>
            Manage client enterprise success stories, architecture solutions, and measurable project outcomes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={adminStyles.primaryButton}
        >
          <Plus size={18} /> Add Case Study
        </button>
      </div>

      {notification && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', backgroundColor: adminColors.emerald.light, border: `1px solid ${adminColors.emerald.border}`, borderRadius: '10px', color: adminColors.emerald.text, marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} color={adminColors.emerald.base} /> {notification}
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: adminColors.slate.card, padding: '0.875rem 1.25rem', borderRadius: '10px', border: `1px solid ${adminColors.slate.border}`, marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <Search size={18} color={adminColors.slate.textLight} />
        <input
          type="text"
          placeholder="Search case studies by name, client, or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: adminColors.slate.textPrimary, fontSize: '0.875rem', outline: 'none' }}
        />
      </div>

      {/* Portfolio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {filteredPortfolio.length === 0 ? (
          <div style={{ gridColumn: 'span 3', padding: '3.5rem', textAlign: 'center', color: adminColors.slate.textMuted, backgroundColor: adminColors.slate.card, borderRadius: '12px', border: `1px dashed ${adminColors.slate.borderStrong}` }}>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: adminColors.slate.textSecondary }}>No case studies found. Click "Add Case Study" above to create one.</p>
          </div>
        ) : (
          filteredPortfolio.map((proj) => (
            <div
              key={proj.id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: adminColors.indigo.text }}>{proj.clientName}</span>
                  <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: adminColors.slate.cardMuted, border: `1px solid ${adminColors.slate.borderLight}`, color: adminColors.slate.textSecondary }}>
                    {proj.industry}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: '0 0 0.5rem' }}>{proj.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, margin: '0 0 1rem', lineHeight: 1.5 }}>{proj.summary}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '1rem' }}>
                <button
                  onClick={() => handleOpenEdit(proj)}
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
                  onClick={() => handleDelete(proj.id, proj.name)}
                  style={{
                    ...adminStyles.dangerButton,
                    padding: '0.35rem 0.55rem',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && editingProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${adminColors.slate.border}`, borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: `1px solid ${adminColors.slate.borderLight}`, paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0 }}>
                {editingProject.id ? `Edit Case Study: ${editingProject.name}` : 'New Case Study'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: adminColors.slate.textMuted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>Project Name</label>
                  <input
                    type="text"
                    required
                    value={editingProject.name || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Slug</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    style={{ ...adminStyles.input, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={adminStyles.label}>Client Organization</label>
                  <input
                    type="text"
                    value={editingProject.clientName || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
                <div>
                  <label style={adminStyles.label}>Industry Domain</label>
                  <input
                    type="text"
                    value={editingProject.industry || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })}
                    style={adminStyles.input}
                  />
                </div>
              </div>

              <div>
                <label style={adminStyles.label}>Executive Summary</label>
                <textarea
                  rows={3}
                  value={editingProject.summary || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  style={adminStyles.textarea}
                />
              </div>

              <div>
                <label style={adminStyles.label}>The Technical Challenge</label>
                <textarea
                  rows={3}
                  value={editingProject.challenge || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                  style={adminStyles.textarea}
                />
              </div>

              <div>
                <label style={adminStyles.label}>The Engineered Solution</label>
                <textarea
                  rows={3}
                  value={editingProject.solution || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                  style={adminStyles.textarea}
                />
              </div>

              <div>
                <ImageUpload
                  value={editingProject.coverImage || ''}
                  onChange={(url) => setEditingProject({ ...editingProject, coverImage: url })}
                  label="Case Study Featured Image / Architecture Diagram"
                  description="Upload client case study imagery or topology diagram (PNG, JPG, WebP, SVG)"
                  aspectRatioHint="Recommended: 16:9 banner"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: `1px solid ${adminColors.slate.borderLight}`, paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={adminStyles.secondaryButton}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={adminStyles.primaryButton}>
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

