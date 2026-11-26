# Enforcement routes, spam updates and recovery

Purpose: give the auditing model an accurate account of how Google enforces its spam policies, how to diagnose a traffic drop, and what recovery can honestly be promised. Policy definitions are in `policies.md`; reasoning about scaled content is in `scaled-content.md`.

Snapshot date of Google's pages: 2026-11-25. Statements are paraphrased from the cited page. Anything marked "(inference)" or "(heuristic)" is this skill's own reading, not Google's wording.

Canonical URLs used:

- Spam policies for Google web search: https://developers.google.com/search/docs/essentials/spam-policies
- Manual actions report: https://support.google.com/webmasters/answer/9044175
- Update to the site reputation policy (2026-08-28): https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
- March 2024 core update and spam policies (blog): https://developers.google.com/search/blog/2024/03/core-update-spam-policies
- Spam updates: https://developers.google.com/search/docs/appearance/spam-updates
- Core updates: https://developers.google.com/search/docs/appearance/core-updates
- Ranking systems guide: https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Search Essentials: https://developers.google.com/search/docs/essentials
- Debugging drops in Search traffic: https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops
- Control what you share with Google Search: https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
- Search Status Dashboard, ranking updates history: https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history

## Contents

1. Two enforcement routes
2. Spam updates and core updates
3. Diagnosing a drop
4. Scope of effect
5. Recovery playbook
6. What a report may and may not claim

## 1. Two enforcement routes

Google states that it detects policy-violating practices through automated systems and, as needed, human review that can result in a manual action; sites that violate the policies may rank lower or not appear at all.
Source: https://developers.google.com/search/docs/essentials/spam-policies

### Route A: manual action

- A manual action is issued when a human reviewer at Google determines that pages on the site do not comply with the spam policies. Most address attempts to manipulate the search index, and most result in pages or sites being ranked lower or omitted without a visible indication to the user.
- Notification: the site owner is notified in the Manual actions report and in the Search Console message center.
- Where to look: the report lists patterns of affected pages; this may be a subset of the site or the entire site, with an "Affects all pages" description for the latter. The report says not all pages matching a listed pattern are necessarily affected.
- Fixing: fix the issue on all affected pages; Google states that fixing only some pages does not earn a partial return to search results. With several manual actions, fix all. Affected pages must be reachable (no login, paywall, robots.txt block or noindex) so Google can check them.
- Reconsideration: when everything is fixed, select Request Review in the report and describe the fixes. Do not resubmit before a decision on an outstanding request.
- Review time: Google says most reconsideration reviews can take several days or weeks, and some, such as link-related ones, longer.
- Actions relevant to scaled sites: "Thin content with little or no added value" (thin affiliate pages, content from other sources such as scraped content, doorways); "Major spam problems" (names scaled content abuse among aggressive techniques); "User-generated spam"; "Site abused with third-party spam"; "Site reputation policy".

Source: https://support.google.com/webmasters/answer/9044175

### Route B: automated systems

- Google says its algorithms are very good at detecting spam and in most cases discover and remove it automatically. Source: https://support.google.com/webmasters/answer/9044175
- Its ranking systems guide lists spam detection systems, including SpamBrain, which handle content and behaviors that violate the spam policies and are updated continuously. Source: https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Notification: the fetched pages describe notification for manual actions only. None of them describes a Search Console notice or a reconsideration process for an automated demotion. That absence is in the snapshot; the pages do not state "no notification" in so many words (inference). Treat an automated route as unannounced.
- What the fetched pages do offer for the automated route: review the spam policies, make changes, and wait. See section 2.

### Side by side (this skill's summary of the sections above)

| Question | Manual action | Automated systems |
|---|---|---|
| Who decides | Human reviewer | Spam detection systems, including SpamBrain |
| Does Search Console say so | Yes: Manual actions report and message center | Not described in the fetched pages (inference: assume no) |
| Scope shown | Patterns of affected pages, or all pages | Not shown; judge from traffic by template |
| Way back | Fix everything, then Request Review | Fix, then wait; Google mentions months |
| Review time stated by Google | Several days or weeks, sometimes longer | None; no review request described |

## 2. Spam updates and core updates

### Spam updates

- Google's spam detection systems are always running; occasionally Google makes notable improvements and calls that a spam update, listed on its list of Google Search ranking updates. SpamBrain, its AI-based spam-prevention system, is the example given.
- Sites that see a change after a spam update should review the spam policies and make sure they comply. Making changes may help a site improve if the automated systems learn over a period of months that the site complies.
- Link spam updates differ: when the systems remove the effect of spammy links, the ranking benefit those links generated is lost and cannot be regained, so changes might not generate an improvement.

Source: https://developers.google.com/search/docs/appearance/spam-updates

The March 2024 post shows spam updates and core updates can launch on the same day (the March 2024 core update and spam update were announced together), which makes attribution of a drop to one of them harder when dates overlap.
Source: https://developers.google.com/search/blog/2024/03/core-update-spam-policies

