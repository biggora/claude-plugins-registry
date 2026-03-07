import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('skills remove command logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  it('skill must exist to be removed', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-rm-'));
    assert.equal(existsSync(join(tmp, 'nonexistent')), false);
  });

  it('rmSync removes skill directory recursively', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-rm-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);
    writeFileSync(join(skillDir, 'SKILL.md'), '# Test');
    assert.ok(existsSync(skillDir));

    rmSync(skillDir, { recursive: true, force: true });
    assert.equal(existsSync(skillDir), false);
  });

  it('rmSync does not throw on nonexistent with force', () => {
    assert.doesNotThrow(() => {
      rmSync(join(tmpdir(), 'no-such-' + Date.now()), { recursive: true, force: true });
    });
  });
});
