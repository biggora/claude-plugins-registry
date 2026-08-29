---
name: effects-scrollbars
description: Tailwind CSS v4.3 scrollbar width, color, and gutter utilities with usability and compatibility guidance
---

# Scrollbars (v4.3+)

Tailwind v4.3 includes first-party utilities for the standard CSS scrollbar APIs. Use them only after confirming that custom scrollbar styling improves the interface and is supported by the project's target browsers.

## Width

```html
<div class="scrollbar-auto overflow-auto">Default platform scrollbar</div>
<div class="scrollbar-thin overflow-auto">Thin scrollbar</div>
<div class="scrollbar-none overflow-auto">Hidden scrollbar</div>
```

Avoid `scrollbar-none` when the scrollbar is the only visible indication that content can scroll. Preserve keyboard, wheel, touch, and assistive-technology access.

## Thumb and Track Colors

```html
<div class="scrollbar-thin scrollbar-thumb-sky-700 scrollbar-track-sky-100 overflow-auto">
  Scrollable content
</div>

<div class="scrollbar-thumb-slate-900/60 scrollbar-track-slate-900/10 overflow-auto">
  Scrollable content
</div>

<div class="scrollbar-thumb-(--scroll-thumb) scrollbar-track-(--scroll-track) overflow-auto">
  Scrollable content
</div>
```

Keep enough contrast between thumb, track, and surrounding content. State variants and responsive variants work normally, for example `hover:scrollbar-thumb-sky-500`.

## Gutter

```html
<div class="scrollbar-gutter-auto overflow-auto">No reserved gutter</div>
<div class="scrollbar-gutter-stable overflow-auto">Reserve space when appropriate</div>
<div class="scrollbar-gutter-both overflow-auto">Reserve both edges</div>
```

Use `scrollbar-gutter-stable` when scrollbar appearance would otherwise shift layout. Use `scrollbar-gutter-both` only when symmetrical gutters are intentional.

## Verification

- Confirm overflow exists and scroll input still works.
- Test the project's supported browsers and operating-system scrollbar settings.
- Check high-contrast/forced-colors behavior and keyboard focus visibility.
- Verify that a hidden or thin scrollbar does not remove the only scroll affordance.

<!--
Source references:
- https://tailwindcss.com/docs/scrollbar-width
- https://tailwindcss.com/docs/scrollbar-color
- https://tailwindcss.com/docs/scrollbar-gutter
- https://tailwindcss.com/blog/tailwindcss-v4-3
-->
