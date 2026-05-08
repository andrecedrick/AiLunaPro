/**
 * Diagnostic Express questions — Phase K1A.
 *
 * Frontend-rendered. Identical schema mirrored in worker for server-side
 * scoring at worker/src/data/diagnostic-questions.ts. Keep both files in
 * sync until shared-data layer is added in a later phase.
 *
 * English only for K1A. i18n is a separate later phase.
 */

export interface DiagnosticOption {
  value: string;
  label: string;
  score: number;
}

export interface DiagnosticQuestion {
  id:       string;
  label:    string;
  weight:   number;
  options:  readonly DiagnosticOption[];
}

export const DIAGNOSTIC_QUESTIONS: readonly DiagnosticQuestion[] = [
  {
    id: 'ai_usage',
    label: 'How is AI currently used in your organization?',
    weight: 1,
    options: [
      { value: 'none',       label: 'We do not use AI yet',                   score: 0 },
      { value: 'individual', label: 'Some people use AI individually',        score: 1 },
      { value: 'team',       label: 'Several teams use AI tools',             score: 2 },
      { value: 'structured', label: 'AI is used in structured workflows',     score: 3 },
    ],
  },
  {
    id: 'process_automation',
    label: 'How much of your repetitive work is automated today?',
    weight: 1,
    options: [
      { value: 'none',     label: 'Almost nothing is automated',                 score: 0 },
      { value: 'basic',    label: 'A few simple tasks are automated',            score: 1 },
      { value: 'moderate', label: 'Some important workflows are automated',      score: 2 },
      { value: 'advanced', label: 'Automation is part of daily operations',      score: 3 },
    ],
  },
  {
    id: 'data_readiness',
    label: 'How ready is your business data for AI use?',
    weight: 1,
    options: [
      { value: 'scattered',     label: 'Data is scattered and hard to access',                   score: 0 },
      { value: 'partial',       label: 'Some data is organized',                                  score: 1 },
      { value: 'mostly_ready',  label: 'Most key data is structured',                            score: 2 },
      { value: 'ready',         label: 'Data is clean, accessible, and regularly updated',       score: 3 },
    ],
  },
  {
    id: 'compliance_awareness',
    label: 'How prepared are you for AI governance and compliance?',
    weight: 1,
    options: [
      { value: 'unknown',    label: 'We have not assessed AI risks yet',                          score: 0 },
      { value: 'basic',      label: 'We are aware of AI risks but have no process',               score: 1 },
      { value: 'documented', label: 'Some AI use cases are documented',                           score: 2 },
      { value: 'governed',   label: 'We have clear AI governance and review processes',           score: 3 },
    ],
  },
  {
    id: 'shadow_ai',
    label: 'Do you know which AI tools are used across the company?',
    weight: 1,
    options: [
      { value: 'no_visibility',      label: 'No, we do not have visibility',           score: 0 },
      { value: 'partial_visibility', label: 'We know some tools but not all',          score: 1 },
      { value: 'mostly_visible',     label: 'We track most AI tools',                  score: 2 },
      { value: 'full_inventory',     label: 'We maintain a clear AI tool inventory',   score: 3 },
    ],
  },
  {
    id: 'business_impact',
    label: 'How clearly do you measure the business impact of AI?',
    weight: 1,
    options: [
      { value: 'not_measured', label: 'We do not measure it yet',                  score: 0 },
      { value: 'qualitative',  label: 'We have qualitative feedback only',         score: 1 },
      { value: 'some_metrics', label: 'We track some time or cost savings',        score: 2 },
      { value: 'clear_roi',    label: 'We measure ROI and business outcomes',      score: 3 },
    ],
  },
  {
    id: 'team_skills',
    label: 'How confident are your teams in using AI responsibly?',
    weight: 1,
    options: [
      { value: 'low',    label: 'Very limited confidence',          score: 0 },
      { value: 'basic',  label: 'Basic familiarity',                score: 1 },
      { value: 'good',   label: 'Good confidence for common tasks', score: 2 },
      { value: 'strong', label: 'Strong responsible AI practices',  score: 3 },
    ],
  },
  {
    id: 'implementation_priority',
    label: 'What is your main AI priority right now?',
    weight: 0,
    options: [
      { value: 'save_time',         label: 'Save time on repetitive work',                 score: 0 },
      { value: 'improve_sales',     label: 'Improve sales or customer follow-up',          score: 0 },
      { value: 'support_customers', label: 'Improve customer support',                     score: 0 },
      { value: 'compliance',        label: 'Improve AI compliance and governance',         score: 0 },
      { value: 'documents',         label: 'Process documents and reports faster',         score: 0 },
    ],
  },
];
