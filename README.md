# @biggora/claude-plugins

[![npm version](https://img.shields.io/npm/v/@biggora/claude-plugins.svg)](https://www.npmjs.com/package/@biggora/claude-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI marketplace for discovering, installing, and managing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugins.

## Installation

```bash
npm install -g @biggora/claude-plugins
```

Or use directly with npx (no install required):

```bash
npx @biggora/claude-plugins search
```

## Quick Start

```bash
# Browse all available plugins
claude-plugins search

# Search by keyword
claude-plugins search typescript

# Install a plugin
claude-plugins install code-optimizer

# Restart Claude Code to load the plugin
```

## Commands

| Command | Description |
|---------|-------------|
| `claude-plugins search [query]` | Browse or search plugins by name, keyword, or category |
| `claude-plugins install <name>` | Install a plugin from the registry |
| `claude-plugins uninstall <name>` | Remove an installed plugin |
| `claude-plugins list` | List locally installed plugins |
| `claude-plugins info <name>` | Show detailed plugin information |
| `claude-plugins update [name]` | Update one or all installed plugins |
| `claude-plugins publish` | Validate plugin and generate registry entry for submission |

### Aliases

- `claude-plugins ls` - alias for `list`
- `claude-plugins remove <name>` - alias for `uninstall`
- `claude-plugins upgrade [name]` - alias for `update`

## Usage Examples

### Search & Install

```bash
# List all plugins in the registry
claude-plugins search

# Search for code quality tools
claude-plugins search code-quality

# Get details about a specific plugin
claude-plugins info typescript-eslint-fixer

# Install it
claude-plugins install typescript-eslint-fixer
```

### Manage Installed Plugins

```bash
# See what you have installed
claude-plugins list

# Update all plugins to latest
claude-plugins update

# Update a specific plugin
claude-plugins update code-optimizer

# Remove a plugin
claude-plugins uninstall code-optimizer
```

### Publish Your Own Plugin

```bash
# From your plugin directory
cd my-awesome-plugin

# Validate and generate a registry entry
claude-plugins publish
```

The `publish` command validates your plugin structure and outputs a JSON entry. Submit a PR to [claude-plugins-registry](https://github.com/biggora/claude-plugins-registry) to list your plugin.

## Plugin Structure

Plugins must have this minimum structure:

```
my-plugin/
  .claude-plugin/
    plugin.json       # Required: name, version, description
  README.md           # Required
  commands/           # Slash commands (optional)
  agents/             # Agent definitions (optional)
  skills/             # Skill files (optional)
  hooks/              # Hook definitions (optional)
```

### plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Short description of what it does",
  "author": {
    "name": "your-name",
    "url": "https://github.com/your-name"
  },
  "repository": "https://github.com/your-name/my-plugin",
  "keywords": ["keyword1", "keyword2"],
  "license": "MIT"
}
```

## Registry

The plugin registry is a GitHub-hosted JSON file at [biggora/claude-plugins-registry](https://github.com/biggora/claude-plugins-registry).

- The CLI fetches the registry on demand and caches it locally for 15 minutes
- Falls back to cached version if GitHub is unreachable
- Falls back to bundled registry if no cache exists

### Adding a Plugin to the Registry

1. Create your plugin and push it to a public GitHub repository
2. Run `claude-plugins publish` from your plugin directory to validate
3. Copy the generated registry entry
4. Submit a PR to [claude-plugins-registry](https://github.com/biggora/claude-plugins-registry) adding the entry to `registry/registry.json`

## How It Works

- Plugins are installed via `git clone` to `~/.claude/plugins/<name>`
- Updates use `git pull --ff-only` to safely fast-forward
- Claude Code automatically discovers plugins in `~/.claude/plugins/`
- Restart Claude Code after installing or removing plugins

## Requirements

- Node.js >= 18.0.0
- Git (for install/update operations)

## License

MIT
