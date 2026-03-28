import { log, spinner } from '../../utils.js';
import { findInstalledSkill, listAllSkills, readOrigin } from './resolve.js';
import { add } from './add.js';
import { remove } from './remove.js';

async function updateOne(name) {
  const found = findInstalledSkill(name);

  if (!found) {
    log.error(`Skill "${name}" is not installed`);
    return false;
  }

  const origin = readOrigin(found.dir);
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

  const skills = listAllSkills();

  if (!skills.length) {
    log.info('No skills installed');
    return;
  }

  log.info(`Updating ${skills.length} skill${skills.length === 1 ? '' : 's'}...\n`);

  let updated = 0;
  for (const skill of skills) {
    if (await updateOne(skill.name)) updated++;
  }

  console.log();
  log.success(`${updated}/${skills.length} skills updated`);
  log.dim('Restart Claude Code to apply changes.');
}
