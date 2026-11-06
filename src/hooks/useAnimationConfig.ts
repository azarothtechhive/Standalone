import { useContext } from 'react';
import { useCMS } from '../context/CMSContext';

interface AnimationDefaults {
  duration: number;
  delay: number;
  easing: any;
  scrollTriggerMargin: string;
  viewportOnce: boolean;
}

interface SectionAnimationConfig {
  enabled?: boolean;
  badgeAnimationEnabled?: boolean;
  traceAnimationEnabled?: boolean;
  metricsAnimationEnabled?: boolean;
  imageAnimation?: string;
  contentAnimation?: string;
  cardAnimation?: string;
  staggerDelay?: number;
  hoverAnimation?: string;
  itemAnimation?: string;
  animation?: string;
}

interface AnimationConfigResult {
  enabled: boolean;
  respectReducedMotion: boolean;
  defaults: AnimationDefaults;
  section: SectionAnimationConfig | null;
  hoverEffects: any;
}

export const useAnimationConfig = (section?: string): AnimationConfigResult => {
  const { settings } = useCMS();
  const globalConfig = (settings as any).animationConfig;
  const sectionConfig = section ? globalConfig?.sections?.[section] : null;
  
  const defaults: AnimationDefaults = globalConfig?.defaults || {
    duration: 0.6,
    delay: 0,
    easing: [0.22, 1, 0.36, 1],
    scrollTriggerMargin: "-100px",
    viewportOnce: false,
  };
  
  return {
    enabled: globalConfig?.enabled !== false && (sectionConfig?.enabled !== false),
    respectReducedMotion: globalConfig?.respectReducedMotion !== false,
    defaults,
    section: sectionConfig,
    hoverEffects: globalConfig?.hoverEffects,
  };
};

export default useAnimationConfig;
