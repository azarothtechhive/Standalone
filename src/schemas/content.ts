import { z } from 'zod';

/**
 * Shared Zod validation schemas per SEC-1, CMS-2, CMS-3, ALT-1..ALT-4, PUB-6, and MED-5a.
 */

export const ALLOWED_P0_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const;

export const MAX_IMAGE_BYTE_SIZE = 5 * 1024 * 1024; // 5 MB (MED-5a)

/**
 * Validates CMS links/destinations (CMS-3):
 * Allows http://, https://, mailto:, tel:, hash anchors (#...), or internal routes (/...).
 * Strictly rejects javascript:, data:, vbscript:, file:, or protocol-relative // URLs.
 */
export function isSafeCmsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('//')
  ) {
    return false;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export const CmsUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL destination is required')
  .refine(isSafeCmsUrl, {
    message:
      'Invalid URL: only http, https, mailto, tel, or internal routes starting with "/" are permitted',
  });

export const CmsLinkOrButtonSchema = z.object({
  label: z.string().trim().min(1, 'Button/link label is required').max(120),
  href: CmsUrlSchema,
  openInNewTab: z.boolean().default(false),
  visible: z.boolean().default(true),
  iconName: z.string().trim().max(64).optional(),
});

export const SlotClassificationSchema = z.enum(['informative', 'decorative']);

/**
 * Media slot reference schema enforcing ALT-1, ALT-2, ALT-3, and MED-1:
 * - Content always references an immutable `versionId` (never a raw mutable asset ID).
 * - If classification === 'informative', `altText` MUST be non-empty after trimming.
 * - If classification === 'decorative', `altText` MUST be empty string `""`.
 */
export const MediaSlotReferenceSchema = z
  .object({
    slotId: z.string().trim().min(1),
    versionId: z.string().trim().regex(/^ver_[a-z0-9_]+$/i, 'Invalid immutable media version ID'),
    classification: SlotClassificationSchema,
    altText: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.classification === 'informative' && val.altText.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['altText'],
        message: `Informative slot "${val.slotId}" requires meaningful non-empty alt text before saving or publishing.`,
      });
    }
    if (val.classification === 'decorative' && val.altText !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['altText'],
        message: `Decorative slot "${val.slotId}" must have an empty alt string (alt="").`,
      });
    }
  });

export const PageSeoSchema = z.object({
  title: z.string().trim().min(1, 'SEO title is required').max(160),
  description: z.string().trim().min(1, 'Meta description is required').max(320),
  ogTitle: z.string().trim().min(1).max(160),
  ogDescription: z.string().trim().min(1).max(320),
  ogImageVersionId: z
    .string()
    .trim()
    .regex(/^ver_[a-z0-9_]+$/i)
    .optional(),
  robots: z
    .enum(['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow'])
    .default('index, follow'),
  canonicalPath: z
    .string()
    .trim()
    .regex(/^\/[a-z0-9\-/]*$/i, 'Canonical path must start with "/"'),
});

export const UploadInitRequestSchema = z.object({
  assetId: z.string().trim().min(1).max(100).optional(),
  displayName: z.string().trim().min(1).max(160),
  mimeType: z.enum(ALLOWED_P0_MIME_TYPES),
  byteSize: z.number().int().positive().max(MAX_IMAGE_BYTE_SIZE),
  targetSlotId: z.string().trim().min(1).optional(),
});

export const PublishRequestSchema = z.object({
  scopeKeys: z.array(z.string().trim().min(1)).min(1, 'At least one scope key is required'),
  expectedDraftVersions: z.record(z.string(), z.number().int().positive()),
  summary: z.string().trim().max(280).optional(),
});

export const RestoreRevisionRequestSchema = z.object({
  revisionId: z.string().uuid('Invalid revision UUID'),
  expectedDraftVersions: z.record(z.string(), z.number().int().positive()),
});

export const ScopeKeySchema = z.enum([
  'global:header',
  'global:footer',
  'global:settings',
  'page:home',
  'page:about',
  'page:portfolio',
  'page:products',
  'page:services',
  'page:insights',
  'page:testimonials',
  'page:connect',
  'page:privacy',
  'page:terms',
  'collection:products',
  'collection:services',
  'collection:industries',
  'collection:insights',
  'collection:testimonials',
]);

export type ScopeKey = z.infer<typeof ScopeKeySchema>;
export type MediaSlotReference = z.infer<typeof MediaSlotReferenceSchema>;
export type PageSeo = z.infer<typeof PageSeoSchema>;

