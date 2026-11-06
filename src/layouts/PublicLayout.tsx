import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { BackToTop } from '../components/common/BackToTop';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Chatbot } from '../components/common/Chatbot';
import { CustomCursor } from '../components/common/CustomCursor';
import { AdminFloatingBadge } from '../components/common/AdminFloatingBadge';
import { useCMS } from '../context/CMSContext';

const RouteEffects: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace('#', ''));
      window.requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }
          target.focus({ preventScroll: true });
        }
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export const PublicLayout: React.FC = () => {
  const mainRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const { settings } = useCMS();

  useEffect(() => {
    mainRef.current?.setAttribute('tabindex', '-1');
  }, [location.pathname]);

  // Dynamically synchronize CMS theme colors and favicon without requiring code changes
  useEffect(() => {
    if (!settings) return;

    const theme = settings.themeConfig;
    const root = document.documentElement;

    const primary = theme?.primaryColor || settings.primary_color;
    if (primary) {
      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-primary-button', primary);
      root.style.setProperty('--color-link-main', primary);
      root.style.setProperty('--color-nav-active', primary);
    }

    const secondary = theme?.secondaryColor || settings.secondary_color;
    if (secondary) {
      root.style.setProperty('--color-primary-button-hover', secondary);
    }

    const accent = theme?.accentColor || settings.accent_color;
    if (accent) {
      root.style.setProperty('--color-brand-gold', accent);
      root.style.setProperty('--color-nav-indicator', accent);
    }

    const bg = theme?.backgroundColor || settings.background_color;
    if (bg) {
      root.style.setProperty('--color-canvas-bg', bg);
      root.style.setProperty('--bg', bg);
      root.style.setProperty('--color-bg-white', bg);
    }

    const textColor = theme?.textColor;
    if (textColor) {
      root.style.setProperty('--color-text-main', textColor);
    }

    if (settings.faviconUrl) {
      const faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (faviconLink) {
        faviconLink.href = settings.faviconUrl;
      }
    }
  }, [settings]);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            zIndex: 200,
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--color-primary-button, #18181B)',
            color: '#ffffff',
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: '0 0 var(--radius-md, 8px) 0',
          }}
          onFocus={(event) => {
            event.currentTarget.style.left = '0';
          }}
          onBlur={(event) => {
            event.currentTarget.style.left = '-9999px';
          }}
        >
          Skip to main content
        </a>
        <RouteEffects />
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
        <main id="main-content" ref={mainRef} style={{ flex: '1 0 auto', paddingTop: 'clamp(3.5rem, 5vw, 4.75rem)' }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
        <BackToTop />
        <Chatbot />
        <CustomCursor />
        <AdminFloatingBadge />
      </div>
    </MotionConfig>
  );
};
