// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';

// Context Providers
import { AdminAuthProvider, ProtectedAdminRoute } from './context/AdminAuthContext';

// Standalone CMS module (routes, provider, and admin views)
import {
  CMSProvider,
  CmsAdminLogin,
  CmsAdminLayout,
  cmsAdminRoutes,
} from './cms';

// Public Page Views
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Values } from './pages/Values';
import { DeliveryFramework } from './pages/DeliveryFramework';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Services } from './pages/Services';
import { Portfolio } from './pages/Portfolio';
import { PortfolioDetail } from './pages/PortfolioDetail';
import { Insights } from './pages/Insights';
import { InsightDetail } from './pages/InsightDetail';
import { TestimonialsPage } from './pages/Testimonials';
import { Connect } from './pages/Connect';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { NotFound } from './pages/NotFound';

// Lazy-loaded CMS Admin Views (PERF-4: public bundle excludes all admin code)
const AdminLogin = lazy(() =>
  import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminPagesManager = lazy(() =>
  import('./pages/admin/AdminPagesManager').then((m) => ({ default: m.AdminPagesManager }))
);
const AdminProductsManager = lazy(() =>
  import('./pages/admin/AdminProductsManager').then((m) => ({ default: m.AdminProductsManager }))
);
const AdminServicesManager = lazy(() =>
  import('./pages/admin/AdminServicesManager').then((m) => ({ default: m.AdminServicesManager }))
);
const AdminPortfolioManager = lazy(() =>
  import('./pages/admin/AdminPortfolioManager').then((m) => ({ default: m.AdminPortfolioManager }))
);
const AdminInsightsManager = lazy(() =>
  import('./pages/admin/AdminInsightsManager').then((m) => ({ default: m.AdminInsightsManager }))
);
const AdminTestimonialsManager = lazy(() =>
  import('./pages/admin/AdminTestimonialsManager').then((m) => ({
    default: m.AdminTestimonialsManager,
  }))
);
const AdminNavigationManager = lazy(() =>
  import('./pages/admin/AdminNavigationManager').then((m) => ({
    default: m.AdminNavigationManager,
  }))
);
const AdminFooterManager = lazy(() =>
  import('./pages/admin/AdminFooterManager').then((m) => ({
    default: m.AdminFooterManager,
  }))
);
const AdminAnimationsManager = lazy(() =>
  import('./pages/admin/AdminAnimationsManager').then((m) => ({
    default: m.AdminAnimationsManager,
  }))
);
const AdminCRMInquiries = lazy(() =>
  import('./pages/admin/AdminCRMInquiries').then((m) => ({ default: m.AdminCRMInquiries }))
);
const AdminMediaManager = lazy(() =>
  import('./pages/admin/AdminMediaManager').then((m) => ({ default: m.AdminMediaManager }))
);
const AdminSettingsManager = lazy(() =>
  import('./pages/admin/AdminSettingsManager').then((m) => ({ default: m.AdminSettingsManager }))
);
const AdminAuditLogs = lazy(() =>
  import('./pages/admin/AdminAuditLogs').then((m) => ({ default: m.AdminAuditLogs }))
);
const AdminUsersManager = lazy(() =>
  import('./pages/admin/AdminUsersManager').then((m) => ({ default: m.AdminUsersManager }))
);

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <CMSProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              {/* 1. CMS Admin Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* 2. CMS Admin Portal (Protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="pages" element={<AdminPagesManager />} />
                <Route path="products" element={<AdminProductsManager />} />
                <Route path="services" element={<AdminServicesManager />} />
                <Route path="portfolio" element={<AdminPortfolioManager />} />
                <Route path="insights" element={<AdminInsightsManager />} />
                <Route path="testimonials" element={<AdminTestimonialsManager />} />
                <Route path="navigation" element={<AdminNavigationManager />} />
                <Route path="footer" element={<AdminFooterManager />} />
                <Route path="animations" element={<AdminAnimationsManager />} />
                <Route path="inquiries" element={<AdminCRMInquiries />} />
                <Route path="media" element={<AdminMediaManager />} />
                <Route path="settings" element={<AdminSettingsManager />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="users" element={<AdminUsersManager />} />
              </Route>

              {/* 3. Public Web Application */}
              <Route element={<PublicLayout />}>
                {/* Canonical Homepage */}
                <Route path="/" element={<Home />} />

                {/* Company & Values */}
                <Route path="/about" element={<About />} />
                <Route path="/who-we-are" element={<Navigate to="/about" replace />} />
                <Route path="/values" element={<Values />} />

                {/* Methodology & Delivery */}
                <Route path="/delivery-framework" element={<DeliveryFramework />} />
                <Route path="/how-we-work" element={<Navigate to="/delivery-framework" replace />} />

                {/* Software Platforms & Catalogs */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />

                {/* Enterprise Services & SLAs */}
                <Route path="/services" element={<Services />} />
                <Route path="/service" element={<Navigate to="/services" replace />} />

                {/* Portfolio & Case Studies */}
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
                <Route path="/projects" element={<Navigate to="/portfolio" replace />} />

                {/* Resource Hub & Technology Insights */}
                <Route path="/technology-insights" element={<Insights />} />
                <Route path="/technology-insights/:slug" element={<InsightDetail />} />
                <Route path="/resource-hub" element={<Insights />} />
                <Route path="/resource-hub/:slug" element={<InsightDetail />} />
                <Route path="/insights" element={<Navigate to="/technology-insights" replace />} />

                {/* Client Testimonials & Endorsements */}
                <Route path="/testimonials" element={<TestimonialsPage />} />

                {/* Direct Communication & Conversion Portals */}
                <Route path="/connect-with-us" element={<Connect />} />
                <Route path="/contact" element={<Navigate to="/connect-with-us" replace />} />
                <Route path="/connect" element={<Navigate to="/connect-with-us" replace />} />

                {/* RFQ routes redirected to Connect */}
                <Route path="/request-for-quote" element={<Navigate to="/connect-with-us" replace />} />
                <Route path="/rfq" element={<Navigate to="/connect-with-us" replace />} />
                <Route path="/quote" element={<Navigate to="/connect-with-us" replace />} />

                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CMSProvider>
    </AdminAuthProvider>
  );
};

export default App;
