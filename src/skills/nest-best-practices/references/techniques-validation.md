---
name: techniques-validation
description: Data validation using class-based DTOs or Standard Schema in NestJS
---

# Validation

NestJS supports two first-class validation styles. Use `ValidationPipe` for class DTOs with `class-validator`; use `StandardSchemaValidationPipe` when the project already defines Zod, Valibot, ArkType, or another Standard Schema-compatible schema.

## Installation

```bash
npm i --save class-validator class-transformer
```

## Global ValidationPipe

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
```

## Standard Schema Validation (NestJS 12)

Attach a schema to supported route parameter decorators and register the built-in pipe. Decorator metadata alone does not perform validation.

```typescript
import { z } from 'zod';
import { StandardSchemaValidationPipe } from '@nestjs/common';

const createCatSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().nonnegative(),
});

@Post()
create(@Body({ schema: createCatSchema }) body: z.infer<typeof createCatSchema>) {
  return this.catsService.create(body);
}

app.useGlobalPipes(
  new StandardSchemaValidationPipe({ transform: true }),
);
```

The schema option is also available on decorators such as `@Query()`, `@Param()`, and `@RawBody()`. Enable `validateCustomDecorators` only when custom parameter decorators must participate.

## DTO with Validation

```typescript
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(20)
  age: number;

  @IsString()
  breed: string;
}
```

## ValidationPipe Options

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Common Options

- `whitelist` - Strip non-whitelisted properties
- `forbidNonWhitelisted` - Throw error on non-whitelisted properties
- `transform` - Automatically transform payloads to DTO instances
- `disableErrorMessages` - Disable error messages
- `validationError.target` - Expose target in ValidationError
- `stopAtFirstError` - Stop validation on first error
- `errorFormat` - Return validation failures as a `list` or `grouped` object

## Custom Validators

```typescript
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsLongerThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length;
        },
      },
    });
  };
}
```

## Validation Groups

```typescript
export class CreateUserDto {
  @IsString({ groups: ['registration'] })
  email: string;

  @IsString({ groups: ['update'] })
  password: string;
}
```

## Conditional Validation

```typescript
@ValidateIf((o) => o.type === 'email')
@IsEmail()
email: string;
```

## Key Points

- Use `ValidationPipe` globally for automatic validation
- Use `StandardSchemaValidationPipe` for existing schema-first models; do not add a custom Zod pipe when the built-in v12 pipe meets the need
- Decorate DTO properties with `class-validator` decorators
- Enable `transform` to auto-transform payloads
- Use `whitelist` to strip unknown properties
- Create custom validators for complex validation
- Use validation groups for different scenarios
- Do not use `import type` for class DTOs that must exist at runtime

<!--
Source references:
- https://docs.nestjs.com/techniques/validation
-->
