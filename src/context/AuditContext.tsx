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
import { ROLE } from '../types/auth';
import { resolveLayer } from '../lib/featureFlags';
import { useAuth } from './AuthContext';
import {
  fsListAudits,
  fsCreateAudit,
  fsSaveAnswer,
  fsSubmitAudit,
} from '../lib/audit/firestoreAuditService';

// ─── Feature flag ─────────────────────────────────────────────────────────────

const LAYER = resolveLayer('audit');

// ─── Mock persistence helpers ─────────────────────────────────────────────────

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
    /* swallow */
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

// ─── Context shape ────────────────────────────────────────────────────────────

export type AuditStatus = 'loading' | 'loaded' | 'error' | 'forbidden';

interface AuditContextValue {
  /* state */
  draft: AuditDraft;
  status: AuditStatus;
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

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuditProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const orgId = session?.orgId ?? null;
  const uid   = session?.userId ?? null;
  const role  = session?.role;

  // Mock: init synchronously from localStorage.
  // Firebase: start empty + loading, populate async.
  const [draft, setDraft] = useState<AuditDraft>(() => {
    if (LAYER === 'mock') {
      const existing = readDraft();
      if (existing && existing.status === 'draft') return existing;
      return newDraft();
    }
    return newDraft(); // placeholder until Firestore loads
  });

  const [status, setStatus] = useState<AuditStatus>(
    LAYER === 'mock' ? 'loaded' : 'loading',
  );
  const [currentStep, setCurrentStep] = useState(0);

  // ── Firebase: load most-recent draft; create one if none exists ───────────

  useEffect(() => {
    if (LAYER === 'mock') return;
    if (!orgId || !uid) return;

    // Audit content is owner/admin/member only (isContentMember). Billing and
    // client roles cannot create/load audits — don't attempt a draft write
    // (it would 403 and surface as "Failed to load"); show a clear role state.
    if (!ROLE.canUseFeatures(role)) {
      setStatus('forbidden');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    fsListAudits(orgId)
      .then(async audits => {
        if (cancelled) return;
        const inProgress = audits.find(a => a.status === 'draft');
        if (inProgress) {
          setDraft(inProgress);
        } else {
          // No existing draft — create a fresh one in Firestore immediately
          const fresh = newDraft();
          await fsCreateAudit(orgId, uid, fresh);
          if (!cancelled) setDraft(fresh);
        }
        if (!cancelled) setStatus('loaded');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [orgId, uid, role]);

  // ── Mock: mirror to localStorage on every change ──────────────────────────

  useEffect(() => {
    if (LAYER === 'mock') writeDraft(draft);
  }, [draft]);

  // ── CRUD — mock path ───────────────────────────────────────────────────────

  const setAnswerMock = useCallback((id: string, value: AnswerValue) => {
    setDraft(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const saveProgressMock = useCallback(() => {
    setDraft(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
  }, []);

  const submitAuditMock = useCallback((): string => {
    const submittedAt = new Date().toISOString();
    const submittedId = draft.id;
    setDraft(prev => ({ ...prev, status: 'submitted', submittedAt, updatedAt: submittedAt }));
    return submittedId;
  }, [draft.id]);

  const resetDraftMock = useCallback(() => {
    setDraft(newDraft());
    setCurrentStep(0);
  }, []);

  // ── CRUD — firebase path ───────────────────────────────────────────────────

  const setAnswerFirebase = useCallback((id: string, value: AnswerValue) => {
    // Optimistic local update first
    setDraft(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value },
      updatedAt: new Date().toISOString(),
    }));
    // Async persist to Firestore
    if (orgId && uid) {
      fsSaveAnswer(orgId, draft.id, id, value, uid).catch(err =>
        console.error('[AuditContext] fsSaveAnswer failed:', err),
      );
    }
  }, [orgId, uid, draft.id]);

  const saveProgressFirebase = useCallback(() => {
    setDraft(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
    // Firestore updatedAt refreshed via fsSaveAnswer on each answer —
    // explicit saveProgress touch only needed for mock path.
  }, []);

  const submitAuditFirebase = useCallback((): string => {
    const submittedId = draft.id;
    const submittedAt = new Date().toISOString();
    setDraft(prev => ({ ...prev, status: 'submitted', submittedAt, updatedAt: submittedAt }));
    if (orgId && uid) {
      // Batch: status update + final answers snapshot
      fsSubmitAudit(orgId, submittedId, uid, draft.answers).catch(err =>
        console.error('[AuditContext] fsSubmitAudit failed:', err),
      );
    }
    return submittedId;
  }, [orgId, uid, draft.id, draft.answers]);

  const resetDraftFirebase = useCallback(() => {
    const fresh = newDraft();
    setDraft(fresh);
    setCurrentStep(0);
    if (orgId && uid) {
      fsCreateAudit(orgId, uid, fresh).catch(err =>
        console.error('[AuditContext] fsCreateAudit (reset) failed:', err),
      );
    }
  }, [orgId, uid]);

  // ── Bind correct implementation ────────────────────────────────────────────

  const setAnswer    = LAYER === 'firebase' ? setAnswerFirebase    : setAnswerMock;
  const saveProgress = LAYER === 'firebase' ? saveProgressFirebase : saveProgressMock;
  const submitAudit  = LAYER === 'firebase' ? submitAuditFirebase  : submitAuditMock;
  const resetDraft   = LAYER === 'firebase' ? resetDraftFirebase   : resetDraftMock;

  // ── Navigation ─────────────────────────────────────────────────────────────

  const totalSteps = auditSections.length;
  const isFirst = currentStep === 0;
  const isLast  = currentStep === totalSteps - 1;

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

  // ── Completion math ─────────────────────────────────────────────────────────

  const completionByStep = useMemo<number[]>(() => {
    return auditSections.map(section => {
      const total = section.questions.length;
      if (total === 0) return 0;
      const answered = section.questions.filter(q => {
        const v = draft.answers[q.id];
        if (v === undefined || v === null) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        return true;
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

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo<AuditContextValue>(
    () => ({
      draft,
      status,
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
      status,
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
