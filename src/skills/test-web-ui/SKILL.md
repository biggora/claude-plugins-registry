---
name: test-web-ui
description: >
  Automated web QA skill: analyzes a website or project, generates end-user use cases,
  derives a structured test plan, executes tests via Playwright browser automation, and
  produces a full HTML/Markdown QA report with screenshots and pass/fail results.
  
  TRIGGER this skill whenever the user asks to: test a website, run QA on a web app,
  check if a site works, find bugs on a site, validate a web project, create a test plan
  for a website, run functional tests, check a landing page, audit a web app for issues,
  test user flows — or any variation of "проверить сайт", "протестировать сайт",
  "QA сайта", "тест веб-приложения", "найти баги на сайте". Even if the user just says
  "посмотри работает ли всё нормально на сайте" — use this skill.
---

# Web Tester Skill

Transforms any website or project description into a structured QA run:
**Discover → Plan → Execute → Report**

---

## Overview of Phases

```
Phase 1 → DISCOVERY   : Explore the site, understand its purpose and features
Phase 2 → USE CASES   : Generate end-user use case list
Phase 3 → TEST PLAN   : Convert use cases into concrete, executable test cases
Phase 4 → EXECUTION   : Run tests with Playwright, capture screenshots
Phase 5 → REPORT      : Compile HTML + Markdown report with all results
```

---

## Phase 1: Discovery

### What to gather
- **URL** — if the user provides a live URL, use Playwright to crawl it
- **Project files** — if no live URL, inspect source files in `/mnt/user-data/uploads/`
- **Purpose** — what does the site do? (landing page, e-commerce, dashboard, blog, etc.)
- **Key pages** — home, auth, main feature pages, forms, checkout, etc.
- **Tech stack** — optional but helpful for targeted checks

### Discovery script
Run `scripts/discover.py` (see below) to auto-detect pages, links, forms, interactive elements.

**If no live URL is available** (e.g., network blocked or local project):
- Read source files (HTML, JSX, Vue, etc.) in uploads directory
- Extract routes, components, visible text, form fields, navigation links
- Use Playwright with `page.set_content()` to render and inspect local HTML files

---

## Phase 2: Generate Use Cases

After discovery, produce a use case list **from the perspective of an end user**.

### Format
```
UC-01: [Actor] can [action] so that [goal]
UC-02: [Actor] can [action] so that [goal]
...
```

### Categories to cover
- **Navigation** — user browses pages, menu works, links resolve
- **Authentication** — sign up, log in, password reset, logout
- **Core feature flows** — the main thing the site does (purchase, search, submit form, etc.)
- **Content validation** — required text, images, prices, labels appear correctly
- **Forms** — fill in, submit, validate errors, success states
- **Responsiveness** — works on mobile viewport
- **Error handling** — 404 pages, empty states, invalid inputs
- **Performance / visual** — no broken images, no console errors, reasonable load

Aim for **10–25 use cases** depending on site complexity.

---

## Phase 3: Test Plan

Convert each use case into a concrete test case:

```
TC-01 [UC-01]: Homepage Navigation
  Given: User opens the site root URL
  When:  Page finishes loading
  Then:  - Page title is not empty
         - Navigation menu is visible
         - Logo/brand element is present
         - No 404/500 status code
         Checks: title, nav links count > 0, hero text present
```

### Test case types to include
| Type | Examples |
|------|---------|
| **Presence checks** | Element exists, text is visible, image loads |
| **Functional checks** | Button clickable, form submits, menu expands |
| **Data validation** | Price format, phone format, required fields |
| **Navigation checks** | Links don't 404, routing works |
| **Form validation** | Empty submit shows errors, valid submit succeeds |
| **Responsiveness** | Mobile viewport renders without overflow |
| **Console errors** | No JS errors on page load |
| **Accessibility basics** | Images have alt text, headings hierarchy |

---

## Phase 4: Test Execution

### Use the execution script
```bash
python3 /mnt/skills/user/web-tester/scripts/run_tests.py \
  --url <URL_OR_LOCAL_PATH> \
  --test-plan /home/claude/test_plan.json \
  --output /home/claude/test_results/
```

### What the script does
1. Launches headless Chromium (no-sandbox mode for container)
2. For each test case:
    - Navigates to the target page
    - Captures a **before screenshot**
    - Executes assertions (element presence, text content, clicks, form fills)
    - Captures an **after screenshot** if interaction occurred
    - Records PASS / FAIL / SKIP + error message
3. Saves all screenshots to `test_results/screenshots/`
4. Writes `test_results/results.json`

### Manual execution (when no URL — code project)
If only source files are available:
1. Serve them locally: `python3 -m http.server 8080 --directory /home/claude/project/`
2. Run tests against `http://localhost:8080`

### Key Playwright patterns to use

```python
# Launch
from playwright.sync_api import sync_playwright
browser = p.chromium.launch(args=['--no-sandbox', '--disable-dev-shm-usage'])
context = browser.new_context(viewport={'width': 1280, 'height': 800})
page = context.new_page()

# Console error collection
errors = []
page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)

# Mobile viewport test
mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)

# Screenshot
page.screenshot(path='screenshots/tc01_home.png', full_page=True)

# Assertions
page.wait_for_load_state('networkidle')
assert page.locator('nav').is_visible()
assert page.title() != ''
count = page.locator('a').count()
text = page.locator('h1').text_content()
```

---

## Phase 5: Report Generation

After execution, generate report using `scripts/generate_report.py`:

```bash
python3 /mnt/skills/user/web-tester/scripts/generate_report.py \
  --results /home/claude/test_results/results.json \
  --screenshots /home/claude/test_results/screenshots/ \
  --output /mnt/user-data/outputs/qa_report.html
```

### Report contents
- **Summary dashboard** — total tests, pass/fail/skip counts, pass rate %, tested URL, timestamp
- **Use case list** with traceability to test cases
- **Test results table** — TC ID, name, status badge, duration, error message
- **Screenshot gallery** — inline base64 screenshots per test case
- **Console errors log** — any JS errors captured
- **Recommendations** — auto-generated improvement suggestions based on failures

### Report format
- Primary: **HTML** (self-contained, with embedded screenshots)
- Secondary: **Markdown** summary for quick reading

---

## Workflow Summary (step-by-step)

```
1. Receive URL or project files from user
2. Run discovery → understand pages, structure, features
3. Generate use case list → show to user, get approval or continue
4. Generate test plan JSON → structured test cases
5. Run Playwright tests → collect results + screenshots
6. Generate HTML report → save to /mnt/user-data/outputs/
7. Present report to user using present_files tool
```

---

## Handling Common Situations

**No internet access (container network restrictions)**
→ Ask user to provide HTML files, or serve local project
→ Use `page.set_content()` for static HTML testing
→ Use `python3 -m http.server` for multi-page projects

**Site requires authentication**
→ Ask user for test credentials OR
→ Test only the public-facing pages
→ Mark auth-gated tests as SKIP with note

**Single-page app (React/Vue/Angular)**
→ Wait for `networkidle` state
→ Use `page.wait_for_selector()` before asserting dynamic content
→ Check that JS bundle loads without console errors

**Large site (many pages)**
→ Focus on critical user paths first
→ Limit to top 5–10 most important flows
→ Mention in report which pages were NOT covered

---

## Reference Files

- `references/test_case_schema.md` — JSON schema for test_plan.json
- `references/report_template.md` — Report structure reference
- `scripts/discover.py` — Site discovery automation
- `scripts/run_tests.py` — Test execution engine
- `scripts/generate_report.py` — HTML report generator