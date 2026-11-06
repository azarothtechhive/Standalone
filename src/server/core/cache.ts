/**
 * Class A Core Module — Single Cache Module & CachePurgePort Interface
 * Covers: RT-3, RT-4, PUB-7, SEO-2, SEO-3
 *
 * Defines every Cache-Control header, cache key, cache tag, and the host-agnostic
 * `CachePurgePort` interface. Zero Node built-ins or @vercel/* imports (RT-2).
 */

export const CACHE_CONTROL_POLICIES = {
  /** Public HTML & published content JSON: 1h edge cache + 24h stale-while-revalidate (SEO-2, SEO-3) */
  publicHtmlAndContent: 'public, s-maxage=3600, stale-while-revalidate=86400',
  /** Sitemap & robots.txt: 1h edge cache + 24h stale-while-revalidate */
  publicSeoFiles: 'public, s-maxage=3600, stale-while-revalidate=86400',
  /** R2 Public Bucket immutable media versions: 1 year immutable (MED-6, PERF-4) */
  immutablePublicMedia: 'public, max-age=31536000, immutable',
  /** Authenticated Admin APIs, Live Preview, Drafts, Health, Auth: never cached (PUB-1, SEC-1) */
  privateNoStore: 'private, no-store, no-cache, must-revalidate',
} as const;

export const CACHE_TAGS = {
  allContent: 'cms:all',
  globalHeader: 'cms:global:header',
  globalFooter: 'cms:global:footer',
  globalSettings: 'cms:global:settings',
  sitemap: 'cms:sitemap',
  forScope(scopeKey: string): string {
    return `cms:scope:${scopeKey}`;
  },
  forRoute(pathname: string): string {
    const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `cms:route:${clean}`;
  },
} as const;

export function buildCacheKeyForRoute(pathname: string): string {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `azaroth:v1:html:${clean}`;
}

export interface CachePurgeRequest {
  tags: string[];
  paths: string[];
}

export interface CachePurgeResult {
  ok: boolean;
  purgedTags: string[];
  purgedPaths: string[];
  adapterName: string;
  errorDetail?: string;
}

export interface CachePurgePort {
  readonly adapterName: string;
  purge(request: CachePurgeRequest): Promise<CachePurgeResult>;
}

/**
 * In-memory fake implementation of CachePurgePort for local dev and RT-4 contract tests.
 */
export class InMemoryCachePurgeAdapter implements CachePurgePort {
  public readonly adapterName = 'in-memory';
  private readonly purgedHistory: Array<{
    tags: string[];
    paths: string[];
    timestamp: string;
  }> = [];
  private shouldFailWith: string | null = null;

  public setSimulateFailure(message: string | null): void {
    this.shouldFailWith = message;
  }

  public getHistory() {
    return [...this.purgedHistory];
  }

  public async purge(request: CachePurgeRequest): Promise<CachePurgeResult> {
    const uniqueTags = Array.from(new Set(request.tags.map((t) => t.trim()).filter(Boolean)));
    const uniquePaths = Array.from(
      new Set(
        request.paths
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => (p.startsWith('/') ? p : `/${p}`))
      )
    );

    if (this.shouldFailWith) {
      return {
        ok: false,
        purgedTags: [],
        purgedPaths: [],
        adapterName: this.adapterName,
        errorDetail: this.shouldFailWith,
      };
    }

    this.purgedHistory.push({
      tags: uniqueTags,
      paths: uniquePaths,
      timestamp: new Date().toISOString(),
    });

    return {
      ok: true,
      purgedTags: uniqueTags,
      purgedPaths: uniquePaths,
      adapterName: this.adapterName,
    };
  }
}
