import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { insightsArticles } from '../data/insightsData';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { SEOHead } from '../components/common/SEOHead';
import { Reveal } from '../components/common/Reveal';
import { FinalCTA } from '../components/home/FinalCTA';
import { useCMS } from '../context/CMSContext';
import { getPublicInsights } from '../utils/publicContent';

export const InsightDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { insights: cmsInsights } = useCMS();
  const article = getPublicInsights(cmsInsights || [], insightsArticles).find(
    (item) => item.slug === slug,
  );
  const [activeSection, setActiveSection] = useState<string>('');

  const sectionBlocks = useMemo(() => {
    if (!article) return [];
    const validSections = Array.isArray(article.sections) && article.sections.length > 0
      ? article.sections
      : [{ id: 'overview', title: 'Overview' }];
    const chunkSize = Math.max(1, Math.ceil(article.content.length / Math.max(1, validSections.length)));
    return validSections.map((section, index) => ({
      ...section,
      paragraphs: article.content.slice(index * chunkSize, (index + 1) * chunkSize),
    }));
  }, [article]);

  useEffect(() => {
    if (!article || !sectionBlocks.length) return;

    const sectionIds = sectionBlocks.map((section) => section.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && sectionIds.includes(visible.target.id)) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.5, 0.8] },
    );

    sectionBlocks.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [article, sectionBlocks]);

  if (!article) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <SEOHead
          title="Article Not Found — Azaroth Tech-Hive"
          description="The requested technology insight could not be located. Browse the resource hub for engineering insights on architecture, AI, and cloud modernization."
          canonicalPath="/technology-insights"
          robots="noindex, follow"
        />
        <h1 style={{ marginBottom: '1rem' }}>Article Not Found</h1>
        <p style={{ marginBottom: '2rem' }}>The requested technology insight could not be located.</p>
        <Button to="/technology-insights" variant="primary" icon={<ArrowLeft size={16} />} iconPosition="left">
          Back to Resource Hub
        </Button>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title={`${article.title} — Azaroth Tech-Hive`}
        description={article.excerpt.length > 160 ? `${article.excerpt.slice(0, 157).trimEnd()}...` : article.excerpt}
        canonicalPath={`/technology-insights/${article.slug}`}
      />
      {/* Article Header */}
      <section className="section" style={{ backgroundColor: 'var(--color-canvas-bg)', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '3.5rem' }}>
        <Reveal className="container-prose">
          <Link
            to="/technology-insights"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--color-primary-green)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Insights Directory</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
              <Clock size={14} />
              <span>{article.readTime}</span>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 600, lineHeight: 1.25, marginBottom: '1.5rem' }}>
            {article.title}
          </h1>

          {/* Author Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border-subtle)',
          }}>
            <div style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-green)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}>
              {article.author.name[0]}
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-dark-forest)', fontSize: '0.9375rem' }}>
                {article.author.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {article.author.role} • Published {article.publishedDate}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Article Body */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-prose">
          <div className="insight-body-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
            <aside style={{ position: 'sticky', top: '6.5rem' }}>
              <div style={{
                backgroundColor: 'rgba(250, 250, 247, 0.8)',
                border: '1px solid var(--color-border, #E4E4E7)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary, #18181B)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  On this page
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sectionBlocks.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      aria-current={activeSection === section.id ? 'true' : undefined}
                      style={{
                        display: 'block',
                        color: activeSection === section.id ? 'var(--color-primary, #18181B)' : 'var(--color-text-secondary)',
                        fontWeight: activeSection === section.id ? 600 : 500,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '0.5rem',
                        backgroundColor: activeSection === section.id ? 'rgba(0, 108, 53, 0.08)' : 'transparent',
                      }}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <Reveal style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
                {sectionBlocks.map((section) => (
                  <section key={section.id} id={section.id} style={{ scrollMarginTop: '7rem', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-dark-maroon)', marginBottom: '1rem' }}>
                      {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.id}-${index}`} style={{ marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
              </div>

              <div style={{
                marginTop: '3rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-dark-forest)', marginRight: '0.5rem' }}>
                  Topics:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(0, 108, 53, 0.08)',
                      color: 'var(--color-primary-green)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal>
          <Card
            variant="solid"
            padding="md"
            style={{
              marginTop: '3rem',
              backgroundColor: 'var(--color-canvas-bg)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <User size={18} style={{ color: 'var(--color-primary-green)' }} />
              <strong style={{ color: 'var(--color-dark-forest)' }}>About the Author</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              <strong>{article.author.name}</strong> — {article.author.role}. Insights by our {article.author.role.toLowerCase()} team at Azaroth Tech-Hive.
            </p>
          </Card>
          </Reveal>

          <Reveal style={{ marginTop: '3.5rem', textAlign: 'center' }}>
            <Button to="/connect-with-us" variant="primary" size="md">
              Consult with Our Principal Architects on Your Architecture
            </Button>
          </Reveal>
        </div>
      </section>

      <style>{`
        .insight-body-grid aside {
          position: sticky;
          top: 6.5rem;
        }

        @media (max-width: 900px) {
          .insight-body-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 1.5rem !important;
          }

          .insight-body-grid aside {
            position: static !important;
          }
        }
      `}</style>

      {/* Common Final CTA */}
      <FinalCTA />
    </div>
  );
};
