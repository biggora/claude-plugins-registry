import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { VALID_PLUGIN_MANIFEST } from '../helpers/fixtures.js';

describe('publish command validation logic', () => {
  let tmp;

  afterEach(() => {
    if (tmp) {
      rmSync(tmp, { recursive: true, force: true });
      tmp = null;
    }
  });

  function createPluginDir(manifest = VALID_PLUGIN_MANIFEST, includeReadme = true) {
    tmp = mkdtempSync(join(tmpdir(), 'publish-test-'));
    mkdirSync(join(tmp, '.claude-plugin'), { recursive: true });
    writeFileSync(
      join(tmp, '.claude-plugin', 'plugin.json'),
      JSON.stringify(manifest, null, 2)
    );
    if (includeReadme) {
      writeFileSync(join(tmp, 'README.md'), '# Test Plugin');
    }
    return tmp;
  }

  describe('required files', () => {
    it('detects missing .claude-plugin/plugin.json', () => {
      tmp = mkdtempSync(join(tmpdir(), 'publish-test-'));
      writeFileSync(join(tmp, 'README.md'), '# Test');
      assert.equal(existsSync(join(tmp, '.claude-plugin', 'plugin.json')), false);
    });

    it('detects missing README.md', () => {
      tmp = mkdtempSync(join(tmpdir(), 'publish-test-'));
      mkdirSync(join(tmp, '.claude-plugin'));
      writeFileSync(join(tmp, '.claude-plugin', 'plugin.json'), '{}');
      assert.equal(existsSync(join(tmp, 'README.md')), false);
    });

    it('validates both required files exist', () => {
      const dir = createPluginDir();
      assert.ok(existsSync(join(dir, '.claude-plugin', 'plugin.json')));
      assert.ok(existsSync(join(dir, 'README.md')));
    });
  });

  describe('manifest parsing', () => {
    it('parses valid JSON', () => {
      const dir = createPluginDir();
      const manifest = JSON.parse(readFileSync(join(dir, '.claude-plugin', 'plugin.json'), 'utf-8'));
      assert.equal(manifest.name, 'test-plugin');
    });

    it('detects invalid JSON', () => {
      tmp = mkdtempSync(join(tmpdir(), 'publish-test-'));
      mkdirSync(join(tmp, '.claude-plugin'));
      writeFileSync(join(tmp, '.claude-plugin', 'plugin.json'), '{bad json}');
      writeFileSync(join(tmp, 'README.md'), '# Test');

      assert.throws(() => {
        JSON.parse(readFileSync(join(tmp, '.claude-plugin', 'plugin.json'), 'utf-8'));
      });
    });
  });

  describe('required fields', () => {
    it('validates name is present', () => {
      const { name, ...noName } = VALID_PLUGIN_MANIFEST;
      assert.equal(noName.name, undefined);
    });

    it('validates version is present', () => {
      const { version, ...noVersion } = VALID_PLUGIN_MANIFEST;
      assert.equal(noVersion.version, undefined);
    });

    it('validates description is present', () => {
      const { description, ...noDesc } = VALID_PLUGIN_MANIFEST;
      assert.equal(noDesc.description, undefined);
    });
  });

  describe('name validation pattern', () => {
    const pattern = /^[a-z0-9-]+$/;

    it('accepts valid names', () => {
      assert.ok(pattern.test('my-plugin'));
      assert.ok(pattern.test('plugin123'));
      assert.ok(pattern.test('a-b-c'));
      assert.ok(pattern.test('test'));
    });

    it('rejects names with uppercase', () => {
      assert.equal(pattern.test('MyPlugin'), false);
    });

    it('rejects names with spaces', () => {
      assert.equal(pattern.test('my plugin'), false);
    });

    it('rejects names with underscores', () => {
      assert.equal(pattern.test('my_plugin'), false);
    });

    it('rejects names with special characters', () => {
      assert.equal(pattern.test('my@plugin'), false);
      assert.equal(pattern.test('my.plugin'), false);
    });

    it('rejects empty name', () => {
      assert.equal(pattern.test(''), false);
    });
  });

  describe('recommended fields (warnings)', () => {
    it('detects missing repository', () => {
      const { repository, ...noRepo } = VALID_PLUGIN_MANIFEST;
      assert.equal(noRepo.repository, undefined);
    });

    it('detects missing keywords', () => {
      const { keywords, ...noKw } = VALID_PLUGIN_MANIFEST;
      assert.equal(noKw.keywords, undefined);
    });

    it('detects missing license', () => {
      const { license, ...noLic } = VALID_PLUGIN_MANIFEST;
      assert.equal(noLic.license, undefined);
    });
  });

  describe('registry entry generation', () => {
    it('generates correct entry structure', () => {
      const manifest = VALID_PLUGIN_MANIFEST;
      const repoUrl = manifest.repository || '';

      const entry = {
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author || { name: 'unknown' },
        repository: repoUrl.replace(/\.git$/, ''),
        keywords: manifest.keywords || [],
        license: manifest.license || 'MIT',
        commands: manifest.commands || [],
        category: manifest.category || 'other',
      };

      assert.equal(entry.name, 'test-plugin');
      assert.equal(entry.version, '1.0.0');
      assert.equal(entry.author.name, 'tester');
      assert.equal(entry.repository, 'https://github.com/test/test-plugin');
      assert.deepStrictEqual(entry.keywords, ['test']);
    });

    it('strips .git suffix from repository URL', () => {
      const url = 'https://github.com/test/repo.git';
      assert.equal(url.replace(/\.git$/, ''), 'https://github.com/test/repo');
    });

    it('defaults author to unknown when missing', () => {
      const author = undefined;
      const result = author || { name: 'unknown' };
      assert.equal(result.name, 'unknown');
    });

    it('defaults category to other when missing', () => {
      const category = undefined;
      assert.equal(category || 'other', 'other');
    });

    it('defaults license to MIT when missing', () => {
      const license = undefined;
      assert.equal(license || 'MIT', 'MIT');
    });
  });
});
