import { describe, it, expect } from 'vitest';
import {
  computeVisibility, VISIBILITY_QUESTIONS, RECO_THRESHOLD,
  type Answers,
} from '../../src/lib/visibility/visibilityAudit';

/**
 * G3+G4 — AI Visibility & Social audit engine.
 * Deterministic scoring: perfect/empty bounds, grade thresholds, reco ordering.
 */

const all = (v: number): Answers =>
  Object.fromEntries(VISIBILITY_QUESTIONS.map(q => [q.id, v]));

describe('Visibility audit scoring', () => {
  it('scores a perfect questionnaire as 100 / grade A with no recommendations', () => {
    const r = computeVisibility(all(1));
    expect(r.overallScore).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.recommendations).toHaveLength(0);
    for (const d of r.dimensions) expect(d.score).toBe(100);
  });

  it('scores an all-zero questionnaire as 0 / grade D with every question flagged', () => {
    const r = computeVisibility(all(0));
    expect(r.overallScore).toBe(0);
    expect(r.grade).toBe('D');
    expect(r.recommendations).toHaveLength(VISIBILITY_QUESTIONS.length);
  });

  it('treats missing answers as 0 (no crash, full reco list)', () => {
    const r = computeVisibility({});
    expect(r.overallScore).toBe(0);
    expect(r.recommendations.length).toBe(VISIBILITY_QUESTIONS.length);
  });

  it('covers both dimensions', () => {
    const r = computeVisibility(all(0.5));
    expect(r.dimensions.map(d => d.dimension).sort()).toEqual(['geo', 'social']);
    expect(r.overallScore).toBe(50);
    expect(r.grade).toBe('C');
  });

  it('ranks recommendations by weight × gap (impact first)', () => {
    const r = computeVisibility(all(0));
    for (let i = 1; i < r.recommendations.length; i++) {
      expect(r.recommendations[i - 1].priority).toBeGreaterThanOrEqual(r.recommendations[i].priority);
    }
    // Heaviest GEO question (weight 3) outranks the lightest social one (weight 1).
    const top = r.recommendations[0];
    expect(['geo_offer', 'geo_appear', 'soc_story']).toContain(top.id);
  });

  it('only flags questions below the reco threshold', () => {
    const answers: Answers = { ...all(1), geo_offer: 0.5 }; // 0.5 < 0.75 threshold
    const r = computeVisibility(answers);
    expect(r.recommendations.map(x => x.id)).toEqual(['geo_offer']);
    expect(RECO_THRESHOLD).toBe(0.75);
  });
});
