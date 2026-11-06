// src/hooks/useCMSAnimation.ts
// Enhanced hook for CMS-driven animation configuration with accessibility and performance safeguards

import { useContext, useEffect, useMemo } from 'react';
import { useCMS } from '../context/CMSContext';
import { AnimationProperties, AnimationType, EasingType } from '../types/animation';
import { getPresetById } from '../utils/animationRegistry';

// Performance monitoring for animations
let animationPerformanceMetrics = {
  totalAnimations: 0,
  disabledForPerformance: 0,
  disabledForAccessibility: 0,
};

export function getAnimationMetrics() {
  return animationPerformanceMetrics;
}

export function resetAnimationMetrics() {
  animationPerformanceMetrics = {
    totalAnimations: 0,
    disabledForPerformance: 0,
    disabledForAccessibility: 0,
  };
}

interface UseCMSAnimationOptions {
  componentId?: string;
  elementId?: string;
  presetId?: string;
  customProperties?: Partial<AnimationProperties>;
  respectReducedMotion?: boolean;
}

interface AnimationResult {
  enabled: boolean;
  properties: AnimationProperties;
  motionProps: any;
  cssStyles: React.CSSProperties;
  cssClassName: string;
}

export const useCMSAnimation = (options: UseCMSAnimationOptions = {}): AnimationResult => {
  const { settings } = useCMS();
  const {
    componentId,
    elementId,
    presetId,
    customProperties,
    respectReducedMotion = true,
  } = options;

  // Get global animation config from CMS
  const globalConfig = (settings as any)?.animationConfig?.global || {
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
  };

  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Performance check: detect low-end devices (< 2 cores)
  const isLowEndDevice = typeof window !== 'undefined' && 
    (navigator.hardwareConcurrency || 4) < 2;

  // Performance check: detect overload if > 150 animations concurrently active
  const isPerformanceConstrained = typeof window !== 'undefined' && 
    animationPerformanceMetrics.totalAnimations > 150;

  // Check if animations should be disabled globally
  const globallyDisabled = !globalConfig.masterSwitch || 
    (globalConfig.respectReducedMotion && prefersReducedMotion);

  // Track metrics with proper lifecycle cleanup
  useEffect(() => {
    animationPerformanceMetrics.totalAnimations++;
    if (prefersReducedMotion) animationPerformanceMetrics.disabledForAccessibility++;
    if (isLowEndDevice || isPerformanceConstrained) animationPerformanceMetrics.disabledForPerformance++;

    return () => {
      animationPerformanceMetrics.totalAnimations = Math.max(0, animationPerformanceMetrics.totalAnimations - 1);
    };
  }, [prefersReducedMotion, isLowEndDevice, isPerformanceConstrained]);

  // Get component-specific config if componentId is provided
  const componentConfig = componentId 
    ? (settings as any)?.animationConfig?.components?.find((c: any) => c.componentId === componentId)
    : null;

  // Get element-specific config if elementId is provided
  const elementConfig = elementId && componentConfig?.elements?.[elementId]
    ? componentConfig.elements[elementId]
    : null;

  // Determine which properties to use (priority: custom > element > component > preset > global defaults)
  const resolvedProperties = useMemo(() => {
    let properties: AnimationProperties;

    // Start with preset if provided
    if (presetId) {
      const preset = getPresetById(presetId);
      if (preset) {
        properties = { ...preset.properties };
      } else {
        properties = createDefaultProperties(globalConfig.defaults);
      }
    } else if (elementConfig?.presetId) {
      const preset = getPresetById(elementConfig.presetId);
      properties = preset ? { ...preset.properties } : createDefaultProperties(globalConfig.defaults);
    } else if (componentConfig?.presetId) {
      const preset = getPresetById(componentConfig.presetId);
      properties = preset ? { ...preset.properties } : createDefaultProperties(globalConfig.defaults);
    } else {
      properties = createDefaultProperties(globalConfig.defaults);
    }

    // Apply element config overrides
    if (elementConfig?.customProperties) {
      properties = mergeProperties(properties, elementConfig.customProperties);
    }

    // Apply component config overrides
    if (componentConfig?.customProperties) {
      properties = mergeProperties(properties, componentConfig.customProperties);
    }

    // Apply custom properties passed to hook
    if (customProperties) {
      properties = mergeProperties(properties, customProperties);
    }

    // Check if component/element is explicitly disabled
    if (elementConfig?.enabled === false || componentConfig?.enabled === false) {
      properties.enabled = false;
    }

    // Apply global mobile simplification if enabled
    if (globalConfig.mobileAnimations.simplified && isMobile()) {
      properties = simplifyForMobile(properties);
    }

    // Performance: Disable expensive animations on low-end devices
    if (isLowEndDevice) {
      properties = simplifyForPerformance(properties);
    }

    // Performance: Disable animations if too many on page
    if (isPerformanceConstrained) {
      properties.enabled = false;
    }

    // Accessibility: Disable animations for reduced motion preference
    if (prefersReducedMotion) {
      properties.enabled = false;
    }

    // Disable scroll animations if globally disabled
    if (!globalConfig.scrollAnimations.enabled && properties.scrollTrigger) {
      properties.scrollTrigger.enabled = false;
    }

    // Disable hover animations if globally disabled
    if (!globalConfig.hoverAnimations.enabled && properties.hover) {
      properties.hover.enabled = false;
    }

    // Disable continuous animations if globally disabled
    if (!globalConfig.continuousAnimations.enabled && 
        (properties.repeat === 'infinite' || properties.loop)) {
      properties.repeat = 'once';
      properties.loop = false;
    }

    return properties;
  }, [
    presetId,
    elementConfig,
    componentConfig,
    customProperties,
    globalConfig,
  ]);

  // Final enabled state
  const enabled = !globallyDisabled && resolvedProperties.enabled;

  // Generate Framer Motion props
  const motionProps = useMemo(() => {
    if (!enabled) {
      return { initial: false, animate: { opacity: 1 } };
    }

    const props: any = {
      initial: getInitialState(resolvedProperties),
      animate: getAnimateState(resolvedProperties),
      transition: getTransition(resolvedProperties),
    };

    // Add scroll trigger if enabled
    if (resolvedProperties.scrollTrigger?.enabled) {
      props.whileInView = getAnimateState(resolvedProperties);
      props.viewport = {
        once: resolvedProperties.scrollTrigger.once ?? globalConfig.defaults.viewportOnce,
        margin: resolvedProperties.scrollTrigger.viewportMargin ?? globalConfig.defaults.scrollTriggerMargin,
      };
    }

    // Add hover effect if enabled
    if (resolvedProperties.hover?.enabled) {
      props.whileHover = getHoverState(resolvedProperties.hover);
    }

    return props;
  }, [enabled, resolvedProperties, globalConfig]);

  // Generate CSS styles for CSS-based animations
  const cssStyles = useMemo(() => {
    if (!enabled) return {};

    const styles: React.CSSProperties = {};

    // Apply continuous animations via CSS
    if (resolvedProperties.repeat === 'infinite' || resolvedProperties.loop) {
      styles.animation = `${getAnimationName(resolvedProperties.type)} ${resolvedProperties.duration}s ease-in-out infinite`;
    }

    // Apply hover styles
    if (resolvedProperties.hover?.enabled) {
      styles.transition = `all ${resolvedProperties.hover.duration || 0.25}s ease-out`;
    }

    return styles;
  }, [enabled, resolvedProperties]);

  // Generate CSS class name
  const cssClassName = useMemo(() => {
    if (!enabled) return '';
    
    const classes: string[] = [];

    // Add animation class based on type
    if (resolvedProperties.scrollTrigger?.enabled) {
      classes.push('animate-on-scroll');
    }

    // Add hover class
    if (resolvedProperties.hover?.enabled) {
      classes.push(getHoverClassName(resolvedProperties.hover.type));
    }

    return classes.join(' ');
  }, [enabled, resolvedProperties]);

  return {
    enabled,
    properties: resolvedProperties,
    motionProps,
    cssStyles,
    cssClassName,
  };
};

