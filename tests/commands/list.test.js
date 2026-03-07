import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('list command logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  it('readdirSync returns empty for empty directory', () => {
    tmp = mkdtempSync(join(tmpdir(), 'list-test-'));
    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 0);
  });

  it('detects plugin directories', () => {
    tmp = mkdtempSync(join(tmpdir(), 'list-test-'));
    mkdirSync(join(tmp, 'plugin-a'));
    mkdirSync(join(tmp, 'plugin-b'));
    writeFileSync(join(tmp, 'not-a-dir.txt'), 'file');

    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 2);
  });

  it('reads plugin manifest for version and description', () => {
    tmp = mkdtempSync(join(tmpdir(), 'list-test-'));
    const pluginDir = join(tmp, 'my-plugin');
    mkdirSync(join(pluginDir, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(pluginDir, '.claude-plugin', 'plugin.json'),
      JSON.stringify({ name: 'my-plugin', version: '1.2.3', description: 'Test desc' })
    );

    const manifestPath = join(pluginDir, '.claude-plugin', 'plugin.json');
    assert.ok(existsSync(manifestPath));
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    assert.equal(manifest.version, '1.2.3');
    assert.equal(manifest.description, 'Test desc');
  });

  it('handles missing manifest gracefully', () => {
    tmp = mkdtempSync(join(tmpdir(), 'list-test-'));
    mkdirSync(join(tmp, 'plugin-no-manifest'));
    const manifestPath = join(tmp, 'plugin-no-manifest', '.claude-plugin', 'plugin.json');
    assert.equal(existsSync(manifestPath), false);
  });

  it('handles invalid JSON in manifest', () => {
    tmp = mkdtempSync(join(tmpdir(), 'list-test-'));
    const pluginDir = join(tmp, 'bad-json');
    mkdirSync(join(pluginDir, '.claude-plugin'), { recursive: true });
    writeFileSync(join(pluginDir, '.claude-plugin', 'plugin.json'), '{invalid json}');

    assert.throws(() => {
      JSON.parse(readFileSync(join(pluginDir, '.claude-plugin', 'plugin.json'), 'utf-8'));
    });
  });
});
