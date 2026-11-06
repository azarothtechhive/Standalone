// src/pages/admin/AdminServicesManager.tsx
import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Save,
  Cpu,
  Compass,
  Users,
  Workflow,
  Shield,
  Activity
} from 'lucide-react';
import { useCMS } from '../CMSContext';
import { CmsService } from '../cmsService';

export const AdminServicesManager: React.FC = () => {
  const { services, saveService, deleteService } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<CmsService> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredServices = services.filter((s) => {
    return s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu size={24} color="#D4AF37" />;
      case 'Compass': return <Compass size={24} color="#D4AF37" />;
      case 'Users': return <Users size={24} color="#D4AF37" />;
      case 'Workflow': return <Workflow size={24} color="#D4AF37" />;
      case 'Shield': return <Shield size={24} color="#D4AF37" />;
      default: return <Activity size={24} color="#D4AF37" />;
    }
  };

  const handleOpenAdd = () => {
    setEditingService({
      title: '',
      slug: '',
      summary: 'Architecture & Modernization',
      description: '',
      iconName: 'Cpu',
      badge: 'Enterprise Core',
      capabilities: ['Technology Strategy', 'Architecture Modernization', 'Automated CI/CD'],
      processSteps: [
        { step: '01', title: 'Audit & Discovery', desc: 'Assess systems and debt.' },
        { step: '02', title: 'Architecture Blueprint', desc: 'Define target microservices topology.' },
        { step: '03', title: 'Continuous Delivery', desc: 'Zero-downtime deployment pipelines.' }
      ],
      metrics: { deliveryFocus: 'Architecture', typicalScope: 'Platform', outcome: 'Velocity' },
      status: 'PUBLISHED',
      order: services.length + 1,
      technologies: ['Kubernetes', 'TypeScript', 'Node.js', 'PostgreSQL'],
      industries: ['Enterprise', 'Fintech', 'Logistics'],
      ctaText: 'Request Consultation',
      ctaLink: '/connect-with-us'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (serv: CmsService) => {
    setEditingService({ ...serv });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove service "${title}"?`)) {
      try {
        await deleteService(id);
        setNotification(`Service "${title}" deleted.`);
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.slug) {
      alert('Service title and slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      await saveService(editingService);
      setIsModalOpen(false);
      setEditingService(null);
      setNotification(`Service "${editingService.title}" updated successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '0', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: 'clamp(1rem, 2vw, 2rem)', padding: 'clamp(0.5rem, 1vw, 0)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers color="#047857" /> Enterprise Services & Solutions
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.375rem' }}>
            Configure enterprise service pillars, deliverables, execution methodologies, and advisory options.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#047857',
            border: '1px solid #065F46',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
          }}
        >
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {notification && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#047857', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> {notification}
        </div>
      )}

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '1.5rem',
        }}
      >
        <Search size={18} color="#64748B" />
        <input
          type="text"
          placeholder="Search services by title, slug, or capabilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
        />
      </div>

      {/* Services List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {filteredServices.map((serv) => (
          <div
            key={serv.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.625rem', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857' }}>
                  {getServiceIcon(serv.iconName)}
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                  {serv.badge || 'Enterprise'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.375rem' }}>
                {serv.title}
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                /services#{serv.slug}
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.5 }}>
                {serv.description}
              </p>

              {/* Capabilities List */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Core Capabilities:</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {(serv.capabilities || []).slice(0, 4).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <button
                onClick={() => handleOpenEdit(serv)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={13} color="#18181B" /> Edit
              </button>
              <button
                onClick={() => handleDelete(serv.id, serv.title)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#FFE4E6',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
                title="Delete service"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingService && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingService.id ? `Edit Service: ${editingService.title}` : 'Add New Service Pillar'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Service Title</label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ''}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug || ''}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Icon Selection</label>
                <select
                  value={editingService.iconName || 'Cpu'}
                  onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                >
                  <option value="Cpu">Cpu (Architecture)</option>
                  <option value="Compass">Compass (Advisory)</option>
                  <option value="Users">Users (Workforce Pods)</option>
                  <option value="Workflow">Workflow (Automation)</option>
                  <option value="Shield">Shield (Security)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Category Summary</label>
                <input
                  type="text"
                  value={editingService.summary || ''}
                  onChange={(e) => setEditingService({ ...editingService, summary: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Best For (Target Scenario & Team Context)</label>
                <input
                  type="text"
                  placeholder="e.g. Teams modernising legacy systems or rebuilding platform foundations."
                  value={editingService.bestFor || ''}
                  onChange={(e) => setEditingService({ ...editingService, bestFor: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Detailed Service Description</label>
                <textarea
                  rows={4}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Technologies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, TypeScript, Node.js, PostgreSQL"
                  value={(editingService.technologies || []).join(', ')}
                  onChange={(e) => setEditingService({ ...editingService, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Key Capabilities (one per line)</label>
                <textarea
                  rows={4}
                  value={(editingService.capabilities || []).join('\n')}
                  onChange={(e) => setEditingService({ ...editingService, capabilities: e.target.value.split('\n').filter(Boolean) })}
                  style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.625rem', color: '#0F172A', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ padding: '0.625rem 1.5rem', borderRadius: '6px', backgroundColor: '#047857', border: '1px solid #065F46', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)' }}>
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