// Helper functions

function createDefaultProperties(defaults: any): AnimationProperties {
  return {
    enabled: true,
    type: 'fade-up',
    duration: defaults.duration || 0.6,
    delay: defaults.delay || 0,
    easing: defaults.easing || [0.22, 1, 0.36, 1],
    repeat: 'once',
    loop: false,
    scrollTrigger: {
      enabled: true,
      viewportMargin: defaults.scrollTriggerMargin || '-100px',
      once: defaults.viewportOnce ?? true,
    },
  };
}

function mergeProperties(base: AnimationProperties, override: Partial<AnimationProperties>): AnimationProperties {
  return {
    ...base,
    ...override,
    scrollTrigger: {
      enabled: override.scrollTrigger?.enabled ?? base.scrollTrigger?.enabled ?? true,
      viewportMargin: override.scrollTrigger?.viewportMargin ?? base.scrollTrigger?.viewportMargin ?? '-100px',
      once: override.scrollTrigger?.once ?? base.scrollTrigger?.once ?? true,
    },
    hover: override.hover ? {
      enabled: override.hover.enabled ?? false,
      type: override.hover.type ?? base.hover?.type ?? 'scale-in',
      scale: override.hover.scale,
      translateY: override.hover.translateY,
      translateX: override.hover.translateX,
      duration: override.hover.duration,
      easing: override.hover.easing,
    } : base.hover,
    stagger: override.stagger ? {
      enabled: override.stagger.enabled ?? false,
      delay: override.stagger.delay ?? 0,
      from: override.stagger.from,
    } : base.stagger,
    responsive: {
      desktop: override.responsive?.desktop,
      tablet: override.responsive?.tablet,
      mobile: override.responsive?.mobile,
    },
  };
}

