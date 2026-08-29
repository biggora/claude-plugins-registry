# Type-Level Performance

TypeScript performance can be dominated by the file graph, module resolution, declaration libraries, project layout, plugins, emit, or complex types. Measure the actual command before changing types or compiler flags.

## Diagnosing Slow Types

### Compiler Flags for Profiling

```bash
# Generate a trace for analysis
tsc --generateTrace ./trace-output

# Show time spent on each file
tsc --extendedDiagnostics

# Show which types are being checked
tsc --listFiles
```

The trace output can be loaded in Chrome DevTools (Performance tab) or `@typescript/analyze-trace`:

```bash
npx @typescript/analyze-trace ./trace-output
```

Record the TypeScript/checker version and compare the same command under the same cold/warm-cache conditions. A framework checker and plain `tsc` are not interchangeable benchmarks.

### TypeScript 7

TypeScript 7 parallelizes parsing, checking, and emit and has a rebuilt watch implementation. It also exposes experimental `--checkers` and `--builders` tuning plus `--singleThreaded` for debugging or constrained environments. Keep defaults until repository measurements identify a specific bottleneck; experimental controls are not generic speed-up switches.

### Common Symptoms

- IDE autocompletion is slow or laggy
- `tsc` takes significantly longer than expected
- Hover types show `...` (type too complex to display)
- "Type instantiation is excessively deep" errors

## Rules for Fast Types

### 1. Prefer Interfaces Over Intersections

```typescript
// Slower — creates anonymous intersection each time
type User = BaseEntity & { name: string; email: string };

// Faster — interfaces are cached by name
interface User extends BaseEntity {
  name: string;
  email: string;
}
```

Interfaces are cached by identity. Intersections create new anonymous types on every use.

### 2. Limit Union Size

Unions beyond ~25-50 members start impacting performance. Large unions from template literals are a common cause:

```typescript
// This creates a union of 10,000 members — very slow
type Color = `#${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}`;

// Better: use a branded string
type Color = string & { readonly __brand: "Color" };
```

### 3. Avoid Deep Recursive Types

```typescript
// Slow — recursion depth grows with path length
type DeepGet<T, Path extends string> =
  Path extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? DeepGet<T[Head], Tail>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

// If this is slow, consider:
// 1. Limiting recursion depth with a counter
// 2. Using a simpler type and casting at the boundary
// 3. Moving the logic to runtime validation
```

### Tail-Call Optimization for Recursive Types

TypeScript optimizes tail-position conditional types. Structure recursion to be tail-recursive:

```typescript
// Not tail-recursive — wraps result before returning
type BadReverse<T extends any[]> =
  T extends [infer Head, ...infer Tail]
    ? [...BadReverse<Tail>, Head]
    : [];

// Tail-recursive — accumulator pattern
type Reverse<T extends any[], Acc extends any[] = []> =
  T extends [infer Head, ...infer Tail]
    ? Reverse<Tail, [Head, ...Acc]>
    : Acc;
```

### 4. Evaluate `skipLibCheck`

`skipLibCheck` skips checking declaration-file internals and can reduce work in dependency-heavy projects:

```jsonc
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

It can also hide duplicate or incompatible library declarations. Measure its benefit and document the trade-off; do not enable it solely to make dependency diagnostics disappear.

### 5. Use Project References for Monorepos

Break large codebases into smaller projects with `composite` and project references. This enables incremental compilation:

```bash
tsc --build --incremental
```

### 6. Avoid Conditional Types in Hot Paths

Conditional types that TypeScript can't resolve eagerly (because they involve generic parameters) stay deferred and get re-evaluated at every use site:

```typescript
// This stays deferred inside generic functions — expensive
function process<T>(value: T): T extends string ? number : boolean {
  // ...
}

// Better: use overloads for finite cases
function process(value: string): number;
function process(value: number): boolean;
function process(value: string | number): number | boolean {
  // ...
}
```

### 7. Simplify Mapped Types

```typescript
// Slow — maps, remaps, and conditionally transforms every key
type Complex<T> = {
  [K in keyof T as T[K] extends Function
    ? `handle${Capitalize<string & K>}`
    : K
  ]: T[K] extends Function
    ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
    : Readonly<T[K]>;
};

// Faster — split into smaller, composable types
type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};
type Data<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: Readonly<T[K]>;
};
type AsyncMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : never;
};
```

## When to Give Up on Types

Sometimes the cost of a perfectly computed type outweighs its benefit:

1. Validate external data at the boundary, then expose a simpler validated type internally.
2. Replace combinatorial template-literal or recursive types with a documented branded type and runtime constructor.
3. Use overloads for a small finite API instead of a deferred conditional return type.
4. If an assertion is unavoidable, keep it at one proved boundary; do not spread `any` through the API.

The goal is to catch real bugs with maintainable diagnostics, not to encode every runtime computation in the type system.

## Quick Performance Checklist

- [ ] `strict: true` (catches bugs without complex types)
- [ ] `skipLibCheck` measured and its diagnostic trade-off accepted
- [ ] `incremental` or project references measured with correct cache handling
- [ ] Interfaces over intersections for object types
- [ ] Large generated unions and cross-products avoided
- [ ] Recursive types use accumulator pattern
- [ ] No deeply nested conditional types in generic functions
- [ ] Project references for monorepos
- [ ] `--generateTrace` if still slow — find the hotspot
