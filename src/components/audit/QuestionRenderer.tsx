import { useAudit } from '../../context/AuditContext';
import { useLocale } from '../../context/LocaleContext';
import { qField } from '../../lib/locale/i18n/questionsAccess';
import type { Question } from '../../types/audit';
import { TextQuestion } from './questions/TextQuestion';
import { TextareaQuestion } from './questions/TextareaQuestion';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { MultiChoiceQuestion } from './questions/MultiChoiceQuestion';
import { BooleanQuestion } from './questions/BooleanQuestion';

interface Props {
  question: Question;
}

export function QuestionRenderer({ question }: Props) {
  const { answers, setAnswer } = useAudit();
  const T = useLocale();
  const value = answers[question.id];
  const f = qField(T, question.id);
  const label = f?.label ?? question.label;
  const helper = f?.helper ?? question.helper;
  const placeholder = f?.placeholder ?? question.placeholder;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        padding: 20,
        boxShadow: 'var(--card-shadow)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Label + required marker */}
      <div style={{ marginBottom: helper ? 4 : 14 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {label}
          {question.required && (
            <span style={{ color: 'var(--red-text)', marginLeft: 4 }}>*</span>
          )}
        </span>
      </div>

      {helper && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          {helper}
        </div>
      )}

      {/* Type-specific input */}
      {question.type === 'text' && (
        <TextQuestion
          question={question}
          placeholder={placeholder}
          value={(value as string) ?? ''}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
      {question.type === 'textarea' && (
        <TextareaQuestion
          question={question}
          placeholder={placeholder}
          value={(value as string) ?? ''}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
      {question.type === 'single' && (
        <SingleChoiceQuestion
          question={question}
          value={(value as string) ?? ''}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
      {question.type === 'multi' && (
        <MultiChoiceQuestion
          question={question}
          value={(value as string[]) ?? []}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
      {question.type === 'boolean' && (
        <BooleanQuestion
          value={typeof value === 'boolean' ? value : undefined}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
    </div>
  );
}
