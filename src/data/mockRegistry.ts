/**
 * AI Registry — mock seed data + vocabularies.
 * Departments / data types / oversight models are reused across the
 * audit and registry so the UI vocabulary stays consistent.
 */

import type { RegistryItem } from '../types/registry';

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'Customer Support',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'Other',
] as const;

export const DATA_TYPES: { value: string; label: string }[] = [
  { value: 'pii', label: 'Personal data (PII)' },
  { value: 'health', label: 'Health data' },
  { value: 'financial', label: 'Financial / transactional' },
  { value: 'biometric', label: 'Biometric' },
  { value: 'children', label: 'Data on minors' },
  { value: 'public', label: 'Public / open' },
  { value: 'internal', label: 'Internal documents' },
  { value: 'employee', label: 'Employee records' },
];

export const OVERSIGHT_LABEL: Record<'hitl' | 'hotl' | 'oot', string> = {
  hitl: 'Human-in-the-loop',
  hotl: 'Human-on-the-loop',
  oot: 'Autonomous',
};

export const APPROVAL_LABEL: Record<
  'approved' | 'pending' | 'under-review' | 'rejected',
  string
> = {
  approved: 'Approved',
  pending: 'Pending',
  'under-review': 'Under review',
  rejected: 'Rejected',
};

/* Six realistic seed items, used only on first load when storage is empty.
   Once the user touches any item, their state becomes sticky. */
const now = new Date();
const iso = (offsetDays: number) =>
  new Date(now.getTime() + offsetDays * 86400000).toISOString();
const isoDate = (offsetDays: number) =>
  new Date(now.getTime() + offsetDays * 86400000).toISOString().slice(0, 10);

export const seedRegistryItems: RegistryItem[] = [
  {
    id: 'reg_seed_1',
    toolName: 'Customer support copilot',
    department: 'Customer Support',
    purpose:
      'Suggests responses and summarises ticket history for support agents handling tier-1 cases.',
    dataTypes: ['pii', 'internal'],
    approvalStatus: 'approved',
    riskLevel: 'medium',
    humanOversight: 'hitl',
    mitigations: [
      'Agent reviews every drafted reply before sending',
      'PII redaction in prompt logs',
      'Quarterly accuracy review',
    ],
    notes:
      'Vendor: third-party LLM. Prompts are scrubbed of customer identifiers before being sent.',
    reviewDate: isoDate(60),
    createdAt: iso(-90),
    updatedAt: iso(-12),
  },
  {
    id: 'reg_seed_2',
    toolName: 'Resume screener',
    department: 'HR',
    purpose:
      'Ranks inbound applications against role criteria to prioritise recruiter review.',
    dataTypes: ['pii', 'employee'],
    approvalStatus: 'under-review',
    riskLevel: 'high',
    humanOversight: 'hitl',
    mitigations: [
      'Recruiter reviews all top-N candidates manually',
      'Bias evaluation re-run quarterly',
      'No automated rejections',
    ],
    notes:
      'Currently in second review with Legal due to EU AI Act high-risk classification for employment use.',
    reviewDate: isoDate(14),
    createdAt: iso(-45),
    updatedAt: iso(-3),
  },
  {
    id: 'reg_seed_3',
    toolName: 'Sales email drafter',
    department: 'Sales',
    purpose:
      'Drafts outbound prospecting emails based on account research notes.',
    dataTypes: ['internal'],
    approvalStatus: 'approved',
    riskLevel: 'low',
    humanOversight: 'hotl',
    mitigations: ['SDR signs off before send', 'No customer PII in prompts'],
    notes: 'Internal only. Disclosure not required since output is reviewed before delivery.',
    reviewDate: isoDate(120),
    createdAt: iso(-60),
    updatedAt: iso(-25),
  },
  {
    id: 'reg_seed_4',
    toolName: 'Fraud detection model',
    department: 'Operations',
    purpose:
      'Real-time scoring of payment transactions to flag suspected fraud for review.',
    dataTypes: ['pii', 'financial'],
    approvalStatus: 'approved',
    riskLevel: 'high',
    humanOversight: 'hitl',
    mitigations: [
      'Fraud analyst reviews every blocked transaction',
      'Customer-facing appeal path',
      'Monthly drift monitoring',
      'Encryption at rest + in transit',
    ],
    notes:
      'Mission-critical. Owned by Operations with quarterly red-team exercises run by Security.',
    reviewDate: isoDate(30),
    createdAt: iso(-180),
    updatedAt: iso(-7),
  },
  {
    id: 'reg_seed_5',
    toolName: 'Marketing copy generator',
    department: 'Marketing',
    purpose:
      'Generates first drafts of social and ad copy from campaign briefs.',
    dataTypes: ['public', 'internal'],
    approvalStatus: 'approved',
    riskLevel: 'low',
    humanOversight: 'oot',
    mitigations: ['Brand-voice prompt template', 'Post-generation human review'],
    notes:
      'Output never auto-publishes; goes into a draft queue. Disclosure added in privacy notice.',
    reviewDate: null,
    createdAt: iso(-30),
    updatedAt: iso(-10),
  },
  {
    id: 'reg_seed_6',
    toolName: 'Internal coding assistant',
    department: 'Engineering',
    purpose: 'Inline code completion for engineers in the IDE.',
    dataTypes: ['internal'],
    approvalStatus: 'approved',
    riskLevel: 'low',
    humanOversight: 'oot',
    mitigations: [
      'Telemetry opt-out available',
      'No proprietary code sent to model providers (self-hosted)',
    ],
    notes: 'Self-hosted, audit logging enabled.',
    reviewDate: isoDate(180),
    createdAt: iso(-120),
    updatedAt: iso(-40),
  },
];