/* ============================================================
   ANIMATION & COLOR CUSTOMIZATION SCHEMAS
   ============================================================ */

// Color validation schemas
export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

export const RgbaColorSchema = z.string().regex(/^rgba?\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/, 'Invalid RGBA color format');

export const GradientSchema = z.string().regex(/^linear-gradient\(.+\)$/, 'Invalid gradient format');

// Animation easing schema
export const EasingSchema = z.union([
  z.enum(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  z.array(z.number()).length(4),
  z.string().regex(/^cubic-bezier\([\d.,]+\)$/),
]);

// Position schema
export const PositionSchema = z.object({
  top: z.string().optional(),
  left: z.string().optional(),
  right: z.string().optional(),
  bottom: z.string().optional(),
});

// Animation config schema
export const AnimationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  type: z.enum([
    'fadeInUp', 'fadeIn', 'slideInLeft', 'slideInRight',
    'scaleIn', 'slideInUp', 'float', 'shimmer', 'pulse',
    'heroBadgeFloat1', 'heroBadgeFloat2', 'heroBadgeFloat3',
    'scaleAndLift', 'lift'
  ]).optional(),
  duration: z.number().min(0.1).max(10).default(0.6),
  delay: z.number().min(0).max(5).default(0),
  easing: EasingSchema.default([0.22, 1, 0.36, 1]),
  iterations: z.union([z.number(), z.literal('infinite')]).default(1),
});

// Hover animation schema
export const HoverAnimationSchema = z.object({
  enabled: z.boolean().default(true),
  type: z.enum(['scale', 'lift', 'scaleAndLift', 'glow', 'none']).default('lift'),
  scale: z.number().min(0.9).max(1.2).default(1.02),
  translateY: z.number().min(-20).max(20).default(-4),
  translateX: z.number().min(-20).max(20).default(0),
  duration: z.number().min(0.05).max(1).default(0.25),
  easing: EasingSchema.default('ease-out'),
  shadow: z.string().optional(),
  borderColor: z.string().optional(),
});

// Color config schema
export const ColorConfigSchema = z.object({
  useGlobal: z.boolean().default(true),
  iconColor: ColorSchema.optional(),
  backgroundColor: z.union([ColorSchema, RgbaColorSchema]).optional(),
  borderColor: z.string().optional(),
  textColor: ColorSchema.optional(),
  labelColor: ColorSchema.optional(),
  hoverIconColor: ColorSchema.optional(),
  hoverBackgroundColor: z.union([ColorSchema, RgbaColorSchema]).optional(),
  hoverBorderColor: z.string().optional(),
  hoverShadow: z.string().optional(),
});

// Floating badge schema
export const FloatingBadgeSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(50),
  iconName: z.string().min(1).max(50),
  position: PositionSchema,
  zIndex: z.number().default(4),
  maxWidth: z.string().default("45vw"),
  animation: AnimationConfigSchema,
  hoverAnimation: HoverAnimationSchema,
  colors: ColorConfigSchema,
  isVisible: z.boolean().default(true),
  responsive: z.object({
    tablet: PositionSchema.optional(),
    mobile: PositionSchema.optional(),
    hideBelow: z.number().optional(),
  }).optional(),
});

// Trace schema
export const TraceSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  gradientId: z.string().min(1),
  gradientStops: z.array(z.object({
    offset: z.string(),
    color: ColorSchema,
    opacity: z.number().min(0).max(1),
  })),
  strokeWidth: z.number().min(0.5).max(5).default(1.5),
  strokeDashArray: z.string().default("4 4"),
  isVisible: z.boolean().default(true),
  animation: AnimationConfigSchema,
  colors: ColorConfigSchema,
});

// Metric schema
export const MetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(50),
  value: z.string().min(1).max(20),
  iconName: z.string().min(1).max(50),
  animation: AnimationConfigSchema,
  colors: ColorConfigSchema,
  isVisible: z.boolean().default(true),
});

// Viewport schema
export const ViewportSchema = z.object({
  once: z.boolean().default(false),
  margin: z.string().default("-100px"),
  amount: z.union([z.number(), z.literal('some'), z.literal('all')]).default('some'),
});

// Type exports
export type AnimationConfig = z.infer<typeof AnimationConfigSchema>;
export type HoverAnimation = z.infer<typeof HoverAnimationSchema>;
export type ColorConfig = z.infer<typeof ColorConfigSchema>;
export type FloatingBadge = z.infer<typeof FloatingBadgeSchema>;
export type Trace = z.infer<typeof TraceSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type ViewportConfig = z.infer<typeof ViewportSchema>;
