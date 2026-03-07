import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const registryRaw = readFileSync(join(ROOT, 'registry', 'registry.json'), 'utf-8');
const registry = JSON.parse(registryRaw);
const schemaRaw = readFileSync(join(ROOT, 'registry', 'schema.json'), 'utf-8');
const schema = JSON.parse(schemaRaw);

describe('registry.json validity', () => {
  it('is valid JSON', () => {
    assert.ok(registry);
    assert.equal(typeof registry, 'object');
  });

  it('has required top-level field: version', () => {
    assert.ok(registry.version);
    assert.equal(typeof registry.version, 'string');
  });

  it('has required top-level field: plugins array', () => {
    assert.ok(Array.isArray(registry.plugins));
    assert.ok(registry.plugins.length > 0);
  });

  it('each plugin has required fields: name, version, description, repository', () => {
    for (const p of registry.plugins) {
      assert.ok(p.name, `Plugin missing name: ${JSON.stringify(p)}`);
      assert.ok(p.version, `Plugin "${p.name}" missing version`);
      assert.ok(p.description, `Plugin "${p.name}" missing description`);
      assert.ok(p.repository, `Plugin "${p.name}" missing repository`);
    }
  });

  it('all plugin names match pattern ^[a-z0-9-]+$', () => {
    const pattern = /^[a-z0-9-]+$/;
    for (const p of registry.plugins) {
      assert.ok(pattern.test(p.name), `Invalid name: "${p.name}"`);
    }
  });

  it('no duplicate plugin names', () => {
    const names = registry.plugins.map((p) => p.name);
    const unique = new Set(names);
    assert.equal(names.length, unique.size, `Duplicate names found: ${names.filter((n, i) => names.indexOf(n) !== i)}`);
  });

  it('all descriptions are under 200 characters', () => {
    for (const p of registry.plugins) {
      assert.ok(
        p.description.length <= 200,
        `Plugin "${p.name}" description is ${p.description.length} chars (max 200)`
      );
    }
  });

  it('all keywords arrays have at most 10 items', () => {
    for (const p of registry.plugins) {
      if (p.keywords) {
        assert.ok(
          p.keywords.length <= 10,
          `Plugin "${p.name}" has ${p.keywords.length} keywords (max 10)`
        );
      }
    }
  });

  it('all category values are from the allowed enum', () => {
    const allowed = ['code-quality', 'workflow', 'testing', 'documentation', 'security', 'devops', 'other'];
    for (const p of registry.plugins) {
      if (p.category) {
        assert.ok(
          allowed.includes(p.category),
          `Plugin "${p.name}" has invalid category: "${p.category}"`
        );
      }
    }
  });

  it('all type values are plugin or skill', () => {
    for (const p of registry.plugins) {
      if (p.type) {
        assert.ok(
          ['plugin', 'skill'].includes(p.type),
          `Plugin "${p.name}" has invalid type: "${p.type}"`
        );
      }
    }
  });

  it('all repository URLs start with https://', () => {
    for (const p of registry.plugins) {
      assert.ok(
        p.repository.startsWith('https://'),
        `Plugin "${p.name}" has invalid repository URL: "${p.repository}"`
      );
    }
  });

  it('all author objects have a name field', () => {
    for (const p of registry.plugins) {
      if (p.author) {
        assert.ok(p.author.name, `Plugin "${p.name}" author missing name`);
      }
    }
  });
});
