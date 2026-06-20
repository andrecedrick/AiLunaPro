import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/* S2 — SupportModal: hybrid support-ticket form. Anonymous users provide an
 * email; authenticated users get a read-only auto-filled email. Submits to the
 * support client with page context + shows a success toast. No analytics. */

const { authRef, submitSpy, showToast } = vi.hoisted(() => ({
  authRef: { session: null as null | { user: { email: string } } },
  submitSpy: vi.fn(() => Promise.resolve({ ok: true as const, id: 'tkt' })),
  showToast: vi.fn(),
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => authRef }));
vi.mock('../../src/context/RouteContext', () => ({ useRoute: () => ({ route: { name: 'dashboard' } }) }));
vi.mock('../../src/context/PreferencesContext', () => ({ usePreferences: () => ({ language: 'en' }) }));
vi.mock('../../src/hooks/useToast', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../../src/lib/support/supportClient', () => ({
  submitSupportTicket: submitSpy,
  friendlySupportError: (e: unknown) => (e instanceof Error ? e.message : String(e)),
}));
vi.mock('../../src/context/LocaleContext', () => ({
  useLocale: () => ({ support: {
    cta: 'Contact support', title: 'Contact support', subtitle: 'Report an issue',
    typeLabel: "What's this about?", typeBug: 'Bug', typeQuestion: 'Question', typeBilling: 'Billing',
    descriptionLabel: 'Describe it', descriptionPlaceholder: 'What happened?',
    emailLabel: 'Email', emailPlaceholder: 'you@company.com',
    priorityLabel: 'Priority', optional: '(optional)', prioLow: 'Low', prioMedium: 'Medium', prioHigh: 'High',
    submit: 'Send', submitting: 'Sending…', success: 'Thanks', close: 'Close',
    errType: 'Please choose a type.', errDescription: 'Please describe the issue.', errEmail: 'Please enter a valid email.',
  } }),
}));

import { SupportModal } from '../../src/components/support/SupportModal';

beforeEach(() => { vi.clearAllMocks(); authRef.session = null; });

describe('SupportModal (S2)', () => {
  it('anonymous: submits type + description + email with page context', async () => {
    const onClose = vi.fn();
    render(<SupportModal open onClose={onClose} />);
    fireEvent.click(screen.getByText('Bug'));
    fireEvent.change(screen.getByPlaceholderText('What happened?'), { target: { value: 'it broke' } });
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    expect(submitSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'bug', description: 'it broke', email: 'a@b.com',
      context: expect.objectContaining({ route: 'dashboard', locale: 'en' }),
    }));
    expect(showToast).toHaveBeenCalledWith('Thanks', 'success');
    expect(onClose).toHaveBeenCalled();
  });

  it('blocks submit and shows errors when required fields are missing', () => {
    render(<SupportModal open onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Send'));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Please choose a type.')).toBeTruthy();
    expect(screen.getByText('Please describe the issue.')).toBeTruthy();
    expect(screen.getByText('Please enter a valid email.')).toBeTruthy();
  });

  it('authenticated: email is read-only auto-filled and no email input is required', async () => {
    authRef.session = { user: { email: 'me@x.com' } };
    const onClose = vi.fn();
    render(<SupportModal open onClose={onClose} />);
    const emailInput = screen.getByDisplayValue('me@x.com') as HTMLInputElement;
    expect(emailInput.readOnly).toBe(true);

    fireEvent.click(screen.getByText('Question'));
    fireEvent.change(screen.getByPlaceholderText('What happened?'), { target: { value: 'a question' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    expect(submitSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'question', description: 'a question', email: 'me@x.com' }));
  });
});
