---
name: tm-search
description: "Use this skill whenever the user wants to search, validate, or look up US trademarks, brand names, or keywords in the USPTO trademark database. Triggers include: checking if a brand name or word is trademarked, searching trademark registrations, validating whether a keyword is available for trademark, looking up trademark status or owner, batch-checking multiple brand names, or building any tool/script involving the USPTO trademark database. Also use for requests like \"is X trademarked?\", \"find trademarks for [keyword]\", \"check trademark availability\", \"search USPTO for [name]\", or \"validate these words against USPTO trademarks.\" Always use this skill for any trademark search or validation task — even simple lookups benefit from the correct API patterns and output formats defined here."
---

# US Trademark Search Skill (tm-search)

This skill enables an agent to search, validate, and analyze US trademarks via USPTO APIs.

## Important: API Access Reality

The USPTO trademark search system (`tmsearch.uspto.gov`) uses **AWS WAF bot protection** on its
Elasticsearch search backend. Direct keyword search via HTTP is **not possible** without browser
automation. However, the **TSDR details API** (case lookup by serial number) works without
authentication and returns JSON.

For **keyword search**, use one of these approaches:
1. **Playwright/browser automation** — drive the tmsearch.uspto.gov web UI (most reliable)
2. **Third-party API** — RapidAPI USPTO wrapper (requires API key, simpler to use)

For **case status lookup by serial number**, the built-in TSDR API works directly.

## API Overview

| Use Case | Approach |
|---|---|
| Keyword/name text search | Browser automation on tmsearch.uspto.gov **or** RapidAPI |
| Case status by serial number | TSDR Details API (no auth, JSON) |
| Batch keyword validation | Browser automation + delays **or** RapidAPI |
| Case documents / images | TSDR API (requires API key since Oct 2024) |

---

## API 1: TSDR Details API (No auth required — JSON)

Look up trademark case details **by serial number**. This endpoint is hosted on the tmsearch
site and returns JSON without authentication.

### Endpoint

```
GET https://tmsearch.uspto.gov/tsdr-api-v1-0-0/tsdr-api?serialNumber={SERIAL_NUMBER}
```

Serial numbers are 8 digits (no dashes). Example:

```bash
curl -s "https://tmsearch.uspto.gov/tsdr-api-v1-0-0/tsdr-api?serialNumber=78787878" \
  -H "Accept: application/json"
```

### Response Structure

```json
{
  "metadata": {
    "caseStatus": "Abandoned because the applicant failed to respond...",
    "statusDate": "2007-09-25",
    "owners": [
      {
        "ipInfo": {
          "name": "OWNER NAME",
          "legalEntity": "3",
          "contactAddress": {
            "mailingAddresses": [
              {
                "cityName": "City",
                "geographicRegionName": "STATE",
                "postalCode": "12345",
                "countryName": "UNITED STATES OF AMERICA"
              }
            ]
          },
          "citizenship": {
            "countryName": "UNITED STATES OF AMERICA",
            "geographicRegionName": "STATE"
          }
        }
      }
    ],
    "attorney": {
      "ipInfo": { "name": "Attorney Name" }
    },
    "correspondent": {
      "ipInfo": {
        "name": "Correspondent Name",
        "contactAddress": { "mailingAddresses": [...], "electronicAddresses": [...] }
      }
    },
    "markDetails": {
      "isStandardCharClaimed": false
    },
    "tm5Status": {
      "tm5StatusDescription": "...",
      "tm5StatusCode": "10",
      "tm5StatusDescriptor": "DEAD/APPLICATION/Refused/Dismissed or Invalidated",
      "tm5LiveDead": "dead"
    },
    "classes": [
      { "classNumber": "009", "firstUseAnywhereDate": null, "firstUseInCommerceDate": null }
    ],
    "docketNumber": "..."
  },
  "maintenance": {},
  "prosecutionHistory": [
    {
      "historyDate": "2026-03-06",
      "historyDescription": "Amended Drawing",
      "documentId": "https://tsdr.uspto.gov/documentviewer?caseId=sn78787878&docId=..."
    }
  ],
  "assignments": [...],
  "proceedings": [...],
  "international": {}
}
```

