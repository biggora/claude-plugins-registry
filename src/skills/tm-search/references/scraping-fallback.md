# Browser Automation Fallback for tmsearch.uspto.gov

The tmsearch.uspto.gov search backend uses an Elasticsearch API at
`https://tmsearch.uspto.gov/prod-stage-v1-0-0/` but it is protected by AWS WAF bot detection.
Direct HTTP requests (curl, requests, fetch) return `403` or `Missing Authentication Token`.

Browser automation is the only reliable way to perform keyword searches programmatically.

## Why Direct HTTP Doesn't Work

The site's `configuration.json` reveals:
- Search backend: `https://tmsearch.uspto.gov/prod-stage-v1-0-0/`
- WAF challenge script: loaded dynamically from `awsWafChallengeUrl`
- The browser must solve the WAF challenge to get a token that's sent with API requests

Any attempt to call the Elasticsearch endpoint directly will fail because the WAF token
is missing from the request.

## Playwright Approach (Recommended)

```python
from playwright.sync_api import sync_playwright
import json

def search_trademark(keyword: str, max_results: int = 25) -> dict:
    """Search USPTO trademarks by keyword using browser automation."""
    results = {"totalFound": 0, "trademarks": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        def handle_response(response):
            if "prod-stage" in response.url and response.status == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict) and "hits" in data:
                        hits = data.get("hits", {})
                        total = hits.get("total", {})
                        results["totalFound"] = total.get("value", 0) if isinstance(total, dict) else total
                        for hit in hits.get("hits", [])[:max_results]:
                            results["trademarks"].append(hit.get("_source", {}))
                except Exception:
                    pass

        page.on("response", handle_response)
        page.goto("https://tmsearch.uspto.gov/search/search-information")
        page.wait_for_load_state("networkidle")

        search_input = page.locator('input[type="text"]').first
        search_input.fill(keyword.upper())
        search_input.press("Enter")

        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3000)

        browser.close()

    return results
```

## Install Playwright

```bash
pip install playwright
playwright install chromium
```

## TSDR Details API (No browser needed)

For looking up a single trademark by serial number, the TSDR Details API works with plain HTTP:

```bash
curl -s "https://tmsearch.uspto.gov/tsdr-api-v1-0-0/tsdr-api?serialNumber=78787878" \
  -H "Accept: application/json"
```

This returns JSON with case status, owner info, classes, prosecution history, etc.

## Alternative: RapidAPI Wrapper

If browser automation is not practical, the RapidAPI unofficial wrapper provides reliable
keyword search with a simple REST API:

```bash
# Endpoint: https://uspto-trademark.p.rapidapi.com
# Requires: RapidAPI key (freemium plan available)

# Keyword search
curl "https://uspto-trademark.p.rapidapi.com/v1/trademarkSearch/APPLE/active" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Availability check
curl "https://uspto-trademark.p.rapidapi.com/v1/trademarkAvailable/CLOUDPEAK" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"
```

RapidAPI wrapper endpoints:
- `/v1/trademarkSearch/{keyword}/{status}` — keyword search
- `/v1/trademarkAvailable/{keyword}` — simple yes/no availability
- `/v1/ownerSearch/{owner_name}/{postcode}` — search by owner
- `/v1/serialSearch/{serial_number}` — lookup by serial number
- `/v1/batchTrademarkSearch` — multiple keywords (POST)
