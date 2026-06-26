import { describe, it, expect } from 'vitest';
import {
  computeWorksheet as clientCompute,
  taskVerdict as clientVerdict,
  WHO_VALUES, RULES_VALUES, ENERGY_VALUES,
  type WorksheetInput,
} from '../../src/lib/worksheet/auditWorksheet';
import {
  computeWorksheet as workerCompute,
  taskVerdict as workerVerdict,
  computeHourlyRate,
} from '../../worker/src/lib/audit-worksheet';

/**
 * G1 — AUDIT TEMPS → ARGENT worksheet parity + verdict truth-table lock.
 *
 * (1) Client live recompute MUST equal the worker's authoritative engine.
 * (2) The verdict truth-table reproduces the spreadsheet cell formula exactly,
 *     including the named rows visible in the source video screenshots.
 */

describe('Worksheet verdict — verbatim spreadsheet formula', () => {
  it('covers the full 3×2×3 truth table identically on both sides', () => {
    for (const who of WHO_VALUES) {
      for (const rules of RULES_VALUES) {
        for (const energy of ENERGY_VALUES) {
          expect(clientVerdict(who, rules, energy)).toBe(workerVerdict(who, rules, energy));
        }
      }
    }
  });

  it('matches the named rows from the source spreadsheet', () => {
    // "Toi seul" branch keys off energy.
    expect(workerVerdict('self', 'yes', 'energizing')).toBe('keep');      // Prospection
    expect(workerVerdict('self', 'yes', 'draining')).toBe('rethink');     // Devis client
    expect(workerVerdict('self', 'no', 'neutral')).toBe('rethink');
    // Otherwise branch: automate only when anyone + clear rules.
    expect(workerVerdict('anyone', 'yes', 'draining')).toBe('automate');  // Emails / planning
    expect(workerVerdict('anyone', 'no', 'draining')).toBe('delegate');   // CRM (no rules)
    expect(workerVerdict('specialist', 'no', 'neutral')).toBe('delegate'); // Comptabilité
    expect(workerVerdict('specialist', 'yes', 'energizing')).toBe('delegate');
  });
});

describe('Worksheet client/server parity', () => {
  const profiles = [
    { monthlyNetIncome: 7000, weeklyWorkHours: 60 },
    { monthlyNetIncome: 3500, weeklyWorkHours: 35 },
    { monthlyNetIncome: 12000, weeklyWorkHours: 50 },
  ];
  const tasks: WorksheetInput['tasks'] = [
    { id: 't1', label: 'Emails',       weeklyHours: 10, who: 'anyone',     rules: 'yes', energy: 'draining' },
    { id: 't2', label: 'Comptabilité', weeklyHours: 4,  who: 'specialist', rules: 'no',  energy: 'neutral' },
    { id: 't3', label: 'Prospection',  weeklyHours: 20, who: 'self',       rules: 'yes', energy: 'energizing' },
    { id: 't4', label: 'Saisie CRM',   weeklyHours: 2,  who: 'anyone',     rules: 'no',  energy: 'draining' },
    { id: 't5', label: 'Devis',        weeklyHours: 10, who: 'self',       rules: 'yes', energy: 'draining' },
  ];

  it('produces identical results across profiles', () => {
    for (const profile of profiles) {
      const input: WorksheetInput = { profile, tasks };
      expect(clientCompute(input)).toEqual(workerCompute(input));
    }
  });
});

describe('Worksheet formula correctness', () => {
  const input: WorksheetInput = {
    profile: { monthlyNetIncome: 7000, weeklyWorkHours: 60 },
    tasks: [
      { label: 'Emails',      weeklyHours: 10, who: 'anyone', rules: 'yes', energy: 'draining' },     // automate
      { label: 'Prospection', weeklyHours: 20, who: 'self',   rules: 'yes', energy: 'energizing' },   // keep
      { label: 'Comptabilité',weeklyHours: 4,  who: 'specialist', rules: 'no', energy: 'neutral' },   // delegate
    ],
  };

  it('derives the hourly rate from monthly income / (weekly hours × 4.33)', () => {
    const rate = computeHourlyRate(input.profile);
    expect(rate).toBe(Math.round((7000 / (60 * 4.33)) * 100) / 100); // 26.94
  });

  it('computes annual cost = weeklyHours × 52 × rate', () => {
    const r = workerCompute(input);
    const rate = r.hourlyRate;
    expect(r.rows[0].annualCost).toBe(Math.round(10 * 52 * rate));
  });

  it('recovers hours only for automate/delegate, never keep/rethink', () => {
    const r = workerCompute(input);
    expect(r.rows[0].recoveredHoursPerWeek).toBe(10); // automate
    expect(r.rows[1].recoveredHoursPerWeek).toBe(0);  // keep
    expect(r.rows[2].recoveredHoursPerWeek).toBe(4);  // delegate
  });

  it('totals recoverable value = recovered hours/year × rate', () => {
    const r = workerCompute(input);
    expect(r.totals.totalRecoveredHoursPerWeek).toBe(14);              // 10 + 4
    expect(r.totals.totalRecoveredHoursPerYear).toBe(Math.round(14 * 52));
    expect(r.totals.annualValueRecovered).toBe(Math.round(14 * 52 * r.hourlyRate));
    expect(r.totals.counts).toEqual({ keep: 1, rethink: 0, automate: 1, delegate: 1 });
  });
});
