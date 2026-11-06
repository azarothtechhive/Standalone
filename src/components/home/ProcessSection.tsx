import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { deliveryStages } from '../../data/deliveryData';

export const ProcessSection: React.FC = () => {
  return (
    <section style={{
      backgroundColor: 'var(--color-surface-muted)',
      padding: '5rem 0',
    }}>
      <div className="container" style={{ position: 'relative' }}>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}
        >
          <Badge variant="gold" style={{ marginBottom: '1rem' }}>
            Our Process
          </Badge>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '1rem',
            lineHeight: 1.25,
          }}>
            Turning Ideas Into Impact
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.65,
          }}>
            Every engagement moves through the same six-stage delivery framework, from discovery and solution design through testing and deployment to continuous improvement. Here is the short version of each stage.
          </p>
        </motion.div>

        {/* Delivery Framework Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          position: 'relative',
        }}>
          {deliveryStages.map((stage, index) => (
            <motion.div
              key={stage.stageNumber}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                backgroundColor: 'var(--color-canvas-card)',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border)',
                position: 'relative',
                transition: 'all 180ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--color-brand-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              {/* Step Number */}
              <div style={{
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--color-brand-violet-glow)',
                marginBottom: '0.75rem',
                lineHeight: 1,
              }}>
                {`0${stage.stageNumber}`}
              </div>

              {/* Stage Title */}
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '0.5rem',
                lineHeight: 1.35,
              }}>
                {stage.title}
              </h3>

              {/* Stage Short Summary */}
              <p style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}>
                {stage.tagline}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Framework CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginTop: '2.5rem' }}
        >
          <Link
            to="/about#delivery-framework"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-brand-violet)',
              textDecoration: 'none',
            }}
          >
            <span>Explore the delivery framework</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
