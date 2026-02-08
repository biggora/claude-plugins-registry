# claude-plugins

CLI marketplace for discovering, installing, and managing Claude Code plugins.

## Installation

```bash
npm install -g claude-plugins
```

Or use directly with npx:

```bash
npx claude-plugins search
```

## Commands

### Browse & Search

```bash
# List all available plugins
claude-plugins search

# Search by name or keyword
claude-plugins search typescript
claude-plugins search code-quality
```

### Install & Remove

```bash
# Install a plugin
claude-plugins install code-optimizer

# Remove a plugin
claude-plugins uninstall code-optimizer
```

### Manage

```bash
# List installed plugins
claude-plugins list

# Show plugin details
claude-plugins info code-optimizer

# Update all plugins
claude-plugins update

# Update a specific plugin
claude-plugins update code-optimizer
```

### Publish

```bash
# From your plugin directory
cd my-plugin
claude-plugins publish
```

This validates your plugin and generates a registry entry. Submit a PR to [claude-plugins-registry](https://github.com/biggora/claude-plugins-registry) to list it.

## Plugin Structure

Plugins must have this minimum structure:

```
my-plugin/
  .claude-plugin/
    plugin.json       # Required: name, version, description
  README.md           # Required
  commands/           # Slash commands
  agents/             # Agent definitions
  skills/             # Skill files
  hooks/              # Hook definitions
```

### plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What it does",
  "author": { "name": "you", "url": "https://github.com/you" },
  "repository": "https://github.com/you/my-plugin",
  "keywords": ["keyword1", "keyword2"],
  "license": "MIT"
}
```

## Registry

The plugin registry is hosted at [github.com/biggora/claude-plugins-registry](https://github.com/biggora/claude-plugins-registry). The CLI fetches it on demand and caches for 15 minutes.

To add your plugin to the registry:

1. Ensure your plugin is on GitHub
2. Run `claude-plugins publish` to validate and generate a registry entry
3. Submit a PR adding the entry to `registry.json`

## How It Works

- Plugins are installed to `~/.claude/plugins/<name>` via `git clone`
- Updates use `git pull --ff-only`
- Claude Code automatically discovers plugins in `~/.claude/plugins/`

## License

MIT
