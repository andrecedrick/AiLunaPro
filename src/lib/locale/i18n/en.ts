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
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Which area would you most like to improve?",
          "opt": {
            "support": "Customer support",
            "sales": "Sales",
            "finance": "Finance",
            "documents": "Documents",
            "reporting": "Reporting",
            "admin": "Admin",
            "compliance": "Compliance",
            "marketing": "Marketing",
            "hr": "HR"
          }
        },
        "monthlyHours": {
          "label": "Roughly how many hours per month go to repetitive work?",
          "opt": {
            "low": "A little (~20)",
            "medium": "A fair amount (~80)",
            "high": "A lot (~160)"
          }
        },
        "hourlyCost": {
          "label": "Approximate average hourly cost of that work?",
          "opt": {
            "low": "Lower (~$25)",
            "medium": "Mid (~$45)",
            "high": "Higher (~$75)"
          }
        },
        "aiUsage": {
          "label": "How is AI used in your organization today?",
          "opt": {
            "none": "Not yet",
            "individual": "Individually",
            "team": "Across teams",
            "structured": "In structured workflows"
          }
        },
        "shadowAi": {
          "label": "How much visibility do you have over AI tools in use?",
          "opt": {
            "no_visibility": "None",
            "partial_visibility": "Some",
            "mostly_visible": "Most",
            "full_inventory": "Full inventory"
          }
        }
      },
      "run": {
        "title": "Run Audit Express",
        "subtitle": "A fast, estimate-only AI readiness snapshot — saved automatically to your workspace.",
        "errPreviewCode": "Could not run the preview ({code}).",
        "errPreview": "Could not run the preview.",
        "errAnalysisCode": "Analysis unavailable ({code}).",
        "errAnalysis": "Analysis unavailable. Please try again.",
        "errDocCode": "Document analysis unavailable ({code}).",
        "errDoc": "Document analysis unavailable. Please try again.",
        "analyzeSiteTitle": "Analyze a public website (optional)",
        "analyzeSiteHint": "Reads only public pages, respects robots.txt. Enriches “What this business does”.",
        "deepScan": "Deep scan (slower, more pages)",
        "saving": "Saving your result…",
        "journeyHeadline": "Here is what your snapshot means",
        "journeyReadiness": "AI readiness: {bucket} ({score}/100).",
        "journeyTimeSaved": "Estimated time saved ≈ {hours} hours/month.",
        "journeyCostSaved": "Estimated cost saved ≈ ${amount}/month."
      },
      "cta": {
        "computing": "Computing…",
        "getPreview": "Get preview",
        "analyzing": "Analyzing…",
        "analyzeSite": "Analyze site",
        "preparing": "Preparing…",
        "downloadPdf": "Download PDF",
        "viewSaved": "View Saved Audits",
        "seeAgents": "See agents matched to your audit →",
        "runFullAudit": "Run a full audit",
        "extracting": "Extracting…",
        "analyzeDocument": "Analyze document →",
        "save": "Save",
        "cancel": "Cancel"
      },
      "result": {
        "snapshotHeading": "Your snapshot · AI readiness: {bucket} ({score}/100)",
        "whatThisMeans": "What this means",
        "opportunityLabel": "The opportunity — indicative ranges",
        "timeBack": "Time back",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Cost impact",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Payback",
        "howSavingLabel": "How the saving happens",
        "flowRepetitive": "repetitive tasks",
        "flowAssisted": "assisted / automated",
        "flowSameWork": "same work, less manual time",
        "flowHoursBack": "hours back to higher-value work",
        "roiUnavailable": "ROI estimate unavailable for this audit.",
        "whatToDoFirst": "What to do first",
        "step1": "Pick one high-volume task (support replies, invoice entry, reporting).",
        "step2": "Pilot one assistant on it for ~2 weeks.",
        "step3": "Measure hours before/after — keep what pays back.",
        "businessHeading": "What this business does",
        "businessType": "Type:",
        "businessAudience": "Audience:",
        "businessConfidence": "confidence {confidence}",
        "businessUnknown": "unknown",
        "offers": "Offers: {list}",
        "automationHeading": "Automation opportunities",
        "opportunityItem": "{title} — {impact} impact / {effort} effort"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Score Trend",
      "subtitle": "AI maturity score over time",
      "empty": {
        "title": "Trends appear after multiple audits",
        "hint": "Once you've submitted several audits in this workspace, your AI maturity score will be charted here from your real history."
      }
    },
    "automation": {
      "title": "Automation Opportunities",
      "subtitle": "Tailored to your AI usage",
      "empty": {
        "title": "Run an audit to get tailored opportunities",
        "hint": "Automation opportunities are derived from your audit answers and AI registry. Complete an audit and add your AI tools to see suggestions here."
      }
    },
    "businessImpact": {
      "title": "Business Impact",
      "subtitle": "Measured outcomes from your compliance programme",
      "empty": {
        "title": "Impact metrics appear as your programme matures",
        "hint": "Run audits over time to build a track record. Risk reduction, governance progress, and time saved will be computed from your real history — no estimates."
      }
    },
    "recentReports": {
      "title": "Recent Reports",
      "countOne": "{n} report generated",
      "countOther": "{n} reports generated",
      "viewAll": "View all →",
      "empty": {
        "title": "No reports yet",
        "hint": "Generate a report from a submitted audit — it appears here and under Reports for this workspace."
      }
    },
    "kpi": {
      "auditsSubmitted": "Audits submitted",
      "reportsGenerated": "Reports generated",
      "aiToolsRegistered": "AI tools registered",
      "loadErrorSuffix": " — couldn't load"
    },
    "maturity": {
      "rung": {
        "initial": "Initial",
        "managed": "Managed",
        "defined": "Defined",
        "advanced": "Advanced",
        "optimal": "Optimal"
      }
    },
    "cta": {
      "poweredBy": "Powered by Luna AI",
      "scheduleDemo": "Schedule Demo",
      "startFreeTrial": "Start Free Trial →"
    }
  },
  topbar: {
    "title": {
      "dashboard": "Dashboard",
      "audit/new": "New Audit",
      "audit/result": "Audit Result",
      "audit/assistance": "Implementation Guide",
      "audit/history": "Audit history",
      "reports": "Reports",
      "reports/detail": "Report",
      "reports/share": "Shared Report",
      "registry": "AI Registry",
      "system-builder": "System Builder",
      "agents": "Agents",
      "agents/detail": "Agent",
      "team": "Team",
      "settings": "Settings",
      "billing": "Billing",
      "billing/tokens": "Tokens",
      "help": "Help",
      "audit-express/run": "Run Audit Express",
      "audit-express/saved": "Saved Audits",
      "audit-express/detail": "Saved Audit"
    },
    "subtitle": {
      "dashboard": "AI Compliance Overview"
    },
    "search": {
      "placeholder": "Search audits, reports…",
      "toast": "Searching for \"{query}\"…"
    },
    "dateRange": {
      "last7": "Last 7 days",
      "last30": "Last 30 days",
      "thisMonth": "This month",
      "lastMonth": "Last month",
      "customRange": "Custom range…",
      "from": "From",
      "to": "To",
      "apply": "Apply range",
      "toast": "Date range: {label}",
      "errPickBoth": "Pick a from and to date.",
      "errOrder": "From date must be before To date."
    },
    "notifications": {
      "label": "Notifications",
      "title": "Notifications",
      "empty": "No notifications yet."
    },
    "tokens": {
      "aria": "{n} tokens left — manage tokens",
      "title": "{n} tokens left · click to manage",
      "balance": "{used} / {total}",
      "corruptTitle": "Token balance contains invalid data — click to repair",
      "corruptLabel": "Tokens need repair"
    },
    "luna": {
      "aria": "Open Luna, your guide",
      "title": "Luna — your guide",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Switch to dark mode",
      "toLight": "Switch to light mode"
    },
    "newAudit": {
      "label": "New Audit",
      "denied": "Your role doesn't allow creating audits. Audits are for Owner, Admin, and Member."
    },
    "sidebar": {
      "openMenu": "Open navigation menu",
      "closeMenu": "Close navigation menu",
      "menu": "Menu",
      "expand": "Expand sidebar",
      "collapse": "Collapse sidebar"
    }
  },
  auditForm: {
    "title": "New Audit",
    "subtitle": "Walk through 8 sections to assess your AI compliance posture. Your progress is saved as you go — you can leave and come back anytime.",
    "loading": "Loading audit…",
    "forbiddenTitle": "Your role doesn't allow creating audits",
    "forbiddenBody": "Audits are available to Owner, Admin, and Member roles. Ask a workspace owner or admin if you need audit access.",
    "errorLoad": "Failed to load audit. Refresh to retry.",
    "pageTitle": "New Audit",
    "pageIntro": "Walk through 8 sections to assess your AI compliance posture. Your progress is saved as you go — you can leave and come back anytime.",
    "stepOf": "Step {current} of {total}",
    "overallProgress": "Overall progress",
    "previous": "← Previous",
    "saveDraft": "Save draft",
    "saveContinue": "Save & Continue →",
    "submit": "Submit Audit ✓",
    "saved": "✓ Saved"
  },
  settingsPages: {
    "shell": {
      "title": "Settings",
      "subtitle": "Manage your profile, organization, and preferences."
    },
    "tabs": {
      "profile": "Profile",
      "org": "Organization",
      "preferences": "Preferences",
      "billing": "Billing"
    },
    "profile": {
      "sectionTitle": "Profile",
      "avatarHint": "Avatar is generated from your initials. Custom upload coming later.",
      "displayName": "Display name",
      "displayNamePlaceholder": "Your full name",
      "email": "Email",
      "emailPlaceholder": "you@example.com",
      "emailVerificationTitle": "Email verification",
      "emailVerified": "✓ Your email is verified.",
      "sendVerification": "Send verification email",
      "sendingVerification": "Sending…",
      "passwordTitle": "Password",
      "passwordHint": "We will send a reset link to your email. The link expires after one hour.",
      "sendPasswordReset": "Send password reset email",
      "sendingReset": "Sending…",
      "savedToast": "Profile updated."
    },
    "org": {
      "sectionTitle": "Organization",
      "fallbackName": "Workspace",
      "nameLabel": "Organization name",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Only the workspace owner can rename or delete the organization.",
      "planTitle": "Plan",
      "dangerZoneTitle": "Danger zone",
      "dangerZoneHint": "Deleting an organization removes all of its data: audits, reports, registry, and team members. This action cannot be undone.",
      "deleteButton": "Delete organization…",
      "deleteDialogTitle": "Delete \"{name}\"?",
      "deleteDialogBody1": "This will permanently remove the organization, all its audits, reports, registry items, and team memberships.",
      "deleteDialogBody2": "You will be asked to confirm one more time before any data is touched.",
      "deleteConfirmLabel": "I understand, continue",
      "renamedToast": "Organization renamed.",
      "deletionDeferredToast": "Organization deletion will be enabled in a later backend step."
    },
    "billing": {
      "sectionTitle": "Billing",
      "checkingAccess": "Checking access…"
    }
  },
  common: {
    "saveChanges": "Save changes",
    "saving": "Saving…",
    "cancel": "Cancel",
    "loading": "Loading…",
    "save": "Save",
    "confirm": "Confirm",
    "close": "Close",
    "tryAgain": "Try again",
    "reloadPage": "Reload page",
    "retryNow": "Retry now",
    "reload": "Reload",
    "somethingWentWrong": "Something went wrong",
    "couldntLoadThePage": "Couldn’t load the page",
    "stillConnecting": "Still connecting…"
  },
  journey: {
    "label": {
      "choice": "Choose",
      "audit": "Audit",
      "understanding": "Understand",
      "adoption": "Adopt"
    },
    "hint": {
      "choice": "Choose how to start — Audit Express for a quick snapshot, or a New Audit for depth.",
      "audit": "Complete your audit — we'll explain what it means and what to do next.",
      "understanding": "Here's what your audit means. Review the insights, then pick a next step."
    },
    "progress": {
      "ariaLabel": "Guided journey progress"
    },
    "chooseAuditType": "Choose audit type →",
    "dismissAriaLabel": "Dismiss guided journey",
    "dismiss": "Dismiss",
    "next": {
      "whatNext": "What would you like to do next?",
      "recommendedTag": "Recommended",
      "backToDashboard": "Back to dashboard",
      "cta": {
        "agents": {
          "title": "See recommended agents",
          "body": "Tools matched to your audit that can save time on the work you flagged."
        },
        "billing": {
          "title": "Explore membership",
          "body": "Plans, tokens, and what's included — adopt at your own pace."
        },
        "systemBuilder": {
          "title": "Open System Builder",
          "body": "A read-only guide to design your AI system across six dimensions."
        }
      }
    },
    "start": {
      "greetingTitle": "Hi, I'm Luna — let's get you started.",
      "greetingBody": "Pick how you'd like to begin. You can switch anytime, and you can always go straight to your dashboard.",
      "heading": "How do you want to start?",
      "express": {
        "title": "Audit Express",
        "body": "A fast, ~5-minute AI-readiness snapshot — a few quick questions, an optional website analysis, indicative ROI. Best for a first look.",
        "cta": "Start Audit Express →"
      },
      "full": {
        "title": "New Audit (full)",
        "body": "The complete structured questionnaire — deeper compliance + maturity scoring you can turn into a shareable report. Best for a thorough assessment.",
        "cta": "Create a New Audit →"
      },
      "skip": "Skip — go straight to my dashboard"
    }
  },
  auth: {
    "login": {
      "title": "Sign in",
      "subtitle": "Welcome back to AiLunaPro",
      "forgotPassword": "Forgot password?",
      "signingIn": "Signing in…",
      "signInButton": "Sign in",
      "noAccountPrompt": "Don't have an account?",
      "signUpLink": "Sign up"
    },
    "field": {
      "emailAddress": "Email address",
      "password": "Password",
      "fullName": "Full name",
      "workEmail": "Work email"
    },
    "placeholder": {
      "email": "you@company.com",
      "fullName": "Sophie Martin"
    },
    "signup": {
      "title": "Create your account",
      "subtitle": "Start your AI compliance journey",
      "passwordHint": "Minimum 8 characters",
      "creatingAccount": "Creating account…",
      "createAccountButton": "Create account",
      "haveAccountPrompt": "Already have an account?",
      "signInLink": "Sign in"
    },
    "forgot": {
      "title": "Reset password",
      "subtitleSent": "Check your inbox for a reset link.",
      "subtitle": "Enter your email and we'll send you a reset link.",
      "sentDetail": "Check your spam folder if it doesn't arrive.",
      "backToSignIn": "← Back to sign in",
      "sending": "Sending…",
      "sendResetLink": "Send reset link",
      "rememberPrompt": "Remember your password?",
      "signInLink": "Sign in"
    },
    "invite": {
      "titleParsing": "Reading invitation…",
      "titleAuthRequired": "Sign in to accept",
      "titleVerifying": "Verifying invitation…",
      "titleAccepting": "Adding you to the workspace…",
      "titleDone": "Welcome to the team!",
      "titleError": "Invitation problem",
      "authRequiredBody": "Sign in or create an account to accept this invitation.",
      "redirecting": "Redirecting…",
      "pleaseWait": "Please wait a moment.",
      "createAccountButton": "Create account",
      "signInButton": "Sign in",
      "backToDashboard": "Back to dashboard"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
} as const;

/** Deep map of the catalog shape to plain `string` leaves. Locales are typed
 *  `: Dict`, so the compiler enforces the EXACT nested key set of `en` (every
 *  namespace, every key) while allowing each locale its own string values. */
type DeepString<T> = { -readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dict = DeepString<typeof en>;
