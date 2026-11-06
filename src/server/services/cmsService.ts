/**
 * CMS Service
 * Handles CMS content, collections, settings, media, and form enquiries with database persistence.
 * All persistent business data is saved to PostgreSQL via cmsRepository.
 */

import crypto from 'node:crypto';
import * as cmsRepository from '../repositories/cmsRepository';
import { checkDatabaseConnection } from '../core/database';
import { logger } from '../core/logger';
import type { StoredAccount } from '../repositories/accountRepository';
import { isSuperAdminRole, isCmsAdminRole, canEditContentRole, canAccessCrmRole } from './authService';
import * as r2Service from './r2Service';
import { companyInfo } from '../../data/companyData';
import { productsCatalog } from '../../data/productsData';
import { serviceOfferings } from '../../data/servicesData';
import { SEED_INSIGHTS_ARTICLES } from '../../seed/seedData';

export const SEED_NAVIGATION_ITEMS = [
  { id: 'nav-home', label: 'Home', path: '/', order: 1, isVisible: true },
  { id: 'nav-products', label: 'Products', path: '/products', order: 2, isVisible: true },
  { id: 'nav-services', label: 'Services', path: '/services', order: 3, isVisible: true },
  { id: 'nav-insights', label: 'Insights', path: '/technology-insights', order: 4, isVisible: true },
  { id: 'nav-portfolio', label: 'Portfolio', path: '/portfolio', order: 5, isVisible: true },
  { id: 'nav-testimonials', label: 'Testimonials', path: '/testimonials', order: 6, isVisible: true },
  { id: 'nav-delivery', label: 'Delivery Framework', path: '/delivery-framework', order: 7, isVisible: true },
  { id: 'nav-about', label: 'About Us', path: '/about', order: 8, isVisible: true },
  { id: 'nav-quote', label: 'Request Quote', path: '/request-quote', order: 9, isVisible: true },
  { id: 'nav-contact', label: 'Connect With Us', path: '/connect-with-us', order: 10, isVisible: true },
];

export const SEED_TESTIMONIALS = [
  {
    id: 'test-1',
    author: 'Vikram Mehta',
    role: 'Chief Technology Officer',
    company: 'Apex Logistics Global',
    quote: 'Azaroth transformed our supply-chain infrastructure into a resilient, event-driven ecosystem. Platform throughput scaled 14x with zero unscheduled downtime.',
    rating: 5,
    order: 1,
    verified: true,
  },
  {
    id: 'test-2',
    author: 'Elena Rostova',
    role: 'Head of Digital Products',
    company: 'FinGuard Systems',
    quote: 'Their zero-compromise architectural rigor and relentless quality engineering set a new benchmark for enterprise delivery in highly regulated banking environments.',
    rating: 5,
    order: 2,
    verified: true,
  },
];

