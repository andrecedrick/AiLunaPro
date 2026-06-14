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
};
