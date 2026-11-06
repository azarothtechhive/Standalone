#!/usr/bin/env node
/**
 * Runtime Boundary Lint (/scripts/lint-runtime-boundaries.mjs)
 * Covers: RT-2 (`minimal` portability mode P0 requirement)
 *
 * Enforces:
 * 1. Class A modules (`/src/server/core/**`) must NEVER import:
 *    - Node built-in modules (`node:*`, `fs`, `path`, `crypto`, `child_process`, `os`, `net`, `tls`, `stream`, `http`, `https`, `zlib`)
 *    - Class B Node-only modules (`/src/server/node/**`, `sharp`, `better-auth`)
 *    - Host-specific packages (`@vercel/*`)
 * 2. `@vercel/*` packages or Vercel adapter internals may NEVER be imported outside
 *    `/src/server/adapters/vercel/**` and `/api/**`.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const CLASS_A_DIR = path.join(ROOT_DIR, 'src/server/core');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const FORBIDDEN_NODE_BUILTINS = new Set([
  'fs',
  'fs/promises',
  'path',
  'crypto',
  'child_process',
  'os',
  'net',
  'tls',
  'stream',
  'http',
  'https',
  'zlib',
  'worker_threads',
  'dgram',
  'dns',
]);

const FORBIDDEN_CLASS_B_SPECIFIERS = ['sharp', 'better-auth', '/server/node/', '../node/'];

function collectTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractImportSpecifiers(code) {
  const specifiers = [];
  const staticImportRegex = /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const requireRegex = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;
  while ((match = staticImportRegex.exec(code)) !== null) {
    specifiers.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(code)) !== null) {
    specifiers.push(match[1]);
  }
  while ((match = requireRegex.exec(code)) !== null) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

export function lintRuntimeBoundaries() {
  const violations = [];

  // Rule 1: Check all Class A modules under /src/server/core/**
  const classAFiles = collectTsFiles(CLASS_A_DIR);
  for (const file of classAFiles) {
    const rel = path.relative(ROOT_DIR, file);
    const code = fs.readFileSync(file, 'utf8');
    const specifiers = extractImportSpecifiers(code);

    for (const spec of specifiers) {
      if (spec.startsWith('node:') || FORBIDDEN_NODE_BUILTINS.has(spec)) {
        violations.push(
          `[RT-2 Violation] Class A module ${rel} imports Node built-in "${spec}".`
        );
      }
      if (FORBIDDEN_CLASS_B_SPECIFIERS.some((b) => spec === b || spec.includes(b))) {
        violations.push(
          `[RT-2 Violation] Class A module ${rel} imports Class B module/package "${spec}".`
        );
      }
      if (spec.startsWith('@vercel/') || spec.includes('/adapters/vercel')) {
        violations.push(
          `[RT-2 Violation] Class A module ${rel} imports Vercel-specific module "${spec}".`
        );
      }
    }
  }

  // Rule 2: No @vercel/* imports outside /src/server/adapters/vercel/** and /api/**
  const allSrcFiles = collectTsFiles(SRC_DIR);
  for (const file of allSrcFiles) {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    if (rel.startsWith('src/server/adapters/vercel/')) continue;

    const code = fs.readFileSync(file, 'utf8');
    const specifiers = extractImportSpecifiers(code);
    for (const spec of specifiers) {
      if (spec.startsWith('@vercel/')) {
        violations.push(
          `[RT-2 Violation] Non-adapter module ${rel} imports "${spec}" outside src/server/adapters/vercel/**.`
        );
      }
    }
  }

  return {
    checkedClassACount: classAFiles.length,
    checkedSrcCount: allSrcFiles.length,
    violations,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = lintRuntimeBoundaries();
  if (result.violations.length > 0) {
    console.error('[lint:boundaries] FAILED with violations:');
    for (const v of result.violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }
  console.log(
    `[lint:boundaries] PASSED (${result.checkedClassACount} Class A modules, ${result.checkedSrcCount} total src files verified; 0 boundary violations).`
  );
}
