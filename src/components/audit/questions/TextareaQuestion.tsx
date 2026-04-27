import type { Question } from '../../../types/audit';

interface Props {
  question: Question;
  value: string;
  onChange: (next: string) => void;
}

export function TextareaQuestion({ question, value, onChange }: Props) {
  return (
    <textarea
      value={value ?? ''}
      placeholder={question.placeholder}
      onChange={e => onChange(e.target.value)}
      rows={4}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        borderRadius: 10,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        outline: 'none',
        resize: 'vertical',
        minHeight: 88,
        lineHeight: 1.55,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--violet)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-tint-bg)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--input-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}
