# Modern TypeScript Releases

Use this reference for version-specific implementation, configuration, and migration work. Confirm the project's installed version before applying a feature. If the user asks for the latest release, verify the npm `latest` tag and the official release announcement at task time.

As of 2026-08-29, the stable npm release is TypeScript 7.0.2. TypeScript 7 is a native Go implementation with important compatibility boundaries; “stable” does not mean every Compiler API or embedded-language tool can migrate immediately.

## Version Selection

| Situation | Default decision |
|---|---|
| Plain `tsc` CLI project with compatible configuration | TypeScript 7.0.x is the current stable line |
| Tool imports the `typescript` package or Compiler API | Verify support; TypeScript 7 has no stable programmatic API yet |
| Vue, Svelte, Astro, MDX, or specialized template checker | Follow that tool's support matrix; official 7.0 guidance says these may need TypeScript 6.0 |
| Angular project | Specialized template checking may need 6.0; the 7.0 CLI can be used separately only if the project supports that split |
| Migration from 5.x | Move to 6.0 first, remove deprecations, optionally diagnose with `stableTypeOrdering`, then evaluate 7.0 |

Do not upgrade the dependency merely because newer syntax exists. Ask whether the task authorizes a dependency upgrade, then verify framework peers, plugins, declaration tooling, editor integration, and CI.

## TypeScript 5.x Features Still Relevant

### 5.0

- Standard decorators use `(value, context)` semantics without `experimentalDecorators`; legacy decorator frameworks remain a separate mode.
- `const` type parameters preserve literal inference at generic call sites.
- `verbatimModuleSyntax` makes type-only imports and the emitted module surface explicit.
- `moduleResolution: "bundler"` models bundler resolution and should not be used as a generic Node.js setting.

### 5.2

- `using` and `await using` implement explicit resource management through `Symbol.dispose` and `Symbol.asyncDispose`.
- Decorator metadata is available through `context.metadata`/`Symbol.metadata`; it is not a replacement for legacy emitted design-type metadata.

### 5.4

- `NoInfer<T>` prevents a parameter position from contributing inference candidates.

### 5.5

- Type predicates can be inferred for simple single-return refinements such as `value => value !== undefined`.
- Do not claim that `filter(Boolean)` removes all nullish members. Truthiness is not an if-and-only-if refinement for values such as `0` and `""`; write the intended comparison or a sound predicate.

```typescript
const values = [0, 1, undefined];
const defined = values.filter(value => value !== undefined); // number[]
```

### 5.6

- Iterator helpers are declared for the ECMAScript iterator-helper runtime APIs.
- `strictBuiltinIteratorReturn` improves built-in iterator return typing and is included in strict checking for this line.
- `noUncheckedSideEffectImports` reports unresolved side-effect-only imports.

Availability of a type declaration does not polyfill a runtime. Match `target`/`lib` and runtime support.

### 5.7

- `rewriteRelativeImportExtensions` rewrites explicit relative `.ts`, `.tsx`, `.mts`, and `.cts` specifiers to JavaScript extensions during emit.
- It does not rewrite package specifiers, path aliases, extensionless imports, or arbitrary dynamic-import expressions.

```jsonc
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true
  }
}
```

### 5.8

- `erasableSyntaxOnly` rejects syntax that requires TypeScript-specific runtime transformation, which is useful for runtimes that strip types directly.
- Return expressions receive more precise branch-level checking in common conditional-expression cases.

### 5.9

- `import defer * as namespace` defers module evaluation until an exported property is accessed. TypeScript does not downlevel it; use only with `module: "preserve"` or `"esnext"` and a supporting runtime or transform.
- `module: "node20"` is a stable model for Node.js 20 behavior; unlike `nodenext`, it is not intended to float with newer Node behavior.
- `tsc --init` produces a smaller modern starting configuration. It is a starting point, not a reason to replace project-owned settings.

## TypeScript 6.0: Migration Release

