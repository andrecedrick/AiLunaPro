/**
 * Audit Express — V1-lite URL extraction (Phase 5, §7quinquies).
 *
 * PURE, deterministic, rule/signature-based extraction. NO LLM, NO scoring,
 * NO randomness, NO Date, NO locale, NO I/O in this module. The fetch
 * orchestration (network) lives in audit-express-extract-fetch.ts; this module
 * holds only pure helpers: URL validation/SSRF host rules, robots parsing,
 * deterministic link selection, the signature detector, PII scrubbing, and
 * snapshot assembly (stamped + traced + inputsHash).
 *
 * Privacy contract (NON-NEGOTIABLE):
 *   - Public-data-only. No auth-gated pages. No PII captured or stored.
 *   - Defense-in-depth: identity text is scrubbed of email/phone patterns.
 *   - The route is compute-only and persists nothing.
 */

import { ENGINE_VERSION, ruleRef, type Trace } from './determinism';
import type { Understanding } from './audit-express-understanding';

/* ── Versions & caps (pre-approved Phase 5 decisions) ───────────────────── */

export const EXTRACTOR_VERSION       = '1.0.0';   // pipeline/contract version
export const EXTRACT_RULESET_VERSION = '1.0.0';   // detector signature set version
export const EXTRACTOR_MODEL_ID      = 'rules:none'; // explicit: no LLM

export const EXTRACT_USER_AGENT =
  'AiLunaProAuditExpress/1.0 (+https://ailunapro.com/audit-express)';

export const MAX_PAGES         = 5;            // homepage + 4 secondary (quick)
export const MAX_SECONDARY     = 4;
export const MAX_SECONDARY_DEEP = 11;          // homepage + 11 secondary (deep, capped)
export const MAX_PAGE_BYTES    = 512 * 1024;   // 512 KB stream cap (both modes)
export const MAX_ROBOTS_BYTES  = 64 * 1024;
export const MAX_SITEMAP_BYTES = 256 * 1024;   // deep-mode sitemap.xml read cap
export const MAX_SITEMAP_LOCS  = 60;           // bound parsed <loc> entries
export const FETCH_TIMEOUT_MS  = 5_000;        // unchanged
export const TOTAL_BUDGET_MS   = 15_000;       // unchanged wall-clock budget (both modes)
export const MAX_REDIRECTS     = 3;            // unchanged
export const MAX_CONCURRENCY   = 2;            // unchanged
export type ExtractDepth = 'quick' | 'deep';
export const SECONDARY_KEYWORDS = ['about', 'pricing', 'services', 'contact', 'product'] as const;

export const EXTRACT_NOTE =
  'Extraction reads public pages only and respects robots.txt. Results may change if the site changes.';

/* ── Error codes ────────────────────────────────────────────────────────── */

export type ExtractErrorCode =
  | 'INVALID_URL'
  | 'PRIVATE_HOST_BLOCKED'
  | 'ROBOTS_DISALLOWED'
  | 'UNREACHABLE'
  | 'NOT_HTML';

/* ── URL validation + SSRF host rules ───────────────────────────────────── */

export interface UrlCheckOk  { ok: true;  url: string; origin: string; hostname: string }
export interface UrlCheckErr { ok: false; code: 'INVALID_URL' | 'PRIVATE_HOST_BLOCKED' }

