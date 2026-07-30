import { describe, it, expect, afterEach, vi } from 'vitest';
import { readViewport, MOBILE_MAX, TABLET_MAX } from '../../src/lib/ui/useViewport';

/*
 * Viewport classification.
 *
 * Drives whether Contacts renders the 13-column table or the card list. Getting
 * the boundary wrong means either a phone dragging a 860px table sideways, or a
 * desktop losing the full table — so the breakpoints are asserted rather than
 * assumed, including the exact pixel on each side.
 */

/** Stand in for matchMedia, resolving each query against a fixed width. */
function stubWidth(width: number) {
  vi.stubGlobal('matchMedia', (query: string) => {
    const m = /max-width:\s*(\d+)px/.exec(query);
    return { matches: m ? width <= Number(m[1]) : false } as MediaQueryList;
  });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('readViewport', () => {
  it.each([
    [320, 'mobile'],
    [MOBILE_MAX, 'mobile'],          // 767 — still a phone
    [MOBILE_MAX + 1, 'tablet'],      // 768 — first tablet pixel
    [TABLET_MAX, 'tablet'],          // 1023 — still a tablet
    [TABLET_MAX + 1, 'desktop'],     // 1024 — first desktop pixel
    [1920, 'desktop'],
  ])('%ipx → %s', (width, expected) => {
    stubWidth(width);
    expect(readViewport()).toBe(expected);
  });

  it('falls back to desktop when matchMedia is unavailable', () => {
    // SSR and older runtimes: the full table is the safe default — never hide
    // data because a capability check failed.
    vi.stubGlobal('matchMedia', undefined);
    expect(readViewport()).toBe('desktop');
  });
});
