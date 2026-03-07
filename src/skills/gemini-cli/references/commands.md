# Commands Reference

## CLI Flags (startup)

```
gemini [options] [prompt]

Options:
  -p, --prompt <text>          Non-interactive prompt (headless mode)
  -m, --model <model>          Model to use (e.g., gemini-2.5-pro)
  --output-format <format>     Output format: text (default), json, stream-json
  --include-directories <dirs> Comma-separated extra directories to include
  --yolo                       Auto-accept all tool actions (no confirmations)
  --resume <session-id>        Resume a previous session
  --system-prompt <text>       Override system prompt
  --raw-output                 Disable ANSI codes in output
  --debug-log <path>           Write debug JSONL log to file
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

### Memory

| Command | Description |
|---|---|
| `/memory add <text>` | Add a persistent fact to GEMINI.md |
| `/memory show` | Display current memory contents |
| `/memory clear` | Clear all memory entries |

### Checkpointing

| Command | Description |
|---|---|
| `/restore` | List available checkpoints |
| `/restore <filename>` | Restore a specific checkpoint |

### Extensions

| Command | Description |
|---|---|
| `/extension list` | List installed extensions |
| `/extension enable <n>` | Enable an extension |
| `/extension disable <n>` | Disable an extension |

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
| `search_file_content` | Search within files by pattern |
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
| `Ctrl+Y` | Toggle YOLO mode (auto-accept tools) |
| `Ctrl+L` | Clear screen |
| `↑ / ↓` | Navigate input history |
| `Tab` | Autocomplete slash commands |

## gemini mcp CLI Commands (outside session)

```bash
gemini mcp add <n> --command "<cmd>"
gemini mcp list
gemini mcp remove <n>
```

## gemini extension CLI Commands (outside session)

```bash
gemini extension install <url>
gemini extension list
gemini extension remove <n>
```