/** True if `host` is an IPv4 literal. */
export function isIpv4Literal(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/** True if `host` looks like an IPv6 literal (brackets stripped by URL parser). */
export function isIpv6Literal(host: string): boolean {
  return host.includes(':');
}

/** True for IPv4 private / reserved / loopback / link-local ranges. */
export function isPrivateIpv4(host: string): boolean {
  if (!isIpv4Literal(host)) return false;
  const p = host.split('.').map(n => parseInt(n, 10));
  if (p.some(n => Number.isNaN(n) || n < 0 || n > 255)) return true; // malformed → block
  const [a, b] = p;
  if (a === 10) return true;                          // 10.0.0.0/8
  if (a === 127) return true;                         // loopback
  if (a === 0) return true;                           // 0.0.0.0/8
  if (a === 169 && b === 254) return true;            // link-local
  if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
  if (a === 192 && b === 168) return true;            // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true;  // 100.64.0.0/10 CGNAT
  if (a >= 224) return true;                          // multicast / reserved
  return false;
}

/**
 * Block: localhost, *.local/*.internal/*.localhost, ALL IP literals (per
 * decision), and private IPv4 ranges (for redirect targets that are IPs).
 */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (!h) return true;
  if (h === 'localhost') return true;
  if (h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (isIpv6Literal(h)) return true;     // block all IPv6 literals
  if (isIpv4Literal(h)) return true;     // block all IPv4 literals (incl. public)
  if (isPrivateIpv4(h)) return true;
  return false;
}

/** Tracking params stripped during canonicalization (deterministic order). */
const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ref', 'mc_cid', 'mc_eid'];

/**
 * Canonicalize a URL string: https only, lowercase host, drop fragment + auth,
 * strip tracking params (sorted remaining params), normalize empty path to '/'.
 * Returns null if not a parseable https URL on a default port.
 */
export function canonicalizeUrlString(raw: string): string | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;          // no credentials
  if (u.port && u.port !== '443') return null;        // default port only
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  for (const p of TRACKING_PARAMS) u.searchParams.delete(p);
  // Sort remaining query params for stable canonical form.
  const entries = Array.from(u.searchParams.entries()).sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  u.search = '';
  for (const [k, v] of entries) u.searchParams.append(k, v);
  if (u.pathname === '') u.pathname = '/';
  return u.toString();
}

export function validateAndCanonicalizeUrl(raw: string): UrlCheckOk | UrlCheckErr {
  if (typeof raw !== 'string' || raw.trim() === '') return { ok: false, code: 'INVALID_URL' };
  const canon = canonicalizeUrlString(raw);
  if (!canon) return { ok: false, code: 'INVALID_URL' };
  const u = new URL(canon);
  if (isBlockedHost(u.hostname)) return { ok: false, code: 'PRIVATE_HOST_BLOCKED' };
  return { ok: true, url: canon, origin: u.origin, hostname: u.hostname };
}

/* ── robots.txt parsing ─────────────────────────────────────────────────── */

/**
 * Minimal robots parser. Honors records for our UA token and the wildcard '*'
 * (UA-specific rules take precedence when present). Only Disallow/Allow paths
 * by simple prefix match (longest match wins, Allow beats equal-length Disallow).
 */
export function parseRobots(txt: string, ua: string): { isAllowed: (path: string) => boolean } {
  const uaToken = ua.split('/')[0].toLowerCase();
  const groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; path: string }> }> = [];
  let cur: { agents: string[]; rules: Array<{ allow: boolean; path: string }> } | null = null;
  let lastWasAgent = false;

  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((field === 'disallow' || field === 'allow') && cur) {
      cur.rules.push({ allow: field === 'allow', path: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }

  const pick = (token: string) => groups.find(g => g.agents.includes(token));
  const group = pick(uaToken) ?? pick('*');
  if (!group) return { isAllowed: () => true };

  return {
    isAllowed: (path: string) => {
      let decision = true;       // default allow
      let bestLen = -1;
      for (const r of group.rules) {
        if (r.path === '') {
          // "Disallow:" (empty) means allow all; do not override a longer match.
          if (!r.allow && bestLen < 0) decision = true;
          continue;
        }
        if (path.startsWith(r.path)) {
          if (r.path.length > bestLen || (r.path.length === bestLen && r.allow)) {
            bestLen = r.path.length;
            decision = r.allow;
          }
        }
      }
      return decision;
    },
  };
}

/* ── Deterministic secondary-link selection ─────────────────────────────── */

/**
 * Select up to `cap` same-origin secondary pages from homepage links.
 * Ranking: keyword priority (about, pricing, services, contact, product),
 * then lexicographic by canonical URL. Fully deterministic and pure.
 */
/**
 * Parse same-origin page URLs from a sitemap.xml body (deep mode discovery).
 * PURE + bounded: at most MAX_SITEMAP_LOCS entries, same-origin only, nested
 * sitemaps (.xml) skipped. Result is fed into selectSecondaryLinks, which
 * dedupes + sorts deterministically and applies the page cap.
 */
export function parseSitemapLocs(xml: string, origin: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && out.length < MAX_SITEMAP_LOCS) {
    const canon = canonicalizeUrlString(m[1].trim());
    if (!canon || canon.toLowerCase().endsWith('.xml')) continue; // skip nested sitemaps
    try { if (new URL(canon).origin !== origin) continue; } catch { continue; }
    out.push(canon);
  }
  return out;
}

