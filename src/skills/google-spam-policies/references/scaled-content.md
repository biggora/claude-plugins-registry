# Scaled content, doorways, thin affiliation and scraping: reasoning guide

Purpose: give the auditing model the reasoning tools for sites that generate many pages from data (programmatic SEO, aggregators, price comparison and marketplace sites built from merchant feeds, directory and location pages, AI-written article sites, affiliate catalogues). The policy catalogue is in `policies.md`, source-code patterns in `code-patterns.md`, the live-site procedure in `site-audit.md`. This file does not repeat them.

Snapshot date of Google's pages: 2026-11-25. Google may have changed them since. Labels used below: statements marked "(Google wording)" are paraphrased from the cited page; "(heuristic)" and "this skill's method" are not from Google.

Canonical URLs used:

- Spam policies for Google web search: https://developers.google.com/search/docs/essentials/spam-policies
- Manual actions report: https://support.google.com/webmasters/answer/9044175
- March 2024 core update and new spam policies (blog): https://developers.google.com/search/blog/2024/03/core-update-spam-policies
- Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Using generative AI content: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Ranking systems guide: https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Core updates: https://developers.google.com/search/docs/appearance/core-updates
- Control what you share with Google Search: https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
- Ecommerce site structure: https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure

## Contents

1. The four policies that judge pages made at scale
2. Scale and automation are not the violation
3. The added-value test
4. Signals that raise risk, signals that lower risk
5. Self-assessment questions from Google's helpful-content guidance
6. Generative AI content
7. Site-type notes
8. What an auditor must not conclude

## 1. The four policies that judge pages made at scale

Google's spam policy page states that "spam" means techniques used to deceive users or manipulate Search systems, and that policy-violating practices are detected by automated systems and, as needed, human review. Source: https://developers.google.com/search/docs/essentials/spam-policies

### Scaled content abuse

Definition (Google wording): many pages generated for the primary purpose of manipulating search rankings and not helping users. It typically involves large amounts of unoriginal content with little to no value to users, "no matter how it's created". The intent qualifier is "primary purpose", paired with "not helping users".

Examples Google lists:

- using generative AI or similar tools to generate many pages without adding value for users;
- scraping feeds, search results or other content to generate many pages, including through automated transformation such as synonymizing or translating, where little value is provided;
- stitching or combining content from different pages without adding value;
- creating multiple sites with the intent of hiding the scaled nature of the content;
- many pages whose content makes little sense to a reader but contains search keywords.

Instruction for hosts (Google wording): "If you're hosting such content on your site, exclude it from Search." Read this as Google's instruction, not as a recommendation of this skill. The trade-off is that excluded pages stop appearing in search results, with whatever traffic they brought; whether to exclude, rework or delete is the site owner's decision (see `enforcement-and-recovery.md`, recovery playbook).

The March 2024 blog adds that the policy builds on the earlier policy on automatically generated content and applies "whether automation or humans are involved", and that the long-standing position is that automation, including generative AI, is spam if the primary purpose is manipulating ranking.
Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://developers.google.com/search/blog/2024/03/core-update-spam-policies

### Doorway abuse

Definition (Google wording): sites or pages created to rank for specific, similar search queries, which lead users to intermediate pages that are less useful than the final destination. There is no explicit intent phrase in the definition; the defining feature is the role of the page as a funnel.

Examples Google lists:

- multiple websites with slight variations of URL and home page to maximize reach for a query;
- multiple domains or pages targeted at specific regions or cities that funnel users to one page;
- generating pages to funnel visitors into the actual usable or relevant part of a site;
- substantially similar pages that are closer to search results than to a clearly defined, browseable hierarchy.

Source: https://developers.google.com/search/docs/essentials/spam-policies

### Thin affiliation

