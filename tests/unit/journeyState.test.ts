import { describe, it, expect, beforeEach } from 'vitest';
import {
  isJourneyStarted, markJourneyStarted, postAuthRoute, getJourneyStep, advanceJourney,
  isJourneyBarDismissed, dismissJourneyBar, JOURNEY_LABELS, JOURNEY_STEPS, JOURNEY_EVENT,
} from '../../src/lib/journey/journeyState';

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

describe('journey bar dismissal + metadata (B8.3)', () => {
  it('dismissal flag defaults false and persists once set', () => {
    expect(isJourneyBarDismissed()).toBe(false);
    dismissJourneyBar();
    expect(isJourneyBarDismissed()).toBe(true);
  });
  it('exposes a label for every step', () => {
    expect(JOURNEY_STEPS.every(s => typeof JOURNEY_LABELS[s] === 'string' && JOURNEY_LABELS[s].length > 0)).toBe(true);
  });
  it('fires a change event only on a real advance (not on a no-op)', () => {
    let fired = 0;
    const h = () => { fired++; };
    window.addEventListener(JOURNEY_EVENT, h);
    advanceJourney('audit');   // choice → audit : advances
    advanceJourney('choice');  // backward : no-op, no event
    window.removeEventListener(JOURNEY_EVENT, h);
    expect(fired).toBe(1);
  });
});
