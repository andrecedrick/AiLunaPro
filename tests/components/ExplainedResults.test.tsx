import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { AuditResult } from '../../src/types/scoring';

/* Full-audit Insight Cards: explain each finding (what/why/flow/example), show
 * recoverable score points, and drive a conversion-first next step. Deterministic. */

const navigate = vi.fn();
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ navigate }) }));

import { ExplainedResults } from '../../src/components/result/ExplainedResults';

const RESULT = {
  globalScore: 64,
  riskLevel: 'medium',
  maturityLevel: 3,
  sectionScores: [
    { key: 'human-oversight', title: 'Human oversight', score: 40, weight: 0.15, status: 'warning', contribution: 6 },
  ],
  findings: [
    { id: 'f1', severity: 'high', sectionKey: 'human-oversight', title: 'Out-of-the-loop oversight in a high-risk context', description: 'AI outputs are used without a defined review step. Add a reviewer.', relatedQuestions: [], recommendationIds: ['r1'] },
  ],
  recommendations: [
    { id: 'r1', title: 'Define a human-oversight process', description: 'Name reviewers for high-stakes outputs. Add an override control. Log overrides.', effort: 'medium', impact: 'high', timeframeDays: 30, relatedSection: 'human-oversight', category: 'process', whyItMatters: 'Keeps a human accountable for consequential decisions.', expectedOutcome: 'A documented review + override path.' },
  ],
} as unknown as AuditResult;

beforeEach(() => vi.clearAllMocks());

describe('ExplainedResults (full audit)', () => {
  it('renders the 4-part explanation + recoverable points + flow', () => {
    render(<ExplainedResults result={RESULT} />);
    expect(screen.getByText(/Out-of-the-loop oversight in a high-risk context/)).toBeTruthy();
    expect(screen.getByText('What this means')).toBeTruthy();
    expect(screen.getByText('Why it matters')).toBeTruthy();
    expect(screen.getByText(/−9 pts to recover/)).toBeTruthy();   // 0.15*100 − 6 = 9
    expect(screen.getByText(/Example/)).toBeTruthy();
  });

  it('Do-this-next is conversion-first → navigates to agents', () => {
    render(<ExplainedResults result={RESULT} />);
    expect(screen.getByText(/A documented review \+ override path/)).toBeTruthy(); // expected outcome
    fireEvent.click(screen.getByText(/recommended agents|agents that can do this/));
    expect(navigate).toHaveBeenCalledWith({ name: 'agents' });
  });

  it('clean-pass audit (no findings) shows a positive card + still converts', () => {
    render(<ExplainedResults result={{ ...RESULT, findings: [] } as AuditResult} />);
    expect(screen.getByText(/No gaps triggered/)).toBeTruthy();
  });
});
