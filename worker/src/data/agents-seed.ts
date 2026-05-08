/**
 * Initial AiLunaPro agent catalog seed — Phase K0.
 * 10 agents. All affiliate URLs anchored to aff=P60NPGHAAFGD.
 *
 * Seeded via POST /api/tokens/admin/seed (owner + TOKEN_DEBUG=true).
 * createdAt / updatedAt are filled at seed time.
 */

import type { AgentCatalogEntry } from '../lib/agents-shared';

type SeedEntry = Omit<AgentCatalogEntry, 'createdAt' | 'updatedAt'>;

export const AILUNAPRO_AGENT_SEED: readonly SeedEntry[] = [
  {
    agentId: 'support-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Support Agent',
    tagline: 'Automatise les réponses client et réduit le temps de support.',
    description:
      'Agent IA conçu pour répondre aux questions fréquentes, qualifier les demandes support, orienter les tickets et assister les équipes service client. Il aide les entreprises à structurer un premier niveau de support disponible en continu, sans remplacer les équipes humaines.',
    problemSolved:
      'Temps de réponse client élevé, demandes répétitives et surcharge du support.',
    fits: {
      industries: ['retail', 'services', 'saas', 'ecommerce', 'education'],
      companySize: ['solo', 'sme', 'enterprise'],
      budgetMin: 49,
    },
    integrations: ['website', 'email', 'crm', 'helpdesk'],
    expectedRoi: {
      timeSavedHoursPerMonth: 20,
      monthlyCostSaved: 800,
      paybackMonths: 1,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'starter',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'low',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'sales-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Sales Agent',
    tagline: 'Qualifie les prospects et prépare les relances commerciales.',
    description:
      'Agent IA orienté vente pour qualifier les leads, préparer les réponses commerciales, générer des relances et structurer les opportunités. Il aide les équipes commerciales à gagner du temps sur les tâches répétitives et à améliorer le suivi des prospects.',
    problemSolved:
      'Prospects mal qualifiés, relances oubliées et perte de temps commercial.',
    fits: {
      industries: ['services', 'saas', 'real-estate', 'consulting', 'b2b'],
      companySize: ['solo', 'sme', 'enterprise'],
      budgetMin: 79,
    },
    integrations: ['crm', 'email', 'calendar', 'website'],
    expectedRoi: {
      timeSavedHoursPerMonth: 25,
      monthlyCostSaved: 1200,
      paybackMonths: 1,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'starter',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'finance-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Finance Agent',
    tagline: 'Aide au traitement des factures, devis et relances.',
    description:
      'Agent IA conçu pour aider à classer les documents financiers, préparer les devis, suivre les factures, générer des relances et détecter des anomalies simples. Il ne remplace pas un expert-comptable, mais réduit fortement le temps administratif financier.',
    problemSolved:
      'Traitement manuel des factures, relances tardives et erreurs de saisie.',
    fits: {
      industries: ['services', 'construction', 'retail', 'consulting'],
      companySize: ['solo', 'sme'],
      budgetMin: 99,
    },
    integrations: ['accounting', 'email', 'documents', 'spreadsheet'],
    expectedRoi: {
      timeSavedHoursPerMonth: 30,
      monthlyCostSaved: 1500,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'professional',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'hr-agent',
    source: 'ailunapro',
    name: 'AiLunaPro HR Agent',
    tagline: 'Assists HR teams with screening, summaries, and documentation.',
    description:
      'AI agent designed to support repetitive HR tasks such as CV summaries, candidate notes, internal responses, employee documentation, and HR administrative follow-up. It helps teams structure information and reduce the time spent on manual document work.',
    problemSolved:
      'HR teams lose time on document screening, repetitive answers, and manual follow-up.',
    fits: {
      industries: ['services', 'healthcare', 'education', 'enterprise'],
      companySize: ['sme', 'enterprise'],
      budgetMin: 99,
    },
    integrations: ['documents', 'email', 'hris'],
    expectedRoi: {
      timeSavedHoursPerMonth: 20,
      monthlyCostSaved: 1000,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'professional',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'compliance-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Compliance Agent',
    tagline: 'Helps structure AI compliance, risks, and registries.',
    description:
      'AI agent designed to support compliance documentation, internal controls, AI registry preparation, and mitigation plans. It is especially useful for organizations exposed to governance, traceability, and AI compliance obligations.',
    problemSolved:
      'Organizations lack clear visibility on AI compliance, scattered documentation, and unmanaged AI risks.',
    fits: {
      industries: ['finance', 'healthcare', 'legal', 'enterprise', 'public-sector'],
      companySize: ['sme', 'enterprise'],
      budgetMin: 149,
    },
    integrations: ['documents', 'registry', 'compliance-tools'],
    expectedRoi: {
      timeSavedHoursPerMonth: 35,
      monthlyCostSaved: 2000,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'professional',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'high',
    badges: ['recommended-all-in-one', 'compliance'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'marketing-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Marketing Agent',
    tagline: 'Generates content, campaigns, and marketing ideas.',
    description:
      'AI agent designed to generate posts, emails, landing-page content, campaign ideas, summaries, and marketing assets adapted to the company profile. It helps small teams publish more consistently without multiplying tools.',
    problemSolved:
      'Marketing teams struggle with content consistency, time-consuming creation, and scattered campaign assets.',
    fits: {
      industries: ['retail', 'ecommerce', 'services', 'saas', 'creator'],
      companySize: ['solo', 'sme'],
      budgetMin: 49,
    },
    integrations: ['website', 'email', 'social-media'],
    expectedRoi: {
      timeSavedHoursPerMonth: 18,
      monthlyCostSaved: 700,
      paybackMonths: 1,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'starter',
    tokenUsageProfile: 'high',
    implementationComplexity: 'low',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'reporting-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Reporting Agent',
    tagline: 'Creates summaries, dashboards, and decision reports.',
    description:
      'AI agent designed to transform internal data and information into summaries, reports, action plans, and management-ready insights. It helps leaders and managers get a clearer view without spending hours consolidating information manually.',
    problemSolved:
      'Manual reports take too long to produce, and decision-makers lack concise summaries.',
    fits: {
      industries: ['services', 'saas', 'finance', 'enterprise'],
      companySize: ['sme', 'enterprise'],
      budgetMin: 99,
    },
    integrations: ['spreadsheet', 'crm', 'documents', 'dashboard'],
    expectedRoi: {
      timeSavedHoursPerMonth: 25,
      monthlyCostSaved: 1500,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'professional',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'audit-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Audit Agent',
    tagline: 'Supports AI audit, maturity assessment, and action plans.',
    description:
      'AI agent designed to help structure audits, analyze answers, identify risks, and produce actionable recommendations. It connects AI audit, compliance, and business transformation into a practical workflow.',
    problemSolved:
      'AI audits are time-consuming, manually analyzed, and difficult to prioritize.',
    fits: {
      industries: ['all'],
      companySize: ['sme', 'enterprise'],
      budgetMin: 99,
    },
    integrations: ['audit-ai', 'documents', 'registry'],
    expectedRoi: {
      timeSavedHoursPerMonth: 30,
      monthlyCostSaved: 1800,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'professional',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one', 'audit'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'document-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Document Agent',
    tagline: 'Classifies, summarizes, and extracts information from documents.',
    description:
      'AI agent designed to process documents, extract key information, generate summaries, and organize files. It is useful for organizations handling many attachments, contracts, reports, HR files, financial documents, or compliance evidence.',
    problemSolved:
      'Documents are poorly organized, slow to search, and expensive to summarize manually.',
    fits: {
      industries: ['legal', 'finance', 'healthcare', 'services', 'education'],
      companySize: ['solo', 'sme', 'enterprise'],
      budgetMin: 79,
    },
    integrations: ['documents', 'cloud-storage', 'email'],
    expectedRoi: {
      timeSavedHoursPerMonth: 28,
      monthlyCostSaved: 1400,
      paybackMonths: 2,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'starter',
    tokenUsageProfile: 'high',
    implementationComplexity: 'medium',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
  {
    agentId: 'admin-agent',
    source: 'ailunapro',
    name: 'AiLunaPro Admin Agent',
    tagline: 'Automates daily administrative work.',
    description:
      'General-purpose AI agent for emails, appointments, follow-ups, summaries, notes, task organization, and daily administrative workflows. It helps founders, independent professionals, and small teams save time on repetitive operational work.',
    problemSolved:
      'Administrative work takes too much time, tasks are repetitive, and organization is manual.',
    fits: {
      industries: ['all'],
      companySize: ['solo', 'sme'],
      budgetMin: 49,
    },
    integrations: ['email', 'calendar', 'documents'],
    expectedRoi: {
      timeSavedHoursPerMonth: 20,
      monthlyCostSaved: 900,
      paybackMonths: 1,
    },
    pricing: {
      model: 'subscription',
      stripeProductId: null,
      installPrice: null,
      monthlyPrice: null,
    },
    minPlan: 'starter',
    tokenUsageProfile: 'medium',
    implementationComplexity: 'low',
    badges: ['recommended-all-in-one'],
    affiliateUrl: 'https://dashboard.ailunapro.com/register?aff=P60NPGHAAFGD',
    status: 'active',
    schemaVersion: 1,
  },
];
