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
};
