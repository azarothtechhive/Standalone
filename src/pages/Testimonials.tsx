import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { FinalCTA } from '../components/home/FinalCTA';
import { Testimonials } from '../components/home/Testimonials';
import { useCMS } from '../context/CMSContext';
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from '../components/common/CmsPageLayout';

export const TestimonialsPage: React.FC = () => {
  const { pages } = useCMS();
  const testimonialsPage = pages['testimonials'] || {};
  const heroKicker = testimonialsPage.kicker || '- CLIENT TESTIMONIALS -';
  const heroTitle =
    testimonialsPage.heroTitle || 'Trusted by Leaders Who Build at Scale';
  const heroSubtitle =
    testimonialsPage.heroSubtitle ||
    'Hear directly from the technology leaders, founders, and engineering executives who rely on Azaroth Tech-Hive to deliver resilient platforms and measurable business outcomes.';
  const seoTitle = testimonialsPage.seoTitle || 'Client Testimonials — Enterprise Engineering Endorsements | Azaroth Tech-Hive';
  const seoDescription =
    testimonialsPage.seoDescription ||
    'Read verified client testimonials and executive endorsements from enterprises that partner with Azaroth Tech-Hive for software engineering, architecture modernization, and dedicated engineering pods.';
  const seoCanonicalPath = testimonialsPage.seoCanonicalPath || '/testimonials';

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      <CmsPageLayout pageSlug="testimonials" page={testimonialsPage}>
      <CmsPageSectionSlot id="hero">
      <PageHeader
        kicker={heroKicker}
        title={heroTitle}
        gradientWords={['Build', 'Scale', 'Organisations']}
        subtitle={heroSubtitle}
      />
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="testimonials">
      <Testimonials />
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="finalCta">
      <FinalCTA />
      </CmsPageSectionSlot>
      </CmsPageLayout>
    </div>
  );
};

export default TestimonialsPage;
