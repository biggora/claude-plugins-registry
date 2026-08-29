---
name: vite-environment-api
description: Vite 8.2 Environment API release-candidate guidance for custom runtimes, framework authors, and environment-aware plugins
---

# Environment API

The Environment API is generally in **release-candidate** status in Vite 8.2, and some individual APIs remain experimental. Vite intends to preserve compatibility within a major, but stabilization may still introduce breaking changes in a future major.

Do not introduce this API into a normal SPA/MPA merely because it exists. It is primarily useful for frameworks, runtime providers, and plugins that need distinct browser, Node, edge, RSC, worker, or other execution environments.

## Model

A Vite server shares HTTP infrastructure and a plugin pipeline while maintaining independent module graphs and execution rules per environment. Typical environments include:

- `client` for browser code;
- `ssr` or `server` for server rendering;
- custom edge, RSC, worker, or service-worker environments.

Simple projects keep top-level config. Vite applies it to `client` and uses inheritable values as defaults for other environments.

## Configuration

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
})
```

- Most top-level environment options are inherited.
- Options marked non-inheritable in the config reference, including `optimizeDeps`, apply only to `client` by default.
- Keep ordinary client config at the top level instead of duplicating it under `environments.client`.
- The legacy top-level `ssr` config remains supported; Vite plans to deprecate it only after the Environment API stabilizes.

## Plugin Hooks

Global hooks such as config resolution and server setup run once. Per-environment module hooks run with the active environment on `this.environment`:

```ts
transform(code, id) {
  const conditions = this.environment.config.resolve.conditions
}
```

Register an environment by returning it from `config`:

```ts
config() {
  return {
    environments: {
      rsc: {
        resolve: {
          conditions: ['react-server'],
        },
      },
    },
  }
}
```

Use `configEnvironment` when defaults depend on the final environment name or partially resolved options.

Because one plugin instance may serve multiple environments, key mutable module state by `this.environment`, usually with a `WeakMap` or `Map`. Never reuse an unkeyed client module cache for server or edge transforms.

## HMR

The environment-aware `hotUpdate` hook runs once per environment and supports `create`, `update`, and `delete` events. However, Vite 8.2 still recommends keeping established plugins on `handleHotUpdate` unless they are intentionally adopting the Environment API. Do not perform a broad migration solely to remove the legacy hook.

## Custom Runtime Providers

Runtime providers may supply custom `DevEnvironment` implementations so development code runs in a runtime closer to production, such as Cloudflare `workerd`. Prefer the runtime provider's official Vite plugin rather than recreating an environment adapter in application code.

## Adoption Checklist

Before adopting the API:

1. Confirm the framework/runtime plugin supports the installed Vite minor.
2. Identify every environment and its production runtime, resolution conditions, output directory, and asset ownership.
3. Audit plugin state for cross-environment leakage.
4. Verify dev execution and production builds for every environment.
5. Pin the Vite minor if the design uses an API still marked experimental, and document the feedback/change page that tracks it.

## Backward Compatibility

`server.ssrLoadModule`, `server.moduleGraph`, and `handleHotUpdate` remain available in Vite 8.2. Mixed legacy module-graph views exist for compatibility, but new Environment-aware code should prefer the specific environment's module graph.

<!--
Official sources (verified at vite v8.2.2):
- https://vite.dev/guide/api-environment
- https://vite.dev/guide/api-environment-plugins
- https://vite.dev/guide/api-environment-frameworks
- https://vite.dev/changes/
-->
