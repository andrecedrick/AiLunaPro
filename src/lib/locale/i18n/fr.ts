/** B6.0 — French dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const fr: Dict = {
  nav: {
    dashboard:             'Tableau de bord',
    'new-audit':           'Nouvel audit',
    reports:               'Rapports',
    'audit-history':       'Historique des audits',
    'audit-express-run':   'Lancer Audit Express',
    'audit-express-saved': 'Audits enregistrés',
    registry:              'Registre IA',
    'system-builder':      'Constructeur de système',
    agents:                'Agents',
    team:                  'Équipe',
    settings:              'Paramètres',
    billing:               'Facturation',
    help:                  'Aide',
  },
  shell: {
    complianceSuite:  'Suite de conformité',
    signOut:          'Se déconnecter',
    workspaces:       'Espaces de travail',
    createWorkspace:  'Créer un espace de travail',
    searchWorkspaces: 'Rechercher un espace…',
    language:         'Langue',
    currency:         'Devise',
  },
  settings: {
    title:               'Préférences',
    themeTitle:          'Thème',
    themeHint:           'Choisissez l’apparence d’AiLunaPro. Application immédiate.',
    light:               'Clair',
    dark:                'Sombre',
    languageTitle:       'Langue',
    languageHint:        'Utilisée pour les libellés de l’interface et les e-mails. La traduction est déployée section par section ; les zones non traduites restent en anglais.',
    currencyTitle:       'Devise par défaut',
    currencyHint:        'Préférence d’affichage uniquement. La facturation et les packs de jetons restent en USD.',
    profileTitle:        'Profil',
    profileHint:         'Ajuste le ton des conseils et la ressource de départ recommandée. Ne modifie jamais le score, les constats ni aucune correspondance réglementaire.',
    notificationsTitle:  'Notifications par e-mail',
    notificationsHint:   'Choisissez les e-mails que vous recevez. La configuration de l’expéditeur arrive dans une phase ultérieure.',
    weeklyDigest:        'Synthèse hebdomadaire de conformité',
    weeklyDigestDesc:    'Résumé des nouveaux constats et des actions résolues chaque lundi.',
    reportReady:         'Rapport prêt',
    reportReadyDesc:     'M’avertir par e-mail lorsqu’un rapport demandé est généré.',
    teamActivity:        'Activité de l’équipe',
    teamActivityDesc:    'Invitations, changements de rôle et retraits de membres dans mes espaces de travail.',
    langToast:           'Langue : {value}',
    currencyToast:       'Devise : {value}',
    profileToast:        'Profil : {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Sections de l'audit",
      "questionCount": "{n} questions",
      "yes": "Oui",
      "no": "Non"
    },
    "section": {
      "profile": {
        "title": "Profil",
        "subtitle": "Votre organisation en un coup d'œil"
      },
      "ai-tools": {
        "title": "Outils d'IA",
        "subtitle": "Quelle IA votre organisation utilise-t-elle réellement ?"
      },
      "data": {
        "title": "Données",
        "subtitle": "Quelles données alimentent vos systèmes d'IA ?"
      },
      "governance": {
        "title": "Gouvernance",
        "subtitle": "Politiques, responsabilités et reddition de comptes"
      },
      "security": {
        "title": "Sécurité",
        "subtitle": "Protéger les systèmes d'IA et leurs données"
      },
      "transparency": {
        "title": "Transparence",
        "subtitle": "Divulgation et explicabilité"
      },
      "human-oversight": {
        "title": "Supervision humaine",
        "subtitle": "Garder les humains aux commandes"
      },
      "training-maturity": {
        "title": "Formation et maturité",
        "subtitle": "Quelle est la culture IA de votre organisation ?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Nom de l'organisation",
        "placeholder": "ex. Acme Corp"
      },
      "profile.industry": {
        "label": "Secteur d'activité principal"
      },
      "profile.size": {
        "label": "Taille de l'entreprise"
      },
      "profile.region": {
        "label": "Principale région d'activité"
      },
      "tools.categories": {
        "label": "Quelles catégories d'IA sont en production ?",
        "helper": "Sélectionnez toutes les options applicables."
      },
      "tools.vendors": {
        "label": "Principaux fournisseurs / produits d'IA",
        "placeholder": "ex. OpenAI GPT-4, Anthropic Claude, modèle interne sur AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Périmètre de déploiement"
      },
      "tools.builds_custom": {
        "label": "Entraînez-vous ou affinez-vous vos propres modèles ?"
      },
      "data.types": {
        "label": "Quels types de données sont traités par l'IA ?"
      },
      "data.residency": {
        "label": "Où les données sont-elles principalement stockées ?"
      },
      "data.governance_framework": {
        "label": "Existe-t-il un cadre de gouvernance des données documenté ?"
      },
      "data.sources": {
        "label": "Décrivez vos principales sources de données",
        "placeholder": "ex. CRM, télémétrie produit, tickets de support client, jeux de données tiers…"
      },
      "gov.committee": {
        "label": "Disposez-vous d'un comité de gouvernance de l'IA ou d'un responsable désigné ?"
      },
      "gov.written_policy": {
        "label": "Existe-t-il une politique d'IA écrite et approuvée par la direction ?"
      },
      "gov.frameworks": {
        "label": "Avec quels cadres vous alignez-vous ?"
      },
      "gov.structure": {
        "label": "Décrivez votre structure de gouvernance",
        "placeholder": "Qui est responsable du risque lié à l'IA ? Comment les décisions sont-elles escaladées ?"
      },
      "sec.controls": {
        "label": "Quels contrôles de sécurité sont en place pour les systèmes d'IA ?"
      },
      "sec.red_team": {
        "label": "Vos systèmes d'IA ont-ils fait l'objet d'un test d'intrusion ou d'un test adverse ?"
      },
      "sec.incident_readiness": {
        "label": "Dans quelle mesure êtes-vous préparé à un incident spécifique à l'IA ?"
      },
      "sec.review_process": {
        "label": "Décrivez votre processus de revue de sécurité pour les nouveaux systèmes d'IA"
      },
      "trans.disclosure": {
        "label": "Indiquez-vous aux utilisateurs finaux qu'ils interagissent avec une IA ?"
      },
      "trans.cards": {
        "label": "Tenez-vous à jour des fiches de modèle ou des fiches de système ?"
      },
      "trans.explainability": {
        "label": "Dans quelle mesure vos décisions d'IA sont-elles explicables aux utilisateurs concernés ?"
      },
      "trans.measures": {
        "label": "Décrivez vos mesures de transparence",
        "placeholder": "Registre d'IA public, divulgations dans l'application, journaux d'audit accessibles aux utilisateurs…"
      },
      "over.model": {
        "label": "Quel modèle de supervision décrit le mieux votre dispositif ?"
      },
      "over.escalation": {
        "label": "Les procédures d'escalade sont-elles documentées pour les erreurs ou préjudices liés à l'IA ?"
      },
      "over.review_categories": {
        "label": "Quelles catégories de décisions exigent une revue humaine obligatoire ?"
      },
      "over.processes": {
        "label": "Décrivez vos processus de supervision avec vos propres mots"
      },
      "train.staff_training": {
        "label": "Proposez-vous une formation à la culture de l'IA à votre personnel ?"
      },
      "train.maturity": {
        "label": "Maturité auto-évaluée de votre conformité IA"
      },
      "train.topics": {
        "label": "Quels thèmes sont couverts par votre formation ?"
      },
      "train.program": {
        "label": "Décrivez votre programme de formation (ou ce qui fait défaut)"
      }
    },
    "option": {
      "profile.industry.finance": "Finance et banque",
      "profile.industry.health": "Santé et sciences de la vie",
      "profile.industry.tech": "Technologie / SaaS",
      "profile.industry.retail": "Commerce de détail et e-commerce",
      "profile.industry.public": "Secteur public",
      "profile.industry.other": "Autre",
      "profile.size.xs": "1–10 employés",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "Union européenne",
      "profile.region.uk": "Royaume-Uni",
      "profile.region.us": "États-Unis",
      "profile.region.ca": "Canada",
      "profile.region.apac": "Asie-Pacifique",
      "profile.region.global": "Mondial / multirégional",
      "tools.categories.llm": "Grands modèles de langage (chat, agents, copilotes)",
      "tools.categories.ml": "ML classique / modèles prédictifs",
      "tools.categories.cv": "Vision par ordinateur",
      "tools.categories.speech": "Voix et audio",
      "tools.categories.rec": "Systèmes de recommandation",
      "tools.categories.rpa": "RPA / automatisation avec composants d'IA",
      "tools.scope.pilot": "Pilotes / expérimentations uniquement",
      "tools.scope.internal": "Usage interne par le personnel",
      "tools.scope.customer": "Fonctionnalités destinées aux clients",
      "tools.scope.critical": "Décisions critiques / réglementées",
      "data.types.pii": "Données personnelles (PII)",
      "data.types.health": "Données de santé",
      "data.types.financial": "Données financières / transactionnelles",
      "data.types.biometric": "Données biométriques",
      "data.types.children": "Données concernant des mineurs",
      "data.types.public": "Données publiques / ouvertes",
      "data.residency.eu": "UE / EEA",
      "data.residency.us": "États-Unis",
      "data.residency.mixed": "Mixte / multirégional",
      "data.residency.unknown": "Incertain",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Aucun cadre formel",
      "sec.controls.encryption": "Chiffrement au repos et en transit",
      "sec.controls.rbac": "Contrôle d'accès basé sur les rôles (RBAC)",
      "sec.controls.audit_logs": "Journalisation d'audit des accès au modèle et des entrées",
      "sec.controls.secrets": "Gestion des secrets (aucune clé codée en dur)",
      "sec.controls.isolation": "Isolation des tenants / des données",
      "sec.incident_readiness.1": "1 — Aucun plan",
      "sec.incident_readiness.2": "2 — Plan informel",
      "sec.incident_readiness.3": "3 — Documenté mais non testé",
      "sec.incident_readiness.4": "4 — Documenté et éprouvé",
      "sec.incident_readiness.5": "5 — Continu, intégré au SOC",
      "trans.explainability.none": "Aucune explication fournie",
      "trans.explainability.generic": "Divulgations génériques uniquement",
      "trans.explainability.category": "Justifications au niveau de la catégorie",
      "trans.explainability.individual": "Explications par décision sur demande",
      "trans.explainability.realtime": "Explications en temps réel, dans le produit",
      "over.model.hitl": "Humain dans la boucle (chaque décision revue)",
      "over.model.hotl": "Humain sur la boucle (revue par échantillonnage)",
      "over.model.oot": "Humain hors de la boucle (autonome)",
      "over.review_categories.hr": "Décisions de recrutement / RH",
      "over.review_categories.credit": "Décisions de crédit / financières",
      "over.review_categories.health": "Recommandations liées à la santé",
      "over.review_categories.content": "Résultats de modération de contenu",
      "over.review_categories.legal": "Décisions juridiques / de conformité",
      "train.maturity.1": "1 — Initial / ad hoc",
      "train.maturity.2": "2 — En développement",
      "train.maturity.3": "3 — Défini",
      "train.maturity.4": "4 — Géré",
      "train.maturity.5": "5 — Optimisé",
      "train.topics.bias": "Biais et équité",
      "train.topics.privacy": "Confidentialité et protection des données",
      "train.topics.security": "Sécurité de l'IA et usage abusif",
      "train.topics.usage": "Politiques d'usage acceptable",
      "train.topics.incident": "Réponse aux incidents"
    }
  },
  results: {
    "insightCard": {
      "whatThisMeans": "Ce que cela signifie",
      "whyItMatters": "Pourquoi c'est important",
      "howItPlaysOut": "Comment cela se concrétise",
      "exampleHeading": "Exemple — comment une entreprise similaire en profite",
      "illustrative": "(À titre indicatif.)",
      "doThisNext": "Étape suivante",
      "doThisNextWithHeading": "Étape suivante — {heading}",
      "onceDone": "Une fois terminé : {outcome}",
      "referencesPrefix": "Références : {refs}"
    },
    "explained": {
      "heading": "Ce que signifient vos résultats",
      "subtitle": "Chaque élément ci-dessous explique ce que nous avons constaté, pourquoi c'est important et l'étape suivante la plus rapide — avec les points de score que vous pouvez récupérer.",
      "emptyTitle": "Aucun écart détecté — base solide",
      "emptyWhatItMeans": "Vos réponses n'ont déclenché aucun constat — votre pratique de l'IA couvre déjà les fondamentaux que nous vérifions.",
      "emptyWhyItMatters": "C'est une base solide. Les prochains gains viendront de l'application cohérente et à grande échelle de ces contrôles.",
      "emptyFlowInput": "bonnes pratiques",
      "emptyFlowProcess": "les rendre systématiques",
      "emptyFlowOutput": "contrôles cohérents",
      "emptyFlowGain": "confiance durable et évolutive",
      "emptyExample": "Les équipes à ce stade passent du « nous le faisons » au « cela tourne tout seul » — en automatisant les parties manuelles. (À titre indicatif.)",
      "emptyDoNextHeading": "Passer à l'échelle",
      "emptyDoNextStep1": "Automatisez les contrôles que vous effectuez aujourd'hui à la main.",
      "emptyDoNextStep2": "Réauditez régulièrement pour tenir le cap.",
      "ctaSeeAgentsForThis": "Voir les agents capables de le faire",
      "ctaSeeRecommendedAgents": "Voir les agents recommandés",
      "ctaOpenDesignGuide": "Ouvrir le guide de conception",
      "ptsToRecover": "−{n} pts à récupérer",
      "priorityCritical": "Priorité : Critique",
      "priorityHigh": "Priorité : Élevée",
      "priorityMedium": "Priorité : Moyenne",
      "priorityLow": "Priorité : Faible",
      "effortBadge": "Effort : {effort}",
      "effortBadgeDefault": "Effort : moyen",
      "timeframeBadge": "~{days} jours",
      "timeframeBadgeDefault": "~30 jours"
    },
    "findings": {
      "title": "Constats",
      "total": "{n} au total",
      "empty": "✓ Aucun constat déclenché. Continuez à renforcer votre maturité grâce aux recommandations à droite.",
      "severityCritical": "Critique",
      "severityHigh": "Élevée",
      "severityMedium": "Moyenne",
      "severityLow": "Faible",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} recommandation{plural}"
    },
    "recommendations": {
      "title": "Recommandations",
      "actionsCount": "{n} actions",
      "starterResource": "Ressource de départ recommandée",
      "empty": "Aucune recommandation actionnable pour le moment.",
      "impactCritical": "Impact critique",
      "impactHigh": "Impact élevé",
      "impactMedium": "Impact moyen",
      "impactLow": "Impact faible",
      "timeframeDays": "{n} j",
      "addressesFindings": "traite {count} constat{plural}"
    },
    "actionPlan": {
      "title": "Plan d'action priorisé",
      "roadmapNote": "La feuille de route indique quand livrer ; le plan d'action indique quoi corriger en premier.",
      "bandCriticalTitle": "Critique",
      "bandImportantTitle": "Important",
      "bandImportantSubtitle": "Court terme — à traiter dans le trimestre en cours.",
      "bandImprovementTitle": "Amélioration",
      "bandImprovementSubtitle": "Bonne pratique — à planifier pour la maturité.",
      "itemCount": "{n} élément{plural}",
      "bandEmpty": "Aucun élément dans cette catégorie — rien à traiter ici pour le moment.",
      "moreNotShown": "+{n} autres non affichés",
      "impactPill": "Impact",
      "effortPill": "Effort",
      "expectedOutcome": "Résultat attendu —"
    }
  },
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Quel domaine souhaiteriez-vous le plus améliorer ?",
          "opt": {
            "support": "Support client",
            "sales": "Ventes",
            "finance": "Finance",
            "documents": "Documents",
            "reporting": "Reporting",
            "admin": "Administration",
            "compliance": "Conformité",
            "marketing": "Marketing",
            "hr": "RH"
          }
        },
        "monthlyHours": {
          "label": "Environ combien d'heures par mois sont consacrées à des tâches répétitives ?",
          "opt": {
            "low": "Un peu (~20)",
            "medium": "Une part notable (~80)",
            "high": "Beaucoup (~160)"
          }
        },
        "hourlyCost": {
          "label": "Coût horaire moyen approximatif de ce travail ?",
          "opt": {
            "low": "Plus bas (~$25)",
            "medium": "Moyen (~$45)",
            "high": "Plus élevé (~$75)"
          }
        },
        "aiUsage": {
          "label": "Comment l'IA est-elle utilisée dans votre organisation aujourd'hui ?",
          "opt": {
            "none": "Pas encore",
            "individual": "De façon individuelle",
            "team": "À l'échelle des équipes",
            "structured": "Dans des workflows structurés"
          }
        },
        "shadowAi": {
          "label": "Quelle visibilité avez-vous sur les outils d'IA utilisés ?",
          "opt": {
            "no_visibility": "Aucune",
            "partial_visibility": "Partielle",
            "mostly_visible": "La plupart",
            "full_inventory": "Inventaire complet"
          }
        }
      },
      "run": {
        "title": "Lancer l'Audit Express",
        "subtitle": "Un aperçu rapide et purement estimatif de votre maturité IA — enregistré automatiquement dans votre espace de travail.",
        "errPreviewCode": "Impossible de lancer l'aperçu ({code}).",
        "errPreview": "Impossible de lancer l'aperçu.",
        "errAnalysisCode": "Analyse indisponible ({code}).",
        "errAnalysis": "Analyse indisponible. Veuillez réessayer.",
        "errDocCode": "Analyse du document indisponible ({code}).",
        "errDoc": "Analyse du document indisponible. Veuillez réessayer.",
        "analyzeSiteTitle": "Analyser un site web public (facultatif)",
        "analyzeSiteHint": "Lit uniquement les pages publiques, respecte robots.txt. Enrichit « Ce que fait cette entreprise ».",
        "deepScan": "Analyse approfondie (plus lente, plus de pages)",
        "saving": "Enregistrement de votre résultat…",
        "journeyHeadline": "Voici ce que signifie votre aperçu",
        "journeyReadiness": "Maturité IA : {bucket} ({score}/100).",
        "journeyTimeSaved": "Temps économisé estimé ≈ {hours} heures/mois.",
        "journeyCostSaved": "Coût économisé estimé ≈ ${amount}/mois."
      },
      "cta": {
        "computing": "Calcul…",
        "getPreview": "Obtenir l'aperçu",
        "analyzing": "Analyse…",
        "analyzeSite": "Analyser le site",
        "preparing": "Préparation…",
        "downloadPdf": "Télécharger le PDF",
        "viewSaved": "Voir les audits enregistrés",
        "seeAgents": "Voir les agents adaptés à votre audit →",
        "runFullAudit": "Lancer un audit complet",
        "extracting": "Extraction…",
        "analyzeDocument": "Analyser le document →",
        "save": "Enregistrer",
        "cancel": "Annuler"
      },
      "result": {
        "snapshotHeading": "Votre aperçu · Maturité IA : {bucket} ({score}/100)",
        "whatThisMeans": "Ce que cela signifie",
        "opportunityLabel": "L'opportunité — fourchettes indicatives",
        "timeBack": "Temps regagné",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Impact sur les coûts",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Retour sur investissement",
        "howSavingLabel": "Comment l'économie se réalise",
        "flowRepetitive": "tâches répétitives",
        "flowAssisted": "assistées / automatisées",
        "flowSameWork": "même travail, moins de temps manuel",
        "flowHoursBack": "heures regagnées pour des tâches à plus forte valeur",
        "roiUnavailable": "Estimation du ROI indisponible pour cet audit.",
        "whatToDoFirst": "Par où commencer",
        "step1": "Choisissez une tâche à fort volume (réponses au support, saisie de factures, reporting).",
        "step2": "Pilotez un assistant dessus pendant ~2 semaines.",
        "step3": "Mesurez les heures avant/après — conservez ce qui est rentable.",
        "businessHeading": "Ce que fait cette entreprise",
        "businessType": "Type :",
        "businessAudience": "Audience :",
        "businessConfidence": "confiance {confidence}",
        "businessUnknown": "inconnu",
        "offers": "Offres : {list}",
        "automationHeading": "Opportunités d'automatisation",
        "opportunityItem": "{title} — impact {impact} / effort {effort}"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Évolution du score",
      "subtitle": "Score de maturité IA au fil du temps",
      "empty": {
        "title": "Les tendances apparaissent après plusieurs audits",
        "hint": "Une fois plusieurs audits soumis dans cet espace de travail, votre score de maturité IA sera représenté ici à partir de votre historique réel."
      }
    },
    "automation": {
      "title": "Opportunités d'automatisation",
      "subtitle": "Adaptées à votre usage de l'IA",
      "empty": {
        "title": "Lancez un audit pour obtenir des opportunités sur mesure",
        "hint": "Les opportunités d'automatisation sont déduites de vos réponses d'audit et de votre registre IA. Réalisez un audit et ajoutez vos outils IA pour voir des suggestions ici."
      }
    },
    "businessImpact": {
      "title": "Impact métier",
      "subtitle": "Résultats mesurés de votre programme de conformité",
      "empty": {
        "title": "Les indicateurs d'impact apparaissent à mesure que votre programme évolue",
        "hint": "Réalisez des audits au fil du temps pour constituer un historique. La réduction des risques, l'avancement de la gouvernance et le temps gagné seront calculés à partir de votre historique réel — sans estimations."
      }
    },
    "recentReports": {
      "title": "Rapports récents",
      "countOne": "{n} rapport généré",
      "countOther": "{n} rapports générés",
      "viewAll": "Tout afficher →",
      "empty": {
        "title": "Aucun rapport pour l'instant",
        "hint": "Générez un rapport à partir d'un audit soumis — il apparaît ici et sous Rapports pour cet espace de travail."
      }
    },
    "kpi": {
      "auditsSubmitted": "Audits soumis",
      "reportsGenerated": "Rapports générés",
      "aiToolsRegistered": "Outils IA enregistrés",
      "loadErrorSuffix": " — échec du chargement"
    },
    "maturity": {
      "rung": {
        "initial": "Initial",
        "managed": "Géré",
        "defined": "Défini",
        "advanced": "Avancé",
        "optimal": "Optimal"
      }
    },
    "cta": {
      "poweredBy": "Propulsé par Luna AI",
      "scheduleDemo": "Planifier une démo",
      "startFreeTrial": "Démarrer l'essai gratuit →"
    }
  },
  topbar: {
    "title": {
      "dashboard": "Tableau de bord",
      "audit/new": "Nouvel audit",
      "audit/result": "Résultat d'audit",
      "audit/assistance": "Guide de mise en œuvre",
      "audit/history": "Historique des audits",
      "reports": "Rapports",
      "reports/detail": "Rapport",
      "reports/share": "Rapport partagé",
      "registry": "Registre IA",
      "system-builder": "Concepteur de système",
      "agents": "Agents",
      "agents/detail": "Agent",
      "team": "Équipe",
      "settings": "Paramètres",
      "billing": "Facturation",
      "billing/tokens": "Tokens",
      "help": "Aide",
      "audit-express/run": "Lancer Audit Express",
      "audit-express/saved": "Audits enregistrés",
      "audit-express/detail": "Audit enregistré"
    },
    "subtitle": {
      "dashboard": "Vue d'ensemble de la conformité IA"
    },
    "search": {
      "placeholder": "Rechercher des audits, des rapports…",
      "toast": "Recherche de « {query} »…"
    },
    "dateRange": {
      "last7": "7 derniers jours",
      "last30": "30 derniers jours",
      "thisMonth": "Ce mois-ci",
      "lastMonth": "Le mois dernier",
      "customRange": "Période personnalisée…",
      "from": "Du",
      "to": "Au",
      "apply": "Appliquer la période",
      "toast": "Période : {label}",
      "errPickBoth": "Choisissez une date de début et une date de fin.",
      "errOrder": "La date de début doit être antérieure à la date de fin."
    },
    "notifications": {
      "label": "Notifications",
      "title": "Notifications",
      "empty": "Aucune notification pour le moment."
    },
    "tokens": {
      "aria": "{n} tokens restants — gérer les tokens",
      "title": "{n} tokens restants · cliquez pour gérer",
      "balance": "{used} / {total}",
      "corruptTitle": "Le solde de tokens contient des données non valides — cliquez pour réparer",
      "corruptLabel": "Les tokens nécessitent une réparation"
    },
    "luna": {
      "aria": "Ouvrir Luna, votre guide",
      "title": "Luna — votre guide",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Passer en mode sombre",
      "toLight": "Passer en mode clair"
    },
    "newAudit": {
      "label": "Nouvel audit",
      "denied": "Votre rôle ne permet pas de créer des audits. Les audits sont réservés aux rôles Propriétaire, Administrateur et Membre."
    },
    "sidebar": {
      "openMenu": "Ouvrir le menu de navigation",
      "closeMenu": "Fermer le menu de navigation",
      "menu": "Menu",
      "expand": "Déployer la barre latérale",
      "collapse": "Réduire la barre latérale"
    }
  },
  auditForm: {
    "title": "Nouvel audit",
    "subtitle": "Parcourez 8 sections pour évaluer votre posture de conformité IA. Votre progression est enregistrée au fur et à mesure — vous pouvez quitter et revenir à tout moment.",
    "loading": "Chargement de l'audit…",
    "forbiddenTitle": "Votre rôle ne permet pas de créer des audits",
    "forbiddenBody": "Les audits sont accessibles aux rôles Propriétaire, Administrateur et Membre. Demandez à un propriétaire ou à un administrateur de l'espace de travail si vous avez besoin d'un accès aux audits.",
    "errorLoad": "Échec du chargement de l'audit. Actualisez pour réessayer.",
    "pageTitle": "Nouvel audit",
    "pageIntro": "Parcourez 8 sections pour évaluer votre posture de conformité IA. Votre progression est enregistrée au fur et à mesure — vous pouvez quitter et revenir à tout moment.",
    "stepOf": "Étape {current} sur {total}",
    "overallProgress": "Progression globale",
    "previous": "← Précédent",
    "saveDraft": "Enregistrer le brouillon",
    "saveContinue": "Enregistrer et continuer →",
    "submit": "Soumettre l'audit ✓",
    "saved": "✓ Enregistré"
  },
  settingsPages: {
    "shell": {
      "title": "Paramètres",
      "subtitle": "Gérez votre profil, votre organisation et vos préférences."
    },
    "tabs": {
      "profile": "Profil",
      "org": "Organisation",
      "preferences": "Préférences",
      "billing": "Facturation"
    },
    "profile": {
      "sectionTitle": "Profil",
      "avatarHint": "L'avatar est généré à partir de vos initiales. Le téléversement personnalisé arrivera plus tard.",
      "displayName": "Nom affiché",
      "displayNamePlaceholder": "Votre nom complet",
      "email": "E-mail",
      "emailPlaceholder": "vous@exemple.com",
      "emailVerificationTitle": "Vérification de l'e-mail",
      "emailVerified": "✓ Votre e-mail est vérifié.",
      "sendVerification": "Envoyer l'e-mail de vérification",
      "sendingVerification": "Envoi…",
      "passwordTitle": "Mot de passe",
      "passwordHint": "Nous enverrons un lien de réinitialisation à votre adresse e-mail. Le lien expire au bout d'une heure.",
      "sendPasswordReset": "Envoyer l'e-mail de réinitialisation du mot de passe",
      "sendingReset": "Envoi…",
      "savedToast": "Profil mis à jour."
    },
    "org": {
      "sectionTitle": "Organisation",
      "fallbackName": "Espace de travail",
      "nameLabel": "Nom de l'organisation",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Seul le propriétaire de l'espace de travail peut renommer ou supprimer l'organisation.",
      "planTitle": "Forfait",
      "dangerZoneTitle": "Zone de danger",
      "dangerZoneHint": "La suppression d'une organisation efface toutes ses données : audits, rapports, registre et membres de l'équipe. Cette action est irréversible.",
      "deleteButton": "Supprimer l'organisation…",
      "deleteDialogTitle": "Supprimer « {name} » ?",
      "deleteDialogBody1": "Cela supprimera définitivement l'organisation, tous ses audits, rapports, éléments de registre et adhésions d'équipe.",
      "deleteDialogBody2": "Il vous sera demandé de confirmer une dernière fois avant que la moindre donnée ne soit touchée.",
      "deleteConfirmLabel": "Je comprends, continuer",
      "renamedToast": "Organisation renommée.",
      "deletionDeferredToast": "La suppression d'organisation sera activée lors d'une étape backend ultérieure."
    },
    "billing": {
      "sectionTitle": "Facturation",
      "checkingAccess": "Vérification de l'accès…"
    }
  },
  common: {
    "saveChanges": "Enregistrer les modifications",
    "saving": "Enregistrement…",
    "cancel": "Annuler",
    "loading": "Chargement…",
    "save": "Enregistrer",
    "confirm": "Confirmer",
    "close": "Fermer",
    "tryAgain": "Réessayer",
    "reloadPage": "Recharger la page",
    "retryNow": "Réessayer maintenant",
    "reload": "Recharger",
    "somethingWentWrong": "Une erreur s'est produite",
    "couldntLoadThePage": "Impossible de charger la page",
    "stillConnecting": "Connexion en cours…"
  },
  journey: {
    "label": {
      "choice": "Choisir",
      "audit": "Auditer",
      "understanding": "Comprendre",
      "adoption": "Adopter"
    },
    "hint": {
      "choice": "Choisissez comment commencer — Audit Express pour un aperçu rapide, ou un nouvel audit pour aller en profondeur.",
      "audit": "Réalisez votre audit — nous vous expliquerons ce qu'il signifie et les prochaines étapes.",
      "understanding": "Voici ce que signifie votre audit. Examinez les analyses, puis choisissez une prochaine étape."
    },
    "progress": {
      "ariaLabel": "Progression du parcours guidé"
    },
    "chooseAuditType": "Choisir le type d'audit →",
    "dismissAriaLabel": "Ignorer le parcours guidé",
    "dismiss": "Ignorer",
    "next": {
      "whatNext": "Que souhaitez-vous faire ensuite ?",
      "recommendedTag": "Recommandé",
      "backToDashboard": "Retour au tableau de bord",
      "cta": {
        "agents": {
          "title": "Voir les agents recommandés",
          "body": "Des outils adaptés à votre audit, capables de vous faire gagner du temps sur les points que vous avez signalés."
        },
        "billing": {
          "title": "Découvrir l'abonnement",
          "body": "Forfaits, tokens et ce qui est inclus — adoptez à votre rythme."
        },
        "systemBuilder": {
          "title": "Ouvrir le Concepteur de système",
          "body": "Un guide en lecture seule pour concevoir votre système d'IA selon six dimensions."
        }
      }
    },
    "start": {
      "greetingTitle": "Bonjour, je suis Luna — commençons ensemble.",
      "greetingBody": "Choisissez comment vous souhaitez débuter. Vous pouvez changer à tout moment et toujours accéder directement à votre tableau de bord.",
      "heading": "Comment voulez-vous commencer ?",
      "express": {
        "title": "Audit Express",
        "body": "Un aperçu rapide de votre maturité IA en environ 5 minutes — quelques questions rapides, une analyse de site web facultative, un ROI indicatif. Idéal pour un premier coup d'œil.",
        "cta": "Lancer Audit Express →"
      },
      "full": {
        "title": "Nouvel audit (complet)",
        "body": "Le questionnaire structuré complet — une évaluation plus poussée de la conformité et de la maturité, que vous pouvez transformer en un rapport partageable. Idéal pour une évaluation approfondie.",
        "cta": "Créer un nouvel audit →"
      },
      "skip": "Passer — accéder directement à mon tableau de bord"
    }
  },
  auth: {
    "login": {
      "title": "Se connecter",
      "subtitle": "Bon retour sur AiLunaPro",
      "forgotPassword": "Mot de passe oublié ?",
      "signingIn": "Connexion…",
      "signInButton": "Se connecter",
      "noAccountPrompt": "Vous n'avez pas de compte ?",
      "signUpLink": "S'inscrire"
    },
    "field": {
      "emailAddress": "Adresse e-mail",
      "password": "Mot de passe",
      "fullName": "Nom complet",
      "workEmail": "E-mail professionnel"
    },
    "placeholder": {
      "email": "vous@entreprise.com",
      "fullName": "Sophie Martin"
    },
    "signup": {
      "title": "Créer votre compte",
      "subtitle": "Démarrez votre parcours de conformité IA",
      "passwordHint": "8 caractères minimum",
      "creatingAccount": "Création du compte…",
      "createAccountButton": "Créer un compte",
      "haveAccountPrompt": "Vous avez déjà un compte ?",
      "signInLink": "Se connecter"
    },
    "forgot": {
      "title": "Réinitialiser le mot de passe",
      "subtitleSent": "Consultez votre boîte de réception pour le lien de réinitialisation.",
      "subtitle": "Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation.",
      "sentDetail": "Vérifiez votre dossier de spam s'il n'arrive pas.",
      "backToSignIn": "← Retour à la connexion",
      "sending": "Envoi…",
      "sendResetLink": "Envoyer le lien de réinitialisation",
      "rememberPrompt": "Vous vous souvenez de votre mot de passe ?",
      "signInLink": "Se connecter"
    },
    "invite": {
      "titleParsing": "Lecture de l'invitation…",
      "titleAuthRequired": "Connectez-vous pour accepter",
      "titleVerifying": "Vérification de l'invitation…",
      "titleAccepting": "Ajout à l'espace de travail en cours…",
      "titleDone": "Bienvenue dans l'équipe !",
      "titleError": "Problème d'invitation",
      "authRequiredBody": "Connectez-vous ou créez un compte pour accepter cette invitation.",
      "redirecting": "Redirection…",
      "pleaseWait": "Veuillez patienter un instant.",
      "createAccountButton": "Créer un compte",
      "signInButton": "Se connecter",
      "backToDashboard": "Retour au tableau de bord"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "Centre d'aide",
      "subtitle": "Trouvez des réponses, apprenez les workflows et résolvez les problèmes courants.",
      "onThisPage": "Sur cette page",
      "tocAria": "Sections d'aide",
      "keyTakeaways": "Points clés",
      "needMoreHelpTitle": "Besoin d'aide supplémentaire ?",
      "needMoreHelpBody": "Contactez le propriétaire de votre espace de travail ou le support AiLunaPro."
    },
    "gettingStarted": {
      "title": "Premiers pas",
      "lede": "AiLunaPro est une suite de conformité et de transformation par l'IA destinée aux organisations qui adoptent l'IA — audits, registre IA, recommandations d'agents, estimations de ROI et modèle d'usage basé sur des tokens, le tout dans un seul espace de travail.",
      "take1": "Commencez par le tableau de bord, puis lancez un Nouvel audit depuis la barre latérale.",
      "take2": "Deux outils publics ne nécessitent aucune connexion : le Diagnostic Express et le Calculateur de ROI.",
      "take3": "Les propriétaires et les administrateurs invitent leurs coéquipiers avec des liens valables 7 jours.",
      "firstActionsTitle": "Vos trois premières actions",
      "fa1": "Ouvrez le tableau de bord et consultez votre score actuel de maturité IA.",
      "fa2": "Lancez un Nouvel audit depuis la barre latérale pour recenser votre usage de l'IA et vos risques.",
      "fa3": "Parcourez le catalogue d'Agents pour voir quels agents AiLunaPro conviennent à votre workflow.",
      "leadMagnetsTitle": "Outils publics d'acquisition",
      "lm1": "Diagnostic Express — une évaluation gratuite de maturité IA en 8 questions, sans compte requis.",
      "lm2": "Calculateur de ROI — estimez le temps et l'argent que votre équipe peut économiser avec les agents AiLunaPro.",
      "publicLinks": "Vous trouverez les deux sur `#/diagnostic` et `#/roi-calculator`. Partagez ces liens avec vos collègues — ils ne nécessitent aucune connexion.",
      "inviteTitle": "Inviter des coéquipiers",
      "inviteBody": "Les propriétaires et les administrateurs peuvent inviter des coéquipiers depuis la page Équipe dans la barre latérale. Chaque personne invitée reçoit un lien valable 7 jours. Les rôles sont attribués au moment de l'invitation.",
      "flowTitle": "Comment ça s'enchaîne",
      "flowStep1": "Nouvel audit",
      "flowStep2": "Soumettre l'audit",
      "flowStep3": "Audit enregistré + score",
      "flowStep4": "Générer le rapport",
      "flowStep5": "Liste des rapports",
      "flowCaption": "De l'audit à un instantané de rapport partageable"
    },
    "auditVsReport": {
      "title": "Audit vs Rapport",
      "inShortTitle": "En bref",
      "inShort1": "Un **Audit** recense vos réponses et calcule votre score.",
      "inShort2": "Un **Rapport** est un **instantané** d'un audit, créé intentionnellement pour être partagé ou archivé.",
      "calloutSubmit": "**Soumettre enregistre votre audit + score.** Un **Rapport** est un instantané, créé uniquement lorsque vous cliquez sur **Générer le rapport**.",
      "whatIsAuditTitle": "Qu'est-ce qu'un Audit ?",
      "wa1": "Vos réponses à des questions structurées.",
      "wa2": "Votre score de conformité / maturité.",
      "wa3": "Une analyse dynamique qui peut évoluer avec les règles de scoring.",
      "calloutEditable": "Un audit reste modifiable jusqu'à ce que vous génériez un rapport.",
      "whatIsReportTitle": "Qu'est-ce qu'un Rapport ?",
      "wr1": "Un instantané figé à un moment précis.",
      "wr2": "Créé uniquement en cliquant sur **Générer le rapport**.",
      "wr3": "Stable même si vous lancez de nouveaux audits par la suite. Exportable et partageable, listé sous **Rapports** pour l'espace de travail actif.",
      "flowStep1": "Soumettre l'audit",
      "flowStep2": "Audit enregistré",
      "flowStep3": "Générer le rapport ?",
      "flowStep4": "Instantané de rapport",
      "flowStep5": "Liste des rapports",
      "flowCaption": "Un rapport n'est créé que via Générer le rapport",
      "calloutFlow": "**Soumettre l'audit** → enregistre l'audit + score. **Générer le rapport** → crée un instantané visible dans *Rapports*.",
      "closing": "Une vue **Historique des audits** (distincte des Rapports) est disponible dans la barre latérale. *Bientôt disponible :* rapport automatique optionnel à la soumission."
    },
    "reportsWorkspaces": {
      "title": "Rapports & Espaces de travail",
      "p1": "Les rapports sont **par espace de travail**, pas globaux. La liste des Rapports n'affiche que les rapports de l'espace de travail **actif**.",
      "flowStep1": "Espace de travail A → ses rapports",
      "flowStep2": "Espace de travail B → ses rapports",
      "flowCaption": "Chaque espace de travail conserve ses propres rapports",
      "calloutWarn": "Vous ne voyez pas un ancien rapport ? Il appartient probablement à **un autre espace de travail**. Changez d'espace de travail depuis le sélecteur en haut de la barre latérale.",
      "calloutNote": "Le filtre de date du tableau de bord n'affecte **pas** la liste des Rapports."
    },
    "fillingAudit": {
      "title": "Comment bien remplir l'audit",
      "p1": "De bonnes données produisent un audit crédible. Prenez une minute pour répondre honnêtement — le résultat reflète ce que vous y mettez.",
      "calloutInfo": "Les champs libres **« Décrivez… »** ajoutent du contexte. Votre **score provient des questions structurées (à choix)**, pas du texte libre. Utilisez des informations claires, réelles et lisibles pour un rapport crédible.",
      "li1": "Répondez à chaque question structurée — elles déterminent le score et les constats.",
      "li2": "Utilisez les champs libres pour un contexte réel (responsables, outils, processus), pas du texte fictif.",
      "li3": "Relancez l'audit à mesure que vos pratiques évoluent pour suivre vos progrès."
    },
    "agents": {
      "title": "Agents IA",
      "lede": "Le catalogue d'Agents répertorie dix agents IA prêts à l'emploi pour les workflows métier courants. Chaque carte affiche une description, le ROI attendu, un plan minimum recommandé et un lien pour démarrer.",
      "take1": "Dix agents propriétaires, chacun étiqueté AiLunaPro.",
      "take2": "Un badge de plan (Starter+ / Professional+ / Enterprise+) suggère le niveau type.",
      "take3": "« Obtenir cet agent » lance le parcours d'inscription standard — pas encore d'achat dans l'application.",
      "catalogTitle": "Catalogue (10 agents)",
      "cat1": "automatiser les réponses clients et réduire la charge de support.",
      "cat2": "qualifier les prospects et préparer les relances commerciales.",
      "cat3": "assister sur les factures, devis et recouvrements.",
      "cat4": "assister les équipes RH dans le tri, les résumés et la documentation.",
      "cat5": "aider à structurer la conformité IA, les risques et les registres.",
      "cat6": "générer du contenu, des campagnes et des idées marketing.",
      "cat7": "créer des résumés, tableaux de bord et rapports décisionnels.",
      "cat8": "accompagner l'audit IA, l'évaluation de maturité et les plans d'action.",
      "cat9": "classer, résumer et extraire des informations à partir de documents.",
      "cat10": "automatiser le travail administratif quotidien.",
      "sourceBadgeTitle": "Badge de source",
      "sourceBadgeBody": "Les agents sont étiquetés **AiLunaPro** lorsqu'ils sont propriétaires. Les futures versions feront apparaître des alternatives externes avec leur propre badge.",
      "planBadgeTitle": "Badge de plan",
      "planBadgeBody": "Chaque carte affiche un badge de plan minimum (Starter+, Professional+, Enterprise+). Il indique le niveau d'abonnement recommandé pour un usage type.",
      "getAgentTitle": "Obtenir cet agent",
      "getAgentBody": "Cliquez sur le bouton « Obtenir cet agent » pour démarrer l'onboarding. Les agents ne sont pas encore achetables directement dans AiLunaPro — le lien vous fait passer par le parcours d'inscription standard."
    },
    "tokens": {
      "title": "Tokens",
      "intro": "Les tokens sont l'unité de consommation IA dans AiLunaPro. Chaque audit, recommandation ou appel d'agent puise dans l'allocation mensuelle de tokens de votre espace de travail.",
      "howTitle": "Comment fonctionnent les tokens",
      "how1": "Votre abonnement inclut une allocation mensuelle de tokens adaptée au plan.",
      "how2": "À chaque cycle, votre solde se réinitialise. Un petit report (plafonné à une allocation mensuelle) est conservé pour éviter de perdre les tokens inutilisés.",
      "how3": "Si votre solde est faible, vous pouvez acheter un pack de recharge à tout moment.",
      "how4": "Les tokens de recharge sont ajoutés à votre solde et n'expirent jamais.",
      "how5": "Les recharges complètent votre abonnement — elles ne le remplacent pas.",
      "packsTitle": "Packs de recharge",
      "packsBody": "Trois packs sont disponibles : Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). Les packs de tokens sont actuellement facturés en USD.",
      "balanceTitle": "Où consulter votre solde",
      "balanceBody": "Le badge de tokens dans la barre supérieure affiche votre solde actuel et votre allocation mensuelle. Cliquez dessus pour ouvrir la page Tokens et accéder à l'historique d'usage complet et acheter une recharge.",
      "runOutTitle": "Quand les tokens sont épuisés",
      "runOutBody": "Les actions IA qui nécessitent plus de tokens que votre solde affichent un message clair « tokens insuffisants » et un lien pour acheter une recharge. Les propriétaires, administrateurs et gestionnaires de facturation peuvent acheter des packs. Les membres peuvent consulter les soldes mais ne peuvent pas acheter."
    },
    "billing": {
      "title": "Facturation",
      "lede": "AiLunaPro propose les plans Free, Starter, Professional et Enterprise, qui diffèrent par l'allocation de tokens, le volume d'audits et les capacités d'équipe. Le paiement et la gestion passent par Stripe.",
      "take1": "La facturation et les packs de tokens sont en USD ; le sélecteur de devise est pour l'instant purement visuel.",
      "take2": "Les propriétaires/administrateurs s'abonnent et gèrent les plans depuis la page Facturation (Portail client Stripe).",
      "take3": "Le plan Free inclut un nombre limité d'audits et 100 tokens par mois.",
      "currencyTitle": "Devise",
      "currencyBody": "La facturation et les packs de tokens sont actuellement en USD. Le sélecteur de devise de la barre latérale est une préférence d'affichage uniquement. Il ne modifie pas encore la devise de paiement Stripe ni la tarification des packs de tokens. La facturation multi-devises est prévue pour une future version.",
      "subscribingTitle": "S'abonner",
      "subscribingBody": "Depuis la page Facturation, les propriétaires et les administrateurs peuvent choisir un plan et finaliser le paiement via Stripe. L'abonnement s'active immédiatement après un paiement réussi et votre allocation de tokens se met à jour automatiquement.",
      "manageTitle": "Gérer votre abonnement",
      "manageBody": "Le bouton « Gérer l'abonnement » ouvre le Portail client Stripe où vous pouvez mettre à jour votre moyen de paiement, changer de plan, consulter les factures ou résilier. La résiliation prend effet à la fin de la période en cours.",
      "invoicesTitle": "Factures",
      "invoicesBody": "Les factures apparaissent sur la page Facturation après chaque renouvellement. Cliquez sur Voir ou PDF pour télécharger une copie.",
      "freeTitle": "Plan Free",
      "freeBody": "Le plan Free donne un accès limité aux audits et 100 tokens par mois. Utilisez-le pour explorer le produit avant de vous abonner."
    },
    "diagnostic": {
      "title": "Diagnostic Express",
      "intro": "Le Diagnostic Express est une évaluation gratuite en 8 questions qui vous attribue un score de maturité IA de 0 à 100, accompagné d'une courte liste d'agents AiLunaPro recommandés.",
      "accessTitle": "Où y accéder",
      "accessBody": "Ouvrez `#/diagnostic` dans votre navigateur. Aucune connexion requise. Prend environ deux minutes. Vous pouvez partager le lien avec vos collègues.",
      "getTitle": "Ce que vous obtenez",
      "get1": "Un score normalisé de 0 à 100.",
      "get2": "Un palier de maturité : Émergent, En développement ou Avancé.",
      "get3": "Trois agents recommandés adaptés à votre stade.",
      "get4": "Un lien direct pour créer votre compte AiLunaPro gratuit.",
      "privacyTitle": "Confidentialité",
      "privacyBody": "Les réponses soumises et votre e-mail sont conservés uniquement pour générer votre diagnostic et pour vous recontacter à propos de services IA pertinents. Vous pouvez demander leur suppression à tout moment."
    },
    "roiCalculator": {
      "title": "Calculateur de ROI",
      "intro": "Le Calculateur de ROI estime le temps et l'argent que votre équipe peut économiser en adoptant les agents IA AiLunaPro pour un workflow spécifique.",
      "accessTitle": "Où y accéder",
      "accessBody": "Ouvrez `#/roi-calculator` dans votre navigateur. Aucune connexion requise. Prend environ une minute.",
      "inputsTitle": "Données d'entrée",
      "in1": "Taille de l'équipe (1 à 10,000).",
      "in2": "Heures mensuelles que votre équipe consacre au travail répétitif.",
      "in3": "Coût horaire moyen en USD (50 par défaut).",
      "in4": "Workflow cible (parmi neuf : support, ventes, finance, documents, reporting, administration, conformité, marketing, RH).",
      "outputsTitle": "Résultats",
      "out1": "Coût mensuel estimé économisé (USD).",
      "out2": "Coût annuel estimé économisé (USD).",
      "out3": "Temps estimé économisé par mois (heures).",
      "out4": "Période de rentabilité estimée en mois.",
      "out5": "Deux agents AiLunaPro recommandés pour le workflow choisi.",
      "aboutTitle": "À propos de l'estimation",
      "aboutBody": "Le résultat se base sur les informations que vous fournissez et sur des hypothèses d'automatisation prudentes. Les économies réelles peuvent varier. La rentabilité utilise un coût d'agent provisoire de $99/month jusqu'à ce que la tarification des agents soit finalisée."
    },
    "team": {
      "title": "Équipe et rôles",
      "intro": "AiLunaPro prend en charge cinq rôles par espace de travail. Chaque rôle a une portée spécifique :",
      "thRole": "Rôle",
      "thManageWorkspace": "Gérer l'espace de travail",
      "thManageBilling": "Gérer la facturation",
      "thRunAudits": "Lancer des audits",
      "thViewReports": "Consulter les rapports",
      "limited": "limité",
      "inviteTitle": "Inviter des coéquipiers",
      "inviteBody": "Les propriétaires et les administrateurs ouvrent la page Équipe, cliquent sur Inviter, saisissent l'adresse e-mail et choisissent un rôle. La personne invitée reçoit un lien valable 7 jours. Si un lien expire ou est perdu, les propriétaires et les administrateurs peuvent le régénérer.",
      "rolesTitle": "Modifier les rôles",
      "rolesBody": "Les propriétaires et les administrateurs peuvent modifier le rôle d'un coéquipier depuis la page Équipe. Les membres peuvent être temporairement désactivés (aucun accès) puis réactivés ultérieurement, ou retirés de l'espace de travail."
    },
    "settings": {
      "title": "Paramètres",
      "lede": "Gérez votre profil, votre organisation, l'apparence et vos préférences de notification. Les sélecteurs de langue et de devise sont pour l'instant des préférences d'affichage.",
      "take1": "Les détails du profil et de l'organisation se trouvent sous Paramètres.",
      "take2": "Le thème (clair/sombre) persiste d'une session à l'autre.",
      "take3": "La langue et la devise sont purement visuelles jusqu'à la livraison de ces fonctionnalités.",
      "profileTitle": "Profil",
      "profileBody": "Mettez à jour votre nom d'affichage et votre adresse e-mail depuis **Paramètres → Profil**.",
      "orgTitle": "Organisation",
      "orgBody": "Les propriétaires peuvent renommer l'organisation depuis **Paramètres → Organisation**.",
      "themeTitle": "Thème",
      "themeBody": "Basculez entre le mode clair et sombre depuis **Paramètres → Préférences**. Votre choix persiste d'une session à l'autre.",
      "languageTitle": "Langue",
      "languageBody": "Le sélecteur de langue dans la barre latérale et dans Paramètres est une préférence uniquement. L'application s'affiche actuellement en anglais. Une prise en charge multilingue complète est prévue pour une future version.",
      "currencyTitle": "Devise",
      "currencyBody": "Le sélecteur de devise dans la barre latérale et dans Paramètres est une préférence d'affichage uniquement. La facturation et la tarification des packs de tokens restent en USD jusqu'à la mise en place de la facturation multi-devises.",
      "emailTitle": "Notifications par e-mail",
      "emailBody": "Choisissez les e-mails que vous souhaitez recevoir : récapitulatif hebdomadaire de conformité, notifications de rapport prêt et activité de l'équipe. **Paramètres → Préférences → Notifications par e-mail**."
    },
    "analytics": {
      "title": "Analytique & Cookies (Optionnel)",
      "intro": "AiLunaPro utilise une analytique produit optionnelle et respectueuse de la vie privée pour nous aider à améliorer la fiabilité et à corriger les problèmes plus rapidement. Elle est entièrement optionnelle et reste désactivée tant que vous ne l'autorisez pas.",
      "offByDefault": "**Désactivée par défaut** — rien n'est collecté tant que vous ne choisissez pas **Autoriser**.",
      "collectedTitle": "Ce qui est collecté",
      "chipNoPersonal": "Aucune donnée personnelle",
      "chipNoRecording": "Aucun enregistrement de session",
      "chipNoAds": "Aucun pistage publicitaire",
      "collectedBody": "Uniquement des signaux d'usage anonymes tels que les vues de page et les événements de fiabilité.",
      "optTitle": "Acceptez ou refusez à tout moment",
      "opt1": "Lors de votre première visite, choisissez Autoriser ou Non merci dans la petite bannière.",
      "opt2": "Votre choix est enregistré sur cet appareil — la bannière ne vous redemandera plus.",
      "opt3": "Pour le modifier, effacez le stockage de ce site dans votre navigateur (données du site) et rechargez.",
      "dntTitle": "Do Not Track",
      "dntBody": "Si votre navigateur envoie un signal « Do Not Track », l'analytique reste désactivée automatiquement et aucune bannière n'est affichée.",
      "blockedTitle": "Si l'analytique est bloquée",
      "blockedBody": "Certains navigateurs, extensions ou réseaux bloquent les requêtes d'analytique. C'est tout à fait correct — l'application fonctionne normalement dans tous les cas, et aucune action n'est requise."
    },
    "troubleshooting": {
      "title": "Dépannage",
      "lede": "Solutions rapides aux problèmes les plus courants. La plupart se résolvent par un rafraîchissement ; sinon, le propriétaire de votre espace de travail ou le support AiLunaPro peut vous aider.",
      "take1": "Rafraîchissez d'abord — cela résout la plupart des accrocs de chargement, de solde et de session.",
      "take2": "Les crédits de tokens arrivent quelques secondes après un paiement réussi.",
      "take3": "Un écran blanc provient généralement d'une extension de navigateur ou d'un filtre réseau.",
      "loadTitle": "La page ne se charge pas",
      "loadBody": "Le service peut être temporairement indisponible. Rafraîchissez la page. Si le problème persiste, contactez le propriétaire de votre espace de travail ou le support AiLunaPro.",
      "signedOutTitle": "Vous êtes déconnecté de façon inattendue",
      "signedOutBody": "Votre session a peut-être expiré. Reconnectez-vous. Si vous êtes constamment déconnecté, contactez le propriétaire de votre espace de travail.",
      "balanceTitle": "Le solde de tokens semble incorrect",
      "balanceBody": "Rafraîchissez d'abord la page. Si votre solde semble toujours erroné après un rafraîchissement, contactez le propriétaire de votre espace de travail ou le support AiLunaPro.",
      "balanceCheckoutTitle": "Le solde de tokens ne s'est pas mis à jour après le paiement",
      "balanceCheckoutBody": "Patientez un instant et rafraîchissez la page. Les crédits de tokens arrivent quelques secondes après un paiement réussi. Si le solde ne se met toujours pas à jour, contactez le propriétaire de votre espace de travail ou le support AiLunaPro.",
      "captchaTitle": "Le captcha échoue sans cesse sur les formulaires publics",
      "captchaBody": "Rechargez la page et complétez à nouveau le captcha. Si le problème persiste, essayez un autre navigateur ou contactez le support AiLunaPro.",
      "syncTitle": "La synchronisation de l'abonnement a échoué",
      "syncBody": "Sur la page de succès de Facturation, cliquez sur Relancer la synchronisation. Si l'échec persiste, contactez le support AiLunaPro et joignez votre reçu Stripe.",
      "inviteTitle": "Le lien d'invitation ne fonctionne pas",
      "inviteBody": "Les invitations expirent après 7 jours. Demandez au propriétaire de votre espace de travail ou à un administrateur de régénérer l'invitation depuis la page Équipe.",
      "roadmapTitle": "Quelle est la différence entre la Feuille de route et le Plan d'action ?",
      "roadmapBody": "Les deux vues découlent des mêmes constats d'audit et recommandations, mais elles répondent à des questions différentes. La **Feuille de route** répond à **quand** livrer le travail — les éléments sont regroupés par horizon (30 / 60 / 90 jours) pour aider à la planification et à la capacité. Le **Plan d'action priorisé** répond à **quoi corriger en premier** — les éléments sont regroupés par priorité (Critique / Important / Amélioration) selon une règle déterministe fixe basée sur la gravité du constat existant et l'impact de la recommandation. Elles sont complémentaires, pas redondantes. Aucune des deux vues ne modifie le scoring, et aucune n'est une certification de conformité.",
      "blankTitle": "Écran blanc, « Oups » ou mise en page cassée ?",
      "blankBody": "Il s'agit presque toujours d'un **bloqueur de publicités ou d'une extension de confidentialité** du navigateur (ou d'un filtre d'entreprise/VPN/DNS) qui bloque les scripts, les styles ou les requêtes de données de l'application — vous pouvez voir **ERR_BLOCKED_BY_CLIENT** dans la console. Corrigez-le en autorisant **audit.ailunapro.com** et ***.googleapis.com** dans votre bloqueur, ou ouvrez l'application dans un profil de navigateur vierge sans extensions, puis rechargez.",
      "emailTitle": "Vous n'avez pas reçu l'e-mail de vérification ou de réinitialisation du mot de passe ?",
      "emailBody": "Les e-mails de vérification et de réinitialisation du mot de passe sont envoyés par Firebase depuis l'adresse no-reply configurée de votre projet (l'expéditeur Firebase par défaut tant qu'un domaine d'expéditeur personnalisé n'est pas vérifié). Vérifiez d'abord votre dossier **spam / promotions**. Vous pouvez renvoyer l'e-mail de vérification depuis **Paramètres → Profil**, ou demander un nouveau lien de réinitialisation depuis la page **Mot de passe oublié**. Après vérification, déconnectez-vous puis reconnectez-vous pour que votre compte reflète le statut vérifié. (Les invitations d'équipe sont distinctes et envoyées via le fournisseur d'e-mail d'AiLunaPro.)"
    },
    "faq": {
      "title": "FAQ",
      "q1": "Pourquoi je ne vois pas mes anciens rapports ?",
      "a1": "Les rapports sont **par espace de travail**. Un rapport plus ancien appartient probablement à un autre espace de travail — changez d'espace de travail depuis le sélecteur en haut de la barre latérale. Le filtre de date du tableau de bord n'affecte pas la liste des Rapports.",
      "q2": "Pourquoi Rapports est-il vide ?",
      "a2": "Un audit soumis ne crée pas à lui seul un rapport. Ouvrez un audit soumis et cliquez sur **Générer le rapport** pour créer un instantané — il apparaît alors sous Rapports.",
      "q3": "Le texte aléatoire affecte-t-il mon score ?",
      "a3": "Non. Le score provient des questions structurées (à choix). Les champs libres « Décrivez… » n'ajoutent que du contexte — mais des données claires et réelles rendent votre rapport crédible.",
      "q4": "Qu'est-ce qui est enregistré, et quand ?",
      "a4": "**Soumettre l'audit** enregistre vos réponses + score. **Générer le rapport** crée un instantané distinct et partageable. Voir « Audit vs Rapport » ci-dessus.",
      "q5": "Mes données sont-elles sécurisées ?",
      "a5": "AiLunaPro utilise un accès authentifié, des permissions basées sur les rôles, les règles de sécurité Firestore et des écritures côté serveur pour les opérations sensibles. Les montants de tokens, les actions de facturation et les changements d'équipe sont validés par le serveur.",
      "q6": "Puis-je supprimer mes données ?",
      "a6": "Oui. Contactez le propriétaire de votre espace de travail ou le support AiLunaPro pour demander la suppression de votre compte ou des données de votre espace de travail.",
      "q7": "Pourquoi les packs de tokens sont-ils en USD ?",
      "a7": "AiLunaPro déploie la prise en charge multi-devises par étapes. Les abonnements prennent en charge plusieurs devises via Stripe. Les packs de tokens deviendront multi-devises dans une future version.",
      "q8": "Que fait le sélecteur de devise ?",
      "a8": "C'est une préférence d'affichage uniquement. Il ne modifie pas encore la devise de paiement Stripe ni la tarification des packs de tokens.",
      "q9": "Que fait le sélecteur de langue ?",
      "a9": "Il enregistre votre langue préférée. La traduction complète de l'interface est en cours et sera livrée dans une future version.",
      "q10": "Comment contacter le support ?",
      "a10": "Pour les questions de compte, de facturation ou techniques, contactez d'abord le propriétaire de votre espace de travail. Pour les problèmes nécessitant notre aide, contactez directement le support AiLunaPro.",
      "q11": "Les agents sont-ils déjà achetables dans AiLunaPro ?",
      "a11": "Pas encore. Le catalogue d'Agents répertorie les agents IA recommandés. Sélectionner « Obtenir cet agent » vous fait passer par le parcours d'onboarding standard. L'achat direct dans l'application est prévu pour une phase ultérieure.",
      "q12": "L'estimation de ROI est-elle garantie ?",
      "a12": "Non. Le Calculateur de ROI fournit une estimation prudente basée sur les informations que vous fournissez. Les économies réelles dépendent de votre workflow, de la qualité de l'intégration et de l'adoption."
    }
  },
};
