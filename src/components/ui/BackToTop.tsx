import { useEffect, useState } from 'react';

/**
 * BackToTop — discreet floating "scroll to top" button.
 *
 * - Appears only after the page is scrolled past SHOW_AFTER px.
 * - Smooth scroll to top, unless the user prefers reduced motion.
 * - Matches app design tokens (brand gradient, glow shadow, focus ring).
 * - Accessible: real <button>, aria-label, focus-visible ring; removed from the
 *   tab order and pointer flow while hidden.
 * - Fixed bottom-right at a z-index BELOW the consent banner (1000) so it never
 *   covers it; larger bottom offset on mobile keeps it clear of bottom UI.
 *
 * Pure UI: no network, no analytics, no deps — does not affect app behavior.
 */

const SHOW_AFTER = 600; // px scrolled before the button appears

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const evaluate = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      // rAF-coalesced so we never do work more than once per frame.
      if (frame === 0) frame = window.requestAnimationFrame(evaluate);
    };
    evaluate(); // sync initial state (e.g. reloaded mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleClick = () => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      onClick={handleClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
