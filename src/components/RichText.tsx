import type { CSSProperties, ReactNode } from 'react';

/**
 * Inline rich-text renderer: **bold** · *italic* · `code`. Deterministic, no
 * markdown library. The markers are converted to styled spans AND removed, so
 * raw markdown (e.g. **Audit**) never shows literally — it renders as UI-styled
 * emphasis. Shared by the Help Center and the Luna chat.
 */

const codeStyle: CSSProperties = {
  background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4,
  fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)',
};

const Code = ({ children }: { children: ReactNode }) => <code style={codeStyle}>{children}</code>;

export function RichText({ t }: { t: string }) {
  const parts = t.split(/(\*\*.+?\*\*|`[^`]+`|\*.+?\*)/g);
  return (
    <>
      {parts.map((seg, i) => {
        if (!seg) return null;
        if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={i}>{seg.slice(2, -2)}</strong>;
        if (seg.startsWith('`')  && seg.endsWith('`'))  return <Code key={i}>{seg.slice(1, -1)}</Code>;
        if (seg.startsWith('*')  && seg.endsWith('*'))  return <em key={i}>{seg.slice(1, -1)}</em>;
        return <span key={i}>{seg}</span>;
      })}
    </>
  );
}
