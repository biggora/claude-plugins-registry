#!/usr/bin/env python3
"""
tm-search: US Trademark Search CLI Tool
Searches USPTO trademark database via tmsearch.uspto.gov TSDR API and Playwright.

The keyword search uses Playwright browser automation because the tmsearch.uspto.gov
search backend is protected by AWS WAF and cannot be accessed via plain HTTP requests.
The TSDR details API (case lookup by serial number) works directly via HTTP.

Usage:
  python tm_search.py keyword <word> [--rows=25] [--json]
  python tm_search.py available <word>
  python tm_search.py status <serial_number> [--json]
  python tm_search.py batch <word1,word2,...> [--csv]
  python tm_search.py validate <file.txt> [--output=results.csv]
"""

import sys
import json
import time
import csv
import argparse
from typing import Optional

try:
    import requests
except ImportError:
    print("Error: 'requests' library required. Run: pip install requests")
    sys.exit(1)

# ─── Constants ─────────────────────────────────────────────────────────────────

TSDR_DETAILS_URL = "https://tmsearch.uspto.gov/tsdr-api-v1-0-0/tsdr-api"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (compatible; tm-search/1.0)",
    "Accept": "application/json",
}

DISCLAIMER = (
    "\n[!] DISCLAIMER: This is a preliminary search only. Trademark availability depends on many\n"
    "    factors. Consult a licensed trademark attorney before filing.\n"
)

# ─── TSDR Details API (works without auth) ─────────────────────────────────────

def get_status_by_serial(serial_number: str) -> dict:
    """
    Get trademark case status by serial number via the TSDR Details API.
    This endpoint works without authentication and returns JSON.
    """
    sn = "".join(filter(str.isdigit, serial_number))
    if len(sn) != 8:
        return {"error": f"Serial number must be 8 digits, got {len(sn)}", "serialNumber": sn}

    try:
        resp = requests.get(
            TSDR_DETAILS_URL,
            params={"serialNumber": sn},
            headers=HEADERS,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        metadata = data.get("metadata", {})
        owners = metadata.get("owners", [])
        owner_name = owners[0]["ipInfo"]["name"] if owners else None
        tm5 = metadata.get("tm5Status", {})
        classes = [c.get("classNumber") for c in metadata.get("classes", [])]

        return {
            "serialNumber": sn,
            "status": metadata.get("caseStatus"),
            "statusDate": metadata.get("statusDate"),
            "liveDead": tm5.get("tm5LiveDead"),
            "statusDescriptor": tm5.get("tm5StatusDescriptor"),
            "owner": owner_name,
            "attorney": (metadata.get("attorney", {}).get("ipInfo", {}).get("name")),
            "classes": classes,
            "isStandardChar": metadata.get("markDetails", {}).get("isStandardCharClaimed"),
        }
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "serialNumber": sn}
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        return {"error": f"Failed to parse response: {e}", "serialNumber": sn}


# ─── Keyword Search via Playwright ─────────────────────────────────────────────

