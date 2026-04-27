/**
 * Finding rules — declarative list of predicates that can fire findings.
 * Each rule, given the answers + context flags, returns a Finding or null.
 */

import type { AuditAnswers } from '../../types/audit';
import type { ContextFlags, Finding, FindingRule } from '../../types/scoring';

const FINDING_RULES: FindingRule[] = [
  /* ── Critical ─────────────────────────────────────────── */
  (a, ctx) => {
    if (a['data.governance_framework'] !== false) return null;
    if (!ctx.sensitiveData) return null;
    return {
      id: 'C001',
      severity: 'critical',
      sectionKey: 'data',
      title: 'No data governance framework while processing sensitive data',
      description:
        'You process sensitive data (PII / health / biometric / minors) but have no documented data governance framework. This is a critical compliance gap under GDPR and the EU AI Act.',
      relatedQuestions: ['data.governance_framework', 'data.types'],
      recommendationIds: ['R009', 'R005'],
    };
  },

  (a, ctx) => {
    if (a['over.model'] !== 'oot') return null;
    if (!ctx.highRiskIndustry && !ctx.missionCritical) return null;
    return {
      id: 'C002',
      severity: 'critical',
      sectionKey: 'human-oversight',
      title: 'Out-of-the-loop oversight in a high-risk context',
      description:
        'Fully autonomous AI decisions in a high-risk industry or for mission-critical systems present substantial regulatory and reputational risk. Human-in-the-loop or on-the-loop oversight is strongly advised.',
      relatedQuestions: ['over.model', 'profile.industry', 'tools.scope'],
      recommendationIds: ['R012', 'R007'],
    };
  },

  /* ── High ─────────────────────────────────────────────── */
  a => {
    if (a['gov.committee'] !== false) return null;
    return {
      id: 'H001',
      severity: 'high',
      sectionKey: 'governance',
      title: 'No AI governance committee',
      description:
        'Without a designated cross-functional group accountable for AI risk, decisions are made ad hoc and accountability is unclear.',
      relatedQuestions: ['gov.committee'],
      recommendationIds: ['R001'],
    };
  },

  (a, ctx) => {
    if (a['sec.red_team'] !== false) return null;
    if (!ctx.missionCritical && !ctx.customerFacing) return null;
    return {
      id: 'H002',
      severity: 'high',
      sectionKey: 'security',
      title: 'No adversarial testing on customer-facing or critical AI',
      description:
        'AI systems exposed to users or making consequential decisions should be red-teamed for prompt injection, jailbreaks, biased outputs, and data exfiltration.',
      relatedQuestions: ['sec.red_team', 'tools.scope'],
      recommendationIds: ['R004'],
    };
  },

  (a, ctx) => {
    if (a['trans.disclosure'] !== false) return null;
    if (!ctx.customerFacing) return null;
    return {
      id: 'H003',
      severity: 'high',
      sectionKey: 'transparency',
      title: 'AI use is not disclosed to end-users',
      description:
        'Customer-facing AI must be disclosed under the EU AI Act (Art. 50) and most consumer-protection regimes. Add clear in-product labels and update privacy disclosures.',
      relatedQuestions: ['trans.disclosure', 'tools.scope'],
      recommendationIds: ['R006', 'R013'],
    };
  },

  a => {
    if (a['over.escalation'] !== false) return null;
    return {
      id: 'H004',
      severity: 'high',
      sectionKey: 'human-oversight',
      title: 'No documented escalation procedures for AI errors',
      description:
        'Your team needs a clear runbook for pausing models, paging owners, and reviewing harmful outputs. Without it, response time to AI incidents is unpredictable.',
      relatedQuestions: ['over.escalation'],
      recommendationIds: ['R007', 'R010'],
    };
  },

  a => {
    if (a['train.staff_training'] !== false) return null;
    return {
      id: 'H005',
      severity: 'high',
      sectionKey: 'training-maturity',
      title: 'No AI literacy training for staff',
      description:
        'Untrained users are the primary cause of AI mishaps (data leaks via prompts, blind trust in outputs). Roll out a baseline training programme.',
      relatedQuestions: ['train.staff_training'],
      recommendationIds: ['R008'],
    };
  },

  /* ── Medium ───────────────────────────────────────────── */
  a => {
    if (a['gov.written_policy'] !== false) return null;
    return {
      id: 'M001',
      severity: 'medium',
      sectionKey: 'governance',
      title: 'No written AI policy',
      description:
        'A leadership-approved policy clarifies acceptable use, prohibited use, and reporting expectations. Without it, governance decisions are not enforceable.',
      relatedQuestions: ['gov.written_policy'],
      recommendationIds: ['R002'],
    };
  },

  a => {
    const v = a['gov.frameworks'];
    if (!Array.isArray(v)) return null;
    const real = v.filter(x => x !== 'none');
    if (real.length >= 1) return null;
    return {
      id: 'M002',
      severity: 'medium',
      sectionKey: 'governance',
      title: 'Not aligned with any recognized AI framework',
      description:
        'Adopt at least one external reference — ISO/IEC 42001, NIST AI RMF, or the EU AI Act — to anchor your controls and demonstrate diligence.',
      relatedQuestions: ['gov.frameworks'],
      recommendationIds: ['R003'],
    };
  },

  a => {
    const v = a['sec.controls'];
    if (!Array.isArray(v) || v.length >= 3) return null;
    return {
      id: 'M003',
      severity: 'medium',
      sectionKey: 'security',
      title: 'Few foundational security controls in place',
      description:
        'You have fewer than 3 of the 5 listed controls (encryption, RBAC, audit logs, secrets, isolation). Prioritise the missing ones.',
      relatedQuestions: ['sec.controls'],
      recommendationIds: ['R005'],
    };
  },

  a => {
    const v = a['trans.explainability'];
    if (v !== 'none' && v !== 'generic') return null;
    return {
      id: 'M004',
      severity: 'medium',
      sectionKey: 'transparency',
      title: 'Limited explainability for AI decisions',
      description:
        'Affected users currently get no or generic explanations. Move toward category-level reasons, then per-decision explanations on request.',
      relatedQuestions: ['trans.explainability'],
      recommendationIds: ['R011', 'R013'],
    };
  },

  a => {
    const v = a['sec.incident_readiness'];
    if (v !== '1' && v !== '2') return null;
    return {
      id: 'M005',
      severity: 'medium',
      sectionKey: 'security',
      title: 'Low AI incident readiness',
      description:
        'Self-assessed readiness is at level 1 or 2. Document a runbook, rehearse, and integrate AI scenarios into existing SOC playbooks.',
      relatedQuestions: ['sec.incident_readiness'],
      recommendationIds: ['R010'],
    };
  },

  /* ── Low ──────────────────────────────────────────────── */
  a => {
    const v = a['train.maturity'];
    if (v !== '1' && v !== '2') return null;
    return {
      id: 'L001',
      severity: 'low',
      sectionKey: 'training-maturity',
      title: 'Low self-assessed AI maturity',
      description:
        'Your team self-assesses at the Initial or Developing level. Quick wins: publish a policy, pick a framework, and run a baseline training session.',
      relatedQuestions: ['train.maturity'],
      recommendationIds: ['R002', 'R008'],
    };
  },

  a => {
    const v = a['train.topics'];
    if (!Array.isArray(v) || v.length >= 3) return null;
    return {
      id: 'L002',
      severity: 'low',
      sectionKey: 'training-maturity',
      title: 'Narrow training coverage',
      description:
        'Training currently covers fewer than 3 of the 5 recommended topics. Round out coverage to bias, privacy, security, acceptable use and incident response.',
      relatedQuestions: ['train.topics'],
      recommendationIds: ['R008'],
    };
  },

  a => {
    const v = a['over.review_categories'];
    if (!Array.isArray(v) || v.length >= 1) return null;
    return {
      id: 'L003',
      severity: 'low',
      sectionKey: 'human-oversight',
      title: 'No decision categories under mandatory human review',
      description:
        'Identify high-stakes decision types (HR, credit, health, legal, content) and require a reviewer before AI output is acted upon.',
      relatedQuestions: ['over.review_categories'],
      recommendationIds: ['R012'],
    };
  },
];

export function generateFindings(answers: AuditAnswers, ctx: ContextFlags): Finding[] {
  return FINDING_RULES.map(rule => rule(answers, ctx)).filter(
    (f): f is Finding => f !== null,
  );
}
