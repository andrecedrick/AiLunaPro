import type { Question } from '../../../types/audit';

interface Props {
  question: Question;
  value: string[];
  onChange: (next: string[]) => void;
}

export function MultiChoiceQuestion({ question, value, onChange }: Props) {
  const options = question.options ?? [];
  const selected = Array.isArray(value) ? value : [];

  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter(v => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const checked = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${checked ? 'var(--violet)' : 'var(--border)'}`,
              background: checked ? 'var(--brand-soft-bg)' : 'var(--surface)',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.value)}
              style={{ accentColor: 'var(--violet)', width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ flex: 1 }}>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
