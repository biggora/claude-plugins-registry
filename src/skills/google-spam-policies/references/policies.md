# Google Spam Policies: Policy Catalogue

The policy catalogue for the `google-spam-policies` skill. For each policy on Google's spam policies page it records what Google says the policy is, the examples Google lists, what Google explicitly says is not a violation, and the matching manual action in Search Console. Read it to decide whether a page or code path breaks a policy, and to avoid flagging things Google calls legitimate.

- Snapshot date: 2026-11-25.
- Canonical page: https://developers.google.com/search/docs/essentials/spam-policies
- Google changes these pages. Before quoting policy wording in a report, re-fetch the live page and check the name and text still match.
- Statements here paraphrase Google. Where this file adds nothing beyond Google's text, it says "Google lists none" rather than filling the gap.
- Related files: `scaled-content.md` (scaled content, doorways, thin affiliation, scraping), `enforcement-and-recovery.md` (manual vs algorithmic, recovery), `code-patterns.md` (source-code patterns), `site-audit.md` (live-site procedure).

## Contents

- [How Google frames spam](#how-google-frames-spam)
- [Cloaking](#cloaking)
- [Doorway abuse](#doorway-abuse)
- [Expired domain abuse](#expired-domain-abuse)
- [Hacked content](#hacked-content)
- [Hidden text and link abuse](#hidden-text-and-link-abuse)
- [Keyword stuffing](#keyword-stuffing)
- [Link spam](#link-spam)
- [Machine-generated traffic](#machine-generated-traffic)
- [Malicious practices](#malicious-practices)
- [Misleading functionality](#misleading-functionality)
- [Scaled content abuse](#scaled-content-abuse)
- [Scraping](#scraping)
- [Site reputation policy](#site-reputation-policy)
- [Sneaky redirects](#sneaky-redirects)
- [Thin affiliation](#thin-affiliation)
- [User-generated spam](#user-generated-spam)
- [Other practices that can lead to demotion or removal](#other-practices-that-can-lead-to-demotion-or-removal)
  - [Legal removals](#legal-removals)
  - [Personal information removals](#personal-information-removals)
  - [Policy circumvention](#policy-circumvention)
  - [Scam and fraud](#scam-and-fraud)
- [Link qualification quick reference](#link-qualification-quick-reference)

Manual action names below come from the Manual actions report help page: https://support.google.com/webmasters/answer/9044175

---

## How Google frames spam

- **Definition of spam.** Techniques used to deceive users or to manipulate Search systems into featuring content prominently. This includes trying to get content ranked highly and trying to manipulate generative AI responses in Google Search.
- **Scope.** Content (web pages, images, videos, news content, other material Google finds on the web) must not violate Google Search's overall policies or the spam policies to be eligible for web search results. The policies apply to all web search results, including those from Google's own properties.
- **Detection.** Automated systems, plus human review where needed. Human review can end in a manual action.
- **Consequence.** A violating site may rank lower or not appear in results at all.
- **Unlisted practices.** The policies cover common spam practices, but Google may act against any type of spam it detects. A practice absent from the lists below is not thereby safe.
- **Reporting.** Anyone can file a search quality user report; Google uses reports to improve automated detection rather than to act on each one.

Intent qualifiers carry most verdicts. Policies are worded with "intent to manipulate", "primary purpose", "solely to manipulate", "mainly because of". An auditor should record the evidence for intent or purpose, not only the presence of a technique.

---

## Cloaking

**Definition.** Presenting different content to users and to search engines with the intent to manipulate search rankings and mislead users.

**Google's examples**
- Showing search engines a page about travel destinations while users see a page about discount drugs.
- Inserting text or keywords into a page only when the requesting user agent is a search engine and not a human visitor.
- Hacked sites often use cloaking to make the hack harder for the owner to notice.

**Not a violation**
- A paywall or content-gating mechanism, provided Google can see the full content behind the wall exactly as a person with access would, and the site follows Google's Flexible Sampling guidance.
- Making JavaScript- or image-based content accessible to search engines and users without cloaking (Google points to its own recommendations for this).
- Dynamic rendering that produces similar content (from the dynamic rendering page, not the spam policies page). Google now describes dynamic rendering as a workaround, not a long-term solution, and recommends server-side rendering, static rendering or hydration. Serving completely different content to crawlers and users, for example cats to users and dogs to crawlers, can be cloaking. Error pages produced while setting it up are not treated as cloaking.
- Paywalled content should be enclosed in structured data so Google can tell it from cloaking (flexible sampling page and the manual actions page).

**Matching manual action.** "Cloaking and/or sneaky redirects" (shared with sneaky redirects), and a separate "Cloaked images" entry for images.
- Use URL Inspection to fetch affected pages and compare what Google sees with what a human sees.
- Find and remove the server-side code that serves different content to Google and to users.
- Check for URLs that redirect users unexpectedly or conditionally (for example only users arriving from Google, or only certain IP ranges); such code is often in JavaScript or `.htaccess`, and also check the CMS and plugins.
- Request review once fixed.
- "Cloaked images": show the same images to users and in search results. Examples Google gives are images obscured by other content and images that differ from what a visitor gets. Opting out of image-search inline linking (answering Google-referred image requests with HTTP 200 or 204 and no content) is not image cloaking.

**Related Google docs**
- https://developers.google.com/search/docs/appearance/flexible-sampling
- https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/google-images

---

## Doorway abuse

**Definition.** Sites or pages created to rank for specific, similar search queries and that lead users to intermediate pages that are less useful than the final destination.

**Google's examples**
- Multiple websites with slight variations of URL and home page to maximise reach for a given query.
- Multiple domain names or pages targeted at specific regions or cities that funnel users to one page.
- Pages generated to funnel visitors into the actually usable or relevant part of a site.
- Substantially similar pages that are closer to search results than to a clearly defined, browsable hierarchy.

**Not a violation**
Google lists none. Its wording contrasts doorways with a "clearly defined, browseable hierarchy", which implies that a real navigable hierarchy is the legitimate form; treat that as an inference, not a stated exemption.

**Matching manual action.** "Thin content with little or no added value" (names doorways, thin affiliate pages and content from other sources as examples).
- Check the site for doorway pages, thin affiliate pages and duplicated content.
- Judge whether the site gives users significant added value.
- Improve the site so it does; fix all affected pages, not a subset.
- Request review with examples of bad content removed and good content added.

**Related Google docs**
- https://developers.google.com/search/docs/crawling-indexing/301-redirects
- https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure

Deep dive: `scaled-content.md`.

---

## Expired domain abuse

**Definition.** Buying an expired domain name and repurposing it primarily to manipulate search rankings by hosting content that gives users little to no value.

**Google's examples** (illustrative, not exhaustive)
- Affiliate content on a site previously used by a government agency.
- Commercial medical products sold on a site previously used by a non-profit medical charity.
- Casino content on a former elementary school site.

**Not a violation**
Google lists none. The qualifiers are "primarily to manipulate" and "little to no value to users"; a repurposed domain that gives users real value is not described as abusive, but Google does not spell out that case.

**Matching manual action.** No dedicated manual action entry in the report. The "Major spam problems" entry covers sites using aggressive techniques or repeated or egregious violations generally.
- Update the site so it no longer violates the spam policies.
- Request review with examples of bad content removed and good content added.

A buyer of a previously violating site should say in the reconsideration request that the site was recently acquired and now complies (Manual actions page, "But I just bought this site!").

**Related Google docs**
- https://support.google.com/webmasters/answer/9044175

---

## Hacked content

**Definition.** Any content placed on a site without permission, through security vulnerabilities. It gives users poor results and can install malicious content on their machines.

**Google's examples**
- Code injection: malicious code, often JavaScript injected directly or into iframes, added to existing pages.
- Page injection: new spammy or malicious pages added to the site, often for search manipulation or phishing. Existing pages may look clean.
- Content injection: subtle changes to existing pages so search engines see content the owner and users may not, such as hidden links or hidden text via CSS or HTML, or cloaking.
- Redirects: injected code sends some users to harmful or spammy pages, sometimes depending on referrer, user agent or device. For example, a click from Google results redirects, while visiting the URL directly does not.

**Not a violation**
Google lists none.

**Matching manual action.** No dedicated manual action entry in the report. Hacking is surfaced in the Security Issues report, which the help page distinguishes from the Manual actions report: the Security Issues report lists signs that the site was hacked or behaviour that could harm visitors (phishing, malware, unwanted software), and those pages can carry a warning label in results or a browser interstitial. Hacked-site symptoms also appear in other entries (for example sneaky mobile redirects added by hackers).

**Related Google docs**
- https://developers.google.com/search/docs/monitor-debug/security/malware
- https://developers.google.com/search/docs/monitor-debug/prevent-abuse
- https://web.dev/articles/hacked (linked from the spam policies page; not listed in the source map)

---

## Hidden text and link abuse

**Definition.** Placing content on a page solely to manipulate search engines and in a way that human visitors cannot easily view.

**Google's examples**
- White text on a white background.
- Text hidden behind an image.
- Text positioned off-screen with CSS.
- Font size or opacity set to 0.
- A link hidden by attaching it to one small character, such as a hyphen inside a paragraph.

**Not a violation**
Show/hide design elements that improve user experience:
- Accordion or tabbed content that toggles between hiding and showing additional content.
- A slideshow or slider that cycles between images or text paragraphs.
- Tooltips or similar text that displays extra content when users interact with an element.
- Text available only to screen readers and intended to improve the screen-reader experience.

The qualifier is "solely to manipulate search engines". Content a user can reach by normal interaction is outside the policy.

**Matching manual action.** "Hidden text and/or keyword stuffing" (shared with keyword stuffing).
- Use URL Inspection to find content visible to the crawler but not to a human visitor.
- Look for text the same or a similar colour as the background; selecting all text on the page often reveals it.
- Look for text hidden by CSS styling or positioning.
- Remove or restyle hidden text so it is equally discoverable by crawlers and humans.
- Request review once fixed.

**Related Google docs**
- https://developers.google.com/search/docs/monitor-debug/security/malware (hidden links and text as hack symptoms are covered under Hacked content)
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

---

## Keyword stuffing

**Definition.** Filling a page with keywords or numbers in an attempt to manipulate rankings. The keywords often appear in a list or group, unnaturally, or out of context.

**Google's examples**
- Lists of phone numbers without substantial added value.
- Blocks of text listing the cities and regions a page is trying to rank for.
- Repeating the same words or phrases so often that the text sounds unnatural. Google's sample repeats "unlimited app store credit" several times in four sentences.

**Not a violation**
Google lists none.

**Matching manual action.** "Hidden text and/or keyword stuffing".
- Check for lists or paragraphs of repeated words without context.
- Check `<title>` tags and image alt text for strings of repeated words.
- Remove the repeated words and any other keyword stuffing.
- Request review once fixed.

**Related Google docs**
- https://developers.google.com/search/docs/essentials/spam-policies

---

## Link spam

**Definition.** Creating links to or from a site primarily to manipulate search rankings.

**Google's examples**
- Buying or selling links for ranking purposes: money for links or for posts containing links; goods or services for links; sending someone a product in exchange for a post that includes a link.
- Excessive link exchanges ("link to me and I'll link to you") or partner pages that exist only for cross-linking.
- Using automated programs or services to create links to your site.
- Requiring a link as part of terms of service, a contract or similar arrangement without letting the third-party content owner choose to qualify the outbound link.
- Text ads or text links that do not block ranking credit.
- Advertorials or native advertising where payment is received for articles with links that pass ranking credit, or articles, guest posts or press releases distributed on other sites with optimised anchor text.
- Low-quality directory or bookmark site links.
- Keyword-rich, hidden or low-quality links embedded in widgets distributed across sites.
- Widely distributed links in the footers or templates of many sites.
- Forum comments with optimised links in the post or signature.
- Low-value content created primarily to manipulate linking and ranking signals.

**Not a violation**
- Buying and selling links for advertising and sponsorship is a normal part of the web economy and is not a violation, as long as the links are qualified with `rel="nofollow"` or `rel="sponsored"` on the `<a>` tag. See [Link qualification quick reference](#link-qualification-quick-reference).

**Matching manual action.** Two entries.
- "Unnatural links to your site": download links from Search Console, review them against the link spam policy, ask site owners to remove the links or stop them passing PageRank (for example with `rel="nofollow"` or a more specific attribute), and disavow only links that could not be removed. Google says a good-faith removal attempt is expected and that disavowing everything blindly can get the request rejected. Do not disavow organic links.
- "Unnatural links from your site": find paid links or links that look like violations (such as excessive link exchanges); remove them or stop them passing PageRank with `rel="nofollow"` or a more specific attribute, or by redirecting through a page blocked by robots.txt; then request review.

**Related Google docs**
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
- https://developers.google.com/search/docs/monitor-debug/prevent-abuse

---

## Machine-generated traffic

**Definition.** Sending automated queries to Google. This includes scraping results for rank-checking and other automated access to Google Search done without express permission. It consumes resources and interferes with serving users, and violates both the spam policies and the Google Terms of Service.

**Google's examples**
- Scraping Google results for rank-checking purposes.
- Other automated access to Google Search conducted without express permission.

**Not a violation**
Google lists none. Access with express permission is the only carve-out the wording implies.

**Matching manual action.** No dedicated manual action entry in the report.

This policy concerns automated queries sent to Google. It does not concern crawlers visiting the audited site, and it is not the same as the Scraping policy.

**Related Google docs**
- https://policies.google.com/terms (linked from the spam policies page; not listed in the source map)

---

## Malicious practices

**Definition.** Practices that create a mismatch between what users expect and what actually happens, causing a negative and deceptive experience or compromising user security or privacy.

**Google's examples**
- Malware: software or a mobile app specifically designed to harm a computer, device, the software it runs, or its users, including installing software without consent or installing viruses. Site owners may host such binaries inadvertently.
- Unwanted software: an executable or mobile app whose behaviour is deceptive, unexpected, or harms the browsing or computing experience. Examples are software that changes the home page or browser settings against the user's wishes, and apps that leak private information without proper disclosure. Owners should follow Google's Unwanted Software Policy.
- Back button hijacking: a site interferes with browser navigation by manipulating history or other functionality so the user cannot use the back button to return immediately to the page they came from.

**Not a violation** (from the back button hijacking FAQ)
- Working with advertising platforms and importing code they host is allowed. Google acts only on pages that exhibit back button hijacking behaviour, which also means third-party ad code that causes it does not excuse the page.
- App navigation and "open in app" behaviours are outside the policy's scope.

Scope notes from the same FAQ, not exemptions:
- The policy applies in Google Discover, which is part of Google Search.
- It applies when the user reaches the site from a non-Search channel such as social media, if the hijacking happens while browsing within a browser.
- Users can report such behaviour through the spam report.

**Matching manual action.** "Back button hijacking" covers that practice. Malware and unwanted software have no entry in the Manual actions report; they surface in the Security Issues report.
- Disable or remove any code or imports responsible for back button hijacking.
- Request review once sure the site no longer violates the policy.
- Repeated violations may bring further manual actions and affect overall ranking.

**Related Google docs**
- https://developers.google.com/search/docs/monitor-debug/security/malware
- https://www.google.com/about/company/unwanted-software-policy.html (linked from the spam policies page; not listed in the source map)

---

## Misleading functionality

**Definition.** Intentionally creating sites that trick users into thinking they can access some content or service when they cannot.

**Google's examples**
- A site with a fake generator that claims to provide app store credit but does not.
- A site that claims functionality (for example PDF merge, countdown timer, online dictionary) but intentionally sends users to deceptive ads instead of providing it.

**Not a violation**
Google lists none. The qualifier is "intentionally": the examples are sites built to deceive.

**Matching manual action.** No dedicated manual action entry in the report.

**Related Google docs**
- https://developers.google.com/search/docs/essentials/spam-policies

---

## Scaled content abuse

**Definition.** Generating many pages for the primary purpose of manipulating search rankings and not helping users. Typically this means large amounts of unoriginal content that gives users little to no value, "no matter how it's created", so the method (AI, templates, humans) does not decide the verdict.

**Google's examples** (not exhaustive)
- Using generative AI tools or similar tools to generate many pages without adding value for users.
- Scraping feeds, search results or other content to generate many pages, including through automated transformations such as synonymising, translating or other obfuscation, where little value is provided.
- Stitching or combining content from different web pages without adding value.
- Creating multiple sites with the intent of hiding the scaled nature of the content.
- Creating many pages whose content makes little or no sense to a reader but contains search keywords.

Google's remedy line: if you host such content on your site, exclude it from Search.

**Not a violation**
Google lists none on the spam policies page. The definition is bounded by "primary purpose" and "without adding value"; large page counts alone are not stated to be a violation.

**Matching manual action.** No dedicated manual action entry in the report. "Major spam problems" names scaled content abuse among aggressive techniques, together with cloaking and other repeated or egregious violations.
- Update the site so it no longer violates the spam policies.
- Request review, giving examples of bad content removed and good content added.

**Related Google docs**
- https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/spam-updates

Deep dive: `scaled-content.md`.

---

## Scraping

**Definition.** Taking content from other sites, often by automated means, and hosting it with the purpose of manipulating search rankings.

**Google's examples**
- Republishing content from other sites without adding original content or value, or even citing the source.
- Copying content, changing it only slightly (synonym substitution or automated techniques), and republishing it.
- Reproducing content feeds from other sites without providing some unique benefit to the user.
- Sites dedicated to embedding or compiling content, such as videos, images or other media from other sites, without substantial added value.

**Not a violation**
Google lists none. The qualifiers are "purpose of manipulating search rankings" and "without ... added value" or "unique benefit".

**Matching manual action.** "Thin content with little or no added value" (lists content from other sources such as scraped content and low-quality guest posts).
- Check for content that duplicates content found elsewhere.
- Improve the site so it provides significant value; fix all affected pages.
- Request review with examples of bad content removed and good content added.

Do not confuse with Machine-generated traffic, which is about automated queries to Google.

**Related Google docs**
- https://developers.google.com/search/docs/appearance/spam-updates

Deep dive: `scaled-content.md`.

---

## Site reputation policy

**Definition.** Applies where third-party content is published on a host site mainly because of the host's already-established ranking signals, earned primarily from its first-party content. The aim is for the content to rank better than it could on its own. Third-party content means content created by an entity separate from the host: for example the site's users, freelancers, white-label services, or people not directly employed by the host.

Third-party content alone is not inconsistent with the policy. It is inconsistent only when published on the host mainly because of the host's established ranking signals.

**Google's examples** (inconsistent; not exhaustive)
- An educational site hosting a page of sponsored payday-loan reviews written by a third party that distributes the same page to other sites.
- A medical site hosting a low-quality third-party advertising page about "best casinos" that is not integrated with the site and is placed there to rank on the site's signals.

**Not a violation** (not considered inconsistent; non-exhaustive, other cases may also draw no action)
- Wire service or press release service sites.
- News publications syndicating news content from other news publications.
- Sites built for user-generated content, such as forums or comment sections.
- Columns, opinion pieces, articles and other work of an editorial nature.
- Third-party "advertorial" or "native advertising" pages whose purpose is to share content directly with readers (for example promotion within the publication itself), not to manipulate rankings.
- Affiliate links throughout a page with links treated appropriately, or third-party ad units embedded throughout a page.

**Review process.** Google presumes individual pages, including new ones, match the overall quality of other pages on the domain. If part of a site may be out of line, the site is subject to human review. The consequence depends on where the user is.

**EEA versus non-EEA enforcement** (spam policies page; August 2026 blog post; manual actions page)
- Outside the EEA: pages found out of line may receive a manual action when they appear in results shown to users outside the EEA. Only the affected portion is affected, not the rest of the site.
- Inside the EEA: the manual action's impact does not apply. The relevant pages may be categorised as separate from the main domain so they rank independently on their own merits, which stops the "same quality as the rest of the domain" presumption applying to them. Separation is not automatic and does not mean the portion instantly loses the main site's signals.
- The August 2026 post says the changed effect begins August 30 (2026). A manual action can sit on a page globally but only changes results for non-EEA users.
- Owners are notified in the Manual actions report and the Search Console message center, can file a reconsideration request, and eligible sites may take disputes to mediation. In the EEA the reconsideration process commits to a short response time and more detailed reasoning, and alternative dispute resolution is available.

**The four review factors.** The review asks whether the section is created with enough input, editorial oversight or contribution from the host to be fully integrated with the main site. Objective factors include:
1. Presentation: are graphic design, formatting, typography and UX features consistent with the host domain?
2. Quality: do quality issues appear on the page that are absent from the main domain and suggest a departure from its standard?
3. Stated or implied authorship: is ownership or responsibility explicitly acknowledged, and are there indications contesting the stated authorship?
4. Duplication: does identical or near-identical content appear on multiple other sites?

No single factor is necessary or sufficient. Weight varies by case, and other evidence can count, for example pages that are third-party marketing material for manipulating Search ranking.

**The three worked examples**
1. Not likely to take action: an integrated coupons and deals section. A publisher runs it with a specialist provider on a different CMS but in a sub-folder integrated into the homepage and article snippets. Categories are specific to the publisher. Commercial character is disclosed, the publisher is named as editorially responsible in collaboration with the partner, codes are curated and cross-referred in other editorial content, the section is easy to reach from main navigation, and problems can be reported through an accessible link.
2. Likely to take action (for results outside the EEA): an unauthored affiliate article not integrated in the publication. A business publication hosts an article linking to a CBD-oil marketplace with no author or responsible editor, no commercial disclaimers, no navigation path from the main page or sections, presentation and quality that do not match the publication, and evidence it duplicates a third-party marketplace's content.
3. Unlikely to take action: an authored, original affiliate article from a freelancer. A news site adds a cooking section with affiliate links to grocery stores and cookware. A freelancer interviews guest chefs, is identified as author, the site is consistently branded with clear statements of editorial responsibility, and the selection is specific to the news site even though the freelancer also writes for others and the affiliate links may match those elsewhere.

**FAQ**
- Does a non-EEA manual action affect EEA ranking? No. It does not influence results for EEA users and is not used as a ranking signal for EEA results. There is no obligation to add `noindex` to content under a non-EEA manual action, and failing to do so is not counted in EEA ranking, nor treated as circumvention or repeated violation.
- Earlier EEA manual actions under this policy? Google lifts all previous manual actions for pages shown to EEA users. Those pages may in future be categorised as separate and ranked on their own merits, but that is not automatic. The earlier action is not used as a ranking signal.
- What does "categorised as separate" mean? The global presumption of uniform quality no longer applies to that portion. Over time ranking systems learn to rank the parts independently, which may change how each part ranks, including through site-wide signal improvements. The categorisation itself is not a ranking signal.
- Disagreeing with the action? In the EEA, use the reconsideration process described above and alternative dispute resolution.

**Matching manual action.** "Site reputation policy". The entry says its impact does not apply to results shown to EEA users.
- Find the inconsistent third-party content using the affected-page patterns in the Search Console message.
- Options Google lists: move the content to a new domain (use `nofollow` on links from the old site to the new one and avoid redirecting old URLs to it, since redirecting may again be inconsistent); exclude it with `noindex` without blocking it in robots.txt; redo it as first-party content; or remove it.
- Caution from Google: moving to a subdomain or subdirectory may be viewed as circumvention and lead to broader action; moving to another established site may create a site reputation issue there if the third-party nature is unchanged. In the EEA, not taking these steps is not by itself treated as circumvention.
- Request review once consistent. Repeated inconsistency may bring further manual actions or affect overall ranking.

**Related Google docs**
- https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
- https://developers.google.com/search/blog/2024/03/core-update-spam-policies
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links

---

## Sneaky redirects

**Definition.** Redirecting is sending a visitor to a different URL than the one requested. Sneaky redirecting is doing so maliciously, either to show users and search engines different content or to show users unexpected content that does not meet their original need.

**Google's examples**
- Showing search engines one type of content while redirecting users to something significantly different.
- Showing desktop users a normal page while redirecting mobile users to a completely different spam domain.

**Not a violation**
- Moving a site to a new address.
- Consolidating several pages into one.
- Redirecting users to an internal page once they are logged in.
- From the Sneaky mobile redirects manual action text: showing slightly different content per device (for example modified images for a small screen) and redirecting mobile users to improve their experience, such as `example.com/url1` to `m.example.com/url1`, are often fine.

Google's test: whether the redirect is intended to deceive users or search engines.

**Matching manual action.** "Cloaking and/or sneaky redirects" (shared with cloaking) and "Sneaky mobile redirects".
- Cloaking and/or sneaky redirects: use URL Inspection and compare; check for URLs that send users somewhere unexpected or redirect conditionally (only visitors from Google, or from certain IP ranges); remove the code generating them, often in JavaScript, `.htaccess`, the CMS or plugins.
- Sneaky mobile redirects: causes Google names are code adding mobile-only redirect rules, ad or monetisation scripts that redirect mobile users, and scripts added by hackers. If unintentional, check the Security Issues report for a hack, then remove third-party scripts one at a time and re-test on a mobile device or emulator. If intentional, fix the pages and confirm from Google results on a smartphone or emulator.
- Request review after fixing all pages.

**Related Google docs**
- https://developers.google.com/search/docs/crawling-indexing/301-redirects
- https://developers.google.com/search/docs/monitor-debug/security/malware

---

## Thin affiliation

**Definition.** Publishing content with product affiliate links where product descriptions and reviews are copied directly from the original merchant without original content or added value.

Affiliate pages can also be thin when they belong to a program that distributes the same content across a network of affiliates without adding value. These often look like cookie-cutter sites or templates, with the same or similar content replicated within a site or across domains or languages. If a results page returned several such sites with identical content, that would be a frustrating experience.

**Google's examples**
- Product descriptions and reviews copied directly from the merchant.
- Content distributed across an affiliate network without added value.
- Cookie-cutter or template sites replicating the same or similar content within a site or across multiple domains or languages.

**Not a violation**
- Participating in an affiliate program is not itself thin affiliation.
- Good affiliate sites add value through meaningful content or features. Google's examples of good affiliate pages: additional information about price, original product reviews, rigorous testing and ratings, navigation of products or categories, and product comparisons.

**Matching manual action.** "Thin content with little or no added value" (lists thin affiliate pages).
- Check for thin content pages with affiliate links.
- Judge whether the site gives users significant added value, and improve it accordingly.
- Request review with examples of bad content removed and good content added.

**Related Google docs**
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links

Deep dive: `scaled-content.md`.

---

## User-generated spam

**Definition.** Spammy content added to a site by users through a channel intended for user content. Site owners are often unaware of it.

**Google's examples**
- Spammy accounts on hosting services anyone can register for.
- Spammy posts on forum threads.
- Comment spam on blogs.
- Spammy files uploaded to file hosting platforms.

**Not a violation**
Google lists none on the spam policies page. Link-level guidance from the outbound-links page: user-generated links are recommended to carry `rel="ugc"`, and trusted contributors' links may have it removed.

**Matching manual action.** Three entries.
- "User-generated spam": spam on forum pages, guestbooks or user profiles. Look for advertisement-like posts, off-topic links, gibberish, auto-generated profiles and commercial usernames such as "Discount Insurance" that link to unrelated sites. Remove the content, add prevention measures, request review.
- "Site abused with third-party spam": a significant portion of the site abused through forums, guestbooks, social platforms, file uploaders, free hosting or internal search pages. Google says it generally judges the site to be of sufficient quality that the action covers only the spammy pages, but too much such content can affect overall assessment and ranking. Actions include finding open interaction areas, searching with `site:` plus unrelated commercial or adult keywords, monitoring logs for traffic spikes on new pages, removing the content, blocking spammy terms from being published, marking user links `rel="ugc"`, and consolidating interactive content under one path.
- "Spammy free host": a significant fraction of sites on a free hosting service are spammy, and Google may act on the whole service. Remove spammy accounts, apply abuse-prevention tips, and contact the hosting provider's technical team.

**Related Google docs**
- https://developers.google.com/search/docs/monitor-debug/prevent-abuse
- https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
- https://web.dev/articles/hacked (linked from the spam policies page; not listed in the source map)

---

## Other practices that can lead to demotion or removal

These appear under a separate heading on the spam policies page. They are not framed as spam techniques and none has a dedicated manual action entry in the report.

### Legal removals

**Definition.** A significant volume of valid copyright removal requests involving a site lets Google demote other content from that site, so other infringing content is less likely to be seen than the originals.

**Google's examples**
- Similar demotion signals apply to complaints involving defamation, counterfeit goods and court-ordered removals.
- Child sexual abuse material is always removed when identified, and all content is demoted from sites with a significant proportion of it.

**Not a violation**
Google lists none.

**Matching manual action.** No dedicated manual action entry in the report.

**Related Google docs**
- https://support.google.com/transparencyreport/answer/7347743 (linked from the spam policies page; not listed in the source map)

### Personal information removals

**Definition.** If Google processes a significant volume of personal information removals involving a site with exploitative removal practices, it demotes other content from that site. It checks whether other sites show the same pattern and may demote them too.

**Google's examples**
- Similar demotion may apply to sites receiving a significant volume of removals involving doxxing content, explicit personal imagery created or shared without consent, or explicit non-consensual fake content.

**Not a violation**
Google lists none.

**Matching manual action.** No dedicated manual action entry in the report.

**Related Google docs**
- https://developers.google.com/search/docs/essentials/spam-policies

### Policy circumvention

**Definition.** If a site keeps taking actions intended to bypass the spam or content policies, Google may restrict or remove eligibility for search features (for example Top Stories, Discover) and take broader action in Search, such as removing more sections of the site from results.

**Google's examples**
- Using existing or newly created subdomains, subdirectories or sites with the intention of continuing to violate the policies.
- Other methods intended to keep distributing content or behaviour that violates the policies.

**Not a violation**
Google lists none. The test is intent to continue violating. For site reputation, Google states that in the EEA, not taking remediation steps is not by itself treated as circumvention.

**Matching manual action.** No dedicated manual action entry in the report. The Site reputation policy entry warns that moving content to a subdomain or subdirectory may be viewed as circumvention.

**Related Google docs**
- https://developers.google.com/search/docs/essentials/spam-policies

### Scam and fraud

**Definition.** Scams and fraud take many forms, including impersonating an official business or service through imposter sites, intentionally displaying false information about a business or service, or otherwise attracting users to a site on false pretenses. Google uses automated systems to identify and keep such pages out of results.

**Google's examples**
- Impersonating a well-known business or service provider to trick users into paying money to the wrong party.
- Deceptive sites posing as official customer support for a legitimate business, or giving fake contact information for it.

**Not a violation**
Google lists none.

**Matching manual action.** No dedicated manual action entry in the report.

**Related Google docs**
- https://developers.google.com/search/docs/essentials/spam-policies

---

## Link qualification quick reference

Source: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links

Regular links that Google should fetch and parse without qualification need no `rel` attribute. For other links use one or more of these values on the `<a>` tag.

| Value | Use for | Note |
|---|---|---|
| `rel="sponsored"` | Advertisements and paid placements (paid links). | Preferred for paid links. `nofollow` was previously recommended for them and is still acceptable. |
| `rel="ugc"` | User-generated content links such as comments and forum posts. | Recommended. May be removed from links by contributors who have consistently posted high-quality content, to recognise them. |
| `rel="nofollow"` | Cases where no other value applies and you would rather Google not associate your site with, or crawl, the linked page from your site. | For links within your own site use a robots.txt disallow rule instead. |

Multiple values:
- Give a space- or comma-separated list, for example `rel="ugc nofollow"` or `rel="ugc,nofollow"`.
- Qualified links are generally not followed, but the target can still be found and crawled through other routes such as sitemaps or links from other sites.
- The `rel` values work only on `<a>` elements Google can crawl. `nofollow` also exists as a robots meta tag.
- To stop Google fetching a link to a page on your own site, use a robots.txt disallow rule. To keep a page out of the index, allow crawling and use `noindex`.

Policy tie-in: the link spam policy treats paid or sponsored links qualified with `nofollow` or `sponsored` as compliant. The Manual actions entries for unnatural links accept `nofollow` "or a more specific attribute" as the fix.

Related: https://developers.google.com/search/docs/monitor-debug/prevent-abuse
