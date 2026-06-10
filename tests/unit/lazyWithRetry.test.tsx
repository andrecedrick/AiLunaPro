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
    // 600ms retry backoff + render — chunk-aware copy, not "Something went wrong".
    expect(await screen.findByRole('heading', { name: /load the page/i }, { timeout: 4000 })).toBeTruthy();
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
    expect(factory).toHaveBeenCalledTimes(2); // initial + single retry
    spy.mockRestore();
  });

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
    expect(await screen.findByText('loaded-ok', {}, { timeout: 4000 })).toBeTruthy();
    spy.mockRestore();
  });
});
