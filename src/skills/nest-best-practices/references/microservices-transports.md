---
name: microservices-transports
description: Redis, Kafka, NATS, RabbitMQ transport configuration
---

# Microservice Transports

## Redis

```bash
npm i ioredis
```

```typescript
{
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
    password: 'secret',
    retryAttempts: 3,
    retryDelay: 1000,
    wildcards: true,  // psubscribe for pattern matching
  },
}
```

Client: `ClientsModule.register([{ name: 'MATH_SERVICE', transport: Transport.REDIS, options: {...} }])`

## Kafka

```bash
npm i kafkajs
```

```typescript
{
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'my-consumer',
    },
    producer: {
      allowAutoTopicCreation: true,
    },
  },
}
```

Use `@MessagePattern('topic')` for Kafka topics. Event-based (fire-and-forget) by default.

NestJS 12 also accepts regular expressions in Kafka `@MessagePattern()` and `@EventPattern()`. Use them only when the consumer intentionally owns a bounded topic family and cover the match set with integration tests.

## NATS

```bash
npm i @nats-io/transport-node
```

```typescript
{
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'my-queue',  // queue group
  },
}
```

Supports wildcards: `@MessagePattern('time.us.*')` — `*` and `>` (multi-level).

NestJS 12 targets NATS v3. Replace direct imports from `nats` with the corresponding `@nats-io/*` packages. Custom deserializers now receive the full NATS message and should read JSON through `msg.json()`; review serializer/deserializer tests during migration.

## RabbitMQ

```bash
npm i amqplib
```

```typescript
{
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'my_queue',
    queueOptions: {
      durable: true,
    },
    noAck: false,
    prefetchCount: 1,
  },
}
```

## Transport Comparison

| Transport | Pattern | Use Case |
|-----------|---------|----------|
| TCP | Request-Response | Internal RPC |
| Redis | Pub/Sub, Request-Response | Caching, queues |
| Kafka | Event-based | Event streaming |
| NATS | Pub/Sub, Request-Response | Lightweight messaging |
| RabbitMQ | Pub/Sub, Request-Response | Enterprise messaging |
| gRPC | Request-Response, Streaming | Performance, typed APIs |

## Key Points

- Redis: fire-and-forget, no delivery guarantee
- Kafka: persistent events, consumer groups
- NATS: wildcards (`*`, `>`), queue groups
- RabbitMQ: durable queues, ack required for reliability

<!--
Source references:
- https://docs.nestjs.com/microservices/redis
- https://docs.nestjs.com/microservices/kafka
- https://docs.nestjs.com/microservices/nats
- https://docs.nestjs.com/microservices/rabbitmq
-->
