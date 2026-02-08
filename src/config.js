import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const home = homedir();
const isWindows = process.platform === 'win32';

export const PLUGINS_DIR = join(home, '.claude', 'plugins');
export const CACHE_DIR = join(home, '.claude', '.cache', 'claude-plugins');
export const CACHE_TTL = 1000 * 60 * 15; // 15 minutes
export const REGISTRY_URL =
  'https://raw.githubusercontent.com/biggora/claude-plugins-registry/main/registry/registry.json';

export function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getPluginsDir() {
  return ensureDir(PLUGINS_DIR);
}

export function getCacheDir() {
  return ensureDir(CACHE_DIR);
}
