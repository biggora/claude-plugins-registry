# CAPTCHA Solving Services

Comparison of the three major services supported by `solve_captcha.py`.

All three use the same API endpoint format (2captcha-compatible), so you can switch
between them with only the `--service` flag.

---

## 2captcha

**Website:** https://2captcha.com
**`--service` flag:** `2captcha` (default)

The most widely documented and supported service. Operates since 2009.
Uses a combination of human workers and AI for solving.

### Pricing (approximate)
| Type | Per 1,000 |
|------|-----------|
| reCAPTCHA v2 | $1.00–$1.50 |
| reCAPTCHA v3 | $2.00–$3.00 |
| hCaptcha | $1.50–$2.00 |
| Turnstile | $1.00–$1.50 |
| Image/text | $0.50–$1.00 |

### Getting started
1. Sign up at https://2captcha.com/register
2. Add funds (minimum ~$3, accepts cards and crypto)
3. Copy your API key from https://2captcha.com/enterpage

### Free testing
2captcha offers a demo mode at https://2captcha.com/demo/ — you can test all CAPTCHA
types without spending credits. The demo page at https://2captcha.com/demo/recaptcha-v2
is useful for verifying your integration works.

### Checking balance
```bash
curl "https://2captcha.com/res.php?key=YOUR_KEY&action=getbalance"
# → 4.25  (balance in USD)
```

### Average solve times
- reCAPTCHA v2: 20–35s
- reCAPTCHA v3: 30–60s
- hCaptcha: 20–40s
- Image: 5–15s

---

## CapMonster Cloud

**Website:** https://capmonster.cloud
**`--service` flag:** `capmonster`

AI-powered service (no human workers). Faster and cheaper than 2captcha for most types.
Uses machine learning models that have been trained on CAPTCHA datasets.

### Pricing (approximate)
| Type | Per 1,000 |
|------|-----------|
| reCAPTCHA v2 | $0.60 |
| reCAPTCHA v3 | $1.50 |
| hCaptcha | $0.80 |
| Turnstile | $0.60 |
| Image/text | $0.30 |

### Getting started
1. Sign up at https://capmonster.cloud
2. Add funds (minimum $2)
3. Copy API key from dashboard

### API compatibility note
CapMonster uses the same `/in.php` and `/res.php` endpoint format as 2captcha.
The `solve_captcha.py` script handles the URL switching automatically via `--service capmonster`.

### Average solve times
- reCAPTCHA v2: 10–25s
- hCaptcha: 15–30s
- Image: 2–8s

---

## Anti-Captcha

**Website:** https://anti-captcha.com
**`--service` flag:** `anticaptcha`

One of the original CAPTCHA solving services. Good uptime and reliable for bulk tasks.

### Pricing (approximate)
| Type | Per 1,000 |
|------|-----------|
| reCAPTCHA v2 | $0.70 |
| reCAPTCHA v3 | $1.80 |
| hCaptcha | $1.00 |
| Image/text | $0.70 |

### Getting started
1. Sign up at https://anti-captcha.com
2. Add funds
3. Copy API key from Account Settings

---

## Choosing a Service

| If you need... | Use |
|---------------|-----|
| Best documentation & community | 2captcha |
| Lowest cost + fastest for reCAPTCHA v2 | CapMonster |
| Bulk image CAPTCHA at low cost | CapMonster or Anti-Captcha |
| reCAPTCHA v3 reliability | 2captcha (more worker capacity) |
| Free credits to test | 2captcha ($1 signup bonus occasionally) |

---

## Using Multiple Services (Fallback)

If one service is down or out of credits, fall back to another:

```python
import json, subprocess, os

def solve_with_fallback(captcha_type, sitekey, pageurl):
    services = ["2captcha", "capmonster", "anticaptcha"]
    for service in services:
        key_env = f"CAPTCHA_API_KEY_{service.upper().replace('-', '_')}"
        api_key = os.environ.get(key_env) or os.environ.get("CAPTCHA_API_KEY")
        if not api_key:
            continue
        result = subprocess.run(
            ["python", "scripts/solve_captcha.py",
             "--type", captcha_type, "--sitekey", sitekey, "--pageurl", pageurl,
             "--service", service, "--api-key", api_key],
            capture_output=True, text=True
        )
        data = json.loads(result.stdout)
        if data.get("success"):
            return data["token"]
        print(f"[captcha] {service} failed: {data.get('error')} — trying next service")
    raise RuntimeError("All CAPTCHA solving services failed")
```

---

## Checking Your Balance

```bash
# 2captcha
curl "https://2captcha.com/res.php?key=YOUR_KEY&action=getbalance"

# CapMonster
curl "https://api.capmonster.cloud/res.php?key=YOUR_KEY&action=getbalance"

# Anti-Captcha
curl "https://api.anti-captcha.com/res.php?key=YOUR_KEY&action=getbalance"
```

---

## Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `ERROR_ZERO_BALANCE` | Account has no credits | Add funds at service dashboard |
| `ERROR_NO_SLOT_AVAILABLE` | Service overloaded | Retry in a few minutes |
| `ERROR_WRONG_CAPTCHA_ID` | Invalid task ID | Bug in code — report |
| `ERROR_CAPTCHA_UNSOLVABLE` | Solver gave up | Retry; if recurring, try another service |
| `ERROR_WRONG_USER_KEY` | Bad API key | Check key, no trailing spaces |
| `CAPCHA_NOT_READY` | Still processing | Normal — keep polling |
| `ERROR_IP_BANNED` | Your IP is blocked | Contact service support |
