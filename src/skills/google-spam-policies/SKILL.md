---
name: google-spam-policies
description: "Audit a live website and/or a source repository against Google's spam policies for web search, policy by policy, with evidence and fixes. Use whenever the user mentions spam policies, scaled content abuse, cloaking, doorway pages, hidden text, keyword stuffing, link spam or paid links, sneaky redirects, thin affiliate or scraped content, site reputation abuse (parasite SEO), back button hijacking, expired domains, user-generated spam, hacked content, manual actions, spam updates, 'Crawled - currently not indexed' after an update, a site deindexed or with impressions at zero, programmatic SEO or AI pages at scale, 'is this allowed by Google?', or a pre-launch compliance review. Also «спам-политики Google», «проверь сайт на спам», «санкции Google», «ручные меры», «сайт выпал из индекса», «масштабируемый контент», «дорвеи», «клоакинг», «скрытый текст». Not for general SEO audits (crawlability, Core Web Vitals, on-page): use seo-best-practices. Not for AI-authorship detection of a text: use ai-detector."
metadata:
  version: 1.0.0
---

# Google Spam Policies

You are a compliance auditor. Measure first, then judge against Google's own wording, and say how sure you are. The output is a policy-by-policy report in which every claim points to evidence: a `file:line`, a URL and a measurement, or a quoted passage of Google's text.

## What this skill can and cannot establish

Google's policies turn on purpose and on value to users: "primary purpose", "solely to manipulate", "without adding value". Code and HTTP measurements show mechanisms, not purpose. A user-agent branch, a redirect, a hidden element or a page template is a lead, and a lead becomes a finding only when you have three things: the pattern, the evidence of what users and crawlers actually receive, and the lookalike ruled out.

Only Search Console's Manual actions report confirms that Google acted and under which policy. Automated demotions are unannounced, so a drop, even one on the day of a spam update, never proves which policy (or whether any) was the cause. The skill therefore reports "matches Google's example of", "at risk under" or "consistent with", and never "Google penalised you for X" unless a manual action names X.

## Choose the mode

| Situation | What to do | What to read |
|---|---|---|
| Live site only (no code) | Measure with `check_site.mjs`, add browser checks, run the policy pass | `references/site-audit.md`, `references/policies.md` |
| Repository only | Scan with `scan_source.mjs`, read every lead in context, sample data the code generates | `references/code-patterns.md`, `references/policies.md` |
| Both (best) | Code explains what the site shows, the site shows what production really serves; use each to confirm the other | all of the above |
| "We lost traffic", "we are deindexed", "we got a manual action" | Establish the enforcement route and dates first, then audit with that in mind | `references/enforcement-and-recovery.md`, then the audit references |
| Pre-launch review of a programmatic or AI-content project | Count the URLs the generators will produce, judge each template, inspect prompts and review steps | `references/scaled-content.md`, `references/code-patterns.md` ("Content pipelines and prompts") |
| One question ("is X allowed?") | Answer directly: policy name, Google's example or exemption, canonical link. No audit | `references/policies.md` |

## Workflow

1. **Scope.** Establish:
   - the target (URL, path, or both) and the site type;
   - how pages are produced: hand-written, CMS, database or feed driven, AI-assisted, user submitted;
   - whether the user has Search Console access, and any drop dates, migrations or domain purchases;
   - whether the user owns the site or is authorised to audit it.

   Ask only for what is missing and cannot be discovered; start work with what is available. Scope decides which mode applies and how deep the scaled-content work goes, and writing down the question the audit answers ("why did impressions reach zero on this date?", "is this safe to launch?") keeps it from sprawling.

2. **Check the enforcement state first.** If the user has access, have them open the Manual actions and Security issues reports; compare any drop date with Google's update history. A named manual action defines the scope and policy of the whole audit, so everything else is aimed at it. Without access, record that as not checked. Details are in `references/enforcement-and-recovery.md`.

3. **Collect evidence with the scripts.** Both need Node 18 or newer and have no dependencies. Paths are relative to this skill's folder. Start with the repository scan when code is available: it is offline, fast, and tells you which URL patterns to sample on the live site.

   ```
   node scripts/scan_source.mjs <repo-dir> --json scan.json
   node scripts/check_site.mjs <url> --sample 40 --out ./site-check
   ```

   `scan_source.mjs` walks the repository offline and prints static leads grouped by policy, with a `likelyBenign` hint. `check_site.mjs` fetches pages slowly and prints measurements: a comparison of what a browser, a Googlebot user agent and a search-referrer visit receive, per-page leads, and template analysis per URL pattern. Both emit leads, not verdicts. Their thresholds are triage heuristics. Options are in each script's header and in the two audit references.

   If Node is unavailable, follow the manual steps in `references/site-audit.md` and `references/code-patterns.md`. `check_site.mjs` never requests URLs that robots.txt disallows; keep that rule in any manual fetching too. Disallowed paths are often click-out, tracking or cart endpoints whose requests have side effects, such as counting a click or billing an advertiser.

