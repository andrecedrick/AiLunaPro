import { SectionTitle } from './SectionTitle';
import type { AuditResult } from '../../types/scoring';
import { getWhyItMattersNarrative } from '../../lib/scoring/assistance';

/** Render a paragraph with **bold** spans (very small subset of markdown). */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-primary)' }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function WhyItMatters({ result }: { result: AuditResult }) {
  const paragraphs = getWhyItMattersNarrative(result);

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 24,
        marginBottom: 20,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <SectionTitle eyebrow="04 · Context" title="Why this matters" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
            }}
          >
            {renderInline(p)}
          </p>
        ))}
      </div>

      {/* Reference chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px dashed var(--border)',
        }}
      >
        <ReferenceChip>EU AI Act</ReferenceChip>
        <ReferenceChip>GDPR</ReferenceChip>
        <ReferenceChip>ISO/IEC 42001</ReferenceChip>
        <ReferenceChip>NIST AI RMF</ReferenceChip>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
          Frameworks referenced in this assessment
        </span>
      </div>
    </section>
  );
}

function ReferenceChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}
