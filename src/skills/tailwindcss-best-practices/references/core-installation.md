---
name: core-installation
description: Choosing and configuring the Tailwind CSS v4 build integration for Vite, PostCSS, webpack, CLI, or Play CDN
---

# Installation

Inspect the framework and existing build pipeline before choosing an integration. Prefer the framework's official Tailwind guide when one exists, and keep all Tailwind packages on the same release line. Do not switch adapters or upgrade versions unless the task calls for it.

## Vite

Use the dedicated plugin for Vite-based stacks such as Vite, SvelteKit, React Router, Nuxt, SolidJS, and Laravel when their current framework guide recommends it.

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

```css
/* style.css */
@import "tailwindcss";
```

## PostCSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

```css
@import "tailwindcss";
```

## Tailwind CLI

```bash
npm install tailwindcss @tailwindcss/cli
```

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css --watch
```

```css
/* input.css */
@import "tailwindcss";
```

## Webpack (v4.2+)

```bash
npm install tailwindcss @tailwindcss/webpack
```

```js
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', '@tailwindcss/webpack'],
      },
    ],
  },
}
```

`@tailwindcss/webpack` is a loader, not an item in webpack's `plugins` array. Its `base` option controls the source-scan base directory, and `optimize` controls output optimization.

```css
@import "tailwindcss";
```

## Play CDN (Development only)

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Use `<style type="text/tailwindcss">` for Tailwind-aware custom CSS in a CDN prototype. The browser package is for development only, not production.

## Framework guides

- **Next.js and Angular**: use the current official framework guide; current Tailwind docs use `@tailwindcss/postcss`.
- **Vite, SvelteKit, React Router, Nuxt, SolidJS, Laravel**: the dedicated Vite plugin is usually the direct integration, subject to the framework guide.
- **Webpack/Turbopack compatibility path**: use the dedicated webpack loader only when the project's pipeline supports it.

## Key Points

- Vite: `@tailwindcss/vite` plugin + `@import "tailwindcss"`
- PostCSS: `@tailwindcss/postcss`
- Webpack: `@tailwindcss/webpack` (v4.2+)
- CLI: `npx @tailwindcss/cli`
- v4 uses CSS-first config; no `tailwind.config.js` required for basics
- Use `@theme` in CSS to customize design tokens

<!--
Source references:
- https://tailwindcss.com/docs/installation/using-vite
- https://tailwindcss.com/docs/installation/using-postcss
- https://tailwindcss.com/docs/installation/tailwind-cli
- https://tailwindcss.com/docs/installation/play-cdn
- https://tailwindcss.com/docs/installation/framework-guides
- https://github.com/tailwindlabs/tailwindcss/tree/main/packages/@tailwindcss-webpack
-->
