# Avoiding Bot Detection After Passing CAPTCHA

Passing the CAPTCHA itself is often not enough — the site may still flag and block your
session based on browser fingerprinting or behavioral signals. This document covers the
most common detection vectors and how to mitigate them.

---

## Why Sites Still Block After CAPTCHA

Modern anti-bot systems (Cloudflare, PerimeterX, DataDome, Kasada) score requests on
multiple signals **beyond** the CAPTCHA solution:

1. **Browser fingerprint** — headless Chrome has telltale JS properties
2. **Mouse / interaction patterns** — no mouse movement, instant form fills
3. **Request headers** — missing or inconsistent Accept-Language, Referer, etc.
4. **IP reputation** — data center IPs are pre-flagged
5. **Cookie / session age** — fresh sessions with no history look suspicious
6. **Timing** — solving a CAPTCHA in 15s (via API) and submitting instantly

---

## Playwright Stealth Mode

The single most impactful change: install and use `playwright-stealth` to patch the
headless detection markers.

```bash
pip install playwright-stealth
```

```python
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    stealth_sync(page)  # patches ~30 fingerprinting vectors
    page.goto("https://example.com")
```

### What stealth patches
- `navigator.webdriver` — set to `undefined` instead of `true`
- Chrome runtime properties — adds `chrome.runtime` and related objects
- Plugin / mimeType arrays — populated instead of empty
- `navigator.languages` — realistic value
- `window.outerWidth/Height` — matches viewport
- Canvas and WebGL fingerprints — some randomization

---

## Use a Real Browser Profile (Non-Headless)

If stealth mode isn't enough, launch with a real user data directory so the browser
has history, cookies, and extensions like a real user:

```python
import os
from playwright.sync_api import sync_playwright

user_data = os.path.expanduser("~/.config/captcha-automation-profile")

with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir=user_data,
        headless=False,  # visible window bypasses some checks
        args=["--disable-blink-features=AutomationControlled"],
    )
    page = browser.new_page()
    page.goto("https://example.com")
```

The `--disable-blink-features=AutomationControlled` flag prevents the
`navigator.webdriver` property from being set to `true`.

---

## Realistic Request Headers

Missing or wrong headers are a major signal. Set these before navigating:

```python
page.set_extra_http_headers({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Upgrade-Insecure-Requests": "1",
})
```

Also set a realistic User-Agent:
```python
browser = p.chromium.launch()
context = browser.new_context(
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
               "AppleWebKit/537.36 (KHTML, like Gecko) "
               "Chrome/124.0.0.0 Safari/537.36",
    viewport={"width": 1280, "height": 720},
    locale="en-US",
    timezone_id="America/New_York",
)
page = context.new_page()
```

---

## Add Human-Like Delays

```python
import time, random

def human_delay(min_ms=800, max_ms=2500):
    """Sleep for a random human-like duration."""
    time.sleep(random.uniform(min_ms, max_ms) / 1000)

# Between navigation and form fill
page.goto(url)
human_delay(1000, 3000)

# Between filling each field
page.fill('#email', 'user@example.com')
human_delay(300, 900)
page.fill('#password', 'secret')
human_delay(500, 1500)

# After CAPTCHA solve, before form submit
inject_captcha_token(page, token)
human_delay(800, 2000)
page.click('button[type=submit]')
```

---

## Mouse Movement Simulation

Sites sometimes require mouse activity before accepting a form submit:

```python
import asyncio, random, math

async def move_mouse_naturally(page, x_end, y_end, steps=20):
    """Simulate curved mouse movement to a target."""
    box = await page.evaluate("({x: window.innerWidth/2, y: window.innerHeight/2})")
    x_start, y_start = box["x"], box["y"]

    for i in range(steps):
        t = i / steps
        # Quadratic bezier curve
        cx = x_start + random.randint(-50, 50)
        cy = y_start + random.randint(-50, 50)
        x = (1-t)**2 * x_start + 2*(1-t)*t * cx + t**2 * x_end
        y = (1-t)**2 * y_start + 2*(1-t)*t * cy + t**2 * y_end
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.01, 0.04))
```

---

## Residential Proxies

Data center IPs (AWS, GCP, Azure, VPS) are pre-flagged by most anti-bot systems.
Use residential proxies for better success rates:

```python
browser = p.chromium.launch(
    proxy={
        "server": "http://proxy.provider.com:8080",
        "username": "user",
        "password": "pass",
    }
)
```

Residential proxy providers: Bright Data, Oxylabs, Smartproxy, IPRoyal.
Expect to pay $5–$15/GB for residential IPs vs $0.50/GB for data center IPs.

---

## Viewport and Screen Size

Headless browsers default to unusual viewport sizes. Match common desktop dimensions:

```python
context = browser.new_context(
    viewport={"width": 1920, "height": 1080},
    device_scale_factor=1,
    is_mobile=False,
)
```

---

## Session Warmup

Fresh sessions with no cookies or history are suspicious. Before hitting the target page:

1. Navigate to the homepage first
2. Wait a few seconds
3. Click a link or scroll
4. Then go to the page you want to interact with

```python
page.goto("https://example.com")
time.sleep(random.uniform(2, 5))
# scroll down a bit
page.evaluate("window.scrollBy(0, Math.floor(Math.random() * 300 + 100))")
time.sleep(random.uniform(1, 3))
page.goto("https://example.com/login")
```

---

## Detection Test

Before automating a target site, test your browser fingerprint at:
- https://bot.sannysoft.com — headless Chrome detection tests
- https://pixelscan.net — comprehensive fingerprint check
- https://abrahamjuliot.github.io/creepjs/ — advanced entropy fingerprinting

If these sites detect you as a bot, apply more stealth measures before attempting
the actual target.

---

## Summary Checklist

- [ ] Use `playwright-stealth` (or `--disable-blink-features=AutomationControlled`)
- [ ] Set realistic User-Agent, viewport, locale, timezone
- [ ] Set Accept-Language and other headers
- [ ] Add random delays between actions (800ms–3s)
- [ ] Move mouse before clicking submit
- [ ] Use residential proxy if data center IP is blocked
- [ ] Warm up session before hitting the CAPTCHA page
- [ ] Inject CAPTCHA token and wait 1–2s before submitting
