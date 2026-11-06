import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Compass,
  Cpu,
  Layers,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SEOHead } from "../components/common/SEOHead";
import { Button } from "../components/common/Button";
import { Reveal } from "../components/common/Reveal";
import { FinalCTA } from "../components/home/FinalCTA";
import { StrategicSolutions } from "../components/home/StrategicSolutions";
import { productsCatalog } from "../data/productsData";
import { ProductStatusBadge } from "../components/common/ProductStatusBadge";
import { serviceOfferings } from "../data/servicesData";
import { deliveryStages } from "../data/deliveryData";
import { useCMS } from "../context/CMSContext";
import { getPublicProducts, getPublicServices } from "../utils/publicContent";
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from "../components/common/CmsPageLayout";

const serviceIcon = (name: string) => {
  switch (name) {
    case "Compass":
      return <Compass size={22} />;
    case "Users":
      return <Users size={22} />;
    case "Workflow":
      return <Workflow size={22} />;
    default:
      return <Cpu size={22} />;
  }
};

export const Portfolio: React.FC = () => {
  const { pages, products: cmsProducts, services: cmsServices, portfolio: cmsPortfolio } = useCMS();
  const portfolioPage = pages["portfolio"] || {};

  const heroKicker = portfolioPage.kicker || "Our Portfolio";
  const heroTitlePart1 =
    portfolioPage.snapshotTitle || "Software Solutions & Engineering Services";
  const heroTitleHighlight =
    portfolioPage.snapshotTitleHighlight || "Built for Growth.";
  const heroDescription =
    portfolioPage.snapshotDescription ||
    "Explore the software platforms we are building and the engineering practices we use to modernise systems, extend teams, and improve operations. Every engagement starts with a clear scope and a practical plan.";
  const heroNote =
    portfolioPage.snapshotNote ||
    "Platforms are at different stages of readiness. Scope, deployment, and licensing are agreed per engagement.";

  const productsBadge = portfolioPage.productsBadge || "Software Products";
  const productsTitle =
    portfolioPage.productsTitle || "Software Products & Platforms";
  const productsSubtitle =
    portfolioPage.productsSubtitle ||
    "Purpose-engineered software platforms designed for scalable multi-location operations, omnichannel digital commerce, healthcare informatics, and enterprise workforce learning.";

  const servicesBadge =
    portfolioPage.servicesBadge || "Enterprise Engineering Services";
  const servicesTitle =
    portfolioPage.servicesTitle || "Services & Engineering Practices";
  const servicesSubtitle =
    portfolioPage.servicesSubtitle ||
    "Our practices cover the work that sits around a platform: digital modernisation, technical direction, dedicated engineering capacity, and process automation.";

  const displayProducts = getPublicProducts(cmsProducts || [], productsCatalog);
  const displayServices = getPublicServices(
    cmsServices || [],
    serviceOfferings,
  );

  const location = useLocation();
  const [_activeSection, setActiveSection] = useState<"products" | "services">("products");
  const isUserScrollingRef = useRef(false);

  // Handle anchor navigation on initial load and route/hash changes
  useEffect(() => {
    const rawHash = location.hash ? location.hash.replace("#", "") : "";
    if (!rawHash) return;

    const targetId =
      rawHash === "platforms"
        ? "products"
        : rawHash === "capabilities"
          ? "services"
          : rawHash;

    if (targetId === "products" || targetId === "services") {
      setActiveSection(targetId);

      const attemptScroll = (behavior: ScrollBehavior) => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior, block: "start" });
        }
      };

      // Immediate attempt on animation frame
      const raf = requestAnimationFrame(() => attemptScroll("auto"));

      // Staggered timers to ensure correct scroll position after layout, fonts, and images settle
      const t1 = setTimeout(() => attemptScroll("smooth"), 80);
      const t2 = setTimeout(() => attemptScroll("smooth"), 280);
      const t3 = setTimeout(() => attemptScroll("smooth"), 550);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [location.hash, location.pathname]);

  // Track active section via IntersectionObserver for scroll spy
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isUserScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "products") {
            setActiveSection("products");
          } else if (entry.target.id === "services") {
            setActiveSection("services");
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0.1,
    });

    const productsEl = document.getElementById("products");
    const servicesEl = document.getElementById("services");

    if (productsEl) observer.observe(productsEl);
    if (servicesEl) observer.observe(servicesEl);

    return () => observer.disconnect();
  }, []);

  const seoTitle = portfolioPage.seoTitle || "Our Portfolio — Platforms & Engineering Capabilities | Azaroth Tech-Hive";
  const seoDescription = portfolioPage.seoDescription || "Explore Azaroth Tech-Hive's software platforms and engineering capabilities across digital transformation, strategic consulting, on-demand engineering, and process automation.";
  const seoCanonicalPath = portfolioPage.seoCanonicalPath || "/portfolio";

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      <CmsPageLayout pageSlug="portfolio" page={portfolioPage}>
      {/* HERO */}
      <CmsPageSectionSlot id="hero">
      <section className="portfolio-hero">
        <div className="portfolio-hero-grid-bg" aria-hidden="true" />
        <div className="portfolio-hero-glow" aria-hidden="true" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="portfolio-hero-grid">
            <Reveal>
              <div className="portfolio-kicker">
                <Layers size={16} />
                <span>{heroKicker}</span>
              </div>

              <h1 className="portfolio-hero-title">
                {heroTitlePart1}{" "}
                <span
                  style={{
                    background: "var(--gradient-heading)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {heroTitleHighlight}
                </span>
              </h1>

              <p className="portfolio-hero-copy">{heroDescription}</p>

              <div className="portfolio-hero-note">
                <ShieldCheck size={15} />
                <span>{heroNote}</span>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="portfolio-snapshot">
                <div className="portfolio-snapshot-title">
                  <Building2 size={18} />
                  <span>Portfolio at a glance</span>
                </div>
                {[
                  {
                    icon: <Layers size={18} />,
                    label: "Software platforms",
                    value: `${displayProducts.length} in development`,
                  },
                  {
                    icon: <Compass size={18} />,
                    label: "Engineering practices",
                    value: `${displayServices.length} core services`,
                  },
                  {
                    icon: <Building2 size={18} />,
                    label: "Delivery framework",
                    value: `${deliveryStages.length} defined stages`,
                  },
                ].map((item) => (
                  <div key={item.label} className="portfolio-snapshot-row">
                    <span className="portfolio-snapshot-icon">{item.icon}</span>
                    <span className="portfolio-snapshot-label">
                      {item.label}
                    </span>
                    <strong className="portfolio-snapshot-value">
                      {item.value}
                    </strong>
                  </div>
                ))}
                <div className="portfolio-snapshot-foot">
                  Reflecting our current platform and service catalog.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* 1. DEDICATED PRODUCTS SECTION */}
      <CmsPageSectionSlot id="products">
      <section
        id="products"
        className="portfolio-section portfolio-section--muted"
        style={{ scrollMarginTop: "5.5rem" }}
      >
        {/* Alias for backwards compatibility with legacy #platforms links */}
        <div id="platforms" style={{ position: "relative", top: "-5.5rem", height: 0 }} aria-hidden="true" />
        <div className="container">
          <Reveal className="portfolio-section-head">
            <div className="portfolio-section-heading">
              <div className="portfolio-kicker">
                <Layers size={16} />
                <span>{productsBadge}</span>
              </div>
              <h2 className="portfolio-section-title">{productsTitle}</h2>
            </div>
            <div className="portfolio-section-aside">
              <p className="portfolio-section-copy">{productsSubtitle}</p>
            </div>
          </Reveal>

          <div className="portfolio-products-showcase">
            {displayProducts.map((product, index) => (
              <Reveal
                key={product.id}
                delay={index * 0.06}
                className="portfolio-product-card"
              >
                <div className="portfolio-product-media">
                  <img
                    src={product.coverImage}
                    alt={product.coverAlt}
                    loading="lazy"
                  />

                  <div
                    className="portfolio-product-overlay"
                    aria-hidden="true"
                  />

                  <div className="portfolio-product-status">
                    <ProductStatusBadge
                      status={product.status || "Under Development"}
                      colorScheme={product.statusColor}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="portfolio-product-body">
                  <h3>{product.name}</h3>

                  <div className="portfolio-product-tagline">
                    {product.tagline}
                  </div>

                  <p>{product.shortDescription}</p>

                  <div className="portfolio-product-footer">
                    <Link
                      to={`/products?product=${product.slug}`}
                      state={{ from: '/portfolio' }}
                      className="portfolio-inline-link"
                    >
                      <span>{productsBadge || "Explore More"}</span>
                      <ArrowUpRight size={15} />
                    </Link>

                    <Button
                      to="/connect-with-us"
                      variant="primary"
                      size="sm"
                    >
                      {servicesTitle || "Request a Demo"}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* 2. DEDICATED SERVICES SECTION */}
      <CmsPageSectionSlot id="services">
      <section
        id="services"
        className="portfolio-section"
        style={{ scrollMarginTop: "5.5rem" }}
      >
        <div id="capabilities" className="container">
          <Reveal className="portfolio-section-head">
            <div className="portfolio-section-heading">
              <div className="portfolio-kicker">
                <Workflow size={16} />
                <span>{servicesBadge}</span>
              </div>
              <h2 className="portfolio-section-title">{servicesTitle}</h2>
            </div>
            <div className="portfolio-section-aside">
              <p className="portfolio-section-copy">{servicesSubtitle}</p>
            </div>
          </Reveal>

          <div className="portfolio-cap-grid">
            {displayServices.map((service, index) => (
              <Reveal
                key={service.id}
                delay={index * 0.06}
                className="portfolio-cap-card"
              >
                <div className="portfolio-cap-top">
                  <span className="portfolio-icon-tile">
                    {serviceIcon(service.iconName)}
                  </span>

                  <h3>{service.title}</h3>
                </div>

                <div className="portfolio-best-for">
                  <span>Best for</span>
                  <p>{service.bestFor}</p>
                </div>

                <div className="portfolio-capability-list">
                  {(service.capabilities || [])
                    .slice(0, 3)
                    .map((capability) => (
                      <div key={capability}>
                        <Check size={14} />
                        <span>{capability}</span>
                      </div>
                    ))}
                </div>

                <div className="portfolio-card-footer">
                  <Link
                    to={`/connect-with-us`}
                    className="portfolio-inline-link"
                  >
                    <span>{servicesBadge || "Get Started"}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* Featured Projects Slider */}
      <CmsPageSectionSlot id="featuredProjects">
      <StrategicSolutions />
      </CmsPageSectionSlot>

      <CmsPageSectionSlot id="finalCta">
      <FinalCTA />
      </CmsPageSectionSlot>
      </CmsPageLayout>

      <style>{`
        .portfolio-hero {
          background-color: #FFFFFF;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding-top: clamp(3.25rem, 7vw, 5.5rem);
          padding-bottom: clamp(3rem, 6vw, 4.75rem);
          position: relative;
          overflow: hidden;
        }

        .portfolio-hero-grid-bg {
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

        .portfolio-hero-glow {
          position: absolute;
          top: -20%;
          right: 5%;
          width: 620px;
          height: 520px;
          background: radial-gradient(circle at center, rgba(73, 36, 63, 0.10) 0%, rgba(201, 155, 82, 0.05) 45%, transparent 72%);
          pointer-events: none;
        }

        .portfolio-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }

        .portfolio-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #49243F;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 0.9rem;
        }

        .portfolio-hero-title {
          font-size: clamp(1.85rem, 3.5vw, 2.35rem);
          font-weight: 600;
          color: #1E293B;
          line-height: 1.22;
          letter-spacing: -0.025em;
          margin-bottom: 1.25rem;
        }

        .portfolio-hero-copy {
          font-size: 1rem;
          color: #475569;
          line-height: 1.7;
          max-width: 620px;
          margin-bottom: 1.75rem;
        }

        .portfolio-actions {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .portfolio-text-link,
        .portfolio-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #49243F;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: gap 160ms ease, color 160ms ease;
        }

        .portfolio-text-link:hover,
        .portfolio-inline-link:hover {
          gap: 0.6rem;
          color: #8A315D;
        }

        .portfolio-hero-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #64748B;
          font-size: 0.8125rem;
          line-height: 1.55;
          max-width: 560px;
        }

        .portfolio-hero-note svg {
          color: #49243F;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .portfolio-snapshot {
          background: linear-gradient(180deg, #FFFFFF 0%, #FBF7F2 100%);
          border: 1px solid rgba(227, 218, 207, 0.95);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 24px 55px -28px rgba(73, 36, 63, 0.35);
        }

        .portfolio-snapshot-title {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #49243F;
          padding-bottom: 1rem;
          margin-bottom: 0.35rem;
          border-bottom: 1px solid rgba(227, 218, 207, 0.9);
        }

        .portfolio-snapshot-row {
          display: grid;
          grid-template-columns: 2rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 0;
          border-bottom: 1px solid rgba(227, 218, 207, 0.65);
        }

        .portfolio-snapshot-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.6rem;
          background: rgba(73, 36, 63, 0.08);
          color: #49243F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .portfolio-snapshot-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
        }

        .portfolio-snapshot-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
          text-align: right;
        }

        .portfolio-snapshot-foot {
          padding-top: 0.9rem;
          font-size: 0.75rem;
          color: #64748B;
          line-height: 1.5;
        }

        .portfolio-section {
          padding: clamp(3rem, 7vw, 5rem) 0;
          background-color: #FFFFFF;
          scroll-margin-top: 5.5rem;
        }

        .portfolio-anchor-nav {
          position: sticky;
          top: clamp(3.5rem, 5vw, 4.75rem);
          z-index: 30;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
          padding: 0.75rem 0;
          box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.04);
        }

        .portfolio-anchor-pills {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .portfolio-anchor-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.15rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          text-decoration: none;
          transition: all 180ms ease-out;
          cursor: pointer;
        }

        .portfolio-anchor-pill:hover {
          background-color: #F1F5F9;
          color: #1E293B;
          transform: translateY(-1px);
        }

        .portfolio-anchor-pill--active {
          background: var(--gradient-button, #49243F) !important;
          color: #FFFFFF !important;
          border-color: #49243F !important;
          box-shadow: 0 4px 14px rgba(73, 36, 63, 0.25);
        }

        .portfolio-anchor-pill--active .portfolio-anchor-count {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }

        .portfolio-anchor-count {
          font-size: 0.75rem;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
          background: #E2E8F0;
          color: #64748B;
          font-weight: 600;
          transition: all 180ms ease;
        }

        .portfolio-hero-anchor-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.4rem;
          border-radius: 9999px;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 180ms ease-out;
        }

        .portfolio-hero-anchor-btn--primary {
          background: var(--gradient-button);
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(73, 36, 63, 0.3);
        }

        .portfolio-hero-anchor-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(73, 36, 63, 0.4);
          opacity: 0.95;
        }

        .portfolio-hero-anchor-btn--secondary {
          background: #FFFFFF;
          color: #49243F;
          border: 1.5px solid #49243F;
        }

        .portfolio-hero-anchor-btn--secondary:hover {
          background: rgba(73, 36, 63, 0.05);
          transform: translateY(-2px);
        }

        .portfolio-section--muted {
          background-color: #F8FAFC;
        }

        .portfolio-section-head {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2.75rem;
        }

        .portfolio-section-heading {
          width: 100%;
          max-width: 1100px;
        }
          
.portfolio-products-showcase {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 1.5rem;
}

.portfolio-product-card {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #E2E8F0);
  border-radius: 1.25rem;
  box-shadow: 0 6px 22px -8px rgba(15, 23, 42, 0.08);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.portfolio-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -18px rgba(73, 36, 63, 0.18);
  border-color: rgba(73, 36, 63, 0.22);
}

.portfolio-product-media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-soft, #F5F8FB);
}

.portfolio-product-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}

.portfolio-product-card:hover .portfolio-product-media img {
  transform: scale(1.04);
}

.portfolio-product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.02) 35%,
    rgba(15, 23, 42, 0.38) 100%
  );
  pointer-events: none;
}

.portfolio-product-status {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 1;
  max-width: calc(100% - 1.7rem);
}

.portfolio-product-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.35rem;
}

.portfolio-product-body h3 {
  margin: 0 0 0.45rem;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--color-text-primary, #1E293B);
}

.portfolio-product-tagline {
  margin-bottom: 0.75rem;
  color: var(--color-primary-maroon, #49243F);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.5;
}

.portfolio-product-body > p {
  flex: 1;
  margin: 0 0 1.1rem;
  color: var(--color-text-secondary, #64748B);
  font-size: 0.9rem;
  line-height: 1.7;
}

.portfolio-product-capabilities {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.45rem;
  margin-bottom: 1.2rem;
}

.portfolio-capability-pill {
  max-width: 100%;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-border-subtle, #E2E8F0);
  border-radius: 999px;
  background: var(--color-surface-soft, #F5F8FB);
  color: var(--color-text-secondary, #475569);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.portfolio-product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 1rem;
  margin-top: auto;
  border-top: 1px solid var(--color-border-subtle, #E2E8F0);
}

@media (max-width: 1024px) {
  .portfolio-products-showcase {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .portfolio-products-showcase {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .portfolio-product-body {
    padding: 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-product-card,
  .portfolio-product-media img {
    transition: none;
  }

  .portfolio-product-card:hover {
    transform: none;
  }
}


        .portfolio-section-aside {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          width: 100%;
        }

        .portfolio-section-title {
          font-size: clamp(1.65rem, 2.8vw, 2.15rem);
          font-weight: 600;
          color: #1E293B;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin-bottom: 0;
        }

        .portfolio-section-copy {
          color: #64748B;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 100%;
        }

        .portfolio-featured-card {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 24px 55px -26px rgba(73, 36, 63, 0.28);
          margin-bottom: 2.25rem;
        }

        .portfolio-featured-media {
          position: relative;
          min-height: 390px;
          background-color: #0F172A;
          overflow: hidden;
        }

        .portfolio-featured-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .portfolio-featured-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.66) 0%, rgba(15, 23, 42, 0.12) 55%, transparent 100%);
          pointer-events: none;
        }

        .portfolio-featured-badges {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .portfolio-featured-label {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background-color: rgba(255, 255, 255, 0.94);
          color: #49243F;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.35rem 0.6rem;
          border-radius: 9999px;
          backdrop-filter: blur(6px);
        }

        .portfolio-featured-category {
          position: absolute;
          left: 1.15rem;
          bottom: 1rem;
          z-index: 1;
          color: #FFFFFF;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-shadow: 0 1px 8px rgba(15, 23, 42, 0.5);
        }

        .portfolio-featured-body {
          padding: clamp(1.5rem, 3vw, 2.25rem);
          display: flex;
          flex-direction: column;
        }

        .portfolio-featured-eyebrow {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.5rem;
        }

        .portfolio-featured-body h3 {
          font-size: clamp(1.35rem, 2.2vw, 1.65rem);
          font-weight: 600;
          color: #1E293B;
          line-height: 1.25;
          letter-spacing: -0.015em;
          margin-bottom: 0.45rem;
        }

        .portfolio-featured-tagline {
          font-size: 0.875rem;
          font-weight: 600;
          color: #49243F;
          line-height: 1.45;
          margin-bottom: 0.9rem;
        }

        .portfolio-featured-body > p {
          font-size: 0.9375rem;
          color: #64748B;
          line-height: 1.68;
          margin-bottom: 1.35rem;
        }

        .portfolio-ongoing-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }

        .portfolio-ongoing-head h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.2rem;
        }

        .portfolio-ongoing-head p {
          font-size: 0.8125rem;
          color: #64748B;
        }

        .portfolio-ongoing-count {
          display: inline-flex;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 9999px;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }

        .portfolio-ongoing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .portfolio-ongoing-grid .portfolio-platform-media {
          height: 180px;
        }

        .portfolio-ongoing-grid .portfolio-platform-body {
          padding: 1.35rem 1.25rem 1.2rem;
        }

        .portfolio-ongoing-grid .portfolio-platform-body h3 {
          font-size: 1.1rem;
        }

        .portfolio-ongoing-grid .portfolio-platform-body > p {
          font-size: 0.8125rem;
        }

        .portfolio-ongoing-label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.35rem;
        }

        .portfolio-platform-grid,
        .portfolio-cap-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.75rem;
        }

        .portfolio-platform-card,
        .portfolio-cap-card,
        .portfolio-approach-card,
        .portfolio-principle-card {
          background-color: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 1.35rem;
          box-shadow: 0 6px 22px -8px rgba(15, 23, 42, 0.08);
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          height: 100%;
        }

        .portfolio-platform-card:hover,
        .portfolio-cap-card:hover,
        .portfolio-approach-card:hover,
        .portfolio-principle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -18px rgba(73, 36, 63, 0.2);
          border-color: rgba(73, 36, 63, 0.22);
        }

        .portfolio-platform-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .portfolio-platform-media {
          position: relative;
          height: 215px;
          background-color: #0F172A;
          overflow: hidden;
        }

        .portfolio-platform-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 400ms ease;
        }

        .portfolio-platform-card:hover .portfolio-platform-media img {
          transform: scale(1.04);
        }

        .portfolio-platform-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.05) 55%, transparent 100%);
          pointer-events: none;
        }

        .portfolio-platform-status {
          position: absolute;
          top: 0.9rem;
          right: 0.9rem;
          z-index: 1;
        }

        .portfolio-platform-category {
          position: absolute;
          left: 1rem;
          bottom: 0.9rem;
          z-index: 1;
          color: #FFFFFF;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-shadow: 0 1px 8px rgba(15, 23, 42, 0.5);
        }

        .portfolio-platform-body {
          padding: 1.6rem 1.6rem 1.4rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .portfolio-platform-body h3,
        .portfolio-cap-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.3;
          margin-bottom: 0.4rem;
        }

        .portfolio-platform-tagline {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #49243F;
          line-height: 1.45;
          margin-bottom: 0.85rem;
        }

        .portfolio-platform-body > p,
        .portfolio-approach-card > p,
        .portfolio-principle-card > p {
          font-size: 0.9rem;
          color: #64748B;
          line-height: 1.65;
        }

        .portfolio-platform-body > p {
          margin-bottom: 1.1rem;
        }

        .portfolio-capability-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1.35rem;
        }

        .portfolio-capability-list > div {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
          font-size: 0.8125rem;
          color: #475569;
          line-height: 1.45;
        }

        .portfolio-capability-list svg {
          color: #1F5132;
          flex-shrink: 0;
          margin-top: 0.14rem;
        }

        .portfolio-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding-top: 1.1rem;
          margin-top: auto;
          border-top: 1px solid #E2E8F0;
        }

        .portfolio-cap-card {
          padding: 1.75rem 1.6rem 1.4rem;
          display: flex;
          flex-direction: column;
        }

        .portfolio-cap-top {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .portfolio-cap-top h3 {
          flex: 1;
          min-width: 0;
          margin-bottom: 0;
        }

        .portfolio-icon-tile {
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

        .portfolio-cap-category {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
          text-align: right;
          line-height: 1.4;
        }

        .portfolio-best-for {
          padding: 0.75rem 0.85rem;
          border-radius: 0.7rem;
          background: rgba(201, 155, 82, 0.10);
          border: 1px solid rgba(201, 155, 82, 0.24);
          margin: 0.9rem 0 1rem;
        }

        .portfolio-best-for span {
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A5422;
          margin-bottom: 0.25rem;
        }

        .portfolio-best-for p {
          font-size: 0.8125rem;
          color: #475569;
          line-height: 1.5;
        }

        .portfolio-approach-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .portfolio-approach-card {
          padding: 1.5rem 1.4rem;
          position: relative;
          background: linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 100%);
        }

        .portfolio-approach-number {
          font-size: 2rem;
          font-weight: 600;
          line-height: 1;
          color: rgba(73, 36, 63, 0.16);
          margin-bottom: 0.6rem;
          letter-spacing: -0.03em;
        }

        .portfolio-approach-card h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.25rem;
        }

        .portfolio-approach-tagline {
          font-size: 0.75rem;
          font-weight: 600;
          color: #49243F;
          line-height: 1.4;
          margin-bottom: 0.7rem;
        }

        .portfolio-principles-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .portfolio-principle-card {
          padding: 1.6rem 1.4rem;
        }

        .portfolio-principle-card h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1E293B;
          margin: 1rem 0 0.5rem;
        }

        .portfolio-principle-card > p {
          font-size: 0.84375rem;
        }

        .portfolio-section-title,
        .portfolio-featured-body h3,
        .portfolio-platform-body h3,
        .portfolio-ongoing-head h3,
        .portfolio-cap-card h3,
        .portfolio-approach-card h3,
        .portfolio-principle-card h3 {
          background-image: var(--gradient-heading);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        @media (max-width: 1080px) {
          .portfolio-principles-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .portfolio-ongoing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .portfolio-hero-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-snapshot {
            max-width: 620px;
            margin: 0 auto;
            width: 100%;
          }

          .portfolio-featured-card {
            grid-template-columns: 1fr;
          }

          .portfolio-featured-media {
            min-height: 300px;
            aspect-ratio: 16 / 9;
          }

          .portfolio-approach-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 860px) {
          .portfolio-platform-grid,
          .portfolio-cap-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .portfolio-ongoing-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-ongoing-grid .portfolio-platform-media {
            height: 200px;
          }
        }

        @media (max-width: 620px) {
          .portfolio-approach-grid,
          .portfolio-principles-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-actions {
            align-items: stretch;
          }

          .portfolio-actions .btn {
            width: 100%;
            justify-content: center;
          }

          .portfolio-hero-title {
            font-size: clamp(2rem, 9vw, 2.6rem);
          }

          .portfolio-featured-card {
            border-radius: 1.25rem !important;
            margin-bottom: 1.75rem !important;
          }

          .portfolio-featured-media {
            min-height: 200px !important;
            aspect-ratio: 16 / 9 !important;
          }

          .portfolio-featured-body {
            padding: 1.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .portfolio-snapshot {
            padding: 1.15rem !important;
            border-radius: 1.15rem !important;
          }

          .portfolio-snapshot-row {
            grid-template-columns: 1.75rem minmax(0, 1fr) auto !important;
            gap: 0.5rem !important;
            padding: 0.75rem 0 !important;
          }

          .portfolio-snapshot-label,
          .portfolio-snapshot-value {
            font-size: 0.8125rem !important;
          }
        }

        @media (max-width: 360px) {
          .portfolio-snapshot-row {
            grid-template-columns: 1.5rem minmax(0, 1fr) !important;
          }

          .portfolio-snapshot-value {
            grid-column: 2 / -1 !important;
            text-align: left !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-platform-media img,
          .portfolio-platform-card,
          .portfolio-cap-card,
          .portfolio-approach-card,
          .portfolio-principle-card {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
