#!/usr/bin/env node
/*
 * check_site.mjs - measures what a live site serves to different visitors and how its pages are templated.
 *
 * Usage: node check_site.mjs <url> [--sample <n>] [--urls <file>] [--sitemap <url>] [--delay <ms>] [--out <dir>] [--no-bot-ua]
 *
 * Zero dependencies (node: built-ins and global fetch). Output is a Markdown report of MEASUREMENTS and LEADS,
 * never verdicts. Exit code: 0 on completion, 2 on unusable input or an unfetchable start URL.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const USAGE =
  'Usage: node check_site.mjs <url> [--sample <n>] [--urls <file>] [--sitemap <url>] [--delay <ms>] [--out <dir>] [--no-bot-ua]';
const UA = {
  browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  googlebot:
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'search-referrer':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
};
// All thresholds are heuristics chosen for triage, not Google criteria. They are printed in the report.
const TH = {
  similarity: 0.8,
  hiddenWords: 15,
  hiddenLinks: 2,
  keywordsMeta: 15,
  phraseCount: 12,
  phraseShare: 0.03,
  listRun: 25,
  boilerplateAt: 0.6,
  nearDup: 0.9,
  thinUnique: 40,
  jsWords: 50,
  noscriptLinks: 5,
  siteWide: 0.9,
};
const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|ico|pdf|zip|gz|css|js|json|xml|txt|mp4|mp3|woff2?)$/i;
const CHALLENGE = /just a moment|cf-challenge|attention required|captcha|access denied|verify you are human|are you a robot/i;
const STOP_WORDS = 'a an the and or of to in on at for with by from is are was were be this that it as your our you we i my not';
const STOP = new Set(STOP_WORDS.split(' '));
const REDIRECT_LIMIT = 5;
const BODY_CAP_BYTES = 3e6;
const REQUEST_TIMEOUT_MS = 20000;

let opts;
let origin;
let lastReq = 0;
let reqCount = 0;

// ---------- small helpers ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pct = (x) => (x == null ? 'n/a' : Math.round(x * 100) + '%');
const num = (x) => (x == null ? 'n/a' : String(Math.round(x * 10) / 10));
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ');
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const code = (s) => '`' + s + '`';

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function tryUrl(u, base) {
  try {
    return new URL(u, base);
  } catch {
    return null;
  }
}

function short(u) {
  const parsed = tryUrl(u);
  if (!parsed) return u;
  const shown = parsed.origin === origin ? parsed.pathname + parsed.search : u;
  return trunc(shown, 70);
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const x of a) {
    if (b.has(x)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntity(match, entity) {
  if (entity[0] !== '#') return NAMED_ENTITIES[entity.toLowerCase()];
  const isHex = entity[1].toLowerCase() === 'x';
  const codePoint = isHex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
  return codePoint > 0 && codePoint < 0x110000 ? String.fromCodePoint(codePoint) : ' ';
}

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, decodeEntity);
}

// approximate registrable host, no public-suffix list
function regHost(host) {
  const h = host.toLowerCase().replace(/^www\./, '');
  if (!h.includes('.') || /^[\d.]+$/.test(h) || h.includes(':')) return h;
  const parts = h.split('.');
  const secondLevelLabels = ['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'];
  const threeLabels = parts.length > 2 && parts.at(-1).length === 2 && secondLevelLabels.includes(parts.at(-2));
  return parts.slice(threeLabels ? -3 : -2).join('.');
}

const ATTR_RE = /([^\s=\/"'<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function attrs(s) {
  const out = {};
  for (const m of s.matchAll(ATTR_RE)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

function metaTags(html) {
  return [...html.matchAll(/<meta\b([^>]*)>/gi)].map((m) => attrs(m[1]));
}

// ---------- network ----------
async function readBodyCapped(res) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of res.body) {
    chunks.push(chunk);
    bytes += chunk.length;
    if (bytes >= BODY_CAP_BYTES) break;
  }
  return { body: Buffer.concat(chunks).toString('utf8'), bytes };
}

async function fetchOnce(url, headers, redirect = 'manual') {
  const wait = lastReq + opts.delay - Date.now();
  if (wait > 0) await sleep(wait);
  reqCount++;
  try {
    const res = await fetch(url, {
      redirect,
      headers: { accept: 'text/html,application/xml;q=0.9,*/*;q=0.8', ...headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const isRedirect = res.status >= 300 && res.status < 400 && res.headers.get('location');
    let read = { body: '', bytes: 0 };
    if (!isRedirect && res.body) {
      read = await readBodyCapped(res);
    } else {
      await res.body?.cancel();
    }
    return { status: res.status, headers: res.headers, body: read.body, bytes: read.bytes };
  } catch (e) {
    return { error: e.name === 'TimeoutError' ? 'timeout' : e.cause?.code || e.message };
  } finally {
    lastReq = Date.now();
  }
}

async function getPage(url, variant, robots) {
  const headers = { 'user-agent': UA[variant] };
  if (variant === 'search-referrer') headers.referer = 'https://www.google.com/';
  const rec = { variant, url, chain: [] };
  let cur = url;
  for (;;) {
    if (tryUrl(cur).origin === origin && !robots.allowed(cur)) return { ...rec, blocked: cur };
    const r = await fetchOnce(cur, headers);
    if (r.error) return { ...rec, error: r.error };
    const loc = r.headers.get('location');
    if (r.status >= 300 && r.status < 400 && loc) {
      const next = new URL(loc, cur).href;
      rec.chain.push({ status: r.status, from: cur, to: next });
      // off-site destinations are recorded, never fetched
      if (tryUrl(next).origin !== origin) return { ...rec, finalUrl: next, status: r.status, offsite: true };
      if (rec.chain.length > REDIRECT_LIMIT) return { ...rec, error: 'more than 5 redirects' };
      cur = next;
      continue;
    }
    const contentType = r.headers.get('content-type') || '';
    const isMarkup = /html|xml/i.test(contentType) || !contentType;
    const out = {
      ...rec,
      finalUrl: cur,
      status: r.status,
      contentType: contentType.split(';')[0],
      bytes: r.bytes,
      xRobots: r.headers.get('x-robots-tag') || '',
      _html: isMarkup ? r.body : '',
    };
    return Object.assign(out, extract(out._html, cur));
  }
}

