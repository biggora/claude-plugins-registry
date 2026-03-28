import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getSkillsDir } from '../../config.js';
import { parseFrontmatter } from './add.js';

/**
 * Component directories that can accompany a SKILL.md.
 */
export const COMPONENT_DIRS = ['commands', 'hooks', 'agents'];

/**
 * Detect which components exist in a directory.
 * Returns an array of found component names.
 */
export function detectComponents(dir) {
  const found = [];
  if (existsSync(join(dir, 'SKILL.md'))) found.push('skill');
  for (const name of COMPONENT_DIRS) {
    if (existsSync(join(dir, name))) found.push(name);
  }
  return found;
}

/**
 * Read .origin.json from a skill directory.
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
  const meta = { name: dirName, description: '', repository: '-', commands: [] };

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
    meta.skill = origin.skill || null;
    meta.commands = origin.installedCommands || [];
  }

  return meta;
}

/**
 * Find a skill by name in ~/.claude/skills/.
 * Returns { dir, location } or null.
 */
export function findInstalledSkill(name) {
  const skillsDir = getSkillsDir();
  const skillPath = join(skillsDir, name);

  if (existsSync(skillPath) && existsSync(join(skillPath, 'SKILL.md'))) {
    return { dir: skillPath, location: 'skills' };
  }

  return null;
}

/**
 * List all installed skills from ~/.claude/skills/.
 * Returns array of { name, dir, meta }.
 */
export function listAllSkills() {
  const skillsDir = getSkillsDir();
  const results = [];

  try {
    const entries = readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = join(skillsDir, entry.name);
      if (!existsSync(join(dir, 'SKILL.md'))) continue;
      results.push({
        name: entry.name,
        dir,
        meta: readSkillMeta(dir, entry.name),
      });
    }
  } catch {
    // directory might not exist yet
  }

  return results;
}
