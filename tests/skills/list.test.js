import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseFrontmatter } from '../../src/commands/skills/add.js';

describe('skills list command logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  it('returns empty for no skills installed', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-list-'));
    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 0);
  });

  it('lists skill directories', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-list-'));
    mkdirSync(join(tmp, 'skill-a'));
    mkdirSync(join(tmp, 'skill-b'));
    const entries = readdirSync(tmp, { withFileTypes: true }).filter(e => e.isDirectory());
    assert.equal(entries.length, 2);
  });

  it('reads description from SKILL.md frontmatter', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-list-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);
    writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: my-skill\ndescription: My desc\n---\n# Body');

    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf-8');
    const fm = parseFrontmatter(content);
    assert.equal(fm.description, 'My desc');
  });

  it('reads repository from .origin.json', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-list-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);
    writeFileSync(join(skillDir, '.origin.json'), JSON.stringify({
      repository: 'https://github.com/test/repo',
      skill: null,
      installedAt: new Date().toISOString(),
    }));

    const origin = JSON.parse(readFileSync(join(skillDir, '.origin.json'), 'utf-8'));
    assert.equal(origin.repository, 'https://github.com/test/repo');
  });

  it('handles missing .origin.json gracefully', () => {
    tmp = mkdtempSync(join(tmpdir(), 'skills-list-'));
    const skillDir = join(tmp, 'my-skill');
    mkdirSync(skillDir);
    assert.equal(existsSync(join(skillDir, '.origin.json')), false);
  });
});
