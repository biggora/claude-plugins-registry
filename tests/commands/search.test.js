import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_REGISTRY } from '../helpers/fixtures.js';

// We need to mock modules before importing the search command
// Since mock.module() requires careful ordering, we test via CLI integration
// For pure unit tests, we test the underlying functions directly

import { searchPlugins } from '../../src/registry.js';

describe('search command logic', () => {
  let logSpy, errorSpy;

  beforeEach(() => {
    logSpy = mock.method(console, 'log', () => {});
    errorSpy = mock.method(console, 'error', () => {});
  });

  afterEach(() => {
    logSpy.mock.restore();
    errorSpy.mock.restore();
  });

  it('lists all plugins when no query given', () => {
    const results = searchPlugins(MOCK_REGISTRY, '');
    assert.equal(results.length, MOCK_REGISTRY.plugins.length);
  });

  it('filters results with query', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'test');
    assert.ok(results.length > 0);
    assert.ok(results.length < MOCK_REGISTRY.plugins.length);
  });

  it('returns empty for no match', () => {
    const results = searchPlugins(MOCK_REGISTRY, 'zzz-nonexistent');
    assert.equal(results.length, 0);
  });

  it('search is case-insensitive', () => {
    const r1 = searchPlugins(MOCK_REGISTRY, 'TEST');
    const r2 = searchPlugins(MOCK_REGISTRY, 'test');
    assert.equal(r1.length, r2.length);
  });
});
