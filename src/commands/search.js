import chalk from 'chalk';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getPluginsDir } from '../config.js';
import { fetchRegistry, searchPlugins } from '../registry.js';
import { log, formatTable, truncate } from '../utils.js';

export async function search(query) {
  const registry = await fetchRegistry();
  const results = query
    ? searchPlugins(registry, query)
    : registry.plugins;

  if (!results.length) {
    log.warn(`No plugins found for "${query}"`);
    return;
  }

  const pluginsDir = getPluginsDir();

  console.log(
    chalk.bold(`\n  ${results.length} plugin${results.length === 1 ? '' : 's'} found\n`)
  );

  const rows = results.map((p) => {
    const installed = existsSync(join(pluginsDir, p.name));
    const status = installed ? chalk.green('installed') : '';
    return [p.name, truncate(p.description, 55), p.version, status];
  });

  formatTable(rows, ['Name', 'Description', 'Version', 'Status']);
  console.log();
}
