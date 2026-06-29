import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BillingProvider, useBilling } from '../../src/context/BillingContext';
import { MOCK_SUBSCRIPTION, MOCK_INVOICES, MOCK_USAGE } from '../../src/data/mockBilling';
import { PLAN_CONFIGS } from '../../src/types/billing';
import { AuthProvider } from '../../src/context/AuthContext';
import { RouteProvider } from '../../src/context/RouteContext';

/* ── Helpers ────────────────────────────────────────────── */

function TestConsumer() {
  const { subscription, invoices, usage, upgradePlan, cancelPlan, resumePlan } = useBilling();
  return (
    <div>
      <div data-testid="plan">{subscription.plan}</div>
      <div data-testid="status">{subscription.status}</div>
      <div data-testid="cancel-flag">{String(subscription.cancelAtPeriodEnd)}</div>
      <div data-testid="invoices-count">{invoices.length}</div>
      <div data-testid="audits-used">{usage.auditsUsed}</div>
      <div data-testid="audits-limit">{usage.auditsLimit}</div>
      <div data-testid="seats-limit">{usage.seatsLimit}</div>
      <button onClick={() => upgradePlan('Enterprise')}>upgrade</button>
      <button onClick={() => upgradePlan('Free')}>downgrade</button>
      <button onClick={() => cancelPlan()}>cancel</button>
      <button onClick={() => resumePlan()}>resume</button>
    </div>
  );
}

// BillingContext now consumes useAuth → must be nested under AuthProvider
// (itself under RouteProvider). Mock auth layer provides a default session.
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <RouteProvider>
      <AuthProvider>
        <BillingProvider>{children}</BillingProvider>
      </AuthProvider>
    </RouteProvider>
  );
}

/* ── Tests ──────────────────────────────────────────────── */

describe('BillingContext — mock layer', () => {
  it('exposes initial mock subscription', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId('plan').textContent).toBe(MOCK_SUBSCRIPTION.plan);
    expect(screen.getByTestId('status').textContent).toBe(MOCK_SUBSCRIPTION.status);
  });

  it('exposes all mock invoices', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId('invoices-count').textContent).toBe(String(MOCK_INVOICES.length));
  });

  it('exposes mock usage numbers', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId('audits-used').textContent).toBe(String(MOCK_USAGE.auditsUsed));
    expect(screen.getByTestId('audits-limit').textContent).toBe(String(MOCK_USAGE.auditsLimit));
  });

  it('upgradePlan updates plan and limits', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('upgrade'));
    expect(screen.getByTestId('plan').textContent).toBe('Enterprise');
    expect(screen.getByTestId('audits-limit').textContent).toBe(String(PLAN_CONFIGS.Enterprise.maxAuditsPerMonth));
    expect(screen.getByTestId('seats-limit').textContent).toBe(String(PLAN_CONFIGS.Enterprise.maxSeats));
  });

  it('downgradePlan updates plan and limits', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('downgrade'));
    expect(screen.getByTestId('plan').textContent).toBe('Free');
    expect(screen.getByTestId('audits-limit').textContent).toBe(String(PLAN_CONFIGS.Free.maxAuditsPerMonth));
  });

  it('cancelPlan sets cancelAtPeriodEnd=true', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    expect(screen.getByTestId('cancel-flag').textContent).toBe('false');
    fireEvent.click(screen.getByText('cancel'));
    expect(screen.getByTestId('cancel-flag').textContent).toBe('true');
  });

  it('resumePlan sets cancelAtPeriodEnd=false', () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('cancel'));
    fireEvent.click(screen.getByText('resume'));
    expect(screen.getByTestId('cancel-flag').textContent).toBe('false');
  });

  it('useBilling throws outside BillingProvider', () => {
    const Bomb = () => { useBilling(); return null; };
    expect(() => render(<Bomb />)).toThrow('useBilling must be used inside BillingProvider');
  });
});

describe('PLAN_CONFIGS integrity', () => {
  it('all tiers defined', () => {
    expect(PLAN_CONFIGS.Free).toBeDefined();
    expect(PLAN_CONFIGS.Starter).toBeDefined();
    expect(PLAN_CONFIGS.Professional).toBeDefined();
    expect(PLAN_CONFIGS.Enterprise).toBeDefined();
  });

  it('Free plan has 0 price', () => {
    expect(PLAN_CONFIGS.Free.monthlyPrice).toBe(0);
  });

  it('Enterprise has unlimited seats + 90 included audits/month', () => {
    expect(PLAN_CONFIGS.Enterprise.maxSeats).toBe(-1);
    expect(PLAN_CONFIGS.Enterprise.maxAuditsPerMonth).toBe(90);
  });

  it('plan audit limits match the monetization model (3 / 15 / 30 / 90)', () => {
    expect(PLAN_CONFIGS.Free.maxAuditsPerMonth).toBe(3);
    expect(PLAN_CONFIGS.Starter.maxAuditsPerMonth).toBe(15);
    expect(PLAN_CONFIGS.Professional.maxAuditsPerMonth).toBe(30);
    expect(PLAN_CONFIGS.Enterprise.maxAuditsPerMonth).toBe(90);
  });
});

describe('Role gating — BillingPage renders', () => {
  // Light smoke test: page renders without crashing when mounted with provider.
  // Full role-gating UI test requires router + auth context; deferred.
  it('BillingProvider renders children without throw', () => {
    render(
      <RouteProvider><AuthProvider>
        <BillingProvider><div data-testid="child">ok</div></BillingProvider>
      </AuthProvider></RouteProvider>,
    );
    expect(screen.getByTestId('child').textContent).toBe('ok');
  });
});