Definition (Google wording): publishing content with product affiliate links where descriptions and reviews are copied directly from the original merchant, without original content or added value. Google also describes affiliate pages that are part of a program distributing the same content across a network of affiliates as potentially thin, often appearing as cookie-cutter sites or templates replicated within one site or across domains or languages. The qualifier is the absence of original content or added value; participation in an affiliate program alone is not the problem.
Source: https://developers.google.com/search/docs/essentials/spam-policies

### Scraping

Definition (Google wording): taking content from other sites, often by automated means, and hosting it "with the purpose of manipulating search rankings". Examples: republishing without original content or value, or even citing the source; copying and modifying only slightly (synonyms, automated techniques); reproducing content feeds from other sites without some type of unique benefit to the user; sites dedicated to embedding or compiling media from other sites without substantial added value.
Source: https://developers.google.com/search/docs/essentials/spam-policies

### What distinguishes them

| Policy | What is judged | Typical evidence | Intent wording in Google's text |
|---|---|---|---|
| Scaled content abuse | The body of generated pages as a set | Many pages, little original value, any production method | "primary purpose" of manipulating rankings |
| Doorway abuse | The role of a page in the site | Pages near-identical by query, funnelling to another page; search-like structure instead of hierarchy | none stated in the definition |
| Thin affiliation | Commercial content copied from the merchant | Affiliate links plus merchant-copied descriptions and reviews; network templates | absence of added value |
| Scraping | Where the content came from | Text, feeds or media taken from other sites | "with the purpose of manipulating search rankings" |

The table is this skill's summary of the four texts (method), not a Google table.

The four overlap and are not mutually exclusive. Google's own texts show this: scraping feeds appears both under scaled content abuse and, as feed reproduction, under scraping; and the Manual actions report groups thin affiliate pages, content from other sources and doorways under one manual action, "Thin content with little or no added value". An auditor should name every policy a pattern plausibly matches rather than force one label.
Source: https://support.google.com/webmasters/answer/9044175

Only the scaled content text says "no matter how it's created". For the other three, the sources do not use that phrase; do not attribute it to them.

## 2. Scale and automation are not the violation

What Google's texts accept:

- Generative AI can be useful for researching a topic and adding structure to original content. The violation named is generating many pages without adding value. Source: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Automation as such is not the test. The test in the scaled content text is primary purpose and value to users; the blog says the policy applies equally to human, automated and mixed production. Source: https://developers.google.com/search/blog/2024/03/core-update-spam-policies
- Affiliate participation is acceptable. Google names the added value of good affiliate pages: additional price information, original product reviews, rigorous testing and ratings, navigation of products or categories, and product comparisons. Source: https://developers.google.com/search/docs/essentials/spam-policies
- Reproducing feeds is a problem when it provides no unique benefit to the user; the wording implies a unique benefit changes the assessment. Source: https://developers.google.com/search/docs/essentials/spam-policies
- A browseable hierarchy is the counterpart of the doorway wording: Google contrasts doorway-like pages with "a clearly defined, browseable hierarchy". Source: https://developers.google.com/search/docs/essentials/spam-policies
- Ecommerce guidance asks sites to make products reachable through category and sub-category links, and says a sitemap or a Merchant Center feed can supply links a crawler would not otherwise find. This is crawling guidance, not a spam-policy statement. Source: https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure

What Google's texts do not accept as a cure:

- Citing the source. Scraping lists republishing "without ... even citing the original source", but the helpful-content page states, in its description of rater attributes, that attribution or credit does not replace the need for original effort. Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Synonymizing, translating or other transformation of scraped content (named under both scaled content abuse and scraping).

The same helpful-content page describes, in the context of what quality raters assess, generating pages from feeds or large volumes of generative text "without manual oversight or curation" as little to no effort. That page says rater guidelines are used to evaluate ranking systems and rater data is not used directly in ranking algorithms. Treat it as an indication of what Google considers low effort, not as a spam-policy test.
Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## 3. The added-value test

This is this skill's method, built on the wording of the four policies. It is not a Google checklist and no result of it is a Google determination.

### a. Group URLs by template

