---
name: vite-features
description: Vite 8.2 import patterns, assets, environment variables, CSS, WebAssembly, and HMR
---

# Vite Features

## Glob Imports

`import.meta.glob` arguments must be literals; Vite transforms them at build time.

```ts
const lazyModules = import.meta.glob('./dir/*.ts')
const eagerDefaults = import.meta.glob('./dir/*.ts', {
  eager: true,
  import: 'default',
})
const selected = import.meta.glob([
  './dir/*.ts',
  '!**/*.test.ts',
])
```

Each lazy value is a function returning an import promise. Use `eager: true` only when all matched modules must be loaded immediately.

Vite 8.1 added case-insensitive matching:

```ts
const modules = import.meta.glob('./dir/module*.js', {
  caseSensitive: false,
})
```

Matching is case-sensitive by default. Use the override deliberately because case differences can hide portability bugs between case-sensitive and case-insensitive filesystems.

Custom queries are useful for raw or URL imports:

```ts
const svgRaw = import.meta.glob('./icons/*.svg', {
  query: '?raw',
  import: 'default',
})
```

## Static Assets

```ts
import imageUrl from './image.png'
import shader from './shader.glsl?raw'
import workletUrl from './worklet.js?url'
```

- A normal asset import returns its public URL and participates in hashing/build output.
- `?url` forces URL handling.
- `?raw` returns the source as a string.
- `?inline` forces inlining; `?no-inline` forces a separate asset.

For URLs relative to the current module, keep the path statically analyzable:

```ts
const imageUrl = new URL('./image.png', import.meta.url).href
```

Do not concatenate arbitrary runtime strings and expect Vite to discover the files. Use a finite glob or an explicit mapping instead.

## Web Workers

Prefer the standards-compatible constructor form when it can remain static:

```ts
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
})
```

Query imports are available when a worker constructor value is required:

```ts
import Worker from './worker.ts?worker'
import InlineWorker from './worker.ts?worker&inline'
```

## Environment Variables

Built-in values:

```ts
import.meta.env.MODE
import.meta.env.BASE_URL
import.meta.env.PROD
import.meta.env.DEV
import.meta.env.SSR
```

Only variables with the configured `envPrefix` are exposed to client code; the default prefix is `VITE_`. Every exposed value is a string at runtime.

```dotenv
VITE_API_URL=https://api.example.com
DB_PASSWORD=secret
```

`VITE_API_URL` is client-visible. `DB_PASSWORD` is not. Never put secrets in `VITE_*`, `define`, HTML replacement values, or any other client bundle input.

From lowest to highest precedence, the env files are:

```text
.env
.env.local
.env.[mode]
.env.[mode].local
```

Existing process environment variables have the highest priority. Restart the dev server after changing `.env` files.

For TypeScript, augment `ImportMetaEnv` in a `vite-env.d.ts` that contains no imports:

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## CSS

- `.module.css` files use CSS Modules.
- PostCSS remains the default CSS transformer.
- Lightning CSS is the default production CSS minifier.
- Full Lightning CSS processing is experimental and requires `css.transformer: 'lightningcss'`. Configure CSS Modules under `css.lightningcss.cssModules` in that mode, not `css.modules`.

```ts
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      // Lightning CSS transform options
    },
  },
})
```

Do not enable the experimental transformer just because Lightning CSS already minifies production CSS.

## WebAssembly

Vite 8.1 supports direct WebAssembly ESM integration:

```ts
import { add } from './add.wasm'

console.log(add(1, 2))
```

Direct imports are async modules and require top-level `await` support. TypeScript also needs `allowArbitraryExtensions` and an adjacent declaration such as `add.d.wasm.ts` for typed named exports.

Use `?init` when controlling instantiation or supplying imports:

```ts
import init from './module.wasm?init'

const instance = await init({
  imports: { now: () => Date.now() },
})
```

For SSR builds, both direct and `?init` Wasm loading currently require a Node.js-compatible runtime because Vite uses `node:fs`.

## JSON

```ts
import pkg from './package.json'
import { version } from './package.json'
```

Named imports are enabled by default and allow tree shaking. Avoid loading large JSON into the client when the data can be fetched or split.

## HMR Client API

Guard all HMR code so it is removed from production builds:

```ts
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // apply the accepted update
  })

  import.meta.hot.dispose((data) => {
    // remove listeners and persist small handoff state
  })
}
```

Keep `accept` calls statically visible and pass a module id string, not a `URL` object. Vite 8 removed URL arguments to `import.meta.hot.accept`. Dispose timers, listeners, and other side effects to avoid duplication after repeated updates. Use `invalidate()` only when the current module cannot safely apply the update.

## Experimental Chunk Import Maps

`build.chunkImportMap` can reduce cascading cache invalidation between JavaScript chunks. It is experimental, defaults to `false`, requires browser support for `import.meta.resolve`, does not currently optimize CSS/assets the same way, and is incompatible with `experimental.renderBuiltUrl`. Enable it only after checking browser targets and deployment behavior.

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/guide/features
- https://vite.dev/guide/assets
- https://vite.dev/guide/env-and-mode
- https://vite.dev/guide/api-hmr
- https://vite.dev/config/build-options#build-chunkimportmap
-->
