import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from "@testing-library/react";
import { renderWithLocale as render } from "../utils/renderWithLocale";

/* S1 — FeedbackPrompt: inline, progressive, anonymous feedback under a result.
 * It shows only the satisfaction row until rated, then reveals difficulty + the
 * "what prevented you" question + suggestion. Submitting emits a no-PII event
 * (source + satisfaction only — never the free text) and never shows twice. */

const { emit, showToast, submitFeedback } = vi.hoisted(() => ({
  emit: vi.fn(),
  showToast: vi.fn(),
  submitFeedback: vi.fn(() => Promise.resolve(true)),
}));
vi.mock('../../src/lib/analytics/events', () => ({ emit }));
vi.mock('../../src/hooks/useToast', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../../src/lib/feedback/feedbackClient', () => ({ submitFeedback }));
vi.mock('../../src/context/LocaleContext', () => ({
  useLocale: () => ({ feedback: {
    title: 'How was this experience?',
    satisfactionLabel: 'Rate your experience',
    sat1: 'Very poor', sat2: 'Poor', sat3: 'Okay', sat4: 'Good', sat5: 'Excellent',
    difficultyLabel: 'How easy was it to use?', diffEasy: 'Easy', diffOk: 'Okay', diffHard: 'Hard',
    blockerLabel: 'What prevented you from going further?', blockerPlaceholder: 'Optional',
    suggestionLabel: 'Anything we could improve?', suggestionPlaceholder: 'Optional',
    submit: 'Send feedback', success: 'Thanks', dismissAria: 'Dismiss feedback',
  } }),
}));

import { FeedbackPrompt } from '../../src/components/feedback/FeedbackPrompt';

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

describe('FeedbackPrompt (S1)', () => {
  it('shows only the satisfaction row until a rating is chosen (progressive)', () => {
    render(<FeedbackPrompt source="quote" />);
    expect(screen.getByText('How was this experience?')).toBeTruthy();
    expect(screen.getByLabelText('Good')).toBeTruthy();
    // The deeper questions are hidden pre-rating.
    expect(screen.queryByText('How easy was it to use?')).toBeNull();
    expect(screen.queryByText('What prevented you from going further?')).toBeNull();
  });

  it('reveals difficulty + the blocker question after rating', () => {
    render(<FeedbackPrompt source="diagnostic" />);
    fireEvent.click(screen.getByLabelText('Good'));
    expect(screen.getByText('How easy was it to use?')).toBeTruthy();
    expect(screen.getByText('What prevented you from going further?')).toBeTruthy();
  });

  it('submit emits a no-PII event (source + satisfaction only) and stores text via the client', () => {
    render(<FeedbackPrompt source="quote" />);
    fireEvent.click(screen.getByLabelText('Good')); // satisfaction = 4
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'price' } }); // blocker
    fireEvent.click(screen.getByText('Send feedback'));

    expect(emit).toHaveBeenCalledWith('feedback_submitted', { source: 'quote', satisfaction: 4 });
    // The analytics event must NOT carry free text.
    const submittedCall = emit.mock.calls.find(c => c[0] === 'feedback_submitted');
    expect(JSON.stringify(submittedCall?.[1])).not.toContain('price');
    // The text is sent only to the server-side client.
    expect(submitFeedback).toHaveBeenCalledWith(expect.objectContaining({ source: 'quote', satisfaction: 4, blocker: 'price' }));
    expect(showToast).toHaveBeenCalled();
    // It collapses after submit.
    expect(screen.queryByText('How was this experience?')).toBeNull();
  });

  it('dismiss emits feedback_dismissed and hides without submitting', () => {
    render(<FeedbackPrompt source="audit" />);
    fireEvent.click(screen.getByLabelText('Dismiss feedback'));
    expect(emit).toHaveBeenCalledWith('feedback_dismissed', { source: 'audit' });
    expect(submitFeedback).not.toHaveBeenCalled();
    expect(screen.queryByText('How was this experience?')).toBeNull();
  });

  it('never shows again once handled (per-source localStorage)', () => {
    localStorage.setItem('ailunapro-feedback-v1-roi', 'done');
    render(<FeedbackPrompt source="roi" />);
    expect(screen.queryByText('How was this experience?')).toBeNull();
  });
});
