import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Building2,
  Cpu,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Reveal } from '../components/common/Reveal';
import { FinalCTA } from '../components/home/FinalCTA';
import { useCMS, defaultPortfolio } from '../context/CMSContext';

export const PortfolioDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { portfolio: cmsPortfolio } = useCMS();

  const allProjects = cmsPortfolio && cmsPortfolio.length > 0 ? cmsPortfolio : defaultPortfolio;
  const project = allProjects.find((p) => p.slug === slug || p.id === slug);

  const notFoundTitle = project?.notFoundTitle || 'Case Study Not Found';
  const notFoundDescription = project?.notFoundDescription || 'The requested enterprise case study or project specification does not exist.';
  const notFoundButtonText = project?.notFoundButtonText || 'Back to Portfolio Directory';
  const notFoundButtonLink = project?.notFoundButtonLink || '/portfolio';

  if (!project) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <SEOHead
          title={`${notFoundTitle} — Azaroth Tech-Hive`}
          description={notFoundDescription}
          canonicalPath="/portfolio"
          robots="noindex, follow"
        />
        <h2 style={{ marginBottom: '1rem', color: '#1E293B' }}>{notFoundTitle}</h2>
        <p style={{ marginBottom: '2rem', color: '#64748B' }}>
          {notFoundDescription}
        </p>
        <Button to={notFoundButtonLink} variant="primary" icon={<ArrowLeft size={16} />} iconPosition="left">
          {notFoundButtonText}
        </Button>
      </div>
    );
  }

  const projectTitle = project.name || project.title || 'Case Study';
  const seoTitle = project.seoTitle || `${projectTitle} — Enterprise Case Study | Azaroth Tech-Hive`;
  const seoDescription = project.seoDescription || project.summary || project.challenge || `${projectTitle} enterprise solution by Azaroth Tech-Hive.`;
  const seoCanonicalPath = project.seoCanonicalPath || `/portfolio/${project.slug}`;

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      {/* Case Study Hero */}
      <section
        className="section"
        style={{
          backgroundColor: 'var(--color-canvas-bg, #FAF8F4)',
          borderBottom: '1px solid var(--color-border-subtle, #E2E8F0)',
          paddingBottom: '3.5rem',
        }}
      >
        <Reveal className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link
            to="/portfolio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--color-primary, #49243F)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '2rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>{project.backButtonText || 'Back to Portfolio'}</span>
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge variant="emerald">{project.clientType || 'Enterprise'}</Badge>
            <Badge variant="gold">{project.industry || 'Technology'}</Badge>
            {project.category && <Badge variant="gold">{project.category}</Badge>}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: 'var(--color-text-primary, #1E293B)',
              lineHeight: 1.2,
              marginBottom: '1rem',
              maxWidth: '900px',
            }}
          >
            {projectTitle}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontSize: '1rem',
              color: '#49243F',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <Building2 size={18} />
            <span>Client: {project.clientName}</span>
          </div>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary, #475569)',
              lineHeight: 1.75,
              maxWidth: '850px',
              marginBottom: '2.5rem',
            }}
          >
            {project.summary}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button to={project.heroCtaPrimaryLink || '/connect-with-us'} variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              {project.heroCtaPrimaryText || 'Discuss a Similar Engagement'}
            </Button>
            <Button to={project.heroCtaSecondaryLink || '/connect-with-us'} variant="outline" size="lg">
              {project.heroCtaSecondaryText || 'Request Technical Architecture Review'}
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Case Study Details: Challenge & Solution */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', padding: '5rem 0' }}>
        <Reveal className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '2.5rem',
              marginBottom: '4rem',
            }}
          >
            {/* The Challenge */}
            <Card
              variant="solid"
              padding="lg"
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: '#C2410C',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={22} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{project.challengeSectionTitle || 'The Challenge'}</h3>
              </div>
              <p style={{ fontSize: '1rem', color: '#431407', lineHeight: 1.7, margin: 0 }}>
                {project.challenge}
              </p>
            </Card>

            {/* The Solution */}
            <Card
              variant="solid"
              padding="lg"
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: '#047857',
                  marginBottom: '1rem',
                }}
              >
                <Cpu size={22} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{project.solutionSectionTitle || 'The Engineered Solution'}</h3>
              </div>
              <p style={{ fontSize: '1rem', color: '#064E3B', lineHeight: 1.7, margin: 0 }}>
                {project.solution}
              </p>
            </Card>
          </div>

          {/* Measurable Outcomes & Metrics */}
          {Array.isArray(project.outcomes) && project.outcomes.length > 0 && (
            <div style={{ marginBottom: '4rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  color: '#49243F',
                }}
              >
                <TrendingUp size={22} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  {project.outcomesSectionTitle || 'Measurable Technical Outcomes'}
                </h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                {project.outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <CheckCircle2 size={20} style={{ color: '#047857', flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '0.9375rem', color: '#1E293B', fontWeight: 600, lineHeight: 1.5 }}>
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technology Stack Tags */}
          {Array.isArray(project.technologies) && project.technologies.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: '#49243F',
                }}
              >
                <Layers size={20} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  {project.techStackSectionTitle || 'Technology Stack & Tools'}
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#F1F5F9',
                      color: '#334155',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </section>

      <FinalCTA />
    </div>
  );
};

export default PortfolioDetail;

