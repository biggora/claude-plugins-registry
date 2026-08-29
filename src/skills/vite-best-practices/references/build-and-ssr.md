---
name: vite-build-ssr
description: Vite 8.2 production builds, multi-page and library entries, chunking, SSR, and JavaScript API
---

# Build and SSR

## Entry Points

Vite 8.2 recommends top-level `input` for application entries because dev and dependency optimization use it too:

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    nested: resolve(import.meta.dirname, 'nested/index.html'),
  },
})
```

Use `build.rolldownOptions.input` only for build-only entries. If `root` differs from the config directory, include it when resolving HTML paths.

## Library Mode

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'lib/main.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      cssFileName: 'my-lib-style',
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
```

- `entry` may be a string, array, or alias map. It may instead come from top-level `input`.
- `name` is required only when output includes `umd` or `iife`.
- Default formats are `es` + `umd` for one entry and `es` + `cjs` for multiple entries.
- Externalize peer dependencies that consumers should provide. Supply `output.globals` only for `umd`/`iife` externals.
- Vite does not emit TypeScript declarations. Use a dedicated declaration tool or `tsc --emitDeclarationOnly`, then verify the paths in `package.json` exports.
- Include emitted CSS and every public entry in package exports; test the packed tarball from both ESM and CommonJS consumers when both are advertised.

## Chunking

Configure manual chunking through Rolldown's `codeSplitting`:

```ts
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
```

The object form of `output.manualChunks` is removed in Vite 8 and the function form is deprecated. Manual splitting can change side-effect execution order, so measure actual navigation and caching and run runtime tests before forcing chunks; framework defaults are usually a better starting point.

`build.chunkImportMap` is experimental. It can reduce cascading invalidation of JavaScript chunks, but requires `import.meta.resolve`, does not currently provide the same optimization for CSS/assets, and is incompatible with `experimental.renderBuiltUrl`.

## License Output

`build.license: true` emits `.vite/license.md` with bundled dependency licenses. A custom filename ending in `.json` emits machine-readable metadata. This is useful for distribution, but it does not replace a legal review of what may be bundled or redistributed.

## SSR: Choose the Right Layer

Vite's native SSR API is low-level and primarily aimed at framework and library authors. For application work, prefer the framework's supported SSR integration unless the user explicitly needs a custom server.

### Development Middleware

```ts
import fs from 'node:fs/promises'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const app = express()
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

app.use(vite.middlewares)

app.use('*all', async (req, res, next) => {
  try {
    const url = req.originalUrl
    let template = await fs.readFile('index.html', 'utf8')
    template = await vite.transformIndexHtml(url, template)

    const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
    const appHtml = await render(url)
    const html = template.replace('<!--ssr-outlet-->', () => appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (error) {
    vite.ssrFixStacktrace(error as Error)
    next(error)
  }
})
```

Always call `transformIndexHtml`; it applies Vite and framework-plugin HTML transforms, including HMR or framework preambles. Fix stack traces before passing development errors to the server's error handler.

### Production Builds

```json
{
  "scripts": {
    "build:client": "vite build --outDir dist/client --ssrManifest",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.ts"
  }
}
```

- The client build produces browser assets and, with `--ssrManifest`, `.vite/ssr-manifest.json`.
- The server build externalizes dependencies by default and produces the module imported by the production server.
- `ssr.noExternal` bundles selected dependencies; `ssr.external` forces selected dependencies to remain external.
- Verify both builds and a rendered request. A client-only build does not prove SSR correctness.

```ts
export default defineConfig({
  ssr: {
    noExternal: ['package-that-needs-transforming'],
    external: ['native-server-package'],
  },
})
```

## JavaScript API

```ts
import { build, createServer, preview, resolveConfig } from 'vite'

const server = await createServer({
  configFile: false,
  root: import.meta.dirname,
  server: { port: 1337 },
})
await server.listen()

await build({ root: './project', build: { outDir: 'dist' } })

const previewServer = await preview({ preview: { port: 8080 } })
const config = await resolveConfig({}, 'build')
```

Close programmatically created servers and watchers in tests or long-running processes. Vite 8 `build()` throws a `BundleError` whose `.errors` array may contain individual Rolldown errors:

```ts
try {
  await build()
} catch (error) {
  const details =
    error instanceof Error && 'errors' in error
      ? (error as Error & {
          errors?: Array<{ code?: string; message: string }>
        }).errors
      : undefined

  for (const detail of details ?? []) {
    console.error(detail.code, detail.message)
  }
  throw error
}
```

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/guide/build
- https://vite.dev/config/build-options
- https://vite.dev/guide/ssr
- https://vite.dev/guide/api-javascript
- https://rolldown.rs/reference/OutputOptions.codeSplitting
-->
