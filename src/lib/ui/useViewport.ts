/**
 * Viewport class for layout switching.
 *
 * The Contacts table carries 13 columns at a 860 px minimum inside a horizontal
 * scroller, which on a phone means dragging a wide table sideways to read a
 * single row. A table is the wrong primitive below desktop, so the page swaps to
 * cards rather than trying to squeeze columns.
 *
 * Uses matchMedia rather than a resize listener: the browser evaluates the query
 * itself and fires only when the class actually changes, so a drag-resize does
 * not re-render on every pixel.
 */

import { useEffect, useState } from 'react';

export type Viewport = 'mobile' | 'tablet' | 'desktop';

/** Breakpoints. Desktop is where 13 columns are genuinely readable. */
export const MOBILE_MAX = 767;
export const TABLET_MAX = 1023;

const QUERY_MOBILE = `(max-width: ${MOBILE_MAX}px)`;
const QUERY_TABLET = `(max-width: ${TABLET_MAX}px)`;

/** Resolve the class from the current window. SSR/no-matchMedia → desktop. */
export function readViewport(): Viewport {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop';
  if (window.matchMedia(QUERY_MOBILE).matches) return 'mobile';
  if (window.matchMedia(QUERY_TABLET).matches) return 'tablet';
  return 'desktop';
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(readViewport);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mobile = window.matchMedia(QUERY_MOBILE);
    const tablet = window.matchMedia(QUERY_TABLET);
    const sync = () => setVp(readViewport());
    // `change` only fires on a boundary crossing, not on every resize pixel.
    mobile.addEventListener('change', sync);
    tablet.addEventListener('change', sync);
    sync();
    return () => {
      mobile.removeEventListener('change', sync);
      tablet.removeEventListener('change', sync);
    };
  }, []);

  return vp;
}
