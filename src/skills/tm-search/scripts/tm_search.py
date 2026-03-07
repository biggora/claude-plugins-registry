#!/usr/bin/env python3
"""
tm-search: US Trademark Search CLI Tool
Searches USPTO trademark database via tmsearch.uspto.gov and tsdrapi.uspto.gov

Usage:
  python tm_search.py keyword <word> [--status=A] [--rows=25] [--json]
  python tm_search.py available <word>
  python tm_search.py status <serial_number> [--api-key=KEY]
  python tm_search.py batch <word1,word2,...> [--status=A] [--csv]
  python tm_search.py validate <file.txt> [--status=A] [--output=results.csv]
"""

import sys
import json
import time
import csv
import argparse
import xml.etree.ElementTree as ET
from typing import Optional

try:
    import requests
except ImportError:
    print("Error: 'requests' library required. Run: pip install requests")
    sys.exit(1)

# ─── Constants ─────────────────────────────────────────────────────────────────

SEARCH_BASE = "https://tmsearch.uspto.gov"
TSDR_BASE = "https://tsdrapi.uspto.gov/ts/cd"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (compatible; tm-search/1.0)",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": f"{SEARCH_BASE}/search/search-information",
    "Origin": SEARCH_BASE,
}

DISCLAIMER = (
    "\n⚠️  DISCLAIMER: This is a preliminary search only. Trademark availability depends on many\n"
    "    factors. Consult a licensed trademark attorney before filing.\n"
)

# ─── Search Functions ───────────────────────────────────────────────────────────

def search_trademark(
        keyword: str,
        status: str = "A",
        rows: int = 25,
        start: int = 0,
        plural_variants: bool = False,
        session: Optional[requests.Session] = None
) -> dict:
    """
    Search USPTO trademark database by keyword.

    Args:
        keyword: Word/phrase to search (auto-uppercased)
        status: "A"=active, "D"=dead, ""=all
        rows: Number of results (max 500)
        start: Pagination offset
        plural_variants: Include plural forms

    Returns:
        dict with "totalFound" and "trademarks" list
    """
    s = session or requests.Session()
    keyword = keyword.upper().strip()

    payload = {
        "keyword": keyword,
        "searchType": "1",
        "statusType": status,
        "pluralVariants": plural_variants,
        "start": start,
        "rows": rows,
    }

    try:
        # Try POST first
        resp = s.post(
            f"{SEARCH_BASE}/search/keyword",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        if resp.status_code == 200:
            return resp.json()

        # Fallback: GET with query params
        params = {k: str(v).lower() if isinstance(v, bool) else v for k, v in payload.items()}
        resp = s.get(
            f"{SEARCH_BASE}/search/keyword",
            params=params,
            headers=HEADERS,
            timeout=30
        )
        resp.raise_for_status()
        return resp.json()

    except requests.exceptions.RequestException as e:
        return {"error": str(e), "totalFound": 0, "trademarks": []}


def check_availability(keyword: str) -> dict:
    """Check if a keyword is available (no active trademarks)."""
    result = search_trademark(keyword, status="A", rows=5)
    dead_result = search_trademark(keyword, status="D", rows=5)

    return {
        "keyword": keyword.upper(),
        "available": result.get("totalFound", 0) == 0,
        "active_count": result.get("totalFound", 0),
        "dead_count": dead_result.get("totalFound", 0),
        "top_matches": result.get("trademarks", [])[:3],
    }


def get_status_by_serial(serial_number: str, api_key: Optional[str] = None) -> dict:
    """Get trademark case status by serial number via TSDR API."""
    headers = {"Accept": "application/xml"}
    if api_key:
        headers["USPTO-API-KEY"] = api_key

    # Remove non-digits
    sn = "".join(filter(str.isdigit, serial_number))
    url = f"{TSDR_BASE}/casestatus/sn{sn}/info.xml"

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()

        # Parse XML response
        root = ET.fromstring(resp.content)
        ns = {"ns1": "urn:us:gov:doc:uspto:trademark:status"}

        def find_text(path):
            el = root.find(path, ns)
            return el.text if el is not None else None

        return {
            "serialNumber": sn,
            "status": find_text(".//ns1:MarkCurrentStatusExternalDescriptionText"),
            "statusDate": find_text(".//ns1:MarkCurrentStatusDate"),
            "wordMark": find_text(".//ns1:MarkVerbalElementText"),
            "owner": find_text(".//ns1:EntityName"),
            "filingDate": find_text(".//ns1:ApplicationDate"),
            "registrationDate": find_text(".//ns1:RegistrationDate"),
            "registrationNumber": find_text(".//ns1:RegistrationNumber"),
        }
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "serialNumber": sn}
    except ET.ParseError:
        return {"error": "Failed to parse XML response", "serialNumber": sn}


