import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";

/* B8.3 — guided journey progress indicator + continuous guidance: shows the
 * 4-stage funnel on journey surfaces only, advances with the step, is reversible
 * (revisitable first step) and dismissible, and stays hidden once complete. */

let mockRoute: { name: string } = { name: 'dashboard' };
const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ route: mockRoute, navigate }) }));

import { JourneyProgress } from '../../src/components/journey/JourneyProgress';
import { advanceJourney, isJourneyBarDismissed } from '../../src/lib/journey/journeyState';

beforeEach(() => {
  vi.clearAllMocks();
  try { localStorage.clear(); } catch { /* noop */ }
  mockRoute = { name: 'dashboard' };
});

describe('JourneyProgress (B8.3)', () => {
  it('renders the 4-stage funnel + guidance on a journey surface', () => {
    render(<JourneyProgress />);
    for (const label of ['Choose', 'Audit', 'Understand', 'Adopt']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByText(/Choose how to start/)).toBeTruthy();    // per-step hint
    expect(screen.getByRole('button', { name: /Choose audit type/i })).toBeTruthy();
  });

  it('is ON BY DEFAULT regardless of route (only Dismiss/Adopt hide it)', () => {
    mockRoute = { name: 'settings/profile' };
    render(<JourneyProgress />);
    // Route-agnostic: still visible on any shell page while the journey is active.
    expect(screen.getByText('Choose')).toBeTruthy();
    expect(screen.getByText('Understand')).toBeTruthy();
  });

  it('is hidden once the journey reaches adoption (complete)', () => {
    advanceJourney('adoption');
    const { container } = render(<JourneyProgress />);
    expect(container.firstChild).toBeNull();
  });

  it('the first step + CTA navigate to the guided choice (reversible)', () => {
    render(<JourneyProgress />);
    fireEvent.click(screen.getByRole('button', { name: /Choose audit type/i }));
    expect(navigate).toHaveBeenCalledWith({ name: 'journey/start' });
  });

  it('is dismissible and stays dismissed', () => {
    const { container } = render(<JourneyProgress />);
    fireEvent.click(screen.getByRole('button', { name: /Dismiss guided journey/i }));
    expect(container.firstChild).toBeNull();
    expect(isJourneyBarDismissed()).toBe(true);
  });

  it('reacts to an in-page step advance (continuous guidance updates)', () => {
    render(<JourneyProgress />);
    expect(screen.getByText(/Choose how to start/)).toBeTruthy();
    act(() => { advanceJourney('understanding'); }); // fires JOURNEY_EVENT
    expect(screen.getByText(/Here's what your audit means/)).toBeTruthy();
    expect(screen.queryByText(/Choose how to start/)).toBeNull();
  });
});
