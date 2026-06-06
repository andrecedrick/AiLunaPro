import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditResultView, type AuditPreview, type AuditUnderstanding } from '../../src/components/auditExpress/AuditResultView';

/* Hardening: the shared result view must never crash on a partial/malformed
 * server response (missing k2a/k1a, missing businessProfile sub-fields/arrays).
 * It renders a graceful fallback instead of tripping the global ErrorBoundary. */

const FULL: AuditPreview = {
  engineVersion: '1.0.0',
  k1a: { normalizedScore: 50, bucket: 'medium' },
  k2a: { result: { estimatedTimeSavedHoursPerMonth: 10, estimatedMonthlyCostSaved: 500, estimatedYearlyCostSaved: 6000, estimatedPaybackMonths: 2 } },
};

describe('AuditResultView — defensive render', () => {
  it('renders full data', () => {
    render(<AuditResultView preview={FULL} understanding={null} />);
    expect(screen.getByText('ROI estimate (indicative)')).toBeTruthy();
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
