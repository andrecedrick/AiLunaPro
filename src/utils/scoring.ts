/**
 * Scoring engine — Phase C: Core audit result computation.
 * Simplified for test validation. Full Phase 4 implementation adds findings, recommendations, roadmap.
 */

import type { AuditAnswers } from '@/types/api';

export interface AuditResultPhaseC {
  score: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
}

/**
 * Compute audit result from answers.
 * Phase C: Score calculation + risk level mapping only.
 * Phase 4 will add findings, recommendations, roadmap, context flags.
 */
export function computeAuditResult(answers: AuditAnswers): AuditResultPhaseC {
  // Count yes answers (partial treated as no)
  const yesCount = Object.values(answers).filter((answer) => answer === 'yes').length;
  const totalQuestions = Object.keys(answers).length;

  // Calculate score as percentage
  const score = Math.round((yesCount / totalQuestions) * 100);

  // Map score to risk level
  let riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  if (score <= 20) {
    riskLevel = 'critical';
  } else if (score <= 40) {
    riskLevel = 'high';
  } else if (score <= 60) {
    riskLevel = 'medium';
  } else if (score <= 80) {
    riskLevel = 'low';
  } else {
    riskLevel = 'minimal';
  }

  return { score, riskLevel };
}
