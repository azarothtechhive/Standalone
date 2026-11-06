/**
 * Standalone CMS module public surface.
 *
 * Consumers can mount the admin experience with:
 *   - CmsAdminLogin (public route)
 *   - CmsAdminLayout + cmsAdminRoutes (protected route children)
 *   - CMSProvider / useCMS (content context)
 *   - cmsService (typed data access layer)
 */
export { CMSProvider, useCMS, defaultModules } from './CMSContext';
export { cmsService, CmsApiService } from './cmsService';
export type * from './cmsService';
export { useCMSAnimation } from './useCMSAnimation';
export {
  CmsAdminLogin,
  CmsAdminLayout,
  CmsAdminDashboard,
  CmsAdminPagesManager,
  CmsAdminProductsManager,
  CmsAdminServicesManager,
  CmsAdminPortfolioManager,
  CmsAdminInsightsManager,
  CmsAdminTestimonialsManager,
  CmsAdminNavigationManager,
  CmsAdminFooterManager,
  CmsAdminAnimationsManager,
  CmsAdminCRMInquiries,
  CmsAdminMediaManager,
  CmsAdminSettingsManager,
  CmsAdminAuditLogs,
  CmsAdminUsersManager,
  cmsAdminRoutes,
} from './routes';
export type { CmsAdminRoute } from './routes';
