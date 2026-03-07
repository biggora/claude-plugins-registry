# Web Scraping Fallback for tmsearch.uspto.gov

Use this when the direct backend API calls return errors or unexpected responses.

## Background

The tmsearch.uspto.gov frontend is a React SPA. The backend API it uses may change endpoint paths.
If the documented endpoints in SKILL.md fail, use browser DevTools (Network tab) on
https://tmsearch.uspto.gov/search/search-information to intercept the actual XHR/fetch requests
being made, then replicate those in code.

## Python Requests Approach

```python
import requests
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://tmsearch.uspto.gov/search/search-information",
    "Origin": "https://tmsearch.uspto.gov",
}

def search_trademark_web(keyword: str, status: str = "A", rows: int = 25) -> dict:
    """
    Search USPTO trademark database.
    status: "A" = active, "D" = dead, "" = all
    """
    session = requests.Session()
    
    # First GET the main page to get any session cookies
    session.get("https://tmsearch.uspto.gov/search/search-information", headers=HEADERS)
    
    # Attempt POST to backend
    payload = {
        "keyword": keyword.upper(),
        "searchType": "1",
        "statusType": status,
        "pluralVariants": False,
        "start": 0,
        "rows": rows
    }
    
    response = session.post(
        "https://tmsearch.uspto.gov/search/keyword",
        json=payload,
        headers=HEADERS,
        timeout=30
    )
    
    if response.status_code == 200:
        return response.json()
    
    # If POST fails, try GET
    params = {
        "keyword": keyword.upper(),
        "statusType": status,
        "rows": rows,
        "start": 0
    }
    response = session.get(
        "https://tmsearch.uspto.gov/search/keyword",
        params=params,
        headers=HEADERS,
        timeout=30
    )
    
    return response.json()
```

## Selenium/Playwright Approach (Last Resort)

If all HTTP approaches fail, use a headless browser to drive the UI directly:

```python
from playwright.sync_api import sync_playwright
import json

def search_with_playwright(keyword: str) -> list:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        results = []
        
        # Intercept API responses
        def handle_response(response):
            if "search" in response.url and response.status == 200:
                try:
                    data = response.json()
                    if "trademarks" in data:
                        results.extend(data["trademarks"])
                except:
                    pass
        
        page.on("response", handle_response)
        page.goto("https://tmsearch.uspto.gov/search/search-information")
        
        # Fill in search form
        page.fill('input[placeholder*="search"]', keyword)
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        
        browser.close()
        return results
```

## Install Playwright
```bash
pip install playwright
playwright install chromium
```

## Alternative: Use RapidAPI Wrapper

If USPTO direct access is problematic, the RapidAPI unofficial wrapper is reliable:

```bash
# Endpoint: https://uspto-trademark.p.rapidapi.com
# Requires: RapidAPI key (freemium plan available)

curl --request GET \
  --url "https://uspto-trademark.p.rapidapi.com/v1/trademarkSearch/{KEYWORD}/active" \
  --header "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  --header "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Availability check
curl --request GET \
  --url "https://uspto-trademark.p.rapidapi.com/v1/trademarkAvailable/{KEYWORD}" \
  --header "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  --header "x-rapidapi-key: YOUR_RAPIDAPI_KEY"
```

RapidAPI wrapper endpoints:
- `/v1/trademarkSearch/{keyword}/{status}` — keyword search
- `/v1/trademarkAvailable/{keyword}` — simple yes/no availability
- `/v1/ownerSearch/{owner_name}/{postcode}` — search by owner
- `/v1/serialSearch/{serial_number}` — lookup by serial number
- `/v1/batchTrademarkSearch` — multiple keywords (POST)