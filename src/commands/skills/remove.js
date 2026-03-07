import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getSkillsDir } from '../../config.js';
import { log, spinner } from '../../utils.js';

export async function remove(name) {
  const dest = join(getSkillsDir(), name);

  if (!existsSync(dest)) {
    log.error(`Skill "${name}" is not installed`);
    log.dim('Run "claude-plugins skills list" to see installed skills');
    process.exit(1);
  }

  const spin = spinner(`Removing skill "${name}"...`);
  spin.start();

  try {
    rmSync(dest, { recursive: true, force: true });
    spin.succeed(`Removed skill "${name}"`);
    log.dim('Restart Claude Code to apply changes.');
  } catch (err) {
    spin.fail(`Failed to remove skill "${name}"`);
    log.error(err.message);
    process.exit(1);
  }
}
