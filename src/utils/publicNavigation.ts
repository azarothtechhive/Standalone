import type { NavigationItem } from "../services/cmsService";

type ChildLink = { name: string; href: string; isExternal?: boolean };

export interface PublicNavigationTemplate<Child extends ChildLink> {
  name: string;
  href: string;
  isExternal?: boolean;
  isActive: (pathname: string) => boolean;
  children?: Child[];
}

const seedItems: Record<
  string,
  { label: string; path: string; order: number }
> = {
  "nav-home": { label: "Home", path: "/", order: 1 },
  "nav-products": { label: "Products", path: "/products", order: 2 },
  "nav-services": { label: "Services", path: "/services", order: 3 },
  "nav-insights": {
    label: "Insights",
    path: "/technology-insights",
    order: 4,
  },
  "nav-portfolio": { label: "Portfolio", path: "/portfolio", order: 5 },
  "nav-testimonials": {
    label: "Testimonials",
    path: "/testimonials",
    order: 6,
  },
  "nav-delivery": {
    label: "Delivery Framework",
    path: "/delivery-framework",
    order: 7,
  },
  "nav-about": { label: "About Us", path: "/about", order: 8 },
  "nav-quote": { label: "Request Quote", path: "/request-quote", order: 9 },
  "nav-contact": {
    label: "Connect With Us",
    path: "/connect-with-us",
    order: 10,
  },
};

const publicRoots: Record<
  string,
  { ids: string[]; childIds: string[] }
> = {
  Home: { ids: ["nav-home", "nav-1"], childIds: [] },
  "Who we are": {
    ids: ["nav-about", "nav-2"],
    childIds: ["nav-delivery"],
  },
  "Our Portfolio": {
    ids: ["nav-portfolio", "nav-3"],
    childIds: ["nav-products", "nav-services"],
  },
  "Resource Hub": { ids: ["nav-insights", "nav-4"], childIds: [] },
  Testimonials: { ids: ["nav-testimonials", "nav-5"], childIds: [] },
  "Connect With Us": { ids: ["nav-contact", "nav-6"], childIds: [] },
};

const fallbackSeedItems: Record<
  string,
  { label: string; path: string; order: number }
> = {
  "nav-1": { label: "Home", path: "/", order: 1 },
  "nav-2": { label: "Who we are", path: "/about", order: 2 },
  "nav-3": { label: "Our Portfolio", path: "/portfolio", order: 3 },
  "nav-4": { label: "Resource Hub", path: "/resource-hub", order: 4 },
  "nav-5": { label: "Testimonials", path: "/testimonials", order: 5 },
  "nav-6": { label: "Connect With Us", path: "/connect-with-us", order: 6 },
};

const knownIds = new Set([
  ...Object.keys(seedItems),
  ...Object.keys(fallbackSeedItems),
]);

const childSeedItems: Record<
  string,
  { label: string; path: string; templateName: string }
> = {
  "nav-products": {
    label: "Products",
    path: "/products",
    templateName: "Explore Products",
  },
  "nav-services": {
    label: "Services",
    path: "/services",
    templateName: "Explore Services",
  },
  "nav-delivery": {
    label: "Delivery Framework",
    path: "/delivery-framework",
    templateName: "Delivery Framework",
  },
};

const getSeed = (id: string) => seedItems[id] || fallbackSeedItems[id];

export function getPublicFooterLinks(cmsItems: NavigationItem[]) {
  const isApiSchema =
    cmsItems.length === 0 ||
    cmsItems.some((item) => item.id in seedItems) ||
    (cmsItems.length > 0 &&
      !cmsItems.some((item) => item.id in fallbackSeedItems));
  const cmsById = new Map(cmsItems.map((item) => [item.id, item]));
  const definitions = [
    {
      ids: ["nav-products"],
      label: "Explore Products",
      path: "/portfolio#products",
    },
    {
      ids: ["nav-services"],
      label: "Explore Services",
      path: "/portfolio#services",
    },
    {
      ids: ["nav-insights", "nav-4"],
      label: "Resource Hub",
      path: "/resource-hub",
    },
  ];

  return definitions.flatMap((definition) => {
    const item = definition.ids
      .map((id) => cmsById.get(id))
      .find((entry) => entry !== undefined);
    if (!item) {
      return isApiSchema
        ? []
        : [
            {
              id: definition.ids[0],
              label: definition.label,
              path: definition.path,
              isExternal: false,
            },
          ];
    }
    if (item.isVisible === false) return [];

    const seed = getSeed(item.id);
    return [
      {
        id: item.id,
        label:
          seed && item.label !== seed.label ? item.label : definition.label,
        path: seed && item.path !== seed.path ? item.path : definition.path,
        isExternal: item.isExternal,
      },
    ];
  });
}