### Core updates (how they differ)

- Core updates are significant, broad changes to search algorithms and systems, made several times a year and posted on the ranking updates list. Google says they are designed to keep delivering helpful, reliable results, are broad in nature, and "don't target specific sites or individual web pages".
- The page does not describe a core update as enforcement of a spam policy. Its restaurant-list analogy says pages that move down are not necessarily "bad"; others may now fit the list better. The traffic-drops page likewise says that after an algorithmic update there might not be anything fundamentally wrong with the content.
- What Google advises after a drop: wait at least a full week after the update finishes, compare that week with the week before the update began, and review top pages and queries. Google's examples: a drop from position 2 to 4 is small and calls for no drastic action; a drop from position 4 to 29 is large and calls for a deeper assessment against the helpful-content self-assessment, looking at the site as a whole and at the most affected pages.
- Things to keep in mind: avoid quick-fix changes; improve content in ways that serve users and last; deleting content is a last resort, to be considered only if content cannot be salvaged. Google adds that if you are considering deleting entire sections, that is likely a sign they were created for search engines first, and removing unhelpful content can help the good content perform better.
- Timing: some changes can take effect in days; it could take several months for systems to confirm that a site now produces helpful, reliable, people-first content; if no effect after a few months, that could mean waiting for the next core update. Google says there is no guarantee that changes produce a noticeable effect.
- The ranking systems guide says the former "helpful content system" evolved in March 2024 into part of the core ranking systems, so there is no separate helpful-content update to look for in the update history after that date.

Sources: https://developers.google.com/search/docs/appearance/core-updates ; https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops ; https://developers.google.com/search/docs/appearance/ranking-systems-guide

Practical consequence (inference): a drop that coincides with a core update and a drop that coincides with a spam update call for different questions. The first points to the helpfulness self-assessment of the whole site; the second points to the spam policies. When both dates are near, report both as possible and do not choose.

## 3. Diagnosing a drop

Causes Google lists, with how the pages say to tell them apart:

| Cause | How it looks or how to check (per Google) |
|---|---|
| Algorithmic update | Compare with Google's posted ranking updates; classify top pages as small or large position change. |
| Technical issue | Crawl stats report and Page indexing report for a spike in errors; can be site-wide (site down) or page-wide (a misplaced noindex, which shows as a slower decline). |
| Security issue | Security Issues report; malware or phishing may trigger warnings or interstitials that reduce traffic. |
| Spam issue | Spam policy review; Manual actions report for any manual action. |
| Seasonality and changing interests | Filter the Performance report by top queries and compare against Google Trends; use 16 months of data to see recurring patterns. |
| Site move or migration | Ranking fluctuations while Google recrawls after URL changes; a medium-sized site can take a few weeks, larger ones longer. |
| Reporting glitch | Search Console Data Anomalies page. |

Source: https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops

Reading the pattern (Google wording): if impressions and clicks both fell, work through the causes above; if impressions held and clicks fell, the title and snippet or competing rich results may be the issue. Look at whether the drop hit the whole site, a group of pages or one page: site-wide, check the Page indexing report; for a group, use URL Inspection on a few pages. Analyze web search, Images, Video and News separately.

