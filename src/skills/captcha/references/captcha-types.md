# CAPTCHA Types — Detection & Injection Patterns

Reference for identifying which CAPTCHA is on a page and injecting the solved token.

---

## reCAPTCHA v2 (Checkbox)

The most common CAPTCHA. Shows a checkbox; sometimes shows an image grid challenge.

### Detection
```javascript
// Returns sitekey if reCAPTCHA v2 is present, null otherwise
const el = document.querySelector('.g-recaptcha, [data-sitekey]:not(.h-captcha):not(.cf-turnstile)');
el?.dataset?.sitekey ?? null;

// Alternative: extract from iframe src
const frame = document.querySelector('iframe[src*="recaptcha"]');
frame?.src?.match(/[?&]k=([^&]+)/)?.[1] ?? null;
```

### Parameters to collect
- `sitekey` — the `data-sitekey` attribute on `.g-recaptcha`
- `pageurl` — `window.location.href`

### Token injection
```javascript
function injectRecaptchaV2(token) {
  // Set the hidden response field (may be display:none — that's fine)
  document.querySelectorAll('[name="g-recaptcha-response"]').forEach(el => {
    el.value = token;
  });

  // Trigger the registered callback
  if (window.___grecaptcha_cfg) {
    Object.values(window.___grecaptcha_cfg.clients || {}).forEach(client => {
      Object.keys(client).forEach(key => {
        const widget = client[key];
        if (widget && typeof widget.callback === 'function') {
          widget.callback(token);
        }
      });
    });
  }

  // Fallback: look for a global callback name in the render call
  // Search page source for: grecaptcha.render(..., { callback: 'FUNCTION_NAME' })
}
```

### Notes
- If injection has no effect, check if there's a `grecaptcha.render(element, { callback: fn })` call
  in the page source — call that function with the token directly.
- Some sites wrap the callback in `window.onRecaptchaSuccess` or similar. Search the page for
  `grecaptcha` to find where the callback is registered.

---

## reCAPTCHA v2 Invisible

No visible checkbox. Triggered programmatically with `grecaptcha.execute()`. Produces the same
token format as v2 checkbox.

### Detection
```javascript
// Invisible reCAPTCHA has no visible .g-recaptcha widget
// Look for grecaptcha.execute() calls or a render with { size: 'invisible' }
const src = document.documentElement.innerHTML;
const isInvisible = src.includes("size: 'invisible'") || src.includes('"invisible"');
```

### Solve with `--invisible` flag
```bash
python scripts/solve_captcha.py --type recaptcha-v2 --invisible --sitekey KEY --pageurl URL
```

### Token injection
Same as v2 checkbox injection above.

---

## reCAPTCHA v3

Score-based, invisible. No user interaction at all. The site calls
`grecaptcha.execute(sitekey, {action: 'actionName'})` in its JS, then validates the returned
score server-side (scores range 0.0–1.0; bots score low).

### Detection
```javascript
// Look for grecaptcha.execute with a sitekey in the page source
// There is no visible widget — detection is by source inspection
const src = document.documentElement.innerHTML;
const match = src.match(/grecaptcha\.execute\(['"]([^'"]+)['"]/);
match?.[1] ?? null;  // sitekey if found
```

Or grep the page HTML for `grecaptcha.execute(` to find the sitekey and action name.

### Parameters
- `sitekey` — from the `grecaptcha.execute('SITEKEY', ...)` call
- `pageurl` — `window.location.href`
- `action` — the action string in `{action: 'NAME'}`, e.g. `verify`, `submit`, `login`
- `min_score` — request a score of at least this value (default 0.5; lower = easier to solve)

### Solve
```bash
python scripts/solve_captcha.py --type recaptcha-v3 \
  --sitekey SITEKEY --pageurl URL \
  --action submit --min-score 0.7
```

### Token injection
v3 tokens are typically consumed by an AJAX call, not a visible form field. The site expects
the token in a specific request parameter. Two approaches:

1. **Intercept the form submit** — inject the token before the AJAX fires:
```javascript
// Override grecaptcha.execute to return your solved token
window.grecaptcha.execute = () => Promise.resolve(TOKEN);
```

