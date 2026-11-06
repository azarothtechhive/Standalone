import type { InsightArticle, Product, ServiceOffering } from "../types";
import type {
  CmsInsight,
  CmsProduct,
  CmsService,
  CmsTestimonial,
} from "../services/cmsService";

const isPublished = (status?: string) =>
  !status || !["DRAFT", "ARCHIVED", "INACTIVE"].includes(status.toUpperCase());

export const normalizeCmsTestimonials = (
  testimonials: Partial<CmsTestimonial>[],
): CmsTestimonial[] =>
  testimonials.map((testimonial, index) => ({
    id: testimonial.id || `testimonial-${index + 1}`,
    clientName:
      testimonial.clientName ||
      testimonial.authorName ||
      testimonial.author ||
      "",
    role: testimonial.role || "",
    organization:
      testimonial.organization ||
      testimonial.companyName ||
      testimonial.company ||
      "",
    avatarUrl: testimonial.avatarUrl || "",
    rating: testimonial.rating ?? 0,
    quote: testimonial.quote || "",
    isFeatured: testimonial.isFeatured ?? testimonial.verified ?? false,
    order: testimonial.order ?? index + 1,
  }));

export const getPublicProducts = (
  cmsProducts: CmsProduct[],
  catalog: Product[],
): Product[] =>
  cmsProducts
    .filter(
      (product) =>
        product.isEnabled !== false && isPublished(product.status),
    )
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((product) => {
      const fallback = catalog.find(
        (item) => item.slug === product.slug || item.id === product.id,
      );
      const status =
        product.status === "PUBLISHED"
          ? fallback?.status || "Live"
          : product.status;

      return {
        ...fallback,
        id: product.id,
        slug: product.slug,
        name: product.name || product.title || fallback?.name || product.slug,
        category: product.category || fallback?.category || "Enterprise Solutions",
        badge: product.badge || fallback?.badge,
        status,
        statusColor: fallback?.statusColor,
        tagline: product.tagline || fallback?.tagline || "",
        description:
          product.fullDescription ||
          product.description ||
          fallback?.description ||
          product.shortDescription ||
          "",
        shortDescription:
          product.shortDescription || fallback?.shortDescription || "",
        coverImage: product.coverImage || fallback?.coverImage || "",
        coverAlt: fallback?.coverAlt || product.name,
        isEnabled:
          product.isEnabled ?? isPublished(product.status),
        keyCapabilities:
          product.keyCapabilities?.length
            ? product.keyCapabilities
            : product.benefits?.length
              ? product.benefits
              : fallback?.keyCapabilities || [],
        benefits: product.benefits || fallback?.benefits || [],
        techSpecs: product.techSpecs || fallback?.techSpecs || {
          latency: "",
          concurrency: "",
          compliancePosture: "",
          protocols: [],
        },
        features: product.features?.length ? product.features : fallback?.features || [],
        iconName: product.iconName || fallback?.iconName || "Activity",
      };
    });

export const getPublicServices = (
  cmsServices: CmsService[],
  catalog: ServiceOffering[],
): ServiceOffering[] =>
  cmsServices
    .filter((service) => isPublished(service.status))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((service) => {
      const fallback = catalog.find(
        (item) => item.slug === service.slug || item.id === service.id,
      );

      return {
        ...fallback,
        id: service.id,
        slug: service.slug,
        title: service.title || fallback?.title || service.slug,
        category:
          service.category ||
          service.summary ||
          fallback?.category ||
          "Enterprise Services",
        badge: service.badge || fallback?.badge,
        description:
          service.description ||
          service.fullDescription ||
          service.shortDescription ||
          fallback?.description ||
          "",
        bestFor: service.bestFor || fallback?.bestFor || service.summary || "",
        outcomes: service.outcomes || fallback?.outcomes || [],
        deliverables: service.deliverables || fallback?.deliverables || [],
        capabilities: service.capabilities || fallback?.capabilities || [],
        metrics:
          Array.isArray(service.metrics)
            ? service.metrics
            : fallback?.metrics || [],
        iconName: service.iconName || fallback?.iconName || "Cpu",
      };
    });

export const getPublicInsights = (
  cmsInsights: CmsInsight[],
  catalog: InsightArticle[],
): InsightArticle[] =>
  cmsInsights
    .filter((insight) => isPublished(insight.status))
    .map((insight, index) => {
      const fallback = catalog.find(
        (item) => item.slug === insight.slug || item.id === insight.id,
      );
      const rawContent = insight.content;
      const content = Array.isArray(rawContent)
        ? rawContent
        : (rawContent || fallback?.content.join("\n\n") || "")
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

      return {
        id: insight.id || `insight-${index}`,
        slug: insight.slug || `insight-${index}`,
        title: insight.title || fallback?.title || "Untitled insight",
        category:
          (insight.category as InsightArticle["category"]) ||
          fallback?.category ||
          "System Architecture",
        readTime: insight.readTime || fallback?.readTime || "5 min read",
        publishedDate:
          insight.publishedAt ||
          insight.publishedDate ||
          fallback?.publishedDate ||
          "",
        author: {
          name:
            insight.authorName ||
            insight.author?.name ||
            fallback?.author.name ||
            "Azaroth Tech-Hive",
          role:
            insight.authorRole ||
            insight.author?.role ||
            fallback?.author.role ||
            "Engineering Team",
        },
        excerpt: insight.excerpt || fallback?.excerpt || "",
        content,
        sections: insight.sections?.length
          ? insight.sections
          : fallback?.sections || [{ id: "overview", title: "Overview" }],
        tags: insight.tags || fallback?.tags || [],
        imageUrl:
          insight.imageUrl ||
          insight.coverImage ||
          fallback?.imageUrl ||
          undefined,
      };
    });
