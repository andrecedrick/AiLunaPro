/**
 * AUDIT TEMPS → ARGENT worksheet engine (G1) — REAL per-task data, not estimates.
 *
 * Server-side AUTHORITATIVE. Deterministic, no LLM, no Date, no locale, no
 * randomness. Mirrors the "AUDIT TEMPS → ARGENT" spreadsheet shown in the source
 * videos (docs/audit-ia-methode-complete.md §1–§3): the user enters their real
 * profile and every task, and the engine returns the hourly rate, a per-task
 * VERDICT, the annual cost, and the recoverable hours — exactly like the sheet.
 *
 * The verdict formula reproduces the spreadsheet cell formula verbatim:
 *   =SI(Qui="Toi seul";
 *        SI(Énergie="Énergisant";"GARDER";"REPENSER");
 *        SI(ET(Qui="N'importe qui formé";Règles="Oui");"AUTOMATISER";"DÉLÉGUER"))
 *
 * Mirrored byte-for-byte in src/lib/worksheet/auditWorksheet.ts; parity locked by
 * tests/unit/audit-worksheet-parity.test.ts.
 */

import { WEEKS_PER_MONTH } from '../data/roi-config';
import { stamp, ruleRef, type DeterminismStamp, type Trace } from './determinism';

export const WORKSHEET_RULESET_VERSION = '1.0.0';

/* ── Enums (engine-level codes; UI maps to localized labels + emoji) ── */

export const WHO_VALUES    = ['self', 'specialist', 'anyone'] as const;
export const RULES_VALUES  = ['yes', 'no'] as const;
export const ENERGY_VALUES = ['energizing', 'neutral', 'draining'] as const;
export const VERDICT_VALUES = ['keep', 'rethink', 'automate', 'delegate'] as const;

export type Who     = typeof WHO_VALUES[number];
export type Rules   = typeof RULES_VALUES[number];
export type Energy  = typeof ENERGY_VALUES[number];
export type Verdict = typeof VERDICT_VALUES[number];

export const isWho    = (v: unknown): v is Who    => typeof v === 'string' && (WHO_VALUES    as readonly string[]).includes(v);
export const isRules  = (v: unknown): v is Rules  => typeof v === 'string' && (RULES_VALUES  as readonly string[]).includes(v);
export const isEnergy = (v: unknown): v is Energy => typeof v === 'string' && (ENERGY_VALUES as readonly string[]).includes(v);

/* ── Inputs ────────────────────────────────────────────────── */

export const INCOME_PERIOD_VALUES = ['month', 'year', 'week'] as const;
export type IncomePeriod = typeof INCOME_PERIOD_VALUES[number];
export const isIncomePeriod = (v: unknown): v is IncomePeriod =>
  typeof v === 'string' && (INCOME_PERIOD_VALUES as readonly string[]).includes(v);

export interface WorksheetProfile {
  /** Net income/take-home for the person whose time is being valued. > 0. */
  monthlyNetIncome: number;
  /** Hours worked per week by that person (profile, not per-task). > 0. */
  weeklyWorkHours:  number;
  /**
   * Period the income figure refers to. Default 'month' (backward-compatible).
   * Makes the tool usable across countries/jobs where pay is quoted per
   * month, per year, or per week. The hourly-rate formula adapts:
   *   month → income / (weeklyHours × 4.33)
   *   year  → income / (weeklyHours × 52)
   *   week  → income / weeklyHours
   */
  incomePeriod?:    IncomePeriod;
}

export interface WorksheetTask {
  /** Stable id (optional; echoed back so the UI can map rows). */
  id?:         string;
  label:       string;
  /** Hours spent on THIS task per week. ≥ 0. */
  weeklyHours: number;
  who:         Who;
  rules:       Rules;
  energy:      Energy;
}

export interface WorksheetInput {
  profile: WorksheetProfile;
  tasks:   WorksheetTask[];
}

/* ── Result ────────────────────────────────────────────────── */

export interface WorksheetRow {
  id:                    string | null;
  label:                 string;
  weeklyHours:           number;
  who:                   Who;
  rules:                 Rules;
  energy:                Energy;
  verdict:               Verdict;
  annualCost:            number;   // weeklyHours × 52 × hourlyRate
  recoveredHoursPerWeek: number;   // weeklyHours if automate|delegate, else 0
}

