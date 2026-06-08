import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* B8.1 — guided choice screen: offers Audit Express + New Audit + a skip-to-dashboard
 * escape; any action marks the journey started (so it's never forced again). */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));

import { GuidedStartPage } from '../../src/pages/GuidedStartPage';
import { isJourneyStarted } from '../../src/lib/journey/journeyState';

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