2. **Set the hidden field** if the site stores the token in an input before submitting:
```javascript
document.querySelectorAll('[name="g-recaptcha-response"], [name="token"]').forEach(el => {
  el.value = TOKEN;
});
```

---

## hCaptcha

Common on Cloudflare-protected and privacy-focused sites.

### Detection
```javascript
const el = document.querySelector('.h-captcha, [data-hcaptcha-sitekey]');
el?.dataset?.sitekey ?? document.querySelector('[data-sitekey].h-captcha')?.dataset?.sitekey ?? null;
```

### Solve
```bash
python scripts/solve_captcha.py --type hcaptcha --sitekey KEY --pageurl URL
```

### Token injection
```javascript
function injectHcaptcha(token) {
  // Set the response field
  document.querySelectorAll('[name="h-captcha-response"]').forEach(el => {
    el.value = token;
  });

  // Trigger hCaptcha callback
  if (window.hcaptcha) {
    // Some sites register a callback via hcaptcha.render
    const iframes = document.querySelectorAll('iframe[src*="hcaptcha"]');
    // Try the global callback if defined
    if (typeof window.onHcaptchaSuccess === 'function') window.onHcaptchaSuccess(token);
  }
}
```

If the above doesn't trigger the form to proceed, look for `data-callback` on the `.h-captcha`
element and call that function by name:
```javascript
const callbackName = document.querySelector('[data-callback]')?.dataset?.callback;
if (callbackName && window[callbackName]) window[callbackName](token);
```

---

## Cloudflare Turnstile

Cloudflare's newer CAPTCHA, launched 2022. Invisible by default.

### Detection
```javascript
const el = document.querySelector('.cf-turnstile');
el?.dataset?.sitekey ?? null;
```

### Solve
```bash
python scripts/solve_captcha.py --type turnstile --sitekey KEY --pageurl URL
```

### Token injection
```javascript
function injectTurnstile(token) {
  document.querySelectorAll('[name="cf-turnstile-response"]').forEach(el => {
    el.value = token;
  });

  // Some sites use a callback
  const callbackName = document.querySelector('.cf-turnstile')?.dataset?.callback;
  if (callbackName && window[callbackName]) window[callbackName](token);
}
```

---

## Image / Text CAPTCHA

Classic distorted text or simple math CAPTCHAs. Send the image, get text back.

### Detection
```javascript
// Look for an image element with "captcha" in its src or alt
document.querySelector('img[src*="captcha" i], img[alt*="captcha" i]')?.src ?? null;
```

### Capture the image
```python
# With Playwright: screenshot just the CAPTCHA element
captcha_el = page.query_selector('img[alt*="captcha" i]')
captcha_el.screenshot(path="captcha.png")
```

Or fetch the image URL directly:
```python
import urllib.request
img_url = page.evaluate("document.querySelector('img[src*=\"captcha\"]').src")
urllib.request.urlretrieve(img_url, "captcha.png")
```

### Solve
```bash
python scripts/solve_captcha.py --type image --image captcha.png
```

### Use the result
```javascript
// The solved token is the text answer, not a long JWT
document.querySelector('input[name*="captcha" i]').value = SOLVED_TEXT;
```

### Tips for better accuracy
- Crop to just the CAPTCHA image (no padding or surrounding UI)
- Convert to grayscale and increase contrast before sending
- If the CAPTCHA is math (e.g. "3 + 4 = ?"), the solver returns "7" as text

---

## Quick Reference Table

| Type | Detect selector | Key field to inject | Callback trigger |
|------|----------------|---------------------|-----------------|
| reCAPTCHA v2 | `.g-recaptcha` | `[name="g-recaptcha-response"]` | `___grecaptcha_cfg.clients[n][k].callback(token)` |
| reCAPTCHA v2 invisible | script source | `[name="g-recaptcha-response"]` | same as v2 |
| reCAPTCHA v3 | script source | hidden input or AJAX param | override `grecaptcha.execute` |
| hCaptcha | `.h-captcha` | `[name="h-captcha-response"]` | `[data-callback]` function |
| Turnstile | `.cf-turnstile` | `[name="cf-turnstile-response"]` | `[data-callback]` function |
| Image | `img[src*=captcha]` | text input near image | n/a |
