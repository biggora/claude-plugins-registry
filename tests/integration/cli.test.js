import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '..', '..', 'bin', 'cli.js');
const PKG = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'));

async function runCli(...args) {
  try {
    const { stdout, stderr } = await execFileAsync('node', [CLI_PATH, ...args], {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.code || 1,
    };
  }
}

describe('CLI integration', () => {
  it('--help outputs usage info and exits 0', async () => {
    const { stdout, exitCode } = await runCli('--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('claude-plugins'));
  });

  it('--version outputs package version', async () => {
    const { stdout, exitCode } = await runCli('--version');
    assert.equal(exitCode, 0);
    assert.ok(stdout.trim().includes(PKG.version));
  });

  it('search --help shows search command help', async () => {
    const { stdout, exitCode } = await runCli('search', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('search'));
  });

  it('install --help shows install command help', async () => {
    const { stdout, exitCode } = await runCli('install', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('install'));
  });

  it('skills --help shows skills subcommand help', async () => {
    const { stdout, exitCode } = await runCli('skills', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('skills'));
  });

  it('skills list --help shows skills list help', async () => {
    const { stdout, exitCode } = await runCli('skills', 'list', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('list'));
  });

  it('unknown command produces error', async () => {
    const { stderr, exitCode } = await runCli('nonexistent-command');
    assert.notEqual(exitCode, 0);
  });

  it('publish --help shows publish command help', async () => {
    const { stdout, exitCode } = await runCli('publish', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('publish'));
  });

  it('update --help shows update command help', async () => {
    const { stdout, exitCode } = await runCli('update', '--help');
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('update'));
  });
});
