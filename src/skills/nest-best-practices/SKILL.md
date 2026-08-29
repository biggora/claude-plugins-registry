---
name: nest-best-practices
description: Implement, review, test, or migrate NestJS applications with version-aware patterns. Use for @nestjs/* APIs, modules, validation, transports, testing, or CLI; inspect the installed major before v12 guidance.
---

# NestJS Best Practices

Use the project's source, package manifest, lockfile, module format, HTTP adapter, and test runner as the primary context. Read only the references relevant to the task.

This skill targets NestJS 12. The npm `latest` tag for `@nestjs/core` was verified as `12.0.1` on 2026-08-29. Treat that patch number as a dated observation: re-check the registry and official documentation before recommending or performing an upgrade.

## Version Gate

1. Inspect `package.json` and the lockfile for `@nestjs/core`, `@nestjs/common`, platform adapters, CLI, and companion packages.
2. Preserve the installed major for ordinary feature and bug-fix work. Do not introduce v12-only APIs into a v10/v11 project.
3. For a new project or an explicit upgrade, verify the current stable npm tag and official migration guide. Keep all `@nestjs/*` packages on compatible majors.
4. For v11 to v12 work, read [NestJS 12 migration](references/migration-v12.md) before editing dependencies or configuration.
5. Preserve the project's CommonJS or ESM choice unless the user requests a module-format migration. Nest 12 packages are ESM, but supported CommonJS applications can consume them on compatible Node.js versions.

## Working Method

- Inspect existing module boundaries and nearby patterns before generating code.
- Prefer framework primitives and the adapter already in use. Avoid Express-specific response handling in code that should remain adapter-independent.
- Keep controllers thin: translate transport input/output and delegate business rules to providers.
- Use explicit injection tokens for non-class dependencies. Export only providers that other modules actually consume.
- Choose singleton scope by default; request scope has a performance and dependency-graph cost.
- Validate untrusted input at the transport boundary. Use class-based or Standard Schema-based validation consistently with the project; do not layer both without a concrete reason.
- Keep secrets and environment-specific values outside source. Validate configuration during startup.
- Preserve stable error contracts. In Nest 12, prefer `errorCode` for machine decisions and messages for humans.
- Test observable behavior through `@nestjs/testing`; preserve the repository's Jest or Vitest choice.
- After edits, run the narrow relevant tests, type checking, linting, and build commands already defined by the repository.

## NestJS 12 Decisions

- **Runtime and CLI:** a Nest 12 application needs Node.js 20.19+ or 22.12+ on the 22.x line. Current schematics/CLI generation has a higher runtime floor; see the migration reference rather than inferring from `@nestjs/core.engines` alone.
- **Validation:** keep `ValidationPipe` for decorator/class DTOs. Use the built-in `StandardSchemaValidationPipe` with `@Body({ schema })`, `@Query({ schema })`, or `@Param(..., { schema })` when the project already uses Zod, Valibot, ArkType, or another Standard Schema library.
- **Serialization:** keep `ClassSerializerInterceptor` for class-transformer models. Use `StandardSchemaSerializerInterceptor` with `@SerializeOptions({ schema })` for schema-driven response shaping.
- **Configuration:** `@nestjs/config` accepts Standard Schema through `validationSchema`; Zod is the current documentation's default example. Joi requires v18+ and nests library-specific settings under `validationOptions.libraryOptions`.
- **CLI/build:** use `nest upgrade --dry-run` before an explicit migration. Rspack is the v12 monorepo default; webpack CLI flags are deprecated. Do not migrate an existing build stack merely to match new-project defaults.
- **Routes:** consider `routeConflictPolicy` and `routeResolutionStrategy: 'specificity'` when route shadowing is a real risk; both are opt-in.
- **GraphQL:** GraphiQL is the default IDE. Use `graphql-ws`; `subscriptions-transport-ws` is no longer supported by the latest GraphQL package.
- **NATS:** v12 uses NATS v3 and `@nats-io/transport-node`; review custom serializers/deserializers.
- **Observability:** `@nestjs/observe` is an optional official hosted integration, not a universal dependency. Read [observability](references/observability.md) only when the task calls for it.

## Reference Routing

### Migration, CLI, and Architecture

| Need | Read |
|---|---|
| Upgrade v11 to v12, Node/ESM/tooling changes | [migration-v12](references/migration-v12.md) |
| CLI commands, generators, builders | [cli-overview](references/cli-overview.md) |
| Monorepos and libraries | [cli-monorepo](references/cli-monorepo.md) |
| Controllers and route resolution | [core-controllers](references/core-controllers.md) |
| Modules and exports | [core-modules](references/core-modules.md) |
| Providers and custom providers | [core-providers](references/core-providers.md) |
| Dependency injection | [core-dependency-injection](references/core-dependency-injection.md) |
| Middleware | [core-middleware](references/core-middleware.md) |

### Request Lifecycle and Framework Primitives

| Need | Read |
|---|---|
| Complete request execution order | [best-practices-request-lifecycle](references/best-practices-request-lifecycle.md) |
| Pipes | [fundamentals-pipes](references/fundamentals-pipes.md) |
| Guards and metadata | [fundamentals-guards](references/fundamentals-guards.md) |
| Interceptors | [fundamentals-interceptors](references/fundamentals-interceptors.md) |
| HTTP exceptions and filters | [fundamentals-exception-filters](references/fundamentals-exception-filters.md) |
| Execution context | [fundamentals-execution-context](references/fundamentals-execution-context.md) |
| Custom decorators | [fundamentals-custom-decorators](references/fundamentals-custom-decorators.md) |
| Dynamic modules | [fundamentals-dynamic-modules](references/fundamentals-dynamic-modules.md) |
| Provider scopes | [fundamentals-provider-scopes](references/fundamentals-provider-scopes.md) |
| Lifecycle hooks and shutdown | [fundamentals-lifecycle-events](references/fundamentals-lifecycle-events.md) |
| Lazy loading | [fundamentals-lazy-loading](references/fundamentals-lazy-loading.md) |
| Circular dependencies | [fundamentals-circular-dependency](references/fundamentals-circular-dependency.md) |
| Runtime provider lookup | [fundamentals-module-reference](references/fundamentals-module-reference.md) |
| Unit and e2e testing | [fundamentals-testing](references/fundamentals-testing.md) |

### HTTP, Data, and Operations

| Need | Read |
|---|---|
| Class or Standard Schema validation | [techniques-validation](references/techniques-validation.md) |
| Class or Standard Schema serialization | [techniques-serialization](references/techniques-serialization.md) |
| Configuration validation | [techniques-configuration](references/techniques-configuration.md) |
| Databases overview | [techniques-database](references/techniques-database.md) |
| TypeORM | [recipes-typeorm](references/recipes-typeorm.md) |
| Prisma | [recipes-prisma](references/recipes-prisma.md) |
| Mongoose | [recipes-mongoose](references/recipes-mongoose.md) |
| Caching and Keyv | [techniques-caching](references/techniques-caching.md) |
| Logging | [techniques-logging](references/techniques-logging.md) |
| Official Nest observability | [observability](references/observability.md) |
| File uploads | [techniques-file-upload](references/techniques-file-upload.md) |
| API versioning | [techniques-versioning](references/techniques-versioning.md) |
| Queues and BullMQ | [techniques-queues](references/techniques-queues.md) |
| Scheduling | [techniques-task-scheduling](references/techniques-task-scheduling.md) |
| Events | [techniques-events](references/techniques-events.md) |
| Outbound HTTP | [techniques-http-module](references/techniques-http-module.md) |
| Fastify | [techniques-fastify](references/techniques-fastify.md) |
| Sessions and cookies | [techniques-sessions-cookies](references/techniques-sessions-cookies.md) |
| Compression, streaming, and SSE | [techniques-compression-streaming-sse](references/techniques-compression-streaming-sse.md) |
| MVC and static assets | [techniques-mvc-serve-static](references/techniques-mvc-serve-static.md) |
| Raw body and hybrid apps | [faq-raw-body-hybrid](references/faq-raw-body-hybrid.md) |

### Security and API Contracts

| Need | Read |
|---|---|
| Authentication | [recipes-authentication](references/recipes-authentication.md) |
| RBAC, claims, and policies | [security-authorization](references/security-authorization.md) |
| CORS, Helmet, and throttling | [security-cors-helmet-rate-limiting](references/security-cors-helmet-rate-limiting.md) |
| Encryption and password hashing | [security-encryption-hashing](references/security-encryption-hashing.md) |
| OpenAPI, CLI plugin, Standard Schema | [openapi-swagger](references/openapi-swagger.md) |

### GraphQL, WebSockets, and Microservices

| Need | Read |
|---|---|
| GraphQL setup | [graphql-overview](references/graphql-overview.md) |
| Resolvers and mutations | [graphql-resolvers-mutations](references/graphql-resolvers-mutations.md) |
| Subscriptions | [graphql-subscriptions](references/graphql-subscriptions.md) |
| Scalars, unions, and enums | [graphql-scalars-unions-enums](references/graphql-scalars-unions-enums.md) |
| WebSocket gateways | [websockets-gateways](references/websockets-gateways.md) |
| WebSocket filters, guards, and adapters | [websockets-advanced](references/websockets-advanced.md) |
| Microservices fundamentals | [microservices-overview](references/microservices-overview.md) |
| Redis, Kafka, NATS, and RabbitMQ | [microservices-transports](references/microservices-transports.md) |
| gRPC | [microservices-grpc](references/microservices-grpc.md) |

### Advanced Recipes

| Need | Read |
|---|---|
| CQRS | [recipes-cqrs](references/recipes-cqrs.md) |
| Health checks | [recipes-terminus](references/recipes-terminus.md) |
| CRUD generator | [recipes-crud-generator](references/recipes-crud-generator.md) |
| Swagger recipe | [recipes-documentation](references/recipes-documentation.md) |
