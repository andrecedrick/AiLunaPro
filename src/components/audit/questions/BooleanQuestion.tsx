interface Props {
  value: boolean | undefined;
  onChange: (next: boolean) => void;
}

export function BooleanQuestion({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {[
        { v: true, label: 'Yes' },
        { v: false, label: 'No' },
      ].map(opt => {
        const selected = value === opt.v;
        return (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--border)'}`,
              background: selected ? 'var(--brand-soft-bg)' : 'var(--surface)',
              color: selected ? 'var(--violet-text)' : 'var(--text-primary)',
              fontWeight: selected ? 600 : 500,
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