Collect URLs (sitemaps, crawl, source routes) and group by URL pattern and by the template or component that renders them, for example `/{category}/{brand}`, `/{city}/{service}`, `/offers/{id}`, `/search?q=`. One template normally yields one verdict. Record how many indexable URLs each template produces. Source code (`code-patterns.md`) tells you which routes share a template; the live site (`site-audit.md`) tells you which are indexable and linked.

### b. Sample pages per template

Per template, sample at least: the first pages (highest-linked, most complete data), middle pages, and long-tail pages (rare brand, small city, single-offer, empty or near-empty results). The long tail is where thin pages concentrate (heuristic). Sample size is the auditor's choice; ten pages per template is an arbitrary, adjustable starting point (heuristic). Always state the sample size in the report.

### c. Questions per sampled page, each answered with evidence

1. What on this page exists nowhere else: data, comparison, aggregation, tool, original text, original media? Quote or screenshot the element.
2. Could a visitor complete a task here that the source of the data does not let them complete (compare across sources, filter, calculate, see history)? Name the task.
3. What share of the visible main text is boilerplate shared with sibling pages? Compare two siblings after removing navigation and footer; report an approximate percentage. Google gives no threshold, so none is applied here (heuristic).
4. Is the page reachable through a browseable hierarchy (home, category, sub-category, page), or only through search-like URLs, sitemaps or parameters? (Doorway wording: closer to search results than a hierarchy.)
5. Does the page satisfy the query its title targets, or pass the visitor on to another page (doorway wording: intermediate pages less useful than the final destination)?
6. Is the text copied from a merchant, a feed or another site, and is the source named? Naming it is a transparency point, not added value.

### d. Roll up per template

Classify each template as:

- clear value: most sampled pages answer questions 1 and 2 with concrete evidence;
- mixed: value on some pages, thin on others (state which kind of page is which);
- thin: most sampled pages have nothing that exists elsewhere, or are mostly boilerplate, or funnel on.

Report counts (pages sampled, pages per class). "Most" is the auditor's judgment; any numeric cutoff is arbitrary and must be stated as such (heuristic).

### e. Site-level question

Compute the proportion of indexable URLs that sit in thin templates and in mixed templates, using the template URL counts from step a. Report the figures and the evidence, and name the policies the thin templates plausibly match. Do not convert the proportion into a pass or fail: Google publishes no proportion at which a site is judged (see section 8). Note also that Google's ranking systems use site-wide signals alongside page-level signals, and having some good signals does not guarantee all content ranks well.
Source: https://developers.google.com/search/docs/appearance/ranking-systems-guide

## 4. Signals that raise risk, signals that lower risk

### Signals that raise risk

Google wording:

