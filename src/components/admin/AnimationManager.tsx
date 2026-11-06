// src/components/admin/AnimationManager.tsx
// Main animation management component for CMS admin panel

import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { GlobalAnimationSettings } from './GlobalAnimationSettings';
import { ComponentAnimationSettings } from './ComponentAnimationSettings';
import { AnimationPresetLibrary } from './AnimationPresetLibrary';
import { AnimationPreview } from './AnimationPreview';
import { animationDraftService } from '../../services/animationDraftService';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import {
  Sparkles,
  Sliders,
  Layers,
  BookOpen,
  Play,
  Save,
  RotateCcw,
  CheckCircle2,
  History,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AnimationConfig, ComponentAnimationConfig } from '../../types/animation';

export const AnimationManager: React.FC = () => {
  const { settings, updateSettings } = useCMS();
  const [activeTab, setActiveTab] = useState<'global' | 'components' | 'presets' | 'preview' | 'drafts'>('global');
  const [previewAnimation, setPreviewAnimation] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftsList, setDraftsList] = useState(() => animationDraftService.getAllDrafts());
  const [versionsList, setVersionsList] = useState(() => animationDraftService.getAllVersions());

  // Local working copy of animationConfig
  const animationConfig: AnimationConfig = (settings as any)?.animationConfig || {
    global: {
      masterSwitch: true,
      respectReducedMotion: true,
      defaults: {
        duration: 0.6,
        delay: 0,
        easing: [0.22, 1, 0.36, 1],
        scrollTriggerMargin: '-100px',
        viewportOnce: true,
      },
      scrollAnimations: { enabled: true },
      hoverAnimations: { enabled: true },
      continuousAnimations: { enabled: true },
      mobileAnimations: { enabled: true, simplified: false },
    },
    presets: [],
    components: [],
    cssKeyframes: {},
    shimmerEffects: {},
    cursorGradients: {},
  };

  const [localConfig, setLocalConfig] = useState<AnimationConfig>(animationConfig);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings?.animationConfig) {
      setLocalConfig(settings.animationConfig);
      setIsDirty(false);
    }
  }, [settings?.animationConfig]);

  const handleUpdateConfig = (partial: Partial<AnimationConfig>) => {
    setLocalConfig(prev => ({
      ...prev,
      ...partial,
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        animationConfig: localConfig,
      });
      setIsDirty(false);
      setNotification({ type: 'success', message: 'Animation configuration published successfully to live website!' });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save animation settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPresetToComponent = (presetId: string, componentId?: string) => {
    if (!componentId) return;
    const updatedComponents = (localConfig.components || []).map(comp => {
      if (comp.componentId === componentId) {
        return {
          ...comp,
          presetId,
          enabled: true,
        };
      }
      return comp;
    });

    handleUpdateConfig({ components: updatedComponents });
    setNotification({ type: 'success', message: `Preset applied to ${componentId}. Click "Save Animations" to publish live.` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) {
      alert('Draft name is required');
      return;
    }
    const draft = animationDraftService.saveDraft(draftName.trim(), draftDescription.trim() || undefined, localConfig);
    setDraftsList(animationDraftService.getAllDrafts());
    setDraftName('');
    setDraftDescription('');
    setNotification({ type: 'success', message: `Saved draft "${draft.name}".` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = animationDraftService.getDraft(draftId);
    if (!draft) return;
    setLocalConfig(draft.config);
    setIsDirty(true);
    setNotification({ type: 'success', message: `Loaded draft "${draft.name}". Click "Save Animations" to apply.` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePublishDraft = (draftId: string) => {
    const version = animationDraftService.publishDraft(draftId);
    if (version) {
      setLocalConfig(version.config);
      setVersionsList(animationDraftService.getAllVersions());
      setDraftsList(animationDraftService.getAllDrafts());
      handleSave();
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm('Delete this draft?')) {
      animationDraftService.deleteDraft(draftId);
      setDraftsList(animationDraftService.getAllDrafts());
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    const version = animationDraftService.getVersion(versionId);
    if (!version) return;
    if (window.confirm(`Restore to Version ${version.version}?`)) {
      setLocalConfig(version.config);
      setIsDirty(true);
      setNotification({ type: 'success', message: `Loaded Version ${version.version}. Click "Save Animations" to commit.` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const tabs = [
    { id: 'global', label: 'Global Controls', icon: Sliders },
    { id: 'components', label: 'Section & Component Maps', icon: Layers },
    { id: 'presets', label: '25+ Preset Library', icon: BookOpen },
    { id: 'preview', label: 'Live Sandbox', icon: Play },
    { id: 'drafts', label: 'Drafts & Version Control', icon: History },
  ] as const;

  return (
    <div className="animation-manager" style={{ width: '100%', maxWidth: '100%', margin: '0 auto', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner & Action Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="#7C3AED" />
            </div>
            Animation Engine &amp; Motion Studio
          </h1>
          <p style={{ fontSize: '0.875rem', color: adminColors.slate.textMuted, marginTop: '0.375rem', marginLeft: '3.25rem' }}>
            Configure framer-motion transitions, scroll reveal physics, CSS keyframes, and performance safeguards without rebuilding code.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isDirty && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: adminColors.amber.text, backgroundColor: adminColors.amber.light, padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
              Unsaved Changes
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: isDirty ? '#7C3AED' : adminColors.indigo.base,
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Save size={18} />
            {isSaving ? 'Publishing...' : 'Save Animations'}
          </button>
        </div>
      </div>

      {notification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: notification.type === 'success' ? adminColors.emerald.light : adminColors.rose.light,
          border: `1px solid ${notification.type === 'success' ? adminColors.emerald.border : adminColors.rose.border}`,
          borderRadius: '8px',
          color: notification.type === 'success' ? adminColors.emerald.text : adminColors.rose.text,
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.35rem',
        borderBottom: `1px solid ${adminColors.slate.border}`,
        paddingBottom: '0.25rem',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#7C3AED' : adminColors.slate.textMuted,
                borderBottom: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                marginBottom: '-0.25rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'global' && (
        <GlobalAnimationSettings
          config={localConfig.global}
          onUpdate={(globalSettings) => handleUpdateConfig({ global: globalSettings })}
        />
      )}

      {activeTab === 'components' && (
        <ComponentAnimationSettings
          components={localConfig.components || []}
          onUpdate={(components) => handleUpdateConfig({ components })}
          onPreview={(comp) => {
            setPreviewAnimation(comp);
            setActiveTab('preview');
          }}
        />
      )}

      {activeTab === 'presets' && (
        <AnimationPresetLibrary
          components={localConfig.components || []}
          onApply={handleApplyPresetToComponent}
          onPreview={(preset) => {
            setPreviewAnimation(preset);
            setActiveTab('preview');
          }}
        />
      )}

      {activeTab === 'preview' && (
        <AnimationPreview
          animation={previewAnimation}
          onClose={() => setPreviewAnimation(null)}
        />
      )}

      {activeTab === 'drafts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create Draft Form */}
          <div style={adminStyles.card}>
            <div style={adminStyles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color={adminColors.indigo.text} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                    Create Animation Draft
                  </h2>
                  <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                    Snapshot your current animation configuration for testing before publishing live
                  </span>
                </div>
              </div>
            </div>

            <div style={adminStyles.cardBody}>
              <form onSubmit={handleCreateDraft} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={adminStyles.label}>Draft Name *</label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="e.g. Q4 Modernized Smooth Scroll"
                      style={adminStyles.input}
                    />
                  </div>
                  <div>
                    <label style={adminStyles.label}>Description (optional)</label>
                    <input
                      type="text"
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      placeholder="e.g. Faster badge floats and subtle cards"
                      style={adminStyles.input}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.625rem 1.25rem',
                      backgroundColor: adminColors.indigo.base,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save As Draft
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Active Drafts List */}
          <div style={adminStyles.card}>
            <div style={adminStyles.cardHeader}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Saved Drafts ({draftsList.length})
              </h3>
            </div>
            <div style={adminStyles.cardBody}>
              {draftsList.length === 0 ? (
                <p style={{ color: adminColors.slate.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  No saved drafts yet. Create one above to experiment with motion styles safely.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {draftsList.map(draft => (
                    <div
                      key={draft.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: adminColors.slate.cardSubtle,
                        borderRadius: '8px',
                        border: `1px solid ${adminColors.slate.border}`,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>
                          {draft.name}
                        </div>
                        {draft.description && (
                          <div style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, marginTop: '0.2rem' }}>
                            {draft.description}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem' }}>
                          Saved: {new Date(draft.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleLoadDraft(draft.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#FFFFFF',
                            border: `1px solid ${adminColors.slate.borderStrong}`,
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Load Draft
                        </button>
                        <button
                          onClick={() => handlePublishDraft(draft.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: adminColors.emerald.base,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Publish Version
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: adminColors.rose.light,
                            color: adminColors.rose.text,
                            border: `1px solid ${adminColors.rose.border}`,
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version History List */}
          <div style={adminStyles.card}>
            <div style={adminStyles.cardHeader}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Version History &amp; Rollback ({versionsList.length})
              </h3>
            </div>
            <div style={adminStyles.cardBody}>
              {versionsList.length === 0 ? (
                <p style={{ color: adminColors.slate.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  No published versions recorded yet. Versions are stamped when drafts are published.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {versionsList.map(ver => (
                    <div
                      key={ver.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: `1px solid ${adminColors.slate.border}`,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>
                          Version {ver.version}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, marginTop: '0.2rem' }}>
                          {ver.notes || 'Published version'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem' }}>
                          Published at: {new Date(ver.createdAt).toLocaleString()} by {ver.createdBy}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreVersion(ver.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          backgroundColor: adminColors.slate.cardMuted,
                          border: `1px solid ${adminColors.slate.border}`,
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={13} />
                        Rollback to v{ver.version}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationManager;
