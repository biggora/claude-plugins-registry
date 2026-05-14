---
name: codex-cli
description: "Use this skill whenever you need to install, configure, run, or automate tasks using OpenAI's Codex CLI (codex-cli). Trigger on any mention of \"codex cli\", \"openai codex\", \"codex exec\", \"codex agent\", \"codex terminal\", CI automation with Codex, approval modes (full-auto, read-only, on-request), sandbox policies, or when someone wants to use an AI coding agent from the terminal. Also trigger when the user wants to install codex, write codex config files (config.toml), run non-interactive codex sessions, integrate codex into GitHub Actions or CI pipelines, configure MCP servers for codex, set up codex profiles, or troubleshoot codex sandbox and approval issues."
---

# Codex CLI Skill

OpenAI Codex CLI (`@openai/codex`) is a lightweight, open-source AI coding agent that runs locally in the terminal. It can read, edit, and execute code in your project directory using GPT-5 models.

## Quick Reference

### Installation
```bash
npm install -g @openai/codex
# Authenticate (browser or API key)
codex           # launches TUI with browser auth
export OPENAI_API_KEY="sk-..."  # or use API key
```

### Basic Usage
```bash
codex                              # Interactive TUI
codex "Fix the TypeScript errors"  # TUI with pre-filled prompt
codex exec "Run tests and fix failures"   # Non-interactive (CI/scripts)
codex e "Update CHANGELOG"         # Short alias for exec
```

---

## Core Concepts

### Approval Modes (`-a` / `--ask-for-approval`)
Controls when Codex pauses to ask before executing. The ONLY valid values are:

| Mode | Flag | Config value | Behavior |
|------|------|-------------|----------|
| `untrusted` | `-a untrusted` | `approval_policy = "untrusted"` | Max caution — approves almost everything |
| `on-request` | `-a on-request` | `approval_policy = "on-request"` | Asks on sensitive actions (default for auto) |
| `never` | `-a never` | `approval_policy = "never"` | Never asks — runs fully automated |
| `reject` | `-a reject` | `approval_policy = "reject"` | Blocks all tool use |

Note: `--full-auto` is a CLI-only shortcut (equivalent to `-a on-request -s workspace-write`). It is NOT a valid `approval_policy` config value. Values like "suggest", "auto-edit", or "full-auto" do not exist as config values.

### Sandbox Modes (`-s` / `--sandbox`)
Controls filesystem and network access. The ONLY valid values are:

| Mode | Flag | Access |
|------|------|--------|
| `read-only` | `-s read-only` | Read files only, no writes |
| `workspace-write` | `-s workspace-write` | Write within working directory only |
| `danger-full-access` | `-s danger-full-access` | Full system access (use with caution) |

Note: There is no `--no-sandbox` flag or `sandbox = "none"` config option. To bypass the sandbox entirely, use `--dangerously-bypass-approvals-and-sandbox` (alias `--yolo`).

### Common Combinations
```bash
# Safe daily development (recommended)
codex --full-auto "task"
# Equivalent to: -a on-request -s workspace-write

# Full automation (CI/scripts)
codex -a never -s workspace-write "task"

# Audit / review only
codex -s read-only "Review the codebase"

# Unrestricted (isolated environments ONLY)
codex --dangerously-bypass-approvals-and-sandbox "task"
# Alias: --yolo
```

---

## Configuration (`~/.codex/config.toml`)

Config uses **TOML format** (not JSON). The file is `config.toml`, never `config.json`.

### Minimal config
```toml
model = "gpt-5-codex"
approval_policy = "on-request"
```

### Full config example
```toml
model = "gpt-5-codex"
approval_policy = "on-request"

[sandbox_workspace_write]
network_access = false   # true to allow network

[features]
shell_snapshot = true    # faster repeated commands

[tui]
alternate_screen = "auto"
animations = true
```

### Profiles (for different workflows)

Profiles use `[profiles.<name>]` (plural "profiles", not singular "profile"):

```toml
[profiles.ci]
model = "gpt-5-codex"
approval_policy = "never"

[profiles.review]
model = "gpt-5-pro"
model_reasoning_effort = "high"
approval_policy = "untrusted"
```

Use a profile: `codex --profile ci "task"` or `codex -p ci "task"`, or set `profile = "ci"` at the top level as default.

