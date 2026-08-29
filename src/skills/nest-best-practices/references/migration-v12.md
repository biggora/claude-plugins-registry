---
name: migration-v12
description: NestJS 11 to 12 migration gates, breaking changes, and verification
---

# NestJS 11 to 12 Migration

Use this reference only for an explicit migration or compatibility review. Do not silently upgrade a project while implementing an unrelated change.

## Establish the Baseline

Inspect the package manifest and lockfile before editing:

- versions of `@nestjs/core`, `@nestjs/common`, platform adapters, `@nestjs/cli`, `@nestjs/schematics`, and every used companion package;
- Node.js version in version managers, containers, CI, and deployment configuration;
- CommonJS or ESM application format;
- HTTP adapter, GraphQL driver, microservice transports, compiler/bundler, linter, and test runner;
- custom bootstrap, lifecycle-order assumptions, serializers, deserializers, filters, and transport adapters.

Keep the framework and companion packages on compatible majors. Confirm the current stable versions at migration time instead of copying the dated `12.0.1` observation from `SKILL.md`.

## Supported Runtime

Nest 12 core packages are ESM and have two distinct practical floors:

| Operation | Supported minimum documented for v12 |
|---|---|
| Run a Nest application | Node.js 20.19+, or 22.12+ on the 22.x line |
| Run current `nest new`, `nest generate`, or `nest upgrade` schematics | Node.js 22.22.3+, 24.15+, or 26+ |

Prefer the latest active Node.js LTS that satisfies both the application and CLI. Do not infer CLI compatibility solely from `@nestjs/core`'s `engines` field.

## Upgrade Flow

Upgrade the CLI and schematics used by the repository, then preview the migration:

```bash
npm install --save-dev @nestjs/cli@latest @nestjs/schematics@latest
npx nest upgrade --dry-run
```

Review the report before running `npx nest upgrade`. The command aligns Nest package majors and applies supported mechanical changes, but it cannot prove runtime compatibility or correct behavior.

Do not force the application itself to ESM. Nest 12 can be consumed by a supported CommonJS application. If the user separately requests an ESM migration, update the package/module-resolution configuration and local import extensions as one coherent change.

## Review These v12 Changes

- New projects can choose CommonJS or ESM. Generated ESM projects default to Vitest; generated projects use oxlint. Existing projects may keep their test and lint stacks.
- Rspack is the monorepo default. `--webpack`, `--webpackPath`, and matching `nest-cli.json` options are deprecated; migrate custom webpack behavior deliberately.
- Route parameter decorators accept Standard Schema metadata. Validation still requires `StandardSchemaValidationPipe`.
- `StandardSchemaSerializerInterceptor` adds schema-based response serialization.
- `@nestjs/config` `validationSchema` accepts Standard Schema. Joi must be v18+; its custom options move under `validationOptions.libraryOptions`.
- GraphiQL is the default GraphQL IDE. `subscriptions-transport-ws` support is removed; use `graphql-ws`.
- NATS uses v3 and `@nats-io/transport-node`. Packet serialization and custom deserializer input changed.
- Lifecycle hooks execute by component hierarchy level. Remove assumptions based only on module import order and test required sequencing.
- Route shadow/duplicate diagnostics and specificity-based resolution are opt-in through application options.
- `HttpExceptionOptions.errorCode` provides a stable machine-readable error identifier.
- `ConsoleLogger` treats plain objects after the message as structured params by default.
- Dedicated gRPC exceptions plus `GrpcExceptionFilter` preserve gRPC status codes.
- Kafka message/event patterns can be regular expressions.
- WebSocket gateways support request-scoped providers; disconnect handlers can receive a reason.
- Express graceful shutdown drains in-flight requests.
- Official `@nestjs/observe` instrumentation is available but remains optional and sends telemetry to an external service.

## Verification

Run the repository's own install, type-check, lint, unit, integration/e2e, and build commands. Add targeted coverage for any affected route precedence, lifecycle order, error response, GraphQL subscription, NATS serializer, gRPC status, WebSocket scope, or shutdown behavior. Report pre-existing failures separately from regressions introduced by the migration.

<!--
Source references:
- https://docs.nestjs.com/migration-guide
- https://docs.nestjs.com/cli/usages
-->
