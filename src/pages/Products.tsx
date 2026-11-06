import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { ArrowRight, CheckCircle2, X, Layers, Zap } from "lucide-react";
import { SEOHead } from "../components/common/SEOHead";
import { PageHeader } from "../components/common/PageHeader";
import { productsCatalog } from "../data/productsData";
import { useCMS } from "../context/CMSContext";
import { ProductStatusBadge } from "../components/common/ProductStatusBadge";
import { MediaRenderer } from "../components/common/MediaRenderer";
import { Reveal } from "../components/common/Reveal";
import { FinalCTA } from "../components/home/FinalCTA";
import { getPublicProducts } from "../utils/publicContent";
import {
  CmsPageLayout,
  CmsPageSectionSlot,
} from "../components/common/CmsPageLayout";

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { products: cmsProducts, pages } = useCMS();
  const productsPage = pages["products"] || {};
  const heroKicker = productsPage.kicker || "- OUR PRODUCTS -";
  const heroTitle =
    productsPage.heroTitle || "Our Products & Platform Foundations";
  const heroSubtitle =
    productsPage.heroSubtitle ||
    "Four platforms in active development, each available for scoped early builds. They give your teams a practical starting point for the roadmap while keeping scope, branding, and operational ownership clear.";

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const closedProductRef = useRef<string | null>(null);

  const effectiveProducts = useMemo(() => {
    return getPublicProducts(cmsProducts || [], productsCatalog);
  }, [cmsProducts]);

  // If a slug was passed in URL or query param, automatically select that product
  useEffect(() => {
    const targetSlug = slug || searchParams.get("product");
    if (targetSlug) {
      if (targetSlug !== closedProductRef.current) {
        const found = effectiveProducts.find(
          (p) => p.slug === targetSlug || p.id === targetSlug,
        );
        if (found) {
          setSelectedProduct(found);
        }
      }
    } else {
      closedProductRef.current = null;
      setSelectedProduct(null);
    }
  }, [slug, searchParams, effectiveProducts]);

  const handleCloseModal = useCallback(() => {
    const currentSlug =
      selectedProduct?.slug || slug || searchParams.get("product");
    if (currentSlug) {
      closedProductRef.current = currentSlug;
    }
    setSelectedProduct(null);

    if (location.state?.from) {
      navigate(location.state.from);
    } else if (searchParams.has("product")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("product");
      const queryString = newParams.toString();
      navigate(queryString ? `/products?${queryString}` : "/products", {
        replace: true,
      });
    } else if (slug) {
      navigate("/products", { replace: true });
    }
  }, [selectedProduct, slug, searchParams, location.state, navigate]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProduct, handleCloseModal]);

  const filteredProducts = effectiveProducts.filter(
    (product) => product.isEnabled !== false,
  );

  const handleBookDemo = (product: any) => {
    navigate(`/connect-with-us?product=${encodeURIComponent(product.slug)}`);
  };

  const seoTitle = productsPage.seoTitle || "Enterprise Software Platforms — Fitness, E-Commerce, Healthcare & Learning Management";
  const seoDescription = productsPage.seoDescription || "Enterprise software platforms in active development: Fitness Management System, Multi-Store E-Commerce, Healthcare Management System, and Learning Management Platform — available for scoped early builds, fully customizable with complete source ownership.";
  const seoCanonicalPath = slug ? `/products/${slug}` : (productsPage.seoCanonicalPath || "/products");

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoCanonicalPath}
      />

      <CmsPageLayout pageSlug="products" page={productsPage}>
      {/* Hero */}
      <CmsPageSectionSlot id="hero">
      <PageHeader
        kicker={heroKicker}
        title={heroTitle}
        gradientWords={["Products", "Platform", "Foundations"]}
        subtitle={heroSubtitle}
        actions={
          <>
            {/* <Link
              to="/connect-with-us"
              style={{
                padding: '0.875rem 1.75rem',
                borderRadius: '9999px',
                background: 'var(--gradient-button)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 18px rgba(73, 36, 63, 0.35)',
                transition: 'all 180ms ease-out',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              className="hover:scale-[1.02] hover:opacity-95"
            >
              <span>Schedule Platform Consultation</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/services"
              style={{
                padding: '0.875rem 1.75rem',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: '#1E293B',
                border: '1px solid #CBD5E1',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'all 180ms ease-out',
              }}
              className="hover:bg-slate-50"
            >
              See engineering practices
            </Link> */}
          </>
        }
      />
      </CmsPageSectionSlot>

      {/* Product Grid */}
      <CmsPageSectionSlot id="catalog">
      <section style={{ backgroundColor: "#F8FAFC", padding: "5.5rem 0" }}>
        <div className="container">
          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div
              style={{
                padding: "3rem 1.5rem",
                borderRadius: "1.25rem",
                border: "1px dashed #CBD5E1",
                backgroundColor: "#ffffff",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem", color: "#1E293B" }}>
                No platforms found.
              </h3>
              <p style={{ margin: 0, color: "#64748B" }}>
                Check back soon for enterprise software platforms.
              </p>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="grid-layout-3x3">
              {filteredProducts
                .filter((p) => p.isEnabled !== false)
                .map((product, productIndex) => (
                  <Reveal
                    key={product.id}
                    id={product.slug}
                    delay={productIndex * 0.08}
                    style={{
                      scrollMarginTop: "7rem",
                      backgroundColor: "#ffffff",
                      borderRadius: "1.5rem",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.05)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      transition: "all 200ms ease-out",
                    }}
                    className="hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
                  >
                    {/* Visual Header */}
                    <div
                      style={{
                        position: "relative",
                        height: "240px",
                        backgroundColor: "#0F172A",
                        overflow: "hidden",
                      }}
                    >
                      <MediaRenderer
                        src={product.coverImage}
                        alt={product.coverAlt}
                        objectFit="cover"
                        loading="lazy"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                          zIndex: 2,
                        }}
                      >
                        <ProductStatusBadge
                          status={product.status || "Under Development"}
                          colorScheme={(product as any).statusColor}
                          size="sm"
                        />
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "1rem",
                          left: "1.25rem",
                          right: "1.25rem",
                          color: "#ffffff",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color:
                              product.status === "Live"
                                ? "#A7F3D0"
                                : product.status === "Ready For Deployment"
                                  ? "#BFDBFE"
                                  : "#FECDD3",
                          }}
                        >
                          {/* {product.status === 'Live'
                          ? 'Production Live Platform'
                          : product.status === 'Ready For Deployment'
                            ? 'Ready for Enterprise Deployment'
                            : 'Platform In Active Development'} */}
                        </span>
                        <h2
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            color: "#ffffff",
                            lineHeight: 1.25,
                            marginTop: "0.25rem",
                          }}
                        >
                          {product.name}
                        </h2>
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        padding: "1.75rem",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: 1,
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: "#49243F",
                            marginBottom: "0.5rem",
                            minHeight: "1.15rem",
                          }}
                        >
                          {product.tagline}
                        </p>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            color: "#64748B",
                            lineHeight: 1.6,
                            minHeight: "3.5rem",
                            flexGrow: 1,
                            margin: 0,
                          }}
                        >
                          {product.shortDescription}
                        </p>
                      </div>

                      {/* What You Get Deliverables */}
                      <div
                        style={{
                          borderTop: "1px solid #F1F5F9",
                          paddingTop: "1rem",
                          marginBottom: "1.5rem",
                          minHeight: "6.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#475569",
                            marginBottom: "0.75rem",
                            display: "block",
                          }}
                        >
                          Key Capabilities:
                        </span>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.45rem",
                          }}
                        >
                          {(product.benefits || [])
                            .slice(0, 3)
                            .map((benefit: string, i: number) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                  fontSize: "0.8125rem",
                                  color: "#334155",
                                }}
                              >
                                <CheckCircle2
                                  size={15}
                                  style={{
                                    color: "#059669",
                                    flexShrink: 0,
                                    marginTop: "0.125rem",
                                  }}
                                />
                                <span>{benefit}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Actions: "See Full Details" (Opens Popup) + "Schedule Demo" */}
                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: "1.25rem",
                          borderTop: "1px solid #E2E8F0",
                          display: "flex",
                          gap: "0.75rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          style={{
                            flex: 1,
                            padding: "0.7rem 1rem",
                            borderRadius: "9999px",
                            border: "1.5px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            color: "#1E293B",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 160ms ease-out",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          className="hover:border-rose-400 hover:text-rose-700 hover:bg-rose-50"
                        >
                          See Full Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBookDemo(product)}
                          style={{
                            flex: 1,
                            padding: "0.7rem 1rem",
                            borderRadius: "9999px",
                            background: "var(--gradient-button)",
                            color: "#FFFFFF",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            boxShadow: "0 3px 12px rgba(73, 36, 63, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.375rem",
                            transition: "all 160ms ease-out",
                          }}
                          className="hover:opacity-95 hover:scale-[1.02]"
                        >
                          <span>Schedule Demo</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
            </div>
          )}
        </div>
      </section>
      </CmsPageSectionSlot>

      {/* Common Final CTA */}
      <CmsPageSectionSlot id="finalCta">
      <FinalCTA />
      </CmsPageSectionSlot>
      </CmsPageLayout>

      {/* Product Details Popup Modal (Requirement 5) */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "1.75rem",
              maxWidth: "820px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
              border: "1px solid #FFE4E6",
              position: "relative",
              animation: "modalSlideIn 240ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Modal Header with Close Button */}
            <div
              style={{
                background: "#49243F",
                color: "#FFFFFF",
                padding: "1.75rem 2rem",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close product details popup"
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 160ms ease",
                }}
                className="hover:bg-white/30"
              >
                <X size={20} />
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "0.5rem",
                }}
              >
                <ProductStatusBadge
                  status={selectedProduct.status || "Under Development"}
                  colorScheme={selectedProduct.statusColor}
                  size="sm"
                />
              </div>

              <h2
                id="modal-product-title"
                style={{
                  fontSize: "clamp(1.35rem, 2.8vw, 1.75rem)",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.25,
                }}
              >
                {selectedProduct.name}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#FFE4E6",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                }}
              >
                {selectedProduct.tagline}
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div
              style={{
                padding: "2rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1.75rem",
              }}
            >
              {/* Detailed Overview */}
              <div>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#1E293B",
                    marginBottom: "0.625rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Platform Overview
                </h3>
                <p
                  style={{
                    color: "#475569",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {selectedProduct.description ||
                    selectedProduct.shortDescription}
                </p>
              </div>

              {/* Key Capabilities */}
              {selectedProduct.keyCapabilities &&
                selectedProduct.keyCapabilities.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderRadius: "1rem",
                      padding: "1.25rem 1.5rem",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#1E293B",
                        marginBottom: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Layers size={16} color="#49243F" />
                      <span>Key Capabilities &amp; Architecture Modules</span>
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                        gap: "0.625rem",
                      }}
                    >
                      {selectedProduct.keyCapabilities.map(
                        (cap: string, i: number) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              fontSize: "0.8125rem",
                              color: "#334155",
                            }}
                          >
                            <CheckCircle2
                              size={15}
                              style={{
                                color: "#059669",
                                flexShrink: 0,
                                marginTop: "0.15rem",
                              }}
                            />
                            <span>{cap}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Core Features & Deliverables */}
              <div>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1E293B",
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Zap size={16} color="#49243F" />
                  <span>Platform Deliverables &amp; Ownership</span>
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                    gap: "0.625rem",
                  }}
                >
                  {(selectedProduct.benefits || []).map(
                    (benefit: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          fontSize: "0.8125rem",
                          color: "#334155",
                        }}
                      >
                        <CheckCircle2
                          size={15}
                          style={{
                            color: "#059669",
                            flexShrink: 0,
                            marginTop: "0.15rem",
                          }}
                        />
                        <span>{benefit}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Technical Specifications Highlights */}
              {/* {selectedProduct.techSpecs && (
                <div style={{ backgroundColor: '#FFF1F2', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid #FECDD3' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#49243F', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={16} color="#49243F" />
                    <span>Technical Architecture Specs</span>
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#475569' }}>
                    {selectedProduct.techSpecs.latency && (
                      <div>
                        <strong>Latency:</strong> {selectedProduct.techSpecs.latency}
                      </div>
                    )}
                    {selectedProduct.techSpecs.concurrency && (
                      <div>
                        <strong>Concurrency:</strong> {selectedProduct.techSpecs.concurrency}
                      </div>
                    )}
                    {selectedProduct.techSpecs.protocols && Array.isArray(selectedProduct.techSpecs.protocols) && (
                      <div>
                        <strong>Protocols:</strong> {selectedProduct.techSpecs.protocols.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: "1.25rem 2rem",
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                }}
                className="hover:bg-slate-100"
              >
                Close
              </button>

              {/* <button
                type="button"
                onClick={() => {
                  const slug = selectedProduct.slug;
                  setSelectedProduct(null);
                  navigate(`/connect-with-us?product=${encodeURIComponent(slug)}`);
                }}
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '9999px',
                  background: 'var(--gradient-button)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(73, 36, 63, 0.35)',
                  transition: 'all 160ms ease-out',
                }}
                className="hover:opacity-95 hover:scale-[1.02]"
              >
                <span>Schedule Platform Discovery</span>
                <ArrowRight size={15} />
              </button> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