### Config precedence (highest → lowest)
1. CLI flags (`--model`, `-c key=value`)
2. Project config: `.codex/config.toml` in project root (trusted projects only)
3. User config: `~/.codex/config.toml`
4. System/built-in defaults

---

## Non-Interactive Mode (`codex exec`)

For CI pipelines and shell scripts, always use `codex exec` (not bare `codex`). The `exec` subcommand runs non-interactively and exits when done:

```bash
# Basic
codex exec "Update the CHANGELOG for v2.1.0"

# With options
codex exec \
  --full-auto \
  --model gpt-5-codex \
  --path /my/project \
  "Fix all TypeScript type errors"

# JSON output (for parsing)
codex exec --json "Find all TODO comments"

# Resume previous session
codex exec --resume <session-id> "Continue where we left off"
```

### GitHub Actions example
```yaml
- name: Run Codex
  run: |
    npm i -g @openai/codex
    codex exec --full-auto "Update CHANGELOG"
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## TUI Slash Commands

| Command | Effect |
|---------|--------|
| `/status` | Show model, approval policy, token usage, workspace roots |
| `/permissions` | Change approval mode interactively |
| `/model` | Switch model mid-session |
| `/clear` | Clear transcript, start fresh conversation |
| `/copy` | Copy latest Codex output to clipboard |
| `/plan` | Enter plan mode |
| `/review` | Review changes in working tree |
| `/mcp` | List available MCP tools |
| `/agent` | Switch between agent threads |
| `/feedback` | Submit feedback |
| `/logout` | Clear stored credentials |

**Keyboard shortcuts:**
- `Enter` while running → inject new instructions
- `Tab` → queue follow-up for next turn
- `Esc Esc` → edit previous message / fork from that point
- `!command` → run local shell command, result feeds Codex

---

## MCP Servers

Add third-party tools to Codex via Model Context Protocol:

```toml
# ~/.codex/config.toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_TOKEN = "$GITHUB_TOKEN" }

[mcp_servers.my-api]
url = "https://my-server.example.com/mcp"
```

Run Codex itself as an MCP server (for other agents to consume) using the `mcp` subcommand (not a flag):
```bash
codex mcp
# Note: this is a subcommand, NOT "codex --mcp-server"
```

---

## Network Access

By default, network is **disabled** in sandbox:

```bash
# Enable network for one run
codex -s workspace-write \
  -c 'sandbox_workspace_write.network_access=true' \
  "npm install and run tests"
```

---

## Agent Skills (`.codex/skills/`)

Codex supports reusable skill bundles. Reference with `$skill-name` syntax in the TUI:

```
.codex/
  skills/
    my-skill/
      skill.md   # instructions for this skill
```

Usage in TUI: `Use $my-skill to generate a new module`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Approval prompts won't stop | Check `/status`, restart with explicit `-a` flag or profile |
| Network access denied | Add `-c 'sandbox_workspace_write.network_access=true'` |
| Sandbox ENOENT on macOS | Run `xcode-select --install`, check dir permissions |
| Landlock error on Linux/WSL | Update WSL2 or use `--dangerously-bypass-approvals-and-sandbox` in isolated env |
| Auth loop / browser keeps opening | Run `codex logout`, then `rm -f ~/.codex/auth.json`, use `OPENAI_API_KEY` |
| Settings reset after reconnect | Use a named profile in `config.toml` |

---

## Key Flags Reference

| Flag | Short | Description |
|------|-------|-------------|
| `--ask-for-approval` | `-a` | Approval mode: `untrusted`, `on-request`, `never`, `reject` |
| `--sandbox` | `-s` | Sandbox mode: `read-only`, `workspace-write`, `danger-full-access` |
| `--full-auto` | | Shortcut: `-a on-request -s workspace-write` |
| `--dangerously-bypass-approvals-and-sandbox` | `--yolo` | No restrictions (isolated envs only) |
| `--model` | `-m` | Override model for this run |
| `--profile` | `-p` | Load named profile from config.toml |
| `--cd` | | Set working directory without cd |
| `--config` | `-c` | Override any config key: `-c model=gpt-4.1` |
| `--json` | | Output newline-delimited JSON events |
| `--oss` | | Use local Ollama provider |
| `--images` | | Attach images to prompt (comma-separated paths) |
| `--live-search` | | Enable live web search |
| `--resume` | | Resume previous session by ID |
| `--no-persist` | | Don't write session rollout files to disk |

For detailed reference, see: https://developers.openai.com/codex/cli/reference/