/**
 * Recommendation catalog.
 * Findings reference these by id. Phase 4: hand-curated list.
 */

import type { Recommendation } from '../../types/scoring';

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'R001',
    title: 'Establish an AI governance committee',
    description:
      'Form a cross-functional group (legal, security, product, engineering) accountable for AI risk decisions. Meets at least monthly with documented minutes.',
    effort: 'medium',
    impact: 'high',
    timeframeDays: 30,
    relatedSection: 'governance',
  },
  {
    id: 'R002',
    title: 'Draft and publish a written AI policy',
    description:
      'Produce a leadership-approved AI policy covering acceptable use, prohibited use, data handling, and responsible disclosure. Make it accessible to all staff.',
    effort: 'medium',
    impact: 'high',
    timeframeDays: 60,
    relatedSection: 'governance',
  },
  {
    id: 'R003',
    title: 'Adopt a recognized AI compliance framework',
    description:
      'Map your controls to ISO/IEC 42001, NIST AI RMF, or the EU AI Act. Pick one as the primary reference and document the gap.',
    effort: 'high',
    impact: 'high',
    timeframeDays: 90,
    relatedSection: 'governance',
  },
  {
    id: 'R004',
    title: 'Conduct adversarial testing on production AI',
    description:
      'Run red-team exercises focused on prompt injection, jailbreaks, data exfiltration, and biased outputs. Track findings to closure.',
    effort: 'medium',
    impact: 'high',
    timeframeDays: 60,
    relatedSection: 'security',
  },
  {
    id: 'R005',
    title: 'Implement core AI security controls',
    description:
      'Encryption in transit & at rest for AI workloads, role-based access to models and training data, full audit logging of inference inputs/outputs.',
    effort: 'high',
    impact: 'high',
    timeframeDays: 90,
    relatedSection: 'security',
  },
  {
    id: 'R006',
    title: 'Add AI disclosure to user-facing surfaces',
    description:
      'Inform end-users when they interact with AI. Use clear language, in-product labels, and updates to your privacy notice.',
    effort: 'low',
    impact: 'medium',
    timeframeDays: 30,
    relatedSection: 'transparency',
  },
  {
    id: 'R007',
    title: 'Document AI escalation procedures',
    description:
      'Define who is paged when AI causes harm, the criteria for pausing a model, and the post-incident review process.',
    effort: 'low',
    impact: 'high',
    timeframeDays: 30,
    relatedSection: 'human-oversight',
  },
  {
    id: 'R008',
    title: 'Roll out AI literacy training',
    description:
      'Train all staff on responsible AI use; offer deeper modules for builders. Cover bias, privacy, security, and acceptable use.',
    effort: 'medium',
    impact: 'medium',
    timeframeDays: 60,
    relatedSection: 'training-maturity',
  },
  {
    id: 'R009',
    title: 'Implement a data governance framework',
    description:
      'Catalogue what data feeds AI, classify by sensitivity, define retention, and enforce access controls. Mandatory before processing PII or health data.',
    effort: 'high',
    impact: 'critical',
    timeframeDays: 90,
    relatedSection: 'data',
  },
  {
    id: 'R010',
    title: 'Improve AI incident response readiness',
    description:
      'Write a runbook, rehearse it twice yearly, and integrate AI-specific scenarios into your existing SOC playbooks.',
    effort: 'medium',
    impact: 'high',
    timeframeDays: 60,
    relatedSection: 'security',
  },
  {
    id: 'R011',
    title: 'Add explainability to AI decisions',
    description:
      'Provide per-decision reasons for actions that affect users (denials, ranking, content moderation). Start category-level, evolve to individual.',
    effort: 'high',
    impact: 'medium',
    timeframeDays: 90,
    relatedSection: 'transparency',
  },
  {
    id: 'R012',
    title: 'Expand human review for high-stakes decisions',
    description:
      'Identify decision categories with significant impact (HR, credit, legal, health) and require a human reviewer in the loop before action.',
    effort: 'medium',
    impact: 'high',
    timeframeDays: 60,
    relatedSection: 'human-oversight',
  },
  {
    id: 'R013',
    title: 'Maintain model & system cards',
    description:
      'Publish a short card per AI system: purpose, training data, known limitations, owner. Refresh on every material change.',
    effort: 'low',
    impact: 'medium',
    timeframeDays: 30,
    relatedSection: 'transparency',
  },
];

export function getRecommendation(id: string): Recommendation | undefined {
  return RECOMMENDATIONS.find(r => r.id === id);
}

export function getRecommendations(ids: string[]): Recommendation[] {
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const rec = getRecommendation(id);
    if (rec) {
      out.push(rec);
      seen.add(id);
    }
  }
  return out;
}
