import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getCommandsDir } from '../../config.js';
import { log, spinner } from '../../utils.js';
import { findInstalledSkill, readOrigin } from './resolve.js';

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
    // Clean up commands that were copied to ~/.claude/commands/
    const origin = readOrigin(found.dir);
    if (origin && origin.installedCommands?.length) {
      const commandsDir = getCommandsDir();
      for (const cmd of origin.installedCommands) {
        const cmdFile = join(commandsDir, `${cmd}.md`);
        if (existsSync(cmdFile)) {
          rmSync(cmdFile);
        }
      }
    }

    rmSync(found.dir, { recursive: true, force: true });
    spin.succeed(`Removed skill "${name}"`);

    if (origin?.installedCommands?.length) {
      log.dim(`  Also removed commands: ${origin.installedCommands.map((c) => `/${c}`).join(', ')}`);
    }

    log.dim('Restart Claude Code to apply changes.');
  } catch (err) {
    spin.fail(`Failed to remove skill "${name}"`);
    log.error(err.message);
    process.exit(1);
  }
}
