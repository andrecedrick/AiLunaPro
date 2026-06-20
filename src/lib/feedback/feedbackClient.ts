/**
 * User feedback API client — S1.
 * Public unauth endpoint — anonymous, no Authorization header, no PII.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import type { FeedbackSource } from '../analytics/events';

export type FeedbackDifficulty = 'easy' | 'ok' | 'hard';

export interface FeedbackInput {
  source:       FeedbackSource;
  satisfaction: number;                 // 1..5
  difficulty?:  FeedbackDifficulty;
  blocker?:     string;                 // "What prevented you from going further?"
  suggestion?:  string;
}

/**
 * Submit anonymous feedback. Best-effort: resolves true on success, false on any
 * failure — feedback must never block or surface an error into the result flow.
 */
export async function submitFeedback(input: FeedbackInput): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_BASE}/api/public/feedback`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(input),
    });
    return res.ok;
  } catch {
    return false;
  }
}
