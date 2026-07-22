import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";

/* "Smart in-product access" Change A — a subtle dashboard card that lets
 * authenticated users re-run the public Diagnostic / ROI acquisition tools
 * without polluting the sidebar. Each tile navigates to the existing public
 * route and emits a consent-gated, no-PII analytics event. */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));
// vi.hoisted: the mock factory is hoisted above declarations, and track is read
// eagerly (not behind a lazy getter like navigate), so it must exist at hoist time.
const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock('../../src/lib/analytics/track', () => ({ track }));

import { QuickToolsCard } from '../../src/components/dashboard/QuickToolsCard';

beforeEach(() => { vi.clearAllMocks(); });

describe('QuickToolsCard (Change A)', () => {
  it('offers both acquisition tools', () => {
    render(<QuickToolsCard />);
    expect(screen.getByText('Run a quick diagnostic')).toBeTruthy();
    expect(screen.getByText('Estimate your ROI')).toBeTruthy();
  });

  it('opening the diagnostic navigates to the public diagnostic route + tracks the entry', () => {
    render(<QuickToolsCard />);
    fireEvent.click(screen.getByText('Run a quick diagnostic'));
    expect(navigate).toHaveBeenCalledWith({ name: 'diagnostic' });
    expect(track).toHaveBeenCalledWith('tool_entry_clicked', { tool: 'diagnostic', surface: 'dashboard' });
  });

  it('opening the ROI calculator navigates to the public roi route + tracks the entry', () => {
    render(<QuickToolsCard />);
    fireEvent.click(screen.getByText('Estimate your ROI'));
    expect(navigate).toHaveBeenCalledWith({ name: 'roi-calculator' });
    expect(track).toHaveBeenCalledWith('tool_entry_clicked', { tool: 'roi', surface: 'dashboard' });
  });
});