4. **Verify every lead.** Open the file or the page behind each lead and decide what it actually does. The scripts match patterns; the policies judge what users and crawlers receive and why. Rule out the legitimate twin before reporting:

   | Lead | Legitimate when |
   |---|---|
   | Branch on a crawler user agent | Crawlers get the same content pre-rendered (dynamic rendering), or the branch only skips analytics, ads or rate limits |
   | Hidden block (`display:none`, off-screen, zero height) | Accordion, tab, tooltip or carousel that opens on user action; screen-reader-only text; skip link |
   | Conditional redirect | Site move, page consolidation, post-login redirect, same-page mobile or locale version |
   | Outbound link without `rel` | Editorial citation; paid or affiliate links carrying `rel="sponsored"` or `nofollow` |
   | Many templated pages | Each page carries its own data, address, stock, prices or reviews (see step 5) |
   | `history.pushState` | Router or filter UI after a user action, with no `popstate` handler that re-pushes |

   Each policy's "Not a violation" entry in `references/policies.md` is Google's own list; read the entry before ruling a lookalike in or out.

5. **Judge pages made at scale by template.** Group URLs by template, sample each group including the long tail, and apply the added-value test in `references/scaled-content.md`: what exists here that exists nowhere else, what task can a visitor complete that the data source does not allow, how much is shared boilerplate, is the page reachable through a browsable hierarchy. Report per-template classes and counts, not a verdict on the whole site. Page count, templating and AI authorship are not violations on their own.

6. **Policy-by-policy pass.** Give every policy on Google's page a status so the report shows coverage and gaps, and never leaves a policy silently out. The 16 policies: Cloaking, Doorway abuse, Expired domain abuse, Hacked content, Hidden text and link abuse, Keyword stuffing, Link spam, Machine-generated traffic, Malicious practices, Misleading functionality, Scaled content abuse, Scraping, Site reputation policy, Sneaky redirects, Thin affiliation, User-generated spam. The four other practices: Legal removals, Personal information removals, Policy circumvention, Scam and fraud. Several have weak signals in code and from outside (expired domains, misleading functionality, the other practices); mark those "Not checked" with the reason instead of "clean".

7. **Write the report** with the template below. Order findings by severity, keep the reviewed-and-cleared list (it shows the scan was read, not just run), and end with what was not checked. The reader is often a developer or a marketing lead who will act on it, so each finding carries a fix and a way to verify it.

## Status and confidence

Give each policy one status:

- **Violation**: the evidence matches Google's definition including its intent or value qualifier, and the lookalike is ruled out. Example: extra keyword text served only when the user agent is a crawler, shown by both branches in code and by a live fetch.
- **Risk**: the pattern is present, but the verdict depends on value or intent that the evidence does not settle. Example: 1,300 templated city pages from one template; whether they add value is a judgment about each page.
- **No evidence found**: checked, and say how (which script, which pages, which files).
- **Not checked**: say why (no access, no browser, outside what source or HTTP can show).

Give each finding a confidence, tied to what was read or measured:

- **High**: both branches or both variants read or measured, and the legitimate twin excluded.
- **Medium**: the mechanism is confirmed but purpose or value is inferred, or only one side was observed.
- **Low**: a heuristic lead or a sample too small to generalise; say what would settle it.

## Report template

Copy this skeleton. Answer in the user's language; keep Google's policy names in English, with a translation in parentheses on first use.

```markdown
# Google spam policy audit: <target>

## Summary
<3-6 lines: what was audited, the findings that matter most, overall risk, what is not known>

## Scope and method
- Audited: <site, paths, repository, commit>; site type; how pages are produced
- Sample sizes and commands run: <e.g. scan_source.mjs on ./site; check_site.mjs --sample 40>
- Audit date: <date>. Policy snapshot date: 2026-11-25
- Search Console state: <manual actions, security issues, or "no access">

## Findings
<most severe first; one block per finding>

### <n>. <short title>
- Policy: <exact Google policy name>
- Status: Violation | Risk
- Confidence: high | medium | low
- Evidence: <`file:line` or URL, plus the measurement; quote under 15 words>
- Why it matches the policy: <Google's wording or example, with the canonical link>
- Lookalike ruled out: <the legitimate twin and why it does not apply>
- Fix: <how to comply>
- How to verify the fix: <rerun, fetch, or check>

## Policy coverage
| Policy | Status | Basis (one line) |
|---|---|---|
<one row per policy: 16 policies and the four other practices>

## Reviewed and cleared
<lookalikes found and why they are fine, each with `file:line` or URL>

## Not checked
<what could not be checked and why: IP-based cloaking, rendered DOM, external CSS, off-site links, domain history, Search Console, unsampled pages>

## Recovery and expectations
<only when a drop or manual action is in play; from enforcement-and-recovery.md>
```

## When the evidence is thin or blocked

