---
name: seo-best-practices
description: When the user wants to audit, review, or diagnose SEO on their site — technical, on-page, content, international, or off-page. Use when they mention "SEO audit," "technical SEO," "why am I not ranking," "traffic dropped," "lost rankings," "not showing up in Google," "Google update hit me," "page speed," "Core Web Vitals," "crawl errors," "indexing issues," "currently not indexed," "on-page SEO," "meta tags," "duplicate content," "keyword cannibalization," "search intent," "content refresh," "hreflang," "international SEO," "local SEO," or "backlinks." Trigger even on vague asks like "my SEO is bad" or a post-migration traffic drop — start with an audit. Do NOT use this skill for adjacent work; route instead. Structured data / JSON-LD → schema. AI Overviews or generative-engine optimization → ai-seo. Keyword-target pages at scale → programmatic-seo. Navigation, URL hierarchy, or information architecture → site-architecture. Conversion rate → cro. Analytics or GA4 setup → analytics.
metadata:
  version: 1.1.0
---

# SEO Best Practices

You are an expert in search engine optimization. Your goal is to identify SEO issues and provide actionable recommendations to improve organic search performance.

## Initial Assessment

Before auditing, understand:

1. **Site Context**
   - What type of site? (SaaS, e-commerce, blog, etc.)
   - What's the primary business goal for SEO?
   - What keywords/topics are priorities?

2. **Current State**
   - Any known issues or concerns?
   - Current organic traffic level?
   - Recent changes or migrations?

3. **Scope**
   - Full site audit or specific pages?
   - Technical + on-page, or one focus area?
   - Access to Search Console / analytics?

---

## Audit Framework

### Schema Markup Detection Limitation

**`web_fetch` and `curl` cannot reliably detect structured data / schema markup.**

Many CMS plugins (AIOSEO, Yoast, RankMath) inject JSON-LD via client-side JavaScript — it won't appear in static HTML or `web_fetch` output (which strips `<script>` tags during conversion).

**To accurately check for schema markup, use one of these methods:**
1. **Browser tool** — render the page and run: `document.querySelectorAll('script[type="application/ld+json"]')`
2. **Google Rich Results Test** — https://search.google.com/test/rich-results
3. **Screaming Frog export** — if the client provides one, use it (SF renders JavaScript)

Reporting "no schema found" based solely on `web_fetch` or `curl` leads to false audit findings — these tools can't see JS-injected schema.

### Priority Order
1. **Crawlability & Indexation** (can Google find and index it?)
2. **Technical Foundations** (is the site fast and functional?)
3. **On-Page Optimization** (is content optimized?)
4. **Content Quality** (does it deserve to rank?)
5. **Authority & Links** (does it have credibility?)

---

## Technical SEO Audit

### Crawlability

**Robots.txt**
- Check for unintentional blocks
- Verify important pages allowed
- Check sitemap reference

**XML Sitemap**
- Exists and accessible
- Submitted to Search Console
- Contains only canonical, indexable URLs
- Updated regularly
- Proper formatting

**Site Architecture**
- Important pages within 3 clicks of homepage
- Logical hierarchy
- Internal linking structure
- No orphan pages

**Crawl Budget Issues** (for large sites)
- Parameterized URLs under control
- Faceted navigation handled properly
- Infinite scroll with pagination fallback
- Session IDs not in URLs

### Indexation

**Index Status**
- site:domain.com check
- Search Console coverage report
- Compare indexed vs. expected

**Indexation Issues**
- Noindex tags on important pages
- Canonicals pointing wrong direction
- Redirect chains/loops
- Soft 404s
- Duplicate content with no canonical signal (canonicalization gap — not a penalty)

**Canonicalization**
- All pages have canonical tags
- Self-referencing canonicals on unique pages
- HTTP → HTTPS canonicals
- www vs. non-www consistency
- Trailing slash consistency

> **Duplicate content is not a penalty.** Naturally occurring duplicates don't trigger a penalty — Google groups them and picks a canonical. It's a canonicalization/crawl-efficiency matter; only scraped/copied content is a spam issue. See [SEO Fundamentals](references/seo-fundamentals.md).

### Site Speed & Core Web Vitals

**Core Web Vitals**
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

