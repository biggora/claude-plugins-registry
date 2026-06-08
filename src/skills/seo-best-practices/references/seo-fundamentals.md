# SEO Fundamentals: Google's Official Stance & Common Misconceptions

Evidence backing the factual corrections in the SEO Audit skill. Each topic states Google's documented position, explains why a common misconception is wrong, and cites sources. Use this to keep SKILL.md lean and grounded.

## Contents

- [Google's Foundational Stance](#googles-foundational-stance)
- [Title Links (Titles)](#title-links-titles)
- [Meta Descriptions](#meta-descriptions)
- [Meta Keywords Tag](#meta-keywords-tag)
- [Keyword Placement](#keyword-placement)
- [Duplicate Content Is Not a Penalty](#duplicate-content-is-not-a-penalty)
- [E-E-A-T Is Not a Direct Ranking Factor](#e-e-a-t-is-not-a-direct-ranking-factor)
- [URL Structure Facts](#url-structure-facts)
- [Deprecated / Retired Tooling](#deprecated--retired-tooling)
- [Timelines](#timelines)

---

## Google's Foundational Stance

Google's own starting point: "You usually don't need to do anything except publish your site on the web." Google finds most sites automatically by crawling the web and following links, so basic visibility rarely requires special action.

Focus on creating helpful, reliable, people-first content. This is the consistent foundation Google promotes over any technical trick or checklist item.

Before assuming an indexing problem exists, verify it. Use the `site:` search operator (e.g. `site:example.com`) for a rough check, and the URL Inspection tool in Search Console for an authoritative answer on whether a specific URL is indexed.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Google: Creating Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

## Title Links (Titles)

Google does NOT specify a character limit for title tags. The widely repeated "50-60 characters" figure is a SERP display/truncation guideline, not a ranking rule. Google truncates the visible title link at roughly ~600px on desktop, and the exact cutoff varies by device, query, and rendering.

Why the misconception is wrong: optimizing to hit a character count adds no ranking value and can push you to pad or trim titles unnaturally. Prioritize clarity, uniqueness, and relevance to the page's content instead. A descriptive title that exceeds 60 characters but reads well beats a truncated keyword-stuffed one.

- [Google: Influencing Your Title Links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/)

## Meta Descriptions

There is no mandatory character limit for meta descriptions. The common ~155-160 character figure is a display guideline to avoid truncation on desktop, not a rule Google enforces or rewards.

Google frequently rewrites the displayed description to better match the user's query, so even a "perfect" description is not guaranteed to appear. The meta description is one input to the snippet, not the final snippet.

Why this matters for auditing: don't flag a description purely for length. Keep descriptions unique per page, accurate to the content, and compelling enough to earn clicks when Google does use them.

- [Google: Control Your Snippets in Search Results](https://developers.google.com/search/docs/appearance/snippet)
- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/)

## Meta Keywords Tag

Google Search does not use the keywords meta tag. This has been true and publicly stated since 2009. The tag carries no ranking weight whatsoever.

Why the misconception persists: it is a legacy tag from early search engines. There is no need to add it, populate it, or audit it. Time spent on it is wasted, and stuffing it can only signal low-quality intent to other tools.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices)

## Keyword Placement

There is NO Google rule requiring the target keyword to appear "in the first 100 words," in the first paragraph, or at any fixed position. This is SEO folklore, not documented guidance.

Google's language-understanding systems match pages to queries based on meaning, and can rank a page for a query even when the exact terms don't appear on the page. Synonyms and related concepts are understood.

What to actually do: address the page's topic clearly and early because it helps users orient quickly, not because of a positional rule. Avoid keyword stuffing, repetitive or out-of-context keywords, which violates Google's spam policies.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Google: Spam Policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies)
- [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/)

## Duplicate Content Is Not a Penalty

Naturally occurring duplicate content (e.g. printer-friendly versions, syndicated pages, near-identical product variants) is fine and does NOT incur a penalty or manual action. Google's documented position is that having duplicates is normal and not something to fret about.

It is a canonicalization and crawl-efficiency matter, not a ranking penalty. When Google finds duplicates, it groups them and picks one canonical URL to show. You can guide the choice with `rel="canonical"`, but Google handles the rest.

What IS a problem: scraped or copied content created to manipulate rankings, which is addressed under the spam policies, not the (nonexistent) "duplicate content penalty."

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Google: Spam Policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies)
- [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/)

## E-E-A-T Is Not a Direct Ranking Factor

Google states that E-E-A-T (Experience, Expertise, Authoritativeness, Trust) is NOT itself a ranking factor. There is no E-E-A-T score Google computes and applies.

E-E-A-T comes from the Search Quality Rater Guidelines, which human raters use to evaluate whether Google's ranking systems are working, not as a live signal feeding rankings. Google's systems aim to reward content that demonstrates these qualities, which is a different thing from measuring them directly.

How to use it in an audit: treat E-E-A-T as a quality lens for reviewing content (Does this show real experience? Is the author credible? Is the site trustworthy?), not as a checkbox or a metric to chase.

- [Google Search Blog: Raters, Quality, and E-E-A-T](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t)
- [Google: Creating Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

## URL Structure Facts

Descriptive, meaningful URLs help users understand a page before they click and can appear in the breadcrumb-style display in results. They are a usability win, not a strong ranking factor on their own, so don't over-engineer URLs for SEO.

Subdomains vs. subdirectories: Google treats them as essentially equivalent for ranking. Choose whichever fits the business, team, and hosting setup, not based on a believed SEO advantage.

Top-level domains: generic TLDs (.com, .org, .info, etc.) do not affect ranking. Country-code TLDs (ccTLDs like .de, .fr) signal that a site targets a particular country and are used as a geotargeting signal.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Google: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices)

## Deprecated / Retired Tooling

Google retired its standalone Mobile-Friendly Test tool and the Mobile Usability report in Search Console in December 2023. Auditors should not recommend or link to these dead tools.

Use current alternatives instead: Lighthouse (in Chrome DevTools or as CLI), Chrome DevTools device mode for emulating mobile viewports, and PageSpeed Insights, which reports mobile performance and real-world field data.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices)

## Timelines

Search changes take time to reflect. Google's guidance is that updates can take anywhere from a few hours to several months to show up in results, depending on the change and how Google recrawls and reprocesses the site.

Practical rule for audits: after making a change, generally wait a few weeks before judging its impact. Reacting to day-to-day fluctuation leads to false conclusions and unnecessary churn.

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)
- [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/)
