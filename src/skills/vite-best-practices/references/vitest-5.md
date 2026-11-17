# Vitest 5

Vitest 5.1 is current as of Nov 2026 (5.0 released 2026-09-03). It requires **Node.js >= 22.12** and **Vite >= 6.4** (Vite 8 works).

## Do

- Add `vite` to `devDependencies` explicitly: it is now a peer dependency, and Yarn does not install peers automatically.
- Import `defineConfig` from `vitest/config`; keep test config in `test: {}` of the Vite config.
- Expect `clearMocks: true` by default: `vi.clearAllMocks()` runs before every test. Mock call history resets before each test. Opt out with `clearMocks: false`.
- `await` asynchronous assertions: `await expect(promise).resolves.toBe(1)`.
- Use `concurrent: false` where `test.sequential` / `describe.sequential` / the `sequential` option were used (removed).
- Write benchmarks as a test-context fixture (top-level `bench()` imports are removed). It only works in files matching `benchmark.include` (default `**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`, e.g. `parse.bench.ts`); in a regular test file it throws:

```ts
test('compare parsers', async ({ bench }) => {
  await bench.compare(
    bench('JSON.parse', () => JSON.parse(input)),
    bench('custom parser', () => parse(input)),
  )
})
```

## Config changes to know

- Inline projects in `test.projects` now inherit the root config (`extends: true` by default); set `extends: false` per project to opt out.
- `testNamePattern` (`-t`) matches the full name joined by `' > '` (`-t 'math > adds'`), not a space.
- Fake timers also fake `Temporal`; add it to `toNotFake` to keep it real.
- Reporter output (`html`, `json`, `junit`, attachments, screenshots) goes under `.vitest/`; add that one directory to `.gitignore`.
- Browser mode locators are strict by default (`locators.exact`): `getByText('Item')` no longer matches `Item 1`.
