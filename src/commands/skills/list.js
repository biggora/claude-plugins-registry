import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { getSkillsDir } from '../../config.js';
import { log, formatTable, truncate } from '../../utils.js';
import { parseFrontmatter } from './add.js';

export async function list() {
  const skillsDir = getSkillsDir();
  const entries = readdirSync(skillsDir, { withFileTypes: true }).filter(
    (e) => e.isDirectory()
  );

  if (!entries.length) {
    log.info('No skills installed');
    log.dim('Run "claude-plugins skills add <source>" to install a skill');
    return;
  }

  console.log(chalk.bold(`\n  ${entries.length} skill${entries.length === 1 ? '' : 's'} installed\n`));

  const rows = entries.map((entry) => {
    const dir = join(skillsDir, entry.name);
    const skillMdPath = join(dir, 'SKILL.md');
    const originPath = join(dir, '.origin.json');
    let description = '';
    let repo = '-';

    if (existsSync(skillMdPath)) {
      try {
        const fm = parseFrontmatter(readFileSync(skillMdPath, 'utf-8'));
        description = fm.description || '';
      } catch {
        // ignore
      }
    }

    if (existsSync(originPath)) {
      try {
        const origin = JSON.parse(readFileSync(originPath, 'utf-8'));
        repo = origin.repository || '-';
      } catch {
        // ignore
      }
    }

    return [entry.name, truncate(description, 50), truncate(repo, 40)];
  });

  formatTable(rows, ['Name', 'Description', 'Repository']);
  console.log();
}