Audit steps added by this skill (method, not Google's):

1. Check the Manual actions report and the Security issues report first. These are the only two places in the sources where Google names a confirmed cause.
2. Identify the date the drop began (daily clicks and impressions), then compare it with Google's published update dates on the Search Status Dashboard history: https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history. Note whether the drop starts inside a rollout window, which updates were spam updates, core updates or link spam updates, and whether several overlap. Google advises waiting a full week after a core update finishes before comparing.
3. Rule out technical, seasonal and migration causes before attributing the drop to a spam or quality cause.
4. Segment the drop by URL pattern (template) in the Pages table. A drop concentrated in generated templates and not in editorial pages is consistent with a template-level cause (heuristic).
5. Record what could not be checked (no Search Console access, no dates available).

## 4. Scope of effect

- Manual actions: the report lists patterns of affected pages, a subset or all pages (see section 1). Source: https://support.google.com/webmasters/answer/9044175
- Spam policies in general: Search Essentials says the spam policies describe tactics that can lead to a page or an entire site being ranked lower or omitted. Source: https://developers.google.com/search/docs/essentials
- Ranking systems: Google says its systems are designed to work at page level, with site-wide signals and classifiers also contributing; some good site-wide signals do not mean all content ranks well, and some poor ones do not mean all content ranks poorly. Source: https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Site reputation policy: applies to a portion of a site (third-party content published mainly to exploit the host's ranking signals). Google generally presumes individual pages, including new pages, match the overall quality of other pages on the domain; if a portion is out of line, the site is subject to human review. Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
  - Since 2026-08-30, a manual action under this policy directly affects search results for the affected portion for users outside the EEA, and the rest of the site is not affected.
  - For users in the EEA, the manual action's impact does not apply; the affected section may be separated in Google's systems so that over time it ranks independently of the rest of the site. Google says that categorization is not itself used as a ranking signal. Site owners are still notified in Search Console when a manual action is applied.
  - Google's FAQ says a site reputation manual action outside the EEA affects only results shown outside the EEA, and is not used as a signal for ranking that content within the EEA.
- Not every audit finding is about this policy; it concerns third-party content hosted on an established site. Do not apply it to first-party generated pages.

## 5. Recovery playbook

Ordered steps. They combine Google's statements (cited) with this skill's method (marked).

1. Confirm which route applies. Check the Manual actions report. If it names an action, route A applies and the named action defines the scope; if it shows none, route B (automated) or a non-spam cause applies. Source: https://support.google.com/webmasters/answer/9044175
2. Fix at the template or code level, not page by page (method). Programmatic violations originate in a template, a data pipeline or a route generator; editing individual pages leaves the generator producing more. For a manual action, Google requires the fix on all affected pages and gives no partial credit. Source: https://support.google.com/webmasters/answer/9044175
3. Decide about content that cannot be made useful. This is the site owner's decision, and each option has a cost.
   - For hosted scaled content Google's instruction is to exclude it from Search; the pages then no longer appear in results. Source: https://developers.google.com/search/docs/essentials/spam-policies
   - Google lists removal from the site, password protection and noindex among ways to keep content out of Search; for noindex the content can still be visited, and crawling must not be blocked for noindex to work. Sources: https://developers.google.com/search/docs/crawling-indexing/control-what-you-share ; https://support.google.com/webmasters/answer/9044175
   - Google calls deleting content a last resort, to be considered only when it cannot be salvaged. Source: https://developers.google.com/search/docs/appearance/core-updates
   - Improving the content so it provides significant value is the first option the Manual actions report gives for "Thin content with little or no added value". Source: https://support.google.com/webmasters/answer/9044175
4. For a manual action, file a reconsideration request once all listed issues are fixed. Google says a good request explains the exact quality issue, describes the steps taken, and documents the outcome. For thin-content and major-spam actions it also asks for examples of bad content removed and good content added. Make affected pages reachable first. Do not resubmit while a request is pending. A newly acquired site owner should say so in the request and state the site no longer violates the policies. Source: https://support.google.com/webmasters/answer/9044175
5. For an algorithmic case, expect months and no confirmation. Google says improvement may come if automated systems learn over months that the site complies, and that there is no guarantee of effect. Spam update: https://developers.google.com/search/docs/appearance/spam-updates ; core update: https://developers.google.com/search/docs/appearance/core-updates. For link spam updates, lost link benefit cannot be regained. The sources describe no request that triggers a review for automated cases (see section 1).
6. Do not use workarounds. Google's policy circumvention text says that continuing to engage in actions intended to bypass its spam policies may lead to restricted eligibility for some search features and to broader action, such as removing more sections of a site from Search. Its examples include using existing or creating new subdomains, subdirectories or sites with the intention of continuing to violate the policies, and other methods intended to continue the same behavior. The Manual actions report repeats the warning for the site reputation policy: moving content to a subdomain or subdirectory may be viewed as circumvention. Moving generated content to a new domain, folder or site to continue the same pattern is therefore a recorded risk, not a fix. Sources: https://developers.google.com/search/docs/essentials/spam-policies ; https://support.google.com/webmasters/answer/9044175
7. Re-measure after the waiting periods the sources give (days to months; several months for systems to confirm sitewide helpfulness), and compare like with like using the Search Console Performance report. Source: https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops

## 6. What a report may and may not claim

Rules for the auditing model:

1. Without a manual action, use hedged language: "consistent with", "at risk under", "matches Google's example of ...". Cite the policy text the pattern resembles.
2. Name a policy as the confirmed cause of a ranking loss only when the Manual actions report names it. A spam update date alone does not confirm which policy, or whether spam was the cause at all.
3. Never promise recovery, and never give a timeline shorter than Google's: several days or weeks for a reconsideration review, and months for automated reassessment. State Google's own caveat that no change is guaranteed to have an effect.
4. Never present a third-party tool's "spam score", "authority" or "toxicity" metric as Google's. Google says third-party reputation or authority scores do not correspond to any of its signals. Source: https://developers.google.com/search/blog/2024/03/core-update-spam-policies
5. Distinguish what Google says from what the skill infers; label heuristics as heuristics.
6. Do not recommend noindex, deletion or any page-count threshold as a default fix. Present exclusion from Search as one option Google names, with its cost (pages leave search results).
7. Do not suggest ways to avoid detection, split content across domains or folders, or rotate sites. Those match the circumvention examples in section 5.
8. State what was not checked: Search Console access, Manual actions and Security issues reports, update-date comparison, pages not sampled, template coverage, and the snapshot date of the Google pages used (2026-11-25).
