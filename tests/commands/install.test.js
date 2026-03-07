import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { findPlugin } from '../../src/registry.js';
import { MOCK_REGISTRY } from '../helpers/fixtures.js';

describe('install command logic', () => {
  it('findPlugin returns plugin when found', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'test-plugin');
    assert.ok(plugin);
    assert.equal(plugin.name, 'test-plugin');
    assert.equal(plugin.repository, 'https://github.com/test/test-plugin');
  });

  it('findPlugin returns undefined when not found', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'nonexistent');
    assert.equal(plugin, undefined);
  });

  it('plugin repository URL is used for git clone', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'test-plugin');
    const gitUrl = `${plugin.repository}.git`;
    assert.equal(gitUrl, 'https://github.com/test/test-plugin.git');
  });

  it('plugin has commands array for post-install display', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'test-plugin');
    assert.ok(Array.isArray(plugin.commands));
    assert.equal(plugin.commands.length, 1);
    assert.equal(plugin.commands[0], '/test');
  });

  it('plugin without commands has empty or undefined commands', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'no-extras');
    assert.ok(!plugin.commands || plugin.commands.length === 0);
  });
});