function getInitialState(properties: AnimationProperties): any {
  const state: any = { opacity: properties.opacity?.start ?? 0 };

  switch (properties.type) {
    case 'fade-up':
    case 'slide-up':
      state.y = properties.distance || 30;
      break;
    case 'fade-down':
      state.y = -(properties.distance || 30);
      break;
    case 'fade-left':
    case 'slide-left':
      state.x = properties.distance || 30;
      break;
    case 'fade-right':
    case 'slide-right':
      state.x = -(properties.distance || 30);
      break;
    case 'scale-in':
    case 'zoom-in':
      state.scale = properties.scale?.start ?? 0.9;
      break;
    case 'scale-out':
    case 'zoom-out':
      state.scale = properties.scale?.start ?? 1.1;
      break;
    case 'rotate':
      state.rotate = properties.rotation?.start ?? -10;
      break;
    default:
      break;
  }

  return state;
}

function getAnimateState(properties: AnimationProperties): any {
  const state: any = { opacity: properties.opacity?.end ?? 1 };

  switch (properties.type) {
    case 'fade-up':
    case 'fade-down':
    case 'slide-up':
    case 'slide-left':
    case 'slide-right':
    case 'fade-left':
    case 'fade-right':
      state.y = 0;
      state.x = 0;
      break;
    case 'scale-in':
    case 'zoom-in':
    case 'scale-out':
    case 'zoom-out':
      state.scale = properties.scale?.end ?? 1;
      break;
    case 'rotate':
      state.rotate = properties.rotation?.end ?? 0;
      break;
    default:
      break;
  }

  return state;
}

function getTransition(properties: AnimationProperties): any {
  return {
    duration: properties.duration,
    delay: properties.delay,
    ease: normalizeEasing(properties.easing),
  };
}

function getHoverState(hover: NonNullable<AnimationProperties['hover']>): any {
  const state: any = {};

  if (hover.scale) state.scale = hover.scale;
  if (hover.translateY) state.y = hover.translateY;
  if (hover.translateX) state.x = hover.translateX;

  return {
    ...state,
    transition: {
      duration: hover.duration || 0.25,
      ease: hover.easing ? normalizeEasing(hover.easing) : [0.16, 1, 0.3, 1],
    },
  };
}

function normalizeEasing(easing: EasingType | number[]): any {
  if (Array.isArray(easing)) return easing;
  
  switch (easing) {
    case 'linear': return [0, 0, 1, 1];
    case 'ease': return [0.25, 0.1, 0.25, 1];
    case 'ease-in': return [0.42, 0, 1, 1];
    case 'ease-out': return [0, 0, 0.58, 1];
    case 'ease-in-out': return [0.42, 0, 0.58, 1];
    default: return [0.22, 1, 0.36, 1];
  }
}

function getAnimationName(type: AnimationType): string {
  const nameMap: Record<AnimationType, string> = {
    'fade': 'fadeIn',
    'fade-up': 'fadeInUp',
    'fade-down': 'fadeInDown',
    'fade-left': 'fadeInLeft',
    'fade-right': 'fadeInRight',
    'slide-up': 'slideInUp',
    'slide-down': 'slideInDown',
    'slide-left': 'slideInLeft',
    'slide-right': 'slideInRight',
    'zoom-in': 'scaleIn',
    'zoom-out': 'scaleOut',
    'scale-in': 'scaleIn',
    'scale-out': 'scaleOut',
    'rotate': 'rotateSlow',
    'float': 'float',
    'float-up-down': 'floatUpDown',
    'float-left-right': 'floatLeftRight',
    'pulse': 'pulseSlow',
    'pulse-glow': 'pulseGlow',
    'shimmer': 'shimmer',
    'shimmer-text': 'shimmerText',
    'gradient-shift': 'gradientShift',
    'wave-flow': 'waveFlow',
    'orbit-float': 'orbitFloat',
    'scale-breath': 'scaleBreath',
    'parallax': 'parallax',
    'custom': 'custom',
  };

  return nameMap[type] || 'fadeIn';
}

function getHoverClassName(type: AnimationType): string {
  const classMap: Record<AnimationType, string> = {
    'fade-up': 'hover-lift',
    'scale-in': 'hover-scale',
    'pulse-glow': 'hover-glow',
  } as any;

  return classMap[type] || 'hover-lift';
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

function simplifyForMobile(properties: AnimationProperties): AnimationProperties {
  return {
    ...properties,
    duration: Math.min(properties.duration, 0.4),
    repeat: 'once', // Disable heavy infinite animations on mobile
    loop: false,
  };
}

function simplifyForPerformance(properties: AnimationProperties): AnimationProperties {
  return {
    ...properties,
    duration: Math.min(properties.duration, 0.3),
    repeat: 'once',
    loop: false,
    hover: properties.hover ? {
      ...properties.hover,
      enabled: false, // Disable hover effects on low-end devices
    } : properties.hover,
  };
}

export default useCMSAnimation;
