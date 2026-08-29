---
name: serialization
description: Response serialization with class-transformer or Standard Schema
---

# Serialization

Choose one response-shaping model per endpoint: `ClassSerializerInterceptor` for class-transformer entities, or `StandardSchemaSerializerInterceptor` for Standard Schema-driven responses.

## Basic Usage

Use `ClassSerializerInterceptor` to automatically transform responses:

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  @Get(':id')
  findOne() {
    return new UserEntity({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'secret123',
    });
  }
}
```

## Exclude Properties

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

Response excludes `password`:

```json
{ "id": 1, "firstName": "John", "lastName": "Doe" }
```

## Expose Computed Properties

```typescript
import { Expose } from 'class-transformer';

export class UserEntity {
  firstName: string;
  lastName: string;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

## Transform Properties

```typescript
import { Transform } from 'class-transformer';

export class UserEntity {
  @Transform(({ value }) => value.name)
  role: RoleEntity;  // Outputs role.name instead of full object
}
```

## Serialization Options

Per-route options:

```typescript
import { SerializeOptions } from '@nestjs/common';

@Get()
@SerializeOptions({ excludePrefixes: ['_'] })
findAll() {
  return this.usersService.findAll();
}
```

## Transform Plain Objects

Force transformation of plain objects:

```typescript
@Get()
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
findOne() {
  return {
    id: 1,
    firstName: 'John',
    password: 'secret',  // Will be excluded
  };
}
```

## Global Interceptor

Apply globally:

```typescript
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
```

## Standard Schema Serialization (NestJS 12)

Use schema-driven serialization when the response contract already lives in Zod, Valibot, ArkType, or another Standard Schema library:

```typescript
import {
  SerializeOptions,
  StandardSchemaSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';

@Get(':id')
@UseInterceptors(StandardSchemaSerializerInterceptor)
@SerializeOptions({ schema: userResponseSchema })
findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}
```

The interceptor validates and transforms outgoing data according to the schema. Treat a serialization failure as a server-side contract violation and cover it with tests.

## Groups

Expose different fields based on groups:

```typescript
export class UserEntity {
  @Expose({ groups: ['admin'] })
  email: string;

  @Expose({ groups: ['admin', 'user'] })
  firstName: string;
}

// Controller
@SerializeOptions({ groups: ['admin'] })
@Get('admin')
findForAdmin() {}
```

## Key Points

- Must return class instances, not plain objects
- Works with WebSockets and Microservices
- `@Exclude()` and `@Expose()` from `class-transformer`
- Use `excludeExtraneousValues: true` to only include `@Expose()` fields
- Use `StandardSchemaSerializerInterceptor` instead of class-transformer when the response contract is schema-first

<!--
Source references:
- https://docs.nestjs.com/techniques/serialization
-->
