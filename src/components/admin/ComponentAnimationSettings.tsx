// src/components/admin/ComponentAnimationSettings.tsx
// Component-specific animation settings for CMS admin panel

import React, { useState } from 'react';
import { ComponentAnimationConfig, AnimationProperties } from '../../types/animation';
import { animationPresets } from '../../utils/animationRegistry';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { Layers, Play, ChevronDown, ChevronRight, Sliders, CheckCircle2 } from 'lucide-react';

interface ComponentAnimationSettingsProps {
  components?: ComponentAnimationConfig[];
  onUpdate: (components: ComponentAnimationConfig[]) => void;
  onPreview: (animation: any) => void;
}

export const ComponentAnimationSettings: React.FC<ComponentAnimationSettingsProps> = ({
  components = [],
  onUpdate,
  onPreview,
}) => {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const handleToggleComponent = (componentId: string) => {
    setExpandedComponent(expandedComponent === componentId ? null : componentId);
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<ComponentAnimationConfig>) => {
    const updatedComponents = components.map(comp =>
      comp.componentId === componentId ? { ...comp, ...updates } : comp
    );
    onUpdate(updatedComponents);
  };

  const handleUpdateCustomProperty = (componentId: string, propKey: string, value: any) => {
    const updatedComponents = components.map(comp => {
      if (comp.componentId === componentId) {
        const customProps: AnimationProperties = comp.customProperties
          ? { ...comp.customProperties }
          : { enabled: true, type: 'fade-up', duration: 0.6, delay: 0, easing: [0.22, 1, 0.36, 1] };
        return {
          ...comp,
          customProperties: {
            ...customProps,
            [propKey]: value,
          } as AnimationProperties,
        };
      }
      return comp;
    });
    onUpdate(updatedComponents);
  };

  const handleUpdateElement = (
    componentId: string,
    elementId: string,
    updates: any
  ) => {
    const updatedComponents = components.map(comp => {
      if (comp.componentId === componentId && comp.elements) {
        return {
          ...comp,
          elements: {
            ...comp.elements,
            [elementId]: {
              ...comp.elements[elementId],
              ...updates,
            },
          },
        };
      }
      return comp;
    });
    onUpdate(updatedComponents);
  };

  return (
    <div className="component-animation-settings" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={adminStyles.card}>
        <div style={adminStyles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} color={adminColors.indigo.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Component & Section Motion Maps
              </h2>
              <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                Assign distinct animation presets, stagger delays, and element sub-triggers per public section
              </span>
            </div>
          </div>
        </div>

        <div style={adminStyles.cardBody}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {components.map((component) => {
              const isExpanded = expandedComponent === component.componentId;
              const activePreset = animationPresets.find(p => p.id === component.presetId);

              return (
                <div
                  key={component.componentId}
                  style={{
                    border: isExpanded ? `1px solid ${adminColors.indigo.base}` : `1px solid ${adminColors.slate.border}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Component Header */}
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      background: isExpanded ? adminColors.slate.cardSubtle : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => handleToggleComponent(component.componentId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="checkbox"
                        checked={component.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateComponent(component.componentId, { enabled: e.target.checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {component.componentName}
                          {component.enabled ? (
                            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, backgroundColor: adminColors.emerald.light, color: adminColors.emerald.text }}>
                              Active
                            </span>
                          ) : (
                            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, backgroundColor: adminColors.slate.cardMuted, color: adminColors.slate.textMuted }}>
                              Paused
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted, marginTop: '0.15rem' }}>
                          ID: <code style={{ backgroundColor: '#F1F5F9', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{component.componentId}</code>
                          {activePreset && (
                            <span style={{ marginLeft: '0.75rem', color: adminColors.indigo.text, fontWeight: 500 }}>
                              Preset: {activePreset.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(component);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: `1px solid ${adminColors.slate.borderStrong}`,
                          backgroundColor: '#FFFFFF',
                          color: adminColors.slate.textPrimary,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Play size={13} color={adminColors.indigo.text} />
                        Preview
                      </button>

                      <div style={{ color: adminColors.slate.textMuted, display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Component Details Form */}
                  {isExpanded && (
                    <div style={{ padding: '1.25rem', borderTop: `1px solid ${adminColors.slate.border}`, backgroundColor: '#FFFFFF' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        {/* Preset Selection */}
                        <div>
                          <label style={adminStyles.label}>
                            Primary Entrance / Section Preset
                          </label>
                          <select
                            value={component.presetId || ''}
                            onChange={(e) => handleUpdateComponent(component.componentId, { presetId: e.target.value })}
                            style={adminStyles.input}
                          >
                            <option value="">(Inherit Global Default: Fade Up)</option>
                            <optgroup label="Entrance Animations">
                              {animationPresets.filter(p => p.category === 'entrance').map(preset => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.name} ({preset.properties.duration}s)
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Continuous / Ambient">
                              {animationPresets.filter(p => p.category === 'continuous').map(preset => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Hover Dynamics">
                              {animationPresets.filter(p => p.category === 'hover').map(preset => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {/* Custom Duration Override */}
                        <div>
                          <label style={adminStyles.label}>
                            Duration Override (seconds, optional)
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.1"
                            max="5"
                            value={component.customProperties?.duration ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              handleUpdateCustomProperty(component.componentId, 'duration', val);
                            }}
                            placeholder="e.g. 0.65"
                            style={adminStyles.input}
                          />
                        </div>

                        {/* Custom Delay Override */}
                        <div>
                          <label style={adminStyles.label}>
                            Delay Override (seconds, optional)
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="3"
                            value={component.customProperties?.delay ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              handleUpdateCustomProperty(component.componentId, 'delay', val);
                            }}
                            placeholder="e.g. 0.15"
                            style={adminStyles.input}
                          />
                        </div>
                      </div>

                      {/* Element-specific Sub-Animations */}
                      {component.elements && Object.keys(component.elements).length > 0 && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${adminColors.slate.borderLight}` }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: adminColors.slate.textPrimary, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sliders size={16} color={adminColors.indigo.text} />
                            Sub-Element Child Triggers
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                            {Object.entries(component.elements).map(([elementId, element]) => (
                              <div
                                key={elementId}
                                style={{
                                  padding: '0.875rem',
                                  background: adminColors.slate.cardMuted,
                                  borderRadius: '8px',
                                  border: `1px solid ${adminColors.slate.border}`,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                                    <input
                                      type="checkbox"
                                      checked={element.enabled}
                                      onChange={(e) => handleUpdateElement(component.componentId, elementId, { enabled: e.target.checked })}
                                      style={{ width: '1rem', height: '1rem', accentColor: adminColors.indigo.base }}
                                    />
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: adminColors.slate.textPrimary }}>
                                      {elementId}
                                    </span>
                                  </label>
                                </div>
                                <select
                                  value={element.presetId || ''}
                                  onChange={(e) => handleUpdateElement(component.componentId, elementId, { presetId: e.target.value })}
                                  style={{
                                    ...adminStyles.input,
                                    padding: '0.375rem 0.625rem',
                                    fontSize: '0.8125rem',
                                  }}
                                >
                                  <option value="">(Inherit Section Preset)</option>
                                  {animationPresets.map(preset => (
                                    <option key={preset.id} value={preset.id}>
                                      {preset.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentAnimationSettings;
