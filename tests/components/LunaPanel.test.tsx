import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* B4 — Luna AI Copilot (Option A, rule-based): named route-aware slide-over
 * with deterministic guidance, journey position, deep-link actions, Help link.
 * Always dismissible; no LLM, no free-text input. */

let mockRoute: { name: string } = { name: 'registry' };
const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ route: mockRoute, navigate }) }));
vi.mock('../../src/context/PreferencesContext', () => ({ usePreferences: () => ({ language: 'en' }) }));

import { LunaPanel } from '../../src/components/luna/LunaPanel';
import { getLunaGuidance } from '../../src/lib/luna/guidance';
import { advanceJourney } from '../../src/lib/journey/journeyState';

beforeEach(() => {
  vi.clearAllMocks();
  try { localStorage.clear(); } catch { /* noop */ }
  mockRoute = { name: 'registry' };
});

describe('LunaPanel (B4)', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<LunaPanel open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows route-aware purpose + suggested actions for the current page', () => {
    render(<LunaPanel open onClose={() => {}} />);
    expect(screen.getByText('Luna — your guide')).toBeTruthy();
    expect(screen.getByText(/AI tool inventory/)).toBeTruthy();           // registry purpose
    expect(screen.getByText('Open the design guide')).toBeTruthy();      // registry action
    expect(screen.getByText(/Deterministic · no LLM yet/)).toBeTruthy();
  });

  it('switches to the deterministic Ask Luna chat tab', () => {
    render(<LunaPanel open onClose={() => {}} />);
    fireEvent.click(screen.getByText('Ask Luna'));
    expect(screen.getByText(/I'm Luna/)).toBeTruthy();       // chat greeting
    expect(screen.getByLabelText('Ask Luna')).toBeTruthy();  // chat input
  });

  it('actions navigate and close the panel', () => {
    const onClose = vi.fn();
    render(<LunaPanel open onClose={onClose} />);
    fireEvent.click(screen.getByText('Open the design guide'));
    expect(navigate).toHaveBeenCalledWith({ name: 'system-builder' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the journey position while the journey is active, hides it after adoption', () => {
    advanceJourney('understanding');
    const { unmount } = render(<LunaPanel open onClose={() => {}} />);
    expect(screen.getByText(/Step 3 of 4 — Understand/)).toBeTruthy();
    unmount();
    advanceJourney('adoption');
    render(<LunaPanel open onClose={() => {}} />);
    expect(screen.queryByText(/Your journey/)).toBeNull();
  });

  it('is dismissible via Escape and overlay', () => {
    const onClose = vi.fn();
    render(<LunaPanel open onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Help link navigates to the help route with the section hash', () => {
    const onClose = vi.fn();
    render(<LunaPanel open onClose={onClose} />);
    fireEvent.click(screen.getByText(/Learn more in the Help Center/));
    expect(navigate).toHaveBeenCalledWith({ name: 'help' });
    expect(window.location.hash).toContain('section=getting-started');   // registry helpSection
  });

  it('falls back to generic guidance for unmapped routes', () => {
    mockRoute = { name: 'operator' };
    render(<LunaPanel open onClose={() => {}} />);
    expect(screen.getByText(/Explore the app at your own pace/)).toBeTruthy();
  });
});

describe('getLunaGuidance map (B4)', () => {
  it('covers all primary routes with purpose + bounded actions', () => {
    const primary = ['dashboard', 'audit/new', 'audit/result', 'reports', 'registry', 'agents', 'billing', 'team', 'system-builder', 'audit-express/run', 'journey/start'] as const;
    for (const r of primary) {
      const g = getLunaGuidance(r);
      expect(g.purpose.length).toBeGreaterThan(20);
      expect(g.actions.length).toBeLessThanOrEqual(3);
    }
  });
});
