import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { lazyWithRetry } from '../../src/lib/routing/lazyWithRetry';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// jsdom's location.reload is non-functional — swap in a spy (staleBundle pattern).
const reloadSpy = vi.fn();
Object.defineProperty(window, 'location', {
  value: { ...window.location, reload: reloadSpy },
  writable: true,
});

beforeEach(() => {
  reloadSpy.mockClear();
  try { sessionStorage.clear(); } catch { /* noop */ }
});

/* Regression for the prod crash "Cannot read properties of undefined (reading
 * 'default')": a swallowed vite:preloadError makes a dynamic import RESOLVE
 * WITH UNDEFINED. lazyWithRetry must normalize that into a chunk-style
 * rejection (retry once, then ErrorBoundary's chunk-aware card) — never let
 * React.lazy touch `undefined.default`. */

function Ok() { return <div>loaded-ok</div>; }

describe('lazyWithRetry — undefined-module guard', () => {
  it('factory resolving undefined twice → chunk-aware error card, not a TypeError crash', async () => {
    // A recovery reload just happened (inside the cooldown) → the truthful error
    // card must surface instead of reloading again. This is the anti-loop guard.
    sessionStorage.setItem('ailunapro-chunk-reload', String(Date.now()));
    const factory = vi.fn(async () => undefined as never);
    const Bad = lazyWithRetry(factory);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Suspense fallback={<div>loading…</div>}>
          <Bad />
        </Suspense>
      </ErrorBoundary>,
    );
    // 600ms+1800ms backoff + render — chunk-aware copy, not "Something went wrong".
    expect(await screen.findByRole('heading', { name: /load the page/i }, { timeout: 8000 })).toBeTruthy();
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
    expect(factory).toHaveBeenCalledTimes(3); // initial + two retries
    // For chunk failures the ONLY action is a real reload — a state-reset
    // "retry" can never recover React.lazy's permanently-cached rejection.
    expect(screen.getByRole('button', { name: /Reload page/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Retry loading|Try again/i })).toBeNull();
    spy.mockRestore();
  }, 10000);

  it('exhausted retries + staleness unproven → ONE auto-reload (no error card flash)', async () => {
    // Fresh session (no marker): instead of dead-ending on the error screen, the
    // loader must self-heal with a single plain reload — the /version.json probe
    // fails in jsdom (fetch unavailable), exactly the prod flake being fixed.
    const factory = vi.fn(async () => undefined as never);
    const Bad = lazyWithRetry(factory);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Suspense fallback={<div>loading…</div>}>
          <Bad />
        </Suspense>
      </ErrorBoundary>,
    );
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1), { timeout: 8000 });
    // Suspended while reloading — the error card never flashes.
    expect(screen.queryByRole('heading', { name: /load the page/i })).toBeNull();
    // Guard is a timestamp: bounds a reload loop, but expires so a later
    // unrelated failure can still self-heal.
    const stamp = Number(sessionStorage.getItem('ailunapro-chunk-reload'));
    expect(Number.isFinite(stamp)).toBe(true);
    expect(stamp).toBeGreaterThan(0);
    spy.mockRestore();
  }, 10000);

  it('reload guard expires — a failure after the cooldown self-heals again', async () => {
    // A reload from 11 minutes ago must NOT block recovery (old build wrote a
    // permanent flag here, dead-ending the rest of the session).
    sessionStorage.setItem('ailunapro-chunk-reload', String(Date.now() - 11 * 60 * 1000));
    const Bad = lazyWithRetry(vi.fn(async () => undefined as never));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Suspense fallback={<div>loading…</div>}>
          <Bad />
        </Suspense>
      </ErrorBoundary>,
    );
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1), { timeout: 8000 });
    expect(screen.queryByRole('heading', { name: /load the page/i })).toBeNull();
    spy.mockRestore();
  }, 10000);

  it('legacy "1" marker from an older build does not lock recovery out', async () => {
    sessionStorage.setItem('ailunapro-chunk-reload', '1');
    const Bad = lazyWithRetry(vi.fn(async () => undefined as never));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Suspense fallback={<div>loading…</div>}>
          <Bad />
        </Suspense>
      </ErrorBoundary>,
    );
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1), { timeout: 8000 });
    spy.mockRestore();
  }, 10000);

  it('recovers when the retry resolves a real module', async () => {
    let first = true;
    const Flaky = lazyWithRetry(async () => {
      if (first) { first = false; return undefined as never; }
      return { default: Ok };
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Suspense fallback={<div>loading…</div>}>
        <Flaky />
      </Suspense>,
    );
    expect(await screen.findByText('loaded-ok', {}, { timeout: 8000 })).toBeTruthy();
    spy.mockRestore();
  }, 10000);
});
