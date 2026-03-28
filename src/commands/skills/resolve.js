import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getSkillsDir, getPluginsDir } from '../../config.js';
import { parseFrontmatter } from './add.js';

/**
 * Plugin component directories that Claude Code auto-discovers.
 * When a skill repo contains any of these, it must be installed
 * as a plugin so Claude Code can find them.
 */
export const PLUGIN_COMPONENT_DIRS = ['commands', 'hooks', 'agents'];

/**
 * Check if a directory contains plugin components (commands, hooks, agents)
 * beyond just SKILL.md + references.
 */
export function hasPluginComponents(dir) {
  return PLUGIN_COMPONENT_DIRS.some((name) => {
    const p = join(dir, name);
    return existsSync(p);
  });
}

/**
 * Detect which plugin components exist in a directory.
 * Returns an array of found component names.
 */
export function detectComponents(dir) {
  const found = [];
  if (existsSync(join(dir, 'SKILL.md'))) found.push('skill');
  for (const name of PLUGIN_COMPONENT_DIRS) {
    if (existsSync(join(dir, name))) found.push(name);
  }
  return found;
}

/**
 * Read .origin.json from a skill/plugin directory.
 */
export function readOrigin(dir) {
  const originPath = join(dir, '.origin.json');
  if (!existsSync(originPath)) return null;
  try {
    return JSON.parse(readFileSync(originPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Read skill metadata from a directory (SKILL.md frontmatter + .origin.json).
 */
export function readSkillMeta(dir, dirName) {
  const skillMdPath = join(dir, 'SKILL.md');
  const meta = { name: dirName, description: '', repository: '-' };

  if (existsSync(skillMdPath)) {
    try {
      const fm = parseFrontmatter(readFileSync(skillMdPath, 'utf-8'));
      meta.name = fm.name || dirName;
      meta.description = fm.description || '';
    } catch {
      // ignore
    }
  }

  const origin = readOrigin(dir);
  if (origin) {
    meta.repository = origin.repository || '-';
    meta.installedAs = origin.installedAs || 'skill';
    meta.skill = origin.skill || null;
  }

  return meta;
}

/**
 * Find a skill by name across both ~/.claude/skills/ and ~/.claude/plugins/.
 * Returns { dir, location } or null.
 */
export function findInstalledSkill(name) {
  const skillsDir = getSkillsDir();
  const pluginsDir = getPluginsDir();

  // Check ~/.claude/skills/ first
  const skillPath = join(skillsDir, name);
  if (existsSync(skillPath) && existsSync(join(skillPath, 'SKILL.md'))) {
    return { dir: skillPath, location: 'skills' };
  }

  // Check ~/.claude/plugins/ for skills installed as plugins
  const pluginPath = join(pluginsDir, name);
  if (existsSync(pluginPath)) {
    const origin = readOrigin(pluginPath);
    if (origin && origin.installedAs === 'plugin-skill') {
      return { dir: pluginPath, location: 'plugins' };
    }
    // Also check if it has a SKILL.md (might be installed via skills add)
    if (existsSync(join(pluginPath, 'SKILL.md'))) {
      return { dir: pluginPath, location: 'plugins' };
    }
  }

  return null;
}

/**
 * List all installed skills from both directories.
 * Returns array of { name, dir, location, meta }.
 */
export function listAllSkills() {
  const skillsDir = getSkillsDir();
  const pluginsDir = getPluginsDir();
  const results = [];

  // Skills from ~/.claude/skills/
  try {
    const entries = readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = join(skillsDir, entry.name);
      if (!existsSync(join(dir, 'SKILL.md'))) continue;
      results.push({
        name: entry.name,
        dir,
        location: 'skills',
        meta: readSkillMeta(dir, entry.name),
      });
    }
  } catch {
    // directory might not exist yet
  }

  // Skills from ~/.claude/plugins/ (installed as plugin-skill)
  try {
    const entries = readdirSync(pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = join(pluginsDir, entry.name);
      const origin = readOrigin(dir);
      if (origin && origin.installedAs === 'plugin-skill') {
        results.push({
          name: entry.name,
          dir,
          location: 'plugins',
          meta: readSkillMeta(dir, entry.name),
        });
      }
    }
  } catch {
    // directory might not exist yet
  }

  return results;
}
