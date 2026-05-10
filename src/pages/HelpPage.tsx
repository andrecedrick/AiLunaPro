/**
 * HelpPage — Phase H0.
 *
 * Auth-only Help Center inside the dashboard shell. Sidebar Help nav
 * routes here. Visible to all authenticated roles incl. client.
 *
 * Route: 'help'   (URL: #/help, with optional ?section=<id> query)
 *
 * Layout:
 *   - Desktop (>= 900px): sticky left TOC + scrollable main pane
 *   - Mobile (<  900px):  TOC collapsed inside <details> at top
 *
 * Section state:
 *   - On mount: read ?section= from URL hash query, fall back to default.
 *   - On TOC click: scrollIntoView + replaceState URL with new ?section=.
 *   - On scroll: IntersectionObserver picks active section.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { HELP_SECTIONS, DEFAULT_SECTION_ID, isValidSectionId } from '../data/help';
import { HelpToc } from '../components/help/HelpToc';

const SCROLL_OFFSET_PX = 80; // matches Topbar height + small breathing room

function readSectionFromHash(): string {
  if (typeof window === 'undefined') return DEFAULT_SECTION_ID;
  const hash = window.location.hash;
  const qIdx = hash.indexOf('?');
  if (qIdx < 0) return DEFAULT_SECTION_ID;
  const params = new URLSearchParams(hash.slice(qIdx));
  const s = params.get('section');
  return isValidSectionId(s) ? (s as string) : DEFAULT_SECTION_ID;
}

function writeSectionToHash(id: string): void {
  if (typeof window === 'undefined') return;
  const next = `#/help?section=${encodeURIComponent(id)}`;
  if (window.location.hash !== next) {
    window.history.replaceState({}, '', next);
  }
}

function useIsNarrow(threshold = 900): boolean {
  const [narrow, setNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < threshold : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setNarrow(window.innerWidth < threshold);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [threshold]);
  return narrow;
}

export function HelpPage() {
  const [activeId, setActiveId] = useState<string>(() => readSectionFromHash());
  const isNarrow = useIsNarrow(900);
  const programmaticScrollRef = useRef(false);

  // Initial scroll on mount when ?section= is set (direct URL load)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = readSectionFromHash();
    if (id !== DEFAULT_SECTION_ID) {
      // Defer to next frame so DOM is mounted
      requestAnimationFrame(() => scrollToSection(id, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver: pick active section as user scrolls (skip when
  // we triggered the scroll programmatically to avoid TOC flicker)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sections = HELP_SECTIONS.map(s => document.getElementById(`help-${s.id}`)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      entries => {
        if (programmaticScrollRef.current) return;
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
        if (visible.length > 0) {
          const id = visible[0].target.id.replace(/^help-/, '');
          setActiveId(prev => (prev === id ? prev : id));
          writeSectionToHash(id);
        }
      },
      {
        // Account for sticky topbar offset; rootMargin top negative pushes
        // the "active" boundary down to where the user is reading.
        rootMargin: `-${SCROLL_OFFSET_PX}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = (id: string, suppressObserver = false) => {
    const el = document.getElementById(`help-${id}`);
    if (!el) return;
    if (suppressObserver) {
      programmaticScrollRef.current = true;
      window.setTimeout(() => { programmaticScrollRef.current = false; }, 600);
    }
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const onSelect = (id: string) => {
    setActiveId(id);
    writeSectionToHash(id);
    scrollToSection(id, true);
  };

  const tocNode = useMemo(
    () => <HelpToc sections={HELP_SECTIONS} activeId={activeId} onSelect={onSelect} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId],
  );

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Help Center
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
          Find answers, learn workflows, and troubleshoot common issues.
        </p>
      </div>

      {/* Mobile collapsible TOC */}
      {isNarrow && (
        <details
          style={{
            marginBottom: 18,
            padding: '10px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <summary style={{
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            userSelect: 'none',
            padding: 4,
          }}>
            On this page
          </summary>
          <div style={{ marginTop: 10 }}>
            {tocNode}
          </div>
        </details>
      )}

      <div style={{
        display:              isNarrow ? 'block' : 'grid',
        gridTemplateColumns:  isNarrow ? undefined : '240px 1fr',
        gap:                  24,
        alignItems:           'start',
      }}>
        {/* Desktop sticky TOC */}
        {!isNarrow && (
          <aside style={{
            position: 'sticky',
            top:      80, // below Topbar
            alignSelf: 'start',
          }}>
            {tocNode}
          </aside>
        )}

        {/* Main content */}
        <main style={{ minWidth: 0 }}>
          {HELP_SECTIONS.map(s => (
            <section
              key={s.id}
              id={`help-${s.id}`}
              style={{
                background:    'var(--surface)',
                border:        '1px solid var(--border)',
                borderRadius:  14,
                padding:       '22px 26px',
                marginBottom:  18,
                scrollMarginTop: SCROLL_OFFSET_PX, // for any browser native anchor scroll
              }}
            >
              <h2 style={{
                fontSize:     20,
                fontWeight:   800,
                color:        'var(--text-primary)',
                margin:       '0 0 14px',
              }}>
                {s.title}
              </h2>
              <div>{s.body}</div>
            </section>
          ))}

          {/* Footer */}
          <div style={{
            marginTop:    24,
            padding:      '20px 22px',
            background:   'var(--surface-2)',
            border:       '1px solid var(--border)',
            borderRadius: 12,
            textAlign:    'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Need more help?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Contact your workspace owner or AiLunaPro support.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
