---
name: transform-base
description: Base transform utilities, hardware acceleration, custom transform values, and CSS zoom
---

# Transform

Base utilities for transforming elements.

## Usage

### Hardware acceleration

Use `transform-gpu` to force GPU acceleration for better performance:

```html
<div class="scale-150 transform-gpu">
  GPU-accelerated transform
</div>
```

### CPU rendering

Use `transform-cpu` to force CPU rendering if needed:

```html
<div class="scale-150 transform-cpu">
  CPU-rendered transform
</div>
```

### Removing transforms

Use `transform-none` to remove all transforms:

```html
<div class="skew-y-3 md:transform-none">
  Skewed on mobile, normal on desktop
</div>
```

### Custom transforms

Use arbitrary values for custom transform functions:

```html
<div class="transform-[matrix(1,2,3,4,5,6)]">
  Custom matrix transform
</div>
<div class="transform-[perspective(1000px)_rotateX(45deg)]">
  Custom 3D transform
</div>
```

### Zoom (v4.3+)

Use `zoom-*` when the CSS `zoom` property is specifically desired:

```html
<div class="zoom-75">Zoomed out</div>
<div class="zoom-125">Zoomed in</div>
<div class="zoom-[1.1]">Custom zoom</div>
<div class="zoom-(--preview-zoom)">Variable zoom</div>
```

`zoom` affects layout differently from `scale`. Keep `scale-*` for transform-based animation and use `zoom-*` only when layout-affecting CSS zoom is appropriate.

## Key Points

- `transform-gpu` enables hardware acceleration with `translateZ(0)`
- `transform-cpu` forces CPU rendering (removes GPU acceleration)
- `transform-none` removes all transforms at once
- Use `transform-gpu` only after confirming it improves the relevant animation; it can create a compositing layer and is not a universal performance win
- Custom transforms use arbitrary values: `transform-[...]`
- Transform utilities (translate, rotate, scale, skew) automatically enable transform
- `zoom-*` uses the CSS `zoom` property and is distinct from `scale-*`

<!--
Source references:
- https://tailwindcss.com/docs/transform
- https://tailwindcss.com/docs/zoom
-->
