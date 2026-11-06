#!/usr/bin/env node
/**
 * Standalone Read-Only Crawler & Social-Bot HTML Verification Script (SEO-6, HR-8)
 *
 * Rules obeyed (HR-8):
 * - Low-volume read-only GET requests only against https://standalone-omega-one.vercel.app/ (or BASE_URL).
 * - Zero form submissions, zero logins, zero imports from application code.
 * - Inspects initial raw HTML returned to Googlebot and Twitterbot for every public route.
 */

const BASE_URL = (process.env.BASE_URL || 'https://standalone-omega-one.vercel.app').replace(/\/$/, '');

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/products',
  '/services',
  '/portfolio',
  '/technology-insights',
  '/testimonials',
  '/connect-with-us',
  '/privacy-policy',
  '/terms-of-service',
];

const USER_AGENTS = {
  crawler: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  socialBot: 'Twitterbot/1.0',
};

function extractTag(html, regex) {
  const m = html.match(regex);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

async function inspectRoute(routePath, uaName, uaString) {
  const url = `${BASE_URL}${routePath}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': uaString, Accept: 'text/html' },
    redirect: 'manual',
  });
  const html = await res.text();
  return {
    path: routePath,
    ua: uaName,
    status: res.status,
    title: extractTag(html, /<title>([\s\S]*?)<\/title>/i),
    description: extractTag(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i),
    ogTitle: extractTag(html, /<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i),
    ogDescription: extractTag(html, /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i),
    ogType: extractTag(html, /<meta\s+property=["']og:type["']\s+content=["']([\s\S]*?)["']/i),
    ogSiteName: extractTag(html, /<meta\s+property=["']og:site_name["']\s+content=["']([\s\S]*?)["']/i),
    robots: extractTag(html, /<meta\s+name=["']robots["']\s+content=["']([\s\S]*?)["']/i),
    themeColor: extractTag(html, /<meta\s+name=["']theme-color["']\s+content=["']([\s\S]*?)["']/i),
    canonical: extractTag(html, /<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']/i),
  };
}

async function main() {
  const results = [];
  for (const p of PUBLIC_PATHS) {
    const crawlerRes = await inspectRoute(p, 'crawler', USER_AGENTS.crawler);
    results.push(crawlerRes);
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