export function selectSecondaryLinks(homeUrl: string, links: string[], cap: number = MAX_SECONDARY): string[] {
  const home = canonicalizeUrlString(homeUrl);
  if (!home) return [];
  const homeOrigin = new URL(home).origin;
  const seen = new Set<string>([home]);
  const candidates: string[] = [];

  for (const raw of links) {
    let abs: string;
    try { abs = new URL(raw, home).toString(); } catch { continue; }
    const canon = canonicalizeUrlString(abs);
    if (!canon) continue;
    if (new URL(canon).origin !== homeOrigin) continue;  // same-origin only
    if (seen.has(canon)) continue;
    seen.add(canon);
    candidates.push(canon);
  }

  const priority = (url: string): number => {
    const path = new URL(url).pathname.toLowerCase();
    for (let i = 0; i < SECONDARY_KEYWORDS.length; i++) {
      if (path.includes(SECONDARY_KEYWORDS[i])) return i;
    }
    return SECONDARY_KEYWORDS.length;
  };

  candidates.sort((a, b) => {
    const pa = priority(a), pb = priority(b);
    if (pa !== pb) return pa - pb;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  return candidates.slice(0, cap);
}

/* ── Pure HTML signal extraction (bounded, regex-based) ─────────────────── */

export interface PageSignals {
  title:         string | null;
  description:   string | null;
  lang:          string | null;
  canonical:     string | null;
  charset:       string | null;
  hasFavicon:    boolean;
  metaGenerator: string | null;
  og:            Record<string, string>;
  twitter:       Record<string, string>;
  scriptSrcs:    string[];   // deduped + sorted
  links:         string[];   // raw hrefs (for selection)
  headings:      string[];   // H1/H2 text, decoded + PII-scrubbed, bounded (<=12, <=120 chars)
  navLabels:     string[];   // anchor text inside <nav>, decoded + scrubbed, bounded (<=20, <=60)
  keywords:      string[];   // top visible-text tokens (lowercased alpha, stopword-filtered), bounded (<=30)
}

function firstMatch(re: RegExp, html: string): string | null {
  const m = re.exec(html);
  return m ? (m[1] ?? '').trim() : null;
}

/** Strip script/style blocks then all tags; collapse whitespace. */
function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'are', 'this', 'that', 'from', 'have',
  'will', 'can', 'all', 'more', 'get', 'about', 'home', 'page', 'menu', 'here', 'click',
  'learn', 'read', 'view', 'see', 'use', 'using', 'how', 'what', 'why', 'who', 'when',
  'their', 'them', 'they', 'has', 'was', 'were', 'been', 'into', 'out', 'now', 'new',
  'we', 'us', 'is', 'to', 'of', 'in', 'on', 'at', 'by', 'or', 'an', 'as', 'be', 'it',
]);

