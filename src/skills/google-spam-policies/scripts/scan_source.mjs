#!/usr/bin/env node
/*
 * scan_source.mjs - first-pass source scanner for the google-spam-policies skill.
 *
 * Walks a repository and lists places in the code that deserve a closer look against
 * Google's spam policies for web search. It emits LEADS, not verdicts: the same code
 * pattern is often legitimate, because the policies hinge on intent and on what users
 * and crawlers actually receive. Open each file and decide.
 *
 * Usage:
 *   node scan_source.mjs <dir> [--json <file>] [--only <policy-slug,...>] [--max-per-rule <n>]
 *
 *   --json <file>        also write the findings as JSON (the only file this script writes)
 *   --only <slugs>       comma-separated policy slugs, e.g. cloaking,sneaky-redirects
 *   --max-per-rule <n>   cap findings printed per rule (default 25)
 *
 * Exit code: 0, or 2 when <dir> is missing. Zero dependencies, no network.
 */
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- policies and shared vocab
const P = {
  cloaking: 'Cloaking',
  redirects: 'Sneaky redirects',
  malicious: 'Malicious practices',
  hidden: 'Hidden text and link abuse',
  stuffing: 'Keyword stuffing',
  links: 'Link spam',
  ugc: 'User-generated spam',
  doorway: 'Doorway abuse',
  scaled: 'Scaled content abuse',
  scraping: 'Scraping',
  traffic: 'Machine-generated traffic',
  hacked: 'Hacked content',
  thin: 'Thin affiliation',
};
const slugOf = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');

