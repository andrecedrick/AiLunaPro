import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LunaChat } from '../../src/components/luna/LunaChat';

/* S3 Phase 1 — Luna chat UI. Deterministic: the reply comes from answerLuna()
 * (real, no LLM/network). A Luna reply's action button navigates in-app. */

describe('LunaChat (S3 Phase 1)', () => {
  it('greets, answers a question, and its action navigates', () => {
    const onNavigate = vi.fn();
    render(<LunaChat routeName="dashboard" onNavigate={onNavigate} />);

    // Greeting present.
    expect(screen.getByText(/I'm Luna/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Ask Luna'), { target: { value: 'how do I start an audit?' } });
    fireEvent.click(screen.getByLabelText('Send'));

    // User message echoed + a Luna action rendered.
    expect(screen.getByText('how do I start an audit?')).toBeTruthy();
    const action = screen.getByText(/Start a new audit/);
    fireEvent.click(action);
    expect(onNavigate).toHaveBeenCalledWith({ name: 'audit/new' });
  });

  it('disables Send while the input is empty', () => {
    render(<LunaChat routeName="dashboard" onNavigate={vi.fn()} />);
    expect((screen.getByLabelText('Send') as HTMLButtonElement).disabled).toBe(true);
  });
});
