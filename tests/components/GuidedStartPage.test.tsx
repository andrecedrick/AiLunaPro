import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* B8.1 — guided choice screen: offers Audit Express + New Audit + a skip-to-dashboard
 * escape; any action marks the journey started (so it's never forced again). */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));

import { GuidedStartPage } from '../../src/pages/GuidedStartPage';
import { isJourneyStarted } from '../../src/lib/journey/journeyState';
import { savePendingResult, readPendingResult } from '../../src/lib/leads/pendingLead';

beforeEach(() => { vi.clearAllMocks(); try { localStorage.clear(); } catch { /* noop */ } });

describe('GuidedStartPage (B8.1)', () => {
  it('offers both audit paths + a dashboard escape', () => {
    render(<GuidedStartPage />);
    expect(screen.getByText(/Start Audit Express/)).toBeTruthy();
    expect(screen.getByText(/Create a New Audit/)).toBeTruthy();
    expect(screen.getByText(/Skip/)).toBeTruthy();
  });
  it('choosing Audit Express marks journey started + navigates', () => {
    render(<GuidedStartPage />);
    fireEvent.click(screen.getByText(/Start Audit Express/));
    expect(isJourneyStarted()).toBe(true);
    expect(navigate).toHaveBeenCalledWith({ name: 'audit-express/run' });
  });
  it('skip marks journey started + goes to dashboard (reversible escape)', () => {
    render(<GuidedStartPage />);
    fireEvent.click(screen.getByText(/Skip/));
    expect(isJourneyStarted()).toBe(true);
    expect(navigate).toHaveBeenCalledWith({ name: 'dashboard' });
  });
});

describe('GuidedStartPage — anon→auth continuity (B2.3)', () => {
  it('greets with the pending public-flow result and clears it on choice', () => {
    savePendingResult({ kind: 'diagnostic', headline: 'AI maturity score 62/100 (medium)', createdAt: '2026-06-10T00:00:00.000Z' });
    render(<GuidedStartPage />);
    // B2.3 + A1: the returning-user greeting is now fully localized (no English
    // score headline echoed) — assert the diagnostic continuity greeting renders.
    expect(screen.getByText(/We saved your diagnostic/)).toBeTruthy();
    fireEvent.click(screen.getByText(/Start Audit Express/));
    expect(readPendingResult('diagnostic')).toBeNull(); // one-shot: consumed
    expect(navigate).toHaveBeenCalledWith({ name: 'audit-express/run' });
  });

  it('renders the default greeting when no pending result exists', () => {
    render(<GuidedStartPage />);
    expect(screen.getByText(/Pick how you'd like to begin/)).toBeTruthy();
  });
});
