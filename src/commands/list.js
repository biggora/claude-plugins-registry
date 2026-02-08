import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { getPluginsDir } from '../config.js';
import { log, formatTable, truncate } from '../utils.js';

export async function list() {
  const pluginsDir = getPluginsDir();
  const entries = readdirSync(pluginsDir, { withFileTypes: true }).filter(
    (e) => e.isDirectory()
  );

  if (!entries.length) {
    log.info('No plugins installed');
    log.dim('Run "claude-plugins search" to browse available plugins');
    return;
  }

  console.log(chalk.bold(`\n  ${entries.length} plugin${entries.length === 1 ? '' : 's'} installed\n`));

  const rows = entries.map((entry) => {
    const dir = join(pluginsDir, entry.name);
    const manifestPath = join(dir, '.claude-plugin', 'plugin.json');
    let version = '-';
    let description = '';

    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        version = manifest.version || '-';
        description = manifest.description || '';
      } catch {
        // ignore parse errors
      }
    }

    return [entry.name, truncate(description, 55), version];
  });

  formatTable(rows, ['Name', 'Description', 'Version']);
  console.log();
}
