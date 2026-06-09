import { describe, it, expect, beforeEach } from 'vitest';
import { isJourneyStarted, markJourneyStarted, postAuthRoute, getJourneyStep, advanceJourney } from '../../src/lib/journey/journeyState';

/* B8.1 — deterministic journey state (localStorage). Default-ON first run,
 * reversible (once started, never forced again). */

beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('journeyState', () => {
  it('first run: not started → post-auth route is the guided choice', () => {
    expect(isJourneyStarted()).toBe(false);
    expect(postAuthRoute()).toBe('journey/start');
  });
  it('after marking started: route falls back to dashboard (no longer forced)', () => {
    markJourneyStarted();
    expect(isJourneyStarted()).toBe(true);
    expect(postAuthRoute()).toBe('dashboard');
  });
  it('is deterministic for a given storage state', () => {
    expect(postAuthRoute()).toBe('journey/start');
    expect(postAuthRoute()).toBe('journey/start');
    markJourneyStarted();
    expect(postAuthRoute()).toBe('dashboard');
    expect(postAuthRoute()).toBe('dashboard');
  });
});

describe('journey step model (B8.2)', () => {
  it('defaults to "choice"', () => {
    expect(getJourneyStep()).toBe('choice');
  });
  it('advances monotonically and never regresses', () => {
    advanceJourney('understanding');
    expect(getJourneyStep()).toBe('understanding');
    advanceJourney('choice');             // backward → ignored
    expect(getJourneyStep()).toBe('understanding');
    advanceJourney('adoption');
    expect(getJourneyStep()).toBe('adoption');
    advanceJourney('audit');              // backward → ignored
    expect(getJourneyStep()).toBe('adoption');
  });
});
