#!/usr/bin/env python3
"""
Solve reCAPTCHA v2 image grid challenges using vision AI.

After clicking the checkbox, if an image grid appears ("select all traffic
lights"), this script screenshots the grid, sends it to Claude or GPT-4V,
gets back which cells to click, and handles multiple rounds automatically.

Usage in your Playwright script:
    from solve_image_grid import solve_image_grid

    # Click the checkbox first
    page.frame_locator('iframe[title="reCAPTCHA"]') \\
        .locator('.recaptcha-checkbox-border').click()

    # Solve the grid (if it appears)
    solved = solve_image_grid(page)

Standalone test (opens the Google demo):
    python solve_image_grid.py

Requirements:
    pip install playwright anthropic    # Claude (recommended)
    # or: pip install playwright openai # GPT-4V fallback

Environment:
    ANTHROPIC_API_KEY  — Claude API key (preferred, better spatial reasoning)
    OPENAI_API_KEY     — OpenAI API key (fallback)
"""

import base64
import json
import os
import re
import sys
import time
import random

# ---------------------------------------------------------------------------
# Timing constants
# ---------------------------------------------------------------------------

CELL_CLICK_DELAY  = (0.25, 0.65)   # random pause between cell clicks (seconds)
VERIFY_WAIT_SEC   = 2.5            # pause after clicking Verify before checking result
ROUND_DELAY       = (1.5, 3.0)     # pause between rounds

# ---------------------------------------------------------------------------
# Selectors
# ---------------------------------------------------------------------------

CHECKBOX_IFRAME     = 'iframe[title="reCAPTCHA"]'

# The challenge iframe may have slightly different titles across reCAPTCHA versions
CHALLENGE_IFRAME_SELECTORS = [
    'iframe[title*="recaptcha challenge"]',
    'iframe[src*="recaptcha/api2/bframe"]',
    'iframe[src*="recaptcha/enterprise/bframe"]',
]

# Selectors *inside* the challenge iframe
TASK_TEXT_SEL = '.rc-imageselect-desc-no-canonical, .rc-imageselect-desc'
GRID_SEL      = '.rc-imageselect-table-33, .rc-imageselect-table-44, table.rc-imageselect-table'
CELL_SEL      = 'td.rc-imageselect-tile, .rc-imageselect-tile'
VERIFY_BTN    = '#recaptcha-verify-button'


# ---------------------------------------------------------------------------
# Vision AI: ask which cells match the task
# ---------------------------------------------------------------------------

def _prompt(task_text: str, grid_size: int) -> str:
    n = grid_size * grid_size
    return (
        f'This is a reCAPTCHA image grid ({grid_size}×{grid_size}, {n} cells total).\n'
        f'Task: "{task_text}"\n\n'
        f'Number the cells 1–{n} left-to-right, top-to-bottom (row 1 first).\n'
        f'Return ONLY a JSON array of the cell numbers that match the task.\n'
        f'Examples: [2,5,8]  or  []  (empty if none match)\n'
        f'No explanation — just the array.'
    )


def _call_claude(image_b64: str, task_text: str, grid_size: int) -> list:
    import anthropic
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    msg = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=64,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_b64,
                    },
                },
                {"type": "text", "text": _prompt(task_text, grid_size)},
            ],
        }],
    )
    return _parse_response(msg.content[0].text, grid_size)


def _call_openai(image_b64: str, task_text: str, grid_size: int) -> list:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    resp = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=64,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_b64}"},
                },
                {"type": "text", "text": _prompt(task_text, grid_size)},
            ],
        }],
    )
    return _parse_response(resp.choices[0].message.content, grid_size)


def _parse_response(raw: str, grid_size: int) -> list:
    """Extract a valid list of cell ints from the AI's raw response."""
    match = re.search(r'\[.*?\]', raw.strip(), re.DOTALL)
    if not match:
        return []
    try:
        cells = json.loads(match.group())
        n = grid_size * grid_size
        return [c for c in cells if isinstance(c, int) and 1 <= c <= n]
    except (json.JSONDecodeError, TypeError):
        return []


def ask_vision_ai(image_b64: str, task_text: str, grid_size: int) -> list:
    """
    Ask the available vision AI which cells match the task.
    Tries Claude first, falls back to GPT-4V.
    Returns a list of 1-indexed cell numbers.
    """
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            cells = _call_claude(image_b64, task_text, grid_size)
            print(f"[grid] Claude selected: {cells}", file=sys.stderr)
            return cells
        except Exception as e:
            print(f"[grid] Claude error: {e} — trying OpenAI...", file=sys.stderr)

    if os.environ.get("OPENAI_API_KEY"):
        cells = _call_openai(image_b64, task_text, grid_size)
        print(f"[grid] GPT-4V selected: {cells}", file=sys.stderr)
        return cells

    raise RuntimeError(
        "No vision AI key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."
    )


# ---------------------------------------------------------------------------
# Playwright helpers
# ---------------------------------------------------------------------------

