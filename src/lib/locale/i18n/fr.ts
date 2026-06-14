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
  systemBuilder: {
    "chrome": {
      "pageTitle": "Concepteur de système d'IA",
      "pageIntro": "Un guide de conception avant déploiement. Parcourez six dimensions — finalité et risque, données, modèle, supervision, surveillance, documentation — pour concevoir un système d'IA de façon responsable. Votre étape et les cases cochées de la checklist sont enregistrées sur cet appareil uniquement.",
      "designSteps": "Étapes de conception",
      "checklist": "Checklist",
      "doneSuffix": "· {doneCount}/{total} terminées",
      "keyQuestions": "Questions clés",
      "references": "Références (à titre indicatif, pas un conseil juridique)",
      "previousStep": "← Étape précédente",
      "nextStep": "Étape suivante →",
      "stepOf": "Étape {n} sur {total}",
      "endOfGuide": "✓ Fin du guide — les six dimensions sont couvertes"
    },
    "steps": {
      "purpose": {
        "title": "1. Finalité et classification du risque",
        "intro": "Définissez précisément à quoi sert le système, qui il affecte et son niveau de risque avant de construire quoi que ce soit. Cela ancre toutes les décisions ultérieures.",
        "checklist": {
          "c1": "Rédigez une finalité prévue en une phrase (sans jargon).",
          "c2": "Listez les personnes ou groupes affectés (utilisateurs, clients, tiers).",
          "c3": "Classez le niveau de risque : inacceptable / élevé (Annex III) / limité / minimal — ou GPAI.",
          "c4": "Documentez le périmètre du cas d'usage et sa frontière (ce qui est hors périmètre).",
          "c5": "Listez les usages détournés prévisibles / hors usage prévu et ce que vous refuserez de faire."
        },
        "questions": {
          "q1": "Qui a l'autorité de déployer ou de suspendre ce système ?",
          "q2": "Que se passe-t-il — concrètement — si le système se trompe ?",
          "q3": "Quels droits légaux, conditions de sécurité ou libertés pourraient être affectés ?"
        }
      },
      "data": {
        "title": "2. Gouvernance des données",
        "intro": "Si vos données sont erronées, le système l'est aussi. Inventoriez-les, classez-les, justifiez pourquoi vous les détenez et surveillez les biais.",
        "checklist": {
          "c1": "Constituez un inventaire des données : source, propriétaire, sensibilité, conservation.",
          "c2": "Établissez une base légale (GDPR Art. 6) pour chaque catégorie traitée.",
          "c3": "Documentez la qualité : pertinence, représentativité, lacunes, biais connus.",
          "c4": "Appliquez la minimisation des données : ne collectez que le nécessaire ; ne conservez que le temps nécessaire.",
          "c5": "Planifiez des revues périodiques des biais et des voies d'action corrective."
        },
        "questions": {
          "q1": "D'où provient chaque jeu de données, et qui en est responsable ?",
          "q2": "Le jeu de données inclut-il des catégories sensibles (Art. 9 GDPR) ? Sur quelle base ?",
          "q3": "Quels signaux de biais allez-vous mesurer, et par rapport à quel référentiel ?"
        }
      },
      "model": {
        "title": "3. Sélection et validation du modèle",
        "intro": "Choisissez le plus petit modèle qui fonctionne. Validez-le comme les attaquants et les utilisateurs s'en serviront réellement. Documentez ce qu'il ne peut pas faire.",
        "checklist": {
          "c1": "Justifiez le choix de la taille / famille de modèle face au cas d'usage réel.",
          "c2": "Définissez des objectifs d'exactitude + de robustesse et la façon de les mesurer.",
          "c3": "Menez des tests adverses / red-team (injection de prompt, jailbreaks, sorties biaisées).",
          "c4": "Documentez les modes de défaillance connus et les non-usages explicites.",
          "c5": "Versionnez chaque artefact de modèle et fournissez des notes de version avec les déploiements."
        },
        "questions": {
          "q1": "Pourquoi ce modèle, et quelle alternative moins coûteuse avez-vous écartée ?",
          "q2": "À quoi ressemble le système quand il se trompe — et comment le savez-vous ?",
          "q3": "Votre jeu de test est-il représentatif du trafic de production ?"
        }
      },
      "oversight": {
        "title": "4. Supervision humaine",
        "intro": "Décidez comment les humains gardent le contrôle des résultats à fort impact. Assurez-vous que les contrôles fonctionnent réellement sous pression.",
        "checklist": {
          "c1": "Choisissez le mode de supervision par type de décision : in-loop, on-loop ou out-of-loop.",
          "c2": "Nommez les relecteurs et documentez des SLA pour les décisions à fort enjeu.",
          "c3": "Fournissez des contrôles de neutralisation / pause / coupure d'urgence utilisables par le relecteur.",
          "c4": "Rédigez un runbook d'escalade (qui est alerté, avec quel contexte).",
          "c5": "Journalisez chaque neutralisation / pause pour une revue post-incident."
        },
        "questions": {
          "q1": "Qui relit les sorties à fort enjeu — et a-t-il le temps et le contexte pour le faire ?",
          "q2": "Un seul opérateur peut-il arrêter le système sans réunion ?",
          "q3": "Comment évitez-vous la validation automatique (« complaisance vis-à-vis de l'automatisation ») ?"
        }
      },
      "monitoring": {
        "title": "5. Surveillance et incidents",
        "intro": "La surveillance après déploiement n'est pas optionnelle. La dérive est silencieuse. Les incidents ne le sont pas.",
        "checklist": {
          "c1": "Définissez les métriques de surveillance post-déploiement (exactitude, latence, préjudice, dérive).",
          "c2": "Mettez en place une détection de dérive sur les entrées et les sorties.",
          "c3": "Journalisez les incidents dans une file unique avec gravité et propriétaire.",
          "c4": "Documentez les voies de signalement (régulateur, client, interne).",
          "c5": "Planifiez une réévaluation périodique (trimestrielle au minimum)."
        },
        "questions": {
          "q1": "Quelle métrique unique, si elle bouge, vous indique de suspendre le système ?",
          "q2": "Qui est alerté à 3h du matin, et quel runbook ouvre-t-il ?",
          "q3": "Quand avez-vous répété pour la dernière fois un scénario d'incident d'IA ?"
        }
      },
      "docs": {
        "title": "6. Documentation et transparence",
        "intro": "Consignez ce qu'est le système, ce qu'il n'est pas et ce que les utilisateurs doivent savoir. Mettez à jour à chaque changement substantiel.",
        "checklist": {
          "c1": "Tenez à jour une documentation technique selon l'Art. 11 (finalité, données, entraînement, évaluation, risques).",
          "c2": "Publiez une fiche modèle / système par système ; mettez-la à jour à chaque release.",
          "c3": "Ajoutez une mention IA à destination des utilisateurs sur chaque surface client.",
          "c4": "Mettez à jour les notices de confidentialité pour refléter le traitement par IA.",
          "c5": "Conservez les registres de formation du personnel qui exploite le système."
        },
        "questions": {
          "q1": "Que doivent savoir les utilisateurs finaux pour utiliser ce système de façon responsable ?",
          "q2": "De quoi un auditeur externe aurait-il besoin dès le premier jour ?",
          "q3": "À quel point la fiche modèle / système est-elle à jour en ce moment ?"
        }
      }
    }
  },
  registry: {
    "page": {
      "title": "Registre IA",
      "subtitle": "Suivez chaque outil d'IA utilisé dans votre organisation — finalité, données, supervision et mesures d'atténuation. Le registre alimente vos audits et rapports.",
      "designGuideLink": "Vous concevez un nouveau système ? Ouvrir le guide de conception →",
      "addTool": "+ Ajouter un outil",
      "loading": "Chargement du registre…",
      "error": "Échec du chargement du registre. Actualisez pour réessayer."
    },
    "summary": {
      "totalTools": "Total des outils",
      "approved": "Approuvés",
      "pendingReview": "En attente de revue",
      "highRisk": "À risque élevé"
    },
    "filters": {
      "searchPlaceholder": "Rechercher outils, finalité, notes…",
      "allDepartments": "Tous les services",
      "allRisks": "Tous les risques",
      "allApproval": "Toutes les approbations",
      "clear": "Effacer les filtres",
      "risk": {
        "low": "Faible",
        "medium": "Moyen",
        "high": "Élevé",
        "critical": "Critique"
      }
    },
    "table": {
      "tool": "Outil",
      "department": "Service",
      "risk": "Risque",
      "approval": "Approbation",
      "oversight": "Supervision",
      "reviewDate": "Date de revue"
    },
    "empty": {
      "noItems": {
        "title": "Aucun outil d'IA dans le registre pour l'instant",
        "body": "Suivez chaque outil d'IA utilisé dans votre organisation — finalité, données, supervision et mesures d'atténuation. Le registre alimente vos audits et rapports.",
        "action": "+ Ajouter votre premier outil"
      },
      "noMatches": {
        "title": "Aucun outil ne correspond à ces filtres",
        "body": "Essayez d'élargir les filtres, ou effacez-les pour voir le registre complet.",
        "action": "Effacer les filtres"
      }
    },
    "modal": {
      "titleAdd": "Ajouter un outil d'IA",
      "titleEdit": "Modifier l'outil d'IA",
      "subtitleAdd": "Suivez un outil d'IA utilisé par votre équipe. Tous les champs peuvent être modifiés ultérieurement.",
      "subtitleEdit": "Mettez à jour ce que votre équipe sait sur cet outil. Les modifications sont enregistrées immédiatement dans le registre local.",
      "fields": {
        "toolName": "Nom de l'outil",
        "purpose": "Finalité",
        "dataTypes": "Types de données traitées",
        "mitigations": "Mesures d'atténuation",
        "notes": "Notes",
        "department": "Service",
        "approvalStatus": "Statut d'approbation",
        "riskLevel": "Niveau de risque",
        "humanOversight": "Supervision humaine",
        "nextReviewDate": "Date de la prochaine revue"
      },
      "placeholders": {
        "toolName": "ex. Copilote de support client",
        "purpose": "Que fait cet outil ?",
        "mitigation": "Ajoutez une mesure d'atténuation et appuyez sur Entrée",
        "notes": "Fournisseur, résidence des données, propriétaire, tout ce qui mérite d'être consigné…"
      },
      "riskOptions": {
        "low": "Faible",
        "medium": "Moyen",
        "high": "Élevé",
        "critical": "Critique"
      },
      "reviewDateHint": "Laissez vide si aucune revue n'est prévue.",
      "auditTrail": "Créé le {createdDate} · Dernière mise à jour le {updatedDate}",
      "removeMitigationAria": "Supprimer la mesure d'atténuation {index}",
      "requiredError": "Requis",
      "deleteConfirm": "Retirer « {toolName} » du registre ? Cette action est irréversible.",
      "buttons": {
        "delete": "Supprimer l'outil",
        "cancel": "Annuler",
        "addToRegistry": "Ajouter au registre",
        "saveChanges": "Enregistrer les modifications"
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "Rapports",
      "intro": "Les rapports générés sont des instantanés d'un audit à un instant donné. Chacun est exportable, partageable et reste stable lorsque vous lancez un nouvel audit.",
      "generateFromDraft": "+ Générer depuis le brouillon actuel",
      "startNewAudit": "Lancer un nouvel audit",
      "loading": "Chargement des rapports…",
      "errorMessage": "Aucun rapport chargé pour le moment. Cela peut arriver si l'espace de travail est récent ou si Firestore est inaccessible.",
      "retry": "Réessayer",
      "traceabilityHint": "Les rapports sont des instantanés à un instant donné enregistrés dans votre espace de travail. La vue détaillée recalcule le résultat complet à partir de l'instantané des réponses de chaque rapport — ainsi les rapports historiques restent exacts même après l'évolution des règles de scoring."
    },
    "detail": {
      "loading": "Chargement du rapport…",
      "notFoundTitle": "Rapport introuvable",
      "notFoundBody": "Ce rapport n'existe plus ou a été supprimé.",
      "backToReports": "← Retour aux rapports",
      "rename": {
        "titleAriaLabel": "Titre du rapport",
        "saving": "…",
        "saveTitle": "Enregistrer le titre",
        "cancel": "Annuler",
        "renameButton": "Renommer"
      },
      "download": {
        "preparing": "Préparation…",
        "downloadPdf": "⬇ Télécharger le PDF"
      },
      "errors": {
        "tokensInsufficientExport": "Tokens insuffisants pour exporter. Achetez des tokens pour continuer.",
        "downloadFailed": "Échec du téléchargement. Veuillez réessayer.",
        "renameForbidden": "Seuls les propriétaires ou les administrateurs peuvent renommer les rapports.",
        "renameFailed": "Impossible de renommer. Veuillez réessayer.",
        "tokensInsufficient": "Tokens insuffisants. Achetez des tokens pour continuer.",
        "shareDisabled": "Le partage est désactivé pour ce rapport.",
        "shareForbidden": "Seuls les propriétaires ou les administrateurs peuvent partager les rapports.",
        "shareCreateFailed": "Impossible de créer un lien de partage. Veuillez réessayer.",
        "revokeFailed": "Impossible de révoquer le lien. Veuillez réessayer.",
        "toggleSharingFailed": "Impossible de mettre à jour le partage. Veuillez réessayer."
      },
      "share": {
        "heading": "Lien partageable",
        "description": "Un lien signé, sans connexion, vers le PDF de ce rapport. La création ou la régénération est décomptée de vos exports PDF.",
        "working": "En cours…",
        "generateNewLink": "Générer un nouveau lien",
        "revoke": "Révoquer",
        "shareLink": "Lien de partage",
        "enableSharing": "Activer le partage",
        "disableSharing": "Désactiver le partage",
        "copied": "Copié",
        "copy": "Copier",
        "expires": "Expire le {date}.",
        "activeLinkExists": "Un lien actif existe (expire le {date}). Générez un nouveau lien pour revoir l'URL — cela révoque l'ancien.",
        "disabledNotice": "Le partage est désactivé — les liens existants ne fonctionnent plus.",
        "useTokensAndCreateLink": "Utiliser des tokens et créer le lien"
      },
      "status": {
        "notShared": "Non partagé",
        "active": "Actif",
        "expired": "Expiré",
        "revoked": "Révoqué",
        "disabled": "Désactivé"
      },
      "footer": {
        "openAssistancePlan": "Ouvrir le plan d'assistance",
        "deleteReport": "Supprimer le rapport",
        "deleteConfirm": "Supprimer ce rapport ? Cette action est irréversible."
      },
      "metadata": {
        "heading": "Métadonnées",
        "reportId": "ID du rapport",
        "sourceDraft": "Brouillon source",
        "status": "Statut",
        "weakestSection": "Section la plus faible",
        "frameworks": "Cadres"
      }
    },
    "share": {
      "unavailableTitle": "Rapport partagé indisponible",
      "backToReports": "← Retour aux rapports",
      "copySuccess": "Lien de partage copié.",
      "copyFailure": "Impossible de copier le lien. Réessayez.",
      "banner": {
        "label": "🔗 Rapport partagé — vue en lecture seule",
        "description": "Vue en lecture seule pour les personnes de votre espace de travail, ouverte depuis le lien de partage in-app. Les boutons d'action internes sont masqués.",
        "copyShareLink": "🔗 Copier le lien de partage",
        "backToInternalView": "← Retour à la vue interne"
      },
      "topline": {
        "kicker": "Rapport de conformité IA",
        "score": "Score",
        "scoreOutOf": "/100",
        "generated": "Généré le {date}"
      },
      "poweredBy": "Propulsé par AiLunaPro · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "Audit Express enregistrés",
      "subtitle": "Vos instantanés Audit Express enregistrés. Téléchargez le PDF ou supprimez un résultat enregistré.",
      "runAuditExpress": "Lancer Audit Express",
      "loading": "Chargement…",
      "empty": {
        "prefix": "Aucun audit enregistré pour le moment. Utilisez",
        "runLink": "Lancer Audit Express",
        "suffix": "pour en créer un."
      },
      "meta": {
        "engineLabel": "moteur",
        "engineFallback": "n/a",
        "confidenceLabel": "confiance"
      }
    },
    "actions": {
      "view": "Voir",
      "rename": "Renommer",
      "delete": "Supprimer",
      "download": "Télécharger le PDF",
      "save": "Enregistrer",
      "cancel": "Annuler",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Titre de l'audit",
      "viewDetailsTooltip": "Voir les détails"
    },
    "errors": {
      "load": "Impossible de charger vos audits enregistrés. Veuillez réessayer.",
      "tokensInsufficient": "Tokens insuffisants pour exporter. Achetez des tokens pour continuer.",
      "download": "Échec du téléchargement. Veuillez réessayer.",
      "delete": "Échec de la suppression. Veuillez réessayer.",
      "rename": "Impossible de renommer. Veuillez réessayer."
    },
    "pdfLimitModal": {
      "ariaLabel": "Limite d'export PDF",
      "title": "Vous avez utilisé vos {freeCount} exports PDF gratuits",
      "body": "Télécharger d'autres PDF nécessite des tokens ({tokenCost} tokens par export).",
      "useTokens": "Utiliser des tokens et télécharger",
      "useTokensBusy": "…",
      "buyTokens": "Passer à un forfait supérieur ou acheter des tokens",
      "cancel": "Annuler"
    },
    "detail": {
      "backToList": "← Audits enregistrés",
      "loading": "Chargement…",
      "meta": {
        "engineLabel": "moteur",
        "engineFallback": "n/a",
        "confidenceLabel": "confiance"
      },
      "rename": "Renommer",
      "save": "Enregistrer",
      "cancel": "Annuler",
      "titleAriaLabel": "Titre de l'audit",
      "busy": "…",
      "notRecomputed": "Cet audit n'a pas pu être recalculé.",
      "downloadPdf": "Télécharger le PDF",
      "downloadPdfBusy": "Préparation…",
      "backToSaved": "Retour aux audits enregistrés"
    },
    "detailErrors": {
      "notFound": "Cet audit n'existe plus.",
      "load": "Impossible de charger cet audit. Veuillez réessayer.",
      "rename": "Impossible de renommer. Veuillez réessayer.",
      "tokensInsufficient": "Tokens insuffisants. Achetez des tokens pour continuer.",
      "sharingDisabled": "Le partage est désactivé pour cet audit.",
      "createShareLink": "Impossible de créer un lien de partage. Veuillez réessayer.",
      "revokeShareLink": "Impossible de révoquer le lien. Veuillez réessayer.",
      "updateSharing": "Impossible de mettre à jour le partage. Veuillez réessayer."
    },
    "recommendedAgents": {
      "heading": "Agents recommandés",
      "exploreAll": "Explorer tous les agents →",
      "disclaimer": "Correspondances indicatives basées sur cet audit. Vérifiez l'adéquation avant d'adopter.",
      "meta": {
        "hoursSaved": "~{hours} h/mois économisées",
        "plan": "Forfait {plan}",
        "setup": "Configuration {complexity}"
      }
    },
    "share": {
      "heading": "Lien partageable",
      "description": "Un lien signé, sans connexion, vers le PDF de cet audit. La création ou la régénération est décomptée de vos exports PDF.",
      "generateNewLink": "Générer un nouveau lien",
      "shareLink": "Lien de partage",
      "working": "En cours…",
      "revoke": "Révoquer",
      "enableSharing": "Activer le partage",
      "disableSharing": "Désactiver le partage",
      "copy": "Copier",
      "copied": "Copié",
      "expires": "Expire le {date}.",
      "activeLinkExists": "Un lien actif existe (expire le {date}). Générez un nouveau lien pour revoir l'URL — cela révoque l'ancien.",
      "disabledNotice": "Le partage est désactivé — les liens existants ne fonctionnent plus.",
      "limitModalActionLabel": "Utiliser des tokens et créer le lien"
    },
    "shareStatus": {
      "notShared": "Non partagé",
      "active": "Actif",
      "expired": "Expiré",
      "revoked": "Révoqué",
      "disabled": "Désactivé"
    }
  },
  billingPage: {
    "header": {
      "title": "Facturation",
      "subtitle": "Gérez votre forfait, votre utilisation et vos factures.",
      "readOnlyBadge": "Vue en lecture seule."
    },
    "plans": {
      "bestValueBadge": "Meilleur rapport qualité-prix",
      "priceApprox": "{approx}{suffix} environ · facturé en USD",
      "cta": {
        "redirecting": "Redirection…",
        "currentPlan": "Forfait actuel",
        "freeCurrent": "Free — actuel",
        "startForFree": "Commencer gratuitement",
        "subscribe": "S'abonner"
      },
      "free": {
        "description": "Essayez la plateforme avec un accès limité.",
        "features": {
          "limitedAuditAccess": "Accès limité aux audits",
          "basicDashboard": "Tableau de bord de base",
          "demoReports": "Rapports de démonstration",
          "communitySupport": "Support communautaire"
        }
      },
      "starter": {
        "description": "Réalisez de vrais audits en autonomie.",
        "features": {
          "coreAuditWorkflow": "Flux d'audit principal",
          "basicComplianceReports": "Rapports de conformité de base",
          "starterAuditVolume": "Volume d'audits Starter",
          "essentialAiRecommendations": "Recommandations AI essentielles",
          "emailSupport": "Support par e-mail"
        }
      },
      "professional": {
        "description": "Pour les équipes en croissance menant des audits avancés.",
        "features": {
          "higherAuditVolume": "Volume d'audits supérieur",
          "advancedReports": "Rapports avancés",
          "teamCollaboration": "Collaboration en équipe",
          "priorityAiRecommendations": "Recommandations AI prioritaires",
          "prioritySupport": "Support prioritaire"
        }
      },
      "enterprise": {
        "description": "Gouvernance et contrôle à l'échelle de l'organisation.",
        "features": {
          "highestAuditVolume": "Volume d'audits le plus élevé",
          "advancedTeamManagement": "Gestion d'équipe avancée",
          "organizationControls": "Contrôles d'organisation",
          "customBranding": "Image de marque personnalisée",
          "dedicatedSupport": "Support dédié",
          "enterpriseReadyGovernance": "Gouvernance prête pour l'entreprise"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Devise de facturation détectée depuis votre région : {currency} {symbol}",
        "default": "Devise de facturation : {currency} {symbol}"
      },
      "secureCheckoutBadge": "Paiement sécurisé propulsé par Stripe",
      "heading": "Choisissez le forfait adapté à votre flux d'audit",
      "subheadingPrefix": "Démarrez en mode test Stripe. Aucun débit réel n'est effectué — utilisez la carte de test",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Forfait actuel",
      "statusNoSubscription": "Aucun abonnement",
      "freePlanNote": "Forfait Free — aucun abonnement actif",
      "paidPlanSummary": "{price} $/mois · facturé {billingCycle}",
      "renews": " · Se renouvelle le {date}",
      "cancelsAtPeriodEnd": "⚠ Résiliation en fin de période ({date})",
      "billedInCurrency": "Votre abonnement actif est facturé en {currency}.",
      "resumePlan": "Reprendre le forfait",
      "cancelPlan": "Annuler le forfait"
    },
    "billingActions": {
      "title": "Actions de facturation",
      "manageSubscription": "Gérer l'abonnement",
      "managePaymentMethods": "Gérer les moyens de paiement",
      "loading": "Chargement…",
      "paymentMethodsHint": "Mettre à jour la carte, définir par défaut, supprimer — géré en toute sécurité par Stripe.",
      "noCustomerYet": "Aucun client Stripe pour l'instant. Les moyens de paiement deviennent disponibles après votre premier abonnement ou achat de tokens.",
      "portalError": "Impossible d'ouvrir le portail Stripe. Vérifiez que le Worker est en cours d'exécution."
    },
    "tokens": {
      "title": "Tokens",
      "balance": "{balance} / {allocation} ce cycle",
      "balanceLoading": "Chargement du solde de tokens…",
      "manageTokens": "Gérer les tokens"
    },
    "usage": {
      "sectionTitle": "Utilisation sur cette période",
      "auditsLabel": "Audits",
      "seatsLabel": "Sièges",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Période : {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Factures",
      "empty": "Aucune facture pour l'instant.",
      "loading": "Chargement des factures…",
      "emptyAfterFirstCycle": "Les factures apparaîtront ici après votre premier cycle de facturation.",
      "tableHeaders": {
        "date": "Date",
        "description": "Description",
        "amount": "Montant",
        "status": "Statut",
        "invoiceNumber": "Numéro de facture",
        "actions": "Actions"
      },
      "statusUnknown": "inconnu",
      "actionView": "Afficher",
      "actionPdf": "PDF",
      "managedInStripeNote": "Le moyen de paiement et les informations de facturation sont gérés en toute sécurité dans Stripe."
    },
    "mockPlans": {
      "sectionTitle": "Forfaits",
      "currentBadge": "Actuel",
      "free": "Free",
      "priceSuffix": "/mois",
      "switch": "Changer",
      "contactOwnerToChange": "Contactez le propriétaire pour changer de forfait"
    },
    "mockConfirm": {
      "title": "Passer à {plan}",
      "body": "Ceci est une action fictive — aucun débit réel ne sera effectué.",
      "cancel": "Annuler",
      "confirm": "Confirmer (fictif)"
    },
    "locked": {
      "title": "Accès à la facturation restreint",
      "subtitle": "Contactez le propriétaire de votre espace de travail pour consulter ou gérer la facturation.",
      "backToDashboard": "Retour au tableau de bord",
      "contactWorkspaceOwner": "Contacter le propriétaire de l'espace de travail",
      "askOwnerToast": "Demandez l'accès à la facturation au propriétaire de votre espace de travail."
    },
    "success": {
      "headline": {
        "failed": "Échec de la synchronisation",
        "active": "Votre forfait {plan} est actif",
        "activating": "Merci — votre abonnement est en cours d'activation"
      },
      "subtext": {
        "failedFallback": "Nous n'avons pas pu finaliser votre abonnement automatiquement.",
        "redirecting": "Redirection vers la Facturation…",
        "syncing": "Nous synchronisons votre abonnement avec Stripe."
      },
      "pill": {
        "failed": "Échec de la synchronisation",
        "activated": "Abonnement activé",
        "syncing": "Synchronisation de l'abonnement…",
        "almostDone": "Presque terminé…"
      },
      "backToBilling": "Retour à la Facturation",
      "retrySync": "Réessayer la synchronisation",
      "errors": {
        "stillProcessing": "Le paiement est toujours en cours de traitement. Veuillez patienter un instant et réessayer.",
        "sessionInvalid": "Cette session de paiement n'est plus valide. Veuillez démarrer un nouvel abonnement.",
        "notSignedIn": "Vous n'êtes pas connecté. Veuillez vous connecter et réessayer.",
        "orgLinkFailed": "Impossible de lier cet abonnement à votre organisation. Veuillez contacter le support.",
        "generic": "Une erreur s'est produite lors de l'activation de votre abonnement.",
        "noSessionDetected": "Nous n'avons pas pu détecter votre session de paiement. Veuillez retourner à la Facturation et réessayer."
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "Tokens",
      "subtitle": "Suivez l'utilisation, surveillez votre allocation mensuelle et achetez des recharges au besoin."
    },
    "locked": {
      "title": "Tokens indisponibles",
      "clientMessage": "Les tokens ne sont pas visibles depuis un compte client.",
      "workspaceMessage": "Les tokens sont indisponibles pour cet espace de travail.",
      "backToDashboard": "Retour au tableau de bord"
    },
    "webhook": {
      "notice": "Paiement reçu. En attente du webhook Stripe pour mettre à jour votre solde de tokens.",
      "refreshBalance": "Actualiser le solde"
    },
    "balance": {
      "loading": "Chargement du solde…",
      "empty": "Aucun solde de tokens pour l'instant. Il sera créé lors de votre premier audit.",
      "statBalance": "Solde",
      "statMonthlyAllocation": "Allocation mensuelle",
      "statConsumed": "Consommé",
      "statRollover": "Report",
      "statTopups": "Recharges",
      "cycleEnds": "Fin du cycle : {cycleEnd}",
      "lastReset": "Dernière réinitialisation : {lastReset}"
    },
    "packs": {
      "sectionTitle": "Acheter plus de tokens",
      "sectionNote": "Les packs de tokens sont actuellement facturés en USD. Les tokens de recharge n'expirent jamais.",
      "readOnlyNotice": "Vous pouvez consulter les tokens, mais seuls les propriétaires, administrateurs et gestionnaires de facturation peuvent acheter des packs.",
      "starterLabel": "Starter",
      "starterBlurb": "Complétez un cycle faible.",
      "proLabel": "Pro",
      "proBlurb": "Recharge la plus courante.",
      "maxLabel": "Max",
      "maxBlurb": "Boost pour une grosse charge de travail.",
      "tokensUnit": "tokens",
      "amountPrefix": "+{amount}",
      "buyPack": "Acheter le pack",
      "redirecting": "Redirection…",
      "readOnlyButton": "Lecture seule"
    },
    "usage": {
      "sectionTitle": "Utilisation récente",
      "loading": "Chargement de l'utilisation…",
      "empty": "Aucune utilisation pour l'instant.",
      "colDate": "Date",
      "colModule": "Module",
      "colAction": "Action",
      "colTokens": "Tokens",
      "colStatus": "Statut",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Achat de tokens terminé. Votre solde sera mis à jour sous peu.",
      "purchaseCancelled": "Achat de tokens annulé.",
      "buyForbidden": "Seuls les propriétaires, administrateurs ou gestionnaires de facturation peuvent acheter des packs de tokens."
    }
  },
  teamPage: {
    "header": {
      "title": "Équipe",
      "subtitlePrefix": "Gérez qui a accès à",
      "subtitleSuffix": "et ce que chacun peut faire.",
      "subtitleFallbackOrg": "votre espace de travail",
      "inviteButton": "+ Inviter un membre"
    },
    "stats": {
      "totalMembers": "Total des membres",
      "active": "Actifs",
      "pendingInvites": "Invitations en attente",
      "adminsAndOwners": "Admins et propriétaires"
    },
    "filters": {
      "all": "Tous",
      "owners": "Propriétaires",
      "admins": "Admins",
      "billing": "Facturation",
      "members": "Membres",
      "clients": "Clients",
      "pending": "En attente"
    },
    "roles": {
      "owner": "Propriétaires",
      "admin": "Admins",
      "billing": "Facturation",
      "member": "Membres",
      "client": "Clients"
    },
    "emptyState": {
      "noMembers": "Aucun membre dans cet espace de travail pour l'instant.",
      "noMatch": "Aucun membre ne correspond au filtre « {filter} »."
    },
    "confirm": {
      "cancelInvite": "Annuler cette invitation en attente ?",
      "regenerateLink": "Régénérer le lien d'invitation ? L'ancien lien cessera de fonctionner.",
      "removeMember": "Retirer ce membre de l'espace de travail ? Cette action est irréversible."
    },
    "toast": {
      "cancelFailed": "Échec de l'annulation",
      "newLinkCopied": "Nouveau lien d'invitation copié dans le presse-papiers.",
      "regenerateFailed": "Échec de la régénération",
      "roleUpdateFailed": "Échec de la mise à jour du rôle",
      "memberRemoved": "Membre retiré.",
      "removeFailed": "Échec du retrait",
      "memberDisabled": "Membre désactivé.",
      "disableFailed": "Échec de la désactivation",
      "disableUnavailableMock": "Désactivation indisponible sur la couche fictive.",
      "memberEnabled": "Membre activé.",
      "enableFailed": "Échec de l'activation",
      "enableUnavailableMock": "Activation indisponible sur la couche fictive."
    },
    "pendingInvites": {
      "heading": "Invitations en attente ({count})",
      "tableHeaders": {
        "email": "E-mail",
        "role": "Rôle",
        "expires": "Expire le",
        "actions": "Actions"
      },
      "copyLink": "Copier le lien",
      "regenerateLink": "Régénérer le lien",
      "cancel": "Annuler",
      "linkHiddenNote": "Lien masqué pour des raisons de sécurité. Cliquez sur Régénérer le lien pour en émettre un nouveau."
    },
    "rolesLegend": {
      "lead": "**À propos des rôles —**",
      "owners": "Les **propriétaires** gèrent la facturation et les paramètres de l'espace de travail.",
      "admins": "Les **admins** gèrent les utilisateurs de l'organisation.",
      "billing": "Les utilisateurs **facturation** gèrent les factures et l'abonnement.",
      "members": "Les **membres** peuvent utiliser les fonctionnalités d'audit.",
      "clients": "Les **clients** disposent d'un accès en lecture limité."
    },
    "footerHint": "Les invitations sont fictives pour l'instant. L'envoi réel d'e-mails et Firebase Auth remplaceront cette couche lors de la phase backend."
  },
  orgCreate: {
    "heading": "Créer un espace de travail",
    "subtitle": {
      "signedIn": "Connecté en tant que {email}",
      "anonymous": "Configurer un nouvel espace de travail d'organisation"
    },
    "form": {
      "nameLabel": "Nom de l'espace de travail",
      "namePlaceholder": "ex. Acme Corp",
      "planLabel": "Plan"
    },
    "planDesc": {
      "free": "Jusqu'à 3 audits, 1 siège",
      "starter": "10 audits, 5 sièges",
      "professional": "Audits illimités, 20 sièges",
      "enterprise": "Limites personnalisées, SSO, SLA"
    },
    "submit": {
      "idle": "Créer l'espace de travail",
      "loading": "Création de l'espace de travail…"
    },
    "backToDashboard": "← Retour au tableau de bord"
  },
  auditHistory: {
    "header": {
      "title": "Historique des audits",
      "subtitle": "Audits soumis pour cet espace de travail. Générez un rapport pour créer un instantané partageable."
    },
    "states": {
      "loading": "Chargement de l'historique des audits…",
      "error": "Impossible de charger l'historique des audits. Réessayez plus tard."
    },
    "empty": {
      "title": "Aucun audit soumis pour l'instant",
      "description": "Les audits soumis apparaissent ici pour cet espace de travail. Lancez un nouvel audit pour commencer.",
      "startAudit": "+ Démarrer un audit"
    },
    "columns": {
      "submitted": "Soumis le",
      "score": "Score",
      "risk": "Risque",
      "findings": "Constats"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Générer le rapport"
    },
    "toast": {
      "reportGenerated": "Rapport généré"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Audit soumis",
        "preview": "Aperçu de l'audit"
      },
      "title": "Résultat de l'audit",
      "submissionId": "ID de soumission {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Voici ce que signifie votre audit",
      "summary": {
        "overallScore": "Score global {score}/100 — risque {risk}.",
        "findingsSingular": "{n} constat sur {m} action recommandée.",
        "findingsPlural": "{n} constats sur {m} actions recommandées.",
        "maturity": "Maturité AI : niveau {level} sur 5."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agents",
      "intro": "Trouvez les agents AI adaptés à votre flux de travail. Les agents tout-en-un AiLunaPro sont mis en avant.",
      "locked": {
        "title": "Les agents ne sont pas disponibles pour les comptes clients",
        "backToDashboard": "Retour au tableau de bord"
      },
      "filters": {
        "industryLabel": "Secteur",
        "integrationLabel": "Intégration",
        "allIndustries": "Tous les secteurs",
        "allIntegrations": "Toutes les intégrations",
        "clearFilters": "Effacer les filtres",
        "clearRecommendationsHint": "Effacez les recommandations pour utiliser les filtres."
      },
      "loading": "Chargement des agents…",
      "emptyFiltered": "Aucun agent ne correspond aux filtres sélectionnés.",
      "sections": {
        "topRecommendations": "Meilleures recommandations",
        "otherAgents": "Autres agents"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} pts",
      "whyToggleOne": "Pourquoi ? ({count} raison)",
      "whyToggleOther": "Pourquoi ? ({count} raisons)"
    },
    "recommendPanel": {
      "title": "Personnaliser mes recommandations",
      "subtitle": "Ajoutez quelques préférences pour classer les agents adaptés à votre contexte.",
      "fields": {
        "industry": "Secteur",
        "companySize": "Taille de l'entreprise",
        "targetWorkflow": "Flux de travail ciblé",
        "subscriptionPlan": "Plan d'abonnement",
        "currentMaturity": "Maturité AI actuelle",
        "integrations": "Intégrations (séparées par des virgules, max 10)"
      },
      "placeholders": {
        "industry": "ex. retail, saas, santé",
        "integrations": "ex. hubspot, slack, e-mail"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Solo",
        "sme": "PME",
        "enterprise": "Grande entreprise"
      },
      "maturityOptions": {
        "low": "Faible",
        "medium": "Moyenne",
        "high": "Élevée"
      },
      "workflowOptions": {
        "support": "Support client",
        "sales": "Ventes et suivi des prospects",
        "finance": "Finance et facturation",
        "documents": "Documents et contrats",
        "reporting": "Reporting et tableaux de bord",
        "admin": "Travail administratif",
        "compliance": "Conformité et gouvernance",
        "marketing": "Marketing et contenu",
        "hr": "RH et gestion du personnel"
      },
      "helperText": "Ajoutez au moins une préférence pour personnaliser les recommandations.",
      "submit": "Recommander des agents",
      "submitting": "Calcul en cours…",
      "clearRecommendations": "Effacer les recommandations"
    },
    "card": {
      "external": "Externe",
      "savesPerMonth": "⏱ Économise ~{hours} h / mois",
      "moreIntegrations": "+{count}",
      "viewDetails": "Voir les détails",
      "getThisAgent": "Obtenir cet agent"
    },
    "detail": {
      "lockedNotice": "Les agents ne sont pas disponibles pour les comptes clients.",
      "backToAgents": "← Retour aux agents",
      "loading": "Chargement…",
      "errors": {
        "missingAgentId": "ID d'agent manquant",
        "missingOrgContext": "Contexte d'organisation manquant"
      },
      "pills": {
        "external": "Externe",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "Configuration · {complexity}",
        "recommendedAllInOne": "Tout-en-un recommandé",
        "compliance": "Conformité",
        "audit": "Audit"
      },
      "cta": "Obtenir cet agent →",
      "sections": {
        "overview": "Vue d'ensemble",
        "problemSolved": "Problème résolu",
        "bestFit": "Cas d'usage idéal",
        "integrations": "Intégrations",
        "expectedRoi": "ROI attendu",
        "pricing": "Tarification"
      },
      "bestFit": {
        "industries": "Secteurs",
        "companySize": "Taille de l'entreprise",
        "minBudget": "Budget minimum",
        "minBudgetValue": "${amount}/mois"
      },
      "roi": {
        "timeSaved": "Temps économisé",
        "timeSavedValue": "{hours} h/mois",
        "costSaved": "Coût économisé",
        "costSavedValue": "${amount}/mois",
        "payback": "Retour sur investissement",
        "paybackValue": "{months} mois"
      },
      "pricing": {
        "modelPrefix": "Modèle : **{model}**",
        "install": " · Installation : ${amount}",
        "monthly": " · Mensuel : ${amount}",
        "onRequest": " · Tarif sur demande"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Plan d'action guidé",
      "title": "Votre plan d'action",
      "intro": "Nous avons traduit vos réponses d'audit en un plan contextuel et séquencé. Parcourez chaque section ci-dessous — chaque affirmation renvoie à vos données.",
      "score": "Score {globalScore} / 100",
      "backToResult": "← Retour au résultat"
    },
    "detected": {
      "eyebrow": "01 · Diagnostic",
      "title": "Ce que nous avons détecté",
      "topIssuesLabel": "Principaux problèmes identifiés",
      "noIssues": "✓ Aucun problème à signaler — l'audit a validé toutes les règles.",
      "weakestAreaLabel": "Domaine le plus faible",
      "weakestAreaScore": "{score} %",
      "weakestAreaHint": "Combler l'écart de cette section est l'action la plus déterminante pour votre score global.",
      "noWeakArea": "Aucun domaine faible détecté."
    },
    "priorities": {
      "eyebrow": "02 · Priorités",
      "title": "Ce que vous devriez corriger en premier",
      "intro": "Parmi les {count} actions recommandées, ces trois-là offrent le meilleur rapport bénéfice/effort. Chacune renvoie aux constats qu'elle résout.",
      "whyItMattersLabel": "Pourquoi c'est important : ",
      "expectedOutcomeLabel": "Résultat attendu : ",
      "impactBadge": "Impact {impact}",
      "timeframeDays": "{days} j",
      "closesFindingsOne": "résout {count} constat",
      "closesFindingsOther": "résout {count} constats",
      "startWithThis": "Commencer par ceci →",
      "startWithThisTooltip": "À venir après J2",
      "mostLeverage": "Le meilleur levier pour l'effort fourni"
    },
    "operatingModel": {
      "eyebrow": "03 · Modèle opérationnel",
      "title": "Ce qu'il faut automatiser ou structurer",
      "intro": "Chaque élément ci-dessous a un mode d'exécution principal. Automatiser là où il faudrait structurer (ou l'inverse) est un schéma d'échec courant.",
      "categories": {
        "automate": {
          "eyebrow": "Outils & systèmes",
          "title": "Automatiser",
          "tagline": "Les éléments où le levier vient du système, pas de l'humain."
        },
        "structure": {
          "eyebrow": "Politique & gouvernance",
          "title": "Structurer",
          "tagline": "Les éléments qui nécessitent une responsabilité formelle, une politique ou un alignement sur un cadre."
        },
        "process": {
          "eyebrow": "Action récurrente",
          "title": "Exploiter",
          "tagline": "Les éléments qui sont des processus que vous maintenez à un rythme régulier."
        },
        "train": {
          "eyebrow": "Personnes",
          "title": "Former",
          "tagline": "Les éléments qui font évoluer les comportements par la formation."
        }
      },
      "actionsCountOne": "{count} action",
      "actionsCountOther": "{count} actions",
      "timeframeDays": "{days} j",
      "emptyColumn": "Rien ici pour le moment."
    },
    "whyItMatters": {
      "eyebrow": "04 · Contexte",
      "title": "Pourquoi c'est important",
      "frameworksReferenced": "Cadres référencés dans cette évaluation"
    },
    "impact": {
      "eyebrow": "05 · Impact",
      "title": "Impact business attendu",
      "ifTop3": "Si vous réalisez les 3 actions prioritaires",
      "scoreLift": "Votre score global projeté passe de {currentScore} à {projectedScore}. Il s'agit d'une simulation indicative basée sur les constats que chaque action résout — l'évolution réelle dépend de la profondeur d'exécution.",
      "projectedLabel": "Projeté",
      "deltaPts": "+{delta} pts",
      "noChange": "aucun changement",
      "toneHighLift": "Forte progression",
      "toneSteadyGain": "Gain régulier",
      "toneHoldTheLine": "Maintien du cap",
      "outcomes": {
        "auditReadinessTitle": "Préparation aux audits",
        "auditReadinessHigh": "Vous passez d'« incomplet » à « défendable » dans un questionnaire de sécurité.",
        "auditReadinessSteady": "Posture existante documentée et plus facile à référencer lors des audits.",
        "incidentExposureTitle": "Exposition aux incidents",
        "incidentExposureHigh": "Rayon d'impact réduit et délai moyen de confinement raccourci lorsque l'IA cause un préjudice.",
        "incidentExposureSteady": "Réponse prévisible et responsabilités plus claires pour les incidents propres à l'IA.",
        "customerTrustTitle": "Confiance des clients",
        "customerTrustHigh": "La transparence, les fiches modèles et l'explicabilité donnent à vos équipes support et commerciales des réponses claires.",
        "internalVelocityTitle": "Vélocité interne",
        "internalVelocitySteady": "Les équipes livrent plus vite lorsque les politiques et les parcours de revue sont sans ambiguïté."
      },
      "disclaimer": "Le score projeté est une simulation indicative calculée à partir de la couverture des constats et de la pondération des sections. Ce n'est pas une garantie."
    },
    "nextStep": {
      "eyebrow": "06 · Recommandé",
      "title": "Votre prochaine étape",
      "nextOneThing": "La prochaine chose à faire",
      "savedAt": "Enregistré localement à {timestamp}.",
      "localOnlyNote": "Nous conserverons ce plan disponible en local — aucun envoi, aucune mise à niveau de compte requise. Revenez quand votre équipe sera prête à agir.",
      "ctas": {
        "saveDefault": "✓ Enregistrer ce plan d'action",
        "saved": "✓ Enregistré",
        "reminderSet": "✓ Rappel défini",
        "exported": "✓ Exporté",
        "remind7Day": "⏰ Définir un rappel à 7 jours",
        "remind30Day": "⏰ Définir un rappel à 30 jours",
        "remind60Day": "⏰ Définir un rappel à 60 jours",
        "remindQuarterly": "⏰ Définir un point trimestriel",
        "exportPlan": "⬇ Exporter le plan"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "Vous opérez dans un contexte que les régulateurs considèrent déjà comme sensible. L'EU AI Act, le GDPR et les règles sectorielles (équivalents HIPAA, cadres des services financiers) imposent tous des obligations supplémentaires lorsque l'IA traite des données sensibles ou prend des décisions lourdes de conséquences concernant des personnes.",
        "customerFacingTransparency": "Votre IA est en contact direct avec les clients, ce qui signifie que des obligations de transparence s'appliquent (EU AI Act Article 50, règles de protection des consommateurs) et que les enjeux de réputation sont plus élevés que pour des outils internes.",
        "internalBaseline": "Même pour un usage interne de l'IA, les cadres reconnus (ISO/IEC 42001, NIST AI RMF) servent de plus en plus de référence pour la due diligence fournisseurs et les contrats grands comptes.",
        "riskInactionHigh": "À votre niveau de risque actuel, le coût de l'inaction est asymétrique. Un seul incident — un modèle qui fuit des données, une décision inéquitable, une panne sans procédure de reprise — coûte sensiblement plus cher que les correctifs recommandés ci-dessous.",
        "riskInactionMedium": "Vous vous situez dans une fourchette intermédiaire défendable. Le risque, désormais, est le plafonnement : les organisations qui s'arrêtent là régressent généralement à mesure que leur empreinte IA s'étend. Combler les écarts de sévérité moyenne consolide la posture actuelle.",
        "riskInactionLow": "Vous disposez déjà d'une posture solide. Le risque est la régression à mesure que votre empreinte IA croît. L'investissement continu relève surtout de la maintenance, de la documentation et d'un approfondissement progressif.",
        "weakestSection": "Votre domaine le plus faible est **{title}** ({score} %). Le renforcer augmente directement le score global, mais surtout cela supprime la voie de moindre résistance pour un incident.",
        "commercialEnabler": "Les acheteurs grands comptes et les clients réglementés exigent de plus en plus des preuves de gouvernance de l'IA dans les questionnaires de sécurité. Bon nombre des éléments de votre plan d'action sont aussi des leviers commerciaux, pas seulement du travail de conformité."
      },
      "riskOneLiner": {
        "low": "Vous êtes en bonne posture — l'attention se déplace vers la maintenance et l'amélioration continue.",
        "medium": "Vous disposez d'une base défendable, mais avec des écarts notables qu'il vaut la peine de combler rapidement.",
        "high": "Vous présentez plusieurs écarts qui augmentent sensiblement votre exposition. Priorisez les actions ci-dessous.",
        "critical": "Vous présentez un ou plusieurs écarts critiques. Les éléments les plus prioritaires devraient être traités en quelques jours, pas en quelques semaines."
      },
      "contextChips": {
        "highRiskIndustry": "Secteur à haut risque",
        "sensitiveData": "Données sensibles concernées",
        "customerFacing": "IA en contact client",
        "missionCritical": "Périmètre critique",
        "standardProfile": "Profil de risque standard"
      },
      "nextStep": {
        "criticalHeadline": "Traitez le constat critique dans les 7 prochains jours",
        "criticalRationaleFallback": "C'est l'élément le plus déterminant de votre plan d'action.",
        "highHeadline": "Commencez par les gains rapides à 30 jours",
        "highRationaleFallback": "Une posture à haut risque réagit vite à un petit nombre d'actions ciblées. Choisissez trois gains rapides dans la feuille de route et prenez-les en charge ce mois-ci.",
        "mediumHeadline": "Consolidez vos fondations de gouvernance",
        "mediumRationale": "Vous avez dépassé la phase de débrouillage initial. Le prochain mouvement à effet cumulatif consiste à formaliser ce que vous faites de manière informelle — une politique écrite, un cadre reconnu, une escalade documentée. C'est ce qui rend les audits et les contrats grands comptes routiniers.",
        "lowHeadline": "Passez de conforme à optimisé",
        "lowRationale": "Votre posture est solide. Le levier, désormais, ce sont la documentation et l'amélioration continue — fiches modèles, mises à jour de formation et intégration de scénarios IA dans vos exercices de réponse aux incidents."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Score de conformité",
      "riskLabel": "Niveau de risque actuel",
      "maturityLabel": "Niveau de maturité IA",
      "nextStepLabel": "Prochaine étape recommandée",
      "nextStepTitle": "Terminer l'audit de l'outil de présélection RH",
      "nextStepBody": "Cet audit est complété à 60 %. Le terminer augmentera votre score de conformité d'environ +7 points.",
      "continueAudit": "Continuer l'audit →",
      "toast": {
        "noPermission": "Vous n'avez pas l'autorisation de continuer les audits.",
        "noDraft": "Aucun audit en brouillon trouvé — démarrage d'un nouvel audit."
      }
    },
    "recentReports": {
      "card": {
        "share": "Partager",
        "view": "Afficher"
      },
      "export": {
        "title": "Options d'export",
        "blurb": "Exportez vos données de conformité dans plusieurs formats pour vos parties prenantes.",
        "exportAs": "Exporter au format {fmt}"
      },
      "toast": {
        "reportNotAvailable": "Rapport pas encore disponible.",
        "shareLinkCopied": "Lien de partage copié.",
        "shareLinkFailed": "Impossible de copier le lien. Réessayez.",
        "noReportsToExport": "Aucun rapport à exporter pour le moment.",
        "csvDownloaded": "CSV téléchargé.",
        "jsonDownloaded": "JSON téléchargé."
      }
    },
    "cta": {
      "heading": "Prêt à atteindre une conformité IA complète ?",
      "body": "Rejoignez les organisations qui utilisent AiLunaPro pour automatiser leurs workflows de conformité, réduire les risques et instaurer la confiance avec leurs parties prenantes.",
      "toast": {
        "alreadyActivePlan": "Vous avez déjà un forfait actif.",
        "demoRequestSent": "Demande de démo envoyée. Nous l'examinerons et reviendrons vers vous."
      },
      "demoModal": {
        "title": "Planifier une démo",
        "subtitle": "Parlez-nous un peu de votre équipe et nous vous recontacterons.",
        "placeholderFullName": "Nom complet",
        "placeholderWorkEmail": "E-mail professionnel",
        "placeholderCompany": "Entreprise",
        "placeholderMessage": "De quoi souhaitez-vous discuter ?",
        "privacyNote": "Nous utilisons ces informations uniquement pour répondre à votre demande.",
        "cancel": "Annuler",
        "submit": "Demander une démo",
        "submitting": "Envoi…",
        "errorFallback": "Impossible d'envoyer votre demande. Veuillez réessayer."
      }
    }
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "Diagnostic de maturité IA",
        "subtitle": "Répondez à 8 courtes questions. Obtenez votre score de maturité IA et découvrez quels agents AiLunaPro correspondent à votre niveau.",
        "freeLine": "Gratuit · Aucun compte requis · Environ 2 minutes"
      },
      "resumeNotice": "Bon retour parmi nous — nous avons restauré vos réponses précédentes pour que vous puissiez reprendre là où vous vous êtes arrêté.",
      "questionLegend": "Question {n} / {total}",
      "leadCapture": {
        "heading": "Où devons-nous envoyer votre résultat ?",
        "emailLabel": "E-mail",
        "requiredMark": "*",
        "emailPlaceholder": "vous@entreprise.com",
        "companyNameLabel": "Nom de l'entreprise",
        "optionalMark": "(facultatif)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Nous utilisons uniquement ces informations pour générer votre diagnostic et assurer un suivi concernant les services IA pertinents. Aucun compte n'est requis.",
        "consentLabel": "J'accepte de recevoir le résultat de mon diagnostic IA et les informations de suivi pertinentes d'AiLunaPro. Je comprends que mes réponses et mon e-mail seront traités pour générer et conserver ce résultat de diagnostic, et que je peux demander la suppression de mes données à tout moment."
      },
      "submit": {
        "loading": "Calcul de votre résultat…",
        "idle": "Obtenir mon score de maturité IA"
      },
      "signInPrompt": "Vous avez déjà un compte ?",
      "signInLink": "Se connecter",
      "errors": {
        "answers": "Veuillez répondre à toutes les questions.",
        "email": "Veuillez saisir une adresse e-mail valide.",
        "consent": "Vous devez accepter pour recevoir votre résultat.",
        "captchaLoading": "Le captcha se charge — veuillez patienter."
      },
      "buckets": {
        "low": {
          "title": "Votre maturité IA est émergente",
          "message": "Votre organisation en est à un stade précoce. Commencez par une automatisation simple, un inventaire de vos usages de l'IA et des agents d'assistance pratiques."
        },
        "medium": {
          "title": "Votre maturité IA se développe",
          "message": "Vous disposez déjà de certaines bases en IA. La prochaine étape consiste à structurer les usages, mesurer le ROI et améliorer les flux de travail documentaires et de reporting."
        },
        "high": {
          "title": "Votre maturité IA est avancée",
          "message": "Vous êtes prêt à passer l'IA à l'échelle avec une gouvernance, une conformité, un reporting et une automatisation spécialisée renforcés."
        }
      },
      "result": {
        "scoreLabel": "Votre score de maturité IA",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Agents AiLunaPro recommandés",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obtenir cet agent",
        "ctaHeading": "Vous souhaitez un audit plus approfondi et votre plan d'action complet ?",
        "ctaBody": "Créez un espace de travail AiLunaPro gratuit pour accéder à l'audit complet, au registre et au catalogue d'agents.",
        "ctaButton": "Créer votre compte gratuit ↗",
        "ctaFootnote": "Se poursuit sur **dashboard.ailunapro.com** — la plateforme AiLuna pour les agents et solutions IA, l'étape suivante après votre audit.",
        "retakeButton": "Refaire le diagnostic"
      }
    },
    "roi": {
      "header": {
        "title": "Calculateur de ROI de l'IA",
        "subtitle": "Estimez le temps et l'argent que vous pouvez économiser avec les agents IA AiLunaPro.",
        "freeLine": "Gratuit · Aucun compte requis · Environ 1 minute · USD"
      },
      "resumeNotice": "Bon retour parmi nous — nous avons restauré vos saisies précédentes pour que vous puissiez reprendre là où vous vous êtes arrêté.",
      "form": {
        "teamLegend": "Votre équipe",
        "teamSizeLabel": "Taille de l'équipe",
        "teamSizePlaceholder": "ex. 10",
        "monthlyHoursLabel": "Heures mensuelles que votre équipe consacre aux tâches répétitives",
        "monthlyHoursPlaceholder": "ex. 80",
        "hourlyCostLabel": "Coût horaire moyen (USD)",
        "targetWorkflowLabel": "Flux de travail ciblé",
        "workflowPlaceholderOption": "Sélectionnez un flux de travail…"
      },
      "leadCapture": {
        "legend": "Où devons-nous envoyer votre estimation ?",
        "emailLabel": "E-mail",
        "emailPlaceholder": "vous@entreprise.com",
        "companyNameLabel": "Nom de l'entreprise",
        "optionalMark": "(facultatif)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Nous utilisons uniquement ces informations pour générer votre estimation et assurer un suivi concernant les services IA pertinents. Aucun compte n'est requis.",
        "consentLabel": "J'accepte de recevoir mon estimation de ROI de l'IA et les informations de suivi pertinentes d'AiLunaPro. Je comprends que mes réponses et mon e-mail seront traités pour générer et conserver cette estimation, et que je peux demander la suppression de mes données à tout moment."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "Calcul en cours…",
        "idle": "Calculer mon ROI"
      },
      "signInPrompt": "Vous avez déjà un compte ?",
      "signInLink": "Se connecter",
      "errors": {
        "teamSize": "La taille de l'équipe doit être un nombre entier compris entre 1 et 10000.",
        "hours": "Les heures mensuelles doivent être un nombre compris entre 0 et 10000.",
        "cost": "Le coût horaire doit être un nombre compris entre 1 et 1000 USD.",
        "workflow": "Veuillez sélectionner un flux de travail.",
        "email": "Veuillez saisir une adresse e-mail valide.",
        "consent": "Vous devez accepter pour recevoir votre estimation.",
        "captchaLoading": "Le captcha se charge — veuillez patienter."
      },
      "result": {
        "monthlySavingsLabel": "Économies mensuelles estimées",
        "monthlySavingsUnit": "/mois",
        "yearlySavingsLabel": "Économies annuelles",
        "timeSavedLabel": "Temps gagné",
        "timeSavedValue": "{hours} h/mois",
        "paybackLabel": "Amortissement",
        "paybackValue": "{months} mois",
        "paybackEmpty": "—",
        "disclaimer": "Il s'agit d'une estimation fondée sur les informations que vous avez fournies et sur des hypothèses d'automatisation prudentes. Les économies réelles peuvent varier.",
        "pricingNote": "L'amortissement suppose un coût d'agent de référence de $99/month ; le tarif réel varie selon l'agent.",
        "recommendedAgentsHeading": "Agents AiLunaPro recommandés",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obtenir cet agent",
        "ctaHeading": "Vous souhaitez une analyse plus approfondie et votre plan d'action complet ?",
        "ctaBody": "Créez un espace de travail AiLunaPro gratuit pour accéder à l'audit complet, au registre et au catalogue d'agents.",
        "ctaButton": "Créer votre compte gratuit ↗",
        "ctaFootnote": "Se poursuit sur **dashboard.ailunapro.com** — la plateforme AiLuna pour les agents et solutions IA, l'étape suivante après votre audit.",
        "rerunButton": "Lancer un autre calcul"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Faible",
      "medium": "Moyen",
      "high": "Élevé",
      "critical": "Critique",
      "completed": "Terminé",
      "inProgress": "En cours",
      "draft": "Brouillon",
      "published": "Publié",
      "archived": "Archivé",
      "effortLow": "Effort faible",
      "effortMedium": "Effort moyen",
      "effortHigh": "Effort élevé"
    },
    "riskWord": {
      "critical": "Risque critique",
      "high": "Risque élevé",
      "medium": "Risque moyen",
      "low": "Risque faible",
      "minimal": "Risque minimal"
    },
    "approval": {
      "approved": "Approuvé",
      "pending": "En attente",
      "underReview": "En cours d'examen",
      "rejected": "Rejeté"
    },
    "oversight": {
      "hitl": "Humain dans la boucle",
      "hotl": "Humain sur la boucle",
      "oot": "Autonome"
    },
    "dataTypes": {
      "pii": "Données personnelles (PII)",
      "health": "Données de santé",
      "financial": "Financier / transactionnel",
      "biometric": "Biométrique",
      "children": "Données sur les mineurs",
      "public": "Public / ouvert",
      "internal": "Documents internes",
      "employee": "Dossiers des employés"
    },
    "confidence": {
      "low": "faible",
      "medium": "moyen",
      "high": "élevé"
    },
    "memberStatus": {
      "active": "Actif",
      "pending": "En attente",
      "invited": "Invité",
      "disabled": "Désactivé"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automatise les réponses clients et réduit la charge du support.",
        "description": "Agent AI conçu pour répondre aux questions fréquentes, qualifier les demandes de support, router les tickets et assister les équipes de service client. Il aide les entreprises à structurer un premier niveau de support disponible en continu, sans remplacer les équipes humaines.",
        "problemSolved": "Temps de réponse client trop longs, demandes répétitives et équipes de support surchargées."
      },
      "sales-agent": {
        "tagline": "Qualifie les prospects et prépare les relances commerciales.",
        "description": "Agent AI orienté commercial conçu pour qualifier les leads, préparer les réponses commerciales, générer des relances et structurer les opportunités. Il aide les équipes commerciales à gagner du temps sur les tâches répétitives et à améliorer le suivi des prospects.",
        "problemSolved": "Prospects mal qualifiés, relances oubliées et temps commercial gaspillé."
      },
      "finance-agent": {
        "tagline": "Assiste pour les factures, les devis et les relances.",
        "description": "Agent AI conçu pour aider à classer les documents financiers, préparer les devis, suivre les factures, générer des relances de recouvrement et signaler les anomalies simples. Il ne remplace pas un comptable, mais réduit considérablement le temps administratif lié aux finances.",
        "problemSolved": "Traitement manuel des factures, retards de recouvrement et erreurs de saisie."
      },
      "hr-agent": {
        "tagline": "Assiste les équipes RH pour le tri, les synthèses et la documentation.",
        "description": "Agent AI conçu pour soutenir les tâches RH répétitives telles que les synthèses de CV, les notes de candidats, les réponses internes, la documentation des collaborateurs et le suivi administratif RH. Il aide les équipes à structurer l'information et à réduire le temps consacré au travail documentaire manuel.",
        "problemSolved": "Les équipes RH perdent du temps sur le tri documentaire, les réponses répétitives et le suivi manuel."
      },
      "compliance-agent": {
        "tagline": "Aide à structurer la conformité AI, les risques et les registres.",
        "description": "Agent AI conçu pour soutenir la documentation de conformité, les contrôles internes, la préparation du registre AI et les plans de remédiation. Il est particulièrement utile aux organisations exposées aux obligations de gouvernance, de traçabilité et de conformité AI.",
        "problemSolved": "Les organisations manquent de visibilité claire sur la conformité AI, ont une documentation éparpillée et des risques AI non maîtrisés."
      },
      "marketing-agent": {
        "tagline": "Génère des contenus, des campagnes et des idées marketing.",
        "description": "Agent AI conçu pour générer des publications, des e-mails, des contenus de landing pages, des idées de campagnes, des synthèses et des supports marketing adaptés au profil de l'entreprise. Il aide les petites équipes à publier de manière plus régulière sans multiplier les outils.",
        "problemSolved": "Les équipes marketing peinent à assurer la cohérence des contenus, une création chronophage et des supports de campagne dispersés."
      },
      "reporting-agent": {
        "tagline": "Crée des synthèses, des tableaux de bord et des rapports décisionnels.",
        "description": "Agent AI conçu pour transformer les données et informations internes en synthèses, rapports, plans d'action et analyses prêtes pour la décision. Il aide les dirigeants et managers à obtenir une vision plus claire sans passer des heures à consolider l'information manuellement.",
        "problemSolved": "Les rapports manuels prennent trop de temps à produire et les décideurs manquent de synthèses concises."
      },
      "audit-agent": {
        "tagline": "Soutient l'audit AI, l'évaluation de maturité et les plans d'action.",
        "description": "Agent AI conçu pour aider à structurer les audits, analyser les réponses, identifier les risques et produire des recommandations actionnables. Il relie l'audit AI, la conformité et la transformation métier dans un flux de travail concret.",
        "problemSolved": "Les audits AI sont chronophages, analysés manuellement et difficiles à prioriser."
      },
      "document-agent": {
        "tagline": "Classe, synthétise et extrait l'information des documents.",
        "description": "Agent AI conçu pour traiter les documents, extraire les informations clés, générer des synthèses et organiser les fichiers. Il est utile aux organisations gérant de nombreuses pièces jointes, contrats, rapports, dossiers RH, documents financiers ou preuves de conformité.",
        "problemSolved": "Les documents sont mal organisés, longs à rechercher et coûteux à synthétiser manuellement."
      },
      "admin-agent": {
        "tagline": "Automatise le travail administratif quotidien.",
        "description": "Agent AI polyvalent pour les e-mails, les rendez-vous, les relances, les synthèses, les notes, l'organisation des tâches et les flux administratifs quotidiens. Il aide les fondateurs, les indépendants et les petites équipes à gagner du temps sur le travail opérationnel répétitif.",
        "problemSolved": "Le travail administratif prend trop de temps, les tâches sont répétitives et l'organisation est manuelle."
      }
    },
    "industries": {
      "all": "Tous",
      "b2b": "B2B",
      "construction": "Construction",
      "consulting": "Conseil",
      "creator": "Créateur",
      "ecommerce": "E-commerce",
      "education": "Éducation",
      "enterprise": "Grande entreprise",
      "finance": "Finance",
      "healthcare": "Santé",
      "legal": "Juridique",
      "public-sector": "Secteur public",
      "real-estate": "Immobilier",
      "retail": "Commerce de détail",
      "saas": "SaaS",
      "services": "Services"
    },
    "companySize": {
      "enterprise": "Grande entreprise",
      "sme": "PME",
      "solo": "Indépendant"
    },
    "profile": {
      "high": "Élevé",
      "medium": "Moyen"
    },
    "complexity": {
      "high": "Élevée",
      "low": "Faible",
      "medium": "Moyenne"
    },
    "model": {
      "subscription": "Abonnement"
    },
    "integrations": {
      "accounting": "Comptabilité",
      "audit-ai": "Audit AI",
      "calendar": "Agenda",
      "cloud-storage": "Stockage cloud",
      "compliance-tools": "Outils de conformité",
      "crm": "CRM",
      "dashboard": "Tableau de bord",
      "documents": "Documents",
      "email": "E-mail",
      "helpdesk": "Support client",
      "hris": "SIRH",
      "registry": "Registre",
      "social-media": "Réseaux sociaux",
      "spreadsheet": "Tableur",
      "website": "Site web"
    }
  },
};
