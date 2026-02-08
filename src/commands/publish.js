import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { log } from '../utils.js';

const REQUIRED_FILES = [
  '.claude-plugin/plugin.json',
  'README.md',
];

export async function publish() {
  const cwd = process.cwd();
  const errors = [];
  const warnings = [];

  // Check required files
  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(cwd, file))) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  if (errors.length) {
    log.error('Plugin validation failed:\n');
    errors.forEach((e) => console.log(chalk.red(`  - ${e}`)));
    console.log();
    process.exit(1);
  }

  // Read and validate plugin.json
  let manifest;
  try {
    manifest = JSON.parse(
      readFileSync(join(cwd, '.claude-plugin/plugin.json'), 'utf-8')
    );
  } catch (err) {
    log.error('Invalid plugin.json: ' + err.message);
    process.exit(1);
  }

  const required = ['name', 'version', 'description'];
  for (const field of required) {
    if (!manifest[field]) {
      errors.push(`plugin.json missing required field: "${field}"`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(manifest.name || '')) {
    errors.push('plugin.json "name" must be lowercase with hyphens only');
  }

  // Check for recommended fields
  if (!manifest.repository) {
    warnings.push('plugin.json missing "repository" field');
  }
  if (!manifest.keywords?.length) {
    warnings.push('plugin.json missing "keywords" - helps with search');
  }
  if (!manifest.license) {
    warnings.push('plugin.json missing "license" field');
  }

  // Check for git remote
  let repoUrl = manifest.repository || '';
  if (!repoUrl) {
    try {
      repoUrl = execFileSync('git', ['remote', 'get-url', 'origin'], {
        cwd,
        stdio: 'pipe',
        encoding: 'utf-8',
      }).trim();
    } catch {
      warnings.push('No git remote found - you will need a GitHub repository');
    }
  }

  if (errors.length) {
    log.error('Plugin validation failed:\n');
    errors.forEach((e) => console.log(chalk.red(`  - ${e}`)));
    console.log();
    process.exit(1);
  }

  // Output result
  console.log();
  log.success('Plugin validation passed!\n');

  if (warnings.length) {
    warnings.forEach((w) => log.warn(w));
    console.log();
  }

  console.log(chalk.bold('  Plugin Details:\n'));
  console.log(`  ${chalk.dim('Name')}         ${manifest.name}`);
  console.log(`  ${chalk.dim('Version')}      ${manifest.version}`);
  console.log(`  ${chalk.dim('Description')}  ${manifest.description}`);
  if (repoUrl) {
    console.log(`  ${chalk.dim('Repository')}   ${repoUrl}`);
  }
  console.log();

  // Generate registry entry
  const entry = {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author || { name: 'unknown' },
    repository: repoUrl.replace(/\.git$/, ''),
    keywords: manifest.keywords || [],
    license: manifest.license || 'MIT',
    commands: manifest.commands || [],
    category: manifest.category || 'other',
  };

  console.log(chalk.bold('  Registry entry (add to registry.json):\n'));
  console.log(chalk.dim('  ' + JSON.stringify(entry, null, 2).split('\n').join('\n  ')));
  console.log();
  log.info(
    'To publish, submit a PR to:\n  https://github.com/biggora/claude-plugins-registry'
  );
  log.dim('  Add the entry above to the "plugins" array in registry.json');
  console.log();
}
