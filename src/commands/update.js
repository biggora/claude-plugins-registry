import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getPluginsDir } from '../config.js';
import { log, spinner } from '../utils.js';

function updateOne(name, pluginsDir) {
  const dest = join(pluginsDir, name);

  if (!existsSync(dest)) {
    log.error(`Plugin "${name}" is not installed`);
    return false;
  }

  const gitDir = join(dest, '.git');
  if (!existsSync(gitDir)) {
    log.warn(`Plugin "${name}" was not installed via git, skipping`);
    return false;
  }

  const spin = spinner(`Updating ${name}...`);
  spin.start();

  try {
    const output = execFileSync('git', ['pull', '--ff-only'], {
      cwd: dest,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    if (output.includes('Already up to date')) {
      spin.info(`${name} is already up to date`);
    } else {
      spin.succeed(`Updated ${name}`);
    }
    return true;
  } catch (err) {
    spin.fail(`Failed to update ${name}`);
    log.error(err.message);
    return false;
  }
}

export async function update(name) {
  const pluginsDir = getPluginsDir();

  if (name) {
    updateOne(name, pluginsDir);
    return;
  }

  // Update all installed plugins
  const entries = readdirSync(pluginsDir, { withFileTypes: true }).filter(
    (e) => e.isDirectory()
  );

  if (!entries.length) {
    log.info('No plugins installed');
    return;
  }

  log.info(`Updating ${entries.length} plugin${entries.length === 1 ? '' : 's'}...\n`);

  let updated = 0;
  for (const entry of entries) {
    if (updateOne(entry.name, pluginsDir)) updated++;
  }

  console.log();
  log.success(`${updated}/${entries.length} plugins updated`);
  log.dim('Restart Claude Code to apply changes.');
}
