import React from 'react';
import { Home, BookOpen } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SEOHead } from '../components/common/SEOHead';
import { FinalCTA } from '../components/home/FinalCTA';
import { Reveal } from '../components/common/Reveal';
import { useCMS } from '../context/CMSContext';

export const NotFound: React.FC = () => {
  const { pages } = useCMS();
  const pageData = pages?.['not-found'] || pages?.['404'] || {};

  const badge = pageData.badge || 'Status 404';
  const title = pageData.title || 'Route Not Found';
  const description = pageData.description || 'The path you navigated to does not exist or has been relocated within our enterprise architecture.';
  const homeBtnText = pageData.homeBtnText || 'Return to Homepage';
  const homeBtnLink = pageData.homeBtnLink || '/';
  const insightsBtnText = pageData.insightsBtnText || 'Browse Resource Hub';
  const insightsBtnLink = pageData.insightsBtnLink || '/technology-insights';
  const seoTitle = pageData.seoTitle || 'Page Not Found — Azaroth Tech-Hive';
  const seoDescription = pageData.seoDescription || 'The page you are looking for does not exist or has been moved. Browse our homepage, products, services, and engineering insights instead.';

  return (
    <>
    <div className="section" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        robots="noindex, follow"
      />
      <Reveal>
      <Badge variant="emerald" style={{ marginBottom: '1.25rem' }}>
        {badge}
      </Badge>

      <h1 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)', fontWeight: 600, color: 'var(--color-brand-emerald)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
        {title}
      </h1>

      <p style={{ maxWidth: '520px', color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6, marginLeft: 'auto', marginRight: 'auto' }}>
        {description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <Button to={homeBtnLink} variant="primary" icon={<Home size={16} />} iconPosition="left">
          {homeBtnText}
        </Button>
        <Button to={insightsBtnLink} variant="outline" icon={<BookOpen size={16} />} iconPosition="left">
          {insightsBtnText}
        </Button>
      </div>
      </Reveal>
    </div>

    <FinalCTA />
    </>
  );
};
