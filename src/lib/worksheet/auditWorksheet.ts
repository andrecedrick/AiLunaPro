/**
 * Client-side AUDIT TEMPS → ARGENT worksheet — mirror of the worker's
 * authoritative engine (worker/src/lib/audit-worksheet.ts).
 *
 * Pure + deterministic so the table recomputes live as the user types their real
 * data (profile + tasks), exactly like the spreadsheet in the source videos.
 * The server stays authoritative on save. Numeric parity is locked by
 * tests/unit/audit-worksheet-parity.test.ts.
 */

import { WEEKS_PER_MONTH } from '../../data/roi-config';

export const WHO_VALUES     = ['self', 'specialist', 'anyone'] as const;
export const RULES_VALUES   = ['yes', 'no'] as const;
export const ENERGY_VALUES  = ['energizing', 'neutral', 'draining'] as const;
export const VERDICT_VALUES = ['keep', 'rethink', 'automate', 'delegate'] as const;

export type Who     = typeof WHO_VALUES[number];
export type Rules   = typeof RULES_VALUES[number];
export type Energy  = typeof ENERGY_VALUES[number];
export type Verdict = typeof VERDICT_VALUES[number];

export interface WorksheetProfile {
  monthlyNetIncome: number;
  weeklyWorkHours:  number;
}

export interface WorksheetTask {
  id?:         string;
  label:       string;
  weeklyHours: number;
  who:         Who;
  rules:       Rules;
  energy:      Energy;
}

export interface WorksheetInput {
  profile: WorksheetProfile;
  tasks:   WorksheetTask[];
}

export interface WorksheetRow {
  id:                    string | null;
  label:                 string;
  weeklyHours:           number;
  who:                   Who;
  rules:                 Rules;
  energy:                Energy;
  verdict:               Verdict;
  annualCost:            number;
  recoveredHoursPerWeek: number;
}

export interface WorksheetTotals {
  hourlyRate:                 number;
  totalWeeklyHours:           number;
  totalAnnualCost:            number;
  totalRecoveredHoursPerWeek: number;
  totalRecoveredHoursPerYear: number;
  annualValueRecovered:       number;
  counts:                     Record<Verdict, number>;
}

export interface WorksheetResult {
  hourlyRate: number;
  rows:       WorksheetRow[];
  totals:     WorksheetTotals;
}

// Rounding — identical to worker/src/lib/audit-worksheet.ts.
const round0 = (n: number): number => Math.round(n);
const round1 = (n: number): number => Math.round(n * 10) / 10;
const round2 = (n: number): number => Math.round(n * 100) / 100;

const WEEKS_PER_YEAR = 52;

export function computeHourlyRate(profile: WorksheetProfile): number {
  if (profile.weeklyWorkHours <= 0) return 0;
  return round2(profile.monthlyNetIncome / (profile.weeklyWorkHours * WEEKS_PER_MONTH));
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

export function isRecoverable(verdict: Verdict): boolean {
  return verdict === 'automate' || verdict === 'delegate';
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

  return {
    hourlyRate,
    rows,
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
