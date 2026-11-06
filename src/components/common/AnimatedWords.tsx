import React from 'react';
import { motion } from 'framer-motion';
import { useCMSAnimation } from '../../hooks/useCMSAnimation';

interface AnimatedWordsProps {
  text: string;
  componentId?: string;
  elementId?: string;
  presetId?: string;
  useCMS?: boolean;
}

export const AnimatedWords: React.FC<AnimatedWordsProps> = ({ 
  text,
  componentId,
  elementId,
  presetId,
  useCMS = true,
}) => {
  const words = text.split(' ').map((word) => ({ text: word, className: '' }));

  // Use CMS animation configuration if enabled
  const cmsAnimation = useCMSAnimation({
    componentId,
    elementId,
    presetId,
    customProperties: useCMS ? undefined : {
      duration: 0.85,
      delay: 0.15,
      type: 'fade-up',
      stagger: {
        enabled: true,
        delay: 0.08,
      },
    },
  });

  const baseDelay = useCMS ? cmsAnimation.properties.delay : 0.15;
  const baseDuration = useCMS ? cmsAnimation.properties.duration : 0.85;
  const staggerDelay = useCMS ? cmsAnimation.properties.stagger?.delay ?? 0.08 : 0.08;
  const easing = useCMS
    ? Array.isArray(cmsAnimation.properties.easing)
      ? (cmsAnimation.properties.easing as [number, number, number, number])
      : [0.22, 1, 0.36, 1]
    : [0.22, 1, 0.36, 1];

  return (
    <span style={{ display: 'inline-block' }}>
      {words.map((word, index) => (
        <span key={`${word.text}-${index}`} style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          marginRight: '0.26em',
          paddingBottom: '0.25rem',
        }}>
          <motion.span
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: baseDuration,
              delay: baseDelay + index * staggerDelay,
              ease: easing as any,
            }}
            style={{ display: 'inline-block' }}
          >
            {word.text}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
