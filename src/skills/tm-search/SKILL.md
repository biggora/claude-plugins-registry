---
name: tm-search
description: >
  Use this skill whenever the user wants to search, validate, or look up US trademarks, brand
  names, or keywords in the USPTO trademark database. Triggers include: checking if a brand name
  or word is trademarked, searching trademark registrations, validating whether a keyword is
  available for trademark, looking up trademark status or owner, batch-checking multiple brand
  names, or building any tool/script involving the USPTO trademark database. Also use for
  requests like "is X trademarked?", "find trademarks for [keyword]", "check trademark
  availability", "search USPTO for [name]", or "validate these words against USPTO trademarks."
  Always use this skill for any trademark search or validation task — even simple lookups benefit
  from the correct API patterns and output formats defined here.
---

# US Trademark Search Skill (tm-search)

This skill enables an agent to search, validate, and analyze US trademarks via USPTO APIs.

## API Overview

There are **two main API approaches** — choose based on needs:

| Use Case | API |
|---|---|
| Keyword/name text search, availability check | **tmsearch.uspto.gov** (web backend) |
| Status lookup by serial/registration number | **tsdrapi.uspto.gov** (official TSDR API) |
| Batch/programmatic word validation | **tmsearch.uspto.gov** or RapidAPI wrapper |

---

## API 1: tmsearch.uspto.gov (New Trademark Search — No API key required)

The USPTO replaced TESS in November 2023 with a new search system at `https://tmsearch.uspto.gov`.
This is a **web application** but its backend can be called directly.

### Search Endpoint

```
POST https://tmsearch.uspto.gov/search/keyword
Content-Type: application/json
```

**Request body:**
```json
{
  "keyword": "APPLE",
  "searchType": "1",
  "statusType": "A",
  "pluralVariants": false,
  "start": 0,
  "rows": 25
}
```

**Parameters:**
- `keyword` — the word/phrase to search (required)
- `searchType` — `"1"` = basic keyword, `"2"` = design code, `"3"` = owner name
- `statusType` — `"A"` = active/live only, `"D"` = dead only, `""` = all
- `pluralVariants` — `true` to include plural variations
- `start` — pagination offset (0-indexed)
- `rows` — results per page (max 500)

### Alternative: GET search

```
GET https://tmsearch.uspto.gov/search/keyword?keyword=APPLE&statusType=A&rows=25
```

### Response Fields

```json
{
  "totalFound": 1247,
  "trademarks": [
    {
      "serialNumber": "75123456",
      "registrationNumber": "2345678",
      "wordMark": "APPLE",
      "status": "Live/Registered",
      "statusCode": "A",
      "filingDate": "1997-03-15",
      "registrationDate": "1999-08-17",
      "owner": "Apple Inc.",
      "ownerAddress": "Cupertino, CALIFORNIA, UNITED STATES",
      "internationalClassification": ["009", "042"],
      "goodsServices": "Computers, computer software...",
      "attorney": "...",
      "markDrawingCode": "4"
    }
  ]
}
```

> **Note:** The tmsearch.uspto.gov backend API is not officially documented. If the above endpoint
> returns errors, fall back to scraping `https://tmsearch.uspto.gov/search/search-information` or
> use the TSDR API below. See `references/scraping-fallback.md` for the web scraping approach.

---

## API 2: TSDR API (Official — requires API key for bulk use)

Looks up trademark **by serial number or registration number**. Returns full case status, documents.

**Base URL:** `https://tsdrapi.uspto.gov/ts/cd/`

### Key Endpoints

```bash
# Case status by serial number (HTML)
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/sn{SERIAL_NUMBER}/content.html

# Case status as XML (machine-readable)
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/sn{SERIAL_NUMBER}/info.xml

# Case status by registration number
GET https://tsdrapi.uspto.gov/ts/cd/casestatus/rn{REG_NUMBER}/info.xml

# Case documents as PDF bundle
GET https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.pdf?sn={SERIAL_NUMBER}

# Raw trademark image
GET https://tsdrapi.uspto.gov/ts/cd/rawImage/{SERIAL_NUMBER}
```

### API Key (required for bulk/automated use)

- Register at: https://account.uspto.gov/api-manager/
- Add key as header: `USPTO-API-KEY: YOUR_KEY_HERE`
- Rate limit: **60 requests/minute per API key**

```bash
curl -H "USPTO-API-KEY: YOUR_KEY" \
  "https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/info.xml"
```

---

## CLI Tool Implementation (tm-search)

When building the `tm-search` command-line tool, follow this structure:

### Core Commands

```bash
tm-search keyword <word>              # Search by keyword
tm-search keyword <word> --status=A  # Active trademarks only
tm-search keyword <word> --status=D  # Dead trademarks only
tm-search available <word>           # Check if word is available (not registered live)
tm-search status <serial_number>     # Lookup by serial number
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

1. Search exact keyword with `statusType=A`
2. If results > 0 → **LIKELY REGISTERED** — show matches
3. If results == 0 → **LIKELY AVAILABLE** — note this is not legal advice
4. Always caveat: suggest professional trademark attorney review before filing

```python
def check_availability(keyword):
    results = search_trademark(keyword, status="A")
    if results["totalFound"] == 0:
        return "LIKELY AVAILABLE"
    else:
        return f"LIKELY TAKEN ({results['totalFound']} active marks)"
```

---

## Batch Validation

For validating a list of keywords (e.g., from a CSV or text file):

```python
words = ["CloudPeak", "SkyBridge", "NeonPulse"]
results = []
for word in words:
    r = search_trademark(word.upper(), status="A")
    results.append({
        "keyword": word,
        "status": "AVAILABLE" if r["totalFound"] == 0 else "TAKEN",
        "count": r["totalFound"]
    })
# Output as table or CSV
```

Rate-limit: Add 0.5–1s delay between requests to avoid throttling.

---

## Implementation Notes

- The `tmsearch.uspto.gov` endpoint is a **public government site** — no auth required for search
- Always **uppercase** keywords before searching (USPTO stores marks in uppercase)
- Include `User-Agent` header to avoid bot detection: `"Mozilla/5.0 (compatible; tm-search/1.0)"`
- For `pluralVariants=true`, USPTO auto-expands COFFEE → COFFEES, etc.
- International Classification (Nice Classification) codes define goods/services category
- Serial numbers are 8 digits; Registration numbers are 7 digits

## Reference Files

- `references/field-guide.md` — Full field descriptions and Nice Classification codes
- `references/scraping-fallback.md` — Web scraping approach if API is unavailable
- `scripts/tm_search.py` — Ready-to-use Python implementation
- `scripts/tm_validate.py` — Batch validation script

---

## Legal Disclaimer to Include in Output

Always include when providing availability results:
> "This is a preliminary search only. Trademark availability is complex and depends on many
> factors including similar marks, geographic use, and goods/services classification. Consult a
> licensed trademark attorney before filing."