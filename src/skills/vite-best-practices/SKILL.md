---
name: vite-best-practices
description: Configure, migrate, debug, or review Vite applications, libraries, SSR integrations, and plugins. Use for vite.config files, HMR, import.meta APIs, Vite environment variables, Rolldown/Oxc migration, dependency optimization, or the Environment API; do not use for framework behavior that does not involve Vite.
---

# Vite Best Practices

This edition was verified against stable `vite@8.2.2` (August 2026). Vite 8 uses Rolldown for dependency optimization and production builds, Oxc for JavaScript transforms and minification, and Lightning CSS for CSS minification.

For version-sensitive work, confirm the project's installed Vite version first. If the user requests the latest version, also confirm the current `latest` npm dist-tag and use the matching official documentation; do not apply Vite 8-only options to older projects unless the task includes migration.

## Workflow

1. Inspect `package.json`, the lockfile, `vite.config.*`, framework plugins, and the scripts that actually invoke Vite. Frameworks may own or wrap Vite configuration.
2. Separate the requested fix from an upgrade. Preserve the installed major/minor unless the user asks to migrate or the requested API requires it.
3. Prefer a Vite-level option over low-level Rolldown/Oxc customization. Preserve existing JavaScript vs TypeScript and ESM conventions instead of rewriting the config format without need.
4. Treat release-candidate and experimental APIs as opt-in. State their status and compatibility limits, pin the Vite minor when relying on them, and add them only when the use case justifies the risk.
5. Verify with the repository's own checks. At minimum, run the relevant typecheck or config load plus a production build; exercise dev/HMR or SSR behavior when the change affects those paths.

## Vite 8 Configuration Names

Use current names in new or migrated Vite 8 configuration. Compatibility aliases still work but are deprecated:

| Deprecated alias | Current option |
|------------------|----------------|
| `build.rollupOptions` | `build.rolldownOptions` |
| `worker.rollupOptions` | `worker.rolldownOptions` |
| `esbuild` | `oxc` |
| `optimizeDeps.esbuildOptions` | `optimizeDeps.rolldownOptions` |
| `build.minify: 'esbuild'` | `build.minify: 'oxc'` (default for client builds) |

Do not mechanically rename nested options without checking the migration mapping. Some esbuild and Rollup options changed shape, are unsupported, or require a plugin-based replacement.

## Current Stable Capabilities

- Vite 8.2 adds top-level `input`, shared by dev, dependency optimization, normal builds, library mode, and SSR unless a more specific entry overrides it.
- `resolve.tsconfigPaths` is stable and opt-in. It follows TypeScript `files`/`include` matching and does not resolve Less imports.
- `server.forwardConsole` is enabled automatically when Vite detects a coding agent; configure it only when explicit log levels or deterministic behavior are needed.
- Vite 8.1 adds case-insensitive `import.meta.glob`, direct WebAssembly ESM imports, and custom HTML asset-source discovery.
- Lightning CSS is the default CSS **minifier**. Full CSS processing with `css.transformer: 'lightningcss'` remains experimental; PostCSS is the default transformer.
- Bundled dev mode, chunk import maps, Devtools integration, and parts of the Environment API are not fully stable. Do not enable them as generic defaults.

## Reference Routing

Read only the references relevant to the task:

| Task | Reference |
|------|-----------|
| Config loading, entries, aliases, Oxc, console forwarding, Devtools | [core-config](references/core-config.md) |
| Imports, assets, env variables, CSS, Wasm, HMR | [core-features](references/core-features.md) |
| Plugin hooks, virtual modules, hook filters, plugin compatibility | [core-plugin-api](references/core-plugin-api.md) |
| Production builds, chunking, libraries, MPA, SSR, JavaScript API | [build-and-ssr](references/build-and-ssr.md) |
| Custom runtimes or multi-environment framework/plugin work | [environment-api](references/environment-api.md) |
| Vite 7 to 8 or `rolldown-vite` migration | [rolldown-migration](references/rolldown-migration.md) |

## Verification Guidance

- Use the package manager recorded by the lockfile; do not regenerate a different lockfile.
- Prefer project scripts such as `typecheck`, `build`, and existing tests over ad hoc commands.
- For a config-only smoke check, run the real Vite command or build so Vite resolves the config and plugins.
- For library changes, inspect emitted formats, exports, CSS, and declaration generation separately; Vite does not generate TypeScript declarations by itself.
- For SSR changes, verify both client and server builds and at least one rendered request.
- Report experimental or unverified runtime paths explicitly instead of treating a successful client build as complete proof.

## Official Sources

- [Vite guide](https://vite.dev/guide/)
- [Configuration reference](https://vite.dev/config/)
- [Vite 8 migration guide](https://vite.dev/guide/migration)
- [Release policy and supported versions](https://vite.dev/releases)
- [Vite changelog](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)