// ---------- robots.txt ----------
function parseRobotsGroups(text) {
  const groups = [];
  const sitemaps = [];
  let cur = null;
  let lastWasUserAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.replace(/#.*/, '').trim().match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === 'user-agent') {
      if (!cur || !lastWasUserAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(value.toLowerCase());
      lastWasUserAgent = true;
      continue;
    }
    lastWasUserAgent = false;
    if (field === 'sitemap') {
      sitemaps.push(value);
    } else if ((field === 'allow' || field === 'disallow') && cur && value) {
      cur.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return { groups, sitemaps };
}

function ruleRegex(path) {
  const escaped = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + escaped.replace(/\*/g, '.*').replace(/\\\$$/, '$'));
}

// longest matching rule wins; Allow wins a tie; no matching rule means allowed
function isAllowed(rules, url) {
  const u = tryUrl(url);
  const target = u.pathname + u.search;
  let best = null;
  for (const rule of rules) {
    if (!ruleRegex(rule.path).test(target)) continue;
    const longer = best && rule.path.length > best.path.length;
    const tieAllow = best && rule.path.length === best.path.length && rule.allow;
    if (!best || longer || tieAllow) best = rule;
  }
  return !best || best.allow;
}

function parseRobots(text) {
  const { groups, sitemaps } = parseRobotsGroups(text);
  const rulesFor = (agent) => {
    const specific = groups.filter((g) => g.agents.includes(agent));
    const chosen = specific.length ? specific : groups.filter((g) => g.agents.includes('*'));
    return chosen.flatMap((g) => g.rules);
  };
  const star = rulesFor('*');
  const bot = rulesFor('googlebot');
  return {
    sitemaps,
    star,
    bot,
    allowed: (u) => isAllowed(star, u),
    allowedForGooglebot: (u) => isAllowed(bot, u),
  };
}

// ---------- candidate URLs ----------
function cleanUrl(u, base) {
  const parsed = tryUrl(u, base);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return null;
  parsed.hash = '';
  return parsed.href;
}

const LOC_RE = /<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi;

async function readSitemaps(start) {
  const queue = [...start];
  const seen = new Set();
  const urls = [];
  const notes = [];
  let files = 0;
  while (queue.length && files < 50 && urls.length < 50000) {
    const sm = queue.shift();
    if (seen.has(sm)) continue;
    seen.add(sm);
    if (/\.gz$/i.test(sm)) {
      notes.push(`${sm}: gzip sitemap not read`);
      continue;
    }
    const r = await fetchOnce(sm, { 'user-agent': UA.browser }, 'follow');
    files++;
    if (r.error || r.status !== 200) {
      notes.push(`${sm}: ${r.error || 'HTTP ' + r.status}`);
      continue;
    }
    const locs = [...r.body.matchAll(LOC_RE)].map((m) => decode(m[1]));
    if (/<sitemapindex/i.test(r.body)) queue.push(...locs);
    else urls.push(...locs);
  }
  if (queue.length) notes.push('sitemap file cap (50) or URL cap (50,000) reached; remaining sitemaps not read');
  return { urls: urls.slice(0, 50000), files, notes };
}

function sameHostLinks(html, base) {
  const siteHost = tryUrl(origin).host;
  return [...html.matchAll(/<a\b([^>]*)>/gi)]
    .map((m) => attrs(m[1]).href)
    .filter(Boolean)
    .map((href) => cleanUrl(href, base))
    .filter((u) => u && tryUrl(u).host === siteHost);
}

function sitemapStarts(robots) {
  if (opts.sitemap) return [opts.sitemap];
  if (robots.sitemaps.length) return robots.sitemaps;
  return [origin + '/sitemap.xml'];
}

// ---------- templates ----------
function normSeg(seg) {
  const variable =
    /^\d+$/.test(seg) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(seg) ||
    /^[0-9a-f]{12,}$/i.test(seg) ||
    seg.split('-').length >= 5 ||
    seg.length >= 40;
  return variable ? '{}' : seg;
}

const stemOf = (value) => value.split('-').slice(0, 2).join('-') + '-{}';

// a value like "locksmith-in-riga" belongs to stem "locksmith-in-{}" when at least 5 siblings share it
function isStemmed(value, stems) {
  return value !== '{}' && value.split('-').length >= 3 && stems.get(stemOf(value)) >= 5;
}

function decodeURIComponentSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// Groups sibling segments (same already-masked prefix) at depth d and decides how each value is labelled.
function labelSiblings(values, d) {
  const stems = new Map();
  for (const v of values.keys()) {
    if (v !== '{}' && v.split('-').length >= 3) stems.set(stemOf(v), (stems.get(stemOf(v)) || 0) + 1);
  }
  const rest = [...values.keys()].filter((v) => !isStemmed(v, stems));
  const leafCount = rest.reduce((sum, v) => sum + values.get(v).leaf, 0);
  const total = rest.reduce((sum, v) => sum + values.get(v).n, 0);
  const leafShare = leafCount / Math.max(1, total);
  const maskRest = d === 0 ? rest.length > 30 : rest.length >= 5 && leafShare >= 0.8;
  return (v) => {
    if (isStemmed(v, stems)) return stemOf(v);
    return maskRest ? '{}' : v;
  };
}

function patternsFor(urls) {
  const segs = urls.map((u) => tryUrl(u).pathname.split('/').filter(Boolean).map(decodeURIComponentSafe));
  const out = segs.map(() => []);
  const depth = Math.max(0, ...segs.map((s) => s.length));
  for (let d = 0; d < depth; d++) {
    const groups = new Map();
    segs.forEach((s, i) => {
      if (s.length <= d) return;
      const key = out[i].join('/');
      groups.set(key, [...(groups.get(key) || []), i]);
    });
    for (const idxs of groups.values()) {
      const values = new Map();
      for (const i of idxs) {
        const v = normSeg(segs[i][d]);
        const entry = values.get(v) || { n: 0, leaf: 0 };
        entry.n++;
        if (segs[i].length === d + 1) entry.leaf++;
        values.set(v, entry);
      }
      const label = labelSiblings(values, d);
      for (const i of idxs) out[i].push(label(normSeg(segs[i][d])));
    }
  }
  return out.map((s) => '/' + s.join('/'));
}

// first, last, middle, then farthest-point fill
function spread(list, k, must) {
  const n = list.length;
  const pick = [];
  const add = (i) => {
    if (i >= 0 && i < n && !pick.includes(i)) pick.push(i);
  };
  if (must != null) add(list.indexOf(must));
  for (const i of [0, n - 1, n >> 1]) {
    if (pick.length < k) add(i);
  }
  while (pick.length < k && pick.length < n) {
    let bestIndex = -1;
    let bestDistance = -1;
    for (let i = 0; i < n; i++) {
      if (pick.includes(i)) continue;
      const distance = Math.min(...pick.map((p) => Math.abs(p - i)));
      if (distance > bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    add(bestIndex);
  }
  return pick.slice(0, k).map((i) => list[i]);
}

function chooseSample(groups, budget, startUrl) {
  const gs = [...groups].sort((a, b) => b.urls.length - a.urls.length);
  const quota = new Map(gs.map((g) => [g.pattern, 0]));
  let left = budget;
  for (const g of gs) {
    const take = Math.min(2, g.urls.length, left);
    quota.set(g.pattern, take);
    left -= take;
  }
  // proportional top-up (D'Hondt)
  const priority = (g) => g.urls.length / (quota.get(g.pattern) + 1);
  while (left > 0) {
    let best = null;
    for (const g of gs) {
      if (quota.get(g.pattern) >= g.urls.length) continue;
      if (!best || priority(g) > priority(best)) best = g;
    }
    if (!best) break;
    quota.set(best.pattern, quota.get(best.pattern) + 1);
    left--;
  }
  const selected = [];
  for (const g of gs) {
    const k = quota.get(g.pattern);
    const must = g.urls.includes(startUrl) ? startUrl : null;
    if (k > 0) {
      selected.push(...spread(g.urls, k, must).map((url) => ({ url, pattern: g.pattern })));
    } else if (must && selected.length < budget) {
      selected.push({ url: must, pattern: g.pattern });
    }
  }
  return selected;
}

// ---------- page extraction and checks ----------
function stripBlocks(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|head)\b[\s\S]*?<\/\1\s*>/gi, ' ');
}

function toText(html) {
  return decode(stripBlocks(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const tokenize = (text) => text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];

function shingles(tokens) {
  if (tokens.length < 5) return tokens.length ? [tokens.join(' ')] : [];
  const out = [];
  for (let i = 0; i + 5 <= tokens.length; i++) {
    out.push(tokens.slice(i, i + 5).join(' '));
  }
  return out;
}

function extract(html, url) {
  const text = toText(html);
  const tokens = tokenize(text);
  const sh = shingles(tokens);
  const metas = metaTags(html);
  const meta = (name) => metas.find((m) => (m.name || '').toLowerCase() === name)?.content ?? '';
  const links = [...html.matchAll(/<link\b([^>]*)>/gi)].map((m) => attrs(m[1]));
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonical = links.find((l) => (l.rel || '').toLowerCase() === 'canonical');
  const alternates = links.filter((l) => /alternate/i.test(l.rel || '') && l.hreflang);
  return {
    title: titleMatch ? decode(titleMatch[1]).replace(/\s+/g, ' ').trim() : '',
    description: decode(meta('description')).trim(),
    robotsMeta: meta('robots'),
    canonical: canonical?.href ?? '',
    hreflang: alternates.length,
    words: tokens.length,
    _text: text,
    _tokens: tokens,
    _shingles: sh,
    _set: new Set(sh),
  };
}

function elementEnd(html, start, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return -1;
}

const ZERO_HEIGHT = 'zero height + overflow:hidden';
const HIDERS = [
  ['display:none', /display:none/],
  ['visibility:hidden', /visibility:hidden/],
  ['font-size:0', /font-size:0(px|em|rem|pt|%)?(;|!|$)/],
  ['opacity:0', /opacity:0(;|!|$)/],
  ['negative text-indent', /text-indent:-/],
  ['large negative offset', /(left|right|top|bottom|margin-left|margin-top):-\d{3,}/],
  [ZERO_HEIGHT, /(^|;)(max-)?height:0(px)?(;|$)/],
];
const BENIGN_CLASS = /\b(accordion|tabs?|carousel|sliders?|slide|tooltip|modal|menu|dropdown|collapse|collapsible|popover|drawer)\b/i;
const SR_CLASS = /sr-only|visually-hidden|screen-reader/i;
const AFFILIATE = /[?&](aff\w*|ref|refid|partner\w*|utm_\w+|tag|clickid|subid|irclickid)=|\/(aff|affiliate|partner|refer)\/|awin1\.com|shareasale|clickbank|linksynergy|tradedoubler|admitad|amzn\.to|sjv\.io|pxf\.io|anrdoezrs|dpbolvw|jdoqocy|tkqlhce/i;
const SKIPPED_HIDDEN_TAGS = /^(html|body|head|script|style|iframe|meta|link|input)$/;
const STYLED_TAG_RE = /<([a-z][a-z0-9]*)\b([^>]*\bstyle\s*=[^>]*)>/gi;
const HIDDEN = 'Hidden text and link abuse';

const compactStyle = (a) => (a.style || '').toLowerCase().replace(/\s+/g, '');

function hiddenElementLeads(html, lead) {
  const covered = [];
  const controlled = [...html.matchAll(/aria-controls\s*=\s*["']([^"']+)["']/gi)].flatMap((m) => m[1].split(/\s+/));
  const referenced = new Set(controlled);
  for (const m of html.matchAll(STYLED_TAG_RE)) {
    const tag = m[1].toLowerCase();
    if (SKIPPED_HIDDEN_TAGS.test(tag)) continue;
    if (covered.some(([from, to]) => m.index >= from && m.index < to)) continue;
    const a = attrs(m[2]);
    const style = compactStyle(a);
    const reasons = HIDERS.filter(([, re]) => re.test(style)).map(([name]) => name);
    const shown = reasons.filter((r) => r !== ZERO_HEIGHT || /overflow:hidden/.test(style));
    if (!shown.length) continue;
    if (SR_CLASS.test(a.class || '')) continue;
    const end = elementEnd(html, m.index, tag);
    if (end < 0) continue;
    covered.push([m.index, end]);
    const inner = html.slice(m.index, end);
    const words = tokenize(toText(inner)).length;
    const links = (inner.match(/<a\b[^>]*href/gi) || []).length;
    if (words < TH.hiddenWords && links < TH.hiddenLinks) continue;
    const benign =
      BENIGN_CLASS.test(a.class || '') || 'aria-hidden' in a || 'aria-controls' in a || referenced.has(a.id);
    const classAttr = a.class ? ' class="' + a.class + '"' : '';
    lead(HIDDEN, `inline style (${shown.join(', ')})`, `<${tag}${classAttr}> holds ${words} words and ${links} links`, benign);
  }
}

function hiddenBlockLeads(html, lead) {
  for (const m of html.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)) {
    const n = (m[1].match(/<a\b[^>]*href/gi) || []).length;
    if (n >= TH.noscriptLinks) lead(HIDDEN, '<noscript> with many links', `${n} links inside <noscript>`);
  }
  const punct = [...html.matchAll(/<a\b([^>]*)>\s*([^\p{L}\p{N}\s<])\s*<\/a>/gu)].filter((m) => attrs(m[1]).href);
  if (punct.length) {
    const first = punct[0];
    const detail = `${punct.length} link(s), e.g. text "${first[2]}" -> ${attrs(first[1]).href}`;
    const benign = punct.every((m) => /close|prev|next|arrow|button/i.test(m[1]));
    lead(HIDDEN, 'link on one punctuation character', detail, benign);
  }
}

function keywordLeads(html, ex, lead) {
  const kw = metaTags(html).find((m) => (m.name || '').toLowerCase() === 'keywords')?.content;
  const terms = kw ? kw.split(',').filter((x) => x.trim()).length : 0;
  if (terms > TH.keywordsMeta) lead('Keyword stuffing', 'meta keywords', `${terms} terms in meta keywords`);
  const phrases = topPhrases(ex._tokens);
  const flagged = phrases.filter((p) => p.count > TH.phraseCount && p.share > TH.phraseShare);
  const stuffed = flagged.sort((a, b) => b.n - a.n || b.count - a.count)[0];
  if (stuffed) {
    lead('Keyword stuffing', 'repeated phrase', `"${stuffed.phrase}" x${stuffed.count} (${pct(stuffed.share)} of words)`);
  }
  const run = longestRun(ex._text);
  if (run >= TH.listRun) lead('Keyword stuffing', 'long separated list', `${run} consecutive short comma/pipe-separated items`);
  return phrases;
}

function linkInfo(html, url, lead) {
  const host = tryUrl(url).hostname;
  const hosts = new Map();
  const affiliate = [];
  let total = 0;
  let qualified = 0;
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const a = attrs(m[1]);
    const u = a.href && cleanUrl(a.href, url);
    if (!u) continue;
    const parsed = new URL(u);
    if (regHost(parsed.hostname) === regHost(host)) continue;
    total++;
    const isQualified = /\b(sponsored|nofollow|ugc)\b/i.test(a.rel || '');
    if (isQualified) qualified++;
    const entry = hosts.get(parsed.hostname) || { n: 0, unq: 0 };
    entry.n++;
    if (!isQualified) entry.unq++;
    hosts.set(parsed.hostname, entry);
    if (!isQualified && AFFILIATE.test(u)) affiliate.push(u);
  }
  if (affiliate.length) {
    const detail = `${affiliate.length} link(s), e.g. ${trunc(affiliate[0], 90)}`;
    lead('Link spam', 'unqualified outbound links with affiliate/tracking markers', detail);
  }
  return {
    total,
    qualified,
    unqualified: total - qualified,
    affiliateUnqualified: affiliate,
    hosts: Object.fromEntries(hosts),
  };
}

const LOCATION_RE = /\blocation(\.(href|replace|assign))?\s*(=|\()/g;
const REFERRER_OR_UA_RE = /document\.referrer|navigator\.userAgent|\buserAgent\b/g;
const OBFUSCATION_RE = /eval\s*\(\s*(atob|unescape)\s*\(|document\.write\s*\(\s*unescape\s*\(|\bunescape\s*\(\s*['"]%/;

function redirectAndScriptLeads(html, lead) {
  for (const m of html.matchAll(/<meta\b([^>]*)>/gi)) {
    const a = attrs(m[1]);
    if ((a['http-equiv'] || '').toLowerCase() === 'refresh') lead('Sneaky redirects', 'meta refresh', `content="${a.content}"`);
  }
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attrs(m[1]).src) continue;
    const script = m[2];
    if (near(script, LOCATION_RE, REFERRER_OR_UA_RE, 400)) {
      lead(
        'Sneaky redirects',
        'script redirect near referrer/UA test',
        'inline script assigns location close to document.referrer or navigator.userAgent',
      );
    }
    if (near(script, /history\.pushState/g, /popstate/g, 600)) {
      lead(
        'Malicious practices',
        'history.pushState near popstate (possible back button hijacking)',
        'inline script; verify behaviour of the Back button in a browser',
      );
    }
    if (OBFUSCATION_RE.test(script)) {
      lead('Hacked content', 'obfuscated script pattern', 'eval(atob(…)) / unescape(…) pattern in inline script');
    }
  }
}

function iframeLeads(html, lead) {
  for (const m of html.matchAll(/<iframe\b([^>]*)>/gi)) {
    const a = attrs(m[1]);
    const style = compactStyle(a);
    const tinyAttr = /^[01](px)?$/.test(a.width || '') || /^[01](px)?$/.test(a.height || '');
    const tinyStyle = /(^|;)(width|height):[01]?(px)?(;|$)/.test(style);
    const hiddenStyle = /left:-\d{3,}|display:none|visibility:hidden/.test(style);
    if (tinyAttr || tinyStyle || hiddenStyle) {
      lead('Malicious practices', 'zero-size or hidden iframe', `iframe src=${a.src || '(none)'}`);
    }
  }
}

function pageChecks(html, url, ex) {
  const leads = [];
  const lead = (policy, kind, detail, benign = false) => leads.push({ policy, kind, detail, benign });
  hiddenElementLeads(html, lead);
  hiddenBlockLeads(html, lead);
  const phrases = keywordLeads(html, ex, lead);
  const links = linkInfo(html, url, lead);
  redirectAndScriptLeads(html, lead);
  iframeLeads(html, lead);
  // JavaScript dependence
  const external = (html.match(/<script\b[^>]*\bsrc=/gi) || []).length;
  const inlineScripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const inlineBytes = inlineScripts.reduce((sum, m) => sum + m[1].length, 0);
  const jsDependent = ex.words < TH.jsWords && (external >= 1 || inlineBytes > 20000);
  return { leads, links, phrases, jsDependent, scripts: { external, inlineBytes } };
}

function topPhrases(tokens) {
  const out = [];
  const total = tokens.length;
  for (const n of [2, 3]) {
    const counts = new Map();
    for (let i = 0; i + n <= total; i++) {
      const gram = tokens.slice(i, i + n);
      if (STOP.has(gram[0]) || STOP.has(gram[n - 1])) continue;
      const key = gram.join(' ');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const [phrase, count] of counts) {
      if (count >= 3) out.push({ phrase, count, n, share: (count * n) / total });
    }
  }
  return out.sort((a, b) => b.count - a.count || b.n - a.n).slice(0, 8);
}

function longestRun(text) {
  let best = 0;
  let run = 0;
  for (const part of text.split(/[,|]/)) {
    const words = part.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 1 && words <= 4) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

function near(s, reA, reB, win) {
  const a = [...s.matchAll(reA)].map((m) => m.index);
  const b = [...s.matchAll(reB)].map((m) => m.index);
  return a.some((x) => b.some((y) => Math.abs(x - y) <= win));
}

// ---------- variant comparison ----------
function redirectText(b, v) {
  const bRedirects = b.chain.length > 0;
  const vRedirects = v.chain.length > 0;
  if (vRedirects && !bRedirects) {
    return `${v.variant} redirected (${v.chain[0].status}) to ${short(v.finalUrl)}, browser stayed on the page`;
  }
  if (bRedirects && !vRedirects) return `browser redirected to ${short(b.finalUrl)}, ${v.variant} did not`;
  return `final destination differs: ${short(b.finalUrl)} vs ${short(v.finalUrl)}`;
}

function artefactText(b, v) {
  const challenge = v.status === 200 ? ' (challenge-like page)' : '';
  return (
    `${v.variant} got ${v.status}${challenge} while browser got ${b.status}; ` +
    'bot protection or CDN may block a spoofed UA - verify in URL Inspection, not evidence of cloaking'
  );
}

function isToolingArtefact(b, v) {
  if (v.status >= 400 && b.status < 400) return true;
  const vChallenge = CHALLENGE.test((v._text || '').slice(0, 3000));
  const bChallenge = CHALLENGE.test((b._text || '').slice(0, 3000));
  return v.status === 200 && vChallenge && !bChallenge;
}

function contentFlag(b, v, sim) {
  const extra = v.words - b.words;
  const isBot = v.variant === 'googlebot';
  const label = isBot ? 'Cloaking' : 'Cloaking (content differs by referrer / mobile UA)';
  const who = isBot ? 'crawler UA' : v.variant;
  const delta = extra >= 0 ? extra + ' extra' : -extra + ' fewer';
  return { label, text: `${who} receives ${delta} words, similarity ${num(sim)}` };
}

function compare(b, v) {
  const flags = [];
  if (!b || b.error || b.blocked || !v) return { flags, sim: null };
  if (v.error || v.blocked) {
    const text = `${v.variant} request failed (${v.error || 'robots'})`;
    return { flags: [{ label: 'Tooling', text }], sim: null };
  }
  if (isToolingArtefact(b, v)) {
    return { flags: [{ label: 'Tooling artefact?', text: artefactText(b, v) }], sim: null };
  }
  const bHost = tryUrl(b.finalUrl)?.host;
  const vHost = tryUrl(v.finalUrl)?.host;
  const sim = v.offsite ? null : jaccard(b._set, v._set);
  const bRedirects = b.chain.length > 0;
  const vRedirects = v.chain.length > 0;
  if (bHost !== vHost || bRedirects !== vRedirects || b.finalUrl !== v.finalUrl) {
    flags.push({ label: 'Sneaky redirects', text: redirectText(b, v) });
  } else if (sim != null && sim < TH.similarity) {
    flags.push(contentFlag(b, v, sim));
  } else if (v.status !== b.status) {
    flags.push({ label: 'Cloaking / Sneaky redirects', text: `status differs: ${b.status} vs ${v.status}` });
  }
  return { flags, sim };
}

function variantCell(r, sim) {
  if (!r) return 'skipped';
  if (r.error) return `error: ${r.error}`;
  if (r.blocked) return 'not requested (robots.txt)';
  if (r.offsite) return `${r.chain[0].status} -> ${trunc(r.finalUrl, 60)} (off-site, not fetched)`;
  const hop = r.chain.length ? `${r.chain[0].status} -> ${short(r.finalUrl)}, ` : '';
  const similarity = sim != null ? `, similarity ${num(sim)}` : '';
  return `${hop}${r.status}, ${r.words} words${similarity}`;
}

// ---------- template analysis ----------
function maskPatterns(values) {
  const tokenLists = values.map((v) => v.split(/\s+/).filter(Boolean));
  const df = new Map();
  const counts = new Map();
  tokenLists.forEach((tokens) => new Set(tokens).forEach((x) => df.set(x, (df.get(x) || 0) + 1)));
  const need = values.length < 2 ? 1 : Math.ceil(values.length * 0.5);
  for (const tokens of tokenLists) {
    const masked = [];
    for (const x of tokens) {
      if (df.get(x) >= need) masked.push(x);
      else if (masked.at(-1) !== '{}') masked.push('{}');
    }
    const key = masked.join(' ');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function addBoilerplateMetrics(pages, df) {
  const n = pages.length;
  const need = Math.ceil(n * TH.boilerplateAt);
  for (const p of pages) {
    if (n < 2) {
      p.boiler = null;
      p.unique = null;
      continue;
    }
    let common = 0;
    p._set.forEach((s) => {
      if (df.get(s) >= need) common++;
    });
    p.boiler = p._set.size ? common / p._set.size : null;
    // a word is unique when it sits only inside shingles that no sibling has (a swapped city name is ~1 word, not 9)
    const uniq = new Set();
    const shared = new Set();
    p._shingles.forEach((s, i) => {
      for (let k = 0; k < 5 && i + k < p._tokens.length; k++) {
        (df.get(s) === 1 ? uniq : shared).add(i + k);
      }
    });
    p.unique = [...uniq].filter((i) => !shared.has(i)).length;
  }
}

// Second view: mask words found on only one page of the pattern, so pages that differ by a swapped-in name still match.
// Pages that are mostly such words (> 25 %) are genuinely different and are not compared this way.
function addMaskedShingles(pages) {
  const n = pages.length;
  const tokenDf = new Map();
  pages.forEach((p) => new Set(p._tokens).forEach((t) => tokenDf.set(t, (tokenDf.get(t) || 0) + 1)));
  for (const p of pages) {
    const masked = p._tokens.map((t) => (n >= 3 && tokenDf.get(t) === 1 ? '{}' : t));
    p._maskedShare = masked.filter((t) => t === '{}').length / Math.max(1, masked.length);
    p._mset = new Set(shingles(masked));
  }
}

function templateStats(pages) {
  const n = pages.length;
  const df = new Map();
  const pairs = [];
  pages.forEach((p) => p._set.forEach((s) => df.set(s, (df.get(s) || 0) + 1)));
  addBoilerplateMetrics(pages, df);
  addMaskedShingles(pages);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = pages[i];
      const b = pages[j];
      if (!a._set.size) continue;
      const literal = jaccard(a._set, b._set);
      const maskable = a._maskedShare <= 0.25 && b._maskedShare <= 0.25;
      const masked = maskable ? jaccard(a._mset, b._mset) : 0;
      if (literal >= TH.nearDup) {
        pairs.push({ a: a.url, b: b.url, similarity: literal, view: 'literal' });
      } else if (masked >= TH.nearDup) {
        pairs.push({ a: a.url, b: b.url, similarity: masked, view: 'after masking page-unique words' });
      }
    }
  }
  return { pairs };
}

const EMPTY = /no (results|products|items|offers|listings) (found|available)|nothing found|0 results|no results found|nav?ei rezult[aā]tu|нет результатов|ничего не найдено/i;
const LIST_CONTAINER_RE = /<(div|ul|section)\b([^>]*\b(?:class|id)\s*=\s*["'][^"']*(?:results|listing|product-?list)[^"']*["'][^>]*)>/gi;

function emptyContainer(html) {
  for (const m of html.matchAll(LIST_CONTAINER_RE)) {
    const end = elementEnd(html, m.index, m[1].toLowerCase());
    if (end > 0 && tokenize(toText(html.slice(m.index, end))).length < 3) return true;
  }
  return false;
}

// ---------- main ----------
function fail(msg) {
  console.error(`check_site: ${msg}\n${USAGE}`);
  process.exitCode = 2;
}

// Returns the <url> argument, or null after reporting the problem.
function parseArgs(argv) {
  const rest = [];
  opts = { sample: 24, delay: 800, noBotUa: false };
  const valueOptions = ['--sample', '--urls', '--sitemap', '--delay', '--out'];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-bot-ua') {
      opts.noBotUa = true;
    } else if (valueOptions.includes(a)) {
      if (argv[i + 1] == null) return fail(`${a} needs a value`) ?? null;
      opts[a.slice(2)] = argv[++i];
    } else if (a.startsWith('--')) {
      return fail(`unknown option ${a}`) ?? null;
    } else {
      rest.push(a);
    }
  }
  if (rest.length !== 1) return fail('exactly one <url> is required') ?? null;
  opts.sample = Math.min(100, Math.max(1, parseInt(opts.sample, 10) || 24));
  opts.delay = Math.max(0, Number.isFinite(+opts.delay) ? +opts.delay : 800);
  return rest[0];
}

function startFailureReason(first) {
  if (first.error) return first.error;
  return first.blocked ? 'blocked by robots.txt' : 'off-site redirect';
}

function filterCandidates(candidates, robots, siteHost, skipped) {
  const unique = [...new Set(candidates.filter(Boolean))];
  return unique.filter((u) => {
    const p = tryUrl(u);
    if (p.host !== siteHost) {
      skipped.set(u, 'other host');
      return false;
    }
    if (SKIP_EXT.test(p.pathname)) {
      skipped.set(u, 'non-HTML extension');
      return false;
    }
    if (!robots.allowed(u)) {
      skipped.set(u, 'robots.txt Disallow for *');
      return false;
    }
    return true;
  });
}

function groupByPattern(candidates) {
  const patterns = patternsFor(candidates);
  const byPattern = new Map();
  candidates.forEach((u, i) => byPattern.set(patterns[i], [...(byPattern.get(patterns[i]) || []), u]));
  return [...byPattern].map(([pattern, urls]) => ({ pattern, urls }));
}

async function fetchSamplePages(sample, variants, first, startUrl, robots, seenLinks) {
  const pages = [];
  for (const s of sample) {
    const rec = { url: s.url, pattern: s.pattern, variants: {} };
    for (const v of variants) {
      const reuseFirst = v === 'browser' && s.url === startUrl;
      rec.variants[v] = reuseFirst ? first : await getPage(s.url, v, robots);
      const r = rec.variants[v];
      if (v === 'browser' && r._html) {
        for (const l of sameHostLinks(r._html, r.finalUrl)) seenLinks.add(l);
      }
    }
    const b = rec.variants.browser;
    if (b && b._html && b.status < 400) {
      rec.checks = pageChecks(b._html, b.finalUrl, b);
      rec.empty = EMPTY.test(b._text) || emptyContainer(b._html);
    }
    rec.comparisons = {};
    for (const v of variants.slice(1)) {
      rec.comparisons[v] = compare(b, rec.variants[v]);
    }
    pages.push(rec);
  }
  return pages;
}

function jsonReplacer(key, value) {
  return key.startsWith('_') || value instanceof Set ? undefined : value;
}

async function main() {
  const urlArg = parseArgs(process.argv.slice(2));
  if (urlArg == null) return;
  const startU = tryUrl(/^https?:\/\//i.test(urlArg) ? urlArg : 'https://' + urlArg);
  if (!startU || !startU.hostname) return fail('cannot parse <url>');
  origin = startU.origin;
  startU.hash = '';
  const startUrl = startU.href;
  const variants = opts.noBotUa ? ['browser', 'search-referrer'] : ['browser', 'googlebot', 'search-referrer'];

  const rr = await fetchOnce(origin + '/robots.txt', { 'user-agent': UA.browser }, 'follow');
  const robotsFound = !rr.error && rr.status === 200;
  const robots = parseRobots(robotsFound ? rr.body : '');
  const first = await getPage(startUrl, 'browser', robots);
  if (first.error || first.blocked || first.offsite || first.status == null) {
    return fail(`start URL could not be fetched (${startFailureReason(first)})`);
  }

  // candidates
  const skipped = new Map(); // url -> reason
  const notes = [];
  let candidates = [];
  let source = '';
  let smFiles = 0;
  if (opts.urls) {
    let fileText;
    try {
      fileText = await readFile(opts.urls, 'utf8');
    } catch (e) {
      return fail(`cannot read --urls file: ${e.message}`);
    }
    const lines = fileText.split(/\r?\n/).map((l) => l.trim());
    candidates = lines.filter((l) => l && !l.startsWith('#')).map((l) => cleanUrl(l, origin));
    source = `--urls file ${opts.urls}`;
  } else {
    const sm = await readSitemaps(sitemapStarts(robots));
    smFiles = sm.files;
    notes.push(...sm.notes);
    candidates = sm.urls.map((u) => cleanUrl(u, origin));
    source = `sitemap (${sm.files} file(s) read)`;
  }
  if (!candidates.length) {
    candidates = sameHostLinks(first._html, first.finalUrl);
    source = 'links on the start page (no sitemap URLs found)';
  }
  const seenLinks = new Set(sameHostLinks(first._html, first.finalUrl));
  const read = candidates.length;
  candidates = filterCandidates(candidates, robots, startU.host, skipped);
  if (!candidates.includes(startUrl) && robots.allowed(startUrl)) candidates.push(startUrl);
  candidates.sort();
  const groups = groupByPattern(candidates);
  const sample = chooseSample(groups, opts.sample, startUrl);

  const pages = await fetchSamplePages(sample, variants, first, startUrl, robots, seenLinks);
  for (const link of seenLinks) {
    if (!robots.allowed(link) && !skipped.has(link)) {
      skipped.set(link, 'robots.txt Disallow for * (link seen on a sampled page, never requested)');
    }
  }

  const report = buildReport({
    startUrl,
    variants,
    robots,
    robotsFound,
    source,
    read,
    candidates,
    groups,
    sample,
    pages,
    skipped,
    notes,
    smFiles,
  });
  process.stdout.write(report.md + '\n');
  if (opts.out) {
    await mkdir(opts.out, { recursive: true });
    await writeFile(join(opts.out, 'report.md'), report.md + '\n');
    await writeFile(join(opts.out, 'report.json'), JSON.stringify(report.json, jsonReplacer, 2));
  }
}

// ---------- report ----------
function aggregate(pages) {
  const byKey = new Map();
  for (const p of pages) {
    for (const l of p.checks?.leads || []) {
      const key = `${l.policy}|${l.kind}|${l.detail.replace(/\d+/g, '#').slice(0, 80)}`;
      const entry = byKey.get(key) || { ...l, urls: [], benign: true };
      if (!entry.urls.includes(p.url)) entry.urls.push(p.url);
      entry.benign = entry.benign && l.benign;
      byKey.set(key, entry);
    }
  }
  return [...byKey.values()];
}

const ruleList = (paths, max) => (paths.length ? paths.slice(0, max).map(code).join(', ') : 'none');
const filterMedian = (pages, field) => median(pages.map((p) => p[field]).filter((x) => x != null));
const byUrlCount = (a, b) => b.urls.length - a.urls.length;

function titleLines(c) {
  const when = new Date().toISOString();
  const requests =
    `${reqCount} HTTP request(s) in total ` +
    `(robots, sitemaps, up to ${c.variants.length} per sampled URL, plus redirect hops)`;
  return [
    `# Site check: ${origin}`,
    '',
    `Run ${when} | sample ${c.sample.length} URL(s) | delay ${opts.delay} ms | ${requests}`,
    '',
  ];
}

// groups skipped URLs by reason, then by first path segment
function skippedLines(skipped) {
  const byReason = new Map();
  for (const [u, reason] of skipped) {
    const p = tryUrl(u);
    const seg = p ? '/' + (p.pathname.split('/')[1] || '') : u;
    const segments = byReason.get(reason) || new Map();
    const entry = segments.get(seg) || { n: 0, path: p ? p.pathname : u };
    entry.n++;
    segments.set(seg, entry);
    byReason.set(reason, segments);
  }
  const lines = ['Skipped (never requested):'];
  if (!byReason.size) lines.push('- nothing skipped');
  for (const [reason, segments] of byReason) {
    const shown = [...segments].slice(0, 15).map(([seg, entry]) => {
      return entry.n === 1 ? code(entry.path) : `\`${seg}/…\` (${entry.n} URLs)`;
    });
    lines.push(`- ${reason}: ${shown.join(', ')}`);
  }
  return lines;
}

function redirectLine(pages) {
  const followed = pages.filter((p) => p.variants.browser?.chain?.length && !p.variants.browser.offsite);
  const described = followed.map((p) => {
    const b = p.variants.browser;
    return `${short(p.url)} -> ${short(b.finalUrl)} (${b.chain.map((h) => h.status).join(', ')})`;
  });
  const redirs = [...new Set(described)];
  if (!redirs.length) return [];
  return [`- Redirects followed for \`browser\` (compare with the Variant comparison section): ${redirs.slice(0, 10).join('; ')}`];
}

function scopeLines(c, json) {
  const { groups, robots } = c;
  const found = c.robotsFound ? 'found' : 'not found (everything treated as allowed)';
  const sitemapLines = robots.sitemaps.length ? robots.sitemaps.join(', ') : 'none';
  const lines = ['## Scope', '', `- Origin: ${origin}; start URL: ${c.startUrl}`];
  lines.push(
    `- robots.txt: ${found}; Disallow rules for \`*\`: ${ruleList(json.robots.disallowStar, 12)}; ` +
      `Googlebot-specific Disallow rules: ${ruleList(json.robots.disallowGooglebot, 8)}; Sitemap lines: ${sitemapLines}`,
  );
  lines.push(`- Candidate URLs: ${c.candidates.length} usable (${c.read} read from ${c.source}); ${groups.length} URL pattern(s)`);
  for (const note of c.notes) lines.push(`- Note: ${note}`);
  lines.push('', '| Pattern | URLs | Sampled |', '|---|---|---|');
  for (const g of [...groups].sort(byUrlCount).slice(0, 40)) {
    const sampled = c.sample.filter((s) => s.pattern === g.pattern).length;
    lines.push(`| ${code(cell(g.pattern))} | ${g.urls.length} | ${sampled} |`);
  }
  if (groups.length > 40) lines.push(`| ... ${groups.length - 40} more pattern(s) in report.json | | |`);
  lines.push('', `Sampled (${c.sample.length}): ${c.sample.map((s) => code(short(s.url))).join(' ')}`, '');
  lines.push(...skippedLines(c.skipped));
  lines.push(...redirectLine(c.pages));
  lines.push(
    '- Off-site redirect destinations are recorded but not fetched. ' +
      'Pages are sampled, not crawled; counts describe the sample only.',
    '',
  );
  return lines;
}

const VARIANT_INTRO =
  'Variants: `browser` (desktop Chrome UA), `googlebot` (Googlebot smartphone UA), ' +
  '`search-referrer` (mobile Chrome UA with Referer google.com). ' +
  'Similarity is the Jaccard overlap of 5-word shingles of raw-HTML visible text against `browser`; ' +
  'a flag needs similarity < 0.8, a different final host or URL, or a redirect in only one variant (heuristic thresholds).';
const VARIANT_LIMITS =
  'Limits: a user-agent test cannot see IP-based cloaking. ' +
  'CDNs and bot protection may block or challenge a spoofed Googlebot UA; ' +
  'a 403/429/challenge page for the bot UA only is a tooling artefact to verify in Search Console URL Inspection, ' +
  'not evidence of cloaking.';

function variantRow(p, c) {
  const vs = p.variants;
  const cm = p.comparisons;
  const googlebot = c.variants.includes('googlebot')
    ? variantCell(vs.googlebot, cm.googlebot?.sim)
    : 'skipped (--no-bot-ua)';
  const referrer = variantCell(vs['search-referrer'], cm['search-referrer']?.sim);
  const leadText = Object.values(cm)
    .flatMap((x) => x.flags)
    .map((f) => `${f.label}: ${f.text}`)
    .join('; ');
  return (
    `| ${code(cell(short(p.url)))} | ${cell(variantCell(vs.browser))} | ${cell(googlebot)} | ` +
    `${cell(referrer)} | ${cell(leadText)} |`
  );
}

function variantLines(c) {
  const n = c.pages.length;
  const lines = ['## Variant comparison (Cloaking / Sneaky redirects)', '', VARIANT_INTRO, '', VARIANT_LIMITS, ''];
  const flagged = c.pages.filter((p) => Object.values(p.comparisons).some((x) => x.flags.length));
  if (!flagged.length) {
    lines.push(`No differences flagged across ${n} compared URL(s).`);
  } else {
    lines.push('| URL | browser | googlebot | search-referrer | lead |', '|---|---|---|---|---|');
    for (const p of flagged) lines.push(variantRow(p, c));
    lines.push(
      '',
      `${flagged.length} of ${n} URL(s) flagged; ` +
        `the other ${n - flagged.length} matched across variants within the thresholds.`,
    );
  }
  lines.push('');
  return lines;
}

const LEADS_INTRO =
  'Checks run on the `browser` HTML only (regex-based). ' +
  'Hiding done in external CSS or by JavaScript is not visible here and needs a browser check of computed styles. ' +
  '`[likelyBenign]` marks accordion/tab/menu-style patterns, aria-controls panels and similar; ' +
  'they still need a look if they hold many links.';
const KEYWORD_INTRO =
  'Phrase thresholds (more than 12 repeats and above 3 % of words) are arbitrary heuristics, ' +
  'as are the 15 meta-keyword terms and the 25-item list run.';

function leadBullets(items, n) {
  if (!items.length) return ['- none found by this check'];
  return items.map((a) => {
    const benign = a.benign ? '[likelyBenign] ' : '';
    const examples = [...new Set(a.urls)].slice(0, 3).map((u) => code(short(u))).join(', ');
    return `- ${benign}**${a.kind}**: ${a.detail} - ${a.urls.length}/${n} sampled page(s), e.g. ${examples}`;
  });
}

function keywordLines(pages, bullets) {
  const lines = ['### Keyword stuffing', '', KEYWORD_INTRO, '', ...bullets];
  const stuffed = pages.filter((p) => p.checks?.leads.some((l) => l.kind === 'repeated phrase')).slice(0, 8);
  for (const p of stuffed) {
    const phrases = p.checks.phrases.map((x) => `"${x.phrase}" x${x.count} (${pct(x.share)})`).join('; ');
    lines.push(`  - ${code(short(p.url))} top phrases: ${phrases}`);
  }
  lines.push('');
  return lines;
}

// external hosts linked from (nearly) every sampled page
function siteWideHosts(linkSets) {
  const hostPages = new Map();
  for (const links of linkSets) {
    for (const host of Object.keys(links.hosts)) {
      const entry = hostPages.get(host) || { pages: 0, unq: 0 };
      entry.pages++;
      entry.unq += links.hosts[host].unq;
      hostPages.set(host, entry);
    }
  }
  return [...hostPages].filter(([, e]) => linkSets.length >= 3 && e.pages / linkSets.length >= TH.siteWide);
}

function linkSpamLines(pages, bpages, bullets) {
  const linkSets = bpages.filter((b) => b.rec.checks).map((b) => b.rec.checks.links);
  const sum = (field) => linkSets.reduce((total, links) => total + links[field], 0);
  const intro =
    `Outbound links (different registrable host, approximated) across ${linkSets.length} page(s): ` +
    `${sum('total')} total, ${sum('qualified')} with rel sponsored/nofollow/ugc, ${sum('unqualified')} without. ` +
    'Unqualified links are normal for editorial links; ' +
    'they become a lead when they are paid, exchanged or affiliate links.';
  const lines = ['### Link spam', '', intro, '', ...bullets];
  const sitewide = siteWideHosts(linkSets);
  if (sitewide.length) {
    for (const [host, e] of sitewide) {
      lines.push(
        `- **site-wide external host**: ${code(host)} linked from ${e.pages}/${linkSets.length} sampled pages ` +
          `(${e.unq} link(s) without qualifying rel)`,
      );
    }
  } else {
    lines.push('- no external host is linked from (nearly) every sampled page');
  }
  lines.push('');
  return lines;
}

function jsDependenceLines(pages) {
  const jsd = pages.filter((p) => p.checks?.jsDependent);
  let text = 'No sampled page matched (under 50 raw words with script bundles).';
  if (jsd.length) {
    const examples = jsd.slice(0, 3).map((p) => code(short(p.url))).join(', ');
    text =
      `${jsd.length} sampled page(s) have fewer than 50 words of raw-HTML text but ship script bundles (e.g. ${examples}). ` +
      'Content is probably client-rendered: check the rendered DOM with a browser tool.';
  }
  return ['### JavaScript dependence', '', text, ''];
}

function leadsLines(c, bpages, agg) {
  const n = c.pages.length;
  // policies are listed in the order given, each keeping its aggregation order
  const bullets = (...policies) => leadBullets(policies.flatMap((pol) => agg.filter((a) => a.policy === pol)), n);
  return [
    '## Per-page leads by policy',
    '',
    LEADS_INTRO,
    '',
    '### Hidden text and link abuse',
    '',
    ...bullets(HIDDEN),
    '',
    ...keywordLines(c.pages, bullets('Keyword stuffing')),
    ...linkSpamLines(c.pages, bpages, bullets('Link spam')),
    '### Sneaky redirects, Malicious practices, Hacked content (inline scripts and markup)',
    '',
    ...bullets('Sneaky redirects', 'Malicious practices', 'Hacked content'),
    '',
    ...jsDependenceLines(c.pages),
  ];
}

function templateIntro() {
  return (
    `Over \`browser\` variants, per pattern. Boilerplate share = share of a page's 5-word shingles found on at least ` +
    `${TH.boilerplateAt * 100} % of sampled sibling pages (navigation and footer text counts). ` +
    'Unique words = words that sit only inside shingles found on no sibling ' +
    '(a swapped-in city name counts as about one word). ' +
    `Near-duplicate = shingle Jaccard >= ${TH.nearDup}, literal or after masking words that occur on only one page ` +
    'of the pattern (compared only when at most 25 % of a page is such words). ' +
    `Thin = unique words < ${TH.thinUnique}. ` +
    'All thresholds are heuristics; patterns with fewer than 2 sampled pages have no sibling metrics.'
  );
}

const TEMPLATE_HEADER =
  '| Pattern | Pages sampled | Median words | Median boilerplate share | Median unique words | ' +
  'Near-duplicate pairs | Title pattern (masked) | Meta description pattern (masked) |';

function maskedSummary(masked, values) {
  const top = masked.slice(0, 2).map(([pattern, count]) => `${trunc(pattern || '(empty)', 80)} x${count}`);
  return `${top.join('; ')} (${new Set(values).size} distinct of ${values.length})`;
}

function patternRow(g, ps, pairs, titles, descs) {
  const titleText = maskedSummary(titles, ps.map((p) => p.title));
  const descText = maskedSummary(descs, ps.map((p) => p.description));
  return (
    `| ${code(cell(g.pattern))} | ${ps.length} | ${num(median(ps.map((p) => p.words)))} | ` +
    `${pct(filterMedian(ps, 'boiler'))} | ${num(filterMedian(ps, 'unique'))} | ${pairs.length} | ` +
    `${cell(titleText)} | ${cell(descText)} |`
  );
}

function templateLines(c, bpages) {
  const lines = ['## Template analysis', '', templateIntro(), '', TEMPLATE_HEADER, '|---|---|---|---|---|---|---|---|'];
  const thin = [];
  const near = [];
  const tjson = [];
  for (const g of [...c.groups].sort(byUrlCount)) {
    const ps = bpages.filter((b) => b.pattern === g.pattern);
    if (!ps.length) continue;
    const { pairs } = templateStats(ps);
    const titles = maskPatterns(ps.map((p) => p.title));
    const descs = maskPatterns(ps.map((p) => p.description));
    lines.push(patternRow(g, ps, pairs, titles, descs));
    for (const p of ps) {
      if (p.unique != null && p.unique < TH.thinUnique) {
        thin.push({ pattern: g.pattern, text: `${short(p.url)} (${p.unique} unique words)` });
      }
      if (p.rec.empty) {
        thin.push({ pattern: g.pattern, text: `${short(p.url)} (empty-result phrase or empty list container)` });
      }
    }
    near.push(...pairs.map((x) => `${short(x.a)} ~ ${short(x.b)} (${num(x.similarity)}, ${x.view})`));
    tjson.push({
      pattern: g.pattern,
      pages: ps.length,
      medianWords: median(ps.map((p) => p.words)),
      medianBoilerplate: filterMedian(ps, 'boiler'),
      medianUnique: filterMedian(ps, 'unique'),
      nearDuplicatePairs: pairs,
      titlePatterns: titles,
      descriptionPatterns: descs,
    });
  }
  lines.push('', thinLine(thin), '', nearLine(near), '');
  lines.push(languageLine(c, bpages), '');
  return { lines, tjson };
}

function thinLine(thin) {
  if (!thin.length) return 'Thin pages (heuristic): none';
  const byPattern = new Map();
  for (const t of thin) byPattern.set(t.pattern, (byPattern.get(t.pattern) || 0) + 1);
  const counts = [...byPattern].map(([pattern, n]) => `${code(pattern)} ${n} page(s)`).join(', ');
  const examples = thin.slice(0, 8).map((t) => t.text).join('; ');
  return `Thin pages (heuristic): ${thin.length} - ${counts}. Examples: ${examples}`;
}

function nearLine(near) {
  if (!near.length) return 'Near-duplicate pairs: none';
  const more = near.length > 6 ? '; ...' : '';
  return `Near-duplicate pairs: ${near.length}. ${near.slice(0, 6).join('; ')}${more}`;
}

const LOCALE_RE = /^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/;

// "/lv/brands/x" -> { locale: 'lv', rest: '/brands/x' }, or null without a locale prefix
function splitLocale(pathname) {
  const m = pathname.match(LOCALE_RE);
  if (!m) return null;
  return { locale: m[1], rest: pathname.slice(m[0].length) || '/' };
}

function languageLine(c, bpages) {
  const localesByPath = new Map();
  for (const u of c.candidates) {
    const split = splitLocale(tryUrl(u).pathname);
    if (!split) continue;
    localesByPath.set(split.rest, new Set([...(localesByPath.get(split.rest) || []), split.locale]));
  }
  const multi = [...localesByPath].filter(([, locales]) => locales.size > 1);
  const langs = new Set(multi.flatMap(([, locales]) => [...locales]));
  const sampledByPath = new Map();
  for (const b of bpages) {
    const split = splitLocale(tryUrl(b.finalUrl).pathname);
    if (!split) continue;
    sampledByPath.set(split.rest, [...(sampledByPath.get(split.rest) || []), { l: split.locale, b }]);
  }
  const copies = [...sampledByPath]
    .filter(([, v]) => v.length > 1)
    .map(([rest, v]) => {
      const perLocale = v.map((x) => `${x.l}: hreflang ${x.b.hreflang}, canonical ${x.b.canonical ? 'set' : 'none'}`);
      return `${code(rest)} ${perLocale.join('; ')}; similarity ${num(jaccard(v[0].b._set, v[1].b._set))}`;
    });
  const summary = multi.length
    ? `${multi.length} path(s) exist under more than one locale prefix (${[...langs].join(', ')}).`
    : 'no locale-prefixed duplicate paths among candidates.';
  const pairs = copies.length ? ' Sampled pairs: ' + copies.slice(0, 5).join(' | ') : '';
  return `Language copies: ${summary}${pairs}`;
}

const NOT_CHECKED = [
  '## Not checked',
  '',
  '- Rendered DOM and external CSS (hidden text, hidden links, JavaScript-inserted content or redirects need a browser tool).',
  '- IP-based cloaking and anything that depends on being Google rather than a UA string.',
  '- Off-site factors: backlinks, other domains, copies of this content elsewhere, domain history.',
  '- Search Console manual actions and security issues, indexing status, `site:` footprint.',
  '- Intent, quality and added value of the content, accuracy of claims, whether promised tools work.',
  '- Pages that were not sampled; robots.txt-disallowed URLs (never requested); anything behind login or forms.',
  '',
];
const CLOSING = [
  '---',
  'These are measurements and leads, not verdicts. ' +
    'A policy verdict needs the review described in the skill (references/site-audit.md and references/policies.md).',
];

function initialJson(c) {
  const { robots, groups } = c;
  return {
    origin,
    startUrl: c.startUrl,
    options: opts,
    thresholdsHeuristic: TH,
    requests: 0,
    robots: {
      found: c.robotsFound,
      sitemaps: robots.sitemaps,
      disallowStar: robots.star.filter((r) => !r.allow).map((r) => r.path),
      allowStar: robots.star.filter((r) => r.allow).map((r) => r.path),
      disallowGooglebot: robots.bot.filter((r) => !r.allow).map((r) => r.path),
    },
    candidates: c.candidates.length,
    patterns: groups,
    skipped: [...c.skipped],
    notes: c.notes,
    pages: [],
  };
}

function buildReport(c) {
  const { pages } = c;
  const json = initialJson(c);
  const bpages = pages
    .map((p) => ({ ...p.variants.browser, pattern: p.pattern, rec: p }))
    .filter((b) => b._html && b.status < 400);
  const agg = aggregate(pages);
  const template = templateLines(c, bpages);
  const lines = [
    ...titleLines(c),
    ...scopeLines(c, json),
    ...variantLines(c),
    ...leadsLines(c, bpages, agg),
    ...template.lines,
    ...NOT_CHECKED,
    ...CLOSING,
  ];

  json.requests = reqCount;
  json.templates = template.tjson;
  json.variantComparison = pages.map((p) => ({ url: p.url, pattern: p.pattern, comparisons: p.comparisons }));
  json.pages = pages.map((p) => ({
    url: p.url,
    pattern: p.pattern,
    variants: p.variants,
    checks: p.checks,
    emptyResult: p.empty,
  }));
  json.leads = agg.map((a) => ({ ...a, urls: [...new Set(a.urls)] }));
  return { md: lines.join('\n'), json };
}

main().catch((e) => {
  console.error('check_site: unexpected error: ' + (e.stack || e));
  process.exitCode = 2;
});
