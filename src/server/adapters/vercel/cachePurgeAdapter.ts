/**
 * Vercel Adapter — VercelCachePurgeAdapter implementing CachePurgePort
 * Covers: RT-1, RT-3, RT-4, PUB-7
 *
 * Isolated inside `/src/server/adapters/vercel/` per RT-2 import boundary rules.
 */

import type {
  CachePurgePort,
  CachePurgeRequest,
  CachePurgeResult,
} from '../../core/cache';

export interface VercelPurgeAdapterConfig {
  siteUrl?: string;
  bypassToken?: string;
  fetchImpl?: typeof fetch;
}

export class VercelCachePurgeAdapter implements CachePurgePort {
  public readonly adapterName = 'vercel-cdn';
  private readonly siteUrl: string;
  private readonly bypassToken: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: VercelPurgeAdapterConfig = {}) {
    const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {};
    this.siteUrl = (config.siteUrl || env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    this.bypassToken = config.bypassToken ?? env.VERCEL_REVALIDATE_TOKEN ?? '';
    this.fetchImpl = config.fetchImpl || globalThis.fetch.bind(globalThis);
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

    if (uniqueTags.length === 0 && uniquePaths.length === 0) {
      return {
        ok: true,
        purgedTags: [],
        purgedPaths: [],
        adapterName: this.adapterName,
      };
    }

    try {
      const response = await this.fetchImpl(`${this.siteUrl}/api/internal/revalidate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.bypassToken ? { 'x-prerender-revalidate': this.bypassToken } : {}),
        },
        body: JSON.stringify({
          tags: uniqueTags,
          paths: uniquePaths,
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          purgedTags: [],
          purgedPaths: [],
          adapterName: this.adapterName,
          errorDetail: `Vercel cache purge returned HTTP ${response.status}`,
        };
      }

      return {
        ok: true,
        purgedTags: uniqueTags,
        purgedPaths: uniquePaths,
        adapterName: this.adapterName,
      };
    } catch (err) {
      return {
        ok: false,
        purgedTags: [],
        purgedPaths: [],
        adapterName: this.adapterName,
        errorDetail: err instanceof Error ? err.message : 'Unknown cache purge error',
      };
    }
  }
}
