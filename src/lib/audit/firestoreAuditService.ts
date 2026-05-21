/**
 * Audits — Firestore service (Phase F.2).
 *
 * Collections:
 *   /organizations/{orgId}/audits/{auditId}
 *   /organizations/{orgId}/audits/{auditId}/answers/{questionId}
 *
 * Consumed only by AuditContext when resolveLayer('audit') === 'firebase'.
 * Nothing in the UI tree imports this file directly.
 *
 * Write strategy:
 *   - createAudit:  batch — audit doc + initial answers map in one commit
 *   - saveAnswer:   updateDoc on audit (updatedAt) + setDoc on answer — two
 *                   sequential writes (answers are independent; no need for
 *                   atomicity with the parent doc on incremental saves)
 *   - submitAudit:  batch — audit status/submittedAt + final answers snapshot
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firestore';
import type { AuditDraft, AuditAnswers, AnswerValue } from '../../types/audit';

// ─── Path helpers ─────────────────────────────────────────────────────────────

function auditsCol(orgId: string) {
  return collection(db, 'organizations', orgId, 'audits');
}

function auditDoc(orgId: string, auditId: string) {
  return doc(db, 'organizations', orgId, 'audits', auditId);
}

function answersCol(orgId: string, auditId: string) {
  return collection(db, 'organizations', orgId, 'audits', auditId, 'answers');
}

function answerDoc(orgId: string, auditId: string, questionId: string) {
  return doc(db, 'organizations', orgId, 'audits', auditId, 'answers', questionId);
}

// ─── Firestore document shapes ────────────────────────────────────────────────

interface FsAuditDoc {
  id: string;
  status: 'draft' | 'submitted';
  startedAt: string;
  updatedAt: string;
  submittedAt?: string;
  organizationId: string;
  createdBy: string;
}

interface FsAnswerDoc {
  questionId: string;
  auditId: string;    // required by Firestore rules: request.resource.data.auditId == auditId
  answeredBy: string; // required by Firestore rules: request.resource.data.answeredBy == uid()
  value: AnswerValue;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAuditDraft(fsDoc: FsAuditDoc, answers: AuditAnswers): AuditDraft {
  return {
    id:          fsDoc.id,
    status:      fsDoc.status,
    startedAt:   fsDoc.startedAt,
    updatedAt:   fsDoc.updatedAt,
    submittedAt: fsDoc.submittedAt,
    answers,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Load all audits for an org, ordered by startedAt descending.
 * Returns answers for each audit in a single batch of subcollection reads.
 */
export async function fsListAudits(orgId: string): Promise<AuditDraft[]> {
  const q = query(auditsCol(orgId), orderBy('startedAt', 'desc'));
  const snap = await getDocs(q);

  // allSettled, NOT Promise.all: a single failed answers sub-read must not
  // reject the whole batch and make EVERY audit disappear. On a per-audit
  // answers failure, keep the audit with empty answers and warn.
  const settled = await Promise.allSettled(
    snap.docs.map(async d => {
      const fsAudit = { id: d.id, ...d.data() } as FsAuditDoc;
      const answersSnap = await getDocs(answersCol(orgId, d.id));
      const answers: AuditAnswers = {};
      answersSnap.docs.forEach(a => {
        const fd = a.data() as FsAnswerDoc;
        answers[fd.questionId] = fd.value;
      });
      return toAuditDraft(fsAudit, answers);
    }),
  );

  const drafts: AuditDraft[] = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      drafts.push(r.value);
    } else {
      const d = snap.docs[i];
      console.warn('[fsListAudits] answers read failed, keeping audit with empty answers:', d.id, r.reason);
      drafts.push(toAuditDraft({ id: d.id, ...d.data() } as FsAuditDoc, {}));
    }
  });

  return drafts;
}

/**
 * Load a single audit (doc + answers).
 * Returns null if not found.
 */
export async function fsGetAudit(
  orgId: string,
  auditId: string,
): Promise<AuditDraft | null> {
  const snap = await getDoc(auditDoc(orgId, auditId));
  if (!snap.exists()) return null;

  const fsAudit = { id: snap.id, ...snap.data() } as FsAuditDoc;
  const answersSnap = await getDocs(answersCol(orgId, auditId));
  const answers: AuditAnswers = {};
  answersSnap.docs.forEach(a => {
    const fd = a.data() as FsAnswerDoc;
    answers[fd.questionId] = fd.value;
  });

  return toAuditDraft(fsAudit, answers);
}

/**
 * Create a new audit draft.
 * Batched: audit doc written atomically.
 * Answers map is empty at creation — written incrementally via saveAnswer.
 */
export async function fsCreateAudit(
  orgId: string,
  uid: string,
  draft: AuditDraft,
): Promise<void> {
  const fsAudit: FsAuditDoc = {
    id:             draft.id,
    status:         'draft',
    startedAt:      draft.startedAt,
    updatedAt:      draft.updatedAt,
    organizationId: orgId,
    createdBy:      uid,
  };
  await setDoc(auditDoc(orgId, draft.id), fsAudit);
}

/**
 * Persist a single answer.
 * Two sequential writes:
 *   1. answer doc upsert
 *   2. audit doc updatedAt refresh
 */
export async function fsSaveAnswer(
  orgId: string,
  auditId: string,
  questionId: string,
  value: AnswerValue,
  uid: string,
): Promise<void> {
  const now = new Date().toISOString();
  const fsAnswer: FsAnswerDoc = { questionId, auditId, answeredBy: uid, value, updatedAt: now };

  await setDoc(answerDoc(orgId, auditId, questionId), fsAnswer);
  await updateDoc(auditDoc(orgId, auditId), { updatedAt: now });
}

/**
 * Submit a completed audit.
 * Batched: audit status + submittedAt updated atomically with a final
 * snapshot of all current answers (ensures Firestore reflects the final
 * state even if incremental saves were lost).
 */
export async function fsSubmitAudit(
  orgId: string,
  auditId: string,
  uid: string,
  answers: AuditAnswers,
): Promise<void> {
  const now = new Date().toISOString();
  const batch = writeBatch(db);

  // Update audit doc status
  batch.update(auditDoc(orgId, auditId), {
    status:      'submitted',
    submittedAt: now,
    updatedAt:   now,
  });

  // Snapshot all answers in batch
  Object.entries(answers).forEach(([questionId, value]) => {
    const fsAnswer: FsAnswerDoc = { questionId, auditId, answeredBy: uid, value, updatedAt: now };
    batch.set(answerDoc(orgId, auditId, questionId), fsAnswer);
  });

  await batch.commit();
}

/**
 * Update audit metadata only (e.g. saveProgress touch).
 */
export async function fsUpdateAudit(
  orgId: string,
  auditId: string,
  patch: Partial<Pick<FsAuditDoc, 'updatedAt' | 'status' | 'submittedAt'>>,
): Promise<void> {
  await updateDoc(auditDoc(orgId, auditId), patch);
}
