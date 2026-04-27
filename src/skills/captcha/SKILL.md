---
name: captcha
description: "Solve CAPTCHAs in automated browser sessions using third-party solving services. Use this skill whenever you need to: bypass a CAPTCHA while automating a website, integrate CAPTCHA solving into a Playwright or Puppeteer script, solve reCAPTCHA v2 or v3, hCaptcha, Cloudflare Turnstile, or image-based CAPTCHAs, automate a login or form submission that's blocked by a CAPTCHA, test a page that has CAPTCHA challenges, or write a script that needs to pass a CAPTCHA programmatically. Also triggers for: \"recaptcha\", \"hcaptcha\", \"turnstile\", \"captcha solving\", \"bypass captcha\", \"solve captcha\", \"pass captcha challenge\", \"automate past captcha\", \"get past robot check\", \"bot verification\". Always use this skill for any CAPTCHA-related automation — even simple cases benefit from correct token injection patterns.
"
---

# CAPTCHA Solver Skill

Solve CAPTCHAs programmatically in web automation workflows.

## How Token-Based CAPTCHA Solving Works

Modern CAPTCHAs (reCAPTCHA, hCaptcha, Turnstile) don't require reading distorted text —
they issue a **signed token** when solved. A third-party service solves the challenge on
your behalf and returns that token. You inject it into the page, and the page thinks the
user solved it.

```
Page with CAPTCHA
    │
    ├─ 1. Extract sitekey + page URL
    ├─ 2. Submit to solving service (waits 15–45s)
    ├─ 3. Receive token string
    ├─ 4. Inject token into hidden field on page
    ├─ 5. Trigger the CAPTCHA callback
    └─ 6. Submit form / continue automation
```

Tokens expire in ~2 minutes — solve immediately before submitting.

---

## Supported CAPTCHA Types

| Type | `--type` flag | How to detect on page |
|------|--------------|----------------------|
| reCAPTCHA v2 (checkbox) | `recaptcha-v2` | `.g-recaptcha` div, `[data-sitekey]` attribute |
| reCAPTCHA v2 invisible | `recaptcha-v2 --invisible` | No visible widget; `grecaptcha.execute()` call |
| reCAPTCHA v3 | `recaptcha-v3` | `grecaptcha.execute(sitekey, {action:...})` in JS |
| hCaptcha | `hcaptcha` | `.h-captcha` div or `[data-hcaptcha-sitekey]` |
| Cloudflare Turnstile | `turnstile` | `.cf-turnstile` div |
| Image/text CAPTCHA | `image` | `<img>` with "captcha" in src or alt |

Read `references/captcha-types.md` for per-type detection JS snippets and injection patterns.

---

## Solving Services

You need an API key from a solving service. All three below use the same API format,
so the solver script works with any of them:

| Service | Flag | Speed | Cost/1K |
|---------|------|-------|---------|
| **2captcha** (recommended) | `--service 2captcha` | 20–40s | ~$1.00 |
| CapMonster Cloud | `--service capmonster` | 10–30s | ~$0.60 |
| Anti-Captcha | `--service anticaptcha` | 15–35s | ~$0.70 |

Set credentials via environment variables (preferred):
```bash
export CAPTCHA_API_KEY=your_key_here
export CAPTCHA_SERVICE=2captcha
```

Read `references/services.md` for signup links, free trial details, and API compatibility.

---

## Setup

Copy the solver script to your project before using it:

```bash
# From your project directory — adjust path to match your skill install location
cp ~/.claude/plugins/captcha/scripts/solve_captcha.py ./solve_captcha.py
```

The script uses only Python stdlib — no `pip install` needed.

## Quick Start: reCAPTCHA v2

### Using the bundled script (recommended)

```bash
python solve_captcha.py \
  --type recaptcha-v2 \
  --sitekey 6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ- \
  --pageurl https://www.google.com/recaptcha/api2/demo \
  --api-key $CAPTCHA_API_KEY
# → {"success": true, "token": "03AGdBq25...", "type": "recaptcha-v2"}
```

### Full Playwright workflow (Python)

**Key insight: start solving before you open the browser.** The service takes 15–40s to return a token. If you kick off the solve call first, that wait happens in the background while you launch the browser and navigate — free parallelism.

