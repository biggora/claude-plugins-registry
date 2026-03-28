import chalk from 'chalk';
import { log, formatTable, truncate } from '../../utils.js';
import { listAllSkills } from './resolve.js';

export async function list() {
  const skills = listAllSkills();

  if (!skills.length) {
    log.info('No skills installed');
    log.dim('Run "claude-plugins skills add <source>" to install a skill');
    return;
  }

  console.log(chalk.bold(`\n  ${skills.length} skill${skills.length === 1 ? '' : 's'} installed\n`));

  const rows = skills.map(({ name, meta, location }) => {
    const type = location === 'plugins' ? chalk.cyan('plugin') : chalk.dim('skill');
    return [name, truncate(meta.description, 45), type, truncate(meta.repository, 35)];
  });

  formatTable(rows, ['Name', 'Description', 'Type', 'Repository']);
  console.log();
}
