import { useAudit } from '../../context/AuditContext';
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
  const value = answers[question.id];

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
      <div style={{ marginBottom: question.helper ? 4 : 14 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {question.label}
          {question.required && (
            <span style={{ color: 'var(--red-text)', marginLeft: 4 }}>*</span>
          )}
        </span>
      </div>

      {question.helper && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          {question.helper}
        </div>
      )}

      {/* Type-specific input */}
      {question.type === 'text' && (
        <TextQuestion
          question={question}
          value={(value as string) ?? ''}
          onChange={v => setAnswer(question.id, v)}
        />
      )}
      {question.type === 'textarea' && (
        <TextareaQuestion
          question={question}
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
