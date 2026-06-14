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
};
