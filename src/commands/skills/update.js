import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getSkillsDir } from '../../config.js';
import { log, spinner } from '../../utils.js';
import { add } from './add.js';
import { remove } from './remove.js';

function readOrigin(skillDir) {
  const originPath = join(skillDir, '.origin.json');
  if (!existsSync(originPath)) return null;
  try {
    return JSON.parse(readFileSync(originPath, 'utf-8'));
  } catch {
    return null;
  }
}

async function updateOne(name) {
  const skillsDir = getSkillsDir();
  const dest = join(skillsDir, name);

  if (!existsSync(dest)) {
    log.error(`Skill "${name}" is not installed`);
    return false;
  }

  const origin = readOrigin(dest);
  if (!origin || !origin.repository) {
    log.warn(`Skill "${name}" has no origin metadata, skipping`);
    return false;
  }

  const spin = spinner(`Updating skill "${name}"...`);
  spin.start();
  spin.stop();

  try {
    // Remove and re-add
    await remove(name);
    await add(origin.repository, { skill: origin.skill || undefined });
    return true;
  } catch (err) {
    log.error(`Failed to update skill "${name}": ${err.message}`);
    return false;
  }
}

export async function update(name) {
  if (name) {
    await updateOne(name);
    return;
  }

  const skillsDir = getSkillsDir();
  const entries = readdirSync(skillsDir, { withFileTypes: true }).filter(
    (e) => e.isDirectory()
  );

  if (!entries.length) {
    log.info('No skills installed');
    return;
  }

  log.info(`Updating ${entries.length} skill${entries.length === 1 ? '' : 's'}...\n`);

  let updated = 0;
  for (const entry of entries) {
    if (await updateOne(entry.name)) updated++;
  }

  console.log();
  log.success(`${updated}/${entries.length} skills updated`);
  log.dim('Restart Claude Code to apply changes.');
}
