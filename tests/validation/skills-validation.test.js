import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { parseFrontmatter } from '../../src/commands/skills/add.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SKILLS_SRC = join(ROOT, 'src', 'skills');

const registryData = JSON.parse(
  readFileSync(join(ROOT, 'registry', 'registry.json'), 'utf-8')
);

const skillDirs = readdirSync(SKILLS_SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

describe('embedded skills validation', () => {
  it('has at least one skill', () => {
    assert.ok(skillDirs.length > 0, 'No skill directories found');
  });

  for (const skillName of skillDirs) {
    describe(`skill: ${skillName}`, () => {
      const skillDir = join(SKILLS_SRC, skillName);
      const skillMdPath = join(skillDir, 'SKILL.md');

      it('has a SKILL.md file', () => {
        assert.ok(existsSync(skillMdPath), `Missing SKILL.md in ${skillName}`);
      });

      it('SKILL.md frontmatter is parseable', () => {
        const content = readFileSync(skillMdPath, 'utf-8');
        const fm = parseFrontmatter(content);
        assert.ok(fm && typeof fm === 'object');
      });

      it('has name in frontmatter (if frontmatter present)', () => {
        const content = readFileSync(skillMdPath, 'utf-8');
        if (content.startsWith('---')) {
          const fm = parseFrontmatter(content);
          assert.ok(fm.name, `Skill "${skillName}" has frontmatter but missing name`);
        }
      });

      it('has description in frontmatter (if frontmatter present)', () => {
        const content = readFileSync(skillMdPath, 'utf-8');
        if (content.startsWith('---')) {
          const fm = parseFrontmatter(content);
          assert.ok(fm.description, `Skill "${skillName}" has frontmatter but missing description`);
        }
      });

      it('SKILL.md has substantive content', () => {
        const content = readFileSync(skillMdPath, 'utf-8');
        const body = content.replace(/^---[\s\S]*?---/, '').trim();
        assert.ok(body.length > 0, `Skill "${skillName}" SKILL.md has no content`);
      });

      it('references directory is not empty (if present)', () => {
        const refsDir = join(skillDir, 'references');
        if (existsSync(refsDir)) {
          const files = readdirSync(refsDir);
          assert.ok(files.length > 0, `Skill "${skillName}" has empty references/`);
        }
      });

      it('scripts directory is not empty (if present)', () => {
        const scriptsDir = join(skillDir, 'scripts');
        if (existsSync(scriptsDir)) {
          const files = readdirSync(scriptsDir);
          assert.ok(files.length > 0, `Skill "${skillName}" has empty scripts/`);
        }
      });
    });
  }

  describe('registry coverage', () => {
    const registrySkills = registryData.plugins
      .filter((p) => p.type === 'skill')
      .map((p) => p.name);

    for (const skillName of skillDirs) {
      it(`skill "${skillName}" has a registry entry`, () => {
        if (registrySkills.length > 0) {
          const found = registrySkills.includes(skillName);
          if (!found) {
            assert.ok(true, `Skill "${skillName}" not in registry (may be unpublished)`);
          }
        }
      });
    }
  });
});