```python
import json, os, subprocess, sys
from playwright.sync_api import sync_playwright

SOLVER = "solve_captcha.py"   # must be in same directory or on PATH

def solve(captcha_type, sitekey, pageurl, service=None):
    cmd = [sys.executable, SOLVER,
           "--type", captcha_type,
           "--sitekey", sitekey,
           "--pageurl", pageurl]
    if service:
        cmd += ["--service", service]
    result = subprocess.run(cmd, capture_output=True, text=True, env=os.environ)
    data = json.loads(result.stdout)
    if not data["success"]:
        raise RuntimeError(data["error"])
    return data["token"]

PAGE_URL = "https://www.google.com/recaptcha/api2/demo"
SITEKEY  = "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-"

# Step 1: start solving (this takes 15–40s) — do it BEFORE opening the browser
token = solve("recaptcha-v2", SITEKEY, PAGE_URL)

# Step 2: now launch and navigate — solve is already done or finishing
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto(PAGE_URL)

    # Step 3: inject token — use json.dumps() for safe JS interpolation
    import json as _json
    token_js = _json.dumps(token)
    page.evaluate(f"""
        const token = {token_js};
        const el = document.querySelector('[name="g-recaptcha-response"]');
        if (el) {{ el.value = token; }}
        if (window.___grecaptcha_cfg) {{
            Object.values(window.___grecaptcha_cfg.clients || {{}}).forEach(c => {{
                Object.keys(c).forEach(k => {{
                    if (c[k]?.callback) c[k].callback(token);
                }});
            }});
        }}
    """)

    page.click('#recaptcha-demo-submit')
    browser.close()
```

> **Important:** Always use `json.dumps(token)` when embedding a token in JS — never bare f-string interpolation like `'{token}'`. Token strings are base64url-safe today but the pattern is fragile.

---

## Step-by-Step Workflow

### Step 1 — Detect CAPTCHA type and extract sitekey

Run this JS in the browser (via `page.evaluate` or `browser_evaluate`):

```javascript
(() => {
  const q = s => document.querySelector(s);
  if (q('.g-recaptcha, [data-sitekey]:not(.h-captcha):not(.cf-turnstile)'))
    return { type: 'recaptcha-v2', sitekey: q('[data-sitekey]')?.dataset?.sitekey };
  if (q('.h-captcha, [data-hcaptcha-sitekey]'))
    return { type: 'hcaptcha', sitekey: q('[data-sitekey]')?.dataset?.sitekey };
  if (q('.cf-turnstile'))
    return { type: 'turnstile', sitekey: q('.cf-turnstile')?.dataset?.sitekey };
  if (q('img[src*="captcha" i], img[alt*="captcha" i]'))
    return { type: 'image' };
  return { type: null };
})();
```

For reCAPTCHA v3 (no visible widget), look in the page source for:
```
grecaptcha.execute('SITEKEY', {action: 'ACTION_NAME'})
```

### Step 2 — Run the solver script

Always use `solve_captcha.py` for the API call — don't write your own polling loop. The script handles initial wait, retries, error codes, and service switching.

```bash
# reCAPTCHA v2
python solve_captcha.py --type recaptcha-v2 --sitekey SITEKEY --pageurl URL

# reCAPTCHA v3
python solve_captcha.py --type recaptcha-v3 --sitekey SITEKEY --pageurl URL --action verify

# hCaptcha
python solve_captcha.py --type hcaptcha --sitekey SITEKEY --pageurl URL

# Cloudflare Turnstile
python solve_captcha.py --type turnstile --sitekey SITEKEY --pageurl URL

# Image CAPTCHA (send screenshot of the captcha image)
python solve_captcha.py --type image --image captcha_screenshot.png
```

### Step 3 — Inject the token

Each CAPTCHA type has a different injection pattern. Read `references/captcha-types.md`
for the exact JS for each type.

**reCAPTCHA v2 (most common):**
```javascript
// 1. Set the hidden response field
document.querySelector('[name="g-recaptcha-response"]').value = TOKEN;

// 2. Trigger the registered callback
if (window.___grecaptcha_cfg) {
  Object.values(window.___grecaptcha_cfg.clients || {}).forEach(client => {
    Object.keys(client).forEach(key => {
      if (client[key]?.callback) client[key].callback(TOKEN);
    });
  });
}
```

---

## Image Grid Challenge (Vision AI)

Sometimes after clicking the reCAPTCHA v2 checkbox a grid appears: *"Select all images with traffic lights"*. This is a separate visual challenge — token solving won't help here. The bundled `solve_image_grid.py` handles it by screenshotting the grid and asking a vision AI (Claude or GPT-4V) which cells to click.

```
Requirements: pip install anthropic   (or openai as fallback)
Environment:  ANTHROPIC_API_KEY  or  OPENAI_API_KEY
```

### How it works