/** Deterministic top visible-text tokens (lowercased alpha, stopword-filtered). */
function topKeywords(html: string): string[] {
  const words = stripToText(html).toLowerCase().match(/[a-z]{4,}/g) || [];
  const freq = new Map<string, number>();
  for (let i = 0; i < words.length && i < 5000; i++) {
    const w = words[i];
    if (STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) // freq desc, then alpha
    .slice(0, 30)
    .map(e => e[0])
    .sort();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

/** Extract bounded, named signals from a capped HTML string. Pure. */
export function extractPageSignals(html: string): PageSignals {
  const lower = html; // case-insensitive regexes used throughout
  const title = firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, lower);
  const description = firstMatch(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i, lower)
    ?? firstMatch(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i, lower);
  const lang = firstMatch(/<html[^>]*\slang=["']([^"']+)["']/i, lower);
  const canonical = firstMatch(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i, lower);
  const charset = firstMatch(/<meta[^>]+charset=["']?([\w-]+)["']?/i, lower);
  const metaGenerator = firstMatch(/<meta[^>]+name=["']generator["'][^>]*content=["']([^"']*)["']/i, lower);
  const hasFavicon = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(lower);

  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  const metaRe = /<meta[^>]+(?:property|name)=["'](og:[\w:]+|twitter:[\w:]+)["'][^>]*content=["']([^"']*)["']/gi;
  let mm: RegExpExecArray | null;
  while ((mm = metaRe.exec(lower)) !== null) {
    const key = mm[1].toLowerCase();
    const val = decodeEntities((mm[2] ?? '').trim());
    const allowed = ['og:title', 'og:description', 'og:site_name', 'og:url', 'og:type', 'twitter:card', 'twitter:title', 'twitter:description'];
    if (!allowed.includes(key)) continue;
    if (key.startsWith('og:')) { if (!(key in og)) og[key] = val; }
    else { if (!(key in twitter)) twitter[key] = val; }
  }

  const scriptSet = new Set<string>();
  const scriptRe = /<script[^>]+src=["']([^"']+)["']/gi;
  let sm: RegExpExecArray | null;
  while ((sm = scriptRe.exec(lower)) !== null) {
    const src = (sm[1] ?? '').trim();
    if (src) scriptSet.add(src);
    if (scriptSet.size >= 200) break; // bound
  }

  const linkSet = new Set<string>();
  const aRe = /<a[^>]+href=["']([^"']+)["']/gi;
  let am: RegExpExecArray | null;
  while ((am = aRe.exec(lower)) !== null) {
    const href = (am[1] ?? '').trim();
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      linkSet.add(href);
    }
    if (linkSet.size >= 500) break; // bound
  }

  // Headings (H1/H2) — decoded, PII-scrubbed, bounded.
  const headings: string[] = [];
  const hRe = /<(h1|h2)[^>]*>([\s\S]*?)<\/\1>/gi;
  let hm: RegExpExecArray | null;
  while ((hm = hRe.exec(lower)) !== null && headings.length < 12) {
    const t = (scrubPii(decodeEntities(stripToText(hm[2] ?? ''))) ?? '').trim();
    if (t) headings.push(t.slice(0, 120));
  }

  // Nav labels — anchor text inside <nav>…</nav>, decoded, scrubbed, bounded.
  const navLabels: string[] = [];
  const navBlocks = lower.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || [];
  for (const block of navBlocks) {
    const aTextRe = /<a[^>]*>([\s\S]*?)<\/a>/gi;
    let nm: RegExpExecArray | null;
    while ((nm = aTextRe.exec(block)) !== null && navLabels.length < 20) {
      const t = (scrubPii(decodeEntities(stripToText(nm[1] ?? ''))) ?? '').trim();
      if (t && t.length <= 60) navLabels.push(t);
    }
  }

  return {
    title:         title ? decodeEntities(title) : null,
    description:   description ? decodeEntities(description) : null,
    lang:          lang ? lang.toLowerCase() : null,
    canonical:     canonical ?? null,
    charset:       charset ? charset.toLowerCase() : null,
    hasFavicon,
    metaGenerator: metaGenerator ? decodeEntities(metaGenerator) : null,
    og,
    twitter,
    scriptSrcs:    Array.from(scriptSet).sort(),
    links:         Array.from(linkSet),
    headings,
    navLabels,
    keywords:      topKeywords(lower),
  };
}

/* ── PII scrubbing (defense-in-depth) ───────────────────────────────────── */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/g;

export function scrubPii(text: string | null): string | null {
  if (text == null) return null;
  return text.replace(EMAIL_RE, '[redacted-email]').replace(PHONE_RE, '[redacted-phone]');
}

function scrubMap(obj: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj).sort()) out[k] = scrubPii(obj[k]) ?? '';
  return out;
}

/* ── Detector (signature-based) ─────────────────────────────────────────── */

export interface ExtractDetection { id: string; category: string; label: string; sources: string[] }

interface Signature { id: string; category: string; label: string; test: (s: PageSignals) => boolean }

function hasScript(s: PageSignals, needle: string): boolean {
  return s.scriptSrcs.some(src => src.toLowerCase().includes(needle));
}
function generatorIncludes(s: PageSignals, needle: string): boolean {
  return (s.metaGenerator ?? '').toLowerCase().includes(needle);
}

const SIGNATURES: Signature[] = [
  { id: 'analytics.gtm',       category: 'analytics', label: 'Google Tag Manager', test: s => hasScript(s, 'googletagmanager.com') },
  { id: 'analytics.ga',        category: 'analytics', label: 'Google Analytics',   test: s => hasScript(s, 'google-analytics.com') || hasScript(s, 'gtag/js') },
  { id: 'analytics.plausible', category: 'analytics', label: 'Plausible',          test: s => hasScript(s, 'plausible.io') },
  { id: 'analytics.posthog',   category: 'analytics', label: 'PostHog',            test: s => hasScript(s, 'posthog.com') },
  { id: 'aichat.intercom',     category: 'ai_chat',   label: 'Intercom Messenger', test: s => hasScript(s, 'intercom.io') || hasScript(s, 'intercomcdn') },
  { id: 'aichat.drift',        category: 'ai_chat',   label: 'Drift',              test: s => hasScript(s, 'driftt.com') || hasScript(s, 'drift.com') },
  { id: 'aichat.crisp',        category: 'ai_chat',   label: 'Crisp',              test: s => hasScript(s, 'crisp.chat') },
  { id: 'aichat.tidio',        category: 'ai_chat',   label: 'Tidio',              test: s => hasScript(s, 'tidio.co') },
  { id: 'aichat.zendesk',      category: 'ai_chat',   label: 'Zendesk Web Widget', test: s => hasScript(s, 'zdassets.com') || hasScript(s, 'zendesk') },
  { id: 'consent.cookiebot',   category: 'consent',   label: 'Cookiebot',          test: s => hasScript(s, 'cookiebot.com') },
  { id: 'consent.onetrust',    category: 'consent',   label: 'OneTrust',           test: s => hasScript(s, 'cookielaw.org') || hasScript(s, 'onetrust') },
  { id: 'payments.stripe',     category: 'payments',  label: 'Stripe.js (public)', test: s => hasScript(s, 'js.stripe.com') },
  { id: 'booking.calendly',    category: 'booking',   label: 'Calendly',           test: s => hasScript(s, 'calendly.com') },
  { id: 'ecommerce.shopify',   category: 'ecommerce', label: 'Shopify',            test: s => hasScript(s, 'cdn.shopify.com') || generatorIncludes(s, 'shopify') },
  { id: 'cms.wordpress',       category: 'cms',       label: 'WordPress',          test: s => generatorIncludes(s, 'wordpress') || hasScript(s, 'wp-content') || hasScript(s, 'wp-includes') },
  { id: 'cms.wix',             category: 'cms',       label: 'Wix',                test: s => generatorIncludes(s, 'wix') || hasScript(s, 'parastorage.com') },
  { id: 'cms.webflow',         category: 'cms',       label: 'Webflow',            test: s => generatorIncludes(s, 'webflow') || hasScript(s, 'webflow.com') },
  { id: 'framework.nextjs',    category: 'framework', label: 'Next.js',            test: s => s.scriptSrcs.some(src => src.includes('/_next/')) },
];

/** Run signatures across all captured pages; aggregate sources. Sorted by id. */
export function detect(pages: PageCapture[]): ExtractDetection[] {
  const found = new Map<string, ExtractDetection>();
  for (const page of pages) {
    if (!page.signals) continue;
    for (const sig of SIGNATURES) {
      if (!sig.test(page.signals)) continue;
      const existing = found.get(sig.id);
      if (existing) {
        if (!existing.sources.includes(page.url)) existing.sources.push(page.url);
      } else {
        found.set(sig.id, { id: sig.id, category: sig.category, label: sig.label, sources: [page.url] });
      }
    }
  }
  const out = Array.from(found.values());
  for (const d of out) d.sources.sort();
  out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return out;
}

/* ── Snapshot assembly (pure, stamped, traced, hashed) ──────────────────── */

export interface PageCapture {
  url:           string;             // canonical
  status:        number;
  contentType:   string | null;
  truncated?:    boolean;
  skippedReason?: string;
  signals?:      PageSignals;
}

export interface ExtractIdentity {
  title:       string | null;
  description: string | null;
  lang:        string | null;
  canonical:   string | null;
  charset:     string | null;
  hasFavicon:  boolean;
  og:          Record<string, string>;
  twitter:     Record<string, string>;
}

export interface ExtractSnapshot {
  engineVersion:   string;
  extractorVersion: string;
  rulesetVersion:  string;
  modelId:         string;
  inputsHash:      string;
  canonicalUrl:    string;
  pages:           Array<{ url: string; status: number; truncated?: boolean; skippedReason?: string }>;
  identity:        ExtractIdentity;
  detections:      ExtractDetection[];
  trace:           Trace;
  note:            string;
  // Bounded, deterministic, PII-scrubbed content signals aggregated across the
  // captured pages (headings / nav labels / top keywords). Feeds the rule-only
  // classifier so sector/audience are detected from more than the homepage meta.
  contentSignals?: Array<{ source: string; text: string }>;
  // Phase 7 — pure rule-only interpretation, attached after assembly.
  // Pure function of the capture, so it does not change inputsHash semantics.
  understanding?:  Understanding;
  // createdAt is added by the route (metadata only; excluded from inputsHash).
}

/** Deterministic, dependency-free 64-bit FNV-1a hash → hex. Identity key only. */
export function stableHash(input: string): string {
  let hi = 0xcbf29ce4 >>> 0;
  let lo = 0x84222325 >>> 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    lo ^= c;
    // 64-bit FNV prime multiply (split into 32-bit halves)
    const loPrime = 0x01000193;
    const a = lo * loPrime;
    const b = hi * loPrime + Math.floor(a / 0x100000000);
    lo = a >>> 0;
    hi = b >>> 0;
  }
  const hx = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hx(hi) + hx(lo);
}

const EMPTY_IDENTITY: ExtractIdentity = {
  title: null, description: null, lang: null, canonical: null, charset: null,
  hasFavicon: false, og: {}, twitter: {},
};

/**
 * Build the deterministic snapshot from captured pages. PURE: same captures =>
 * byte-identical output (via stableStringify). Identity comes from the homepage
 * capture (url === canonicalUrl) and is PII-scrubbed. createdAt is NOT set here
 * and is NOT part of inputsHash.
 */
export function assembleSnapshot(canonicalUrl: string, captures: PageCapture[]): ExtractSnapshot {
  const pagesSorted = [...captures].sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));

  const home = captures.find(p => p.url === canonicalUrl && p.signals);
  let identity: ExtractIdentity = EMPTY_IDENTITY;
  if (home?.signals) {
    const s = home.signals;
    identity = {
      title:       scrubPii(s.title),
      description: scrubPii(s.description),
      lang:        s.lang,
      canonical:   s.canonical,
      charset:     s.charset,
      hasFavicon:  s.hasFavicon,
      og:          scrubMap(s.og),
      twitter:     scrubMap(s.twitter),
    };
  }

  const detections = detect(captures);

  // Normalized capture for the hash — excludes createdAt and any timing.
  const normalized = {
    canonicalUrl,
    pages: pagesSorted.map(p => ({
      url: p.url, status: p.status, contentType: p.contentType,
      truncated: !!p.truncated, skippedReason: p.skippedReason ?? null,
      signals: p.signals ?? null,
    })),
  };
  const inputsHash = stableHash(stableStringifyLocal(normalized));

  const trace: Trace = {
    pages:      [ruleRef('extract.crawl.deterministicSelection(keyword,then-lexicographic)')],
    identity:   [ruleRef('extract.identity.metaTags'), ruleRef('extract.privacy.piiScrub')],
    detections: [ruleRef(`extract.detections.signatureSet@${EXTRACT_RULESET_VERSION}`)],
  };

  // Aggregate bounded, scrubbed content signals across all captured pages.
  // Deterministic: derived from pagesSorted, deduped, sorted, capped.
  const rawSignals: Array<{ source: string; text: string }> = [];
  for (const p of pagesSorted) {
    if (!p.signals) continue;
    const src = 'page:' + p.url;
    for (const h of p.signals.headings)  rawSignals.push({ source: src + '#h',   text: h });
    for (const n of p.signals.navLabels) rawSignals.push({ source: src + '#nav', text: n });
    if (p.signals.keywords.length)       rawSignals.push({ source: src + '#kw',  text: p.signals.keywords.join(' ') });
  }
  const seenSig = new Set<string>();
  const contentSignals = rawSignals
    .filter(c => c.text && !seenSig.has(c.source + '|' + c.text) && seenSig.add(c.source + '|' + c.text))
    .sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : a.text < b.text ? -1 : a.text > b.text ? 1 : 0))
    .slice(0, 80);

  return {
    engineVersion:    ENGINE_VERSION,
    extractorVersion: EXTRACTOR_VERSION,
    rulesetVersion:   EXTRACT_RULESET_VERSION,
    modelId:          EXTRACTOR_MODEL_ID,
    inputsHash,
    canonicalUrl,
    pages: pagesSorted.map(p => {
      const e: { url: string; status: number; truncated?: boolean; skippedReason?: string } =
        { url: p.url, status: p.status };
      if (p.truncated) e.truncated = true;
      if (p.skippedReason) e.skippedReason = p.skippedReason;
      return e;
    }),
    identity,
    detections,
    trace,
    note: EXTRACT_NOTE,
    contentSignals,
  };
}

/* Local stable stringify (sorted keys) — kept here to keep this module pure and
 * self-contained for the hash. Mirrors determinism.stableStringify semantics. */
function stableStringifyLocal(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}
function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src).sort()) out[key] = sortDeep(src[key]);
    return out;
  }
  return value;
}