export function getFallbackBundle() {
  return {
    settings: {
      id: 'global',
      companyName: companyInfo.name,
      tagline: 'Enterprise software engineering for complex systems.',
      supportEmail: companyInfo.headquarters.email,
      phone: companyInfo.headquarters.phone,
      headquarters: companyInfo.headquarters.address,
      linkedinUrl: 'https://linkedin.com/company/azaroth-tech-hive',
      twitterUrl: 'https://twitter.com/azarothtech',
      githubUrl: 'https://github.com/azaroth-tech',
      metaTitle: 'Azaroth Tech-Hive — Enterprise Technology Solutions & Engineering',
      metaDescription: companyInfo.description,
      logoUrl: '',
      headquarters_address: companyInfo.headquarters.address,
      primary_phone: companyInfo.headquarters.phone,
      primary_email: companyInfo.headquarters.email,
      whatsapp_number: companyInfo.headquarters.whatsapp,
      linkedin_url: 'https://linkedin.com/company/azaroth-tech-hive',
      copyright_text: 'All rights reserved © 2026 Azaroth Tech-Hive',
      footerLayout: 'standard',
    },
    navigation: [...SEED_NAVIGATION_ITEMS],
    products: productsCatalog.map((p, idx) => ({
      ...p,
      order: idx + 1,
      ctaText: 'Request Architecture Walkthrough',
      ctaLink: '/connect-with-us',
    })),
    services: serviceOfferings.map((s, idx) => ({
      ...s,
      summary: s.bestFor,
      order: idx + 1,
    })),
    portfolio: [
      {
        id: 'e-commerce-platform',
        name: 'E-Commerce Platform',
        slug: 'e-commerce-platform',
        clientName: 'Omnichannel Retail Enterprise',
        clientType: 'Enterprise',
        industry: 'Retail & Digital Commerce',
        category: 'Web Development · E-Commerce',
        summary: 'High-concurrency headless digital storefront with sub-second checkout and real-time inventory synchronization.',
        challenge: 'Disconnected sales channels, inconsistent inventory visibility, and manual order processing created friction across the customer journey.',
        solution: 'Engineered a headless commerce storefront connecting inventory, order management, and payment gateways in real time.',
        outcomes: ['Sub-second checkout response', 'Real-time multi-store inventory sync'],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'GraphQL'],
        coverImage: '/images/products/commerce-cover.jpg',
        isFeatured: true,
        order: 1,
      },
    ],
    insights: [...SEED_INSIGHTS_ARTICLES],
    testimonials: [...SEED_TESTIMONIALS],
    pages: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get comprehensive CMS Bundle for website and CMS dashboard
 * Publicly readable so the public website reflects published changes
 */
export async function getBundle(): Promise<{ success: boolean; data: any }> {
  const fallback = getFallbackBundle();

  try {
    const isDbConnected = await checkDatabaseConnection('app');
    if (!isDbConnected) {
      return { success: true, data: fallback };
    }

    const docs = await cmsRepository.getPublishedContentDocuments();
    if (!docs || docs.length === 0) {
      return { success: true, data: fallback };
    }

    return { success: true, data: buildBundle(docs, true) };
  } catch (error) {
    logger.error('cms_service.get_bundle.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: true, data: fallback };
  }
}

function buildBundle(docs: cmsRepository.ContentDocument[], published = false) {
  const docsMap = new Map(docs.map((doc) => [
    doc.scopeKey,
    published ? doc.publishedPayload : doc.draftPayload,
  ]));

  const fallback = getFallbackBundle();
  const settingsDoc = docsMap.get('global:settings') as any;
  const navDoc = docsMap.get('navigation');
  const productsDoc = docsMap.get('products_catalog');
  const servicesDoc = docsMap.get('services_catalog');
  const portfolioDoc = docsMap.get('portfolio_items');
  const insightsDoc = docsMap.get('insights_articles');
  const testimonialsDoc = docsMap.get('testimonials_catalog');
  const pages: Record<string, any> = {};

  for (const [key, payload] of docsMap.entries()) {
    if (key.startsWith('page:')) {
      pages[key.replace('page:', '')] = payload;
    }
  }

  return {
    settings: settingsDoc?.settings || settingsDoc || fallback.settings,
    navigation: Array.isArray(navDoc) ? navDoc : fallback.navigation,
    products: Array.isArray(productsDoc) ? productsDoc : fallback.products,
    services: Array.isArray(servicesDoc) ? servicesDoc : fallback.services,
    portfolio: Array.isArray(portfolioDoc) ? portfolioDoc : fallback.portfolio,
    insights: Array.isArray(insightsDoc) ? insightsDoc : fallback.insights,
    testimonials: Array.isArray(testimonialsDoc) ? testimonialsDoc : fallback.testimonials,
    pages: Object.keys(pages).length > 0 ? pages : fallback.pages,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getAdminBundle(account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }
  if (!canEditContentRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const docs = await cmsRepository.getAllContentDocuments();
    return { success: true, data: buildBundle(docs) };
  } catch (error) {
    logger.error('cms_service.get_admin_bundle.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve CMS content from database.' };
  }
}

/**
 * Get CMS Stats for dashboard overview
 */
export async function getStats(account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }
  if (account.role !== 'SUPER_ADMIN' && account.role !== 'CMS_ADMIN') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const auditLogsPromise = account.role === 'SUPER_ADMIN'
      ? cmsRepository.getAuditLogs(10, 0)
      : Promise.resolve([]);
    const [docs, media, totalEnquiries, unreadEnquiries, auditLogs] = await Promise.all([
      cmsRepository.getAllContentDocuments(),
      cmsRepository.getAllMediaAssets(),
      cmsRepository.countFormSubmissions(),
      cmsRepository.countFormSubmissions('NEW'),
      auditLogsPromise,
    ]);

    const pageCount = docs.filter((d) => d.scopeKey.startsWith('page:')).length;

    return {
      success: true,
      stats: {
        totalPages: pageCount,
        totalMedia: media.length,
        totalEnquiries,
        unreadEnquiries,
        recentActivityCount: auditLogs.length,
      },
    };
  } catch (error) {
    logger.error('cms_service.get_stats.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve stats.' };
  }
}

/**
 * Get website settings
 */
export async function getSettings(account: StoredAccount | null = null) {
  const canReadDraft = Boolean(account && account.role !== 'VIEWER');
  try {
    const doc = canReadDraft
      ? await cmsRepository.getContentDocument('global:settings')
      : (await cmsRepository.getPublishedContentDocuments()).find((entry) => entry.scopeKey === 'global:settings');
    const payload = canReadDraft ? doc?.draftPayload : doc?.publishedPayload;
    if (payload) {
      return { success: true, settings: payload.settings || payload };
    }
  } catch (error) {
    logger.warn('cms_service.get_settings.fallback', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    if (account) {
      return { success: false, message: 'Failed to retrieve settings from database.' };
    }
  }
  return { success: true, settings: getFallbackBundle().settings };
}

/**
 * Update website settings (persists in database and publishes)
 */
export async function updateSettings(settings: any, account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }

  if (!canEditContentRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const draft = await cmsRepository.updateDraftContent('global:settings', { settings }, account.id);
    if (!draft) throw new Error('Settings draft was not saved.');
    const published = await cmsRepository.publishContent('global:settings', account.id);
    if (!published) throw new Error('Settings were not published.');
    await cmsRepository.recordAuditLogEntry({
      eventType: 'SETTINGS_UPDATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'settings',
      targetId: 'global:settings',
    });
    return { success: true, settings };
  } catch (error) {
    logger.error('cms_service.update_settings.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to persist settings in database.' };
  }
}

/**
 * Get navigation
 */
export async function getNavigation(account: StoredAccount | null = null) {
  const canReadDraft = Boolean(account && account.role !== 'VIEWER');
  try {
    const doc = canReadDraft
      ? await cmsRepository.getContentDocument('navigation')
      : (await cmsRepository.getPublishedContentDocuments()).find((entry) => entry.scopeKey === 'navigation');
    const payload = canReadDraft ? doc?.draftPayload : doc?.publishedPayload;
    if (Array.isArray(payload)) {
      return { success: true, navigation: payload };
    }
  } catch (error) {
    logger.error('cms_service.get_navigation.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    if (account) {
      return { success: false, message: 'Failed to retrieve navigation from database.' };
    }
  }
  return { success: true, navigation: SEED_NAVIGATION_ITEMS };
}

/**
 * Update navigation
 */
export async function updateNavigation(navigation: any, account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }

  if (!canEditContentRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const draft = await cmsRepository.updateDraftContent('navigation', navigation, account.id);
    if (!draft) throw new Error('Navigation draft was not saved.');
    const published = await cmsRepository.publishContent('navigation', account.id);
    if (!published) throw new Error('Navigation was not published.');
    await cmsRepository.recordAuditLogEntry({
      eventType: 'NAVIGATION_UPDATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'navigation',
      targetId: 'navigation',
    });
    return { success: true, navigation };
  } catch (error) {
    logger.error('cms_service.update_navigation.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update navigation in database.' };
  }
}