```
Checkbox clicked
    │
    ├─ Grid appeared? → screenshot grid cells → ask vision AI → click matching cells
    │                                                          → click Verify
    │                                                          → new round? → repeat
    └─ No grid (trusted IP) → returns True immediately
```

### Integration with your script

```python
from playwright.sync_api import sync_playwright
from solve_image_grid import solve_image_grid  # copy from scripts/

with sync_playwright() as p:
    page = p.chromium.launch(headless=False).new_page()
    page.goto("https://www.google.com/recaptcha/api2/demo")

    # Step 1: click the checkbox (inside its iframe)
    page.frame_locator('iframe[title="reCAPTCHA"]') \
        .locator('.recaptcha-checkbox-border').click()

    # Step 2: handle grid if it appears (returns immediately if no grid)
    solved = solve_image_grid(page)

    if solved:
        page.click('#recaptcha-demo-submit')
```

### Combined flow (grid + token fallback)

Some pages require the grid challenge AND a token. Handle both:

```python
import json, os, subprocess, sys
from solve_image_grid import solve_image_grid

SOLVER = "solve_captcha.py"
SITEKEY = "your-sitekey"

# 1. Click checkbox — may or may not trigger a grid
page.frame_locator('iframe[title="reCAPTCHA"]') \
    .locator('.recaptcha-checkbox-border').click()

# 2. Solve grid if it appeared
grid_ok = solve_image_grid(page)

# 3. If the form still needs a token (check for g-recaptcha-response being empty)
token_empty = page.evaluate(
    "document.querySelector('[name=\"g-recaptcha-response\"]')?.value === ''"
)
if grid_ok and token_empty:
    result = subprocess.run(
        [sys.executable, SOLVER, "--type", "recaptcha-v2",
         "--sitekey", SITEKEY, "--pageurl", page.url],
        capture_output=True, text=True, env=os.environ
    )
    token = json.loads(result.stdout)["token"]
    token_js = json.dumps(token)
    page.evaluate(f"""
        const t = {token_js};
        document.querySelector('[name="g-recaptcha-response"]').value = t;
        if (window.___grecaptcha_cfg)
            Object.values(window.___grecaptcha_cfg.clients||{{}}).forEach(c=>
                Object.keys(c).forEach(k=>{{ if(c[k]?.callback) c[k].callback(t) }})
            );
    """)
```

### Notes

- **Element clicks vs pixel coordinates** — the script clicks grid cells via `frame_locator().locator('td').nth(i)`, not raw pixel coordinates. This is more reliable across different viewport sizes and DPI settings.
- **Multi-round challenges** — Google often shows 2–4 rounds. The script loops automatically up to `max_rounds=6`.
- **"None of the above" rounds** — if the AI returns `[]` (no matches), the script clicks Verify anyway. Google sometimes accepts this.
- **Accuracy** — Claude Opus performs well on clear images (~80–90% first-round accuracy). Blurry or ambiguous grids may need multiple rounds.

---

## Using Playwright MCP Tools

If Playwright MCP tools are available (`mcp__plugin_playwright_playwright__*`):

```
1. browser_navigate → go to the page
2. browser_evaluate → run detection JS to find CAPTCHA type and sitekey
3. Bash → python scripts/solve_captcha.py ... (takes 15-40s)
4. browser_evaluate → inject token + trigger callback
5. browser_click → submit button
6. browser_snapshot → verify success
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Token injection has no effect | Response field is hidden/disabled | Make it visible: `el.style.display='block'; el.removeAttribute('aria-hidden')` |
| CAPTCHA reappears after submit | Token expired (>2 min) | Solve and inject immediately before submitting |
| `ERROR_ZERO_BALANCE` | No credits on service | Top up account at service dashboard |
| `CAPCHA_NOT_READY` timeout | Solver backed up or reCAPTCHA v3 hard | Retry or switch service; for v3 try increasing `--min-score` |
| Callback not triggered | Site uses custom callback name | Search page source for `.ready(function` or `grecaptcha.render` to find callback |
| CAPTCHA passes but site still blocks | Browser fingerprint flagged as bot | Read `references/stealth.md` |
| 2captcha returns wrong text (image) | Low quality image | Crop to just the CAPTCHA, increase contrast before sending |

---

## Reference Files

- `scripts/solve_captcha.py` — CLI solver for token-based CAPTCHAs (stdlib only, no pip install)
- `scripts/solve_image_grid.py` — Vision AI solver for reCAPTCHA v2 image grid challenges
- `references/captcha-types.md` — Detection + injection JS for each CAPTCHA type
- `references/services.md` — Service comparison, signup, pricing, API keys
- `references/stealth.md` — Avoiding bot detection after bypassing CAPTCHA
