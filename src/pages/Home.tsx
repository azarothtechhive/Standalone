
import React from 'react';
import { Hero } from '../components/home/Hero';
import { ProductsSection } from '../components/home/ProductsSection';
import FeaturedSolutions from '../components/home/FeaturedSolutions';
import { AboutSection } from '../components/home/AboutSection';
import { IndustryExpertise } from '../components/home/IndustryExpertise';
import { StrategicSolutions } from '../components/home/StrategicSolutions';
import { BlogSection } from '../components/home/BlogSection';
import { FAQSection } from '../components/home/FAQSection';
import { FinalCTA } from '../components/home/FinalCTA';
import { SEOHead } from '../components/common/SEOHead';
import { useCMS } from '../context/CMSContext';
import { CmsPageLayout } from '../components/common/CmsPageLayout';

export const Home: React.FC = () => {
  const { settings, pages } = useCMS();

  const isModuleEnabled = (slug: string): boolean => {
    if (!settings.modulesConfig) return true;
    const mod = settings.modulesConfig.find((m) => m.slug === slug);
    return mod ? mod.isEnabled : true;
  };

  return (
    <div>
      <SEOHead
        title={settings.metaTitle || "Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering"}
        description={settings.metaDescription || "Azaroth Tech-Hive architects mission-critical digital systems, resilient microservice ecosystems, high-availability software platforms, and dedicated engineering pods for global enterprises."}
        canonicalPath="/"
      />
      <CmsPageLayout
        pageSlug="home"
        page={pages.home}
        sections={{
          hero: <Hero />,
          aboutSection: isModuleEnabled('about') ? <AboutSection /> : null,
          servicesSection: isModuleEnabled('services') ? <FeaturedSolutions /> : null,
          productsSection: isModuleEnabled('products') ? <ProductsSection /> : null,
          featuredProjectsSection: isModuleEnabled('portfolio') ? <StrategicSolutions /> : null,
          industrySection: <IndustryExpertise />,
          insightsSection: isModuleEnabled('insights') ? <BlogSection /> : null,
          faqSection: <FAQSection />,
          finalCta: isModuleEnabled('connect') ? <FinalCTA /> : null,
        }}
      />
    </div>
  );
};

export default Home;
