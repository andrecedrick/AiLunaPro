/**
 * Shared eyebrow + heading used by each Assistance sub-section.
 */
export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--violet-text)',
          marginBottom: 4,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--text-primary)',
          letterSpacing: -0.3,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
