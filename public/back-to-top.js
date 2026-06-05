/*
 * Shared "Back to top" floating button for the static public pages.
 * Vanilla JS, zero dependencies. Self-injects a button + styles that reuse the
 * page's design tokens (--brand-gradient / --violet). Appears after scrollY>600.
 * Accessible: real <button>, aria-label, focus-visible ring, removed from the
 * tab order while hidden; respects prefers-reduced-motion. Hidden in print.
 */
(function () {
  if (typeof document === 'undefined') return;

  function init() {
    if (document.getElementById('ax-back-to-top')) return;

    var css =
      '#ax-back-to-top{position:fixed;right:24px;bottom:24px;z-index:1000;width:46px;height:46px;' +
      'border:none;border-radius:999px;cursor:pointer;color:#fff;' +
      'background:var(--brand-gradient,linear-gradient(135deg,#7C3AED,#22D3EE));' +
      'box-shadow:0 4px 24px rgba(124,58,237,0.25);display:inline-flex;align-items:center;justify-content:center;' +
      'opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px) scale(.92);' +
      'transition:opacity .2s ease,transform .2s ease,visibility .2s ease,box-shadow .15s ease}' +
      '#ax-back-to-top.is-visible{opacity:1;visibility:visible;pointer-events:auto;transform:none}' +
      '#ax-back-to-top:hover{opacity:.9;box-shadow:0 6px 28px rgba(124,58,237,0.32)}' +
      '#ax-back-to-top:focus-visible{outline:2px solid var(--violet,#7C3AED);outline-offset:3px}' +
      '@media(max-width:767px){#ax-back-to-top{right:16px;bottom:84px;width:44px;height:44px}}' +
      '@media(prefers-reduced-motion:reduce){#ax-back-to-top{transition:opacity .15s ease,visibility .15s ease;transform:none}' +
      '#ax-back-to-top.is-visible{transform:none}}' +
      '@media print{#ax-back-to-top{display:none}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.id = 'ax-back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.tabIndex = -1;
    btn.setAttribute('aria-hidden', 'true');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    btn.addEventListener('click', function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    document.body.appendChild(btn);

    var frame = 0;
    function evaluate() {
      frame = 0;
      if (window.scrollY > 600) {
        btn.classList.add('is-visible'); btn.tabIndex = 0; btn.removeAttribute('aria-hidden');
      } else {
        btn.classList.remove('is-visible'); btn.tabIndex = -1; btn.setAttribute('aria-hidden', 'true');
      }
    }
    function onScroll() { if (frame === 0) frame = window.requestAnimationFrame(evaluate); }
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