- Large amounts of unoriginal content with little to no value, regardless of production method (scaled content abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Generative AI or similar tools used to generate many pages without added value (scaled content abuse; also gen-AI guidance). https://developers.google.com/search/docs/essentials/spam-policies
- Pages built by scraping feeds, search results or other content, including synonymizing or translating (scaled content abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Content stitched together from different pages without added value (scaled content abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Multiple sites created to hide the scaled nature of the content (scaled content abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Pages with keyword content that makes little sense to a reader (scaled content abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Pages or domains aimed at specific regions or cities that funnel users to one page; slight variations of URL and home page across sites (doorway abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Substantially similar pages closer to search results than to a clearly defined, browseable hierarchy (doorway abuse). https://developers.google.com/search/docs/essentials/spam-policies
- Product descriptions and reviews copied from the merchant, plus affiliate links (thin affiliation). https://developers.google.com/search/docs/essentials/spam-policies
- The same or similar content replicated within a site or across domains or languages, cookie-cutter templates (thin affiliation). https://developers.google.com/search/docs/essentials/spam-policies
- Reproducing feeds from other sites without a unique benefit; republishing without original content or value (scraping). https://developers.google.com/search/docs/essentials/spam-policies
- Content mass-produced, outsourced to many creators or spread across a network of sites so pages get little care; content mainly summarizing others; many topics produced in hope some perform; extensive automation across many topics; content leaving readers needing to search again (helpful-content self-assessment, which is not a spam policy). https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Changing page dates to look fresh without substantial change, or promising answers that do not exist (same page, same caveat). https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Heuristics (not Google wording):

- Near-identical pages that differ by one token (city, brand, keyword). (heuristic)
- Pages with a single listing or zero results indexable as landing pages. (heuristic)
- Titles and meta descriptions stamped from one pattern across thousands of URLs. (heuristic)
- Machine translation of the same thin content into several languages. (heuristic; related Google wording: replication across languages under thin affiliation)
- Internal-search result pages exposed as landing pages. (heuristic; nearest Google wording: doorway "closer to search results than ... browseable hierarchy")
- Text that reads as filler: restated headings, generic paragraphs not tied to the entity. (heuristic)
- Multiple domains serving the same content. (heuristic; nearest wording: doorway and scaled content examples on multiple sites)
- Page count growing far faster than the underlying data (new combinations of existing attributes, no new facts). (heuristic)

### Signals that lower risk

Google wording:

- Price information, original reviews, rigorous testing and ratings, navigation of products or categories, product comparisons on affiliate pages (thin affiliation). https://developers.google.com/search/docs/essentials/spam-policies
- A unique benefit when content from feeds is reproduced (scraping). https://developers.google.com/search/docs/essentials/spam-policies
- A clearly defined, browseable hierarchy (doorway wording, inverted). https://developers.google.com/search/docs/essentials/spam-policies
- Original information, reporting, research or analysis; substantial additional value over sources that are drawn on (helpful-content questions; not a spam policy). https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Clear authorship, sourcing, and background on the site, and a site with a primary purpose (same page). https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Disclosure of how automation or AI was used and why (same page and gen-AI guidance). https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Review of AI output for accuracy including metadata (gen-AI guidance). https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Interactive features such as calculators, tools or search functionality count among the "main content" the helpful-content page lists. https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Heuristics (not Google wording):

- Original data collected or computed by the site (price history, availability, specifications normalized across sources). (heuristic)
- A real comparison across several sources on one page, not one merchant's view. (heuristic; related Google wording: product comparisons)
- Editorial curation that decides what is listed and why. (heuristic)
- Tools that let the visitor do something the data source does not. (heuristic)
- A stable, browseable taxonomy with pages that are not created or removed by each data refresh. (heuristic)
- Clear ownership and contact details. (heuristic; related wording: "Who" questions)
- Source attribution. Useful for transparency, but Google's texts say it does not replace added value (see section 2). (heuristic as a lowering signal)

## 5. Self-assessment questions from Google's helpful-content guidance

Status: this page is guidance on helpful, reliable, people-first content. It is not a spam policy, and the sources do not present these questions as individual ranking factors. Google says its automated ranking systems are designed to prioritize helpful, reliable information created to benefit people, and its core ranking systems aim to reward helpful content. Use the questions as evidence prompts, not as scores.
Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

People-first questions that bear on scaled content (paraphrased):

- Is there an existing or intended audience that would find the content useful if they came directly to the site?
- Does the content show first-hand expertise or depth, for example from having used a product or visited a place?
- Does the site have a primary purpose or focus?
- Would a reader leave having learned enough to reach their goal, and feel the experience was satisfying?
- Does the content provide original information or analysis, or does it, when it draws on other sources, add substantial value instead of copying or rewriting them?
- Does it offer substantial value compared with other pages in the results?
- Is it mass-produced, outsourced to many creators or spread over a network of sites so that no page gets care?

Search engine-first warning signs (a yes to some or all is described as a reason to reassess): content primarily made to attract search visits; many topics produced in hope some perform; extensive automation across many topics; mainly summarizing others; writing about topics only because they trend; leaving readers needing to search again; targeting a word count in the belief Google prefers one (Google says it has no preferred word count); entering a niche without expertise only for traffic; promising an answer that does not exist; faking freshness through dates or churn.

Who, How, Why framing (paraphrased):

- Who: is it evident who created the content, are bylines present where expected, do they lead to author background? Google warns that fabricated creator profiles (invented names, AI-generated headshots, false credentials) are deception and make a page untrustworthy.
- How: when automation is used to substantially generate content, is that evident to visitors, is background given on how and why it was used? Product reviews gain trust when the number of products tested and test methods are explained with evidence.
- Why: is the primary reason for the content to help people who would find it useful when visiting directly? Google states that using automation, including AI generation, for the primary purpose of manipulating rankings violates its spam policies.

For the auditor: "Why" is the question the scaled content policy turns on (primary purpose). Evidence for it is indirect (template structure, page-to-data ratio, whether pages serve any visitor path other than search), so report it as consistent or inconsistent with the stated pattern, not as proven intent.

## 6. Generative AI content

What the gen-AI guidance says:

- Generative AI can be useful for researching a topic and adding structure to original content. Using it, or similar tools, to generate many pages without adding value for users may violate the scaled content abuse policy.
- Content on the site must meet Search Essentials and the spam policies regardless of tooling.
- Accuracy duty: generative models predict likely word sequences and do not retrieve facts, so output may contain inaccuracies. Google calls it critical to fact-check and review AI-generated content before publishing, and says the same review applies to metadata that can appear in Search: title elements, meta description elements, structured data and image alt text. For structured data, comply with the general guidelines and the specific feature policies, and validate the markup.
- Context for users: sharing how content was created helps readers; when content is generated automatically, consider adding background on how automation was used and image metadata, as makes sense for the audience.
- Merchant Center note: Google Merchant Center has its own policies for AI-generated content. AI-generated images must carry the IPTC DigitalSourceType TrainedAlgorithmicMedia metadata, and AI-generated product data such as titles and descriptions must be specified separately and labeled as AI-generated. This is Merchant Center policy, not a Search spam policy; check it only for sites that feed Merchant Center.
- Search Quality Rater Guidelines: Google points to section 4.6.5 (scaled content abuse) and section 4.6.6 (main content created with little to no effort, originality or added value). Google's caveat: these guidelines are not a guide to ranking first, they are used by raters to help evaluate ranking systems, and ratings do not directly influence ranking.

Source: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

Audit consequences:

- AI authorship is not itself the finding. The finding is many pages without added value, or unreviewed inaccuracy, or missing disclosure where a reader would reasonably wonder how the content was made.
- Check the generated metadata (titles, meta descriptions, JSON-LD, alt text) with the same rigor as body text; in programmatic sites these are often the least reviewed fields.

## 7. Site-type notes

Each note says: main policy risk, what Google's text accepts, what to look at first. Items marked (heuristic) are this skill's, not Google's.

### Price comparison and aggregators built on merchant feeds

- Main risk: scraping (feed reproduction without unique benefit) and scaled content abuse (feeds scraped into many pages); thin affiliation if outbound links are affiliate links and text is the merchant's.
- Google accepts: price information, navigation of products or categories and product comparisons as value; a unique benefit when feed content is reproduced. Sources: https://developers.google.com/search/docs/essentials/spam-policies
- Look first: whether a product page compares several merchants, or mirrors one merchant's title and description; the share of page text that equals the feed text; pages with a single offer or no offer left (heuristic); whether internal-search or filter combinations are indexable landing pages; whether category pages link down to the offer pages (browseable hierarchy).

### Affiliate catalogues

- Main risk: thin affiliation; scaled content abuse if text is generated.
- Google accepts: affiliate links on pages that carry original reviews, testing and ratings, price information, comparisons and navigation. Source: https://developers.google.com/search/docs/essentials/spam-policies
- Look first: whether descriptions equal the merchant's text; whether any testing, rating or first-hand evidence exists; whether the same text appears on sibling sites of the same affiliate network (Google names network-distributed content).

### Location or "service in city" pages

- Main risk: doorway abuse (pages for cities funnelling to one page); scaled content abuse if text is generated per city.
- Google's text: names region- and city-targeted pages or domains that funnel users to one page as doorway abuse. The sources fetched do not say how many location pages are acceptable or what makes a location page sufficiently different; do not invent a rule.
- Look first: whether each page carries facts specific to the place (real address, staff, local prices, availability, local reviews) or only a swapped place name (heuristic); whether the page is the destination or hands the visitor to a single central page; whether the location pages are reachable from a hierarchy.

### AI article sites

- Main risk: scaled content abuse; the helpful-content "Who, How, Why" questions apply.
- Google accepts: generative AI for research and structure, with accuracy review and context for readers. Source: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Look first: topic breadth versus any evidence of expertise; fabricated author profiles; unreviewed factual claims and metadata; articles promising answers that do not exist; whether publication volume follows a pipeline with no editorial step visible (heuristic); disclosure of automation.

### Marketplaces with user listings

- Main risk: user-generated spam (spammy content added through a channel for user content); scaled content or doorway issues in the pages the platform itself generates from listings or searches.
- Google's text: user-generated spam covers spammy posts, accounts, comments and uploaded files, and site owners are often unaware of it. The helpful-content and control-what-you-share pages say low-quality user content can be kept out of Search and that indexing it may hurt the site's ranking; the Manual actions report has separate actions for user-generated spam and for sites abused with third-party spam (the latter notes it affects only the pages with the spammy content, though too much may affect overall assessment). Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://developers.google.com/search/docs/crawling-indexing/control-what-you-share ; https://support.google.com/webmasters/answer/9044175
- Look first: moderation and reporting paths; duplicated or expired listings with indexable pages; auto-generated search or tag pages with a few or no listings (heuristic); commercial usernames and off-topic links in profiles.

### Multi-language copies

- Main risk: thin affiliation wording explicitly covers replication of the same content across languages; scaled content abuse covers automated translation of scraped content where little value is provided.
- Google's text: the sources fetched do not state that translation per se is acceptable or unacceptable, and say nothing here about hreflang; do not infer either. The helpful-content page gives manual translation of a poem as an example of high effort in its description of rater attributes.
- Look first: whether each language version localizes data (currency, merchants, availability, local products) or is the same thin text machine-translated (heuristic); whether language versions of thin templates multiply the number of thin URLs; same content across several domains.

## 8. What an auditor must not conclude

- That templated pages are spam by definition. Templates are how every large site works; the question is what each page adds (section 3). Google's texts accept affiliate and feed-based pages that add value.
- That a competitor being indexed or ranking proves a pattern is compliant. What Google says: it detects policy-violating practices through automated systems and, as needed, human review, and its policies cover common spam practices but it may act against any type of spam it detects. Source: https://developers.google.com/search/docs/essentials/spam-policies . Inference (not Google's wording): another site being indexed therefore shows nothing about whether the same pattern is compliant, and the auditor cannot see what else differs between the sites (age, links, brand demand, content).
- That AI authorship alone is a violation, or that human authorship alone is a defence. The scaled content policy applies "no matter how it's created".
- That a page-count or proportion threshold exists. None of the fetched sources states one; any threshold in an audit report is the auditor's arbitrary working figure and must be labeled so.
- That a word-count target helps or hurts. Google says it has no preferred word count. Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- That a traffic drop on a programmatic site was caused by a particular policy. Without a named manual action the cause is not confirmed (see `enforcement-and-recovery.md`).
- That `noindex` or deletion is the default fix. Google names exclusion from Search for hosted scaled content, and its core update page calls deleting content a last resort for content that cannot be salvaged; both remove pages from Search. Present them as options with that cost. Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://developers.google.com/search/docs/appearance/core-updates
- That a third-party "authority" or "spam" score reflects Google's signals. Google's March 2024 post says such third-party scores do not correspond to any Google signal. Source: https://developers.google.com/search/blog/2024/03/core-update-spam-policies
