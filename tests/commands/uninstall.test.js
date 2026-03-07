import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('uninstall command logic', () => {
  it('rmSync with recursive and force removes directory', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'uninstall-test-'));
    const pluginDir = join(tmp, 'test-plugin');
    mkdirSync(pluginDir);
    assert.ok(existsSync(pluginDir));

    rmSync(pluginDir, { recursive: true, force: true });
    assert.ok(!existsSync(pluginDir));

    rmSync(tmp, { recursive: true, force: true });
  });

  it('rmSync with force does not throw for non-existent path', () => {
    assert.doesNotThrow(() => {
      rmSync(join(tmpdir(), 'nonexistent-' + Date.now()), { recursive: true, force: true });
    });
  });

  it('existsSync returns false for non-existent plugin', () => {
    assert.equal(existsSync(join(tmpdir(), 'no-such-plugin-' + Date.now())), false);
  });
});