def _find_challenge_frame(page):
    """Return the challenge FrameLocator if visible, else None."""
    for sel in CHALLENGE_IFRAME_SELECTORS:
        try:
            frame = page.frame_locator(sel)
            if frame.locator(TASK_TEXT_SEL).is_visible(timeout=1500):
                return frame
        except Exception:
            continue
    return None


def _challenge_visible(page) -> bool:
    for sel in CHALLENGE_IFRAME_SELECTORS:
        try:
            if page.locator(sel).is_visible(timeout=400):
                return True
        except Exception:
            pass
    return False


def _get_task(frame) -> str:
    try:
        return frame.locator(TASK_TEXT_SEL).first.inner_text(timeout=3000).strip()
    except Exception:
        return ""


def _get_grid_size(frame) -> int:
    try:
        if frame.locator('.rc-imageselect-table-44').count() > 0:
            return 4
    except Exception:
        pass
    return 3


def _screenshot_grid(frame) -> str:
    """Screenshot just the image grid and return as base64 PNG."""
    try:
        png = frame.locator(GRID_SEL).first.screenshot()
    except Exception:
        png = frame.locator("body").screenshot()
    return base64.b64encode(png).decode()


def _click_cells(frame, cell_numbers: list, grid_size: int) -> None:
    """
    Click the specified cells (1-indexed, left-to-right top-to-bottom).

    Uses element-based clicking via frame_locator rather than raw pixel
    coordinates — more reliable across different viewport sizes and DPIs.
    """
    if not cell_numbers:
        return
    cells = frame.locator(CELL_SEL).all()
    for num in cell_numbers:
        idx = num - 1
        if idx < len(cells):
            try:
                cells[idx].click()
                time.sleep(random.uniform(*CELL_CLICK_DELAY))
            except Exception as e:
                print(f"[grid] Cell {num} click failed: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def solve_image_grid(page, max_rounds: int = 6) -> bool:
    """
    Solve a reCAPTCHA v2 image grid challenge on the given Playwright page.

    Call this after clicking the reCAPTCHA checkbox. If a grid challenge
    appears, the function loops through rounds (new grids keep appearing
    until Google is satisfied) and clicks the correct cells each time.

    If the checkbox passed without triggering a grid (common on trusted IPs
    and during testing), the function returns True immediately.

    Args:
        page:       Playwright Page object
        max_rounds: Give up after this many rounds (default: 6)

    Returns:
        True  — challenge closed (solved or no challenge appeared)
        False — failed to solve within max_rounds or API error
    """
    # Wait briefly for the challenge to appear
    print("[grid] Checking for image challenge...", file=sys.stderr)
    for _ in range(8):
        if _find_challenge_frame(page):
            break
        time.sleep(0.7)
    else:
        print("[grid] No grid challenge — checkbox solved directly.", file=sys.stderr)
        return True

    for round_num in range(1, max_rounds + 1):
        frame = _find_challenge_frame(page)
        if not frame:
            print("[grid] Challenge closed — done.", file=sys.stderr)
            return True

        task_text = _get_task(frame)
        grid_size = _get_grid_size(frame)
        print(f"[grid] Round {round_num}: '{task_text}' ({grid_size}×{grid_size})",
              file=sys.stderr)

        image_b64 = _screenshot_grid(frame)

        try:
            cells = ask_vision_ai(image_b64, task_text, grid_size)
        except Exception as e:
            print(f"[grid] Vision AI failed: {e}", file=sys.stderr)
            return False

        _click_cells(frame, cells, grid_size)

        # Small pause before clicking Verify (mimics human review time)
        time.sleep(random.uniform(0.6, 1.4))

        try:
            frame.locator(VERIFY_BTN).click()
        except Exception as e:
            print(f"[grid] Verify click failed: {e}", file=sys.stderr)
            return False

        time.sleep(VERIFY_WAIT_SEC + random.uniform(0, 1))

        if not _challenge_visible(page):
            print("[grid] Challenge dismissed — solved.", file=sys.stderr)
            return True

        print("[grid] New round appeared.", file=sys.stderr)

    print(f"[grid] Gave up after {max_rounds} rounds.", file=sys.stderr)
    return False


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("OPENAI_API_KEY")):
        print("ERROR: set ANTHROPIC_API_KEY or OPENAI_API_KEY", file=sys.stderr)
        sys.exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        page = context.new_page()
        page.goto("https://www.google.com/recaptcha/api2/demo", wait_until="networkidle")

        print("[main] Clicking checkbox...")
        page.frame_locator(CHECKBOX_IFRAME) \
            .locator(".recaptcha-checkbox-border").click()

        ok = solve_image_grid(page)
        print(f"[main] Grid result: {'SOLVED' if ok else 'FAILED'}")

        if ok:
            page.click("#recaptcha-demo-submit")
            page.wait_for_timeout(3000)

        page.screenshot(path="grid_result.png")
        print("[main] Screenshot saved to grid_result.png")
        browser.close()
