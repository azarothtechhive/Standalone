import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '6.5rem',
        right: '1.5rem',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary-button, #18181B)',
        color: '#ffffff',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(24, 24, 27, 0.35)',
        transition: 'all 180ms ease-out',
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272A';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#18181B';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      aria-label="Back to top"
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  );
};
