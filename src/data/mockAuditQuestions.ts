/**
 * Mock audit questionnaire — 8 sections aligned with EU AI Act / ISO 42001 / NIST AI RMF.
 * UI shell only — no real scoring, no backend.
 */

import type { AuditSection } from '../types/audit';

export const auditSections: AuditSection[] = [
  /* ── 1. Profile ─────────────────────────────────────────── */
  {
    key: 'profile',
    title: 'Profile',
    subtitle: 'Your organization at a glance',
    icon: 'team',
    questions: [
      {
        id: 'profile.org_name',
        type: 'text',
        label: 'Organization name',
        required: true,
        placeholder: 'e.g. Acme Corp',
      },
      {
        id: 'profile.industry',
        type: 'single',
        label: 'Primary industry',
        required: true,
        options: [
          { value: 'finance', label: 'Finance & Banking' },
          { value: 'health', label: 'Healthcare & Life Sciences' },
          { value: 'tech', label: 'Technology / SaaS' },
          { value: 'retail', label: 'Retail & E-commerce' },
          { value: 'public', label: 'Public sector' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'profile.size',
        type: 'single',
        label: 'Company size',
        required: true,
        options: [
          { value: 'xs', label: '1–10 employees' },
          { value: 's', label: '11–50' },
          { value: 'm', label: '51–200' },
          { value: 'l', label: '201–1000' },
          { value: 'xl', label: '1000+' },
        ],
      },
      {
        id: 'profile.region',
        type: 'single',
        label: 'Primary region of operation',
        options: [
          { value: 'eu', label: 'European Union' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'apac', label: 'Asia-Pacific' },
          { value: 'global', label: 'Global / multi-region' },
        ],
      },
    ],
  },

  /* ── 2. AI tools ────────────────────────────────────────── */
  {
    key: 'ai-tools',
    title: 'AI Tools',
    subtitle: 'What AI does your organization actually use?',
    icon: 'registry',
    questions: [
      {
        id: 'tools.categories',
        type: 'multi',
        label: 'Which AI categories are in production?',
        helper: 'Select all that apply.',
        options: [
          { value: 'llm', label: 'Large Language Models (chat, agents, copilots)' },
          { value: 'ml', label: 'Classical ML / predictive models' },
          { value: 'cv', label: 'Computer vision' },
          { value: 'speech', label: 'Speech & audio' },
          { value: 'rec', label: 'Recommendation systems' },
          { value: 'rpa', label: 'RPA / automation with AI components' },
        ],
      },
      {
        id: 'tools.vendors',
        type: 'textarea',
        label: 'Primary AI vendors / products',
        placeholder: 'e.g. OpenAI GPT-4, Anthropic Claude, in-house model on AWS Bedrock…',
      },
      {
        id: 'tools.scope',
        type: 'single',
        label: 'Deployment scope',
        required: true,
        options: [
          { value: 'pilot', label: 'Pilots / experiments only' },
          { value: 'internal', label: 'Internal staff-facing use' },
          { value: 'customer', label: 'Customer-facing features' },
          { value: 'critical', label: 'Mission-critical / regulated decisions' },
        ],
      },
      {
        id: 'tools.builds_custom',
        type: 'boolean',
        label: 'Do you train or fine-tune your own models?',
      },
    ],
  },

  /* ── 3. Data ────────────────────────────────────────────── */
  {
    key: 'data',
    title: 'Data',
    subtitle: 'What data feeds your AI systems?',
    icon: 'reports',
    questions: [
      {
        id: 'data.types',
        type: 'multi',
        label: 'What types of data are processed by AI?',
        required: true,
        options: [
          { value: 'pii', label: 'Personal data (PII)' },
          { value: 'health', label: 'Health data' },
          { value: 'financial', label: 'Financial / transactional data' },
          { value: 'biometric', label: 'Biometric data' },
          { value: 'children', label: 'Data on minors' },
          { value: 'public', label: 'Public / open data' },
        ],
      },
      {
        id: 'data.residency',
        type: 'single',
        label: 'Where is the data primarily stored?',
        options: [
          { value: 'eu', label: 'EU / EEA' },
          { value: 'us', label: 'United States' },
          { value: 'mixed', label: 'Mixed / multi-region' },
          { value: 'unknown', label: 'Not sure' },
        ],
      },
      {
        id: 'data.governance_framework',
        type: 'boolean',
        label: 'Is there a documented data governance framework in place?',
      },
      {
        id: 'data.sources',
        type: 'textarea',
        label: 'Describe your main data sources',
        placeholder: 'e.g. CRM, product telemetry, customer support tickets, third-party datasets…',
      },
    ],
  },

  /* ── 4. Governance ──────────────────────────────────────── */
  {
    key: 'governance',
    title: 'Governance',
    subtitle: 'Policies, ownership, and accountability',
    icon: 'settings',
    questions: [
      {
        id: 'gov.committee',
        type: 'boolean',
        label: 'Do you have an AI governance committee or designated owner?',
      },
      {
        id: 'gov.written_policy',
        type: 'boolean',
        label: 'Is there a written AI policy approved by leadership?',
      },
      {
        id: 'gov.frameworks',
        type: 'multi',
        label: 'Which frameworks do you align with?',
        options: [
          { value: 'eu-ai-act', label: 'EU AI Act' },
          { value: 'iso-42001', label: 'ISO/IEC 42001' },
          { value: 'nist-aimrf', label: 'NIST AI RMF' },
          { value: 'soc2', label: 'SOC 2' },
          { value: 'gdpr', label: 'GDPR' },
          { value: 'none', label: 'None formally' },
        ],
      },
      {
        id: 'gov.structure',
        type: 'textarea',
        label: 'Describe your governance structure',
        placeholder: 'Who owns AI risk? How are decisions escalated?',
      },
    ],
  },

  /* ── 5. Security ────────────────────────────────────────── */
  {
    key: 'security',
    title: 'Security',
    subtitle: 'Protecting AI systems and their data',
    icon: 'settings',
    questions: [
      {
        id: 'sec.controls',
        type: 'multi',
        label: 'Which security controls are in place for AI systems?',
        options: [
          { value: 'encryption', label: 'Encryption at rest + in transit' },
          { value: 'rbac', label: 'Role-based access control' },
          { value: 'audit_logs', label: 'Audit logging of model access & inputs' },
          { value: 'secrets', label: 'Secrets management (no hardcoded keys)' },
          { value: 'isolation', label: 'Tenant / data isolation' },
        ],
      },
      {
        id: 'sec.red_team',
        type: 'boolean',
        label: 'Have your AI systems been red-teamed or adversarially tested?',
      },
      {
        id: 'sec.incident_readiness',
        type: 'single',
        label: 'How prepared are you for an AI-specific incident?',
        options: [
          { value: '1', label: '1 — No plan' },
          { value: '2', label: '2 — Informal plan' },
          { value: '3', label: '3 — Documented but untested' },
          { value: '4', label: '4 — Documented and rehearsed' },
          { value: '5', label: '5 — Continuous, integrated with SOC' },
        ],
      },
      {
        id: 'sec.review_process',
        type: 'textarea',
        label: 'Describe your security review process for new AI systems',
      },
    ],
  },

  /* ── 6. Transparency ────────────────────────────────────── */
  {
    key: 'transparency',
    title: 'Transparency',
    subtitle: 'Disclosure and explainability',
    icon: 'reports',
    questions: [
      {
        id: 'trans.disclosure',
        type: 'boolean',
        label: 'Do you disclose AI use to end-users when they interact with it?',
      },
      {
        id: 'trans.cards',
        type: 'boolean',
        label: 'Do you maintain model cards or system cards?',
      },
      {
        id: 'trans.explainability',
        type: 'single',
        label: 'How explainable are your AI decisions to affected users?',
        options: [
          { value: 'none', label: 'No explanations provided' },
          { value: 'generic', label: 'Generic disclosures only' },
          { value: 'category', label: 'Category-level reasons' },
          { value: 'individual', label: 'Per-decision explanations on request' },
          { value: 'realtime', label: 'Real-time, in-product explanations' },
        ],
      },
      {
        id: 'trans.measures',
        type: 'textarea',
        label: 'Describe your transparency measures',
        placeholder: 'Public AI register, in-app disclosures, audit logs available to users…',
      },
    ],
  },

  /* ── 7. Human oversight ─────────────────────────────────── */
  {
    key: 'human-oversight',
    title: 'Human Oversight',
    subtitle: 'Keeping humans in control',
    icon: 'team',
    questions: [
      {
        id: 'over.model',
        type: 'single',
        label: 'Which oversight model best describes your setup?',
        required: true,
        options: [
          { value: 'hitl', label: 'Human-in-the-loop (every decision reviewed)' },
          { value: 'hotl', label: 'Human-on-the-loop (sampled review)' },
          { value: 'oot', label: 'Human-out-of-the-loop (autonomous)' },
        ],
      },
      {
        id: 'over.escalation',
        type: 'boolean',
        label: 'Are escalation procedures documented for AI errors or harms?',
      },
      {
        id: 'over.review_categories',
        type: 'multi',
        label: 'Which decision categories require mandatory human review?',
        options: [
          { value: 'hr', label: 'Hiring / HR decisions' },
          { value: 'credit', label: 'Credit / financial decisions' },
          { value: 'health', label: 'Health-related recommendations' },
          { value: 'content', label: 'Content moderation outcomes' },
          { value: 'legal', label: 'Legal / compliance decisions' },
        ],
      },
      {
        id: 'over.processes',
        type: 'textarea',
        label: 'Describe your oversight processes in your own words',
      },
    ],
  },

  /* ── 8. Training / maturity ─────────────────────────────── */
  {
    key: 'training-maturity',
    title: 'Training & Maturity',
    subtitle: 'How AI-literate is your organization?',
    icon: 'help',
    questions: [
      {
        id: 'train.staff_training',
        type: 'boolean',
        label: 'Do you provide AI literacy training to staff?',
      },
      {
        id: 'train.maturity',
        type: 'single',
        label: 'Self-assessed AI compliance maturity',
        required: true,
        options: [
          { value: '1', label: '1 — Initial / ad hoc' },
          { value: '2', label: '2 — Developing' },
          { value: '3', label: '3 — Defined' },
          { value: '4', label: '4 — Managed' },
          { value: '5', label: '5 — Optimized' },
        ],
      },
      {
        id: 'train.topics',
        type: 'multi',
        label: 'Which topics are covered in your training?',
        options: [
          { value: 'bias', label: 'Bias & fairness' },
          { value: 'privacy', label: 'Privacy & data protection' },
          { value: 'security', label: 'AI security & misuse' },
          { value: 'usage', label: 'Acceptable use policies' },
          { value: 'incident', label: 'Incident response' },
        ],
      },
      {
        id: 'train.program',
        type: 'textarea',
        label: 'Describe your training program (or what is missing)',
      },
    ],
  },
];

export const totalAuditQuestions = auditSections.reduce(
  (sum, s) => sum + s.questions.length,
  0,
);
