import React from 'react';
import {
  ArrowRight,
  Check,
  Compass,
  Cpu,
  FileText,
  GraduationCap,
  HeartPulse,
  Layers,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Target,
  Truck,
  Users,
  Workflow,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
import { Reveal } from '../components/common/Reveal';
import { FinalCTA } from '../components/home/FinalCTA';
import { serviceOfferings } from '../data/servicesData';
import { industryExpertiseData } from '../data/industryData';
import { useCMS } from '../context/CMSContext';
import { getPublicServices } from '../utils/publicContent';
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from '../components/common/CmsPageLayout';

const serviceIcon = (name: string) => {
  switch (name) {
    case 'Compass':
      return <Compass size={24} />;
    case 'Users':
      return <Users size={24} />;
    case 'Workflow':
      return <Workflow size={24} />;
    default:
      return <Cpu size={24} />;
  }
};

const industryIcon = (name: string) => {
  switch (name) {
    case 'ShoppingBag':
      return <ShoppingBag size={22} />;
    case 'GraduationCap':
      return <GraduationCap size={22} />;
    case 'HeartPulse':
      return <HeartPulse size={22} />;
    case 'Truck':
      return <Truck size={22} />;
    default:
      return <Layers size={22} />;
  }
};

export const Services: React.FC = () => {
  const { services: cmsServices, pages } = useCMS();
  const servicesPage = pages['services'] || {};
  const heroTitle = servicesPage.heroTitle || 'Engineering Services Built Around';
  const heroTitleHighlight =
    servicesPage.heroTitleHighlight || 'Your Business Goals.';
  const heroSubtitle =
    servicesPage.heroSubtitle ||
    'Four focused practices covering digital transformation, strategic consulting, on-demand engineering teams, and process automation. Each engagement begins with a clear problem statement, an agreed scope, and a practical delivery plan.';
  const practicesTitle =
    servicesPage.practicesTitle || 'Four focused ways we can help';
  const practicesSubtitle =
    servicesPage.practicesSubtitle ||
    'Each practice has its own scope, deliverables, and intended outcomes. Review the details below, then start a conversation about the one that matches your situation.';
  const domainsTitle =
    servicesPage.domainsTitle || 'Where our engineering applies';
  const domainsSubtitle =
    servicesPage.domainsSubtitle ||
    'Our platforms and practices are shaped around the operational realities of these domains. Each area has its own constraints, data considerations, and delivery expectations.';
  const nextStepsTitle =
    servicesPage.nextStepsTitle || 'A clear path from first message to next step';
  const nextStepsSubtitle =
    servicesPage.nextStepsSubtitle ||
    'You do not need a complete specification to start. Share what you know, and we will help you frame the decision.';
  const publicServices = getPublicServices(cmsServices || [], serviceOfferings);
  const industrySection = pages['home']?.industrySection || {};
  const industries =
    Array.isArray(industrySection.industries) && industrySection.industries.length > 0
      ? industrySection.industries
      : industryExpertiseData;

  const seoTitle = servicesPage.seoTitle || "Engineering Services — Digital Transformation, Consulting & Engineering Teams | Azaroth Tech-Hive";
  const seoDescription = servicesPage.seoDescription || "Explore Azaroth Tech-Hive's four engineering practices: digital transformation, strategic consulting, on-demand engineering teams, and business process automation.";
  const seoCanonicalPath = servicesPage.seoCanonicalPath || "/services";

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      <CmsPageLayout pageSlug="services" page={servicesPage}>
      {/* HERO */}
      <CmsPageSectionSlot id="hero">
      <section className="services-hero">
        <div className="services-hero-grid-bg" aria-hidden="true" />
        <div className="services-hero-glow" aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="services-hero-grid">
            <Reveal>
              <div className="services-kicker">
                <Workflow size={16} />
                <span>{servicesPage.kicker || 'Our Services'}</span>
              </div>

              <h1 className="services-hero-title">
                {heroTitle}{' '}
                <span
                  style={{
                    background: 'var(--gradient-heading)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {heroTitleHighlight}
                </span>
              </h1>

              <p className="services-hero-copy">
                {heroSubtitle}
              </p>

              <div className="services-hero-note">
                <ShieldCheck size={15} />
                <span>{servicesPage.heroNote || 'Scope, deliverables, and commercial terms are agreed in writing before work begins.'}</span>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="services-start-card">
                <div className="services-start-title">
                  <Target size={18} />
                  <span>{servicesPage.startCardTitle || servicesPage.startWithWhereYouAre || 'Start with where you are'}</span>
                </div>
                <p className="services-start-copy">
                  {servicesPage.startCardCopy || 'Choose the situation that sounds closest to yours. Each one leads to the practice built for it.'}
                </p>

                <div className="services-start-list">
                  {publicServices.map((service) => (
                    <a
                      key={service.id}
                      href={`#${service.slug}`}
                      className="services-start-row"
                    >
                      <span className="services-start-icon">
                        {serviceIcon(service.iconName)}
                      </span>
                      <span className="services-start-text">
                        <strong>{service.title}</strong>
                        <span>{service.bestFor}</span>
                      </span>
                      <ArrowRight size={16} className="services-start-arrow" />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* PRACTICES */}
      <CmsPageSectionSlot id="practices">
      <section id="practices" className="services-section services-section--muted">
        <div className="container">
          <Reveal className="services-section-head">
            <div>
              <div className="services-kicker">
                <Layers size={16} />
                <span>{servicesPage.practicesKicker || 'Our Practices'}</span>
              </div>
              <h2 className="services-section-title">
                {practicesTitle}
              </h2>
              <p className="services-section-copy">
                {practicesSubtitle}
              </p>
            </div>
          </Reveal>

          <div className="services-practice-grid">
            {publicServices.map((service, index) => (
              <Reveal
                key={service.id}
                id={service.slug}
                delay={index * 0.05}
                className="practice-card"
              >
                <div className="practice-card-top">
                  <span className="practice-card-icon">
                    {serviceIcon(service.iconName)}
                  </span>
                  <span className="practice-card-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="practice-card-category">{service.category}</div>
                <h3>{service.title}</h3>
                <p className="practice-card-desc">{service.description}</p>

                <ul className="practice-card-list">
                  {(service.capabilities || []).slice(0, 3).map((capability) => (
                    <li key={capability}>
                      <Check size={15} />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>

                <div className="practice-card-best">
                  <span>Best for</span>
                  <p>{service.bestFor}</p>
                </div>

                <div className="practice-card-actions">
                  <Link to={service.ctaLink || '/connect-with-us'} className="practice-card-link">
                    <span>{service.ctaText || servicesPage.discussServiceText || 'Discuss This Service'}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* DOMAINS */}
      <CmsPageSectionSlot id="domains">
      <section id="domains" className="services-section">
        <div className="container">
          <Reveal className="services-section-head">
            <div>
              <div className="services-kicker">
                <Layers size={16} />
                <span>{servicesPage.domainsKicker || 'Domains'}</span>
              </div>
              <h2 className="services-section-title">
                {domainsTitle}
              </h2>
              <p className="services-section-copy">
                {domainsSubtitle}
              </p>
            </div>
          </Reveal>

          <div className="services-domain-grid">
            {industries.map((industry: any, index: number) => (
              <Reveal
                key={industry.id}
                delay={index * 0.05}
                className="services-domain-card"
              >
                <div className="services-domain-head">
                  <span className="services-domain-icon">
                    {industryIcon(industry.iconName)}
                  </span>
                  <div>
                    <h3>{industry.industry}</h3>
                    <p>{industry.subtitle}</p>
                  </div>
                </div>
                <div className="services-domain-block">
                  <span>Challenge</span>
                  <p>{industry.challenge}</p>
                </div>
                <div className="services-domain-block">
                  <span>Our approach</span>
                  <p>{industry.architecture}</p>
                </div>
                <div className="services-domain-outcome">
                  <Target size={15} />
                  <span>{industry.outcome}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* NEXT STEPS */}
      <CmsPageSectionSlot id="nextSteps">
      <section id="next-steps" className="services-section services-section--muted">
        <div className="container">
          <Reveal className="services-section-head">
            <div>
              <div className="services-kicker">
                <MessageSquare size={16} />
                <span>{servicesPage.nextStepsKicker || 'What Happens Next'}</span>
              </div>
              <h2 className="services-section-title">
                {nextStepsTitle}
              </h2>
              <p className="services-section-copy">
                {nextStepsSubtitle}
              </p>
            </div>
          </Reveal>

          <div className="services-next-grid">
            {(Array.isArray(servicesPage.nextSteps) && servicesPage.nextSteps.length > 0
              ? servicesPage.nextSteps
              : [
                  {
                    step: '01',
                    iconName: 'MessageSquare',
                    title: 'Share your context',
                    description:
                      'Tell us about your goals, current systems, constraints, and what prompted the conversation.',
                  },
                  {
                    step: '02',
                    iconName: 'Compass',
                    title: 'Discovery conversation',
                    description:
                      'We discuss priorities, architecture, options, and the practical trade-offs involved.',
                  },
                  {
                    step: '03',
                    iconName: 'FileText',
                    title: 'Written next step',
                    description:
                      'If there is a fit, we provide a scope summary, a recommended engagement model, and clear next actions.',
                  },
                ]
            ).map((item: any, index: number) => {
              const getNextIcon = (name?: string, idx?: number) => {
                if (name === 'Compass' || idx === 1) return <Compass size={22} />;
                if (name === 'FileText' || idx === 2) return <FileText size={22} />;
                return <MessageSquare size={22} />;
              };

              return (
              <Reveal
                key={item.step || index}
                delay={index * 0.06}
                className="services-next-card"
              >
                <div className="services-next-top">
                  <span className="services-next-icon">{getNextIcon(item.iconName, index)}</span>
                  <span className="services-next-step">{item.step || `0${index + 1}`}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Reveal>
            );
            })}
          </div>


        </div>
      </section>
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="finalCta">
      <FinalCTA />
      </CmsPageSectionSlot>
      </CmsPageLayout>

      <style>{`
        .services-hero {
          background-color: #FFFFFF;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding-top: clamp(3.25rem, 7vw, 5.5rem);
          padding-bottom: clamp(3rem, 6vw, 4.75rem);
          position: relative;
          overflow: hidden;
        }

        .services-hero-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(73, 36, 63, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(73, 36, 63, 0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 85%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 85%);
          pointer-events: none;
        }

        .services-hero-glow {
          position: absolute;
          top: -20%;
          left: 8%;
          width: 620px;
          height: 520px;
          background: radial-gradient(circle at center, rgba(73, 36, 63, 0.09) 0%, rgba(201, 155, 82, 0.05) 45%, transparent 72%);
          pointer-events: none;
        }

        .services-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }

        .services-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #49243F;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 0.9rem;
        }

        .services-hero-title {
          font-size: clamp(1.85rem, 3.5vw, 2.25rem);
          font-weight: 600;
          color: #1E293B;
          line-height: 1.18;
          letter-spacing: -0.025em;
          margin-bottom: 1.25rem;
        }

        .services-hero-copy {
          font-size: 1rem;
          color: #475569;
          line-height: 1.68;
          max-width: 620px;
          margin-bottom: 1.75rem;
        }

        .services-actions {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .services-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #49243F;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: gap 160ms ease, color 160ms ease;
        }

        .services-inline-link:hover {
          gap: 0.6rem;
          color: #8A315D;
        }

        .services-hero-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #64748B;
          font-size: 0.8125rem;
          line-height: 1.55;
          max-width: 540px;
        }

        .services-hero-note svg {
          color: #49243F;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .services-start-card {
          background: linear-gradient(180deg, #FFFFFF 0%, #FBF7F2 100%);
          border: 1px solid rgba(227, 218, 207, 0.95);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 24px 55px -28px rgba(73, 36, 63, 0.35);
        }

        .services-start-title {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #49243F;
          margin-bottom: 0.5rem;
        }

        .services-start-copy {
          font-size: 0.8125rem;
          color: #64748B;
          line-height: 1.55;
          margin-bottom: 0.9rem;
        }

        .services-start-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .services-start-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.7rem 0.65rem;
          border-radius: 0.8rem;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background-color 160ms ease, border-color 160ms ease;
        }

        .services-start-row:hover {
          background-color: rgba(73, 36, 63, 0.05);
          border-color: rgba(73, 36, 63, 0.14);
        }

        .services-start-icon {
          width: 2.35rem;
          height: 2.35rem;
          border-radius: 0.65rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .services-start-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
          flex: 1;
        }

        .services-start-text strong {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.35;
        }

        .services-start-text span {
          font-size: 0.75rem;
          color: #64748B;
          line-height: 1.4;
        }

        .services-start-arrow {
          color: #49243F;
          flex-shrink: 0;
        }

        .services-start-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          margin-top: 0.9rem;
          padding-top: 0.9rem;
          border-top: 1px solid rgba(227, 218, 207, 0.9);
          color: #49243F;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1.45;
          text-decoration: none;
        }

        .services-section {
          padding: clamp(3rem, 7vw, 5rem) 0;
          background-color: #FFFFFF;
        }

        .services-section--muted {
          background-color: #F8FAFC;
        }

        .services-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }

        .services-section-title {
          font-size: clamp(1.65rem, 2.8vw, 2.15rem);
          font-weight: 600;
          color: #1E293B;
          background-image: var(--gradient-heading);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 0.85rem;
        }

        .services-section-copy {
          color: #64748B;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: none;
        }

        .services-hero-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }

        .services-practice-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.75rem;
        }

        .practice-card {
          display: flex;
          flex-direction: column;
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.25rem;
          padding: clamp(1.5rem, 2.5vw, 2rem);
          box-shadow: 0 8px 26px -18px rgba(15, 23, 42, 0.18);
          scroll-margin-top: 6.5rem;
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }

        .practice-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -22px rgba(73, 36, 63, 0.24);
          border-color: rgba(73, 36, 63, 0.2);
        }

        .practice-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.1rem;
        }

        .practice-card-icon {
          width: 2.85rem;
          height: 2.85rem;
          border-radius: 0.8rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .practice-card-number {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #94A3B8;
        }

        .practice-card-category {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.4rem;
        }

        .practice-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.35;
          margin-bottom: 0.65rem;
        }

        .practice-card-desc {
          font-size: 0.875rem;
          color: #64748B;
          line-height: 1.65;
          margin-bottom: 1.15rem;
        }

        .practice-card-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .practice-card-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.5;
        }

        .practice-card-list svg {
          color: #1F5132;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .practice-card-best {
          background-color: #FBF7F2;
          border: 1px solid rgba(227, 218, 207, 0.95);
          border-radius: 0.75rem;
          padding: 0.8rem 0.9rem;
          margin-bottom: 1rem;
        }

        .practice-card-best > span {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.2rem;
        }

        .practice-card-best p {
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.5;
        }

        .practice-card-actions {
          display: flex;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #E2E8F0;
        }

        .practice-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #49243F;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: gap 160ms ease, color 160ms ease;
        }

        .practice-card-link:hover {
          gap: 0.6rem;
          color: #8A315D;
        }

        .services-process-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .services-process-card {
          background-color: #F8FAFC;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.2rem;
          padding: 1.4rem 1.35rem;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .services-process-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 34px -20px rgba(73, 36, 63, 0.22);
          border-color: rgba(73, 36, 63, 0.2);
        }

        .services-process-number {
          font-size: 1.6rem;
          font-weight: 600;
          line-height: 1;
          color: rgba(73, 36, 63, 0.16);
          margin-bottom: 0.55rem;
          letter-spacing: -0.03em;
        }

        .services-process-card h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.25rem;
        }

        .services-process-tagline {
          font-size: 0.75rem;
          font-weight: 600;
          color: #49243F;
          line-height: 1.4;
          margin-bottom: 0.65rem;
        }

        .services-process-card p {
          font-size: 0.84375rem;
          color: #64748B;
          line-height: 1.6;
        }

        .services-domain-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .services-domain-card {
          background-color: #F8FAFC;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.2rem;
          padding: 1.5rem 1.4rem;
          display: flex;
          flex-direction: column;
        }

        .services-domain-head {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .services-domain-icon {
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 0.75rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .services-domain-head h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.2rem;
        }

        .services-domain-head p {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748B;
          line-height: 1.45;
        }

        .services-domain-block {
          margin-bottom: 0.85rem;
        }

        .services-domain-block span {
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.25rem;
        }

        .services-domain-block p {
          font-size: 0.8125rem;
          color: #475569;
          line-height: 1.6;
        }

        .services-domain-outcome {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 0.8rem;
          border-top: 1px solid #E2E8F0;
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.55;
        }

        .services-domain-outcome svg {
          color: #1F5132;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .services-next-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .services-next-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.2rem;
          padding: 1.5rem 1.4rem;
          box-shadow: 0 6px 22px -10px rgba(15, 23, 42, 0.08);
        }

        .services-next-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .services-next-icon {
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 0.75rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .services-next-step {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #94A3B8;
        }

        .services-next-card h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.45rem;
        }

        .services-next-card p {
          font-size: 0.84375rem;
          color: #64748B;
          line-height: 1.6;
        }

        .services-next-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
          text-align: center;
        }

        .services-next-cta > span {
          font-size: 0.84375rem;
          color: #64748B;
        }

        .services-next-cta a {
          color: #49243F;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 1024px) {
          .services-hero-grid {
            grid-template-columns: 1fr;
          }

          .services-start-card {
            max-width: 620px;
            margin: 0 auto;
            width: 100%;
          }

          .services-process-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .services-next-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .services-practice-grid {
            grid-template-columns: 1fr;
          }

          .services-domain-grid {
            grid-template-columns: 1fr;
          }

          .services-next-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .services-practice-grid {
            grid-template-columns: 1fr;
          }

          .services-process-grid {
            grid-template-columns: 1fr;
          }

          .services-actions {
            align-items: stretch;
          }

          .services-actions .btn {
            width: 100%;
            justify-content: center;
          }

          .services-hero-title {
            font-size: clamp(2rem, 9vw, 2.6rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .practice-card,
          .services-process-card,
          .services-start-row,
          .services-faq-plus {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Services;