# ─── Output Formatting ──────────────────────────────────────────────────────────

def format_trademark(tm: dict) -> str:
    """Format a single trademark result for display."""
    classes = ", ".join(tm.get("internationalClassification", []))
    return (
        f"  • \"{tm.get('wordMark', 'N/A')}\" | "
        f"Owner: {tm.get('owner', 'N/A')} | "
        f"Classes: {classes or 'N/A'} | "
        f"Status: {tm.get('status', 'N/A')} | "
        f"Serial: {tm.get('serialNumber', 'N/A')}"
    )


def print_search_results(keyword: str, results: dict, show_json: bool = False):
    """Print search results to stdout."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    total = results.get("totalFound", 0)
    trademarks = results.get("trademarks", [])

    print(f"\n{'='*60}")
    print(f"KEYWORD: \"{keyword.upper()}\"")
    print(f"Total found: {total}")

    if total == 0:
        print("Status: ✅ LIKELY AVAILABLE (no matching active marks)")
    else:
        print(f"Status: ❌ REGISTERED/PENDING MARKS FOUND")
        print(f"\nTop results:")
        for tm in trademarks[:10]:
            print(format_trademark(tm))
        if total > 10:
            print(f"  ... and {total - 10} more")

    print(DISCLAIMER)


def print_availability(result: dict, show_json: bool = False):
    """Print availability check result."""
    if show_json:
        print(json.dumps(result, indent=2))
        return

    keyword = result["keyword"]
    print(f"\n{'='*60}")
    print(f"AVAILABILITY CHECK: \"{keyword}\"")

    if result["available"]:
        print(f"Status: ✅ LIKELY AVAILABLE")
        print(f"Active marks: 0")
        print(f"Dead/cancelled marks: {result['dead_count']} (historical, may not block registration)")
    else:
        print(f"Status: ❌ NOT AVAILABLE — {result['active_count']} active mark(s) found")
        if result["top_matches"]:
            print("\nConflicting marks:")
            for tm in result["top_matches"]:
                print(format_trademark(tm))

    print(DISCLAIMER)


# ─── Batch Validation ───────────────────────────────────────────────────────────

def batch_validate(
        keywords: list[str],
        status: str = "A",
        delay: float = 0.75,
        output_csv: Optional[str] = None
) -> list[dict]:
    """
    Validate a list of keywords against USPTO trademarks.

    Args:
        keywords: List of words to check
        status: Filter status
        delay: Seconds between requests (avoid rate limiting)
        output_csv: If set, write results to this CSV file

    Returns:
        List of result dicts
    """
    results = []
    session = requests.Session()

    print(f"Checking {len(keywords)} keywords against USPTO trademarks...")
    print(f"Status filter: {'ACTIVE' if status == 'A' else 'DEAD' if status == 'D' else 'ALL'}\n")

    for i, word in enumerate(keywords, 1):
        word = word.strip()
        if not word:
            continue

        print(f"[{i}/{len(keywords)}] Checking: {word.upper()}", end=" ... ", flush=True)

        r = search_trademark(word, status=status, rows=5, session=session)
        count = r.get("totalFound", 0)
        top = r.get("trademarks", [{}])

        result = {
            "keyword": word.upper(),
            "status": "AVAILABLE" if count == 0 else "TAKEN",
            "count": count,
            "top_owner": top[0].get("owner", "") if top else "",
            "top_mark": top[0].get("wordMark", "") if top else "",
            "top_serial": top[0].get("serialNumber", "") if top else "",
        }
        results.append(result)

        print(f"{'✅ AVAILABLE' if count == 0 else f'❌ TAKEN ({count} marks)'}")

        if i < len(keywords):
            time.sleep(delay)

    if output_csv:
        with open(output_csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"\n✅ Results saved to: {output_csv}")

    return results


# ─── CLI Entry Point ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Search and validate US trademarks via USPTO",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  tm_search.py keyword "CLOUDPEAK"
  tm_search.py keyword "APPLE" --status=A --rows=50
  tm_search.py available "NEONPULSE"
  tm_search.py status 78787878 --api-key=YOUR_KEY
  tm_search.py batch "BRAND1,BRAND2,BRAND3" --csv
  tm_search.py validate names.txt --output=results.csv
        """
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # keyword command
    p_kw = subparsers.add_parser("keyword", help="Search by keyword")
    p_kw.add_argument("word", help="Keyword to search")
    p_kw.add_argument("--status", default="A", choices=["A", "D", ""], help="A=active, D=dead")
    p_kw.add_argument("--rows", type=int, default=25, help="Results per page (max 500)")
    p_kw.add_argument("--plural", action="store_true", help="Include plural variants")
    p_kw.add_argument("--json", action="store_true", help="Output raw JSON")

    # available command
    p_av = subparsers.add_parser("available", help="Check if keyword is available")
    p_av.add_argument("word", help="Keyword to check")
    p_av.add_argument("--json", action="store_true", help="Output raw JSON")

    # status command
    p_st = subparsers.add_parser("status", help="Get case status by serial number")
    p_st.add_argument("serial", help="Serial number (8 digits)")
    p_st.add_argument("--api-key", help="USPTO API key for bulk access")
    p_st.add_argument("--json", action="store_true", help="Output raw JSON")

    # batch command
    p_bt = subparsers.add_parser("batch", help="Check multiple comma-separated keywords")
    p_bt.add_argument("words", help="Comma-separated keywords")
    p_bt.add_argument("--status", default="A", choices=["A", "D", ""])
    p_bt.add_argument("--csv", action="store_true", help="Output as CSV")
    p_bt.add_argument("--delay", type=float, default=0.75, help="Delay between requests (seconds)")

    # validate command
    p_vl = subparsers.add_parser("validate", help="Validate keywords from a file")
    p_vl.add_argument("file", help="Text file with one keyword per line")
    p_vl.add_argument("--status", default="A", choices=["A", "D", ""])
    p_vl.add_argument("--output", help="Output CSV file path")
    p_vl.add_argument("--delay", type=float, default=0.75)

    args = parser.parse_args()

    if args.command == "keyword":
        result = search_trademark(args.word, status=args.status, rows=args.rows, plural_variants=args.plural)
        print_search_results(args.word, result, show_json=args.json)

    elif args.command == "available":
        result = check_availability(args.word)
        print_availability(result, show_json=args.json)

    elif args.command == "status":
        result = get_status_by_serial(args.serial, api_key=args.api_key)
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"\nSerial: {result.get('serialNumber')}")
            for k, v in result.items():
                if k != "serialNumber" and v:
                    print(f"  {k}: {v}")

    elif args.command == "batch":
        words = [w.strip() for w in args.words.split(",") if w.strip()]
        results = batch_validate(words, status=args.status, delay=args.delay)
        if args.csv:
            import io
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
            print("\n" + output.getvalue())

    elif args.command == "validate":
        with open(args.file) as f:
            words = [line.strip() for line in f if line.strip()]
        batch_validate(words, status=args.status, delay=args.delay, output_csv=args.output)


if __name__ == "__main__":
    main()