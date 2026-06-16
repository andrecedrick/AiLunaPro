import { describe, it, expect } from 'vitest';
import { computeDiagnosticPreview, BUCKET_LOW_MAX, BUCKET_MEDIUM_MAX } from '../../src/lib/diagnostic/score';
import { DIAGNOSTIC_QUESTIONS } from '../../src/data/diagnostic-questions';
import { computeScore } from '../../worker/src/lib/diagnostic-shared';

/**
 * A1 Change 2a — value-first parity lock.
 *
 * The client preview scorer (shown BEFORE the email gate) MUST produce the
 * identical normalized score + bucket as the worker's authoritative
 * `computeScore` for EVERY possible set of weighted answers, so the number a
 * visitor sees is exactly the one the server saves. If anyone tweaks the
 * client formula, the worker formula, the question weights/scores, or the
 * bucket cutoffs without keeping them in sync, this test fails loudly.
 */
describe('diagnostic client/server score parity', () => {
  const weighted = DIAGNOSTIC_QUESTIONS.filter(q => q.weight > 0);

  it('matches the worker for every weighted-answer combination', () => {
    let combos = 0;
    const walk = (i: number, acc: Record<string, string>) => {
      if (i === weighted.length) {
        const client = computeDiagnosticPreview(acc);
        const server = computeScore(acc);
        expect(client.score).toBe(server.normalizedScore);
        expect(client.bucket).toBe(server.bucket);
        combos++;
        return;
      }
      for (const opt of weighted[i].options) {
        walk(i + 1, { ...acc, [weighted[i].id]: opt.value });
      }
    };
    walk(0, {});
    // Exhaustive: 7 weighted questions × 4 options each = 16,384 combinations.
    expect(combos).toBe(weighted.reduce((n, q) => n * q.options.length, 1));
  });

  it('uses bucket cutoffs consistent with the worker', () => {
    expect(BUCKET_LOW_MAX).toBe(39);
    expect(BUCKET_MEDIUM_MAX).toBe(69);
  });
});
