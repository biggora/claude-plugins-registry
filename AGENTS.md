# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

CLI marketplace for discovering, installing, and managing Codex plugins. Published as `@biggora/Codex-plugins` on npm. Plugins are git-cloned into `~/.Codex/plugins/` where Codex auto-discovers them.

## Commands

```bash
# Run the CLI (no build step needed)
node bin/cli.js --help

# Test (currently just runs --help)
npm test
```

## Architecture

Pure JavaScript ESM project (`"type": "module"`) with no build/transpile step. Node.js >= 18 required.

### Entry Points

- `bin/cli.js` - CLI entry point using Commander.js. Defines all commands with lazy `await import()` for each handler.
- `package.json` `bin` field maps `Codex-plugins` to `bin/cli.js`.

### Core Modules

- `src/config.js` - Constants and directory helpers. Defines `PLUGINS_DIR` (`~/.Codex/plugins`), `CACHE_DIR`, `CACHE_TTL` (15 min), and `REGISTRY_URL` (GitHub raw URL).
- `src/registry.js` - Fetches registry with 3-tier fallback: remote -> local cache -> bundled `registry/registry.json`. Provides `searchPlugins()` (keyword match across name/description/keywords/author) and `findPlugin()` (exact name match).
- `src/utils.js` - Logging helpers (`log.info/success/warn/error/dim`), `spinner()` (ora), `formatTable()`, `truncate()`.

### Command Handlers (`src/commands/`)

Each file exports a single async function matching its command name:
- `search.js` - Lists/filters plugins from registry
- `install.js` - `git clone` from plugin's repository URL into plugins dir
- `uninstall.js` - Removes plugin directory
- `list.js` - Reads installed plugins from `~/.Codex/plugins/`
- `info.js` - Shows detailed plugin metadata
- `update.js` - `git pull --ff-only` on installed plugins
- `publish.js` - Validates plugin structure (`.Codex-plugin/plugin.json` + `README.md`) and generates registry JSON entry

### Registry (`registry/`)

- `registry.json` - Bundled fallback registry with plugin entries
- `schema.json` - JSON schema for registry format

## Key Patterns

- All shell operations use `execFileSync` (not `exec`) with `stdio: 'pipe'` for safety
- Dependencies: `chalk` (styling), `commander` (CLI framework), `ora` (spinners) - all ESM-only
- Plugin names must match `^[a-z0-9-]+$`
- Registry entries require: name, version, description, author, repository
