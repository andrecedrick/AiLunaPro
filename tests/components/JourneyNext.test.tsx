import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* B8.2 — guided "Understanding & value → Next action" panel: deterministic
 * summary + 3 adoption options + reversible dashboard escape; advances the
 * journey step (understanding → adoption) without forced redirects. */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));

import { JourneyNext } from '../../src/components/journey/JourneyNext';
import { getJourneyStep } from '../../src/lib/journey/journeyState';

beforeEach(() => { vi.clearAllMocks(); try { localStorage.clear(); } catch { /* noop */ } });

const SUMMARY = { headline: 'Here is what your audit means', lines: ['Overall score 72/100 — medium risk.', 'AI maturity: level 4 of 5.'] };

describe('JourneyNext (B8.2)', () => {
  it('renders the understanding summary + all three adoption options + dashboard escape', () => {
    render(<JourneyNext summary={SUMMARY} />);
    expect(screen.getByText('Here is what your audit means')).toBeTruthy();
    expect(screen.getByText('Overall score 72/100 — medium risk.')).toBeTruthy();
    expect(screen.getByText(/See recommended agents/)).toBeTruthy();
    expect(screen.getByText('Explore membership')).toBeTruthy();
    expect(screen.getByText('Open System Builder')).toBeTruthy();
    expect(screen.getByText('Back to dashboard')).toBeTruthy();
  });

  it('reaching the panel advances the journey to "understanding"', () => {
    render(<JourneyNext summary={SUMMARY} />);
    expect(['understanding', 'adoption']).toContain(getJourneyStep());
  });

  it('emphasizes the Agents CTA with a "Recommended" tag when present', () => {
    render(<JourneyNext summary={SUMMARY} hasRecommendedAgents />);
    expect(screen.getByText('Recommended')).toBeTruthy();
    const agents = screen.getByRole('button', { name: /See recommended agents/i });
    expect(agents.className).toContain('jn-cta--primary'); // button-like emphasis
  });

  it('the adoption options are clickable buttons that navigate + advance to "adoption"', () => {
    render(<JourneyNext summary={SUMMARY} />);
    const agents = screen.getByRole('button', { name: /See recommended agents/i });
    expect(agents.className).toContain('jn-cta'); // CTA styling, not plain text
    fireEvent.click(agents);
    expect(navigate).toHaveBeenCalledWith({ name: 'agents' });
    expect(getJourneyStep()).toBe('adoption');
  });

  it('every adoption option is a button (clearly actionable, not informational text)', () => {
    render(<JourneyNext summary={SUMMARY} />);
    for (const name of [/See recommended agents/i, /Explore membership/i, /Open System Builder/i]) {
      expect(screen.getByRole('button', { name }).className).toContain('jn-cta');
    }
  });

  it('dashboard escape is always available (reversible, no trap)', () => {
    render(<JourneyNext summary={SUMMARY} />);
    fireEvent.click(screen.getByText('Back to dashboard'));
    expect(navigate).toHaveBeenCalledWith({ name: 'dashboard' });
  });
});
