// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

/*
 * P0 — "Still connecting…" production blocker regression suite.
 *
 * Guarantees under test:
 *  1. The boot gate ALWAYS ends: if Firebase auth never resolves (googleapis blocked),
 *     AuthContext force-exits isLoading after its 12s deadline → degraded mode
 *     (connectionPhase 'failed'), app renders.
 *  2. A FAILED retryAuth can no longer re-lock the gate (isLoading returns to false).
 *  3. The ConnectionBanner is non-blocking: hidden when ok, visible when failed, and
 *     fires background reconnect attempts every 20s.
 */

const svc = vi.hoisted(() => ({
  subscribe: vi.fn(() => () => {}),            // auth subscription that NEVER fires (blocked network)
  currentUser: null as null | { uid: string },
  rebuild: vi.fn(async () => { throw new Error('FIRESTORE_UNREACHABLE'); }),
}));

vi.mock('../../src/lib/featureFlags', () => ({ resolveLayer: () => 'firebase' }));
vi.mock('../../src/data/mockAuth', () => ({ MOCK_PASSWORDS: {}, MOCK_USERS: [] }));
vi.mock('../../src/lib/team/teamApiClient', () => ({ apiChangeRole: vi.fn(), apiRemoveMember: vi.fn(), getIdToken: vi.fn(async () => null) }));
vi.mock('../../src/lib/auth/storage', () => ({
  genId: () => 'id', getInitialMembers: () => [], getInitialOrgs: () => [], makeInitials: () => 'AA',
  saveMembers: vi.fn(), saveOrgs: vi.fn(), saveSession: vi.fn(), loadSession: () => null,
}));
vi.mock('../../src/lib/auth/firebaseAuthService', () => ({
  subscribeAuthState: (...args: unknown[]) => svc.subscribe(...(args as [])),
  firebaseLogin: vi.fn(), firebaseSignup: vi.fn(), firebaseLogout: vi.fn(),
  firebaseSwitchOrg: vi.fn(), firebaseCreateOrg: vi.fn(), firebaseInviteMember: vi.fn(),
  getCurrentFirebaseUser: () => svc.currentUser,
  firebaseSendPasswordReset: vi.fn(), firebaseUpdateProfile: vi.fn(), firebaseUpdateOrgName: vi.fn(),
  firebaseRebuildSession: () => svc.rebuild(),
}));

import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { ConnectionBanner } from '../../src/components/ConnectionBanner';

function Probe() {
  const { isLoading, connectionPhase, retryAuth } = useAuth();
  return (
    <div>
      <div data-testid="state">{String(isLoading)}:{connectionPhase}</div>
      <button data-testid="retry" onClick={retryAuth}>retry</button>
    </div>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  svc.currentUser = null;
  svc.subscribe.mockClear();
  svc.rebuild.mockClear();
  // The banner probes googleapis reachability — keep it inert in jsdom.
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('P0 — the boot gate is guaranteed to end (no permanent "Still connecting")', () => {
  it('force-exits isLoading after the 12s deadline when auth never resolves → degraded mode', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('state').textContent).toBe('true:connecting');   // gate up
    await act(async () => { vi.advanceTimersByTime(12_000); });
    expect(screen.getByTestId('state').textContent).toBe('false:failed');      // gate DOWN, degraded
  });

  it('a failed retryAuth releases the gate again (no permanent re-lock)', async () => {
    svc.currentUser = { uid: 'u1' };                                           // signed-in session drop
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => { vi.advanceTimersByTime(12_000); });                // boot deadline → degraded
    await act(async () => { screen.getByTestId('retry').click(); });           // manual retry → rebuild REJECTS
    expect(screen.getByTestId('state').textContent).toBe('false:failed');      // still usable, not stuck
    expect(svc.rebuild).toHaveBeenCalled();
  });

  it('cold-boot retryAuth is a safe no-op (no user yet → subscription owns recovery)', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => { vi.advanceTimersByTime(12_000); });
    await act(async () => { screen.getByTestId('retry').click(); });
    expect(svc.rebuild).not.toHaveBeenCalled();                                // nothing to rebuild
    expect(screen.getByTestId('state').textContent).toBe('false:failed');      // and no re-lock
  });
});

describe('ConnectionBanner — non-blocking recovery surface', () => {
  it('hidden while connecting/ok; appears in degraded mode; background-retries every 20s', async () => {
    svc.currentUser = { uid: 'u1' };
    render(<AuthProvider><Probe /><ConnectionBanner /></AuthProvider>);
    expect(screen.queryByRole('status')).toBeNull();                           // nothing while connecting
    await act(async () => { vi.advanceTimersByTime(12_000); });                // deadline → failed
    expect(screen.getByRole('status').textContent).toContain('Connection issues');
    expect(screen.getByText('Retry now')).toBeTruthy();                        // manual retry offered
    await act(async () => { vi.advanceTimersByTime(20_000); });                // background reconnect tick
    expect(svc.rebuild).toHaveBeenCalled();                                    // auto-retry fired
  });
});
