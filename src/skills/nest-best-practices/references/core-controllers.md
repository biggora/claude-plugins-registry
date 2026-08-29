---
name: core-controllers
description: NestJS controllers for handling HTTP requests and responses
---

# Controllers

Controllers are responsible for handling incoming HTTP requests and sending responses back to the client. They use decorators to define routes and handle different HTTP methods.

## Basic Controller

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

## HTTP Method Decorators

Nest provides decorators for all standard HTTP methods:

```typescript
@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'All cats';
  }

  @Post()
  create() {
    return 'Create cat';
  }

  @Put(':id')
  update(@Param('id') id: string) {
    return `Update cat ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `Remove cat ${id}`;
  }

  @Patch(':id')
  patch(@Param('id') id: string) {
    return `Patch cat ${id}`;
  }
}
```

## Request Parameters

Use decorators to extract request data:

```typescript
@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Cat ${id}`;
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Get()
  findAll(@Query('breed') breed?: string) {
    return this.catsService.findAll(breed);
  }

  @Get()
  findWithHeaders(@Headers('authorization') auth: string) {
    return this.catsService.find(auth);
  }
}
```

## Available Parameter Decorators

- `@Request()`, `@Req()` - Request object
- `@Response()`, `@Res()` - Response object (use with caution)
- `@Param(key?: string)` - Route parameters
- `@Body(key?: string)` - Request body
- `@Query(key?: string)` - Query parameters
- `@Headers(name?: string)` - Request headers
- `@Ip()` - Client IP address
- `@HostParam()` - Host parameters
- `@Session()` - Session object

## Status Codes and Headers

```typescript
@Post()
@HttpCode(204)
@Header('Cache-Control', 'no-store')
create() {
  return 'Created';
}

@Get()
@Redirect('https://nestjs.com', 301)
redirect() {
  return;
}
```

## Route Wildcards

```typescript
@Get('abcd/*splat')
findAll() {
  return 'Wildcard route';
}
```

Express 5 requires named wildcards. Use `{*splat}` when the root path must also match.

## Route Conflict Diagnostics (NestJS 12)

Express resolves routes in registration order, so a parameter route can shadow a later static route. Nest 12 provides opt-in diagnostics and specificity-based registration:

```typescript
const app = await NestFactory.create(AppModule, {
  routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
  routeResolutionStrategy: 'specificity',
});
```

Both options preserve legacy behavior when omitted. Enable them when the application benefits from stricter route contracts, then test routes whose order may change.

## Sub-domain Routing

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

## Async Handlers

Controllers can return Promises or Observables:

```typescript
@Get()
async findAll(): Promise<Cat[]> {
  return this.catsService.findAll();
}

@Get()
findAll(): Observable<Cat[]> {
  return of([]);
}
```

## Key Points

- Controllers must be registered in a module's `controllers` array
- Use DTOs (Data Transfer Objects) for request body validation
- Prefer returning values over using `@Res()` for better compatibility
- Without specificity-based resolution, declare static paths before parameterized paths and test ambiguous routes
- Use `@HttpCode()` to set custom status codes
- Use `@Header()` to set custom response headers

<!--
Source references:
- https://docs.nestjs.com/controllers
-->
