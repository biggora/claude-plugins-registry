import chalk from 'chalk';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getPluginsDir } from '../config.js';
import { fetchRegistry, findPlugin } from '../registry.js';
import { log } from '../utils.js';

export async function info(name) {
  const registry = await fetchRegistry();
  const plugin = findPlugin(registry, name);

  if (!plugin) {
    log.error(`Plugin "${name}" not found in registry`);
    process.exit(1);
  }

  const installed = existsSync(join(getPluginsDir(), plugin.name));

  console.log();
  console.log(chalk.bold.cyan(`  ${plugin.name}`) + chalk.dim(` v${plugin.version}`));
  console.log();
  console.log(`  ${plugin.description}`);
  console.log();

  const fields = [
    ['Author', plugin.author?.name || '-'],
    ['License', plugin.license || '-'],
    ['Category', plugin.category || '-'],
    ['Repository', plugin.repository || '-'],
    ['Keywords', (plugin.keywords || []).join(', ') || '-'],
    ['Commands', (plugin.commands || []).join(', ') || '-'],
    ['Installed', installed ? chalk.green('yes') : chalk.dim('no')],
  ];

  for (const [label, value] of fields) {
    console.log(`  ${chalk.dim(label.padEnd(12))} ${value}`);
  }

  console.log();

  if (!installed) {
    log.dim(`  Run "claude-plugins install ${plugin.name}" to install`);
    console.log();
  }
}
