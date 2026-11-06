import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareQuote } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Reveal } from '../common/Reveal';
import { TestimonialCard } from '../testimonials/TestimonialCard';

export const Testimonials: React.FC = () => {
  const { testimonials, pages } = useCMS();
  const testimonialsPage = pages['testimonials'] || {};
  const sectionBadge = testimonialsPage.sectionBadge || 'CLIENT TESTIMONIALS —';
  const sectionTitle = testimonialsPage.sectionTitle || 'What Our Clients';
  const sectionTitleHighlight = testimonialsPage.sectionTitleHighlight || 'Say';
  const sectionSubtitle =
    testimonialsPage.sectionSubtitle ||
    'Real feedback from enterprise leaders, founders, and technology executives who trust Azaroth Tech-Hive to architect and build their software platforms.';

  const sortedTestimonials = useMemo(
    () =>
      [...(testimonials || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [testimonials],
  );

  return (
    <section
      id="testimonials"
      style={{
        backgroundColor: '#FFFFFF',
        paddingTop: '5rem',
        paddingBottom: '5.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Client Testimonials"
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
            alignItems: 'end',
            marginBottom: '3rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: '640px' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#49243F',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              {sectionBadge}
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
                fontWeight: 600,
                color: '#1E293B',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '1.25rem',
              }}
            >
              {sectionTitle}{' '}
              <span
                style={{
                  background: 'var(--gradient-heading)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {sectionTitleHighlight}
              </span>
            </h2>

            <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
              {sectionSubtitle}
            </p>
          </motion.div>

          {sortedTestimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                justifySelf: 'end',
              }}
            >
              {/* <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(201, 155, 82, 0.12)',
                  color: '#C99B52',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <Star size={28} fill="#C99B52" />
              </div> */}
              {/* <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.1 }}>
                  {averageRating.toFixed(1)} / 5.0
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Average rating from {sortedTestimonials.length} verified{' '}
                  {sortedTestimonials.length === 1 ? 'review' : 'reviews'}
                </div>
              </div> */}
            </motion.div>
          )}
        </div>

        {sortedTestimonials.length === 0 ? (
          <Reveal
            style={{
              padding: '3rem 1.5rem',
              borderRadius: 'var(--radius-xl, 18px)',
              border: '1px dashed rgba(73, 36, 63, 0.25)',
              backgroundColor: '#F8FAFC',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(73, 36, 63, 0.08)',
                marginBottom: '1rem',
                color: '#49243F',
              }}
            >
              <MessageSquareQuote size={22} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1E293B' }}>
              Client testimonials are being prepared
            </h3>
            <p style={{ margin: 0 }}>
              Our latest client endorsements will be published here shortly.
            </p>
          </Reveal>
        ) : (
          <div className="testimonials-grid">
            {sortedTestimonials.map((testimonial, index) => (
              <Reveal
                key={testimonial.id}
                delay={index * 0.06}
                style={{ display: 'flex', height: '100%' }}
              >
                <TestimonialCard testimonial={testimonial} featured={testimonial.isFeatured} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: 1.5rem;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 34px rgba(73, 36, 63, 0.14) !important;
          border-color: rgba(73, 36, 63, 0.35) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .testimonial-card,
          .testimonial-card:hover {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
