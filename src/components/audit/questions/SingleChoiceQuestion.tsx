import type { Question } from '../../../types/audit';
import { useLocale } from '../../../context/LocaleContext';
import { qOption } from '../../../lib/locale/i18n/questionsAccess';

interface Props {
  question: Question;
  value: string;
  onChange: (next: string) => void;
}

export function SingleChoiceQuestion({ question, value, onChange }: Props) {
  const T = useLocale();
  const options = question.options ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const checked = value === opt.value;
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
              type="radio"
              name={question.id}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: 'var(--violet)', width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ flex: 1 }}>{qOption(T, question.id, opt.value) ?? opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
