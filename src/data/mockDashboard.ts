/**
 * Mock data for the AiLunaPro dashboard (Phase 2 — UI only).
 * Replace with real Firestore queries in Phase 3+.
 */

export const mockOrg = {
  name: 'Acme Corp',
  plan: 'Professional' as const,
  initials: 'AC',
};

export const mockUser = {
  displayName: 'Sophie Martin',
  role: 'Admin',
  initials: 'SM',
};

export const mockKPIs = [
  {
    id: 'audits',
    label: 'Audits Conducted',
    value: 3,
    trend: +1,
    trendLabel: '+1 this month',
    icon: 'audit',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 'findings',
    label: 'Findings Identified',
    value: 11,
    trend: -3,
    trendLabel: '−3 resolved',
    icon: 'finding',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    id: 'tools',
    label: 'AI Tools Registered',
    value: 14,
    trend: +2,
    trendLabel: '+2 this month',
    icon: 'tool',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    id: 'automation',
    label: 'Automation Opportunities',
    value: 8,
    trend: +8,
    trendLabel: 'identified',
    icon: 'automation',
    color: '#10B981',
    bg: '#D1FAE5',
  },
];

export const mockScoreTrend = [
  { month: 'Jul', score: 42 },
  { month: 'Aug', score: 48 },
  { month: 'Sep', score: 45 },
  { month: 'Oct', score: 54 },
  { month: 'Nov', score: 59 },
  { month: 'Dec', score: 56 },
  { month: 'Jan', score: 63 },
  { month: 'Feb', score: 67 },
  { month: 'Mar', score: 65 },
  { month: 'Apr', score: 73 },
];

export const mockAudits = [
  {
    id: 'a1',
    name: 'Customer Analytics AI',
    date: 'Apr 15, 2025',
    score: 78,
    risk: 'medium' as const,
    status: 'completed' as const,
  },
  {
    id: 'a2',
    name: 'HR Screening Tool',
    date: 'Apr 10, 2025',
    score: 54,
    risk: 'high' as const,
    status: 'in_progress' as const,
  },
  {
    id: 'a3',
    name: 'Fraud Detection Model',
    date: 'Apr 3, 2025',
    score: 91,
    risk: 'low' as const,
    status: 'completed' as const,
  },
  {
    id: 'a4',
    name: 'Recommendation Engine',
    date: 'Mar 28, 2025',
    score: 67,
    risk: 'medium' as const,
    status: 'completed' as const,
  },
];

export const mockPriorityActions = [
  {
    id: 'p1',
    title: 'Complete Data Governance documentation',
    effort: 'medium' as const,
    badge: 'Due this week',
    color: '#EF4444',
  },
  {
    id: 'p2',
    title: 'Review Human Oversight protocols for HR Tool',
    effort: 'high' as const,
    badge: 'High priority',
    color: '#F59E0B',
  },
  {
    id: 'p3',
    title: 'Update AI inventory with 2 new tools',
    effort: 'low' as const,
    badge: 'Quick win',
    color: '#10B981',
  },
  {
    id: 'p4',
    title: 'Schedule quarterly compliance review',
    effort: 'low' as const,
    badge: 'Recurring',
    color: '#3B82F6',
  },
];

export const mockAutomation = [
  {
    id: 'au1',
    title: 'Auto-generate compliance reports',
    effort: 'low' as const,
    saving: 'Save 4h/week',
    icon: '📄',
  },
  {
    id: 'au2',
    title: 'AI risk scoring pipeline',
    effort: 'medium' as const,
    saving: 'Save 6h/audit',
    icon: '⚡',
  },
  {
    id: 'au3',
    title: 'Automated data lineage tracking',
    effort: 'high' as const,
    saving: 'Reduce risk 30%',
    icon: '🔗',
  },
  {
    id: 'au4',
    title: 'Policy update notifications',
    effort: 'low' as const,
    saving: 'Stay compliant',
    icon: '🔔',
  },
  {
    id: 'au5',
    title: 'Vendor assessment automation',
    effort: 'medium' as const,
    saving: 'Save 3h/vendor',
    icon: '🤝',
  },
];

export const mockBusinessImpact = [
  { id: 'bi1', label: 'Risk Reduction', value: '40%', sub: 'vs. last quarter', color: '#10B981' },
  { id: 'bi2', label: 'Governance Score', value: '73', sub: 'out of 100', color: '#7C3AED' },
  { id: 'bi3', label: 'Time Saved', value: '12h', sub: 'per week', color: '#3B82F6' },
  { id: 'bi4', label: 'Tools Standardised', value: '3', sub: 'this quarter', color: '#F59E0B' },
];

export const mockReports = [
  {
    id: 'r1',
    title: 'Q1 2025 AI Compliance Report',
    date: 'Apr 15, 2025',
    status: 'published' as const,
    score: 73,
    risk: 'medium' as const,
  },
  {
    id: 'r2',
    title: 'HR Tool Risk Assessment',
    date: 'Apr 10, 2025',
    status: 'draft' as const,
    score: 54,
    risk: 'high' as const,
  },
  {
    id: 'r3',
    title: 'Fraud Detection Model Audit',
    date: 'Apr 3, 2025',
    status: 'published' as const,
    score: 91,
    risk: 'low' as const,
  },
];

export const mockNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
  { id: 'new-audit', label: 'New Audit', icon: 'plus', active: false },
  { id: 'reports', label: 'Reports', icon: 'reports', active: false },
  { id: 'audit-history', label: 'Audit history', icon: 'reports', active: false },
  { id: 'audit-express-saved', label: 'Saved Audits', icon: 'reports', active: false },
  { id: 'registry', label: 'AI Registry', icon: 'registry', active: false },
  { id: 'agents', label: 'Agents', icon: 'agents', active: false },
  { id: 'team', label: 'Team', icon: 'team', active: false },
  { id: 'settings', label: 'Settings', icon: 'settings', active: false },
  { id: 'billing', label: 'Billing', icon: 'billing', active: false },
  { id: 'help', label: 'Help', icon: 'help', active: false },
];
