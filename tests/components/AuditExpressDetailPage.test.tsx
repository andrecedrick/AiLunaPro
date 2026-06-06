import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

/* Reproduction + regression guard: the detail page must tolerate a worker
 * /detail response that OMITS optional arrays (e.g. recommendedAgents) without
 * crashing into the global ErrorBoundary. This happens on version skew / partial
 * deploy / future schema drift. */

const navigate = vi.fn();

// A deliberately SPARSE detail — as an older/partial worker might return:
// no recommendedAgents, no share metadata.
const SPARSE_DETAIL = {
  auditId: 'a1',
  title: 'Acme audit',
  createdAt: '2026-06-01T00:00:00.000Z',
  engineVersion: '1.0.0',
  canonicalUrl: 'https://acme.example/',
  confidence: 'medium',
  businessType: 'saas',
  audience: 'b2b',
  preview: { engineVersion: '1.0.0', k1a: { normalizedScore: 50, bucket: 'medium' }, k2a: { result: { estimatedTimeSavedHoursPerMonth: 10, estimatedMonthlyCostSaved: 500, estimatedYearlyCostSaved: 6000, estimatedPaybackMonths: 2 } } },
  understanding: null,
  // recommendedAgents intentionally ABSENT
};

vi.mock('../../src/context/RouteContext', () => ({
  useRoute: () => ({ route: { name: 'audit-express/detail', auditId: 'a1' }, navigate }),
}));
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ session: { orgId: 'o1' } }),
}));
vi.mock('../../src/lib/auditExpress/savedClient', () => ({
  getSavedAuditDetail: vi.fn(async () => SPARSE_DETAIL),
  renameAudit: vi.fn(), createShareLink: vi.fn(), regenerateShareLink: vi.fn(),
  revokeShare: vi.fn(), setSharingDisabled: vi.fn(), downloadSavedAudit: vi.fn(),
  SavedAuditError: class extends Error { code = 'X'; },
}));

import { AuditExpressDetailPage } from '../../src/pages/AuditExpressDetailPage';

describe('AuditExpressDetailPage — sparse detail does not crash', () => {
  it('renders without throwing when recommendedAgents is missing', async () => {
    render(<AuditExpressDetailPage />);
    // The title appears once the async detail load resolves; if the page threw,
    // this would reject and the test would fail.
    await waitFor(() => expect(screen.getByText('Acme audit')).toBeTruthy());
    expect(screen.getByText('Download PDF')).toBeTruthy();
  });
});
