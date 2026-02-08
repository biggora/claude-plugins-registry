import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCacheDir, CACHE_TTL, REGISTRY_URL } from './config.js';
import { log } from './utils.js';

const CACHE_FILE = 'registry.json';

function getCachePath() {
  return join(getCacheDir(), CACHE_FILE);
}

function isCacheValid() {
  const cachePath = getCachePath();
  if (!existsSync(cachePath)) return false;
  const stat = statSync(cachePath);
  return Date.now() - stat.mtimeMs < CACHE_TTL;
}

export async function fetchRegistry({ force = false } = {}) {
  const cachePath = getCachePath();

  if (!force && isCacheValid()) {
    try {
      return JSON.parse(readFileSync(cachePath, 'utf-8'));
    } catch {
      // Cache corrupted, refetch
    }
  }

  const res = await fetch(REGISTRY_URL);
  if (!res.ok) {
    // Fall back to cache if available
    if (existsSync(cachePath)) {
      log.warn('Could not fetch registry, using cached version');
      return JSON.parse(readFileSync(cachePath, 'utf-8'));
    }
    // Fall back to bundled registry
    const bundledPath = new URL('../registry/registry.json', import.meta.url);
    log.warn('Could not fetch registry, using bundled version');
    return JSON.parse(readFileSync(bundledPath, 'utf-8'));
  }

  const data = await res.json();
  writeFileSync(cachePath, JSON.stringify(data, null, 2));
  return data;
}

export function searchPlugins(registry, query) {
  const q = query.toLowerCase();
  return registry.plugins.filter((p) => {
    const haystack = [
      p.name,
      p.description,
      ...(p.keywords || []),
      p.author?.name || '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function findPlugin(registry, name) {
  return registry.plugins.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}
