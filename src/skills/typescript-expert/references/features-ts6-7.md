# TypeScript 6.0 and 7.0

As of Nov 2026: 6.0 (2026-03-23) is the last JavaScript-codebase release and bridges to 7.0. 7.0 (stable 7.0.2, 2026-07-08) is the native Go port, shipped as the `typescript` package with the `tsc` binary. 7.0 adopts 6.0's defaults and turns 6.0's deprecations into hard errors. 7.1 is in beta (not stable).

## Version selection

| Situation | Default decision |
|-----------|------------------|
| Plain `tsc` CLI project with compatible configuration | 7.0.x is the current stable line |
| Tool imports the `typescript` package or Compiler API | Verify support first; 7.0 ships no programmatic compiler API |
| Vue, Svelte, Astro, MDX, or another specialized template checker | Follow that tool's support matrix; official 7.0 guidance says these may need 6.0 |
| Angular | Template checking may need 6.0; use the 7.0 CLI separately only if the project supports that split |

Do not upgrade the dependency merely because newer syntax exists. Confirm the task authorizes a dependency upgrade, then verify framework peers, plugins, declaration tooling, editor integration, and CI. Do not replace a framework checker (`vue-tsc`, `svelte-check`, Angular, Astro) with plain `tsc`: it can skip template or embedded-language diagnostics and report a false green.

## Upgrade order

1. Move to 6.0 first and fix the deprecation warnings (silence temporarily in 6.x with `"ignoreDeprecations": "6.0"`; the removed options error in 7.0). Treat suppression as a short bridge, not the fix. Optionally diagnose with `stableTypeOrdering` in 6.0, which matches 7.0's ordering but can slow checking substantially; use it for migration diagnosis only.
2. Move to 7.0 once tooling allows (see Tool compatibility).

## New defaults (6.0, kept in 7.0)

| Option | New default | Do |
|--------|-------------|----|
| `types` | `[]` (was: every `@types/*` package) | List what you need: `"types": ["node"]`; `["*"]` restores the old behavior |
| `rootDir` | the tsconfig directory (was inferred) | Set `"rootDir": "./src"` or output lands in `dist/src/` |
| `strict` | `true` | Set `"strict": false` only to opt out |
| `module` | `esnext` | Set it explicitly for Node (`nodenext`) |
| `target` | latest stable ES version (`es2025` in 6.0) | Set it explicitly if you ship to older runtimes |
| `noUncheckedSideEffectImports` | `true` | Typos in `import "./x"` now error |
| `libReplacement` | `false` | None |

Symptom of a missing `types` entry: `Cannot find name 'process'` / `'describe'`.

6.0 also adds improved inference for functions that do not use `this`, `#/` package subpath imports (under supported resolution modes), and `moduleResolution: "bundler"` combined with `module: "commonjs"`.

## Removed options (deprecated in 6.0, error in 7.0)

```jsonc
// Before                                  → After
"baseUrl": "."                             // remove; put the prefix in each paths target
"paths": { "@/*": ["src/*"] }              // "paths": { "@/*": ["./src/*"] }
"moduleResolution": "node"                 // "bundler" (apps; allowed with module commonjs) or "nodenext" (Node)
"moduleResolution": "classic"              // "bundler" or "nodenext"
"target": "es5", "downlevelIteration": ... // target es2015+ (or an external compiler for ES5)
"module": "amd" | "umd" | "systemjs" | "none"  // "esnext" / "preserve" with a bundler
"esModuleInterop": false                   // always on; use `import express from "express"`
"allowSyntheticDefaultImports": false      // always on
"alwaysStrict": false                      // always on
"outFile": ...                             // use a bundler
```

Syntax errors: `module Foo {}` (write `namespace Foo {}`; `declare module "x"` is fine) and `import x from "./a.json" asserts { type: "json" }` (write `with`). `tsc foo.ts` in a directory containing a tsconfig errors (TS5112); pass `--ignoreConfig` or use the project.

## Native `tsc` (7.0)

- Install `typescript@7` and run `tsc`; parsing, checking, and emit run in parallel, the watch mode is rebuilt, and full builds are about 10x faster (measure on your repository; do not promise a fixed speedup). New flags: `--checkers` (type-check workers, default 4), `--builders` (parallel project-reference builds), `--singleThreaded` (debugging or constrained environments). The parallelism flags are experimental: keep defaults until measurement shows a bottleneck, and pin `--checkers` across CI and local runs if results must match exactly.
- `stableTypeOrdering` is always on; union ordering in `.d.ts` output can differ from 6.x. 7.0 aims to match 6.0 with `stableTypeOrdering` enabled and no ignored deprecations.
- Template-literal inference treats Unicode code points naturally, so type-level string utilities that deliberately modeled UTF-16 code units may change.
- 7.0 ships no programmatic compiler API (7.1 beta adds a new one). The `@typescript/native-preview` / `tsgo` nightlies are being replaced by `typescript@next`.
- JS files: checking follows `.ts` rules; `@enum` and Closure-style types are no longer recognized.

## Tool compatibility

Tools that `import "typescript"` (typescript-eslint, editor/framework plugins, language-service plugins, template-aware checkers) need the 6.0 API. As of Nov 2026 typescript-eslint 8.72.2 declares peer `typescript >=4.8.4 <6.1.0`, so it rejects 7.x. Don't bump `typescript` to 7 in a project that uses it without the alias; keep 6.x for tooling and add 7 for `tsc` (the official release documents this `@typescript/typescript6` alias arrangement; add it only when the actual toolchain requires it):

```jsonc
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",           // `tsc` is 7.0
    "typescript": "npm:@typescript/typescript6@^6.0.2"       // tooling imports 6.0; binary is `tsc6`
  }
}
```

## `erasableSyntaxOnly` (5.8+) with Node type stripping

For code run directly by Node (`node app.ts`), set `"erasableSyntaxOnly": true` so enums, runtime namespaces, and parameter properties fail at compile time. See [features-ts5x](features-ts5x.md#--erasablesyntaxonly).

## Upgrade checklist

1. Record the current compiler, checker command, emitted artifacts, and baseline diagnostics.
2. Read every release note between the current and target versions, including behavioral changes.
3. Check framework, plugin, linter, transformer, and declaration-tool compatibility.
4. Upgrade one compatibility boundary at a time; for 5.x projects, adopt 6.0 and clear its deprecations before 7.0.
5. Run the repository's type-check, build, tests, declaration emit, and representative consumer checks.
6. Compare output paths, module specifiers, ambient types, and diagnostics. A clean type-check alone does not prove equivalent emit.

## Official sources

- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
