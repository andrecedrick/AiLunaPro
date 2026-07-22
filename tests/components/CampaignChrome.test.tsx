import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";

/* B1 — the campaign chrome must adapt to auth state:
 *   anonymous → Log in / Sign up (no app return path)
 *   authenticated → "← Back to app" (no Log in / Sign up) */

const navigate = vi.fn();
const state = { session: null as null | { orgId: string } };

vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => ({ session: state.session }) }));
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));

import { CampaignChrome } from '../../src/components/layout/CampaignChrome';

beforeEach(() => { vi.clearAllMocks(); state.session = null; });

describe('CampaignChrome — adaptive nav (B1)', () => {
  it('anonymous: shows Log in / Sign up, no Back-to-app; links navigate', () => {
    render(<CampaignChrome><div>funnel</div></CampaignChrome>);
    expect(screen.getByText('Log in')).toBeTruthy();
    expect(screen.getByText('Sign up')).toBeTruthy();
    expect(screen.queryByText('← Back to app')).toBeNull();
    expect(screen.getByText('funnel')).toBeTruthy();
    fireEvent.click(screen.getByText('Sign up'));
    expect(navigate).toHaveBeenCalledWith({ name: 'signup' });
  });

  it('authenticated: shows Back-to-app, no Log in / Sign up; returns to dashboard', () => {
    state.session = { orgId: 'o1' };
    render(<CampaignChrome><div>funnel</div></CampaignChrome>);
    expect(screen.getByText('← Back to app')).toBeTruthy();
    expect(screen.queryByText('Log in')).toBeNull();
    fireEvent.click(screen.getByText('← Back to app'));
    expect(navigate).toHaveBeenCalledWith({ name: 'dashboard' });
  });
});
