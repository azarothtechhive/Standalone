// src/components/admin/GlobalAnimationSettings.tsx
// Global animation settings component for CMS admin panel

import React from 'react';
import { GlobalAnimationSettings as GlobalSettingsType } from '../../types/animation';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { Sliders, ShieldCheck, Smartphone, Eye, Sparkles } from 'lucide-react';

interface GlobalAnimationSettingsProps {
  config?: GlobalSettingsType;
  onUpdate: (config: GlobalSettingsType) => void;
}

export const GlobalAnimationSettings: React.FC<GlobalAnimationSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const safeConfig: GlobalSettingsType = {
    masterSwitch: config?.masterSwitch ?? true,
    respectReducedMotion: config?.respectReducedMotion ?? true,
    defaults: {
      duration: config?.defaults?.duration ?? 0.6,
      delay: config?.defaults?.delay ?? 0,
      easing: config?.defaults?.easing ?? [0.22, 1, 0.36, 1],
      scrollTriggerMargin: config?.defaults?.scrollTriggerMargin ?? '-100px',
      viewportOnce: config?.defaults?.viewportOnce ?? true,
    },
    scrollAnimations: { enabled: config?.scrollAnimations?.enabled ?? true },
    hoverAnimations: { enabled: config?.hoverAnimations?.enabled ?? true },
    continuousAnimations: { enabled: config?.continuousAnimations?.enabled ?? true },
    mobileAnimations: {
      enabled: config?.mobileAnimations?.enabled ?? true,
      simplified: config?.mobileAnimations?.simplified ?? false,
    },
  };

  const handleChange = (path: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(safeConfig));
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onUpdate(newConfig);
  };

  return (
    <div className="global-animation-settings" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Master Switch Card */}
      <div style={adminStyles.card}>
        <div style={adminStyles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color={adminColors.indigo.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Master Animation Engine Controls
              </h2>
              <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                Global toggle switches and web accessibility compliance (prefers-reduced-motion)
              </span>
            </div>
          </div>
        </div>

        <div style={adminStyles.cardBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Master Switch */}
            <div
              onClick={() => handleChange('masterSwitch', !safeConfig.masterSwitch)}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: safeConfig.masterSwitch ? `2px solid ${adminColors.indigo.base}` : `1px solid ${adminColors.slate.border}`,
                backgroundColor: safeConfig.masterSwitch ? adminColors.slate.cardSubtle : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>
                  Enable All Animations
                </span>
                <input
                  type="checkbox"
                  checked={safeConfig.masterSwitch}
                  onChange={(e) => handleChange('masterSwitch', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base, cursor: 'pointer' }}
                />
              </div>
              <p style={{ color: adminColors.slate.textMuted, fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                Master switch to enable or pause all framer-motion transitions and CSS keyframe effects across the public site.
              </p>
            </div>

            {/* Accessibility / Reduced Motion */}
            <div
              onClick={() => handleChange('respectReducedMotion', !safeConfig.respectReducedMotion)}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: safeConfig.respectReducedMotion ? `2px solid ${adminColors.emerald.base}` : `1px solid ${adminColors.slate.border}`,
                backgroundColor: safeConfig.respectReducedMotion ? adminColors.emerald.light : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color={adminColors.emerald.base} />
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: adminColors.slate.textPrimary }}>
                    Respect Reduced Motion
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={safeConfig.respectReducedMotion}
                  onChange={(e) => handleChange('respectReducedMotion', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.emerald.base, cursor: 'pointer' }}
                />
              </div>
              <p style={{ color: adminColors.slate.textMuted, fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                Automatically simplifies and halts motion for visitors who enabled OS-level reduced motion preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Default Animation Properties */}
      <div style={adminStyles.card}>
        <div style={adminStyles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.amber.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={20} color={adminColors.amber.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Default Timing & Viewport Physics
              </h2>
              <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                Base values inherited by sections and components when custom overrides are not defined
              </span>
            </div>
          </div>
        </div>

        <div style={adminStyles.cardBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={adminStyles.label}>
                Default Duration (seconds)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="5"
                value={safeConfig.defaults.duration}
                onChange={(e) => handleChange('defaults.duration', parseFloat(e.target.value) || 0.6)}
                style={adminStyles.input}
              />
              <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                Recommended: 0.5s – 0.8s
              </span>
            </div>

            <div>
              <label style={adminStyles.label}>
                Default Stagger Delay (seconds)
              </label>
              <input
                type="number"
                step="0.02"
                min="0"
                max="3"
                value={safeConfig.defaults.delay}
                onChange={(e) => handleChange('defaults.delay', parseFloat(e.target.value) || 0)}
                style={adminStyles.input}
              />
              <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                Delay before entrance initiates
              </span>
            </div>

            <div>
              <label style={adminStyles.label}>
                Scroll Trigger Margin
              </label>
              <input
                type="text"
                value={safeConfig.defaults.scrollTriggerMargin}
                onChange={(e) => handleChange('defaults.scrollTriggerMargin', e.target.value)}
                placeholder="-100px"
                style={adminStyles.input}
              />
              <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                Viewport threshold (e.g. -100px or -15%)
              </span>
            </div>

            <div>
              <label style={adminStyles.label}>
                Scroll Trigger Frequency
              </label>
              <div
                onClick={() => handleChange('defaults.viewportOnce', !safeConfig.defaults.viewportOnce)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${adminColors.slate.borderStrong}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={safeConfig.defaults.viewportOnce}
                  onChange={(e) => handleChange('defaults.viewportOnce', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: adminColors.indigo.base, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: adminColors.slate.textPrimary }}>
                  Animate Once on Scroll
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: adminColors.slate.textLight, marginTop: '0.25rem', display: 'block' }}>
                Checked: animate once. Unchecked: repeat on re-entry.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Animation Category Controls */}
      <div style={adminStyles.card}>
        <div style={adminStyles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={20} color={adminColors.indigo.text} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
                Behavioral Animation Categories
              </h2>
              <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
                Granular enable/disable controls for specific interaction types
              </span>
            </div>
          </div>
        </div>

        <div style={adminStyles.cardBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Scroll-triggered */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${adminColors.slate.border}`,
              backgroundColor: safeConfig.scrollAnimations.enabled ? '#FFFFFF' : adminColors.slate.cardMuted,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={safeConfig.scrollAnimations.enabled}
                onChange={(e) => handleChange('scrollAnimations.enabled', e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: adminColors.slate.textPrimary }}>
                  Scroll-Triggered Reveals
                </div>
                <div style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
                  Elements animate into view as visitor scrolls
                </div>
              </div>
            </label>

            {/* Hover Animations */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${adminColors.slate.border}`,
              backgroundColor: safeConfig.hoverAnimations.enabled ? '#FFFFFF' : adminColors.slate.cardMuted,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={safeConfig.hoverAnimations.enabled}
                onChange={(e) => handleChange('hoverAnimations.enabled', e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: adminColors.slate.textPrimary }}>
                  Cursor & Hover Dynamics
                </div>
                <div style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
                  Card lifts, button glows, and scale effects on mouseover
                </div>
              </div>
            </label>

            {/* Continuous Animations */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${adminColors.slate.border}`,
              backgroundColor: safeConfig.continuousAnimations.enabled ? '#FFFFFF' : adminColors.slate.cardMuted,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={safeConfig.continuousAnimations.enabled}
                onChange={(e) => handleChange('continuousAnimations.enabled', e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: adminColors.slate.textPrimary }}>
                  Continuous / Looping Effects
                </div>
                <div style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
                  Floating badges, glowing halos, and gradient waves
                </div>
              </div>
            </label>

            {/* Mobile Optimization */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${adminColors.slate.border}`,
              backgroundColor: '#FFFFFF',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <Smartphone size={18} color={adminColors.indigo.text} />
                <input
                  type="checkbox"
                  checked={safeConfig.mobileAnimations.enabled}
                  onChange={(e) => handleChange('mobileAnimations.enabled', e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: adminColors.indigo.base }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: adminColors.slate.textPrimary }}>
                  Mobile Animations
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: '2rem' }}>
                <input
                  type="checkbox"
                  checked={safeConfig.mobileAnimations.simplified}
                  onChange={(e) => handleChange('mobileAnimations.simplified', e.target.checked)}
                  style={{ width: '1rem', height: '1rem', accentColor: adminColors.amber.base }}
                />
                <span style={{ fontSize: '0.75rem', color: adminColors.slate.textMuted }}>
                  Simplify on mobile for optimal GPU / battery efficiency
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnimationSettings;