### Key Response Fields

| Path | Description |
|---|---|
| `metadata.caseStatus` | Human-readable current status |
| `metadata.statusDate` | Date of last status change |
| `metadata.owners[].ipInfo.name` | Owner/applicant name |
| `metadata.owners[].ipInfo.contactAddress` | Owner address |
| `metadata.attorney.ipInfo.name` | Attorney of record |
| `metadata.tm5Status.tm5LiveDead` | `"live"` or `"dead"` |
| `metadata.tm5Status.tm5StatusDescriptor` | Structured status (e.g., `"LIVE/REGISTRATION/Registered"`) |
| `metadata.classes[].classNumber` | Nice Classification codes |
| `metadata.markDetails.isStandardCharClaimed` | Whether it's a standard character mark |
| `prosecutionHistory[]` | Timeline of case events with document links |

> **Note:** This API does NOT return the word mark text itself. To get the mark text, you need
> the keyword search approach (browser automation or RapidAPI).

---

## API 2: TSDR Bulk API (Requires API key — XML)

The original TSDR API at `tsdrapi.uspto.gov` now **requires an API key for all requests** (changed
October 2024). Register at https://account.uspto.gov/api-manager/.

### Endpoints

```bash
# Case status as XML (requires API key)
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/sn{SERIAL_NUMBER}/info.xml
  Header: USPTO-API-KEY: YOUR_KEY

# Case status as HTML
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/sn{SERIAL_NUMBER}/content.html
  Header: USPTO-API-KEY: YOUR_KEY

# By registration number
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/rn{REG_NUMBER}/info.xml

# Case documents PDF bundle
GET https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.pdf?sn={SERIAL_NUMBER}

# Raw trademark image
GET https://tsdrapi.uspto.gov/ts/cd/rawImage/{SERIAL_NUMBER}
```

Rate limit: **60 requests/minute per API key**.

---

## Keyword Search via Browser Automation (Recommended)

Since the tmsearch.uspto.gov search backend is protected by AWS WAF, use Playwright to drive
the web UI and intercept API responses.

**Important:** The AWS WAF bot detection is non-deterministic — headless browsers are blocked
intermittently. Use anti-detection settings and retries. Even with these, keyword search may
fail occasionally. The RapidAPI wrapper (below) is more reliable if you need consistent results.

```python
from playwright.sync_api import sync_playwright

def search_trademark(keyword: str, max_results: int = 25) -> dict:
    """Search USPTO trademarks by keyword using browser automation."""
    results = {"totalFound": 0, "trademarks": []}

    with sync_playwright() as p:
        # Anti-detection settings to bypass AWS WAF
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
        )
        page = context.new_page()
        page.add_init_script(
            'Object.defineProperty(navigator, "webdriver", {get: () => undefined})'
        )

        # Intercept the Elasticsearch API responses
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
        page.goto("https://tmsearch.uspto.gov/search/search-information", timeout=30000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)  # Wait for WAF challenge to resolve

        # Type keyword and submit
        search_input = page.locator('input[type="text"]').first
        search_input.fill(keyword.upper(), timeout=10000)
        search_input.press("Enter")

        # Wait for results (longer wait needed for WAF + async results)
        page.wait_for_timeout(6000)

        browser.close()

    return results
```

### Install Playwright

```bash
pip install playwright
playwright install chromium
```

---

## Keyword Search via RapidAPI (Alternative — requires API key)

If browser automation is not practical, the RapidAPI unofficial USPTO wrapper provides reliable
keyword search.

**Sign up:** https://rapidapi.com/pentium10/api/uspto-trademark

