# MCP Servers & Extensions Reference

## What is MCP?

Model Context Protocol (MCP) is a standard that lets external servers expose tools and
resources to Gemini CLI. MCP servers act as a bridge between Gemini and external systems
(databases, APIs, custom scripts, cloud services).

## MCP Server Configuration in settings.json

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    },
    "myPythonServer": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "cwd": "./mcp_tools",
      "env": {
        "API_KEY": "$MY_API_KEY"
      },
      "timeout": 15000,
      "trust": false,
      "includeTools": ["safe_tool_1", "safe_tool_2"],
      "excludeTools": ["dangerous_tool"]
    }
  }
}
```

## MCP Server Config Fields

| Field | Type | Description |
|---|---|---|
| `command` | string | Executable to run |
| `args` | string[] | Arguments array |
| `cwd` | string | Working directory |
| `env` | object | Environment variables (use `"$VAR"` to reference env) |
| `timeout` | number | Connection timeout in ms (default: 10000) |
| `trust` | boolean | Skip all confirmation dialogs (use with caution) |
| `includeTools` | string[] | Whitelist of tools to expose |
| `excludeTools` | string[] | Blacklist of tools to hide |

## Remote MCP Servers (SSE/HTTP)

```json
{
  "mcpServers": {
    "cloudflare": {
      "url": "https://mcp.cloudflare.com/sse",
      "transport": "sse"
    }
  }
}
```

Supports OAuth 2.0 for authenticated remote servers.

## CLI Commands for MCP Management

```bash
# Add a server
gemini mcp add github --command "npx -y @modelcontextprotocol/server-github"

# List configured servers
gemini mcp list

# Remove a server
gemini mcp remove github
```

**In interactive session:**
```
/mcp list           # list all servers and status
/mcp status         # detailed connection info
/mcp enable github  # enable a disabled server
/mcp disable github # disable without removing
```

## Using MCP Tools in Prompts

```
> @github List my open pull requests
> @github Create an issue titled "Bug: login fails"
> @slack Send summary of today's commits to #dev
> @database Find users who haven't logged in for 30 days
```

## MCP Prompts as Slash Commands

MCP servers can expose predefined prompts, which become slash commands:

```
/poem-writer --title="Gemini CLI" --mood="reverent"
/pr-review --repo="my-project" --pr-number=42
```

Positional args also work:
```
/mycommand arg1 arg2
```

## Security Notes

- Never hardcode API keys in settings.json — use `"KEY": "$ENV_VAR"` pattern
- The CLI redacts sensitive env vars (`*TOKEN*`, `*SECRET*`, `*KEY*`, etc.) from MCP processes unless explicitly listed in `env`
- `"trust": true` disables all confirmation dialogs — only use for servers you completely control
- MCP servers run with your user account permissions

---

## Extensions

Extensions bundle together MCP servers, context files, and custom commands into a reusable unit.

### Install from Git URL
```bash
gemini extension install https://github.com/GoogleCloudPlatform/cloud-run-mcp
```

### Browse the gallery
https://geminicli.com/extensions/

### Popular extensions
- **Cloud Run** (Google) — deploy to Cloud Run
- **GitHub** — manage issues, PRs, repositories
- **Redis** — query Redis instances
- **DynaTrace** — observability integration

### Extension Structure

```
my-extension/
├── gemini-extension.json    # required manifest
├── GEMINI.md                # optional context instructions
└── commands/
    └── deploy.toml          # optional custom commands
```

### gemini-extension.json Manifest

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My custom extension",
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./server.js"]
    }
  },
  "contextFileName": "GEMINI.md",
  "excludeTools": ["run_shell_command"]
}
```

### Extension Locations

- `~/.gemini/extensions/<n>/` — user-scoped (all projects)
- `<project>/.gemini/extensions/<n>/` — project-scoped

### Managing Extensions

```
/extension list          # list installed extensions
/extension enable <n>    # enable extension
/extension disable <n>   # disable extension
```

---

## Custom Slash Commands (.toml) — Full Reference

### File Locations

```
~/.gemini/commands/plan.toml              → /plan         (global)
<project>/.gemini/commands/review.toml   → /review       (project)
<project>/.gemini/commands/git/commit.toml → /git:commit  (namespaced)
```

### .toml Schema

```toml
# Required
prompt = "Your prompt text here"

# Optional
description = "What this command does"

# Arguments placeholder
# Use {{args}} to insert all user-provided arguments
prompt = "Review this code: {{args}}"

# Shell command execution (backtick-style)
prompt = "Review staged changes:\n!{git diff --cached}"

# Combined example
description = "Commit with AI message"
prompt = """
Write a conventional commit message for these changes:
!{git diff --cached}

Format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
"""
```

### Usage examples

```
/plan                    # Run /plan command
/review src/auth.py      # {{args}} = "src/auth.py"
/git:commit              # Namespaced command
```

### Invoking with args
```
/review --file="src/auth.py" --focus="security"
/review src/auth.py      # positional
```

## Multi-Modal Tool Responses

MCP tools can return mixed content (text + images):

```json
{
  "content": [
    { "type": "text", "text": "Here is the chart:" },
    { "type": "image", "data": "BASE64_DATA", "mimeType": "image/png" },
    { "type": "text", "text": "Analysis complete." }
  ]
}
```

Gemini CLI will:
1. Combine all text blocks into a single response part
2. Pass image data as inline content to the model
3. Show a user-friendly summary in the terminal