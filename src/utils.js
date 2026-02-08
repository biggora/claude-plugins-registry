import chalk from 'chalk';
import ora from 'ora';

export const log = {
  info: (msg) => console.log(chalk.blue('i'), msg),
  success: (msg) => console.log(chalk.green('\u2713'), msg),
  warn: (msg) => console.log(chalk.yellow('!'), msg),
  error: (msg) => console.error(chalk.red('\u2717'), msg),
  dim: (msg) => console.log(chalk.dim(msg)),
};

export function spinner(text) {
  return ora({ text, color: 'cyan' });
}

export function formatTable(rows, headers) {
  const cols = headers.length;
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] || '').length))
  );

  const sep = widths.map((w) => '-'.repeat(w)).join('--+-');
  const formatRow = (row) =>
    row.map((cell, i) => String(cell || '').padEnd(widths[i])).join('  | ');

  console.log(chalk.bold(formatRow(headers)));
  console.log(chalk.dim(sep));
  rows.forEach((row) => console.log(formatRow(row)));
}

export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 3) + '...' : str;
}
