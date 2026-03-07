import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findPlugin } from '../../src/registry.js';
import { MOCK_REGISTRY } from '../helpers/fixtures.js';

describe('info command logic', () => {
  it('returns full plugin metadata when found', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'test-plugin');
    assert.ok(plugin);
    assert.equal(plugin.name, 'test-plugin');
    assert.equal(plugin.version, '1.0.0');
    assert.equal(plugin.description, 'A test plugin for unit tests');
    assert.equal(plugin.author.name, 'tester');
    assert.equal(plugin.license, 'MIT');
    assert.equal(plugin.category, 'testing');
    assert.equal(plugin.repository, 'https://github.com/test/test-plugin');
  });

  it('returns undefined for non-existent plugin', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'does-not-exist');
    assert.equal(plugin, undefined);
  });

  it('handles plugin with missing optional fields', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'no-extras');
    assert.ok(plugin);
    assert.equal(plugin.author, undefined);
    assert.equal(plugin.license, undefined);
    assert.equal(plugin.category, undefined);
    assert.equal(plugin.keywords, undefined);
    assert.equal(plugin.commands, undefined);
  });

  it('plugin fields default correctly for display', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'no-extras');
    // Mirror how info.js handles defaults
    const author = plugin.author?.name || '-';
    const license = plugin.license || '-';
    const category = plugin.category || '-';
    const keywords = (plugin.keywords || []).join(', ') || '-';
    const commands = (plugin.commands || []).join(', ') || '-';

    assert.equal(author, '-');
    assert.equal(license, '-');
    assert.equal(category, '-');
    assert.equal(keywords, '-');
    assert.equal(commands, '-');
  });
});
