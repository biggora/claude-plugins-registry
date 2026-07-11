import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = join(ROOT, '.claude-plugin', 'plugin.json');
const registry = JSON.parse(readFileSync(join(ROOT, 'registry', 'registry.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const design = readFileSync(
  join(ROOT, 'docs', 'plans', '2026-07-10-project-delivery-orchestrator-design.md'),
  'utf8'
);
const STRICT_WARNING = 'root: CLAUDE.md at the plugin root is not loaded as project context';
const STRICT_POLICY =
  `Standard validation must pass. Strict exit 1 is accepted only for exactly one warning: \`${STRICT_WARNING}\`; any additional strict diagnostic is blocking.`;

const SKILLS = [
  'define-done',
  'slice-vertical',
  'tdd-red-green',
  'keep-goal',
  'verify-before-done',
  'delegate-bounded-work',
  'harden-agent-loop',
];
const AGENTS = [
  'project-delivery-orchestrator',
  'repository-analyst',
  'acceptance-test-author',
  'slice-implementer',
  'fresh-context-reviewer',
];
const AGENT_PATHS = AGENTS.map((name) => `./agents/${name}.md`);
const SPECIALIST_SKILLS = {
  'repository-analyst': ['keep-goal'],
  'acceptance-test-author': ['define-done', 'tdd-red-green'],
  'slice-implementer': ['tdd-red-green', 'keep-goal'],
  'fresh-context-reviewer': ['verify-before-done', 'delegate-bounded-work'],
};

function agent(name) {
  return readFileSync(join(ROOT, 'agents', `${name}.md`), 'utf8');
}

function frontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, 'agent must start with YAML frontmatter');
  return match[1];
}

describe('project delivery orchestrator plugin', () => {
  it('declares resolvable root plugin components and all agent files', () => {
    assert.ok(existsSync(manifestPath), 'missing .claude-plugin/plugin.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.name, 'project-delivery-orchestrator');
    assert.equal(manifest.version, pkg.version);
    assert.equal(manifest.skills, './src/skills/');
    assert.deepEqual(manifest.agents, AGENT_PATHS);
    assert.ok(existsSync(resolve(ROOT, manifest.skills)));
    for (const path of manifest.agents) assert.ok(existsSync(resolve(ROOT, path)));
  });

  it('binds the orchestrator to exactly seven skills and four specialists', () => {
    const content = agent('project-delivery-orchestrator');
    const fm = frontmatter(content);
    const skillBlock = fm.match(/skills:\s*\r?\n((?:\s+- [^\r\n]+\r?\n?)+)/)?.[1] ?? '';
    const declared = [...skillBlock.matchAll(/^\s+-\s+([^\s]+)\s*$/gm)].map((m) => m[1]);
    assert.deepEqual(declared, SKILLS);
    assert.match(
      fm,
      /Agent\(repository-analyst, acceptance-test-author, slice-implementer, fresh-context-reviewer\)/
    );
    for (const skill of SKILLS) assert.match(content, new RegExp(`\\b${skill}\\b`));
  });

  it('contains the complete evidence-driven lifecycle and orchestration contract', () => {
    const content = agent('project-delivery-orchestrator');
    for (const phase of ['BOOTSTRAP', 'SPEC', 'PLAN', 'IMPLEMENT', 'REVIEW', 'VERIFY', 'HANDOFF']) {
      assert.match(content, new RegExp(`\\b${phase}\\b`));
    }
    for (const field of ['Role', 'Context', 'Task', 'Constraints', 'Input', 'Expected Output', 'Examples', 'Stop condition']) {
      assert.match(content, new RegExp(field, 'i'));
    }
    for (const field of ['artifact', 'summary', 'evidence', 'assumptions', 'limitations']) {
      assert.match(content, new RegExp(field, 'i'));
    }
    for (const value of ['PASS', 'FAIL', 'PARTIAL', 'Implemented', 'No change required', 'Blocked']) {
      assert.match(content, new RegExp(value, 'i'));
    }
    assert.match(content, /exactly one.*Active/i);
    assert.match(content, /one.*writer|single.*writer/i);
    assert.match(content, /three identical failures/i);
    assert.match(content, /main Claude session/i);
    assert.match(content, /nested subagent/i);
  });

  it('enforces independent review and safety boundaries', () => {
    const content = agent('project-delivery-orchestrator');
    assert.match(content, /artifact.*diff.*approved.*criteria.*commands.*environment/is);
    for (const forbidden of ['implementation history', 'suspected defects', 'expected fix', 'prior conclusions']) {
      assert.match(content, new RegExp(forbidden, 'i'));
    }
    for (const boundary of ['ALWAYS', 'ASK', 'NEVER']) assert.match(content, new RegExp(`## ${boundary}`));
    assert.match(content, /git reset --hard/);
    assert.match(content, /never.*(?:weaken|delete|skip|rewrite).*test/is);
    assert.match(content, /commit.*push.*pull request.*publish.*deploy/is);
  });

  it('gives specialists narrow supported frontmatter and authority', () => {
    for (const name of AGENTS.slice(1)) {
      const content = agent(name);
      const fm = frontmatter(content);
      assert.match(fm, new RegExp(`^name: ${name}$`, 'm'));
      const skillBlock = fm.match(/skills:\s*\r?\n((?:\s+- [^\r\n]+\r?\n?)+)/)?.[1] ?? '';
      const declared = [...skillBlock.matchAll(/^\s+-\s+([^\s]+)\s*$/gm)].map((m) => m[1]);
      assert.deepEqual(declared, SPECIALIST_SKILLS[name]);
      assert.doesNotMatch(fm, /^hooks:|^mcpServers:|^isolation:/m);
    }
    for (const name of ['repository-analyst', 'fresh-context-reviewer']) {
      const content = agent(name);
      assert.match(frontmatter(content), /^tools: Read, Grep, Glob, Bash$/m);
      assert.match(content, /read-only/i);
      assert.match(content, /must not (?:edit|write|modify)/i);
    }
    for (const name of ['acceptance-test-author', 'slice-implementer']) {
      const content = agent(name);
      assert.match(frontmatter(content), /^tools: Read, Grep, Glob, Bash, Write, Edit$/m);
      assert.match(content, /allowed paths/i);
      assert.match(content, /must not.*outside/i);
    }
  });

  it('documents and registers the combined plugin exactly once', () => {
    assert.equal((readme.match(/^### Project Delivery Orchestrator$/gm) ?? []).length, 1);
    assert.match(readme, /claude --agent project-delivery-orchestrator/);
    const entries = registry.plugins.filter((item) => item.name === 'project-delivery-orchestrator');
    assert.equal(entries.length, 1);
    assert.equal(entries[0].version, pkg.version);
    assert.equal(entries[0].type, 'plugin');
    assert.equal(entries[0].repository, 'https://github.com/biggora/claude-plugins-registry');
  });

  it('documents the only accepted strict-validator diagnostic', () => {
    assert.ok(readme.includes(STRICT_POLICY));
    assert.ok(design.includes(STRICT_POLICY));
  });
});
