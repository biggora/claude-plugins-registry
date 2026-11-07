# MCP, plugins, and reusable instructions

Read `agy mcp add --help` and `agy plugin --help` before changing configuration.

## MCP

CLI servers belong in `~/.gemini/config/mcp_config.json` or workspace
`.agents/mcp_config.json`, under `mcpServers`, rather than legacy settings.json.

```json
{
  "mcpServers": {
    "recipe-tools": {
      "command": "python",
      "args": ["-m", "recipe_mcp"],
      "enabledTools": ["search_recipes"],
      "timeoutSeconds": 180
    }
  }
}
```

Use the actual installed module/executable. Supply credentials through the parent
execution environment or an existing secret mechanism. Do not insert a literal
key or assume old `$VAR` interpolation carries over to `env` values.
For remote Streamable HTTP use `serverUrl`. Current docs support `${VAR}` in
headers, e.g. `"Authorization": "Bearer ${RECIPE_TOKEN}"`; never print resolved
headers. Legacy `httpUrl` and HTTP+SSE are unsupported in CLI configuration.

| Old field | Antigravity field |
| --- | --- |
| `includeTools` | `enabledTools` |
| `excludeTools` | `disabledTools` |
| `timeout` in milliseconds | `timeoutSeconds` in seconds |

Do not transfer `trust: true` as a blanket permission grant. Merge entries while
preserving unrelated configuration.

```powershell
agy mcp list
agy mcp add recipe-tools python -m recipe_mcp
agy mcp add recipe-api https://example.com/mcp
```

The add examples are alternatives to editing JSON, and require the integration
to be requested. In 1.5.2 all MCP flags must precede the server name, e.g.
`agy mcp add --type http recipe-api URL`. Check which file was written, reload,
and use `/mcp` to inspect connection state and exposed tools. Do not call a
mutating tool merely to test the connection.

## Plugins, skills, hooks

`agy plugin list` inspects plugins; `agy plugin import gemini` migrates legacy
extensions and converts commands to skills. `agy plugin validate PATH` checks a
plugin, not a standalone skill. For new packages, follow the current
[plugin authoring guide](https://antigravity.google/docs/build-plugins/) rather
than copying a `gemini-extension.json` manifest.

Reusable workspace prompts go in `.agents/skills/<name>/SKILL.md` with `name`
and `description` frontmatter. Convert the intent of `.toml` commands into
instructions. Legacy shell expansion such as `!{git diff}` is not guaranteed to
execute in a Markdown skill. For a commit-message skill, instruct the agent to
read the staged diff and draft text; do not automatically commit.

Use `/skills`, `/plugin`, and `/hooks` for discovery. For lifecycle automation,
read the current [hook schema](https://antigravity.google/docs/hooks/) and
configure only requested events. Browser, remote-control, scheduling, and agent
orchestration features do not expand the task's authorization.

Sources: local subcommand help,
[MCP](https://antigravity.google/docs/mcp?tab=cli),
[migration](https://antigravity.google/docs/cli/gcli-migration/),
[skills](https://antigravity.google/docs/skills/).
