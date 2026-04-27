import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { auditSections, totalAuditQuestions } from '../data/mockAuditQuestions';
import type { AnswerValue, AuditAnswers, AuditDraft } from '../types/audit';

const STORAGE_KEY = 'ailunapro-audit-draft';

function readDraft(): AuditDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuditDraft;
  } catch {
    return null;
  }
}

function writeDraft(draft: AuditDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* swallow — UI shell only */
  }
}

function newDraft(): AuditDraft {
  const now = new Date().toISOString();
  return {
    id: `draft_${Date.now()}`,
    status: 'draft',
    startedAt: now,
    updatedAt: now,
    answers: {},
  };
}

interface AuditContextValue {
  /* state */
  draft: AuditDraft;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  /* answers */
  answers: AuditAnswers;
  setAnswer: (id: string, value: AnswerValue) => void;
  /* nav */
  goToStep: (idx: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  /* persistence */
  saveProgress: () => void;
  submitAudit: () => string; // returns submitted draft id
  resetDraft: () => void;
  /* progress */
  overallCompletion: number; // 0..1
  completionByStep: number[]; // 0..1 per step
}

const AuditContext = createContext<AuditContextValue | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AuditDraft>(() => {
    const existing = readDraft();
    // If a previous draft was already submitted, start a fresh one for the next session.
    if (existing && existing.status === 'draft') return existing;
    return newDraft();
  });
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = auditSections.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  /* Mirror to localStorage on every draft change */
  useEffect(() => {
    writeDraft(draft);
  }, [draft]);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setDraft(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const goToStep = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalSteps) return;
      setCurrentStep(idx);
    },
    [totalSteps],
  );

  const nextStep = useCallback(() => {
    setCurrentStep(s => Math.min(totalSteps - 1, s + 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(s => Math.max(0, s - 1));
  }, []);

  const saveProgress = useCallback(() => {
    setDraft(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
  }, []);

  const submitAudit = useCallback((): string => {
    const submittedAt = new Date().toISOString();
    const submittedId = draft.id;
    setDraft(prev => ({ ...prev, status: 'submitted', submittedAt, updatedAt: submittedAt }));
    return submittedId;
  }, [draft.id]);

  const resetDraft = useCallback(() => {
    const fresh = newDraft();
    setDraft(fresh);
    setCurrentStep(0);
  }, []);

  /* Completion math — UI shell only, no scoring logic */
  const completionByStep = useMemo<number[]>(() => {
    return auditSections.map(section => {
      const total = section.questions.length;
      if (total === 0) return 0;
      const answered = section.questions.filter(q => {
        const v = draft.answers[q.id];
        if (v === undefined || v === null) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        return true; // boolean false counts as answered
      }).length;
      return answered / total;
    });
  }, [draft.answers]);

  const overallCompletion = useMemo(() => {
    const totalAnswered = auditSections.reduce((sum, section) => {
      return (
        sum +
        section.questions.filter(q => {
          const v = draft.answers[q.id];
          if (v === undefined || v === null) return false;
          if (typeof v === 'string') return v.trim().length > 0;
          if (Array.isArray(v)) return v.length > 0;
          return true;
        }).length
      );
    }, 0);
    return totalAuditQuestions === 0 ? 0 : totalAnswered / totalAuditQuestions;
  }, [draft.answers]);

  const value = useMemo<AuditContextValue>(
    () => ({
      draft,
      currentStep,
      totalSteps,
      isFirst,
      isLast,
      answers: draft.answers,
      setAnswer,
      goToStep,
      nextStep,
      prevStep,
      saveProgress,
      submitAudit,
      resetDraft,
      overallCompletion,
      completionByStep,
    }),
    [
      draft,
      currentStep,
      totalSteps,
      isFirst,
      isLast,
      setAnswer,
      goToStep,
      nextStep,
      prevStep,
      saveProgress,
      submitAudit,
      resetDraft,
      overallCompletion,
      completionByStep,
    ],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit(): AuditContextValue {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used inside AuditProvider');
  return ctx;
}
