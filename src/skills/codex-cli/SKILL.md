---
name: codex-cli
description: "Install, configure, troubleshoot or automate OpenAI Codex CLI, including codex exec, authentication, permissions, MCP and built-in image generation from the terminal. Use for CLI image workflows and GitVane POD jobs; ordinary image requests use the imagegen skill directly."
---

# Codex CLI

Run coding or image tasks through the installed CLI. Preserve the user's model, authentication and generation method. Updating this skill does not authorize installing software or generating images.

## Discover the installed capabilities

Reviewed **2026-09-27**: local CLI **0.157.0**, npm `latest` **0.157.1**. These are dated observations, not permanent defaults.

Before using version-sensitive options, inspect the relevant installed help:

```powershell
codex --version
codex --help
codex exec --help
codex login status
codex features list
```

For an installation/update request, check `npm view @openai/codex version` and official release notes. Use `npm install -g @openai/codex@latest` only when installation/update is authorized. Installed help decides which flags the binary accepts; report conflicts with online examples. Retain the configured model unless the user selects another.

## Choose the execution mode

| Request                                | Entry point                                                    |
| -------------------------------------- | -------------------------------------------------------------- |
| Interactive terminal task              | `codex` or `codex "task"`                                      |
| Scripted task                          | `codex exec` (`codex e` alias)                                 |
| Continue a known task                  | `codex exec resume <session-id> "follow-up"`                   |
| Generate/edit images through Codex CLI | Read [image workflows](references/image-generation.md)         |
| Configure MCP                          | Inspect `codex mcp --help` and its add/list/get/login commands |
| App integration                        | Inspect `codex app-server --help` and its protocol             |

Use a specific session ID in automation; `resume --last` can pick an unrelated session. In 0.157, the TUI can use the shared background server; `--no-daemon` is a TUI option when needed. Do not assume every top-level option is supported by `exec`.

## Authentication and permissions

- Account login: `codex login`; use `codex login --device-auth` when appropriate. Check `codex login status` before automation.
- API-key login, only when requested: pipe an existing environment variable to `codex login --with-api-key`. Never print the key or put it in command arguments/tracked files. Repair login through supported commands, not deletion of authentication files.
- Installed 0.157.0 accepts approval policies `on-request` and `never`; confirm other policies against the target version.
- Sandbox modes: `read-only`, `workspace-write`, `danger-full-access`. Use `--add-dir` for required external output folders. `never` suppresses prompts, not access restrictions.
- `--approve-for-me` requests automatic approval review; a rejection does not authorize bypassing it. Do not silently switch to full access, bypass approvals or disable hook trust checks.

Interactive example:

```powershell
codex -a on-request -s workspace-write "Implement the requested change"
```

## Non-interactive tasks

Pass long prompts through stdin from a UTF-8 file. This preserves newlines and avoids shell interpolation of quotes, backticks and dollar signs.

```powershell
# Run from the intended repository root.
$codexRepoDir = (Get-Location).Path
$codexTaskFile = Join-Path $codexRepoDir 'task.txt'
$codexResultFile = Join-Path $codexRepoDir 'result.txt'
$OutputEncoding = [Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath $codexTaskFile -Raw -Encoding utf8 -ErrorAction Stop |
  codex -a never exec -C $codexRepoDir -s workspace-write --json -o $codexResultFile -
```

`--json` emits JSONL events, not one JSON object. `-o` saves the final message, not image bytes. `--output-schema <file>` constrains the final response with an actual JSON Schema. Check exit status and persisted results; an agent message does not prove an import succeeded. Preserve useful diagnostics without exposing secrets.

`--ephemeral` disables session persistence; use it only when history/resume are unnecessary. `--skip-git-repo-check` supports intentional work outside Git. Neither grants file access.

For application launchers, use argument arrays and stdin rather than concatenating user text into shell commands. On Windows resolve the executable/shim: a PowerShell `.ps1` shim is not directly executable by every process API. Do not automatically retry costly or externally mutating tasks.

## Configuration, skills and tools

Configuration is TOML. Resolve `CODEX_HOME`, falling back to the user's `.codex` directory; preserve unrelated settings and secrets. Inspect the current configuration reference/schema before editing it.

In installed 0.157.0, `-p <name>` help describes layering `$CODEX_HOME/<name>.config.toml` over base configuration. Older guides use `[profiles.<name>]` inside `config.toml`. Verify the target version before writing either layout.

Repository skills use `.agents/skills/<name>/SKILL.md`; user/system skill roots can differ. Invoke with `$skill-name`. Use single-quoted PowerShell prompts or a task file to avoid expanding the skill name as a shell variable.

Shell networking depends on effective sandbox settings. When required, the workspace-write setting `-c 'sandbox_workspace_write.network_access=true'` can enable shell networking. It does not establish account access to built-in tools. Check TUI `/status` and `/permissions` or current CLI diagnostics.

`codex mcp` manages external servers; invoking it does not publish Codex as an MCP server. Use the documented `codex app-server` protocol for app integration.

## Replace stale examples

| Old example                              | Current guidance                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `--full-auto`                            | Prefer explicit `-a` / `-s`; docs mark it deprecated, installed help omits it |
| `--path`                                 | `--cd` / `-C`                                                                 |
| `codex exec --resume ID`                 | `codex exec resume ID`                                                        |
| `--images`                               | `--image` / `-i`: input attachment, not image generation                      |
| `--live-search`                          | Top-level `--search`, where supported                                         |
| `--no-persist`                           | `exec --ephemeral`                                                            |
| Repository `.codex/skills/name/skill.md` | `.agents/skills/name/SKILL.md`                                                |

## Completion evidence

Report changes, the version inspected, checks actually executed, saved artifact paths and unresolved errors. Distinguish configured image capabilities from a successful tool call and verified import. Do not generate merely to validate documentation unless requested.

## Official sources

- [CLI reference](https://developers.openai.com/codex/cli/reference/)
- [Non-interactive execution](https://developers.openai.com/codex/noninteractive/)
- [Skills](https://developers.openai.com/codex/skills/)
- [Configuration](https://developers.openai.com/codex/config-reference/)
- [Release notes](https://github.com/openai/codex/releases)
- [Published npm version](https://registry.npmjs.org/@openai/codex/latest)
- [Official ImageGen skill](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/imagegen/SKILL.md)
