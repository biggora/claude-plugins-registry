# Antigravity command reference

Checked against local `agy 1.5.2` and `1.5.3` on 2026-11-07. Discover installed behavior with
`agy --help` and `agy <subcommand> --help` before composing commands.

| CLI option | Purpose |
| --- | --- |
| `-p`, `--print`, `--prompt` | One prompt, then exit |
| `-i`, `--prompt-interactive` | Initial prompt, then interactive conversation |
| `--model` | A slug from `agy models` |
| `--effort` | Model-supported effort; installed help lists low/medium/high/xhigh/max |
| `--add-dir` | Add a workspace directory; repeatable |
| `--output-format` | `text`, `json`, or `stream-json` |
| `--input-format stream-json` | Persistent NDJSON input; requires stream-json output |
| `--json-schema` | Schema string or file for structured output |
| `-c`, `--continue` | Continue most recent conversation |
| `--conversation` | Resume a specific conversation ID |
| `--print-timeout` | Bound a headless run, e.g. `2m`; zero means no limit |
| `--mode` | `plan`, `accept-edits`, or `auto`; unset uses configured mode |
| `--sandbox` | Enable terminal restrictions |
| `--dangerously-skip-permissions` | Auto-approve all tool permission requests for this run, including commands and writes |
| `--settings` | Session-only settings JSON or file |
| `--agent` | An agent listed by `agy agents` |

For explicit bypass use, `--mode=plan` combinations, and denied-action diagnostics,
read [the headless permission examples](headless-and-scripting.md#explicit-use-of---dangerously-skip-permissions).
Use the flag when selected within the task's authorization; do not add it to
every invocation. Old `-m`, `--include-directories`, `--resume`,
`--auto-approve`, and `--yolo` must not be carried over without installed support.

## Interactive discovery

Type `/` or `/help` for the installed command list. Useful commands:

| Command | Purpose |
| --- | --- |
| `/model`, `/effort` | Model and reasoning effort |
| `/config`, `/permissions` | Settings and permissions |
| `/mcp`, `/plugin`, `/skills`, `/hooks` | Manage extensions to the agent |
| `/resume`, `/fork`, `/clear` | Resume, branch, or reset conversation |
| `/diff`, `/artifact`, `/context` | Inspect changes, artifacts, and context |
| `/usage`, `/credits` | Account quota/credit information |
| `/plan` | Plan a task |

Commands such as `/browser`, `/teamwork`, `/goal`, and `/voice` depend on version,
surface, and account. Check availability before promising them. Voice interaction
with the terminal differs from exporting TTS audio. Workspace rules still govern
delegation and external actions.

Use `@` path completion interactively; quote paths containing spaces. Automation
can name explicit paths in plain task text instead of relying on UI completion.
Do not assume legacy `@URL` or shell-template expansion works.

Sources: local `agy --help`, `agy -p /help`,
[CLI reference](https://antigravity.google/docs/cli/reference/).
