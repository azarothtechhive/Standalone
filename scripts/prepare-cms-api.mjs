#!/usr/bin/env node

/**
 * Prepare API directory for CMS deployment
 * This script copies api-cms/* to api/ before the Vercel build
 * ensuring only CMS functions are deployed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.join(rootDir, 'api-cms');
const targetDir = path.join(rootDir, 'api');

console.log('Preparing CMS API deployment...');
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${targetDir}`);

// Remove existing api directory if it exists
if (fs.existsSync(targetDir)) {
  console.log('Removing existing api directory...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Create api directory
fs.mkdirSync(targetDir, { recursive: true });

// Copy api-cms/* to api/
copyDirectory(sourceDir, targetDir);

console.log('CMS API preparation complete.');

function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