**Speed Factors**
- Server response time (TTFB)
- Image optimization
- JavaScript execution
- CSS delivery
- Caching headers
- CDN usage
- Font loading

**Tools**
- PageSpeed Insights
- WebPageTest
- Chrome DevTools
- Search Console Core Web Vitals report

### Mobile-Friendliness

- Responsive design (not separate m. site)
- Tap target sizes
- Viewport configured
- No horizontal scroll
- Same content as desktop
- Mobile-first indexing readiness

**Verify with:** Lighthouse, Chrome DevTools device mode, and PageSpeed Insights (mobile). Google's standalone Mobile-Friendly Test and the Search Console Mobile Usability report were retired in December 2023 — don't rely on them.

### Security & HTTPS

- HTTPS across entire site
- Valid SSL certificate
- No mixed content
- HTTP → HTTPS redirects
- HSTS header (bonus)

### URL Structure

- Readable, descriptive URLs
- Keywords in URLs where natural
- Consistent structure
- No unnecessary parameters
- Lowercase and hyphen-separated

---

## International SEO & Localization

Check when the site serves multiple languages or regions. Misconfigurations can suppress indexing of entire locale variants or drag down site-wide quality signals. See [International SEO reference](references/international-seo.md) for evidence and source URLs.

### Hreflang

Three equivalent placement methods: HTML `<link>` in `<head>`, HTTP `Link` headers, XML sitemap `<xhtml:link>`. If using multiple, they must agree -- conflicting signals cause Google to drop that pair. For 10+ locales, prefer sitemap-based (no page weight, no per-request cost).

**Check for:**
- Self-referencing entry on every page (page must include itself in the hreflang set)
- Reciprocal links (if A points to B, B must point back to A -- or both are ignored)
- Valid codes: ISO 639-1 language + optional ISO 3166-1 Alpha 2 region (e.g., `en`, `en-GB` -- never `en-UK`)
- `x-default` present, pointing to fallback page (language selector or default locale)
- All target URLs return 200, are indexable, and match their canonical URL
- No duplicate language-region codes pointing to different URLs

**Common errors:** Missing self-referencing entry (all hreflang ignored). No return tag / one-directional (pair dropped). Invalid codes like `en-UK` (use `en-GB`). Hreflang target is non-canonical, 404, or blocked (cluster discarded). HTML and sitemap annotations disagree (conflicting pair dropped).

**At scale:** `<xhtml:link>` children don't count toward 50K URL sitemap limit, but the 50MB file size limit becomes the bottleneck (plan 2K-5K URLs per file with full hreflang). Focus hreflang on pages receiving wrong-language traffic -- not required on every page. For Bing: supplement with `<html lang>` and `<meta http-equiv="content-language">` (Bing treats hreflang as a weak signal).

### Canonicalization for Multilingual Sites

- Each locale page must self-canonical (e.g., `/ar/page` canonicals to `/ar/page`)
- Never cross-locale canonical (French to English) -- suppresses the non-canonical locale entirely
- Canonical URL must appear in the hreflang set -- if not, all hreflang is ignored
- Canonical overrides hreflang when they conflict
- Protocol/domain must be consistent across canonical, hreflang, and sitemap (`https` + same domain variant)
- Paginated locale pages: self-referencing canonical per page (never canonical page 2+ to page 1)

**Common mistakes:** all locales canonical to English (kills indexing), canonical URL not in hreflang set (silently ignored), protocol mismatch between canonical and hreflang, CMS setting deep page canonical to homepage.

### International Sitemaps

**Check for:**
- `xmlns:xhtml` namespace on `<urlset>`, each `<url>` includes `<xhtml:link>` for all locales including itself
- `x-default` alternate included; all URLs absolute (full protocol + domain)
- Sitemap index in Search Console and robots.txt; split by content type, not by locale

**Next.js caveat:** `alternates.languages` does NOT auto-include a self-referencing `<xhtml:link>` for the `<loc>` URL -- you must add the current locale explicitly.

### Locale URL Structure

**Recommended:** Subdirectories (`/en/`, `/ar/`). **Acceptable:** Subdomains or ccTLDs. **Not recommended:** URL parameters (`?lang=en`).

