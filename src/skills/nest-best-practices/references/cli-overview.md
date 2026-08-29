---
name: cli
description: NestJS CLI for scaffolding, building, and running applications
---

# Nest CLI

The Nest CLI helps initialize, develop, and maintain NestJS applications.

## Installation

```bash
npm install -g @nestjs/cli
# Or use npx
npx @nestjs/cli@latest
```

## Common Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `nest new` | `n` | Create new application |
| `nest generate` | `g` | Generate components |
| `nest build` | | Compile application |
| `nest start` | | Run application |
| `nest upgrade` | | Align Nest packages and apply supported migrations |
| `nest deploy` | | Forward deployment to Mau |
| `nest add` | | Add library |
| `nest info` | `i` | Display system info |

## Creating a New Project

```bash
nest new my-project
cd my-project
npm run start:dev
```

Nest 12 prompts for CommonJS or ESM. New ESM projects use Vitest by default, and newly generated projects use oxlint. These are scaffolding defaults, not a requirement to rewrite existing repositories.

Current schematics have a higher Node.js floor than the Nest runtime. Before `nest new`, `nest generate`, or `nest upgrade`, verify the supported Node.js versions in the current migration guide.

## Upgrading

Preview an explicit framework upgrade before applying it:

```bash
npx nest upgrade --dry-run
```

Review the report, then run `npx nest upgrade` only when the migration is in scope. Keep all `@nestjs/*` packages on compatible majors.

## Generate Components

```bash
# Generate a module
nest g module users

# Generate a controller
nest g controller users

# Generate a service
nest g service users

# Generate a complete resource (CRUD)
nest g resource users

# Generate with specific path
nest g controller users/admin

# Dry run (preview without creating)
nest g controller users --dry-run
```

### Generator Schematics

| Schematic | Alias | Description |
|-----------|-------|-------------|
| `module` | `mo` | Module |
| `controller` | `co` | Controller |
| `service` | `s` | Service |
| `provider` | `pr` | Provider |
| `pipe` | `pi` | Pipe |
| `guard` | `gu` | Guard |
| `interceptor` | `itc` | Interceptor |
| `filter` | `f` | Exception filter |
| `decorator` | `d` | Custom decorator |
| `gateway` | `ga` | WebSocket gateway |
| `middleware` | `mi` | Middleware |
| `resource` | `res` | CRUD resource |
| `class` | `cl` | Class |
| `interface` | `itf` | Interface |

## Build and Run

```bash
# Development with watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Project Structure

```
src/
├── app.controller.ts      # Root controller
├── app.controller.spec.ts # Controller tests
├── app.module.ts          # Root module
├── app.service.ts         # Root service
└── main.ts                # Entry point
```

## nest-cli.json Configuration

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "tsc",
    "tsConfigPath": "tsconfig.build.json"
  },
  "generateOptions": {
    "spec": true
  }
}
```

## SWC Compiler

```bash
npm install -D @swc/cli @swc/core
```

```json
// nest-cli.json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

SWC does not type-check by itself. Use `--type-check` or set `compilerOptions.typeCheck` when the build must also report TypeScript diagnostics. Nest 12 can emit declarations with `--emit-declarations`.

For monorepos, Rspack is the Nest 12 default. The `--webpack` and `--webpackPath` options are deprecated in favor of `--builder rspack` and `--rspackPath`.

## Monorepo Mode

```bash
# Convert to monorepo
nest generate app secondary-app

# Generate library
nest generate library shared
```

## Key Points

- Use `--dry-run` or `-d` flag to preview changes
- Use `--flat` flag to skip creating a subdirectory
- Use `--no-spec` flag to skip test file generation
- Use SWC for faster builds in development
- Preserve the existing compiler, linter, and test runner unless changing them is part of the task
- Generators automatically update module imports

<!--
Source references:
- https://docs.nestjs.com/cli/overview
- https://docs.nestjs.com/cli/usages
-->
