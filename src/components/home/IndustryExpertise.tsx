import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { industryExpertiseData } from '../../data/industryData';
import { ChevronRight } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

interface ExpertiseSection {
  key: 'challenge' | 'architecture' | 'outcome';
  label: string;
  field: 'challenge' | 'architecture' | 'outcome';
}

const SECTIONS: ({ num: number } & ExpertiseSection)[] = [
  { num: 1, key: 'challenge', label: 'Challenge', field: 'challenge' },
  { num: 2, key: 'architecture', label: 'Architecture', field: 'architecture' },
  { num: 3, key: 'outcome', label: 'Outcome', field: 'outcome' },
];

const SECTION_STYLE: Record<string, { text: string; bg: string; border: string }> = {
  challenge: {
    text: 'var(--color-brand-violet)',
    bg: 'var(--color-surface-muted)',
    border: 'var(--color-border)',
  },
  architecture: {
    text: 'var(--color-brand-gold-text)',
    bg: 'var(--color-brand-gold-light)',
    border: 'var(--color-brand-gold-border)',
  },
  outcome: {
    text: 'var(--color-brand-emerald)',
    bg: 'var(--color-surface-muted)',
    border: 'var(--color-border)',
  },
};

export const IndustryExpertise: React.FC = () => {
  const { pages } = useCMS();
  const industrySection = pages['home']?.industrySection || {};
  const activeIndustries =
    Array.isArray(industrySection.industries) && industrySection.industries.length > 0
      ? industrySection.industries
      : industryExpertiseData;

  const sectionTitle = industrySection.title || 'Our Specialised Engineering Across';
  const sectionTitleHighlight = industrySection.titleHighlight || 'Diverse Industries';
  const sectionSubtitle =
    industrySection.subtitle ||
    'We engineer for the operating realities of each industry: we learn the business and operational challenge first, then shape architecture, integrations, and automation around it.';

  const [selectedId, setSelectedId] = useState<string>(activeIndustries[0]?.id ?? '');
  const industry = activeIndustries.find((item: any) => item.id === selectedId) ?? activeIndustries[0];

  const isSelected = (id: string) => id === (industry?.id || selectedId);

  return (
    <section className="section" style={{ backgroundColor: '#ffffff' }} aria-labelledby="industry-expertise-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'left', width: '100%', margin: '0 0 2rem 0' }}
        >
          <h2
            id="industry-expertise-heading"
            style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
              fontWeight: 600,
               maxWidth: "1300px",
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              fontFamily: 'var(--font-heading)',
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
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="industry-expertise-grid" style={{ display: 'grid', gap: '2.5rem', alignItems: 'start' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="industry-buttons-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
          >
            {activeIndustries.map((item: any, idx: number) => {
              const selected = isSelected(item.id);
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    width: '100%',
                    minHeight: '3.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-xl)',
                    border: selected ? 'none' : '1px solid var(--color-border)',
                    backgroundColor: selected ? 'var(--color-brand-magenta)' : 'var(--color-white)',
                    color: selected ? 'var(--color-white)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease-out',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = selected ? 'transparent' : 'var(--color-brand-violet)';
                    e.currentTarget.style.backgroundColor = selected
                      ? 'var(--color-brand-violet)'
                      : 'var(--color-surface-soft)';
                    e.currentTarget.style.boxShadow = selected ? 'var(--shadow-md)' : 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = selected ? 'none' : 'var(--color-border)';
                    e.currentTarget.style.backgroundColor = selected
                      ? 'var(--color-brand-magenta)'
                      : 'var(--color-white)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          lineHeight: 1.25,
                          color: selected ? 'var(--color-white)' : 'var(--color-text-primary)',
                        }}
                      >
                        {item.industry}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: selected ? 'var(--color-indigo-200)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      aria-hidden="true"
                      style={{
                        color: selected ? 'var(--color-white)' : 'var(--color-text-muted)',
                        flexShrink: 0,
                        transition: 'color 200ms ease-out',
                      }}
                    />
                  </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* The key remounts this panel whenever the selected industry changes,
              so the fade-up animation plays again for every selection. */}
          <motion.div
            key={industry.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div
              style={{
                padding: '1.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                backgroundColor: 'var(--color-white)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-brand-violet)',
                    backgroundColor: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  ENGINEERING PRACTICE
                </span> */}
                {/* <button
                  type="button"
                  aria-label="View capabilities"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-brand-violet)',
                    backgroundColor: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-violet)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  View Capabilities
                  <ArrowRight size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
                </button> */}
              </div>

              <h3
                style={{
                  fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 1.25rem 0',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.25,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {industry.industry}
              </h3>

              {SECTIONS.map((section, sidx) => {
                const style = SECTION_STYLE[section.key];
                return (
                  <motion.div
                    key={section.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: 0.2 + sidx * 0.08 }}
                  >
                    <div
                      key={section.key}
                      style={{
                        backgroundColor: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: 'var(--radius-xl)',
                      padding: '1rem',
                      marginBottom: section.key === 'outcome' ? 0 : '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.375rem',
                        marginBottom: '0.625rem',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: style.text,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          lineHeight: 1.2,
                        }}
                      >
                        {section.num}. {section.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {industry[section.field]}
                    </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .industry-expertise-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .industry-expertise-grid {
            grid-template-columns: 340px 1fr !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .industry-buttons-list {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
        }
        @media (max-width: 768px) {
          .industry-expertise-grid {
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};
