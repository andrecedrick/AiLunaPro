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
        "journeyCostSaved": "Costo risparmiato stimato ≈ ${amount}/mese."
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
      "heading": "Come vuoi iniziare?",
      "express": {
        "title": "Audit Express",
        "body": "Una panoramica rapida sulla preparazione all'AI, di circa 5 minuti — alcune domande veloci, un'analisi facoltativa del sito web, un ROI indicativo. Ideale per un primo sguardo.",
        "cta": "Avvia Audit Express →"
      },
      "full": {
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
};
