import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemBuilderPage } from '../../src/pages/SystemBuilderPage';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { readBuilderStep, readBuilderTicks } from '../../src/lib/systemBuilder/builderState';

const Page = () => (
  <ThemeProvider><PreferencesProvider><SystemBuilderPage /></PreferencesProvider></ThemeProvider>
);

/* B3 — persisted step + tickable checklists (localStorage-only). The guide's
 * read-only character is unchanged: no scoring, ticks are personal markers. */

beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('SystemBuilderPage (B3)', () => {
  it('renders step 1 with a tickable checklist and 0/n progress', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 2, name: /Purpose & risk classification/ })).toBeTruthy();
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.length).toBeGreaterThan(2);
    expect(screen.getByText(/0\/5 done/)).toBeTruthy();
  });

  it('ticking an item persists it and updates the progress count', () => {
    render(<Page />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByText(/1\/5 done/)).toBeTruthy();
    expect(readBuilderTicks()['purpose:0']).toBe(true);
    // un-tick removes the entry
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(readBuilderTicks()['purpose:0']).toBeUndefined();
  });

  it('navigating steps persists the position and restores it on remount', () => {
    const { unmount } = render(<Page />);
    fireEvent.click(screen.getByText('Next step →'));
    expect(readBuilderStep()).toBe(1);
    unmount();
    render(<Page />);
    expect(screen.getByRole('heading', { level: 2, name: /Data governance/ })).toBeTruthy(); // restored to step 2
  });

  it('clamps an out-of-range stored step instead of crashing', () => {
    localStorage.setItem('ailunapro.sysbuilder.v1.step', '99');
    render(<Page />);
    expect(screen.getByText(/Step 6 of 6/)).toBeTruthy(); // clamped to last
  });
});
