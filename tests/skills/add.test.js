import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseFrontmatter, findSkillDirs } from '../../src/commands/skills/add.js';

describe('parseFrontmatter', () => {
  it('parses valid frontmatter', () => {
    const content = '---\nname: test\ndescription: desc\n---\n# Body';
    const fm = parseFrontmatter(content);
    assert.equal(fm.name, 'test');
    assert.equal(fm.description, 'desc');
  });

  it('returns empty object for no frontmatter', () => {
    const fm = parseFrontmatter('# Just markdown');
    assert.deepStrictEqual(fm, {});
  });

  it('handles Windows line endings', () => {
    const content = '---\r\nname: test\r\ndescription: value\r\n---\r\n# Body';
    const fm = parseFrontmatter(content);
    assert.equal(fm.name, 'test');
    assert.equal(fm.description, 'value');
  });

  it('handles key with empty value', () => {
    const fm = parseFrontmatter('---\nname:\n---');
    assert.equal(fm.name, '');
  });

  it('handles colon in value', () => {
    const fm = parseFrontmatter('---\nurl: https://example.com\n---');
    assert.equal(fm.url, 'https://example.com');
  });

  it('returns empty object for empty content', () => {
    const fm = parseFrontmatter('');
    assert.deepStrictEqual(fm, {});
  });

  it('parses multi-line YAML > as first line only', () => {
    // Current parser only captures first line of multi-line values
    const content = '---\nname: test\ndescription: >\n---\n# Body';
    const fm = parseFrontmatter(content);
    assert.equal(fm.name, 'test');
    assert.equal(fm.description, '>');
  });

  it('handles multiple fields', () => {
    const content = '---\nname: my-skill\nversion: 1.0.0\nauthor: joe\n---\n';
    const fm = parseFrontmatter(content);
    assert.equal(fm.name, 'my-skill');
    assert.equal(fm.version, '1.0.0');
    assert.equal(fm.author, 'joe');
  });
});

describe('findSkillDirs', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  function makeTmp() {
    tmpDir = mkdtempSync(join(tmpdir(), 'skill-test-'));
    return tmpDir;
  }

  it('finds SKILL.md at root', () => {
    const dir = makeTmp();
    writeFileSync(join(dir, 'SKILL.md'), '# Skill');
    const results = findSkillDirs(dir);
    assert.equal(results.length, 1);
    assert.equal(results[0], dir);
  });

  it('finds SKILL.md in subdirectory', () => {
    const dir = makeTmp();
    const sub = join(dir, 'my-skill');
    mkdirSync(sub);
    writeFileSync(join(sub, 'SKILL.md'), '# Skill');
    const results = findSkillDirs(dir);
    assert.equal(results.length, 1);
    assert.equal(results[0], sub);
  });

  it('finds multiple SKILL.md files', () => {
    const dir = makeTmp();
    const s1 = join(dir, 'skill-a');
    const s2 = join(dir, 'skill-b');
    mkdirSync(s1);
    mkdirSync(s2);
    writeFileSync(join(s1, 'SKILL.md'), '# A');
    writeFileSync(join(s2, 'SKILL.md'), '# B');
    const results = findSkillDirs(dir);
    assert.equal(results.length, 2);
  });

  it('skips .git directories', () => {
    const dir = makeTmp();
    const gitDir = join(dir, '.git');
    mkdirSync(gitDir);
    writeFileSync(join(gitDir, 'SKILL.md'), '# Should be skipped');
    const results = findSkillDirs(dir);
    assert.equal(results.length, 0);
  });

  it('skips node_modules', () => {
    const dir = makeTmp();
    const nm = join(dir, 'node_modules');
    mkdirSync(nm);
    writeFileSync(join(nm, 'SKILL.md'), '# Ignored');
    const results = findSkillDirs(dir);
    assert.equal(results.length, 0);
  });

  it('respects maxDepth', () => {
    const dir = makeTmp();
    // Create deep: dir/a/b/c/d/SKILL.md (depth 4)
    const deep = join(dir, 'a', 'b', 'c', 'd');
    mkdirSync(deep, { recursive: true });
    writeFileSync(join(deep, 'SKILL.md'), '# Deep');
    const results = findSkillDirs(dir, 0, 3);
    assert.equal(results.length, 0);
  });

  it('returns empty array for empty directory', () => {
    const dir = makeTmp();
    const results = findSkillDirs(dir);
    assert.equal(results.length, 0);
  });
});
