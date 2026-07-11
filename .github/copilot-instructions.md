# Repository instructions

This repository publishes `@biggora/claude-plugins`, a Node.js ESM CLI and a collection of agent skills. Node.js 18 or newer is required. There is no build step.

- Run `npm ci` before validation and `npm test` before claiming completion.
- Keep shell operations on `execFileSync`; do not replace them with shell-string execution.
- Keep changes focused. Match the existing JavaScript style.
- When adding or changing a skill, update its `SKILL.md`, `registry/registry.json`, README documentation, and relevant validation tests together.
- Treat `registry/registry.json` as the npm CLI catalog. The native Claude, Codex, and Copilot marketplaces have separate schemas and paths.
- Preserve user files and unrelated worktree changes. Never commit secrets, credentials, generated evaluation output, or local workspace directories.
