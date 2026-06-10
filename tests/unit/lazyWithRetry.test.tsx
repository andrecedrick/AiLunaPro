import { describe, it, expect, vi } from 'vitest';
import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { lazyWithRetry } from '../../src/lib/routing/lazyWithRetry';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

/* Regression for the prod crash "Cannot read properties of undefined (reading
 * 'default')": a swallowed vite:preloadError makes a dynamic import RESOLVE
 * WITH UNDEFINED. lazyWithRetry must normalize that into a chunk-style
 * rejection (retry once, then ErrorBoundary's chunk-aware card) — never let
 * React.lazy touch `undefined.default`. */

function Ok() { return <div>loaded-ok</div>; }

describe('lazyWithRetry — undefined-module guard', () => {
  it('factory resolving undefined twice → chunk-aware error card, not a TypeError crash', async () => {
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
