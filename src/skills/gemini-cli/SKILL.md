---
name: gemini-cli
description: Use Google Antigravity CLI (agy) for Gemini-powered terminal tasks, second opinions, headless automation, configuration, MCP, and migration from Gemini CLI. Also use when the user explicitly requests Google Gemini media capabilities, including image editing, music, speech, video generation, or multimodal analysis through Antigravity or the Gemini API. The legacy skill name is retained for compatibility.
---

# Antigravity CLI and Gemini

Use `agy`, Google's Antigravity CLI, as the terminal agent. Keep this skill's
existing folder and invocation name `gemini-cli` for compatibility; launch `agy`.

Core commands verified on 2026-11-07 against local `agy 1.5.2` and official docs;
native image generation also passed a live test with `agy 1.5.3`, using an
existing Google account sign-in without a separate API key.
Recheck installed help and live model availability before relying on flags,
model IDs, quotas, or preview endpoints.

## Choose the execution surface

| Request | Route |
| --- | --- |
| Ask Gemini, analyze code, research, get a second opinion | Interactive `agy` or `agy -p` |
| Automate a task or parse an answer | [Headless and scripting](references/headless-and-scripting.md) |
| Use `--dangerously-skip-permissions` or diagnose denied tools | [Permission bypass and diagnostics](references/headless-and-scripting.md#explicit-use-of---dangerously-skip-permissions) |
| Install, authenticate, migrate settings/context | [Configuration](references/configuration.md) |
| Add MCP, plugins, skills, or hooks | [MCP and plugins](references/mcp-and-extensions.md) |
| Select a model or analyze existing media/PDF | [Models and multimodal input](references/models.md) |
| Generate/edit images, music, narration, or video | [Media workflows](references/media.md) |
| Find flags, interactive commands, session controls | [Commands](references/commands.md) |

Antigravity reasoning models, its built-in image tool, and Gemini API media
endpoints are different capabilities. Do not assume `agy --model lyria-3.5` or
an image-model ID works. Select CLI slugs from `agy models` and API IDs from the
current Gemini API catalog. Do not silently substitute another provider when
Google Gemini is requested.

## Start with the installed CLI

```powershell
Get-Command agy
agy --version
agy --help
agy models
```

If missing, use the official installer in the configuration reference. Do not
install an unrelated npm package named `agy` or reinstall the old Gemini CLI.
Run in the intended directory. Specify inputs, output, allowed edits, and a
completion check. For a second opinion, request analysis only.

```powershell
agy -p 'Explain the responsibilities of this project. Do not edit files or run commands.' --model gemini-3.8-flash-medium --print-timeout 2m
agy --mode=plan
```

The example model was returned by this account's model listing; reselect it if
availability changes. Use Flash for routine tasks and a stronger available Gemini
model for difficult reasoning.

## Preserve task boundaries

- Pass only needed context. Google receives submitted prompts/media; exclude
  secrets and unrelated private files.
- Preserve existing authorization. Advice does not authorize code changes,
  plugin installation, publication, or API spending.
- Keep configured permissions or use scoped rules for automation. A denied
  headless tool can accompany exit code zero: inspect diagnostics and verify
  the actual task outcome.
- Do not automatically add `--dangerously-skip-permissions` to fix a denial.
  When the user has selected it for the current task, use the flag directly
  within that task's existing authorization; do not ask for the same approval
  again or turn it into a global default. It auto-approves tool requests,
  including commands and writes. See the linked permission examples;
  `--mode=plan` does not turn the bypass into enforced read-only containment.
  `--auto-approve` and `--yolo` are not `agy` flags. `--mode=auto` requires a
  supported sandbox/account and can fall back to default mode.
- Prefer Antigravity's image workflow when suitable and the user requested that
  surface. Dedicated Gemini API endpoints need separate credentials and billing;
  account sign-in alone does not provide either.
- Stop on authentication, billing, quota, or unsupported-model errors and report
  the cause. Do not repeatedly retry billable generations. Retry a transient
  error only within the existing task's time/cost allowance.
- Return actual output paths and checks. A description of a song or image is
  not a generated media file. Read image dimensions from the file, not the
  agent's description; the native image workflow includes a verification example.

## Migration context

Google ended consumer Gemini CLI service for free/Google AI Pro/Ultra access on
2026-06-18. Enterprise and paid API-key paths were explicitly retained in the
[transition announcement](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/).
Default to Antigravity as requested; do not describe the old CLI as universally
unsupported or migrate its configuration by renaming the executable.

Sources: [CLI docs](https://antigravity.google/docs/cli/reference/),
[migration](https://antigravity.google/docs/cli/gcli-migration/),
[Gemini API catalog](https://ai.google.dev/gemini-api/docs/models).
