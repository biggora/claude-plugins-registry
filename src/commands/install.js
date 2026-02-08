import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getPluginsDir } from '../config.js';
import { fetchRegistry, findPlugin } from '../registry.js';
import { log, spinner } from '../utils.js';

export async function install(name) {
  const registry = await fetchRegistry();
  const plugin = findPlugin(registry, name);

  if (!plugin) {
    log.error(`Plugin "${name}" not found in registry`);
    log.dim('Run "claude-plugins search <query>" to find plugins');
    process.exit(1);
  }

  const pluginsDir = getPluginsDir();
  const dest = join(pluginsDir, plugin.name);

  if (existsSync(dest)) {
    log.warn(`Plugin "${plugin.name}" is already installed at ${dest}`);
    log.dim('Run "claude-plugins update ' + plugin.name + '" to update it');
    return;
  }

  const spin = spinner(`Installing ${plugin.name}...`);
  spin.start();

  try {
    execFileSync('git', ['clone', `${plugin.repository}.git`, dest], {
      stdio: 'pipe',
    });
    spin.succeed(`Installed ${plugin.name} v${plugin.version}`);
    log.dim(`  ${dest}`);
    log.dim(`  ${plugin.description}`);

    if (plugin.commands?.length) {
      log.info(`Commands: ${plugin.commands.join(', ')}`);
    }

    log.dim('\nRestart Claude Code to load the plugin.');
  } catch (err) {
    spin.fail(`Failed to install ${plugin.name}`);
    log.error(err.message);
    process.exit(1);
  }
}
