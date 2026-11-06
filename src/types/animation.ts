// src/types/animation.ts
// Comprehensive animation type definitions for CMS-driven animation system

export type AnimationType = 
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'scale-in'
  | 'scale-out'
  | 'rotate'
  | 'float'
  | 'float-up-down'
  | 'float-left-right'
  | 'pulse'
  | 'pulse-glow'
  | 'shimmer'
  | 'shimmer-text'
  | 'gradient-shift'
  | 'wave-flow'
  | 'orbit-float'
  | 'scale-breath'
  | 'parallax'
  | 'custom';

export type EasingType = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'custom';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface AnimationProperties {
  enabled: boolean;
  type: AnimationType;
  duration: number; // in seconds
  delay: number; // in seconds
  easing: EasingType | number[]; // cubic-bezier array for custom
  direction?: Direction;
  distance?: number; // pixels for movement
  opacity?: {
    start: number;
    end: number;
  };
  scale?: {
    start: number;
    end: number;
  };
  rotation?: {
    start: number;
    end: number;
  };
  repeat?: 'once' | 'infinite' | number;
  loop?: boolean;
  scrollTrigger?: {
    enabled: boolean;
    viewportMargin?: string;
    once?: boolean;
  };
  stagger?: {
    enabled: boolean;
    delay: number;
    from?: 'first' | 'last' | 'center';
  };
  hover?: {
    enabled: boolean;
    type: AnimationType;
    scale?: number;
    translateY?: number;
    translateX?: number;
    duration?: number;
    easing?: EasingType | number[];
  };
  responsive?: {
    desktop?: Partial<AnimationProperties>;
    tablet?: Partial<AnimationProperties>;
    mobile?: Partial<AnimationProperties>;
  };
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'entrance' | 'exit' | 'continuous' | 'hover' | 'scroll';
  properties: AnimationProperties;
}

export interface ComponentAnimationConfig {
  componentId: string;
  componentName: string;
  enabled: boolean;
  presetId?: string;
  customProperties?: AnimationProperties;
  elements?: {
    [elementId: string]: {
      enabled: boolean;
      presetId?: string;
      customProperties?: AnimationProperties;
    };
  };
}

export interface GlobalAnimationSettings {
  masterSwitch: boolean;
  respectReducedMotion: boolean;
  defaults: {
    duration: number;
    delay: number;
    easing: EasingType | number[];
    scrollTriggerMargin: string;
    viewportOnce: boolean;
  };
  scrollAnimations: {
    enabled: boolean;
  };
  hoverAnimations: {
    enabled: boolean;
  };
  continuousAnimations: {
    enabled: boolean;
  };
  mobileAnimations: {
    enabled: boolean;
    simplified: boolean;
  };
}

export interface AnimationConfig {
  global: GlobalAnimationSettings;
  presets: AnimationPreset[];
  components: ComponentAnimationConfig[];
  cssKeyframes: {
    [key: string]: {
      enabled: boolean;
      keyframes: string;
      duration?: number;
      timingFunction?: string;
      iterationCount?: string;
    };
  };
  shimmerEffects: {
    [key: string]: {
      enabled: boolean;
      gradient: string;
      backgroundSize: string;
      duration: number;
    };
  };
  cursorGradients: {
    [key: string]: {
      enabled: boolean;
      gradient: string;
      backgroundSize: string;
      duration: number;
    };
  };
}

export interface AnimationDraft {
  id: string;
  name: string;
  description?: string;
  config: AnimationConfig;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AnimationVersion {
  id: string;
  version: number;
  config: AnimationConfig;
  createdAt: string;
  createdBy?: string;
  notes?: string;
}
