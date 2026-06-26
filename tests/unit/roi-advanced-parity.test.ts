import { describe, it, expect } from 'vitest';
import { computeRoiAdvancedPreview } from '../../src/lib/roi/advanced';
import { WORKFLOW_VALUES, type Workflow } from '../../src/data/roi-config';
import { computeRoiAdvanced, monthlyFromWeekly } from '../../worker/src/lib/roi-advanced';

/**
 * G5 — advanced ROI engine parity + formula lock.
 *
 * (1) The client preview MUST equal the worker's authoritative engine across a
 *     representative input grid, so the breakdown a visitor sees pre-gate is
 *     byte-identical to what the server persists. Drift in any constant, the
 *     formula, or a rounding rule fails this test.
 * (2) Explicit formula checks pin the headline figures (loaded rate, COI,
 *     payback / ROI edge cases) to the documented method.
 */

describe('Advanced ROI client/server parity', () => {
  const TEAM   = [1, 3, 8, 50];
  const HOURS  = [0, 17.3, 43.3, 120];          // monthly hours/person
  const RATES  = [12, 27, 40, 95];              // base hourly
  const LOADS  = [1.0, 1.8, 2.3];
  const IMPL   = [0, 5000];
  const RECUR  = [0, 99, 400];

  it('matches the worker computeRoiAdvanced across a representative grid', () => {
    let n = 0;
    for (const workflow of WORKFLOW_VALUES as readonly Workflow[]) {
      for (const teamSize of TEAM) {
        for (const monthlyHoursPerPerson of HOURS) {
          for (const baseHourlyRate of RATES) {
            for (const loadCoefficient of LOADS) {
              for (const implementationCost of IMPL) {
                for (const recurringMonthlyCost of RECUR) {
                  const inputs = {
                    teamSize, monthlyHoursPerPerson, baseHourlyRate,
                    loadCoefficient, targetWorkflow: workflow,
                    implementationCost, recurringMonthlyCost,
                  };
                  expect(computeRoiAdvancedPreview(inputs)).toEqual(computeRoiAdvanced(inputs));
                  n++;
                }
              }
            }
          }
        }
      }
    }
    expect(n).toBe(
      WORKFLOW_VALUES.length * TEAM.length * HOURS.length * RATES.length * LOADS.length * IMPL.length * RECUR.length,
    );
  });

  it('honours the automation-rate override identically on both sides', () => {
    const inputs = {
      teamSize: 4, monthlyHoursPerPerson: 80, baseHourlyRate: 30, loadCoefficient: 1.8,
      targetWorkflow: 'support' as Workflow, automationRateOverride: 0.7,
      implementationCost: 8000, recurringMonthlyCost: 250, revenuePerFreedHour: 120,
    };
    const client = computeRoiAdvancedPreview(inputs);
    expect(client).toEqual(computeRoiAdvanced(inputs));
    expect(client.appliedAutomationRate).toBe(0.7);
  });
});

describe('Advanced ROI formula correctness', () => {
  const base = {
    teamSize: 1, monthlyHoursPerPerson: 43.3, baseHourlyRate: 27, loadCoefficient: 1.0,
    targetWorkflow: 'finance' as Workflow, implementationCost: 0, recurringMonthlyCost: 99,
  };

  it('computes loaded rate = base × coefficient', () => {
    const r = computeRoiAdvanced({ ...base, baseHourlyRate: 30, loadCoefficient: 1.8 });
    expect(r.loadedHourlyRate).toBe(54);
  });

  it('scales money by team size and links COI to the yearly saving', () => {
    const solo = computeRoiAdvanced({ ...base, teamSize: 1 });
    const team = computeRoiAdvanced({ ...base, teamSize: 8 });
    expect(team.teamYearlyCostSaved).toBe(solo.yearlyCostSaved * 8);
    expect(team.coiPerYear).toBe(team.teamYearlyCostSaved);
    expect(team.coiPerMonth).toBe(team.teamMonthlyCostSaved);
    expect(team.coiPerDay).toBe(Math.round(team.teamYearlyCostSaved / 260));
  });

  it('returns null ROI% when there is no first-year investment', () => {
    const r = computeRoiAdvanced({ ...base, implementationCost: 0, recurringMonthlyCost: 0 });
    expect(r.firstYearInvestment).toBe(0);
    expect(r.roiPercentYear1).toBeNull();
  });

  it('returns null payback when the monthly net saving is not positive', () => {
    const r = computeRoiAdvanced({
      ...base, monthlyHoursPerPerson: 1, baseHourlyRate: 5, loadCoefficient: 1.0,
      implementationCost: 5000, recurringMonthlyCost: 10000,
    });
    expect(r.paybackMonths).toBeNull();
  });

  it('converts freed capacity to revenue only when a per-hour value is given', () => {
    const without = computeRoiAdvanced({ ...base, teamSize: 8 });
    const withRev = computeRoiAdvanced({ ...base, teamSize: 8, revenuePerFreedHour: 100 });
    expect(without.additionalRevenueYear).toBeNull();
    expect(withRev.additionalRevenueYear).toBe(Math.round(withRev.teamTimeSavedHoursPerYear * 100));
  });

  it('monthlyFromWeekly converts weekly hours via 4.33', () => {
    expect(monthlyFromWeekly(10)).toBe(43.3);
  });
});
