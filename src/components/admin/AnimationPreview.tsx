// src/components/admin/AnimationPreview.tsx
// Interactive Animation Preview Sandbox for CMS admin panel

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animationPresets } from '../../utils/animationRegistry';
import { adminColors, adminStyles } from '../../styles/adminTheme';
import { Play, RotateCcw, Sparkles, Sliders, Layers } from 'lucide-react';

interface AnimationPreviewProps {
  animation?: any;
  onClose?: () => void;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({ animation, onClose }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    return animation?.presetId || animation?.id || 'fade-up-entrance';
  });
  const [replayKey, setReplayKey] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [shapeMode, setShapeMode] = useState<'card' | 'badge' | 'text'>('card');

  useEffect(() => {
    if (animation?.presetId) {
      setSelectedPresetId(animation.presetId);
    } else if (animation?.id) {
      setSelectedPresetId(animation.id);
    }
    setReplayKey(k => k + 1);
  }, [animation]);

  const currentPreset = animationPresets.find(p => p.id === selectedPresetId) || animationPresets[0];

  const handleReplay = () => {
    setReplayKey(k => k + 1);
  };

  const getMotionProps = () => {
    const props = currentPreset?.properties || {
      type: 'fade-up',
      duration: 0.6,
      delay: 0,
    };

    const duration = (props.duration || 0.6) / speedMultiplier;
    const delay = (props.delay || 0) / speedMultiplier;

    let initial: any = { opacity: 0 };
    let animate: any = { opacity: 1 };
    let transition: any = {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    };

    switch (props.type) {
      case 'fade-up':
        initial = { opacity: 0, y: props.distance || 30 };
        animate = { opacity: 1, y: 0 };
        break;
      case 'fade-down':
        initial = { opacity: 0, y: -(props.distance || 30) };
        animate = { opacity: 1, y: 0 };
        break;
      case 'fade-left':
        initial = { opacity: 0, x: props.distance || 30 };
        animate = { opacity: 1, x: 0 };
        break;
      case 'fade-right':
        initial = { opacity: 0, x: -(props.distance || 30) };
        animate = { opacity: 1, x: 0 };
        break;
      case 'scale-in':
      case 'zoom-in':
        initial = { opacity: 0, scale: props.scale?.start || 0.85 };
        animate = { opacity: 1, scale: props.scale?.end || 1 };
        break;
      case 'rotate':
        initial = { opacity: 0, rotate: -15, scale: 0.9 };
        animate = { opacity: 1, rotate: 0, scale: 1 };
        break;
      case 'float':
      case 'float-up-down':
        initial = { y: 0 };
        animate = { y: [-6, 6, -6] };
        transition = {
          duration: 3 / speedMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
      case 'pulse':
      case 'pulse-glow':
        initial = { scale: 1 };
        animate = { scale: [1, 1.04, 1] };
        transition = {
          duration: 2 / speedMultiplier,
          repeat: Infinity,
          ease: 'easeInOut',
        };
        break;
      default:
        initial = { opacity: 0, y: 20 };
        animate = { opacity: 1, y: 0 };
        break;
    }

    return { initial, animate, transition };
  };

  const motionConfig = getMotionProps();

  return (
    <div style={adminStyles.card}>
      <div style={adminStyles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: adminColors.indigo.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={20} color={adminColors.indigo.text} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: adminColors.slate.textPrimary, margin: 0 }}>
              Live Motion Sandbox
            </h2>
            <span style={{ fontSize: '0.8125rem', color: adminColors.slate.textMuted }}>
              Simulate actual viewport entrance transitions, continuous physics, and timing
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleReplay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              backgroundColor: adminColors.indigo.base,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <RotateCcw size={14} />
            Replay Motion
          </button>
        </div>
      </div>

      <div style={adminStyles.cardBody}>
        {/* Controls Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: adminColors.slate.cardSubtle,
          borderRadius: '8px',
          border: `1px solid ${adminColors.slate.border}`,
          marginBottom: '1.5rem',
        }}>
          <div>
            <label style={adminStyles.label}>Select Animation Preset:</label>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setReplayKey(k => k + 1);
              }}
              style={adminStyles.input}
            >
              {animationPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={adminStyles.label}>Playback Speed:</label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[0.5, 1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setSpeedMultiplier(speed);
                    setReplayKey(k => k + 1);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: speedMultiplier === speed ? `1px solid ${adminColors.indigo.base}` : `1px solid ${adminColors.slate.border}`,
                    backgroundColor: speedMultiplier === speed ? adminColors.indigo.base : '#FFFFFF',
                    color: speedMultiplier === speed ? '#FFFFFF' : adminColors.slate.textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={adminStyles.label}>Preview Element Shape:</label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['card', 'badge', 'text'] as const).map(shape => (
                <button
                  key={shape}
                  onClick={() => {
                    setShapeMode(shape);
                    setReplayKey(k => k + 1);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: shapeMode === shape ? `1px solid ${adminColors.indigo.base}` : `1px solid ${adminColors.slate.border}`,
                    backgroundColor: shapeMode === shape ? adminColors.indigo.base : '#FFFFFF',
                    color: shapeMode === shape ? '#FFFFFF' : adminColors.slate.textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewport Simulation Stage */}
        <div style={{
          minHeight: '320px',
          backgroundColor: '#0A1118', // Same dark midnight background as public site hero/footer
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '2.5rem',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(73, 36, 63, 0.3) 0%, transparent 60%)',
        }}>
          <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '0.6875rem', color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Simulated Viewport Canvas
          </div>

          <AnimatePresence mode="wait">
            <div key={replayKey}>
              {shapeMode === 'card' && (
                <motion.div
                  initial={motionConfig.initial}
                  animate={motionConfig.animate}
                  transition={motionConfig.transition}
                  style={{
                    width: '320px',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#49243F', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Sparkles size={20} color="#C99B52" />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
                    {currentPreset?.name || 'Interactive Card'}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                    {currentPreset?.description || 'Enterprise microservices and zero-downtime platform engineering.'}
                  </p>
                </motion.div>
              )}

              {shapeMode === 'badge' && (
                <motion.div
                  initial={motionConfig.initial}
                  animate={motionConfig.animate}
                  transition={motionConfig.transition}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '9999px',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#047857' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    Azaroth 99.99% Availability Architecture
                  </span>
                </motion.div>
              )}

              {shapeMode === 'text' && (
                <motion.div
                  initial={motionConfig.initial}
                  animate={motionConfig.animate}
                  transition={motionConfig.transition}
                  style={{ textAlign: 'center', maxWidth: '480px' }}
                >
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                    Intelligence <span style={{ color: '#C99B52' }}>Engineered.</span>
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: '#CBD5E1', margin: 0 }}>
                    Transforming high-stakes systems into reliable products.
                  </p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </div>

        {/* Preset Info Specs */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: adminColors.slate.textMuted,
        }}>
          <div>
            <strong>Type:</strong> <code>{currentPreset?.properties.type}</code> &bull;{' '}
            <strong>Nominal Duration:</strong> {currentPreset?.properties.duration}s &bull;{' '}
            <strong>Category:</strong> {currentPreset?.category}
          </div>
          <div>
            Active Simulation: <strong>{(currentPreset?.properties.duration || 0.6) / speedMultiplier}s</strong> at {speedMultiplier}x speed
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationPreview;