export function getPublicNavigation<Child extends ChildLink>(
  cmsItems: NavigationItem[],
  templates: PublicNavigationTemplate<Child>[],
): PublicNavigationTemplate<Child>[] {
  const hasFallbackItems = cmsItems.some(
    (item) => item.id in fallbackSeedItems,
  );
  const hasSeedItems = cmsItems.some((item) => item.id in seedItems);
  const isApiSchema =
    cmsItems.length === 0 ||
    hasSeedItems ||
    (cmsItems.length > 0 && !hasFallbackItems);
  const cmsById = new Map(cmsItems.map((item) => [item.id, item]));
  const hasReorderedItems = cmsItems.some(
    (item) =>
      getSeed(item.id)?.order !== undefined &&
      getSeed(item.id)?.order !== item.order,
  );

  type OrderedItem = PublicNavigationTemplate<Child> & {
    order: number;
    isCustom: boolean;
  };

  const mappedRoots: OrderedItem[] = templates.flatMap((template) => {
    const config = publicRoots[template.name];
    if (!config) {
      return [{ ...template, order: 0, isCustom: false }];
    }

    const cmsItem = config.ids
      .map((id) => cmsById.get(id))
      .find((item) => item !== undefined);
    if (!cmsItem) {
      return isApiSchema
        ? []
        : [{ ...template, order: 0, isCustom: false }];
    }
    if (cmsItem.isVisible === false) return [];

    const seed = getSeed(cmsItem.id);
    const rootHref =
      seed && cmsItem.path !== seed.path ? cmsItem.path : template.href;
    const root: PublicNavigationTemplate<Child> = {
      ...template,
      name:
        seed && cmsItem.label !== seed.label ? cmsItem.label : template.name,
      href: rootHref,
      isExternal: cmsItem.isExternal,
      isActive: (pathname) =>
        template.isActive(pathname) ||
        (rootHref !== "/" && pathname.startsWith(rootHref)),
    };

    const children = (cmsItem.children && cmsItem.children.length > 0)
      ? cmsItem.children.map((child) => ({
          name: child.label,
          href: child.path,
          isExternal: child.isExternal,
        } as unknown as Child))
      : template.children?.flatMap((child) => {
          const childId = config.childIds.find(
            (id) => childSeedItems[id]?.templateName === child.name,
          );
          if (!childId) return [child];

          const childCmsItem = cmsById.get(childId);
          if (!childCmsItem) return isApiSchema ? [] : [child];
          if (childCmsItem.isVisible === false) return [];

          const childSeed = childSeedItems[childId];
          return [
            {
              ...child,
              name:
                childCmsItem.label !== childSeed.label
                  ? childCmsItem.label
                  : child.name,
              href:
                childCmsItem.path !== childSeed.path
                  ? childCmsItem.path
                  : child.href,
              isExternal: childCmsItem.isExternal,
            },
          ];
        });

    return [
      {
        ...root,
        ...(children && children.length > 0 ? { children } : {}),
        order: cmsItem.order,
        isCustom: false,
      },
    ];
  });

  const customItems = cmsItems
    .filter((item) => !knownIds.has(item.id) && item.isVisible !== false)
    .map((item) => ({
      name: item.label,
      href: item.path,
      isExternal: item.isExternal,
      isActive: (pathname: string) => pathname === item.path,
      order: item.order,
      isCustom: true,
      ...(item.children && item.children.length > 0
        ? {
            children: item.children.map((child) => ({
              name: child.label,
              href: child.path,
              isExternal: child.isExternal,
            } as unknown as Child)),
          }
        : {}),
    }));

  return [...mappedRoots, ...customItems]
    .sort((a, b) => {
      if (hasReorderedItems) return (a.order ?? 0) - (b.order ?? 0);
      if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
      return 0;
    })
    .map(({ order: _order, isCustom: _isCustom, ...item }) => item);
}
