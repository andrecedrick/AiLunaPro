import { describe, it, expect } from 'vitest';
import { computeRoiPreview } from '../../src/lib/roi/score';
import { WORKFLOW_VALUES, type Workflow } from '../../src/data/roi-config';
import { computeRoi } from '../../worker/src/lib/roi-shared';

/**
 * A1 Change 2b — value-first parity lock.
 *
 * The client ROI preview (shown BEFORE the email gate) MUST produce the
 * identical numeric savings as the worker's authoritative `computeRoi` so the
 * figures a visitor sees are exactly the ones the server saves. Inputs are
 * continuous, so we sweep a representative grid covering every workflow and the
 * rounding/edge boundaries (0 hours → $0 → null payback, fractional hours/costs,
 * range extremes). Drift in either formula, the savings rates, the reference
 * agent cost, or the rounding rules fails this test.
 */
describe('ROI client/server preview parity', () => {
  // Includes edge cases: 0 (null payback), fractional rounding, range extremes.
  const HOURS = [0, 1, 7, 12.5, 33.3, 40, 80, 83, 100, 160, 999, 10000];
  const COSTS = [1, 7, 15, 49.5, 50, 99, 137, 250, 1000];

  it('matches the worker computeRoi across a representative input grid', () => {
    let n = 0;
    for (const workflow of WORKFLOW_VALUES as readonly Workflow[]) {
      for (const hours of HOURS) {
        for (const cost of COSTS) {
          const client = computeRoiPreview({
            monthlyHoursOnRepetitiveWork: hours,
            averageHourlyCost:            cost,
            targetWorkflow:               workflow,
          });
          // teamSize does not affect the formula; pass a valid placeholder.
          const server = computeRoi({
            teamSize:                     1,
            monthlyHoursOnRepetitiveWork: hours,
            averageHourlyCost:            cost,
            targetWorkflow:               workflow,
          });
          expect(client.estimatedTimeSavedHoursPerMonth).toBe(server.estimatedTimeSavedHoursPerMonth);
          expect(client.estimatedMonthlyCostSaved).toBe(server.estimatedMonthlyCostSaved);
          expect(client.estimatedYearlyCostSaved).toBe(server.estimatedYearlyCostSaved);
          expect(client.estimatedPaybackMonths).toBe(server.estimatedPaybackMonths);
          n++;
        }
      }
    }
    expect(n).toBe(WORKFLOW_VALUES.length * HOURS.length * COSTS.length);
  });

  it('returns a null payback when no monthly cost is saved', () => {
    const preview = computeRoiPreview({
      monthlyHoursOnRepetitiveWork: 0,
      averageHourlyCost:            50,
      targetWorkflow:               'support',
    });
    expect(preview.estimatedMonthlyCostSaved).toBe(0);
    expect(preview.estimatedPaybackMonths).toBeNull();
  });
});
