---
name: vite-config
description: Vite 8.2 configuration, config loading, entry points, resolution, Oxc, and development server options
---

# Vite Configuration

## Start From the Project

Before changing config, inspect the installed Vite and framework-plugin versions, package-manager lockfile, existing `vite.config.*`, and framework documentation. Do not assume a bare Vite project when a framework owns the Vite lifecycle.

Vite 8 requires Node.js `20.19+` or `22.12+`. Its current default config loader bundles the config with Rolldown. `vite --configLoader native` avoids bundling and is useful for debugging or environments with native TypeScript support, but it can change which TypeScript and module syntax the runtime accepts.

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // config options
})
```

Keep the project's existing `.js`, `.mjs`, `.ts`, or `.mts` convention unless changing it solves a real problem.

## Conditional and Async Config

```ts
export default defineConfig(async ({ command, mode, isSsrBuild, isPreview }) => {
  const data = await fetchConfig()

  return {
    define: {
      __BUILD_DATA__: JSON.stringify(data),
    },
    build: command === 'build' ? { sourcemap: true } : undefined,
  }
})
```

- `command` is `'serve'` for dev and `'build'` for build.
- `mode` defaults to `'development'` or `'production'`, but may be overridden with `--mode`.
- Use the supplied `isSsrBuild` and `isPreview` flags instead of inferring those states from mode names.

## Environment Variables in Config

`.env*` files are loaded after config resolution. Use `loadEnv` when config itself needs their values:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_')

  return {
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
    },
  }
})
```

Use the narrowest useful prefix. An empty prefix loads every variable and increases the chance of leaking secrets if values are later copied into `define` or client code.

## Top-level `input` (Vite 8.2)

Use top-level `input` when an application has non-default or multiple entries. Vite shares it across dev, dependency optimization, builds, library mode, and SSR unless a more specific option overrides it.

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    admin: resolve(import.meta.dirname, 'admin/index.html'),
  },
})
```

Use `build.rolldownOptions.input`, `build.lib.entry`, or `build.ssr` only when that entry should differ for that build path.

## Resolution

### `resolve.alias`

Use absolute filesystem paths for aliases that replace filesystem paths:

```ts
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
})
```

### `resolve.tsconfigPaths`

```ts
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
})
```

This option is stable but disabled by default because discovery has a performance cost. It follows each matching `tsconfig.json`'s `files` and `include`; explicitly include CSS/Sass extensions when aliases are used in their imports. Less imports are not supported, so use `resolve.alias` or relative paths there.

## Oxc and Rolldown

Use `oxc` only when the defaults or framework plugin do not already provide the required transform:

```ts
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
  build: {
    rolldownOptions: {
      external: ['vue'],
    },
  },
})
```

- Oxc transforms `ts`, `jsx`, and `tsx` by default. Set `oxc: false` only if another tool fully owns those transforms.
- `build.rollupOptions` and `esbuild` remain compatibility aliases but are deprecated.
- Prefer Vite options such as `build.lib`, `input`, and `build.sourcemap` before dropping to `rolldownOptions`.

## Development Server

### Proxy

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### Browser Console Forwarding

Vite 8 automatically enables forwarding when it detects a coding agent. Configure it when deterministic behavior or additional levels are needed:

```ts
export default defineConfig({
  server: {
    forwardConsole: {
      unhandledErrors: true,
      logLevels: ['warn', 'error'],
    },
  },
})
```

`true` forwards unhandled errors plus `console.warn` and `console.error`; it does not forward every console level.

### Allowed Hosts

Never set `server.allowedHosts: true` as a convenience. It permits DNS-rebinding attacks against the dev server. Add only hostnames whose DNS you control; localhost domains and IP addresses are already allowed by default.

## HTML Asset Discovery (Vite 8.1)

Declare non-standard attributes that reference assets so Vite rewrites and includes them:

```ts
export default defineConfig({
  html: {
    additionalAssetSources: {
      'html-import': { srcAttributes: ['src'] },
      img: { srcAttributes: ['data-src-dark', 'data-src-light'] },
    },
  },
})
```

## Experimental Options

- `devtools` requires `@vitejs/devtools`, defaults to `false`, and is currently supported only in build mode.
- `experimental.bundledDev` may improve startup and reload time in very large browser applications, but third-party plugins and less common features may not work. Benchmark first and pin the Vite minor if enabling it.
- Use `future` warnings to prepare for documented breaking changes, not to suppress or silently opt into unknown behavior.

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/config/
- https://vite.dev/config/shared-options
- https://vite.dev/config/server-options
- https://vite.dev/blog/announcing-vite8-1
-->
