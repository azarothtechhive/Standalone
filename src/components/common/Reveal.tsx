import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useCMSAnimation } from '../../hooks/useCMSAnimation';

type RevealProps = Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'whileInView' | 'viewport' | 'transition'
> & {
  delay?: number;
  y?: number;
  duration?: number;
  componentId?: string;
  elementId?: string;
  presetId?: string;
  useCMS?: boolean; // Opt-in to CMS configuration
};

export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  y = 30,
  duration = 0.6,
  componentId,
  elementId,
  presetId,
  useCMS = true,
  children,
  ...rest
}) => {
  // Use CMS animation configuration if enabled
  const cmsAnimation = useCMSAnimation({
    componentId,
    elementId,
    presetId,
    customProperties: useCMS ? undefined : {
      duration,
      delay,
      type: 'fade-up',
      distance: y,
    },
  });

  // If CMS is disabled or not configured, use legacy behavior
  if (!useCMS || !cmsAnimation.enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-80px' }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  // Use CMS-driven animation configuration
  return (
    <motion.div
      {...cmsAnimation.motionProps}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
