---
name: cli-monorepo
description: NestJS monorepo mode, workspaces, and libraries
---

# Monorepo and Libraries

## Enable Monorepo

```bash
nest new my-project
cd my-project
nest generate app my-app
```

This converts to monorepo mode: apps move under `apps/`, shared config at root.

## Structure

```
apps/
  my-app/
    src/
    tsconfig.app.json
  my-project/    # default project
    src/
    tsconfig.app.json
nest-cli.json
package.json
tsconfig.json
```

## Generate Library

```bash
nest generate library shared
# Or: nest g lib shared
```

Creates `libs/shared/` with module, service, index. Use `--no-build` to skip build config.

## Library Structure

```
libs/
  shared/
    src/
      shared.module.ts
      shared.service.ts
      index.ts
```

## Using Library

```typescript
import { SharedModule } from '@shared';

@Module({
  imports: [SharedModule],
})
export class AppModule {}
```

Path alias `@shared` is configured in `tsconfig.json` (paths) and `nest-cli.json`.

## Library Options

```bash
nest g lib shared --prefix=@app
# Creates @app/shared import path
```

## Default Project

In monorepo, `nest build` and `nest start` target the default project. Set in `nest-cli.json`:

```json
{
  "projects": {
    "my-app": { "type": "application", ... },
    "my-project": { "type": "application", "root": "apps/my-project", "entryFile": "main" }
  },
  "defaultProject": "my-project"
}
```

## Target Specific Project

```bash
nest build my-app
nest start my-app
nest start my-app --watch
```

## NestJS 12 Builder

Rspack is the default bundler for monorepo projects in Nest 12. Prefer `--builder rspack` and `--rspackPath` for new configuration. Existing custom webpack setups may remain temporarily, but `--webpack`, `--webpackPath`, `webpack`, and `webpackConfigPath` are deprecated and should be migrated deliberately.

```bash
nest build --all --parallel
nest build my-app --builder rspack
```

Use `includeLibraryAssets` in `nest-cli.json` when library assets must be copied into an application build.

## Key Points

- Monorepo: shared `node_modules`, config, build pipeline
- Library: reusable modules, no `main.ts`
- Path aliases auto-configured for libraries
- Default project used when none specified
- Do not assume the new Rspack default reproduces custom webpack behavior; verify plugins, externals, assets, and runtime output

<!--
Source references:
- https://docs.nestjs.com/cli/monorepo
- https://docs.nestjs.com/cli/libraries
-->
