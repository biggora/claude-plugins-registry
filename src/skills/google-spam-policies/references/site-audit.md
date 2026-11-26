# Live-site audit procedure

How to audit a running website against Google's spam policies for web search. Use it when you can fetch pages over HTTP (and ideally drive a browser). For source code use `code-patterns.md` and `scripts/scan_source.mjs`. Policy wording lives in `policies.md`; judging pages made at scale lives in `scaled-content.md`; manual actions and recovery live in `enforcement-and-recovery.md`.

The aim is a report that separates three things: what was measured, what is a lead that needs judgment, and what could not be checked from outside. Never turn a lead into a violation without the review in Step 5 and Step 6.

## Contents

- [What can and cannot be established from outside](#what-can-and-cannot-be-established-from-outside)
- [Step 1: Scope and inputs](#step-1-scope-and-inputs)
- [Step 2: Run check_site.mjs](#step-2-run-check_sitemjs)
- [Step 3: Checks that need a real browser](#step-3-checks-that-need-a-real-browser)
- [Step 4: Search operators and public sources](#step-4-search-operators-and-public-sources)
- [Step 5: Policy-by-policy pass](#step-5-policy-by-policy-pass)
- [Step 6: Judging pages made at scale](#step-6-judging-pages-made-at-scale)
- [Etiquette and safety](#etiquette-and-safety)
- [Report skeleton](#report-skeleton)

## What can and cannot be established from outside

Can be established (as evidence, by sampling):

- What different requests receive: status, redirect chain, title, visible text, canonical, robots directives for a desktop browser, a Googlebot-smartphone user agent string, and a mobile visitor arriving with a Google referrer.
- How pages in a URL pattern are templated: shared text, unique text, near-duplicates, stamped titles and descriptions.
- Hidden-content leads that are written inline in the HTML, outbound link qualification, affiliate-style parameters, site-wide external links, redirect and script patterns in inline code.
- Whether content exists in the raw HTML or only after JavaScript runs (with a browser).
- Public footprint: what a search engine shows for the domain, copies of the text elsewhere, archive history of the domain.

Cannot be established:

- IP-based cloaking. A user-agent test sees only what a server decides from the UA string and headers. A server that recognises Google's crawler by IP address will look clean here.
- Whether Google has a manual action, a security issue, or an algorithmic demotion on the site. That is visible only in Search Console (Manual actions and Security issues reports) and, for algorithmic effects, only indirectly through traffic patterns.
- Anything done in external CSS or by JavaScript, unless a browser inspects the rendered page and computed styles.
- Off-site facts: backlink profiles, paid links placed on other domains, networks of sister sites, who owns the domain.
- Intent. Every policy turns on purpose (to manipulate rankings, to mislead users). A script measures the artefact; the auditor argues from the artefact to likely purpose, and says how confident that is.
- Pages that were not sampled. A sample of 24 URLs says little about 40,000 URLs unless the patterns are uniform.

State these limits in the report. "Nothing found" means nothing found by these checks.

## Step 1: Scope and inputs

Ask the user, or establish from what they gave you:

1. Site type: publisher, shop, local service, directory, SaaS, forum or user-content site, affiliate site, tool or calculator site.
2. How pages are produced: hand-written, CMS templates, database-driven programmatic pages, AI-assisted drafting, imported feeds, user submissions, syndicated content.
3. Languages and locales, and whether regions or cities each have their own pages.
4. Whether the user has Search Console access. If yes, ask them to open (or read for them) the **Manual actions** and **Security issues** reports first. A manual action names the policy and often example URLs, which re-targets the whole audit. See `enforcement-and-recovery.md` for how to read these reports and what each message means.
5. Known drop dates, update dates they suspect, recent migrations, redesigns, domain purchases, plugin or theme installs, and staff or agency changes.
6. Whether they are authorised to test the site. Spoofed-UA requests are a diagnostic for a site you own or are authorised to audit.
7. Which pages earn the traffic and which were recently added at scale. Sample those first.

Write down the question the audit answers ("why did traffic fall on 2026-03-12?", "is this acquired domain safe to build on?", "does this programmatic section risk Scaled content abuse?"). It decides how deep Steps 4 to 6 go.

## Step 2: Run check_site.mjs

The script lives at `scripts/check_site.mjs`. It needs Node 18 or newer and nothing else. It never requests URLs that robots.txt disallows for `*`, sends requests one at a time with a delay, and prints a Markdown report. It measures and flags leads; it does not judge.

Quick pass (about 25 pages, a few minutes at the default delay):

```
node scripts/check_site.mjs https://example.com
```

Deeper pass (more pages, report saved for later comparison):

```
node scripts/check_site.mjs https://example.com --sample 60 --delay 1200 --out ./site-check
```

Other options: `--urls <file>` to audit a chosen list (one URL per line), `--sitemap <url>` to name a sitemap, `--no-bot-ua` to skip the Googlebot-UA request, `--sample` up to 100. With `--out` the script writes `report.md` and `report.json` (raw records, no page text) and nothing else.

Use `--urls` when the user points at a section ("the /cities/ pages"), when the sitemap is missing or stale, or after a first pass to dig into one pattern.

How to read each section of the report:

| Section | What it tells you | How to use it |
|---|---|---|
| Scope | Robots rules, candidate URL count, pattern table, what was sampled, what was skipped | Check the pattern table against what the owner told you. A pattern with thousands of URLs and 2 samples is a hypothesis, not a finding. Skipped URLs were never requested; ask whether they matter. |
| Variant comparison | Rows only for URLs where the Googlebot UA or the search-referrer visit got a different destination, status or text than the desktop browser | Rows labelled Cloaking or Sneaky redirects are leads. Open the URL in each state yourself (Step 3). A 403, 429 or challenge page for the bot UA only is a tooling artefact: check URL Inspection in Search Console instead. Mobile versus desktop layout differences can also lower similarity legitimately. |
| Per-page leads by policy | Hidden-text, keyword, link, redirect and script leads, aggregated by signature with page counts | Read `[likelyBenign]` items quickly (accordions, tabs, menus) but still look at any that hold many links. Site-wide leads (same hidden block or affiliate link on every page) point to a template or a compromise, not to one page. |
| Template analysis | Per URL pattern: median words, boilerplate share, unique words, near-duplicate pairs, title and description patterns, thin pages, locale copies | Evidence for Scaled content abuse, Doorway abuse, Thin affiliation and Scraping. High boilerplate, low unique words and a stamped title say the pages differ mainly by a swapped token. Whether that is abuse depends on added value (Step 6). |
| Not checked | The blind spots of this run | Copy into your report and fill in what Steps 3 and 4 add. |

All thresholds in the report are heuristics for triage: similarity below 0.8, 15 words or 2 links in hidden elements, a phrase repeated more than 12 times and above 3 % of words, 25 list items, near-duplicate at 0.9, thin below 40 unique words, boilerplate defined at 60 % of sibling pages. They are not Google's numbers. A page just under a threshold can still be a problem; a page over it can be fine. Quote the measurement, not the flag.

Interpreting results with care:

- Boilerplate share counts navigation and footer text. A shop with a long footer shows high boilerplate on every pattern. Compare patterns with each other rather than with an absolute value.
- Unique-word counts depend on the sample. With 2 sampled pages a word is "unique" if it is not on the other page. Prefer patterns with at least 5 sampled pages.
- Keyword-phrase flags often fire on product listings ("add to basket") and legal text. Read the phrases.
- Outbound links without `rel` are normal for editorial citations. They matter when payment, goods, exchange or an affiliate relationship is involved (Link spam), and then they need `rel="sponsored"` or `nofollow`.
- JavaScript dependence leads mean the raw HTML is nearly empty. Everything else in the report for those pages is unreliable until you inspect the rendered DOM.

## Step 3: Checks that need a real browser

If you have a browser tool (Playwright, a browser MCP, DevTools), run these on a handful of pages chosen from the script's leads and from each major pattern. If you do not, say so in the report and list which leads remain unconfirmed.

1. **Rendered DOM versus raw HTML.** Compare the text and links in the rendered page with the HTML the script saw. Content that appears only after JavaScript is fine in itself (Google renders JavaScript), but check that the rendered content is the same for users and for crawlers, and that it is not blocked by robots.txt for scripts or API endpoints it needs. See Google's JavaScript SEO basics and the dynamic-rendering page: serving crawlers a different pre-rendered version is tolerated only as a workaround, and only if the content matches what users see.
2. **Computed styles for hidden text.** For each hidden-text lead, and for any text suspiciously absent from screenshots, inspect computed style: text colour equal to background colour, text off-screen (large negative offsets, `clip`, `transform`), font size 0, opacity 0, text behind an image or another element, links that are one tiny character, elements with zero size but content. Include rules from external CSS. A block hidden until a user clicks (tab, accordion, tooltip) is fine; verify that it actually opens when clicked.
3. **Back button behaviour after arriving from a search result.** Open a Google result for the site (or load a page with `Referer: https://www.google.com/`), then press Back. The user must return to the results page immediately. Watch for extra history entries pushed on load, a page that re-pushes itself on Back, or interstitials that re-open. This is the Back button hijacking element of Malicious practices. Check on mobile and on desktop, and note whether the culprit is the site's own code or an embedded third-party script (the policy applies to pages that show the behaviour either way).
4. **Redirects on a mobile viewport and with a search referrer.** Emulate a phone, arrive with a Google referrer, and compare with a direct visit. Also try the first visit versus a repeat visit (some injected redirects fire once per visitor). A page that sends only search visitors, only mobile visitors or only first-time visitors somewhere else is the Hacked content / Sneaky redirects pattern. Record each hop and its trigger.
5. **Interstitials and misleading functionality.** Does the tool, generator, converter, calculator or download the page promises actually work and is it free as claimed? Does a fake "scanning" or "generating" step end in an ad or a paid offer? Do notices, pop-ups or overlays hide the content the user came for? Do download buttons lead to the file described, not to unrelated software?
6. **What an anonymous visitor sees versus what the HTML holds.** If content sits behind a login, paywall or metering, compare what an anonymous visitor gets with what the raw HTML contains. A paywall is not Cloaking when Google can see the full gated content like a subscriber and the site follows Google's flexible sampling guidance (for example by marking up paywalled content with structured data). Also check that the same content is not shown to crawlers but withheld from subscribers or visitors who should have it.
7. **Forms and user-content areas.** Look (without submitting anything) at comment sections, forums, profile pages, guest-post areas and upload features for visible spam, and at whether moderation controls, `rel="ugc"` and registration friction exist. Do not post test content.

Record, for each check: the URL, the state (viewport, referrer, repeat visit), what you saw, and a screenshot or a text excerpt.

## Step 4: Search operators and public sources

Use the search engine manually, sparingly, or through tools the user supplied. Do not send automated queries to Google Search: that is Machine-generated traffic under Google's policies. Treat `site:` counts as rough; they are not an index report. The URL Inspection tool and Page indexing report in Search Console are the reliable source when the user can supply them.

1. **Indexed footprint.** `site:example.com` for the overall picture, then `site:example.com inurl:/section/` for patterns. Compare the rough count with the number of pages the site says it has. Much more than expected suggests parameter or injected pages; far less suggests indexing trouble.
2. **Unexpected page types and languages.** Look at the titles and snippets in `site:` results. Injected pages in another language, pages about pharmaceuticals, gambling, adult content, counterfeit goods, loans or downloads on an unrelated site, Japanese or other-language product pages on a Latvian shop, and results whose titles differ from what the page shows to a visitor are Hacked content signals. Also check `site:example.com casino`, `site:example.com viagra` and similar terms that never belong on the site. Note any URL for the owner to inspect and for Search Console's Security issues report.
3. **Cached or snippet mismatch.** If a result's snippet mentions content you cannot find on the page, repeat the visit with the search-referrer and Googlebot variants (the script does this) and with a browser at the page's stored URL.
4. **Expired-domain history.** Ask when the domain was registered or acquired. Check web-archive snapshots for what the domain used to be (a charity, school, agency, a different language or topic). Expired domain abuse is about buying such a domain and repurposing it mainly to borrow ranking signals with content of little value to users. A relaunch with the same purpose, or a clearly related new business, is a different case. Note the date of change in topic and compare it with the traffic history.
5. **Copies on other domains.** Take two or three distinctive sentences from template pages and search for them in quotation marks. Many exact matches on other domains raise Scraping or Thin affiliation questions (is the site the original or the copy?), and may also reveal syndicated or merchant-supplied text. Take distinctive sentences from other domains and check whether this site holds them without added value.
6. **Outbound and inbound mentions.** Look at the pages that link prominently to the site (via ordinary search, not tools that scrape results at scale) for guest posts, press releases and widget links that carry optimised anchors. This is limited by what a public search shows; say so.
7. **Reports and complaints.** Check the user's own Search Console messages and any prior reconsideration requests.

## Step 5: Policy-by-policy pass

One row per policy on Google's spam policies page (snapshot 2026-11-25). Work down the table, tick what the evidence supports, and mark the rest "not checked" instead of "clean". The lookalike column lists things that resemble the violation but are normally fine; rule them out before reporting.

| Policy | What to check on a live site | Evidence from | Typical legitimate lookalike |
|---|---|---|---|
| Cloaking | Same URL, different content or destination for crawler versus visitor: extra keyword blocks only for a crawler UA, a different topic for crawlers. | Script: Variant comparison (`googlebot` vs `browser`). Manual: URL Inspection live test in Search Console; Step 3.1. | Responsive or mobile-specific markup; A/B tests; personalisation by language or region; paywalls that follow flexible sampling; bot protection returning 403 to a spoofed UA (artefact). |
| Doorway abuse | Many similar pages for specific queries or places that funnel to one destination; near-identical city/region pages; pages that exist closer to search results than to a browsable hierarchy. | Script: Template analysis (boilerplate, unique words, near-duplicates, title patterns), Scope pattern table. Manual: follow the funnel; Step 6. | Location pages with real local content (address, staff, stock, prices, reviews); category pages inside a clear hierarchy. |
| Expired domain abuse | Domain bought and repurposed mainly for ranking with content of little value; topic unrelated to former use. | Manual: archive history, registration date, Step 4.4; page content versus history. | A domain re-registered for a related purpose by the same organisation; an acquired business continuing its work. |
| Hacked content | Pages or links the owner did not add; injected scripts or iframes; spam pages in other languages; redirects only for search visitors or mobile; cloaked spam. | Script: Variant comparison, Per-page leads (obfuscated scripts, hidden iframes, site-wide hidden links, meta refresh). Manual: Steps 3.4 and 4.2; Search Console Security issues. | Legitimate third-party scripts and tag managers; minified or bundled code that uses base64 for assets. |
| Hidden text and link abuse | Text or links hidden by colour, position, size, opacity, layering, or a one-character link that exists for search engines and not for people. | Script: hidden-text leads (inline styles only), single-punctuation links. Manual: Step 3.2 for external CSS and JavaScript. | Accordions, tabs, sliders, tooltips, mobile menus, screen-reader-only text, visually hidden skip links. |
| Keyword stuffing | Lists of cities or phone numbers, repeated words and phrases that read unnaturally, keywords out of context. | Script: repeated-phrase leads and top phrases, long separated lists, meta keywords. Manual: read the page aloud. | Technical or legal text that repeats defined terms; product names in a listing; genuine lists such as a service-area list with real content next to each place. |
| Link spam | Buying or selling links without `rel="sponsored"` or `nofollow`; link exchanges; partner pages made to cross-link; required links in terms of service; keyword-rich widget or footer links distributed across sites; low-value content made to carry links. | Script: Link spam (unqualified outbound with affiliate markers, site-wide external hosts). Manual: Step 4.6; read the Link-spam leads in context. | Ordinary editorial citations; qualified sponsored links (`rel="sponsored"`); credit links to a theme or agency that are `nofollow`; affiliate links used with correct qualification. |
| Machine-generated traffic | Automated queries sent to Google, such as rank checking. A site audit can cause it if done carelessly. | Not measurable on the site. Check your own workflow and the owner's tooling. | Rank trackers used under express permission or through licensed APIs. |
| Malicious practices | Malware or unwanted software downloads; Back button hijacking (history manipulation that traps users); deceptive installers. | Script: pushState-near-popstate leads, hidden iframes, obfuscated scripts. Manual: Step 3.3; Search Console Security issues; check downloadable files with a scanner the user trusts. | Single-page apps that use the History API for ordinary navigation; opening an app via "open in app" (outside the Back button policy). |
| Misleading functionality | A tool, generator, converter or download that promises a result but delivers ads, a fake outcome or a paywall. | Manual: Step 3.5, use the feature end to end. Script: none, beyond title and description claims. | Free tools that are supported by clearly separated ads; freemium tools that state limits before use. |
| Scaled content abuse | Many pages generated to rank rather than to help, whether by AI, feeds, scraping, translation, stitching, or templates where the content has little value. | Script: Template analysis. Manual: Step 6 and `scaled-content.md`. | Large catalogues, directories or data pages where each page adds real information; machine-assisted content with human review and original value. |
| Scraping | Content copied from other sites with little or no change, feeds reproduced, sites made only to embed or compile others' media. | Manual: Step 4.5 (duplicate-sentence searches); script: low unique words across a pattern. | Quoting with attribution and commentary; licensed syndication; curation with original analysis. |
| Site reputation policy | Third-party content hosted mainly to borrow the host's ranking signals: unrelated sections (coupons, "best casinos", payday loans) not integrated with the site, often from a white-label provider. | Script: Scope pattern table (a foreign-looking section), Template analysis. Manual: compare design, authorship, quality and cross-site duplication of the section; Step 6. | Wire services, syndicated news, forums and user content, editorial columns, integrated affiliate content with clear editorial responsibility. |
| Sneaky redirects | Redirects that differ by crawler, referrer or device, send users to unexpected destinations, or show search engines one thing and users another. | Script: Variant comparison (search-referrer and Googlebot), meta refresh, script redirects near referrer or UA tests. Manual: Step 3.4. | Site moves, page consolidation, post-login redirects, language or regional redirects that match what the visitor asked for, `/old-pricing` to `/pricing` style 301s. |
| Thin affiliation | Affiliate pages whose product text and reviews are copied from the merchant with no original value; cookie-cutter sites across domains or languages. | Script: Template analysis (low unique words, stamped titles) and Link spam leads. Manual: compare descriptions with the merchant's; Step 6. | Affiliate pages with original testing, ratings, comparisons, price information and navigation. |
| User-generated spam | Spam in comments, forum posts, profiles, uploads, free-host accounts. | Manual: Step 3.7; `site:` look for spammy user pages (Step 4.2). Script: leads on pages with user content. | Genuine user discussion; links marked `rel="ugc"` or `nofollow`. |
| Other practices (Legal removals, Personal information removals, Policy circumvention, Scam and fraud) | Impersonating a business, fake contact details, creating new subdomains or sites to continue violating, patterns of complaints. | Manual: compare brand and contact details with the real organisation; Step 4.4 and 4.5; ask about history. | Resellers and agencies that disclose their role; separate brands operated for legitimate reasons. |

Do not apply a policy only because a script label matches it. A confident conclusion needs the evidence from at least one measurement plus a human reading of the pages.

## Step 6: Judging pages made at scale

Template analysis can only say pages are alike. Whether that is abuse depends on the value added for users. Apply the added-value test described in `scaled-content.md`; the procedure for a live site is:

1. **Sample by template.** For each large pattern pick at least 5 pages: the first, the middle and the last of the sorted list, plus the largest and the smallest by word count if you can see them. Include pages linked from the sitemap and pages found only through search.
2. **Read the pages as a visitor.** For each sampled page write one sentence answering: what can a user do or learn here that they cannot on the page's siblings, and could not get from the source it is derived from? If you cannot write the sentence, note that.
3. **Compare with the funnel.** Where do the pages lead? If most lead to one contact, booking or affiliate page, and the pages themselves add only a swapped place or product name, the Doorway abuse question arises. If the pages are the destination (a real tool, local data, stock, original reviews), it does not.
4. **Check the origin of the content.** Feeds, scraped text, translated copies, merchant descriptions, spun text, bulk AI output without review are all possible. Search distinctive sentences (Step 4.5). How content is made is not the test; the value is.
5. **Check the user path.** Can a visitor reach these pages through a browsable hierarchy, or do they exist only as landing pages for queries?
6. **Weigh the measurements.** High boilerplate share, low unique words, stamped titles and many near-duplicates support a concern; they do not prove one. Original facts, structured data a person can use, and clear differences between siblings argue against.
7. **Scale and intent.** One hundred such pages and a network of sister sites are a different situation from ten. Is the scaled section a small part of an otherwise useful site, or the whole site? Is the scaled nature hidden, for example by spreading the pages across several domains?
8. **Say what you would do.** Per pattern, recommend: keep, improve with specific added value, merge into a browsable page, exclude from Search (noindex or remove), or investigate further. Google's guidance for scaled content it does not want to be in Search is to exclude it from Search. The choice among these options is the site owner's: excluding or removing pages takes them out of search results, so exclusion is not a default fix (see `scaled-content.md`, "What an auditor must not conclude").

Keep the verdict in terms of evidence and risk: "this pattern shows 78 % boilerplate and a median of 14 unique words across 25 pages; the funnel goes to one contact page; there is no local data, so it matches the doorway and scaled-content descriptions". Avoid claims about what Google has decided; only Search Console can say that.

## Etiquette and safety

- Keep the request rate low. The script defaults to 800 ms between requests and at most three requests per sampled URL; raise the delay on small or slow servers.
- Respect robots.txt `Disallow` rules for `*`. The script never requests them, and you should not either. Such paths are often click-out, tracking or action endpoints whose requests have side effects (counting clicks, billing an advertiser, adding to a basket).
- Do not request click-out, tracking, cart, checkout, unsubscribe or form endpoints, even if they are not in robots.txt. Do not log in. Do not submit forms. Do not post comments or upload files to test moderation.
- Do not send automated queries to Google Search. That is itself the Machine-generated traffic policy, and violates Google's terms. Use the search engine manually, in small numbers, or through tools and exports the user has provided.
- A spoofed Googlebot user agent is a diagnostic. Use it only on a site you own or are authorised to audit, and do not use it to get past access controls. If a site blocks it, report that as a limitation; do not work around the block.
- Do not run vulnerability scans or exploit tests. This audit reads public pages.
- Treat what you collect as the owner's data. Keep `report.json` and screenshots with the audit, not in public places. Do not paste personal data found on pages into the report.
- Ask before testing a site the user does not appear to control.

## Report skeleton

1. Question and scope (site type, patterns, dates, Search Console state).
2. What was measured: the commands run, number of URLs sampled, what was skipped, and the script's Not checked list.
3. Findings, one per policy that has evidence: the measurement, the lookalike ruled out, the confidence (high, medium, low), and the pages that show it.
4. Leads not confirmed: what a browser or Search Console check would settle.
5. Not checked: IP-based cloaking, rendered DOM and external CSS if no browser was used, off-site factors, manual actions and security issues, intent.
6. Recommendations ordered by risk and effort, linked to the recovery steps in `enforcement-and-recovery.md`.

Close with a plain statement that the output is evidence and leads, and that Google decides policy outcomes.
