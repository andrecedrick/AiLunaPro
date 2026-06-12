import type { SectionKey } from '../../types/audit';

/**
 * Deterministic result-narrative layer (no LLM, no PII, no legal interpretation).
 * Static, authored copy keyed by stable section ids + small pure helpers that
 * turn the engine's own numbers into honest indicative RANGES (never fake
 * precision). Same no-LLM discipline as worker/report-ai-sections.ts.
 *
 * Numbers boundary (guardrail): money/time ranges come ONLY from the Audit
 * Express ROI engine. The full audit expresses impact in its real unit —
 * recoverable score points — never fabricated currency.
 */

/* ── Indicative ranges (honest, not fake precision) ───────────────────────── */

export function indicativeRange(value: number, pct = 0.15): { low: number; high: number } {
  const v = Math.max(0, Number.isFinite(value) ? value : 0);
  return { low: v * (1 - pct), high: v * (1 + pct) };
}
function roundTo(n: number, step: number): number { return Math.round(n / step) * step; }
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export function formatHoursRange(hoursPerMonth: number): string {
  const { low, high } = indicativeRange(hoursPerMonth);
  return `~${Math.max(1, Math.round(low))}–${Math.round(high)} h/month`;
}
export function formatMoneyRange(usdPerMonth: number): string {
  const { low, high } = indicativeRange(usdPerMonth);
  return `~${usd(roundTo(low, 100))}–${usd(roundTo(high, 100))}/mo`;
}
export function formatPaybackRange(months: number | null): string | null {
  if (months == null || !Number.isFinite(months) || months <= 0) return null;
  const { low, high } = indicativeRange(months, 0.4);
  const lo = Math.max(1, Math.round(low));
  const hi = Math.max(lo, Math.round(high));
  return lo === hi ? `~${lo} month${lo === 1 ? '' : 's'}` : `~${lo}–${hi} months`;
}

/* ── Section narrative (pedagogical, deterministic) ───────────────────────── */

export interface InsightFlow { input: string; process: string; output: string; gain: string; }
export interface SectionNarrative {
  whatItMeans: string;
  whyItMatters: string;
  flow: InsightFlow;
  example: string; // illustrative, qualitative — clearly labelled in the UI
}

const N: Record<SectionKey, SectionNarrative> = {
  'governance': {
    whatItMeans: 'There’s no clear owner or written rule for how AI is used across the company.',
    whyItMatters: 'Without an owner, AI decisions happen ad-hoc — hard to steer, hard to defend if questioned.',
    flow: { input: 'teams adopt AI', process: 'no shared rules', output: 'inconsistent use', gain: 'one policy → predictable, defensible use' },
    example: 'A ~20-person firm named one AI owner and wrote a 1-page policy — new tools now get a quick yes/no instead of silent sprawl.',
  },
  'data': {
    whatItMeans: 'Sensitive data may be feeding AI without a record of where it came from or why you hold it.',
    whyItMatters: 'If the data is wrong or shouldn’t be there, every downstream AI decision inherits the problem.',
    flow: { input: 'raw data', process: 'no inventory/basis', output: 'unverified inputs', gain: 'a simple inventory → trustworthy inputs' },
    example: 'A services team listed each dataset’s source and purpose in a sheet — and immediately dropped two they no longer needed.',
  },
  'security': {
    whatItMeans: 'Basic safeguards around your AI systems (access, testing, monitoring) are thin.',
    whyItMatters: 'AI features widen the attack surface; weak controls turn a small issue into a public one.',
    flow: { input: 'AI in production', process: 'few controls', output: 'exposed surface', gain: 'core controls → contained risk' },
    example: 'A startup added access limits and a quarterly review of its AI endpoints — closing the gaps an audit would flag first.',
  },
  'transparency': {
    whatItMeans: 'Users aren’t clearly told when AI is involved, and decisions are hard to explain.',
    whyItMatters: 'People (and regulators) increasingly expect to know when AI acts and why — silence erodes trust.',
    flow: { input: 'AI decides', process: 'no disclosure', output: 'opaque outcome', gain: 'a short notice → trust + fewer disputes' },
    example: 'A support tool added “drafted with AI, reviewed by our team” — complaints about “robotic” replies dropped.',
  },
  'human-oversight': {
    whatItMeans: 'AI outputs can drive important decisions with no required human check.',
    whyItMatters: 'If the model is wrong on a high-stakes case, nobody is positioned to catch it before it lands.',
    flow: { input: 'AI decides', process: 'no review', output: 'action taken', gain: 'a named reviewer → pause/override before impact' },
    example: 'A ~15-person lender added a 2-minute sign-off on automated declines — same speed on clear cases, a safety net on edge cases.',
  },
  'training-maturity': {
    whatItMeans: 'Staff using AI haven’t had basic guidance on doing it safely and well.',
    whyItMatters: 'Most AI incidents are everyday misuse, not exotic attacks — a little training prevents a lot of them.',
    flow: { input: 'staff use AI', process: 'no guidance', output: 'inconsistent, risky use', gain: 'short training → confident, safe use' },
    example: 'A team ran one 45-minute “how we use AI here” session — and standardised the prompts people were already inventing.',
  },
  'ai-tools': {
    whatItMeans: 'The AI tools in use across the company aren’t fully inventoried.',
    whyItMatters: 'You can’t govern, secure, or improve what you can’t see — unknown tools are where risk hides.',
    flow: { input: 'tools adopted', process: 'no registry', output: 'shadow AI', gain: 'a registry → visibility + control' },
    example: 'A company logged every AI tool in one registry and found three doing the same job — consolidating cut cost and risk.',
  },
  'profile': {
    whatItMeans: 'This is the context that shapes how the rest of your results are weighted.',
    whyItMatters: 'Your sector and AI footprint set which risks matter most for you.',
    flow: { input: 'your context', process: 'risk weighting', output: 'tailored priorities', gain: 'focus → effort where it counts' },
    example: 'Two firms with the same score got different top priorities — because their sector and data made different risks matter more.',
  },
};

const FALLBACK: SectionNarrative = {
  whatItMeans: 'This area of your AI practice has room to strengthen.',
  whyItMatters: 'Closing it reduces risk and makes your AI use more dependable.',
  flow: { input: 'current practice', process: 'a small fix', output: 'a stronger control', gain: 'lower risk, more trust' },
  example: 'Teams that tackled this one step at a time saw steady, compounding improvement. (Illustrative.)',
};

export function getSectionNarrative(key: SectionKey): SectionNarrative {
  return N[key] ?? FALLBACK;
}

/* ── Conversion-oriented "Do this next" intros by recommendation category ──── */
export const CATEGORY_VERB: Record<string, string> = {
  automate: 'Automate it',
  structure: 'Put structure in place',
  process: 'Add a lightweight process',
  train: 'Build the skill',
};
