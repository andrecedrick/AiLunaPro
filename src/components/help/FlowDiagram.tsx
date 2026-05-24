/**
 * Lightweight flow diagram for Help — steps as theme-aware chips joined by
 * arrows. Zero dependency (no Mermaid runtime / no bundle bloat), responsive
 * (wraps on narrow screens), versioned with the source. Sufficient for the
 * simple linear flows in the Help Center (Audit → Submit → Report → list).
 */
export function FlowDiagram({ steps, caption }: { steps: string[]; caption?: string }) {
  return (
    <figure style={{ margin: '4px 0 16px' }}>
      <div
        style={{
          display:     'flex',
          flexWrap:    'wrap',
          alignItems:  'center',
          gap:         8,
          padding:     '14px 16px',
          background:  'var(--surface-2)',
          border:      '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        {steps.map((step, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display:      'inline-block',
                padding:      '6px 12px',
                background:   'var(--surface)',
                border:       '1px solid var(--border-strong)',
                borderRadius: 8,
                fontSize:     12.5,
                fontWeight:   600,
                color:        'var(--text-primary)',
                whiteSpace:   'nowrap',
              }}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden style={{ color: 'var(--violet-text)', fontWeight: 700 }}>→</span>
            )}
          </span>
        ))}
      </div>
      {caption && (
        <figcaption style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
