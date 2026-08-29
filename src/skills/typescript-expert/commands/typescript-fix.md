---
description: Run the project's TypeScript checker, diagnose root causes, apply minimal type-safe fixes, and verify with the same command
allowed-tools: ["Read", "Edit", "Write", "Glob", "Grep", "Bash"]
---

Use the `typescript-expert` skill. Preserve the user's scope and the project's runtime behavior.

## 1. Discover the Actual Checker

Inspect:

- `package.json`, workspaces, and the lockfile to identify the package manager;
- all relevant `tsconfig*.json` files and their `extends` chains;
- the installed TypeScript version;
- existing `typecheck`/build scripts and framework checkers such as `vue-tsc`, `svelte-check`, Angular, Astro, or MDX tooling;
- the current working-tree diff so unrelated user changes are preserved.

If TypeScript 7 is installed or proposed, check whether the toolchain imports the Compiler API or requires the TypeScript 6 compatibility line. Do not upgrade dependencies unless the user requested an upgrade.

## 2. Establish the Baseline

Run the repository's existing type-check script. If none exists, invoke the local compiler through the detected package manager; do not use a command that can silently download a different TypeScript version.

Examples:

```bash
npm exec -- tsc --noEmit
pnpm exec tsc --noEmit
yarn exec tsc --noEmit
bun run tsc --noEmit
```

Do not force `--noEmit` when the project validates declarations, uses project references/build mode, or relies on emit. Capture the command, compiler/checker version, exit code, and complete diagnostics.

If the baseline is clean, report it and stop. If the command cannot run for an environmental reason, report `BLOCKED` rather than editing from guessed diagnostics.

## 3. Find Root Causes

Group related diagnostics, but fix dependency order rather than raw error count:

1. wrong project/config or file selection;
2. missing or incompatible declarations and module resolution;
3. incorrect shared domain/API types;
4. implementation narrowing, generics, and nullability;
5. isolated downstream errors.

For each group, inspect the source, the expected runtime behavior, and the declaring dependency. A single wrong export or widened type can cause many secondary diagnostics.

## 4. Apply Minimal Type-safe Fixes

- Preserve public and runtime behavior unless the task explicitly changes it.
- Prefer sound narrowing, corrected type relationships, and runtime validation over assertions.
- Use `unknown` at untrusted boundaries; do not introduce `any` to silence a diagnostic.
- Do not add broad ambient module declarations for packages that have real types.
- Do not use non-null assertions without proving the invariant.
- Use `@ts-expect-error` only for an intentional negative type test or documented upstream limitation, with a reason and a check that the directive remains necessary.
- Avoid unrelated formatting, refactors, config replacement, dependency upgrades, and generated-file edits.
- Ask before adding a new dependency when existing project metadata does not already establish that dependency as required.

After each root-cause group, run the smallest meaningful check when useful. Periodically re-run the exact baseline command because fixes can expose or remove downstream diagnostics.

## 5. Verify and Report

Re-run the exact baseline command. Also run the relevant build, declaration emit, framework checker, or focused tests when the change can affect them.

Report:

- checker and version;
- baseline command and initial diagnostic count;
- root causes and changed files;
- final command and result;
- remaining diagnostics or blocked checks, clearly separated from fixed issues.

Do not claim success from plain `tsc` if the project's authoritative checker includes templates, generated types, project references, or custom transforms.
