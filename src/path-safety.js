import { existsSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

const SAFE_PACKAGE_NAME = /^[a-z0-9][a-z0-9-]*$/;

export function assertSafePackageName(name, label = 'name') {
  if (typeof name !== 'string' || !SAFE_PACKAGE_NAME.test(name)) {
    throw new Error(`${label} must contain only lowercase letters, numbers, and hyphens`);
  }
  return name;
}

function isWithin(base, target) {
  const rel = relative(base, target);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`));
}

export function resolveWithin(base, child) {
  const basePath = resolve(base);
  const targetPath = resolve(basePath, child);

  if (!isWithin(basePath, targetPath)) {
    throw new Error(`Path escapes managed directory: ${child}`);
  }

  if (existsSync(basePath) && existsSync(targetPath)) {
    const realBase = realpathSync(basePath);
    const realTarget = realpathSync(targetPath);
    if (!isWithin(realBase, realTarget)) {
      throw new Error(`Path resolves outside managed directory: ${child}`);
    }
  }

  return targetPath;
}

export function resolvePackagePath(base, name, label = 'name') {
  return resolveWithin(base, assertSafePackageName(name, label));
}

export function normalizeGitUrl(repository) {
  return repository.endsWith('.git') ? repository : `${repository}.git`;
}
