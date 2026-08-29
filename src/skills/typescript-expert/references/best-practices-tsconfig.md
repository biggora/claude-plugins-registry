# TypeScript Project Configuration

There is no universal “strict tsconfig”. Start from the runtime, module loader or bundler, whether TypeScript emits files, and whether the project publishes declarations. Preserve framework-generated settings and inspect every `extends` layer.

## Inspect the Effective Configuration

Use the project's local compiler and configuration path:

```bash
npm exec -- tsc --version
npm exec -- tsc --showConfig -p tsconfig.json
```

Adapt the invocation to the detected package manager. `--showConfig` is useful for inherited options, but it does not explain framework-specific transforms or an alternative checker such as `vue-tsc`.

Check together:

- the exact TypeScript/checker version;
- `files`, `include`, `exclude`, references, and inferred `rootDir`;
- runtime and package `type`;
- `module`, `moduleResolution`, `target`, and `lib`;
- `noEmit` versus JavaScript/declaration emit;
- the bundler, test runner, framework plugin, and path-alias implementation.

## Choose Module Settings by Runtime

| Runtime/toolchain | Typical starting point | Important constraint |
|---|---|---|
| Bundled app | `module: "preserve"`, `moduleResolution: "bundler"`, `noEmit: true` | Bundler owns resolution and emit |
| Direct Node.js | `module: "nodenext"` | Relative ESM imports and package `type` follow Node rules |
| Node.js 20 pinned semantics | `module: "node20"` (TS 5.9+) | Stable model; unlike `nodenext`, it does not float |
| Declaration-emitting library | Match consumers; often `nodenext` | Validate emitted `.d.ts` and package exports |
| Runtime type stripping | Runtime-specific settings plus `erasableSyntaxOnly` | TypeScript syntax must not require transformation |

Do not pair `moduleResolution: "bundler"` with direct Node execution just to make extensionless imports pass. Do not copy `module` and `moduleResolution` independently from unrelated templates.

## Example Starting Points

These are decision examples, not drop-in replacements.

### Bundled application

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "preserve",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src"]
}
```

Choose `target` and `lib` from deployed browsers/runtimes, not from the newest TypeScript release.

### Node.js ESM library

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "strict": true,
    "verbatimModuleSyntax": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

Also inspect `package.json#type`, `exports`, file extensions, and a representative consumer. Source compilation alone cannot prove that a published package resolves correctly.

### Runtime type stripping

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "nodenext",
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true
  }
}
```

Confirm the runtime's actual type-stripping and module support. `erasableSyntaxOnly` rejects enums, namespaces with runtime values, parameter properties, and other syntax requiring transformation.

## Strictness

Keep `strict: true` explicit in shared configurations even though TypeScript 6 and 7 default it to true. Explicit configuration avoids behavior changing when a different compiler line or tool reads the project.

`strict` enables the strict-mode family, including `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, and `useUnknownInCatchVariables`.

These useful checks are separate and must be evaluated deliberately:

- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noPropertyAccessFromIndexSignature`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`
- `noUncheckedSideEffectImports`

Do not claim `exactOptionalPropertyTypes` is part of `strict`. Enable stricter flags separately, understand the new errors, and migrate without masking them with assertions.

## TypeScript 6 and 7 Configuration Changes

TypeScript 6 changed important defaults: `strict`, `module`, `target`, `noUncheckedSideEffectImports`, `rootDir`, and `types`. TypeScript 7 adopts those defaults and removes deprecated behavior.

Before moving to 7:

- add an explicit `rootDir` when output layout depends on it;
- list required ambient packages in `types` instead of relying on every visible `@types` package;
- replace `moduleResolution: "node"`/`"node10"` or `"classic"` with `nodenext` or `bundler` according to the runtime;
- remove `baseUrl` and make `paths` targets relative to the tsconfig;
- replace legacy module outputs and `outFile`;
- do not disable `esModuleInterop`, `allowSyntheticDefaultImports`, or strict-mode semantics;
- move off an ES5 target.

Read [modern TypeScript releases](modern-typescript-releases.md) for the full migration boundary, including TypeScript 7's lack of a stable programmatic API.

## Path Mapping and Import Rewriting

`paths` changes TypeScript's resolution; it does not rewrite emitted JavaScript or teach the runtime/bundler the alias.

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

TypeScript 6 deprecates `baseUrl`; it is no longer needed for `paths`. Configure the same aliases in the runtime/bundler or use package `imports` where appropriate.

`rewriteRelativeImportExtensions` is narrower: it rewrites explicit relative TypeScript extensions during emit. It does not rewrite aliases, package names, extensionless imports, or arbitrary dynamic-import expressions.

## File Selection and Project References

For monorepos, keep a solution config with references and build with the existing `tsc --build` command:

```jsonc
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/api" }
  ]
}
```

Each referenced project that emits should normally own an explicit `rootDir`, `outDir`, and `composite: true`. Do not add a broad `**/*` include that pulls generated files, tests, or sibling packages into the wrong project.

## Performance Flags Are Trade-offs

- `incremental` and project references can reduce repeated work, but verify cache paths and CI behavior.
- `skipLibCheck` skips checking declaration-file internals; it can improve speed but may hide duplicate or incompatible library declarations. Use it as an explicit trade-off, not a universal default.
- `isolatedModules` checks compatibility with per-file transforms; it does not perform isolated transpilation itself.
- `noEmit` is correct only when another tool owns emit or the task is type-check-only.
- TypeScript 7 parallelism controls are experimental. Measure before changing `checkers`, `builders`, or `singleThreaded`.

## Validation Matrix

| Project | Required evidence |
|---|---|
| App with bundler | Existing type-check, production build, tests |
| Direct Node app | Type-check/build plus start or focused runtime smoke test |
| Library | Build, declaration emit, package exports, representative consumer |
| Composite monorepo | Root build and affected package checks |
| Framework/embedded language | Framework checker; plain `tsc` is not an equivalent substitute |
| Version upgrade | Baseline comparison, release-note migration, all checks above |
