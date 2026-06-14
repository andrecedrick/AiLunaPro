/**
 * B6.0 — i18n foundation: canonical English dictionary.
 *
 * This module defines the SHAPE of the translation catalog: `Dict = typeof en`.
 * Every other locale is typed `: Dict`, so the TypeScript build gate
 * (`tsc -b --force`) FAILS if a locale is missing a key — completeness is
 * enforced at compile time, no runtime key-checking needed.
 *
 * English is also the permanent FALLBACK: it is bundled synchronously and
 * shown for any locale that fails to load (graceful degradation, §19.B6 (c)).
 *
 * SCOPE (B6.0): neutral UI chrome only — navigation, the app shell, and the
 * Preferences page. NO disclaimer / regulatory / audit copy lives here; that
 * is deferred to later batches that carry the mandatory human-review gate
 * (§9.24). Keep this catalog free of legal phrasing.
 */
export const en = {
  /** Primary sidebar navigation labels, keyed by nav-item id (mockNavItems). */
  nav: {
    dashboard:             'Dashboard',
    'new-audit':           'New Audit',
    reports:               'Reports',
    'audit-history':       'Audit history',
    'audit-express-run':   'Run Audit Express',
    'audit-express-saved': 'Saved Audits',
    registry:              'AI Registry',
    'system-builder':      'System Builder',
    agents:                'Agents',
    team:                  'Team',
    settings:              'Settings',
    billing:               'Billing',
    help:                  'Help',
  },
  /** App-shell chrome (sidebar header, org switcher, sign-out, pref widget). */
  shell: {
    complianceSuite:  'Compliance Suite',
    signOut:          'Sign out',
    workspaces:       'Workspaces',
    createWorkspace:  'Create workspace',
    searchWorkspaces: 'Search workspaces…',
    language:         'Language',
    currency:         'Currency',
  },
  /** Settings → Preferences page. */
  settings: {
    title:               'Preferences',
    themeTitle:          'Theme',
    themeHint:           'Choose how AiLunaPro looks. Applies immediately.',
    light:               'Light',
    dark:                'Dark',
    languageTitle:       'Language',
    languageHint:        'Used for UI labels and emails. Translation is rolling out section by section; untranslated areas stay in English.',
    currencyTitle:       'Default currency',
    currencyHint:        'Display preference only. Billing and token packs remain in USD.',
    profileTitle:        'Profile',
    profileHint:         'Tunes the tone of guidance and the recommended starting resource. Never changes scoring, findings, or any regulatory mapping.',
    notificationsTitle:  'Email notifications',
    notificationsHint:   'Choose which emails you receive. Sender setup arrives in a later phase.',
    weeklyDigest:        'Weekly compliance digest',
    weeklyDigestDesc:    'Summary of new findings and resolved actions every Monday.',
    reportReady:         'Report ready',
    reportReadyDesc:     'Email me when a report I requested is generated.',
    teamActivity:        'Team activity',
    teamActivityDesc:    'Invitations, role changes, and member removals in my workspaces.',
    langToast:           'Language: {value}',
    currencyToast:       'Currency: {value}',
    profileToast:        'Profile: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Audit sections",
      "questionCount": "{n} questions",
      "yes": "Yes",
      "no": "No"
    },
    "section": {
      "profile": {
        "title": "Profile",
        "subtitle": "Your organization at a glance"
      },
      "ai-tools": {
        "title": "AI Tools",
        "subtitle": "What AI does your organization actually use?"
      },
      "data": {
        "title": "Data",
        "subtitle": "What data feeds your AI systems?"
      },
      "governance": {
        "title": "Governance",
        "subtitle": "Policies, ownership, and accountability"
      },
      "security": {
        "title": "Security",
        "subtitle": "Protecting AI systems and their data"
      },
      "transparency": {
        "title": "Transparency",
        "subtitle": "Disclosure and explainability"
      },
      "human-oversight": {
        "title": "Human Oversight",
        "subtitle": "Keeping humans in control"
      },
      "training-maturity": {
        "title": "Training & Maturity",
        "subtitle": "How AI-literate is your organization?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Organization name",
        "placeholder": "e.g. Acme Corp"
      },
      "profile.industry": {
        "label": "Primary industry"
      },
      "profile.size": {
        "label": "Company size"
      },
      "profile.region": {
        "label": "Primary region of operation"
      },
      "tools.categories": {
        "label": "Which AI categories are in production?",
        "helper": "Select all that apply."
      },
      "tools.vendors": {
        "label": "Primary AI vendors / products",
        "placeholder": "e.g. OpenAI GPT-4, Anthropic Claude, in-house model on AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Deployment scope"
      },
      "tools.builds_custom": {
        "label": "Do you train or fine-tune your own models?"
      },
      "data.types": {
        "label": "What types of data are processed by AI?"
      },
      "data.residency": {
        "label": "Where is the data primarily stored?"
      },
      "data.governance_framework": {
        "label": "Is there a documented data governance framework in place?"
      },
      "data.sources": {
        "label": "Describe your main data sources",
        "placeholder": "e.g. CRM, product telemetry, customer support tickets, third-party datasets…"
      },
      "gov.committee": {
        "label": "Do you have an AI governance committee or designated owner?"
      },
      "gov.written_policy": {
        "label": "Is there a written AI policy approved by leadership?"
      },
      "gov.frameworks": {
        "label": "Which frameworks do you align with?"
      },
      "gov.structure": {
        "label": "Describe your governance structure",
        "placeholder": "Who owns AI risk? How are decisions escalated?"
      },
      "sec.controls": {
        "label": "Which security controls are in place for AI systems?"
      },
      "sec.red_team": {
        "label": "Have your AI systems been red-teamed or adversarially tested?"
      },
      "sec.incident_readiness": {
        "label": "How prepared are you for an AI-specific incident?"
      },
      "sec.review_process": {
        "label": "Describe your security review process for new AI systems"
      },
      "trans.disclosure": {
        "label": "Do you disclose AI use to end-users when they interact with it?"
      },
      "trans.cards": {
        "label": "Do you maintain model cards or system cards?"
      },
      "trans.explainability": {
        "label": "How explainable are your AI decisions to affected users?"
      },
      "trans.measures": {
        "label": "Describe your transparency measures",
        "placeholder": "Public AI register, in-app disclosures, audit logs available to users…"
      },
      "over.model": {
        "label": "Which oversight model best describes your setup?"
      },
      "over.escalation": {
        "label": "Are escalation procedures documented for AI errors or harms?"
      },
      "over.review_categories": {
        "label": "Which decision categories require mandatory human review?"
      },
      "over.processes": {
        "label": "Describe your oversight processes in your own words"
      },
      "train.staff_training": {
        "label": "Do you provide AI literacy training to staff?"
      },
      "train.maturity": {
        "label": "Self-assessed AI compliance maturity"
      },
      "train.topics": {
        "label": "Which topics are covered in your training?"
      },
      "train.program": {
        "label": "Describe your training program (or what is missing)"
      }
    },
    "option": {
      "profile.industry.finance": "Finance & Banking",
      "profile.industry.health": "Healthcare & Life Sciences",
      "profile.industry.tech": "Technology / SaaS",
      "profile.industry.retail": "Retail & E-commerce",
      "profile.industry.public": "Public sector",
      "profile.industry.other": "Other",
      "profile.size.xs": "1–10 employees",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "European Union",
      "profile.region.uk": "United Kingdom",
      "profile.region.us": "United States",
      "profile.region.ca": "Canada",
      "profile.region.apac": "Asia-Pacific",
      "profile.region.global": "Global / multi-region",
      "tools.categories.llm": "Large Language Models (chat, agents, copilots)",
      "tools.categories.ml": "Classical ML / predictive models",
      "tools.categories.cv": "Computer vision",
      "tools.categories.speech": "Speech & audio",
      "tools.categories.rec": "Recommendation systems",
      "tools.categories.rpa": "RPA / automation with AI components",
      "tools.scope.pilot": "Pilots / experiments only",
      "tools.scope.internal": "Internal staff-facing use",
      "tools.scope.customer": "Customer-facing features",
      "tools.scope.critical": "Mission-critical / regulated decisions",
      "data.types.pii": "Personal data (PII)",
      "data.types.health": "Health data",
      "data.types.financial": "Financial / transactional data",
      "data.types.biometric": "Biometric data",
      "data.types.children": "Data on minors",
      "data.types.public": "Public / open data",
      "data.residency.eu": "EU / EEA",
      "data.residency.us": "United States",
      "data.residency.mixed": "Mixed / multi-region",
      "data.residency.unknown": "Not sure",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "None formally",
      "sec.controls.encryption": "Encryption at rest + in transit",
      "sec.controls.rbac": "Role-based access control",
      "sec.controls.audit_logs": "Audit logging of model access & inputs",
      "sec.controls.secrets": "Secrets management (no hardcoded keys)",
      "sec.controls.isolation": "Tenant / data isolation",
      "sec.incident_readiness.1": "1 — No plan",
      "sec.incident_readiness.2": "2 — Informal plan",
      "sec.incident_readiness.3": "3 — Documented but untested",
      "sec.incident_readiness.4": "4 — Documented and rehearsed",
      "sec.incident_readiness.5": "5 — Continuous, integrated with SOC",
      "trans.explainability.none": "No explanations provided",
      "trans.explainability.generic": "Generic disclosures only",
      "trans.explainability.category": "Category-level reasons",
      "trans.explainability.individual": "Per-decision explanations on request",
      "trans.explainability.realtime": "Real-time, in-product explanations",
      "over.model.hitl": "Human-in-the-loop (every decision reviewed)",
      "over.model.hotl": "Human-on-the-loop (sampled review)",
      "over.model.oot": "Human-out-of-the-loop (autonomous)",
      "over.review_categories.hr": "Hiring / HR decisions",
      "over.review_categories.credit": "Credit / financial decisions",
      "over.review_categories.health": "Health-related recommendations",
      "over.review_categories.content": "Content moderation outcomes",
      "over.review_categories.legal": "Legal / compliance decisions",
      "train.maturity.1": "1 — Initial / ad hoc",
      "train.maturity.2": "2 — Developing",
      "train.maturity.3": "3 — Defined",
      "train.maturity.4": "4 — Managed",
      "train.maturity.5": "5 — Optimized",
      "train.topics.bias": "Bias & fairness",
      "train.topics.privacy": "Privacy & data protection",
      "train.topics.security": "AI security & misuse",
      "train.topics.usage": "Acceptable use policies",
      "train.topics.incident": "Incident response"
    }
  },
  results: {
    "insightCard": {
      "whatThisMeans": "What this means",
      "whyItMatters": "Why it matters",
      "howItPlaysOut": "How it plays out",
      "exampleHeading": "Example — how a similar business benefits",
      "illustrative": "(Illustrative.)",
      "doThisNext": "Do this next",
      "doThisNextWithHeading": "Do this next — {heading}",
      "onceDone": "Once done: {outcome}",
      "referencesPrefix": "References: {refs}"
    },
    "explained": {
      "heading": "What your results mean",
      "subtitle": "Each item below explains what we found, why it matters, and the fastest next step — with the score points you can recover.",
      "emptyTitle": "No gaps triggered — strong foundation",
      "emptyWhatItMeans": "Your answers didn’t trigger any findings — your AI practice already covers the basics we check.",
      "emptyWhyItMatters": "That’s a solid base. The next gains come from operating these controls consistently and at scale.",
      "emptyFlowInput": "good practices",
      "emptyFlowProcess": "make them routine",
      "emptyFlowOutput": "consistent controls",
      "emptyFlowGain": "durable, scalable trust",
      "emptyExample": "Teams here move from “we do this” to “this runs by itself” — automating the manual parts. (Illustrative.)",
      "emptyDoNextHeading": "Scale it",
      "emptyDoNextStep1": "Automate the controls you run by hand today.",
      "emptyDoNextStep2": "Re-audit periodically to hold the line.",
      "ctaSeeAgentsForThis": "See agents that can do this",
      "ctaSeeRecommendedAgents": "See recommended agents",
      "ctaOpenDesignGuide": "Open the design guide",
      "ptsToRecover": "−{n} pts to recover",
      "priorityCritical": "Priority: Critical",
      "priorityHigh": "Priority: High",
      "priorityMedium": "Priority: Medium",
      "priorityLow": "Priority: Low",
      "effortBadge": "Effort: {effort}",
      "effortBadgeDefault": "Effort: medium",
      "timeframeBadge": "~{days} days",
      "timeframeBadgeDefault": "~30 days"
    },
    "findings": {
      "title": "Findings",
      "total": "{n} total",
      "empty": "✓ No findings triggered. Keep building maturity through the recommendations on the right.",
      "severityCritical": "Critical",
      "severityHigh": "High",
      "severityMedium": "Medium",
      "severityLow": "Low",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} recommendation{plural}"
    },
    "recommendations": {
      "title": "Recommendations",
      "actionsCount": "{n} actions",
      "starterResource": "Recommended starter resource",
      "empty": "No actionable recommendations at this time.",
      "impactCritical": "Critical impact",
      "impactHigh": "High impact",
      "impactMedium": "Medium impact",
      "impactLow": "Low impact",
      "timeframeDays": "{n}d",
      "addressesFindings": "addresses {count} finding{plural}"
    },
    "actionPlan": {
      "title": "Prioritized Action Plan",
      "roadmapNote": "Roadmap shows when to ship; Action Plan shows what to fix first.",
      "bandCriticalTitle": "Critical",
      "bandImportantTitle": "Important",
      "bandImportantSubtitle": "Short-term — address in the current quarter.",
      "bandImprovementTitle": "Improvement",
      "bandImprovementSubtitle": "Best practice — schedule for maturity.",
      "itemCount": "{n} item{plural}",
      "bandEmpty": "No items in this band — nothing actionable here for now.",
      "moreNotShown": "+{n} more not shown",
      "impactPill": "Impact",
      "effortPill": "Effort",
      "expectedOutcome": "Expected outcome —"
    }
  },
} as const;

/** Deep map of the catalog shape to plain `string` leaves. Locales are typed
 *  `: Dict`, so the compiler enforces the EXACT nested key set of `en` (every
 *  namespace, every key) while allowing each locale its own string values. */
type DeepString<T> = { -readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dict = DeepString<typeof en>;