export interface WorksheetTotals {
  hourlyRate:                 number;
  totalWeeklyHours:           number;
  totalAnnualCost:            number;
  totalRecoveredHoursPerWeek: number;
  totalRecoveredHoursPerYear: number;
  /** Money tied to recoverable hours: recoveredHours/yr × hourlyRate. */
  annualValueRecovered:       number;
  counts:                     Record<Verdict, number>;
}

/** A prioritized recoverable task (Quick-Win cockpit — méthode §3.4). */
export interface QuickWin {
  id:                    string | null;
  label:                 string;
  verdict:               Verdict;
  annualCost:            number;
  recoveredHoursPerWeek: number;
  /** Implementation effort proxy: automate = low, delegate = medium. */
  effort:                'low' | 'medium';
  /** annualCost weighted by effort — higher = do first. */
  priorityScore:         number;
}

export interface WorksheetResult {
  hourlyRate: number;
  rows:       WorksheetRow[];
  totals:     WorksheetTotals;
  /** Recoverable tasks ranked by impact ÷ effort (top of the list = do first). */
  quickWins:  QuickWin[];
}

export interface WorksheetScored extends DeterminismStamp {
  result: WorksheetResult;
  trace:  Trace;
}

/* ── Rounding ──────────────────────────────────────────────── */
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;
const round2 = (n: number): number => Math.round(n * 100) / 100;

const WEEKS_PER_YEAR = 52;
const MAX_TASKS = 100;

/* ── Core formulas ─────────────────────────────────────────── */

/**
 * Hourly rate from the profile: monthly net income / (weekly hours × 4.33).
 * Returns 0 if weekly hours are not positive (avoids div-by-zero).
 */
export function computeHourlyRate(profile: WorksheetProfile): number {
  if (profile.weeklyWorkHours <= 0) return 0;
  const period = profile.incomePeriod ?? 'month';
  const hoursInPeriod =
    period === 'year' ? profile.weeklyWorkHours * WEEKS_PER_YEAR :
    period === 'week' ? profile.weeklyWorkHours :
                        profile.weeklyWorkHours * WEEKS_PER_MONTH;
  return round2(profile.monthlyNetIncome / hoursInPeriod);
}

/**
 * Per-task verdict — verbatim port of the spreadsheet formula.
 *   self      → energizing ? keep : rethink
 *   otherwise → (anyone AND rules=yes) ? automate : delegate
 */
export function taskVerdict(who: Who, rules: Rules, energy: Energy): Verdict {
  if (who === 'self') {
    return energy === 'energizing' ? 'keep' : 'rethink';
  }
  return who === 'anyone' && rules === 'yes' ? 'automate' : 'delegate';
}

/** A task's hours are recoverable when it is automated or delegated. */
export function isRecoverable(verdict: Verdict): boolean {
  return verdict === 'automate' || verdict === 'delegate';
}

/**
 * Quick-Win cockpit (méthode §3.4 — Impact × Effort). Ranks the recoverable
 * tasks by annual cost weighted by implementation effort (automate = low effort,
 * delegate = medium). Deterministic order: score desc, then cost desc, then label.
 */
export function buildQuickWins(rows: WorksheetRow[]): QuickWin[] {
  const recoverable = rows.filter(r => isRecoverable(r.verdict));
  const wins: QuickWin[] = recoverable.map(r => {
    const effort: 'low' | 'medium' = r.verdict === 'automate' ? 'low' : 'medium';
    const priorityScore = round0(r.annualCost / (effort === 'low' ? 1 : 2));
    return {
      id: r.id, label: r.label, verdict: r.verdict,
      annualCost: r.annualCost, recoveredHoursPerWeek: r.recoveredHoursPerWeek,
      effort, priorityScore,
    };
  });
  wins.sort((a, b) =>
    b.priorityScore - a.priorityScore ||
    b.annualCost - a.annualCost ||
    // Locale-INDEPENDENT tie-break (code points) — must be byte-identical on the
    // client (browser ICU) and the worker (V8 default), so NEVER use localeCompare.
    (a.label < b.label ? -1 : a.label > b.label ? 1 : 0),
  );
  return wins;
}

