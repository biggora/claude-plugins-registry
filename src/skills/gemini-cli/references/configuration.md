# Configuration Reference

## File Locations

| File | Purpose |
|---|---|
| `~/.gemini/settings.json` | Global user settings |
| `<project>/.gemini/settings.json` | Project-level settings (overrides global) |
| `~/.gemini/GEMINI.md` | Global persistent memory/context |
| `<project>/GEMINI.md` | Project context (loaded automatically) |
| `<project>/.gemini/GEMINI.md` | Alternative project context location |
| `~/.gemini/.env` | Global API key env file |
| `./.gemini/.env` | Project-level env file |
| `<project>/.geminiignore` | Files/dirs to exclude from Gemini tools |

## settings.json — Full Schema

```json
{
  // Model selection
  "model": "gemini-2.5-pro",

  // UI theme: "dark" | "light" | "auto" | custom theme name
  "theme": "dark",

  // Auto-accept all tool confirmations (like --yolo)
  "autoAccept": false,

  // Tools to include (whitelist) — if set, only these are available
  "coreTools": ["read_file", "write_file", "run_shell_command", "google_web_search"],

  // Tools to explicitly exclude (blacklist)
  "excludeTools": ["dangerous_tool_name"],

  // Generation parameters
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.95,
    "thinkingBudget": 8192
  },

  // MCP server configurations
  "mcpServers": {
    "serverName": {
      "command": "node",
      "args": ["./server.js"],
      "cwd": "./mcp_tools",
      "env": {
        "API_KEY": "$MY_ENV_VAR"
      },
      "timeout": 15000,
      "trust": false,
      "includeTools": ["safe_tool_1"],
      "excludeTools": ["unsafe_tool"]
    }
  },

  // Sandbox settings
  "sandbox": {
    "enabled": false,
    "command": "docker"
  },

  // Telemetry
  "telemetry": {
    "enabled": true
  }
}
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API key (Option 2 auth) |
| `GOOGLE_API_KEY` | Vertex AI API key (Option 3 auth) |
| `GOOGLE_GENAI_USE_VERTEXAI` | Set to `true` to use Vertex AI |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID for Vertex AI |
| `GEMINI_MODEL` | Override default model |
| `GEMINI_SANDBOX` | Sandbox type (`docker`, `podman`, etc.) |

## GEMINI.md Context Files

Context files are plain Markdown. They're loaded hierarchically and merged.

```markdown
# Project Name

## Rules
- Always use TypeScript strict mode
- Prefer async/await over .then()

## Architecture
The project follows a microservices pattern.
Main services: auth, api, worker.

## Include external files
@./docs/api-reference.md
@./src/types/index.ts
```

**`@` file references** — include any file's content:
- `@./relative/path.md` — relative to GEMINI.md location
- `@/absolute/path.js` — absolute path

**Memory commands:**
```
/memory add "Staging database is on port 5432"
/memory show
```
(Writes to `~/.gemini/GEMINI.md`)

## .geminiignore

Similar to `.gitignore`. Place in project root.

```
# .geminiignore
/node_modules/
/dist/
*.log
*.env
secret-config.json
/backups/
```

Gemini CLI also respects `.gitignore` automatically.

## Model Configuration

```json
{
  "generationConfig": {
    "temperature": 1.0,
    "topP": 0.95,
    "topK": 64,
    "thinkingBudget": 8192,
    "maxOutputTokens": 8192
  }
}
```

- `thinkingBudget`: controls extended thinking for Gemini 2.5+ models
- Lower `temperature` = more deterministic output (good for code)
- Higher `temperature` = more creative (good for writing)

## System Prompt Override

Override the entire system prompt (advanced):

```bash
gemini --system-prompt "You are a strict TypeScript reviewer. Only respond with code issues."
```

Or via settings.json:
```json
{
  "systemPrompt": "You are a helpful assistant for Python development."
}
```

## Trusted Folders

Control which directories allow shell command execution:

```json
{
  "trustedFolders": ["/home/user/projects", "/workspace"]
}
```

## Token Caching

Enabled by default for large context files. Reduces costs and latency when GEMINI.md files are large.

```json
{
  "tokenCaching": {
    "enabled": true
  }
}
```