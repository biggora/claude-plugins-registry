# Conditional Types

Conditional types select one of two types based on a condition, enabling type-level logic similar to ternary expressions.

## Basic Syntax

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;        // false
```

The syntax is `T extends U ? X : Y` — if `T` is assignable to `U`, the result is `X`, otherwise `Y`.

## The `infer` Keyword

`infer` declares a type variable within a conditional type, extracting parts of a type:

```typescript
// Extract the element type from an array
type ElementType<T> = T extends (infer E)[] ? E : never;
type A = ElementType<string[]>;  // string
type B = ElementType<number>;    // never

// Extract the return type of a function
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type C = MyReturnType<() => string>;  // string

// Extract promise inner type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type D = UnwrapPromise<Promise<number>>;  // number
type E = UnwrapPromise<string>;            // string

// Multiple infer positions
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type F = FirstArg<(name: string, age: number) => void>;  // string
```

### `infer` with Constraints (TS 4.7+)

You can constrain what `infer` matches:

```typescript
// Only infer if the element is a string
type StringElements<T> = T extends (infer E extends string)[] ? E : never;
type G = StringElements<["a", "b", "c"]>;  // "a" | "b" | "c"
type H = StringElements<[1, 2, 3]>;         // never
```

## Distributive Conditional Types

When a conditional type acts on a **naked type parameter** (not wrapped in `[]`, `Promise<>`, etc.), it distributes over union types:

```typescript
type ToArray<T> = T extends any ? T[] : never;

// Distributes: applies to each union member separately
type A = ToArray<string | number>;  // string[] | number[]

// Compare with non-distributive version:
type ToArrayND<T> = [T] extends [any] ? T[] : never;
type B = ToArrayND<string | number>;  // (string | number)[]
```

### Preventing Distribution

Wrap both sides in `[]` to prevent distribution:

```typescript
type IsNever<T> = [T] extends [never] ? true : false;

type A = IsNever<never>;   // true
type B = IsNever<string>;  // false

// Without brackets, never distributes to... nothing
type IsNeverBad<T> = T extends never ? true : false;
type C = IsNeverBad<never>;  // never (not true!)
```

## Practical Patterns

### Filtering Union Members

```typescript
// Keep only object types from a union
type ObjectsOnly<T> = T extends object ? T : never;
type Mixed = string | { a: 1 } | number | { b: 2 };
type OnlyObjects = ObjectsOnly<Mixed>;  // { a: 1 } | { b: 2 }

// Keep only functions
type FunctionsOnly<T> = T extends (...args: any[]) => any ? T : never;
```

### Recursive Conditional Types

```typescript
// Deeply unwrap promises
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
type A = DeepAwaited<Promise<Promise<Promise<string>>>>;  // string

// Flatten nested arrays
type Flatten<T> = T extends (infer E)[] ? Flatten<E> : T;
type B = Flatten<number[][][]>;  // number
```

### Extracting Based on Shape

```typescript
// Extract event handlers from an object type
type EventHandlers<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};

interface Component {
  onClick: (e: MouseEvent) => void;
  onHover: (e: MouseEvent) => void;
  className: string;
  id: string;
}

type Handlers = EventHandlers<Component>;
// { onClick: (e: MouseEvent) => void; onHover: (e: MouseEvent) => void }
```

### Conditional Return Types

```typescript
// Prefer overloads when the call surface has a small finite set of cases.
function process(value: string): string[];
function process(value: number): number;
function process(value: string | number): string[] | number {
  if (typeof value === "string") {
    return value.split("");
  }
  return value * 2;
}

const a = process("hello");  // string[]
const b = process(42);        // number
```

An unresolved generic conditional type is not narrowed just because its runtime value was narrowed. Do not respond with `as any` by default. For finite cases use overloads; for a genuinely generic relationship, keep any unavoidable assertion narrow and document the runtime invariant that makes it sound.

### Type-Level Assertions

```typescript
// Ensure a type satisfies a condition at the type level
type Assert<T extends true> = T;
type IsEqual<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;

// Compile-time test
type _test = Assert<IsEqual<string, string>>;  // OK
// type _test2 = Assert<IsEqual<string, number>>;  // Error!
```

## Common Utility Implementations

```typescript
// Built-in Exclude
type MyExclude<T, U> = T extends U ? never : T;

// Built-in Extract
type MyExtract<T, U> = T extends U ? T : never;

// Built-in NonNullable
type MyNonNullable<T> = T extends null | undefined ? never : T;

// Built-in Parameters
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// Built-in ReturnType
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

## Gotchas

1. **`never` in conditionals**: `never` distributes to nothing. Use `[T] extends [never]` to check for never.

2. **`any` in conditionals**: `any` produces a union of both branches:
   ```typescript
   type Test<T> = T extends string ? "yes" : "no";
   type X = Test<any>;  // "yes" | "no"
   ```

3. **Depth limits**: Deep or expanding recursive types can hit TypeScript's instantiation limits. The practical limit depends on the type's shape and compiler version, so do not rely on a fixed depth.

4. **Assignability of conditional types**: TypeScript often can't resolve conditional types involving unresolved generics. Inside a generic function, `T extends X ? A : B` remains unresolved.
