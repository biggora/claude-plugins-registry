---
name: typescript-expert
description: Apply TypeScript-specific guidance for type design, compiler diagnostics, tsconfig and module resolution, declaration emit, JavaScript migration, and version upgrades. Use when the task turns on TypeScript semantics or tooling; do not load it merely because an otherwise unrelated project happens to use TypeScript.
---

# TypeScript Expert

Use the project's installed TypeScript version and runtime/toolchain constraints as the source of truth. This guidance was checked against TypeScript 7.0.2, the stable `latest` release on 2026-08-29. When “latest” matters, verify the current stable tag and official release notes instead of relying on this date.

Canonical sources:

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [Official TypeScript releases](https://github.com/microsoft/TypeScript/releases)
- [Official TypeScript release blog](https://devblogs.microsoft.com/typescript/)

## Working Method

1. Inspect `package.json`, the lockfile, all applicable `tsconfig*.json` files and `extends` chains before recommending code or configuration.
2. Determine the actual compiler used by the failing command. Framework checkers such as `vue-tsc`, `svelte-check`, Angular, Astro, and MDX tooling may embed or constrain a different TypeScript version.
3. Reproduce the diagnostic with the project's existing script and local dependency. Do not silently download or substitute the newest compiler.
4. Fix the earliest root cause with the smallest runtime-preserving change. Re-run the same command; use a focused compile or type test only as additional evidence.
5. Report the compiler version, command, result, and any remaining baseline or compatibility limitation.

When the user asks for an upgrade, read [modern TypeScript releases](references/modern-typescript-releases.md) before editing. TypeScript 7 is the current stable CLI/compiler, but it does not yet expose a stable programmatic API and is not a drop-in replacement for every tool that embeds TypeScript. Keep compatible tooling on TypeScript 6 where the official 7.0 guidance requires it.

## Decision Rules

- Prefer inference for local values; annotate public boundaries when the annotation documents intent or catches implementation drift.
- Accept untrusted values as `unknown`, validate or narrow them at runtime, and keep the validated type aligned with the runtime check.
- Prefer discriminated unions for states, overloads for a small finite call surface, and generics only when they preserve a real relationship between inputs and outputs.
- Treat `as`, non-null assertions, `any`, `@ts-ignore`, and broad ambient declarations as evidence to investigate. Use a narrow assertion only when an invariant is established outside the type system and explain that invariant.
- Prefer `@ts-expect-error` over `@ts-ignore` only for an intentional, tested negative case or documented upstream limitation. Do not use either to make an ordinary type-check pass.
- Do not change runtime behavior merely to satisfy a type unless the existing runtime behavior is itself the bug.
- Do not recommend compiler flags in isolation. Choose `module`, `moduleResolution`, `target`, `lib`, emit settings, and file selection as one configuration for the actual runtime or bundler.
- Preserve framework-generated options and project references. Do not replace an existing `tsconfig` with a generic template.
- For libraries, validate declaration emit and consumer module resolution, not only the source project's `noEmit` check.
- For complex types, optimize for readable diagnostics and bounded compiler work; a simpler public type is often better than a perfectly computed one.

## Reference Router

Read only the references needed for the current task.

| Task | Reference |
|---|---|
| Primitives, inference, narrowing, literals, unions | [core-type-system](references/core-type-system.md) |
| `interface` vs `type`, extension and declaration merging | [core-interfaces-types](references/core-interfaces-types.md) |
| Generic functions, constraints and inference | [core-generics](references/core-generics.md) |
| Built-in utility types | [core-utility-types](references/core-utility-types.md) |
| Conditional types and `infer` | [advanced-conditional-types](references/advanced-conditional-types.md) |
| Mapped types and key remapping | [advanced-mapped-types](references/advanced-mapped-types.md) |
| Template literal types | [advanced-template-literals](references/advanced-template-literals.md) |
| Type guards and discriminated unions | [advanced-type-guards](references/advanced-type-guards.md) |
| Standard and legacy decorators | [advanced-decorators](references/advanced-decorators.md) |
| `tsconfig`, module resolution and emit | [best-practices-tsconfig](references/best-practices-tsconfig.md) |
| Domain modeling and API patterns | [best-practices-patterns](references/best-practices-patterns.md) |
| Slow type-checking or editor latency | [best-practices-performance](references/best-practices-performance.md) |
| TypeScript 5.0–7.0 features and migrations | [modern TypeScript releases](references/modern-typescript-releases.md) |

## Verification

Prefer a repository script such as `typecheck`, because it may invoke the framework-specific checker. Otherwise invoke the installed binary through the detected package manager:

```bash
npm exec -- tsc --noEmit
pnpm exec tsc --noEmit
yarn exec tsc --noEmit
bun run tsc --noEmit
```

Before adding `--noEmit`, check whether the project relies on declaration or JavaScript emit. For build mode, project references, framework projects, or declaration libraries, use the existing build command instead of forcing a generic invocation.
