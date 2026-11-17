---
name: migration-v12
description: NestJS v11 to v12 changes that affect code — upgrade command, ESM, Standard Schema validation, testing, Terminus, config
---

# Migrating NestJS v11 to v12

NestJS 12.0 shipped 2026-08-27; 12.4 is current as of Nov 2026. Source: https://docs.nestjs.com/migration-guide

Use this reference only for an explicit migration or compatibility review. Do not silently upgrade a project while implementing an unrelated change.

## Baseline

Inspect the package manifest and lockfile before editing:

- versions of `@nestjs/core`, `@nestjs/common`, platform adapters, `@nestjs/cli`, `@nestjs/schematics`, and every used companion package;
- Node.js version in version managers, containers, CI, and deployment configuration;
- CommonJS or ESM application format;
- HTTP adapter, GraphQL driver, microservice transports, compiler/bundler, linter, and test runner;
- custom bootstrap, lifecycle-order assumptions, serializers, deserializers, filters, and transport adapters.

Confirm the current stable versions at migration time; version numbers in this skill are dated observations.

## Upgrade

```bash
npm i -g @nestjs/cli@latest @nestjs/schematics@latest   # update the CLI first
nest upgrade --dry-run                                   # preview the report
nest upgrade
```

- `nest upgrade` moves every `@nestjs/*` package to v12 at once, bumps TypeScript to v6 and Jest to v30, and migrates `nest-cli.json` webpack options, GraphQL `playground` to `graphiql`, NATS packages, and `@nestjs/config` validation options. It does not convert the project to ESM, Vitest, or oxlint.
- Do not mix majors: every Nest package must be on v12. `@nestjs/schematics` v12 needs TypeScript 6.
- Node.js: app 20.19+ or 22.12+; `nest new`/`generate`/`upgrade` need 22.22.3+, 24.15+ or 26+. Prefer the latest active LTS that satisfies both, and do not infer CLI compatibility from `@nestjs/core`'s `engines` field alone.

## ESM

- Nest packages are ESM-only. A CommonJS app keeps working through `require(esm)`; staying CommonJS is fine.
- To make your own code ESM: `"type": "module"` in `package.json`, `"module": "nodenext"` and `"moduleResolution": "nodenext"` in `tsconfig.json`, `.js` suffix on relative imports, `import.meta.dirname` instead of `__dirname`.

```typescript
import { AppModule } from './app.module.js';     // not './app.module'
protoPath: join(import.meta.dirname, 'hero/hero.proto'),  // not __dirname
```

- The `__dirname` and extensionless imports in other references are CommonJS style; adjust them in ESM projects.
- AWS Lambda disables `require(esm)` by default: set `NODE_OPTIONS=--experimental-require-module` for CommonJS apps.

## Validation: Standard Schema

`StandardSchemaValidationPipe` (from `@nestjs/common`) validates against any Standard Schema library (Zod, Valibot, ArkType). It only validates parameters that declare a `schema`; `ValidationPipe` only validates class-typed parameters, so both can be registered together.

```typescript
import { z } from 'zod';
import { StandardSchemaValidationPipe } from '@nestjs/common';

const createUserSchema = z.object({ email: z.email(), name: z.string() });
type CreateUser = z.infer<typeof createUserSchema>;

app.useGlobalPipes(new StandardSchemaValidationPipe());

@Post()
create(@Body({ schema: createUserSchema }) dto: CreateUser) {}

@Get(':id')
findOne(@Param('id', { schema: z.coerce.number().int().positive() }) id: number) {}
```

- `schema` works on `@Body()`, `@Query()`, `@Param()`, `@RawBody()`.
- `StandardSchemaSerializerInterceptor` with `@SerializeOptions({ schema })` shapes responses from a schema.
- Keep `ValidationPipe` + class-validator for class-based DTOs; both remain supported.
- `ValidationPipe` gains `errorFormat: 'list' | 'grouped'`.

## Config

`ConfigModule.forRoot({ validationSchema })` accepts any Standard Schema schema. Existing Joi schemas need Joi v18+, and Joi options move under `libraryOptions`:

```typescript
validationOptions: { libraryOptions: { allowUnknown: false, abortEarly: true } },
```

## Testing

- `nest new` generates Vitest for ESM projects and Jest for CommonJS projects. Existing projects keep their runner; `@nestjs/testing` works with either.
- Jest can load the ESM-only v12 packages only on Node.js 24.9+ (older: `ERR_REQUIRE_ASYNC_MODULE`). Run Jest on 24.9+ or move to Vitest.

## Terminus

`HealthIndicator` and `HealthCheckError` are removed. Inject `HealthIndicatorService`; return `up()`/`down()` instead of throwing, or use `attempt()` (marks `down` when the operation throws). Use `.withTimeout(ms)` instead of the deprecated `timeout` option of built-in indicators.

```typescript
@Injectable()
export class DogHealthIndicator {
  constructor(
    private readonly dogService: DogService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isHealthy(key: string) {
    return this.healthIndicatorService
      .check(key)
      .attempt(() => this.dogService.ping())
      .withTimeout(1000);
  }
}
```

## Other code-affecting changes

- Lifecycle hooks (`onModuleInit`, `onApplicationBootstrap`, shutdown) run by component hierarchy level; re-check code that depends on hook order between related providers.
- `@Optional()` is no longer inherited by a subclass that redeclares its constructor: repeat `@Optional()` in the subclass constructor.
- `ConsoleLogger` treats objects after the message as structured params (`structuredParams: false` restores the old behavior).
- GraphQL: `subscriptions-transport-ws` removed (use `graphql-ws`); GraphiQL replaces Playground (`graphiql` options object).
- NATS: `@nats-io/transport-node` replaces `nats`; `StringCodec` and `JSONCodec` are gone. Custom deserializers receive the full NATS message and read JSON via `msg.json()`.
- Kafka: `@MessagePattern()` and `@EventPattern()` accept regular expressions.
- gRPC: dedicated gRPC exceptions plus `GrpcExceptionFilter` preserve gRPC status codes.
- WebSockets: gateways support request-scoped providers; disconnect handlers can receive a reason.
- Express: graceful shutdown drains in-flight requests.
- Routing: route shadow/duplicate diagnostics (`routeConflictPolicy`) and specificity-based resolution (`routeResolutionStrategy: 'specificity'`) are opt-in application options.
- New projects generate oxlint; existing projects may keep their lint stack.
- `@nestjs/observe` is an optional hosted integration that sends telemetry to an external service; see [observability](observability.md).
- CLI: `--webpack`/`--webpackPath` deprecated in favour of `--builder rspack` (Rspack is the monorepo default); `angular` schematic removed.
- `HttpException` options accept `errorCode`, serialized into the response body: `throw new BadRequestException('Weak password', { errorCode: 'WEAK_PASSWORD' })`.

## Verification

Run the repository's own install, type-check, lint, unit, integration/e2e, and build commands; `nest upgrade` cannot prove runtime compatibility. Add targeted coverage for any affected route precedence, lifecycle order, error response, GraphQL subscription, NATS serializer, gRPC status, WebSocket scope, or shutdown behavior. Report pre-existing failures separately from regressions introduced by the migration.
