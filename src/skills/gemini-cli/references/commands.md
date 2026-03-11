# Commands Reference

## CLI Flags (startup)

```
gemini [options] [prompt]

Options:
  -p, --prompt <text>          Non-interactive prompt (headless mode)
  -m, --model <model>          Model to use (e.g., gemini-2.5-pro)
  --output-format <format>     Output format: text (default), json, stream-json
  --include-directories <dirs> Comma-separated extra directories to include
  --auto-approve               Auto-accept all tool actions (no confirmations)
  --resume <session-id>        Resume a previous session
  --sandbox <type>             Run in sandboxed environment (docker, podman, etc.)
  -v, --version                Show version
  -h, --help                   Show help
```

## Slash Commands (interactive session)

### General

| Command | Description |
|---|---|
| `/help` | Show all available commands |
| `/quit` or `/exit` | Exit Gemini CLI |
| `/clear` | Clear the current conversation |
| `/bug` | Report a bug directly from CLI |
| `/stats` | Show token usage statistics |

### Tools

| Command | Description |
|---|---|
| `/tools` | List all available tools |
| `/tools enable <n>` | Enable a specific tool |
| `/tools disable <n>` | Disable a specific tool |

### MCP Servers

| Command | Description |
|---|---|
| `/mcp list` | List all configured MCP servers |
| `/mcp status` | Detailed status of all MCP connections |
| `/mcp enable <n>` | Enable a disabled MCP server |
| `/mcp disable <n>` | Disable an MCP server (without removing) |

### Chat / Sessions

| Command | Description |
|---|---|
| `/chat save <name>` | Save current conversation |
| `/chat resume <name>` | Resume a saved conversation |
| `/chat list` | List saved conversations |

### Context / Compaction

| Command | Description |
|---|---|
| `/compact` | Compact conversation context (free tokens) |
| `/diff` | Show diff of changes made in current session |

### Memory

| Command | Description |
|---|---|
| `/memory add <text>` | Add a persistent fact to GEMINI.md |
| `/memory show` | Display current memory contents |
| `/memory clear` | Clear all memory entries |
| `/memory reload` | Reload memory from disk |

### Checkpointing

| Command | Description |
|---|---|
| `/restore` | List available checkpoints |
| `/restore <filename>` | Restore a specific checkpoint |

### Extensions

| Command | Description |
|---|---|
| `/extensions list` | List installed extensions |
| `/extensions enable <n>` | Enable an extension |
| `/extensions disable <n>` | Disable an extension |

### Theme

| Command | Description |
|---|---|
| `/theme` | Show current theme |
| `/theme <name>` | Switch to a different theme |

## Built-in Tools (available to the model)

| Tool | Description |
|---|---|
| `read_file` | Read file contents |
| `write_file` | Write/create files |
| `replace` | Replace text in files (old_string → new_string) |
| `list_directory` | List directory contents |
| `glob` | Find files by pattern |
| `grep_search` | Search within files by pattern |
| `run_shell_command` | Execute shell commands |
| `google_web_search` | Search the web (Google Search grounding) |
| `web_fetch` | Fetch URL content |

## @ Reference Syntax

In any prompt, reference files and URLs:

```
@./relative/path.py         # include file content
@/absolute/path.txt         # absolute path
@https://example.com        # fetch URL content
@./folder/                  # include directory listing
```

Works in both interactive and headless mode:
```bash
gemini -p "Review @./src/auth.py for security issues"
gemini -p "Summarize @https://github.com/org/repo/README.md"
```

## Keyboard Shortcuts (interactive mode)

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Cancel current operation |
| `Ctrl+D` | Exit |
| `Ctrl+Y` | Toggle auto-approve mode (auto-accept tools) |
| `Ctrl+L` | Clear screen |
| `Ctrl+J` | Insert newline (multi-line input) |
| `↑ / ↓` | Navigate input history |
| `Tab` | Autocomplete slash commands and file paths |

## gemini mcp CLI Commands (outside session)

```bash
gemini mcp add <n> --command "<cmd>"
gemini mcp list
gemini mcp remove <n>
```

## gemini extensions CLI Commands (outside session)

```bash
gemini extensions install <url>
gemini extensions list
gemini extensions remove <n>
```