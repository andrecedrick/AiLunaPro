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
  help: {
    "header": {
      "title": "Help Center",
      "subtitle": "Find answers, learn workflows, and troubleshoot common issues.",
      "onThisPage": "On this page",
      "tocAria": "Help sections",
      "keyTakeaways": "Key takeaways",
      "needMoreHelpTitle": "Need more help?",
      "needMoreHelpBody": "Contact your workspace owner or AiLunaPro support."
    },
    "gettingStarted": {
      "title": "Getting Started",
      "lede": "AiLunaPro is a compliance and AI-transformation suite for organizations adopting AI — audits, an AI registry, agent recommendations, ROI estimates, and a token-based usage model in one workspace.",
      "take1": "Start from the dashboard, then run a New Audit from the sidebar.",
      "take2": "Two public tools need no login: Diagnostic Express and the ROI Calculator.",
      "take3": "Owners and admins invite teammates with 7-day links.",
      "firstActionsTitle": "Your first three actions",
      "fa1": "Open the dashboard and review your current AI maturity score.",
      "fa2": "Run a New Audit from the sidebar to capture your AI usage and risks.",
      "fa3": "Browse the Agents catalog to see which AiLunaPro agents fit your workflow.",
      "leadMagnetsTitle": "Public lead-magnets",
      "lm1": "Diagnostic Express — a free 8-question AI maturity assessment, no account required.",
      "lm2": "ROI Calculator — estimate the time and money your team can save with AiLunaPro agents.",
      "publicLinks": "You can find both at `#/diagnostic` and `#/roi-calculator`. Share these links with colleagues — they do not require login.",
      "inviteTitle": "Inviting teammates",
      "inviteBody": "Owners and admins can invite teammates from the Team page in the sidebar. Each invitee receives a link valid for 7 days. Roles are assigned at invitation time.",
      "flowTitle": "How it flows",
      "flowStep1": "New Audit",
      "flowStep2": "Submit Audit",
      "flowStep3": "Audit saved + score",
      "flowStep4": "Generate report",
      "flowStep5": "Reports list",
      "flowCaption": "From audit to a shareable report snapshot"
    },
    "auditVsReport": {
      "title": "Audit vs Report",
      "inShortTitle": "In short",
      "inShort1": "An **Audit** captures your answers and computes your score.",
      "inShort2": "A **Report** is a **snapshot** of an audit, created intentionally to share or archive.",
      "calloutSubmit": "**Submitting saves your audit + score.** A **Report** is a snapshot, created only when you click **Generate report**.",
      "whatIsAuditTitle": "What is an Audit?",
      "wa1": "Your answers to structured questions.",
      "wa2": "Your compliance / maturity score.",
      "wa3": "A dynamic analysis that can evolve with scoring rules.",
      "calloutEditable": "An audit remains editable until you generate a report.",
      "whatIsReportTitle": "What is a Report?",
      "wr1": "A frozen snapshot at a specific point in time.",
      "wr2": "Created only when clicking **Generate report**.",
      "wr3": "Stable even if you run new audits later. Exportable and shareable, listed under **Reports** for the active workspace.",
      "flowStep1": "Submit Audit",
      "flowStep2": "Audit saved",
      "flowStep3": "Generate report?",
      "flowStep4": "Report snapshot",
      "flowStep5": "Reports list",
      "flowCaption": "A report is created only on Generate report",
      "calloutFlow": "**Submit Audit** → saves audit + score. **Generate report** → creates a snapshot visible in *Reports*.",
      "closing": "An **Audit history** view (distinct from Reports) is available in the sidebar. *Coming soon:* optional auto-report on submit."
    },
    "reportsWorkspaces": {
      "title": "Reports & Workspaces",
      "p1": "Reports are **per workspace**, not global. The Reports list shows only the reports of the **active** workspace.",
      "flowStep1": "Workspace A → its reports",
      "flowStep2": "Workspace B → its reports",
      "flowCaption": "Each workspace keeps its own reports",
      "calloutWarn": "Don't see an old report? It likely belongs to **another workspace**. Switch workspace from the selector at the top of the sidebar.",
      "calloutNote": "The dashboard date filter does **not** affect the Reports list."
    },
    "fillingAudit": {
      "title": "How to fill the audit properly",
      "p1": "Good inputs make a credible audit. Take a minute to answer honestly — the result reflects what you put in.",
      "calloutInfo": "The **“Describe…”** free-text fields add context. Your **score comes from the structured (choice) questions**, not the free text. Use clear, real, readable information for a credible report.",
      "li1": "Answer every structured question — they drive the score and findings.",
      "li2": "Use the free-text fields for real context (owners, tools, processes), not placeholder text.",
      "li3": "Re-run the audit as your practices evolve to track progress."
    },
    "agents": {
      "title": "AI Agents",
      "lede": "The Agents catalog lists ten ready-to-use AI agents for common business workflows. Each card shows a description, expected ROI, a recommended minimum plan, and a link to get started.",
      "take1": "Ten first-party agents, each tagged AiLunaPro.",
      "take2": "A plan badge (Starter+ / Professional+ / Enterprise+) suggests the typical tier.",
      "take3": "“Get this agent” starts the standard sign-up flow — no in-app purchase yet.",
      "catalogTitle": "Catalog (10 agents)",
      "cat1": "automate customer responses and reduce support workload.",
      "cat2": "qualify prospects and prepare commercial follow-ups.",
      "cat3": "assist with invoices, quotes, and collections.",
      "cat4": "assist HR teams with screening, summaries, and documentation.",
      "cat5": "help structure AI compliance, risks, and registries.",
      "cat6": "generate content, campaigns, and marketing ideas.",
      "cat7": "create summaries, dashboards, and decision reports.",
      "cat8": "support AI audit, maturity assessment, and action plans.",
      "cat9": "classify, summarize, and extract information from documents.",
      "cat10": "automate daily administrative work.",
      "sourceBadgeTitle": "Source badge",
      "sourceBadgeBody": "Agents are tagged **AiLunaPro** when they are first-party. Future versions will surface external alternatives with their own badge.",
      "planBadgeTitle": "Plan badge",
      "planBadgeBody": "Each card shows a minimum plan badge (Starter+, Professional+, Enterprise+). It indicates the recommended subscription tier for typical usage.",
      "getAgentTitle": "Get this agent",
      "getAgentBody": "Click the \"Get this agent\" button to start onboarding. Agents are not yet purchasable directly inside AiLunaPro — the link takes you through the standard sign-up flow."
    },
    "tokens": {
      "title": "Tokens",
      "intro": "Tokens are the unit of AI consumption inside AiLunaPro. Every audit, recommendation, or agent call uses tokens from your workspace's monthly allocation.",
      "howTitle": "How tokens work",
      "how1": "Your subscription includes a monthly token allocation that fits the plan.",
      "how2": "Each cycle, your balance refreshes. A small rollover (capped at one monthly allocation) carries over to avoid losing unused tokens.",
      "how3": "If your balance runs low, you can buy a top-up pack at any time.",
      "how4": "Top-up tokens are added to your balance and never expire.",
      "how5": "Top-ups complement your subscription — they do not replace it.",
      "packsTitle": "Top-up packs",
      "packsBody": "Three packs are available: Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). Token packs are currently billed in USD.",
      "balanceTitle": "Where to view your balance",
      "balanceBody": "The token badge in the topbar shows your current balance and monthly allocation. Click it to open the Tokens page for full usage history and to buy a top-up.",
      "runOutTitle": "When tokens run out",
      "runOutBody": "AI actions that need more tokens than your balance show a clear \"not enough tokens\" message and a link to buy a top-up. Owners, admins, and billing managers can buy packs. Members can view balances but cannot buy."
    },
    "billing": {
      "title": "Billing",
      "lede": "AiLunaPro offers Free, Starter, Professional, and Enterprise plans, differing by token allocation, audit volume, and team capabilities. Checkout and management run through Stripe.",
      "take1": "Billing and token packs are in USD; the currency selector is display-only for now.",
      "take2": "Owners/admins subscribe and manage plans from the Billing page (Stripe Customer Portal).",
      "take3": "The Free plan includes limited audits and 100 tokens per month.",
      "currencyTitle": "Currency",
      "currencyBody": "Billing and token packs are currently in USD. The sidebar currency selector is a display preference only. It does not change Stripe checkout currency or token pack pricing yet. Multi-currency billing is planned for a future release.",
      "subscribingTitle": "Subscribing",
      "subscribingBody": "From the Billing page, owners and admins can pick a plan and complete checkout via Stripe. The subscription activates immediately on successful payment and your token allocation updates automatically.",
      "manageTitle": "Managing your subscription",
      "manageBody": "The \"Manage subscription\" button opens the Stripe Customer Portal where you can update your payment method, change plan, view invoices, or cancel. Cancellation takes effect at the end of the current period.",
      "invoicesTitle": "Invoices",
      "invoicesBody": "Invoices appear on the Billing page after each renewal. Click View or PDF to download a copy.",
      "freeTitle": "Free plan",
      "freeBody": "The Free plan gives limited audit access and 100 tokens per month. Use it to explore the product before subscribing."
    },
    "diagnostic": {
      "title": "Diagnostic Express",
      "intro": "Diagnostic Express is a free, 8-question assessment that gives you an AI maturity score from 0 to 100, along with a short list of recommended AiLunaPro agents.",
      "accessTitle": "Where to access it",
      "accessBody": "Open `#/diagnostic` in your browser. No login required. Takes about two minutes. You can share the link with colleagues.",
      "getTitle": "What you get",
      "get1": "A normalized score from 0 to 100.",
      "get2": "A maturity bucket: Emerging, Developing, or Advanced.",
      "get3": "Three recommended agents adapted to your stage.",
      "get4": "A direct link to create your free AiLunaPro account.",
      "privacyTitle": "Privacy",
      "privacyBody": "Submitted answers and your email are stored only to generate your diagnostic and to follow up about relevant AI services. You can request deletion at any time."
    },
    "roiCalculator": {
      "title": "ROI Calculator",
      "intro": "The ROI Calculator estimates how much time and money your team can save by adopting AiLunaPro AI agents for a specific workflow.",
      "accessTitle": "Where to access it",
      "accessBody": "Open `#/roi-calculator` in your browser. No login required. Takes about one minute.",
      "inputsTitle": "Inputs",
      "in1": "Team size (1 to 10,000).",
      "in2": "Monthly hours your team spends on repetitive work.",
      "in3": "Average hourly cost in USD (defaults to 50).",
      "in4": "Target workflow (one of nine: support, sales, finance, documents, reporting, admin, compliance, marketing, hr).",
      "outputsTitle": "Outputs",
      "out1": "Estimated monthly cost saved (USD).",
      "out2": "Estimated yearly cost saved (USD).",
      "out3": "Estimated time saved per month (hours).",
      "out4": "Estimated payback period in months.",
      "out5": "Two recommended AiLunaPro agents for the chosen workflow.",
      "aboutTitle": "About the estimate",
      "aboutBody": "The result is based on the information you provide and conservative automation assumptions. Actual savings may vary. Payback uses a placeholder agent cost of $99/month until agent pricing is finalized."
    },
    "team": {
      "title": "Team and Roles",
      "intro": "AiLunaPro supports five roles per workspace. Each role has a specific scope:",
      "thRole": "Role",
      "thManageWorkspace": "Manage workspace",
      "thManageBilling": "Manage billing",
      "thRunAudits": "Run audits",
      "thViewReports": "View reports",
      "limited": "limited",
      "inviteTitle": "Inviting teammates",
      "inviteBody": "Owners and admins open the Team page, click Invite, enter the email address, and choose a role. The invitee receives a link valid for 7 days. If a link expires or is lost, owners and admins can regenerate it.",
      "rolesTitle": "Changing roles",
      "rolesBody": "Owners and admins can change a teammate's role from the Team page. Members can be temporarily disabled (no access) and re-enabled later, or removed from the workspace."
    },
    "settings": {
      "title": "Settings",
      "lede": "Manage your profile, organization, appearance, and notification preferences. Language and currency selectors are display preferences for now.",
      "take1": "Profile & organization details live under Settings.",
      "take2": "Theme (light/dark) persists across sessions.",
      "take3": "Language and currency are display-only until those features ship.",
      "profileTitle": "Profile",
      "profileBody": "Update your display name and email address from Settings → Profile.",
      "orgTitle": "Organization",
      "orgBody": "Owners can rename the organization from Settings → Organization.",
      "themeTitle": "Theme",
      "themeBody": "Switch between light and dark mode from Settings → Preferences. Your choice persists across sessions.",
      "languageTitle": "Language",
      "languageBody": "The language selector in the sidebar and in Settings is a preference only. The application currently displays in English. Full multi-language support is planned for a future release.",
      "currencyTitle": "Currency",
      "currencyBody": "The currency selector in the sidebar and in Settings is a display preference only. Billing and token pack pricing remain in USD until multi-currency billing is implemented.",
      "emailTitle": "Email notifications",
      "emailBody": "Choose which emails you want to receive: weekly compliance digest, report-ready notifications, and team activity. Settings → Preferences → Email notifications."
    },
    "analytics": {
      "title": "Analytics & Cookies (Optional)",
      "intro": "AiLunaPro uses optional, privacy-friendly product analytics to help us improve reliability and fix issues faster. It is entirely optional and stays off until you allow it.",
      "offByDefault": "**Off by default** — nothing is collected until you choose **Allow**.",
      "collectedTitle": "What is collected",
      "chipNoPersonal": "No personal data",
      "chipNoRecording": "No session recording",
      "chipNoAds": "No ad tracking",
      "collectedBody": "Only anonymous usage signals such as page views and reliability events.",
      "optTitle": "Opt in or out anytime",
      "opt1": "On your first visit, choose Allow or No thanks in the small banner.",
      "opt2": "Your choice is saved on this device — the banner will not ask again.",
      "opt3": "To change it, clear this site’s browser storage (site data) and reload.",
      "dntTitle": "Do Not Track",
      "dntBody": "If your browser sends a “Do Not Track” signal, analytics stay off automatically and no banner is shown.",
      "blockedTitle": "If analytics are blocked",
      "blockedBody": "Some browsers, extensions, or networks block analytics requests. That is completely fine — the application works normally either way, and no action is needed."
    },
    "troubleshooting": {
      "title": "Troubleshooting",
      "lede": "Quick fixes for the most common issues. Most are resolved by a refresh; if not, your workspace owner or AiLunaPro support can help.",
      "take1": "Refresh first — it resolves most load, balance, and session hiccups.",
      "take2": "Token credits arrive within a few seconds of a successful payment.",
      "take3": "A blank screen is usually a browser extension or network filter.",
      "loadTitle": "The page won't load",
      "loadBody": "The service may be temporarily unavailable. Refresh the page. If the issue continues, contact your workspace owner or AiLunaPro support.",
      "signedOutTitle": "You're signed out unexpectedly",
      "signedOutBody": "Your session may have expired. Sign in again. If you keep getting signed out, contact your workspace owner.",
      "balanceTitle": "Token balance looks incorrect",
      "balanceBody": "Refresh the page first. If your balance still looks wrong after a refresh, contact your workspace owner or AiLunaPro support.",
      "balanceCheckoutTitle": "Token balance didn't update after checkout",
      "balanceCheckoutBody": "Wait a moment and refresh the page. Token credits arrive within a few seconds of a successful payment. If the balance still does not update, contact your workspace owner or AiLunaPro support.",
      "captchaTitle": "Captcha keeps failing on the public forms",
      "captchaBody": "Reload the page and complete the captcha again. If the issue persists, try a different browser or contact AiLunaPro support.",
      "syncTitle": "Subscription sync failed",
      "syncBody": "On the Billing success page, click Retry sync. If the failure persists, contact AiLunaPro support and include your Stripe receipt.",
      "inviteTitle": "Invitation link doesn't work",
      "inviteBody": "Invitations expire after 7 days. Ask your workspace owner or admin to regenerate the invite from the Team page.",
      "roadmapTitle": "What's the difference between Roadmap and Action Plan?",
      "roadmapBody": "Both views derive from the same audit findings and recommendations, but they answer different questions. The **Roadmap** answers **when** to ship work — items are bucketed by horizon (30 / 60 / 90 days) to help with planning and capacity. The **Prioritized Action Plan** answers **what to fix first** — items are bucketed by priority (Critical / Important / Improvement) using a fixed deterministic rule on the existing finding severity and recommendation impact. They are complementary, not duplicates. Neither view changes scoring, and neither is a compliance certification.",
      "blankTitle": "Blank screen, \"Oops\", or broken layout?",
      "blankBody": "This is almost always a browser **ad-blocker or privacy extension** (or a corporate/VPN/DNS filter) blocking the app's scripts, styles, or data requests — you may see **ERR_BLOCKED_BY_CLIENT** in the console. Fix it by allowing **audit.ailunapro.com** and ***.googleapis.com** in your blocker, or open the app in a clean browser profile with no extensions, then reload.",
      "emailTitle": "Didn't get the verification or password reset email?",
      "emailBody": "Verification and password reset emails are sent by Firebase from your project’s configured no-reply address (the default Firebase sender until a custom sender domain is verified). Check your **spam / promotions** folder first. You can resend the verification email from **Settings → Profile**, or request a new reset link from the **Forgot password** page. After verifying, sign out and back in so your account reflects the verified status. (Team invitations are separate and sent via AiLunaPro’s email provider.)"
    },
    "faq": {
      "title": "FAQ",
      "q1": "Why don't I see my old reports?",
      "a1": "Reports are **per workspace**. An older report likely belongs to a different workspace — switch workspace from the selector at the top of the sidebar. The dashboard date filter does not affect the Reports list.",
      "q2": "Why is Reports empty?",
      "a2": "A submitted audit alone does not create a report. Open a submitted audit and click **Generate report** to create a snapshot — it then appears under Reports.",
      "q3": "Does random text affect my score?",
      "a3": "No. The score comes from the structured (choice) questions. Free-text “Describe…” fields add context only — but clear, real input makes your report credible.",
      "q4": "What is saved, and when?",
      "a4": "**Submit Audit** saves your answers + score. **Generate report** creates a separate, shareable snapshot. See “Audit vs Report” above.",
      "q5": "Is my data secure?",
      "a5": "AiLunaPro uses authenticated access, role-based permissions, Firestore security rules, and server-side writes for sensitive operations. Token amounts, billing actions, and team changes are validated by the server.",
      "q6": "Can I delete my data?",
      "a6": "Yes. Contact your workspace owner or AiLunaPro support to request deletion of your account or your workspace data.",
      "q7": "Why are token packs in USD?",
      "a7": "AiLunaPro is rolling out multi-currency support in stages. Subscriptions support multiple currencies via Stripe. Token packs will become multi-currency in a future release.",
      "q8": "What does the currency selector do?",
      "a8": "It is a display preference only. It does not change Stripe checkout currency or token pack pricing yet.",
      "q9": "What does the language selector do?",
      "a9": "It stores your preferred language. Full UI translation is in progress and will ship in a future release.",
      "q10": "How do I contact support?",
      "a10": "For account, billing, or technical questions, contact your workspace owner first. For issues that need our help, contact AiLunaPro support directly.",
      "q11": "Are agents purchased inside AiLunaPro yet?",
      "a11": "Not yet. The Agents catalog lists recommended AI agents. Selecting \"Get this agent\" takes you through the standard onboarding flow. Direct in-app purchase is planned for a later phase.",
      "q12": "Is the ROI estimate guaranteed?",
      "a12": "No. The ROI Calculator gives a conservative estimate based on the information you provide. Actual savings depend on your workflow, integration quality, and adoption."
    }
  },
} as const;

/** Deep map of the catalog shape to plain `string` leaves. Locales are typed
 *  `: Dict`, so the compiler enforces the EXACT nested key set of `en` (every
 *  namespace, every key) while allowing each locale its own string values. */
type DeepString<T> = { -readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dict = DeepString<typeof en>;
