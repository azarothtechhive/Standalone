export const PAGE_BUILDER_SCHEMA_VERSION = 1;

export type CmsBlockType = "legacy" | "richText" | "callToAction";
export type CmsBlockAppearance = "default" | "warm" | "brand";

export interface CmsPageSection {
  id: string;
  type: CmsBlockType;
  sourceKey?: string;
  label: string;
  order: number;
  isVisible: boolean;
  appearance: CmsBlockAppearance;
  content?: {
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
}

export interface CmsPageBuilderDocument {
  version: number;
  sections: CmsPageSection[];
}

export interface CmsPageDocument {
  builder?: CmsPageBuilderDocument;
  [key: string]: unknown;
}

const routeSectionDefinitions: Record<
  string,
  Array<{ id: string; label: string; sourceKey: string }>
> = {
  home: [
    { id: "hero", label: "Hero Banner", sourceKey: "hero" },
    { id: "aboutSection", label: "About Us", sourceKey: "aboutSection" },
    { id: "servicesSection", label: "Services", sourceKey: "servicesSection" },
    { id: "productsSection", label: "Products", sourceKey: "productsSection" },
    {
      id: "featuredProjectsSection",
      label: "Featured Projects",
      sourceKey: "featuredProjectsSection",
    },
    { id: "industrySection", label: "Industry Expertise", sourceKey: "industrySection" },
    { id: "insightsSection", label: "Resource Hub", sourceKey: "insightsSection" },
    { id: "faqSection", label: "Frequently Asked Questions", sourceKey: "faqSection" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  about: [
    { id: "hero", label: "About Hero", sourceKey: "hero" },
    { id: "story", label: "Our Story", sourceKey: "content" },
    { id: "values", label: "Core Values", sourceKey: "values" },
    { id: "deliveryFramework", label: "Delivery Framework", sourceKey: "deliveryFramework" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  portfolio: [
    { id: "hero", label: "Portfolio Hero", sourceKey: "hero" },
    { id: "products", label: "Products", sourceKey: "products" },
    { id: "services", label: "Services", sourceKey: "services" },
    { id: "featuredProjects", label: "Featured Projects", sourceKey: "featuredProjects" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  products: [
    { id: "hero", label: "Products Hero", sourceKey: "hero" },
    { id: "catalog", label: "Product Catalog", sourceKey: "catalog" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  services: [
    { id: "hero", label: "Services Hero", sourceKey: "hero" },
    { id: "practices", label: "Service Practices", sourceKey: "practices" },
    { id: "domains", label: "Industry Domains", sourceKey: "domains" },
    { id: "nextSteps", label: "Next Steps", sourceKey: "nextSteps" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  insights: [
    { id: "hero", label: "Resource Hub Hero", sourceKey: "hero" },
    { id: "articles", label: "Articles Catalog", sourceKey: "articles" },
    { id: "testimonials", label: "Testimonials", sourceKey: "testimonials" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  testimonials: [
    { id: "hero", label: "Testimonials Hero", sourceKey: "hero" },
    { id: "testimonials", label: "Testimonials", sourceKey: "testimonials" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  connect: [
    { id: "hero", label: "Contact Hero", sourceKey: "hero" },
    { id: "contact", label: "Contact Details and Form", sourceKey: "contact" },
  ],
  "privacy-policy": [
    { id: "hero", label: "Policy Heading", sourceKey: "hero" },
    { id: "content", label: "Policy Content", sourceKey: "content" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  privacy: [
    { id: "hero", label: "Policy Heading", sourceKey: "hero" },
    { id: "content", label: "Policy Content", sourceKey: "content" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  "terms-of-service": [
    { id: "hero", label: "Terms Heading", sourceKey: "hero" },
    { id: "content", label: "Terms Content", sourceKey: "content" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
  terms: [
    { id: "hero", label: "Terms Heading", sourceKey: "hero" },
    { id: "content", label: "Terms Content", sourceKey: "content" },
    { id: "finalCta", label: "Final Call to Action", sourceKey: "finalCta" },
  ],
};

const validTypes = new Set<CmsBlockType>([
  "legacy",
  "richText",
  "callToAction",
]);
const validAppearances = new Set<CmsBlockAppearance>([
  "default",
  "warm",
  "brand",
]);

const defaultSectionsFor = (slug: string): CmsPageSection[] =>
  (routeSectionDefinitions[slug] || [])
    .map((definition, index) => ({
      ...definition,
      type: "legacy" as const,
      order: index + 1,
      isVisible: true,
      appearance: "default" as const,
    }));

export function getDefaultPageSections(slug: string): CmsPageSection[] {
  return defaultSectionsFor(slug).map((section) => ({ ...section }));
}

function isPageSection(value: unknown): value is CmsPageSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<CmsPageSection>;
  return (
    typeof section.id === "string" &&
    typeof section.label === "string" &&
    typeof section.order === "number" &&
    typeof section.isVisible === "boolean" &&
    typeof section.type === "string" &&
    validTypes.has(section.type as CmsBlockType)
  );
}

function normalizeSection(value: unknown): CmsPageSection | null {
  if (!isPageSection(value)) return null;
  const section = value as CmsPageSection;
  return {
    ...section,
    appearance: validAppearances.has(section.appearance)
      ? section.appearance
      : "default",
    content:
      section.content && typeof section.content === "object"
        ? section.content
        : undefined,
  };
}

export function normalizePageBuilderDocument(
  slug: string,
  input: unknown,
): CmsPageDocument {
  const page =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as CmsPageDocument)
      : {};
  const builder = page.builder;
  const incomingSections = Array.isArray(builder?.sections)
    ? builder.sections.map(normalizeSection).filter(
        (section): section is CmsPageSection => section !== null,
      )
    : [];
  const sectionsById = new Map(
    incomingSections.map((section) => [section.id, section]),
  );
  const sections: CmsPageSection[] = defaultSectionsFor(slug).map((defaultSection) => {
    const saved = sectionsById.get(defaultSection.id);
    sectionsById.delete(defaultSection.id);
    return {
      ...defaultSection,
      ...saved,
      sourceKey: saved?.sourceKey || defaultSection.sourceKey,
    };
  });

  for (const section of sectionsById.values()) {
    sections.push(section);
  }

  sections.sort((a, b) => a.order - b.order);
  return {
    ...page,
    builder: {
      version: PAGE_BUILDER_SCHEMA_VERSION,
      sections,
    },
  };
}

export function movePageSection(
  sections: CmsPageSection[],
  sectionId: string,
  offset: -1 | 1,
): CmsPageSection[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  const nextIndex = currentIndex + offset;
  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= sections.length
  ) {
    return sections;
  }

  const next = [...sections];
  const [moved] = next.splice(currentIndex, 1);
  next.splice(nextIndex, 0, moved);
  return next.map((section, index) => ({ ...section, order: index + 1 }));
}

export function addPageSection(
  sections: CmsPageSection[],
  type: "richText" | "callToAction",
): CmsPageSection[] {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `section-${Date.now()}`;
  const section: CmsPageSection = {
    id,
    type,
    label: type === "richText" ? "Content Section" : "Call to Action",
    order: sections.length + 1,
    isVisible: true,
    appearance: "default",
    content: {},
  };
  return [...sections, section];
}