const LIST_WORDS = /\b(?:cit(?:y|ies)|services?|keywords?|locations?|areas?|towns?|regions?|suburbs?|districts?|neighbou?rhoods?|counties|postcodes?)\b/i;
const ROUTE_WORDS = /\b(?:slug|routes?|paths?|permalink|params|createPages?|sitemap|urls?|href|pages?)\b/i;
const LOOP = String.raw`(?:\bfor\s*\([^)\n]*\b(?:of|in)\b[^)\n]*\)|\bfor\s+\w+\s+in\s+[^\n:]+:|\{%-?\s*for\s+\w+\s+in\b|\.(?:forEach|map|flatMap)\s*\(|\bproduct\s*\()`;
const REL_QUALIFIED = /\brel\s*=\s*["'][^"']*\b(?:sponsored|nofollow|ugc)\b/i;
const WRITES_CONTENT = /\b(?:writeFile(?:Sync)?|INSERT\s+INTO|insertMany|bulkCreate|upsert|to_sql|file_put_contents|CREATE\s+TABLE)\b|\.(?:insert|create|save|write_text)\s*\(|objects\.create|fs\.write\w*/i;

// Context that makes a match likely benign. Tested against the file path and the enclosing block
// (or the matched lines when there is no block).
const A11Y = { re: /sr-only|visually-?hidden|screen-?reader|\ba11y\b|sr_only|assistive|skip-?(?:link|nav)/i, reason: 'accessibility utility (screen-reader-only text or skip link)' };
const UI = { re: /accordion|\btabs?\b|tab-?(?:panel|content)|carousel|slider|slideshow|tooltip|modal|dropdown|collapse|popover|off-?canvas|lightbox|keyframes|transition|animation|\bfade/i, reason: 'show/hide UI pattern (accordion, tab, carousel, tooltip, modal, animation)' };
const LOGIN = { re: /log-?in|log-?out|sign-?(?:in|out)|\bauth|session|checkout|returnTo|return_to|migrat|moved/i, reason: 'login, session or migration redirect context' };
const RENDERING = { re: /prerender|rendertron|pre-render|snapshot|renderToString|\bssr\b|rate.?limit|\banalytics\b|\bmetrics\b|\blogger\b|robots\.txt/i, reason: 'pre-rendering, analytics, rate-limit or robots context; confirm crawlers get the same content' };

// ---------------------------------------------------------------- rule table
// Rule fields: id, policy, pattern, why, verify, benign.
// Optional: files (kinds: web|config|docs, default web), path (regex on relative path),
// near (regex or array, ALL must match within nearLines of the match; Infinity = whole file),
// multiline (match across lines), accept(match), tagAbsent (regex that must NOT appear in the
// opening tag at the match), fileAbsent (regex that must NOT appear anywhere in the file),
// soften (contexts that set likelyBenign), oncePerFile, longLines.
const RULES = [
  // ---- Cloaking
  {
    id: 'cloak-crawler-ua', policy: P.cloaking, files: ['web', 'config'], soften: RENDERING,
    pattern: /\b(?:googlebot|bingbot|adsbot|duckduckbot|yandex(?:bot)?|baiduspider|google-inspectiontool|applebot)\b/i,
    why: 'Names a search-engine crawler; if code branches on it and the branches serve different content, that is cloaking.',
    verify: 'Compare what each branch renders for the same URL. The same content in another form is fine; text or links shown only to crawlers is not.',
    benign: 'Dynamic rendering that serves crawlers a pre-rendered copy of the same content, analytics exclusion, rate limiting, robots.txt handling.',
  },
  {
    id: 'cloak-generic-bot-ua', policy: P.cloaking, files: ['web', 'config'], nearLines: 2, soften: RENDERING,
    pattern: /\b(?:crawlers?|spiders?|bots?)\b/i,
    near: /user[-_ ]?agent|http_user_agent/i,
    why: 'A user-agent test for crawler, spider or bot; if it selects different content, that is cloaking.',
    verify: 'Find what the matching branch returns and diff it against the normal response.',
    benign: 'Excluding bots from analytics, counters or rate limits; serving a pre-rendered copy of the same content.',
  },
  {
    id: 'cloak-bot-library', policy: P.cloaking, soften: RENDERING,
    pattern: /(?:from|require\(|import)\s*\(?\s*['"](?:isbot|is-bot|crawler-user-agents|bot-detector|crawler-detect)['"]|\bisbot\s*\(|\bCrawlerDetect\b|\bCrawler_Detect\b|\bis_bot\b/i,
    why: 'Bot-detection helper in use; check what its result changes in the response.',
    verify: 'Follow each call site: does the result change the HTML, links or redirects served?',
    benign: 'Analytics filtering, bot rate limiting, logging, skipping cookie banners.',
  },
  {
    id: 'cloak-dynamic-rendering', policy: P.cloaking, oncePerFile: true,
    pattern: /\b(?:prerender(?:-node|\.io|cloud|-spa-plugin)?|rendertron|dynamic[-_ ]render(?:ing|er)?)\b/i,
    why: 'Prerender or dynamic-rendering setup that routes crawlers to a separate rendered version.',
    verify: 'Fetch the same URL as a browser and as the crawler path; the visible text, links and metadata should match.',
    benign: 'Google does not treat dynamic rendering as cloaking when the content is similar (it is a workaround; server-side rendering is preferred).',
  },
  {
    id: 'cloak-crawler-ip', policy: P.cloaking, files: ['web', 'config'],
    pattern: /\b(?:66\.249|64\.233\.1\d\d|72\.14\.199|209\.85)\.|\.googlebot\.com\b|\.search\.msn\.com\b|\bgooglebot_?ips?\b/i,
    why: 'Matches Google crawler IP ranges or reverse-DNS names; IP-based branching can deliver crawlers different content.',
    verify: 'See what the crawler-IP branch does: allow-list, rate limit, or a different page.',
    benign: 'Verifying genuine Googlebot for access control, rate limits or log analysis.',
  },
  // ---- Sneaky redirects
  {
    id: 'redirect-client-conditional', policy: P.redirects, nearLines: 8, soften: LOGIN,
    pattern: /\b(?:window|document|top|self|parent)\.location(?:\.href)?\s*=(?!=)|\blocation\.(?:href\s*=(?!=)|replace\s*\(|assign\s*\()/,
    near: /document\.referrer|navigator\.(?:userAgent|platform|vendor)|matchMedia|innerWidth|screen\.width|\bis_?mobile\b|\bmobile\b|\bandroid\b|iphone|ipad|referr?er/i,
    why: 'Client-side redirect close to a referrer, user-agent or device check; redirects that depend on how the visitor arrived are a hallmark of sneaky redirects.',
    verify: 'Read the condition and the target: does it send some visitors (search referrals, mobile) to a different site or content than other visitors get?',
    benign: 'Redirect to a mobile or localized version of the same page, post-login redirect, redirect after a site move.',
  },
  {
    id: 'redirect-server-conditional', policy: P.redirects, files: ['web', 'config'], soften: LOGIN,
    pattern: /\bres\.redirect\s*\(|\bheader\(\s*['"]Location:|\bredirect(?:_to|Response)?\s*\(|\bHttpResponseRedirect\b|\breturn\s+30[1278]\b|\[[^\]\n]*\bR=30\d|\bRewriteRule\b/i,
    near: /referr?er|http_referer|user[-_ ]?agent|http_user_agent|\bis_?mobile\b|\bmobile\b/i,
    why: 'Server redirect close to a referrer, user-agent or device test; the response varies by who asks.',
    verify: 'Read the condition and target; compare with what a direct visit and a crawler receive.',
    benign: 'Redirect to a mobile or language version of the same content, HTTP-to-HTTPS, redirects after a migration.',
  },
  {
    id: 'redirect-meta-refresh', policy: P.redirects,
    pattern: /<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i,
    why: 'Meta refresh sends visitors elsewhere after load; abused for instant redirects to another site.',
    verify: 'Check the target URL and delay; is it the same site and the content the visitor expected?',
    benign: 'Short-lived notice pages, redirects after a move, timed reload of a status page.',
  },
  // ---- Malicious practices (back button hijacking)
  {
    id: 'backbutton-history-repush', policy: P.malicious, nearLines: 25,
    pattern: /\bhistory\.(?:pushState|replaceState)\s*\(/,
    near: /\bpopstate\b|onpopstate|hashchange/i,
    why: 'History is written near a popstate listener; if the handler pushes the page again, Back cannot leave it (back button hijacking).',
    verify: 'Read the popstate handler: does it re-push state, call history.go/forward, or block navigation, instead of just rendering state?',
    benign: 'Single-page routers and filter UIs that restore their own view state on popstate.',
  },
  {
    id: 'backbutton-history-forward', policy: P.malicious,
    pattern: /\bhistory\.(?:go\(\s*1\s*\)|forward\s*\(\s*\))/,
    why: 'Moves the history forward programmatically, a technique used to undo a Back press.',
    verify: 'Check what triggers it; a handler that fires when the user presses Back is a trap.',
    benign: 'Wizard or carousel navigation that the user triggers with an on-page control.',
  },
  {
    id: 'backbutton-beforeunload', policy: P.malicious,
    soften: { re: /unsaved|dirty|hasChanges|changes|draft|\bform\b/i, reason: 'unsaved-changes prompt' },
    pattern: /\bonbeforeunload\s*=|addEventListener\(\s*['"]beforeunload['"]/,
    why: 'beforeunload handler; used to trap visitors with exit prompts or to rewrite navigation.',
    verify: 'Check whether the prompt fires on every page or only with unsaved input, and whether it redirects or opens pages.',
    benign: 'Unsaved-changes warnings on editors and long forms.',
  },
  // ---- Hidden text and link abuse
  {
    id: 'hidden-css-offscreen-or-zero', policy: P.hidden, soften: [A11Y, UI],
    pattern: /\bfont-size\s*:\s*0(?:px|em|rem|pt|%)?\s*(?:[;}"'!]|$)|\bfontSize\s*:\s*0\b(?!\.)|(?<![-\w])opacity\s*:\s*0(?:\.0+)?\s*(?:[;}"'!]|$)|\btext-indent\s*:\s*-\s*\d{3,}|(?<![-\w])(?:left|top|right|bottom|margin-left|margin-top)\s*:\s*["']?-\s*(?:\d{4,}|9{3})\s*(?:px|em|rem|vw|vh)?|\bclip\s*:\s*rect\(\s*0/i,
    why: 'Style that zeroes, fades or moves content far off-screen; if it holds text only for crawlers it is hidden text.',
    verify: 'Identify the element that carries the style and read its content: is it meaningful text or links that users cannot see and cannot reveal?',
    benign: 'Screen-reader-only utilities (sr-only), skip links, accordion/tab/tooltip/modal panels, fade-in animations, image-replacement text.',
  },
  {
    id: 'hidden-css-same-color', policy: P.hidden, multiline: true, files: ['web'],
    pattern: /(?<![-\w])color\s*:\s*(?!inherit|transparent|initial|unset|none|currentcolor)(#[0-9a-f]{3,8}|[a-z]+)\s*;[^{}]*?background(?:-color)?\s*:\s*\1(?![\w#])|background(?:-color)?\s*:\s*(?!inherit|transparent|initial|unset|none|currentcolor)(#[0-9a-f]{3,8}|[a-z]+)\s*;[^{}]*?(?<![-\w])color\s*:\s*\2(?![\w#])/i,
    why: 'Text colour equals background colour in the same rule (white on white), a classic way to hide text.',
    verify: 'Find the element and its real rendered background; is there text or links that a visitor cannot read?',
    benign: 'Placeholder or reset styles, text over a background image or gradient that makes it readable, state styles overridden elsewhere.',
  },
  {
    id: 'hidden-css-collapsed', policy: P.hidden, multiline: true, soften: [A11Y, UI],
    pattern: /(?<![-\w])(?:max-)?height\s*:\s*0(?:px)?\s*;[^{}]*?overflow\s*:\s*hidden|overflow\s*:\s*hidden\s*;[^{}]*?(?<![-\w])(?:max-)?height\s*:\s*0(?:px)?(?![\w.%])/i,
    why: 'Zero height with hidden overflow collapses content out of view.',
    verify: 'Check whether a control can reveal the content for users; text that never becomes visible is hidden text.',
    benign: 'Accordion, collapsible and menu panels that open on user action.',
  },
  // ---- Keyword stuffing
  {
    id: 'stuff-meta-keywords', policy: P.stuffing, multiline: true, files: ['web', 'docs'],
    pattern: /<meta\b(?=[^>]*\bname\s*=\s*["']keywords["'])[^>]*>/i,
    accept: (m) => {
      const c = m[0].match(/\bcontent\s*=\s*["']([^"']*)["']/i);
      return !!c && c[1].split(',').filter((s) => s.trim()).length > 15;
    },
    why: 'Keywords meta tag with more than 15 terms; stuffed keyword lists are keyword stuffing even when not visible.',
    verify: 'Count the terms and check whether the same list is repeated in visible copy.',
    benign: 'Google ignores the keywords meta tag; a long list is harmless to Google but still signals a stuffing habit worth removing.',
  },
  {
    id: 'stuff-long-list', policy: P.stuffing, multiline: true, files: ['web', 'docs'], nearLines: 3,
    // 25+ short comma-separated items: array literal, one string, or an HTML text node
    pattern: /\[(?:\s*(["'`])[^"'`\n,]{2,32}\1\s*,){24,}|(["'])(?:[^"',\s][^"',\n]{1,31},\s*){24,}[^"',\n]{2,32}\2|>\s*(?:[^<>,\s][^<>,\n]{1,31},\s*){24,}[^<>,\n]{2,32}\s*</,
    near: /cit(?:y|ies)|towns?|areas?|regions?|suburbs?|districts?|locations?|phones?|keywords?|neighbou?rhoods?|postcodes?|zip|tags?\b/i,
    why: 'Long list of cities, areas, phone numbers or keywords; if it is rendered on a page it looks like a block of terms the page tries to rank for.',
    verify: 'Check where the list is rendered (visible text, footer, hidden block) and whether it adds value for a reader.',
    benign: 'Data used for a form dropdown or filter, or a store locator that shows each location with its own details.',
  },
  // ---- Link spam
  {
    id: 'link-affiliate-no-rel', policy: P.links, files: ['web', 'docs'], nearLines: 3, tagAbsent: REL_QUALIFIED,
    pattern: /<a\b[^>]*\bhref\s*=\s*["']https?:\/\//i,
    near: /[?&](?:ref|aff\w*|partner\w*|utm_\w+|sponsor\w*|tag|clickid|subid)=|\b(?:affiliate|sponsor(?:ed)?|partners?|advert\w*|paid|promo(?:tion)?)\b/i,
    why: 'External link with affiliate, sponsor or partner markers and no rel="sponsored" or rel="nofollow"; paid links that pass ranking credit are link spam.',
    verify: 'Determine whether the link is paid, affiliate or part of a link exchange; if so it needs rel="sponsored" (or nofollow).',
    benign: 'Plain editorial links, or marker words that only describe the neighbourhood (a "Partners" menu item with qualified links).',
  },
  {
    id: 'link-footer-external', policy: P.links, tagAbsent: REL_QUALIFIED,
    path: /footer|layout|template|base\.|master|partials?[\\/]|_includes|header|sidebar|widget/i,
    pattern: /<a\b[^>]*\bhref\s*=\s*["']https?:\/\/(?:www\.|m\.)?(?!(?:facebook|fb|twitter|x|instagram|linkedin|youtube|tiktok|pinterest|github|google|apple|wikipedia|trustpilot)\.(?:com|org)|youtu\.be|goo\.gl|wa\.me|t\.me|schema\.org|w3\.org)/i,
    why: 'Site-wide template or footer links to an external domain; links repeated on every page can be link spam if placed for ranking.',
    verify: 'Check who the target is, whether money or a link exchange is involved, and whether the link carries rel="sponsored" or "nofollow".',
    benign: 'Credit links to the real hosting, platform or certification body, and regulator or association memberships.',
  },
  {
    id: 'link-injected-by-script', policy: P.links, nearLines: 3,
    pattern: /createElement\(\s*['"]a['"]\s*\)|insertAdjacentHTML\s*\(|document\.write(?:ln)?\s*\(/,
    near: /<a\s[^>]*href\s*=\s*[\\"']*https?:|\.href\s*=\s*["'`]https?:/i,
    why: 'Script writes an external link into the page; widgets that inject links can distribute keyword-rich links across many sites.',
    verify: 'Check who controls the target and anchor text, and whether embedding sites chose and can qualify the link.',
    benign: 'Share buttons, ad slots and embeds with clearly labelled, qualified links.',
  },
  // ---- User-generated spam
  {
    id: 'ugc-raw-html', policy: P.ugc, nearLines: 3,
    soften: { re: /DOMPurify|sanitize-?html|sanitizeHtml|bleach|\bugc\b|nofollow/i, reason: 'sanitising or rel handling nearby; confirm links get rel="ugc"' },
    pattern: /\bdangerouslySetInnerHTML\b|\bv-html\b|\|\s*(?:safe|raw)\b|\bhtml_safe\b|\bmark_safe\b|\{!!|<%-(?!\s*include\b)|\{\{\{|\binnerHTML\s*\+?=(?!=)/,
    near: /\b(?:comments?|reviews?|posts?|messages?|bio|profile|testimonials?|guestbook|forum|repl(?:y|ies)|ugc)\b|user[-_ ]?(?:content|input|text|generated)/i,
    why: 'User-supplied text is rendered as raw HTML, so submitted links and markup reach the page unqualified; a channel for user-generated spam.',
    verify: 'Check whether links in that content get rel="ugc" or nofollow, and whether there is moderation, rate limiting or spam filtering.',
    benign: 'Trusted staff-authored content, or output that passes through a sanitiser which also qualifies links.',
  },
  {
    id: 'ugc-links-unqualified', policy: P.ugc, oncePerFile: true, fileAbsent: /\bugc\b|nofollow/i,
    pattern: /\b(?:linkify|autolink|auto_link|urlize|anchorme)\b|\.replace\([^)\n]*https?[^)\n]*\)[^;\n]*<a\s+href/i,
    why: 'Turns plain URLs in text into links, and the file never mentions rel="ugc" or nofollow.',
    verify: 'Check whether the text comes from users and whether the generated anchors carry rel="ugc nofollow".',
    benign: 'Converting URLs in staff-written text, or qualification handled in another layer.',
  },
  // ---- Doorway abuse
  {
    id: 'doorway-cross-product', policy: P.doorway, multiline: true, nearLines: 6,
    pattern: new RegExp(String.raw`${LOOP}[\s\S]{0,300}?${LOOP}`),
    near: [ROUTE_WORDS, LIST_WORDS],
    why: 'Nested loops or flatMap over two lists near route or slug creation; a page per service x city combination is the doorway pattern.',
    verify: 'Compute how many URLs it emits and open the template: does each page carry unique, useful content, or do only the names change? Are empty variants still emitted?',
    benign: 'Generators over a small set of real, distinct entities (branch offices, products) where each page has its own data, and nested loops that only render navigation or menus.',
  },
  {
    id: 'doorway-static-params', policy: P.doorway, nearLines: 15,
    pattern: /\b(?:generateStaticParams|getStaticPaths|createPages?|getAllPaths|buildRoutes|generateRoutes|generatePages|buildPages|generate_pages)\b/,
    near: LIST_WORDS,
    why: 'Static-path generator that works from city, service or keyword lists.',
    verify: 'Check the source of the list, the number of paths and whether pages differ in substance.',
    benign: 'Generators for real catalogue items, branch pages or editorial content with distinct data per page.',
  },
  // ---- Scaled content abuse
  {
    id: 'scaled-llm-content', policy: P.scaled, nearLines: 6, oncePerFile: true,
    pattern: /\b(?:openai|@anthropic-ai\/sdk|anthropic|@google\/generative-ai|@google\/genai|google-genai|generateText|streamText|chat\.completions|messages\.create|responses\.create|generateContent|ChatCompletion|ChatOpenAI|ChatAnthropic|ollama)\b/i,
    near: /\b(?:article|articles|description|seo|content|meta|title|blog|posts?)\b/i,
    why: 'LLM SDK used near content, SEO or metadata words; generating many pages without adding value is scaled content abuse (how it is made does not matter).',
    verify: 'Trace the pipeline: input data, prompt, how many pages result, whether a person reviews them, and whether they are published automatically.',
    benign: 'Assistive features (drafting help for editors, summaries a person reviews), internal tooling, chat or support bots.',
  },
  {
    id: 'scaled-spinner', policy: P.scaled,
    pattern: /\bspintax\b|\bspin(?:_?text|Text|Content|Article|Words?)\b|synonym|thesaurus|paraphras|article.?rewrit|\{[\w ,']+(?:\|[\w ,']+){2,}\}/i,
    why: 'Text spinning or synonym replacement produces near-duplicate pages from one source.',
    verify: 'Check what text is transformed, where the output is published and how many variants are created.',
    benign: 'Search synonyms for query matching, thesaurus features in editors, i18n plural syntax.',
  },
  {
    id: 'scaled-template-meta', policy: P.scaled, nearLines: 6,
    pattern: /\b(?:title|pageTitle|metaTitle|seoTitle|description|metaDescription)\s*[:=]\s*`[^`$\n]*\$\{[^}\n]+\}(?:[^`$\n]*\$\{[^}\n]+\})?[^`$\n]*`|<title>[^<\n]*(?:<%[-=]|\{\{|<\?=)[^<\n]*(?:<%[-=]|\{\{|<\?=)[^<\n]*<\/title>|<meta\b[^>]*\bname=["']description["'][^>]*content=["'][^"'\n]*(?:<%[-=]|\{\{)[^"'\n]*(?:<%[-=]|\{\{)/i,
    near: /\b(?:cit(?:y|ies)|services?|locations?|areas?|towns?|suburbs?)\b/i,
    why: 'Title or meta description built from one template with a few variables near city, service or keyword lists; a sign many near-identical pages are generated.',
    verify: 'Check how many pages share the template and whether body content differs beyond the substituted names.',
    benign: 'Normal metadata templates for a modest number of distinct pages.',
  },
  // ---- Scraping
  {
    id: 'scraping-library-writes-content', policy: P.scraping, near: WRITES_CONTENT, nearLines: Infinity, oncePerFile: true,
    pattern: /\b(?:cheerio|puppeteer|playwright|jsdom|scrapy|BeautifulSoup|bs4|mechanize|nokogiri|goquery|jsoup|simple_html_dom|phpQuery|Goutte|HtmlAgilityPack|requests_html|selenium)\b/i,
    why: 'Scraping or headless-browser library in a file that also writes data; copied content republished without added value is scraping.',
    verify: 'Find what is fetched, where it is stored and published, and whether the source is cited and value is added.',
    benign: 'Tests, screenshots, link checkers, scraping your own site or licensed data.',
  },
  {
    id: 'scraping-feed-no-attribution', policy: P.scraping, near: WRITES_CONTENT, nearLines: Infinity, oncePerFile: true,
    fileAbsent: /\b(?:attribution|credit|sourceUrl|source_url|originalUrl|original_url|canonical|via)\b/i,
    pattern: /\b(?:rss-parser|feedparser|node-feedparser|SimplePie|simplexml_load_file|Feedjira|feedsmith)\b|\bparseURL\s*\(/i,
    why: 'Feed reader that stores items and never mentions a source or attribution field; republished feeds without a unique benefit are scraping.',
    verify: 'Check whether items are shown with a source link and what the site adds beyond the copied text.',
    benign: 'Aggregators that show headlines with links out, or feeds you own.',
  },
  // ---- Machine-generated traffic
  {
    id: 'traffic-google-search-requests', policy: P.traffic,
    soften: { re: /<a\s|href\s*=|\]\(https?/i, reason: 'plain link a person clicks, not an automated request' },
    pattern: /(?:https?:)?\/\/(?:www\.)?google\.(?:com|co\.[a-z]{2}|[a-z]{2,3})\/search\b|\b(?:serpapi|serp[-_ ]?api|serpstack|valueserp|dataforseo|zenserp|scaleserp|google-search-results|googlesearch(?:-python)?|google-it|rank[-_ ]?(?:tracker|checker)|check[-_ ]?rank|serp[-_]?scraper)\b/i,
    why: 'References google.*/search or a SERP-scraping client or rank checker; automated queries to Google without permission are machine-generated traffic.',
    verify: 'Check whether a script sends these requests (rank checking, result scraping) or whether it is only a link for visitors; check whether a licensed API is used.',
    benign: 'A link shown to people, documentation, or a licensed SERP data provider used within its terms.',
  },
  // ---- Hacked content (signals)
  {
    id: 'hacked-eval-decoded', policy: P.hacked, longLines: true,
    // JavaScript: eval/Function/document.write of decoded or packed text.
    // PHP: eval of base64/gzip input, /e replace, assert on request data.
    pattern: /\beval\s*\(\s*(?:atob|unescape|decodeURIComponent|String\.fromCharCode)\s*\(|document\.write\s*\(\s*(?:unescape|atob|decodeURIComponent)\s*\(|\b(?:new\s+)?Function\s*\(\s*(?:atob|unescape)\s*\(|\beval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k|\beval\s*\(\s*(?:base64_decode|gzinflate|gzuncompress|str_rot13|rawurldecode|stripslashes)\s*\(|\bgzinflate\s*\(\s*base64_decode|\bpreg_replace\s*\(\s*['"]\/[^'"]*\/[a-z]*e[a-z]*['"]|\bassert\s*\(\s*\$_(?:POST|REQUEST|GET)/i,
    why: 'Executes decoded, packed or encoded input (JavaScript or PHP), a common way to hide injected code and backdoors.',
    verify: 'Decode the payload, compare with git history and the deploy source, and check modification times; was it added by the team?',
    benign: 'Rare in first-party code; some legacy loaders, licence checkers and obfuscated plugins do it.',
  },
  {
    id: 'hacked-encoded-blob', policy: P.hacked, longLines: true, nearLines: 3,
    pattern: /(?:\\x[0-9a-f]{2}){30,}|(?<!base64,)["'][A-Za-z0-9+/]{300,}={0,2}["']/i,
    near: /\b(?:eval|Function|atob|fromCharCode|base64_decode|unescape|gzinflate)\b/,
    why: 'Long encoded string next to a decode-and-run call.',
    verify: 'Decode it and see what it does; check whether it appears in only a few template files.',
    benign: 'Embedded fonts, images or wasm that are decoded to data, not executed.',
  },
  {
    id: 'hacked-hidden-iframe', policy: P.hacked, longLines: true,
    soften: { re: /googletagmanager|\bgtm\b|ns\.html|analytics|hotjar|facebook\.com\/tr/i, reason: 'tag-manager or analytics noscript iframe' },
    pattern: /<iframe\b[^>]*(?:\b(?:width|height)\s*=\s*["']?0\b|display\s*:\s*none|visibility\s*:\s*hidden|(?:left|top)\s*:\s*-\d{3,}|\bhidden\b)/i,
    why: 'Zero-size or off-screen iframe, often used to load injected content or malware.',
    verify: 'Check the iframe source and whether the team added it.',
    benign: 'Tag manager and analytics noscript fallbacks, payment or auth helper frames.',
  },
  // ---- Thin affiliation
  {
    id: 'thin-affiliate-feed-description', policy: P.thin, nearLines: 15,
    pattern: /[?&]tag=[\w-]+|\baff(?:iliate)?_?id\b|\bamzn\.to\b|\bawin1?\.com\b|\bawinId\b|\badmitad\b|\bcj\.com\b|\banrdoezrs\b|\btkqlhce\b|\bpartnerize\b|\bprf\.hn\b|\bshareasale\b|\bimpact\.com\b|\bclickbank\b/i,
    near: /\.(?:description|desc|body_html|product_description|short_description)\b/i,
    why: 'Builds affiliate links next to product text passed straight from a feed field; copied merchant descriptions without added value are thin affiliation.',
    verify: 'Check whether the page adds its own reviews, comparisons, testing or price information, or only reprints the merchant text.',
    benign: 'Pages with original reviews or tooling that also show the merchant description as one part.',
  },
];

// ---------------------------------------------------------------- file selection
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', 'vendor', '.venv', '__pycache__']);
// Generated test and tooling artefacts; skipped and counted as "generated". Entries with "/" match parent/name.
const GENERATED_DIRS = new Set([
  'test-results', 'playwright-report', 'blob-report', '.playwright', 'cypress/screenshots', 'cypress/videos',
  'storybook-static', '.turbo', '.cache', '.output', '.svelte-kit', '.vercel', '.netlify',
]);
// Test source is still scanned (a helper there could hide a problem) but its findings are likely benign.
const TEST_CODE = {
  re: /(?:^|\/)(?:__tests__|__mocks__|tests?|e2e|cypress|playwright)\/|\.(?:test|spec|stories|cy)\.[^/]+$/i,
  reason: 'test code; not served to visitors or crawlers',
};
const LOCKFILES = new Set([
  'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock', 'gemfile.lock',
  'poetry.lock', 'pipfile.lock', 'cargo.lock', 'go.sum', 'bun.lockb',
]);
const WEB_EXT = new Set(
  'js jsx ts tsx mjs cjs vue svelte astro html htm css scss less php py rb go java cs twig liquid ejs hbs njk erb'.split(' ')
);
const CONFIG_JSON = /^(?:vercel|netlify|firebase|now|wrangler|staticwebapp\.config)\.json$|(?:redirects?|routes?|sitemap|robots|headers)[\w.-]*\.json$|^next\.config/i;
const MAX_BYTES = 1024 * 1024;

// This skill's own folder (parent of scripts/) is never scanned: its rule text and checker would only add noise.
const normPath = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
const OWN_DIR = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const OWN_SKILL = normPath(OWN_DIR);
function isOwnSkill(dir) {
  try {
    return normPath(realpathSync(dir)) === OWN_SKILL; // a strict subfolder of the skill is scanned normally
  } catch { return false; }
}
const countFiles = (d) => readdirSync(d, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? countFiles(join(d, e.name)) : e.isFile() ? 1 : 0), 0);

function kindOf(name) {
  const lower = name.toLowerCase();
  if (lower === '.htaccess' || lower === '_redirects' || lower === '_headers') return 'config';
  const ext = extname(lower).slice(1);
  if (WEB_EXT.has(ext)) return 'web';
  if (ext === 'md' || ext === 'mdx') return 'docs';
  if (ext === 'yml' || ext === 'yaml' || ext === 'conf') return 'config';
  if (ext === 'json' && CONFIG_JSON.test(lower)) return 'config';
  return null;
}

function* walk(dir, stats) {
  if (isOwnSkill(dir)) { stats.ownSkill += countFiles(dir); return; }
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  entries.sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (GENERATED_DIRS.has(e.name) || GENERATED_DIRS.has(`${basename(dir)}/${e.name}`)) stats.generated += countFiles(full);
      else if (!SKIP_DIRS.has(e.name)) yield* walk(full, stats);
      continue;
    }
    if (!e.isFile()) continue;
    const kind = kindOf(e.name);
    const lower = e.name.toLowerCase();
    if (LOCKFILES.has(lower)) stats.lockfile++;
    else if (/\.min\.[a-z]+$/.test(lower)) stats.minified++;
    else if (!kind) stats.unsupported++;
    else if (statSync(full).size > MAX_BYTES) stats.tooLarge++;
    else yield { full, kind };
  }
}

// ---------------------------------------------------------------- engine
function compile(rule) {
  const flags = rule.pattern.flags.replace('g', '');
  return {
    nearLines: 4, files: ['web'], ...rule, slug: slugOf(rule.policy),
    re: new RegExp(rule.pattern.source, rule.multiline ? flags + 'g' : flags),
    near: [].concat(rule.near || []), soften: [].concat(rule.soften || []),
  };
}

const lineStarts = (text) => {
  const s = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) s.push(i + 1);
  return s;
};
function lineAt(starts, off) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= off) lo = mid; else hi = mid - 1; }
  return lo;
}
function excerptOf(line, col) {
  const s = (line.length > 160 ? line.slice(Math.max(0, col - 40)) : line).replace(/\s+/g, ' ').trim();
  return s.length > 160 ? s.slice(0, 159) + '…' : s;
}
// Text of the CSS/code block that holds lines i..end: from the nearest line above that opens "{" (plus a
// preceding selector line ending in a comma) to the first closing "}". Without a block, just the match lines.
function blockContext(lines, i, end) {
  for (let k = i; k >= Math.max(0, i - 12); k--) {
    if (!lines[k].includes('{')) continue;
    let stop = k;
    while (stop < Math.min(lines.length - 1, k + 20) && !(stop >= end && lines[stop].includes('}'))) stop++;
    return lines.slice(k > 0 && /,\s*$/.test(lines[k - 1]) ? k - 1 : k, stop + 1).join('\n');
  }
  return lines.slice(i, end + 1).join('\n');
}

function findHits(rule, text, lines, starts) {
  const hits = [];
  if (rule.multiline) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text))) {
      if (m[0] === '') { rule.re.lastIndex++; continue; }
      hits.push({ m, off: m.index });
    }
  } else {
    lines.forEach((line, i) => {
      if (line.length > 3000 && !rule.longLines) return;
      const m = rule.re.exec(line);
      if (m) hits.push({ m, off: starts[i] + m.index });
    });
  }
  return hits;
}

function scanFile(rel, kind, text, rules, out) {
  const lines = text.split('\n');
  const starts = lineStarts(text);
  for (const rule of rules) {
    if (!rule.files.includes(kind) || (rule.path && !rule.path.test(rel)) || (rule.fileAbsent && rule.fileAbsent.test(text))) continue;
    const seen = new Set();
    for (const { m, off } of findHits(rule, text, lines, starts)) {
      const i = lineAt(starts, off);
      const end = lineAt(starts, off + m[0].length);
      if (seen.has(i)) continue;
      if (rule.near.length) {
        const win = rule.nearLines === Infinity ? text : lines.slice(Math.max(0, i - rule.nearLines), end + rule.nearLines + 1).join('\n');
        if (!rule.near.every((r) => r.test(win))) continue;
      }
      if (rule.accept && !rule.accept(m)) continue;
      if (rule.tagAbsent) {
        const tag = text.slice(off, off + 400);
        const close = tag.indexOf('>');
        if (rule.tagAbsent.test(close < 0 ? tag : tag.slice(0, close))) continue;
      }
      const ctx = `${rel}\n${blockContext(lines, i, end)}`;
      const soft = TEST_CODE.re.test(rel) ? TEST_CODE : rule.soften.find((s) => s.re.test(ctx));
      seen.add(i);
      // multi-line matches often start on a short line ("<p>"), so show up to three of their lines
      const shown = rule.multiline ? lines.slice(i, Math.min(end + 1, i + 3)).join(' ') : lines[i];
      const f = {
        rule: rule.id, policy: rule.policy, slug: rule.slug, file: rel, line: i + 1,
        excerpt: excerptOf(shown, rule.multiline ? 0 : off - starts[i]),
        why: rule.why, verify: rule.verify, benign: rule.benign, likelyBenign: !!soft,
      };
      if (soft) f.likelyBenignReason = soft.reason;
      out.push(f);
      if (rule.oncePerFile) break;
    }
  }
}

// ---------------------------------------------------------------- CLI
function parseArgs(argv) {
  const a = { dir: null, json: null, only: null, max: 25 };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--json') a.json = argv[++i];
    else if (v === '--only') a.only = (argv[++i] || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (v === '--max-per-rule') a.max = Math.max(1, parseInt(argv[++i], 10) || 25);
    else if (!v.startsWith('--') && !a.dir) a.dir = v;
  }
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dir) {
    console.error('Usage: node scan_source.mjs <dir> [--json <file>] [--only <policy-slug,...>] [--max-per-rule <n>]');
    process.exit(2);
  }
  const root = resolve(args.dir);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    console.error(`Directory not found: ${root}`);
    process.exit(2);
  }
  const all = RULES.map(compile);
  const known = new Set(all.map((r) => r.slug));
  if (args.only) for (const s of args.only) if (!known.has(s)) console.error(`Unknown policy slug "${s}". Known: ${[...known].join(', ')}`);
  const rules = args.only ? all.filter((r) => args.only.includes(r.slug)) : all;

  const stats = { lockfile: 0, minified: 0, unsupported: 0, tooLarge: 0, binary: 0, ownSkill: 0, generated: 0 };
  const raw = [];
  let scanned = 0;
  for (const { full, kind } of walk(root, stats)) {
    const buf = readFileSync(full);
    if (buf.subarray(0, 8000).includes(0)) { stats.binary++; continue; }
    scanned++;
    scanFile(relative(root, full).split(sep).join('/'), kind, buf.toString('utf8'), rules, raw);
  }
  const skipped = Object.values(stats).reduce((x, y) => x + y, 0);

  // order: policy, rule, then real leads before likely-benign ones, then file and line
  const ruleIdx = new Map(all.map((r, i) => [r.id, i]));
  const byPath = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line);
  raw.sort((a, b) => ruleIdx.get(a.rule) - ruleIdx.get(b.rule) || a.likelyBenign - b.likelyBenign || byPath(a, b));
  const perRule = new Map();
  const shown = [];
  const seenLine = new Set(); // one finding per policy and line; the earlier rule in the table wins
  const findings = raw.filter((f) => {
    const key = `${f.policy}|${f.file}|${f.line}`;
    if (seenLine.has(key)) return false;
    seenLine.add(key);
    const n = (perRule.get(f.rule) || 0) + 1;
    perRule.set(f.rule, n);
    if (n <= args.max) shown.push(f);
    return true;
  });
  const policies = [...new Set(rules.map((r) => r.policy))];
  const summary = policies.map((policy) => {
    const mine = findings.filter((f) => f.policy === policy);
    return {
      policy, slug: slugOf(policy), count: mine.length,
      likelyBenign: mine.filter((f) => f.likelyBenign).length,
      shown: shown.filter((f) => f.policy === policy).length,
    };
  });

  const why = Object.entries(stats).map(([k, v]) => `${k} ${v}`).join(', ');
  const out = [`Source scan: ${root}`, `Scanned ${scanned} files; skipped ${skipped} (${why}); ${rules.length} rules.`];
  if (stats.ownSkill) out.push(`Skipped ${stats.ownSkill} files of the scanner's own skill folder: ${OWN_DIR}`);
  out.push('');
  for (const s of summary.filter((x) => x.count)) {
    out.push(`## ${s.policy} (${s.count})`);
    for (const rule of rules.filter((r) => r.policy === s.policy)) {
      for (const f of shown.filter((x) => x.rule === rule.id)) {
        out.push(`${f.file}:${f.line}  ${f.excerpt}${f.likelyBenign ? `   [likely benign: ${f.likelyBenignReason}]` : ''}`);
        out.push(`  why:    ${f.why}`, `  verify: ${f.verify}`, `  benign: ${f.benign}`);
      }
      const extra = (perRule.get(rule.id) || 0) - args.max;
      if (extra > 0) out.push(`  +${extra} more for rule ${rule.id} (raise --max-per-rule to see them)`);
    }
    out.push('');
  }
  if (!findings.length) out.push('No findings.', '');
  const w = Math.max(...summary.map((s) => s.policy.length), 6);
  out.push('Summary', `${'Policy'.padEnd(w)}  Findings  Likely benign`);
  for (const s of summary) out.push(`${s.policy.padEnd(w)}  ${String(s.count).padStart(8)}  ${String(s.likelyBenign).padStart(13)}`);
  const totalBenign = findings.filter((f) => f.likelyBenign).length;
  out.push(`${'Total'.padEnd(w)}  ${String(findings.length).padStart(8)}  ${String(totalBenign).padStart(13)}`, '');
  out.push('Notice: findings are leads for review, not violations. '
    + 'Google\'s policies depend on intent and on what users and crawlers actually receive.');
  console.log(out.join('\n'));

  if (args.json) {
    const report = { root, scannedFiles: scanned, skippedFiles: skipped, skippedBreakdown: stats, findings: shown, summary };
    writeFileSync(resolve(args.json), JSON.stringify(report, null, 2));
  }
}

main();
