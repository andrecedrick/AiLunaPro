import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";

/* "Smart in-product access" Change B — a subtle post-audit strip that re-engages
 * users with the public Diagnostic / ROI tools. Each action navigates to the
 * existing public route and emits a consent-gated, no-PII analytics event tagged
 * surface:'post_audit'. */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));
const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock('../../src/lib/analytics/track', () => ({ track }));

import { PostResultTools } from '../../src/components/result/PostResultTools';

beforeEach(() => { vi.clearAllMocks(); });

describe('PostResultTools (Change B)', () => {
  it('offers both re-engagement tools', () => {
    render(<PostResultTools />);
    expect(screen.getByText(/Estimate your ROI/)).toBeTruthy();
    expect(screen.getByText(/Run another quick diagnostic/)).toBeTruthy();
  });

  it('ROI action navigates to the public roi route + tracks the post_audit entry', () => {
    render(<PostResultTools />);
    fireEvent.click(screen.getByText(/Estimate your ROI/));
    expect(navigate).toHaveBeenCalledWith({ name: 'roi-calculator' });
    expect(track).toHaveBeenCalledWith('tool_entry_clicked', { tool: 'roi', surface: 'post_audit' });
  });

  it('diagnostic action navigates to the public diagnostic route + tracks the post_audit entry', () => {
    render(<PostResultTools />);
    fireEvent.click(screen.getByText(/Run another quick diagnostic/));
    expect(navigate).toHaveBeenCalledWith({ name: 'diagnostic' });
    expect(track).toHaveBeenCalledWith('tool_entry_clicked', { tool: 'diagnostic', surface: 'post_audit' });
  });
});
