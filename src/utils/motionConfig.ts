import type { CSSProperties } from 'react';
import type { MotionProps } from 'framer-motion';

type MotionConfig = {
  enabled?: boolean;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  viewportMargin?: string;
  ease?: any;
};

type GradientConfig = {
  from?: string;
  to?: string;
  angle?: number;
};

export function getAppearanceStyles(appearance?: CSSProperties): CSSProperties | undefined {
  return appearance;
}

export function getGradientHeadingStyle(
  gradient: string | GradientConfig
): CSSProperties {
  const backgroundImage = typeof gradient === 'string'
    ? gradient
    : `linear-gradient(${gradient.angle ?? 90}deg, ${gradient.from ?? 'currentColor'}, ${gradient.to ?? 'currentColor'})`;

  return {
    backgroundImage,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  };
}

export function getMotionProps(
  config: MotionConfig | undefined,
  defaults: { defaultDelay: number; defaultY: number },
  globalConfig?: {
    enabled?: boolean;
    defaults?: {
      duration?: number;
      easing?: any;
      scrollTriggerMargin?: string;
      viewportOnce?: boolean;
    };
  }
): MotionProps {
  // Check if animations are globally disabled
  if (config?.enabled === false || globalConfig?.enabled === false) {
    return { initial: false };
  }

  return {
    initial: { opacity: 0, y: config?.y ?? defaults.defaultY },
    whileInView: { opacity: 1, y: 0 },
    viewport: { 
      once: config?.once ?? globalConfig?.defaults?.viewportOnce ?? true,
      margin: config?.viewportMargin ?? globalConfig?.defaults?.scrollTriggerMargin ?? '-100px'
    },
    transition: {
      duration: config?.duration ?? globalConfig?.defaults?.duration ?? 0.6,
      delay: config?.delay ?? defaults.defaultDelay,
      ease: config?.ease ?? globalConfig?.defaults?.easing ?? [0.22, 1, 0.36, 1],
    },
  };
}
