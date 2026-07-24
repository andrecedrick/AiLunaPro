import { describe, it, expect } from 'vitest';
import { resolveNotifRoute } from '../../src/lib/platform/platformService';

/*
 * Notification click destination (production bug fix).
 *
 * A click must ALWAYS resolve to a valid, useful route — never a dead no-op.
 * Stored route wins if valid; otherwise fall back by type, then audience.
 */

const n = (o: Partial<{ route: string; type: string; audience: string }>) =>
  ({ route: '', type: '', audience: 'operator', ...o });

describe('resolveNotifRoute', () => {
  it('uses a valid stored route', () => {
    expect(resolveNotifRoute(n({ route: 'admin' }))).toBe('admin');
    expect(resolveNotifRoute(n({ route: 'my-quotes' }))).toBe('my-quotes');
    expect(resolveNotifRoute(n({ route: 'help' }))).toBe('help');
  });

  it('ignores an INVALID/unknown stored route and falls back by type', () => {
    expect(resolveNotifRoute(n({ route: 'nonsense', type: 'feedback' }))).toBe('admin');
    expect(resolveNotifRoute(n({ route: '', type: 'reply', audience: 'user' }))).toBe('support/tickets');
    expect(resolveNotifRoute(n({ route: 'bogus', type: 'invoice_paid', audience: 'user' }))).toBe('my-quotes');
  });

  it('falls back by type when no route is stored', () => {
    expect(resolveNotifRoute(n({ type: 'ticket' }))).toBe('admin');
    expect(resolveNotifRoute(n({ type: 'token' }))).toBe('admin');
    expect(resolveNotifRoute(n({ type: 'closed', audience: 'user' }))).toBe('support/tickets');
  });

  it('never returns empty — final fallback by audience', () => {
    expect(resolveNotifRoute(n({ type: 'unknown', audience: 'user' }))).toBe('help');
    expect(resolveNotifRoute(n({ type: 'unknown', audience: 'operator' }))).toBe('admin');
    // A totally empty notification still resolves to a real route.
    expect(resolveNotifRoute(n({}))).toBe('admin');
    expect(['admin', 'help', 'my-quotes'].includes(resolveNotifRoute(n({})))).toBe(true);
  });
});