```bash
# Keyword search (active marks)
curl "https://uspto-trademark.p.rapidapi.com/v1/trademarkSearch/APPLE/active" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Availability check
curl "https://uspto-trademark.p.rapidapi.com/v1/trademarkAvailable/CLOUDPEAK" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Search by owner
curl "https://uspto-trademark.p.rapidapi.com/v1/ownerSearch/Apple%20Inc/" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Lookup by serial number
curl "https://uspto-trademark.p.rapidapi.com/v1/serialSearch/78787878" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY"

# Batch search (POST)
curl -X POST "https://uspto-trademark.p.rapidapi.com/v1/batchTrademarkSearch" \
  -H "x-rapidapi-host: uspto-trademark.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["CLOUDPEAK", "SKYBRIDGE", "NEONPULSE"]}'
```

RapidAPI endpoints:
- `/v1/trademarkSearch/{keyword}/{status}` — keyword search (`active`, `dead`, or `all`)
- `/v1/trademarkAvailable/{keyword}` — simple yes/no availability
- `/v1/ownerSearch/{owner_name}/{postcode}` — search by owner
- `/v1/serialSearch/{serial_number}` — lookup by serial number
- `/v1/batchTrademarkSearch` — multiple keywords (POST)

---

## CLI Tool Implementation (tm-search)

When building the `tm-search` command-line tool, follow this structure:

### Core Commands

```bash
tm-search keyword <word>              # Search by keyword (uses Playwright)
tm-search keyword <word> --status=A  # Active trademarks only
tm-search keyword <word> --status=D  # Dead trademarks only
tm-search available <word>           # Check if word is available (not registered live)
tm-search status <serial_number>     # Lookup by serial number (uses TSDR API)
tm-search batch <word1,word2,...>    # Check multiple words
tm-search validate <file.txt>        # Validate words from a file (one per line)
```

### Output Format

Default output: human-readable table
With `--json`: raw JSON
With `--csv`: CSV for spreadsheet use

```
KEYWORD: "CLOUDPEAK"
Status: AVAILABLE (no live trademarks found)
Dead marks: 2 (see --show-dead for details)

KEYWORD: "APPLE"
Status: REGISTERED (1,247 live marks found)
Top matches:
  - "APPLE" | Owner: Apple Inc. | Classes: 009,042 | Reg: 1078312
  - "APPLE MUSIC" | Owner: Apple Inc. | Classes: 041 | Reg: 4960099
  ...
```

---

## Availability Check Logic

A keyword is considered **AVAILABLE** if there are zero live/active marks with exact OR confusingly
similar text. The agent should:

1. Search exact keyword (via Playwright or RapidAPI)
2. If results > 0 → **LIKELY REGISTERED** — show matches
3. If results == 0 → **LIKELY AVAILABLE** — note this is not legal advice
4. Always caveat: suggest professional trademark attorney review before filing

---

## Batch Validation

For validating a list of keywords, add a 2–3 second delay between Playwright searches to avoid
triggering rate limits. With RapidAPI, 0.5–1s delay is sufficient.

---

## Implementation Notes

- The `tmsearch.uspto.gov` search backend is protected by **AWS WAF** — direct HTTP keyword search does not work
- The TSDR Details API (`/tsdr-api-v1-0-0/tsdr-api?serialNumber=...`) works without auth and returns JSON
- The old TSDR XML API (`tsdrapi.uspto.gov`) requires an **API key for all requests** since October 2024
- Always **uppercase** keywords before searching (USPTO stores marks in uppercase)
- International Classification (Nice Classification) codes define goods/services category
- Serial numbers are 8 digits; Registration numbers are 7 digits

## Reference Files

- `references/field-guide.md` — Full field descriptions and Nice Classification codes
- `references/scraping-fallback.md` — Browser automation fallback details
- `scripts/tm_search.py` — Ready-to-use Python implementation

---

## Legal Disclaimer to Include in Output

Always include when providing availability results:
> "This is a preliminary search only. Trademark availability is complex and depends on many
> factors including similar marks, geographic use, and goods/services classification. Consult a
> licensed trademark attorney before filing."
