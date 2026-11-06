// src/components/admin/AnimationPresetLibrary.tsx
// Animation preset library for CMS admin panel

import React, { useState } from 'react';
import { animationPresets, getPresetsByCategory } from '../../utils/animationRegistry';
import { AnimationPreset, ComponentAnimationConfig } from '../../types/animation';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { Sparkles, Check, Play, ArrowRight, Tag, Clock } from 'lucide-react';

interface AnimationPresetLibraryProps {
  onApply: (presetId: string, componentId?: string) => void;
  components?: ComponentAnimationConfig[];
  onPreview?: (preset: AnimationPreset) => void;
}

export const AnimationPresetLibrary: React.FC<AnimationPresetLibraryProps> = ({
  onApply,
  components = [],
  onPreview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AnimationPreset['category'] | 'all'>('all');
  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset | null>(null);
  const [targetComponentId, setTargetComponentId] = useState<string>(components[0]?.componentId || '');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const categories: Array<AnimationPreset['category'] | 'all'> = ['all', 'entrance', 'continuous', 'hover', 'scroll'];

  const filteredPresets = selectedCategory === 'all' 
    ? animationPresets 
    : getPresetsByCategory(selectedCategory);

  const handleApply = (presetId: string) => {
    onApply(presetId, targetComponentId || undefined);
    const targetName = components.find(c => c.componentId === targetComponentId)?.componentName || targetComponentId;
    setAppliedNotice(`Preset applied to ${targetName || 'component'}!`);
    setTimeout(() => setAppliedNotice(null), 2500);
  };

  return (
    <div className="animation-preset-library" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={adminStyles.card}>
        <div style={adminStyles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color={adminColors.indigo.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                25+ Engineering Animation Presets
              </h2>
              <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                Battle-tested transitions, continuous ambient floats, and interactive hover lifts
              </span>
            </div>
          </div>

          {appliedNotice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', backgroundColor: adminColors.emerald.light, color: adminColors.emerald.text, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Check size={14} />
              {appliedNotice}
            </div>
          )}
        </div>

        <div style={adminStyles.cardBody}>
          {/* Category Filter Pills */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(category => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    border: isActive ? `1px solid ${adminColors.indigo.base}` : `1px solid ${adminColors.slate.border}`,
                    background: isActive ? adminColors.indigo.base : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : adminColors.slate.textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {category === 'all' ? `All Presets (${animationPresets.length})` : category}
                </button>
              );
            })}
          </div>

          {/* Preset Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                style={{
                  border: `1px solid ${adminColors.slate.border}`,
                  borderRadius: '10px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                onClick={() => setSelectedPreset(preset)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = adminColors.indigo.base;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = adminColors.slate.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>
                      {preset.name}
                    </div>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      background: adminColors.slate.cardMuted,
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: adminColors.slate.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {preset.category}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted, margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                    {preset.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: `1px solid ${adminColors.slate.borderLight}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: adminColors.slate.textLight }}>
                    <Clock size={13} />
                    <span>{preset.properties.duration}s duration</span>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: adminColors.indigo.text }}>
                    View &amp; Apply &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preset Details & Apply Modal */}
      {selectedPreset && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '1.75rem',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{
                  padding: '0.15rem 0.5rem',
                  background: adminColors.indigo.light,
                  color: adminColors.indigo.text,
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.35rem',
                }}>
                  {selectedPreset.category} Preset
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: adminColors.slate.textPrimary, margin: 0 }}>
                  {selectedPreset.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreset(null)}
                style={{
                  background: adminColors.slate.cardMuted,
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: adminColors.slate.textMuted,
                }}
              >
                &times;
              </button>
            </div>

            <p style={{ color: adminColors.slate.textSecondary, fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {selectedPreset.description}
            </p>

            <div style={{
              background: adminColors.slate.cardSubtle,
              border: `1px solid ${adminColors.slate.border}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: adminColors.slate.textSecondary,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
            }}>
              <div><strong>Type:</strong> <code>{selectedPreset.properties.type}</code></div>
              <div><strong>Duration:</strong> {selectedPreset.properties.duration}s</div>
              <div><strong>Delay:</strong> {selectedPreset.properties.delay}s</div>
              <div><strong>Repeat:</strong> {selectedPreset.properties.repeat || 'once'}</div>
              {selectedPreset.properties.distance && <div><strong>Distance:</strong> {selectedPreset.properties.distance}px</div>}
              {selectedPreset.properties.scale && <div><strong>Scale:</strong> {selectedPreset.properties.scale.start} &rarr; {selectedPreset.properties.scale.end}</div>}
            </div>

            {/* Target Component Selection */}
            {components.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={adminStyles.label}>
                  Apply This Preset To Component:
                </label>
                <select
                  value={targetComponentId}
                  onChange={(e) => setTargetComponentId(e.target.value)}
                  style={adminStyles.input}
                >
                  {components.map(comp => (
                    <option key={comp.componentId} value={comp.componentId}>
                      {comp.componentName} ({comp.componentId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {onPreview && (
                <button
                  onClick={() => {
                    onPreview(selectedPreset);
                    setSelectedPreset(null);
                  }}
                  style={{
                    padding: '0.625rem 1rem',
                    background: '#FFFFFF',
                    border: `1px solid ${adminColors.slate.borderStrong}`,
                    borderRadius: '8px',
                    color: adminColors.slate.textPrimary,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Play size={14} />
                  Test Live Preview
                </button>
              )}

              <button
                onClick={() => {
                  handleApply(selectedPreset.id);
                  setSelectedPreset(null);
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: adminColors.indigo.base,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Check size={16} />
                Apply Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationPresetLibrary;
