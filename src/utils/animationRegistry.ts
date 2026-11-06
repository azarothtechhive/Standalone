// src/utils/animationRegistry.ts
// Central registry of all animation definitions and presets

import { AnimationPreset, AnimationProperties, AnimationType } from '../types/animation';

// Default animation properties that can be customized
const defaultProperties: AnimationProperties = {
  enabled: true,
  type: 'fade-up',
  duration: 0.6,
  delay: 0,
  easing: [0.22, 1, 0.36, 1],
  repeat: 'once',
  loop: false,
  scrollTrigger: {
    enabled: true,
    viewportMargin: '-100px',
    once: true,
  },
};

// Animation presets for common use cases
export const animationPresets: AnimationPreset[] = [
  // Entrance Animations
  {
    id: 'fade-up-entrance',
    name: 'Fade Up Entrance',
    description: 'Element fades in and moves up from below',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'fade-up',
      distance: 30,
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'fade-down-entrance',
    name: 'Fade Down Entrance',
    description: 'Element fades in and moves down from above',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'fade-down',
      distance: 30,
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'fade-left-entrance',
    name: 'Fade Left Entrance',
    description: 'Element fades in and moves from right to left',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'fade-left',
      distance: 30,
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'fade-right-entrance',
    name: 'Fade Right Entrance',
    description: 'Element fades in and moves from left to right',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'fade-right',
      distance: 30,
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'scale-in-entrance',
    name: 'Scale In Entrance',
    description: 'Element fades in and scales up from smaller',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'scale-in',
      scale: { start: 0.9, end: 1 },
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'zoom-in-entrance',
    name: 'Zoom In Entrance',
    description: 'Element zooms in from far away',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'zoom-in',
      scale: { start: 0.8, end: 1 },
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'slide-up-entrance',
    name: 'Slide Up Entrance',
    description: 'Element slides up from below',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'slide-up',
      distance: 20,
      opacity: { start: 0, end: 1 },
    },
  },
  {
    id: 'rotate-entrance',
    name: 'Rotate Entrance',
    description: 'Element fades in with rotation',
    category: 'entrance',
    properties: {
      ...defaultProperties,
      type: 'rotate',
      rotation: { start: -10, end: 0 },
      opacity: { start: 0, end: 1 },
    },
  },

  // Continuous Animations
  {
    id: 'float-continuous',
    name: 'Float',
    description: 'Element gently floats up and down',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float',
      duration: 3,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'float-up-down-continuous',
    name: 'Float Up Down',
    description: 'Element moves up and down continuously',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float-up-down',
      duration: 3,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'float-left-right-continuous',
    name: 'Float Left Right',
    description: 'Element moves left and right continuously',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float-left-right',
      duration: 3,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'pulse-continuous',
    name: 'Pulse',
    description: 'Element pulses in scale',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'pulse',
      duration: 2,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'pulse-glow-continuous',
    name: 'Pulse Glow',
    description: 'Element pulses with a glowing shadow',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'pulse-glow',
      duration: 2,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'scale-breath-continuous',
    name: 'Scale Breath',
    description: 'Element breathes in and out with scale',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'scale-breath',
      duration: 3,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'rotate-slow-continuous',
    name: 'Rotate Slow',
    description: 'Element slowly rotates continuously',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'rotate',
      rotation: { start: 0, end: 360 },
      duration: 20,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'gradient-shift-continuous',
    name: 'Gradient Shift',
    description: 'Background gradient shifts position',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'gradient-shift',
      duration: 4,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'wave-flow-continuous',
    name: 'Wave Flow',
    description: 'Element flows in a wave pattern',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'wave-flow',
      duration: 3,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'orbit-float-continuous',
    name: 'Orbit Float',
    description: 'Element floats in an orbital pattern',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'orbit-float',
      duration: 4,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },

  // Hover Animations
  {
    id: 'lift-hover',
    name: 'Lift',
    description: 'Element lifts up on hover',
    category: 'hover',
    properties: {
      ...defaultProperties,
      type: 'fade-up',
      hover: {
        enabled: true,
        type: 'fade-up',
        translateY: -4,
        duration: 0.18,
      },
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'scale-hover',
    name: 'Scale',
    description: 'Element scales up on hover',
    category: 'hover',
    properties: {
      ...defaultProperties,
      type: 'scale-in',
      hover: {
        enabled: true,
        type: 'scale-in',
        scale: 1.02,
        duration: 0.25,
      },
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'glow-hover',
    name: 'Glow',
    description: 'Element glows on hover',
    category: 'hover',
    properties: {
      ...defaultProperties,
      type: 'pulse-glow',
      hover: {
        enabled: true,
        type: 'pulse-glow',
        duration: 0.25,
      },
      scrollTrigger: { enabled: false },
    },
  },

  // Shimmer Effects
  {
    id: 'shimmer-text-effect',
    name: 'Shimmer Text',
    description: 'Text has a shimmering gradient effect',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'shimmer-text',
      duration: 4,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'shimmer-pulse-effect',
    name: 'Shimmer Pulse',
    description: 'Element shimmers with pulse',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'shimmer',
      duration: 1.5,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },

  // Hero Badge Specific Animations
  {
    id: 'hero-badge-float-1',
    name: 'Hero Badge Float 1',
    description: 'First hero badge floating animation pattern',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float-up-down',
      duration: 4.5,
      delay: 0,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'hero-badge-float-2',
    name: 'Hero Badge Float 2',
    description: 'Second hero badge floating animation pattern',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float-left-right',
      duration: 5,
      delay: 0.6,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'hero-badge-float-3',
    name: 'Hero Badge Float 3',
    description: 'Third hero badge floating animation pattern',
    category: 'continuous',
    properties: {
      ...defaultProperties,
      type: 'float-up-down',
      duration: 4.2,
      delay: 1.2,
      repeat: 'infinite',
      loop: true,
      scrollTrigger: { enabled: false },
    },
  },
  {
    id: 'hero-badge-hover',
    name: 'Hero Badge Hover',
    description: 'Hero badge hover effect with scale and lift',
    category: 'hover',
    properties: {
      ...defaultProperties,
      type: 'scale-in',
      hover: {
        enabled: true,
        type: 'scale-in',
        scale: 1.06,
        translateY: -4,
        duration: 0.25,
        easing: [0.16, 1, 0.3, 1],
      },
      scrollTrigger: { enabled: false },
    },
  },
];

// CSS Keyframe definitions
export const cssKeyframes = {
  fadeInUp: {
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
    defaultDuration: 0.6,
  },
  fadeIn: {
    keyframes: `
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    `,
    defaultDuration: 0.5,
  },
  slideInLeft: {
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
    defaultDuration: 0.6,
  },
  slideInRight: {
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
    defaultDuration: 0.6,
  },
  scaleIn: {
    keyframes: `
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    `,
    defaultDuration: 0.5,
  },
  slideInUp: {
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
    defaultDuration: 0.5,
  },
  pulseGlow: {
    keyframes: `
      0%, 100% {
        box-shadow: 0 0 0 0 var(--color-primary-glow);
      }
      50% {
        box-shadow: 0 0 20px 5px var(--color-primary-glow);
      }
    `,
    defaultDuration: 2,
  },
  float: {
    keyframes: `
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    `,
    defaultDuration: 3,
  },
  rotateSlow: {
    keyframes: `
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    `,
    defaultDuration: 20,
  },
  gradientShift: {
    keyframes: `
      0%, 100% { transform: translateX(0) translateY(0); }
      25% { transform: translateX(10px) translateY(-10px); }
      50% { transform: translateX(-5px) translateY(-5px); }
      75% { transform: translateX(-10px) translateY(10px); }
    `,
    defaultDuration: 4,
  },
  pulseSlow: {
    keyframes: `
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.1); opacity: 0.4; }
    `,
    defaultDuration: 3,
  },
  floatUpDown: {
    keyframes: `
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    `,
    defaultDuration: 3,
  },
  floatLeftRight: {
    keyframes: `
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); }
    `,
    defaultDuration: 3,
  },
  scaleBreath: {
    keyframes: `
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    `,
    defaultDuration: 3,
  },
  textShimmer: {
    keyframes: `
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    `,
    defaultDuration: 4,
  },
  fadeInScale: {
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    `,
    defaultDuration: 0.6,
  },
  waveFlow: {
    keyframes: `
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-10px); }
    `,
    defaultDuration: 3,
  },
  orbitFloat: {
    keyframes: `
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(5px, -5px) scale(1.1); }
      50% { transform: translate(-5px, 5px) scale(0.9); }
      75% { transform: translate(3px, -3px) scale(1.05); }
    `,
    defaultDuration: 4,
  },
  shimmerText: {
    keyframes: `
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    `,
    defaultDuration: 4,
  },
  shimmerPulse: {
    keyframes: `
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
    `,
    defaultDuration: 2,
  },
  shimmer: {
    keyframes: `
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    `,
    defaultDuration: 1.5,
  },
  cursorGradient: {
    keyframes: `
      0% {
        background-position: 0% 50%;
      }
      25% {
        background-position: 100% 50%;
      }
      50% {
        background-position: 100% 100%;
      }
      75% {
        background-position: 0% 100%;
      }
      100% {
        background-position: 0% 50%;
      }
    `,
    defaultDuration: 4,
  },
};

// Helper function to get preset by ID
export function getPresetById(id: string): AnimationPreset | undefined {
  return animationPresets.find(preset => preset.id === id);
}

// Helper function to get presets by category
export function getPresetsByCategory(category: AnimationPreset['category']): AnimationPreset[] {
  return animationPresets.filter(preset => preset.category === category);
}

// Helper function to get CSS keyframe by name
export function getKeyframeByName(name: string): { keyframes: string; defaultDuration: number } | undefined {
  return cssKeyframes[name as keyof typeof cssKeyframes];
}
