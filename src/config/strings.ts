/**
 * Single code strings module per HR-4 (Hardcoding Rule).
 *
 * Allowed in code:
 * - Fixed Admin UI labels
 * - System and API error/status messages
 * - Route and CSS class identifiers
 * - Minimal DB-unreachable fallback notice
 *
 * All public website copy, SEO metadata, 404 copy, form labels/messages,
 * and visitor-facing accessibility strings (aria-label, alt) MUST come from Neon Postgres.
 */

export const SYSTEM_STRINGS = {
  dbUnreachableFallback: {
    title: 'Service Temporarily Unavailable',
    message:
      'Unable to load published site content at this moment. Please refresh or try again shortly.',
    statusCode: 503,
  },
  apiErrors: {
    unauthorized: 'Authentication is required to access this resource.',
    mfaRequired:
      'Administrator TOTP multi-factor authentication must be enrolled and verified in the current session.',
    forbiddenRole: 'Your account role is not authorized to perform this action.',
    validationFailed: 'Request payload failed schema validation.',
    versionConflict:
      'Optimistic lock conflict: this draft has been modified by another session. Reload to view the latest changes.',
    mediaNotReadyOrPublic:
      'Publish blocked: one or more referenced media versions are missing, trashed, or not yet promoted to public storage.',
    missingInformativeAlt:
      'Publish blocked: all informative image slots must have non-empty descriptive alt text.',
    invalidUrlScheme:
      'Invalid URL: only http, https, mailto, tel, or internal routes starting with "/" are allowed.',
    assetInUse:
      'This media version is currently referenced by a draft, published page, or retained revision and cannot be permanently deleted.',
    rateLimitExceeded: 'Too many requests. Please wait before retrying.',
    healthUnauthorized: 'Missing or invalid x-health-secret header.',
    internalError: 'An unexpected server error occurred.',
  },
  adminLabels: {
    appName: 'Azaroth Tech-Hive CMS',
    navigation: {
      dashboard: 'Overview',
      globalNavigation: 'Header & Navigation',
      globalFooter: 'Footer',
      siteSettings: 'Site Settings & SEO Defaults',
      pagesGroup: 'Website Pages',
      collectionsGroup: 'Shared Collections',
      mediaLibrary: 'Media Library',
      revisions: 'Revision History',
      submissions: 'Form Submissions',
      users: 'Users & Access',
      auditLog: 'Audit Log',
      systemStatus: 'System Status',
    },
    workflow: {
      saveDraft: 'Save Draft',
      livePreview: 'Live Preview',
      publishChanges: 'Publish Changes',
      restoreToDraft: 'Restore to Draft',
      decorativeSlotBadge: 'Decorative image (renders alt="" and hidden from screen readers)',
      informativeSlotBadge: 'Informative image (descriptive alt text required before publish)',
      reclassifyConfirmTitle: 'Change Slot Accessibility Classification',
      reclassifyConfirmMessage:
        'Changing this image slot between informative and decorative affects screen-reader behavior and publish validation. Confirm this Admin-only change?',
      aspectRatioWarningTitle: 'Significant Aspect-Ratio Change Detected',
      aspectRatioWarningMessage:
        'The uploaded media dimensions differ by more than 15% from this slot’s expected aspect ratio. Confirm replacement?',
      sharedAssetWarningMessage:
        'This asset is shared across multiple slots. Replacing it will update all draft references in one transaction while published pages keep the current version until published.',
      cachePurgeWarningBanner:
        'Content was committed to the database, but edge cache invalidation encountered an error and is queued for automatic retry.',
      retryCachePurgeButton: 'Retry Cache Purge Now',
    },
  },
} as const;
