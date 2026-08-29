---
name: vite-rolldown-migration
description: Migrate Vite 7 or rolldown-vite projects to stable Vite 8.2 with Rolldown and Oxc
---

# Vite 8 Migration

This guide was verified against stable `vite@8.2.2`. Vite 8 replaces the esbuild + Rollup split with Rolldown-based dependency optimization/builds, Oxc transforms and JavaScript minification, and Lightning CSS minification. The Vite team reported up to 10–30x faster production builds in its Vite 8 announcement; treat that as an upper reported result, not a guaranteed project-wide improvement.

## Migration Sequence

1. Confirm Node.js `20.19+` or `22.12+`, the package manager, installed Vite/plugin versions, framework support, and the current build/test baseline.
2. Upgrade Vite and official/framework plugins within their documented peer ranges. Do not force Vite 8 through package-manager overrides when the framework has not declared support.
3. Run the existing config and build before renaming compatibility options. This separates dependency/plugin failures from config migration failures.
4. Replace deprecated options using the mappings below; do not blindly rename nested objects.
5. Test dev startup/HMR, production output, SSR/library paths, and plugins that use build hooks or CommonJS interop.

## Gradual Rolldown Test

For a large Vite 7 project, the official intermediate path is to alias the `vite` package to `rolldown-vite`, keeping source imports unchanged:

```json
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@7.2.2"
  }
}
```

Continue importing from `vite`:

```ts
import { defineConfig } from 'vite'
```

After resolving Rolldown-only issues, replace the alias with a supported Vite 8 range and review the remaining Vite 8 migration changes. Skip this intermediate step when the project is small or already has reliable build/runtime coverage.

## Configuration Renames

### Rollup to Rolldown

```ts
// Vite 7
build: {
  rollupOptions: {
    external: ['vue'],
    output: { globals: { vue: 'Vue' } },
  },
}

// Vite 8
build: {
  rolldownOptions: {
    external: ['vue'],
    output: { globals: { vue: 'Vue' } },
  },
}
```

Also rename `worker.rollupOptions` to `worker.rolldownOptions`. The old names are converted for compatibility and deprecated.

### esbuild Transforms to Oxc

| esbuild option | Oxc option |
|----------------|------------|
| `jsxInject` | `jsxInject` |
| `include` / `exclude` | `include` / `exclude` |
| `jsx: 'preserve'` | `jsx: 'preserve'` |
| `jsx: 'automatic'` | `jsx: { runtime: 'automatic' }` |
| `jsx: 'transform'` | `jsx: { runtime: 'classic' }` |
| `jsxFactory` | `jsx.pragma` |
| `jsxFragment` | `jsx.pragmaFrag` |
| `jsxImportSource` | `jsx.importSource` |
| `jsxDev` | `jsx.development` |
| `jsxSideEffects` | `jsx.pure` |
| `define` | `define` |

```ts
// Vite 7
esbuild: {
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
}

// Vite 8
oxc: {
  jsx: {
    runtime: 'classic',
    pragma: 'h',
    pragmaFrag: 'Fragment',
  },
}
```

`esbuild.supported` has no Oxc equivalent. `esbuild.banner` and `esbuild.footer` require a custom transform plugin. Native decorator lowering is not supported by Oxc; use an appropriate Babel or SWC plugin when the project requires it. This is distinct from Vite's support for TypeScript `emitDecoratorMetadata`.

If a plugin still calls deprecated `transformWithEsbuild`, install `esbuild` explicitly until the plugin migrates to `transformWithOxc`.

### Dependency Optimization

`optimizeDeps.esbuildOptions` is converted to `optimizeDeps.rolldownOptions` for compatibility. Important shape changes include:

| esbuild option | Rolldown option |
|----------------|-----------------|
| `minify` | `output.minify` |
| `treeShaking` | `treeshake` |
| `define` | `transform.define` |
| `loader` | `moduleTypes` |
| `preserveSymlinks` | inverse of `resolve.symlinks` |
| `resolveExtensions` | `resolve.extensions` |
| `mainFields` | `resolve.mainFields` |
| `conditions` | `resolve.conditionNames` |
| `keepNames` | `output.keepNames` |
| `platform` | `platform` |
| `plugins` | `plugins` with partial compatibility |

