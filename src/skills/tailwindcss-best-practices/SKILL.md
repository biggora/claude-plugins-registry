---
name: tailwindcss-best-practices
description: Tailwind CSS v4 implementation and review guidance. Use when installing Tailwind, styling UI, building responsive or dark-mode layouts, extending CSS-first themes and utilities, diagnosing class detection, or migrating from v3. Covers stable v4.3 behavior; inspect the project's installed version before applying version-specific advice.
---

# Tailwind CSS v4 Best Practices

> Documentation snapshot: Tailwind CSS v4.3.3, verified against the npm `latest` tag and official documentation on 2026-08-29. Recheck https://tailwindcss.com/docs and the npm tag when the user asks for the latest version.

Tailwind v4 is CSS-first: `@theme` defines design tokens, `@utility` registers utilities, and `@custom-variant` registers variants. Legacy JavaScript configuration is still available through `@config`, but it is not detected automatically and some v3 options are unsupported.

## Working Method

1. **Inspect the project before editing.** Identify the installed `tailwindcss` version, package manager, build integration, main CSS entry point, legacy config or plugins, source roots, and existing design tokens/components. Do not upgrade a project merely because this skill documents a newer version.
2. **Choose the integration that matches the stack.** Prefer the framework's official guide when one exists. Use `@tailwindcss/vite` for Vite-based stacks, `@tailwindcss/postcss` for PostCSS-based stacks such as Next.js, `@tailwindcss/webpack` as a webpack loader, or `@tailwindcss/cli` for a standalone build. Read [installation](references/core-installation.md) before changing build configuration.
3. **Use the smallest styling mechanism that fits.** Prefer an existing utility or component; use an arbitrary value for a true one-off; add an `@theme` token when a design value is reused; add `@utility` only for a reusable CSS capability; use custom CSS for third-party overrides or rules that are clearer as CSS.
4. **Keep candidates statically detectable.** Map props and states to complete class strings. Do not construct fragments such as `` `bg-${color}-500` ``. Read [source detection](references/core-source-detection.md) for monorepos, external packages, exclusions, and safelists.
5. **Preserve the existing design system.** Reuse its spacing, color, typography, radius, component, and class-merging conventions. Avoid introducing arbitrary values when a matching token already exists.
6. **Verify the observable result.** Run the relevant build/type/lint/tests, confirm expected utilities appear in compiled CSS when detection is in question, and inspect responsive, state, dark-mode, focus, and reduced-motion behavior in the rendered UI when applicable.

## v4.3 Additions

| Capability | Use |
|---|---|
| Scrollbars | `scrollbar-auto`, `scrollbar-thin`, `scrollbar-none`, `scrollbar-thumb-*`, `scrollbar-track-*`, and `scrollbar-gutter-*`; see [scrollbars](references/effects-scrollbars.md) |
| Size containers | `@container-size` or `@container-size/{name}` when queries or container units need block-size information; see [responsive design](references/core-responsive.md) |
| Zoom | `zoom-*`, `zoom-[value]`, and `zoom-(--property)` for CSS `zoom`; see [transforms](references/transform-base.md) |
| Tab size | `tab-*`, `tab-[value]`, and `tab-(--property)` for rendered tab width; see [typography](references/typography-font-text.md) |
| Variants in CSS | `@variant hover:focus` for stacked variants and `@variant hover, focus` for a shared block |
| Functional utilities | `--default(...)` inside `--value(...)` or `--modifier(...)` when the bare utility needs a fallback; see [functions and directives](references/features-functions-directives.md) |

## Critical v4 Migration Gotchas

These are the most common mistakes when working with Tailwind v4. If you're migrating from v3 or using v4 for the first time, read the [upgrade guide](references/features-upgrade.md) — but here are the top trip-ups:

