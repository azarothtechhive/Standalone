import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
//import { Link } from 'react-router-dom';
//import { Button } from '../common/Button';
import { ChevronDown, ChevronUp, ShieldCheck, Zap, Users } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { faqSupportCardImg } from '../../assets/images';

const defaultFaqs = [
  {
    question: 'What industries do you build for?',
    answer: 'We build for retail and digital commerce, education and digital learning, healthcare and health technology, supply chain and logistics, and ERP and business management systems. Industry context shapes the architecture, so we begin by learning which constraints apply to your environment before proposing a solution.',
  },
  {
    question: 'How do engagements start?',
    answer: 'Every engagement starts with discovery: your goals, user needs, existing systems, and technical challenges. That stage produces a written requirements and scope specification, an architecture feasibility assessment, and an agreed delivery horizon, so the build begins against a shared definition of the work.',
  },
  {
    question: 'Can you work with our existing systems and vendors?',
    answer: 'Yes. Discovery includes a review of legacy systems, integrations, and API constraints, and we plan around the third-party platforms and vendors you already depend on. Integration mapping and interface contracts are defined during solution design so the new work fits the landscape you have.',
  },
  {
    question: 'How do you keep scope and communication under control?',
    answer: 'Scope is documented at discovery with explicit boundaries, and changes are assessed against that specification rather than absorbed silently. Communication runs through sprint reviews and iterative builds, with progress, blockers, and decisions surfaced as they happen instead of at the end of a phase.',
  },
  {
    question: 'What happens after launch?',
    answer: 'Deployment is followed by a support stage: monitoring and health checks, issue resolution within the agreed operating model, dependency and framework maintenance, performance tuning, and feature iterations prioritized with you. Coverage is defined in the operating model agreed for your engagement.',
  },
  {
    question: 'How is pricing structured?',
    answer: 'Pricing is scoped per engagement after discovery, once the scope, constraints, and delivery approach are clear. Share your requirements through our Connect portal and our engineering leadership will return a scoped proposal.',
  },
];

export const FAQSection: React.FC = () => {
  const { pages } = useCMS();
  const pageData = pages['home'];
  const faqSection = pageData?.faqSection || {};
  const cmsFaqs = faqSection.faqs || pageData?.content?.faqs;
  const activeFaqs = (Array.isArray(cmsFaqs) && cmsFaqs.length > 0) ? cmsFaqs : defaultFaqs;

  const sectionTitle = faqSection.title || 'Questions Teams Ask';
  const sectionTitleHighlight = faqSection.titleHighlight || 'Before Starting';
  const sectionSubtitle =
    faqSection.subtitle ||
    'Direct answers on how we scope, run, and support enterprise engagements — and where to go when your question is not listed here.';

  const consultCard = faqSection.consultationCard || {};
  const consultBadge = consultCard.badge || 'Technical Consultation';
  const consultTitle = consultCard.title || 'Have a Specific Question About Your Tech Stack?';
  const consultDescription =
    consultCard.description ||
    'Speak directly with our technical leads. We evaluate system constraints, integration feasibility, and deployment roadmaps before any commitment.';
  const consultPerks = Array.isArray(consultCard.perks) && consultCard.perks.length >= 3
    ? consultCard.perks
    : [
        '24-hour scoping & feasibility turnaround',
        'Strict enterprise NDA & confidentiality protection',
        'Direct discussion with Principal Systems Architects',
      ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      style={{
        backgroundColor: 'var(--color-canvas-bg, #FFFFFF)',
        padding: '5rem 0',
        position: 'relative',
      }}
    >
      <style>{`
        .faq-two-col-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .faq-two-col-grid {
            grid-template-columns: 1.15fr 0.85fr;
            gap: 2.75rem;
          }
        }
        @media (max-width: 1023px) {
          .faq-visual-card {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'left', maxWidth: '780px', margin: '0 0 3rem 0' }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
              fontWeight: 600,
              color: 'var(--color-text-primary, #0F172A)',
              marginBottom: '1rem',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
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
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-secondary, #4B5563)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* 2-Column Responsive Layout: Left FAQs (compact), Right Related Card Image */}
        <div className="faq-two-col-grid">
          {/* Left Column: Compact FAQ Accordion */}
          <div>
            <div style={{ margin: '0 0 1.75rem 0' }}>
              {activeFaqs.map((faq: any, index: number) => {
                const buttonId = `faq-question-${index}`;
                const panelId = `faq-answer-${index}`;
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: '-80px' }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      marginBottom: '0.625rem',
                      borderRadius: '10px',
                      border: isOpen
                        ? '1px solid rgba(73, 36, 63, 0.35)'
                        : '1px solid var(--color-border, #E2E8F0)',
                      overflow: 'hidden',
                      backgroundColor: isOpen ? '#FFFFFF' : 'var(--color-canvas-card, #FFFFFF)',
                      boxShadow: isOpen
                        ? '0 4px 14px -2px rgba(73, 36, 63, 0.08)'
                        : '0 1px 3px rgba(0, 0, 0, 0.02)',
                      transition: 'border-color 160ms ease, box-shadow 160ms ease',
                    }}
                  >
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFAQ(index)}
                      style={{
                        width: '100%',
                        padding: '0.90rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        backgroundColor: isOpen ? '#FFF1F2' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 160ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen) {
                          e.currentTarget.style.backgroundColor = '#FDF2F4';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: isOpen ? '#49243F' : 'var(--color-text-primary, #1E293B)',
                          textAlign: 'left',
                          flex: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} aria-hidden="true" style={{ color: '#49243F', flexShrink: 0 }} />
                      ) : (
                        <ChevronDown size={18} aria-hidden="true" style={{ color: '#64748B', flexShrink: 0 }} />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              padding: '0.95rem 1.15rem',
                              borderTop: '1px solid rgba(73, 36, 63, 0.15)',
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary, #4B5563)',
                                lineHeight: 1.65,
                                margin: 0,
                              }}
                            >
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Micro-links beneath FAQs */}
            {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button to="/connect-with-us" variant="primary" size="md">
                Connect with our team
              </Button>
            </div> */}
          </div>

          {/* Right Column: Visual Feature Card with Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="faq-visual-card"
            style={{
              position: 'sticky',
              top: '6rem',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px -4px rgba(73, 36, 63, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Card Image Banner */}
            <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
              <img
                src={faqSupportCardImg}
                alt="Azaroth technical consulting team collaborating on system architecture"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(10, 17, 24, 0.1) 0%, rgba(10, 17, 24, 0.65) 100%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(73, 36, 63, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {consultBadge}
              </span>
            </div>

            {/* Card Content */}
            <div style={{ padding: '1.65rem 1.65rem 1.85rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  lineHeight: 1.35,
                  marginBottom: '0.65rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {consultTitle}
              </h3>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748B',
                  lineHeight: 1.6,
                  marginBottom: '1.35rem',
                }}
              >
                {consultDescription}
              </p>

              {/* Consultation Perks List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.7rem',
                  marginBottom: '1.5rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF1F2',
                      color: '#49243F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={13} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    {consultPerks[0]}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF1F2',
                      color: '#49243F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={13} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    {consultPerks[1]}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF1F2',
                      color: '#49243F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Users size={13} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    {consultPerks[2]}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {/* <Link
                to="/connect-with-us"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--gradient-button)',
                  color: '#FFFFFF',
                  fontSize: '0.90rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(73, 36, 63, 0.3)',
                  transition: 'all 160ms ease',
                }}
                className="hover:opacity-95 hover:shadow-lg"
              >
                <span>Plan Your Next Move</span>
                <ArrowRight size={15} />
              </Link> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
