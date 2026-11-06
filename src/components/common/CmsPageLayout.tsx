import React from "react";
import { Link } from "react-router-dom";
import type { CmsPageSection } from "../../utils/pageBuilder";
import { normalizePageBuilderDocument } from "../../utils/pageBuilder";

interface CmsPageLayoutProps {
  pageSlug: string;
  page: Record<string, unknown> | undefined;
  sections?: Record<string, React.ReactNode>;
  children?: React.ReactNode;
}

interface CmsPageSectionSlotProps {
  id: string;
  children: React.ReactNode;
}

export const CmsPageSectionSlot: React.FC<CmsPageSectionSlotProps> = () => null;

const isInternalHref = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

export const isAllowedCmsHref = (href: string) => {
  try {
    const url = new URL(href, "https://cms.invalid");
    if (isInternalHref(href)) {
      return url.origin === "https://cms.invalid";
    }
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const GenericBlock: React.FC<{ section: CmsPageSection }> = ({ section }) => {
  const content = section.content || {};
  const isCallToAction = section.type === "callToAction";
  const theme =
    section.appearance === "brand"
      ? {
          backgroundColor: "var(--color-brand-plum, #49243F)",
          color: "#FFFFFF",
          mutedColor: "rgba(255,255,255,0.82)",
        }
      : section.appearance === "warm"
        ? {
            backgroundColor: "var(--color-canvas-bg, #FAF8F4)",
            color: "var(--color-text-primary, #2B232D)",
            mutedColor: "var(--color-text-secondary, #475569)",
          }
        : {
            backgroundColor: "#FFFFFF",
            color: "var(--color-text-primary, #2B232D)",
            mutedColor: "var(--color-text-secondary, #475569)",
          };

  return (
    <section
      className="section"
      data-cms-section={section.id}
      style={{ backgroundColor: theme.backgroundColor, color: theme.color }}
    >
      <div
        className="container-prose"
        style={{ textAlign: isCallToAction ? "center" : "left" }}
      >
        {content.eyebrow && (
          <p
            style={{
              margin: "0 0 0.75rem",
              color: theme.mutedColor,
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {content.eyebrow}
          </p>
        )}
        {content.title && (
          <h2
            style={{
              color: theme.color,
              fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)",
              lineHeight: 1.2,
              margin: "0 0 1rem",
            }}
          >
            {content.title}
          </h2>
        )}
        {content.body && (
          <p
            style={{
              color: theme.mutedColor,
              lineHeight: 1.75,
              margin: "0 auto 1.5rem",
              maxWidth: "70ch",
              whiteSpace: "pre-wrap",
            }}
          >
            {content.body}
          </p>
        )}
        {content.buttonLabel &&
          content.buttonHref &&
          isAllowedCmsHref(content.buttonHref) &&
          (isInternalHref(content.buttonHref) ? (
            <Link
              to={content.buttonHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                background: "var(--gradient-button)",
                color: "#FFFFFF",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {content.buttonLabel}
            </Link>
          ) : (
            <a
              href={content.buttonHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                background: "var(--gradient-button)",
                color: "#FFFFFF",
                fontWeight: 600,
                textDecoration: "none",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content.buttonLabel}
            </a>
          ))}
      </div>
    </section>
  );
};

export const CmsPageLayout: React.FC<CmsPageLayoutProps> = ({
  pageSlug,
  page,
  sections: providedSections = {},
  children,
}) => {
  const builderPage = normalizePageBuilderDocument(pageSlug, page);
  const configuredSections = builderPage.builder?.sections || [];
  const sections: Record<string, React.ReactNode> = Object.assign(
    Object.create(null),
    providedSections,
  );
  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement<CmsPageSectionSlotProps>(child) &&
      child.type === CmsPageSectionSlot
    ) {
      sections[child.props.id] = child.props.children;
    }
  });

  return (
    <div
      className="cms-page-layout"
      data-cms-page={pageSlug}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {configuredSections.map((section) => {
        if (!section.isVisible) return null;

        const content =
          section.type === "legacy"
            ? sections[section.sourceKey || section.id]
            : <GenericBlock section={section} />;
        if (content === undefined || content === null) return null;

        return (
          <div
            key={section.id}
            data-cms-section-slot={section.id}
            style={{ order: section.order, width: "100%" }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};
