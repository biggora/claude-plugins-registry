#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('claude-plugins')
  .description('CLI marketplace for Claude Code plugins')
  .version(pkg.version);

program
  .command('search [query]')
  .description('Search plugins by name or keyword')
  .action(async (query) => {
    const { search } = await import('../src/commands/search.js');
    await search(query);
  });

program
  .command('install <name>')
  .description('Install a plugin from the registry')
  .action(async (name) => {
    const { install } = await import('../src/commands/install.js');
    await install(name);
  });

program
  .command('uninstall <name>')
  .alias('remove')
  .description('Remove an installed plugin')
  .action(async (name) => {
    const { uninstall } = await import('../src/commands/uninstall.js');
    await uninstall(name);
  });

program
  .command('list')
  .alias('ls')
  .description('List installed plugins')
  .action(async () => {
    const { list } = await import('../src/commands/list.js');
    await list();
  });

program
  .command('info <name>')
  .description('Show details about a plugin')
  .action(async (name) => {
    const { info } = await import('../src/commands/info.js');
    await info(name);
  });

program
  .command('update [name]')
  .alias('upgrade')
  .description('Update one or all installed plugins')
  .action(async (name) => {
    const { update } = await import('../src/commands/update.js');
    await update(name);
  });

program
  .command('publish')
  .description('Validate current directory and generate registry entry')
  .action(async () => {
    const { publish } = await import('../src/commands/publish.js');
    await publish();
  });

const skills = program
  .command('skills')
  .description('Manage Claude Code skills');

skills
  .command('add <source>')
  .description('Install a skill from a Git URL or registry name')
  .option('--skill <name>', 'Select a specific skill from a multi-skill repo')
  .action(async (source, options) => {
    const { add } = await import('../src/commands/skills/add.js');
    await add(source, options);
  });

skills
  .command('list')
  .alias('ls')
  .description('List installed skills')
  .action(async () => {
    const { list } = await import('../src/commands/skills/list.js');
    await list();
  });

skills
  .command('remove <name>')
  .alias('rm')
  .description('Remove an installed skill')
  .action(async (name) => {
    const { remove } = await import('../src/commands/skills/remove.js');
    await remove(name);
  });

skills
  .command('update [name]')
  .description('Update one or all installed skills')
  .action(async (name) => {
    const { update } = await import('../src/commands/skills/update.js');
    await update(name);
  });

program.parse();
