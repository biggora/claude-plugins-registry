import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, cpSync, rmSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { getSkillsDir, getPluginsDir } from '../../config.js';
import { fetchRegistry, findPlugin } from '../../registry.js';
import { log, spinner } from '../../utils.js';
import { hasPluginComponents, detectComponents, findInstalledSkill } from './resolve.js';

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val;
    }
  }
  return meta;
}

export function findSkillDirs(dir, depth = 0, maxDepth = 3) {
  const results = [];
  if (depth > maxDepth) return results;

  if (existsSync(join(dir, 'SKILL.md'))) {
    results.push(dir);
  }

  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    results.push(...findSkillDirs(join(dir, entry.name), depth + 1, maxDepth));
  }

  return results;
}

function isUrl(str) {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('git@');
}

function makeTempDir() {
  const dir = join(tmpdir(), `claude-skill-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function add(source, options = {}) {
  let repoUrl = source;

  // If not a URL, look up in registry
  if (!isUrl(source)) {
    const registry = await fetchRegistry();
    const entry = findPlugin(registry, source);
    if (!entry) {
      log.error(`Skill "${source}" not found in registry`);
      log.dim('Run "claude-plugins search <query>" to find plugins and skills');
      process.exit(1);
    }
    repoUrl = entry.repository;
    log.info(`Resolved "${source}" to ${repoUrl}`);
  }

  const tmpDir = makeTempDir();
  const spin = spinner(`Cloning ${repoUrl}...`);
  spin.start();

  try {
    const gitUrl = repoUrl.endsWith('.git') ? repoUrl : `${repoUrl}.git`;
    execFileSync('git', ['clone', '--depth', '1', gitUrl, tmpDir], {
      stdio: 'pipe',
    });
    spin.succeed('Repository cloned');
  } catch (err) {
    spin.fail('Failed to clone repository');
    log.error(err.message);
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Find all skill directories
  const skillDirs = findSkillDirs(tmpDir);

  if (!skillDirs.length) {
    log.error('No SKILL.md found in repository');
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  let targetDir;

  if (options.skill) {
    // Find the skill matching --skill name
    targetDir = skillDirs.find((d) => {
      const fm = parseFrontmatter(readFileSync(join(d, 'SKILL.md'), 'utf-8'));
      return (fm.name || basename(d)).toLowerCase() === options.skill.toLowerCase();
    });

    if (!targetDir) {
      // Also try matching by directory name
      targetDir = skillDirs.find((d) => basename(d).toLowerCase() === options.skill.toLowerCase());
    }

    if (!targetDir) {
      log.error(`Skill "${options.skill}" not found in repository`);
      log.info('Available skills:');
      for (const d of skillDirs) {
        const fm = parseFrontmatter(readFileSync(join(d, 'SKILL.md'), 'utf-8'));
        log.dim(`  - ${fm.name || basename(d)}`);
      }
      rmSync(tmpDir, { recursive: true, force: true });
      process.exit(1);
    }
  } else if (skillDirs.length === 1) {
    targetDir = skillDirs[0];
  } else {
    // Check if root has SKILL.md
    if (existsSync(join(tmpDir, 'SKILL.md'))) {
      targetDir = tmpDir;
    } else {
      log.warn('Multiple skills found. Use --skill <name> to select one:');
      for (const d of skillDirs) {
        const fm = parseFrontmatter(readFileSync(join(d, 'SKILL.md'), 'utf-8'));
        log.dim(`  - ${fm.name || basename(d)}`);
      }
      rmSync(tmpDir, { recursive: true, force: true });
      process.exit(1);
    }
  }

  // Parse skill metadata
  const skillMd = readFileSync(join(targetDir, 'SKILL.md'), 'utf-8');
  const frontmatter = parseFrontmatter(skillMd);
  const skillName = frontmatter.name || options.skill || basename(targetDir === tmpDir ? repoUrl.replace(/\.git$/, '').split('/').pop() : targetDir);

  // Detect plugin components (commands, hooks, agents) alongside SKILL.md
  const components = detectComponents(targetDir);
  const installAsPlugin = hasPluginComponents(targetDir);

  const destDir = installAsPlugin ? getPluginsDir() : getSkillsDir();
  const dest = join(destDir, skillName);

  // Check both locations for existing installation
  const existing = findInstalledSkill(skillName);
  if (existing) {
    log.warn(`Skill "${skillName}" is already installed at ${existing.dir}`);
    log.dim(`Run "claude-plugins skills update ${skillName}" to update it`);
    rmSync(tmpDir, { recursive: true, force: true });
    return;
  }

  if (existsSync(dest)) {
    log.warn(`"${skillName}" already exists at ${dest}`);
    rmSync(tmpDir, { recursive: true, force: true });
    return;
  }

  const label = installAsPlugin ? 'skill + components' : 'skill';
  const spin2 = spinner(`Installing ${label} "${skillName}"...`);
  spin2.start();

  try {
    cpSync(targetDir, dest, { recursive: true });

    // Remove .git directory if copied from root
    const gitInDest = join(dest, '.git');
    if (existsSync(gitInDest)) {
      rmSync(gitInDest, { recursive: true, force: true });
    }

    // Generate .claude-plugin/plugin.json if installing as plugin and none exists
    if (installAsPlugin && !existsSync(join(dest, '.claude-plugin', 'plugin.json'))) {
      const pluginDir = join(dest, '.claude-plugin');
      mkdirSync(pluginDir, { recursive: true });

      const pluginJson = {
        name: skillName,
        version: '1.0.0',
        description: frontmatter.description || `Skill: ${skillName}`,
        commands: listCommandFiles(dest),
        _generatedBy: 'claude-plugins skills add',
      };

      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify(pluginJson, null, 2)
      );
    }

    // Write origin metadata
    writeFileSync(
      join(dest, '.origin.json'),
      JSON.stringify(
        {
          repository: repoUrl,
          skill: options.skill || null,
          installedAs: installAsPlugin ? 'plugin-skill' : 'skill',
          components,
          installedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    spin2.succeed(`Installed skill "${skillName}"`);
    log.dim(`  ${dest}`);
    if (frontmatter.description) {
      log.dim(`  ${frontmatter.description}`);
    }

    if (installAsPlugin) {
      const extras = components.filter((c) => c !== 'skill');
      log.info(`Detected: ${components.join(', ')}`);
      log.dim(`Installed as plugin so Claude Code discovers ${extras.join(', ')}`);
    }

    log.dim('\nRestart Claude Code to load the skill.');
  } catch (err) {
    spin2.fail(`Failed to install skill "${skillName}"`);
    log.error(err.message);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

/**
 * List command file names (without extension) from a commands/ directory.
 */
function listCommandFiles(dir) {
  const cmdsDir = join(dir, 'commands');
  if (!existsSync(cmdsDir)) return [];
  try {
    return readdirSync(cmdsDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => `/${f.replace(/\.md$/, '')}`);
  } catch {
    return [];
  }
}
