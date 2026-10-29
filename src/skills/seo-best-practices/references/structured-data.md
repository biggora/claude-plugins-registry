# Structured Data: JSON-LD, Google Guidelines & Rich-Result Types

Evidence for auditing structured data in the SEO Audit skill. Each topic states Google's documented position, separates what still earns a rich result from what Google has retired, and cites sources. Use this to check markup, not to promise ranking gains.

## Contents

- [Google's Stance](#googles-stance)
- [Format and Structure](#format-and-structure)
- [Site-Wide Coverage by Page Type](#site-wide-coverage-by-page-type)
- [Quality Guidelines](#quality-guidelines)
- [Types Still Worth Auditing](#types-still-worth-auditing)
- [Retired or Restricted Types](#retired-or-restricted-types)
- [Server-Side vs JavaScript](#server-side-vs-javascript)
- [Detection and Validation](#detection-and-validation)
- [Minimal Example](#minimal-example)
- [Audit Checklist](#audit-checklist)

---

## Google's Stance

Structured data is not a direct ranking factor, but this skill treats site-wide JSON-LD coverage as a required audit standard (see Site-Wide Coverage). It describes a page in a machine-readable way so the page can be eligible for a rich result (stars, price, breadcrumb trail, event details and similar). Google's introduction to structured data frames the benefit as more engaging listings that may earn more interaction, not as higher rankings.

Valid markup never guarantees a rich result. Google decides per query and per page whether to show a feature. Missing markup on an indexable page is an audit finding (see Site-Wide Coverage), but never report it as the cause of low rankings.

- [Google: Intro to How Structured Data Markup Works](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google: General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## Format and Structure

Google supports JSON-LD, Microdata and RDFa, and says all three are equally fine if the markup is valid. JSON-LD is the recommended format because it is easier to implement and maintain at scale and less prone to user errors. Do not flag Microdata or RDFa as a defect.

JSON-LD lives in a `<script type="application/ld+json">` block. It can sit in `<head>` or `<body>` (Google's own JavaScript example appends it to `<head>`). Put the markup on the page it describes. On duplicate pages, add the same markup to every duplicate, not only the canonical.

Two ways to organise several entities on one page:

- **Multiple blocks:** one `<script>` per entity. Simple, and fine for independent items.
- **`@graph`:** one block holding an array of entities. Cleaner when entities refer to each other.

Link entities with `@id` instead of repeating them. Give the Organization an `@id` such as `https://example.com/#org`, then reference it as `{ "@id": "https://example.com/#org" }` from the WebSite's `publisher` and from each Article's `publisher`. Google's guidelines say to use the main type that matches the page's focus and to nest related items or link them with `@id`. `@id` links nodes within one page's graph; across pages the Organization and WebSite nodes are repeated (see Site-Wide Coverage).

- [Google: Intro to How Structured Data Markup Works](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google: General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: Generate Structured Data with JavaScript](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript)

## Site-Wide Coverage by Page Type

Structured data is not a ranking factor. Site-wide coverage is still a required audit item: it is the convention, it gives Google and other consumers one consistent entity graph (Organization, WebSite, WebPage), and it keeps rich-result eligibility where a type applies. An indexable page with no JSON-LD is a finding (Impact: Medium), even when its type has no rich result (contacts, legal, about, category). Report it as a coverage gap, never as a cause of low rankings.

Every indexable page carries one JSON-LD `@graph` with at least:

- a `WebPage` node, or the subtype from the table, with `@id` (page URL + `#webpage`), `url`, `name`, `inLanguage`, `isPartOf` → WebSite `@id`, and `about` or `publisher` → Organization `@id`;
- the `Organization` node (`@id` `https://example.com/#org`, `name`, `url`, `logo`);
- the `WebSite` node;
- a `BreadcrumbList` on every page except the home page.

Fallback rule: any HTML page whose type is not in the table still gets the base graph: WebPage + Organization + WebSite + BreadcrumbList (off the home page). No page ships without JSON-LD. Implementation: emit the base graph from the shared site layout/template, so new pages get it automatically, and let page templates add or override the primary node.

An `@id` reference links nodes inside the same graph. Google documents no cross-page resolution of `@id`, and each page is processed on its own, so repeat the Organization and WebSite nodes in every page's graph (the Yoast and RankMath pattern). Do not define them only on the home page.

| Page type | Example URL | Primary type | Required extras |
| --- | --- | --- | --- |
| Home | `/` | `WebPage` + `WebSite` | Full `Organization`, including `sameAs` and `contactPoint` |
| About | `/about` | `AboutPage` | `Organization` |
| Contacts | `/contacts` | `ContactPage` | `Organization` or a `LocalBusiness` subtype (when there is a physical location) with `address` (`PostalAddress`), `telephone`, `email`, `contactPoint` (`ContactPoint`: `contactType`, `telephone`/`email`, `areaServed`, `availableLanguage`). Values must match the visible page |
| Legal, privacy, terms, cookies | `/legal/privacy` | `WebPage` | `name`, `url`, `inLanguage`, `dateModified`, `isPartOf`, `publisher` → Organization, plus `BreadcrumbList` |
| Services | `/services/x` | `Service` | `provider` → Organization, `areaServed`, `serviceType` |
| Pricing | `/pricing` | `WebPage` | `Offer`/`Product`, or `Service` with `offers`, only when prices are visible |
| Blog index, tag or archive | `/blog`, `/blog/tag/x` | `CollectionPage` | `Blog` optional on the index |
| Blog post or article | `/blog/post` | `BlogPosting` / `Article` | `headline`, dates, `author`, `publisher` |
| Case study | `/case-studies/x` | `Article` | `headline`, dates, `author`, `publisher` |
| Documentation or help article | `/docs/x` | `TechArticle` | `headline`, dates, `author`, `publisher` |
| Author page | `/authors/jane` | `ProfilePage` | `Person` as `mainEntity` |
| Product | `/products/widget` | `Product` | `Offer` |
| Category or listing | `/category/widgets` | `CollectionPage` | `ItemList` optional |
| FAQ page | `/faq` | `WebPage` (`FAQPage` optional) | `FAQPage` stays valid schema.org although the rich result is retired |
| Local landing page | `/locations/london` | `LocalBusiness` subtype | `address`, `telephone`, `openingHoursSpecification` |
| Careers listing | `/careers` | `CollectionPage` | - |
| Job posting | `/careers/x` | `JobPosting` | `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation` or `applicantLocationRequirements` |
| Event | `/events/x` | `Event` | `name`, `startDate`, `location` with `address`; `eventStatus` recommended |
| Video page | `/videos/x` | `VideoObject` | `name`, `thumbnailUrl`, `uploadDate` |
| Search results | `/search?q=` | `SearchResultsPage` | Base graph only |
| 404, cart, checkout, account, other `noindex` pages | - | `WebPage` | Base graph only. Not indexed, so missing markup here is Low impact, not Medium |

Contacts page graph. `ContactPage` is a `WebPage` subtype, and `Organization` carries the contact details.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": "https://example.com/contacts#webpage",
      "url": "https://example.com/contacts",
      "name": "Contact Example Co",
      "inLanguage": "en",
      "isPartOf": { "@id": "https://example.com/#website" },
      "about": { "@id": "https://example.com/#org" },
      "breadcrumb": { "@id": "https://example.com/contacts#breadcrumb" }
    },
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Co",
      "url": "https://example.com/",
      "logo": "https://example.com/logo.png",
      "telephone": "+1-555-0100",
      "email": "support@example.com",
      "address": { "@type": "PostalAddress", "streetAddress": "1 Example Street", "addressLocality": "Springfield", "postalCode": "12345", "addressCountry": "US" },
      "contactPoint": [{ "@type": "ContactPoint", "contactType": "customer support", "telephone": "+1-555-0100", "email": "support@example.com", "areaServed": "US", "availableLanguage": ["en"] }]
    },
    { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com/", "name": "Example Co", "publisher": { "@id": "https://example.com/#org" } },
    {
      "@type": "BreadcrumbList",
      "@id": "https://example.com/contacts#breadcrumb",
      "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" }, { "@type": "ListItem", "position": 2, "name": "Contacts" }]
    }
  ]
}
</script>
```

Legal page graph (`/legal/privacy`). The Organization and WebSite nodes are the same as above and are repeated in full on the real page.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://example.com/legal/privacy#webpage",
      "url": "https://example.com/legal/privacy",
      "name": "Privacy Policy",
      "inLanguage": "en",
      "dateModified": "2026-05-10",
      "isPartOf": { "@id": "https://example.com/#website" },
      "publisher": { "@id": "https://example.com/#org" },
      "breadcrumb": { "@id": "https://example.com/legal/privacy#breadcrumb" }
    },
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Example Co", "url": "https://example.com/", "logo": "https://example.com/logo.png" },
    { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com/", "name": "Example Co", "publisher": { "@id": "https://example.com/#org" } },
    {
      "@type": "BreadcrumbList",
      "@id": "https://example.com/legal/privacy#breadcrumb",
      "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" }, { "@type": "ListItem", "position": 2, "name": "Privacy Policy" }]
    }
  ]
}
</script>
```

### Checking Every URL

Check every indexable URL, not a sample. Build the URL list from the XML sitemap(s) plus a crawl, because sitemaps miss pages; run crawl-only URLs through the same check. List every URL without JSON-LD in the report by URL, never as "some pages".

Server-rendered check (reads `sitemap.xml` or a sitemap index one level deep, prints `OK <url> <types>` or `MISSING <url>`; `ERROR` means the fetch failed):

```sh
#!/bin/sh
# Usage: sh jsonld-audit.sh https://example.com/sitemap.xml
locs() { curl -fsSL "$1" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g; s/&amp;/\&/g'; }
locs "$1" | while read -r u; do
  case "$u" in *.xml) locs "$u" ;; *) echo "$u" ;; esac   # sitemap index: one level deep
done | sort -u | while read -r url; do
  html=$(curl -fsL "$url") || { printf 'ERROR\t%s\n' "$url"; continue; }
  if printf '%s' "$html" | grep -qi 'application/ld+json'; then
    types=$(printf '%s' "$html" | grep -oE '"@type" *: *("[^"]*"|\[[^]]*\])' | sed 's/.*: *//; s/[]["]//g; s/ //g' | sort -u)
    printf 'OK\t%s\t%s\n' "$url" "$(echo $types | sed 's/ /,/g')"
  else
    printf 'MISSING\t%s\n' "$url"
  fi
done
```

The snippet sees server-rendered JSON-LD only. For JS-injected markup, run Screaming Frog in JavaScript rendering mode with Structured Data extraction enabled, or loop a headless browser over the URLs and read `document.querySelectorAll('script[type="application/ld+json"]')`. Then cross-check every MISSING URL there before reporting it.

Presence is not enough. For each page, also check that the graph contains the Organization and WebSite nodes and the right primary type for its page type (see the table). A bare `WebPage` where `ContactPage` belongs, or a page with a stray `Product` block and no Organization, is still a finding.

- [schema.org: ContactPage](https://schema.org/ContactPage)
- [schema.org: AboutPage](https://schema.org/AboutPage)
- [schema.org: CollectionPage](https://schema.org/CollectionPage)
- [schema.org: ProfilePage](https://schema.org/ProfilePage)
- [schema.org: ContactPoint](https://schema.org/ContactPoint)
- [schema.org: Service](https://schema.org/Service)
- [schema.org: Blog](https://schema.org/Blog)
- [schema.org: TechArticle](https://schema.org/TechArticle)
- [schema.org: JobPosting](https://schema.org/JobPosting)
- [schema.org: Event](https://schema.org/Event)
- [schema.org: VideoObject](https://schema.org/VideoObject)
- [schema.org: SearchResultsPage](https://schema.org/SearchResultsPage)
- [Google: Job Posting](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Google: Event](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google: Video](https://developers.google.com/search/docs/appearance/structured-data/video)

## Quality Guidelines

From Google's General Structured Data Guidelines:

- Mark up only content that is visible to users. The page body must describe what the JSON-LD describes. Markup must reflect the page's main content and must not mislead.
- Items missing required properties for their rich-result type are not eligible. Recommended properties improve result quality, but accurate and complete properties matter more than many incomplete ones.
- Use the most specific applicable schema.org type, original content, and current information. Time-sensitive content that is no longer relevant will not earn a rich result.
- Do not block pages that carry structured data with robots.txt, `noindex` or other access controls.
- If a page marks up reviews, include all the reviews visible on the page. Fake reviews, or ratings not written by real users, can bring a manual action.
- Self-serving reviews are not eligible. If the reviewed entity controls the reviews about itself (a `LocalBusiness` or other `Organization` marked up with its own reviews, including via an embedded third-party widget), the page is ineligible for the review-star feature.

Structured-data spam or policy violations can trigger a manual action. It removes rich-result eligibility for the affected pages and does not affect ranking in web search. Check the Manual Actions report in Search Console.

- [Google: General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: Review Snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)

## Types Still Worth Auditing

Only types listed on Google's Search Gallery can earn rich results; site-wide types such as WebPage subtypes, WebSite and Organization are audited for coverage regardless (see Site-Wide Coverage). At the time of writing the gallery lists: Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription and paywalled content, Vacation rental, Video. Re-check the gallery before recommending a type, because Google removes features.

Key properties for the most common ones (confirm against the feature's own page):

- **Article:** no required properties. Recommended: `headline`, `image`, `datePublished`, `dateModified` (ISO 8601 with timezone), `author` (Person or Organization with `name` and `url`).
- **Product, merchant listing:** requires `name`, `image`, and `offers` as an `Offer` with `price` (greater than zero) and `priceCurrency`. `availability`, `aggregateRating`, `review`, `gtin`/`sku` and `brand` are recommended. For pages where the product cannot be bought, use the product snippet variant.
- **Review snippet / AggregateRating:** `Review` needs `author`, `itemReviewed` (unless nested), `reviewRating.ratingValue`. `AggregateRating` needs `ratingValue` plus `ratingCount` or `reviewCount`.
- **Breadcrumb:** `BreadcrumbList` with `itemListElement` of at least two `ListItem`s, each with `name` and `item` (the last `item` may be omitted) and a `position`.
- **Organization:** no required properties. Recommended: `name`, `url`, `logo` (at least 112x112 px, crawlable), `sameAs` (profile URLs). It belongs in every page's graph (see Site-Wide Coverage), with full detail on home, about and contacts.
- **Local business:** requires `name` and `address`. Recommended: `geo`, `openingHoursSpecification`, `telephone`, `url`, `priceRange`. Use the most specific subtype.

- [Google: Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Google: Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: Product](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google: Merchant Listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Google: Review Snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google: Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google: Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: Local Business](https://developers.google.com/search/docs/appearance/structured-data/local-business)

## Retired or Restricted Types

Do not recommend these as rich-result opportunities:

- **HowTo:** documentation removed Sept 14, 2023 because the rich result is no longer shown.
- **FAQ:** limited on Sept 14, 2023 to well-known, authoritative government and health sites. Google's updates page then announced (May 8, 2026) that the feature would no longer appear in Search from May 7, 2026, and removed the documentation on June 15, 2026.
- **Course info, Estimated salary, Learning video, Special announcement, Vehicle listing:** documentation removed Sept 9, 2025; these types are no longer shown in Search. **ClaimReview** received a "phasing out" banner on June 12, 2025 and is absent from the Search Gallery.
- **Practice problem:** documentation removed Jan 6, 2026, and Search Console rich-result reporting support ended.
- **Dataset:** still listed, but it feeds Dataset Search, not a standard Search rich result.

Existing schema.org markup of these types is harmless. It stays valid vocabulary and simply earns no Google rich result. Do not tell clients to remove it, and do not report it as an error. Note that the Course list type remains in the gallery even though Course info is gone.

- [Google: Search Central Documentation Updates](https://developers.google.com/search/updates)
- [Google: Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Google: Dataset](https://developers.google.com/search/docs/appearance/structured-data/dataset)

## Server-Side vs JavaScript

Google can process structured data that is present in the DOM after it renders the page, so JSON-LD injected by JavaScript (Google Tag Manager, a custom script) can work. Server-rendered markup is more reliable, because it does not depend on the render step.

Google's JavaScript page adds a caution for e-commerce: dynamically generated Product markup can make Shopping crawls less frequent and less reliable. This matters most for fast-changing values such as price and availability. Merchants targeting all shopping result types should also make sure their servers can handle the extra crawling load.

- [Google: Generate Structured Data with JavaScript](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript)

## Detection and Validation

What each method can see:

- **`curl` / raw HTML:** shows JSON-LD printed server-side. Yoast, RankMath and AIOSEO output JSON-LD server-side, so `curl | grep ld+json` finds it.
- **`web_fetch`:** converts the page to markdown and drops `<script>` tags, so it cannot see any JSON-LD. Never report "no schema" from it alone.
- **JavaScript-injected markup** (Tag Manager, widgets, client-rendered SPAs) needs rendering. Options:
  - Run `document.querySelectorAll('script[type="application/ld+json"]')` in a browser console.
  - Google Rich Results Test (use the URL input so it renders the page).
  - Search Console URL Inspection, live test.
  - Screaming Frog crawl with JavaScript rendering on.

Validation tools:

- **Rich Results Test:** checks eligibility for Google rich results.
- **[Schema Markup Validator](https://validator.schema.org/):** checks generic schema.org syntax, including types Google does not use.
- **Search Console rich-result reports:** catch sitewide errors and warnings after launch.

- [Google: Generate Structured Data with JavaScript](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript)
- [Google: General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## Minimal Example

One `@graph` block: an Organization linked by `@id` to the Article's `publisher`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Co",
      "url": "https://example.com/",
      "logo": "https://example.com/logo.png",
      "sameAs": ["https://www.linkedin.com/company/example"]
    },
    {
      "@type": "Article",
      "headline": "How to Audit Structured Data",
      "datePublished": "2026-03-01",
      "dateModified": "2026-05-10",
      "author": {
        "@type": "Person",
        "name": "Jane Doe",
        "url": "https://example.com/authors/jane"
      },
      "publisher": { "@id": "https://example.com/#org" }
    }
  ]
}
</script>
```

## Audit Checklist

- [ ] Check raw HTML (`curl`) and rendered DOM before concluding that markup is missing.
- [ ] Confirm every marked-up value is visible on the page.
- [ ] Confirm required properties are present for each targeted rich-result type.
- [ ] Confirm the type is still on Google's Search Gallery; do not recommend FAQ or HowTo.
- [ ] Check that Organization, WebSite and Article entities link through `@id` instead of duplicating.
- [ ] Every URL from the sitemap and crawl has JSON-LD; list each MISSING URL individually (no sampling).
- [ ] The Organization and WebSite nodes are present in every page's graph, not only on the home page.
- [ ] The page type matches the Site-Wide Coverage table (for example `ContactPage` on contacts, not a bare `WebPage`).
- [ ] Page types not in the table carry the base graph (fallback rule).
- [ ] Check reviews: no self-serving reviews on LocalBusiness/Organization, and all visible reviews are marked up.
- [ ] Prefer server-side output for Product price and availability.
- [ ] Run the Rich Results Test and the Schema Markup Validator on key templates.
- [ ] Review Search Console rich-result reports and the Manual Actions report.
- [ ] Never present structured data as a ranking factor; report gaps as coverage and eligibility findings.

Sources: [Intro](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) | [General Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) | [Generate with JavaScript](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript) | [Documentation Updates](https://developers.google.com/search/updates) | [Review Snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) | [Merchant Listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
