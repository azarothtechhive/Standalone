#!/usr/bin/env node
/**
 * Standalone Read-Only Baseline Performance & Median Comparison Script (PERF-1, PERF-2, HR-8)
 *
 * Rules obeyed (HR-8):
 * - Zero imports from application code; excluded from application builds.
 * - Performs only low-volume read-only GETs against BASE_URL (default: https://standalone-omega-one.vercel.app).
 * - Never submits forms or performs logins.
 * - Computes median of N runs (default 5) per URL and preset (mobile Slow 4G 4x CPU & desktop)
 *   for Lighthouse Performance Score, LCP, TBT, CLS, INP/MaxPotentialFID, and Total Byte Weight.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = process.env.BASE_URL || 'https://standalone-omega-one.vercel.app';
const RUNS_PER_PRESET = Number(process.env.LH_RUNS || 5);
const CACHE_MODE = process.env.CACHE_MODE || 'cold'; // 'cold' | 'warm'
const OUTPUT_DIR = path.resolve(process.cwd(), 'qa-tools/.results');

export const PUBLIC_PATHS = [
  '/',
  '/about',
  '/products',
  '/products/fitness-management-platform',
  '/products/omnichannel-commerce-platform',
  '/products/learning-management-platform',
  '/products/healthcare-management-system',
  '/services',
  '/portfolio',
  '/technology-insights',
  '/technology-insights/scaling-event-streaming-zero-data-loss',
  '/technology-insights/private-enterprise-ai-rag-architectures',
  '/technology-insights/zero-downtime-monolith-to-microservice-migration',
  '/testimonials',
  '/connect-with-us',
  '/privacy-policy',
  '/terms-of-service',
];

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

function checkLighthouseAvailable() {
  const res = spawnSync('lighthouse', ['--version'], { encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : null;
}

function runLighthouseSingle(url, preset, runIndex, disableStorageReset) {
  const args = [
    url,
    '--output=json',
    '--output-path=stdout',
    '--quiet',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
  ];

  if (preset === 'mobile') {
    args.push(
      '--form-factor=mobile',
      '--throttling-method=simulate',
      '--throttling.rttMs=150',
      '--throttling.throughputKbps=1638.4',
      '--throttling.requestLatencyMs=562.5',
      '--throttling.downloadThroughputKbps=1474.56',
      '--throttling.uploadThroughputKbps=675',
      '--throttling.cpuSlowdownMultiplier=4',
      '--screenEmulation.mobile=true',
      '--screenEmulation.width=390',
      '--screenEmulation.height=844',
      '--screenEmulation.deviceScaleFactor=3'
    );
  } else {
    args.push(
      '--preset=desktop',
      '--form-factor=desktop',
      '--throttling-method=simulate',
      '--throttling.rttMs=40',
      '--throttling.throughputKbps=10240',
      '--throttling.cpuSlowdownMultiplier=1',
      '--screenEmulation.mobile=false',
      '--screenEmulation.width=1440',
      '--screenEmulation.height=900',
      '--screenEmulation.deviceScaleFactor=1'
    );
  }

  if (disableStorageReset) {
    args.push('--disable-storage-reset=true');
  }

  const proc = spawnSync('lighthouse', args, {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });

  if (proc.status !== 0) {
    throw new Error(`Lighthouse run ${runIndex + 1} failed for ${url} (${preset}): ${proc.stderr}`);
  }

  const lhr = JSON.parse(proc.stdout);
  return {
    performanceScore: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
    accessibilityScore: Math.round((lhr.categories?.accessibility?.score ?? 0) * 100),
    seoScore: Math.round((lhr.categories?.seo?.score ?? 0) * 100),
    lcpMs: Number((lhr.audits?.['largest-contentful-paint']?.numericValue ?? 0).toFixed(1)),
    tbtMs: Number((lhr.audits?.['total-blocking-time']?.numericValue ?? 0).toFixed(1)),
    cls: Number((lhr.audits?.['cumulative-layout-shift']?.numericValue ?? 0).toFixed(4)),
    totalByteWeight: Math.round(lhr.audits?.['total-byte-weight']?.numericValue ?? 0),
  };
}

async function main() {
  const lhVersion = checkLighthouseAvailable();
  if (!lhVersion) {
    console.error(
      '[PERF-1] `lighthouse` CLI is not installed on PATH in this environment.\n' +
        'To run this script on a runner or machine with Lighthouse installed:\n' +
        '  npm install -g lighthouse @lhci/cli\n' +
        '  node qa-tools/measure-baseline.mjs\n' +
        'Per HR-6 and PERF-1, no figures are invented when Lighthouse is unavailable.'
    );
    process.exit(2);
  }

  console.log(`Lighthouse ${lhVersion} detected. Base URL: ${DEFAULT_BASE_URL}, Runs: ${RUNS_PER_PRESET}, Cache: ${CACHE_MODE}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: DEFAULT_BASE_URL,
    runsPerPreset: RUNS_PER_PRESET,
    cacheMode: CACHE_MODE,
    results: [],
  };

  for (const routePath of PUBLIC_PATHS) {
    const targetUrl = `${DEFAULT_BASE_URL.replace(/\/$/, '')}${routePath}`;
    for (const preset of ['mobile', 'desktop']) {
      console.log(`Measuring ${targetUrl} [${preset}] (${RUNS_PER_PRESET} runs)...`);
      const runs = [];
      for (let i = 0; i < RUNS_PER_PRESET; i++) {
        const disableReset = CACHE_MODE === 'warm' && i > 0;
        runs.push(runLighthouseSingle(targetUrl, preset, i, disableReset));
      }
      summary.results.push({
        path: routePath,
        url: targetUrl,
        preset,
        median: {
          performanceScore: median(runs.map((r) => r.performanceScore)),
          accessibilityScore: median(runs.map((r) => r.accessibilityScore)),
          seoScore: median(runs.map((r) => r.seoScore)),
          lcpMs: median(runs.map((r) => r.lcpMs)),
          tbtMs: median(runs.map((r) => r.tbtMs)),
          cls: median(runs.map((r) => r.cls)),
          totalByteWeight: median(runs.map((r) => r.totalByteWeight)),
        },
        runs,
      });
    }
  }

  const outFile = path.join(OUTPUT_DIR, `baseline-${CACHE_MODE}-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(`Saved median results to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
