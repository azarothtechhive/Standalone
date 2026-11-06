import React from 'react';
import { MapPin, Mail, ExternalLink } from 'lucide-react';
import { companyInfo } from '../data/companyData';
import { ContactForm } from '../components/contact/ContactForm';
import { ContactFaq } from '../components/contact/ContactFaq';
import { SEOHead } from '../components/common/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Reveal } from '../components/common/Reveal';
import { useCMS } from '../context/CMSContext';
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from '../components/common/CmsPageLayout';

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const Connect: React.FC = () => {
  const { settings, pages } = useCMS();
  const connectPage = pages['connect'] || {};
  const heroKicker = connectPage.kicker || '- CONNECT WITH US -';
  const heroTitle = connectPage.heroTitle || 'Connect With Us';
  const heroSubtitle =
    connectPage.heroSubtitle ||
    "Every great solution starts with a conversation. Whether you have a question, want to discuss a project, or explore how we can help, we're ready to listen and respond.";
  const officeHeading =
    connectPage.officeHeading || 'Connect With Our Engineering Team';
  const seoTitle = connectPage.seoTitle || 'Connect With Us — Azaroth Tech-Hive';
  const seoDescription =
    connectPage.seoDescription ||
    'Contact Azaroth Tech-Hive by phone, WhatsApp, or email from our Chennai office, or submit project inquiries through the online contact form.';
  const seoCanonicalPath = connectPage.seoCanonicalPath || '/connect-with-us';

  const address = settings.headquarters || settings.headquarters_address || companyInfo.headquarters.address;
  const phone = settings.phone || settings.primary_phone || companyInfo.headquarters.phone;
  const email = settings.supportEmail || settings.primary_email || companyInfo.headquarters.email;
  const whatsapp = settings.whatsapp_number || companyInfo.headquarters.whatsapp;
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      <CmsPageLayout pageSlug="connect" page={connectPage}>
      {/* Page Hero */}
      <CmsPageSectionSlot id="hero">
        <PageHeader
          kicker={heroKicker}
          title={heroTitle}
          gradientWords={['Connect', 'Us', 'Conversation', 'Team']}
          subtitle={heroSubtitle}
        />
      </CmsPageSectionSlot>

      {/* Main Split Section: Office Info + Contact Form */}
      <CmsPageSectionSlot id="contact">
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="contact-layout">
            {/* Left Column: Office Credentials */}
            <Reveal>
              <h2
                style={{
                  fontSize: 'clamp(1.65rem, 3vw, 2.15rem)',
                  fontWeight: 600,
                  color: '#1E293B',
                  marginBottom: '1rem',
                  lineHeight: 1.25,
                }}
              >
                {officeHeading}
              </h2>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1.25rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                }}
              >
                {/* Address */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(73, 36, 63, 0.08)',
                      color: '#49243F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: '#1E293B',
                        lineHeight: 1.5,
                      }}
                    >
                      {address}
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <WhatsAppIcon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chat on WhatsApp: ${phone}`}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1E293B',
                        textDecoration: 'none',
                        letterSpacing: '0.01em',
                      }}
                      className="hover:text-rose-700"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={`mailto:${email}`}
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: '#1E293B',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        overflowWrap: 'anywhere',
                      }}
                      className="hover:text-rose-700"
                    >
                      <span>{email}</span>
                      <ExternalLink size={13} style={{ color: '#49243F', flexShrink: 0 }} />
                    </a>
                  </div>
                </div>

                {/* Optional Office Hours / Response SLA (CMS Configurable) */}
                {(connectPage.officeHours || connectPage.responseSla) && (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      backgroundColor: '#F8FAFC',
                      borderTop: '1px solid #F1F5F9',
                      fontSize: '0.8125rem',
                      color: '#64748B',
                    }}
                  >
                    {connectPage.officeHours && (
                      <div>
                        <strong style={{ color: '#1E293B' }}>Hours:</strong> {connectPage.officeHours}
                      </div>
                    )}
                    {connectPage.responseSla && (
                      <div>
                        <strong style={{ color: '#047857' }}>SLA:</strong> {connectPage.responseSla}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <ContactFaq />
            </Reveal>

            {/* Right Column: Enquiry Form */}
            <Reveal delay={0.1}>
              <div className="contact-form-column">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>
      </CmsPageLayout>

      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
          gap: 3.5rem;
        }

        .contact-form-column {
          position: sticky;
          top: 6.5rem;
        }

        @media (max-width: 1023px) {
          .contact-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 3rem;
          }

          .contact-form-column {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};