Inspect the resolved configuration when conversion is non-trivial:

```ts
const inspectCompatibility = {
  name: 'inspect-vite-config',
  configResolved(config) {
    console.log(config.oxc)
    console.log(config.optimizeDeps.rolldownOptions)
  },
}
```

Remove diagnostic logging after migration.

## Minification

```ts
export default defineConfig({
  build: {
    minify: 'oxc',
    cssMinify: 'lightningcss',
  },
})
```

These are client-build defaults, so explicit config is normally unnecessary. SSR builds default to no JavaScript minification. The deprecated `'esbuild'` fallback requires installing `esbuild` yourself.

Oxc does not support esbuild property-mangling options such as `mangleProps`, `reserveProps`, `mangleQuoted`, or `mangleCache`. Migrate only after checking whether those options are semantically required.

## Breaking Behavior to Audit

### Chunking

The object form of `output.manualChunks` is removed and the function form is deprecated. Move intentional manual splitting to `build.rolldownOptions.output.codeSplitting`. Re-test execution order and side effects after changing chunk boundaries.

### CommonJS Interop

Default imports from CommonJS now follow consistent rules across dev and build. A default import resolves to `module.exports` when the importer is `.mjs`/`.mts`, its nearest package is `type: module`, or the imported CommonJS module does not set `__esModule: true`; otherwise it resolves to `module.exports.default`.

`legacy.inconsistentCjsInterop: true` is a temporary deprecated escape hatch. Prefer fixing or patching the affected package/import.

Externalized `require()` calls now remain `require()` calls. If conversion to imports is required, use Vite's exported `esmExternalRequirePlugin` with a narrow external list.

### Module Resolution and Output

- Vite no longer sniffs package file contents to choose between `browser` and `module`; `resolve.mainFields` order is respected.
- `import.meta.url` is replaced with `undefined` in UMD/IIFE output unless explicitly handled.
- Rolldown does not support `system` or `amd` output formats.
- `resolve.alias[].customResolver` is removed; use a custom `resolveId` plugin with `enforce: 'pre'`.
- `build.rollupOptions.watch.chokidar` becomes `build.rolldownOptions.watch.watcher`.
- `build.commonjsOptions` and `build.dynamicImportVarsOptions.warnOnError` are no-ops.

### Plugin Module Types

Rolldown infers module type from the resolved extension. A plugin that transforms a non-JavaScript file into JavaScript may need `moduleType: 'js'`:

```ts
load(id) {
  if (!id.endsWith('.txt')) return null

  return {
    code: `export default ${JSON.stringify(readText(id))}`,
    moduleType: 'js',
  }
}
```

`moduleParsed` is not called in dev. Audit plugins that depend on a complete bundle graph or mutate the `bundle` object directly.

### JavaScript API Errors

`build()` throws `BundleError`, which may contain individual Rolldown errors in `.errors`. Preserve the outer error and surface details without assuming every thrown value has that property.

## Vite 8.1 and 8.2 Follow-up

After migration is green, consider stable improvements only when they solve an existing need:

- top-level `input` in 8.2 for shared dev/build/library/SSR entry declarations;
- `resolve.tsconfigPaths` for TypeScript aliases;
- `import.meta.glob(..., { caseSensitive: false })` when intentionally needed;
- direct Wasm ESM imports and `html.additionalAssetSources`.

Keep bundled dev mode, chunk import maps, full Lightning CSS transformation, Devtools integration, and Environment API experiments out of the migration itself unless they are separately requested and tested.

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/guide/migration
- https://vite.dev/blog/announcing-vite8
- https://vite.dev/blog/announcing-vite8-1
- https://vite.dev/config/shared-options
- https://vite.dev/config/build-options
-->
