/** B6.0 — German dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const de: Dict = {
  nav: {
    dashboard:             'Dashboard',
    'new-audit':           'Neuer Audit',
    reports:               'Berichte',
    'audit-history':       'Audit-Verlauf',
    'audit-express-run':   'Audit Express starten',
    'audit-express-saved': 'Gespeicherte Audits',
    registry:              'KI-Register',
    'system-builder':      'System-Builder',
    agents:                'Agenten',
    team:                  'Team',
    settings:              'Einstellungen',
    billing:               'Abrechnung',
    help:                  'Hilfe',
  },
  shell: {
    complianceSuite:  'Compliance-Suite',
    signOut:          'Abmelden',
    workspaces:       'Arbeitsbereiche',
    createWorkspace:  'Arbeitsbereich erstellen',
    searchWorkspaces: 'Arbeitsbereich suchen…',
    language:         'Sprache',
    currency:         'Währung',
  },
  settings: {
    title:               'Einstellungen',
    themeTitle:          'Design',
    themeHint:           'Wählen Sie das Erscheinungsbild von AiLunaPro. Wird sofort übernommen.',
    light:               'Hell',
    dark:                'Dunkel',
    languageTitle:       'Sprache',
    languageHint:        'Wird für Oberflächentexte und E-Mails verwendet. Die Übersetzung wird Abschnitt für Abschnitt ausgerollt; nicht übersetzte Bereiche bleiben auf Englisch.',
    currencyTitle:       'Standardwährung',
    currencyHint:        'Nur Anzeigeeinstellung. Abrechnung und Token-Pakete bleiben in USD.',
    profileTitle:        'Profil',
    profileHint:         'Passt den Ton der Hinweise und die empfohlene Startressource an. Ändert niemals die Bewertung, die Feststellungen oder eine regulatorische Zuordnung.',
    notificationsTitle:  'E-Mail-Benachrichtigungen',
    notificationsHint:   'Wählen Sie, welche E-Mails Sie erhalten. Die Absender-Einrichtung folgt in einer späteren Phase.',
    weeklyDigest:        'Wöchentliche Compliance-Zusammenfassung',
    weeklyDigestDesc:    'Zusammenfassung neuer Feststellungen und gelöster Aktionen jeden Montag.',
    reportReady:         'Bericht fertig',
    reportReadyDesc:     'Benachrichtige mich per E-Mail, wenn ein angeforderter Bericht erstellt wird.',
    teamActivity:        'Team-Aktivität',
    teamActivityDesc:    'Einladungen, Rollenänderungen und Mitglieder-Entfernungen in meinen Arbeitsbereichen.',
    langToast:           'Sprache: {value}',
    currencyToast:       'Währung: {value}',
    profileToast:        'Profil: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Audit-Abschnitte",
      "questionCount": "{n} Fragen",
      "yes": "Ja",
      "no": "Nein"
    },
    "section": {
      "profile": {
        "title": "Profil",
        "subtitle": "Ihre Organisation auf einen Blick"
      },
      "ai-tools": {
        "title": "KI-Tools",
        "subtitle": "Welche KI nutzt Ihre Organisation tatsächlich?"
      },
      "data": {
        "title": "Daten",
        "subtitle": "Welche Daten speisen Ihre KI-Systeme?"
      },
      "governance": {
        "title": "Governance",
        "subtitle": "Richtlinien, Verantwortlichkeit und Rechenschaft"
      },
      "security": {
        "title": "Sicherheit",
        "subtitle": "Schutz von KI-Systemen und ihren Daten"
      },
      "transparency": {
        "title": "Transparenz",
        "subtitle": "Offenlegung und Erklärbarkeit"
      },
      "human-oversight": {
        "title": "Menschliche Aufsicht",
        "subtitle": "Den Menschen die Kontrolle bewahren"
      },
      "training-maturity": {
        "title": "Schulung & Reife",
        "subtitle": "Wie KI-kompetent ist Ihre Organisation?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Name der Organisation",
        "placeholder": "z. B. Acme Corp"
      },
      "profile.industry": {
        "label": "Hauptbranche"
      },
      "profile.size": {
        "label": "Unternehmensgröße"
      },
      "profile.region": {
        "label": "Haupttätigkeitsregion"
      },
      "tools.categories": {
        "label": "Welche KI-Kategorien sind im Produktivbetrieb?",
        "helper": "Alle zutreffenden auswählen."
      },
      "tools.vendors": {
        "label": "Wichtigste KI-Anbieter / -Produkte",
        "placeholder": "z. B. OpenAI GPT-4, Anthropic Claude, internes Modell auf AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Einsatzumfang"
      },
      "tools.builds_custom": {
        "label": "Trainieren oder optimieren Sie eigene Modelle?"
      },
      "data.types": {
        "label": "Welche Datentypen werden von KI verarbeitet?"
      },
      "data.residency": {
        "label": "Wo werden die Daten überwiegend gespeichert?"
      },
      "data.governance_framework": {
        "label": "Gibt es ein dokumentiertes Daten-Governance-Framework?"
      },
      "data.sources": {
        "label": "Beschreiben Sie Ihre wichtigsten Datenquellen",
        "placeholder": "z. B. CRM, Produkttelemetrie, Kundensupport-Tickets, Datensätze von Drittanbietern…"
      },
      "gov.committee": {
        "label": "Haben Sie ein KI-Governance-Gremium oder eine benannte verantwortliche Person?"
      },
      "gov.written_policy": {
        "label": "Gibt es eine von der Führung genehmigte schriftliche KI-Richtlinie?"
      },
      "gov.frameworks": {
        "label": "An welchen Frameworks orientieren Sie sich?"
      },
      "gov.structure": {
        "label": "Beschreiben Sie Ihre Governance-Struktur",
        "placeholder": "Wer verantwortet das KI-Risiko? Wie werden Entscheidungen eskaliert?"
      },
      "sec.controls": {
        "label": "Welche Sicherheitsmaßnahmen sind für KI-Systeme implementiert?"
      },
      "sec.red_team": {
        "label": "Wurden Ihre KI-Systeme einem Red-Teaming oder gegnerischen Tests unterzogen?"
      },
      "sec.incident_readiness": {
        "label": "Wie gut sind Sie auf einen KI-spezifischen Vorfall vorbereitet?"
      },
      "sec.review_process": {
        "label": "Beschreiben Sie Ihren Sicherheitsprüfungsprozess für neue KI-Systeme"
      },
      "trans.disclosure": {
        "label": "Legen Sie Endnutzern gegenüber den KI-Einsatz offen, wenn sie damit interagieren?"
      },
      "trans.cards": {
        "label": "Führen Sie Model Cards oder System Cards?"
      },
      "trans.explainability": {
        "label": "Wie gut sind Ihre KI-Entscheidungen für betroffene Nutzer erklärbar?"
      },
      "trans.measures": {
        "label": "Beschreiben Sie Ihre Transparenzmaßnahmen",
        "placeholder": "Öffentliches KI-Register, In-App-Offenlegungen, für Nutzer verfügbare Audit-Logs…"
      },
      "over.model": {
        "label": "Welches Aufsichtsmodell beschreibt Ihr Setup am besten?"
      },
      "over.escalation": {
        "label": "Sind Eskalationsverfahren für KI-Fehler oder -Schäden dokumentiert?"
      },
      "over.review_categories": {
        "label": "Welche Entscheidungskategorien erfordern eine verpflichtende menschliche Prüfung?"
      },
      "over.processes": {
        "label": "Beschreiben Sie Ihre Aufsichtsprozesse in eigenen Worten"
      },
      "train.staff_training": {
        "label": "Bieten Sie Mitarbeitenden Schulungen zur KI-Kompetenz an?"
      },
      "train.maturity": {
        "label": "Selbsteingeschätzte Reife der KI-Compliance"
      },
      "train.topics": {
        "label": "Welche Themen behandelt Ihre Schulung?"
      },
      "train.program": {
        "label": "Beschreiben Sie Ihr Schulungsprogramm (oder was fehlt)"
      }
    },
    "option": {
      "profile.industry.finance": "Finanzwesen & Banken",
      "profile.industry.health": "Gesundheitswesen & Biowissenschaften",
      "profile.industry.tech": "Technologie / SaaS",
      "profile.industry.retail": "Einzelhandel & E-Commerce",
      "profile.industry.public": "Öffentlicher Sektor",
      "profile.industry.other": "Sonstige",
      "profile.size.xs": "1–10 Mitarbeitende",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "Europäische Union",
      "profile.region.uk": "Vereinigtes Königreich",
      "profile.region.us": "Vereinigte Staaten",
      "profile.region.ca": "Kanada",
      "profile.region.apac": "Asien-Pazifik",
      "profile.region.global": "Global / mehrere Regionen",
      "tools.categories.llm": "Große Sprachmodelle (Chat, Agenten, Copiloten)",
      "tools.categories.ml": "Klassisches ML / Vorhersagemodelle",
      "tools.categories.cv": "Computer Vision",
      "tools.categories.speech": "Sprache & Audio",
      "tools.categories.rec": "Empfehlungssysteme",
      "tools.categories.rpa": "RPA / Automatisierung mit KI-Komponenten",
      "tools.scope.pilot": "Nur Pilotprojekte / Experimente",
      "tools.scope.internal": "Interne Nutzung durch Mitarbeitende",
      "tools.scope.customer": "Kundenorientierte Funktionen",
      "tools.scope.critical": "Geschäftskritische / regulierte Entscheidungen",
      "data.types.pii": "Personenbezogene Daten (PII)",
      "data.types.health": "Gesundheitsdaten",
      "data.types.financial": "Finanz- / Transaktionsdaten",
      "data.types.biometric": "Biometrische Daten",
      "data.types.children": "Daten über Minderjährige",
      "data.types.public": "Öffentliche / offene Daten",
      "data.residency.eu": "EU / EEA",
      "data.residency.us": "Vereinigte Staaten",
      "data.residency.mixed": "Gemischt / mehrere Regionen",
      "data.residency.unknown": "Unsicher",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Keine formell",
      "sec.controls.encryption": "Verschlüsselung im Ruhezustand + bei der Übertragung",
      "sec.controls.rbac": "Rollenbasierte Zugriffskontrolle",
      "sec.controls.audit_logs": "Audit-Protokollierung von Modellzugriffen & Eingaben",
      "sec.controls.secrets": "Secrets-Management (keine fest codierten Schlüssel)",
      "sec.controls.isolation": "Mandanten- / Datenisolation",
      "sec.incident_readiness.1": "1 — Kein Plan",
      "sec.incident_readiness.2": "2 — Informeller Plan",
      "sec.incident_readiness.3": "3 — Dokumentiert, aber ungetestet",
      "sec.incident_readiness.4": "4 — Dokumentiert und eingeübt",
      "sec.incident_readiness.5": "5 — Kontinuierlich, integriert with SOC",
      "trans.explainability.none": "Keine Erklärungen bereitgestellt",
      "trans.explainability.generic": "Nur allgemeine Offenlegungen",
      "trans.explainability.category": "Begründungen auf Kategorieebene",
      "trans.explainability.individual": "Erklärungen pro Entscheidung auf Anfrage",
      "trans.explainability.realtime": "Echtzeit-Erklärungen im Produkt",
      "over.model.hitl": "Human-in-the-Loop (jede Entscheidung geprüft)",
      "over.model.hotl": "Human-on-the-Loop (stichprobenartige Prüfung)",
      "over.model.oot": "Human-out-of-the-Loop (autonom)",
      "over.review_categories.hr": "Einstellungs- / HR-Entscheidungen",
      "over.review_categories.credit": "Kredit- / Finanzentscheidungen",
      "over.review_categories.health": "Gesundheitsbezogene Empfehlungen",
      "over.review_categories.content": "Ergebnisse der Inhaltsmoderation",
      "over.review_categories.legal": "Rechts- / Compliance-Entscheidungen",
      "train.maturity.1": "1 — Anfänglich / ad hoc",
      "train.maturity.2": "2 — In Entwicklung",
      "train.maturity.3": "3 — Definiert",
      "train.maturity.4": "4 — Gesteuert",
      "train.maturity.5": "5 — Optimiert",
      "train.topics.bias": "Bias & Fairness",
      "train.topics.privacy": "Datenschutz & Datensicherheit",
      "train.topics.security": "KI-Sicherheit & Missbrauch",
      "train.topics.usage": "Richtlinien zur akzeptablen Nutzung",
      "train.topics.incident": "Reaktion auf Vorfälle"
    }
  },
  results: {
    "insightCard": {
      "whatThisMeans": "Was das bedeutet",
      "whyItMatters": "Warum es wichtig ist",
      "howItPlaysOut": "Wie es sich auswirkt",
      "exampleHeading": "Beispiel — wie ein ähnliches Unternehmen profitiert",
      "illustrative": "(Veranschaulichung.)",
      "doThisNext": "Das ist der nächste Schritt",
      "doThisNextWithHeading": "Das ist der nächste Schritt — {heading}",
      "onceDone": "Nach Abschluss: {outcome}",
      "referencesPrefix": "Referenzen: {refs}"
    },
    "explained": {
      "heading": "Was Ihre Ergebnisse bedeuten",
      "subtitle": "Jeder Punkt unten erklärt, was wir festgestellt haben, warum es wichtig ist und der schnellste nächste Schritt — mit den Score-Punkten, die Sie zurückgewinnen können.",
      "emptyTitle": "Keine Lücken festgestellt — solide Grundlage",
      "emptyWhatItMeans": "Ihre Antworten haben keine Befunde ausgelöst — Ihre KI-Praxis deckt die Grundlagen, die wir prüfen, bereits ab.",
      "emptyWhyItMatters": "Das ist eine solide Basis. Die nächsten Fortschritte ergeben sich daraus, diese Kontrollen konsequent und im großen Maßstab anzuwenden.",
      "emptyFlowInput": "gute Praktiken",
      "emptyFlowProcess": "zur Routine machen",
      "emptyFlowOutput": "konsistente Kontrollen",
      "emptyFlowGain": "dauerhaftes, skalierbares Vertrauen",
      "emptyExample": "Teams gehen hier von „wir machen das“ zu „das läuft von selbst“ über — und automatisieren die manuellen Teile. (Veranschaulichung.)",
      "emptyDoNextHeading": "Skalieren Sie es",
      "emptyDoNextStep1": "Automatisieren Sie die Kontrollen, die Sie heute manuell durchführen.",
      "emptyDoNextStep2": "Auditieren Sie regelmäßig erneut, um das Niveau zu halten.",
      "ctaSeeAgentsForThis": "Agenten ansehen, die das übernehmen können",
      "ctaSeeRecommendedAgents": "Empfohlene Agenten ansehen",
      "ctaOpenDesignGuide": "Design-Leitfaden öffnen",
      "ptsToRecover": "−{n} Pkt. zurückzugewinnen",
      "priorityCritical": "Priorität: Kritisch",
      "priorityHigh": "Priorität: Hoch",
      "priorityMedium": "Priorität: Mittel",
      "priorityLow": "Priorität: Niedrig",
      "effortBadge": "Aufwand: {effort}",
      "effortBadgeDefault": "Aufwand: mittel",
      "timeframeBadge": "~{days} Tage",
      "timeframeBadgeDefault": "~30 Tage"
    },
    "findings": {
      "title": "Befunde",
      "total": "{n} insgesamt",
      "empty": "✓ Keine Befunde ausgelöst. Bauen Sie Ihre Reife mit den Empfehlungen auf der rechten Seite weiter aus.",
      "severityCritical": "Kritisch",
      "severityHigh": "Hoch",
      "severityMedium": "Mittel",
      "severityLow": "Niedrig",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} Empfehlung{plural}"
    },
    "recommendations": {
      "title": "Empfehlungen",
      "actionsCount": "{n} Maßnahmen",
      "starterResource": "Empfohlene Einstiegsressource",
      "empty": "Derzeit keine umsetzbaren Empfehlungen.",
      "impactCritical": "Kritische Auswirkung",
      "impactHigh": "Hohe Auswirkung",
      "impactMedium": "Mittlere Auswirkung",
      "impactLow": "Geringe Auswirkung",
      "timeframeDays": "{n} T.",
      "addressesFindings": "behebt {count} Befund{plural}"
    },
    "actionPlan": {
      "title": "Priorisierter Aktionsplan",
      "roadmapNote": "Die Roadmap zeigt, wann etwas ausgeliefert wird; der Aktionsplan zeigt, was zuerst behoben werden sollte.",
      "bandCriticalTitle": "Kritisch",
      "bandImportantTitle": "Wichtig",
      "bandImportantSubtitle": "Kurzfristig — im laufenden Quartal angehen.",
      "bandImprovementTitle": "Verbesserung",
      "bandImprovementSubtitle": "Best Practice — für die Reife einplanen.",
      "itemCount": "{n} Eintrag{plural}",
      "bandEmpty": "Keine Einträge in diesem Bereich — hier gibt es vorerst nichts zu tun.",
      "moreNotShown": "+{n} weitere nicht angezeigt",
      "impactPill": "Auswirkung",
      "effortPill": "Aufwand",
      "expectedOutcome": "Erwartetes Ergebnis —"
    }
  },
};
