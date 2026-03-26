#!/usr/bin/env python3
"""
CAPTCHA solver — submits to 2captcha, CapMonster, or Anti-Captcha and returns a token.

No external dependencies required (uses Python stdlib only).

Usage:
    python solve_captcha.py --type recaptcha-v2 --sitekey KEY --pageurl URL
    python solve_captcha.py --type recaptcha-v3 --sitekey KEY --pageurl URL --action verify
    python solve_captcha.py --type hcaptcha    --sitekey KEY --pageurl URL
    python solve_captcha.py --type turnstile   --sitekey KEY --pageurl URL
    python solve_captcha.py --type image       --image path/to/captcha.png

Environment variables:
    CAPTCHA_API_KEY   — API key for the solving service
    CAPTCHA_SERVICE   — "2captcha" (default) | "capmonster" | "anticaptcha"

Output (JSON to stdout):
    {"success": true,  "token": "03AGdBq25...", "type": "recaptcha-v2"}
    {"success": false, "error": "ERROR_ZERO_BALANCE"}
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


# Base URLs for each service — all support the same 2captcha-compatible API
SERVICE_URLS = {
    "2captcha":    "https://2captcha.com",
    "capmonster":  "https://api.capmonster.cloud",
    "anticaptcha": "https://api.anti-captcha.com",
}

# How long to wait before first poll (solvers need processing time)
INITIAL_WAIT = 15  # seconds

# Interval between poll attempts
POLL_INTERVAL = 5  # seconds


# ---------------------------------------------------------------------------
# HTTP helpers (stdlib only)
# ---------------------------------------------------------------------------

def _post(url, data):
    """HTTP POST with form-encoded body. Returns response text."""
    payload = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()}")


def _get(url):
    """HTTP GET. Returns response text."""
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()}")


# ---------------------------------------------------------------------------
# Task submission
# ---------------------------------------------------------------------------

def _submit(api_key, service, data):
    """Submit a task. Returns the task ID string."""
    base = SERVICE_URLS.get(service, SERVICE_URLS["2captcha"])
    data = {**data, "key": api_key, "json": "1"}
    resp = _post(f"{base}/in.php", data)
    result = json.loads(resp)
    if result.get("status") != 1:
        raise RuntimeError(result.get("request", str(result)))
    return str(result["request"])


def submit_recaptcha_v2(api_key, sitekey, pageurl, service="2captcha", invisible=False):
    data = {
        "method":    "userrecaptcha",
        "googlekey": sitekey,
        "pageurl":   pageurl,
    }
    if invisible:
        data["invisible"] = "1"
    return _submit(api_key, service, data)


def submit_recaptcha_v3(api_key, sitekey, pageurl, action="verify",
                        min_score=0.5, service="2captcha"):
    return _submit(api_key, service, {
        "method":    "userrecaptcha",
        "version":   "v3",
        "googlekey": sitekey,
        "pageurl":   pageurl,
        "action":    action,
        "min_score": str(min_score),
    })


def submit_hcaptcha(api_key, sitekey, pageurl, service="2captcha"):
    return _submit(api_key, service, {
        "method":  "hcaptcha",
        "sitekey": sitekey,
        "pageurl": pageurl,
    })


def submit_turnstile(api_key, sitekey, pageurl, service="2captcha"):
    return _submit(api_key, service, {
        "method":  "turnstile",
        "sitekey": sitekey,
        "pageurl": pageurl,
    })


def submit_image(api_key, image_source, service="2captcha"):
    """image_source: file path or raw base64 string."""
    if os.path.isfile(image_source):
        with open(image_source, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
    else:
        img_b64 = image_source  # assume already base64
    return _submit(api_key, service, {
        "method": "base64",
        "body":   img_b64,
    })


# ---------------------------------------------------------------------------
# Polling
# ---------------------------------------------------------------------------

def poll(api_key, task_id, service="2captcha", timeout=120):
    """Poll until solved. Returns the token string."""
    base = SERVICE_URLS.get(service, SERVICE_URLS["2captcha"])
    url = (
        f"{base}/res.php"
        f"?key={urllib.parse.quote(api_key)}"
        f"&action=get"
        f"&id={urllib.parse.quote(task_id)}"
        f"&json=1"
    )

    print(f"[captcha] Waiting {INITIAL_WAIT}s for solver...", file=sys.stderr)
    time.sleep(INITIAL_WAIT)

    deadline = time.time() + timeout
    while time.time() < deadline:
        resp = _get(url)
        result = json.loads(resp)

        if result.get("status") == 1:
            return result["request"]

        if result.get("request") == "CAPCHA_NOT_READY":
            remaining = int(deadline - time.time())
            print(f"[captcha] Not ready yet, polling again in {POLL_INTERVAL}s "
                  f"({remaining}s remaining)...", file=sys.stderr)
            time.sleep(POLL_INTERVAL)
            continue

        # Any other response is an error
        raise RuntimeError(result.get("request", str(result)))

    raise TimeoutError(f"CAPTCHA not solved within {timeout}s. "
                       "Try increasing --timeout or check service status.")


# ---------------------------------------------------------------------------
# High-level solve()
# ---------------------------------------------------------------------------

def solve(captcha_type, api_key, service="2captcha", **kwargs):
    """
    Solve a CAPTCHA and return the token string.

    captcha_type: recaptcha-v2 | recaptcha-v3 | hcaptcha | turnstile | image
    Required kwargs by type:
      recaptcha-v2/v3, hcaptcha, turnstile: sitekey, pageurl
      image: image (file path or base64)
    Optional:
      invisible (bool)  — for recaptcha-v2
      action (str)      — for recaptcha-v3, default "verify"
      min_score (float) — for recaptcha-v3, default 0.5
      timeout (int)     — max seconds to wait, default 120
    """
    dispatch = {
        "recaptcha-v2": lambda: submit_recaptcha_v2(
            api_key, kwargs["sitekey"], kwargs["pageurl"],
            service=service, invisible=kwargs.get("invisible", False)
        ),
        "recaptcha2": lambda: submit_recaptcha_v2(
            api_key, kwargs["sitekey"], kwargs["pageurl"],
            service=service, invisible=kwargs.get("invisible", False)
        ),
        "recaptcha-v3": lambda: submit_recaptcha_v3(
            api_key, kwargs["sitekey"], kwargs["pageurl"],
            action=kwargs.get("action", "verify"),
            min_score=kwargs.get("min_score", 0.5),
            service=service
        ),
        "recaptcha3": lambda: submit_recaptcha_v3(
            api_key, kwargs["sitekey"], kwargs["pageurl"],
            action=kwargs.get("action", "verify"),
            min_score=kwargs.get("min_score", 0.5),
            service=service
        ),
        "hcaptcha": lambda: submit_hcaptcha(
            api_key, kwargs["sitekey"], kwargs["pageurl"], service=service
        ),
        "turnstile": lambda: submit_turnstile(
            api_key, kwargs["sitekey"], kwargs["pageurl"], service=service
        ),
        "image": lambda: submit_image(api_key, kwargs["image"], service=service),
    }

    submit_fn = dispatch.get(captcha_type)
    if submit_fn is None:
        raise ValueError(
            f"Unknown CAPTCHA type: {captcha_type!r}. "
            f"Choose from: {', '.join(sorted(set(dispatch.keys())))}"
        )

    task_id = submit_fn()
    print(f"[captcha] Task submitted (id={task_id})", file=sys.stderr)
    return poll(api_key, task_id, service=service, timeout=kwargs.get("timeout", 120))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Solve a CAPTCHA via a third-party service and print the token as JSON.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--type", required=True,
        choices=["recaptcha-v2", "recaptcha-v3", "hcaptcha", "turnstile", "image"],
        help="CAPTCHA type",
    )
    parser.add_argument("--sitekey", help="CAPTCHA sitekey (recaptcha/hcaptcha/turnstile)")
    parser.add_argument("--pageurl", help="Full URL of the page with the CAPTCHA")
    parser.add_argument("--image", help="Image file path or base64 string (for --type image)")
    parser.add_argument(
        "--api-key",
        default=os.environ.get("CAPTCHA_API_KEY"),
        help="Solving service API key (default: $CAPTCHA_API_KEY)",
    )
    parser.add_argument(
        "--service",
        default=os.environ.get("CAPTCHA_SERVICE", "2captcha"),
        choices=list(SERVICE_URLS.keys()),
        help="Solving service to use (default: 2captcha)",
    )
    parser.add_argument("--action", default="verify", help="reCAPTCHA v3 action name")
    parser.add_argument("--min-score", type=float, default=0.5,
                        help="reCAPTCHA v3 minimum acceptable score (0.1–0.9)")
    parser.add_argument("--invisible", action="store_true",
                        help="Use invisible reCAPTCHA v2 mode")
    parser.add_argument("--timeout", type=int, default=120,
                        help="Max seconds to wait for a solution (default: 120)")

    args = parser.parse_args()

    if not args.api_key:
        out = {"success": False, "error":
               "No API key provided. Use --api-key or set CAPTCHA_API_KEY env var."}
        print(json.dumps(out))
        sys.exit(1)

    # Validate required args per type
    needs_sitekey = args.type in ("recaptcha-v2", "recaptcha-v3", "hcaptcha", "turnstile")
    if needs_sitekey and not args.sitekey:
        print(json.dumps({"success": False,
                          "error": f"--sitekey is required for --type {args.type}"}))
        sys.exit(1)
    if needs_sitekey and not args.pageurl:
        print(json.dumps({"success": False,
                          "error": f"--pageurl is required for --type {args.type}"}))
        sys.exit(1)
    if args.type == "image" and not args.image:
        print(json.dumps({"success": False,
                          "error": "--image is required for --type image"}))
        sys.exit(1)

    try:
        token = solve(
            args.type,
            args.api_key,
            service=args.service,
            sitekey=args.sitekey,
            pageurl=args.pageurl,
            image=args.image,
            action=args.action,
            min_score=args.min_score,
            invisible=args.invisible,
            timeout=args.timeout,
        )
        print(json.dumps({"success": True, "token": token, "type": args.type}))
    except TimeoutError as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
