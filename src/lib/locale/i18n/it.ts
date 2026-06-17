/** B6.0 — Italian dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const it: Dict = {
  nav: {
    dashboard:             'Dashboard',
    'new-audit':           'Nuovo audit',
    reports:               'Report',
    'audit-history':       'Cronologia audit',
    'audit-express-run':   'Esegui Audit Express',
    'audit-express-saved': 'Audit salvati',
    registry:              'Registro IA',
    'system-builder':      'Costruttore di sistema',
    agents:                'Agenti',
    team:                  'Team',
    settings:              'Impostazioni',
    billing:               'Fatturazione',
    help:                  'Aiuto',
    toolsSection:          'Strumenti',
    aiRoiCalculator:       'Calcolatore ROI IA',
    aiMaturityDiagnostic:  'Diagnosi di maturità IA',
  },
  shell: {
    complianceSuite:  'Suite di conformità',
    signOut:          'Esci',
    workspaces:       'Spazi di lavoro',
    createWorkspace:  'Crea spazio di lavoro',
    searchWorkspaces: 'Cerca spazio…',
    language:         'Lingua',
    currency:         'Valuta',
  },
  settings: {
    title:               'Preferenze',
    themeTitle:          'Tema',
    themeHint:           'Scegli l’aspetto di AiLunaPro. Applicato subito.',
    light:               'Chiaro',
    dark:                'Scuro',
    languageTitle:       'Lingua',
    languageHint:        'Usata per le etichette dell’interfaccia e le e-mail. La traduzione viene distribuita sezione per sezione; le aree non tradotte restano in inglese.',
    currencyTitle:       'Valuta predefinita',
    currencyHint:        'Solo preferenza di visualizzazione. La fatturazione e i pacchetti di token restano in USD.',
    profileTitle:        'Profilo',
    profileHint:         'Regola il tono dei suggerimenti e la risorsa iniziale consigliata. Non modifica mai il punteggio, i rilievi né alcuna corrispondenza normativa.',
    notificationsTitle:  'Notifiche e-mail',
    notificationsHint:   'Scegli quali e-mail ricevere. La configurazione del mittente arriverà in una fase successiva.',
    weeklyDigest:        'Riepilogo settimanale di conformità',
    weeklyDigestDesc:    'Riepilogo dei nuovi rilievi e delle azioni risolte ogni lunedì.',
    reportReady:         'Report pronto',
    reportReadyDesc:     'Avvisami via e-mail quando un report richiesto è generato.',
    teamActivity:        'Attività del team',
    teamActivityDesc:    'Inviti, modifiche di ruolo e rimozioni di membri nei miei spazi di lavoro.',
    langToast:           'Lingua: {value}',
    currencyToast:       'Valuta: {value}',
    profileToast:        'Profilo: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Sezioni dell'audit",
      "questionCount": "{n} domande",
      "yes": "Sì",
      "no": "No"
    },
    "section": {
      "profile": {
        "title": "Profilo",
        "subtitle": "La tua organizzazione in sintesi"
      },
      "ai-tools": {
        "title": "Strumenti AI",
        "subtitle": "Quale AI utilizza concretamente la tua organizzazione?"
      },
      "data": {
        "title": "Dati",
        "subtitle": "Quali dati alimentano i tuoi sistemi AI?"
      },
      "governance": {
        "title": "Governance",
        "subtitle": "Policy, titolarità e responsabilità"
      },
      "security": {
        "title": "Sicurezza",
        "subtitle": "Proteggere i sistemi AI e i loro dati"
      },
      "transparency": {
        "title": "Trasparenza",
        "subtitle": "Divulgazione e spiegabilità"
      },
      "human-oversight": {
        "title": "Supervisione umana",
        "subtitle": "Mantenere il controllo umano"
      },
      "training-maturity": {
        "title": "Formazione e maturità",
        "subtitle": "Quanto è competente in materia di AI la tua organizzazione?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Nome dell'organizzazione",
        "placeholder": "es. Acme Corp"
      },
      "profile.industry": {
        "label": "Settore principale"
      },
      "profile.size": {
        "label": "Dimensione dell'azienda"
      },
      "profile.region": {
        "label": "Area operativa principale"
      },
      "tools.categories": {
        "label": "Quali categorie di AI sono in produzione?",
        "helper": "Seleziona tutte le opzioni pertinenti."
      },
      "tools.vendors": {
        "label": "Fornitori / prodotti AI principali",
        "placeholder": "es. OpenAI GPT-4, Anthropic Claude, modello interno su AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Ambito di implementazione"
      },
      "tools.builds_custom": {
        "label": "Addestri o esegui il fine-tuning di modelli propri?"
      },
      "data.types": {
        "label": "Quali tipi di dati vengono elaborati dall'AI?"
      },
      "data.residency": {
        "label": "Dove vengono archiviati principalmente i dati?"
      },
      "data.governance_framework": {
        "label": "Esiste un framework documentato di data governance?"
      },
      "data.sources": {
        "label": "Descrivi le tue principali fonti di dati",
        "placeholder": "es. CRM, telemetria di prodotto, ticket di assistenza clienti, dataset di terze parti…"
      },
      "gov.committee": {
        "label": "Disponi di un comitato di governance dell'AI o di un responsabile designato?"
      },
      "gov.written_policy": {
        "label": "Esiste una policy AI scritta approvata dalla dirigenza?"
      },
      "gov.frameworks": {
        "label": "A quali framework ti allinei?"
      },
      "gov.structure": {
        "label": "Descrivi la tua struttura di governance",
        "placeholder": "Chi è responsabile del rischio AI? Come vengono escalate le decisioni?"
      },
      "sec.controls": {
        "label": "Quali controlli di sicurezza sono attivi per i sistemi AI?"
      },
      "sec.red_team": {
        "label": "I tuoi sistemi AI sono stati sottoposti a red-teaming o a test antagonistici?"
      },
      "sec.incident_readiness": {
        "label": "Quanto sei preparato a un incidente specifico dell'AI?"
      },
      "sec.review_process": {
        "label": "Descrivi il tuo processo di revisione della sicurezza per i nuovi sistemi AI"
      },
      "trans.disclosure": {
        "label": "Comunichi l'uso dell'AI agli utenti finali quando vi interagiscono?"
      },
      "trans.cards": {
        "label": "Mantieni model card o system card?"
      },
      "trans.explainability": {
        "label": "Quanto sono spiegabili le tue decisioni AI per gli utenti interessati?"
      },
      "trans.measures": {
        "label": "Descrivi le tue misure di trasparenza",
        "placeholder": "Registro AI pubblico, informative in-app, log di audit accessibili agli utenti…"
      },
      "over.model": {
        "label": "Quale modello di supervisione descrive meglio la tua configurazione?"
      },
      "over.escalation": {
        "label": "Le procedure di escalation sono documentate per errori o danni causati dall'AI?"
      },
      "over.review_categories": {
        "label": "Quali categorie di decisioni richiedono una revisione umana obbligatoria?"
      },
      "over.processes": {
        "label": "Descrivi i tuoi processi di supervisione con parole tue"
      },
      "train.staff_training": {
        "label": "Fornisci formazione sull'alfabetizzazione AI al personale?"
      },
      "train.maturity": {
        "label": "Maturità di conformità AI autovalutata"
      },
      "train.topics": {
        "label": "Quali argomenti sono trattati nella tua formazione?"
      },
      "train.program": {
        "label": "Descrivi il tuo programma di formazione (o ciò che manca)"
      }
    },
    "option": {
      "profile.industry.finance": "Finanza e banche",
      "profile.industry.health": "Sanità e scienze della vita",
      "profile.industry.tech": "Tecnologia / SaaS",
      "profile.industry.retail": "Vendita al dettaglio ed e-commerce",
      "profile.industry.public": "Settore pubblico",
      "profile.industry.other": "Altro",
      "profile.size.xs": "1–10 dipendenti",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "Unione europea",
      "profile.region.uk": "Regno Unito",
      "profile.region.us": "Stati Uniti",
      "profile.region.ca": "Canada",
      "profile.region.apac": "Asia-Pacifico",
      "profile.region.global": "Globale / multi-regione",
      "tools.categories.llm": "Large Language Model (chat, agenti, copilot)",
      "tools.categories.ml": "ML classico / modelli predittivi",
      "tools.categories.cv": "Visione artificiale",
      "tools.categories.speech": "Voce e audio",
      "tools.categories.rec": "Sistemi di raccomandazione",
      "tools.categories.rpa": "RPA / automazione con componenti AI",
      "tools.scope.pilot": "Solo progetti pilota / sperimentazioni",
      "tools.scope.internal": "Uso interno rivolto al personale",
      "tools.scope.customer": "Funzionalità rivolte ai clienti",
      "tools.scope.critical": "Decisioni mission-critical / regolamentate",
      "data.types.pii": "Dati personali (PII)",
      "data.types.health": "Dati sanitari",
      "data.types.financial": "Dati finanziari / transazionali",
      "data.types.biometric": "Dati biometrici",
      "data.types.children": "Dati di minori",
      "data.types.public": "Dati pubblici / aperti",
      "data.residency.eu": "EU / EEA",
      "data.residency.us": "Stati Uniti",
      "data.residency.mixed": "Misto / multi-regione",
      "data.residency.unknown": "Non saprei",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Nessuno formalmente",
      "sec.controls.encryption": "Crittografia a riposo e in transito",
      "sec.controls.rbac": "Controllo degli accessi basato sui ruoli",
      "sec.controls.audit_logs": "Audit logging degli accessi e degli input dei modelli",
      "sec.controls.secrets": "Gestione dei segreti (nessuna chiave hardcoded)",
      "sec.controls.isolation": "Isolamento di tenant / dati",
      "sec.incident_readiness.1": "1 — Nessun piano",
      "sec.incident_readiness.2": "2 — Piano informale",
      "sec.incident_readiness.3": "3 — Documentato ma non testato",
      "sec.incident_readiness.4": "4 — Documentato e provato",
      "sec.incident_readiness.5": "5 — Continuo, integrated with SOC",
      "trans.explainability.none": "Nessuna spiegazione fornita",
      "trans.explainability.generic": "Solo informative generiche",
      "trans.explainability.category": "Motivazioni a livello di categoria",
      "trans.explainability.individual": "Spiegazioni per singola decisione su richiesta",
      "trans.explainability.realtime": "Spiegazioni in tempo reale, integrate nel prodotto",
      "over.model.hitl": "Human-in-the-loop (ogni decisione rivista)",
      "over.model.hotl": "Human-on-the-loop (revisione a campione)",
      "over.model.oot": "Human-out-of-the-loop (autonomo)",
      "over.review_categories.hr": "Decisioni di assunzione / HR",
      "over.review_categories.credit": "Decisioni creditizie / finanziarie",
      "over.review_categories.health": "Raccomandazioni in ambito sanitario",
      "over.review_categories.content": "Esiti di moderazione dei contenuti",
      "over.review_categories.legal": "Decisioni legali / di conformità",
      "train.maturity.1": "1 — Iniziale / ad hoc",
      "train.maturity.2": "2 — In sviluppo",
      "train.maturity.3": "3 — Definito",
      "train.maturity.4": "4 — Gestito",
      "train.maturity.5": "5 — Ottimizzato",
      "train.topics.bias": "Bias ed equità",
      "train.topics.privacy": "Privacy e protezione dei dati",
      "train.topics.security": "Sicurezza AI e uso improprio",
      "train.topics.usage": "Policy di uso accettabile",
      "train.topics.incident": "Risposta agli incidenti"
    }
  },
  results: {
    "nextTools": {
      "title": "Continua a esplorare",
      "subtitle": "Strumenti leggeri che puoi eseguire quando vuoi, senza configurazione.",
      "roi": "Stima il tuo ROI",
      "diagnostic": "Esegui un'altra diagnosi rapida"
    },
    "insightCard": {
      "whatThisMeans": "Cosa significa",
      "whyItMatters": "Perché è importante",
      "howItPlaysOut": "Come si traduce in pratica",
      "exampleHeading": "Esempio — come ne beneficia un'azienda simile",
      "illustrative": "(A scopo illustrativo.)",
      "doThisNext": "Cosa fare adesso",
      "doThisNextWithHeading": "Cosa fare adesso — {heading}",
      "onceDone": "Una volta completato: {outcome}",
      "referencesPrefix": "Riferimenti: {refs}"
    },
    "explained": {
      "heading": "Cosa significano i tuoi risultati",
      "subtitle": "Ogni voce qui sotto spiega cosa abbiamo rilevato, perché è importante e il passo successivo più rapido — con i punti di punteggio che puoi recuperare.",
      "emptyTitle": "Nessuna lacuna rilevata — base solida",
      "emptyWhatItMeans": "Le tue risposte non hanno generato alcun rilievo — la tua pratica IA copre già le basi che verifichiamo.",
      "emptyWhyItMatters": "È una base solida. I prossimi guadagni arrivano applicando questi controlli in modo coerente e su larga scala.",
      "emptyFlowInput": "buone pratiche",
      "emptyFlowProcess": "rendile abituali",
      "emptyFlowOutput": "controlli coerenti",
      "emptyFlowGain": "fiducia duratura e scalabile",
      "emptyExample": "I team a questo livello passano dal “lo facciamo” al “funziona da solo” — automatizzando le parti manuali. (A scopo illustrativo.)",
      "emptyDoNextHeading": "Scalalo",
      "emptyDoNextStep1": "Automatizza i controlli che oggi esegui manualmente.",
      "emptyDoNextStep2": "Ripeti l'audit periodicamente per mantenere il livello.",
      "ctaSeeAgentsForThis": "Vedi gli agenti che possono farlo",
      "ctaSeeRecommendedAgents": "Vedi gli agenti consigliati",
      "ctaOpenDesignGuide": "Apri la guida alla progettazione",
      "ptsToRecover": "−{n} pt da recuperare",
      "priorityCritical": "Priorità: Critica",
      "priorityHigh": "Priorità: Alta",
      "priorityMedium": "Priorità: Media",
      "priorityLow": "Priorità: Bassa",
      "effortBadge": "Impegno: {effort}",
      "effortBadgeDefault": "Impegno: medio",
      "timeframeBadge": "~{days} giorni",
      "timeframeBadgeDefault": "~30 giorni"
    },
    "findings": {
      "title": "Rilievi",
      "total": "{n} in totale",
      "empty": "✓ Nessun rilievo rilevato. Continua a far maturare la tua conformità seguendo le raccomandazioni a destra.",
      "severityCritical": "Critico",
      "severityHigh": "Alto",
      "severityMedium": "Medio",
      "severityLow": "Basso",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} raccomandazione/i"
    },
    "recommendations": {
      "title": "Raccomandazioni",
      "actionsCount": "{n} azioni",
      "starterResource": "Risorsa iniziale consigliata",
      "empty": "Nessuna raccomandazione attuabile al momento.",
      "impactCritical": "Impatto critico",
      "impactHigh": "Impatto alto",
      "impactMedium": "Impatto medio",
      "impactLow": "Impatto basso",
      "timeframeDays": "{n}g",
      "addressesFindings": "affronta {count} rilievo/i"
    },
    "actionPlan": {
      "title": "Piano d'azione prioritizzato",
      "roadmapNote": "La roadmap indica quando rilasciare; il piano d'azione indica cosa correggere per primo.",
      "bandCriticalTitle": "Critico",
      "bandImportantTitle": "Importante",
      "bandImportantSubtitle": "Breve termine — da affrontare nel trimestre in corso.",
      "bandImprovementTitle": "Miglioramento",
      "bandImprovementSubtitle": "Buona pratica — da pianificare per la maturità.",
      "itemCount": "{n} voce/i",
      "bandEmpty": "Nessuna voce in questa fascia — per ora niente di attuabile qui.",
      "moreNotShown": "+{n} altri non mostrati",
      "impactPill": "Impatto",
      "effortPill": "Impegno",
      "expectedOutcome": "Risultato atteso —"
    }
  },
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Quale area vorresti migliorare di più?",
          "opt": {
            "support": "Assistenza clienti",
            "sales": "Vendite",
            "finance": "Finanza",
            "documents": "Documenti",
            "reporting": "Reportistica",
            "admin": "Amministrazione",
            "compliance": "Conformità",
            "marketing": "Marketing",
            "hr": "HR"
          }
        },
        "monthlyHours": {
          "label": "Più o meno quante ore al mese sono dedicate al lavoro ripetitivo?",
          "opt": {
            "low": "Poche (~20)",
            "medium": "Una discreta quantità (~80)",
            "high": "Molte (~160)"
          }
        },
        "hourlyCost": {
          "label": "Costo orario medio approssimativo di quel lavoro?",
          "opt": {
            "low": "Più basso (~$25)",
            "medium": "Medio (~$45)",
            "high": "Più alto (~$75)"
          }
        },
        "aiUsage": {
          "label": "Come viene utilizzata l'AI nella tua organizzazione oggi?",
          "opt": {
            "none": "Non ancora",
            "individual": "Individualmente",
            "team": "Tra i team",
            "structured": "In flussi di lavoro strutturati"
          }
        },
        "shadowAi": {
          "label": "Quanta visibilità hai sugli strumenti AI in uso?",
          "opt": {
            "no_visibility": "Nessuna",
            "partial_visibility": "Parziale",
            "mostly_visible": "Per la maggior parte",
            "full_inventory": "Inventario completo"
          }
        }
      },
      "run": {
        "title": "Avvia Audit Express",
        "subtitle": "Un'istantanea rapida e puramente indicativa della preparazione all'AI — salvata automaticamente nel tuo spazio di lavoro.",
        "errPreviewCode": "Impossibile eseguire l'anteprima ({code}).",
        "errPreview": "Impossibile eseguire l'anteprima.",
        "errAnalysisCode": "Analisi non disponibile ({code}).",
        "errAnalysis": "Analisi non disponibile. Riprova.",
        "errDocCode": "Analisi del documento non disponibile ({code}).",
        "errDoc": "Analisi del documento non disponibile. Riprova.",
        "analyzeSiteTitle": "Analizza un sito web pubblico (facoltativo)",
        "analyzeSiteHint": "Legge solo le pagine pubbliche, rispetta robots.txt. Arricchisce “Cosa fa questa azienda”.",
        "deepScan": "Scansione approfondita (più lenta, più pagine)",
        "saving": "Salvataggio del tuo risultato…",
        "journeyHeadline": "Ecco cosa significa la tua istantanea",
        "journeyReadiness": "Preparazione all'AI: {bucket} ({score}/100).",
        "journeyTimeSaved": "Tempo risparmiato stimato ≈ {hours} ore/mese.",
        "journeyCostSaved": "Costo risparmiato stimato ≈ {amount}/mese."
      },
      "cta": {
        "computing": "Elaborazione…",
        "getPreview": "Ottieni anteprima",
        "analyzing": "Analisi in corso…",
        "analyzeSite": "Analizza sito",
        "preparing": "Preparazione…",
        "downloadPdf": "Scarica PDF",
        "viewSaved": "Visualizza audit salvati",
        "seeAgents": "Vedi gli agenti abbinati al tuo audit →",
        "runFullAudit": "Esegui un audit completo",
        "extracting": "Estrazione…",
        "analyzeDocument": "Analizza documento →",
        "save": "Salva",
        "cancel": "Annulla"
      },
      "result": {
        "snapshotHeading": "La tua istantanea · Preparazione all'AI: {bucket} ({score}/100)",
        "whatThisMeans": "Cosa significa",
        "opportunityLabel": "L'opportunità — intervalli indicativi",
        "timeBack": "Tempo recuperato",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Impatto sui costi",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Ritorno",
        "howSavingLabel": "Come avviene il risparmio",
        "flowRepetitive": "attività ripetitive",
        "flowAssisted": "assistito / automatizzato",
        "flowSameWork": "stesso lavoro, meno tempo manuale",
        "flowHoursBack": "ore restituite ad attività a maggior valore",
        "roiUnavailable": "Stima del ROI non disponibile per questo audit.",
        "whatToDoFirst": "Cosa fare per primo",
        "step1": "Scegli un'attività ad alto volume (risposte di assistenza, inserimento fatture, reportistica).",
        "step2": "Sperimenta un assistente su di essa per ~2 settimane.",
        "step3": "Misura le ore prima/dopo — mantieni ciò che ripaga.",
        "businessHeading": "Cosa fa questa azienda",
        "businessType": "Tipo:",
        "businessAudience": "Pubblico:",
        "businessConfidence": "affidabilità {confidence}",
        "businessUnknown": "sconosciuto",
        "offers": "Offerte: {list}",
        "automationHeading": "Opportunità di automazione",
        "opportunityItem": "{title} — impatto {impact} / sforzo {effort}"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Andamento del punteggio",
      "subtitle": "Punteggio di maturità IA nel tempo",
      "empty": {
        "title": "Gli andamenti compaiono dopo più audit",
        "hint": "Una volta inviati diversi audit in questo workspace, il tuo punteggio di maturità IA verrà tracciato qui a partire dalla tua cronologia reale."
      }
    },
    "automation": {
      "title": "Opportunità di automazione",
      "subtitle": "Su misura per il tuo utilizzo dell'IA",
      "empty": {
        "title": "Esegui un audit per ottenere opportunità su misura",
        "hint": "Le opportunità di automazione derivano dalle tue risposte agli audit e dal registro IA. Completa un audit e aggiungi i tuoi strumenti IA per vedere i suggerimenti qui."
      }
    },
    "businessImpact": {
      "title": "Impatto sul business",
      "subtitle": "Risultati misurati dal tuo programma di conformità",
      "empty": {
        "title": "Le metriche di impatto compaiono man mano che il tuo programma matura",
        "hint": "Esegui audit nel tempo per costruire uno storico. La riduzione del rischio, i progressi nella governance e il tempo risparmiato verranno calcolati dalla tua cronologia reale — nessuna stima."
      }
    },
    "recentReports": {
      "title": "Report recenti",
      "countOne": "{n} report generato",
      "countOther": "{n} report generati",
      "viewAll": "Visualizza tutti →",
      "empty": {
        "title": "Ancora nessun report",
        "hint": "Genera un report da un audit inviato — comparirà qui e nella sezione Report di questo workspace."
      }
    },
    "kpi": {
      "auditsSubmitted": "Audit inviati",
      "reportsGenerated": "Report generati",
      "aiToolsRegistered": "Strumenti IA registrati",
      "loadErrorSuffix": " — caricamento non riuscito"
    },
    "maturity": {
      "rung": {
        "initial": "Iniziale",
        "managed": "Gestito",
        "defined": "Definito",
        "advanced": "Avanzato",
        "optimal": "Ottimale"
      }
    },
    "cta": {
      "poweredBy": "Powered by Luna AI",
      "scheduleDemo": "Prenota una demo",
      "startFreeTrial": "Inizia la prova gratuita →"
    },
    "quickTools": {
      "title": "Strumenti rapidi",
      "subtitle": "Controlli leggeri che puoi rifare quando vuoi, separati dal tuo audit completo.",
      "diagnostic": {
        "label": "Esegui una diagnosi rapida",
        "hint": "Valuta la tua maturità IA in ~2 min"
      },
      "roi": {
        "label": "Stima il tuo ROI",
        "hint": "Scopri il tempo e i costi che puoi risparmiare"
      }
    }
  },
  topbar: {
    "title": {
      "dashboard": "Dashboard",
      "audit/new": "Nuovo audit",
      "audit/result": "Risultato dell'audit",
      "audit/assistance": "Guida all'implementazione",
      "audit/history": "Cronologia degli audit",
      "reports": "Report",
      "reports/detail": "Report",
      "reports/share": "Report condiviso",
      "registry": "Registro AI",
      "system-builder": "System Builder",
      "agents": "Agenti",
      "agents/detail": "Agente",
      "team": "Team",
      "settings": "Impostazioni",
      "billing": "Fatturazione",
      "billing/tokens": "Token",
      "help": "Aiuto",
      "audit-express/run": "Avvia Audit Express",
      "audit-express/saved": "Audit salvati",
      "audit-express/detail": "Audit salvato"
    },
    "subtitle": {
      "dashboard": "Panoramica della conformità AI"
    },
    "search": {
      "placeholder": "Cerca audit, report…",
      "toast": "Ricerca di \"{query}\"…"
    },
    "dateRange": {
      "last7": "Ultimi 7 giorni",
      "last30": "Ultimi 30 giorni",
      "thisMonth": "Questo mese",
      "lastMonth": "Mese scorso",
      "customRange": "Intervallo personalizzato…",
      "from": "Da",
      "to": "A",
      "apply": "Applica intervallo",
      "toast": "Intervallo di date: {label}",
      "errPickBoth": "Selezioni una data di inizio e una di fine.",
      "errOrder": "La data di inizio deve precedere la data di fine."
    },
    "notifications": {
      "label": "Notifiche",
      "title": "Notifiche",
      "empty": "Ancora nessuna notifica."
    },
    "tokens": {
      "aria": "{n} token rimanenti — gestisci i token",
      "title": "{n} token rimanenti · clicca per gestire",
      "balance": "{used} / {total}",
      "corruptTitle": "Il saldo dei token contiene dati non validi — clicca per riparare",
      "corruptLabel": "I token necessitano di riparazione"
    },
    "luna": {
      "aria": "Apri Luna, la tua guida",
      "title": "Luna — la tua guida",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Passa alla modalità scura",
      "toLight": "Passa alla modalità chiara"
    },
    "newAudit": {
      "label": "Nuovo audit",
      "denied": "Il suo ruolo non consente di creare audit. Gli audit sono riservati ai ruoli Proprietario, Amministratore e Membro."
    },
    "sidebar": {
      "openMenu": "Apri il menu di navigazione",
      "closeMenu": "Chiudi il menu di navigazione",
      "menu": "Menu",
      "expand": "Espandi la barra laterale",
      "collapse": "Comprimi la barra laterale"
    }
  },
  auditForm: {
    "title": "Nuovo audit",
    "subtitle": "Completi 8 sezioni per valutare il suo livello di conformità AI. I suoi progressi vengono salvati man mano — può interrompere e riprendere in qualsiasi momento.",
    "loading": "Caricamento dell'audit…",
    "forbiddenTitle": "Il suo ruolo non consente di creare audit",
    "forbiddenBody": "Gli audit sono disponibili per i ruoli Proprietario, Amministratore e Membro. Si rivolga a un proprietario o amministratore dello spazio di lavoro se ha bisogno dell'accesso agli audit.",
    "errorLoad": "Caricamento dell'audit non riuscito. Aggiorni per riprovare.",
    "pageTitle": "Nuovo audit",
    "pageIntro": "Completi 8 sezioni per valutare il suo livello di conformità AI. I suoi progressi vengono salvati man mano — può interrompere e riprendere in qualsiasi momento.",
    "stepOf": "Passaggio {current} di {total}",
    "overallProgress": "Avanzamento complessivo",
    "previous": "← Precedente",
    "saveDraft": "Salva bozza",
    "saveContinue": "Salva e continua →",
    "submit": "Invia audit ✓",
    "saved": "✓ Salvato"
  },
  settingsPages: {
    "shell": {
      "title": "Impostazioni",
      "subtitle": "Gestisci il tuo profilo, l'organizzazione e le preferenze."
    },
    "tabs": {
      "profile": "Profilo",
      "org": "Organizzazione",
      "preferences": "Preferenze",
      "billing": "Fatturazione"
    },
    "profile": {
      "sectionTitle": "Profilo",
      "avatarHint": "L'avatar è generato dalle tue iniziali. Il caricamento personalizzato sarà disponibile in seguito.",
      "displayName": "Nome visualizzato",
      "displayNamePlaceholder": "Il tuo nome completo",
      "email": "Email",
      "emailPlaceholder": "tu@esempio.com",
      "emailVerificationTitle": "Verifica dell'email",
      "emailVerified": "✓ La tua email è verificata.",
      "sendVerification": "Invia email di verifica",
      "sendingVerification": "Invio in corso…",
      "passwordTitle": "Password",
      "passwordHint": "Ti invieremo un link per il ripristino alla tua email. Il link scade dopo un'ora.",
      "sendPasswordReset": "Invia email per il ripristino della password",
      "sendingReset": "Invio in corso…",
      "savedToast": "Profilo aggiornato."
    },
    "org": {
      "sectionTitle": "Organizzazione",
      "fallbackName": "Spazio di lavoro",
      "nameLabel": "Nome dell'organizzazione",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Solo il proprietario dello spazio di lavoro può rinominare o eliminare l'organizzazione.",
      "planTitle": "Piano",
      "dangerZoneTitle": "Zona pericolosa",
      "dangerZoneHint": "L'eliminazione di un'organizzazione rimuove tutti i suoi dati: audit, report, registro e membri del team. Questa azione non può essere annullata.",
      "deleteButton": "Elimina organizzazione…",
      "deleteDialogTitle": "Eliminare \"{name}\"?",
      "deleteDialogBody1": "Questa operazione rimuoverà definitivamente l'organizzazione, tutti i suoi audit, report, elementi del registro e appartenenze al team.",
      "deleteDialogBody2": "Ti verrà chiesto di confermare un'altra volta prima che venga toccato qualsiasi dato.",
      "deleteConfirmLabel": "Ho capito, continua",
      "renamedToast": "Organizzazione rinominata.",
      "deletionDeferredToast": "L'eliminazione dell'organizzazione sarà abilitata in una fase successiva del backend."
    },
    "billing": {
      "sectionTitle": "Fatturazione",
      "checkingAccess": "Verifica dell'accesso…"
    }
  },
  common: {
    "saveChanges": "Salva modifiche",
    "saving": "Salvataggio…",
    "cancel": "Annulla",
    "loading": "Caricamento…",
    "save": "Salva",
    "confirm": "Conferma",
    "close": "Chiudi",
    "tryAgain": "Riprova",
    "reloadPage": "Ricarica la pagina",
    "retryNow": "Riprova ora",
    "reload": "Ricarica",
    "somethingWentWrong": "Si è verificato un problema",
    "couldntLoadThePage": "Impossibile caricare la pagina",
    "stillConnecting": "Connessione ancora in corso…"
  },
  journey: {
    "label": {
      "choice": "Scegli",
      "audit": "Audit",
      "understanding": "Comprendi",
      "adoption": "Adotta"
    },
    "hint": {
      "choice": "Scegli come iniziare — Audit Express per una panoramica rapida, oppure un Nuovo audit per maggiore profondità.",
      "audit": "Completa il tuo audit — ti spiegheremo cosa significa e quali sono i prossimi passi.",
      "understanding": "Ecco cosa significa il tuo audit. Esamina gli approfondimenti, quindi scegli il passo successivo."
    },
    "progress": {
      "ariaLabel": "Avanzamento del percorso guidato"
    },
    "chooseAuditType": "Scegli il tipo di audit →",
    "dismissAriaLabel": "Chiudi il percorso guidato",
    "dismiss": "Chiudi",
    "next": {
      "whatNext": "Cosa vorresti fare ora?",
      "recommendedTag": "Consigliato",
      "backToDashboard": "Torna alla dashboard",
      "cta": {
        "agents": {
          "title": "Vedi gli agenti consigliati",
          "body": "Strumenti abbinati al tuo audit che possono farti risparmiare tempo sul lavoro che hai segnalato."
        },
        "billing": {
          "title": "Esplora l'abbonamento",
          "body": "Piani, token e cosa è incluso — adotta al tuo ritmo."
        },
        "systemBuilder": {
          "title": "Apri System Builder",
          "body": "Una guida in sola lettura per progettare il tuo sistema AI lungo sei dimensioni."
        }
      }
    },
    "start": {
      "greetingTitle": "Ciao, sono Luna — iniziamo.",
      "greetingBody": "Scegli come preferisci cominciare. Puoi cambiare in qualsiasi momento e puoi sempre andare direttamente alla tua dashboard.",
      "pendingGreetingDiagnostic": "Abbiamo salvato il tuo diagnostico. Un audit completo lo trasforma in un piano d'azione completo. Scegli come continuare.",
      "pendingGreetingRoi": "Abbiamo salvato la tua stima del ROI. Un audit completo la trasforma in un piano d'azione completo. Scegli come continuare.",
      "heading": "Come vuoi iniziare?",
      "express": {
        "badge": "Consigliato per il tuo primo audit",
        "time": "~5 min",
        "title": "Audit Express",
        "body": "Una panoramica rapida sulla preparazione all'AI, di circa 5 minuti — alcune domande veloci, un'analisi facoltativa del sito web, un ROI indicativo. Ideale per un primo sguardo.",
        "cta": "Avvia Audit Express →"
      },
      "full": {
        "time": "~15 min",
        "title": "Nuovo audit (completo)",
        "body": "Il questionario strutturato completo — punteggi più approfonditi di conformità e maturità che puoi trasformare in un report condivisibile. Ideale per una valutazione approfondita.",
        "cta": "Crea un nuovo audit →"
      },
      "skip": "Salta — vai direttamente alla mia dashboard"
    }
  },
  auth: {
    "login": {
      "title": "Accedi",
      "subtitle": "Bentornato su AiLunaPro",
      "forgotPassword": "Password dimenticata?",
      "signingIn": "Accesso in corso…",
      "signInButton": "Accedi",
      "noAccountPrompt": "Non hai un account?",
      "signUpLink": "Registrati"
    },
    "field": {
      "emailAddress": "Indirizzo email",
      "password": "Password",
      "fullName": "Nome completo",
      "workEmail": "Email di lavoro"
    },
    "placeholder": {
      "email": "tu@azienda.com",
      "fullName": "Sofia Bianchi"
    },
    "signup": {
      "title": "Crea il tuo account",
      "subtitle": "Inizia il tuo percorso di conformità AI",
      "passwordHint": "Minimo 8 caratteri",
      "creatingAccount": "Creazione dell'account…",
      "createAccountButton": "Crea account",
      "haveAccountPrompt": "Hai già un account?",
      "signInLink": "Accedi"
    },
    "forgot": {
      "title": "Reimposta la password",
      "subtitleSent": "Controlla la tua casella di posta per il link di reimpostazione.",
      "subtitle": "Inserisci la tua email e ti invieremo un link per reimpostarla.",
      "sentDetail": "Controlla la cartella spam se non arriva.",
      "backToSignIn": "← Torna all'accesso",
      "sending": "Invio in corso…",
      "sendResetLink": "Invia il link di reimpostazione",
      "rememberPrompt": "Ti ricordi la password?",
      "signInLink": "Accedi"
    },
    "invite": {
      "titleParsing": "Lettura dell'invito…",
      "titleAuthRequired": "Accedi per accettare",
      "titleVerifying": "Verifica dell'invito…",
      "titleAccepting": "Aggiunta allo spazio di lavoro in corso…",
      "titleDone": "Benvenuto nel team!",
      "titleError": "Problema con l'invito",
      "authRequiredBody": "Accedi o crea un account per accettare questo invito.",
      "redirecting": "Reindirizzamento…",
      "pleaseWait": "Attendi un momento.",
      "createAccountButton": "Crea account",
      "signInButton": "Accedi",
      "backToDashboard": "Torna alla dashboard"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "Centro assistenza",
      "subtitle": "Trova risposte, scopri i flussi di lavoro e risolvi i problemi più comuni.",
      "onThisPage": "In questa pagina",
      "tocAria": "Sezioni dell'assistenza",
      "keyTakeaways": "Punti chiave",
      "needMoreHelpTitle": "Ti serve altro aiuto?",
      "needMoreHelpBody": "Contatta il proprietario del tuo workspace o l'assistenza AiLunaPro."
    },
    "gettingStarted": {
      "title": "Per iniziare",
      "lede": "AiLunaPro è una suite di conformità e trasformazione AI per le organizzazioni che adottano l'AI — audit, un registro IA, raccomandazioni di agenti, stime di ROI e un modello di utilizzo basato su token in un unico workspace.",
      "take1": "Parti dalla dashboard, poi avvia un Nuovo audit dalla barra laterale.",
      "take2": "Due strumenti pubblici non richiedono accesso: Diagnostic Express e il Calcolatore ROI.",
      "take3": "Proprietari e amministratori invitano i colleghi con link validi 7 giorni.",
      "firstActionsTitle": "Le tue prime tre azioni",
      "fa1": "Apri la dashboard e controlla il tuo attuale punteggio di maturità AI.",
      "fa2": "Avvia un Nuovo audit dalla barra laterale per rilevare il tuo utilizzo dell'AI e i relativi rischi.",
      "fa3": "Sfoglia il catalogo Agenti per scoprire quali agenti AiLunaPro si adattano al tuo flusso di lavoro.",
      "leadMagnetsTitle": "Lead-magnet pubblici",
      "lm1": "Diagnostic Express — una valutazione gratuita della maturità AI in 8 domande, senza bisogno di un account.",
      "lm2": "Calcolatore ROI — stima il tempo e il denaro che il tuo team può risparmiare con gli agenti AiLunaPro.",
      "publicLinks": "Trovi entrambi su `#/diagnostic` e `#/roi-calculator`. Condividi questi link con i colleghi — non richiedono l'accesso.",
      "inviteTitle": "Invitare i colleghi",
      "inviteBody": "Proprietari e amministratori possono invitare i colleghi dalla pagina Team nella barra laterale. Ogni invitato riceve un link valido 7 giorni. I ruoli vengono assegnati al momento dell'invito.",
      "flowTitle": "Come funziona il flusso",
      "flowStep1": "Nuovo audit",
      "flowStep2": "Invia audit",
      "flowStep3": "Audit salvato + punteggio",
      "flowStep4": "Genera report",
      "flowStep5": "Elenco report",
      "flowCaption": "Dall'audit a uno snapshot di report condivisibile"
    },
    "auditVsReport": {
      "title": "Audit e Report",
      "inShortTitle": "In breve",
      "inShort1": "Un **Audit** raccoglie le tue risposte e calcola il tuo punteggio.",
      "inShort2": "Un **Report** è uno **snapshot** di un audit, creato intenzionalmente per essere condiviso o archiviato.",
      "calloutSubmit": "**L'invio salva il tuo audit + punteggio.** Un **Report** è uno snapshot, creato solo quando fai clic su **Genera report**.",
      "whatIsAuditTitle": "Cos'è un Audit?",
      "wa1": "Le tue risposte a domande strutturate.",
      "wa2": "Il tuo punteggio di conformità / maturità.",
      "wa3": "Un'analisi dinamica che può evolversi con le regole di punteggio.",
      "calloutEditable": "Un audit resta modificabile finché non generi un report.",
      "whatIsReportTitle": "Cos'è un Report?",
      "wr1": "Uno snapshot congelato in un momento specifico.",
      "wr2": "Creato solo quando fai clic su **Genera report**.",
      "wr3": "Stabile anche se esegui nuovi audit in seguito. Esportabile e condivisibile, elencato sotto **Report** per il workspace attivo.",
      "flowStep1": "Invia audit",
      "flowStep2": "Audit salvato",
      "flowStep3": "Generare report?",
      "flowStep4": "Snapshot del report",
      "flowStep5": "Elenco report",
      "flowCaption": "Un report viene creato solo con Genera report",
      "calloutFlow": "**Invia audit** → salva audit + punteggio. **Genera report** → crea uno snapshot visibile in *Report*.",
      "closing": "Una vista **Cronologia audit** (distinta dai Report) è disponibile nella barra laterale. *Prossimamente:* report automatico opzionale all'invio."
    },
    "reportsWorkspaces": {
      "title": "Report e Workspace",
      "p1": "I report sono **per workspace**, non globali. L'elenco Report mostra solo i report del workspace **attivo**.",
      "flowStep1": "Workspace A → i suoi report",
      "flowStep2": "Workspace B → i suoi report",
      "flowCaption": "Ogni workspace conserva i propri report",
      "calloutWarn": "Non vedi un vecchio report? Probabilmente appartiene a **un altro workspace**. Cambia workspace dal selettore in cima alla barra laterale.",
      "calloutNote": "Il filtro per data della dashboard **non** influisce sull'elenco Report."
    },
    "fillingAudit": {
      "title": "Come compilare correttamente l'audit",
      "p1": "Buoni input rendono un audit credibile. Prenditi un minuto per rispondere onestamente — il risultato riflette ciò che inserisci.",
      "calloutInfo": "I campi a testo libero **“Descrivi…”** aggiungono contesto. Il tuo **punteggio deriva dalle domande strutturate (a scelta)**, non dal testo libero. Usa informazioni chiare, reali e leggibili per un report credibile.",
      "li1": "Rispondi a ogni domanda strutturata — guidano il punteggio e i risultati.",
      "li2": "Usa i campi a testo libero per contesto reale (responsabili, strumenti, processi), non testo segnaposto.",
      "li3": "Ripeti l'audit man mano che le tue pratiche evolvono per monitorare i progressi."
    },
    "agents": {
      "title": "Agenti AI",
      "lede": "Il catalogo Agenti elenca dieci agenti AI pronti all'uso per i flussi di lavoro aziendali comuni. Ogni scheda mostra una descrizione, il ROI atteso, un piano minimo consigliato e un link per iniziare.",
      "take1": "Dieci agenti proprietari, ciascuno contrassegnato AiLunaPro.",
      "take2": "Un badge di piano (Starter+ / Professional+ / Enterprise+) suggerisce il livello tipico.",
      "take3": "“Ottieni questo agente” avvia il normale flusso di registrazione — nessun acquisto in-app per ora.",
      "catalogTitle": "Catalogo (10 agenti)",
      "cat1": "automatizza le risposte ai clienti e riduce il carico di lavoro dell'assistenza.",
      "cat2": "qualifica i prospect e prepara i follow-up commerciali.",
      "cat3": "assiste con fatture, preventivi e incassi.",
      "cat4": "assiste i team HR con screening, sintesi e documentazione.",
      "cat5": "aiuta a strutturare conformità AI, rischi e registri.",
      "cat6": "genera contenuti, campagne e idee di marketing.",
      "cat7": "crea sintesi, dashboard e report decisionali.",
      "cat8": "supporta audit AI, valutazione della maturità e piani d'azione.",
      "cat9": "classifica, sintetizza ed estrae informazioni dai documenti.",
      "cat10": "automatizza il lavoro amministrativo quotidiano.",
      "sourceBadgeTitle": "Badge di origine",
      "sourceBadgeBody": "Gli agenti sono contrassegnati **AiLunaPro** quando sono proprietari. Le versioni future mostreranno alternative esterne con il proprio badge.",
      "planBadgeTitle": "Badge di piano",
      "planBadgeBody": "Ogni scheda mostra un badge di piano minimo (Starter+, Professional+, Enterprise+). Indica il livello di abbonamento consigliato per un utilizzo tipico.",
      "getAgentTitle": "Ottieni questo agente",
      "getAgentBody": "Fai clic sul pulsante \"Ottieni questo agente\" per avviare l'onboarding. Gli agenti non sono ancora acquistabili direttamente all'interno di AiLunaPro — il link ti guida attraverso il normale flusso di registrazione."
    },
    "tokens": {
      "title": "Token",
      "intro": "I token sono l'unità di consumo AI all'interno di AiLunaPro. Ogni audit, raccomandazione o chiamata di un agente utilizza token dall'allocazione mensile del tuo workspace.",
      "howTitle": "Come funzionano i token",
      "how1": "Il tuo abbonamento include un'allocazione mensile di token adeguata al piano.",
      "how2": "A ogni ciclo il tuo saldo si rinnova. Un piccolo riporto (limitato a un'allocazione mensile) viene trasferito per evitare di perdere i token inutilizzati.",
      "how3": "Se il tuo saldo si esaurisce, puoi acquistare un pacchetto di ricarica in qualsiasi momento.",
      "how4": "I token di ricarica vengono aggiunti al tuo saldo e non scadono mai.",
      "how5": "Le ricariche integrano il tuo abbonamento — non lo sostituiscono.",
      "packsTitle": "Pacchetti di ricarica",
      "packsBody": "Sono disponibili tre pacchetti: Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). I pacchetti di token sono attualmente fatturati in USD.",
      "balanceTitle": "Dove visualizzare il tuo saldo",
      "balanceBody": "Il badge dei token nella barra superiore mostra il tuo saldo attuale e l'allocazione mensile. Fai clic per aprire la pagina Token e vedere lo storico completo dell'utilizzo e acquistare una ricarica.",
      "runOutTitle": "Quando i token si esauriscono",
      "runOutBody": "Le azioni AI che richiedono più token del tuo saldo mostrano un chiaro messaggio \"token insufficienti\" e un link per acquistare una ricarica. Proprietari, amministratori e responsabili della fatturazione possono acquistare pacchetti. I membri possono visualizzare i saldi ma non possono acquistare."
    },
    "billing": {
      "title": "Fatturazione",
      "lede": "AiLunaPro offre i piani Free, Starter, Professional ed Enterprise, che differiscono per allocazione di token, volume di audit e funzionalità del team. Checkout e gestione avvengono tramite Stripe.",
      "take1": "Fatturazione e pacchetti di token sono in USD; il selettore di valuta per ora è solo a fini di visualizzazione.",
      "take2": "Proprietari/amministratori sottoscrivono e gestiscono i piani dalla pagina Fatturazione (Stripe Customer Portal).",
      "take3": "Il piano Free include audit limitati e 100 token al mese.",
      "currencyTitle": "Valuta",
      "currencyBody": "Fatturazione e pacchetti di token sono attualmente in USD. Il selettore di valuta nella barra laterale è solo una preferenza di visualizzazione. Per ora non modifica la valuta del checkout Stripe né il prezzo dei pacchetti di token. La fatturazione multivaluta è prevista per una versione futura.",
      "subscribingTitle": "Sottoscrizione",
      "subscribingBody": "Dalla pagina Fatturazione, proprietari e amministratori possono scegliere un piano e completare il checkout tramite Stripe. L'abbonamento si attiva immediatamente al pagamento riuscito e la tua allocazione di token si aggiorna automaticamente.",
      "manageTitle": "Gestire il tuo abbonamento",
      "manageBody": "Il pulsante \"Gestisci abbonamento\" apre lo Stripe Customer Portal, dove puoi aggiornare il metodo di pagamento, cambiare piano, visualizzare le fatture o annullare. L'annullamento ha effetto al termine del periodo corrente.",
      "invoicesTitle": "Fatture",
      "invoicesBody": "Le fatture compaiono nella pagina Fatturazione dopo ogni rinnovo. Fai clic su Visualizza o PDF per scaricarne una copia.",
      "freeTitle": "Piano Free",
      "freeBody": "Il piano Free offre accesso limitato agli audit e 100 token al mese. Usalo per esplorare il prodotto prima di sottoscrivere un abbonamento."
    },
    "diagnostic": {
      "title": "Diagnostic Express",
      "intro": "Diagnostic Express è una valutazione gratuita in 8 domande che ti fornisce un punteggio di maturità AI da 0 a 100, insieme a un breve elenco di agenti AiLunaPro consigliati.",
      "accessTitle": "Dove accedervi",
      "accessBody": "Apri `#/diagnostic` nel tuo browser. Nessun accesso richiesto. Richiede circa due minuti. Puoi condividere il link con i colleghi.",
      "getTitle": "Cosa ottieni",
      "get1": "Un punteggio normalizzato da 0 a 100.",
      "get2": "Una fascia di maturità: Emergente, In sviluppo o Avanzato.",
      "get3": "Tre agenti consigliati adattati al tuo stadio.",
      "get4": "Un link diretto per creare il tuo account AiLunaPro gratuito.",
      "privacyTitle": "Privacy",
      "privacyBody": "Le risposte inviate e la tua email vengono conservate solo per generare la tua diagnostica e per ricontattarti riguardo a servizi AI pertinenti. Puoi richiederne la cancellazione in qualsiasi momento."
    },
    "roiCalculator": {
      "title": "Calcolatore ROI",
      "intro": "Il Calcolatore ROI stima quanto tempo e denaro il tuo team può risparmiare adottando gli agenti AI AiLunaPro per un flusso di lavoro specifico.",
      "accessTitle": "Dove accedervi",
      "accessBody": "Apri `#/roi-calculator` nel tuo browser. Nessun accesso richiesto. Richiede circa un minuto.",
      "inputsTitle": "Input",
      "in1": "Dimensione del team (da 1 a 10,000).",
      "in2": "Ore mensili che il tuo team dedica al lavoro ripetitivo.",
      "in3": "Costo orario medio in USD (predefinito a 50).",
      "in4": "Flusso di lavoro target (uno di nove: support, sales, finance, documents, reporting, admin, compliance, marketing, hr).",
      "outputsTitle": "Output",
      "out1": "Costo mensile risparmiato stimato (USD).",
      "out2": "Costo annuale risparmiato stimato (USD).",
      "out3": "Tempo risparmiato stimato al mese (ore).",
      "out4": "Periodo di ammortamento stimato in mesi.",
      "out5": "Due agenti AiLunaPro consigliati per il flusso di lavoro scelto.",
      "aboutTitle": "Informazioni sulla stima",
      "aboutBody": "Il risultato si basa sulle informazioni che fornisci e su ipotesi di automazione prudenti. I risparmi effettivi possono variare. L'ammortamento utilizza un costo segnaposto dell'agente di $99/month finché il prezzo degli agenti non sarà definitivo."
    },
    "team": {
      "title": "Team e Ruoli",
      "intro": "AiLunaPro supporta cinque ruoli per workspace. Ogni ruolo ha un ambito specifico:",
      "thRole": "Ruolo",
      "thManageWorkspace": "Gestire il workspace",
      "thManageBilling": "Gestire la fatturazione",
      "thRunAudits": "Eseguire audit",
      "thViewReports": "Visualizzare i report",
      "limited": "limitato",
      "inviteTitle": "Invitare i colleghi",
      "inviteBody": "Proprietari e amministratori aprono la pagina Team, fanno clic su Invita, inseriscono l'indirizzo email e scelgono un ruolo. L'invitato riceve un link valido 7 giorni. Se un link scade o viene smarrito, proprietari e amministratori possono rigenerarlo.",
      "rolesTitle": "Cambiare i ruoli",
      "rolesBody": "Proprietari e amministratori possono cambiare il ruolo di un collega dalla pagina Team. I membri possono essere temporaneamente disabilitati (nessun accesso) e riabilitati in seguito, oppure rimossi dal workspace."
    },
    "settings": {
      "title": "Impostazioni",
      "lede": "Gestisci il tuo profilo, l'organizzazione, l'aspetto e le preferenze di notifica. I selettori di lingua e valuta per ora sono preferenze di visualizzazione.",
      "take1": "I dettagli di Profilo e organizzazione si trovano in Impostazioni.",
      "take2": "Il tema (chiaro/scuro) persiste tra le sessioni.",
      "take3": "Lingua e valuta sono solo a fini di visualizzazione finché quelle funzionalità non saranno rilasciate.",
      "profileTitle": "Profilo",
      "profileBody": "Aggiorna il tuo nome visualizzato e l'indirizzo email da Impostazioni → Profilo.",
      "orgTitle": "Organizzazione",
      "orgBody": "I proprietari possono rinominare l'organizzazione da Impostazioni → Organizzazione.",
      "themeTitle": "Tema",
      "themeBody": "Passa tra modalità chiara e scura da Impostazioni → Preferenze. La tua scelta persiste tra le sessioni.",
      "languageTitle": "Lingua",
      "languageBody": "Il selettore di lingua nella barra laterale e in Impostazioni è solo una preferenza. L'applicazione viene attualmente visualizzata in inglese. Il pieno supporto multilingua è previsto per una versione futura.",
      "currencyTitle": "Valuta",
      "currencyBody": "Il selettore di valuta nella barra laterale e in Impostazioni è solo una preferenza di visualizzazione. Fatturazione e prezzo dei pacchetti di token restano in USD finché la fatturazione multivaluta non sarà implementata.",
      "emailTitle": "Notifiche email",
      "emailBody": "Scegli quali email vuoi ricevere: digest settimanale sulla conformità, notifiche di report pronto e attività del team. Impostazioni → Preferenze → Notifiche email."
    },
    "analytics": {
      "title": "Analytics e Cookie (opzionali)",
      "intro": "AiLunaPro utilizza analytics di prodotto opzionali e rispettose della privacy per aiutarci a migliorare l'affidabilità e risolvere i problemi più rapidamente. È del tutto opzionale e resta disattivato finché non lo consenti.",
      "offByDefault": "**Disattivato per impostazione predefinita** — non viene raccolto nulla finché non scegli **Consenti**.",
      "collectedTitle": "Cosa viene raccolto",
      "chipNoPersonal": "Nessun dato personale",
      "chipNoRecording": "Nessuna registrazione delle sessioni",
      "chipNoAds": "Nessun tracciamento pubblicitario",
      "collectedBody": "Solo segnali di utilizzo anonimi come visualizzazioni di pagina ed eventi di affidabilità.",
      "optTitle": "Attiva o disattiva in qualsiasi momento",
      "opt1": "Alla tua prima visita, scegli Consenti o No grazie nel piccolo banner.",
      "opt2": "La tua scelta viene salvata su questo dispositivo — il banner non chiederà di nuovo.",
      "opt3": "Per modificarla, cancella l'archiviazione del browser per questo sito (dati del sito) e ricarica.",
      "dntTitle": "Do Not Track",
      "dntBody": "Se il tuo browser invia un segnale “Do Not Track”, le analytics restano automaticamente disattivate e non viene mostrato alcun banner.",
      "blockedTitle": "Se le analytics sono bloccate",
      "blockedBody": "Alcuni browser, estensioni o reti bloccano le richieste di analytics. Va benissimo — l'applicazione funziona normalmente in entrambi i casi e non è richiesta alcuna azione."
    },
    "troubleshooting": {
      "title": "Risoluzione dei problemi",
      "lede": "Soluzioni rapide per i problemi più comuni. La maggior parte si risolve con un aggiornamento; in caso contrario, il proprietario del tuo workspace o l'assistenza AiLunaPro possono aiutarti.",
      "take1": "Aggiorna per primo — risolve la maggior parte dei problemi di caricamento, saldo e sessione.",
      "take2": "I crediti di token arrivano entro pochi secondi da un pagamento riuscito.",
      "take3": "Uno schermo vuoto è di solito un'estensione del browser o un filtro di rete.",
      "loadTitle": "La pagina non si carica",
      "loadBody": "Il servizio potrebbe essere temporaneamente non disponibile. Aggiorna la pagina. Se il problema persiste, contatta il proprietario del tuo workspace o l'assistenza AiLunaPro.",
      "signedOutTitle": "Sei stato disconnesso inaspettatamente",
      "signedOutBody": "La tua sessione potrebbe essere scaduta. Accedi di nuovo. Se continui a essere disconnesso, contatta il proprietario del tuo workspace.",
      "balanceTitle": "Il saldo dei token sembra errato",
      "balanceBody": "Aggiorna prima la pagina. Se il tuo saldo continua a sembrare errato dopo un aggiornamento, contatta il proprietario del tuo workspace o l'assistenza AiLunaPro.",
      "balanceCheckoutTitle": "Il saldo dei token non si è aggiornato dopo il checkout",
      "balanceCheckoutBody": "Attendi un momento e aggiorna la pagina. I crediti di token arrivano entro pochi secondi da un pagamento riuscito. Se il saldo continua a non aggiornarsi, contatta il proprietario del tuo workspace o l'assistenza AiLunaPro.",
      "captchaTitle": "Il captcha continua a fallire sui moduli pubblici",
      "captchaBody": "Ricarica la pagina e completa di nuovo il captcha. Se il problema persiste, prova un browser diverso o contatta l'assistenza AiLunaPro.",
      "syncTitle": "Sincronizzazione dell'abbonamento non riuscita",
      "syncBody": "Nella pagina di conferma della Fatturazione, fai clic su Riprova sincronizzazione. Se l'errore persiste, contatta l'assistenza AiLunaPro e allega la tua ricevuta Stripe.",
      "inviteTitle": "Il link di invito non funziona",
      "inviteBody": "Gli inviti scadono dopo 7 giorni. Chiedi al proprietario o all'amministratore del tuo workspace di rigenerare l'invito dalla pagina Team.",
      "roadmapTitle": "Qual è la differenza tra Roadmap e Piano d'azione?",
      "roadmapBody": "Entrambe le viste derivano dagli stessi risultati e raccomandazioni dell'audit, ma rispondono a domande diverse. La **Roadmap** risponde a **quando** consegnare il lavoro — gli elementi sono raggruppati per orizzonte temporale (30 / 60 / 90 giorni) per facilitare la pianificazione e la gestione della capacità. Il **Piano d'azione prioritizzato** risponde a **cosa correggere per primo** — gli elementi sono raggruppati per priorità (Critico / Importante / Miglioramento) utilizzando una regola deterministica fissa basata sulla gravità del risultato esistente e sull'impatto della raccomandazione. Sono complementari, non duplicati. Nessuna delle due viste modifica il punteggio e nessuna è una certificazione di conformità.",
      "blankTitle": "Schermo vuoto, \"Oops\" o layout danneggiato?",
      "blankBody": "Si tratta quasi sempre di un **ad-blocker o di un'estensione per la privacy** del browser (o di un filtro aziendale/VPN/DNS) che blocca gli script, gli stili o le richieste di dati dell'app — potresti vedere **ERR_BLOCKED_BY_CLIENT** nella console. Risolvilo consentendo **audit.ailunapro.com** e ***.googleapis.com** nel tuo blocker, oppure apri l'app in un profilo browser pulito senza estensioni, quindi ricarica.",
      "emailTitle": "Non hai ricevuto l'email di verifica o di reimpostazione della password?",
      "emailBody": "Le email di verifica e di reimpostazione della password vengono inviate da Firebase dall'indirizzo no-reply configurato del tuo progetto (il mittente Firebase predefinito finché non viene verificato un dominio mittente personalizzato). Controlla prima la cartella **spam / promozioni**. Puoi reinviare l'email di verifica da **Impostazioni → Profilo**, oppure richiedere un nuovo link di reimpostazione dalla pagina **Password dimenticata**. Dopo la verifica, esci e accedi di nuovo affinché il tuo account rifletta lo stato verificato. (Gli inviti del team sono separati e inviati tramite il provider email di AiLunaPro.)"
    },
    "faq": {
      "title": "FAQ",
      "q1": "Perché non vedo i miei vecchi report?",
      "a1": "I report sono **per workspace**. Un report più vecchio probabilmente appartiene a un altro workspace — cambia workspace dal selettore in cima alla barra laterale. Il filtro per data della dashboard non influisce sull'elenco Report.",
      "q2": "Perché Report è vuoto?",
      "a2": "Un audit inviato da solo non crea un report. Apri un audit inviato e fai clic su **Genera report** per creare uno snapshot — comparirà quindi sotto Report.",
      "q3": "Il testo casuale influisce sul mio punteggio?",
      "a3": "No. Il punteggio deriva dalle domande strutturate (a scelta). I campi a testo libero “Descrivi…” aggiungono solo contesto — ma input chiari e reali rendono il tuo report credibile.",
      "q4": "Cosa viene salvato e quando?",
      "a4": "**Invia audit** salva le tue risposte + punteggio. **Genera report** crea uno snapshot separato e condivisibile. Vedi “Audit e Report” sopra.",
      "q5": "I miei dati sono al sicuro?",
      "a5": "AiLunaPro utilizza accesso autenticato, permessi basati sui ruoli, regole di sicurezza Firestore e scritture lato server per le operazioni sensibili. Importi dei token, azioni di fatturazione e modifiche al team sono convalidati dal server.",
      "q6": "Posso eliminare i miei dati?",
      "a6": "Sì. Contatta il proprietario del tuo workspace o l'assistenza AiLunaPro per richiedere l'eliminazione del tuo account o dei dati del tuo workspace.",
      "q7": "Perché i pacchetti di token sono in USD?",
      "a7": "AiLunaPro sta introducendo il supporto multivaluta in fasi. Gli abbonamenti supportano più valute tramite Stripe. I pacchetti di token diventeranno multivaluta in una versione futura.",
      "q8": "Cosa fa il selettore di valuta?",
      "a8": "È solo una preferenza di visualizzazione. Per ora non modifica la valuta del checkout Stripe né il prezzo dei pacchetti di token.",
      "q9": "Cosa fa il selettore di lingua?",
      "a9": "Memorizza la tua lingua preferita. La traduzione completa dell'interfaccia è in corso e verrà rilasciata in una versione futura.",
      "q10": "Come contatto l'assistenza?",
      "a10": "Per domande relative ad account, fatturazione o aspetti tecnici, contatta prima il proprietario del tuo workspace. Per problemi che richiedono il nostro aiuto, contatta direttamente l'assistenza AiLunaPro.",
      "q11": "Gli agenti sono già acquistabili all'interno di AiLunaPro?",
      "a11": "Non ancora. Il catalogo Agenti elenca gli agenti AI consigliati. Selezionando \"Ottieni questo agente\" verrai guidato attraverso il normale flusso di onboarding. L'acquisto diretto in-app è previsto per una fase successiva.",
      "q12": "La stima del ROI è garantita?",
      "a12": "No. Il Calcolatore ROI fornisce una stima prudente basata sulle informazioni che fornisci. I risparmi effettivi dipendono dal tuo flusso di lavoro, dalla qualità dell'integrazione e dall'adozione."
    }
  },
  registry: {
    "empty": {
      "noItems": {
        "action": "+ Aggiungi il tuo primo strumento",
        "body": "Tieni traccia di ogni strumento di AI usato nella tua organizzazione: finalità, dati, supervisione e mitigazioni. Il registro alimenta i tuoi audit e i tuoi report.",
        "title": "Nessuno strumento di AI ancora nel registro"
      },
      "noMatches": {
        "action": "Azzera i filtri",
        "body": "Prova ad ampliare i filtri, oppure azzerali per vedere l'intero registro.",
        "title": "Nessuno strumento corrisponde a questi filtri"
      }
    },
    "filters": {
      "allApproval": "Tutte le approvazioni",
      "allDepartments": "Tutti i reparti",
      "allRisks": "Tutti i rischi",
      "clear": "Azzera i filtri",
      "risk": {
        "critical": "Critico",
        "high": "Alto",
        "low": "Basso",
        "medium": "Medio"
      },
      "searchPlaceholder": "Cerca strumenti, finalità, note…"
    },
    "modal": {
      "auditTrail": "Creato il {createdDate} · Ultimo aggiornamento {updatedDate}",
      "buttons": {
        "addToRegistry": "Aggiungi al registro",
        "cancel": "Annulla",
        "delete": "Elimina strumento",
        "saveChanges": "Salva le modifiche"
      },
      "deleteConfirm": "Rimuovere \"{toolName}\" dal registro? Questa operazione non può essere annullata.",
      "fields": {
        "approvalStatus": "Stato di approvazione",
        "dataTypes": "Tipi di dati trattati",
        "department": "Reparto",
        "humanOversight": "Supervisione umana",
        "mitigations": "Mitigazioni",
        "nextReviewDate": "Data della prossima revisione",
        "notes": "Note",
        "purpose": "Finalità",
        "riskLevel": "Livello di rischio",
        "toolName": "Nome dello strumento"
      },
      "placeholders": {
        "mitigation": "Aggiungi una mitigazione e premi Invio",
        "notes": "Fornitore, residenza dei dati, responsabile, qualsiasi cosa utile da registrare…",
        "purpose": "Cosa fa questo strumento?",
        "toolName": "es. Copilota per il supporto clienti"
      },
      "removeMitigationAria": "Rimuovi la mitigazione {index}",
      "requiredError": "Obbligatorio",
      "reviewDateHint": "Lascia vuoto se non è prevista alcuna revisione.",
      "riskOptions": {
        "critical": "Critico",
        "high": "Alto",
        "low": "Basso",
        "medium": "Medio"
      },
      "subtitleAdd": "Tieni traccia di uno strumento di AI usato dal tuo team. Tutti i campi possono essere modificati in seguito.",
      "subtitleEdit": "Aggiorna ciò che il tuo team sa su questo strumento. Le modifiche vengono salvate immediatamente nel registro locale.",
      "titleAdd": "Aggiungi strumento di AI",
      "titleEdit": "Modifica strumento di AI"
    },
    "page": {
      "addTool": "+ Aggiungi strumento",
      "designGuideLink": "Stai progettando un nuovo sistema? Apri la guida alla progettazione →",
      "error": "Caricamento del registro non riuscito. Aggiorna per riprovare.",
      "loading": "Caricamento del registro…",
      "subtitle": "Tieni traccia di ogni strumento di AI usato nella tua organizzazione: finalità, dati, supervisione e mitigazioni. Il registro alimenta i tuoi audit e i tuoi report.",
      "title": "Registro IA"
    },
    "summary": {
      "approved": "Approvati",
      "highRisk": "Ad alto rischio",
      "pendingReview": "In attesa di revisione",
      "totalTools": "Strumenti totali"
    },
    "table": {
      "approval": "Approvazione",
      "department": "Reparto",
      "oversight": "Supervisione",
      "reviewDate": "Data di revisione",
      "risk": "Rischio",
      "tool": "Strumento"
    }
  },
  systemBuilder: {
    "chrome": {
      "checklist": "Checklist",
      "designSteps": "Fasi di progettazione",
      "doneSuffix": "· {doneCount}/{total} completati",
      "endOfGuide": "✓ Fine della guida — tutte e sei le dimensioni coperte",
      "keyQuestions": "Domande chiave",
      "nextStep": "Fase successiva →",
      "pageIntro": "Una guida alla progettazione pre-rilascio. Percorri sei dimensioni — finalità e rischio, dati, modello, supervisione, monitoraggio, documentazione — per progettare un sistema di AI in modo responsabile. La tua fase e le spunte della checklist vengono salvate solo su questo dispositivo.",
      "pageTitle": "Costruttore di sistemi di AI",
      "previousStep": "← Fase precedente",
      "references": "Riferimenti (a scopo consultivo, non costituiscono consulenza legale)",
      "stepOf": "Fase {n} di {total}"
    },
    "steps": {
      "data": {
        "checklist": {
          "c1": "Costruisci un inventario dei dati: fonte, titolare, sensibilità, conservazione.",
          "c2": "Stabilisci una base giuridica (GDPR Art. 6) per ogni categoria trattata.",
          "c3": "Documenta la qualità: pertinenza, rappresentatività, lacune, bias noti.",
          "c4": "Applica la minimizzazione dei dati: raccogli solo ciò che ti serve; conserva solo per il tempo necessario.",
          "c5": "Pianifica revisioni periodiche dei bias e percorsi di azione correttiva."
        },
        "intro": "Se i tuoi dati sono sbagliati, il sistema è sbagliato. Inventariali, classificali, giustifica perché li detieni e tieni d'occhio i bias.",
        "questions": {
          "q1": "Da dove proviene ciascun dataset e chi ne è responsabile?",
          "q2": "Il dataset include categorie sensibili (Art. 9 GDPR)? Su quale base?",
          "q3": "Quali segnali di bias misurerai e rispetto a quale baseline?"
        },
        "title": "2. Governance dei dati"
      },
      "docs": {
        "checklist": {
          "c1": "Mantieni la documentazione tecnica ai sensi dell'Art. 11 (finalità, dati, addestramento, valutazione, rischi).",
          "c2": "Pubblica una scheda di modello / sistema per ogni sistema; aggiornala a ogni release.",
          "c3": "Aggiungi una comunicazione sull'AI rivolta agli utenti su ogni superficie cliente.",
          "c4": "Aggiorna le informative sulla privacy per riflettere il trattamento tramite AI.",
          "c5": "Conserva le registrazioni della formazione del personale che opera il sistema."
        },
        "intro": "Metti per iscritto cos'è il sistema, cosa non è e cosa gli utenti devono sapere. Aggiorna a ogni cambiamento sostanziale.",
        "questions": {
          "q1": "Cosa devono sapere gli utenti finali per usare questo sistema in modo responsabile?",
          "q2": "Di cosa avrebbe bisogno un revisore esterno fin dal primo giorno?",
          "q3": "Quanto è aggiornata in questo momento la scheda di modello / sistema?"
        },
        "title": "6. Documentazione e trasparenza"
      },
      "model": {
        "checklist": {
          "c1": "Giustifica la scelta della dimensione / famiglia del modello rispetto al caso d'uso effettivo.",
          "c2": "Definisci obiettivi di accuratezza + robustezza e come li misurerai.",
          "c3": "Esegui test avversari / red-team (prompt injection, jailbreak, output con bias).",
          "c4": "Documenta le modalità di guasto note e gli usi esplicitamente non consentiti.",
          "c5": "Versiona ogni artefatto del modello e distribuisci le note di modifica con i rilasci."
        },
        "intro": "Scegli il modello più piccolo che funziona. Validalo nel modo in cui attaccanti e utenti lo useranno davvero. Documenta ciò che non può fare.",
        "questions": {
          "q1": "Perché questo modello e quale alternativa più economica hai escluso?",
          "q2": "Che aspetto ha il sistema quando sbaglia — e come lo sai?",
          "q3": "Il tuo set di test è rappresentativo del traffico di produzione?"
        },
        "title": "3. Selezione e validazione del modello"
      },
      "monitoring": {
        "checklist": {
          "c1": "Definisci le metriche di monitoraggio post-rilascio (accuratezza, latenza, danni, drift).",
          "c2": "Implementa il rilevamento del drift su input e output.",
          "c3": "Registra gli incidenti in un'unica coda con gravità e responsabile.",
          "c4": "Documenta i percorsi di segnalazione (autorità di regolamentazione, cliente, interno).",
          "c5": "Programma una rivalutazione periodica (almeno trimestrale)."
        },
        "intro": "Il monitoraggio post-rilascio non è facoltativo. Il drift è silenzioso. Gli incidenti no.",
        "questions": {
          "q1": "Quale singola metrica, se si muove, ti dice di mettere in pausa il sistema?",
          "q2": "Chi viene contattato alle 3 di notte e quale runbook apre?",
          "q3": "Quando hai provato per l'ultima volta uno scenario di incidente di AI?"
        },
        "title": "5. Monitoraggio e incidenti"
      },
      "oversight": {
        "checklist": {
          "c1": "Scegli la modalità di supervisione per tipo di decisione: in-loop, on-loop o out-of-loop.",
          "c2": "Nomina i revisori e documenta gli SLA per le decisioni ad alto impatto.",
          "c3": "Fornisci controlli di override / pausa / kill-switch utilizzabili dal revisore.",
          "c4": "Scrivi un runbook di escalation (chi viene allertato, con quale contesto).",
          "c5": "Registra ogni override / pausa per la revisione post-incidente."
        },
        "intro": "Decidi come gli esseri umani mantengono il controllo sugli esiti rilevanti. Assicurati che i controlli funzionino davvero sotto pressione.",
        "questions": {
          "q1": "Chi rivede gli output ad alto impatto — e ha il tempo e il contesto per farlo?",
          "q2": "Un singolo operatore può fermare il sistema senza una riunione?",
          "q3": "Come eviti il rubber-stamping (\"compiacenza nell'automazione\")?"
        },
        "title": "4. Supervisione umana"
      },
      "purpose": {
        "checklist": {
          "c1": "Scrivi in una frase la finalità prevista (senza gergo tecnico).",
          "c2": "Elenca le persone o i gruppi interessati (utenti, clienti, terze parti).",
          "c3": "Classifica il livello di rischio: inaccettabile / alto (Annex III) / limitato / minimo — oppure GPAI.",
          "c4": "Documenta l'ambito del caso d'uso e i suoi confini (cosa è fuori ambito).",
          "c5": "Elenca gli usi impropri / fuori scopo prevedibili e ciò che ti rifiuterai di fare."
        },
        "intro": "Definisci con precisione a cosa serve il sistema, chi influenza e quanto è rischioso prima di costruire qualsiasi cosa. Questo àncora ogni decisione successiva.",
        "questions": {
          "q1": "Chi ha l'autorità di rilasciare o sospendere questo sistema?",
          "q2": "Cosa succede — concretamente — se il sistema sbaglia?",
          "q3": "Quali diritti legali, condizioni di sicurezza o libertà potrebbero essere interessati?"
        },
        "title": "1. Finalità e classificazione del rischio"
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "Report",
      "intro": "I report generati sono istantanee di un audit in un dato momento. Ognuno è esportabile, condivisibile e rimane stabile quando avvii un nuovo audit.",
      "generateFromDraft": "+ Genera dalla bozza corrente",
      "startNewAudit": "Avvia un nuovo audit",
      "loading": "Caricamento dei report…",
      "errorMessage": "Nessun report ancora caricato. Questo può accadere se l'area di lavoro è nuova o se Firestore non è raggiungibile.",
      "retry": "Riprova",
      "traceabilityHint": "I report sono istantanee in un dato momento salvate nella tua area di lavoro. La vista dettagliata ricalcola il risultato completo a partire dall'istantanea delle risposte di ogni report, così i report storici restano accurati anche dopo l'evoluzione delle regole di punteggio."
    },
    "detail": {
      "loading": "Caricamento del report…",
      "notFoundTitle": "Report non trovato",
      "notFoundBody": "Questo report non esiste più o è stato eliminato.",
      "backToReports": "← Torna ai report",
      "rename": {
        "titleAriaLabel": "Titolo del report",
        "saving": "…",
        "saveTitle": "Salva titolo",
        "cancel": "Annulla",
        "renameButton": "Rinomina"
      },
      "download": {
        "preparing": "Preparazione…",
        "downloadPdf": "⬇ Scarica PDF"
      },
      "errors": {
        "tokensInsufficientExport": "Token insufficienti per esportare. Acquista token per continuare.",
        "downloadFailed": "Download non riuscito. Riprova.",
        "renameForbidden": "Solo i proprietari o gli amministratori possono rinominare i report.",
        "renameFailed": "Impossibile rinominare. Riprova.",
        "tokensInsufficient": "Token insufficienti. Acquista token per continuare.",
        "shareDisabled": "La condivisione è disabilitata per questo report.",
        "shareForbidden": "Solo i proprietari o gli amministratori possono condividere i report.",
        "shareCreateFailed": "Impossibile creare un link di condivisione. Riprova.",
        "revokeFailed": "Impossibile revocare il link. Riprova.",
        "toggleSharingFailed": "Impossibile aggiornare la condivisione. Riprova."
      },
      "share": {
        "heading": "Link condivisibile",
        "description": "Un link firmato e senza accesso al PDF di questo report. Crearlo o rigenerarlo conta ai fini delle tue esportazioni PDF.",
        "working": "In corso…",
        "generateNewLink": "Genera nuovo link",
        "revoke": "Revoca",
        "shareLink": "Link di condivisione",
        "enableSharing": "Abilita condivisione",
        "disableSharing": "Disabilita condivisione",
        "copied": "Copiato",
        "copy": "Copia",
        "expires": "Scade il {date}.",
        "activeLinkExists": "Esiste già un link attivo (scade il {date}). Genera un nuovo link per visualizzare di nuovo l'URL: ciò revoca quello precedente.",
        "disabledNotice": "La condivisione è disabilitata — i link esistenti non funzionano più.",
        "useTokensAndCreateLink": "Usa token e crea link"
      },
      "status": {
        "notShared": "Non condiviso",
        "active": "Attivo",
        "expired": "Scaduto",
        "revoked": "Revocato",
        "disabled": "Disabilitato"
      },
      "footer": {
        "openAssistancePlan": "Apri piano di assistenza",
        "deleteReport": "Elimina report",
        "deleteConfirm": "Eliminare questo report? L'operazione non può essere annullata."
      },
      "metadata": {
        "heading": "Metadati",
        "reportId": "ID report",
        "sourceDraft": "Bozza di origine",
        "status": "Stato",
        "weakestSection": "Sezione più debole",
        "frameworks": "Framework"
      }
    },
    "share": {
      "unavailableTitle": "Report condiviso non disponibile",
      "backToReports": "← Torna ai report",
      "copySuccess": "Link di condivisione copiato.",
      "copyFailure": "Impossibile copiare il link. Riprova.",
      "banner": {
        "label": "🔗 Report condiviso — vista in sola lettura",
        "description": "Vista in sola lettura per le persone della tua area di lavoro, aperta dal link di condivisione in-app. I pulsanti delle azioni interne sono nascosti.",
        "copyShareLink": "🔗 Copia link di condivisione",
        "backToInternalView": "← Torna alla vista interna"
      },
      "topline": {
        "kicker": "Report di conformità AI",
        "score": "Punteggio",
        "scoreOutOf": "/100",
        "generated": "Generato il {date}"
      },
      "poweredBy": "Powered by AiLunaPro · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "Audit Express salvati",
      "subtitle": "Le tue istantanee di Audit Express salvate. Scarica il PDF o rimuovi un risultato salvato.",
      "runAuditExpress": "Esegui Audit Express",
      "loading": "Caricamento…",
      "empty": {
        "prefix": "Nessun audit ancora salvato. Usa",
        "runLink": "Esegui Audit Express",
        "suffix": "per crearne uno."
      },
      "meta": {
        "engineLabel": "motore",
        "engineFallback": "n/d",
        "confidenceLabel": "affidabilità"
      }
    },
    "actions": {
      "view": "Visualizza",
      "rename": "Rinomina",
      "delete": "Elimina",
      "download": "Scarica PDF",
      "save": "Salva",
      "cancel": "Annulla",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Titolo dell'audit",
      "viewDetailsTooltip": "Visualizza dettagli"
    },
    "errors": {
      "load": "Impossibile caricare i tuoi audit salvati. Riprova.",
      "tokensInsufficient": "Token insufficienti per esportare. Acquista token per continuare.",
      "download": "Download non riuscito. Riprova.",
      "delete": "Eliminazione non riuscita. Riprova.",
      "rename": "Impossibile rinominare. Riprova."
    },
    "pdfLimitModal": {
      "ariaLabel": "Limite di esportazione PDF",
      "title": "Hai utilizzato le tue {freeCount} esportazioni PDF gratuite",
      "body": "Per scaricare altri PDF sono necessari token ({tokenCost} token per esportazione).",
      "useTokens": "Usa token e scarica",
      "useTokensBusy": "…",
      "buyTokens": "Aggiorna o acquista token",
      "cancel": "Annulla"
    },
    "detail": {
      "backToList": "← Audit salvati",
      "loading": "Caricamento…",
      "meta": {
        "engineLabel": "motore",
        "engineFallback": "n/d",
        "confidenceLabel": "affidabilità"
      },
      "rename": "Rinomina",
      "save": "Salva",
      "cancel": "Annulla",
      "titleAriaLabel": "Titolo dell'audit",
      "busy": "…",
      "notRecomputed": "Impossibile ricalcolare questo audit.",
      "downloadPdf": "Scarica PDF",
      "downloadPdfBusy": "Preparazione…",
      "backToSaved": "Torna agli audit salvati"
    },
    "detailErrors": {
      "notFound": "Questo audit non esiste più.",
      "load": "Impossibile caricare questo audit. Riprova.",
      "rename": "Impossibile rinominare. Riprova.",
      "tokensInsufficient": "Token insufficienti. Acquista token per continuare.",
      "sharingDisabled": "La condivisione è disabilitata per questo audit.",
      "createShareLink": "Impossibile creare un link di condivisione. Riprova.",
      "revokeShareLink": "Impossibile revocare il link. Riprova.",
      "updateSharing": "Impossibile aggiornare la condivisione. Riprova."
    },
    "recommendedAgents": {
      "heading": "Agenti consigliati",
      "exploreAll": "Esplora tutti gli agenti →",
      "disclaimer": "Corrispondenze indicative basate su questo audit. Verifica l'idoneità prima di adottarli.",
      "meta": {
        "hoursSaved": "~{hours} h/mese risparmiate",
        "plan": "piano {plan}",
        "setup": "configurazione {complexity}"
      }
    },
    "share": {
      "heading": "Link condivisibile",
      "description": "Un link firmato e senza accesso al PDF di questo audit. Crearlo o rigenerarlo conta ai fini delle tue esportazioni PDF.",
      "generateNewLink": "Genera nuovo link",
      "shareLink": "Link di condivisione",
      "working": "In corso…",
      "revoke": "Revoca",
      "enableSharing": "Abilita condivisione",
      "disableSharing": "Disabilita condivisione",
      "copy": "Copia",
      "copied": "Copiato",
      "expires": "Scade il {date}.",
      "activeLinkExists": "Esiste già un link attivo (scade il {date}). Genera un nuovo link per visualizzare di nuovo l'URL: ciò revoca quello precedente.",
      "disabledNotice": "La condivisione è disabilitata — i link esistenti non funzionano più.",
      "limitModalActionLabel": "Usa token e crea link"
    },
    "shareStatus": {
      "notShared": "Non condiviso",
      "active": "Attivo",
      "expired": "Scaduto",
      "revoked": "Revocato",
      "disabled": "Disabilitato"
    }
  },
  billingPage: {
    "header": {
      "title": "Fatturazione",
      "subtitle": "Gestisci il tuo piano, l'utilizzo e le fatture.",
      "readOnlyBadge": "Visualizzazione in sola lettura."
    },
    "plans": {
      "bestValueBadge": "Miglior rapporto qualità-prezzo",
      "priceApprox": "{approx}{suffix} circa · fatturato in USD",
      "cta": {
        "redirecting": "Reindirizzamento…",
        "currentPlan": "Piano attuale",
        "freeCurrent": "Free — attuale",
        "startForFree": "Inizia gratis",
        "subscribe": "Abbonati"
      },
      "free": {
        "description": "Prova la piattaforma con accesso limitato.",
        "features": {
          "limitedAuditAccess": "Accesso limitato agli audit",
          "basicDashboard": "Dashboard di base",
          "demoReports": "Report demo",
          "communitySupport": "Supporto della community"
        }
      },
      "starter": {
        "description": "Esegui audit reali in autonomia.",
        "features": {
          "coreAuditWorkflow": "Flusso di lavoro di audit principale",
          "basicComplianceReports": "Report di conformità di base",
          "starterAuditVolume": "Volume di audit Starter",
          "essentialAiRecommendations": "Raccomandazioni AI essenziali",
          "emailSupport": "Supporto via email"
        }
      },
      "professional": {
        "description": "Per team in crescita che eseguono audit avanzati.",
        "features": {
          "higherAuditVolume": "Volume di audit più elevato",
          "advancedReports": "Report avanzati",
          "teamCollaboration": "Collaborazione di team",
          "priorityAiRecommendations": "Raccomandazioni AI prioritarie",
          "prioritySupport": "Supporto prioritario"
        }
      },
      "enterprise": {
        "description": "Governance e controllo di livello organizzativo.",
        "features": {
          "highestAuditVolume": "Volume di audit massimo",
          "advancedTeamManagement": "Gestione avanzata del team",
          "organizationControls": "Controlli dell'organizzazione",
          "customBranding": "Branding personalizzato",
          "dedicatedSupport": "Supporto dedicato",
          "enterpriseReadyGovernance": "Governance pronta per l'enterprise"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Valuta di fatturazione rilevata dalla tua regione: {currency} {symbol}",
        "default": "Valuta di fatturazione: {currency} {symbol}"
      },
      "secureCheckoutBadge": "Checkout sicuro offerto da Stripe",
      "heading": "Scegli il piano più adatto al tuo flusso di lavoro di audit",
      "subheadingPrefix": "Inizia in modalità test di Stripe. Non viene effettuato alcun addebito reale — usa la carta di test",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Piano attuale",
      "statusNoSubscription": "Nessun abbonamento",
      "freePlanNote": "Piano Free — nessun abbonamento attivo",
      "paidPlanSummary": "${price}/mese · fatturato {billingCycle}",
      "renews": " · Si rinnova il {date}",
      "cancelsAtPeriodEnd": "⚠ Si annulla al termine del periodo ({date})",
      "billedInCurrency": "Il tuo abbonamento attivo è fatturato in {currency}.",
      "resumePlan": "Riprendi piano",
      "cancelPlan": "Annulla piano"
    },
    "billingActions": {
      "title": "Azioni di fatturazione",
      "manageSubscription": "Gestisci abbonamento",
      "managePaymentMethods": "Gestisci metodi di pagamento",
      "loading": "Caricamento…",
      "paymentMethodsHint": "Aggiorna la carta, imposta quella predefinita, rimuovi — gestito in modo sicuro da Stripe.",
      "noCustomerYet": "Nessun cliente Stripe ancora. I metodi di pagamento diventano disponibili dopo il tuo primo abbonamento o acquisto di token.",
      "portalError": "Impossibile aprire il portale Stripe. Verifica che il Worker sia in esecuzione."
    },
    "tokens": {
      "title": "Token",
      "balance": "{balance} / {allocation} in questo ciclo",
      "balanceLoading": "Caricamento del saldo dei token…",
      "manageTokens": "Gestisci token"
    },
    "usage": {
      "sectionTitle": "Utilizzo in questo periodo",
      "auditsLabel": "Audit",
      "seatsLabel": "Postazioni",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Periodo: {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Fatture",
      "empty": "Nessuna fattura ancora.",
      "loading": "Caricamento delle fatture…",
      "emptyAfterFirstCycle": "Le fatture appariranno qui dopo il tuo primo ciclo di fatturazione.",
      "tableHeaders": {
        "date": "Data",
        "description": "Descrizione",
        "amount": "Importo",
        "status": "Stato",
        "invoiceNumber": "Numero fattura",
        "actions": "Azioni"
      },
      "statusUnknown": "sconosciuto",
      "actionView": "Visualizza",
      "actionPdf": "PDF",
      "managedInStripeNote": "Il metodo di pagamento e i dettagli di fatturazione sono gestiti in modo sicuro in Stripe."
    },
    "mockPlans": {
      "sectionTitle": "Piani",
      "currentBadge": "Attuale",
      "free": "Free",
      "priceSuffix": "/mese",
      "switch": "Cambia",
      "contactOwnerToChange": "Contatta il proprietario per cambiare piano"
    },
    "mockConfirm": {
      "title": "Passa a {plan}",
      "body": "Questa è un'azione fittizia — non verrà effettuato alcun addebito reale.",
      "cancel": "Annulla",
      "confirm": "Conferma (fittizia)"
    },
    "locked": {
      "title": "Accesso alla fatturazione limitato",
      "subtitle": "Contatta il proprietario del workspace per visualizzare o gestire la fatturazione.",
      "backToDashboard": "Torna alla dashboard",
      "contactWorkspaceOwner": "Contatta il proprietario del workspace",
      "askOwnerToast": "Chiedi al proprietario del workspace l'accesso alla fatturazione."
    },
    "success": {
      "headline": {
        "failed": "Sincronizzazione non riuscita",
        "active": "Il tuo piano {plan} è attivo",
        "activating": "Grazie — il tuo abbonamento è in fase di attivazione"
      },
      "subtext": {
        "failedFallback": "Non è stato possibile finalizzare automaticamente il tuo abbonamento.",
        "redirecting": "Reindirizzamento alla Fatturazione…",
        "syncing": "Stiamo sincronizzando il tuo abbonamento con Stripe."
      },
      "pill": {
        "failed": "Sincronizzazione non riuscita",
        "activated": "Abbonamento attivato",
        "syncing": "Sincronizzazione dell'abbonamento…",
        "almostDone": "Quasi fatto…"
      },
      "backToBilling": "Torna alla Fatturazione",
      "retrySync": "Riprova sincronizzazione",
      "errors": {
        "stillProcessing": "Il pagamento è ancora in fase di elaborazione. Attendi un momento e riprova.",
        "sessionInvalid": "Questa sessione di checkout non è più valida. Avvia un nuovo abbonamento.",
        "notSignedIn": "Non hai effettuato l'accesso. Accedi e riprova.",
        "orgLinkFailed": "Impossibile collegare questo abbonamento alla tua organizzazione. Contatta il supporto.",
        "generic": "Si è verificato un problema durante l'attivazione del tuo abbonamento.",
        "noSessionDetected": "Non è stato possibile rilevare la tua sessione di checkout. Torna alla Fatturazione e riprova."
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "Token",
      "subtitle": "Monitora l'utilizzo, controlla la tua allocazione mensile e acquista ricariche quando necessario."
    },
    "locked": {
      "title": "Token non disponibili",
      "clientMessage": "I token non sono visibili da un account cliente.",
      "workspaceMessage": "I token non sono disponibili per questo workspace.",
      "backToDashboard": "Torna alla dashboard"
    },
    "webhook": {
      "notice": "Pagamento ricevuto. In attesa del webhook di Stripe per aggiornare il saldo dei token.",
      "refreshBalance": "Aggiorna saldo"
    },
    "balance": {
      "loading": "Caricamento del saldo…",
      "empty": "Nessun saldo di token ancora. Verrà creato al tuo primo audit.",
      "statBalance": "Saldo",
      "statMonthlyAllocation": "Allocazione mensile",
      "statConsumed": "Consumati",
      "statRollover": "Riporto",
      "statTopups": "Ricariche",
      "cycleEnds": "Il ciclo termina: {cycleEnd}",
      "lastReset": "Ultimo azzeramento: {lastReset}"
    },
    "packs": {
      "sectionTitle": "Acquista più token",
      "sectionNote": "I pacchetti di token sono attualmente fatturati in USD. I token delle ricariche non scadono mai.",
      "readOnlyNotice": "Puoi visualizzare i token, ma solo proprietari, amministratori e responsabili della fatturazione possono acquistare pacchetti.",
      "starterLabel": "Starter",
      "starterBlurb": "Ricarica un ciclo a basso saldo.",
      "proLabel": "Pro",
      "proBlurb": "La ricarica più comune.",
      "maxLabel": "Max",
      "maxBlurb": "Boost per carichi di lavoro elevati.",
      "tokensUnit": "token",
      "amountPrefix": "+{amount}",
      "buyPack": "Acquista pacchetto",
      "redirecting": "Reindirizzamento…",
      "readOnlyButton": "Sola lettura"
    },
    "usage": {
      "sectionTitle": "Utilizzo recente",
      "loading": "Caricamento dell'utilizzo…",
      "empty": "Nessun utilizzo ancora.",
      "colDate": "Data",
      "colModule": "Modulo",
      "colAction": "Azione",
      "colTokens": "Token",
      "colStatus": "Stato",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Acquisto di token completato. Il tuo saldo verrà aggiornato a breve.",
      "purchaseCancelled": "Acquisto di token annullato.",
      "buyForbidden": "Solo proprietari, amministratori o responsabili della fatturazione possono acquistare pacchetti di token."
    }
  },
  teamPage: {
    "header": {
      "title": "Team",
      "subtitlePrefix": "Gestisci chi ha accesso a",
      "subtitleSuffix": "e cosa può fare.",
      "subtitleFallbackOrg": "il tuo workspace",
      "inviteButton": "+ Invita membro"
    },
    "stats": {
      "totalMembers": "Membri totali",
      "active": "Attivi",
      "pendingInvites": "Inviti in sospeso",
      "adminsAndOwners": "Admin e proprietari"
    },
    "filters": {
      "all": "Tutti",
      "owners": "Proprietari",
      "admins": "Admin",
      "billing": "Fatturazione",
      "members": "Membri",
      "clients": "Clienti",
      "pending": "In sospeso"
    },
    "roles": {
      "owner": "Proprietari",
      "admin": "Admin",
      "billing": "Fatturazione",
      "member": "Membri",
      "client": "Clienti"
    },
    "emptyState": {
      "noMembers": "Ancora nessun membro in questo workspace.",
      "noMatch": "Nessun membro corrisponde al filtro \"{filter}\"."
    },
    "confirm": {
      "cancelInvite": "Annullare questo invito in sospeso?",
      "regenerateLink": "Rigenerare il link di invito? Il link precedente smetterà di funzionare.",
      "removeMember": "Rimuovere questo membro dal workspace? L'operazione non può essere annullata."
    },
    "toast": {
      "cancelFailed": "Annullamento non riuscito",
      "newLinkCopied": "Nuovo link di invito copiato negli appunti.",
      "regenerateFailed": "Rigenerazione non riuscita",
      "roleUpdateFailed": "Aggiornamento del ruolo non riuscito",
      "memberRemoved": "Membro rimosso.",
      "removeFailed": "Rimozione non riuscita",
      "memberDisabled": "Membro disattivato.",
      "disableFailed": "Disattivazione non riuscita",
      "disableUnavailableMock": "Disattivazione non disponibile sul livello mock.",
      "memberEnabled": "Membro attivato.",
      "enableFailed": "Attivazione non riuscita",
      "enableUnavailableMock": "Attivazione non disponibile sul livello mock."
    },
    "pendingInvites": {
      "heading": "Inviti in sospeso ({count})",
      "tableHeaders": {
        "email": "Email",
        "role": "Ruolo",
        "expires": "Scade",
        "actions": "Azioni"
      },
      "copyLink": "Copia link",
      "regenerateLink": "Rigenera link",
      "cancel": "Annulla",
      "linkHiddenNote": "Link nascosto per sicurezza. Clicca su Rigenera link per emetterne uno nuovo."
    },
    "rolesLegend": {
      "lead": "**Informazioni sui ruoli —**",
      "owners": "I **Proprietari** gestiscono la fatturazione e le impostazioni del workspace.",
      "admins": "Gli **Admin** gestiscono gli utenti dell'organizzazione.",
      "billing": "Gli utenti **Fatturazione** gestiscono fatture e abbonamento.",
      "members": "I **Membri** possono utilizzare le funzionalità di audit.",
      "clients": "I **Clienti** hanno accesso limitato in sola visualizzazione."
    },
    "footerHint": "Per ora gli inviti sono solo mock. L'invio reale delle email e Firebase Auth sostituiranno questo livello nella fase backend."
  },
  orgCreate: {
    "heading": "Crea un workspace",
    "subtitle": {
      "signedIn": "Connesso come {email}",
      "anonymous": "Configura un nuovo workspace per l'organizzazione"
    },
    "form": {
      "nameLabel": "Nome del workspace",
      "namePlaceholder": "es. Acme Corp",
      "planLabel": "Piano"
    },
    "planDesc": {
      "free": "Fino a 3 audit, 1 postazione",
      "starter": "10 audit, 5 postazioni",
      "professional": "Audit illimitati, 20 postazioni",
      "enterprise": "Limiti personalizzati, SSO, SLA"
    },
    "submit": {
      "idle": "Crea workspace",
      "loading": "Creazione del workspace…"
    },
    "backToDashboard": "← Torna alla dashboard"
  },
  auditHistory: {
    "header": {
      "title": "Cronologia degli audit",
      "subtitle": "Audit inviati per questo workspace. Genera un report per creare uno snapshot condivisibile."
    },
    "states": {
      "loading": "Caricamento della cronologia degli audit…",
      "error": "Impossibile caricare la cronologia degli audit. Riprova più tardi."
    },
    "empty": {
      "title": "Ancora nessun audit inviato",
      "description": "Gli audit inviati appaiono qui per questo workspace. Avvia un Nuovo Audit per iniziare.",
      "startAudit": "+ Avvia un audit"
    },
    "columns": {
      "submitted": "Inviato",
      "score": "Punteggio",
      "risk": "Rischio",
      "findings": "Risultati"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Genera report"
    },
    "toast": {
      "reportGenerated": "Report generato"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Audit inviato",
        "preview": "Anteprima dell'audit"
      },
      "title": "Risultato dell'audit",
      "submissionId": "ID invio {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Ecco cosa significa il tuo audit",
      "summary": {
        "overallScore": "Punteggio complessivo {score}/100 — rischio {risk}.",
        "findingsSingular": "{n} risultato su {m} azione consigliata.",
        "findingsPlural": "{n} risultati su {m} azioni consigliate.",
        "maturity": "Maturità AI: livello {level} di 5."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agenti",
      "intro": "Trova agenti AI adatti al tuo flusso di lavoro. Gli agenti all-in-one di AiLunaPro sono evidenziati.",
      "locked": {
        "title": "Gli agenti non sono disponibili per gli account client",
        "backToDashboard": "Torna alla dashboard"
      },
      "filters": {
        "industryLabel": "Settore",
        "integrationLabel": "Integrazione",
        "allIndustries": "Tutti i settori",
        "allIntegrations": "Tutte le integrazioni",
        "clearFilters": "Cancella filtri",
        "clearRecommendationsHint": "Cancella i suggerimenti per usare i filtri."
      },
      "loading": "Caricamento degli agenti…",
      "emptyFiltered": "Nessun agente corrisponde ai filtri selezionati.",
      "sections": {
        "topRecommendations": "Suggerimenti principali",
        "otherAgents": "Altri agenti"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} pti",
      "whyToggleOne": "Perché? ({count} motivo)",
      "whyToggleOther": "Perché? ({count} motivi)"
    },
    "recommendPanel": {
      "title": "Personalizza i miei suggerimenti",
      "subtitle": "Aggiungi alcune preferenze per classificare gli agenti adatti al tuo contesto.",
      "fields": {
        "industry": "Settore",
        "companySize": "Dimensione dell'azienda",
        "targetWorkflow": "Flusso di lavoro target",
        "subscriptionPlan": "Piano di abbonamento",
        "currentMaturity": "Maturità AI attuale",
        "integrations": "Integrazioni (separate da virgola, max 10)"
      },
      "placeholders": {
        "industry": "es. retail, saas, sanità",
        "integrations": "es. hubspot, slack, email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Solo",
        "sme": "PMI",
        "enterprise": "Enterprise"
      },
      "maturityOptions": {
        "low": "Bassa",
        "medium": "Media",
        "high": "Alta"
      },
      "workflowOptions": {
        "support": "Assistenza clienti",
        "sales": "Vendite e follow-up dei lead",
        "finance": "Finanza e fatturazione",
        "documents": "Documenti e contratti",
        "reporting": "Report e dashboard",
        "admin": "Lavoro amministrativo",
        "compliance": "Conformità e governance",
        "marketing": "Marketing e contenuti",
        "hr": "HR e gestione del personale"
      },
      "helperText": "Aggiungi almeno una preferenza per personalizzare i suggerimenti.",
      "submit": "Suggerisci agenti",
      "submitting": "Calcolo in corso…",
      "clearRecommendations": "Cancella i suggerimenti"
    },
    "card": {
      "external": "Esterno",
      "savesPerMonth": "⏱ Risparmia ~{hours} h / mese",
      "moreIntegrations": "+{count}",
      "viewDetails": "Vedi dettagli",
      "getThisAgent": "Ottieni questo agente"
    },
    "detail": {
      "lockedNotice": "Gli agenti non sono disponibili per gli account client.",
      "backToAgents": "← Torna agli agenti",
      "loading": "Caricamento…",
      "errors": {
        "missingAgentId": "ID agente mancante",
        "missingOrgContext": "Contesto organizzazione mancante"
      },
      "pills": {
        "external": "Esterno",
        "minPlanSuffix": "{plan}+",
        "tokens": "Token · {profile}",
        "setup": "Configurazione · {complexity}",
        "recommendedAllInOne": "All-in-One consigliato",
        "compliance": "Conformità",
        "audit": "Audit"
      },
      "cta": "Ottieni questo agente →",
      "sections": {
        "overview": "Panoramica",
        "problemSolved": "Problema risolto",
        "bestFit": "Adatto per",
        "integrations": "Integrazioni",
        "expectedRoi": "ROI previsto",
        "pricing": "Prezzi"
      },
      "bestFit": {
        "industries": "Settori",
        "companySize": "Dimensione dell'azienda",
        "minBudget": "Budget minimo",
        "minBudgetValue": "{amount}/mese"
      },
      "roi": {
        "timeSaved": "Tempo risparmiato",
        "timeSavedValue": "{hours} h/mese",
        "costSaved": "Costo risparmiato",
        "costSavedValue": "{amount}/mese",
        "payback": "Ritorno dell'investimento",
        "paybackValue": "{months} mesi"
      },
      "pricing": {
        "modelPrefix": "Modello: **{model}**",
        "install": " · Installazione: {amount}",
        "monthly": " · Mensile: {amount}",
        "onRequest": " · Prezzi su richiesta"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Piano d'azione guidato",
      "title": "Il tuo piano d'azione",
      "intro": "Abbiamo tradotto le risposte del tuo audit in un piano sequenziale e contestuale. Leggi ogni sezione qui sotto — ogni affermazione rimanda ai tuoi dati.",
      "score": "Punteggio {globalScore} / 100",
      "backToResult": "← Torna al risultato"
    },
    "detected": {
      "eyebrow": "01 · Diagnosi",
      "title": "Cosa abbiamo rilevato",
      "topIssuesLabel": "Principali problemi identificati",
      "noIssues": "✓ Nessun problema da segnalare — l'audit ha superato ogni regola.",
      "weakestAreaLabel": "Area più debole",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "Colmare il divario di questa sezione è la mossa con maggiore impatto sul tuo punteggio globale.",
      "noWeakArea": "Nessuna area debole rilevata."
    },
    "priorities": {
      "eyebrow": "02 · Priorità",
      "title": "Cosa dovresti correggere per primo",
      "intro": "Tra {count} azioni consigliate, queste tre offrono il rendimento più alto rispetto allo sforzo. Ciascuna rimanda alle criticità che risolve.",
      "whyItMattersLabel": "Perché è importante: ",
      "expectedOutcomeLabel": "Risultato atteso: ",
      "impactBadge": "Impatto {impact}",
      "timeframeDays": "{days}g",
      "closesFindingsOne": "risolve {count} criticità",
      "closesFindingsOther": "risolve {count} criticità",
      "startWithThis": "Inizia da qui →",
      "startWithThisTooltip": "In arrivo dopo J2",
      "mostLeverage": "Massimo impatto a parità di sforzo"
    },
    "operatingModel": {
      "eyebrow": "03 · Modello operativo",
      "title": "Cosa automatizzare o strutturare",
      "intro": "Ogni voce qui sotto ha una modalità di esecuzione principale. Automatizzare dove andrebbe strutturato (o viceversa) è un modello di fallimento comune.",
      "categories": {
        "automate": {
          "eyebrow": "Strumenti e sistemi",
          "title": "Automatizzare",
          "tagline": "Voci in cui l'impatto deriva dal sistema, non dalla persona."
        },
        "structure": {
          "eyebrow": "Policy e governance",
          "title": "Strutturare",
          "tagline": "Voci che richiedono titolarità formale, policy o allineamento a un framework."
        },
        "process": {
          "eyebrow": "Attività ricorrente",
          "title": "Operare",
          "tagline": "Voci che sono processi da mantenere attivi con una cadenza."
        },
        "train": {
          "eyebrow": "Persone",
          "title": "Formare",
          "tagline": "Voci che cambiano i comportamenti attraverso la formazione."
        }
      },
      "actionsCountOne": "{count} azione",
      "actionsCountOther": "{count} azioni",
      "timeframeDays": "{days}g",
      "emptyColumn": "Qui non c'è nulla al momento."
    },
    "whyItMatters": {
      "eyebrow": "04 · Contesto",
      "title": "Perché è importante",
      "frameworksReferenced": "Framework richiamati in questa valutazione"
    },
    "impact": {
      "eyebrow": "05 · Impatto",
      "title": "Impatto atteso sul business",
      "ifTop3": "Se completi le 3 azioni principali",
      "scoreLift": "Il tuo punteggio globale previsto passa da {currentScore} a {projectedScore}. Si tratta di una simulazione indicativa basata sulle criticità che ogni azione risolve — la variazione effettiva dipende dalla profondità dell'esecuzione.",
      "projectedLabel": "Previsto",
      "deltaPts": "+{delta} pt",
      "noChange": "nessuna variazione",
      "toneHighLift": "Forte incremento",
      "toneSteadyGain": "Guadagno costante",
      "toneHoldTheLine": "Mantieni la posizione",
      "outcomes": {
        "auditReadinessTitle": "Preparazione all'audit",
        "auditReadinessHigh": "Passi da \"incompleto\" a \"difendibile\" in un questionario di sicurezza.",
        "auditReadinessSteady": "Postura esistente documentata e più facile da richiamare negli audit.",
        "incidentExposureTitle": "Esposizione agli incidenti",
        "incidentExposureHigh": "Raggio d'impatto ridotto e tempi medi di contenimento più rapidi quando l'AI causa danni.",
        "incidentExposureSteady": "Risposta prevedibile e titolarità più chiara per gli incidenti specifici dell'AI.",
        "customerTrustTitle": "Fiducia dei clienti",
        "customerTrustHigh": "Disclosure, model card ed explainability danno ai tuoi team di supporto e vendita risposte chiare.",
        "internalVelocityTitle": "Velocità interna",
        "internalVelocitySteady": "Chi sviluppa rilascia più velocemente quando i percorsi di policy e revisione sono inequivocabili."
      },
      "disclaimer": "Il punteggio previsto è una simulazione indicativa calcolata dalla copertura delle criticità e dai pesi delle sezioni. Non costituisce una garanzia."
    },
    "nextStep": {
      "eyebrow": "06 · Consigliato",
      "title": "Il tuo prossimo passo",
      "nextOneThing": "La prossima cosa",
      "savedAt": "Salvato localmente alle {timestamp}.",
      "localOnlyNote": "Manterremo questo piano disponibile in locale — nessun caricamento, nessun upgrade dell'account richiesto. Torna quando il tuo team è pronto ad agire.",
      "ctas": {
        "saveDefault": "✓ Salva questo piano d'azione",
        "saved": "✓ Salvato",
        "reminderSet": "✓ Promemoria impostato",
        "exported": "✓ Esportato",
        "remind7Day": "⏰ Imposta promemoria a 7 giorni",
        "remind30Day": "⏰ Imposta promemoria a 30 giorni",
        "remind60Day": "⏰ Imposta promemoria a 60 giorni",
        "remindQuarterly": "⏰ Imposta check-in trimestrale",
        "exportPlan": "⬇ Esporta piano"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "Operi in un contesto che le autorità di regolamentazione considerano già ad alto rischio. L'EU AI Act, il GDPR e le normative settoriali (equivalenti a HIPAA, framework dei servizi finanziari) impongono tutti doveri aggiuntivi quando l'AI tratta dati sensibili o prende decisioni rilevanti sulle persone.",
        "customerFacingTransparency": "La tua AI è rivolta ai clienti, il che significa che si applicano obblighi di trasparenza (EU AI Act Articolo 50, norme a tutela dei consumatori) e che la posta in gioco reputazionale è più alta rispetto agli strumenti interni.",
        "internalBaseline": "Anche per l'uso interno dell'AI, i framework riconosciuti (ISO/IEC 42001, NIST AI RMF) fungono sempre più da riferimento di base per la due diligence sui fornitori e per le trattative enterprise.",
        "riskInactionHigh": "Nella tua attuale fascia di rischio, il costo dell'inazione è asimmetrico. Un singolo incidente — un modello che divulga dati, una decisione iniqua, un'interruzione senza runbook — è materialmente più costoso delle correzioni consigliate qui sotto.",
        "riskInactionMedium": "Sei in una fascia intermedia difendibile. Il rischio ora è lo stallo: le organizzazioni che si fermano qui tendono a regredire man mano che la loro impronta AI cresce. Colmare i divari di gravità media consolida la postura attuale.",
        "riskInactionLow": "Hai già una postura significativa. Il rischio è la regressione man mano che la tua impronta AI cresce. L'investimento continuo è perlopiù manutenzione, documentazione e graduale approfondimento.",
        "weakestSection": "La tua area più debole è **{title}** ({score}%). Rafforzarla aumenta direttamente il punteggio globale, ma soprattutto elimina il percorso di minor resistenza per un incidente.",
        "commercialEnabler": "Gli acquirenti enterprise e i clienti regolamentati chiedono sempre più spesso prove di governance dell'AI nei questionari di sicurezza. Molte voci del tuo piano d'azione fungono anche da fattori abilitanti commerciali, non solo da attività di conformità."
      },
      "riskOneLiner": {
        "low": "Sei in buona forma — l'attenzione si sposta su manutenzione e miglioramento continuo.",
        "medium": "Hai una base difendibile, ma con divari rilevanti che vale la pena colmare presto.",
        "high": "Hai diversi divari che aumentano materialmente la tua esposizione. Dai priorità alle azioni qui sotto.",
        "critical": "Hai uno o più divari critici. Le voci a massima priorità dovrebbero essere affrontate nell'arco di giorni, non di settimane."
      },
      "contextChips": {
        "highRiskIndustry": "Settore ad alto rischio",
        "sensitiveData": "Dati sensibili nel perimetro",
        "customerFacing": "AI rivolta ai clienti",
        "missionCritical": "Perimetro mission-critical",
        "standardProfile": "Profilo di rischio standard"
      },
      "nextStep": {
        "criticalHeadline": "Affronta la criticità critica entro i prossimi 7 giorni",
        "criticalRationaleFallback": "È la voce più rilevante del tuo piano d'azione.",
        "highHeadline": "Inizia dai quick win a 30 giorni",
        "highRationaleFallback": "Una postura ad alto rischio risponde rapidamente a un numero ridotto di azioni mirate. Scegli tre quick win dalla roadmap e prendili in carico questo mese.",
        "mediumHeadline": "Consolida le fondamenta della tua governance",
        "mediumRationale": "Hai superato la fase iniziale concitata. La prossima mossa cumulativa è formalizzare ciò che fai in modo informale — una policy scritta, un framework riconosciuto, un'escalation documentata. È questo che rende ordinari gli audit e le trattative enterprise.",
        "lowHeadline": "Passa da conforme a ottimizzato",
        "lowRationale": "La tua postura è solida. L'impatto ora è nella documentazione e nel miglioramento continuo — model card, aggiornamenti della formazione e integrazione di scenari AI nelle esercitazioni di risposta agli incidenti."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Punteggio di conformità",
      "riskLabel": "Livello di rischio attuale",
      "maturityLabel": "Livello di maturità AI",
      "nextStepLabel": "Prossimo passo consigliato",
      "nextStepTitle": "Completa l'audit dello strumento di screening HR",
      "nextStepBody": "Questo audit è completo al 60%. Terminarlo aumenterà il tuo punteggio di conformità di circa +7 punti.",
      "continueAudit": "Continua l'audit →",
      "toast": {
        "noPermission": "Non hai l'autorizzazione per continuare gli audit.",
        "noDraft": "Nessuna bozza di audit trovata — avvio di un nuovo audit."
      }
    },
    "recentReports": {
      "card": {
        "share": "Condividi",
        "view": "Visualizza"
      },
      "export": {
        "title": "Opzioni di esportazione",
        "blurb": "Esporta i tuoi dati di conformità in più formati per gli stakeholder.",
        "exportAs": "Esporta come {fmt}"
      },
      "toast": {
        "reportNotAvailable": "Report non ancora disponibile.",
        "shareLinkCopied": "Link di condivisione copiato.",
        "shareLinkFailed": "Impossibile copiare il link. Riprova.",
        "noReportsToExport": "Nessun report ancora da esportare.",
        "csvDownloaded": "CSV scaricato.",
        "jsonDownloaded": "JSON scaricato."
      }
    },
    "cta": {
      "heading": "Pronto a raggiungere la piena conformità AI?",
      "body": "Unisciti alle organizzazioni che usano AiLunaPro per automatizzare i propri flussi di conformità, ridurre il rischio e costruire fiducia con gli stakeholder.",
      "toast": {
        "alreadyActivePlan": "Hai già un piano attivo.",
        "demoRequestSent": "Richiesta di demo inviata. La esamineremo e ti ricontatteremo."
      },
      "demoModal": {
        "title": "Pianifica una demo",
        "subtitle": "Raccontaci qualcosa sul tuo team e ti contatteremo.",
        "placeholderFullName": "Nome e cognome",
        "placeholderWorkEmail": "Email di lavoro",
        "placeholderCompany": "Azienda",
        "placeholderMessage": "Di cosa vorresti parlare?",
        "privacyNote": "Usiamo questi dati solo per rispondere alla tua richiesta.",
        "cancel": "Annulla",
        "submit": "Richiedi demo",
        "submitting": "Invio in corso…",
        "errorFallback": "Impossibile inviare la tua richiesta. Riprova."
      }
    }
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "Diagnostica di maturità AI",
        "subtitle": "Rispondi a 8 brevi domande. Ottieni il tuo punteggio di maturità AI e scopri quali agenti AiLunaPro sono adatti alla tua fase.",
        "freeLine": "Gratis · Nessun account richiesto · Richiede circa 2 minuti"
      },
      "resumeNotice": "Bentornato — abbiamo ripristinato le tue risposte precedenti così puoi riprendere da dove avevi lasciato.",
      "questionLegend": "Domanda {n} / {total}",
      "leadCapture": {
        "heading": "Dove dobbiamo inviare il tuo risultato?",
        "emailLabel": "Email",
        "requiredMark": "*",
        "emailPlaceholder": "tu@azienda.com",
        "companyNameLabel": "Nome dell'azienda",
        "optionalMark": "(facoltativo)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Utilizziamo queste informazioni solo per generare la tua diagnostica e per ricontattarti riguardo a servizi AI pertinenti. Non è richiesto alcun account.",
        "consentLabel": "Acconsento a ricevere il risultato della mia diagnostica AI e informazioni di follow-up pertinenti da AiLunaPro. Comprendo che le mie risposte e la mia email saranno trattate per generare e archiviare questo risultato diagnostico, e che posso richiederne la cancellazione in qualsiasi momento."
      },
      "submit": {
        "loading": "Calcolo del tuo risultato in corso…",
        "unlock": "Inviami il rapporto completo via e-mail →",
        "idle": "Ottieni il mio punteggio di maturità AI"
      },
      "signInPrompt": "Hai già un account?",
      "signInLink": "Accedi",
      "errors": {
        "answers": "Rispondi a ogni domanda.",
        "email": "Inserisci un indirizzo email valido.",
        "consent": "Devi acconsentire per ricevere il tuo risultato.",
        "captchaLoading": "Il captcha è in caricamento — attendi."
      },
      "buckets": {
        "low": {
          "title": "La tua maturità AI è emergente",
          "message": "La tua organizzazione è in una fase iniziale. Inizia con automazioni semplici, un inventario dell'uso dell'AI e agenti di supporto pratici."
        },
        "medium": {
          "title": "La tua maturità AI è in via di sviluppo",
          "message": "Hai già alcune basi di AI. Il passo successivo è strutturare l'uso, misurare il ROI e migliorare i flussi di lavoro documentali e di reportistica."
        },
        "high": {
          "title": "La tua maturità AI è avanzata",
          "message": "Sei pronto a scalare l'AI con una governance più solida, conformità, reportistica e automazione specializzata."
        }
      },
      "result": {
        "scoreLabel": "Il tuo punteggio di maturità AI",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Agenti AiLunaPro consigliati",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Ottieni questo agente",
        "ctaHeading": "Vuoi un audit più approfondito e il tuo piano d'azione completo?",
        "ctaBody": "Crea un workspace AiLunaPro gratuito per accedere all'audit completo, al registro e al catalogo di agenti.",
        "ctaButton": "Crea il tuo account gratuito ↗",
        "ctaFootnote": "Prosegue su **dashboard.ailunapro.com** — la piattaforma AiLuna per agenti e soluzioni AI, il passo successivo dopo il tuo audit.",
        "retakeButton": "Ripeti la diagnostica"
      }
    },
    "roi": {
      "header": {
        "title": "Calcolatore del ROI dell'AI",
        "subtitle": "Stima il tempo e il denaro che puoi risparmiare con gli agenti AI di AiLunaPro.",
        "freeLine": "Gratis · Nessun account richiesto · Richiede circa 1 minuto · USD"
      },
      "resumeNotice": "Bentornato — abbiamo ripristinato i tuoi dati precedenti così puoi riprendere da dove avevi lasciato.",
      "form": {
        "teamLegend": "Il tuo team",
        "teamSizeLabel": "Dimensione del team",
        "teamSizePlaceholder": "es. 10",
        "monthlyHoursLabel": "Ore mensili che il tuo team dedica al lavoro ripetitivo",
        "monthlyHoursPlaceholder": "es. 80",
        "hourlyCostLabel": "Costo orario medio (USD)",
        "targetWorkflowLabel": "Flusso di lavoro target",
        "workflowPlaceholderOption": "Seleziona un flusso di lavoro…"
      },
      "leadCapture": {
        "legend": "Dove dobbiamo inviare la tua stima?",
        "emailLabel": "Email",
        "emailPlaceholder": "tu@azienda.com",
        "companyNameLabel": "Nome dell'azienda",
        "optionalMark": "(facoltativo)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Utilizziamo queste informazioni solo per generare la tua stima e per ricontattarti riguardo a servizi AI pertinenti. Non è richiesto alcun account.",
        "consentLabel": "Acconsento a ricevere la mia stima del ROI dell'AI e informazioni di follow-up pertinenti da AiLunaPro. Comprendo che le mie risposte e la mia email saranno trattate per generare e archiviare questa stima, e che posso richiederne la cancellazione in qualsiasi momento."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "Calcolo in corso…",
        "unlock": "Inviami il rapporto completo via e-mail →",
        "idle": "Calcola il mio ROI"
      },
      "signInPrompt": "Hai già un account?",
      "signInLink": "Accedi",
      "errors": {
        "teamSize": "La dimensione del team deve essere un numero intero compreso tra 1 e 10000.",
        "hours": "Le ore mensili devono essere un numero compreso tra 0 e 10000.",
        "cost": "Il costo orario deve essere un numero compreso tra 1 e 1000 USD.",
        "workflow": "Seleziona un flusso di lavoro.",
        "email": "Inserisci un indirizzo email valido.",
        "consent": "Devi acconsentire per ricevere la tua stima.",
        "captchaLoading": "Il captcha è in caricamento — attendi."
      },
      "result": {
        "monthlySavingsLabel": "Risparmio mensile stimato",
        "monthlySavingsUnit": "/mese",
        "yearlySavingsLabel": "Risparmio annuale",
        "timeSavedLabel": "Tempo risparmiato",
        "timeSavedValue": "{hours} h/mese",
        "paybackLabel": "Ammortamento",
        "paybackValue": "{months} mesi",
        "paybackEmpty": "—",
        "disclaimer": "Questa è una stima basata sulle informazioni fornite e su ipotesi di automazione prudenti. Il risparmio effettivo può variare.",
        "pricingNote": "L'ammortamento presuppone un costo di riferimento dell'agente di {cost}/month; il prezzo effettivo varia in base all'agente.",
        "recommendedAgentsHeading": "Agenti AiLunaPro consigliati",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Ottieni questo agente",
        "ctaHeading": "Vuoi un'analisi più approfondita e il tuo piano d'azione completo?",
        "ctaBody": "Crea un workspace AiLunaPro gratuito per accedere all'audit completo, al registro e al catalogo di agenti.",
        "ctaButton": "Crea il tuo account gratuito ↗",
        "ctaFootnote": "Prosegue su **dashboard.ailunapro.com** — la piattaforma AiLuna per agenti e soluzioni AI, il passo successivo dopo il tuo audit.",
        "rerunButton": "Esegui un altro calcolo"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Basso",
      "medium": "Medio",
      "high": "Alto",
      "critical": "Critico",
      "completed": "Completato",
      "inProgress": "In corso",
      "draft": "Bozza",
      "published": "Pubblicato",
      "archived": "Archiviato",
      "effortLow": "Sforzo basso",
      "effortMedium": "Sforzo medio",
      "effortHigh": "Sforzo alto"
    },
    "riskWord": {
      "critical": "Rischio critico",
      "high": "Rischio alto",
      "medium": "Rischio medio",
      "low": "Rischio basso",
      "minimal": "Rischio minimo"
    },
    "approval": {
      "approved": "Approvato",
      "pending": "In attesa",
      "underReview": "In revisione",
      "rejected": "Respinto"
    },
    "oversight": {
      "hitl": "Human-in-the-loop",
      "hotl": "Human-on-the-loop",
      "oot": "Autonomo"
    },
    "dataTypes": {
      "pii": "Dati personali (PII)",
      "health": "Dati sanitari",
      "financial": "Finanziari / transazionali",
      "biometric": "Biometrici",
      "children": "Dati su minori",
      "public": "Pubblici / aperti",
      "internal": "Documenti interni",
      "employee": "Dati dei dipendenti"
    },
    "confidence": {
      "low": "bassa",
      "medium": "media",
      "high": "alta"
    },
    "memberStatus": {
      "active": "Attivo",
      "pending": "In attesa",
      "invited": "Invitato",
      "disabled": "Disattivato"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automatizza le risposte ai clienti e riduce il carico di lavoro dell'assistenza.",
        "description": "Agente AI progettato per rispondere alle domande frequenti, qualificare le richieste di assistenza, instradare i ticket e supportare i team del servizio clienti. Aiuta le aziende a strutturare un primo livello di assistenza disponibile in modo continuo senza sostituire i team umani.",
        "problemSolved": "Tempi di risposta lenti, richieste ripetitive e team di assistenza sovraccarichi."
      },
      "sales-agent": {
        "tagline": "Qualifica i prospect e prepara i follow-up commerciali.",
        "description": "Agente AI orientato alle vendite, progettato per qualificare i lead, preparare risposte commerciali, generare follow-up e strutturare le opportunità. Aiuta i team commerciali a risparmiare tempo sulle attività ripetitive e a migliorare il follow-up dei prospect.",
        "problemSolved": "Prospect poco qualificati, follow-up dimenticati e tempo commerciale sprecato."
      },
      "finance-agent": {
        "tagline": "Supporta fatture, preventivi e recupero crediti.",
        "description": "Agente AI progettato per aiutare a classificare i documenti finanziari, preparare preventivi, monitorare le fatture, generare solleciti di pagamento e segnalare anomalie semplici. Non sostituisce un commercialista, ma riduce notevolmente il tempo amministrativo legato alla finanza.",
        "problemSolved": "Elaborazione manuale delle fatture, recuperi crediti in ritardo ed errori di inserimento dati."
      },
      "hr-agent": {
        "tagline": "Supporta i team HR con screening, sintesi e documentazione.",
        "description": "Agente AI progettato per supportare le attività HR ripetitive come sintesi di CV, note sui candidati, risposte interne, documentazione del personale e follow-up amministrativo HR. Aiuta i team a strutturare le informazioni e a ridurre il tempo dedicato al lavoro manuale sui documenti.",
        "problemSolved": "I team HR perdono tempo nello screening dei documenti, nelle risposte ripetitive e nel follow-up manuale."
      },
      "compliance-agent": {
        "tagline": "Aiuta a strutturare conformità AI, rischi e registri.",
        "description": "Agente AI progettato per supportare la documentazione di conformità, i controlli interni, la preparazione del registro AI e i piani di mitigazione. È particolarmente utile per le organizzazioni esposte a obblighi di governance, tracciabilità e conformità AI.",
        "problemSolved": "Le organizzazioni mancano di una visibilità chiara sulla conformità AI, con documentazione frammentata e rischi AI non gestiti."
      },
      "marketing-agent": {
        "tagline": "Genera contenuti, campagne e idee di marketing.",
        "description": "Agente AI progettato per generare post, email, contenuti per landing page, idee di campagna, sintesi e asset di marketing adattati al profilo aziendale. Aiuta i piccoli team a pubblicare con maggiore costanza senza moltiplicare gli strumenti.",
        "problemSolved": "I team di marketing faticano con la coerenza dei contenuti, una creazione che richiede tempo e asset di campagna frammentati."
      },
      "reporting-agent": {
        "tagline": "Crea sintesi, dashboard e report decisionali.",
        "description": "Agente AI progettato per trasformare dati e informazioni interne in sintesi, report, piani d'azione e insight pronti per il management. Aiuta dirigenti e manager ad avere una visione più chiara senza passare ore a consolidare manualmente le informazioni.",
        "problemSolved": "I report manuali richiedono troppo tempo per essere prodotti e i decisori mancano di sintesi concise."
      },
      "audit-agent": {
        "tagline": "Supporta audit AI, valutazione della maturità e piani d'azione.",
        "description": "Agente AI progettato per aiutare a strutturare gli audit, analizzare le risposte, identificare i rischi e produrre raccomandazioni concrete. Collega audit AI, conformità e trasformazione aziendale in un flusso di lavoro pratico.",
        "problemSolved": "Gli audit AI richiedono tempo, vengono analizzati manualmente e sono difficili da prioritizzare."
      },
      "document-agent": {
        "tagline": "Classifica, sintetizza ed estrae informazioni dai documenti.",
        "description": "Agente AI progettato per elaborare documenti, estrarre informazioni chiave, generare sintesi e organizzare i file. È utile per le organizzazioni che gestiscono molti allegati, contratti, report, file HR, documenti finanziari o prove di conformità.",
        "problemSolved": "I documenti sono organizzati male, lenti da cercare e costosi da sintetizzare manualmente."
      },
      "admin-agent": {
        "tagline": "Automatizza il lavoro amministrativo quotidiano.",
        "description": "Agente AI generico per email, appuntamenti, follow-up, sintesi, note, organizzazione delle attività e flussi di lavoro amministrativi quotidiani. Aiuta fondatori, professionisti indipendenti e piccoli team a risparmiare tempo sul lavoro operativo ripetitivo.",
        "problemSolved": "Il lavoro amministrativo richiede troppo tempo, le attività sono ripetitive e l'organizzazione è manuale."
      }
    },
    "industries": {
      "all": "Tutti",
      "b2b": "B2B",
      "construction": "Edilizia",
      "consulting": "Consulenza",
      "creator": "Creator",
      "ecommerce": "E-commerce",
      "education": "Istruzione",
      "enterprise": "Grande impresa",
      "finance": "Finanza",
      "healthcare": "Sanità",
      "legal": "Legale",
      "public-sector": "Settore pubblico",
      "real-estate": "Immobiliare",
      "retail": "Retail",
      "saas": "SaaS",
      "services": "Servizi"
    },
    "companySize": {
      "enterprise": "Grande impresa",
      "sme": "PMI",
      "solo": "Indipendente"
    },
    "profile": {
      "high": "Alto",
      "medium": "Medio"
    },
    "complexity": {
      "high": "Alta",
      "low": "Bassa",
      "medium": "Media"
    },
    "model": {
      "subscription": "Abbonamento"
    },
    "integrations": {
      "accounting": "Contabilità",
      "audit-ai": "Audit AI",
      "calendar": "Calendario",
      "cloud-storage": "Cloud storage",
      "compliance-tools": "Strumenti di conformità",
      "crm": "CRM",
      "dashboard": "Dashboard",
      "documents": "Documenti",
      "email": "Email",
      "helpdesk": "Helpdesk",
      "hris": "HRIS",
      "registry": "Registro",
      "social-media": "Social media",
      "spreadsheet": "Foglio di calcolo",
      "website": "Sito web"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "Come viene utilizzata l'AI attualmente nella tua organizzazione?",
        "options": {
          "none": "Non utilizziamo ancora l'AI",
          "individual": "Alcune persone usano l'AI a livello individuale",
          "team": "Diversi team usano strumenti di AI",
          "structured": "L'AI è integrata in flussi di lavoro strutturati"
        }
      },
      "process_automation": {
        "label": "Quanto del lavoro ripetitivo è oggi automatizzato?",
        "options": {
          "none": "Quasi nulla è automatizzato",
          "basic": "Poche attività semplici sono automatizzate",
          "moderate": "Alcuni flussi di lavoro importanti sono automatizzati",
          "advanced": "L'automazione fa parte delle operazioni quotidiane"
        }
      },
      "data_readiness": {
        "label": "Quanto sono pronti i tuoi dati aziendali per l'uso dell'AI?",
        "options": {
          "scattered": "I dati sono frammentati e difficili da consultare",
          "partial": "Una parte dei dati è organizzata",
          "mostly_ready": "La maggior parte dei dati chiave è strutturata",
          "ready": "I dati sono puliti, accessibili e aggiornati regolarmente"
        }
      },
      "compliance_awareness": {
        "label": "Quanto sei preparato sulla governance e la conformità dell'AI?",
        "options": {
          "unknown": "Non abbiamo ancora valutato i rischi dell'AI",
          "basic": "Conosciamo i rischi dell'AI ma non abbiamo un processo",
          "documented": "Alcuni casi d'uso dell'AI sono documentati",
          "governed": "Abbiamo processi chiari di governance e revisione dell'AI"
        }
      },
      "shadow_ai": {
        "label": "Sai quali strumenti di AI vengono utilizzati in azienda?",
        "options": {
          "no_visibility": "No, non abbiamo visibilità",
          "partial_visibility": "Conosciamo alcuni strumenti ma non tutti",
          "mostly_visible": "Monitoriamo la maggior parte degli strumenti di AI",
          "full_inventory": "Manteniamo un inventario chiaro degli strumenti di AI"
        }
      },
      "business_impact": {
        "label": "Con quanta chiarezza misuri l'impatto dell'AI sul business?",
        "options": {
          "not_measured": "Non lo misuriamo ancora",
          "qualitative": "Abbiamo solo riscontri qualitativi",
          "some_metrics": "Monitoriamo alcuni risparmi di tempo o di costi",
          "clear_roi": "Misuriamo il ROI e i risultati di business"
        }
      },
      "team_skills": {
        "label": "Quanto si sentono sicuri i tuoi team nell'usare l'AI in modo responsabile?",
        "options": {
          "low": "Fiducia molto limitata",
          "basic": "Familiarità di base",
          "good": "Buona sicurezza nelle attività comuni",
          "strong": "Solide pratiche di AI responsabile"
        }
      },
      "implementation_priority": {
        "label": "Qual è la tua principale priorità sull'AI in questo momento?",
        "options": {
          "save_time": "Risparmiare tempo sul lavoro ripetitivo",
          "improve_sales": "Migliorare le vendite o il follow-up con i clienti",
          "support_customers": "Migliorare l'assistenza clienti",
          "compliance": "Migliorare la conformità e la governance dell'AI",
          "documents": "Elaborare documenti e report più velocemente"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "Assistenza clienti",
    "sales": "Vendite e follow-up dei lead",
    "finance": "Finanza e fatturazione",
    "documents": "Documenti e contratti",
    "reporting": "Reportistica e dashboard",
    "admin": "Attività amministrative",
    "compliance": "Conformità e governance",
    "marketing": "Marketing e contenuti",
    "hr": "Risorse umane e gestione del personale"
  },
};
