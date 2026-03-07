import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { searchPlugins, findPlugin } from '../../src/registry.js';
import { MOCK_REGISTRY } from '../helpers/fixtures.js';

describe('searchPlugins', () => {
  it('matches by name', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'test-plugin');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'test-plugin');
  });

  it('matches by description substring', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'optimizes');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'code-optimizer');
  });

  it('matches by keyword', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'refactoring');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'code-optimizer');
  });

  it('matches by author name', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'biggora');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'code-optimizer');
  });

  it('is case-insensitive', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'TEST-PLUGIN');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'test-plugin');
  });

  it('returns empty array for no match', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'nonexistent-xyz');
    assert.equal(results.length, 0);
  });

  it('handles plugins with no keywords', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'no-extras');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'no-extras');
  });

  it('handles plugins with no author', () => {
    const registry = {
      plugins: [{ name: 'orphan', description: 'no author', repository: 'x' }],
    };
    const results = searchPlugins(registry, 'orphan');
    assert.equal(results.length, 1);
  });

  it('empty query matches all plugins', () => {
    const results = searchPlugins(MOCK_REGISTRY, '');
    assert.equal(results.length, MOCK_REGISTRY.plugins.length);
  });
});

describe('findPlugin', () => {
  it('finds plugin by exact name', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'test-plugin');
    assert.ok(plugin);
    assert.equal(plugin.name, 'test-plugin');
  });

  it('is case-insensitive', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'Code-Optimizer');
    assert.ok(plugin);
    assert.equal(plugin.name, 'code-optimizer');
  });

  it('returns undefined for not found', () => {
    const plugin = findPlugin(MOCK_REGISTRY, 'no-such-plugin');
    assert.equal(plugin, undefined);
  });
});