TypeScript 6.0 remains API-compatible with 5.9 and is the compatibility line for tooling that cannot yet embed TypeScript 7.

Notable additions include improved inference for functions that do not use `this`, `#/` package subpath imports under supported resolution modes, and support for combining `moduleResolution: "bundler"` with CommonJS where needed during migration.

### New Defaults

- `strict: true`
- `module: "esnext"`
- `target` floats to the most recent supported ECMAScript version (ES2025 in 6.0)
- `noUncheckedSideEffectImports: true`
- `rootDir: "."`
- `types: []`

Keep important settings explicit in shared configurations. Projects that relied on implicit ambient types may need a deliberate list such as `types: ["node", "jest"]`; projects that relied on inferred source layout may need `rootDir: "./src"`.

### Deprecations to Remove Before 7.0

TypeScript 6.0 can temporarily suppress its deprecation diagnostics with `ignoreDeprecations: "6.0"`, but TypeScript 7 removes the deprecated behavior. Treat suppression as a short migration bridge, not the fix.

- ES5 target and `downlevelIteration`
- `moduleResolution: "node"`/`"node10"` and `"classic"`
- `module: "amd"`, `"umd"`, `"system"`/`"systemjs"`, and `"none"`
- `baseUrl`; make `paths` targets relative to the tsconfig instead
- disabling `esModuleInterop`, `allowSyntheticDefaultImports`, or strict-mode semantics
- `outFile`
- legacy `module` namespace syntax and import assertions using `assert`

`stableTypeOrdering` exists only to compare 6.0 behavior with 7.0 and can slow checking substantially. Use it for migration diagnosis, not as a permanent performance recommendation.

## TypeScript 7.0

TypeScript 7.0 moves the compiler and language server to a native Go implementation. The official release reports roughly order-of-magnitude speedups on many codebases, parallel parsing/checking/emit, and a rebuilt cross-platform watch mode. Measure on the actual repository; do not promise a fixed speedup.

### Behavior and Configuration

- TypeScript 7 aims to match TypeScript 6 with `stableTypeOrdering` enabled and no ignored deprecations.
- TypeScript 6 defaults are adopted; deprecated 6.0 flags and constructs become hard errors or no-ops.
- `target: "es5"`, Node 10/classic resolution, `baseUrl`, legacy module outputs, and disabling interop/strict semantics are unsupported.
- Template-literal inference treats Unicode code points naturally, so type-level string utilities that intentionally modeled UTF-16 code units may change.
- CLI file arguments are rejected when the current directory contains a `tsconfig.json`, unless `--ignoreConfig` is explicit.

### Parallelism Controls

TypeScript 7 offers experimental `--checkers` and `--builders` controls and `--singleThreaded` for debugging or constrained environments. Keep defaults until measurement shows a reason to tune them; experimental flags may change.

### Compatibility Boundary

TypeScript 7 does not yet provide a stable programmatic API. Tools that import `typescript`, language-service plugins, and template-aware checkers can require the 6.0 compatibility package. The official release documents `@typescript/typescript6` and npm aliases for side-by-side use, but add that arrangement only when the actual toolchain requires it.

Do not replace a framework checker with plain `tsc`: that can produce a false-green result by skipping template or embedded-language diagnostics.

## Upgrade Checklist

1. Record the current compiler, checker command, emitted artifacts, and baseline diagnostics.
2. Read every release note between the current and target versions, including behavioral changes.
3. Check framework, plugin, linter, transformer, and declaration-tool compatibility.
4. Upgrade one compatibility boundary at a time; for 5.x projects, cleanly adopt 6.0 deprecations before 7.0.
5. Run the repository's type-check, build, tests, declaration emit, and representative consumer checks.
6. Compare output paths, module specifiers, ambient types, and diagnostics. A clean type-check alone does not prove equivalent emit.

## Official Sources

- [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
- [TypeScript 5.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html)
- [TypeScript 5.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
- [TypeScript 5.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)
- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Official TypeScript releases](https://github.com/microsoft/TypeScript/releases)
