import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productsCatalog } from "../../data/productsData";
import { ProductStatusBadge } from "../common/ProductStatusBadge";
import { useCMS } from "../../context/CMSContext";
import { getPublicProducts } from "../../utils/publicContent";

export const ProductsSection: React.FC = () => {
  const { products: cmsProducts, pages } = useCMS();
  const productsSection = pages["home"]?.productsSection || {};
  const sectionTitle = productsSection.title || "Enterprise Software";
  const sectionTitleHighlight = productsSection.titleHighlight || "Solutions";
  const sectionSubtitle =
    productsSection.subtitle ||
    "Purpose-engineered software platforms designed for scalable multi-location operations, omnichannel digital commerce, healthcare informatics, and enterprise workforce learning.";

  const explorePlatformText = productsSection.explorePlatformText || "Explore Platform";
  const catalogCtaText = productsSection.ctaText || "View Complete Platform Catalog";
  const catalogCtaLink = productsSection.ctaLink || "/portfolio#products";

  const displayProducts = getPublicProducts(cmsProducts || [], productsCatalog);

  return (
    <section
      id="software-solutions"
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "5.5rem",
        paddingBottom: "5.5rem",
        position: "relative",
        borderTop: "1px solid rgba(226, 232, 240, 0.8)",
      }}
      aria-label="Enterprise Software Solutions"
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: "left",
            maxWidth: "1200px",
            margin: "0 0 3.5rem 0",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)",
              fontWeight: 600,
              color: "var(--color-text-primary, #1F2937)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            {sectionTitle}{" "}
            <span
              style={{
                background: "var(--gradient-heading)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {sectionTitleHighlight}
            </span>
          </h2>
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.8vw, 1.0625rem)",
              color: "var(--color-text-secondary, #4B5563)",
              lineHeight: 1.65,
            }}
          >
            {sectionSubtitle}
          </p>
        </motion.div>

        <div
          className="featured-products-grid"
        >
          {displayProducts.map((product: any, idx: number) => {
            const productName = product.name;
            const productDesc =
              product.shortDescription ||
              product.short_description ||
              product.description;

            const productImage =
              product.coverImage ||
              product.cover_image ||
              product.image ||
              product.imageUrl ||
              product.image_url ||
              product.thumbnail ||
              product.featuredImage ||
              product.featured_image;

            const features =
              product.features ||
              product.highlights ||
              product.keyFeatures ||
              product.key_features ||
              [];

            return (
              <motion.div
                key={product.id || product.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-100px' }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="featured-product-card"
                style={{
                  border: "1px solid #E2E8F0",
                }}
              >
                <div className="featured-product-image">
                  {productImage ? (
                    <img src={productImage} alt={productName} loading="lazy" />
                  ) : (
                    <div className="featured-product-image-placeholder">
                      <span>{productName}</span>
                    </div>
                  )}

                  <div className="featured-product-status" >
                    <ProductStatusBadge
                      status={product.status || "Under Development"}
                      colorScheme={product.statusColor}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="featured-product-content">
                  <h3>{productName}</h3>

                  <p className="featured-product-description">{productDesc}</p>

                  {Array.isArray(features) && features.length > 0 && (
                    <ul className="featured-product-features">
                      {features
                        .slice(0, 3)
                        .map((feature: any, index: number) => (
                          <li key={index}>
                            <span aria-hidden="true">⊙</span>
                            {typeof feature === "string"
                              ? feature
                              : feature.title || feature.name || feature.label}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="featured-product-actions">
                  <Link to="/portfolio#products" className="featured-product-learn">
                    {explorePlatformText} <ArrowRight size={13} />
                  </Link>
                </div>
                </motion.div>
            );
          })}
        </div>

        {/* View All Products CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginTop: "3rem" }}
        >
          <Link
            to={catalogCtaLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.85rem 2rem",
              borderRadius: "9999px",
              background: "var(--gradient-button)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(73, 36, 63, 0.35)",
              transition: "all 180ms ease-out",
            }}
            className="hover:opacity-95 hover:scale-[1.02]"
          >
            <span>{catalogCtaText}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
