# HTML Brand Book Template

Use this template as the foundation for generating brand guidelines HTML files. Replace all `{{placeholder}}` values with data from the brand data model.

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{brand_name}} — Brand Guidelines</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family={{heading_font}}:wght@{{heading_weights}}&family={{body_font}}:wght@{{body_weights}}&display=swap" rel="stylesheet">

  <style>
    /* ===== CSS Custom Properties (Theme) ===== */
    :root {
      --color-primary: {{primary_hex}};
      --color-secondary: {{secondary_hex}};
      --color-accent: {{accent_hex}};
      --color-bg-light: {{bg_light}};
      --color-bg-dark: {{bg_dark}};
      --color-success: {{success}};
      --color-warning: {{warning}};
      --color-error: {{error}};
      --color-info: {{info}};

      --font-heading: '{{heading_font}}', {{heading_fallback}};
      --font-body: '{{body_font}}', {{body_fallback}};
      --font-mono: '{{mono_font}}', {{mono_fallback}};

      --text-h1: {{scale_h1}};
      --text-h2: {{scale_h2}};
      --text-h3: {{scale_h3}};
      --text-h4: {{scale_h4}};
      --text-h5: {{scale_h5}};
      --text-body: {{scale_body}};
      --text-small: {{scale_small}};
      --text-caption: {{scale_caption}};

      --space-unit: {{space_base}}px;
      --radius-sm: {{radius_sm}};
      --radius-md: {{radius_md}};
      --radius-lg: {{radius_lg}};

      --shadow-sm: {{shadow_sm}};
      --shadow-md: {{shadow_md}};
      --shadow-lg: {{shadow_lg}};
    }

    /* ===== Base Styles ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: 1.6;
      color: #1a1a1a;
      background: #f8f8f8;
    }

    .brand-book { max-width: 960px; margin: 0 auto; background: #fff; }

    /* ===== Section Styles ===== */
    .section {
      padding: 64px 48px;
      border-bottom: 1px solid #e5e5e5;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: var(--text-h2);
      font-weight: 700;
      color: var(--color-secondary);
      margin-bottom: 32px;
      padding-bottom: 12px;
      border-bottom: 3px solid var(--color-primary);
      display: inline-block;
    }

    .section-subtitle {
      font-family: var(--font-heading);
      font-size: var(--text-h4);
      font-weight: 600;
      margin: 32px 0 16px;
    }

    /* ===== Cover Page ===== */
    .cover {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: var(--color-bg-dark);
      color: var(--color-bg-light);
      padding: 64px 48px;
    }

    .cover h1 {
      font-family: var(--font-heading);
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .cover .tagline {
      font-size: var(--text-h3);
      opacity: 0.85;
      margin-bottom: 48px;
    }

    .cover .meta {
      font-size: var(--text-small);
      opacity: 0.6;
    }

    .cover .personality-tags {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .cover .personality-tags span {
      padding: 6px 16px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 9999px;
      font-size: var(--text-small);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ===== TOC ===== */
    .toc { padding: 48px; }
    .toc h2 { font-family: var(--font-heading); font-size: var(--text-h3); margin-bottom: 24px; }
    .toc ol { list-style: none; counter-reset: toc; }
    .toc li { counter-increment: toc; margin-bottom: 12px; }
    .toc li::before {
      content: "0" counter(toc);
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--color-primary);
      margin-right: 12px;
    }
    .toc a { color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #ddd; }
    .toc a:hover { color: var(--color-primary); border-color: var(--color-primary); }

    /* ===== Color Swatches ===== */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }

    .color-card {
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid #e5e5e5;
    }

    .color-swatch {
      height: 120px;
      display: flex;
      align-items: flex-end;
      padding: 12px;
    }

    .color-info {
      padding: 16px;
      font-size: var(--text-small);
    }

    .color-info .color-name {
      font-weight: 600;
      font-size: var(--text-body);
      margin-bottom: 4px;
    }

    .color-info code {
      font-family: var(--font-mono);
      font-size: var(--text-caption);
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      margin-right: 8px;
    }

    .contrast-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 8px;
    }

    .contrast-badge.pass { background: #dcfce7; color: #166534; }
    .contrast-badge.fail { background: #fee2e2; color: #991b1b; }

    /* ===== Typography Specimens ===== */
    .type-specimen {
      margin: 16px 0;
      padding: 24px;
      border: 1px solid #e5e5e5;
      border-radius: var(--radius-md);
    }

    .type-specimen .label {
      font-family: var(--font-mono);
      font-size: var(--text-caption);
      color: #888;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .type-specimen .sample-heading { font-family: var(--font-heading); }
    .type-specimen .sample-body { font-family: var(--font-body); }

    .font-info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: var(--text-small);
    }

    .font-info-table th, .font-info-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }

    .font-info-table th {
      font-weight: 600;
      background: #fafafa;
    }

    /* ===== Logo Section ===== */
    .logo-display {
      background: #f5f5f5;
      padding: 48px;
      text-align: center;
      border-radius: var(--radius-md);
      margin: 24px 0;
    }

    .logo-display img { max-width: 300px; max-height: 200px; }

    .logo-variants {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }

    .logo-variant {
      padding: 32px;
      text-align: center;
      border-radius: var(--radius-md);
      border: 1px solid #e5e5e5;
    }

    .dos-donts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 24px 0;
    }

    .do-item, .dont-item {
      padding: 24px;
      border-radius: var(--radius-md);
    }

    .do-item { background: #f0fdf4; border-left: 4px solid var(--color-success); }
    .dont-item { background: #fef2f2; border-left: 4px solid var(--color-error); }

    .do-item h4::before { content: "Do: "; color: var(--color-success); }
    .dont-item h4::before { content: "Don't: "; color: var(--color-error); }

    /* ===== Voice & Tone ===== */
    .voice-example {
      padding: 20px 24px;
      background: #fafafa;
      border-radius: var(--radius-md);
      margin: 12px 0;
      border-left: 3px solid var(--color-primary);
    }

    .voice-example .context {
      font-family: var(--font-mono);
      font-size: var(--text-caption);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary);
      margin-bottom: 8px;
    }

    .word-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }

    .word-chip {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: var(--text-small);
    }

    .word-chip.do { background: #dcfce7; color: #166534; }
    .word-chip.dont { background: #fee2e2; color: #991b1b; }

    /* ===== Spacing Section ===== */
    .spacing-scale {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      margin: 24px 0;
      padding: 24px;
      background: #fafafa;
      border-radius: var(--radius-md);
    }

    .spacing-block {
      text-align: center;
      font-size: var(--text-caption);
      font-family: var(--font-mono);
    }

    .spacing-block .bar {
      background: var(--color-primary);
      width: 40px;
      margin: 0 auto 8px;
      border-radius: 3px;
    }

    .radius-demo {
      display: flex;
      gap: 24px;
      margin: 24px 0;
    }

    .radius-demo .sample {
      width: 80px;
      height: 80px;
      background: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: var(--text-caption);
      font-family: var(--font-mono);
    }

    /* ===== Component Examples ===== */
    .component-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin: 16px 0;
      align-items: center;
    }

    .btn {
      padding: 10px 24px;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: var(--text-body);
      font-weight: 500;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .btn-primary { background: var(--color-primary); color: #fff; }
    .btn-secondary { background: transparent; color: var(--color-primary); border-color: var(--color-primary); }
    .btn-ghost { background: transparent; color: var(--color-primary); border: none; text-decoration: underline; }

    .card-example {
      border: 1px solid #e5e5e5;
      border-radius: var(--radius-md);
      overflow: hidden;
      max-width: 320px;
      box-shadow: var(--shadow-sm);
    }

    .card-example .card-header {
      height: 160px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    }

    .card-example .card-body { padding: 20px; }
    .card-example .card-body h4 { font-family: var(--font-heading); margin-bottom: 8px; }
    .card-example .card-body p { font-size: var(--text-small); color: #666; }

    .input-example {
      padding: 10px 16px;
      border: 1px solid #d1d5db;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: var(--text-body);
      width: 300px;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-example:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
    }

    .alert {
      padding: 16px 20px;
      border-radius: var(--radius-md);
      font-size: var(--text-small);
      margin: 8px 0;
    }

    .alert-success { background: #f0fdf4; color: #166534; border-left: 4px solid var(--color-success); }
    .alert-warning { background: #fffbeb; color: #854d0e; border-left: 4px solid var(--color-warning); }
    .alert-error { background: #fef2f2; color: #991b1b; border-left: 4px solid var(--color-error); }
    .alert-info { background: #eff6ff; color: #1e40af; border-left: 4px solid var(--color-info); }

    /* ===== Quick Reference ===== */
    .quick-ref {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .quick-ref-card {
      padding: 24px;
      background: #fafafa;
      border-radius: var(--radius-md);
    }

    .quick-ref-card h4 {
      font-family: var(--font-heading);
      font-size: var(--text-body);
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .quick-ref-card .value {
      font-family: var(--font-mono);
      font-size: var(--text-small);
      line-height: 2;
    }

    /* ===== Print Styles ===== */
    @media print {
      body { background: #fff; }
      .brand-book { max-width: 100%; box-shadow: none; }
      .section { page-break-inside: avoid; padding: 32px 24px; }
      .cover { min-height: auto; padding: 48px 24px; page-break-after: always; }
      .toc { page-break-after: always; }
      .color-swatch { height: 80px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .btn, .input-example { border: 1px solid #ccc; }
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .section { padding: 32px 24px; }
      .cover h1 { font-size: 2.5rem; }
      .color-grid { grid-template-columns: 1fr 1fr; }
      .dos-donts { grid-template-columns: 1fr; }
      .quick-ref { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="brand-book">
    <!-- Sections follow: cover, toc, colors, typography, logo, voice, spacing, components, quick-ref -->
  </div>

  <script>
    // WCAG Contrast Ratio Calculator
    function hexToRgb(hex) {
      var r = parseInt(hex.slice(1,3), 16);
      var g = parseInt(hex.slice(3,5), 16);
      var b = parseInt(hex.slice(5,7), 16);
      return [r, g, b];
    }

    function luminance(r, g, b) {
      var a = [r, g, b].map(function(c) {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    function contrastRatio(hex1, hex2) {
      var rgb1 = hexToRgb(hex1);
      var rgb2 = hexToRgb(hex2);
      var l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
      var l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
      var lighter = Math.max(l1, l2);
      var darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function wcagLevel(ratio) {
      if (ratio >= 7) return 'AAA';
      if (ratio >= 4.5) return 'AA';
      if (ratio >= 3) return 'AA Large';
      return 'Fail';
    }

    // Auto-populate contrast badges using textContent (safe DOM method)
    document.querySelectorAll('[data-contrast]').forEach(function(el) {
      var parts = el.dataset.contrast.split(',');
      var fg = parts[0].trim();
      var bg = parts[1].trim();
      var ratio = contrastRatio(fg, bg);
      var level = wcagLevel(ratio);
      var pass = ratio >= 4.5;
      el.textContent = ratio.toFixed(1) + ':1 ' + level;
      el.classList.add(pass ? 'pass' : 'fail');
    });

    // Hex to RGB/HSL display using safe DOM methods
    document.querySelectorAll('[data-hex-convert]').forEach(function(el) {
      var hex = el.dataset.hexConvert;
      var rgb = hexToRgb(hex);
      var r = rgb[0], g = rgb[1], b = rgb[2];
      var rn=r/255, gn=g/255, bn=b/255;
      var max=Math.max(rn,gn,bn), min=Math.min(rn,gn,bn);
      var l=(max+min)/2;
      var h=0, s=0;
      if(max!==min){
        var d=max-min;
        s=l>0.5?d/(2-max-min):d/(max+min);
        if(max===rn){h=((gn-bn)/d+(gn<bn?6:0))/6;}
        else if(max===gn){h=((bn-rn)/d+2)/6;}
        else{h=((rn-gn)/d+4)/6;}
      }

      // Build DOM nodes safely instead of using innerHTML
      var hexCode = document.createElement('code');
      hexCode.textContent = hex;
      var rgbCode = document.createElement('code');
      rgbCode.textContent = 'rgb(' + r + ',' + g + ',' + b + ')';
      var hslCode = document.createElement('code');
      hslCode.textContent = 'hsl(' + Math.round(h*360) + ',' + Math.round(s*100) + '%,' + Math.round(l*100) + '%)';

      el.textContent = '';
      el.appendChild(hexCode);
      el.appendChild(document.createTextNode(' '));
      el.appendChild(rgbCode);
      el.appendChild(document.createTextNode(' '));
      el.appendChild(hslCode);
    });
  </script>
</body>
</html>
```

## Section HTML Patterns

### Cover Page
```html
<section class="cover">
  <!-- If logo exists: <img src="data:image/svg+xml;base64,..." alt="{{brand_name}} logo" style="max-width:200px;margin-bottom:32px"> -->
  <h1>{{brand_name}}</h1>
  <p class="tagline">{{tagline}}</p>
  <p class="meta">Brand Guidelines &mdash; {{date}}</p>
  <div class="personality-tags">
    <span>{{adjective1}}</span>
    <span>{{adjective2}}</span>
    <span>{{adjective3}}</span>
  </div>
</section>
```

### Color Swatch Card
```html
<div class="color-card">
  <div class="color-swatch" style="background-color: {{hex}}"></div>
  <div class="color-info">
    <div class="color-name">{{color_name}}</div>
    <div data-hex-convert="{{hex}}"></div>
    <span class="contrast-badge" data-contrast="{{hex}}, #FFFFFF"></span>
    <span class="contrast-badge" data-contrast="{{hex}}, #000000"></span>
  </div>
</div>
```

### Typography Specimen
```html
<div class="type-specimen">
  <div class="label">H1 — {{scale_h1}} / {{heading_font}} {{heading_weight}}</div>
  <div class="sample-heading" style="font-size: var(--text-h1); font-weight: 700">
    The quick brown fox jumps over the lazy dog
  </div>
</div>
```

### Logo Do's and Don'ts
```html
<div class="dos-donts">
  <div class="do-item">
    <h4>Use on clean backgrounds</h4>
    <p>Place the logo on solid light or dark backgrounds with sufficient contrast.</p>
  </div>
  <div class="dont-item">
    <h4>Stretch or distort</h4>
    <p>Never alter the logo's proportions or apply transformations.</p>
  </div>
</div>
```

### Component Examples
```html
<div class="component-row">
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-ghost">Ghost</button>
</div>
```

### Quick Reference Card
```html
<div class="quick-ref">
  <div class="quick-ref-card">
    <h4>Colors</h4>
    <div class="value">
      Primary: {{primary_hex}}<br>
      Secondary: {{secondary_hex}}<br>
      Accent: {{accent_hex}}
    </div>
  </div>
  <div class="quick-ref-card">
    <h4>Typography</h4>
    <div class="value">
      Heading: {{heading_font}}<br>
      Body: {{body_font}}<br>
      Mono: {{mono_font}}
    </div>
  </div>
</div>
```

## Usage Notes

- Replace all `{{placeholder}}` values with actual brand data model values
- For colors, always populate `data-hex-convert` and `data-contrast` attributes so the JS auto-calculates values
- For fonts, ensure the Google Fonts link URL is correctly constructed with the right families and weights
- If multiple accent colors exist, create one color card per accent
- The contrast badges auto-calculate — just set the data attributes with the hex pairs
- When generating, write the complete HTML file in one go using the Write tool
