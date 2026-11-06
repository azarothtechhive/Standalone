import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const CmsAdminLogin = lazy(() =>
  import('./admin/AdminLogin').then((module) => ({ default: module.AdminLogin }))
);
export const CmsAdminLayout = lazy(() =>
  import('./admin/AdminLayout').then((module) => ({ default: module.AdminLayout }))
);
export const CmsAdminDashboard = lazy(() =>
  import('./admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
);
export const CmsAdminPagesManager = lazy(() =>
  import('./admin/AdminPagesManager').then((module) => ({ default: module.AdminPagesManager }))
);
export const CmsAdminProductsManager = lazy(() =>
  import('./admin/AdminProductsManager').then((module) => ({ default: module.AdminProductsManager }))
);
export const CmsAdminServicesManager = lazy(() =>
  import('./admin/AdminServicesManager').then((module) => ({ default: module.AdminServicesManager }))
);
export const CmsAdminPortfolioManager = lazy(() =>
  import('./admin/AdminPortfolioManager').then((module) => ({ default: module.AdminPortfolioManager }))
);
export const CmsAdminInsightsManager = lazy(() =>
  import('./admin/AdminInsightsManager').then((module) => ({ default: module.AdminInsightsManager }))
);
export const CmsAdminTestimonialsManager = lazy(() =>
  import('./admin/AdminTestimonialsManager').then((module) => ({ default: module.AdminTestimonialsManager }))
);
export const CmsAdminNavigationManager = lazy(() =>
  import('./admin/AdminNavigationManager').then((module) => ({ default: module.AdminNavigationManager }))
);
export const CmsAdminFooterManager = lazy(() =>
  import('./admin/AdminFooterManager').then((module) => ({ default: module.AdminFooterManager }))
);
export const CmsAdminAnimationsManager = lazy(() =>
  import('./admin/AdminAnimationsManager').then((module) => ({ default: module.AdminAnimationsManager }))
);
export const CmsAdminCRMInquiries = lazy(() =>
  import('./admin/AdminCRMInquiries').then((module) => ({ default: module.AdminCRMInquiries }))
);
export const CmsAdminMediaManager = lazy(() =>
  import('./admin/AdminMediaManager').then((module) => ({ default: module.AdminMediaManager }))
);
export const CmsAdminSettingsManager = lazy(() =>
  import('./admin/AdminSettingsManager').then((module) => ({ default: module.AdminSettingsManager }))
);
export const CmsAdminAuditLogs = lazy(() =>
  import('./admin/AdminAuditLogs').then((module) => ({ default: module.AdminAuditLogs }))
);
export const CmsAdminUsersManager = lazy(() =>
  import('./admin/AdminUsersManager').then((module) => ({ default: module.AdminUsersManager }))
);

export interface CmsAdminRoute {
  index?: boolean;
  path?: string;
  Component: LazyExoticComponent<ComponentType>;
}

export const cmsAdminRoutes: CmsAdminRoute[] = [
  { index: true, Component: CmsAdminDashboard },
  { path: 'pages', Component: CmsAdminPagesManager },
  { path: 'products', Component: CmsAdminProductsManager },
  { path: 'services', Component: CmsAdminServicesManager },
  { path: 'portfolio', Component: CmsAdminPortfolioManager },
  { path: 'insights', Component: CmsAdminInsightsManager },
  { path: 'testimonials', Component: CmsAdminTestimonialsManager },
  { path: 'navigation', Component: CmsAdminNavigationManager },
  { path: 'footer', Component: CmsAdminFooterManager },
  { path: 'animations', Component: CmsAdminAnimationsManager },
  { path: 'inquiries', Component: CmsAdminCRMInquiries },
  { path: 'media', Component: CmsAdminMediaManager },
  { path: 'settings', Component: CmsAdminSettingsManager },
  { path: 'audit-logs', Component: CmsAdminAuditLogs },
  { path: 'users', Component: CmsAdminUsersManager },
];