export function computeWorksheet(input: WorksheetInput): WorksheetResult {
  const hourlyRate = computeHourlyRate(input.profile);

  const counts: Record<Verdict, number> = { keep: 0, rethink: 0, automate: 0, delegate: 0 };
  let totalWeeklyHours = 0;
  let totalAnnualCost = 0;
  let totalRecoveredHoursPerWeek = 0;

  const rows: WorksheetRow[] = input.tasks.map(t => {
    const verdict = taskVerdict(t.who, t.rules, t.energy);
    const annualCost = round0(t.weeklyHours * WEEKS_PER_YEAR * hourlyRate);
    const recoveredHoursPerWeek = isRecoverable(verdict) ? round1(t.weeklyHours) : 0;

    counts[verdict] += 1;
    totalWeeklyHours += t.weeklyHours;
    totalAnnualCost += annualCost;
    totalRecoveredHoursPerWeek += recoveredHoursPerWeek;

    return {
      id: t.id ?? null,
      label: t.label,
      weeklyHours: t.weeklyHours,
      who: t.who,
      rules: t.rules,
      energy: t.energy,
      verdict,
      annualCost,
      recoveredHoursPerWeek,
    };
  });

  const totalRecoveredHoursPerYear = round0(totalRecoveredHoursPerWeek * WEEKS_PER_YEAR);
  const annualValueRecovered = round0(totalRecoveredHoursPerYear * hourlyRate);

  const quickWins = buildQuickWins(rows);

  return {
    hourlyRate,
    rows,
    quickWins,
    totals: {
      hourlyRate,
      totalWeeklyHours: round1(totalWeeklyHours),
      totalAnnualCost,
      totalRecoveredHoursPerWeek: round1(totalRecoveredHoursPerWeek),
      totalRecoveredHoursPerYear,
      annualValueRecovered,
      counts,
    },
  };
}

/* ── Validation ────────────────────────────────────────────── */

export function validateWorksheet(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'input must be an object';
  const i = input as Record<string, unknown>;

  const p = i.profile as Record<string, unknown> | undefined;
  if (!p || typeof p !== 'object') return 'profile is required';
  if (typeof p.monthlyNetIncome !== 'number' || !Number.isFinite(p.monthlyNetIncome) || p.monthlyNetIncome <= 0 || p.monthlyNetIncome > 100000000) {
    return 'profile.monthlyNetIncome must be greater than 0';
  }
  if (typeof p.weeklyWorkHours !== 'number' || !Number.isFinite(p.weeklyWorkHours) || p.weeklyWorkHours <= 0 || p.weeklyWorkHours > 168) {
    return 'profile.weeklyWorkHours must be between 0 and 168';
  }
  if (p.incomePeriod != null && !isIncomePeriod(p.incomePeriod)) {
    return `profile.incomePeriod must be one of: ${INCOME_PERIOD_VALUES.join(', ')}`;
  }

  if (!Array.isArray(i.tasks)) return 'tasks must be an array';
  if (i.tasks.length === 0) return 'at least one task is required';
  if (i.tasks.length > MAX_TASKS) return `at most ${MAX_TASKS} tasks allowed`;

  for (let k = 0; k < i.tasks.length; k++) {
    const t = i.tasks[k] as Record<string, unknown>;
    if (!t || typeof t !== 'object') return `tasks[${k}] must be an object`;
    if (typeof t.label !== 'string' || t.label.trim() === '' || t.label.length > 200) {
      return `tasks[${k}].label must be a non-empty string (≤200 chars)`;
    }
    if (typeof t.weeklyHours !== 'number' || !Number.isFinite(t.weeklyHours) || t.weeklyHours < 0 || t.weeklyHours > 168) {
      return `tasks[${k}].weeklyHours must be between 0 and 168`;
    }
    if (!isWho(t.who))       return `tasks[${k}].who must be one of: ${WHO_VALUES.join(', ')}`;
    if (!isRules(t.rules))   return `tasks[${k}].rules must be one of: ${RULES_VALUES.join(', ')}`;
    if (!isEnergy(t.energy)) return `tasks[${k}].energy must be one of: ${ENERGY_VALUES.join(', ')}`;
    if (t.id != null && (typeof t.id !== 'string' || t.id.length > 64)) {
      return `tasks[${k}].id must be a string (≤64 chars)`;
    }
  }
  return null;
}

/* ── Stamped + traced entry point ──────────────────────────── */

export function scoreWorksheet(input: WorksheetInput): WorksheetScored {
  const result = computeWorksheet(input);
  const trace: Trace = {
    hourlyRate:           [ruleRef('worksheet.formula.hourlyRate')],
    'rows[].verdict':     [ruleRef('worksheet.formula.verdict')],
    'rows[].annualCost':  [ruleRef('worksheet.formula.annualCost')],
    'totals.annualValueRecovered': [ruleRef('worksheet.formula.recovered')],
  };
  return { ...stamp(WORKSHEET_RULESET_VERSION), result, trace };
}

export function generateWorksheetId(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