| v3 (old) | v4 (correct) | Why it changed |
|----------|-------------|----------------|
| `!bg-red-500` | `bg-red-500!` | Important modifier moved from prefix to suffix |
| `bg-opacity-75` | `bg-red-500/75` | Opacity modifiers removed; use slash syntax on the color |
| `shadow` | `shadow-sm` | Shadow scale shifted down one step |
| `shadow-sm` | `shadow-xs` | Shadow scale shifted down one step |
| `rounded` | `rounded-sm` | Border radius scale shifted down one step |
| `rounded-sm` | `rounded-xs` | Border radius scale shifted down one step |
| `ring` | `ring-3` | Default ring width changed from 3px to 1px |
| `outline-none` | `outline-hidden` | Renamed for clarity |
| `flex-shrink-0` | `shrink-0` | Shorter alias is now the only form |
| `flex-grow` | `grow` | Shorter alias is now the only form |
| `overflow-ellipsis` | `text-ellipsis` | Renamed for consistency |
| `blur` | `blur-sm` | Blur scale shifted down one step |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Single CSS import replaces three directives |
| Automatically detected `tailwind.config.js` | CSS-first directives, or explicit `@config` for compatibility | JS config is no longer auto-detected |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark, .dark *));` | Dark mode config moves to CSS |
| `bg-[--var]` | `bg-(--var)` | CSS variable arbitrary values use parentheses |
| `theme(screens.xl)` | `theme(--breakpoint-xl)` | Theme function uses CSS variable names |
| `@layer utilities { }` | `@utility name { }` | Custom utilities use dedicated directive |
| `start-*` / `end-*` | `inset-s-*` / `inset-e-*` | Deprecated in v4.2 |

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Installation | Vite, PostCSS, Webpack, CLI, and CDN setup | [core-installation](references/core-installation.md) |
| Utility Classes | Understanding Tailwind's utility-first approach | [core-utility-classes](references/core-utility-classes.md) |
| Theme Variables | Design tokens, `@theme` directive, theme variable namespaces | [core-theme](references/core-theme.md) |
| Responsive Design | Mobile-first breakpoints, responsive variants, container queries | [core-responsive](references/core-responsive.md) |
| Variants | Conditional styling with state, pseudo-class, media query, and pointer variants | [core-variants](references/core-variants.md) |
| Preflight | Tailwind's base styles and how to extend or disable them | [core-preflight](references/core-preflight.md) |
| Source Detection | How Tailwind detects classes, `@source`, `@source not`, `@source inline()` | [core-source-detection](references/core-source-detection.md) |

## Layout

### Display & Flexbox & Grid

| Topic | Description | Reference |
|-------|-------------|-----------|
| Display | flex, grid, block, inline, hidden, sr-only, flow-root, contents | [layout-display](references/layout-display.md) |
| Flexbox | flex-direction, justify, items, gap, grow, shrink, wrap, order | [layout-flexbox](references/layout-flexbox.md) |
| Grid | grid-cols, grid-rows, gap, place-items, col-span, row-span, subgrid | [layout-grid](references/layout-grid.md) |
| Aspect Ratio | Controlling element aspect ratio for responsive media | [layout-aspect-ratio](references/layout-aspect-ratio.md) |
| Columns | Multi-column layout for magazine-style or masonry layouts | [layout-columns](references/layout-columns.md) |

### Positioning

| Topic | Description | Reference |
|-------|-------------|-----------|
| Position | Controlling element positioning with static, relative, absolute, fixed, and sticky | [layout-position](references/layout-position.md) |
| Inset | Placement of positioned elements with inset, logical inset (`inset-s-*`, `inset-bs-*`), and deprecated `start-*`/`end-*` | [layout-inset](references/layout-inset.md) |

### Sizing

| Topic | Description | Reference |
|-------|-------------|-----------|
| Width | Setting element width with spacing scale, fractions, container sizes, viewport units | [layout-width](references/layout-width.md) |
| Height | Setting element height with spacing scale, fractions, viewport units | [layout-height](references/layout-height.md) |
| Min & Max Sizing | min-width, max-width, min-height, max-height constraints | [layout-min-max-sizing](references/layout-min-max-sizing.md) |
| Logical Sizing | Writing-mode-aware sizing: `inline-*`, `block-*`, `min-inline-*`, `max-block-*` (v4.2) | [layout-logical-properties](references/layout-logical-properties.md) |

### Spacing

| Topic | Description | Reference |
|-------|-------------|-----------|
| Margin | Margins with spacing scale, negative values, logical properties (`mbs-*`, `mbe-*`) | [layout-margin](references/layout-margin.md) |
| Padding | Padding with spacing scale, logical properties (`pbs-*`, `pbe-*`) | [layout-padding](references/layout-padding.md) |

### Overflow

| Topic | Description | Reference |
|-------|-------------|-----------|
| Overflow | Controlling how elements handle content that overflows | [layout-overflow](references/layout-overflow.md) |

### Images & Replaced Elements

| Topic | Description | Reference |
|-------|-------------|-----------|
| Object Fit & Position | Controlling how images and video are resized and positioned | [layout-object-fit-position](references/layout-object-fit-position.md) |

### Tables

| Topic | Description | Reference |
|-------|-------------|-----------|
| Table Layout | border-collapse, table-auto, table-fixed | [layout-tables](references/layout-tables.md) |

## Transforms

| Topic | Description | Reference |
|-------|-------------|-----------|
| Transform Base | Base transform utilities, hardware acceleration, custom transform values | [transform-base](references/transform-base.md) |
| Translate | Translating elements on x, y, z axes with spacing scale and percentages | [transform-translate](references/transform-translate.md) |
| Rotate | Rotating elements in 2D and 3D space | [transform-rotate](references/transform-rotate.md) |
| Scale | Scaling elements uniformly or on specific axes | [transform-scale](references/transform-scale.md) |
| Skew | Skewing elements on x and y axes | [transform-skew](references/transform-skew.md) |

## Typography

| Topic | Description | Reference |
|-------|-------------|-----------|
| Font & Text | Font size, weight, color, line-height, letter-spacing, decoration, truncate, `wrap-break-word`, `wrap-anywhere` | [typography-font-text](references/typography-font-text.md) |
| Text Align | Controlling text alignment with left, center, right, justify | [typography-text-align](references/typography-text-align.md) |
| List Style | list-style-type, list-style-position for bullets and markers | [typography-list-style](references/typography-list-style.md) |

## Visual

| Topic | Description | Reference |
|-------|-------------|-----------|
| Background | Background color, gradient, image, size, position | [visual-background](references/visual-background.md) |
| Border | Border width, color, radius, divide, ring, block border utilities (`border-bs-*`, `border-be-*`) | [visual-border](references/visual-border.md) |
| Effects | Box shadow, opacity, mix-blend, backdrop-blur, filter, colored drop shadows | [visual-effects](references/visual-effects.md) |
| SVG | fill, stroke, stroke-width for SVG and icon styling | [visual-svg](references/visual-svg.md) |
| Text Shadow | Text shadow sizes, colors, and opacity modifiers (v4.1) | [effects-text-shadow](references/effects-text-shadow.md) |
| Mask | Composable mask utilities with gradient and radial masks (v4.1) | [effects-mask](references/effects-mask.md) |
| Scrollbars | Width, thumb/track colors, and stable gutter utilities (v4.3) | [effects-scrollbars](references/effects-scrollbars.md) |

## Effects & Interactivity

| Topic | Description | Reference |
|-------|-------------|-----------|
| Transition & Animation | CSS transitions, animation keyframes, reduced motion | [effects-transition-animation](references/effects-transition-animation.md) |
| Visibility & Interactivity | Visibility, cursor, pointer-events, user-select, z-index | [effects-visibility-interactivity](references/effects-visibility-interactivity.md) |
| Form Controls | accent-color, appearance, caret-color, resize | [effects-form-controls](references/effects-form-controls.md) |
| Scroll Snap | scroll-snap-type, scroll-snap-align for carousels | [effects-scroll-snap](references/effects-scroll-snap.md) |

## Features

### Dark Mode

| Topic | Description | Reference |
|-------|-------------|-----------|
| Dark Mode | Dark mode with `dark:` variant, `@custom-variant`, class and data-attribute strategies | [features-dark-mode](references/features-dark-mode.md) |

### Migration

| Topic | Description | Reference |
|-------|-------------|-----------|
| Upgrade Guide | Migrating from v3 to v4, all renamed/removed utilities, scale shifts, config migration | [features-upgrade](references/features-upgrade.md) |

### Customization

| Topic | Description | Reference |
|-------|-------------|-----------|
| Custom Styles | Adding custom styles, utilities with `@utility`, variants with `@custom-variant`, arbitrary values | [features-custom-styles](references/features-custom-styles.md) |
| Functions & Directives | Tailwind's CSS directives (`@theme`, `@utility`, `@custom-variant`, `@source`) and functions | [features-functions-directives](references/features-functions-directives.md) |
| Content Detection | How Tailwind detects classes, `@source` configuration, safelisting with `@source inline()` | [features-content-detection](references/features-content-detection.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Utility Patterns | Managing duplication, conflicts, important modifier, when to use components | [best-practices-utility-patterns](references/best-practices-utility-patterns.md) |

## Key Recommendations

- Prefer utilities and existing components over new abstraction layers.
- Define reusable design tokens with `@theme`; use `:root` for CSS variables that should not generate utilities.
- Treat unprefixed responsive utilities as the mobile baseline and breakpoint variants as overrides.
- Keep full candidate strings in source; map dynamic inputs to static class lists.
- Use `@custom-variant` to define a variant and `@variant` to apply an existing variant inside CSS.
- Prefer CSS-first configuration for new v4 work; retain `@config` or `@plugin` only when compatibility requires it.
- Use consistent units for breakpoints; the official defaults use `rem`, and mixed units can produce unexpected ordering.
- Do not use Play CDN in production or add Sass/Less/Stylus in front of Tailwind v4.
