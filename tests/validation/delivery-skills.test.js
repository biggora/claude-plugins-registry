import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { findSkillDirs, parseFrontmatter } from '../../src/commands/skills/add.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SKILLS_SRC = join(ROOT, 'src', 'skills');

const DELIVERY_SKILLS = Object.freeze([
  { name: 'define-done', category: 'workflow', references: ['spec-template.md'] },
  { name: 'slice-vertical', category: 'workflow', references: ['slice-examples.md'] },
  {
    name: 'tdd-red-green',
    category: 'testing',
    references: ['tdd-handoff-and-checkpoints.md'],
  },
  { name: 'keep-goal', category: 'workflow', references: ['state-templates.md'] },
  {
    name: 'verify-before-done',
    category: 'testing',
    references: ['readiness-matrix.md'],
  },
  {
    name: 'delegate-bounded-work',
    category: 'workflow',
    references: ['delegation-and-review-briefs.md'],
  },
  {
    name: 'harden-agent-loop',
    category: 'code-quality',
    references: ['quality-gates.md', 'trace-to-eval.md'],
  },
]);

const registry = JSON.parse(
  readFileSync(join(ROOT, 'registry', 'registry.json'), 'utf-8')
);
const readme = readFileSync(join(ROOT, 'README.md'), 'utf-8');
const forbiddenDirectories = ['commands', 'agents', 'scripts', 'assets', 'evals'];
const EXPECTED_AUTHOR = Object.freeze({
  name: 'biggora',
  url: 'https://github.com/biggora',
});
const EXPECTED_REPOSITORY = 'https://github.com/biggora/claude-plugins-registry';
const EXPECTED_LICENSE = 'MIT';

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function markdownLinkTargets(content) {
  return [...content.matchAll(/\[[^\]]*\]\(([^)\r\n]+)\)/g)].map((match) => {
    const rawTarget = match[1].trim();
    const angleTarget = rawTarget.match(/^<([^>]+)>/);
    return angleTarget ? angleTarget[1] : rawTarget.split(/\s+/)[0];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('delivery skills contract', () => {
  for (const skill of DELIVERY_SKILLS) {
    describe(`skill: ${skill.name}`, () => {
      const skillDir = join(SKILLS_SRC, skill.name);
      const skillMdPath = join(skillDir, 'SKILL.md');
      const referencesDir = join(skillDir, 'references');

      it('has the required package structure and no generated component directories', () => {
        assert.ok(existsSync(skillDir), `Missing skill directory: ${skill.name}`);
        assert.ok(existsSync(skillMdPath), `Missing SKILL.md for ${skill.name}`);

        const topLevel = readdirSync(skillDir).sort();
        assert.deepEqual(
          topLevel,
          ['SKILL.md', 'references'],
          `${skill.name} may contain only SKILL.md and references/`
        );

        for (const directory of forbiddenDirectories) {
          assert.ok(
            !existsSync(join(skillDir, directory)),
            `${skill.name} must not contain ${directory}/`
          );
        }
      });

      it('has exactly the supported frontmatter with a one-line description', () => {
        const content = readFileSync(skillMdPath, 'utf-8');
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
        assert.ok(match, `${skill.name} must start with YAML frontmatter`);

        const frontmatter = parseFrontmatter(content);
        assert.deepEqual(
          Object.keys(frontmatter).sort(),
          ['description', 'name'],
          `${skill.name} frontmatter may contain only name and description`
        );
        assert.equal(frontmatter.name, skill.name, `${skill.name} frontmatter name mismatch`);

        const headerLines = match[1]
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0);
        assert.equal(
          headerLines.length,
          2,
          `${skill.name} frontmatter values must each be on one line`
        );
        assert.ok(
          headerLines.every((line) => /^(?:name|description):\s*\S.*$/.test(line)),
          `${skill.name} frontmatter must use one-line name and description scalars`
        );

        const description = frontmatter.description?.trim() ?? '';
        assert.ok(description, `${skill.name} description must not be empty`);
        assert.doesNotMatch(
          description,
          /^[>|]/,
          `${skill.name} description must not use a folded or literal block scalar`
        );
      });

      it('contains its nonempty references and only valid in-skill relative links', () => {
        assert.ok(existsSync(referencesDir), `${skill.name} is missing references/`);
        for (const reference of skill.references) {
          const referencePath = join(referencesDir, reference);
          assert.ok(existsSync(referencePath), `${skill.name} is missing references/${reference}`);
          assert.ok(
            statSync(referencePath).isFile(),
            `${skill.name} references/${reference} must be a file`
          );
          assert.ok(
            readFileSync(referencePath, 'utf-8').trim().length > 0,
            `${skill.name} references/${reference} must not be empty`
          );
        }

        const content = readFileSync(skillMdPath, 'utf-8');
        for (const rawTarget of markdownLinkTargets(content)) {
          if (
            rawTarget.startsWith('#') ||
            rawTarget.startsWith('/') ||
            rawTarget.startsWith('\\') ||
            /^[a-z][a-z\d+.-]*:/i.test(rawTarget)
          ) {
            continue;
          }

          const pathPart = rawTarget.split(/[?#]/, 1)[0];
          if (!pathPart) continue;

          let decodedPath;
          try {
            decodedPath = decodeURIComponent(pathPart);
          } catch {
            assert.fail(`${skill.name} has an invalid encoded link target: ${rawTarget}`);
          }

          const resolvedPath = resolve(skillDir, decodedPath);
          const relativePath = relative(skillDir, resolvedPath);
          assert.ok(
            relativePath !== '..' &&
              !relativePath.startsWith(`..${sep}`) &&
              !isAbsolute(relativePath),
            `${skill.name} link escapes the skill directory: ${rawTarget}`
          );
          assert.ok(
            existsSync(resolvedPath),
            `${skill.name} has a broken relative link: ${rawTarget}`
          );
        }
      });

      it('contains no unfinished TODO or FIXME markers', () => {
        assert.ok(existsSync(referencesDir), `${skill.name} is missing references/`);
        const authoredFiles = [skillMdPath, ...listFiles(referencesDir)];
        for (const file of authoredFiles) {
          assert.doesNotMatch(
            readFileSync(file, 'utf-8'),
            /\b(?:TODO|FIXME)\b/,
            `${skill.name} contains an unfinished marker in ${relative(skillDir, file)}`
          );
        }
      });

      it('has one complete registry entry', () => {
        const entries = registry.plugins.filter((entry) => entry.name === skill.name);
        assert.equal(entries.length, 1, `${skill.name} must have exactly one registry entry`);

        const [entry] = entries;
        assert.equal(entry.version, '1.0.0', `${skill.name} registry version must be 1.0.0`);
        assert.equal(entry.type, 'skill', `${skill.name} registry type must be skill`);
        assert.equal(entry.category, skill.category, `${skill.name} registry category mismatch`);
        assert.deepEqual(entry.commands, [], `${skill.name} registry commands must be empty`);
        assert.deepEqual(
          entry.author,
          EXPECTED_AUTHOR,
          `${skill.name} registry author mismatch`
        );
        assert.equal(
          entry.repository,
          EXPECTED_REPOSITORY,
          `${skill.name} registry repository mismatch`
        );
        assert.equal(entry.license, EXPECTED_LICENSE, `${skill.name} registry license mismatch`);
        assert.ok(
          typeof entry.description === 'string' && entry.description.trim().length > 0,
          `${skill.name} registry description must not be empty`
        );
        assert.ok(
          entry.description.length <= 200,
          `${skill.name} registry description exceeds 200 characters`
        );
        assert.ok(Array.isArray(entry.keywords), `${skill.name} registry keywords must be an array`);
        assert.ok(entry.keywords.length <= 10, `${skill.name} registry has more than 10 keywords`);
      });

      it('appears exactly once in the README table and install examples', () => {
        const namePattern = escapeRegExp(skill.name);
        const tableRows = readme
          .split(/\r?\n/)
          .filter((line) => new RegExp(`^\\|\\s*\`${namePattern}\`\\s*\\|`).test(line));
        assert.equal(tableRows.length, 1, `${skill.name} must have exactly one README table row`);

        const installCommand =
          `npx skills add https://github.com/biggora/claude-plugins-registry --skill ${skill.name}`;
        const installExamples = readme
          .split(/\r?\n/)
          .filter((line) => line.trim() === installCommand);
        assert.equal(
          installExamples.length,
          1,
          `${skill.name} must have exactly one README install example`
        );
      });
    });
  }

  it('findSkillDirs discovers every delivery skill from the repository root', () => {
    const discovered = new Set(findSkillDirs(ROOT).map((directory) => basename(directory)));
    for (const skill of DELIVERY_SKILLS) {
      assert.ok(discovered.has(skill.name), `findSkillDirs(ROOT) did not discover ${skill.name}`);
    }
  });
});
