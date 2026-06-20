import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

/* S3 Phase 2 — Luna chat UI. Each turn calls askLunaAI(); on success it renders
 * the AI reply + allowlisted action, and on { fallback: true } it uses the
 * deterministic answerLuna(). The action button navigates in-app. */

const { askLunaAI } = vi.hoisted(() => ({ askLunaAI: vi.fn() }));
vi.mock('../../src/lib/luna/lunaChatClient', () => ({ askLunaAI }));
vi.mock('../../src/context/PreferencesContext', () => ({ usePreferences: () => ({ language: 'en' }) }));

import { LunaChat } from '../../src/components/luna/LunaChat';

beforeEach(() => { askLunaAI.mockReset(); askLunaAI.mockResolvedValue({ fallback: true }); });

describe('LunaChat (S3 Phase 2)', () => {
  it('renders the AI reply and its allowlisted action navigates', async () => {
    askLunaAI.mockResolvedValue({ text: 'Open your reports here.', action: { label: 'View reports', route: 'reports' } });
    const onNavigate = vi.fn();
    render(<LunaChat routeName="dashboard" onNavigate={onNavigate} />);

    fireEvent.change(screen.getByLabelText('Ask Luna'), { target: { value: 'where are my reports?' } });
    fireEvent.click(screen.getByLabelText('Send'));

    expect(await screen.findByText('Open your reports here.')).toBeTruthy();
    fireEvent.click(screen.getByText(/View reports/));
    expect(onNavigate).toHaveBeenCalledWith({ name: 'reports' });
  });

  it('falls back to the deterministic answer when the server signals fallback', async () => {
    askLunaAI.mockResolvedValue({ fallback: true });
    const onNavigate = vi.fn();
    render(<LunaChat routeName="dashboard" onNavigate={onNavigate} />);

    fireEvent.change(screen.getByLabelText('Ask Luna'), { target: { value: 'how do I start an audit?' } });
    fireEvent.click(screen.getByLabelText('Send'));

    // Deterministic answerLuna provides the audit action.
    const action = await screen.findByText(/Start a new audit/);
    fireEvent.click(action);
    expect(onNavigate).toHaveBeenCalledWith({ name: 'audit/new' });
  });

  it('disables Send while the input is empty', () => {
    render(<LunaChat routeName="dashboard" onNavigate={vi.fn()} />);
    expect((screen.getByLabelText('Send') as HTMLButtonElement).disabled).toBe(true);
  });
});
