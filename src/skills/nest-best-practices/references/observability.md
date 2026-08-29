---
name: observability
description: Optional official NestJS Observe instrumentation and decision boundaries
---

# NestJS Observability

NestJS 12 documents `@nestjs/observe` as its official lifecycle-aware observability SDK. It can report requests, jobs, errors, logs, and traces using Nest concepts such as controllers, providers, resolvers, and queue consumers.

This is an optional hosted integration. Do not add it merely because an application needs ordinary logging, metrics, or health checks. Confirm the user's telemetry destination, data handling requirements, credentials, environments, and cost expectations before adopting it.

## Version and Installation

The SDK requires `@nestjs/core` 11.1.4+ and, for GraphQL instrumentation, `@nestjs/graphql` 13.4.4+.

```bash
npm install @nestjs/observe
```

## Integration

Create the paired module and instrument once at the root:

```typescript
import { createObserveModule } from '@nestjs/observe';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      serviceId: 'orders-api',
    }),
  ],
})
export class AppModule {}
```

Pass the matching instrument during bootstrap so it attaches before traffic is handled:

```typescript
const app = await NestFactory.create(AppModule, {
  instrument: ObserveInstrument,
});
```

The same `instrument` option is supported by `createMicroservice()` and `createApplicationContext()`.

## Operational Guidance

- Supply keys through validated configuration, never source code.
- Use a stable `serviceId`; provide a release version when deployment comparison matters.
- Review whether error source context can expose proprietary or sensitive code before enabling it in regulated environments.
- Enable SDK debug output only while diagnosing setup.
- Add manual spans or metrics only where automatic instrumentation lacks a decision-relevant boundary.
- Verify trace propagation across service boundaries and exercise one successful and one failing request/job before declaring the integration operational.

<!--
Source references:
- https://docs.nestjs.com/observability/overview
- https://docs.nestjs.com/observability/sdk
- https://docs.nestjs.com/observability/manual-instrumentation
-->