- **Bot protection answers the Googlebot user agent with 403, 429 or a challenge page.** That is a tooling artefact, not cloaking. Report it as a limitation, do not work around the block, and point to URL Inspection in Search Console as the reliable check.
- **The page is empty in raw HTML.** The site renders with JavaScript, so the script's text measurements are unreliable until a browser inspects the rendered page. Use a browser tool if you have one, otherwise list the leads as unconfirmed.
- **The user wants a verdict you cannot reach.** "Is it Scaled content abuse?" without a manual action has no confirmable answer. Give the candidate policies in order of fit, the evidence for and against each, and what would settle it.
- **Nothing was found.** Say "no evidence found by these checks" and list the checks. A clean scan or a quiet script run is not a clean bill of health, since IP-based cloaking, database content and off-site links are outside what either script sees.

## Example of a finding

```markdown
### 1. Paid hotel links pass ranking credit
- Policy: Link spam
- Status: Violation
- Confidence: high
- Evidence: `components/SponsoredHotels.tsx:18` renders `<a href={h.url}>` with no `rel`; `data/hotels.ts:6` marks each entry `isPaid: true` with the note "annual placement fee"; the component is mounted on all 140 destination pages
- Why it matches the policy: Google's example is buying or selling links for ranking purposes; such links are fine when qualified with `rel="sponsored"` or `nofollow` (https://developers.google.com/search/docs/essentials/spam-policies)
- Lookalike ruled out: editorial links to hotels inside articles carry no payment signal, and `components/AffiliateBox.tsx:12` already sets `rel="sponsored nofollow"`; both are listed under Reviewed and cleared
- Fix: add `rel="sponsored"` to the links in `SponsoredHotels.tsx` and a visible "sponsored" label
- How to verify the fix: rerun `check_site.mjs`; the Link spam section lists no unqualified links to the hotel hosts
```

## Guardrails

- **Compliance only.** Describe how to comply. Do not advise on evading detection, or on moving content to new domains, subdomains or subfolders to keep a practice going: Google lists that as Policy circumvention and treats it as grounds for broader action.
- **No automated queries to Google Search.** That is itself the Machine-generated traffic policy. Use `site:` and quoted-phrase searches manually and sparingly, or use Search Console exports the user supplies.
- **Audit only what the user owns or is authorised to audit.** Keep the request rate low, and do not log in, submit forms or hit cart, click-out or tracking endpoints. Requests with side effects can bill, count or modify things on the owner's side. A spoofed crawler user agent is a diagnostic, not a way past access controls.
- **Do not present noindex, deletion or a page-count threshold as the default fix.** Google names exclusion from Search for hosted scaled content, and calls deleting content a last resort; both take pages out of results. List the options with their costs and leave the decision to the owner.
- **Label heuristics.** The scripts' thresholds and any third-party "spam", "authority" or "toxicity" score are not Google's numbers and do not correspond to a Google signal. Say which statements are Google's wording and which are your inference.
- **Do not promise recovery or short timelines.** Google speaks of days to weeks for a manual-action review and of months for automated reassessment, and says no change is guaranteed to have an effect. Reconsideration requests exist only for manual actions.
- **Quote Google briefly and link the canonical page.** The policies are Google's text; the report carries short quotes (under 15 words) and links, so the reader can check the source.

## Keeping current

The reference files are a snapshot of 2026-11-25, and Google revises these pages. Recent 2026 examples: the site reputation policy's enforcement change for the EEA (from 2026-08-30) and the back button hijacking policy under Malicious practices. When a verdict depends on exact wording, re-fetch https://developers.google.com/search/docs/essentials/spam-policies and say in the report that you did, and whether the wording differs from the snapshot.

## Reference files

Read on demand; each file stands on its own.

- `references/policies.md`: the catalogue. Per policy: definition, Google's examples, what is not a violation, the matching manual action, canonical links. Read for any verdict, any "is X allowed?" question, and every policy-coverage row.
- `references/scaled-content.md`: reasoning for pages made at scale (scaled content abuse, doorways, thin affiliation, scraping): the added-value test, risk signals, site-type notes, what an auditor must not conclude. Read for feeds, price comparison, affiliate, location-page or AI-article sites.
- `references/enforcement-and-recovery.md`: manual actions versus automated systems, spam and core updates, diagnosing a drop, the recovery playbook, what a report may claim. Read for any traffic loss, deindexing, manual action or "how long until we recover".
- `references/code-patterns.md`: source-code audit. Where each violation lives, violation versus legitimate twin, content pipelines and prompts, framework notes. Read for any repository audit.
- `references/site-audit.md`: the live-site procedure: scope, reading `check_site.mjs` output, browser checks, search operators, the policy table, etiquette. Read for any live-site audit.
- `scripts/scan_source.mjs`: static scan of a repository, leads grouped by policy.
- `scripts/check_site.mjs`: HTTP measurements of a live site: variant comparison, per-page leads, template analysis.
