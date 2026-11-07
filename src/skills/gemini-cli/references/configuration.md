# Installation, authentication, and migration

Verified 2026-11-07. Use installed help for version-specific behavior.

## Installation

Only install/update when the task requires it. Official installers:

```powershell
# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex
agy --version
```

```bash
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
agy --version
```

Windows default binary: `%LOCALAPPDATA%\agy\bin\agy.exe`.
macOS/Linux default: `~/.local/bin/agy`. Reopen the terminal after PATH changes.
`agy update` updates an installation; it is not a diagnostic command.

## Authentication

Start interactive `agy` once for Google account sign-in. Existing local
Antigravity credentials can be reused through the OS keyring. Headless runs need
working credentials beforehand. Let the user complete browser sign-in.

For Gemini API-key mode, merge `"modelProvider": "gemini"` into
`~/.gemini/antigravity-cli/settings.json` and provide `GEMINI_API_KEY` through the
execution environment or CI secret store. The variable alone does not select
this provider. Preserve other settings; do not put keys in instructions or print
their values. To return to account authentication, remove `modelProvider` and
restart. `/logout` does not clear an environment key.

For Google Cloud ADC, follow the current authentication guide: configure ADC
for the intended project and enable `AGY_ADC_AUTH=true` as documented. Do not
assume legacy Vertex AI environment variables configure the new agent harness.

## Files and migration

| Purpose | Antigravity CLI location |
| --- | --- |
| User settings | `~/.gemini/antigravity-cli/settings.json` |
| Global MCP | `~/.gemini/config/mcp_config.json` |
| Workspace MCP | `<workspace>/.agents/mcp_config.json` |
| Workspace skills | `<workspace>/.agents/skills/` |
| Global skills | `~/.gemini/skills/` or `~/.gemini/antigravity-cli/skills/` |
| Workspace instructions | Existing `AGENTS.md` and `GEMINI.md` |
| Global instructions | `~/.gemini/GEMINI.md` |

First-launch onboarding can migrate selected legacy assets. When migration is
requested, inspect files and preserve unrelated entries. Convert extensions with
`agy plugin import gemini`; inspect the resulting plugins before enabling them.
Legacy command templates become skills. Do not assume old `.toml` commands or
`~/.gemini/settings.json` schemas work unchanged. MCP field changes are in
[MCP and plugins](mcp-and-extensions.md).

Use `/config` or `/settings` for supported settings. `--settings` accepts an
inline JSON object or file for session-only overrides without saving defaults.
Do not invent a complete settings schema from the old CLI.

Sources: [quickstart](https://antigravity.google/docs/getting-started/),
[authentication](https://antigravity.google/docs/install?tab=cli),
[settings](https://antigravity.google/docs/cli/using/),
[migration](https://antigravity.google/docs/cli/gcli-migration/).
