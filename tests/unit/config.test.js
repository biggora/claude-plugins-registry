import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { PLUGINS_DIR, SKILLS_DIR, CACHE_DIR, CACHE_TTL, REGISTRY_URL } from '../../src/config.js';

const home = homedir();

describe('config constants', () => {
  it('PLUGINS_DIR points to ~/.claude/plugins', () => {
    assert.equal(PLUGINS_DIR, join(home, '.claude', 'plugins'));
  });

  it('SKILLS_DIR points to ~/.claude/skills', () => {
    assert.equal(SKILLS_DIR, join(home, '.claude', 'skills'));
  });

  it('CACHE_DIR points to ~/.claude/.cache/claude-plugins', () => {
    assert.equal(CACHE_DIR, join(home, '.claude', '.cache', 'claude-plugins'));
  });

  it('CACHE_TTL is 15 minutes in milliseconds', () => {
    assert.equal(CACHE_TTL, 1000 * 60 * 15);
    assert.equal(CACHE_TTL, 900000);
  });

  it('REGISTRY_URL is a valid GitHub raw URL', () => {
    assert.ok(REGISTRY_URL.startsWith('https://raw.githubusercontent.com/'));
    assert.ok(REGISTRY_URL.endsWith('registry.json'));
  });
});