/**
 * Get page content by slug
 */
export async function getPage(slug: string, account: StoredAccount | null = null) {
  const canReadDraft = Boolean(account && account.role !== 'VIEWER');
  try {
    const doc = canReadDraft
      ? await cmsRepository.getContentDocument(`page:${slug}`)
      : (await cmsRepository.getPublishedContentDocuments()).find((entry) => entry.scopeKey === `page:${slug}`);
    if (doc) {
      return { success: true, page: canReadDraft ? doc.draftPayload : doc.publishedPayload };
    }
  } catch (error) {
    logger.error('cms_service.get_page.error', {
      meta: { slug, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    if (account) {
      return { success: false, message: 'Failed to retrieve page from database.' };
    }
  }
  return { success: true, page: {} };
}

/**
 * Update page draft
 */
export async function updatePage(slug: string, payload: any, account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }

  if (!canEditContentRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const data = payload?.data || payload;
    const draft = await cmsRepository.updateDraftContent(`page:${slug}`, data, account.id);
    if (!draft) throw new Error('Page draft was not saved.');
    await cmsRepository.recordAuditLogEntry({
      eventType: 'PAGE_UPDATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'page',
      targetId: slug,
    });
    return { success: true };
  } catch (error) {
    logger.error('cms_service.update_page.error', {
      meta: { slug, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update page in database.' };
  }
}

/**
 * Publish page
 */
export async function publishPage(slug: string, account: StoredAccount | null) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }

  if (!isCmsAdminRole(account.role)) {
    return { success: false, message: 'Admin privileges required to publish.' };
  }

  try {
    const doc = await cmsRepository.publishContent(`page:${slug}`, account.id);
    if (!doc) {
      return { success: false, message: 'Page not found.' };
    }
    await cmsRepository.recordAuditLogEntry({
      eventType: 'PAGE_PUBLISHED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'page',
      targetId: slug,
    });
    return { success: true, document: doc };
  } catch (error) {
    logger.error('cms_service.publish_page.error', {
      meta: { slug, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to publish page in database.' };
  }
}

/**
 * Generic Collection Helpers for Products, Services, Portfolio, Insights, Testimonials
 */
export async function getCollection(
  scopeKey: string,
  fallbackItems: readonly any[] | any[],
  account: StoredAccount | null = null
) {
  if (!account) {
    return { success: false, message: 'Authentication required.' };
  }
  if (!canEditContentRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const doc = await cmsRepository.getContentDocument(scopeKey);
    if (doc && Array.isArray(doc.draftPayload)) {
      return { success: true, items: doc.draftPayload };
    }
  } catch (error) {
    logger.error('cms_service.get_collection.error', {
      meta: { scopeKey, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    if (account) {
      return { success: false, message: `Failed to retrieve ${scopeKey} from database.` };
    }
  }
  return { success: true, items: fallbackItems };
}

export async function createCollectionItem(
  scopeKey: string,
  fallbackItems: readonly any[] | any[],
  item: any,
  label: string,
  account: StoredAccount | null
) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canEditContentRole(account.role)) return { success: false, message: 'Insufficient permissions.' };

  try {
    const id = item?.id || `${scopeKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem = { ...item, id, createdAt: new Date().toISOString() };

    let items = [...fallbackItems];
    const doc = await cmsRepository.getContentDocument(scopeKey);
    if (doc && Array.isArray(doc.draftPayload)) {
      items = doc.draftPayload;
    }

    items.push(newItem);
    const draft = await cmsRepository.updateDraftContent(scopeKey, items, account.id);
    if (!draft) throw new Error(`${label} draft was not saved.`);
    const published = await cmsRepository.publishContent(scopeKey, account.id);
    if (!published) throw new Error(`${label} was not published.`);

    await cmsRepository.recordAuditLogEntry({
      eventType: 'ITEM_CREATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: label,
      targetId: id,
    });

    return { success: true, id, item: newItem };
  } catch (error) {
    logger.error('cms_service.create_item.error', {
      meta: { scopeKey, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: `Failed to create ${label} in database.` };
  }
}

export async function updateCollectionItem(
  scopeKey: string,
  fallbackItems: readonly any[] | any[],
  id: string,
  updates: any,
  label: string,
  account: StoredAccount | null
) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canEditContentRole(account.role)) return { success: false, message: 'Insufficient permissions.' };

  try {
    let items = [...fallbackItems];
    const doc = await cmsRepository.getContentDocument(scopeKey);
    if (doc && Array.isArray(doc.draftPayload)) {
      items = doc.draftPayload;
    }

    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx === -1) {
      return { success: false, message: `${label} item not found.` };
    }

    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    const draft = await cmsRepository.updateDraftContent(scopeKey, items, account.id);
    if (!draft) throw new Error(`${label} draft was not saved.`);
    const published = await cmsRepository.publishContent(scopeKey, account.id);
    if (!published) throw new Error(`${label} was not published.`);

    await cmsRepository.recordAuditLogEntry({
      eventType: 'ITEM_UPDATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: label,
      targetId: id,
    });

    return { success: true, item: items[idx] };
  } catch (error) {
    logger.error('cms_service.update_item.error', {
      meta: { scopeKey, id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: `Failed to update ${label} in database.` };
  }
}

export async function deleteCollectionItem(
  scopeKey: string,
  fallbackItems: readonly any[] | any[],
  id: string,
  label: string,
  account: StoredAccount | null
) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canEditContentRole(account.role)) return { success: false, message: 'Insufficient permissions.' };

  try {
    let items = [...fallbackItems];
    const doc = await cmsRepository.getContentDocument(scopeKey);
    if (doc && Array.isArray(doc.draftPayload)) {
      items = doc.draftPayload;
    }

    const initialLen = items.length;
    items = items.filter((i) => String(i.id) !== String(id));
    if (items.length === initialLen) {
      return { success: false, message: `${label} item not found.` };
    }

    const draft = await cmsRepository.updateDraftContent(scopeKey, items, account.id);
    if (!draft) throw new Error(`${label} draft was not saved.`);
    const published = await cmsRepository.publishContent(scopeKey, account.id);
    if (!published) throw new Error(`${label} was not published.`);

    await cmsRepository.recordAuditLogEntry({
      eventType: 'ITEM_DELETED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: label,
      targetId: id,
    });

    return { success: true };
  } catch (error) {
    logger.error('cms_service.delete_item.error', {
      meta: { scopeKey, id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: `Failed to delete ${label} from database.` };
  }
}

/**
 * Media Management
 */
export async function getAllMedia(account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  try {
    const rawAssets = await cmsRepository.getAllMediaAssets();
    const media = rawAssets.map((asset) => {
      const displayName = asset.displayName || asset.originalName || asset.filename || 'Untitled';
      return {
        id: asset.id,
        filename: asset.filename || displayName,
        originalName: asset.originalName || displayName,
        mimeType: asset.mimeType || 'application/octet-stream',
        sizeBytes: asset.sizeBytes ? Number(asset.sizeBytes) : 0,
        width: asset.width || 0,
        height: asset.height || 0,
        // Always serve through the authenticated media proxy. R2 buckets are
        // private by default and public r2.dev URLs may not be enabled.
        url: `/api/media/file/${asset.id}`,
        altText: asset.altText || displayName,
        category: asset.category || 'general',
        createdAt: asset.createdAt || new Date().toISOString(),
      };
    });
    return { success: true, assets: rawAssets, media };
  } catch (error) {
    logger.error('cms_service.get_media.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve media assets from database.' };
  }
}

export async function createMediaAsset(displayName: string, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canEditContentRole(account.role)) return { success: false, message: 'Insufficient permissions.' };

  try {
    const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const asset = await cmsRepository.createMediaAsset(id, displayName, account.id);
    return { success: true, asset };
  } catch (error) {
    logger.error('cms_service.create_media.error', {
      meta: { displayName, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to create media asset record.' };
  }
}

export async function uploadMediaFile(
  assetId: string,
  file: Buffer,
  fileName: string,
  mimeType: string,
  width: number,
  height: number,
  account: StoredAccount | null
) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canEditContentRole(account.role)) return { success: false, message: 'Insufficient permissions.' };

  if (!r2Service.isR2Configured()) {
    return { success: false, message: 'R2 storage is not configured with credentials.' };
  }

  try {
    const key = `media/${assetId}/${fileName}`;
    const sha256 = crypto.createHash('sha256').update(file).digest('hex');

    const uploadResult = await r2Service.uploadToR2(key, file, mimeType, 'public');
    if (!uploadResult.success) {
      return { success: false, message: uploadResult.error || 'Upload to R2 failed.' };
    }

    const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const version = await cmsRepository.createMediaVersion({
      id: versionId,
      assetId,
      versionNumber: 1,
      status: 'ready',
      publicState: 'public',
      publishAttemptId: null,
      mimeType,
      byteSize: file.length,
      sha256Hex: sha256,
      width,
      height,
      stagingKey: key,
      privateOriginalKey: key,
      variantsMeta: {},
      promotedAt: null,
      unreferencedSince: null,
      trashedAt: null,
      createdBy: account.id,
    });

    if (!version) {
      await r2Service.deleteFromR2(key, 'public');
      return { success: false, message: 'Failed to save media version record.' };
    }

    await cmsRepository.updateMediaAssetCurrentVersion(assetId, versionId);
    await cmsRepository.recordAuditLogEntry({
      eventType: 'MEDIA_UPLOADED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'media',
      targetId: assetId,
      metadata: { fileName, mimeType, sizeBytes: file.length },
    });
    return { success: true, version, url: uploadResult.url };
  } catch (error) {
    logger.error('cms_service.upload_media.error', {
      meta: { assetId, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to upload media file.' };
  }
}

export async function deleteMediaAsset(id: string, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!isCmsAdminRole(account.role)) {
    return { success: false, message: 'Admin privileges required to delete media.' };
  }

  try {
    const asset = await cmsRepository.getMediaAssetForStreaming(id);
    const deleted = await cmsRepository.deleteMediaAsset(id);
    if (!deleted) {
      return { success: false, message: 'Media asset not found.' };
    }

    const key = asset?.stagingKey || asset?.privateOriginalKey;
    if (key) {
      await r2Service.deleteFromR2(key, 'public');
      if (key !== asset?.privateOriginalKey) {
        await r2Service.deleteFromR2(asset?.privateOriginalKey || key, 'private');
      }
    }

    await cmsRepository.recordAuditLogEntry({
      eventType: 'MEDIA_DELETED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'media',
      targetId: id,
      metadata: { fileName: asset?.displayName || id },
    });

    return { success: true };
  } catch (error) {
    logger.error('cms_service.delete_media.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to delete media asset.' };
  }
}

/**
 * Enquiries and Form Submissions
 */
export async function getEnquiries(limit: number = 50, offset: number = 0, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canAccessCrmRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const submissions = await cmsRepository.getFormSubmissions(limit, offset, 'general');
    const enquiries = submissions.map((submission) => {
      const details = submission.rfqDetails || {};
      return {
        id: submission.id,
        name: submission.fullName,
        companyName: submission.companyName || '',
        email: submission.workEmail,
        phone: submission.phone || '',
        country: details.country || submission.deploymentOrSize || '',
        attachments: Array.isArray(details.attachments) ? details.attachments : [],
        consentAccepted: submission.consentAccepted ?? true,
        message: submission.message || '',
        enquiryAbout: submission.subjectOrProduct || '',
        productSlug: submission.inquiryType === 'product' ? submission.subjectOrProduct : undefined,
        productName: submission.inquiryType === 'product' ? submission.subjectOrProduct : undefined,
        status: submission.status || 'NEW',
        assignedTo: submission.assignedTo || undefined,
        followUpNote: submission.followUpNote || undefined,
        nextFollowUpAt: submission.nextFollowUpAt || undefined,
        createdAt: submission.createdAt,
      };
    });
    return { success: true, enquiries };
  } catch (error) {
    logger.error('cms_service.get_enquiries.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve enquiries from database.' };
  }
}

const ENQUIRY_STATUSES = [
  'NEW',
  'OPEN',
  'CONTACTED',
  'IN_PROGRESS',
  'QUALIFIED',
  'PROPOSAL',
  'CLOSED',
] as const;

export async function updateEnquiry(id: string, metadata: any, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canAccessCrmRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  const status =
    typeof metadata?.status === 'string' ? metadata.status.toUpperCase() : undefined;
  if (status && !ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number])) {
    return { success: false, message: 'Invalid enquiry status.' };
  }

  try {
    const updated = await cmsRepository.updateFormSubmission(
      id,
      {
        status: status as (typeof ENQUIRY_STATUSES)[number] | undefined,
        followUpNote: metadata?.followUpNote,
        assignedTo: metadata?.assignedTo,
        nextFollowUpAt: metadata?.nextFollowUpAt,
      },
      'general'
    );
    if (!updated) {
      return { success: false, message: 'Enquiry not found.' };
    }

    await cmsRepository.recordAuditLogEntry({
      eventType: 'ENQUIRY_UPDATED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'enquiry',
      targetId: id,
      metadata: {
        status: status || null,
        hasNote: Boolean(metadata?.followUpNote),
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('cms_service.update_enquiry.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update enquiry in database.' };
  }
}

export async function deleteEnquiry(id: string, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!isCmsAdminRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const deleted = await cmsRepository.deleteFormSubmission(id, 'general');
    if (!deleted) {
      return { success: false, message: 'Enquiry not found.' };
    }

    await cmsRepository.recordAuditLogEntry({
      eventType: 'ENQUIRY_DELETED',
      actorUserId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      targetType: 'enquiry',
      targetId: id,
    });

    return { success: true };
  } catch (error) {
    logger.error('cms_service.delete_enquiry.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to delete enquiry from database.' };
  }
}

export async function getRfqs(limit: number = 50, offset: number = 0, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canAccessCrmRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const submissions = await cmsRepository.getFormSubmissions(limit, offset, 'product');
    const rfqs = submissions.map((submission) => {
      const details = submission.rfqDetails || {};
      return {
        id: submission.id,
        name: submission.fullName,
        companyName: submission.companyName || '',
        email: submission.workEmail,
        phone: submission.phone || '',
        country: details.country || '',
        projectType: Array.isArray(details.solutionCategories)
          ? details.solutionCategories.join(', ')
          : details.projectScope || submission.subjectOrProduct || '',
        projectDescription: submission.message || '',
        expectedTimeline: details.targetTimeline || submission.deploymentOrSize || '',
        estimatedBudget: details.budgetRange || '',
        status: submission.status,
        assignedTo: submission.assignedTo || undefined,
        createdAt: submission.createdAt,
      };
    });
    return { success: true, rfqs };
  } catch (error) {
    logger.error('cms_service.get_rfqs.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve RFQs from database.' };
  }
}

export async function updateRfq(id: string, metadata: any, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!canAccessCrmRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const updated = await cmsRepository.updateFormSubmission(id, metadata, 'product');
    if (!updated) return { success: false, message: 'RFQ not found.' };
    return { success: true };
  } catch (error) {
    logger.error('cms_service.update_rfq.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to update RFQ in database.' };
  }
}

export async function deleteRfq(id: string, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!isCmsAdminRole(account.role)) {
    return { success: false, message: 'Insufficient permissions.' };
  }

  try {
    const deleted = await cmsRepository.deleteFormSubmission(id, 'product');
    if (!deleted) return { success: false, message: 'RFQ not found.' };
    return { success: true };
  } catch (error) {
    logger.error('cms_service.delete_rfq.error', {
      meta: { id, error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to delete RFQ from database.' };
  }
}

/**
 * Audit Logs
 */
export async function getAuditLogs(limit: number = 100, offset: number = 0, account: StoredAccount | null) {
  if (!account) return { success: false, message: 'Authentication required.' };
  if (!isCmsAdminRole(account.role)) {
    return { success: false, message: 'Admin privileges required to view audit logs.' };
  }

  try {
    const logs = await cmsRepository.getAuditLogs(limit, offset);
    // Normalize the database shape to the CmsAuditLog contract consumed by
    // the admin UI. Keep the raw fields too for backwards compatibility.
    const normalized = logs.map((log: any) => ({
      id: String(log.id),
      userId: log.actorUserId || 'system',
      userName: log.actorEmail || 'System',
      action: log.eventType || 'UNKNOWN',
      module: log.targetType || 'system',
      entityType: log.targetType || 'system',
      entityId: log.targetId || '',
      details: log.metadata || {},
      ipAddress: log.ipAddress || '',
      createdAt: log.createdAt,
      eventType: log.eventType,
      actorEmail: log.actorEmail,
      targetType: log.targetType,
      targetId: log.targetId,
      metadata: log.metadata || {},
    }));
    return { success: true, logs: normalized };
  } catch (error) {
    logger.error('cms_service.get_audit_logs.error', {
      meta: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, message: 'Failed to retrieve audit logs from database.' };
  }
}
