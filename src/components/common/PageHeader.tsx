import React from 'react';
import { motion } from 'framer-motion';

const revealProps = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  gradientWords?: string[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  gradientWords = [],
  actions
}) => {
  // Split title to apply gradient to specific words
  const renderTitle = () => {
    if (gradientWords.length === 0) {
      return title;
    }

    const parts = title.split(/(\s+)/);
    return parts.map((part, index) => {
      const trimmedPart = part.trim();
      if (trimmedPart && gradientWords.includes(trimmedPart)) {
        return (
          <span
            key={index}
            style={{
              background: 'var(--gradient-heading)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section
      style={{
        backgroundColor: 'var(--color-canvas-bg, #FFFFFF)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border, #E2E8F0)',
      }}
      className={`page-header-section${actions ? ' page-header-section--with-actions' : ''}`}
    >
      {/* Decorative architectural background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(24, 24, 27, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(73, 36, 63, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(24, 24, 27, 0.02) 0%, transparent 50%),
            linear-gradient(135deg, rgba(24, 24, 27, 0.01) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(24, 24, 27, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24, 24, 27, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      {/* Floating brand ambient glows */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.05) 0%, rgba(73, 36, 63, 0.03) 100%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(73, 36, 63, 0.05) 0%, rgba(24, 24, 27, 0.02) 100%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="page-header-content"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* <div
        className="container"
        style={{
          textAlign: 'center',
          maxWidth: '110%',
          position: 'relative',
          zIndex: 1,
          marginLeft: '0',
          marginRight: '0',
          paddingLeft: '0',
          paddingRight: '0',
        }}
      > */}
        {/* Kicker text */}
        {/* {kicker && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: '#49243F',
              animation: 'fadeInUp 1s ease-out 0.3s forwards',
              opacity: 0,
            }}
            className="page-header-kicker"
          >
            {kicker}
          </div>
        )} */}

        {/* Main title */}
        <motion.h1
          {...revealProps(0.1)}
          style={{
            fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)',
            fontWeight: 600,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.22,
            marginBottom: '1rem',
          }}
          className="page-header-title"
        >
          {renderTitle()}
        </motion.h1>

        {/* Subtitle if provided */}
        {subtitle && (
          <motion.p
            {...revealProps(0.2)}
            style={{
              fontSize: "1.0625rem",
              color: "#334155",
              lineHeight: 1.65,
              width: "100%",
              maxWidth: "none",
              margin: "0",
              textAlign: "left",
            }}
            className="page-header-subtitle"
          >
            {subtitle}
          </motion.p>
        )}



        {/* Actions if provided */}
        {actions && (
          <motion.div
            {...revealProps(0.3)}
            style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
            className="page-header-actions"
          >
            {actions}
          </motion.div>
        )}
      </div>

      <style>{`
        .page-header-section {
          padding-top: 5rem;
          padding-bottom: 3rem;
        }
        .page-header-section--with-actions {
          padding-bottom: 4rem;
        }
        .page-header-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: left;
          transform: translateY(-2.5rem);
        }
        @media (min-width: 768px) {
          .page-header-content {
            padding: 0 4rem;
          }
        }
        @media (max-width: 640px) {
          .page-header-section {
            padding-top: 7.5rem;
            padding-bottom: 3.5rem;
          }
          .page-header-section--with-actions {
            padding-bottom: 3rem;
          }
          .page-header-content {
            padding: 0 1rem !important;
            transform: translateY(-1.75rem);
          }
        }
      `}</style>
    </section>
  );
};

export default PageHeader;
