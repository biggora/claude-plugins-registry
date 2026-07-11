import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertSafePackageName,
  normalizeGitUrl,
  resolvePackagePath,
  resolveWithin,
} from '../../src/path-safety.js';

describe('path safety', () => {
  it('accepts a lowercase package name', () => {
    assert.equal(assertSafePackageName('test-skill-2'), 'test-skill-2');
  });

  it('rejects traversal, separators, and absolute paths', () => {
    for (const name of ['../escape', '..\\escape', '/escape', 'C:\\escape', 'Bad-Name']) {
      assert.throws(() => assertSafePackageName(name));
    }
  });

  it('never resolves a child outside the managed base', () => {
    const base = join(tmpdir(), 'managed-root');
    assert.throws(() => resolveWithin(base, '../escape'));
    assert.equal(resolvePackagePath(base, 'safe-name'), join(base, 'safe-name'));
  });

  it('rejects an existing symlink that resolves outside the managed base', (t) => {
    const root = mkdtempSync(join(tmpdir(), 'path-safety-'));
    const base = join(root, 'managed');
    const outside = join(root, 'outside');
    const link = join(base, 'linked-skill');
    mkdirSync(base);
    mkdirSync(outside);

    try {
      symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (err) {
      rmSync(root, { recursive: true, force: true });
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        t.skip('Creating symlinks is not permitted in this environment');
        return;
      }
      throw err;
    }

    try {
      assert.throws(() => resolvePackagePath(base, 'linked-skill'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('git URL normalization', () => {
  it('adds .git exactly once', () => {
    assert.equal(normalizeGitUrl('https://example.test/repo'), 'https://example.test/repo.git');
    assert.equal(normalizeGitUrl('https://example.test/repo.git'), 'https://example.test/repo.git');
  });
});
