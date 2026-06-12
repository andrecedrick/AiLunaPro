import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditResultView, type AuditPreview, type AuditUnderstanding } from '../../src/components/auditExpress/AuditResultView';

/* Hardening: the shared result view must never crash on a partial/malformed
 * server response (missing k2a/k1a, missing businessProfile sub-fields/arrays).
 * It renders a graceful fallback instead of tripping the global ErrorBoundary. */

const FULL: AuditPreview = {
  engineVersion: '1.0.0',
  k1a: { normalizedScore: 50, bucket: 'medium' },
  k2a: { result: { estimatedTimeSavedHoursPerMonth: 10, estimatedMonthlyCostSaved: 500, estimatedYearlyCostSaved: 6000, estimatedPaybackMonths: 2 } },
};

describe('AuditResultView — pedagogical + defensive render', () => {
  it('renders the snapshot with indicative ranges + pedagogical framing + conversion CTA', () => {
    const onSeeAgents = vi.fn();
    render(<AuditResultView preview={FULL} understanding={null} onSeeAgents={onSeeAgents} />);
    expect(screen.getByText(/Your snapshot/)).toBeTruthy();
    expect(screen.getByText('What this means')).toBeTruthy();
    expect(screen.getByText(/h\/month/)).toBeTruthy();        // hours as a range, not a single number
    expect(screen.getByText(/What to do first/)).toBeTruthy();
    fireEvent.click(screen.getByText(/See agents matched to your audit/));
    expect(onSeeAgents).toHaveBeenCalled();                    // conversion path works
  });

  it('shows indicative RANGES, not fake-precision single numbers', () => {
    render(<AuditResultView preview={FULL} understanding={null} />);
    // 10 h/month → ~8–12 h/month band (deterministic ±15%)
    expect(screen.getByText(/~9–12 h\/month/)).toBeTruthy();
  });

  it('does not crash on a malformed preview (missing k2a/k1a)', () => {
    render(<AuditResultView preview={{} as unknown as AuditPreview} understanding={null} />);
    expect(screen.getByText('ROI estimate unavailable for this audit.')).toBeTruthy();
  });

  it('does not crash on partial understanding (missing arrays/sub-fields)', () => {
    const u = { businessProfile: { businessType: 'saas' } } as unknown as AuditUnderstanding;
    render(<AuditResultView preview={FULL} understanding={u} />);
    expect(screen.getByText('What this business does')).toBeTruthy();
  });
});
