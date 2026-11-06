import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Inbox } from 'lucide-react';
import { insightsArticles } from '../data/insightsData';
import { Card } from '../components/common/Card';
import { SEOHead } from '../components/common/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { useCMS } from '../context/CMSContext';
import { MediaRenderer } from '../components/common/MediaRenderer';
import {
  insightSystemArchImg,
  insightEnterpriseAiImg,
  insightCloudModImg,
} from '../assets/images';
import { Testimonials } from '../components/home/Testimonials';
import { FinalCTA } from '../components/home/FinalCTA';
import Reveal from '../components/common/Reveal';
import { getPublicInsights } from '../utils/publicContent';
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from '../components/common/CmsPageLayout';

export const Insights: React.FC = () => {
  const [selectedCategory] = useState<string>('All');
  const [searchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const { insights: cmsInsights, pages } = useCMS();
  const insightsPage = pages['insights'] || {};
  const heroKicker = insightsPage.kicker || '- RESOURCE HUB -';
  const heroTitle = insightsPage.heroTitle || 'Engineering Insights That Move Ideas Forward';
  const heroSubtitle =
    insightsPage.heroSubtitle ||
    'Explore software engineering insights, architecture principles, implementation strategies, and technical guidance to help you make informed technology decisions and build better systems.';
  const fallbackImages = [insightSystemArchImg, insightEnterpriseAiImg, insightCloudModImg];
  const seoTitle = insightsPage.seoTitle || 'Resource Hub — Engineering Insights & Publications | Azaroth Tech-Hive';
  const seoDescription =
    insightsPage.seoDescription ||
    'Browse engineering insights on system architecture, enterprise AI, and cloud modernization, with practical technical guidance from the Azaroth Tech-Hive team.';
  const seoCanonicalPath = insightsPage.seoCanonicalPath || '/resource-hub';

  const effectiveArticles = useMemo(() => {
    return getPublicInsights(cmsInsights || [], insightsArticles).map(
      (article, index) => ({
        ...article,
        imageUrl: article.imageUrl || fallbackImages[index % fallbackImages.length],
      }),
    );
  }, [cmsInsights]);

  // const categories = useMemo(() => {
  //   return ['All', ...new Set(effectiveArticles.map(a => a.category))];
  // }, [effectiveArticles]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    return effectiveArticles.filter((article) => {
      const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
      const normalizedQuery = debouncedQuery.toLowerCase();
      const matchesSearch = !normalizedQuery ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.excerpt.toLowerCase().includes(normalizedQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      return matchesCat && matchesSearch;
    });
  }, [effectiveArticles, debouncedQuery, selectedCategory]);

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />
      <CmsPageLayout pageSlug="insights" page={insightsPage}>
      {/* Page Hero */}
      <CmsPageSectionSlot id="hero">
      <PageHeader
        kicker={heroKicker}
        title={heroTitle}
        gradientWords={['Move', 'Ideas', 'Forward', 'Architecture', 'Software']}
        subtitle={heroSubtitle}
      />
      </CmsPageSectionSlot>

      {/* Resource Catalog */}
      <CmsPageSectionSlot id="articles">
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <Reveal style={{
              padding: '3rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px dashed var(--color-border)',
              backgroundColor: 'var(--color-surface-soft)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'var(--color-surface-muted)', marginBottom: '1rem' }}>
                <Inbox size={20} style={{ color: 'var(--color-brand-gold)' }} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>No resources match your search</h2>
              <p style={{ margin: 0 }}>Try a different keyword or switch back to another category.</p>
            </Reveal>
          ) : (
            <div className="grid-layout-4x4">
              {filteredArticles.map((article, idx) => (
                <Reveal key={article.id} delay={idx * 0.06} style={{ display: 'flex', flexDirection: 'column' }}>
                <Card
                  variant="solid"
                  padding="none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(73, 36, 63, 0.12)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    transition: 'all 240ms ease-out',
                    flex: 1,
                  }}
                  className="insight-page-card"
                >
                  {/* Card Visual Header with Image */}
                  <div
                    style={{
                      position: 'relative',
                      height: '210px',
                      overflow: 'hidden',
                      backgroundColor: '#0a0f1d',
                    }}
                  >
                    <MediaRenderer
                      src={article.imageUrl || fallbackImages[idx % fallbackImages.length]}
                      alt={article.title}
                      objectFit="cover"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.5s ease',
                      }}
                      className="insight-page-thumb"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.2) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Card Body */}
                  <div style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {article.publishedDate}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <Clock size={14} style={{ color: '#49243F' }} />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.35, marginBottom: '0.75rem' }}>
                      <Link to={`/technology-insights/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }} className="article-title-link">
                        {article.title}
                      </Link>
                    </h2>

                    <p style={{
                      fontSize: '0.9375rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.65,
                      marginBottom: '1.5rem',
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                      flexGrow: 1,
                    }}>
                      {article.excerpt}
                    </p>

                    <div style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {article.author.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {article.author.role}
                        </div>
                      </div>

                      <Link
                        to={`/technology-insights/${article.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#49243F',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Read</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </Card>
                </Reveal>
              ))}
            </div>
          )}

        </div>

      </section>
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="testimonials">
         <Testimonials />
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="finalCta">
         <FinalCTA />
      </CmsPageSectionSlot>
      </CmsPageLayout>

      <style>{`
        .article-title-link:hover {
          color: var(--color-primary-maroon) !important;
        }
        .insight-page-card:hover {
          box-shadow: 0 12px 30px rgba(73, 36, 63, 0.15) !important;
          border-color: rgba(73, 36, 63, 0.4) !important;
          transform: translateY(-4px);
        }
        .insight-page-card:hover .insight-page-thumb {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};
