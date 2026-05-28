/**
 * Recommendation catalog.
 * Findings reference these by id. Phase 4: hand-curated list.
 * Phase 5: each recommendation now carries a `category` (automate / structure / process / train),
 * a one-line `whyItMatters` rationale, and an `expectedOutcome` for the assistance layer.
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
    category: 'structure',
    whyItMatters:
      'Without a designated owner, AI decisions are made ad hoc and accountability is unclear when something goes wrong.',
    expectedOutcome:
      'A single body that approves new AI use cases, owns risk acceptance, and signs off on incident response.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 17' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.1' },
      { framework: 'ISO_42001',   ref: 'cl. 5.1' },
    ],
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
    category: 'structure',
    whyItMatters:
      'Policies make governance enforceable. Without one, "responsible AI" is a value, not a control.',
    expectedOutcome:
      'A short, leadership-approved document referenced in onboarding, vendor reviews, and audits.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 17' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.2' },
      { framework: 'ISO_42001',   ref: 'cl. 5.2' },
    ],
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
    category: 'structure',
    whyItMatters:
      'A recognised reference gives you defensible posture in audits, deals, and regulator conversations.',
    expectedOutcome:
      'A control matrix you can hand to a customer or auditor with confidence.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 17' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.1' },
      { framework: 'ISO_42001',   ref: 'cl. 4.4' },
    ],
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
    category: 'process',
    whyItMatters:
      'Adversaries are already probing your AI surfaces. Better that you find the gaps first, on a schedule.',
    expectedOutcome:
      'A repeatable quarterly red-team motion with tracked findings and SLAs to close them.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 15',     note: 'Accuracy, robustness, cybersecurity' },
      { framework: 'NIST_AI_RMF', ref: 'MEASURE-2.7' },
      { framework: 'ISO_42001',   ref: 'cl. 8.2' },
    ],
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
    category: 'automate',
    whyItMatters:
      'These are the controls customers, regulators, and incident responders all expect to see in the first 5 minutes.',
    expectedOutcome:
      'AI workloads operate under the same security baseline as the rest of your platform.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 15' },
      { framework: 'NIST_AI_RMF', ref: 'MANAGE-2.1' },
      { framework: 'ISO_42001',   ref: 'cl. 8.2' },
    ],
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
    category: 'automate',
    whyItMatters:
      'EU AI Act Article 50 and most consumer-protection regimes require it. It is also a trust signal.',
    expectedOutcome:
      'Every customer-facing AI surface labels itself; privacy notice references it.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 50',     note: 'Transparency to natural persons' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-4.1' },
      { framework: 'ISO_42001',   ref: 'cl. 8.4' },
    ],
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
    category: 'structure',
    whyItMatters:
      'When an AI system harms a user, response time is unpredictable without a runbook. That delay is the actual risk.',
    expectedOutcome:
      'A runbook your on-call can follow at 3am — pause the model, page the right owner, file the post-mortem.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 14' },
      { framework: 'EU_AI_ACT',   ref: 'Art. 73',     note: 'Serious incident reporting' },
      { framework: 'NIST_AI_RMF', ref: 'MANAGE-4.1' },
    ],
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
    category: 'train',
    whyItMatters:
      'Untrained users are the leading cause of AI mishaps — data leaks via prompts, blind trust in outputs.',
    expectedOutcome:
      'A baseline literacy session for everyone and an advanced track for builders, refreshed yearly.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 4',      note: 'AI literacy' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.5' },
      { framework: 'ISO_42001',   ref: 'cl. 7.2' },
    ],
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
    category: 'structure',
    whyItMatters:
      'GDPR and the EU AI Act both treat data governance as a precondition for processing sensitive data. Skipping it is the single highest-impact gap.',
    expectedOutcome:
      'A live data inventory with classification, retention, and access controls — defensible to any regulator.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 10',     note: 'Data and data governance' },
      { framework: 'GDPR',        ref: 'Art. 5 / 24' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-5' },
      { framework: 'ISO_42001',   ref: 'cl. 6.1.3' },
    ],
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
    category: 'process',
    whyItMatters:
      'Untested plans fail under pressure. AI incidents look different from classical security ones; rehearsal is non-negotiable.',
    expectedOutcome:
      'Two rehearsed AI scenarios per year integrated into your SOC tabletop programme.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 73' },
      { framework: 'NIST_AI_RMF', ref: 'MANAGE-4.2' },
      { framework: 'ISO_42001',   ref: 'cl. 8.3' },
    ],
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
    category: 'automate',
    whyItMatters:
      'When affected users do not understand a decision, they appeal, escalate, and erode trust. Explainability cuts that loop.',
    expectedOutcome:
      'Every consequential AI decision ships with a category-level reason, with on-request individual detail.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 13',     note: 'Transparency to deployer/user' },
      { framework: 'NIST_AI_RMF', ref: 'MEASURE-3.2' },
      { framework: 'ISO_42001',   ref: 'cl. 8.4' },
    ],
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
    category: 'process',
    whyItMatters:
      'High-stakes autonomous decisions are precisely the ones regulators and courts will scrutinise.',
    expectedOutcome:
      'A documented list of high-stakes decision types, each with a named reviewer and SLA.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 14',     note: 'Human oversight' },
      { framework: 'EU_AI_ACT',   ref: 'Annex III' },
      { framework: 'NIST_AI_RMF', ref: 'MANAGE-2' },
    ],
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
    category: 'automate',
    whyItMatters:
      'Cards are how your team, customers, and auditors find out what each AI system actually is and is not.',
    expectedOutcome:
      'A living card per AI system, linked from the AI registry, refreshed on every release.',
    regulatoryRefs: [
      { framework: 'EU_AI_ACT',   ref: 'Art. 13' },
      { framework: 'EU_AI_ACT',   ref: 'Art. 53',     note: 'General-purpose AI documentation' },
      { framework: 'NIST_AI_RMF', ref: 'GOVERN-1.6' },
      { framework: 'ISO_42001',   ref: 'cl. 8.5' },
    ],
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
