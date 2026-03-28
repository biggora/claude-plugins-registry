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

  const rows = skills.map(({ name, meta }) => {
    const cmds = meta.commands.length
      ? meta.commands.map((c) => `/${c}`).join(', ')
      : '';
    return [name, truncate(meta.description, 45), cmds, truncate(meta.repository, 35)];
  });

  formatTable(rows, ['Name', 'Description', 'Commands', 'Repository']);
  console.log();
}
