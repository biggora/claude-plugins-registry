import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getPluginsDir } from '../config.js';
import { log, spinner } from '../utils.js';

export async function uninstall(name) {
  const dest = join(getPluginsDir(), name);

  if (!existsSync(dest)) {
    log.error(`Plugin "${name}" is not installed`);
    log.dim('Run "claude-plugins list" to see installed plugins');
    process.exit(1);
  }

  const spin = spinner(`Uninstalling ${name}...`);
  spin.start();

  try {
    rmSync(dest, { recursive: true, force: true });
    spin.succeed(`Uninstalled ${name}`);
    log.dim('Restart Claude Code to apply changes.');
  } catch (err) {
    spin.fail(`Failed to uninstall ${name}`);
    log.error(err.message);
    process.exit(1);
  }
}
