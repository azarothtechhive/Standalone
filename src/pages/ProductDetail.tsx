import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Activity,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  CheckCircle2, 
  FileCheck, 
  Zap, 
  Globe
} from 'lucide-react';
import { productsCatalog } from '../data/productsData';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SEOHead } from '../components/common/SEOHead';
import { ProductStatusBadge } from '../components/common/ProductStatusBadge';
import { Reveal } from '../components/common/Reveal';
import { FinalCTA } from '../components/home/FinalCTA';
import { useCMS } from '../context/CMSContext';
import { getPublicProducts } from '../utils/publicContent';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products: cmsProducts, pages } = useCMS();
  const productsPage = pages?.products || {};
  const product = getPublicProducts(cmsProducts || [], productsCatalog).find(
    (item) => item.slug === slug,
  );

  if (!product) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>{productsPage.notFoundTitle || 'Platform Not Found'}</h2>
        <p style={{ marginBottom: '2rem' }}>{productsPage.notFoundDescription || 'The requested enterprise platform specification does not exist.'}</p>
        <Button to={productsPage.notFoundButtonLink || '/products'} variant="primary" icon={<ArrowLeft size={16} />} iconPosition="left">
          {productsPage.notFoundButtonText || 'Back to Products Catalog'}
        </Button>
      </div>
    );
  }

  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity size={32} />;
      case 'ShoppingBag': return <ShoppingBag size={32} />;
      case 'GraduationCap': return <GraduationCap size={32} />;
      case 'HeartPulse': return <HeartPulse size={32} />;
      default: return <Activity size={32} />;
    }
  };

  const getProductColors = (productId: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      'prod-fms': { bg: 'var(--color-surface-lavender)', color: 'var(--color-brand-violet)', border: 'var(--color-brand-violet-border)' },
      'prod-commerce': { bg: 'var(--color-surface-mint)', color: 'var(--color-brand-emerald)', border: 'var(--color-brand-emerald-border)' },
      'prod-lmp': { bg: 'var(--color-surface-peach)', color: 'var(--color-brand-orange)', border: 'var(--color-brand-orange-border)' },
      'prod-hms': { bg: 'var(--color-surface-rose)', color: 'var(--color-brand-magenta)', border: 'var(--color-brand-magenta-border)' },
    };
    return colors[productId] || colors['prod-fms'];
  };

  const seoTitle = product.seoTitle || `${product.name} — Azaroth Tech-Hive`;
  const seoDescription = product.seoDescription || (product.description.length > 160 ? `${product.description.slice(0, 157).trimEnd()}...` : product.description);
  const seoCanonicalPath = product.seoCanonicalPath || `/products/${product.slug}`;

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />
      {/* Product Hero */}
      <section className="section" style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
        <Reveal className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '2rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>{product.backButtonText || 'Back to Products Directory'}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '16px',
              backgroundColor: getProductColors(product.id).bg,
              color: getProductColors(product.id).color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${getProductColors(product.id).border}`,
            }}>
              {getIcon(product.iconName)}
            </div>

            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant="gold">{product.category}</Badge>
                {product.badge && product.badge !== 'Under Development' && <Badge variant="gold">{product.badge}</Badge>}
                <ProductStatusBadge status={product.status || 'Under Development'} size="md" />
              </div>
              <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {product.name}
              </h1>
            </div>
          </div>

          <p style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: getProductColors(product.id).color,
            marginBottom: '1rem',
            maxWidth: '800px',
          }}>
            {product.tagline}
          </p>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '820px',
            marginBottom: '2.5rem',
          }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button to={product.heroCtaPrimaryLink || '/connect-with-us'} variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              {product.heroCtaPrimaryText || 'Request Technical Deployment'}
            </Button>
            <Button to={product.heroCtaSecondaryLink || '/connect-with-us'} variant="outline" size="lg">
              {product.heroCtaSecondaryText || 'Speak with Solution Architect'}
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Technical Specifications Deep-Dive */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <Reveal className="container">
          
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 1.85rem)', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            {product.specsSectionTitle || 'Architecture design goals'}
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            {product.specsSectionSubtitle || 'Targets set during design; measured benchmarks will be published after launch.'}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}>
            <Card variant="solid" padding="md" style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getProductColors(product.id).color, marginBottom: '0.5rem' }}>
                <Zap size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.latencyLabel || 'Latency Design Target'}
                </span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {product.techSpecs?.latency || 'Sub-second target'}
              </div>
            </Card>

            <Card variant="solid" padding="md" style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getProductColors(product.id).color, marginBottom: '0.5rem' }}>
                <Zap size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.concurrencyLabel || 'Concurrency Design Target'}
                </span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {product.techSpecs?.concurrency || 'High-concurrency cluster'}
              </div>
            </Card>

            <Card variant="solid" padding="md" style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getProductColors(product.id).color, marginBottom: '0.5rem' }}>
                <FileCheck size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.complianceLabel || 'Compliance Posture'}
                </span>
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {product.techSpecs?.compliancePosture || 'Enterprise Data Isolation & RBAC'}
              </div>
            </Card>

            <Card variant="solid" padding="md" style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getProductColors(product.id).color, marginBottom: '0.5rem' }}>
                <Globe size={18} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.protocolsLabel || 'Supported Protocols'}
                </span>
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {Array.isArray(product.techSpecs?.protocols) ? product.techSpecs.protocols.join(', ') : (product.techSpecs?.protocols || 'HTTPS, REST, WebSockets')}
              </div>
            </Card>
          </div>

          {/* Core Capabilities Detailed List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '3rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-dark-maroon)' }}>
                {product.capabilitiesSectionTitle || 'Key Architectural Capabilities'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(product.keyCapabilities || []).map((cap, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--color-primary-maroon)', flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-dark-maroon)' }}>
                {product.integrationsSectionTitle || 'Enterprise Integration Features'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(product.features || []).map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--color-primary-maroon)', flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </Reveal>
      </section>

      {/* Common Final CTA */}
      <FinalCTA />
    </div>
  );
};
