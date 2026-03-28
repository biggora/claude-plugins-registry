# @biggora/claude-plugins

[![npm version](https://img.shields.io/npm/v/@biggora/claude-plugins.svg)](https://www.npmjs.com/package/@biggora/claude-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI marketplace for discovering, installing, and managing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugins and skills.

## Installation

```bash
npm install -g @biggora/claude-plugins
```

Or use directly with npx (no install required):

```bash
npx @biggora/claude-plugins search
```

## Skills

Skills are self-contained instruction sets (SKILL.md files) that teach Claude Code how to perform specific tasks. They are installed into `~/.claude/skills/` and auto-discovered by Claude Code on startup.

### Install a Skill from Git

Install a specific skill directly from a Git repository:

```bash
# Install a single skill from a repository
npx skills add https://github.com/biggora/claude-plugins-registry --skill test-web-ui
```

### Manage Installed Skills

```bash
# List installed skills
claude-plugins skills list

# Update a specific skill
claude-plugins skills update commafeed-api

# Update all installed skills
claude-plugins skills update

# Remove a skill
claude-plugins skills remove commafeed-api
```

### Available Skills

| Skill | Category | Description |
|-------|----------|-------------|
| `captcha` | automation | Solve reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile via 2captcha/CapMonster, and image grid challenges via Claude/GPT-4V vision AI |
| `codex-cli` | devops | Install, configure, and automate tasks using OpenAI Codex CLI — approval modes, sandbox policies, MCP servers, and CI integration |
| `commafeed-api` | workflow | Manage CommaFeed RSS reader via REST API — subscriptions, categories, feeds, entries, and OPML import/export |
| `gemini-cli` | devops | Install, configure, and script with Gemini CLI — headless prompts, MCP servers, custom slash commands, extensions, and CI automation |
| `n8n-api` | workflow | Build, debug, and manage n8n workflows via REST API — create workflows, manage credentials, execute and monitor runs |
| `notebook-lm` | workflow | Automate Google NotebookLM — create notebooks, add sources, chat, generate audio/video overviews, quizzes, reports, and mind maps |
| `screen-recording` | other | Autonomous video creation — product demos, presentation videos, UI walkthroughs, and narrated screencasts via Pillow, MoviePy, and pyttsx3 |
| `test-mobile-app` | testing | Automated mobile app testing — analyzes APK/source, generates use cases, runs Appium tests on emulator, and produces QA reports |
| `test-web-ui` | testing | Automated web QA — discovers site structure, generates use cases and test plans, runs Playwright tests, and produces HTML reports |
| `text-to-speech` | other | Converts text to speech audio files using pyttsx3, espeak-ng, Kokoro ONNX, or cloud TTS engines with multilingual support |
| `tm-search` | workflow | Search, validate, and check availability of US trademarks via USPTO APIs — keyword search, batch validation, and status lookup |
| `wp-rest-api` | workflow | Build, extend, and debug WordPress REST API endpoints — routes, controllers, schema validation, authentication, and custom fields |
| `youtube-search` | workflow | Search YouTube for videos, channels, playlists and extract metadata, transcripts, and analytics via multiple API methods |
| `tailwindcss-best-practices` | frontend | Tailwind CSS v4.x best practices — utility classes, responsive layouts, @theme variables, dark mode, custom utilities, and v3-to-v4 migration |
| `vite-best-practices` | frontend | Vite 8 build tool best practices — configuration, Rolldown/Oxc migration, plugin API, SSR, library mode, and virtual modules |
| `google-merchant-api` | workflow | Work with Google Merchant Center APIs — Merchant API (v1) and Content API for Shopping (v2.1) for products, inventory, promotions, and reports |
| `lv-aggregators-api` | workflow | Generate and manage XML product feeds for Latvian price comparison platforms — Salidzini.lv and KurPirkt.lv integration |
| `typescript-expert` | code-quality | TypeScript type system, generics, utility types, advanced patterns, tsconfig, and TS 5.x features — includes `/typescript-fix` slash command |
| `youtube-thumbnail` | other | Generates professional YouTube thumbnails in 11 strategic styles with auto-detection of AI image backends and Pillow compositing |
| `next-best-practices` | frontend | Next.js 16 best practices — App Router, Server/Client Components, use cache, cacheTag, Server Actions, useActionState, useOptimistic, streaming, metadata/SEO, and PPR |

#### Install Examples

```bash
npx skills add https://github.com/biggora/claude-plugins-registry --skill captcha
npx skills add https://github.com/biggora/claude-plugins-registry --skill codex-cli
npx skills add https://github.com/biggora/claude-plugins-registry --skill gemini-cli
npx skills add https://github.com/biggora/claude-plugins-registry --skill n8n-api
npx skills add https://github.com/biggora/claude-plugins-registry --skill notebook-lm
npx skills add https://github.com/biggora/claude-plugins-registry --skill commafeed-api
npx skills add https://github.com/biggora/claude-plugins-registry --skill tm-search
npx skills add https://github.com/biggora/claude-plugins-registry --skill wp-rest-api
npx skills add https://github.com/biggora/claude-plugins-registry --skill youtube-search
npx skills add https://github.com/biggora/claude-plugins-registry --skill youtube-thumbnail
npx skills add https://github.com/biggora/claude-plugins-registry --skill screen-recording
npx skills add https://github.com/biggora/claude-plugins-registry --skill text-to-speech
npx skills add https://github.com/biggora/claude-plugins-registry --skill test-web-ui
npx skills add https://github.com/biggora/claude-plugins-registry --skill test-mobile-app
npx skills add https://github.com/biggora/claude-plugins-registry --skill tailwindcss-best-practices
npx skills add https://github.com/biggora/claude-plugins-registry --skill vite-best-practices
npx skills add https://github.com/biggora/claude-plugins-registry --skill google-merchant-api
npx skills add https://github.com/biggora/claude-plugins-registry --skill lv-aggregators-api
npx skills add https://github.com/biggora/claude-plugins-registry --skill typescript-expert
npx skills add https://github.com/biggora/claude-plugins-registry --skill nest-best-practices
npx skills add https://github.com/biggora/claude-plugins-registry --skill next-best-practices
```

## Plugins

### Quick Start

```bash
# Browse all available plugins
claude-plugins search

# Search by keyword
claude-plugins search typescript

# Install a plugin
claude-plugins install code-optimizer

# Restart Claude Code to load the plugin
```

### Plugin Commands

| Command | Description |
|---------|-------------|
| `claude-plugins search [query]` | Browse or search plugins by name, keyword, or category |
| `claude-plugins install <name>` | Install a plugin from the registry |
| `claude-plugins uninstall <name>` | Remove an installed plugin |
| `claude-plugins list` | List locally installed plugins |
| `claude-plugins info <name>` | Show detailed plugin information |
| `claude-plugins update [name]` | Update one or all installed plugins |
| `claude-plugins publish` | Validate plugin and generate registry entry for submission |

### Skills Commands

| Command | Description |
|---------|-------------|
| `claude-plugins skills add <source>` | Install a skill from a Git URL or registry name |
| `claude-plugins skills add <url> --skill <name>` | Install a specific skill from a multi-skill repository |
| `claude-plugins skills list` | List installed skills |
| `claude-plugins skills update [name]` | Update one or all installed skills |
| `claude-plugins skills remove <name>` | Remove an installed skill |

### Aliases

- `claude-plugins ls` - alias for `list`
- `claude-plugins remove <name>` - alias for `uninstall`
- `claude-plugins upgrade [name]` - alias for `update`
- `claude-plugins skills ls` - alias for `skills list`
- `claude-plugins skills rm <name>` - alias for `skills remove`

## Usage Examples

### Search & Install Plugins

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

## Skill Structure

Skills are simpler than plugins — just a SKILL.md file with optional supporting files:

```
my-skill/
  SKILL.md            # Required: skill instructions with YAML frontmatter
  commands/           # Slash commands (optional, copied to ~/.claude/commands/ on install)
  references/         # Reference docs (optional)
  scripts/            # Helper scripts (optional)
```

### SKILL.md

```markdown
---
name: my-skill
description: What this skill teaches Claude to do
---

# My Skill

Instructions for Claude Code...
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

- **Plugins** are installed via `git clone` to `~/.claude/plugins/<name>`
- **Skills** are installed via `git clone` + copy to `~/.claude/skills/<name>`
- **Slash commands** bundled with skills are automatically copied to `~/.claude/commands/`
- Updates use `git pull --ff-only` to safely fast-forward
- Claude Code automatically discovers plugins in `~/.claude/plugins/`, skills in `~/.claude/skills/`, and commands in `~/.claude/commands/`
- Restart Claude Code after installing or removing plugins/skills

## Requirements

- Node.js >= 18.0.0
- Git (for install/update operations)

## License

MIT
