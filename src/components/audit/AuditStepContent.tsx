import { useAudit } from '../../context/AuditContext';
import { auditSections } from '../../data/mockAuditQuestions';
import { QuestionRenderer } from './QuestionRenderer';

export function AuditStepContent() {
  const { currentStep } = useAudit();
  const section = auditSections[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {section.questions.map(q => (
        <QuestionRenderer key={q.id} question={q} />
      ))}
    </div>
  );
}
