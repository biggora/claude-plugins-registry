---
name: effects-scrollbar-zoom-tab
description: Scrollbar styling, scrollbar gutter, zoom, and tab-size utilities added in Tailwind CSS v4.3
---

# Scrollbar, Zoom & Tab Size (v4.3+)

Require Tailwind CSS 4.3 or newer; check the installed `tailwindcss` version first.

## Scrollbar

`scrollbar-auto`, `scrollbar-thin`, `scrollbar-none` set `scrollbar-width`. `scrollbar-thumb-*` and `scrollbar-track-*` set `scrollbar-color`. `scrollbar-gutter-*` sets `scrollbar-gutter` (`auto`, `stable`, `both`). These map to the standard CSS scrollbar APIs; use them only when custom scrollbar styling improves the interface and the project's target browsers support it.

```html
<div class="h-72 overflow-auto scrollbar-thin scrollbar-thumb-sky-700 scrollbar-track-sky-100 dark:scrollbar-thumb-sky-400 dark:scrollbar-track-gray-700">…</div>

<div class="h-40 overflow-auto scrollbar-gutter-stable">…</div>
```

Thumb and track colors accept opacity modifiers, CSS variables, and state or responsive variants:

```html
<div class="overflow-auto scrollbar-thumb-slate-900/60 scrollbar-track-slate-900/10 hover:scrollbar-thumb-sky-500">…</div>
<div class="overflow-auto scrollbar-thumb-(--scroll-thumb) scrollbar-track-(--scroll-track)">…</div>
```

Guidance:

- Avoid `scrollbar-none` when the scrollbar is the only visible cue that content scrolls; keep keyboard, wheel, touch, and assistive-technology access working.
- Keep enough contrast between thumb, track, and surrounding content, including in high-contrast/forced-colors modes.
- Use `scrollbar-gutter-stable` when scrollbar appearance would otherwise shift layout; use `scrollbar-gutter-both` only when symmetrical gutters are intentional.
- Verify overflow exists and test the supported browsers and operating-system scrollbar settings.

## Zoom

`zoom-*` sets the CSS `zoom` property. Arbitrary values: `zoom-[1.1]`, `zoom-(--my-zoom)`.

```html
<div class="zoom-125 md:zoom-100">…</div>
```

## Tab size

`tab-*` sets `tab-size`. Arbitrary values: `tab-[12px]`, `tab-(--my-tab-size)`.

```html
<pre class="tab-2">…</pre>
<pre class="tab-8">…</pre>
```

<!--
Source references:
- https://tailwindcss.com/blog/tailwindcss-v4-3
- https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.0
- https://tailwindcss.com/docs/scrollbar-width
- https://tailwindcss.com/docs/scrollbar-color
- https://tailwindcss.com/docs/scrollbar-gutter
-->
