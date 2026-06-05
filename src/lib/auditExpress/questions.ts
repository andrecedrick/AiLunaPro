/**
 * Audit Express tap questions — mirrors the public /audit-express page exactly,
 * so the in-app flow uses identical enums (deterministic engine inputs).
 */
export interface AxOption { value: string; label: string }
export interface AxQuestion { key: string; label: string; options: AxOption[] }

export const AX_QUESTIONS: AxQuestion[] = [
  {
    key: 'workflow',
    label: 'Which area would you most like to improve?',
    options: [
      { value: 'support', label: 'Customer support' },
      { value: 'sales', label: 'Sales' },
      { value: 'finance', label: 'Finance' },
      { value: 'documents', label: 'Documents' },
      { value: 'reporting', label: 'Reporting' },
      { value: 'admin', label: 'Admin' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'HR' },
    ],
  },
  {
    key: 'monthlyHours',
    label: 'Roughly how many hours per month go to repetitive work?',
    options: [
      { value: 'low', label: 'A little (~20)' },
      { value: 'medium', label: 'A fair amount (~80)' },
      { value: 'high', label: 'A lot (~160)' },
    ],
  },
  {
    key: 'hourlyCost',
    label: 'Approximate average hourly cost of that work?',
    options: [
      { value: 'low', label: 'Lower (~$25)' },
      { value: 'medium', label: 'Mid (~$45)' },
      { value: 'high', label: 'Higher (~$75)' },
    ],
  },
  {
    key: 'aiUsage',
    label: 'How is AI used in your organization today?',
    options: [
      { value: 'none', label: 'Not yet' },
      { value: 'individual', label: 'Individually' },
      { value: 'team', label: 'Across teams' },
      { value: 'structured', label: 'In structured workflows' },
    ],
  },
  {
    key: 'shadowAi',
    label: 'How much visibility do you have over AI tools in use?',
    options: [
      { value: 'no_visibility', label: 'None' },
      { value: 'partial_visibility', label: 'Some' },
      { value: 'mostly_visible', label: 'Most' },
      { value: 'full_inventory', label: 'Full inventory' },
    ],
  },
];
