---
name: next-best-practices
description: Apply current Next.js App Router practices for routing, Server and Client Components, data access, caching, mutations, navigation, metadata, and performance. Use when implementing, reviewing, debugging, or upgrading a Next.js application. Inspect the installed Next.js version and Cache Components mode before choosing APIs; this skill targets Next.js 16.4, so do not apply 16.3+ behavior to older projects.
---

# Next.js Best Practices

Use the project's installed Next.js version as the source of truth. This skill covers modern Next.js (16.x; 16.4 is current as of Nov 2026, requires Node 20.9+, ships React 19.3) with App Router, React Server Components, and Cache Components, but project-local, version-matched docs take precedence. Cache Components is the recommended default for every app (`create-next-app` enables it). Use current APIs instead of outdated patterns like legacy `unstable_cache`, `getServerSideProps`, or `useFormState`.

**Security:** use Next.js >= 16.4.5 on 16.x (`use cache` cache-leak fixes; 16.x <= 16.4.4 is affected). On 15.x use >= 15.5.29 (image SVG, Edge cookie and response-forwarding fixes). Next.js 17 is not released as of Nov 2026; announced: Cache Components become the default.

## Start With the Project's Mode

Before proposing code:

1. Read `package.json`, the lockfile, `next.config.*`, and the relevant `app/` or `pages/` files.
2. If present, follow the Next.js-managed block in the repository's `AGENTS.md` and read the matching docs in `node_modules/next/dist/docs/`.
3. Confirm whether `cacheComponents` and `partialPrefetching` are enabled. They materially change caching, prerendering, and `<Link>` behavior.
4. Preserve the existing router. Do not migrate from Pages Router to App Router unless the task requests it.
5. Treat canary and `experimental.*` features as opt-in. Do not enable them merely because they exist in the latest docs.

For version detection, bundled docs, Turbopack defaults, and the stable-versus-experimental boundary, read [version-and-tooling](references/version-and-tooling.mdx).

## Cache Components Mode Gate

| Mode | Correct model |
|------|---------------|
| `cacheComponents` absent or `false` | Existing route segment options such as `dynamic`, `revalidate`, and `fetchCache` remain valid. Apply the project's version-matched caching docs. |
| `cacheComponents: true` | Data is dynamic by default. Use `<Suspense>` for request-time work and `'use cache'` plus `cacheLife`/`cacheTag` for cached work. Remove `dynamic`, `revalidate`, `fetchCache`, `dynamicParams`, and `runtime`; they fail config validation in this mode. Cache Components requires the Node.js runtime. |
| `cacheComponents: true`, `partialPrefetching: true` | Each route gets a reusable App Shell. URL-specific work using `params` or `searchParams` belongs behind `<Suspense>` unless a link intentionally prefetches it. Audit existing `<Link prefetch={true}>` calls before adopting. |

With `cacheComponents` (which enables PPR), also set `partialPrefetching: true`; leaving it unset logs a warning.

Read [cache-components](references/cache-components.mdx) before changing caching mode and [core-navigation](references/core-navigation.mdx) before changing prefetch behavior.

## Current Decision Rules

- Prefer Server Components. Add `'use client'` only at the smallest boundary that needs state, effects, event handlers, or browser APIs.
- Keep secrets and privileged data access in server-only modules (`import 'server-only'` on DB and auth modules). Server Actions are reachable POST entry points: authenticate, authorize, and validate inside every action.
- Await `params`, `searchParams`, `cookies()`, and `headers()` in Server Components. In Client Components, unwrap promise props with React `use()` where appropriate.
- Use `useActionState` (from `react`, not `react-dom`; `useFormState` is deprecated) for action results and pending state, and `useOptimistic` for reversible optimistic UI.
- Use `updateTag` in a Server Action for read-your-own-writes. Use `revalidateTag(tag, 'max')` for stale-while-revalidate, including in Route Handlers and webhooks; the single-argument `revalidateTag(tag)` is deprecated. `refresh()` refreshes the client router and works only in Server Actions.
- Prefer `'use cache'` plus `cacheTag` over legacy `unstable_cache` (still works and persists across deploys). Never call the same `use cache` function both directly and inside `unstable_cache`.
- In Next.js 16, `middleware.ts` is renamed `proxy.ts` and exports `proxy()`; the `config.matcher` pattern is unchanged. `proxy.ts` runs on Node.js only and a `runtime` config in it throws; `middleware.ts` is deprecated (kept for Edge only). Codemod: `npx @next/codemod@canary middleware-to-proxy .`
- Since 16.3, prefer `retry()` in `error.tsx`; use stable `catchError` from `next/error` for component-level boundaries. Use `reset()` only when re-fetching Server Component output is intentionally unnecessary.
- Use `next/root-params` only for parameters above a root layout and only from Server Components. Continue using the async `params` prop for ordinary dynamic segments.
- Do not tune defaults without evidence. Next.js 16.3+ already enables small prefetch-response inlining, Turbopack build caching, dev caching, and memory eviction.

## References

Read only the references relevant to the task.

| Topic | Reference |
|-------|-----------|
| Version authority, 16.4 baseline and security floor, 16.3 changes, Turbopack, TypeScript 7 | [version-and-tooling](references/version-and-tooling.mdx) |
| Routes, layouts, and route groups | [core-routing](references/core-routing.mdx) |
| Server and Client Component boundaries | [core-server-client-components](references/core-server-client-components.mdx) |
| Links, App Shells, Partial Prefetching, instant navigation | [core-navigation](references/core-navigation.mdx) |
| Server-side data fetching | [data-fetching-server](references/data-fetching-server.mdx) |
| Client-side data fetching | [data-fetching-client](references/data-fetching-client.mdx) |
| Suspense and streaming | [data-streaming](references/data-streaming.mdx) |
| Server Actions, forms, validation, optimistic UI | [server-actions](references/server-actions.mdx) |
| Revalidation APIs and legacy caching mode | [caching-revalidation](references/caching-revalidation.mdx) |
| Cache Components, `'use cache'`, cache variants, PPR | [cache-components](references/cache-components.mdx) |
| Dynamic segments, `generateStaticParams`, root params | [file-conventions-dynamic-routes](references/file-conventions-dynamic-routes.mdx) |
| Loading, route errors, `catchError`, not found | [file-conventions-loading-error](references/file-conventions-loading-error.mdx) |
| Metadata, Open Graph, JSON-LD, sitemap | [metadata-seo](references/metadata-seo.mdx) |
| Link, Image, Script, Font, Form, server-only | [api-components](references/api-components.mdx) |

## Verification

Use the project's package manager and existing scripts. In proportion to the change:

1. Run the narrow test or type check first.
2. Read `next dev` or `next build` diagnostics; Cache Components errors offer distinct stream, cache, or block fixes with different trade-offs.
3. Exercise the affected route in a real browser. Verify loading, error, navigation, and mutation states, not only compilation.
4. For instant-navigation work, validate the intended click-time UI in development and add an `instant()` Playwright regression test when the project already uses the 16.3+ tooling.

Do not report a navigation as instant from code inspection alone: prefetching is disabled in development and the production loading shell must be inspected or tested explicitly.
