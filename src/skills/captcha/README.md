# captcha

Claude Code skill for solving CAPTCHAs in automated browser sessions.

Supports token-based solving (reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile) via third-party services, and visual image grid solving via Claude / GPT-4V.

---

## What it does

| Scenario | How |
|----------|-----|
| reCAPTCHA v2 checkbox | `solve_captcha.py` → token → inject into page |
| reCAPTCHA v3 (invisible) | `solve_captcha.py --type recaptcha-v3` |
| hCaptcha | `solve_captcha.py --type hcaptcha` |
| Cloudflare Turnstile | `solve_captcha.py --type turnstile` |
| Image grid ("select all traffic lights") | `solve_image_grid.py` → Claude/GPT-4V → click cells |
| Classic distorted text image | `solve_captcha.py --type image` |

---

## Installation

```bash
# Install the skill via claude-plugins
claude-plugins install captcha

# Copy the solver scripts to your project
cp ~/.claude/plugins/captcha/scripts/solve_captcha.py ./
cp ~/.claude/plugins/captcha/scripts/solve_image_grid.py ./  # only if you need image grid
```

---

## Requirements

**Token-based solving** (`solve_captcha.py`) — no extra packages, uses Python stdlib only.

**Image grid solving** (`solve_image_grid.py`):
```bash
pip install anthropic playwright   # Claude (recommended)
# or:
pip install openai playwright      # GPT-4V fallback
```

**Browser automation:**
```bash
pip install playwright
playwright install chromium
```

---

## Solving services

Token-based solving requires an API key from one of these services:

| Service | Flag | ~Speed | ~Cost/1K solves |
|---------|------|--------|-----------------|
| [2captcha](https://2captcha.com) | `--service 2captcha` | 20–40s | $1.00 |
| [CapMonster](https://capmonster.cloud) | `--service capmonster` | 10–30s | $0.60 |
| [Anti-Captcha](https://anti-captcha.com) | `--service anticaptcha` | 15–35s | $0.70 |

```bash
export CAPTCHA_API_KEY=your_key_here
export CAPTCHA_SERVICE=2captcha   # or capmonster, anticaptcha
```

---

## Quick start

### Token-based (reCAPTCHA v2)

```python
import json, os, subprocess, sys
from playwright.sync_api import sync_playwright

def solve(captcha_type, sitekey, pageurl):
    result = subprocess.run(
        [sys.executable, "solve_captcha.py",
         "--type", captcha_type, "--sitekey", sitekey, "--pageurl", pageurl],
        capture_output=True, text=True, env=os.environ
    )
    data = json.loads(result.stdout)
    if not data["success"]:
        raise RuntimeError(data["error"])
    return data["token"]

PAGE_URL = "https://www.google.com/recaptcha/api2/demo"
SITEKEY  = "6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-"

# Solve BEFORE opening the browser — 15-40s API wait becomes free parallelism
token = solve("recaptcha-v2", SITEKEY, PAGE_URL)

with sync_playwright() as p:
    page = p.chromium.launch(headless=False).new_page()
    page.goto(PAGE_URL)

    token_js = json.dumps(token)
    page.evaluate(f"""
        const t = {token_js};
        document.querySelector('[name="g-recaptcha-response"]').value = t;
        if (window.___grecaptcha_cfg)
            Object.values(window.___grecaptcha_cfg.clients || {{}}).forEach(c =>
                Object.keys(c).forEach(k => {{ if (c[k]?.callback) c[k].callback(t) }})
            );
    """)
    page.click('#recaptcha-demo-submit')
```

### Image grid ("select all X")

```python
from playwright.sync_api import sync_playwright
from solve_image_grid import solve_image_grid

with sync_playwright() as p:
    page = p.chromium.launch(headless=False).new_page()
    page.goto("https://www.google.com/recaptcha/api2/demo")

    # Click the checkbox
    page.frame_locator('iframe[title="reCAPTCHA"]') \
        .locator('.recaptcha-checkbox-border').click()

    # Handle the grid if it appears (no-op if checkbox passed directly)
    solved = solve_image_grid(page)

    if solved:
        page.click('#recaptcha-demo-submit')
```

### CLI usage

```bash
# Solve and print token JSON
python solve_captcha.py --type recaptcha-v2 \
  --sitekey 6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ- \
  --pageurl https://www.google.com/recaptcha/api2/demo
# → {"success": true, "token": "03AGdBq25...", "type": "recaptcha-v2"}

# Other types
python solve_captcha.py --type hcaptcha    --sitekey KEY --pageurl URL
python solve_captcha.py --type turnstile   --sitekey KEY --pageurl URL
python solve_captcha.py --type recaptcha-v3 --sitekey KEY --pageurl URL --action verify
python solve_captcha.py --type image       --image captcha.png

# Switch service
python solve_captcha.py --type recaptcha-v2 --sitekey KEY --pageurl URL \
  --service capmonster
```

---

## How token-based solving works

```
Your script                   2captcha / CapMonster
    │                                │
    ├─ send sitekey + page URL ──────►  human or AI solves
    │                                │
    │  wait 15–40s                   │
    │                                │
    ◄────────────────────────────────┤  returns token string
    │
    ├─ inject token into [name="g-recaptcha-response"]
    ├─ trigger grecaptcha callback
    └─ submit form
```

Just writing the token into the form field isn't enough — you must also trigger the page's internal CAPTCHA callback, otherwise the form submits but the server rejects it as unsolved.

---

## How image grid solving works

```
Checkbox click → grid appears
    │
    ├─ screenshot grid table element
    ├─ send to Claude Opus / GPT-4V: "which cells match the task?"
    ├─ receive [2, 5, 8]
    ├─ click those cells (element-based, not pixel coordinates)
    ├─ click Verify
    └─ new round? → repeat (up to 6 rounds)
```

Uses element-based clicks (`frame_locator().locator('td').nth(i)`) rather than pixel coordinates — more reliable across different viewport sizes and DPI settings.

---

## Avoiding bot detection

Passing the CAPTCHA is often not enough — sites like Cloudflare also check browser fingerprint, headers, and mouse movement. See [`references/stealth.md`](references/stealth.md) for the full checklist: playwright-stealth, realistic User-Agent, random delays, mouse movement, residential proxies.

---

## File reference

```
captcha/
├── SKILL.md                    ← skill instructions (read by Claude)
├── scripts/
│   ├── solve_captcha.py        ← token solver CLI (stdlib only)
│   └── solve_image_grid.py     ← image grid solver (requires anthropic or openai)
└── references/
    ├── captcha-types.md        ← detection JS + injection patterns per type
    ├── services.md             ← service comparison, pricing, error codes
    └── stealth.md              ← bot detection avoidance checklist
```

---

## Testing

Demo pages you can test against (no account needed):

- https://www.google.com/recaptcha/api2/demo — reCAPTCHA v2 checkbox
- https://2captcha.com/demo/recaptcha-v2 — reCAPTCHA v2 (2captcha demo)
- https://2captcha.com/demo/hcaptcha — hCaptcha
- https://2captcha.com/demo/cloudflare-turnstile — Turnstile
