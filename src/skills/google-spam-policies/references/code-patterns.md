# Code patterns: auditing source against Google's spam policies

Use this when the audit target is a repository, not just a live site. It explains what static reading can and cannot show, how to run `scripts/scan_source.mjs`, and, per policy, where the logic usually lives, how to tell a violation from its legitimate twin, and what evidence to cite. Policy names follow Google's spam policies page (https://developers.google.com/search/docs/essentials/spam-policies).

## Contents

1. [Purpose and limits of static scanning](#purpose-and-limits-of-static-scanning)
2. [Running the scanner](#running-the-scanner)
3. Policies: [Cloaking](#cloaking) · [Sneaky redirects](#sneaky-redirects) · [Malicious practices](#malicious-practices-back-button-hijacking) · [Hidden text and link abuse](#hidden-text-and-link-abuse) · [Keyword stuffing](#keyword-stuffing) · [Link spam](#link-spam) · [User-generated spam](#user-generated-spam) · [Doorway abuse](#doorway-abuse) · [Scaled content abuse](#scaled-content-abuse) · [Scraping](#scraping) · [Machine-generated traffic](#machine-generated-traffic) · [Hacked content](#hacked-content) · [Thin affiliation](#thin-affiliation) · [Weak code signals](#policies-with-weak-code-signals)
4. [Content pipelines and prompts](#content-pipelines-and-prompts)
5. [Framework notes](#framework-notes)
6. [Reporting a code finding](#reporting-a-code-finding)

## Purpose and limits of static scanning

Source code shows mechanisms: branches, generators, templates, config. The policies judge intent and the result users and crawlers actually receive. The same code (a user-agent check, a redirect, a hidden element) is often legitimate. Treat every scanner hit as a lead and read the code around it.

What code cannot show:

- **Intent.** A crawler check may serve the same page faster (legitimate) or extra keyword text (cloaking). Only the content of each branch tells them apart.
- **What production serves.** Edge rules, CDN workers, WAF or hosting-panel redirects, feature flags, environment variables and A/B tests can differ from the repo. Confirm with a live fetch (`scripts/check_site.mjs`) when the verdict depends on it.
- **Content in a database or CMS.** Templates can be clean while rows, posts, comments, translations or uploaded files are spam. Sample the data, not just the code.
- **Third-party scripts loaded at runtime.** Tag managers, ad platforms and widgets can inject links, redirects or history manipulation that no file in the repo contains.
- **Files added after deploy.** Injected or hacked files may be absent from version control. Compare the deployed tree with git.

Report confidence in three tiers: **confirmed in code** (condition and both branches read), **likely, needs live check**, **not determinable from source**.

## Running the scanner

```
node scripts/scan_source.mjs <dir> [--json <file>] [--only <policy-slug,...>] [--max-per-rule <n>]
```

- Zero dependencies, Node 18+, offline. Skips `node_modules`, `.git`, build output, lockfiles, minified files, binaries and files over 1 MB; it also skips generated test and tooling artefact folders (`test-results`, `playwright-report`, `storybook-static`, `.cache`, `.output` and similar, counted as "generated") and its own skill folder when that folder is inside the scanned tree. Exit code 0, or 2 if `<dir>` is missing.
- `--only` takes slugs: `cloaking`, `sneaky-redirects`, `malicious-practices`, `hidden-text-and-link-abuse`, `keyword-stuffing`, `link-spam`, `user-generated-spam`, `doorway-abuse`, `scaled-content-abuse`, `scraping`, `machine-generated-traffic`, `hacked-content`, `thin-affiliation`.
- Output is grouped by policy: `file:line`, the matched line, then `why`, `verify`, `benign`. A summary table ends the report. `--json` writes the same findings with a `likelyBenign` flag (and `likelyBenignReason`).
- `likelyBenign` is a heuristic from nearby words (`sr-only`, accordion, prerender, login, tag-manager), and files in test directories or named `*.test.*`, `*.spec.*`, `*.stories.*` or `*.cy.*` are marked likely benign as test code (still scanned, since a helper there could hide a problem). It lowers priority; it does not clear the finding.
- One finding is kept per policy and line, and each rule prints at most `--max-per-rule` (default 25) with a "+N more" line. Rules are line-based regexes with a few nearby-text checks; all of the thresholds (15 meta keywords, 25 list items, 300 characters between nested loops) are heuristics, not Google's numbers.
- Blind spots: logic split across files or built at runtime, languages and template engines not in the extension list, content in databases, minified or bundled code, obfuscation that avoids the literal patterns, and anything that depends on rendered output. A clean scan is not a clean bill of health.

Workflow: run the scan, open each non-benign lead and its callers, read the likely-benign ones quickly, then search for what the rules cannot see using the "Beyond the scanner" notes below.

## Cloaking

**Where it lives:** edge or CDN workers, reverse-proxy config (`if ($http_user_agent ~* ...)`, `map`), framework middleware, SSR entry points, A/B or personalisation layers, paywall wrappers, geo/IP helpers.
**Beyond the scanner:** crawler lists kept in config, env vars or a database instead of literals; reverse-DNS or IP-range verification helpers; branches keyed on `Accept-Language`, `Referer` or custom headers; `Vary: User-Agent` headers (a hint that output varies); sections stripped or added by header; hacked sites often add cloaking to hide the hack, so compare file mtimes and git.

| Looks like a problem | Legitimate when |
|---|---|
| The crawler branch adds text, links or keyword blocks that people never receive | The crawler branch returns the same content in a pre-rendered form (dynamic rendering; Google calls it a workaround, not cloaking, when content is similar) |
| Different topic or offer for crawlers than for visitors | The branch only skips analytics, ads, personalisation, cookie banners, or applies rate limits |
| Full article to crawlers, teaser to users, no paywall markup | Paywall where Google can see the full content as a subscriber would, with paywalled content marked up in structured data (Flexible Sampling guidance) |

**Evidence:** `file:line` of the condition, the signal it tests (UA, IP, header), and what each branch renders (template names, locals, extra variables). State whether the difference is in text, links or metadata, or only in how the same content is delivered.

## Sneaky redirects

**Where it lives:** inline scripts and bundles near load, mobile or device detection, ad or "interstitial" scripts, server redirect handlers, `.htaccess`, nginx `return`/`rewrite`, edge workers, `<meta http-equiv="refresh">`.
**Beyond the scanner:** redirect targets held in config or a database; chained redirects through a tracking domain; conditions on `Referer` containing a search engine; user-agent or device checks that send only some visitors elsewhere; redirects injected by third-party scripts.

| Looks like a problem | Legitimate when |
|---|---|
| Visitors from a search referrer, or on a phone, go to a different domain or different content than other visitors | Redirect to the mobile or localized version of the same page |
| Redirect targets an unrelated site, depends on referrer, user agent or device | Site moved to a new address (301/308 map), several pages consolidated, user sent to an internal page after login |
| `meta refresh` to a third-party site on load | Timed notice pages and short-lived status pages on the same site |

**Evidence:** `file:line` of the condition and the target URL, who owns the target, and who is affected (all visitors, search referrals, mobile). For legitimate maps, note permanent status codes and one-to-one mappings.

## Malicious practices (back button hijacking)

The policy also covers malware and unwanted software; code review mainly meets back button hijacking: a site interfering with browser navigation so the Back button cannot immediately return to the previous page. Pages that show the behaviour are in scope even when third-party advertising code causes it.
**Where it lives:** global scripts loaded on every page, ad or "exit offer" widgets, SPA routers, interstitial and consent scripts.
**Beyond the scanner:** a `popstate` or `hashchange` handler that pushes the same state again; `history.go`/`forward` calls, redirects triggered when Back is pressed, `beforeunload` handlers that navigate or open pages; tag-manager containers; third-party scripts whose source you cannot read (list them and flag the gap).

| Looks like a problem | Legitimate when |
|---|---|
| A `popstate` handler re-pushes history or forwards, so Back stays on the page | Router or filter UI that restores its own view state on `popstate` and lets Back leave |
| `beforeunload` or `visibilitychange` handlers that open pages or redirect | Unsaved-changes prompt on a form or editor |
| History entries added on load with no user action | `pushState` after a user action (filter, tab, pagination) |

**Evidence:** `file:line` for each `pushState`/`replaceState` call and the `popstate` listener, what the handler does, and whether Back from the page leads out. Prefer confirming with a live test.

## Hidden text and link abuse

**Where it lives:** global CSS and utility classes, inline styles in templates and footers, theme or plugin CSS, CMS custom-CSS fields, JSX style objects, tag templates.
**Beyond the scanner:** text hidden behind images or other elements with z-index; links made of one punctuation character; colours set via CSS variables or classes so the same-colour check cannot see them; text moved off-screen with transforms or very large margins; content in `<noscript>` or `hidden` elements that has no way to be revealed.

| Looks like a problem | Legitimate when |
|---|---|
| Keyword paragraph with `left:-9999px`, `font-size:0`, `opacity:0`, or text colour equal to background | `.sr-only` / `visually-hidden` utilities and skip links for screen-reader users |
| Block collapsed with `height:0; overflow:hidden` and no control to open it | Accordion, tab, carousel, tooltip, modal and dropdown panels that open on user action |
| Link whose only anchor text is a hyphen or dot | Decorative separators that link to real pages |

**Evidence:** `file:line` of the rule and of the element using it; the hidden text itself (quote under 15 words, then say how long it is); whether any user action reveals it.

## Keyword stuffing

**Where it lives:** `<head>` partials (`meta keywords`), footer and sidebar partials, "areas we cover" blocks, data files (city, service and phone lists) rendered into templates, CMS seeders.
**Beyond the scanner:** lists loaded from JSON or a database; text repeating the same phrase unnaturally; blocks of phone numbers; lists hidden or shrunk to be unreadable (cross-check Hidden text). Google ignores the keywords meta tag, so a long list there is clutter; the same list in visible or hidden body text is the problem.

| Looks like a problem | Legitimate when |
|---|---|
| A block listing dozens of cities or regions the page wants to rank for | A store locator or branch list where each location has its own details and page |
| Unnatural repetition of one phrase in running copy | Natural use of the topic word in a normal article |
| Lists of phone numbers without added value | A short contact list of real departments |

**Evidence:** `file:line` of the list and where it renders; item count; sample (under 15 words); whether the items link to pages with real content.

## Link spam

**Where it lives:** footer and header partials, sidebars, widgets, plugins, "partners" pages, sponsored-post templates, comment and signature templates, affiliate helper functions, third-party embed snippets.
**Beyond the scanner:** link rendering helpers that build `<a>` tags in code (check whether they add `rel`); links rendered from a database; link-exchange or partner pages; widgets that other sites embed with keyword-rich links; terms of service that require a link without letting the linked owner qualify it.

| Looks like a problem | Legitimate when |
|---|---|
| Paid, sponsored or partner links that pass ranking credit (no `rel="sponsored"` or `nofollow`) | Same links carrying `rel="sponsored"` (or `nofollow`), ideally with a disclosure |
| The same external link in every page template, tied to payment or an exchange | Credit and membership links to your platform, regulator or certification body |
| A widget or script that injects keyword-rich links into pages on other sites | A share or embed button with qualified links the embedding owner controls |

**Evidence:** `file:line` of the link and its template, the target, the commercial signals (query params, comments like "billed quarterly", partner names), and whether `rel` is present. Buying and selling links is not itself a violation when links are qualified.

## User-generated spam

**Where it lives:** comment, review, forum, profile and guestbook routes; template partials that print user text; markdown/HTML renderers; upload handlers; registration flows; moderation queues.
**Beyond the scanner:** whether submissions are auto-approved; rate limiting, CAPTCHA, honeypots, duplicate checks; how URLs in user text become links (helper functions, markdown options); whether profile pages are indexable when empty or new; user-controlled subdomains or file hosting.

| Looks like a problem | Legitimate when |
|---|---|
| User text printed as raw HTML, URLs auto-linked, no `rel="ugc"` or `nofollow` | Output sanitised and user links qualified with `rel="ugc"` (or `ugc nofollow`) |
| Comments or profiles published on submit with no review or spam filter | Moderation, rate limits and spam checks in place; trusted contributors may be exempted from `ugc` on purpose |
| Open signup creating public, indexable pages | Pages for new or empty profiles kept out of the index |

**Evidence:** `file:line` of the render call, the link-creation helper, and the submit handler (`approved: true`-style flags); what controls exist. Note any existing spam already in the data.

## Doorway abuse

**Where it lives:** route and static-path generators (`generateStaticParams`, `getStaticPaths`, `createPages`, Eleventy collections, custom build scripts), sitemap generators, programmatic page controllers, `routes` files with `:service-:city` style patterns, cron jobs that create pages.
**Beyond the scanner:** the source of the lists (static file, database, API); how many URLs result (multiply the list sizes); whether near-duplicate sites or domains share the template; whether pages are linked from a browsable hierarchy or only from the sitemap or footer; whether empty or thin variants are still emitted; redirects funnelling these pages to one destination.

| Looks like a problem | Legitimate when |
|---|---|
| A page for every service x city (or similar) from one template where only the names change | One page per real branch, product or location with its own address, staff, hours, photos or inventory |
| Pages that funnel visitors to the real destination, or are closer to search results than a browsable hierarchy | Category pages in a clearly defined hierarchy, listing real distinct items |
| Several domains or regions pages with slight variations | Genuinely different regional services with distinct information |

**Evidence:** `file:line` of the generator, the list sizes and resulting URL count, the template file, a diff of two generated pages, and whether the sitemap exposes all of them. Heuristic: if only inserted names differ, the page adds nothing a reader could not get from the hub page.

## Scaled content abuse

**Where it lives:** content pipelines, seeders, import jobs, cron or queue workers, "programmatic SEO" scripts, CMS plugins, translation steps, metadata generators. See [Content pipelines and prompts](#content-pipelines-and-prompts).
**Beyond the scanner:** the source and size of inputs; prompts and system messages (stored in code, config, a database, or a prompt-management tool); whether output is reviewed; auto-publish flags and schedules; reuse of one text across many pages with swapped words; multiple sites created to hide the scale.

| Looks like a problem | Legitimate when |
|---|---|
| Many pages generated from a keyword list by an LLM, template or spinner and published without review | A tool that drafts text for an editor who reviews, corrects and adds original value before publishing |
| Scraped or stitched content automatically transformed (synonyms, translation) | Original content translated and checked by a person, in languages the site serves |
| Content that makes little sense to a reader but contains the keywords | Content that answers a real query with accurate, specific information |

**Evidence:** `file:line` of the generator, input size, number of outputs, publishing step, absence or presence of review. Google applies this policy however the content is made, so the method (AI or not) is not the finding; the lack of value and the scale are.

## Scraping

**Where it lives:** crawler scripts, import commands, feed ingestion jobs, RSS aggregators, embed compilers, "news" or "listings" sections built from other sites.
**Beyond the scanner:** a fetch step followed by a store or publish step; sources recorded as configuration; attribution or canonical fields in the data model; transformations meant to disguise copying.

| Looks like a problem | Legitimate when |
|---|---|
| Content copied from other sites and republished without added value or a citation | Short excerpts with a clear link to the source and original commentary or tooling |
| Content changed slightly (synonyms, automated rewriting) and republished | Licensed or permissioned content republished with attribution |
| Feeds republished with no unique benefit to users | Aggregation that adds real value (comparison, filtering, analysis) |

**Evidence:** `file:line` of the fetch and the publish step, source domains, whether the source is cited and linked, and what the site adds.

## Machine-generated traffic

**Where it lives:** SEO tooling scripts, rank trackers, cron jobs, test scripts that run real queries, monitoring tools, scrapers using SERP APIs.
**Beyond the scanner:** HTTP clients building `google.*/search` URLs from parts (`https://www.google.${tld}/search`); headless browsers driving search pages; proxy rotation or CAPTCHA-solving code; environment variables holding SERP API keys.

| Looks like a problem | Legitimate when |
|---|---|
| A script that sends automated queries to Google Search and reads results | A link to a search shown to a person who clicks it |
| Rank-checking by scraping results pages | Search Console data, or a licensed API used within its terms |

**Evidence:** `file:line` of the request, how it is scheduled (loop, cron), the volume, and whether a permitted API is used. Do not advise bypassing blocks.

## Hacked content

**Where it lives:** template and theme files, `index.php`/`header.php`/`footer.php`, uploads and cache folders, `.htaccess`, robots and sitemap routes, `wp-content/mu-plugins`, build output committed to the repo, newly created directories with many pages.
**Beyond the scanner:** files with recent mtimes that are not in git; scripts calling external domains you do not recognise; redirects that depend on referrer, user agent or device; hidden links or text injected into existing pages; pages that exist on disk or in the sitemap but are not linked from the site; cloaking added to hide the above; admin or user accounts you did not create.

| Looks like a problem | Legitimate when |
|---|---|
| `eval(atob(...))`, `eval(base64_decode(...))`, long encoded blobs passed to a decoder and executed | Build-tool output or licence-checker code the team knowingly ships |
| Zero-size or off-screen iframe loading a third-party host | Tag-manager and analytics noscript fallbacks |
| Referrer-conditional redirect in a file the team did not write | A documented redirect rule |

**Evidence:** `file:line`, decoded payload (describe, do not run it), version-control history for the file, mtime versus last deploy, and whether the same pattern appears elsewhere. Recommend treating this as a security incident, not only an SEO issue.

## Thin affiliation

**Where it lives:** product page templates, feed importers, affiliate link builders and plugins, comparison and "best of" generators.
**Beyond the scanner:** whether descriptions and reviews are copied unchanged from a merchant feed; whether pages exist as part of a network of identical affiliate sites; what each page adds (price tracking, testing, original reviews, ratings, comparisons, navigation).

| Looks like a problem | Legitimate when |
|---|---|
| Merchant description printed unchanged next to an affiliate link, template replicated across pages or sites | Original reviews, rigorous testing, ratings, comparisons or price information, with the merchant text as only one part |
| A cookie-cutter site that is a feed plus a template | Affiliate links on a page that gives real value, with links qualified as `sponsored`/`nofollow` where required |

**Evidence:** `file:line` of the link builder and of the field passed through, and a list of what original content the page template contributes.

## Policies with weak code signals

Source rarely proves these; note the gap instead of guessing.

- **Expired domain abuse:** domain history lives outside the repo. Look for a sudden theme change, unrelated content on an old brand, or imported legacy URLs, then verify in the live site and registration history.
- **Misleading functionality:** read what the "tool" or generator does: does it call a real service, or only show ads or a fake result? A fake progress bar followed by an ad is the pattern; a working converter is not.
- **Site reputation policy:** code hints are a subfolder or subdomain running a different CMS, white-label partner content with weak integration, identical pages distributed across sites, no authorship or disclosure. Judge integration, editorial oversight and presentation, not the technology.
- **Scam and fraud, Policy circumvention:** cloned brand names or contact details; new subdomains or sites created to continue a practice that has already been demoted.

## Content pipelines and prompts

Audit any code that generates pages or text at scale (seeders, import jobs, queue workers, cron, LLM calls, template expansion) with these questions, and record the answer for each:

1. **Where does the data come from?** Own database, licensed feed, public API, scraped pages, keyword or location list, an LLM with no source? Unique data is value; a list of names is not.
2. **What transformation is applied?** Template fill, summarising, rewriting, translation, synonym swap, concatenation? Transformations that only disguise copied or thin input do not add value.
3. **What is added?** Original analysis, local detail, photos, prices, testing, expert review, structured facts. If you remove the substituted names, is anything left?
4. **Does a human review it?** Look for an approval state, an editor queue, a diff or sampling step, or an `auto-publish`/`status: published` flag. Note who owns the review and how many items they could actually check.
5. **How many URLs result?** Multiply list sizes and count output. State the number. Compare with the number of real, distinct things the business has.
6. **Are thin or empty variants still emitted?** Look for guards such as minimum content, minimum inventory, or a noindex/exclusion rule for pages without real data. Google asks site owners to exclude such content from Search; a generator without guards publishes everything.
7. **Is the output linked from a real hierarchy** or only from sitemaps, footers and hubs?
8. **Can prompt text or internal instructions leak into public pages or metadata?** Look for system prompts or instructions stored in the same field or template as output, outputs inserted without checking for refusals or boilerplate ("As an AI...", "Here is your article"), placeholders such as `{{city}}` or `[INSERT]`, titles built from a prompt, and generated text used directly in `<title>`, meta descriptions, alt text or JSON-LD. Search the published pages for such strings.
9. **How is quality controlled?** Fact checks, plagiarism checks, duplicate detection, length and uniqueness thresholds, ability to unpublish.
10. **What is the intent in the code?** Prompts or comments such as "include the keyword N times", "rank for", or "write for the algorithm" are direct evidence of search-first intent; quote them under 15 words. Prompts that ask for accuracy, sources, or a defined audience point the other way.

Where it hides: `prompts/` folders, database tables of prompt templates, seed scripts, environment variables, queue job payloads, admin "bulk generate" buttons, CMS plugins, scheduled tasks. A pipeline with no review that is run on a schedule is a stronger lead than a manual tool that a person uses. For per-page judgement of the output, see `references/scaled-content.md`.

## Framework notes

**Next.js**
- Check `generateStaticParams`, `app/**/[slug]/page.tsx`, `sitemap.ts`, `middleware.ts` (UA, geo and referer branches, rewrites and redirects) and `next.config.js` `redirects()`/`rewrites()`.
- `generateMetadata` titles built from one template across thousands of params are a doorway signal; `notFound()` for empty variants is a good guard.
- Edge middleware can vary responses without any page file changing; read it first.

**Nuxt**
- Read `server/middleware`, `routeRules` and `nitro` prerender lists in `nuxt.config`, and `useHead`/`useSeoMeta` calls.
- `routeRules` redirects and `ssr: false` sections change what crawlers see; look for per-route rendering differences by UA.
- Prerendered route lists generated from data files deserve the doorway checks above.

**Astro**
- Check `getStaticPaths` in `src/pages/[...]`, content collections, `astro.config` redirects, and `<script is:inline>` blocks in layouts for redirects or history code.
- Island hydration directives are not cloaking by themselves; a conditional on user agent is.
- Layout components are where footer links and hidden blocks live.

**WordPress / PHP**
- Read the active theme's `header.php`, `footer.php`, `functions.php`, `mu-plugins`, and any plugin that edits output (`the_content`, `wp_footer` filters).
- Spam and hacks hide in `functions.php`, uploads, and options stored in the database (`siteurl`, widgets, `custom_css`); compare core and plugin files with clean copies.
- Check comment settings (moderation, `rel="ugc"`; WordPress adds `ugc nofollow` to comment links by default) and any plugin that auto-publishes posts or creates programmatic pages.
- `.htaccess` redirects conditioned on `HTTP_REFERER` or `HTTP_USER_AGENT` are a classic hacked-site sign.

**Django / Rails templates**
- Search templates for `|safe`, `mark_safe`, `raw`, `html_safe` with user fields; check `urls.py`/`routes.rb` for wildcard slug patterns and management commands or rake tasks that generate records.
- Sitemaps (`django.contrib.sitemaps`, `sitemap_generator`) listing generated objects reveal the URL count.
- Middleware or `before_action` that reads `User-Agent` or `Referer` deserves a read of both branches.

**nginx / Cloudflare Workers / edge**
- Look for `if ($http_user_agent ...)`, `map $http_user_agent`, `if ($http_referer ...)`, `return 301/302`, and `proxy_pass` to a different backend for bots.
- In Workers or edge functions, read `request.headers.get('user-agent')`, `cf.botManagement`, `HTMLRewriter` (it can inject or strip content), and `Response.redirect`.
- Rules in a dashboard or hosting panel are not in the repo; ask for an export or confirm with a live fetch. `Vary` headers and cache keys show whether responses differ by header.

## Reporting a code finding

For each finding, give:

- **Policy** (exact name) and **confidence tier** (confirmed in code, likely, not determinable).
- **Location** as `file:line`, plus the condition or call in one line (quote under 15 words).
- **What each branch serves or what the code produces**, with counts where relevant (URLs, items, links).
- **Why it matters or why it is likely fine**, referring to Google's own examples and legitimate cases.
- **What would settle it**: a live fetch, a data sample, version-control history, or a question for the site owner.
- **Fix direction**: remove or qualify (for example `rel="sponsored"`), add review and guards, exclude thin pages from Search. Describe how to comply; do not describe how to avoid detection.

Keep real findings separate from lookalikes you reviewed and cleared; listing what you cleared (with the reason) shows the scan was read, not just run.
