import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

/* Render smoke test for the Report detail page. Mocks the three contexts + the
 * reports API client, then renders the REAL page (and its real result children)
 * to catch any render-time throw that would trip the global ErrorBoundary
 * ("Something went wrong"). */

const navigate = vi.fn();
const ANSWERS = { 'profile.industry': 'finance', 'data.types': ['pii'], 'tools.scope': 'customer', 'train.maturity': '3' };
const REPORT = {
  id: 'r1', title: 'Finance AI Compliance Report', draftId: 'd1',
  createdAt: '2026-05-24T00:00:00.000Z', updatedAt: '2026-05-24T00:00:00.000Z',
  status: 'published', scoreSnapshot: 67, riskSnapshot: 'medium',
  answersSnapshot: ANSWERS, industry: 'finance', weakestSection: 'governance',
};

vi.mock('../../src/context/RouteContext', () => ({
  useRoute: () => ({ route: { name: 'reports/detail', reportId: 'r1' }, navigate }),
}));
vi.mock('../../src/context/ReportsContext', () => ({
  useReports: () => ({
    getReport: () => REPORT,
    getExportsForReport: () => [],
    deleteReport: vi.fn(),
    status: 'ready',
  }),
}));
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ session: { orgId: 'o1', role: 'owner' } }),
}));
vi.mock('../../src/lib/reports/reportApiClient', () => ({
  downloadReport: vi.fn(), renameReport: vi.fn(),
  ReportApiError: class extends Error { code = 'X'; },
}));

import { ReportDetailPage } from '../../src/pages/ReportDetailPage';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { ToastProvider } from '../../src/context/ToastContext';

const wrap = () => (
  <ThemeProvider><PreferencesProvider><ToastProvider><ReportDetailPage /></ToastProvider></PreferencesProvider></ThemeProvider>
);

describe('ReportDetailPage — render smoke', () => {
  it('renders a published report without throwing', () => {
    const { getByText } = render(wrap());
    // Primary action lives at the top now (by the header), not the footer.
    expect(getByText(/Download PDF/)).toBeTruthy();
  });
});
