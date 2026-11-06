import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isCmsCollection } from '../src/utils/cmsCollections.ts';
import {
  getPublicProducts,
  normalizeCmsTestimonials,
} from '../src/utils/publicContent.ts';
import {
  getPublicFooterLinks,
  getPublicNavigation,
} from '../src/utils/publicNavigation.ts';
import {
  addPageSection,
  getDefaultPageSections,
  movePageSection,
  normalizePageBuilderDocument,
} from '../src/utils/pageBuilder.ts';
import { isAllowedCmsHref } from '../src/components/common/CmsPageLayout.tsx';
import type { CmsProduct } from '../src/services/cmsService.ts';

describe('CMS collection synchronization', () => {
  it('recognizes an intentionally empty server collection as present', () => {
    assert.equal(isCmsCollection([]), true);
  });

  it('distinguishes an omitted collection from an intentionally empty one', () => {
    assert.equal(isCmsCollection(undefined), false);
  });
});

describe('public product mapping', () => {
  const product = (overrides: Partial<CmsProduct> = {}): CmsProduct => ({
    id: 'product-1',
    name: 'CMS Product',
    slug: 'cms-product',
    tagline: '',
    shortDescription: '',
    fullDescription: '',
    coverImage: '',
    isFeatured: false,
    status: 'PUBLISHED',
    order: 1,
    technologies: [],
    benefits: [],
    ctaText: '',
    ctaLink: '',
    ...overrides,
  });

  it('keeps disabled products out of public listings', () => {
    assert.deepEqual(
      getPublicProducts([product({ isEnabled: false })], []),
      [],
    );
  });

  it('uses CMS benefits for the public product detail capabilities', () => {
    const mapped = getPublicProducts(
      [product({ benefits: ['CMS-managed benefit'] })],
      [],
    );

    assert.deepEqual(mapped[0]?.keyCapabilities, ['CMS-managed benefit']);
  });
});

describe('CMS testimonial normalization', () => {
  it('maps API author and company fields to the public testimonial shape', () => {
    const [testimonial] = normalizeCmsTestimonials([
      {
        id: 'testimonial-1',
        author: 'Client Name',
        company: 'Client Organization',
        role: 'Technology Director',
        quote: 'A CMS-managed testimonial.',
        rating: 5,
        verified: true,
      },
    ]);

    assert.equal(testimonial?.clientName, 'Client Name');
    assert.equal(testimonial?.organization, 'Client Organization');
    assert.equal(testimonial?.isFeatured, true);
  });
});

describe('public navigation mapping', () => {
  const templates = [
    { name: 'Home', href: '/', isActive: (path: string) => path === '/' },
    {
      name: 'Our Portfolio',
      href: '/portfolio',
      isActive: (path: string) => path.startsWith('/portfolio'),
      children: [
        { name: 'Explore Products', href: '/portfolio#products' },
        { name: 'Explore Services', href: '/portfolio#services' },
      ],
    },
    {
      name: 'Resource Hub',
      href: '/resource-hub',
      isActive: (path: string) => path.startsWith('/resource-hub'),
    },
  ];

  it('preserves the current public menu labels, order, and child links for seeded CMS items', () => {
    const mapped = getPublicNavigation(
      [
        { id: 'nav-home', label: 'Home', path: '/', order: 1, isVisible: true },
        { id: 'nav-products', label: 'Products', path: '/products', order: 2, isVisible: true },
        { id: 'nav-services', label: 'Services', path: '/services', order: 3, isVisible: true },
        { id: 'nav-insights', label: 'Insights', path: '/technology-insights', order: 4, isVisible: true },
        { id: 'nav-portfolio', label: 'Portfolio', path: '/portfolio', order: 5, isVisible: true },
      ],
      templates,
    );

    assert.deepEqual(
      mapped.map((item) => item.name),
      ['Home', 'Our Portfolio', 'Resource Hub'],
    );
    assert.deepEqual(
      mapped[1]?.children?.map((item) => item.href),
      ['/portfolio#products', '/portfolio#services'],
    );
  });

  it('applies CMS visibility, labels, links, and explicit reorder changes', () => {
    const mapped = getPublicNavigation(
      [
        { id: 'nav-home', label: 'Home', path: '/', order: 2, isVisible: true },
        { id: 'nav-products', label: 'Products', path: '/products', order: 3, isVisible: false },
        { id: 'nav-services', label: 'Services', path: '/services', order: 4, isVisible: true },
        { id: 'nav-insights', label: 'Research', path: '/insights', order: 1, isVisible: true },
        { id: 'nav-portfolio', label: 'Portfolio', path: '/portfolio', order: 5, isVisible: false },
      ],
      templates,
    );

    assert.deepEqual(
      mapped.map((item) => [item.name, item.href]),
      [['Research', '/insights'], ['Home', '/']],
    );
  });

  it('keeps footer quick links unchanged until their CMS records are edited', () => {
    assert.deepEqual(
      getPublicFooterLinks([
        { id: 'nav-products', label: 'Products', path: '/products', order: 2, isVisible: true },
        { id: 'nav-services', label: 'Services', path: '/services', order: 3, isVisible: true },
        { id: 'nav-insights', label: 'Insights', path: '/technology-insights', order: 4, isVisible: true },
      ]).map(({ label, path }) => [label, path]),
      [
        ['Explore Products', '/portfolio#products'],
        ['Explore Services', '/portfolio#services'],
        ['Resource Hub', '/resource-hub'],
      ],
    );
  });

  it('respects intentional empty navigation collections', () => {
    assert.deepEqual(getPublicNavigation([], templates), []);
    assert.deepEqual(getPublicFooterLinks([]), []);
  });
});

describe('CMS page builder schema', () => {
  it('adds versioned section metadata without changing legacy page content', () => {
    const source = {
      hero: {
        title: 'Current headline',
        primaryCta: { label: 'Keep this CTA', href: '/portfolio' },
      },
    };
    const normalized = normalizePageBuilderDocument('home', source);

    assert.deepEqual(normalized.hero, source.hero);
    assert.equal(normalized.builder?.version, 1);
    assert.deepEqual(
      normalized.builder?.sections?.map((section) => section.id),
      getDefaultPageSections('home').map((section) => section.id),
    );
  });

  it('reorders sections and creates approved blocks with stable schema fields', () => {
    const existing = getDefaultPageSections('home');
    const moved = movePageSection(existing, 'hero', 1);
    const added = addPageSection(moved, 'richText');

    assert.equal(moved[1]?.id, 'hero');
    assert.deepEqual(
      moved.map((section) => section.order),
      moved.map((_section, index) => index + 1),
    );
    assert.equal(added.at(-1)?.type, 'richText');
    assert.equal(added.at(-1)?.isVisible, true);
  });

  it('drops block types outside the approved registry', () => {
    const normalized = normalizePageBuilderDocument('home', {
      builder: {
        version: 1,
        sections: [
          {
            id: 'unsafe',
            type: 'script',
            label: 'Unsafe',
            order: 1,
            isVisible: true,
          },
        ],
      },
    });

    assert.equal(
      normalized.builder?.sections?.some((section) => section.id === 'unsafe'),
      false,
    );
  });

  it('only allows internal paths and HTTP(S) links in page-builder blocks', () => {
    assert.equal(isAllowedCmsHref('/contact'), true);
    assert.equal(isAllowedCmsHref('https://example.com'), true);
    assert.equal(isAllowedCmsHref('javascript:alert(1)'), false);
    assert.equal(isAllowedCmsHref('data:text/html,unsafe'), false);
    assert.equal(isAllowedCmsHref('/\\example.com'), false);
  });
});
