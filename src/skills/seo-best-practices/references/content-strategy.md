# Content Strategy: On-Page & Content SEO Reference

Deep-dive companion to the SEO Audit skill. The main SKILL.md carries brief checklists; this file holds the detail on search intent, keyword mapping, content depth, freshness, topic clusters, SERP features, and semantic SEO. Each section explains what it is, why it matters, gives an audit checklist, and cites sources.

---

## Contents
- [Search Intent Classification](#search-intent-classification)
- [Keyword Clustering & Mapping](#keyword-clustering--mapping)
- [Content Depth & Competitive Benchmarking](#content-depth--competitive-benchmarking)
- [Content Freshness & Refresh](#content-freshness--refresh)
- [Topic Clusters & Topical Authority](#topic-clusters--topical-authority)
- [SERP Features & Rich Results](#serp-features--rich-results)
- [Semantic SEO & Entities](#semantic-seo--entities)

---

## Search Intent Classification

**What it is.** Every query carries an intent — the reason behind the search. The four standard types are *Informational* (learn something: "how does hreflang work"), *Navigational* (reach a specific site or brand: "search console login"), *Commercial investigation* (compare before buying: "best project management software"), and *Transactional* (act/buy now: "buy standing desk"). Shopify frames the consumer-facing version of this as learn / buy / navigate.

**Why it matters.** Google ranks the page format that satisfies the intent, not the page that mentions the keyword most. Publish a product page for an informational query and it will not rank, no matter how optimized — you answered the wrong question.

**Read intent from the SERP, not from the keyword.** The pages currently ranking tell you what Google believes the intent is. Run the query and note the dominant format: guides and listicles signal informational; comparison and "best X" roundups signal commercial; product, category, and pricing pages signal transactional. If the SERP is split, the intent is mixed and you may need more than one page type.

**Match format to intent.** Informational → guide, tutorial, explainer, FAQ. Commercial → comparison, "best of" roundup, review, alternatives page. Transactional → product, category, pricing, or landing page. Navigational → make your own brand pages clean and indexable.

**One primary page per intent.** Assign a single page to own each intent/keyword cluster. Two pages chasing the same intent compete with each other (cannibalization), splitting links and confusing Google about which to rank.

**Audit checklist:**
- [ ] For each target keyword, run the query and record the dominant format of the top 5–10 results.
- [ ] Confirm the page's format matches that format (guide vs comparison vs product). Flag mismatches.
- [ ] Verify each intent maps to exactly one primary page — no two pages targeting the same intent.
- [ ] Check that the page's title and H1 reflect the intent (e.g., "how to" for informational, "best" for commercial).
- [ ] Flag pages targeting an intent the SERP shows Google does not reward for that query.

**Sources:** [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)

---

## Keyword Clustering & Mapping

**What it is.** Keyword clustering groups semantically related queries — synonyms, long-tail variants, and question forms ("what is X", "X vs Y", "how to X") — that share one underlying intent into a single cluster. A keyword map assigns one target page to each cluster and records the intent.

**Why it matters.** Users phrase the same need dozens of ways. One well-built page can rank for an entire cluster of related terms. Mapping prevents two failures: gaps (real demand with no page to capture it) and cannibalization (several thin pages fighting over one cluster).

**Build the map.** Create a table: cluster → primary keyword → secondary/long-tail variants → intent → target URL → status. The intent column is mandatory; it is what stops you from merging queries that look similar but want different page types.

**Spot gaps.** A cluster with search demand but no assigned URL is a content gap — plan a page. Use Search Console query data to find queries you already get impressions for but rank poorly on; those are gaps where you have partial relevance and room to grow.

**Spot cannibalization.** Multiple URLs mapped to the same cluster and intent compete with each other. Consolidate them into the strongest page and 301-redirect the others, or differentiate them onto genuinely distinct intents.

**Research tools (neutral).** Google Keyword Planner gives volume ranges for free. Google Search Console shows the queries you already rank for and their position — your most reliable, first-party demand data. Ahrefs and Semrush are paid tools that surface competitor keywords and cluster suggestions. Any of these works; the method matters more than the vendor.

**Audit checklist:**
- [ ] Confirm a keyword map exists with an intent column and a target URL per cluster.
- [ ] Pull Search Console queries; find ones with impressions but no dedicated, well-ranked page (gaps).
- [ ] Search `site:yourdomain.com keyword` to find multiple pages targeting one cluster (cannibalization).
- [ ] For each cannibalization case, choose a canonical page and redirect or differentiate the rest.
- [ ] Verify long-tail and question variants are folded into a parent cluster, not given thin standalone pages.

**Sources:** [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)

---

## Content Depth & Competitive Benchmarking

**What it is.** Benchmarking compares your page against the pages currently ranking for the target query to find what they cover that you do not — and where you can add something they lack.

**Why it matters.** The ranking pages are a working sample of what satisfies the query today. Matching their coverage gets you into contention; adding a unique angle is what earns the ranking.

**Benchmark these dimensions:** subtopics and questions covered, content format (guide / comparison / tool), media (images, video, diagrams, original screenshots), freshness (last updated), author signals (named expert, credentials), and structured data present. List the gaps between the top pages and yours.

**Add a unique angle.** Comprehensiveness gets you parity; differentiation wins. Add original data, first-hand testing, a proprietary framework, expert commentary, or an underserved subtopic. Do not merely re-summarize what already ranks.

> **IMPORTANT — separate fact from folklore.** There is **no word-count ranking rule**. Google does not reward pages for hitting a length, and "longer ranks better" is a correlation, not a rule. Google's own guidance is to write naturally and helpfully, not to a target length. "Comprehensive" means *fully answering the intent* — covering the subtopics a searcher needs — which sometimes takes 400 words and sometimes 4,000. Pad a page to hit a number and you create thin, padded content that the Helpful Content guidance penalizes.

**Optimize before publishing.** Do the gap analysis and add the unique angle *before* the page goes live. Shipping a thin draft "to iterate later" adds a low-quality URL to your site that can drag site-wide quality (see Freshness and Helpful Content below). Publish complete, not minimal.

**Audit checklist:**
- [ ] List the subtopics/questions covered by the top 3–5 ranking pages; mark which your page is missing.
- [ ] Compare media richness (original images, video, diagrams) against the top pages.
- [ ] Identify one unique angle your page adds (original data, testing, expert input) — flag pages that have none.
- [ ] Confirm the page fully answers the intent rather than padding to a word count.
- [ ] Reject "minimum word count" as a goal; judge completeness by intent coverage, not length.
- [ ] Verify thin/incomplete pages are improved before publishing, not shipped to "fix later."

**Sources:** [Shopify: SEO Best Practices](https://www.shopify.com/blog/seo-best-practices) · [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en) · [Google: Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

---

## Content Freshness & Refresh

**What it is.** A refresh audit finds content that has decayed — gone stale, inaccurate, or outdated — and prioritizes it for updating instead of leaving it to rot or rewriting everything.

**Why it matters.** Rankings and traffic erode as content ages: stats go out of date, products change, links break, and competitors publish fresher pages. Refreshing existing pages with earned authority is usually cheaper and faster than building new ones.

**Audit for decay signals:** a visible and structured last-updated date; outdated statistics, examples, prices, or screenshots; broken outbound and internal links; sources that have been superseded; and advice that no longer reflects current tools or guidance.

**Prioritize by value and volatility.** Refresh high-traffic and high-conversion pages first — that is where decay costs the most. Cadence by topic volatility: fast-moving topics (pricing, tools, "best of [year]", platform changes) need roughly quarterly review; stable evergreen topics can be reviewed annually. Do not refresh on a blanket schedule regardless of value.

**Tie to Helpful Content.** Google's helpful-content guidance treats quality as partly site-wide: a large mass of thin or stale pages can hold back the whole site, not just those URLs. Refreshing or pruning decayed content protects the rankings of your healthy pages. Note that re-saving a page with no real change does not "freshen" it — update the substance, then the date.

**Refresh checklist:**
- [ ] Confirm each evergreen page shows a real last-updated date (visible and in structured data) — not a fake auto-bumped one.
- [ ] Scan for outdated stats, examples, prices, and screenshots; replace with current ones.
- [ ] Run a broken-link check on internal and outbound links; fix or remove dead links.
- [ ] Replace superseded sources and outdated guidance with current references.
- [ ] Rank refresh candidates by traffic/conversion value, then by topic volatility.
- [ ] Set cadence: volatile topics ~quarterly, evergreen ~annually.
- [ ] Identify thin/stale pages to improve, consolidate, or prune to protect site-wide quality.

**Sources:** [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [Google: Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)

---

## Topic Clusters & Topical Authority

**What it is.** The hub-and-spoke (pillar–cluster) model: one broad *pillar* page covers a topic at a high level and links out to several *cluster* (spoke) pages that each cover a subtopic in depth; each spoke links back to the pillar. SEOBoost calls this structure silos; the mechanics are the same.

**Why it matters.** Tight internal linking around a topic signals depth and expertise on that topic to Google, helps it understand which page owns the broad term, and spreads ranking signals across related pages. It also gives users a clear path between related answers.

**Linking rules.** Link reciprocally: pillar → each spoke and each spoke → pillar. Link related spokes to each other where it genuinely helps the reader. Use *descriptive anchor text* that names the destination topic — never "click here" or "read more" — so both users and crawlers know what the link is about. Place links contextually inside the body copy where the topic is discussed, not only in a footer or sidebar block. Fix orphan pages — any page with no internal links pointing to it is hard for Google to discover and rank.

> **Grounded note.** There is no required anchor-text distribution percentage to hit. Write anchors that describe the destination naturally; do not engineer ratios.

**Pillar/spoke example:**

```
            [ PILLAR: "Technical SEO" ]
             /        |          \
            v         v           v
   [ Crawl Budget ] [ Hreflang ] [ Core Web Vitals ]
            ^         ^           ^
             \        |          /
              (each spoke links back to the pillar,
               and to related spokes where relevant)
```

**Audit checklist:**
- [ ] Confirm each topic has one pillar page and identified cluster/spoke pages.
- [ ] Verify pillar links to every spoke and every spoke links back to the pillar.
- [ ] Check related spokes interlink where it helps the reader.
- [ ] Replace generic anchors ("click here", "read more") with descriptive, topic-naming anchors.
- [ ] Confirm internal links sit in body content, not only in footers/sidebars.
- [ ] Find orphan pages (no inbound internal links) and link them into the relevant cluster.

**Sources:** [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)

---

## SERP Features & Rich Results

**What it is.** SERP features are the enriched result types Google shows beyond the standard blue link: *featured snippets* (an answer block pulled to the top), *People Also Ask* (expandable related questions), and *rich results* (results enhanced with structured-data elements like star ratings, FAQs, prices). This section audits *eligibility and opportunity*; the actual schema markup belongs to the separate `schema` skill.

**Why it matters.** These features take prominent SERP real estate and can earn clicks above the #1 organic link. Structuring content to be snippet- and rich-result-eligible captures visibility you would otherwise miss.

**Win featured snippets.** Provide a concise, self-contained answer near the top of the relevant section — roughly 40–60 words for paragraph snippets. Use an *ordered list* for step-by-step processes and a *table* for comparisons or specs, because Google lifts those formats directly into list and table snippets. Answer the question plainly before elaborating.

**Mine People Also Ask.** The PAA questions for your target query are a free list of related sub-questions real users ask. Cover them as H2/H3 sections or an FAQ block to expand topical coverage and qualify for those slots.

**Rich results need structured data.** Eligibility for rich results (FAQ, Product, Review, Article, and others) comes from valid structured data on the page. This skill audits *whether the opportunity exists and whether the page qualifies*; implementing the markup is the `schema` skill's job. Validate eligibility with the [Google Rich Results Test](https://search.google.com/test/rich-results), which renders JavaScript and reports which rich-result types the page is eligible for. Note that eligibility does not guarantee Google displays the feature.

**Audit checklist:**
- [ ] For target queries, check whether a featured snippet exists and what format it uses (paragraph / list / table).
- [ ] Ensure a concise ~40–60 word answer sits near the top of the relevant section.
- [ ] Use ordered lists for steps and tables for comparisons to match snippet formats.
- [ ] Pull the PAA questions for the query; confirm the page covers them.
- [ ] Run the page through the Rich Results Test; record which rich-result types it is eligible for.
- [ ] Flag rich-result opportunities (FAQ, Product, Review, Article) and hand schema implementation to the `schema` skill.

**Sources:** [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [Google: Search Gallery (structured data)](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) · [Google: Rich Results Test](https://search.google.com/test/rich-results) · [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=en)

---

## Semantic SEO & Entities

**What it is.** Semantic SEO means optimizing for the *topic and its entities*, not just exact keyword strings. An entity is a distinct, identifiable thing — a person, organization, product, place, or concept. The page should have a clear main entity and cover the related concepts and attributes that a genuinely knowledgeable page on that topic would address.

**Why it matters.** Google's NLP reads pages to understand topics and entities, not only keywords. Covering the related concepts and attributes a topic implies helps Google confirm the page genuinely covers the subject. Naming and disambiguating your entity (which "Apple", which "John Smith") helps Google connect the page to the right thing.

**Cover the topic, don't chase magic.** Define the main entity clearly early on. Address the sub-concepts and attributes a knowledgeable writer naturally would — for a "running shoes" page, that means cushioning, drop, terrain, sizing, and durability. Use consistent naming for the entity throughout rather than scattering synonyms that obscure what the page is about. This is "cover the topic thoroughly and name your entity clearly," not a trick that bypasses quality.

**Disambiguate with schema.** Organization, Person, and Author markup with a `sameAs` property (linking to authoritative profiles like Wikipedia, LinkedIn, or official social accounts) helps Google match your entity to the correct real-world thing. As with rich results, the *implementation* of this markup is the `schema` skill's responsibility; here you audit whether the entity is clearly defined and disambiguation signals exist.

**Overlap notes.** Clear entities and consistent author/organization signals reinforce E-E-A-T (experience, expertise, authoritativeness, trust) — the two work together. AI-search-specific tactics (how generative engines cite sources) live in the `ai-seo` skill, not here.

**Audit checklist:**
- [ ] Confirm each page has one clearly defined main entity, named early and consistently.
- [ ] Check that the page covers the related concepts/attributes a knowledgeable page would include.
- [ ] Verify entity naming is consistent (not scattered synonyms that blur the topic).
- [ ] Confirm Organization/Person/Author identity with `sameAs` exists for disambiguation (hand markup to the `schema` skill).
- [ ] Cross-check that entity and author signals support E-E-A-T.
- [ ] Frame entity work as thorough topic coverage and disambiguation, not a shortcut around content quality.

**Sources:** [SearchAtlas: SEO Best Practices](https://searchatlas.com/blog/seo-best-practices/) · [SEOBoost: SEO Best Practices](https://seoboost.com/blog/seo-best-practices/) · [Google: Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) · [Google: Search Gallery (structured data)](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
