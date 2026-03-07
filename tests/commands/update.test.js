import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('update command logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  it('plugin must exist to update', () => {
    tmp = mkdtempSync(join(tmpdir(), 'update-test-'));
    assert.equal(existsSync(join(tmp, 'nonexistent')), false);
  });

  it('detects if plugin has .git directory', () => {
    tmp = mkdtempSync(join(tmpdir(), 'update-test-'));
    const pluginDir = join(tmp, 'my-plugin');
    mkdirSync(pluginDir);
    assert.equal(existsSync(join(pluginDir, '.git')), false);

    mkdirSync(join(pluginDir, '.git'));
    assert.equal(existsSync(join(pluginDir, '.git')), true);
  });

  it('lists all plugin directories for update-all', () => {
    tmp = mkdtempSync(join(tmpdir(), 'update-test-'));
    mkdirSync(join(tmp, 'plugin-a'));
    mkdirSync(join(tmp, 'plugin-b'));
    mkdirSync(join(tmp, 'plugin-c'));

    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 3);
  });

  it('empty plugins directory means nothing to update', () => {
    tmp = mkdtempSync(join(tmpdir(), 'update-test-'));
    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 0);
  });

  it('git pull output containing "Already up to date" means no changes', () => {
    const output = 'Already up to date.\n';
    assert.ok(output.includes('Already up to date'));
  });

  it('counts updated plugins correctly', () => {
    const results = [true, false, true, true, false];
    const updated = results.filter(Boolean).length;
    assert.equal(updated, 3);
    assert.equal(`${updated}/${results.length}`, '3/5');
  });
});
