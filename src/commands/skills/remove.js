import { rmSync } from 'node:fs';
import { log, spinner } from '../../utils.js';
import { findInstalledSkill } from './resolve.js';

export async function remove(name) {
  const found = findInstalledSkill(name);

  if (!found) {
    log.error(`Skill "${name}" is not installed`);
    log.dim('Run "claude-plugins skills list" to see installed skills');
    process.exit(1);
  }

  const spin = spinner(`Removing skill "${name}"...`);
  spin.start();

  try {
    rmSync(found.dir, { recursive: true, force: true });
    spin.succeed(`Removed skill "${name}" from ${found.location}`);
    log.dim('Restart Claude Code to apply changes.');
  } catch (err) {
    spin.fail(`Failed to remove skill "${name}"`);
    log.error(err.message);
    process.exit(1);
  }
}
