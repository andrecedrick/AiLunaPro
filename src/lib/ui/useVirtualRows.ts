/**
 * Fixed-height row virtualization.
 *
 * The CRM rendered every contact it had loaded. At 1,000 contacts that is 1,000
 * table rows × ~13 cells — over ten thousand DOM nodes, each with inline styles —
 * and every filter keystroke rebuilt all of them. At 10,000 the tab stops
 * responding entirely.
 *
 * Only the visible window plus an overscan margin is rendered now; the rest of
 * the scroll height is two spacer elements. DOM node count becomes a function of
 * the VIEWPORT, not of the data, so 100 rows and 10,000 rows cost the same to
 * render.
 *
 * No dependency: react-window/react-virtual are ~10 KB for behaviour that is a
 * scroll offset divided by a row height. A fixed row height is what makes it that
 * simple, and the CRM rows are a fixed height by design.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface VirtualWindow {
  /** Attach to the scrolling container. */
  ref: React.RefObject<HTMLDivElement | null>;
  /** First rendered index (inclusive) and last (exclusive). */
  start: number;
  end: number;
  /** Spacer heights standing in for the rows outside the window. */
  padTop: number;
  padBottom: number;
  /** True when the list is short enough that windowing would only add overhead. */
  disabled: boolean;
}

export interface VirtualOptions {
  count: number;
  rowHeight: number;
  /** Rows rendered beyond each edge, so a fast scroll does not show blank space. */
  overscan?: number;
  /**
   * Below this many rows the list renders in full. Windowing costs a scroll
   * listener and a measurement, which is not worth paying for a list that was
   * never going to be slow — and it keeps Ctrl+F working on ordinary lists.
   */
  threshold?: number;
}

export function useVirtualRows({ count, rowHeight, overscan = 8, threshold = 60 }: VirtualOptions): VirtualWindow {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(el.clientHeight);
    setScrollTop(el.scrollTop);
  }, []);

  // Layout effect: measure before paint so the first frame renders the right
  // window instead of flashing an empty list.
  useLayoutEffect(measure, [measure, count]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    // The container is height-constrained by CSS, so a window resize (or a
    // devtools viewport change) changes how many rows fit.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => { el.removeEventListener('scroll', onScroll); ro?.disconnect(); };
  }, [measure]);

  const disabled = count <= threshold || rowHeight <= 0;
  if (disabled) return { ref, start: 0, end: count, padTop: 0, padBottom: 0, disabled: true };

  // Until the container has been measured, render one overscan block rather than
  // nothing: a zero-height first paint would otherwise show an empty table.
  const visible = height > 0 ? Math.ceil(height / rowHeight) : overscan;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end   = Math.min(count, start + visible + overscan * 2);

  return {
    ref,
    start, end,
    padTop:    start * rowHeight,
    padBottom: Math.max(0, (count - end) * rowHeight),
    disabled:  false,
  };
}
