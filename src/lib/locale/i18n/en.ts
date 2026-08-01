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
    toolsSection:          'Tools',
    aiRoiCalculator:       'AI ROI Calculator',
    aiMaturityDiagnostic:  'AI Maturity Diagnostic',
    requestQuote:          'Request a Quote',
    myQuotes:              'My quotes',
    invoices:              'Invoices',
  },
  navGroups: {
    core:    'Core',
    audit:   'Audit & Analysis',
    crm:     'Sales / CRM',
    admin:   'Administration',
    billing: 'Billing',
    tools:   'Tools',
    system:  'System',
  },
  /** App-shell chrome (sidebar header, org switcher, sign-out, pref widget). */
  bankSettings: {
    heading: 'Bank transfer details',
    subtitle: 'Shown on invoices as a payment option.',
    countryLabel: 'Country code',
    countryPlaceholder: 'e.g. FR',
    regionLabel: 'Banking region',
    regionEu: 'Europe (IBAN)',
    regionUs: 'United States',
    regionGlobal: 'Asia / Global',
    fAccountName: 'Account name',
    fAccountNumber: 'Account number',
    fRoutingNumber: 'Routing number',
    fBankName: 'Bank name',
    fAccountHolder: 'Account holder',
    save: 'Save bank details',
    saved: 'Bank details saved',
    saveError: 'Could not save. Please try again.',
    validationError: 'Please check this value.',
    ownerOnly: 'Only owners and admins can edit bank details.',
  },
  invoices: {
    title: 'Invoices',
    subtitle: 'Invoices created when a client accepts a quote.',
    loading: 'Loading…',
    error: 'Could not load your invoices. Please try again.',
    empty: 'No invoices yet.',
    quoteLabel: 'Quote',
    statusDraft: 'Draft',
    statusPending: 'Pending',
    statusPaid: 'Paid',
    amountPending: 'To be confirmed',
    confirmSend: 'Confirm and send invoice',
    amountLabel: 'Final amount (USD)',
    confirmBtn: 'Confirm & send',
    cancel: 'Cancel',
    sent: 'Invoice sent successfully',
    sentNoEmail: 'The email could not be sent.',
    confirmationResent: 'Payment confirmation re-sent',
    confirmationSentOn: 'Payment confirmation sent',
    invoiceSentOn: 'Invoice email sent',
    resendNoRecipient: 'This invoice has no client email address.',
    resendConfirmationBtn: 'Resend payment confirmation',
    downloadPdf: 'Download invoice (PDF)',
    statusAwaitingTransfer: 'Awaiting transfer',
    confirmError: 'Could not send. Please try again.',
    pendingHeading: 'Pending confirmation',
    // Pricing queue (accepted / negotiating quotes awaiting the admin's final amount).
    queueHeading: 'Awaiting your pricing',
    queueEmpty: 'No quotes awaiting pricing right now.',
    queueSubtitle: 'A client responded — set the final amount to create the invoice.',
    stageAcceptedLabel: 'Accepted',
    stageNegotiationLabel: 'Negotiation',
    nextAccepted: 'Next: set the final amount to create and send the invoice.',
    clientMessageLabel: 'Client message',
    finalizeBtn: 'Confirm amount & create invoice',
    invoicesHeading: 'Invoices',
    resendBtn: 'Re-send invoice email',
    fromEmail: 'Opened from your email',
    notFound: 'This quote or invoice could not be found.',
  },
  adminCenter: {
    nav: 'Admin Center',
    title: 'Admin Center',
    subtitle: 'Monitor quotes, invoices and client activity for your organization in one place.',
    restricted: 'The Admin Center is restricted to super admins.',
    activityHeading: 'Recent activity',
    activityEmpty: 'No activity yet.',
    evtSent: 'Proposal sent',
    evtAccepted: 'Quote accepted by client',
    evtInvoiceSent: 'Invoice sent',
    evtPaid: 'Payment received',
    discussionsHeading: 'Client discussions',
    discussionsEmpty: 'No client messages yet.',
    contextLabel: 'Context',
    statusWaitingResponse: 'Waiting for your response',
    replyHint: 'reply to the notification email to respond',
    allQuotesHeading: 'All quotes — full lifecycle',
    allQuotesEmpty: 'No quotes sent yet.',
    tlCreated: 'Created',
    tlSent: 'Sent',
    tlAccepted: 'Accepted',
    tlChanges: 'Changes requested',
    tlInvoiced: 'Invoiced',
    blocked: 'Blocked',
    suspended: 'Suspended',
    save: 'Save',
    block: 'Block',
    suspend: 'Suspend',
    reactivate: 'Re-activate',
    sendQuote: 'Send Quote',
    createInvoice: 'Create invoice',
    invoicePending: 'Invoice pending',
    sendAndPay: 'Send & Pay',
    markPaidBtn: 'Mark as paid',
    awaitingTransfer: 'Awaiting transfer',
    openPaymentLink: 'Open payment link',
    genPaymentLink: 'Generate payment link',
    orgQuotesHeading: 'All quotes in this organization',
    platformHeading: 'Platform — all quotes (all organizations)',
    platformEmpty: 'No quotes across any organization yet.',
    priceLabel: 'Price',
    uidLabel: 'User ID',
    orgLabel: 'Organization',
    sourceLabel: 'Source',
    currencyLabel: 'Currency',
    stripeIdLabel: 'Stripe ID',
    quoteIdLabel: 'Quote ID',
    paidLabel: 'Paid',
    paymentPaid: 'Paid',
    paymentPending: 'Awaiting payment',
    paymentNone: 'No invoice',
  },
  myQuotes: {
    title: 'My quotes',
    subtitle: 'Track the proposals you sent — status, price and the latest activity.',
    loading: 'Loading…',
    error: 'Could not load your quotes. Please try again.',
    empty: 'You have not sent any quotes yet.',
    createCta: 'Create a quote',
    quoteLabel: 'Quote',
    proposedBudget: 'Quote price',
    statusSent: 'Sent',
    statusReviewing: 'In review',
    statusNegotiation: 'Negotiation',
    statusValidated: 'Validated',
    statusInvoiced: 'Invoiced',
    statusBlocked: 'Blocked',
    statusSuspended: 'Suspended',
    changesRequested: 'Client requested changes',
    negotiationNextStep: 'Set the final amount in the Admin Center to respond.',
    waitingResponse: 'Waiting for the client to respond',
    lastActivity: 'Last activity',
    actCreated: 'Quote created',
    actSent: 'Proposal sent to client',
    actAccepted: 'Client accepted the quote',
    actChangesRequested: 'Client requested changes',
    actInvoiced: 'Invoice created',
  },
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
    "nextTools": {
      "title": "Keep exploring",
      "subtitle": "Lightweight tools you can run anytime — no setup.",
      "roi": "Estimate your ROI",
      "diagnostic": "Run another quick diagnostic"
    },
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
        "journeyCostSaved": "Estimated cost saved ≈ {amount}/month."
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
    },
    "quickTools": {
      "title": "Quick tools",
      "subtitle": "Lightweight checks you can re-run anytime — separate from your full audit.",
      "diagnostic": {
        "label": "Run a quick diagnostic",
        "hint": "Score your AI maturity in ~2 min"
      },
      "roi": {
        "label": "Estimate your ROI",
        "hint": "See potential time & cost savings"
      }
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
    "stillConnecting": "Still connecting…",
    "valueDisplay": {
      "actionHint": "Uses {tokens} tokens · ≈ {value} value",
      "actionHintFree": "Free · ≈ {value} value",
      "sessionTracker": "This session: {value} value · {tokens} tokens"
    }
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
      "pendingGreetingDiagnostic": "We saved your diagnostic. A full audit turns it into a complete action plan. Pick how you'd like to continue.",
      "pendingGreetingRoi": "We saved your ROI estimate. A full audit turns it into a complete action plan. Pick how you'd like to continue.",
      "heading": "How do you want to start?",
      "express": {
        "badge": "Recommended for your first audit",
        "time": "~5 min",
        "title": "Audit Express",
        "body": "A fast, ~5-minute AI-readiness snapshot — a few quick questions, an optional website analysis, indicative ROI. Best for a first look.",
        "cta": "Start Audit Express →"
      },
      "full": {
        "time": "~15 min",
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
    "error": { "companyRequired": "Company is required." },
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
  systemBuilder: {
    "chrome": {
      "pageTitle": "AI System Builder",
      "pageIntro": "A pre-deployment design guide. Walk through six dimensions — purpose & risk, data, model, oversight, monitoring, documentation — to design an AI system responsibly. Your step and checklist ticks are saved on this device only.",
      "designSteps": "Design steps",
      "checklist": "Checklist",
      "doneSuffix": "· {doneCount}/{total} done",
      "keyQuestions": "Key questions",
      "references": "References (advisory, not legal advice)",
      "previousStep": "← Previous step",
      "nextStep": "Next step →",
      "stepOf": "Step {n} of {total}",
      "endOfGuide": "✓ End of the guide — all six dimensions covered"
    },
    "steps": {
      "purpose": {
        "title": "1. Purpose & risk classification",
        "intro": "Pin down what the system is for, who it affects, and how risky it is before you build anything. This anchors every later decision.",
        "checklist": {
          "c1": "Write a one-sentence intended purpose (no jargon).",
          "c2": "List affected persons or groups (users, customers, third parties).",
          "c3": "Classify risk tier: unacceptable / high (Annex III) / limited / minimal — or GPAI.",
          "c4": "Document use-case scope and the boundary (what is out of scope).",
          "c5": "List foreseeable misuse / off-label use and what you will refuse to do."
        },
        "questions": {
          "q1": "Who has the authority to deploy or pause this system?",
          "q2": "What happens — concretely — if the system gets it wrong?",
          "q3": "Which legal rights, safety conditions, or freedoms could be affected?"
        }
      },
      "data": {
        "title": "2. Data governance",
        "intro": "If your data is wrong, the system is wrong. Inventory it, classify it, justify why you hold it, and watch for bias.",
        "checklist": {
          "c1": "Build a data inventory: source, owner, sensitivity, retention.",
          "c2": "Establish a lawful basis (GDPR Art. 6) for every category processed.",
          "c3": "Document quality: relevance, representativeness, gaps, known biases.",
          "c4": "Apply data minimisation: collect only what you need; retain only as long as needed.",
          "c5": "Plan periodic bias reviews and corrective action paths."
        },
        "questions": {
          "q1": "Where did each dataset come from, and who is accountable for it?",
          "q2": "Does the dataset include sensitive categories (Art. 9 GDPR)? On what basis?",
          "q3": "What bias signals will you measure, and against what baseline?"
        }
      },
      "model": {
        "title": "3. Model selection & validation",
        "intro": "Pick the smallest model that works. Validate it the way attackers and users will actually use it. Document what it cannot do.",
        "checklist": {
          "c1": "Justify the choice of model size / family vs the actual use case.",
          "c2": "Define accuracy + robustness targets and how you will measure them.",
          "c3": "Run adversarial / red-team testing (prompt injection, jailbreaks, biased outputs).",
          "c4": "Document known failure modes and explicit non-uses.",
          "c5": "Version every model artefact and ship change notes with deployments."
        },
        "questions": {
          "q1": "Why this model, and what cheaper alternative did you rule out?",
          "q2": "What does the system look like when it is wrong — and how do you know?",
          "q3": "Is your test set representative of production traffic?"
        }
      },
      "oversight": {
        "title": "4. Human oversight",
        "intro": "Decide how humans stay in control of consequential outcomes. Make sure the controls actually work under pressure.",
        "checklist": {
          "c1": "Choose oversight mode per decision type: in-loop, on-loop, or out-of-loop.",
          "c2": "Name reviewers and document SLAs for high-stakes decisions.",
          "c3": "Provide override / pause / kill-switch controls the reviewer can use.",
          "c4": "Write an escalation runbook (who is paged, with what context).",
          "c5": "Log every override / pause for post-incident review."
        },
        "questions": {
          "q1": "Who reviews high-stakes outputs — and do they have the time and context to do it?",
          "q2": "Can a single operator stop the system without a meeting?",
          "q3": "How do you avoid rubber-stamping (\"automation complacency\")?"
        }
      },
      "monitoring": {
        "title": "5. Monitoring & incidents",
        "intro": "Post-deployment monitoring is non-optional. Drift is silent. Incidents are not.",
        "checklist": {
          "c1": "Define post-deployment monitoring metrics (accuracy, latency, harm, drift).",
          "c2": "Implement drift detection on inputs and outputs.",
          "c3": "Log incidents to a single queue with severity and owner.",
          "c4": "Document reporting paths (regulator, customer, internal).",
          "c5": "Schedule periodic re-evaluation (quarterly minimum)."
        },
        "questions": {
          "q1": "What single metric, if it moves, tells you to pause the system?",
          "q2": "Who gets paged at 3am, and what runbook do they open?",
          "q3": "When did you last rehearse an AI incident scenario?"
        }
      },
      "docs": {
        "title": "6. Documentation & transparency",
        "intro": "Write down what the system is, what it is not, and what users need to know. Refresh on every material change.",
        "checklist": {
          "c1": "Maintain technical documentation per Art. 11 (purpose, data, training, eval, risks).",
          "c2": "Publish a model / system card per system; refresh on every release.",
          "c3": "Add a user-facing AI disclosure on every customer surface.",
          "c4": "Update privacy notices to reflect AI processing.",
          "c5": "Keep training records for staff who operate the system."
        },
        "questions": {
          "q1": "What do end-users need to know to use this system responsibly?",
          "q2": "What would an external auditor need on day one?",
          "q3": "How fresh is the model / system card right now?"
        }
      }
    }
  },
  registry: {
    "page": {
      "title": "AI Registry",
      "subtitle": "Track every AI tool used across your organization — purpose, data, oversight, and mitigations. The registry feeds your audits and reports.",
      "designGuideLink": "Designing a new system? Open the design guide →",
      "addTool": "+ Add tool",
      "loading": "Loading registry…",
      "error": "Failed to load registry. Refresh to retry."
    },
    "summary": {
      "totalTools": "Total tools",
      "approved": "Approved",
      "pendingReview": "Pending review",
      "highRisk": "High-risk"
    },
    "filters": {
      "searchPlaceholder": "Search tools, purpose, notes…",
      "allDepartments": "All departments",
      "allRisks": "All risks",
      "allApproval": "All approval",
      "clear": "Clear filters",
      "risk": {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "critical": "Critical"
      }
    },
    "table": {
      "tool": "Tool",
      "department": "Department",
      "risk": "Risk",
      "approval": "Approval",
      "oversight": "Oversight",
      "reviewDate": "Review date"
    },
    "empty": {
      "noItems": {
        "title": "No AI tools in the registry yet",
        "body": "Track every AI tool used across your organization — purpose, data, oversight, and mitigations. The registry feeds your audits and reports.",
        "action": "+ Add your first tool"
      },
      "noMatches": {
        "title": "No tools match these filters",
        "body": "Try widening the filters, or clear them to see the full registry.",
        "action": "Clear filters"
      }
    },
    "modal": {
      "titleAdd": "Add AI tool",
      "titleEdit": "Edit AI tool",
      "subtitleAdd": "Track an AI tool used by your team. All fields can be edited later.",
      "subtitleEdit": "Update what your team knows about this tool. Changes save immediately to the local registry.",
      "fields": {
        "toolName": "Tool name",
        "purpose": "Purpose",
        "dataTypes": "Data types processed",
        "mitigations": "Mitigations",
        "notes": "Notes",
        "department": "Department",
        "approvalStatus": "Approval status",
        "riskLevel": "Risk level",
        "humanOversight": "Human oversight",
        "nextReviewDate": "Next review date"
      },
      "placeholders": {
        "toolName": "e.g. Customer support copilot",
        "purpose": "What does this tool do?",
        "mitigation": "Add a mitigation and press Enter",
        "notes": "Vendor, residency, owner, anything worth recording…"
      },
      "riskOptions": {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "critical": "Critical"
      },
      "reviewDateHint": "Leave empty if no review is scheduled.",
      "auditTrail": "Created {createdDate} · Last updated {updatedDate}",
      "removeMitigationAria": "Remove mitigation {index}",
      "requiredError": "Required",
      "deleteConfirm": "Remove \"{toolName}\" from the registry? This cannot be undone.",
      "buttons": {
        "delete": "Delete tool",
        "cancel": "Cancel",
        "addToRegistry": "Add to registry",
        "saveChanges": "Save changes"
      }
    }
  },
  savedAudits: {
    "list": {
      "title": "Saved Audit Express",
      "subtitle": "Your saved Audit Express snapshots. Download the PDF or remove a saved result.",
      "runAuditExpress": "Run Audit Express",
      "loading": "Loading…",
      "empty": {
        "prefix": "No saved audits yet. Use",
        "runLink": "Run Audit Express",
        "suffix": "to create one."
      },
      "meta": {
        "engineLabel": "engine",
        "engineFallback": "n/a",
        "confidenceLabel": "confidence"
      }
    },
    "actions": {
      "view": "View",
      "rename": "Rename",
      "delete": "Delete",
      "download": "Download PDF",
      "save": "Save",
      "cancel": "Cancel",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Audit title",
      "viewDetailsTooltip": "View details"
    },
    "errors": {
      "load": "Could not load your saved audits. Please try again.",
      "tokensInsufficient": "Not enough tokens to export. Buy tokens to continue.",
      "download": "Download failed. Please try again.",
      "delete": "Delete failed. Please try again.",
      "rename": "Could not rename. Please try again."
    },
    "pdfLimitModal": {
      "ariaLabel": "PDF export limit",
      "title": "You’ve used your {freeCount} free PDF exports",
      "body": "Downloading more PDFs requires tokens ({tokenCost} tokens per export).",
      "useTokens": "Use tokens & download",
      "useTokensBusy": "…",
      "buyTokens": "Upgrade or buy tokens",
      "cancel": "Cancel"
    },
    "detail": {
      "backToList": "← Saved Audits",
      "loading": "Loading…",
      "meta": {
        "engineLabel": "engine",
        "engineFallback": "n/a",
        "confidenceLabel": "confidence"
      },
      "rename": "Rename",
      "save": "Save",
      "cancel": "Cancel",
      "titleAriaLabel": "Audit title",
      "busy": "…",
      "notRecomputed": "This audit could not be recomputed.",
      "downloadPdf": "Download PDF",
      "downloadPdfBusy": "Preparing…",
      "backToSaved": "Back to Saved Audits"
    },
    "detailErrors": {
      "notFound": "This audit no longer exists.",
      "load": "Could not load this audit. Please try again.",
      "rename": "Could not rename. Please try again.",
      "tokensInsufficient": "Not enough tokens. Buy tokens to continue.",
      "sharingDisabled": "Sharing is disabled for this audit.",
      "createShareLink": "Could not create a share link. Please try again.",
      "revokeShareLink": "Could not revoke the link. Please try again.",
      "updateSharing": "Could not update sharing. Please try again."
    },
    "recommendedAgents": {
      "heading": "Recommended agents",
      "exploreAll": "Explore all agents →",
      "disclaimer": "Indicative matches based on this audit. Review fit before adopting.",
      "meta": {
        "hoursSaved": "~{hours} h/mo saved",
        "plan": "{plan} plan",
        "setup": "{complexity} setup"
      }
    },
    "share": {
      "heading": "Shareable link",
      "description": "A signed, no-login link to this audit's PDF. Creating or regenerating counts toward your PDF exports.",
      "generateNewLink": "Generate new link",
      "shareLink": "Share link",
      "working": "Working…",
      "revoke": "Revoke",
      "enableSharing": "Enable sharing",
      "disableSharing": "Disable sharing",
      "copy": "Copy",
      "copied": "Copied",
      "expires": "Expires {date}.",
      "activeLinkExists": "An active link exists (expires {date}). Generate a new link to view the URL again — this revokes the old one.",
      "disabledNotice": "Sharing is disabled — existing links no longer work.",
      "limitModalActionLabel": "Use tokens & create link"
    },
    "shareStatus": {
      "notShared": "Not shared",
      "active": "Active",
      "expired": "Expired",
      "revoked": "Revoked",
      "disabled": "Disabled"
    }
  },
  auditHistory: {
    "header": {
      "title": "Audit history",
      "subtitle": "Submitted audits for this workspace. Generate a report to create a shareable snapshot."
    },
    "states": {
      "loading": "Loading audit history…",
      "error": "Could not load audit history. Try again later."
    },
    "empty": {
      "title": "No submitted audits yet",
      "description": "Submitted audits appear here for this workspace. Run a New Audit to get started.",
      "startAudit": "+ Start an audit"
    },
    "columns": {
      "submitted": "Submitted",
      "score": "Score",
      "risk": "Risk",
      "findings": "Findings"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Generate report"
    },
    "toast": {
      "reportGenerated": "Report generated"
    }
  },
  reportsPages: {
    "list": {
      "title": "Reports",
      "intro": "Generated reports are snapshots of an audit at a point in time. Each one is exportable, shareable, and stays stable when you start a new audit.",
      "generateFromDraft": "+ Generate from current draft",
      "startNewAudit": "Start a new audit",
      "loading": "Loading reports…",
      "errorMessage": "No reports loaded yet. This can happen if the workspace is new or if Firestore is unreachable.",
      "retry": "Retry",
      "traceabilityHint": "Reports are point-in-time snapshots saved to your workspace. The detail view recomputes the full result from each report's answer snapshot — so historical reports stay accurate even after the scoring rules evolve."
    },
    "detail": {
      "loading": "Loading report…",
      "notFoundTitle": "Report not found",
      "notFoundBody": "This report no longer exists or has been deleted.",
      "backToReports": "← Back to reports",
      "rename": {
        "titleAriaLabel": "Report title",
        "saving": "…",
        "saveTitle": "Save title",
        "cancel": "Cancel",
        "renameButton": "Rename"
      },
      "download": {
        "preparing": "Preparing…",
        "downloadPdf": "⬇ Download PDF"
      },
      "errors": {
        "tokensInsufficientExport": "Not enough tokens to export. Buy tokens to continue.",
        "downloadFailed": "Download failed. Please try again.",
        "renameForbidden": "Only owners or admins can rename reports.",
        "renameFailed": "Could not rename. Please try again.",
        "tokensInsufficient": "Not enough tokens. Buy tokens to continue.",
        "shareDisabled": "Sharing is disabled for this report.",
        "shareForbidden": "Only owners or admins can share reports.",
        "shareCreateFailed": "Could not create a share link. Please try again.",
        "revokeFailed": "Could not revoke the link. Please try again.",
        "toggleSharingFailed": "Could not update sharing. Please try again."
      },
      "share": {
        "heading": "Shareable link",
        "description": "A signed, no-login link to this report's PDF. Creating or regenerating counts toward your PDF exports.",
        "working": "Working…",
        "generateNewLink": "Generate new link",
        "revoke": "Revoke",
        "shareLink": "Share link",
        "enableSharing": "Enable sharing",
        "disableSharing": "Disable sharing",
        "copied": "Copied",
        "copy": "Copy",
        "expires": "Expires {date}.",
        "activeLinkExists": "An active link exists (expires {date}). Generate a new link to view the URL again — this revokes the old one.",
        "disabledNotice": "Sharing is disabled — existing links no longer work.",
        "useTokensAndCreateLink": "Use tokens & create link"
      },
      "status": {
        "notShared": "Not shared",
        "active": "Active",
        "expired": "Expired",
        "revoked": "Revoked",
        "disabled": "Disabled"
      },
      "footer": {
        "openAssistancePlan": "Open assistance plan",
        "deleteReport": "Delete report",
        "deleteConfirm": "Delete this report? This cannot be undone."
      },
      "metadata": {
        "heading": "Metadata",
        "reportId": "Report ID",
        "sourceDraft": "Source draft",
        "status": "Status",
        "weakestSection": "Weakest section",
        "frameworks": "Frameworks"
      }
    },
    "share": {
      "unavailableTitle": "Shared report unavailable",
      "backToReports": "← Back to reports",
      "copySuccess": "Share link copied.",
      "copyFailure": "Could not copy link. Try again.",
      "banner": {
        "label": "🔗 Shared report — read-only view",
        "description": "Read-only view for people in your workspace, opened from the in-app share link. Internal action buttons are hidden.",
        "copyShareLink": "🔗 Copy share link",
        "backToInternalView": "← Back to internal view"
      },
      "topline": {
        "kicker": "AI Compliance Report",
        "score": "Score",
        "scoreOutOf": "/100",
        "generated": "Generated {date}"
      },
      "poweredBy": "Powered by AiLunaPro · Compliance Suite"
    }
  },
  tokensPage: {
    "header": {
      "title": "Tokens",
      "subtitle": "Track usage, monitor your monthly allocation, and buy top-ups when needed."
    },
    "locked": {
      "title": "Tokens unavailable",
      "clientMessage": "Tokens are not visible from a client account.",
      "workspaceMessage": "Tokens are unavailable for this workspace.",
      "backToDashboard": "Back to dashboard"
    },
    "webhook": {
      "notice": "Payment received. Waiting for Stripe webhook to update your token balance.",
      "refreshBalance": "Refresh balance"
    },
    "balance": {
      "loading": "Loading balance…",
      "empty": "No token balance yet. It will be created on your first audit.",
      "statBalance": "Balance",
      "statMonthlyAllocation": "Monthly allocation",
      "statConsumed": "Consumed",
      "statRollover": "Rollover",
      "statTopups": "Top-ups",
      "cycleEnds": "Cycle ends: {cycleEnd}",
      "lastReset": "Last reset: {lastReset}"
    },
    "packs": {
      "sectionTitle": "Unlock more analyses",
      "sectionNote": "Token packs are currently billed in USD. Top-up tokens never expire.",
      "readOnlyNotice": "You can view tokens but only owners, admins, and billing managers can buy packs.",
      "starterLabel": "Starter",
      "starterBlurb": "Top off a low cycle.",
      "proLabel": "Pro",
      "proBlurb": "Most common refill.",
      "maxLabel": "Max",
      "maxBlurb": "Big workload boost.",
      "tokensUnit": "tokens",
      "amountPrefix": "+{amount}",
      "buyPack": "Unlock my full plan",
      "redirecting": "Redirecting…",
      "readOnlyButton": "Read-only"
    },
    "planUsage": {
      "title": "Plan usage",
      "included": "{limit} audits/month included with your plan",
      "thisMonth": "{used} / {limit} audits this month",
      "unlimited": "Unlimited audits",
      "limitFree": "You’ve used all {limit} included audits. Upgrade to keep auditing.",
      "limitPaid": "You’ve used {used}/{limit} audits — extra audits now use tokens.",
      "upgradeCta": "Upgrade plan"
    },
    "usage": {
      "sectionTitle": "Recent usage",
      "loading": "Loading usage…",
      "empty": "No usage yet.",
      "colDate": "Date",
      "colModule": "Module",
      "colAction": "Action",
      "colTokens": "Tokens",
      "colStatus": "Status",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Token purchase completed. Your balance will update shortly.",
      "purchaseCancelled": "Token purchase cancelled.",
      "buyForbidden": "Only owners, admins, or billing managers can buy token packs."
    }
  },
  billingPage: {
    "header": {
      "title": "Billing",
      "subtitle": "Manage your plan, usage, and invoices.",
      "readOnlyBadge": "Read-only view."
    },
    "plans": {
      "bestValueBadge": "Best value",
      "priceApprox": "{approx}{suffix} approx · billed in USD",
      "cta": {
        "redirecting": "Redirecting…",
        "currentPlan": "Current plan",
        "freeCurrent": "Free — current",
        "startForFree": "Start for free",
        "subscribe": "Subscribe"
      },
      "free": {
        "description": "Try the platform with limited access.",
        "features": {
          "limitedAuditAccess": "Limited audit access",
          "basicDashboard": "Basic dashboard",
          "demoReports": "Demo reports",
          "communitySupport": "Community support"
        }
      },
      "starter": {
        "description": "Run real audits on your own.",
        "features": {
          "coreAuditWorkflow": "Core audit workflow",
          "basicComplianceReports": "Basic compliance reports",
          "starterAuditVolume": "Starter audit volume",
          "essentialAiRecommendations": "Essential AI recommendations",
          "emailSupport": "Email support"
        }
      },
      "professional": {
        "description": "For growing teams running advanced audits.",
        "features": {
          "higherAuditVolume": "Higher audit volume",
          "advancedReports": "Advanced reports",
          "teamCollaboration": "Team collaboration",
          "priorityAiRecommendations": "Priority AI recommendations",
          "prioritySupport": "Priority support"
        }
      },
      "enterprise": {
        "description": "Organization-grade governance & control.",
        "features": {
          "highestAuditVolume": "Highest audit volume",
          "advancedTeamManagement": "Advanced team management",
          "organizationControls": "Organization controls",
          "customBranding": "Custom branding",
          "dedicatedSupport": "Dedicated support",
          "enterpriseReadyGovernance": "Enterprise-ready governance"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Billing currency detected from your region: {currency} {symbol}",
        "default": "Billing currency: {currency} {symbol}"
      },
      "secureCheckoutBadge": "Secure checkout powered by Stripe",
      "heading": "Choose the plan that fits your audit workflow",
      "subheadingPrefix": "Start in Stripe test mode. No real charges are made — use test card",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Current plan",
      "statusNoSubscription": "No subscription",
      "freePlanNote": "Free plan — no active subscription",
      "paidPlanSummary": "${price}/mo · billed {billingCycle}",
      "renews": " · Renews {date}",
      "cancelsAtPeriodEnd": "⚠ Cancels at period end ({date})",
      "billedInCurrency": "Your active subscription is billed in {currency}.",
      "resumePlan": "Resume plan",
      "cancelPlan": "Cancel plan"
    },
    "billingActions": {
      "title": "Billing actions",
      "manageSubscription": "Manage subscription",
      "managePaymentMethods": "Manage payment methods",
      "loading": "Loading…",
      "paymentMethodsHint": "Update card, set default, remove — handled securely by Stripe.",
      "noCustomerYet": "No Stripe customer yet. Payment methods become available after your first subscription or token purchase.",
      "portalError": "Unable to open Stripe portal. Verify Worker is running."
    },
    "tokens": {
      "title": "Tokens",
      "balance": "{balance} / {allocation} this cycle",
      "balanceLoading": "Token balance loading…",
      "manageTokens": "Manage tokens"
    },
    "usage": {
      "sectionTitle": "Usage this period",
      "auditsLabel": "Audits",
      "seatsLabel": "Seats",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Period: {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Invoices",
      "empty": "No invoices yet.",
      "loading": "Loading invoices…",
      "emptyAfterFirstCycle": "Invoices will appear here after your first billing cycle.",
      "tableHeaders": {
        "date": "Date",
        "description": "Description",
        "amount": "Amount",
        "status": "Status",
        "invoiceNumber": "Invoice number",
        "actions": "Actions"
      },
      "statusUnknown": "unknown",
      "actionView": "View",
      "actionPdf": "PDF",
      "managedInStripeNote": "Payment method and billing details are managed securely in Stripe."
    },
    "mockPlans": {
      "sectionTitle": "Plans",
      "currentBadge": "Current",
      "free": "Free",
      "priceSuffix": "/mo",
      "switch": "Switch",
      "contactOwnerToChange": "Contact owner to change plan"
    },
    "mockConfirm": {
      "title": "Switch to {plan}",
      "body": "This is a mock action — no real charge will occur.",
      "cancel": "Cancel",
      "confirm": "Confirm (mock)"
    },
    "locked": {
      "title": "Billing access restricted",
      "subtitle": "Contact your workspace owner to view or manage billing.",
      "backToDashboard": "Back to dashboard",
      "contactWorkspaceOwner": "Contact workspace owner",
      "askOwnerToast": "Ask your workspace owner for billing access."
    },
    "success": {
      "headline": {
        "failed": "Sync failed",
        "active": "Your {plan} plan is active",
        "activating": "Thank you — your subscription is being activated"
      },
      "subtext": {
        "failedFallback": "We could not finalize your subscription automatically.",
        "redirecting": "Redirecting you to Billing…",
        "syncing": "We are syncing your subscription with Stripe."
      },
      "pill": {
        "failed": "Sync failed",
        "activated": "Subscription activated",
        "syncing": "Syncing subscription…",
        "almostDone": "Almost done…"
      },
      "backToBilling": "Back to Billing",
      "retrySync": "Retry sync",
      "errors": {
        "stillProcessing": "Payment is still being processed. Please wait a moment and try again.",
        "sessionInvalid": "This checkout session is no longer valid. Please start a new subscription.",
        "notSignedIn": "You are not signed in. Please sign in and retry.",
        "orgLinkFailed": "Could not link this subscription to your organization. Please contact support.",
        "generic": "Something went wrong while activating your subscription.",
        "noSessionDetected": "We could not detect your checkout session. Please return to Billing and try again."
      }
    }
  },
  teamPage: {
    "header": {
      "title": "Team",
      "subtitlePrefix": "Manage who has access to",
      "subtitleSuffix": "and what they can do.",
      "subtitleFallbackOrg": "your workspace",
      "inviteButton": "+ Invite member"
    },
    "stats": {
      "totalMembers": "Total members",
      "active": "Active",
      "pendingInvites": "Pending invites",
      "adminsAndOwners": "Admins & owners"
    },
    "filters": {
      "all": "All",
      "owners": "Owners",
      "admins": "Admins",
      "billing": "Billing",
      "members": "Members",
      "clients": "Clients",
      "pending": "Pending"
    },
    "roles": {
      "owner": "Owners",
      "admin": "Admins",
      "billing": "Billing",
      "member": "Members",
      "client": "Clients"
    },
    "emptyState": {
      "noMembers": "No members in this workspace yet.",
      "noMatch": "No members match the \"{filter}\" filter."
    },
    "confirm": {
      "cancelInvite": "Cancel this pending invite?",
      "regenerateLink": "Regenerate invite link? The old link will stop working.",
      "removeMember": "Remove this member from the workspace? This cannot be undone."
    },
    "toast": {
      "cancelFailed": "Cancel failed",
      "newLinkCopied": "New invite link copied to clipboard.",
      "regenerateFailed": "Regenerate failed",
      "roleUpdateFailed": "Role update failed",
      "memberRemoved": "Member removed.",
      "removeFailed": "Remove failed",
      "memberDisabled": "Member disabled.",
      "disableFailed": "Disable failed",
      "disableUnavailableMock": "Disable not available on mock layer.",
      "memberEnabled": "Member enabled.",
      "enableFailed": "Enable failed",
      "enableUnavailableMock": "Enable not available on mock layer."
    },
    "pendingInvites": {
      "heading": "Pending invites ({count})",
      "tableHeaders": {
        "email": "Email",
        "role": "Role",
        "expires": "Expires",
        "actions": "Actions"
      },
      "copyLink": "Copy link",
      "regenerateLink": "Regenerate link",
      "cancel": "Cancel",
      "linkHiddenNote": "Link hidden for security. Click Regenerate link to issue a new one."
    },
    "rolesLegend": {
      "lead": "**About roles —**",
      "owners": "**Owners** manage billing and workspace settings.",
      "admins": "**Admins** manage organization users.",
      "billing": "**Billing** users manage invoices and subscription.",
      "members": "**Members** can use audit features.",
      "clients": "**Clients** have limited viewer access."
    },
    "footerHint": "Invitations are mock-only for now. Real email delivery and Firebase Auth will replace this layer in the backend phase."
  },
  orgCreate: {
    "heading": "Create a workspace",
    "subtitle": {
      "signedIn": "Signed in as {email}",
      "anonymous": "Set up a new organisation workspace"
    },
    "form": {
      "nameLabel": "Workspace name",
      "namePlaceholder": "e.g. Acme Corp",
      "planLabel": "Plan"
    },
    "planDesc": {
      "free": "Up to 3 audits, 1 seat",
      "starter": "15 audits, 5 seats",
      "professional": "30 audits, 20 seats",
      "enterprise": "Custom limits, SSO, SLA"
    },
    "submit": {
      "idle": "Create workspace",
      "loading": "Creating workspace…"
    },
    "backToDashboard": "← Back to dashboard"
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Audit submitted",
        "preview": "Audit preview"
      },
      "title": "Audit Result",
      "submissionId": "Submission ID {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Here is what your audit means",
      "summary": {
        "overallScore": "Overall score {score}/100 — {risk} risk.",
        "findingsSingular": "{n} finding across {m} recommended action.",
        "findingsPlural": "{n} findings across {m} recommended actions.",
        "maturity": "AI maturity: level {level} of 5."
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Guided action plan",
      "title": "Your Action Plan",
      "intro": "We translated your audit answers into a sequenced, contextual plan. Read through each section below — every claim links back to your data.",
      "score": "Score {globalScore} / 100",
      "backToResult": "← Back to result"
    },
    "detected": {
      "eyebrow": "01 · Diagnosis",
      "title": "What we detected",
      "topIssuesLabel": "Top issues identified",
      "noIssues": "✓ No issues to surface — the audit cleared every rule.",
      "weakestAreaLabel": "Weakest area",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "Closing this section's gap is the highest-leverage move on your global score.",
      "noWeakArea": "No weak area detected."
    },
    "priorities": {
      "eyebrow": "02 · Priorities",
      "title": "What you should fix first",
      "intro": "Out of {count} recommended actions, these three give you the highest return relative to effort. Each links back to the findings it closes.",
      "whyItMattersLabel": "Why it matters: ",
      "expectedOutcomeLabel": "Expected outcome: ",
      "impactBadge": "{impact} impact",
      "timeframeDays": "{days}d",
      "closesFindingsOne": "closes {count} finding",
      "closesFindingsOther": "closes {count} findings",
      "startWithThis": "Start with this →",
      "startWithThisTooltip": "Coming post-J2",
      "mostLeverage": "Most leverage for the effort"
    },
    "operatingModel": {
      "eyebrow": "03 · Operating model",
      "title": "What to automate or structure",
      "intro": "Each item below has a primary mode of execution. Automating where you should structure (or vice versa) is a common failure pattern.",
      "categories": {
        "automate": {
          "eyebrow": "Tools & systems",
          "title": "Automate",
          "tagline": "Items where the leverage comes from the system, not the human."
        },
        "structure": {
          "eyebrow": "Policy & governance",
          "title": "Structure",
          "tagline": "Items that need formal ownership, policy, or framework alignment."
        },
        "process": {
          "eyebrow": "Recurring motion",
          "title": "Operate",
          "tagline": "Items that are processes you keep running on a cadence."
        },
        "train": {
          "eyebrow": "People",
          "title": "Train",
          "tagline": "Items that change behaviour through education."
        }
      },
      "actionsCountOne": "{count} action",
      "actionsCountOther": "{count} actions",
      "timeframeDays": "{days}d",
      "emptyColumn": "Nothing here right now."
    },
    "whyItMatters": {
      "eyebrow": "04 · Context",
      "title": "Why this matters",
      "frameworksReferenced": "Frameworks referenced in this assessment"
    },
    "impact": {
      "eyebrow": "05 · Impact",
      "title": "Expected business impact",
      "ifTop3": "If you complete the top 3 actions",
      "scoreLift": "Your projected global score moves from {currentScore} to {projectedScore}. This is a directional simulation based on the findings each action closes — actual movement depends on execution depth.",
      "projectedLabel": "Projected",
      "deltaPts": "+{delta} pts",
      "noChange": "no change",
      "toneHighLift": "High lift",
      "toneSteadyGain": "Steady gain",
      "toneHoldTheLine": "Hold the line",
      "outcomes": {
        "auditReadinessTitle": "Audit-readiness",
        "auditReadinessHigh": "You move from \"incomplete\" to \"defensible\" in a security questionnaire.",
        "auditReadinessSteady": "Existing posture documented and easier to reference in audits.",
        "incidentExposureTitle": "Incident exposure",
        "incidentExposureHigh": "Reduced blast-radius and faster mean time to contain when AI causes harm.",
        "incidentExposureSteady": "Predictable response and clearer ownership for AI-specific incidents.",
        "customerTrustTitle": "Customer trust",
        "customerTrustHigh": "Disclosure, model cards, and explainability give your support and sales teams clear answers.",
        "internalVelocityTitle": "Internal velocity",
        "internalVelocitySteady": "Builders ship faster when policy and review paths are unambiguous."
      },
      "disclaimer": "The projected score is a directional simulation computed from finding coverage and section weights. It is not a guarantee."
    },
    "nextStep": {
      "eyebrow": "06 · Recommended",
      "title": "Your next step",
      "nextOneThing": "Next 1 thing",
      "savedAt": "Saved locally at {timestamp}.",
      "localOnlyNote": "We'll keep this plan available locally — no upload, no account upgrade required. Come back whenever your team is ready to act.",
      "ctas": {
        "saveDefault": "✓ Save this action plan",
        "saved": "✓ Saved",
        "reminderSet": "✓ Reminder set",
        "exported": "✓ Exported",
        "remind7Day": "⏰ Set 7-day reminder",
        "remind30Day": "⏰ Set 30-day reminder",
        "remind60Day": "⏰ Set 60-day reminder",
        "remindQuarterly": "⏰ Set quarterly check-in",
        "exportPlan": "⬇ Export plan"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "You operate in a context that regulators already treat as high-stakes. The EU AI Act, GDPR, and sector-specific rules (HIPAA-equivalents, financial-services frameworks) all apply additional duties when AI processes sensitive data or makes consequential decisions about people.",
        "customerFacingTransparency": "Your AI is customer-facing, which means transparency obligations apply (EU AI Act Article 50, consumer protection rules) and the reputational stakes are higher than for internal tools.",
        "internalBaseline": "Even for internal AI use, recognised frameworks (ISO/IEC 42001, NIST AI RMF) increasingly act as a baseline for vendor due diligence and enterprise deals.",
        "riskInactionHigh": "At your current risk band, the cost of inaction is asymmetric. A single incident — a model leaking data, an unfair decision, an outage with no runbook — is materially more expensive than the fixes recommended below.",
        "riskInactionMedium": "You are in a defensible middle band. The risk now is plateauing: organisations that stop here typically slip backwards as their AI footprint grows. Closing the medium-severity gaps locks in the current posture.",
        "riskInactionLow": "You already have meaningful posture. The risk is regression as your AI footprint scales. Ongoing investment is mostly maintenance, documentation, and gradual deepening.",
        "weakestSection": "Your weakest area is **{title}** ({score}%). Strengthening it directly increases the global score, but more importantly it removes the path of least resistance for an incident.",
        "commercialEnabler": "Enterprise buyers and regulated customers increasingly ask for AI governance evidence in security questionnaires. Many of the items in your action plan double as commercial enablers, not just compliance work."
      },
      "riskOneLiner": {
        "low": "You are in good shape — focus shifts to maintenance and continuous improvement.",
        "medium": "You have a defensible baseline, but with material gaps that are worth closing soon.",
        "high": "You have several gaps that materially raise your exposure. Prioritise the actions below.",
        "critical": "You have one or more critical gaps. The highest-priority items should be addressed within days, not weeks."
      },
      "contextChips": {
        "highRiskIndustry": "High-risk industry",
        "sensitiveData": "Sensitive data in scope",
        "customerFacing": "Customer-facing AI",
        "missionCritical": "Mission-critical scope",
        "standardProfile": "Standard risk profile"
      },
      "nextStep": {
        "criticalHeadline": "Address the critical finding within the next 7 days",
        "criticalRationaleFallback": "It is the most material item in your action plan.",
        "highHeadline": "Start with the 30-day quick wins",
        "highRationaleFallback": "High-risk posture responds quickly to a small number of targeted actions. Pick three quick wins from the roadmap and own them this month.",
        "mediumHeadline": "Solidify your governance foundations",
        "mediumRationale": "You are past the initial scramble. The next compounding move is to formalise what you do informally — a written policy, a recognised framework, documented escalation. This is what makes audits and enterprise deals routine.",
        "lowHeadline": "Move from compliant to optimised",
        "lowRationale": "Your posture is strong. The leverage now is documentation and continuous improvement — model cards, training refreshes, and integrating AI scenarios into your incident-response rehearsals."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Compliance Score",
      "riskLabel": "Current Risk Level",
      "maturityLabel": "AI Maturity Level",
      "nextStepLabel": "Recommended Next Step",
      "nextStepTitle": "Complete HR Screening Tool Audit",
      "nextStepBody": "This audit is 60% complete. Finishing it will boost your compliance score by an estimated +7 points.",
      "continueAudit": "Continue Audit →",
      "toast": {
        "noPermission": "You do not have permission to continue audits.",
        "noDraft": "No draft audit found — starting a new audit."
      }
    },
    "recentReports": {
      "card": {
        "share": "Share",
        "view": "View"
      },
      "export": {
        "title": "Export Options",
        "blurb": "Export your compliance data in multiple formats for stakeholders.",
        "exportAs": "Export as {fmt}"
      },
      "toast": {
        "reportNotAvailable": "Report not available yet.",
        "shareLinkCopied": "Share link copied.",
        "shareLinkFailed": "Could not copy link. Try again.",
        "noReportsToExport": "No reports to export yet.",
        "csvDownloaded": "CSV downloaded.",
        "jsonDownloaded": "JSON downloaded."
      }
    },
    "cta": {
      "heading": "Ready to achieve full AI compliance?",
      "body": "Join organizations using AiLunaPro to automate their compliance workflows, reduce risk, and build trust with stakeholders.",
      "toast": {
        "alreadyActivePlan": "You already have an active plan.",
        "demoRequestSent": "Demo request sent. We'll review it and get back to you."
      },
      "demoModal": {
        "title": "Schedule a demo",
        "subtitle": "Tell us a bit about your team and we'll be in touch.",
        "placeholderFullName": "Full name",
        "placeholderWorkEmail": "Work email",
        "placeholderCompany": "Company",
        "labelCountry": "Country",
        "errorCountry": "Please select a country.",
        "placeholderPhone": "Phone number",
        "errorPhone": "A valid phone number is required.",
        "placeholderMessage": "What would you like to discuss?",
        "privacyNote": "We only use these details to respond to your request.",
        "cancel": "Cancel",
        "submit": "Request demo",
        "submitting": "Sending…",
        "errorFallback": "Could not send your request. Please try again."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agents",
      "intro": "Find AI agents that fit your workflow. AiLunaPro all-in-one agents are highlighted.",
      "locked": {
        "title": "Agents are not available for client accounts",
        "backToDashboard": "Back to dashboard"
      },
      "filters": {
        "industryLabel": "Industry",
        "integrationLabel": "Integration",
        "allIndustries": "All industries",
        "allIntegrations": "All integrations",
        "clearFilters": "Clear filters",
        "clearRecommendationsHint": "Clear recommendations to use filters."
      },
      "loading": "Loading agents…",
      "emptyFiltered": "No agents match the selected filters.",
      "quoteBridgeTitle": "Ready to put these to work?",
      "quoteBridgeCta": "Get a quote for this",
      "quoteBridgeSeed": "AI automation project based on my recommended agents: {agents}",
      "sections": {
        "topRecommendations": "Top recommendations",
        "otherAgents": "Other agents"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} pts",
      "whyToggleOne": "Why? ({count} reason)",
      "whyToggleOther": "Why? ({count} reasons)"
    },
    "recommendPanel": {
      "title": "Personalize my recommendations",
      "subtitle": "Add a few preferences to rank agents that fit your context.",
      "fields": {
        "industry": "Industry",
        "companySize": "Company size",
        "targetWorkflow": "Target workflow",
        "subscriptionPlan": "Subscription plan",
        "currentMaturity": "Current AI maturity",
        "integrations": "Integrations (comma-separated, max 10)"
      },
      "placeholders": {
        "industry": "e.g. retail, saas, healthcare",
        "integrations": "e.g. hubspot, slack, email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Solo",
        "sme": "SME",
        "enterprise": "Enterprise"
      },
      "maturityOptions": {
        "low": "Low",
        "medium": "Medium",
        "high": "High"
      },
      "workflowOptions": {
        "support": "Customer support",
        "sales": "Sales and lead follow-up",
        "finance": "Finance and invoicing",
        "documents": "Documents and contracts",
        "reporting": "Reporting and dashboards",
        "admin": "Administrative work",
        "compliance": "Compliance and governance",
        "marketing": "Marketing and content",
        "hr": "HR and people operations"
      },
      "helperText": "Add at least one preference to personalize recommendations.",
      "submit": "Recommend agents",
      "submitting": "Computing…",
      "clearRecommendations": "Clear recommendations",
      "limitTitle": "You’ve reached your monthly limit.",
      "limitBody": "You’ve used all your recommendations this month.",
      "limitBodyCount": "You’ve used all {used} of {limit} recommendations this month.",
      "upgradeCta": "Upgrade your plan to continue",
      "usageProgress": "{used} / {limit} recommendations used this month"
    },
    "card": {
      "external": "External",
      "savesPerMonth": "⏱ Saves ~{hours} h / month",
      "moreIntegrations": "+{count}",
      "viewDetails": "View details",
      "getThisAgent": "Get this agent"
    },
    "detail": {
      "lockedNotice": "Agents are not available for client accounts.",
      "backToAgents": "← Back to agents",
      "loading": "Loading…",
      "errors": {
        "missingAgentId": "Missing agent id",
        "missingOrgContext": "Missing org context"
      },
      "pills": {
        "external": "External",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "Setup · {complexity}",
        "recommendedAllInOne": "Recommended All-in-One",
        "compliance": "Compliance",
        "audit": "Audit"
      },
      "cta": "Get this agent →",
      "sections": {
        "overview": "Overview",
        "problemSolved": "Problem solved",
        "bestFit": "Best fit",
        "integrations": "Integrations",
        "expectedRoi": "Expected ROI",
        "pricing": "Pricing"
      },
      "bestFit": {
        "industries": "Industries",
        "companySize": "Company size",
        "minBudget": "Min budget",
        "minBudgetValue": "{amount}/mo"
      },
      "roi": {
        "timeSaved": "Time saved",
        "timeSavedValue": "{hours} h/mo",
        "costSaved": "Cost saved",
        "costSavedValue": "{amount}/mo",
        "payback": "Payback",
        "paybackValue": "{months} months"
      },
      "pricing": {
        "modelPrefix": "Model: **{model}**",
        "install": " · Install: {amount}",
        "monthly": " · Monthly: {amount}",
        "onRequest": " · Pricing on request"
      }
    }
  },
  support: {
    "cta": "Contact support",
    "title": "Contact support",
    "subtitle": "Report an issue or ask a question — we'll reply by email.",
    "typeLabel": "What's this about?",
    "typeBug": "Bug",
    "typeQuestion": "Question",
    "typeBilling": "Billing",
    "descriptionLabel": "Describe it",
    "descriptionPlaceholder": "What happened? Steps, what you expected, anything that helps.",
    "emailLabel": "Email",
    "emailPlaceholder": "you@company.com",
    "priorityLabel": "Priority",
    "optional": "(optional)",
    "prioLow": "Low",
    "prioMedium": "Medium",
    "prioHigh": "High",
    "submit": "Send",
    "submitting": "Sending…",
    "success": "Thanks — your message was sent. We'll reply by email.",
    "close": "Close",
    "errType": "Please choose a type.",
    "errDescription": "Please describe the issue.",
    "errEmail": "Please enter a valid email."
  },
  feedback: {
    "title": "How was this experience?",
    "satisfactionLabel": "Rate your experience",
    "sat1": "Very poor",
    "sat2": "Poor",
    "sat3": "Okay",
    "sat4": "Good",
    "sat5": "Excellent",
    "difficultyLabel": "How easy was it to use?",
    "diffEasy": "Easy",
    "diffOk": "Okay",
    "diffHard": "Hard",
    "blockerLabel": "What prevented you from going further?",
    "blockerPlaceholder": "Optional — tell us what got in the way",
    "suggestionLabel": "Anything we could improve?",
    "suggestionPlaceholder": "Optional",
    "submit": "Send feedback",
    "success": "Thanks — we read every note.",
    "dismissAria": "Dismiss feedback"
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "AI Maturity Diagnostic",
        "subtitle": "Answer 8 short questions. Get your AI maturity score and see which AiLunaPro agents fit your stage.",
        "freeLine": "Free · No account required · Takes about 2 minutes"
      },
      "resumeNotice": "Welcome back — we restored your previous answers so you can pick up where you left off.",
      "questionLegend": "Question {n} / {total}",
      "leadCapture": {
        "heading": "Where should we send your result?",
        "emailLabel": "Email",
        "requiredMark": "*",
        "emailPlaceholder": "you@company.com",
        "companyNameLabel": "Company name",
        "optionalMark": "(optional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "We only use this information to generate your diagnostic and follow up about relevant AI services. No account is required.",
        "consentLabel": "I agree to receive my AI diagnostic result and relevant follow-up information from AiLunaPro. I understand that my answers and email will be processed to generate and store this diagnostic result, and that I can request deletion of my data at any time."
      },
      "submit": {
        "loading": "Computing your result…",
        "unlock": "Email me my full report →",
        "idle": "Get my AI maturity score"
      },
      "signInPrompt": "Already have an account?",
      "signInLink": "Sign in",
      "errors": {
        "answers": "Please answer every question.",
        "email": "Please enter a valid email address.",
        "consent": "You must accept to receive your result.",
        "captchaLoading": "Captcha is loading — please wait."
      },
      "buckets": {
        "low": {
          "title": "Your AI maturity is emerging",
          "message": "Your organization is at an early stage. Start with simple automation, an AI usage inventory, and practical support agents."
        },
        "medium": {
          "title": "Your AI maturity is developing",
          "message": "You already have some AI foundations. The next step is to structure usage, measure ROI, and improve document and reporting workflows."
        },
        "high": {
          "title": "Your AI maturity is advanced",
          "message": "You are ready to scale AI with stronger governance, compliance, reporting, and specialized automation."
        }
      },
      "result": {
        "scoreLabel": "Your AI maturity score",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Recommended AiLunaPro agents",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Get this agent",
        "ctaHeading": "Want a deeper audit and your full action plan?",
        "ctaBody": "Create a free AiLunaPro workspace to access the full audit, registry, and agent catalog.",
        "ctaButton": "Create your free account ↗",
        "ctaFootnote": "Continues on **dashboard.ailunapro.com** — the AiLuna platform for AI agents and solutions, the next step after your audit.",
        "retakeButton": "Take the diagnostic again"
      }
    },
    "roi": {
      "header": {
        "title": "AI ROI Calculator",
        "subtitle": "Estimate the time and money you can save with AiLunaPro AI agents.",
        "freeLine": "Free · No account required · Takes about 1 minute · USD"
      },
      "resumeNotice": "Welcome back — we restored your previous inputs so you can pick up where you left off.",
      "form": {
        "teamLegend": "Your team",
        "teamSizeLabel": "Team size",
        "teamSizePlaceholder": "e.g. 10",
        "monthlyHoursLabel": "Monthly hours your team spends on repetitive work",
        "monthlyHoursPlaceholder": "e.g. 80",
        "hourlyCostLabel": "Average hourly cost (USD)",
        "targetWorkflowLabel": "Target workflow",
        "workflowPlaceholderOption": "Select a workflow…"
      },
      "worksheetBridge": {
        "cta": "Overall estimate — calculate with your real data, task by task →",
        "title": "Go further: Time → Money Audit",
        "note": "This estimate is global. Calculate with your real data, task by task, and get a verdict (keep / automate / delegate)."
      },
      "leadCapture": {
        "legend": "Where should we send your estimate?",
        "emailLabel": "Email",
        "emailPlaceholder": "you@company.com",
        "companyNameLabel": "Company name",
        "optionalMark": "(optional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "We only use this information to generate your estimate and follow up about relevant AI services. No account is required.",
        "consentLabel": "I agree to receive my AI ROI estimate and relevant follow-up information from AiLunaPro. I understand that my answers and email will be processed to generate and store this estimate, and that I can request deletion of my data at any time."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "Calculating…",
        "unlock": "Email me my full report →",
        "idle": "Reveal my savings"
      },
      "signInPrompt": "Already have an account?",
      "signInLink": "Sign in",
      "errors": {
        "teamSize": "Team size must be an integer between 1 and 10000.",
        "hours": "Monthly hours must be a number between 0 and 10000.",
        "cost": "Hourly cost must be a number between 1 and 1000 USD.",
        "workflow": "Please select a workflow.",
        "email": "Please enter a valid email address.",
        "consent": "You must accept to receive your estimate.",
        "captchaLoading": "Captcha is loading — please wait."
      },
      "result": {
        "monthlySavingsLabel": "Estimated monthly savings",
        "monthlySavingsUnit": "/mo",
        "yearlySavingsLabel": "Yearly savings",
        "timeSavedLabel": "Time saved",
        "timeSavedValue": "{hours} h/mo",
        "paybackLabel": "Payback",
        "paybackValue": "{months} months",
        "paybackEmpty": "—",
        "disclaimer": "This is an estimate based on the information you provided and conservative automation assumptions. Actual savings may vary.",
        "pricingNote": "Payback assumes a reference agent cost of {cost}/month; actual pricing varies by agent.",
        "recommendedAgentsHeading": "Recommended AiLunaPro agents",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Get this agent",
        "ctaHeading": "Want a deeper analysis and your full action plan?",
        "ctaBody": "Create a free AiLunaPro workspace to access the full audit, registry, and agent catalog.",
        "ctaButton": "Create your free account ↗",
        "ctaFootnote": "Continues on **dashboard.ailunapro.com** — the AiLuna platform for AI agents and solutions, the next step after your audit.",
        "rerunButton": "Run another calculation"
      }
    },
    "quote": {
      "header": {
        "title": "Request a Quote",
        "subtitle": "Get an instant, indicative price range for a custom AI agent, automation, or website project.",
        "freeLine": "Free estimate · No account required · Indicative only"
      },
      "resumeNotice": "Welcome back — we restored your previous selections.",
      "form": {
        "serviceLegend": "What do you need?",
        "serviceLabel": "Type of service",
        "servicePlaceholder": "Select a service…",
        "tierLabel": "Project complexity",
        "tierPlaceholder": "Select a complexity level…",
        "descriptionLabel": "Project description",
        "descriptionPlaceholder": "Briefly describe your project, goals, and the tools to integrate. Please do not include confidential or personal data.",
        "optionalLegend": "A few more details (optional)",
        "businessSizeLabel": "Business size",
        "urgencyLabel": "Urgency",
        "budgetBandLabel": "Budget range",
        "notSpecified": "Not specified"
      },
      "services": {
        "ai_agent": "AI agent",
        "automation": "Automation workflow",
        "website": "Website / web app",
        "audit": "Feasibility audit"
      },
      "tiers": {
        "simple": "Simple",
        "contextual": "Contextual (MVP)",
        "autonomous": "Autonomous",
        "multi_agent": "Multi-agent system",
        "intermediate": "Intermediate",
        "complex": "Complex",
        "custom": "Custom / bespoke",
        "feasibility": "Feasibility study"
      },
      "businessSizes": {
        "solo": "Solo / freelancer",
        "small": "Small (2–20)",
        "medium": "Medium (21–100)",
        "large": "Large (100+)"
      },
      "urgencies": {
        "low": "Flexible",
        "standard": "Standard",
        "high": "Urgent"
      },
      "budgetBands": {
        "under_10k": "Under $10k",
        "10k_50k": "$10k–$50k",
        "50k_150k": "$50k–$150k",
        "over_150k": "Over $150k"
      },
      "requiredMark": "*",
      "submit": {
        "idle": "Get my estimate"
      },
      "errors": {
        "service": "Please choose a type of service.",
        "tier": "Please choose a complexity level.",
        "description": "Please describe your project (at least 20 characters)."
      },
      "result": {
        "rangeLabel": "Estimated price range",
        "openEndedSuffix": "+",
        "recommendedLabel": "Recommended solution",
        "costOfDelay": "Every month of delay carries a real cost in lost time and money.",
        "costOfDelayAmount": "Each month you wait costs about {amount} in lost time and money.",
        "decisionHeading": "Your decision at a glance",
        "decisionSummaryStrong": "You invest {invest} to recover {yearly}/year — a {y1}× first-year return.",
        "decisionSummaryLong": "You invest {invest} to recover {yearly}/year — break-even in ~{months} months.",
        "decisionReturnLabel": "First-year return",
        "decisionThreeYearLabel": "3-year return",
        "decisionBreakevenLabel": "Break-even",
        "decisionMultiple": "{mult}×",
        "decisionMonths": "~{months} mo",
        "ctaStartRecovering": "Start recovering {amount}/month",
        "scopeHeading": "What's typically included",
        "nextStepsHeading": "Next steps",
        "opsCostNote": "AI agent & automation projects also carry operating costs (tokens, infrastructure) that typically add {min}–{max}% on top of the build.",
        "disclaimer": "Indicative, non-contractual estimate for budgeting purposes only — informational only. Final pricing depends on a detailed scope.",
        "ctaHeading": "Ready to move forward?",
        "ctaBody": "Create a free AiLunaPro workspace to generate a branded PDF quote and start your project.",
        "ctaButton": "Create your free account ↗",
        "rerunButton": "Start over"
      },
      "solutions": {
        "ai_agent.simple": "Simple AI agent",
        "ai_agent.contextual": "Contextual AI agent (MVP)",
        "ai_agent.autonomous": "Autonomous AI agent",
        "ai_agent.multi_agent": "Multi-agent system",
        "automation.simple": "Simple automation workflow",
        "automation.contextual": "Contextual automation workflow",
        "automation.autonomous": "Autonomous automation system",
        "automation.multi_agent": "Multi-agent automation platform",
        "website.simple": "Simple website",
        "website.intermediate": "Intermediate website",
        "website.complex": "Complex web platform",
        "website.custom": "Custom / bespoke platform",
        "audit.feasibility": "Feasibility & scoping study"
      },
      "scope": {
        "discovery": "Discovery & requirements workshop",
        "design": "Solution design & architecture",
        "integration": "Integration with your tools (CRM/ERP, APIs)",
        "deployment": "Deployment & handover",
        "monitoring": "Monitoring & support setup",
        "mapping": "Process mapping & workflow design",
        "build": "Build & development",
        "content": "Content & data setup",
        "launch": "Launch & go-live",
        "assessment": "Current-state assessment",
        "gapAnalysis": "Gap analysis",
        "recommendations": "Prioritized recommendations",
        "roadmap": "Implementation roadmap"
      },
      "nextSteps": {
        "discoveryCall": "Book a discovery call to refine the scope",
        "scoping": "Receive a detailed scoping document",
        "proposal": "Get a formal proposal & timeline"
      },
      "generate": {
        "button": "Get my personalized plan",
        "cost": "{n} tokens",
        "loading": "Generating…",
        "success": "Your quote has been generated and saved to your workspace.",
        "error": "Could not generate the quote. Please try again.",
        "needOrg": "Select a workspace to generate a quote."
      },
      "guided": {
        "goalsLabel": "Common goals — select any that apply",
        "detailsLabel": "Anything else? (optional)",
        "detailsPlaceholder": "Add specifics: tools to integrate, timeline, must-haves… Please don't include confidential or personal data.",
        "paymentNote": "For custom projects, payment is typically made by bank transfer (wire) against an invoice. A final invoice will be generated after project validation. This estimate is indicative and non-contractual.",
        "selectError": "Select at least one goal or add a short description.",
        "suggestions": {
          "support": "Automate customer support",
          "crm": "Connect AI to my CRM",
          "workflows": "Automate internal workflows",
          "dataEntry": "Automate data entry",
          "reporting": "Automated reporting & insights",
          "integrations": "Integrate my existing tools",
          "notifications": "Automated notifications & alerts",
          "dataSync": "Sync data between systems",
          "showcase": "Showcase my company",
          "leads": "Generate leads",
          "ecommerce": "Sell online (e-commerce)",
          "dashboard": "Internal dashboard / portal",
          "booking": "Online booking / scheduling",
          "feasibility": "Assess feasibility",
          "readiness": "Check AI / EU AI Act readiness",
          "vendorCompare": "Compare solutions / vendors",
          "roadmap": "Get an implementation roadmap"
        }
      },
      "pdf": {
        "download": "Download PDF",
        "docTitle": "Project quote",
        "summaryHeading": "Project summary",
        "pricingHeading": "Estimated investment"
      },
      "email": {
        "clientLabel": "Client email (optional) — leave empty to send to yourself",
        "clientPlaceholder": "client@company.com",
        "button": "Email me this quote",
        "sent": "Quote sent to your inbox.",
        "error": "Could not send the email. Please try again."
      },
      "send": {
        "heading": "Send the proposal to your client",
        "intro": "Enter your client's email — we'll send them the proposal with the quote price, ready to approve online.",
        "emailLabel": "Client email",
        "emailRequired": "Client email is required to send the proposal.",
        "budgetBelowMin": "Budget must be at least {min} (the estimated minimum).",
        "submit": "Send proposal to client",
        "hint": "Your client receives the proposal and approves the quote online.",
        "sentTo": "Proposal sent to {email}",
        "sentNext": "We'll notify you when your client responds. Track it in the Admin Center.",
        "track": "Open the Admin Center"
      },
      "override": {
        "toggle": "Adjust price (admin)",
        "minLabel": "Min (USD)",
        "maxLabel": "Max (USD)",
        "reasonLabel": "Justification",
        "save": "Save adjustment",
        "error": "Could not save the adjustment.",
        "invalid": "Enter a valid min/max (USD) and a short justification.",
        "adjustedNote": "Adjusted price: {range}"
      },
      "proposal": {
        "execSummaryTemplate": "This proposal outlines a {solution} tailored to your goals and existing tools.",
        "solutionHeading": "Proposed solution",
        "paymentHeading": "Payment",
        "timelineHeading": "Indicative timeline",
        "coverClient": "Prepared for",
        "coverDate": "Date",
        "coverValid": "Valid until",
        "coverRef": "Reference",
        "solutionDesc": {
          "ai_agent": "A custom AI agent that automates your selected goals and connects to your existing tools (CRM/ERP, APIs).",
          "automation": "An automation workflow that links your tools and removes manual, repetitive steps.",
          "website": "A professional website or web platform built around your business objectives.",
          "audit": "A feasibility and scoping study that de-risks the project before any build."
        },
        "timeline": {
          "agent": "Discovery & design — 1–2 weeks\nBuild & integration — 4–8 weeks\nTesting & deployment — 1–2 weeks",
          "website": "Discovery & design — 1–2 weeks\nBuild — 3–6 weeks\nContent & launch — 1 week",
          "audit": "Assessment — 1 week\nAnalysis & recommendations — 1 week"
        },
        "justification": {
          "heading": "How this estimate is calculated",
          "market": "Based on 2026 market references for {category} projects at {tier} complexity.",
          "complexity": "Reflects {tier} project complexity.",
          "scope": "Covers {count} core workstreams, including integration with your tools.",
          "ops": "AI agent & automation projects add {min}–{max}% in operating costs (tokens, infrastructure)."
        }
      },
      "accepted": {
        "bankProceedCta": "Approve — receive transfer instructions",
        "bankMessage": "For projects above $15k, payment is secured via bank transfer.",
        "title": "Your response has been sent",
        "s1": "Invoice generated — available right away",
        "s2": "Secure online payment or bank transfer",
        "s3": "Payment confirmation by email",
        "s4": "Project kickoff by our team",
        "step1": "Your invoice is generated instantly",
        "step2": "Pay online by card, or by bank transfer",
        "step3": "You receive a payment confirmation by email",
        "step4": "Our team kicks off your project",
        "trackCta": "Track your request",
        "viewInvoice": "View your invoice",
        "emailTitle": "One step to go",
        "emailBody": "To confirm and receive your invoice, accept the quote in your AiLunaPro workspace.",
        "confirmTitle": "Approve your quote",
        "confirmBody": "One click generates your invoice instantly — you get secure payment options (card or bank transfer) and our team starts preparing your project.",
        "confirmCta": "Approve & get my invoice",
        "confirming": "Generating your invoice…",
        "confirmError": "Something went wrong. Please try again or reply to your quote email.",
        "discussConfirmBody": "Confirm to send your adjustment request to our team.",
        "discussCta": "Send request",
        "sentTitle": "Request received",
        "sentBody": "We've received your request and will reach out to adjust the proposal.",
        "discussTitle": "Request a price adjustment",
        "discussBody": "To request a change, reply to your quote email and we'll follow up.",
        "back": "Back to the quote tool"
      },
      "flow": {
        "heading": "How it works",
        "s1": "Accept the proposal",
        "s2": "Your invoice is generated instantly",
        "s3": "Pay by card or bank transfer",
        "s4": "The project starts"
      },
      "decision": {
        "priceLabel": "Recommended investment",
        "valueItem1": "End-to-end delivery — scoping, build, deployment and handover included",
        "valueItem2": "A dedicated expert team, with support at every step",
        "valueItem3": "Scope validated together before anything is billed",
        "priceNote": "No payment today — your invoice is only issued after you approve the proposal. Secure payment by card or bank transfer.",
        "impactHeading": "What this changes for your business",
        "impact1": "Hours of manual work automated every week — your team focuses on high-value tasks",
        "impact2": "Fewer manual errors and a stronger, audit-ready compliance posture",
        "impact3": "Capacity to scale operations without growing headcount",
        "suggestedLabel": "Suggested price (system)",
        "finalLabel": "Final price sent (USD)",
        "reasonPlaceholder": "Reason for adjustment (optional)",
        "resetPrice": "Reset to suggested",
        "billedUsd": "Billed in USD. The client sees this converted to their currency.",
        "adjustHeading": "Propose your budget",
        "budgetIntro": "This is the amount you propose. Your client validates it or requests an adjustment.",
        "rangeLabel": "Estimated range",
        "messagePlaceholder": "Add a message — what would you like to adjust?",
        "messageSend": "Send request",
        "budgetLabel": "Your proposed budget",
        "budgetPlaceholder": "e.g. 50000",
        "budgetRequired": "Please enter your budget before submitting.",
        "verdictBelow": "Your budget is below the estimated range.",
        "verdictWithin": "Your budget is within the estimated range.",
        "verdictAbove": "Your budget is above the estimated range.",
        "accept": "Submit my budget",
        "submitHint": "Your client will validate this amount or request an adjustment.",
        "discuss": "Request a price adjustment",
        "accepted": "Estimate accepted — we'll follow up shortly.",
        "discussionSent": "Request sent — we'll reach out to discuss.",
        "error": "Could not save your decision. Please try again."
      },
      "progress": {
        "submit": "Submit",
        "review": "Review",
        "validation": "Validation",
        "invoice": "Invoice"
      },
      "status": {
        "title": "Tracking your request",
        "intro": "Here's where your request is in our process. We'll email you at each step.",
        "budgetLabel": "Quote amount",
        "waitingValidation": "Waiting for validation",
        "bank": {
          "heading": "Bank transfer instructions",
          "secureNote": "Complete your payment by secure bank transfer using the details below.",
          "cardHint": "Payment secured by bank transfer",
          "amountLabel": "Amount",
          "referenceLabel": "Payment reference",
          "companyLabel": "Company",
          "bankLabel": "Bank",
          "ibanLabel": "IBAN",
          "swiftLabel": "SWIFT / BIC",
          "deadlineLabel": "Payment by",
          "initiateBtn": "I've initiated the transfer",
          "awaitingConfirm": "Thank you — we'll confirm as soon as your transfer arrives.",
          "invoiceNote": "An invoice is issued once payment is received."
        },
        "waitingActive": "We're finalizing your amount — you'll be able to pay as soon as it's ready.",
        "reviewNote": "An expert is reviewing your request and will confirm the final amount.",
        "nextStep": "Next step: an admin will confirm the amount.",
        "payNow": "Pay now",
        "paidThanks": "Payment received — thank you! Your confirmation email is on its way and our team is starting your project.",
        "payReady": "Your invoice is ready — pay securely now.",
        "openPanel": "Open the invoices panel",
        "stateReview": "Review",
        "stateNegotiation": "Negotiation",
        "stateWaiting": "Waiting for admin",
        "stateInvoice": "Invoice",
        "back": "Back to the quote tool"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "critical": "Critical",
      "completed": "Completed",
      "inProgress": "In Progress",
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "effortLow": "Low effort",
      "effortMedium": "Med effort",
      "effortHigh": "High effort"
    },
    "riskWord": {
      "critical": "Critical risk",
      "high": "High risk",
      "medium": "Medium risk",
      "low": "Low risk",
      "minimal": "Minimal risk"
    },
    "approval": {
      "approved": "Approved",
      "pending": "Pending",
      "underReview": "Under review",
      "rejected": "Rejected"
    },
    "oversight": {
      "hitl": "Human-in-the-loop",
      "hotl": "Human-on-the-loop",
      "oot": "Autonomous"
    },
    "dataTypes": {
      "pii": "Personal data (PII)",
      "health": "Health data",
      "financial": "Financial / transactional",
      "biometric": "Biometric",
      "children": "Data on minors",
      "public": "Public / open",
      "internal": "Internal documents",
      "employee": "Employee records"
    },
    "confidence": {
      "low": "low",
      "medium": "medium",
      "high": "high"
    },
    "memberStatus": {
      "active": "Active",
      "pending": "Pending",
      "invited": "Invited",
      "disabled": "Disabled"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automates customer responses and reduces support workload.",
        "description": "AI agent designed to answer frequently asked questions, qualify support requests, route tickets, and assist customer service teams. It helps companies structure a first level of support that is available continuously without replacing human teams.",
        "problemSolved": "Slow customer response times, repetitive requests, and overloaded support teams."
      },
      "sales-agent": {
        "tagline": "Qualifies prospects and prepares commercial follow-ups.",
        "description": "Sales-focused AI agent designed to qualify leads, prepare commercial responses, generate follow-ups, and structure opportunities. It helps sales teams save time on repetitive tasks and improve prospect follow-up.",
        "problemSolved": "Poorly qualified prospects, forgotten follow-ups, and wasted sales time."
      },
      "finance-agent": {
        "tagline": "Assists with invoices, quotes, and collections.",
        "description": "AI agent designed to help classify financial documents, prepare quotes, track invoices, generate collection reminders, and flag simple anomalies. Does not replace an accountant, but greatly reduces financial administrative time.",
        "problemSolved": "Manual invoice processing, late collections, and data entry errors."
      },
      "hr-agent": {
        "tagline": "Assists HR teams with screening, summaries, and documentation.",
        "description": "AI agent designed to support repetitive HR tasks such as CV summaries, candidate notes, internal responses, employee documentation, and HR administrative follow-up. It helps teams structure information and reduce the time spent on manual document work.",
        "problemSolved": "HR teams lose time on document screening, repetitive answers, and manual follow-up."
      },
      "compliance-agent": {
        "tagline": "Helps structure AI compliance, risks, and registries.",
        "description": "AI agent designed to support compliance documentation, internal controls, AI registry preparation, and mitigation plans. It is especially useful for organizations exposed to governance, traceability, and AI compliance obligations.",
        "problemSolved": "Organizations lack clear visibility on AI compliance, scattered documentation, and unmanaged AI risks."
      },
      "marketing-agent": {
        "tagline": "Generates content, campaigns, and marketing ideas.",
        "description": "AI agent designed to generate posts, emails, landing-page content, campaign ideas, summaries, and marketing assets adapted to the company profile. It helps small teams publish more consistently without multiplying tools.",
        "problemSolved": "Marketing teams struggle with content consistency, time-consuming creation, and scattered campaign assets."
      },
      "reporting-agent": {
        "tagline": "Creates summaries, dashboards, and decision reports.",
        "description": "AI agent designed to transform internal data and information into summaries, reports, action plans, and management-ready insights. It helps leaders and managers get a clearer view without spending hours consolidating information manually.",
        "problemSolved": "Manual reports take too long to produce, and decision-makers lack concise summaries."
      },
      "audit-agent": {
        "tagline": "Supports AI audit, maturity assessment, and action plans.",
        "description": "AI agent designed to help structure audits, analyze answers, identify risks, and produce actionable recommendations. It connects AI audit, compliance, and business transformation into a practical workflow.",
        "problemSolved": "AI audits are time-consuming, manually analyzed, and difficult to prioritize."
      },
      "document-agent": {
        "tagline": "Classifies, summarizes, and extracts information from documents.",
        "description": "AI agent designed to process documents, extract key information, generate summaries, and organize files. It is useful for organizations handling many attachments, contracts, reports, HR files, financial documents, or compliance evidence.",
        "problemSolved": "Documents are poorly organized, slow to search, and expensive to summarize manually."
      },
      "admin-agent": {
        "tagline": "Automates daily administrative work.",
        "description": "General-purpose AI agent for emails, appointments, follow-ups, summaries, notes, task organization, and daily administrative workflows. It helps founders, independent professionals, and small teams save time on repetitive operational work.",
        "problemSolved": "Administrative work takes too much time, tasks are repetitive, and organization is manual."
      }
    },
    "industries": {
      "all": "all",
      "b2b": "b2b",
      "construction": "construction",
      "consulting": "consulting",
      "creator": "creator",
      "ecommerce": "ecommerce",
      "education": "education",
      "enterprise": "enterprise",
      "finance": "finance",
      "healthcare": "healthcare",
      "legal": "legal",
      "public-sector": "public-sector",
      "real-estate": "real-estate",
      "retail": "retail",
      "saas": "saas",
      "services": "services"
    },
    "companySize": {
      "enterprise": "enterprise",
      "sme": "sme",
      "solo": "solo"
    },
    "profile": {
      "high": "high",
      "medium": "medium"
    },
    "complexity": {
      "high": "high",
      "low": "low",
      "medium": "medium"
    },
    "model": {
      "subscription": "subscription"
    },
    "integrations": {
      "accounting": "accounting",
      "audit-ai": "audit-ai",
      "calendar": "calendar",
      "cloud-storage": "cloud-storage",
      "compliance-tools": "compliance-tools",
      "crm": "crm",
      "dashboard": "dashboard",
      "documents": "documents",
      "email": "email",
      "helpdesk": "helpdesk",
      "hris": "hris",
      "registry": "registry",
      "social-media": "social-media",
      "spreadsheet": "spreadsheet",
      "website": "website"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "How is AI currently used in your organization?",
        "options": {
          "none": "We do not use AI yet",
          "individual": "Some people use AI individually",
          "team": "Several teams use AI tools",
          "structured": "AI is used in structured workflows"
        }
      },
      "process_automation": {
        "label": "How much of your repetitive work is automated today?",
        "options": {
          "none": "Almost nothing is automated",
          "basic": "A few simple tasks are automated",
          "moderate": "Some important workflows are automated",
          "advanced": "Automation is part of daily operations"
        }
      },
      "data_readiness": {
        "label": "How ready is your business data for AI use?",
        "options": {
          "scattered": "Data is scattered and hard to access",
          "partial": "Some data is organized",
          "mostly_ready": "Most key data is structured",
          "ready": "Data is clean, accessible, and regularly updated"
        }
      },
      "compliance_awareness": {
        "label": "How prepared are you for AI governance and compliance?",
        "options": {
          "unknown": "We have not assessed AI risks yet",
          "basic": "We are aware of AI risks but have no process",
          "documented": "Some AI use cases are documented",
          "governed": "We have clear AI governance and review processes"
        }
      },
      "shadow_ai": {
        "label": "Do you know which AI tools are used across the company?",
        "options": {
          "no_visibility": "No, we do not have visibility",
          "partial_visibility": "We know some tools but not all",
          "mostly_visible": "We track most AI tools",
          "full_inventory": "We maintain a clear AI tool inventory"
        }
      },
      "business_impact": {
        "label": "How clearly do you measure the business impact of AI?",
        "options": {
          "not_measured": "We do not measure it yet",
          "qualitative": "We have qualitative feedback only",
          "some_metrics": "We track some time or cost savings",
          "clear_roi": "We measure ROI and business outcomes"
        }
      },
      "team_skills": {
        "label": "How confident are your teams in using AI responsibly?",
        "options": {
          "low": "Very limited confidence",
          "basic": "Basic familiarity",
          "good": "Good confidence for common tasks",
          "strong": "Strong responsible AI practices"
        }
      },
      "implementation_priority": {
        "label": "What is your main AI priority right now?",
        "options": {
          "save_time": "Save time on repetitive work",
          "improve_sales": "Improve sales or customer follow-up",
          "support_customers": "Improve customer support",
          "compliance": "Improve AI compliance and governance",
          "documents": "Process documents and reports faster"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "Customer support",
    "sales": "Sales and lead follow-up",
    "finance": "Finance and invoicing",
    "documents": "Documents and contracts",
    "reporting": "Reporting and dashboards",
    "admin": "Administrative work",
    "compliance": "Compliance and governance",
    "marketing": "Marketing and content",
    "hr": "HR and people operations"
  },
  auditTools: {
    nav: {
      worksheetLabel: "Time → Money Audit",
      worksheetHint: "Use your real data, task by task",
      visibilityLabel: "AI & Social Visibility",
      visibilityHint: "Presence in ChatGPT/Perplexity + social audit",
    },
    worksheet: {
      title: "Time → Money Audit",
      subtitle: "Enter your real data (no estimates). For each task the tool computes its verdict, its true annual cost, and the recoverable hours. Pick your currency and the period of your income (month/year/week) — the tool adapts to your country.",
      profile: {
        sectionTitle: "① Your profile",
        incomeMonth: "Net monthly income",
        incomeYear: "Net annual income",
        incomeWeek: "Net weekly income",
        periodLabel: "Income period",
        periodMonth: "per month",
        periodYear: "per year",
        periodWeek: "per week",
        currencyLabel: "Currency",
        hoursLabel: "Hours / week",
        hourlyRate: "→ Hourly rate",
        perHour: "/ h",
        invalidHint: "Enter an income and hours > 0 to compute the hourly rate.",
        helperPrompt: "Don't know your hours/week?",
        helperHoursPerDay: "Hours / day",
        helperDaysPerWeek: "Days / week",
        helperCalc: "Calculate my hours",
      },
      tasks: {
        sectionTitle: "② Your tasks",
        tip: "Tip: write the exact title (verb + object), e.g. \"review the proposals\", not \"admin\".",
        colTask: "Task",
        colHours: "H / wk",
        colWho: "Who can do it?",
        colRules: "Clear rules?",
        colEnergy: "Energy",
        colVerdict: "Verdict",
        colCost: "Cost / yr",
        colRecovered: "Rec. h",
        taskPlaceholder: "Task name",
        addRow: "+ Add a task",
        addCommon: "+ Add a common task…",
        addCommonHint: "Not sure what to add? Pick a common task.",
        splitInto: "Split into {n} tasks",
      },
      who: { self: "Only me", specialist: "A trained specialist", anyone: "Anyone trained" },
      rules: { yes: "Yes", no: "No" },
      energy: { energizing: "Energizing", neutral: "Neutral", draining: "Draining" },
      verdict: { keep: "✅ KEEP", automate: "🤖 AUTOMATE", delegate: "→ DELEGATE", rethink: "⚠️ RETHINK" },
      summary: {
        recoveredHoursYear: "Recoverable hours / yr",
        recoveredValueYear: "Recoverable value / yr",
        toAutomate: "To automate",
        toDelegate: "To delegate",
      },
      quickWins: {
        title: "③ Do this first (Quick-Wins)",
        sub: "Recoverable tasks ranked by impact (cost/yr) ÷ effort. Start at the top.",
        effortLow: "low",
        effortMed: "medium",
        effortLabel: "effort",
        perYearSuffix: "/yr",
      },
      cta: {
        headline: "You can recover {value} per year.",
        body: "{count} task(s) to automate or delegate. We price the implementation in a tailored quote.",
        button: "Build my automation plan →",
      },
      actions: {
        save: "💾 Save",
        loadExample: "Load an example",
        reset: "Reset",
        savedCloud: "Audit saved ✓ (cloud + local)",
        savedLocal: "Audit saved ✓ (local on this device)",
        needProfile: "Fill in the profile and at least one task.",
        loadOk: "Audit loaded ✓",
        loadFail: "Could not load.",
        deleteFail: "Could not delete.",
      },
      savedList: {
        title: "My saved audits",
        perYear: "/yr recov.",
        cloud: "cloud",
        local: "local",
        load: "Load",
        delete: "Delete",
      },
      verdictRule: "Verdict: Only me + energizing → Keep · otherwise Rethink. Else Anyone + clear rules → Automate · otherwise Delegate.",
      quoteSeedMain: "Automate / delegate {count} task(s) identified via the Time → Money Audit (≈ {value}/yr recoverable)",
      quoteSeedTasks: ". Tasks: {tasks}.",
      quoteSeedEnd: ".",
    },
    visibility: {
      title: "AI & Social Visibility self-assessment",
      subtitle: "Assess your presence in AI answers (GEO) and on social media. Answer No / Partial / Yes; score and recommendations update live.",
      disclaimer: "Declarative maturity indicator: the score reflects your own answers, it is not a measurement of the AI engines. For a measured audit, request an action plan.",
      choices: { non: "No", partiel: "Partial", oui: "Yes" },
      dims: {
        geoTitle: "AI Visibility (GEO / AI Search)",
        geoSub: "Presence and accuracy in ChatGPT, Perplexity, Gemini, Google AI.",
        socialTitle: "Social media & content",
        socialSub: "Authority, useful metrics, consistency, AI-content oversight.",
      },
      scoreGlobal: "Overall score (declarative)",
      note: "Grade",
      answeredOf: "{a}/{t} answered",
      empty: "Answer the questions below — your maturity score and recommendations will appear here.",
      recosTitle: "Priority recommendations",
      geoTag: "GEO",
      socialTag: "Social",
      cta: {
        headline: "Turn grade {grade} into an action plan.",
        body: "We price the implementation of your {count} priorities in a quote.",
        button: "Get an action plan / quote →",
      },
      reset: "Reset",
      questions: {
        byId: {
          geo_offer:      { label: "Do AI tools (ChatGPT, Perplexity, Gemini) correctly describe your offer and your advantages (USP)?", reco: "Publish clear \"source of truth\" pages (offer, USP, pricing) so AI engines cite the right facts." },
          geo_appear:     { label: "Does your brand appear in AI answers for your key queries?", reco: "Test your 10 key queries in ChatGPT/Perplexity; aim for presence and fix the missing pages." },
          geo_cited:      { label: "Is your site cited as a source by AI engines?", reco: "Find the third-party sources cited (Reddit, Quora, media) where you are absent → a prioritized digital-PR list." },
          geo_competitor: { label: "Do you know how AI compares you to your competitors (who it highlights)?", reco: "Audit the competitive positioning in AI answers and identify the argument that makes the competitor win." },
          geo_sentiment:  { label: "Is the AI sentiment about your brand positive and accurate?", reco: "Fix negative/incorrect facts at the source (your site) so AI engines update their perception." },
          geo_structured: { label: "Do you have structured content (FAQ, schema, pillar pages) optimized to be captured by AI?", reco: "Add FAQ, structured data (schema.org) and pillar pages to be captured as a source of truth." },
          soc_story:      { label: "Does your social content build authority (storytelling) rather than demo spam?", reco: "Move from feature spam to storytelling (failures/wins) to build authority." },
          soc_meetings:   { label: "Do you measure the qualified meetings generated (beyond likes/impressions)?", reco: "Track the \"qualified meetings\" metric: that's what counts, not likes." },
          soc_cadence:    { label: "Do you publish at a regular, sustainable cadence?", reco: "Set up a regular editorial calendar (a sustainable cadence beats irregular spikes)." },
          soc_unique:     { label: "Does your content reflect unique expertise that's hard to copy (\"productize yourself\")?", reco: "Highlight your unique angle/expertise to escape generic competition." },
          soc_repurpose:  { label: "Do you repurpose your content into several formats?", reco: "Repurpose each piece into several formats (post, video, carousel) to multiply reach." },
          soc_oversight:  { label: "Is AI-generated content supervised (anti \"Shadow Social\" / hallucinations)?", reco: "Add human review on AI content to avoid hallucinations and loss of authenticity." },
        },
      },
    },
    taskCatalog: {
      groups: {
        admin: "Administrative",
        sales: "Sales & prospecting",
        support: "Customer support",
        marketing: "Marketing & content",
        finance: "Finance & HR",
        ops: "Operations",
        strategy: "Strategy",
      },
      tasks: {
        emails_reply: "Reply to emails",
        appointments: "Book appointments",
        schedule: "Calendar / schedule management",
        filing: "Document filing",
        cold_calls: "Outbound calls (prospecting)",
        followups: "Client follow-ups",
        quotes_write: "Writing quotes",
        crm_entry: "CRM data entry",
        inbound_calls: "Inbound calls (support)",
        support_l1: "Level 1 customer support",
        reviews_faq: "Review replies / FAQ",
        content_social: "Social content creation",
        social_planning: "Social media scheduling",
        market_research: "Market research / monitoring",
        accounting: "Accounting / invoicing",
        weekly_report: "Weekly reporting",
        cv_screening: "CV screening / shortlisting",
        expenses: "Expense reports",
        data_entry: "Data entry / encoding",
        inventory: "Stock / inventory tracking",
        translation: "Content translation",
        blog_writing: "Writing articles / blog",
        high_prospecting: "High-level prospecting / meetings",
        vision: "Strategy & vision",
        onboarding: "Client onboarding",
        email_support: "Customer-support emails",
        email_sales: "Sales follow-up emails",
        meetings_internal: "Internal meetings",
        meetings_client: "Client meetings",
        content_create: "Content creation",
        content_publish: "Scheduling / publishing",
        invoice_issue: "Issuing invoices",
        quotes_custom: "Custom quotes",
        interviews: "Candidate interviews",
      },
      hints: {
        calls: "Ambiguous: INBOUND calls (support) or OUTBOUND (prospecting)? Their verdict differs — split them.",
        email: "Be specific: customer support, sales follow-ups, or internal exchanges? Each has a different verdict.",
        meeting: "Internal or client? Recurring or one-off? High-stakes client meetings are worth keeping.",
        content: "Separate CREATION (judgment, keep) and PUBLISHING/scheduling (rule-based, automatable).",
        invoice: "Standard issuing (clear rules → automate) vs negotiation/custom (judgment → keep/delegate).",
        report: "If the data is already structured, reporting is often automatable.",
        recruit: "CV screening (clear criteria → automatable) vs final interview (human judgment → keep).",
        data: "Structured input? Data entry/copying is almost always automatable.",
        writing: "First draft (AI copilot, fast) vs final validation/editing (human judgment).",
        translate: "Repetitive volume → automatable; marketing/legal nuance → human review.",
        logistics: "Route optimization / stock tracking → automatable; carrier relations → human.",
      },
      seed: {
        emails_slack: "Reply to emails / Slack",
        accounting_billing: "Accounting, invoicing",
        prospecting_clients: "Prospecting / client meetings",
        crm_data: "CRM data entry",
        social_mgmt: "Social media management",
        manual_reporting: "Manual weekly reporting",
        planning_agenda: "Calendar / schedule management",
        client_quote: "Client quote",
      },
    },
  },
  contacts: {
    nav: "Contacts",
    title: "Contacts",
    subtitleOrg: "Manage your organization's contacts and leads.",
    subtitleAll: "All contacts across every organization (read-only).",
    modeOrg: "My organization",
    modeAll: "All organizations",
    readOnlyNotice: "Read-only cross-organization view (platform operator). Switch to “My organization” to manage your own contacts.",
    noAccess: "You don't have access to contacts.",
    create: "+ New contact",
    searchPlaceholder: "Search name, email, company…",
    allTags: "All tags",
    allSources: "All sources",
    allStatuses: "All statuses",
    colName: "Name",
    colEmail: "Email",
    colCompany: "Company",
    colOrg: "Org",
    colTags: "Tags",
    colSource: "Source",
    colCountry: "Country",
    colLeadStatus: "Lead status",
    colLastActivity: "Last activity",
    colOwner: "Owner",
    colLastMessage: "Latest request",
    exportCsv: "Export CSV",
    detailTitle: "Details",
    copy: "Copy",
    copied: "Copied",
    originalRequest: "Original request",
    internalNotes: "Internal notes",
    twentySection: "Twenty CRM",
    closeDetail: "Close",
    saveNotes: "Save",
    viewDetail: "View",
    colStatus: "Status",
    colCreated: "Created",
    colActions: "Actions",
    loading: "Loading…",
    empty: "No contacts match.",
    edit: "Edit",
    block: "Block",
    unblock: "Unblock",
    delete: "Delete",
    createTitle: "New contact",
    editTitle: "Edit contact",
    phone: "Phone",
    tagsLabel: "Tags",
    tagsPlaceholder: "comma, separated, tags",
    notesLabel: "Notes",
    cancel: "Cancel",
    save: "Save",
    sources: {
      manual: "Manual",
      quote: "Quote",
      worksheet: "Worksheet",
      visibility: "Visibility audit",
      import: "Import",
      demo_request: "Demo request",
      signup: "Signup",
      reconcile: "Reconciliation",
    },
    statuses: {
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
    },
    modeCompanies: "Companies",
    companyName: "Company",
    companyContacts: "Contacts",
    companyTwentyId: "Twenty company ID",
    companyNoTwentyId: "not linked",
    companyUpdated: "Updated",
    companySearch: "Search company or organization…",
    companyEmpty: "No companies yet.",
    companyCount: "companies",
    companyDuplicate: "DUPLICATE",
    companyRename: "Rename",
    companyRenamePrompt: "New company name:",
    companyMerge: "Merge",
    companyMergeInto: "Merge into kept",
    companyMergeKeeping: "Keeping",
    companyMergePick: "now choose the duplicate to fold into it.",
    companyMergeConfirm: "Merge these companies? Every contact moves to the kept company. This cannot be undone.",
    companyReconcileDry: "Check consistency",
    companyReconcileApply: "Repair now",
    companyReconcileContacts: "Contacts scanned",
    companyReconcileRegistry: "Companies in registry",
    companyReconcileUnlinked: "Contacts without a company link",
    companyReconcileCreated: "Companies that would be created",
    companyReconcileDuplicates: "Duplicate companies",
    companyReconcileOrphans: "Companies with no contacts",
    companyReconcileNoTwenty: "Companies not linked to Twenty",
    companyReconcileWritten: "Records written",
    companyTwentyCheck: "Check Twenty",
    companyTwentyRepair: "Repair Twenty",
    companyTwentySyncConfirm: "Repair Twenty now? Every person linked to the wrong company will be repointed at the company stored here. This writes to Twenty.",
    companyTwentyPeople: "People in Twenty",
    companyTwentyChecked: "Checked",
    companyTwentySkipped: "Skipped (no company link)",
    companyTwentyMismatched: "Wrong company in Twenty",
    companyTwentyCorrected: "Repaired",
    companyTwentyCreated: "Twenty companies created",
    companyTwentyFailures: "Failures",
    modeSales: "Sales",
    pipelineSection: "Pipeline",
    pipelineStage: "Stage",
    pipelinePriority: "Priority",
    pipelineNextFollowUp: "Next follow-up",
    pipelineLastContact: "Last contact",
    pipelineNoNextStep: "No next step scheduled",
    pipelineOverdue: "OVERDUE",
    pipelineLogActivity: "Log activity",
    pipelineChannel: "Channel",
    pipelineOutcome: "Outcome",
    pipelineNoOutcome: "No outcome",
    pipelineLog: "Log",
    pipelineNotePlaceholder: "What happened? (optional)",
    pipelineRemindIn: "Remind me in",
    pipelineTimeline: "History",
    pipelineNoHistory: "Nothing recorded yet.",
    pipelineNextSet: "Next follow-up set for",
    pipelineBounced: "Address bounced — nothing scheduled. Fix the address first.",
    stage_new: "New",
    stage_assigned: "Assigned",
    stage_contacted: "Contacted",
    stage_attempted_contact: "Attempted contact",
    stage_qualified: "Qualified",
    stage_demo_scheduled: "Demo scheduled",
    stage_demo_completed: "Demo completed",
    stage_proposal_sent: "Proposal sent",
    stage_negotiation: "Negotiation",
    stage_won: "Won",
    stage_lost: "Lost",
    stage_archived: "Archived",
    channel_email: "Email",
    channel_sms: "SMS",
    channel_call: "Call",
    channel_note: "Note",
    priority_low: "Low",
    priority_normal: "Normal",
    priority_high: "High",
    priority_urgent: "Urgent",
    outcome_connected: "Connected",
    outcome_no_answer: "No answer",
    outcome_left_message: "Left message",
    outcome_positive: "Positive",
    outcome_negative: "Negative",
    outcome_bounced: "Bounced",
    event_created: "Created",
    event_signup: "Signup",
    event_import: "Import",
    event_demo_request: "Demo request",
    event_assigned: "Assigned",
    event_reassigned: "Reassigned",
    event_unassigned: "Unassigned",
    event_status_changed: "Stage",
    event_follow_up_scheduled: "Follow-up",
    event_email: "Email",
    event_sms: "SMS",
    event_call: "Call",
    event_note: "Note",
    event_company_changed: "Company",
    event_twenty_synced: "Twenty sync",
    salesQueue: "Follow-up queue",
    salesQueueClear: "Nothing overdue. Every lead has a next step.",
    salesRefresh: "Refresh",
    salesLate: "late",
    salesTotalLeads: "Total leads",
    salesOpen: "Open",
    salesWon: "Won",
    salesLost: "Lost",
    salesConversion: "Conversion",
    salesAvgCycle: "Avg cycle",
    salesFollowUpRate: "Follow-up rate",
    salesOverdue: "Overdue",
    salesDueToday: "Due today",
    salesNoNextStep: "No next step",
    salesFunnel: "Funnel",
    salesBySource: "By source",
    salesByOwner: "By owner",
    salesByCompany: "By company",
    salesByOrg: "By organization",
    salesConvHint: "total / conversion of decided leads",
    salesScope: "Scope",
    salesScopeAll: "all leads",
    salesScopeAssigned: "leads assigned to you",
    unassigned: "Unassigned",
    assignmentSection: "Assignment",
    assignedTo: "Assigned to",
    assignedBy: "Assigned by",
    assignedAt: "Assigned on",
    lastReassignedBy: "Last reassigned by",
    lastReassignedAt: "Last reassigned on",
    assignTo: "Assign to",
    assign: "Assign",
    transfer: "Transfer",
    importCsv: "Import",
    importTitle: "Import contacts",
    importHelp: "Choose a file and the import starts straight away. Duplicates are skipped automatically.",
    importFormats: "Supported: CSV (recommended) and Excel .xlsx. From Google Sheets use File → Download → Comma-separated values.",
    importColumns: "Columns",
    importRequired: "Required",
    importOptional: "Optional",
    importChooseFile: "Choose file",
    importSample: "Download sample",
    importStageReading: "Reading file…",
    importStageValidating: "Validating rows…",
    importStageImporting: "Importing…",
    importStageDone: "Completed",
    importFailed: "failed",
    importRowsFound: "rows found",
    importBatches: "batches",
    importProgress: "Importing batch",
    importImported: "imported",
    importRejected: "rows skipped",
    importStart: "Start import",
    pageSize: "per page",
    loadMore: "Load more",
    loadedCount: "loaded",
    scannedCount: "read",
    importErrors: {
      UNSUPPORTED_FORMAT: "That format is not supported. Save the file as .csv or .xlsx.",
      NOT_A_ZIP: "That file is not a readable .xlsx workbook.",
      NO_WORKSHEET: "That workbook has no worksheet.",
      UNSUPPORTED_COMPRESSION: "That workbook uses an unsupported compression method. Re-save it, or export as CSV.",
      CORRUPT_FILE: "That file could not be read. Try re-saving or exporting as CSV.",
      EMPTY_FILE: "That file has no data rows.",
      NO_EMAIL_COLUMN: "No email column found. Add a column named “Email”.",
      INVALID_EMAIL: "Invalid email",
      DUPLICATE_IN_FILE: "Duplicate in file",
      DUPLICATE_EXISTING: "Already in CRM",
      MISSING_NAME: "Missing name",
      MISSING_COMPANY: "Missing company",
      INVALID_PHONE: "Invalid phone",
      INVALID_COUNTRY: "Invalid country",
      WRITE_FAILED: "Could not save",
    },
    errors: {
      DUPLICATE_EMAIL: "A contact with this email already exists in this organization.",
      FORBIDDEN: "You can only manage contacts assigned to you.",
      FORBIDDEN_STATUS: "Only an owner or admin can block or change a contact's status.",
      FORBIDDEN_ASSIGN: "Only a super admin can assign a contact to another user.",
      NOT_A_MEMBER: "That user is not an active member of this workspace.",
      MEMBER_DISABLED: "That member is disabled.",
      BATCH_TOO_LARGE: "That batch is too large. Please split the file.",
      DUPLICATE_COMPANY: "Another company already uses that name. Merge them instead.",
      INVALID_NAME: "A company name is required.",
      SAME_COMPANY: "A company cannot be merged into itself.",
      ALREADY_MERGED: "That company was already merged.",
      CROSS_ORG_MERGE: "Companies in different organizations cannot be merged.",
      IMPORT_FAILED: "The import stopped. Rows already imported were saved.",
      INVALID_INPUT: "Please check the contact details (a valid name, email and company are required).",
      NOT_FOUND: "This contact no longer exists.",
      LOAD_FAILED: "Could not load contacts.",
      SAVE_FAILED: "Could not save. Please try again.",
    },
  },
} as const;

/** Deep map of the catalog shape to plain `string` leaves. Locales are typed
 *  `: Dict`, so the compiler enforces the EXACT nested key set of `en` (every
 *  namespace, every key) while allowing each locale its own string values. */
type DeepString<T> = { -readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dict = DeepString<typeof en>;