**Check for:**
- Consistent locale prefix strategy; all locales prefixed (hiding locale from URLs prevents Google from distinguishing versions)
- Root URL handled as `x-default` with redirect, or serves default locale content
- No IP/Accept-Language content negotiation (Googlebot: US IPs, no Accept-Language header)
- Trailing slash + case consistency across locale paths, canonicals, hreflang, and sitemaps
- 301 redirects from non-canonical format to canonical

**Note:** Google's International Targeting report in Search Console is deprecated. Geotargeting relies on hreflang, content signals, and linking patterns.

### Content Quality Across Locales

**Translation quality:**
- AI-translated content is not inherently spam (Google's 2025 stance), but scaled low-value translations can trigger scaled content abuse policy
- Google uses visible content to determine language -- translate ALL page content (title, description, headings, body), not just boilerplate
- Translating only template/nav while main content stays in original language creates duplicates

**Thin locale pages:**
- Helpful content system is site-wide -- many thin locale pages can suppress rankings for strong pages too
- Don't noindex thin locales (wastes crawl budget) or cross-locale canonical (conflicts with hreflang)
- Best approach: don't create locale pages you cannot make genuinely helpful

**Check for:**
- All locale pages have fully translated main content (not just UI chrome)
- No near-identical content across locales ("Duplicate, Google chose different canonical" in GSC)
- Hreflang only for locales with genuine content and search demand
- Localized signals: currency, phone format, addresses where applicable
- Broken hreflang links (404s, redirects) waste crawl budget AND invalidate hreflang clusters

---

## On-Page SEO Audit

### Title Tags

**Check for:**
- Unique titles for each page
- Primary keyword near beginning
- ~50-60 characters before SERP truncation (display guideline, not a ranking limit — Google sets no character limit; prioritize clarity)
- Compelling and click-worthy
- Brand name placement (end, usually)

**Common issues:**
- Duplicate titles
- Too long (truncated)
- Too short (wasted opportunity)
- Keyword stuffing
- Missing entirely

### Meta Descriptions

**Check for:**
- Unique descriptions per page
- ~150-160 characters before desktop truncation (display guideline, not a hard limit; Google often rewrites the snippet to match the query)
- Includes primary keyword
- Clear value proposition
- Call to action

**Common issues:**
- Duplicate descriptions
- Auto-generated garbage
- Too long/short
- No compelling reason to click
- Meta keywords tag present — Google ignores it; no need to add or audit it

### Heading Structure

**Check for:**
- One H1 per page
- H1 contains primary keyword
- Logical hierarchy (H1 → H2 → H3)
- Headings describe content
- Not just for styling

**Common issues:**
- Multiple H1s
- Skip levels (H1 → H3)
- Headings used for styling only
- No H1 on page

### Content Optimization

**Primary Page Content**
- Topic addressed clearly and early (no fixed "keyword in first 100 words" rule — Google matches intent semantically)
- Related keywords and synonyms used naturally (avoid stuffing)
- Sufficient depth — judged by intent coverage, not a word count
- Answers search intent
- Better than competitors (benchmark coverage — see [Content Strategy](references/content-strategy.md))

**Thin Content Issues**
- Pages with little unique content
- Tag/category pages with no value
- Doorway pages
- Duplicate or near-duplicate content

### Image Optimization

**Check for:**
- Descriptive file names
- Alt text on all images
- Alt text describes image
- Compressed file sizes
- Modern formats (WebP)
- Lazy loading implemented
- Responsive images

### Internal Linking

**Topic clusters (pillar ↔ spoke)** — group content into a pillar page linking to in-depth spoke pages, each linking back. Reciprocal, contextual, descriptive links signal topical authority and spread ranking signals. Detail in [Content Strategy](references/content-strategy.md).

**Check for:**
- Important pages well-linked
- Descriptive anchor text (names the destination topic)
- Pillar ↔ spoke reciprocal links within topic clusters
- Logical link relationships
- No broken internal links
- Reasonable link count per page

**Common issues:**
- Orphan pages (no internal links)
- Over-optimized anchor text
- Important pages buried
- Excessive footer/sidebar links

### Keyword Targeting

**Search intent first** — classify each target query as informational, navigational, commercial, or transactional, and confirm the page format matches what currently ranks (guide vs comparison vs product). Read intent from the SERP, not the keyword. One primary page per intent cluster prevents cannibalization. Full method (clustering, mapping, gap audit) in [Content Strategy](references/content-strategy.md).

**Per Page**
- Clear primary keyword target
- Search intent identified; content format matches intent
- Title, H1, URL aligned
- Content satisfies search intent
- Not competing with other pages (cannibalization)

**Site-Wide**
- Keyword mapping document (with an intent column)
- No major gaps in coverage
- No keyword cannibalization
- Logical topical clusters

### SERP Features & Rich Results

- Featured snippets: concise ~40-60 word answer near the top; ordered lists for steps, tables for comparisons (Google lifts these formats)
- People Also Ask: cover the related questions for the target query
- Rich results (FAQ, Product, Review, Article): audit eligibility via the Rich Results Test (renders JS) — implementation belongs to the **schema** skill
- Eligibility doesn't guarantee display

Detail in [Content Strategy](references/content-strategy.md).

---

## Content Quality Assessment

### E-E-A-T Signals

> **Note:** Google states E-E-A-T is not itself a ranking factor — there is no E-E-A-T score. Its systems aim to reward content that demonstrates these qualities, so treat E-E-A-T as a quality lens for review, not a checkbox. See [SEO Fundamentals](references/seo-fundamentals.md).

**Experience**
- First-hand experience demonstrated
- Original insights/data
- Real examples and case studies

**Expertise**
- Author credentials visible
- Accurate, detailed information
- Properly sourced claims

**Authoritativeness**
- Recognized in the space
- Cited by others
- Industry credentials

**Trustworthiness**
- Accurate information
- Transparent about business
- Contact information available
- Privacy policy, terms
- Secure site (HTTPS)

### Content Depth

- Comprehensive coverage of topic
- Answers follow-up questions
- Better than top-ranking competitors
- Updated and current

### User Engagement Signals

- Time on page
- Bounce rate in context
- Pages per session
- Return visits

> These are indirect, correlated signals — not direct Google ranking factors. Read them in context (a high bounce on a quick-answer page is fine).

### Content Freshness

- Visible/structured last-updated date (real, not auto-bumped)
- Outdated stats, examples, prices, screenshots refreshed
- Broken internal/outbound links fixed
- Refresh cadence by volatility: volatile topics ~quarterly, evergreen ~annually
- Thin/stale pages improved, consolidated, or pruned — stale content can drag site-wide quality via the helpful content system

Full refresh audit in [Content Strategy](references/content-strategy.md).

### Semantic SEO & Entities

- Each page has one clearly defined main entity, named consistently
- Related concepts/attributes a knowledgeable page would cover are present
- Author/Organization identity with `sameAs` for disambiguation (hand markup to the **schema** skill)

Reinforces E-E-A-T; AI-search specifics live in the **ai-seo** skill. Detail in [Content Strategy](references/content-strategy.md).

---

## Authority & Link Building

Priority #5 in the audit framework: does the site have credibility and earned links? Links are one signal among many — Google's guidance stresses "there's much more to Search than just links." Audit for quality and relevance over volume. Full playbook in [Link Building](references/link-building.md).

### Linkable Assets
- At least one genuinely link-worthy asset exists (original research/data, free tool, definitive guide, template, case study) — not just commercial pages

### Acquisition (white-hat only)
- Editorial, relevance-first tactics: guest contributions, digital PR, expert roundups, resource-page inclusion, broken-link outreach, reclaiming unlinked brand mentions
- No link schemes (bought/exchanged links at scale, PBNs) — they violate Google's spam policies; mark genuine paid/untrusted links `rel="sponsored"`/`nofollow`

### Link Quality
- Judge prospects by topical relevance, editorial in-content context, real audience, and site trust — not a single third-party "authority score" (DR/DA are vendor estimates, not Google's)

### Anchor Text
- Descriptive, natural, varied; avoid repetitive exact-match commercial anchors
- No numeric anchor-ratio targets (e.g., "40% exact-match") — folklore with no Google basis

### Backlink Profile Audit
- Search Console Links report (free baseline): top linking sites, most-linked pages, top anchors
- Competitor link-gap and lost-link analysis (paid tools)
- Disavow only for genuine unnatural-link/manual-action cases — most sites never need it

---

## Common Issues by Site Type

### SaaS/Product Sites
- Product pages lack content depth
- Blog not integrated with product pages
- Missing comparison/alternative pages
- Feature pages thin on content
- No glossary/educational content

### E-commerce
- Thin category pages (add unique intros, buying guides, FAQs)
- Duplicate product descriptions (write unique copy with high-intent modifiers, e.g., "organic", "cruelty-free")
- Product titles: primary keyword / intent modifier first, within display width
- Product image alt text descriptive (SEO + accessibility), not "product image"
- Missing product schema (price, availability, rating — note schema detection limitation)
- Faceted navigation creating duplicates
- Out-of-stock pages mishandled
- Competitive analysis of rival product/category pages
- Category/collection content refreshed for seasonality

### Content/Blog Sites
- Outdated content not refreshed
- Keyword cannibalization
- No topical clustering
- Poor internal linking
- Missing author pages

### Multilingual / Multi-Regional Sites
- Hreflang errors (missing return tags, invalid codes, no self-reference)
- Canonical conflicting with hreflang (cross-locale canonical suppresses indexing)
- Thin locale pages dragging down site-wide quality signal
- Only boilerplate translated, main content identical across locales
- No x-default fallback declared
- Sitemap missing hreflang alternates or missing reciprocal entries
- IP-based redirects hiding content from Googlebot
- Framework locale mode hiding locale from URLs

### Local Business
- Inconsistent NAP
- Missing local schema
- No Google Business Profile optimization
- Missing location pages
- No local content

---

## Output Format

### Audit Report Structure

**Executive Summary**
- Overall health assessment
- Top 3-5 priority issues
- Quick wins identified

**Technical SEO Findings**
For each issue:
- **Issue**: What's wrong
- **Impact**: SEO impact (High/Medium/Low)
- **Evidence**: How you found it
- **Fix**: Specific recommendation
- **Priority**: 1-5 or High/Medium/Low

**On-Page SEO Findings**
Same format as above

**Content Findings**
Same format as above

**Prioritized Action Plan**
1. Critical fixes (blocking indexation/ranking)
2. High-impact improvements
3. Quick wins (easy, immediate benefit)
4. Long-term recommendations

---

## References

- [SEO Fundamentals](references/seo-fundamentals.md): Google's official stance and common misconceptions (title/meta length, meta keywords, duplicate content, E-E-A-T, retired tools) with sources
- [Content Strategy](references/content-strategy.md): Search intent, keyword clustering, content depth, freshness, topic clusters, SERP features, semantic SEO
- [Link Building](references/link-building.md): Authority and link building — linkable assets, white-hat acquisition, quality filters, backlink audit
- [International SEO](references/international-seo.md): Evidence and sources for hreflang, canonical + i18n, sitemaps, URL structure, and content quality across locales
- [AI Writing Detection](references/ai-writing-detection.md): Common AI writing patterns to avoid (em dashes, overused phrases, filler words)
- For AI search optimization (AEO, GEO, LLMO, AI Overviews), see the **ai-seo** skill

---

## Tools Referenced

**Free Tools**
- Google Search Console (essential)
- Google PageSpeed Insights / Lighthouse (performance + mobile)
- Google Keyword Planner (keyword research / volume ranges)
- Bing Webmaster Tools
- Rich Results Test (**use this for schema validation — it renders JavaScript**)
- Schema Validator

> **Note on schema detection:** `web_fetch` strips `<script>` tags (including JSON-LD) and cannot detect JS-injected schema. Use the browser tool, Rich Results Test, or Screaming Frog instead — they render JavaScript and capture dynamically-injected markup. See the Schema Markup Detection Limitation section above.

**Paid Tools** (if available)
- Screaming Frog
- Ahrefs / Semrush
- Sitebulb
- ContentKing

---

## Task-Specific Questions

1. What pages/keywords matter most?
2. Do you have Search Console access?
3. Any recent changes or migrations?
4. Who are your top organic competitors?
5. What's your current organic traffic baseline?

---

## Related Skills

- **ai-seo**: For optimizing content for AI search engines (AEO, GEO, LLMO)
- **programmatic-seo**: For building SEO pages at scale
- **site-architecture**: For page hierarchy, navigation design, and URL structure
- **schema**: For implementing structured data
- **cro**: For optimizing pages for conversion (not just ranking)
- **analytics**: For measuring SEO performance
