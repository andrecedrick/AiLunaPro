import type { ExportEvent, ExportKind } from '../../types/report';

const KIND_META: Record<ExportKind, { icon: string; label: string }> = {
  pdf: { icon: '⬇', label: 'PDF download' },
  email: { icon: '✉', label: 'Sent by email' },
  print: { icon: '🖨', label: 'Printed' },
  'share-link': { icon: '🔗', label: 'Share link copied' },
};

interface Props {
  events: ExportEvent[];
}

export function ExportHistory({ events }: Props) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 18,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--text-primary)',
          }}
        >
          Export history
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          No exports yet. Use the bar above to download, email, print, or share this report.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(e => {
            const meta = KIND_META[e.kind];
            return (
              <li
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  paddingBottom: 10,
                  borderBottom: '1px dashed var(--border)',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--brand-tint-bg)',
                    color: 'var(--violet-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 13,
                  }}
                  aria-hidden
                >
                  {meta.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontSize: 12,
                    }}
                  >
                    {meta.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(e.createdAt).toLocaleString()}
                    {e.meta?.recipient ? ` · to ${e.meta.recipient}` : ''}
                    {e.meta?.filename ? ` · ${e.meta.filename}` : ''}
                    {e.meta?.url ? ` · link copied` : ''}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