def search_trademark_playwright(
    keyword: str,
    max_results: int = 25,
    retries: int = 2,
) -> dict:
    """
    Search USPTO trademark database by keyword using Playwright browser automation.
    The tmsearch.uspto.gov Elasticsearch backend requires AWS WAF challenge tokens,
    so we drive the actual web UI and intercept the API responses.

    The AWS WAF bot detection is non-deterministic — sometimes it blocks headless
    browsers, sometimes it doesn't. We use anti-detection settings and retries
    to improve reliability.

    Requires: pip install playwright && playwright install chromium
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return {
            "error": "Playwright required for keyword search. Run: pip install playwright && playwright install chromium",
            "totalFound": 0,
            "trademarks": [],
        }

    keyword = keyword.upper().strip()
    results = {"totalFound": 0, "trademarks": [], "keyword": keyword}

    for attempt in range(1, retries + 1):
        results = {"totalFound": 0, "trademarks": [], "keyword": keyword}
        try:
            with sync_playwright() as p:
                # Use anti-detection settings to bypass AWS WAF
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
                                if isinstance(total, dict):
                                    results["totalFound"] = total.get("value", 0)
                                else:
                                    results["totalFound"] = total
                                for hit in hits.get("hits", [])[:max_results]:
                                    results["trademarks"].append(hit.get("_source", {}))
                        except Exception:
                            pass
                    elif "prod-stage" in response.url and response.status == 403:
                        results["_waf_blocked"] = True

                page.on("response", handle_response)
                page.goto(
                    "https://tmsearch.uspto.gov/search/search-information",
                    timeout=30000,
                )
                page.wait_for_load_state("networkidle")

                # Wait for WAF challenge to resolve
                page.wait_for_timeout(2000)

                # Fill in search and submit
                search_input = page.locator('input[type="text"]').first
                search_input.fill(keyword, timeout=10000)
                page.wait_for_timeout(500)
                search_input.press("Enter")

                # Wait for results to load
                page.wait_for_timeout(6000)

                # Check if we landed on the error page
                if "/errors" in page.url:
                    results["_waf_blocked"] = True

                browser.close()

            # If we got results or no WAF block, stop retrying
            if results.get("totalFound", 0) > 0 or not results.get("_waf_blocked"):
                break

            if attempt < retries:
                import time
                time.sleep(2)

        except Exception as e:
            results["error"] = str(e)
            if attempt < retries:
                import time
                time.sleep(2)

    # Clean up internal flag
    was_blocked = results.pop("_waf_blocked", False)
    if was_blocked and results.get("totalFound", 0) == 0 and "error" not in results:
        results["error"] = (
            "AWS WAF blocked the search request. The USPTO site uses bot detection "
            "that sometimes blocks automated searches. Try again, or use the RapidAPI "
            "wrapper for more reliable results."
        )

    return results


# ─── Availability Check ────────────────────────────────────────────────────────

def check_availability(keyword: str) -> dict:
    """Check if a keyword is available (no active trademarks found)."""
    result = search_trademark_playwright(keyword, max_results=5)

    return {
        "keyword": keyword.upper(),
        "available": result.get("totalFound", 0) == 0,
        "active_count": result.get("totalFound", 0),
        "top_matches": result.get("trademarks", [])[:3],
        "error": result.get("error"),
    }


# ─── Output Formatting ──────────────────────────────────────────────────────────

def format_trademark(tm: dict) -> str:
    """Format a single trademark result for display."""
    word_mark = tm.get("wordMark") or tm.get("markIdentification") or "N/A"
    owner = tm.get("ownerName") or tm.get("owner") or "N/A"
    serial = tm.get("serialNumber") or "N/A"
    status = tm.get("statusMark") or tm.get("status") or "N/A"
    classes = tm.get("internationalClassification", [])
    if isinstance(classes, list):
        classes = ", ".join(str(c) for c in classes)
    return (
        f"  • \"{word_mark}\" | "
        f"Owner: {owner} | "
        f"Classes: {classes or 'N/A'} | "
        f"Status: {status} | "
        f"Serial: {serial}"
    )


def print_search_results(keyword: str, results: dict, show_json: bool = False):
    """Print search results to stdout."""
    if show_json:
        print(json.dumps(results, indent=2, default=str))
        return

    if results.get("error"):
        print(f"\n[!] Error: {results['error']}")
        return

    total = results.get("totalFound", 0)
    trademarks = results.get("trademarks", [])

    print(f"\n{'='*60}")
    print(f"KEYWORD: \"{keyword.upper()}\"")
    print(f"Total found: {total}")

    if total == 0:
        print("Status: [OK] LIKELY AVAILABLE (no matching active marks)")
    else:
        print(f"Status: [X] REGISTERED/PENDING MARKS FOUND")
        print(f"\nTop results:")
        for tm in trademarks[:10]:
            print(format_trademark(tm))
        if total > 10:
            print(f"  ... and {total - 10} more")

    print(DISCLAIMER)


def print_availability(result: dict, show_json: bool = False):
    """Print availability check result."""
    if show_json:
        print(json.dumps(result, indent=2, default=str))
        return

    if result.get("error"):
        print(f"\n[!] Error: {result['error']}")
        return

    keyword = result["keyword"]
    print(f"\n{'='*60}")
    print(f"AVAILABILITY CHECK: \"{keyword}\"")

    if result["available"]:
        print(f"Status: [OK] LIKELY AVAILABLE")
        print(f"Active marks: 0")
    else:
        print(f"Status: [X] NOT AVAILABLE — {result['active_count']} active mark(s) found")
        if result["top_matches"]:
            print("\nConflicting marks:")
            for tm in result["top_matches"]:
                print(format_trademark(tm))

    print(DISCLAIMER)


# ─── Batch Validation ───────────────────────────────────────────────────────────

def batch_validate(
    keywords: list[str],
    delay: float = 3.0,
    output_csv: Optional[str] = None,
) -> list[dict]:
    """
    Validate a list of keywords against USPTO trademarks.
    Uses Playwright for each search with a delay between requests.
    """
    results = []

    print(f"Checking {len(keywords)} keywords against USPTO trademarks...\n")

    for i, word in enumerate(keywords, 1):
        word = word.strip()
        if not word:
            continue

        print(f"[{i}/{len(keywords)}] Checking: {word.upper()}", end=" ... ", flush=True)

        r = search_trademark_playwright(word, max_results=5)
        count = r.get("totalFound", 0)
        trademarks = r.get("trademarks", [])

        result = {
            "keyword": word.upper(),
            "status": "AVAILABLE" if count == 0 else "TAKEN",
            "count": count,
            "top_owner": "",
            "top_mark": "",
            "top_serial": "",
        }
        if trademarks:
            top = trademarks[0]
            result["top_owner"] = top.get("ownerName", "")
            result["top_mark"] = top.get("wordMark") or top.get("markIdentification", "")
            result["top_serial"] = top.get("serialNumber", "")

        results.append(result)
        status_str = "[OK] AVAILABLE" if count == 0 else f"[X] TAKEN ({count} marks)"
        if r.get("error"):
            status_str = f"[!] ERROR: {r['error']}"
        print(status_str)

        if i < len(keywords):
            time.sleep(delay)

    if output_csv and results:
        with open(output_csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"\n[OK] Results saved to: {output_csv}")

    return results


# ─── CLI Entry Point ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Search and validate US trademarks via USPTO",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  tm_search.py keyword "CLOUDPEAK"
  tm_search.py keyword "APPLE" --rows=50
  tm_search.py available "NEONPULSE"
  tm_search.py status 78787878
  tm_search.py batch "BRAND1,BRAND2,BRAND3" --csv
  tm_search.py validate names.txt --output=results.csv

Note: keyword/available/batch/validate commands require Playwright:
  pip install playwright && playwright install chromium
        """
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # keyword command
    p_kw = subparsers.add_parser("keyword", help="Search by keyword (requires Playwright)")
    p_kw.add_argument("word", help="Keyword to search")
    p_kw.add_argument("--rows", type=int, default=25, help="Max results (default 25)")
    p_kw.add_argument("--json", action="store_true", help="Output raw JSON")

    # available command
    p_av = subparsers.add_parser("available", help="Check if keyword is available")
    p_av.add_argument("word", help="Keyword to check")
    p_av.add_argument("--json", action="store_true", help="Output raw JSON")

    # status command
    p_st = subparsers.add_parser("status", help="Get case status by serial number (no Playwright needed)")
    p_st.add_argument("serial", help="Serial number (8 digits)")
    p_st.add_argument("--json", action="store_true", help="Output raw JSON")

    # batch command
    p_bt = subparsers.add_parser("batch", help="Check multiple comma-separated keywords")
    p_bt.add_argument("words", help="Comma-separated keywords")
    p_bt.add_argument("--csv", action="store_true", help="Output as CSV")
    p_bt.add_argument("--delay", type=float, default=3.0, help="Delay between requests (seconds, default 3)")

    # validate command
    p_vl = subparsers.add_parser("validate", help="Validate keywords from a file")
    p_vl.add_argument("file", help="Text file with one keyword per line")
    p_vl.add_argument("--output", help="Output CSV file path")
    p_vl.add_argument("--delay", type=float, default=3.0)

    args = parser.parse_args()

    if args.command == "keyword":
        result = search_trademark_playwright(args.word, max_results=args.rows)
        print_search_results(args.word, result, show_json=args.json)

    elif args.command == "available":
        result = check_availability(args.word)
        print_availability(result, show_json=args.json)

    elif args.command == "status":
        result = get_status_by_serial(args.serial)
        if args.json:
            print(json.dumps(result, indent=2, default=str))
        else:
            if result.get("error"):
                print(f"\n[!] Error: {result['error']}")
            else:
                print(f"\nSerial: {result.get('serialNumber')}")
                for k, v in result.items():
                    if k != "serialNumber" and v is not None:
                        print(f"  {k}: {v}")

    elif args.command == "batch":
        words = [w.strip() for w in args.words.split(",") if w.strip()]
        results = batch_validate(words, delay=args.delay)
        if args.csv and results:
            import io
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
            print("\n" + output.getvalue())

    elif args.command == "validate":
        with open(args.file) as f:
            words = [line.strip() for line in f if line.strip()]
        batch_validate(words, delay=args.delay, output_csv=args.output)


if __name__ == "__main__":
    main()
