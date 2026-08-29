---
name: vite-plugin-api
description: Vite 8.2 plugin authoring with Vite-specific hooks, Rolldown hook filters, virtual modules, and compatibility guidance
---

# Vite Plugin API

Vite plugins extend Rolldown's plugin interface with Vite-specific hooks. Start with the smallest hook set that solves the use case and test both dev and build: the dev server and production bundler do not execute every hook identically.

## Basic Structure

```ts
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
  }
}
```

Use a factory when options or per-config state are needed. Keep mutable state inside the factory so multiple plugin instances and builds do not leak into each other.

## Vite-specific Hooks

### `config` and `configResolved`

Return partial config from `config`; do not mutate the raw config object. Read final normalized values in `configResolved`:

```ts
import type { Plugin, ResolvedConfig } from 'vite'

export function inspectConfig(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'inspect-config',
    config: () => ({ define: { __FEATURE__: 'true' } }),
    configResolved(resolved) {
      config = resolved
    },
    transform(code, id) {
      if (config.command === 'serve') {
        // dev-only behavior
      }
    },
  }
}
```

### `configureServer`

```ts
configureServer(server) {
  server.middlewares.use((req, res, next) => {
    next()
  })

  return () => {
    // install middleware after Vite's internal middleware
  }
}
```

The returned callback runs after Vite installs its internal middleware. A `configureServer` hook is not called in production build; guard any stored server reference accordingly.

### `transformIndexHtml`

Prefer structured tag injection over string replacement when adding tags:

```ts
transformIndexHtml() {
  return [
    {
      tag: 'script',
      attrs: { src: '/inject.js' },
      injectTo: 'body',
    },
  ]
}
```

### `handleHotUpdate`

```ts
handleHotUpdate({ server, modules }) {
  server.ws.send({ type: 'custom', event: 'my:update', data: {} })
  return modules
}
```

Returning an empty array suppresses the default affected-module update. Vite is planning an Environment-aware `hotUpdate` replacement, but the official Vite 8.2 guidance does **not** recommend migrating away from `handleHotUpdate` yet.

## Virtual Modules

Use `virtual:` for the user-facing id and prefix the internal resolved id with `\0`:

```ts
import { exactRegex } from '@rolldown/pluginutils'
import type { Plugin } from 'vite'

export function virtualModule(): Plugin {
  const publicId = 'virtual:my-module'
  const resolvedId = `\0${publicId}`

  return {
    name: 'virtual-module',
    resolveId: {
      filter: { id: exactRegex(publicId) },
      handler() {
        return resolvedId
      },
    },
    load: {
      filter: { id: exactRegex(resolvedId) },
      handler() {
        return 'export const message = "from virtual module"'
      },
    },
  }
}
```

The `\0` prefix prevents other resolvers from treating the id as a filesystem path. Do not use it for virtual modules that are derived from real files, such as single-file-component submodules, because it interferes with sourcemaps.

## Hook Filters

Rolldown hook filters avoid unnecessary Rust-to-JavaScript hook calls:

```ts
export function transformJs(): Plugin {
  const jsFile = /\.js$/

  return {
    name: 'transform-js',
    transform: {
      filter: { id: jsFile },
      handler(code, id) {
        if (!jsFile.test(id)) return null
        return { code: transformCode(code), map: null }
      },
    },
  }
}
```

Filters are supported by Vite 6.3+ and Rollup 4.38+. Keep the check inside the handler when the plugin claims compatibility with older hosts that ignore hook filters. `@rolldown/pluginutils` and `rolldown/filter` provide helpers such as `exactRegex` and `prefixRegex`.

## Module Types

Rolldown infers module type from the resolved id. When a `load` or `transform` hook converts a non-JavaScript extension into JavaScript, return `moduleType: 'js'`:

```ts
load(id) {
  if (!id.endsWith('.txt')) return null

  const content = fs.readFileSync(id, 'utf8')
  return {
    code: `export default ${JSON.stringify(content)}`,
    moduleType: 'js',
  }
}
```

## Ordering and Scope

- `enforce: 'pre'` runs before Vite core plugins; `enforce: 'post'` runs after build plugins.
- `apply: 'serve'` and `apply: 'build'` restrict a plugin to the relevant command.
- Prefer a functional `apply` check when SSR or other config state matters.
- `moduleParsed` is not called during dev. A plugin that requires full-bundle graph analysis should usually be build-only.

## Rolldown and Rollup Compatibility

Many Rollup plugins work with Rolldown, but compatibility is not guaranteed merely because the hook names match. Check for unsupported output formats, mutable `bundle` assumptions, Rollup-only internals, and build-only hooks. Test the plugin against the oldest and newest host versions it declares.

Use `this.meta.rolldownVersion` only for narrow runtime compatibility decisions; prefer capability checks when possible.

## Client-server Communication

```ts
// plugin / server
server.ws.send('my:event', { message: 'hello' })
server.ws.on('my:request', (data, client) => {
  client.send('my:response', { ok: true })
})

// client
if (import.meta.hot) {
  import.meta.hot.on('my:event', (data) => console.log(data.message))
  import.meta.hot.send('my:request', {})
}
```

Namespace event names to avoid collisions and validate untrusted payloads before using them in filesystem, process, or network operations.

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/guide/api-plugin
- https://vite.dev/guide/migration
- https://vite.dev/changes/hotupdate-hook
-->
