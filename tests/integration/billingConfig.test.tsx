import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BillingSettingsPage } from '../../src/pages/settings/BillingSettingsPage';
import * as configService from '../../src/lib/billing/configService';
import * as platformService from '../../src/lib/platform/platformService';
import type { BillingConfigStatus } from '../../src/types/billingConfig';
import { AuthProvider } from '../../src/context/AuthContext';
import { RouteProvider } from '../../src/context/RouteContext';

/*
 * CONTRAT ACTUEL (J5/J7 redesign) : BillingSettingsPage est **operator-gated**
 * (allowlist plateforme via fetchPlatformMe), PAS owner-gated par role. Les
 * tenant owners/members voient "Managed by the platform operator". Seul un
 * operator (isPlatformAdmin=true, email vérifié) voit le panneau read-only
 * (mode badge, key health, webhook). fetchPlatformMe est indépendant de session.role.
 */

/* ── Mock data ──────────────────────────────────────────── */

const FULL_STATUS: BillingConfigStatus = {
  mode: 'test',
  publishableKey: { configured: true, last4: '7H2K' },
  secretKey:      { configured: true },
  webhookSecret:  { configured: false },
  priceIds: {
    starter:      { configured: true, last4: 'A91X' },
    professional: { configured: true, last4: 'B55K' },
    enterprise:   { configured: false, last4: null },
  },
  webhook: {
    lastEventId:        'evt_1QabcXYZ',
    lastEventTimestamp: '2026-05-01T14:22:00Z',
    lastVerified:       true,
    lastError:          null,
  },
};

const EMPTY_STATUS: BillingConfigStatus = {
  mode: 'unset',
  publishableKey: { configured: false, last4: null },
  secretKey:      { configured: false },
  webhookSecret:  { configured: false },
  priceIds: {
    starter:      { configured: false, last4: null },
    professional: { configured: false, last4: null },
    enterprise:   { configured: false, last4: null },
  },
  webhook: { lastEventId: null, lastEventTimestamp: null, lastVerified: null, lastError: null },
};

/* ── Wrapper (session seed; role is irrelevant to the operator gate) ── */

function authWrapper() {
  const session = {
    userId: 'u_owner', orgId: 'org_1', role: 'owner',
    user: { id: 'u_owner', displayName: 'Owner', email: 'owner@x.com', initials: 'OW' },
    org:  { id: 'org_1', name: 'Test', plan: 'Free', initials: 'TE', createdAt: '2026-01-01' },
  };
  localStorage.setItem('ailunapro-session', JSON.stringify(session));
  localStorage.setItem('ailunapro-orgs',     JSON.stringify([session.org]));
  localStorage.setItem('ailunapro-members',  JSON.stringify([{
    userId: 'u_owner', orgId: 'org_1', role: 'owner', status: 'active',
    displayName: 'Owner', email: 'owner@x.com', initials: 'OW', joinedAt: '2026-01-01',
  }]));
  return ({ children }: { children: React.ReactNode }) => (
    <RouteProvider><AuthProvider>{children}</AuthProvider></RouteProvider>
  );
}

/** Mock the platform allowlist resolution. */
function mockOperator(isPlatformAdmin: boolean, emailVerified = true) {
  vi.spyOn(platformService, 'fetchPlatformMe').mockResolvedValue({
    isPlatformAdmin,
    emailVerified,
  } as Awaited<ReturnType<typeof platformService.fetchPlatformMe>>);
}

/* ── Tests ──────────────────────────────────────────────── */

describe('BillingSettingsPage — operator-gated config view', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders status from service for an OPERATOR', async () => {
    mockOperator(true);
    vi.spyOn(configService, 'fetchBillingConfigStatus').mockResolvedValue(FULL_STATUS);
    render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getByText('TEST')).toBeTruthy());
    expect(screen.getByText('····7H2K')).toBeTruthy();
    expect(screen.getByText('····A91X')).toBeTruthy();
    expect(screen.getByText('evt_1QabcXYZ')).toBeTruthy();
  });

  it('shows masked indicators for unconfigured keys (operator)', async () => {
    mockOperator(true);
    vi.spyOn(configService, 'fetchBillingConfigStatus').mockResolvedValue(FULL_STATUS);
    render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getAllByText('Not configured').length).toBeGreaterThan(0));
  });

  it('shows UNSET badge when no key configured (operator)', async () => {
    mockOperator(true);
    vi.spyOn(configService, 'fetchBillingConfigStatus').mockResolvedValue(EMPTY_STATUS);
    render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getByText('UNSET')).toBeTruthy());
  });

  it('renders error state on fetch failure (operator)', async () => {
    mockOperator(true);
    vi.spyOn(configService, 'fetchBillingConfigStatus').mockRejectedValue(new Error('boom'));
    render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getByText(/Error: boom/)).toBeTruthy());
  });

  it('shows operator-managed notice for NON-operator and never calls the config service', async () => {
    mockOperator(false);
    const fetchSpy = vi.spyOn(configService, 'fetchBillingConfigStatus');
    render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getByText(/Managed by the platform operator/i)).toBeTruthy());
    // Config status must NOT be fetched for non-operators (fail-closed).
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never renders raw secret strings (operator view)', async () => {
    mockOperator(true);
    vi.spyOn(configService, 'fetchBillingConfigStatus').mockResolvedValue(FULL_STATUS);
    const { container } = render(<BillingSettingsPage />, { wrapper: authWrapper() });
    await waitFor(() => expect(screen.getByText('TEST')).toBeTruthy());
    const html = container.innerHTML;
    expect(html).not.toMatch(/sk_test_/);
    expect(html).not.toMatch(/sk_live_/);
    expect(html).not.toMatch(/whsec_/);
  });
});

describe('configService fetchBillingConfigStatus — mock layer fallback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns empty status when auth layer is mock', async () => {
    const status = await configService.fetchBillingConfigStatus();
    expect(status.mode).toBe('unset');
    expect(status.publishableKey.configured).toBe(false);
    expect(status.secretKey.configured).toBe(false);
    expect(status.webhookSecret.configured).toBe(false);
    expect(status.priceIds.starter.configured).toBe(false);
  });
});
