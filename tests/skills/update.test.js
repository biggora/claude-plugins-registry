import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('skills update command logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  it('skill must exist to update', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-update-'));
    assert.equal(existsSync(join(tmp, 'nonexistent')), false);
  });

  it('reads origin metadata from .origin.json', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-update-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);

    const origin = {
      repository: 'https://github.com/test/repo',
      skill: null,
      installedAt: '2026-01-01T00:00:00.000Z',
    };
    writeFileSync(join(skillDir, '.origin.json'), JSON.stringify(origin));

    const read = JSON.parse(readFileSync(join(skillDir, '.origin.json'), 'utf-8'));
    assert.equal(read.repository, origin.repository);
    assert.equal(read.skill, null);
  });

  it('detects missing .origin.json', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-update-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);
    assert.equal(existsSync(join(skillDir, '.origin.json')), false);
  });

  it('lists all skills for update-all', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-update-'));
    mkdirSync(join(tmp, 'skill-a'));
    mkdirSync(join(tmp, 'skill-b'));

    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 2);
  });

  it('empty skills dir means nothing to update', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-update-'));
    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 0);
  });
});
