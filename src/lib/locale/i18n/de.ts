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
    toolsSection:          'Tools',
    aiRoiCalculator:       'KI-ROI-Rechner',
    aiMaturityDiagnostic:  'KI-Reifegrad-Diagnose',
    requestQuote:          'Angebot anfordern',
    invoices:              'Rechnungen',
  },
  invoices: {
    title: 'Rechnungen',
    subtitle: 'Rechnungen, die erstellt werden, wenn ein Kunde ein Angebot annimmt.',
    loading: 'Wird geladen…',
    error: 'Ihre Rechnungen konnten nicht geladen werden. Bitte erneut versuchen.',
    empty: 'Noch keine Rechnungen.',
    quoteLabel: 'Angebot',
    statusDraft: 'Entwurf',
    statusPending: 'Ausstehend',
    statusPaid: 'Bezahlt',
    amountPending: 'Wird bestätigt',
    confirmSend: 'Bestätigen und Rechnung senden',
    amountLabel: 'Endbetrag (USD)',
    confirmBtn: 'Bestätigen & senden',
    cancel: 'Abbrechen',
    sent: 'Rechnung gesendet',
    confirmError: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    pendingHeading: 'Bestätigung ausstehend',
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
    "nextTools": {
      "title": "Weiter erkunden",
      "subtitle": "Leichte Tools, die du jederzeit ausführen kannst — ohne Einrichtung.",
      "roi": "ROI schätzen",
      "diagnostic": "Weitere Schnelldiagnose starten"
    },
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
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Welchen Bereich möchten Sie am liebsten verbessern?",
          "opt": {
            "support": "Kundensupport",
            "sales": "Vertrieb",
            "finance": "Finanzen",
            "documents": "Dokumente",
            "reporting": "Berichtswesen",
            "admin": "Verwaltung",
            "compliance": "Compliance",
            "marketing": "Marketing",
            "hr": "HR"
          }
        },
        "monthlyHours": {
          "label": "Wie viele Stunden pro Monat entfallen ungefähr auf wiederkehrende Arbeit?",
          "opt": {
            "low": "Wenig (~20)",
            "medium": "Einiges (~80)",
            "high": "Viel (~160)"
          }
        },
        "hourlyCost": {
          "label": "Ungefährer durchschnittlicher Stundensatz dieser Arbeit?",
          "opt": {
            "low": "Niedriger (~$25)",
            "medium": "Mittel (~$45)",
            "high": "Höher (~$75)"
          }
        },
        "aiUsage": {
          "label": "Wie wird KI heute in Ihrer Organisation eingesetzt?",
          "opt": {
            "none": "Noch nicht",
            "individual": "Individuell",
            "team": "Teamübergreifend",
            "structured": "In strukturierten Workflows"
          }
        },
        "shadowAi": {
          "label": "Wie viel Überblick haben Sie über die genutzten KI-Tools?",
          "opt": {
            "no_visibility": "Keinen",
            "partial_visibility": "Etwas",
            "mostly_visible": "Den größten Teil",
            "full_inventory": "Vollständige Übersicht"
          }
        }
      },
      "run": {
        "title": "Audit Express ausführen",
        "subtitle": "Eine schnelle, rein schätzbasierte Momentaufnahme Ihrer KI-Reife — automatisch in Ihrem Workspace gespeichert.",
        "errPreviewCode": "Vorschau konnte nicht ausgeführt werden ({code}).",
        "errPreview": "Vorschau konnte nicht ausgeführt werden.",
        "errAnalysisCode": "Analyse nicht verfügbar ({code}).",
        "errAnalysis": "Analyse nicht verfügbar. Bitte versuchen Sie es erneut.",
        "errDocCode": "Dokumentenanalyse nicht verfügbar ({code}).",
        "errDoc": "Dokumentenanalyse nicht verfügbar. Bitte versuchen Sie es erneut.",
        "analyzeSiteTitle": "Eine öffentliche Website analysieren (optional)",
        "analyzeSiteHint": "Liest nur öffentliche Seiten, beachtet robots.txt. Reichert „Was dieses Unternehmen tut“ an.",
        "deepScan": "Tiefenscan (langsamer, mehr Seiten)",
        "saving": "Ihr Ergebnis wird gespeichert…",
        "journeyHeadline": "So ist Ihre Momentaufnahme zu verstehen",
        "journeyReadiness": "KI-Reife: {bucket} ({score}/100).",
        "journeyTimeSaved": "Geschätzte eingesparte Zeit ≈ {hours} Stunden/Monat.",
        "journeyCostSaved": "Geschätzte eingesparte Kosten ≈ {amount}/Monat."
      },
      "cta": {
        "computing": "Wird berechnet…",
        "getPreview": "Vorschau abrufen",
        "analyzing": "Wird analysiert…",
        "analyzeSite": "Website analysieren",
        "preparing": "Wird vorbereitet…",
        "downloadPdf": "PDF herunterladen",
        "viewSaved": "Gespeicherte Audits ansehen",
        "seeAgents": "Auf Ihr Audit abgestimmte Agenten ansehen →",
        "runFullAudit": "Vollständiges Audit ausführen",
        "extracting": "Wird extrahiert…",
        "analyzeDocument": "Dokument analysieren →",
        "save": "Speichern",
        "cancel": "Abbrechen"
      },
      "result": {
        "snapshotHeading": "Ihre Momentaufnahme · KI-Reife: {bucket} ({score}/100)",
        "whatThisMeans": "Was das bedeutet",
        "opportunityLabel": "Das Potenzial — Richtwerte",
        "timeBack": "Zurückgewonnene Zeit",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Kostenwirkung",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Amortisation",
        "howSavingLabel": "Wie die Einsparung entsteht",
        "flowRepetitive": "wiederkehrende Aufgaben",
        "flowAssisted": "unterstützt / automatisiert",
        "flowSameWork": "gleiche Arbeit, weniger manuelle Zeit",
        "flowHoursBack": "Stunden zurück für wertvollere Arbeit",
        "roiUnavailable": "ROI-Schätzung für dieses Audit nicht verfügbar.",
        "whatToDoFirst": "Was zuerst zu tun ist",
        "step1": "Wählen Sie eine Aufgabe mit hohem Volumen (Support-Antworten, Rechnungserfassung, Berichtswesen).",
        "step2": "Testen Sie dafür ~2 Wochen lang einen Assistenten.",
        "step3": "Messen Sie die Stunden vorher/nachher — behalten Sie, was sich auszahlt.",
        "businessHeading": "Was dieses Unternehmen tut",
        "businessType": "Typ:",
        "businessAudience": "Zielgruppe:",
        "businessConfidence": "Konfidenz {confidence}",
        "businessUnknown": "unbekannt",
        "offers": "Angebote: {list}",
        "automationHeading": "Automatisierungspotenziale",
        "opportunityItem": "{title} — {impact} Wirkung / {effort} Aufwand"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Score-Trend",
      "subtitle": "KI-Reifegrad im Zeitverlauf",
      "empty": {
        "title": "Trends erscheinen nach mehreren Audits",
        "hint": "Sobald Sie mehrere Audits in diesem Workspace eingereicht haben, wird Ihr KI-Reifegrad hier aus Ihrem echten Verlauf grafisch dargestellt."
      }
    },
    "automation": {
      "title": "Automatisierungspotenziale",
      "subtitle": "Zugeschnitten auf Ihre KI-Nutzung",
      "empty": {
        "title": "Führen Sie ein Audit durch, um maßgeschneiderte Potenziale zu erhalten",
        "hint": "Automatisierungspotenziale werden aus Ihren Audit-Antworten und Ihrem KI-Register abgeleitet. Schließen Sie ein Audit ab und fügen Sie Ihre KI-Tools hinzu, um hier Vorschläge zu sehen."
      }
    },
    "businessImpact": {
      "title": "Geschäftlicher Nutzen",
      "subtitle": "Messbare Ergebnisse aus Ihrem Compliance-Programm",
      "empty": {
        "title": "Nutzenkennzahlen erscheinen, sobald Ihr Programm reift",
        "hint": "Führen Sie im Lauf der Zeit Audits durch, um einen Leistungsnachweis aufzubauen. Risikoreduzierung, Governance-Fortschritt und eingesparte Zeit werden aus Ihrem echten Verlauf berechnet – keine Schätzungen."
      }
    },
    "recentReports": {
      "title": "Aktuelle Berichte",
      "countOne": "{n} Bericht erstellt",
      "countOther": "{n} Berichte erstellt",
      "viewAll": "Alle anzeigen →",
      "empty": {
        "title": "Noch keine Berichte",
        "hint": "Erstellen Sie einen Bericht aus einem eingereichten Audit – er erscheint hier und unter Berichte für diesen Workspace."
      }
    },
    "kpi": {
      "auditsSubmitted": "Eingereichte Audits",
      "reportsGenerated": "Erstellte Berichte",
      "aiToolsRegistered": "Registrierte KI-Tools",
      "loadErrorSuffix": " — konnte nicht geladen werden"
    },
    "maturity": {
      "rung": {
        "initial": "Initial",
        "managed": "Gesteuert",
        "defined": "Definiert",
        "advanced": "Fortgeschritten",
        "optimal": "Optimal"
      }
    },
    "cta": {
      "poweredBy": "Unterstützt von Luna AI",
      "scheduleDemo": "Demo vereinbaren",
      "startFreeTrial": "Kostenlos testen →"
    },
    "quickTools": {
      "title": "Schnell-Tools",
      "subtitle": "Leichte Checks, die du jederzeit erneut ausführen kannst — getrennt von deinem vollständigen Audit.",
      "diagnostic": {
        "label": "Schnelldiagnose starten",
        "hint": "Bewerte deine KI-Reife in ~2 Min."
      },
      "roi": {
        "label": "ROI schätzen",
        "hint": "Mögliche Zeit- und Kostenersparnis ansehen"
      }
    }
  },
  topbar: {
    "title": {
      "dashboard": "Dashboard",
      "audit/new": "Neuer Audit",
      "audit/result": "Audit-Ergebnis",
      "audit/assistance": "Umsetzungsleitfaden",
      "audit/history": "Audit-Verlauf",
      "reports": "Berichte",
      "reports/detail": "Bericht",
      "reports/share": "Geteilter Bericht",
      "registry": "KI-Register",
      "system-builder": "System-Builder",
      "agents": "Agenten",
      "agents/detail": "Agent",
      "team": "Team",
      "settings": "Einstellungen",
      "billing": "Abrechnung",
      "billing/tokens": "Tokens",
      "help": "Hilfe",
      "audit-express/run": "Audit Express starten",
      "audit-express/saved": "Gespeicherte Audits",
      "audit-express/detail": "Gespeicherter Audit"
    },
    "subtitle": {
      "dashboard": "Übersicht zur KI-Konformität"
    },
    "search": {
      "placeholder": "Audits, Berichte durchsuchen…",
      "toast": "Suche nach \"{query}\"…"
    },
    "dateRange": {
      "last7": "Letzte 7 Tage",
      "last30": "Letzte 30 Tage",
      "thisMonth": "Diesen Monat",
      "lastMonth": "Letzten Monat",
      "customRange": "Benutzerdefinierter Zeitraum…",
      "from": "Von",
      "to": "Bis",
      "apply": "Zeitraum übernehmen",
      "toast": "Zeitraum: {label}",
      "errPickBoth": "Wählen Sie ein Von- und ein Bis-Datum.",
      "errOrder": "Das Von-Datum muss vor dem Bis-Datum liegen."
    },
    "notifications": {
      "label": "Benachrichtigungen",
      "title": "Benachrichtigungen",
      "empty": "Noch keine Benachrichtigungen."
    },
    "tokens": {
      "aria": "{n} Tokens übrig — Tokens verwalten",
      "title": "{n} Tokens übrig · zum Verwalten klicken",
      "balance": "{used} / {total}",
      "corruptTitle": "Token-Guthaben enthält ungültige Daten — zum Reparieren klicken",
      "corruptLabel": "Tokens müssen repariert werden"
    },
    "luna": {
      "aria": "Luna öffnen, Ihre Begleiterin",
      "title": "Luna — Ihre Begleiterin",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Zum Dunkelmodus wechseln",
      "toLight": "Zum Hellmodus wechseln"
    },
    "newAudit": {
      "label": "Neuer Audit",
      "denied": "Ihre Rolle erlaubt das Erstellen von Audits nicht. Audits sind für Inhaber, Administratoren und Mitglieder verfügbar."
    },
    "sidebar": {
      "openMenu": "Navigationsmenü öffnen",
      "closeMenu": "Navigationsmenü schließen",
      "menu": "Menü",
      "expand": "Seitenleiste ausklappen",
      "collapse": "Seitenleiste einklappen"
    }
  },
  auditForm: {
    "title": "Neuer Audit",
    "subtitle": "Gehen Sie 8 Abschnitte durch, um Ihre KI-Konformität einzuschätzen. Ihr Fortschritt wird laufend gespeichert — Sie können jederzeit pausieren und zurückkehren.",
    "loading": "Audit wird geladen…",
    "forbiddenTitle": "Ihre Rolle erlaubt das Erstellen von Audits nicht",
    "forbiddenBody": "Audits stehen den Rollen Inhaber, Administrator und Mitglied zur Verfügung. Wenden Sie sich an einen Workspace-Inhaber oder -Administrator, wenn Sie Audit-Zugriff benötigen.",
    "errorLoad": "Audit konnte nicht geladen werden. Aktualisieren Sie, um es erneut zu versuchen.",
    "pageTitle": "Neuer Audit",
    "pageIntro": "Gehen Sie 8 Abschnitte durch, um Ihre KI-Konformität einzuschätzen. Ihr Fortschritt wird laufend gespeichert — Sie können jederzeit pausieren und zurückkehren.",
    "stepOf": "Schritt {current} von {total}",
    "overallProgress": "Gesamtfortschritt",
    "previous": "← Zurück",
    "saveDraft": "Entwurf speichern",
    "saveContinue": "Speichern & Weiter →",
    "submit": "Audit absenden ✓",
    "saved": "✓ Gespeichert"
  },
  settingsPages: {
    "shell": {
      "title": "Einstellungen",
      "subtitle": "Verwalten Sie Ihr Profil, Ihre Organisation und Ihre Einstellungen."
    },
    "tabs": {
      "profile": "Profil",
      "org": "Organisation",
      "preferences": "Einstellungen",
      "billing": "Abrechnung"
    },
    "profile": {
      "sectionTitle": "Profil",
      "avatarHint": "Der Avatar wird aus Ihren Initialen generiert. Das Hochladen eines eigenen Avatars folgt später.",
      "displayName": "Anzeigename",
      "displayNamePlaceholder": "Ihr vollständiger Name",
      "email": "E-Mail",
      "emailPlaceholder": "sie@beispiel.com",
      "emailVerificationTitle": "E-Mail-Bestätigung",
      "emailVerified": "✓ Ihre E-Mail-Adresse ist bestätigt.",
      "sendVerification": "Bestätigungs-E-Mail senden",
      "sendingVerification": "Wird gesendet…",
      "passwordTitle": "Passwort",
      "passwordHint": "Wir senden einen Link zum Zurücksetzen an Ihre E-Mail-Adresse. Der Link ist eine Stunde lang gültig.",
      "sendPasswordReset": "E-Mail zum Zurücksetzen des Passworts senden",
      "sendingReset": "Wird gesendet…",
      "savedToast": "Profil aktualisiert."
    },
    "org": {
      "sectionTitle": "Organisation",
      "fallbackName": "Workspace",
      "nameLabel": "Name der Organisation",
      "namePlaceholder": "Acme GmbH",
      "ownerOnlyNotice": "Nur der Workspace-Inhaber kann die Organisation umbenennen oder löschen.",
      "planTitle": "Tarif",
      "dangerZoneTitle": "Gefahrenbereich",
      "dangerZoneHint": "Beim Löschen einer Organisation werden alle zugehörigen Daten entfernt: Audits, Berichte, Register und Teammitglieder. Diese Aktion kann nicht rückgängig gemacht werden.",
      "deleteButton": "Organisation löschen…",
      "deleteDialogTitle": "\"{name}\" löschen?",
      "deleteDialogBody1": "Dadurch werden die Organisation sowie alle zugehörigen Audits, Berichte, Registereinträge und Teammitgliedschaften dauerhaft entfernt.",
      "deleteDialogBody2": "Sie werden gebeten, ein weiteres Mal zu bestätigen, bevor Daten verändert werden.",
      "deleteConfirmLabel": "Ich verstehe, fortfahren",
      "renamedToast": "Organisation umbenannt.",
      "deletionDeferredToast": "Das Löschen von Organisationen wird in einem späteren Backend-Schritt aktiviert."
    },
    "billing": {
      "sectionTitle": "Abrechnung",
      "checkingAccess": "Zugriff wird geprüft…"
    }
  },
  common: {
    "saveChanges": "Änderungen speichern",
    "saving": "Wird gespeichert…",
    "cancel": "Abbrechen",
    "loading": "Wird geladen…",
    "save": "Speichern",
    "confirm": "Bestätigen",
    "close": "Schließen",
    "tryAgain": "Erneut versuchen",
    "reloadPage": "Seite neu laden",
    "retryNow": "Jetzt erneut versuchen",
    "reload": "Neu laden",
    "somethingWentWrong": "Etwas ist schiefgelaufen",
    "couldntLoadThePage": "Die Seite konnte nicht geladen werden",
    "stillConnecting": "Verbindung wird noch aufgebaut…"
  },
  journey: {
    "label": {
      "choice": "Auswählen",
      "audit": "Audit",
      "understanding": "Verstehen",
      "adoption": "Einführen"
    },
    "hint": {
      "choice": "Wählen Sie, wie Sie starten möchten — Audit Express für eine schnelle Momentaufnahme oder ein Neuer Audit für mehr Tiefe.",
      "audit": "Schließen Sie Ihren Audit ab — wir erklären, was er bedeutet und was als Nächstes zu tun ist.",
      "understanding": "Hier ist, was Ihr Audit bedeutet. Sehen Sie sich die Erkenntnisse an und wählen Sie dann einen nächsten Schritt."
    },
    "progress": {
      "ariaLabel": "Fortschritt der geführten Reise"
    },
    "chooseAuditType": "Audit-Typ wählen →",
    "dismissAriaLabel": "Geführte Reise schließen",
    "dismiss": "Schließen",
    "next": {
      "whatNext": "Was möchten Sie als Nächstes tun?",
      "recommendedTag": "Empfohlen",
      "backToDashboard": "Zurück zum Dashboard",
      "cta": {
        "agents": {
          "title": "Empfohlene Agenten ansehen",
          "body": "Auf Ihren Audit abgestimmte Tools, die Ihnen Zeit bei den von Ihnen markierten Aufgaben sparen."
        },
        "billing": {
          "title": "Mitgliedschaft erkunden",
          "body": "Tarife, Tokens und enthaltene Leistungen — führen Sie es in Ihrem eigenen Tempo ein."
        },
        "systemBuilder": {
          "title": "System-Builder öffnen",
          "body": "Ein schreibgeschützter Leitfaden zur Gestaltung Ihres KI-Systems über sechs Dimensionen hinweg."
        }
      }
    },
    "start": {
      "greetingTitle": "Hallo, ich bin Luna — legen wir los.",
      "greetingBody": "Wählen Sie, wie Sie beginnen möchten. Sie können jederzeit wechseln und immer direkt zu Ihrem Dashboard gehen.",
      "pendingGreetingDiagnostic": "Wir haben Ihre Diagnose gespeichert. Ein vollständiges Audit macht daraus einen kompletten Aktionsplan. Wählen Sie, wie Sie fortfahren möchten.",
      "pendingGreetingRoi": "Wir haben Ihre ROI-Schätzung gespeichert. Ein vollständiges Audit macht daraus einen kompletten Aktionsplan. Wählen Sie, wie Sie fortfahren möchten.",
      "heading": "Wie möchten Sie starten?",
      "express": {
        "badge": "Empfohlen für Ihr erstes Audit",
        "time": "~5 Min.",
        "title": "Audit Express",
        "body": "Eine schnelle Momentaufnahme der KI-Bereitschaft in ca. 5 Minuten — ein paar kurze Fragen, eine optionale Website-Analyse, ein indikativer ROI. Ideal für einen ersten Eindruck.",
        "cta": "Audit Express starten →"
      },
      "full": {
        "time": "~15 Min.",
        "title": "Neuer Audit (vollständig)",
        "body": "Der vollständige strukturierte Fragebogen — tiefere Bewertung von Konformität und Reifegrad, die Sie in einen teilbaren Bericht umwandeln können. Ideal für eine gründliche Einschätzung.",
        "cta": "Neuen Audit erstellen →"
      },
      "skip": "Überspringen — direkt zu meinem Dashboard"
    }
  },
  auth: {
    "login": {
      "title": "Anmelden",
      "subtitle": "Willkommen zurück bei AiLunaPro",
      "forgotPassword": "Passwort vergessen?",
      "signingIn": "Anmeldung läuft…",
      "signInButton": "Anmelden",
      "noAccountPrompt": "Sie haben noch kein Konto?",
      "signUpLink": "Registrieren"
    },
    "field": {
      "emailAddress": "E-Mail-Adresse",
      "password": "Passwort",
      "fullName": "Vollständiger Name",
      "workEmail": "Geschäftliche E-Mail"
    },
    "placeholder": {
      "email": "sie@unternehmen.com",
      "fullName": "Sophie Martin"
    },
    "signup": {
      "title": "Konto erstellen",
      "subtitle": "Beginnen Sie Ihren Weg zur KI-Konformität",
      "passwordHint": "Mindestens 8 Zeichen",
      "creatingAccount": "Konto wird erstellt…",
      "createAccountButton": "Konto erstellen",
      "haveAccountPrompt": "Sie haben bereits ein Konto?",
      "signInLink": "Anmelden"
    },
    "forgot": {
      "title": "Passwort zurücksetzen",
      "subtitleSent": "Prüfen Sie Ihren Posteingang auf einen Link zum Zurücksetzen.",
      "subtitle": "Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Link zum Zurücksetzen.",
      "sentDetail": "Prüfen Sie Ihren Spam-Ordner, falls die E-Mail nicht ankommt.",
      "backToSignIn": "← Zurück zur Anmeldung",
      "sending": "Wird gesendet…",
      "sendResetLink": "Link zum Zurücksetzen senden",
      "rememberPrompt": "Erinnern Sie sich an Ihr Passwort?",
      "signInLink": "Anmelden"
    },
    "invite": {
      "titleParsing": "Einladung wird gelesen…",
      "titleAuthRequired": "Zum Annehmen anmelden",
      "titleVerifying": "Einladung wird überprüft…",
      "titleAccepting": "Sie werden dem Workspace hinzugefügt…",
      "titleDone": "Willkommen im Team!",
      "titleError": "Problem mit der Einladung",
      "authRequiredBody": "Melden Sie sich an oder erstellen Sie ein Konto, um diese Einladung anzunehmen.",
      "redirecting": "Weiterleitung läuft…",
      "pleaseWait": "Bitte warten Sie einen Moment.",
      "createAccountButton": "Konto erstellen",
      "signInButton": "Anmelden",
      "backToDashboard": "Zurück zum Dashboard"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "Hilfecenter",
      "subtitle": "Finden Sie Antworten, lernen Sie Arbeitsabläufe kennen und beheben Sie häufige Probleme.",
      "onThisPage": "Auf dieser Seite",
      "tocAria": "Hilfe-Bereiche",
      "keyTakeaways": "Wichtigste Punkte",
      "needMoreHelpTitle": "Benötigen Sie weitere Hilfe?",
      "needMoreHelpBody": "Wenden Sie sich an Ihren Workspace-Inhaber oder an den AiLunaPro-Support."
    },
    "gettingStarted": {
      "title": "Erste Schritte",
      "lede": "AiLunaPro ist eine Suite für Compliance und KI-Transformation für Organisationen, die KI einführen — Audits, ein KI-Register, Agentenempfehlungen, ROI-Schätzungen und ein token-basiertes Nutzungsmodell in einem Workspace.",
      "take1": "Beginnen Sie im Dashboard und starten Sie dann ein **Neues Audit** über die Seitenleiste.",
      "take2": "Zwei öffentliche Tools benötigen keine Anmeldung: Diagnostic Express und der ROI-Rechner.",
      "take3": "Inhaber und Admins laden Teammitglieder mit 7-Tage-Links ein.",
      "firstActionsTitle": "Ihre ersten drei Schritte",
      "fa1": "Öffnen Sie das Dashboard und prüfen Sie Ihren aktuellen KI-Reifegrad-Score.",
      "fa2": "Starten Sie über die Seitenleiste ein **Neues Audit**, um Ihre KI-Nutzung und Risiken zu erfassen.",
      "fa3": "Durchsuchen Sie den Agenten-Katalog, um zu sehen, welche AiLunaPro-Agenten zu Ihrem Arbeitsablauf passen.",
      "leadMagnetsTitle": "Öffentliche Lead-Magnete",
      "lm1": "Diagnostic Express — eine kostenlose KI-Reifegrad-Bewertung mit 8 Fragen, kein Konto erforderlich.",
      "lm2": "ROI-Rechner — schätzen Sie die Zeit und das Geld, die Ihr Team mit AiLunaPro-Agenten sparen kann.",
      "publicLinks": "Beide finden Sie unter `#/diagnostic` und `#/roi-calculator`. Teilen Sie diese Links mit Kollegen — sie erfordern keine Anmeldung.",
      "inviteTitle": "Teammitglieder einladen",
      "inviteBody": "Inhaber und Admins können Teammitglieder über die **Team-Seite** in der Seitenleiste einladen. Jede eingeladene Person erhält einen Link, der 7 Tage gültig ist. Rollen werden zum Zeitpunkt der Einladung zugewiesen.",
      "flowTitle": "So läuft es ab",
      "flowStep1": "Neues Audit",
      "flowStep2": "Audit absenden",
      "flowStep3": "Audit gespeichert + Score",
      "flowStep4": "Bericht erstellen",
      "flowStep5": "Berichtsliste",
      "flowCaption": "Vom Audit zu einem teilbaren Bericht-Snapshot"
    },
    "auditVsReport": {
      "title": "Audit vs. Bericht",
      "inShortTitle": "Kurz gesagt",
      "inShort1": "Ein **Audit** erfasst Ihre Antworten und berechnet Ihren Score.",
      "inShort2": "Ein **Bericht** ist ein **Snapshot** eines Audits, der bewusst zum Teilen oder Archivieren erstellt wird.",
      "calloutSubmit": "**Das Absenden speichert Ihr Audit + Score.** Ein **Bericht** ist ein Snapshot, der nur erstellt wird, wenn Sie auf **Bericht erstellen** klicken.",
      "whatIsAuditTitle": "Was ist ein Audit?",
      "wa1": "Ihre Antworten auf strukturierte Fragen.",
      "wa2": "Ihr Compliance- / Reifegrad-Score.",
      "wa3": "Eine dynamische Analyse, die sich mit den Scoring-Regeln weiterentwickeln kann.",
      "calloutEditable": "Ein Audit bleibt bearbeitbar, bis Sie einen Bericht erstellen.",
      "whatIsReportTitle": "Was ist ein Bericht?",
      "wr1": "Ein eingefrorener Snapshot zu einem bestimmten Zeitpunkt.",
      "wr2": "Wird nur erstellt, wenn Sie auf **Bericht erstellen** klicken.",
      "wr3": "Stabil, auch wenn Sie später neue Audits durchführen. Exportierbar und teilbar, aufgeführt unter **Berichte** für den aktiven Workspace.",
      "flowStep1": "Audit absenden",
      "flowStep2": "Audit gespeichert",
      "flowStep3": "Bericht erstellen?",
      "flowStep4": "Bericht-Snapshot",
      "flowStep5": "Berichtsliste",
      "flowCaption": "Ein Bericht wird nur über „Bericht erstellen“ erstellt",
      "calloutFlow": "**Audit absenden** → speichert Audit + Score. **Bericht erstellen** → erstellt einen in *Berichte* sichtbaren Snapshot.",
      "closing": "Eine **Audit-Verlauf**-Ansicht (getrennt von Berichten) ist in der Seitenleiste verfügbar. *Demnächst:* optionaler automatischer Bericht beim Absenden."
    },
    "reportsWorkspaces": {
      "title": "Berichte & Workspaces",
      "p1": "Berichte gelten **pro Workspace**, nicht global. Die Berichtsliste zeigt nur die Berichte des **aktiven** Workspace.",
      "flowStep1": "Workspace A → seine Berichte",
      "flowStep2": "Workspace B → seine Berichte",
      "flowCaption": "Jeder Workspace behält seine eigenen Berichte",
      "calloutWarn": "Sehen Sie einen alten Bericht nicht? Er gehört wahrscheinlich zu einem **anderen Workspace**. Wechseln Sie den Workspace über die Auswahl oben in der Seitenleiste.",
      "calloutNote": "Der Datumsfilter des Dashboards beeinflusst die Berichtsliste **nicht**."
    },
    "fillingAudit": {
      "title": "So füllen Sie das Audit richtig aus",
      "p1": "Gute Eingaben ergeben ein glaubwürdiges Audit. Nehmen Sie sich eine Minute Zeit, um ehrlich zu antworten — das Ergebnis spiegelt wider, was Sie eingeben.",
      "calloutInfo": "Die **„Beschreiben…“**-Freitextfelder fügen Kontext hinzu. Ihr **Score ergibt sich aus den strukturierten (Auswahl-)Fragen**, nicht aus dem Freitext. Verwenden Sie klare, echte, lesbare Informationen für einen glaubwürdigen Bericht.",
      "li1": "Beantworten Sie jede strukturierte Frage — sie bestimmen den Score und die Ergebnisse.",
      "li2": "Verwenden Sie die Freitextfelder für echten Kontext (Verantwortliche, Tools, Prozesse), nicht für Platzhaltertext.",
      "li3": "Führen Sie das Audit erneut durch, während sich Ihre Praktiken weiterentwickeln, um Fortschritte zu verfolgen."
    },
    "agents": {
      "title": "KI-Agenten",
      "lede": "Der Agenten-Katalog listet zehn einsatzbereite KI-Agenten für gängige Geschäftsabläufe auf. Jede Karte zeigt eine Beschreibung, den erwarteten ROI, einen empfohlenen Mindesttarif und einen Link zum Loslegen.",
      "take1": "Zehn First-Party-Agenten, jeweils mit AiLunaPro gekennzeichnet.",
      "take2": "Ein Tarif-Badge (Starter+ / Professional+ / Enterprise+) schlägt die typische Stufe vor.",
      "take3": "„Diesen Agenten holen“ startet den standardmäßigen Registrierungsablauf — noch kein In-App-Kauf.",
      "catalogTitle": "Katalog (10 Agenten)",
      "cat1": "Kundenantworten automatisieren und die Support-Last reduzieren.",
      "cat2": "Interessenten qualifizieren und kommerzielle Follow-ups vorbereiten.",
      "cat3": "bei Rechnungen, Angeboten und Inkasso unterstützen.",
      "cat4": "HR-Teams bei Vorauswahl, Zusammenfassungen und Dokumentation unterstützen.",
      "cat5": "helfen, KI-Compliance, Risiken und Register zu strukturieren.",
      "cat6": "Inhalte, Kampagnen und Marketing-Ideen generieren.",
      "cat7": "Zusammenfassungen, Dashboards und Entscheidungsberichte erstellen.",
      "cat8": "KI-Audit, Reifegrad-Bewertung und Aktionspläne unterstützen.",
      "cat9": "Informationen aus Dokumenten klassifizieren, zusammenfassen und extrahieren.",
      "cat10": "die tägliche Verwaltungsarbeit automatisieren.",
      "sourceBadgeTitle": "Quellen-Badge",
      "sourceBadgeBody": "Agenten werden mit **AiLunaPro** gekennzeichnet, wenn sie First-Party sind. Künftige Versionen werden externe Alternativen mit einem eigenen Badge anzeigen.",
      "planBadgeTitle": "Tarif-Badge",
      "planBadgeBody": "Jede Karte zeigt ein Mindesttarif-Badge (Starter+, Professional+, Enterprise+). Es gibt die empfohlene Abonnementstufe für die typische Nutzung an.",
      "getAgentTitle": "Diesen Agenten holen",
      "getAgentBody": "Klicken Sie auf die Schaltfläche „Diesen Agenten holen“, um das Onboarding zu starten. Agenten sind noch nicht direkt in AiLunaPro käuflich — der Link führt Sie durch den standardmäßigen Registrierungsablauf."
    },
    "tokens": {
      "title": "Tokens",
      "intro": "Tokens sind die Einheit des KI-Verbrauchs in AiLunaPro. Jedes Audit, jede Empfehlung oder jeder Agentenaufruf verbraucht Tokens aus dem monatlichen Kontingent Ihres Workspace.",
      "howTitle": "So funktionieren Tokens",
      "how1": "Ihr Abonnement enthält ein monatliches Token-Kontingent, das zum Tarif passt.",
      "how2": "In jedem Zyklus wird Ihr Guthaben aufgefrischt. Ein kleiner Übertrag (begrenzt auf ein monatliches Kontingent) wird übernommen, damit ungenutzte Tokens nicht verloren gehen.",
      "how3": "Wenn Ihr Guthaben zur Neige geht, können Sie jederzeit ein Aufstockungspaket kaufen.",
      "how4": "Aufstockungs-Tokens werden Ihrem Guthaben hinzugefügt und verfallen nie.",
      "how5": "Aufstockungen ergänzen Ihr Abonnement — sie ersetzen es nicht.",
      "packsTitle": "Aufstockungspakete",
      "packsBody": "Drei Pakete sind verfügbar: Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). Token-Pakete werden derzeit in USD abgerechnet.",
      "balanceTitle": "Wo Sie Ihr Guthaben einsehen",
      "balanceBody": "Das Token-Badge in der oberen Leiste zeigt Ihr aktuelles Guthaben und Ihr monatliches Kontingent an. Klicken Sie darauf, um die Tokens-Seite mit dem vollständigen Nutzungsverlauf zu öffnen und eine Aufstockung zu kaufen.",
      "runOutTitle": "Wenn die Tokens ausgehen",
      "runOutBody": "KI-Aktionen, die mehr Tokens benötigen als Ihr Guthaben, zeigen eine klare „nicht genügend Tokens“-Meldung und einen Link zum Kauf einer Aufstockung. Inhaber, Admins und Abrechnungsmanager können Pakete kaufen. Mitglieder können Guthaben einsehen, aber nicht kaufen."
    },
    "billing": {
      "title": "Abrechnung",
      "lede": "AiLunaPro bietet die Tarife Free, Starter, Professional und Enterprise, die sich durch Token-Kontingent, Audit-Volumen und Team-Funktionen unterscheiden. Checkout und Verwaltung laufen über Stripe.",
      "take1": "Abrechnung und Token-Pakete erfolgen in USD; die Währungsauswahl dient vorerst nur der Anzeige.",
      "take2": "Inhaber/Admins abonnieren und verwalten Tarife über die Abrechnungsseite (Stripe Customer Portal).",
      "take3": "Der Free-Tarif umfasst eine begrenzte Anzahl an Audits und 100 Tokens pro Monat.",
      "currencyTitle": "Währung",
      "currencyBody": "Abrechnung und Token-Pakete erfolgen derzeit in USD. Die Währungsauswahl in der Seitenleiste ist lediglich eine Anzeigeeinstellung. Sie ändert noch nicht die Checkout-Währung von Stripe oder die Preise der Token-Pakete. Eine Mehrwährungsabrechnung ist für eine künftige Version geplant.",
      "subscribingTitle": "Abonnieren",
      "subscribingBody": "Auf der Abrechnungsseite können Inhaber und Admins einen Tarif auswählen und den Checkout über Stripe abschließen. Das Abonnement wird bei erfolgreicher Zahlung sofort aktiviert, und Ihr Token-Kontingent wird automatisch aktualisiert.",
      "manageTitle": "Ihr Abonnement verwalten",
      "manageBody": "Die Schaltfläche „Abonnement verwalten“ öffnet das Stripe Customer Portal, in dem Sie Ihre Zahlungsmethode aktualisieren, den Tarif ändern, Rechnungen einsehen oder kündigen können. Die Kündigung wird zum Ende des aktuellen Zeitraums wirksam.",
      "invoicesTitle": "Rechnungen",
      "invoicesBody": "Rechnungen erscheinen nach jeder Verlängerung auf der Abrechnungsseite. Klicken Sie auf Ansehen oder PDF, um eine Kopie herunterzuladen.",
      "freeTitle": "Free-Tarif",
      "freeBody": "Der Free-Tarif bietet begrenzten Audit-Zugriff und 100 Tokens pro Monat. Nutzen Sie ihn, um das Produkt vor dem Abonnieren zu erkunden."
    },
    "diagnostic": {
      "title": "Diagnostic Express",
      "intro": "Diagnostic Express ist eine kostenlose Bewertung mit 8 Fragen, die Ihnen einen KI-Reifegrad-Score von 0 bis 100 sowie eine kurze Liste empfohlener AiLunaPro-Agenten liefert.",
      "accessTitle": "Wo Sie darauf zugreifen",
      "accessBody": "Öffnen Sie `#/diagnostic` in Ihrem Browser. Keine Anmeldung erforderlich. Dauert etwa zwei Minuten. Sie können den Link mit Kollegen teilen.",
      "getTitle": "Was Sie erhalten",
      "get1": "Einen normalisierten Score von 0 bis 100.",
      "get2": "Eine Reifegrad-Stufe: Emerging, Developing oder Advanced.",
      "get3": "Drei empfohlene Agenten, angepasst an Ihre Stufe.",
      "get4": "Einen direkten Link zur Erstellung Ihres kostenlosen AiLunaPro-Kontos.",
      "privacyTitle": "Datenschutz",
      "privacyBody": "Übermittelte Antworten und Ihre E-Mail-Adresse werden nur gespeichert, um Ihre Diagnose zu erstellen und Sie bezüglich relevanter KI-Dienste zu kontaktieren. Sie können jederzeit die Löschung beantragen."
    },
    "roiCalculator": {
      "title": "ROI-Rechner",
      "intro": "Der ROI-Rechner schätzt, wie viel Zeit und Geld Ihr Team durch den Einsatz von AiLunaPro-KI-Agenten für einen bestimmten Arbeitsablauf sparen kann.",
      "accessTitle": "Wo Sie darauf zugreifen",
      "accessBody": "Öffnen Sie `#/roi-calculator` in Ihrem Browser. Keine Anmeldung erforderlich. Dauert etwa eine Minute.",
      "inputsTitle": "Eingaben",
      "in1": "Teamgröße (1 bis 10,000).",
      "in2": "Monatliche Stunden, die Ihr Team mit sich wiederholender Arbeit verbringt.",
      "in3": "Durchschnittliche Stundenkosten in USD (Standard 50).",
      "in4": "Ziel-Arbeitsablauf (einer von neun: Support, Vertrieb, Finanzen, Dokumente, Berichtswesen, Verwaltung, Compliance, Marketing, HR).",
      "outputsTitle": "Ergebnisse",
      "out1": "Geschätzte monatliche Kostenersparnis (USD).",
      "out2": "Geschätzte jährliche Kostenersparnis (USD).",
      "out3": "Geschätzte Zeitersparnis pro Monat (Stunden).",
      "out4": "Geschätzte Amortisationsdauer in Monaten.",
      "out5": "Zwei empfohlene AiLunaPro-Agenten für den gewählten Arbeitsablauf.",
      "aboutTitle": "Über die Schätzung",
      "aboutBody": "Das Ergebnis basiert auf den von Ihnen bereitgestellten Informationen und konservativen Automatisierungsannahmen. Die tatsächliche Ersparnis kann abweichen. Die Amortisation verwendet platzhalterhafte Agentenkosten von $99/month, bis die Agentenpreise festgelegt sind."
    },
    "team": {
      "title": "Team und Rollen",
      "intro": "AiLunaPro unterstützt fünf Rollen pro Workspace. Jede Rolle hat einen spezifischen Geltungsbereich:",
      "thRole": "Rolle",
      "thManageWorkspace": "Workspace verwalten",
      "thManageBilling": "Abrechnung verwalten",
      "thRunAudits": "Audits durchführen",
      "thViewReports": "Berichte ansehen",
      "limited": "eingeschränkt",
      "inviteTitle": "Teammitglieder einladen",
      "inviteBody": "Inhaber und Admins öffnen die Team-Seite, klicken auf Einladen, geben die E-Mail-Adresse ein und wählen eine Rolle. Die eingeladene Person erhält einen Link, der 7 Tage gültig ist. Wenn ein Link abläuft oder verloren geht, können Inhaber und Admins ihn neu generieren.",
      "rolesTitle": "Rollen ändern",
      "rolesBody": "Inhaber und Admins können die Rolle eines Teammitglieds über die Team-Seite ändern. Mitglieder können vorübergehend deaktiviert (kein Zugriff) und später wieder aktiviert oder aus dem Workspace entfernt werden."
    },
    "settings": {
      "title": "Einstellungen",
      "lede": "Verwalten Sie Ihr Profil, Ihre Organisation, das Erscheinungsbild und Ihre Benachrichtigungseinstellungen. Die Auswahl von Sprache und Währung sind vorerst Anzeigeeinstellungen.",
      "take1": "Profil- und Organisationsdetails finden Sie unter Einstellungen.",
      "take2": "Das Design (hell/dunkel) bleibt über Sitzungen hinweg erhalten.",
      "take3": "Sprache und Währung dienen nur der Anzeige, bis diese Funktionen verfügbar sind.",
      "profileTitle": "Profil",
      "profileBody": "Aktualisieren Sie Ihren Anzeigenamen und Ihre E-Mail-Adresse unter **Einstellungen → Profil**.",
      "orgTitle": "Organisation",
      "orgBody": "Inhaber können die Organisation unter **Einstellungen → Organisation** umbenennen.",
      "themeTitle": "Design",
      "themeBody": "Wechseln Sie zwischen hellem und dunklem Modus unter **Einstellungen → Präferenzen**. Ihre Wahl bleibt über Sitzungen hinweg erhalten.",
      "languageTitle": "Sprache",
      "languageBody": "Die Sprachauswahl in der Seitenleiste und in den Einstellungen ist lediglich eine Präferenz. Die Anwendung wird derzeit auf Englisch angezeigt. Vollständige Mehrsprachigkeit ist für eine künftige Version geplant.",
      "currencyTitle": "Währung",
      "currencyBody": "Die Währungsauswahl in der Seitenleiste und in den Einstellungen ist lediglich eine Anzeigeeinstellung. Abrechnung und Token-Paketpreise bleiben in USD, bis die Mehrwährungsabrechnung implementiert ist.",
      "emailTitle": "E-Mail-Benachrichtigungen",
      "emailBody": "Wählen Sie, welche E-Mails Sie erhalten möchten: wöchentliche Compliance-Zusammenfassung, Benachrichtigungen über fertige Berichte und Team-Aktivität. **Einstellungen → Präferenzen → E-Mail-Benachrichtigungen**."
    },
    "analytics": {
      "title": "Analytik & Cookies (Optional)",
      "intro": "AiLunaPro verwendet optionale, datenschutzfreundliche Produktanalytik, um uns zu helfen, die Zuverlässigkeit zu verbessern und Probleme schneller zu beheben. Sie ist völlig optional und bleibt deaktiviert, bis Sie sie zulassen.",
      "offByDefault": "**Standardmäßig deaktiviert** — es wird nichts erfasst, bis Sie **Zulassen** wählen.",
      "collectedTitle": "Was erfasst wird",
      "chipNoPersonal": "Keine personenbezogenen Daten",
      "chipNoRecording": "Keine Sitzungsaufzeichnung",
      "chipNoAds": "Kein Werbe-Tracking",
      "collectedBody": "Nur anonyme Nutzungssignale wie Seitenaufrufe und Zuverlässigkeitsereignisse.",
      "optTitle": "Jederzeit ein- oder ausschalten",
      "opt1": "Wählen Sie bei Ihrem ersten Besuch im kleinen Banner Zulassen oder Nein, danke.",
      "opt2": "Ihre Wahl wird auf diesem Gerät gespeichert — das Banner fragt nicht erneut.",
      "opt3": "Um sie zu ändern, leeren Sie den Browser-Speicher dieser Website (Website-Daten) und laden Sie neu.",
      "dntTitle": "Do Not Track",
      "dntBody": "Wenn Ihr Browser ein „Do Not Track“-Signal sendet, bleibt die Analytik automatisch deaktiviert und es wird kein Banner angezeigt.",
      "blockedTitle": "Wenn die Analytik blockiert wird",
      "blockedBody": "Einige Browser, Erweiterungen oder Netzwerke blockieren Analytik-Anfragen. Das ist völlig in Ordnung — die Anwendung funktioniert in beiden Fällen normal, und es ist keine Aktion erforderlich."
    },
    "troubleshooting": {
      "title": "Fehlerbehebung",
      "lede": "Schnelle Lösungen für die häufigsten Probleme. Die meisten lassen sich durch eine Aktualisierung beheben; falls nicht, kann Ihnen Ihr Workspace-Inhaber oder der AiLunaPro-Support helfen.",
      "take1": "Zuerst aktualisieren — das behebt die meisten Lade-, Guthaben- und Sitzungsprobleme.",
      "take2": "Token-Guthaben trifft innerhalb weniger Sekunden nach einer erfolgreichen Zahlung ein.",
      "take3": "Ein leerer Bildschirm ist meist eine Browser-Erweiterung oder ein Netzwerkfilter.",
      "loadTitle": "Die Seite lädt nicht",
      "loadBody": "Der Dienst ist möglicherweise vorübergehend nicht verfügbar. Aktualisieren Sie die Seite. Wenn das Problem weiterhin besteht, wenden Sie sich an Ihren Workspace-Inhaber oder den AiLunaPro-Support.",
      "signedOutTitle": "Sie werden unerwartet abgemeldet",
      "signedOutBody": "Ihre Sitzung ist möglicherweise abgelaufen. Melden Sie sich erneut an. Wenn Sie weiterhin abgemeldet werden, wenden Sie sich an Ihren Workspace-Inhaber.",
      "balanceTitle": "Token-Guthaben sieht falsch aus",
      "balanceBody": "Aktualisieren Sie zuerst die Seite. Wenn Ihr Guthaben nach einer Aktualisierung immer noch falsch aussieht, wenden Sie sich an Ihren Workspace-Inhaber oder den AiLunaPro-Support.",
      "balanceCheckoutTitle": "Token-Guthaben wurde nach dem Checkout nicht aktualisiert",
      "balanceCheckoutBody": "Warten Sie einen Moment und aktualisieren Sie die Seite. Token-Guthaben trifft innerhalb weniger Sekunden nach einer erfolgreichen Zahlung ein. Wenn das Guthaben immer noch nicht aktualisiert wird, wenden Sie sich an Ihren Workspace-Inhaber oder den AiLunaPro-Support.",
      "captchaTitle": "Captcha schlägt in den öffentlichen Formularen ständig fehl",
      "captchaBody": "Laden Sie die Seite neu und füllen Sie das Captcha erneut aus. Wenn das Problem weiterhin besteht, versuchen Sie es mit einem anderen Browser oder wenden Sie sich an den AiLunaPro-Support.",
      "syncTitle": "Abonnement-Synchronisierung fehlgeschlagen",
      "syncBody": "Klicken Sie auf der Abrechnungs-Erfolgsseite auf Synchronisierung wiederholen. Wenn der Fehler weiterhin besteht, wenden Sie sich an den AiLunaPro-Support und fügen Sie Ihren Stripe-Beleg bei.",
      "inviteTitle": "Einladungslink funktioniert nicht",
      "inviteBody": "Einladungen verfallen nach 7 Tagen. Bitten Sie Ihren Workspace-Inhaber oder Admin, die Einladung über die Team-Seite neu zu generieren.",
      "roadmapTitle": "Was ist der Unterschied zwischen Roadmap und Aktionsplan?",
      "roadmapBody": "Beide Ansichten leiten sich aus denselben Audit-Ergebnissen und Empfehlungen ab, beantworten jedoch unterschiedliche Fragen. Die **Roadmap** beantwortet, **wann** Arbeit umgesetzt werden soll — die Punkte werden nach Zeithorizont (30 / 60 / 90 Tage) gruppiert, um bei Planung und Kapazität zu helfen. Der **priorisierte Aktionsplan** beantwortet, **was zuerst zu beheben ist** — die Punkte werden nach Priorität (Kritisch / Wichtig / Verbesserung) gruppiert, basierend auf einer festen, deterministischen Regel anhand der bestehenden Schweregrade der Ergebnisse und der Wirkung der Empfehlungen. Sie ergänzen sich, sind keine Duplikate. Keine der Ansichten ändert das Scoring, und keine ist eine Compliance-Zertifizierung.",
      "blankTitle": "Leerer Bildschirm, „Hoppla“ oder kaputtes Layout?",
      "blankBody": "Das ist fast immer ein **Werbeblocker oder eine Datenschutz-Erweiterung** des Browsers (oder ein Firmen-/VPN-/DNS-Filter), die die Skripte, Styles oder Datenanfragen der App blockiert — möglicherweise sehen Sie **ERR_BLOCKED_BY_CLIENT** in der Konsole. Beheben Sie es, indem Sie **audit.ailunapro.com** und ***.googleapis.com** in Ihrem Blocker zulassen, oder öffnen Sie die App in einem sauberen Browser-Profil ohne Erweiterungen und laden Sie dann neu.",
      "emailTitle": "Keine Verifizierungs- oder Passwort-Reset-E-Mail erhalten?",
      "emailBody": "Verifizierungs- und Passwort-Reset-E-Mails werden von Firebase von der in Ihrem Projekt konfigurierten No-Reply-Adresse gesendet (der Standard-Firebase-Absender, bis eine benutzerdefinierte Absenderdomain verifiziert ist). Überprüfen Sie zuerst Ihren **Spam- / Werbe**-Ordner. Sie können die Verifizierungs-E-Mail unter **Einstellungen → Profil** erneut senden oder einen neuen Reset-Link auf der Seite **Passwort vergessen** anfordern. Melden Sie sich nach der Verifizierung ab und wieder an, damit Ihr Konto den verifizierten Status widerspiegelt. (Team-Einladungen sind getrennt und werden über den E-Mail-Anbieter von AiLunaPro versendet.)"
    },
    "faq": {
      "title": "FAQ",
      "q1": "Warum sehe ich meine alten Berichte nicht?",
      "a1": "Berichte gelten **pro Workspace**. Ein älterer Bericht gehört wahrscheinlich zu einem anderen Workspace — wechseln Sie den Workspace über die Auswahl oben in der Seitenleiste. Der Datumsfilter des Dashboards beeinflusst die Berichtsliste nicht.",
      "q2": "Warum ist Berichte leer?",
      "a2": "Ein abgesendetes Audit allein erstellt keinen Bericht. Öffnen Sie ein abgesendetes Audit und klicken Sie auf **Bericht erstellen**, um einen Snapshot zu erstellen — er erscheint dann unter Berichte.",
      "q3": "Beeinflusst zufälliger Text meinen Score?",
      "a3": "Nein. Der Score ergibt sich aus den strukturierten (Auswahl-)Fragen. Freitextfelder „Beschreiben…“ fügen nur Kontext hinzu — aber klare, echte Eingaben machen Ihren Bericht glaubwürdig.",
      "q4": "Was wird gespeichert und wann?",
      "a4": "**Audit absenden** speichert Ihre Antworten + Score. **Bericht erstellen** erstellt einen separaten, teilbaren Snapshot. Siehe „Audit vs. Bericht“ oben.",
      "q5": "Sind meine Daten sicher?",
      "a5": "AiLunaPro verwendet authentifizierten Zugriff, rollenbasierte Berechtigungen, Firestore-Sicherheitsregeln und serverseitige Schreibvorgänge für sensible Operationen. Token-Beträge, Abrechnungsaktionen und Team-Änderungen werden vom Server validiert.",
      "q6": "Kann ich meine Daten löschen?",
      "a6": "Ja. Wenden Sie sich an Ihren Workspace-Inhaber oder den AiLunaPro-Support, um die Löschung Ihres Kontos oder Ihrer Workspace-Daten zu beantragen.",
      "q7": "Warum sind Token-Pakete in USD?",
      "a7": "AiLunaPro führt die Mehrwährungsunterstützung schrittweise ein. Abonnements unterstützen mehrere Währungen über Stripe. Token-Pakete werden in einer künftigen Version mehrwährungsfähig.",
      "q8": "Was bewirkt die Währungsauswahl?",
      "a8": "Sie ist lediglich eine Anzeigeeinstellung. Sie ändert noch nicht die Checkout-Währung von Stripe oder die Preise der Token-Pakete.",
      "q9": "Was bewirkt die Sprachauswahl?",
      "a9": "Sie speichert Ihre bevorzugte Sprache. Die vollständige UI-Übersetzung ist in Arbeit und wird in einer künftigen Version verfügbar sein.",
      "q10": "Wie kontaktiere ich den Support?",
      "a10": "Bei Fragen zu Konto, Abrechnung oder Technik wenden Sie sich zuerst an Ihren Workspace-Inhaber. Bei Problemen, die unsere Hilfe erfordern, wenden Sie sich direkt an den AiLunaPro-Support.",
      "q11": "Werden Agenten bereits innerhalb von AiLunaPro gekauft?",
      "a11": "Noch nicht. Der Agenten-Katalog listet empfohlene KI-Agenten auf. Die Auswahl von „Diesen Agenten holen“ führt Sie durch den standardmäßigen Onboarding-Ablauf. Der direkte In-App-Kauf ist für eine spätere Phase geplant.",
      "q12": "Ist die ROI-Schätzung garantiert?",
      "a12": "Nein. Der ROI-Rechner liefert eine konservative Schätzung basierend auf den von Ihnen bereitgestellten Informationen. Die tatsächliche Ersparnis hängt von Ihrem Arbeitsablauf, der Integrationsqualität und der Akzeptanz ab."
    }
  },
  registry: {
    "page": {
      "title": "KI-Register",
      "subtitle": "Verfolgen Sie jedes KI-Tool, das in Ihrer Organisation eingesetzt wird — Zweck, Daten, Aufsicht und Maßnahmen. Das Register speist Ihre Audits und Berichte.",
      "designGuideLink": "Ein neues System entwerfen? Designleitfaden öffnen →",
      "addTool": "+ Tool hinzufügen",
      "loading": "Register wird geladen…",
      "error": "Register konnte nicht geladen werden. Aktualisieren Sie die Seite, um es erneut zu versuchen."
    },
    "summary": {
      "totalTools": "Tools insgesamt",
      "approved": "Genehmigt",
      "pendingReview": "Prüfung ausstehend",
      "highRisk": "Hochrisiko"
    },
    "filters": {
      "searchPlaceholder": "Tools, Zweck, Notizen durchsuchen…",
      "allDepartments": "Alle Abteilungen",
      "allRisks": "Alle Risiken",
      "allApproval": "Alle Genehmigungen",
      "clear": "Filter zurücksetzen",
      "risk": {
        "low": "Niedrig",
        "medium": "Mittel",
        "high": "Hoch",
        "critical": "Kritisch"
      }
    },
    "table": {
      "tool": "Tool",
      "department": "Abteilung",
      "risk": "Risiko",
      "approval": "Genehmigung",
      "oversight": "Aufsicht",
      "reviewDate": "Prüfdatum"
    },
    "empty": {
      "noItems": {
        "title": "Noch keine KI-Tools im Register",
        "body": "Verfolgen Sie jedes KI-Tool, das in Ihrer Organisation eingesetzt wird — Zweck, Daten, Aufsicht und Maßnahmen. Das Register speist Ihre Audits und Berichte.",
        "action": "+ Erstes Tool hinzufügen"
      },
      "noMatches": {
        "title": "Keine Tools entsprechen diesen Filtern",
        "body": "Erweitern Sie die Filter oder setzen Sie sie zurück, um das vollständige Register zu sehen.",
        "action": "Filter zurücksetzen"
      }
    },
    "modal": {
      "titleAdd": "KI-Tool hinzufügen",
      "titleEdit": "KI-Tool bearbeiten",
      "subtitleAdd": "Erfassen Sie ein KI-Tool, das Ihr Team verwendet. Alle Felder können später bearbeitet werden.",
      "subtitleEdit": "Aktualisieren Sie, was Ihr Team über dieses Tool weiß. Änderungen werden sofort im lokalen Register gespeichert.",
      "fields": {
        "toolName": "Tool-Name",
        "purpose": "Zweck",
        "dataTypes": "Verarbeitete Datentypen",
        "mitigations": "Maßnahmen",
        "notes": "Notizen",
        "department": "Abteilung",
        "approvalStatus": "Genehmigungsstatus",
        "riskLevel": "Risikostufe",
        "humanOversight": "Menschliche Aufsicht",
        "nextReviewDate": "Nächstes Prüfdatum"
      },
      "placeholders": {
        "toolName": "z. B. Copilot für Kundensupport",
        "purpose": "Was leistet dieses Tool?",
        "mitigation": "Maßnahme hinzufügen und Enter drücken",
        "notes": "Anbieter, Standort, Verantwortlicher, alles Erwähnenswerte…"
      },
      "riskOptions": {
        "low": "Niedrig",
        "medium": "Mittel",
        "high": "Hoch",
        "critical": "Kritisch"
      },
      "reviewDateHint": "Leer lassen, wenn keine Prüfung geplant ist.",
      "auditTrail": "Erstellt {createdDate} · Zuletzt aktualisiert {updatedDate}",
      "removeMitigationAria": "Maßnahme {index} entfernen",
      "requiredError": "Erforderlich",
      "deleteConfirm": "„{toolName}“ aus dem Register entfernen? Dies kann nicht rückgängig gemacht werden.",
      "buttons": {
        "delete": "Tool löschen",
        "cancel": "Abbrechen",
        "addToRegistry": "Zum Register hinzufügen",
        "saveChanges": "Änderungen speichern"
      }
    }
  },
  systemBuilder: {
    "chrome": {
      "pageTitle": "KI-System-Builder",
      "pageIntro": "Ein Designleitfaden für die Phase vor dem Deployment. Durchlaufen Sie sechs Dimensionen — Zweck & Risiko, Daten, Modell, Aufsicht, Überwachung, Dokumentation —, um ein KI-System verantwortungsvoll zu gestalten. Ihr Schritt und Ihre Checklisten-Häkchen werden nur auf diesem Gerät gespeichert.",
      "designSteps": "Designschritte",
      "checklist": "Checkliste",
      "doneSuffix": "· {doneCount}/{total} erledigt",
      "keyQuestions": "Kernfragen",
      "references": "Quellen (beratend, keine Rechtsberatung)",
      "previousStep": "← Vorheriger Schritt",
      "nextStep": "Nächster Schritt →",
      "stepOf": "Schritt {n} von {total}",
      "endOfGuide": "✓ Ende des Leitfadens — alle sechs Dimensionen abgedeckt"
    },
    "steps": {
      "purpose": {
        "title": "1. Zweck & Risikoklassifizierung",
        "intro": "Legen Sie fest, wofür das System gedacht ist, wen es betrifft und wie riskant es ist, bevor Sie etwas bauen. Dies verankert jede spätere Entscheidung.",
        "checklist": {
          "c1": "Formulieren Sie den beabsichtigten Zweck in einem Satz (ohne Fachjargon).",
          "c2": "Listen Sie betroffene Personen oder Gruppen auf (Nutzer, Kunden, Dritte).",
          "c3": "Klassifizieren Sie die Risikostufe: inakzeptabel / hoch (Annex III) / begrenzt / minimal — oder GPAI.",
          "c4": "Dokumentieren Sie den Anwendungsbereich und die Grenze (was außerhalb des Geltungsbereichs liegt).",
          "c5": "Listen Sie vorhersehbaren Missbrauch / zweckfremde Nutzung auf und was Sie ablehnen werden."
        },
        "questions": {
          "q1": "Wer hat die Befugnis, dieses System bereitzustellen oder anzuhalten?",
          "q2": "Was passiert — konkret —, wenn das System sich irrt?",
          "q3": "Welche rechtlichen Ansprüche, Sicherheitsbedingungen oder Freiheiten könnten betroffen sein?"
        }
      },
      "data": {
        "title": "2. Datengovernance",
        "intro": "Wenn Ihre Daten fehlerhaft sind, ist das System fehlerhaft. Inventarisieren Sie sie, klassifizieren Sie sie, begründen Sie, warum Sie sie vorhalten, und achten Sie auf Verzerrungen.",
        "checklist": {
          "c1": "Erstellen Sie ein Dateninventar: Quelle, Eigentümer, Sensibilität, Aufbewahrung.",
          "c2": "Schaffen Sie eine Rechtsgrundlage (GDPR Art. 6) für jede verarbeitete Kategorie.",
          "c3": "Dokumentieren Sie die Qualität: Relevanz, Repräsentativität, Lücken, bekannte Verzerrungen.",
          "c4": "Wenden Sie Datenminimierung an: Erfassen Sie nur, was Sie benötigen; bewahren Sie nur so lange wie nötig auf.",
          "c5": "Planen Sie regelmäßige Bias-Prüfungen und Wege zur Korrektur ein."
        },
        "questions": {
          "q1": "Woher stammt jeder Datensatz, und wer ist dafür verantwortlich?",
          "q2": "Enthält der Datensatz sensible Kategorien (Art. 9 GDPR)? Auf welcher Grundlage?",
          "q3": "Welche Bias-Signale werden Sie messen, und gegen welche Baseline?"
        }
      },
      "model": {
        "title": "3. Modellauswahl & Validierung",
        "intro": "Wählen Sie das kleinste Modell, das funktioniert. Validieren Sie es so, wie Angreifer und Nutzer es tatsächlich verwenden werden. Dokumentieren Sie, was es nicht leisten kann.",
        "checklist": {
          "c1": "Begründen Sie die Wahl der Modellgröße / -familie gegenüber dem tatsächlichen Anwendungsfall.",
          "c2": "Definieren Sie Ziele für Genauigkeit + Robustheit und wie Sie sie messen werden.",
          "c3": "Führen Sie Adversarial- / Red-Team-Tests durch (Prompt Injection, Jailbreaks, verzerrte Ausgaben).",
          "c4": "Dokumentieren Sie bekannte Fehlermodi und ausdrückliche Nichtnutzungen.",
          "c5": "Versionieren Sie jedes Modellartefakt und liefern Sie Änderungshinweise mit jedem Deployment aus."
        },
        "questions": {
          "q1": "Warum dieses Modell, und welche günstigere Alternative haben Sie ausgeschlossen?",
          "q2": "Wie sieht das System aus, wenn es sich irrt — und woher wissen Sie das?",
          "q3": "Ist Ihr Testdatensatz repräsentativ für den Produktionsverkehr?"
        }
      },
      "oversight": {
        "title": "4. Menschliche Aufsicht",
        "intro": "Entscheiden Sie, wie Menschen die Kontrolle über folgenreiche Ergebnisse behalten. Stellen Sie sicher, dass die Kontrollen unter Druck tatsächlich funktionieren.",
        "checklist": {
          "c1": "Wählen Sie den Aufsichtsmodus je Entscheidungstyp: in-loop, on-loop oder out-of-loop.",
          "c2": "Benennen Sie Prüfer und dokumentieren Sie SLAs für folgenschwere Entscheidungen.",
          "c3": "Stellen Sie Override- / Pause- / Notausschalter-Kontrollen bereit, die der Prüfer nutzen kann.",
          "c4": "Schreiben Sie ein Eskalations-Runbook (wer wird alarmiert, mit welchem Kontext).",
          "c5": "Protokollieren Sie jedes Override / jede Pause für die Nachbereitung von Vorfällen."
        },
        "questions": {
          "q1": "Wer prüft folgenschwere Ausgaben — und haben diese Personen die Zeit und den Kontext dafür?",
          "q2": "Kann ein einzelner Operator das System ohne Meeting stoppen?",
          "q3": "Wie vermeiden Sie reines Abnicken („Automatisierungs-Selbstgefälligkeit“)?"
        }
      },
      "monitoring": {
        "title": "5. Überwachung & Vorfälle",
        "intro": "Überwachung nach dem Deployment ist nicht optional. Drift verläuft lautlos. Vorfälle nicht.",
        "checklist": {
          "c1": "Definieren Sie Überwachungsmetriken nach dem Deployment (Genauigkeit, Latenz, Schaden, Drift).",
          "c2": "Implementieren Sie Drift-Erkennung für Eingaben und Ausgaben.",
          "c3": "Protokollieren Sie Vorfälle in einer einzigen Warteschlange mit Schweregrad und Verantwortlichem.",
          "c4": "Dokumentieren Sie Meldewege (Aufsichtsbehörde, Kunde, intern).",
          "c5": "Planen Sie regelmäßige Neubewertungen (mindestens vierteljährlich)."
        },
        "questions": {
          "q1": "Welche einzelne Metrik signalisiert Ihnen bei einer Veränderung, das System anzuhalten?",
          "q2": "Wer wird um 3 Uhr morgens alarmiert, und welches Runbook öffnet diese Person?",
          "q3": "Wann haben Sie zuletzt ein KI-Vorfallszenario geprobt?"
        }
      },
      "docs": {
        "title": "6. Dokumentation & Transparenz",
        "intro": "Halten Sie fest, was das System ist, was es nicht ist und was Nutzer wissen müssen. Aktualisieren Sie bei jeder wesentlichen Änderung.",
        "checklist": {
          "c1": "Pflegen Sie technische Dokumentation gemäß Art. 11 (Zweck, Daten, Training, Evaluierung, Risiken).",
          "c2": "Veröffentlichen Sie eine Modell- / Systemkarte pro System; aktualisieren Sie sie bei jedem Release.",
          "c3": "Fügen Sie auf jeder Kundenoberfläche einen nutzerseitigen KI-Hinweis hinzu.",
          "c4": "Aktualisieren Sie Datenschutzhinweise, um die KI-Verarbeitung widerzuspiegeln.",
          "c5": "Bewahren Sie Schulungsnachweise für Mitarbeiter auf, die das System bedienen."
        },
        "questions": {
          "q1": "Was müssen Endnutzer wissen, um dieses System verantwortungsvoll zu nutzen?",
          "q2": "Was würde ein externer Auditor am ersten Tag benötigen?",
          "q3": "Wie aktuell ist die Modell- / Systemkarte gerade?"
        }
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "Berichte",
      "intro": "Generierte Berichte sind Momentaufnahmen eines Audits zu einem bestimmten Zeitpunkt. Jeder Bericht ist exportierbar, teilbar und bleibt stabil, wenn Sie ein neues Audit starten.",
      "generateFromDraft": "+ Aus aktuellem Entwurf generieren",
      "startNewAudit": "Neues Audit starten",
      "loading": "Berichte werden geladen…",
      "errorMessage": "Es wurden noch keine Berichte geladen. Das kann vorkommen, wenn der Workspace neu ist oder Firestore nicht erreichbar ist.",
      "retry": "Erneut versuchen",
      "traceabilityHint": "Berichte sind zeitpunktbezogene Momentaufnahmen, die in Ihrem Workspace gespeichert werden. Die Detailansicht berechnet das vollständige Ergebnis aus der Antwort-Momentaufnahme jedes Berichts neu — so bleiben historische Berichte auch dann korrekt, wenn sich die Bewertungsregeln weiterentwickeln."
    },
    "detail": {
      "loading": "Bericht wird geladen…",
      "notFoundTitle": "Bericht nicht gefunden",
      "notFoundBody": "Dieser Bericht existiert nicht mehr oder wurde gelöscht.",
      "backToReports": "← Zurück zu den Berichten",
      "rename": {
        "titleAriaLabel": "Berichtstitel",
        "saving": "…",
        "saveTitle": "Titel speichern",
        "cancel": "Abbrechen",
        "renameButton": "Umbenennen"
      },
      "download": {
        "preparing": "Wird vorbereitet…",
        "downloadPdf": "⬇ PDF herunterladen"
      },
      "errors": {
        "tokensInsufficientExport": "Nicht genügend Tokens für den Export. Kaufen Sie Tokens, um fortzufahren.",
        "downloadFailed": "Download fehlgeschlagen. Bitte versuchen Sie es erneut.",
        "renameForbidden": "Nur Eigentümer oder Administratoren können Berichte umbenennen.",
        "renameFailed": "Umbenennen nicht möglich. Bitte versuchen Sie es erneut.",
        "tokensInsufficient": "Nicht genügend Tokens. Kaufen Sie Tokens, um fortzufahren.",
        "shareDisabled": "Die Freigabe ist für diesen Bericht deaktiviert.",
        "shareForbidden": "Nur Eigentümer oder Administratoren können Berichte teilen.",
        "shareCreateFailed": "Es konnte kein Freigabelink erstellt werden. Bitte versuchen Sie es erneut.",
        "revokeFailed": "Der Link konnte nicht widerrufen werden. Bitte versuchen Sie es erneut.",
        "toggleSharingFailed": "Die Freigabe konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut."
      },
      "share": {
        "heading": "Teilbarer Link",
        "description": "Ein signierter Link ohne Anmeldung zum PDF dieses Berichts. Das Erstellen oder Neugenerieren wird auf Ihre PDF-Exporte angerechnet.",
        "working": "In Bearbeitung…",
        "generateNewLink": "Neuen Link generieren",
        "revoke": "Widerrufen",
        "shareLink": "Link teilen",
        "enableSharing": "Freigabe aktivieren",
        "disableSharing": "Freigabe deaktivieren",
        "copied": "Kopiert",
        "copy": "Kopieren",
        "expires": "Läuft am {date} ab.",
        "activeLinkExists": "Es existiert ein aktiver Link (läuft am {date} ab). Generieren Sie einen neuen Link, um die URL erneut anzuzeigen — dadurch wird der alte widerrufen.",
        "disabledNotice": "Die Freigabe ist deaktiviert — bestehende Links funktionieren nicht mehr.",
        "useTokensAndCreateLink": "Tokens verwenden & Link erstellen"
      },
      "status": {
        "notShared": "Nicht geteilt",
        "active": "Aktiv",
        "expired": "Abgelaufen",
        "revoked": "Widerrufen",
        "disabled": "Deaktiviert"
      },
      "footer": {
        "openAssistancePlan": "Unterstützungsplan öffnen",
        "deleteReport": "Bericht löschen",
        "deleteConfirm": "Diesen Bericht löschen? Dies kann nicht rückgängig gemacht werden."
      },
      "metadata": {
        "heading": "Metadaten",
        "reportId": "Bericht-ID",
        "sourceDraft": "Quellentwurf",
        "status": "Status",
        "weakestSection": "Schwächster Abschnitt",
        "frameworks": "Frameworks"
      }
    },
    "share": {
      "unavailableTitle": "Geteilter Bericht nicht verfügbar",
      "backToReports": "← Zurück zu den Berichten",
      "copySuccess": "Freigabelink kopiert.",
      "copyFailure": "Link konnte nicht kopiert werden. Versuchen Sie es erneut.",
      "banner": {
        "label": "🔗 Geteilter Bericht — schreibgeschützte Ansicht",
        "description": "Schreibgeschützte Ansicht für Personen in Ihrem Workspace, geöffnet über den In-App-Freigabelink. Interne Aktionsschaltflächen sind ausgeblendet.",
        "copyShareLink": "🔗 Freigabelink kopieren",
        "backToInternalView": "← Zurück zur internen Ansicht"
      },
      "topline": {
        "kicker": "KI-Compliance-Bericht",
        "score": "Score",
        "scoreOutOf": "/100",
        "generated": "Generiert am {date}"
      },
      "poweredBy": "Bereitgestellt von AiLunaPro · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "Gespeicherte Audit Express",
      "subtitle": "Ihre gespeicherten Audit-Express-Momentaufnahmen. Laden Sie das PDF herunter oder entfernen Sie ein gespeichertes Ergebnis.",
      "runAuditExpress": "Audit Express ausführen",
      "loading": "Wird geladen…",
      "empty": {
        "prefix": "Noch keine gespeicherten Audits. Verwenden Sie",
        "runLink": "Audit Express ausführen",
        "suffix": "um eines zu erstellen."
      },
      "meta": {
        "engineLabel": "Engine",
        "engineFallback": "k. A.",
        "confidenceLabel": "Konfidenz"
      }
    },
    "actions": {
      "view": "Anzeigen",
      "rename": "Umbenennen",
      "delete": "Löschen",
      "download": "PDF herunterladen",
      "save": "Speichern",
      "cancel": "Abbrechen",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Audit-Titel",
      "viewDetailsTooltip": "Details anzeigen"
    },
    "errors": {
      "load": "Ihre gespeicherten Audits konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      "tokensInsufficient": "Nicht genügend Tokens für den Export. Kaufen Sie Tokens, um fortzufahren.",
      "download": "Download fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "delete": "Löschen fehlgeschlagen. Bitte versuchen Sie es erneut.",
      "rename": "Umbenennen nicht möglich. Bitte versuchen Sie es erneut."
    },
    "pdfLimitModal": {
      "ariaLabel": "PDF-Export-Limit",
      "title": "Sie haben Ihre {freeCount} kostenlosen PDF-Exporte aufgebraucht",
      "body": "Für den Download weiterer PDFs sind Tokens erforderlich ({tokenCost} Tokens pro Export).",
      "useTokens": "Tokens verwenden & herunterladen",
      "useTokensBusy": "…",
      "buyTokens": "Upgraden oder Tokens kaufen",
      "cancel": "Abbrechen"
    },
    "detail": {
      "backToList": "← Gespeicherte Audits",
      "loading": "Wird geladen…",
      "meta": {
        "engineLabel": "Engine",
        "engineFallback": "k. A.",
        "confidenceLabel": "Konfidenz"
      },
      "rename": "Umbenennen",
      "save": "Speichern",
      "cancel": "Abbrechen",
      "titleAriaLabel": "Audit-Titel",
      "busy": "…",
      "notRecomputed": "Dieses Audit konnte nicht neu berechnet werden.",
      "downloadPdf": "PDF herunterladen",
      "downloadPdfBusy": "Wird vorbereitet…",
      "backToSaved": "Zurück zu den gespeicherten Audits"
    },
    "detailErrors": {
      "notFound": "Dieses Audit existiert nicht mehr.",
      "load": "Dieses Audit konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      "rename": "Umbenennen nicht möglich. Bitte versuchen Sie es erneut.",
      "tokensInsufficient": "Nicht genügend Tokens. Kaufen Sie Tokens, um fortzufahren.",
      "sharingDisabled": "Die Freigabe ist für dieses Audit deaktiviert.",
      "createShareLink": "Es konnte kein Freigabelink erstellt werden. Bitte versuchen Sie es erneut.",
      "revokeShareLink": "Der Link konnte nicht widerrufen werden. Bitte versuchen Sie es erneut.",
      "updateSharing": "Die Freigabe konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut."
    },
    "recommendedAgents": {
      "heading": "Empfohlene Agenten",
      "exploreAll": "Alle Agenten entdecken →",
      "disclaimer": "Orientierende Übereinstimmungen auf Basis dieses Audits. Prüfen Sie die Eignung vor der Einführung.",
      "meta": {
        "hoursSaved": "~{hours} Std./Monat gespart",
        "plan": "{plan}-Plan",
        "setup": "{complexity} Einrichtung"
      }
    },
    "share": {
      "heading": "Teilbarer Link",
      "description": "Ein signierter Link ohne Anmeldung zum PDF dieses Audits. Das Erstellen oder Neugenerieren wird auf Ihre PDF-Exporte angerechnet.",
      "generateNewLink": "Neuen Link generieren",
      "shareLink": "Link teilen",
      "working": "In Bearbeitung…",
      "revoke": "Widerrufen",
      "enableSharing": "Freigabe aktivieren",
      "disableSharing": "Freigabe deaktivieren",
      "copy": "Kopieren",
      "copied": "Kopiert",
      "expires": "Läuft am {date} ab.",
      "activeLinkExists": "Es existiert ein aktiver Link (läuft am {date} ab). Generieren Sie einen neuen Link, um die URL erneut anzuzeigen — dadurch wird der alte widerrufen.",
      "disabledNotice": "Die Freigabe ist deaktiviert — bestehende Links funktionieren nicht mehr.",
      "limitModalActionLabel": "Tokens verwenden & Link erstellen"
    },
    "shareStatus": {
      "notShared": "Nicht geteilt",
      "active": "Aktiv",
      "expired": "Abgelaufen",
      "revoked": "Widerrufen",
      "disabled": "Deaktiviert"
    }
  },
  billingPage: {
    "header": {
      "title": "Abrechnung",
      "subtitle": "Verwalten Sie Ihren Plan, Ihre Nutzung und Ihre Rechnungen.",
      "readOnlyBadge": "Schreibgeschützte Ansicht."
    },
    "plans": {
      "bestValueBadge": "Bestes Preis-Leistungs-Verhältnis",
      "priceApprox": "{approx}{suffix} ca. · Abrechnung in USD",
      "cta": {
        "redirecting": "Weiterleitung…",
        "currentPlan": "Aktueller Plan",
        "freeCurrent": "Free — aktuell",
        "startForFree": "Kostenlos starten",
        "subscribe": "Abonnieren"
      },
      "free": {
        "description": "Testen Sie die Plattform mit eingeschränktem Zugriff.",
        "features": {
          "limitedAuditAccess": "Eingeschränkter Audit-Zugriff",
          "basicDashboard": "Basis-Dashboard",
          "demoReports": "Demo-Berichte",
          "communitySupport": "Community-Support"
        }
      },
      "starter": {
        "description": "Führen Sie eigenständig echte Audits durch.",
        "features": {
          "coreAuditWorkflow": "Kern-Audit-Workflow",
          "basicComplianceReports": "Basis-Compliance-Berichte",
          "starterAuditVolume": "Starter-Audit-Volumen",
          "essentialAiRecommendations": "Grundlegende AI-Empfehlungen",
          "emailSupport": "E-Mail-Support"
        }
      },
      "professional": {
        "description": "Für wachsende Teams mit fortgeschrittenen Audits.",
        "features": {
          "higherAuditVolume": "Höheres Audit-Volumen",
          "advancedReports": "Erweiterte Berichte",
          "teamCollaboration": "Team-Zusammenarbeit",
          "priorityAiRecommendations": "Priorisierte AI-Empfehlungen",
          "prioritySupport": "Priority-Support"
        }
      },
      "enterprise": {
        "description": "Governance und Kontrolle auf Organisationsebene.",
        "features": {
          "highestAuditVolume": "Höchstes Audit-Volumen",
          "advancedTeamManagement": "Erweiterte Team-Verwaltung",
          "organizationControls": "Organisationskontrollen",
          "customBranding": "Individuelles Branding",
          "dedicatedSupport": "Dedizierter Support",
          "enterpriseReadyGovernance": "Enterprise-fähige Governance"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Abrechnungswährung anhand Ihrer Region erkannt: {currency} {symbol}",
        "default": "Abrechnungswährung: {currency} {symbol}"
      },
      "secureCheckoutBadge": "Sicherer Checkout powered by Stripe",
      "heading": "Wählen Sie den Plan, der zu Ihrem Audit-Workflow passt",
      "subheadingPrefix": "Starten Sie im Stripe-Testmodus. Es werden keine echten Abbuchungen vorgenommen — verwenden Sie die Testkarte",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Aktueller Plan",
      "statusNoSubscription": "Kein Abonnement",
      "freePlanNote": "Free-Plan — kein aktives Abonnement",
      "paidPlanSummary": "${price}/Monat · Abrechnung {billingCycle}",
      "renews": " · Verlängert sich am {date}",
      "cancelsAtPeriodEnd": "⚠ Endet zum Periodenende ({date})",
      "billedInCurrency": "Ihr aktives Abonnement wird in {currency} abgerechnet.",
      "resumePlan": "Plan fortsetzen",
      "cancelPlan": "Plan kündigen"
    },
    "billingActions": {
      "title": "Abrechnungsaktionen",
      "manageSubscription": "Abonnement verwalten",
      "managePaymentMethods": "Zahlungsmethoden verwalten",
      "loading": "Wird geladen…",
      "paymentMethodsHint": "Karte aktualisieren, Standard festlegen, entfernen — sicher von Stripe abgewickelt.",
      "noCustomerYet": "Noch kein Stripe-Kunde. Zahlungsmethoden werden nach Ihrem ersten Abonnement oder Token-Kauf verfügbar.",
      "portalError": "Stripe-Portal kann nicht geöffnet werden. Prüfen Sie, ob der Worker läuft."
    },
    "tokens": {
      "title": "Tokens",
      "balance": "{balance} / {allocation} in diesem Zyklus",
      "balanceLoading": "Token-Guthaben wird geladen…",
      "manageTokens": "Tokens verwalten"
    },
    "usage": {
      "sectionTitle": "Nutzung in diesem Zeitraum",
      "auditsLabel": "Audits",
      "seatsLabel": "Plätze",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Zeitraum: {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Rechnungen",
      "empty": "Noch keine Rechnungen.",
      "loading": "Rechnungen werden geladen…",
      "emptyAfterFirstCycle": "Rechnungen erscheinen hier nach Ihrem ersten Abrechnungszyklus.",
      "tableHeaders": {
        "date": "Datum",
        "description": "Beschreibung",
        "amount": "Betrag",
        "status": "Status",
        "invoiceNumber": "Rechnungsnummer",
        "actions": "Aktionen"
      },
      "statusUnknown": "unbekannt",
      "actionView": "Ansehen",
      "actionPdf": "PDF",
      "managedInStripeNote": "Zahlungsmethode und Abrechnungsdetails werden sicher in Stripe verwaltet."
    },
    "mockPlans": {
      "sectionTitle": "Pläne",
      "currentBadge": "Aktuell",
      "free": "Free",
      "priceSuffix": "/Monat",
      "switch": "Wechseln",
      "contactOwnerToChange": "Zum Wechsel des Plans Eigentümer kontaktieren"
    },
    "mockConfirm": {
      "title": "Zu {plan} wechseln",
      "body": "Dies ist eine Testaktion — es erfolgt keine echte Abbuchung.",
      "cancel": "Abbrechen",
      "confirm": "Bestätigen (Test)"
    },
    "locked": {
      "title": "Abrechnungszugriff eingeschränkt",
      "subtitle": "Kontaktieren Sie Ihren Workspace-Eigentümer, um die Abrechnung einzusehen oder zu verwalten.",
      "backToDashboard": "Zurück zum Dashboard",
      "contactWorkspaceOwner": "Workspace-Eigentümer kontaktieren",
      "askOwnerToast": "Bitten Sie Ihren Workspace-Eigentümer um Abrechnungszugriff."
    },
    "success": {
      "headline": {
        "failed": "Synchronisierung fehlgeschlagen",
        "active": "Ihr {plan}-Plan ist aktiv",
        "activating": "Vielen Dank — Ihr Abonnement wird aktiviert"
      },
      "subtext": {
        "failedFallback": "Wir konnten Ihr Abonnement nicht automatisch abschließen.",
        "redirecting": "Sie werden zur Abrechnung weitergeleitet…",
        "syncing": "Wir synchronisieren Ihr Abonnement mit Stripe."
      },
      "pill": {
        "failed": "Synchronisierung fehlgeschlagen",
        "activated": "Abonnement aktiviert",
        "syncing": "Abonnement wird synchronisiert…",
        "almostDone": "Fast fertig…"
      },
      "backToBilling": "Zurück zur Abrechnung",
      "retrySync": "Synchronisierung wiederholen",
      "errors": {
        "stillProcessing": "Die Zahlung wird noch verarbeitet. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
        "sessionInvalid": "Diese Checkout-Sitzung ist nicht mehr gültig. Bitte starten Sie ein neues Abonnement.",
        "notSignedIn": "Sie sind nicht angemeldet. Bitte melden Sie sich an und versuchen Sie es erneut.",
        "orgLinkFailed": "Dieses Abonnement konnte nicht mit Ihrer Organisation verknüpft werden. Bitte kontaktieren Sie den Support.",
        "generic": "Beim Aktivieren Ihres Abonnements ist etwas schiefgelaufen.",
        "noSessionDetected": "Wir konnten Ihre Checkout-Sitzung nicht erkennen. Bitte kehren Sie zur Abrechnung zurück und versuchen Sie es erneut."
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "Tokens",
      "subtitle": "Verfolgen Sie die Nutzung, überwachen Sie Ihr monatliches Kontingent und kaufen Sie bei Bedarf Aufstockungen."
    },
    "locked": {
      "title": "Tokens nicht verfügbar",
      "clientMessage": "Tokens sind über ein Kundenkonto nicht sichtbar.",
      "workspaceMessage": "Tokens sind für diesen Workspace nicht verfügbar.",
      "backToDashboard": "Zurück zum Dashboard"
    },
    "webhook": {
      "notice": "Zahlung erhalten. Warten auf Stripe-Webhook zur Aktualisierung Ihres Token-Guthabens.",
      "refreshBalance": "Guthaben aktualisieren"
    },
    "balance": {
      "loading": "Guthaben wird geladen…",
      "empty": "Noch kein Token-Guthaben. Es wird bei Ihrem ersten Audit erstellt.",
      "statBalance": "Guthaben",
      "statMonthlyAllocation": "Monatliches Kontingent",
      "statConsumed": "Verbraucht",
      "statRollover": "Übertrag",
      "statTopups": "Aufstockungen",
      "cycleEnds": "Zyklus endet: {cycleEnd}",
      "lastReset": "Letztes Zurücksetzen: {lastReset}"
    },
    "packs": {
      "sectionTitle": "Weitere Tokens kaufen",
      "sectionNote": "Token-Pakete werden derzeit in USD abgerechnet. Aufstockungs-Tokens verfallen nie.",
      "readOnlyNotice": "Sie können Tokens einsehen, aber nur Eigentümer, Admins und Abrechnungsmanager können Pakete kaufen.",
      "starterLabel": "Starter",
      "starterBlurb": "Stocken Sie einen schwachen Zyklus auf.",
      "proLabel": "Pro",
      "proBlurb": "Häufigste Aufstockung.",
      "maxLabel": "Max",
      "maxBlurb": "Großer Schub für hohe Auslastung.",
      "tokensUnit": "Tokens",
      "amountPrefix": "+{amount}",
      "buyPack": "Paket kaufen",
      "redirecting": "Weiterleitung…",
      "readOnlyButton": "Schreibgeschützt"
    },
    "usage": {
      "sectionTitle": "Letzte Nutzung",
      "loading": "Nutzung wird geladen…",
      "empty": "Noch keine Nutzung.",
      "colDate": "Datum",
      "colModule": "Modul",
      "colAction": "Aktion",
      "colTokens": "Tokens",
      "colStatus": "Status",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Token-Kauf abgeschlossen. Ihr Guthaben wird in Kürze aktualisiert.",
      "purchaseCancelled": "Token-Kauf abgebrochen.",
      "buyForbidden": "Nur Eigentümer, Admins oder Abrechnungsmanager können Token-Pakete kaufen."
    }
  },
  teamPage: {
    "header": {
      "title": "Team",
      "subtitlePrefix": "Verwalten Sie, wer Zugriff hat auf",
      "subtitleSuffix": "und was die Personen tun dürfen.",
      "subtitleFallbackOrg": "Ihren Workspace",
      "inviteButton": "+ Mitglied einladen"
    },
    "stats": {
      "totalMembers": "Mitglieder gesamt",
      "active": "Aktiv",
      "pendingInvites": "Ausstehende Einladungen",
      "adminsAndOwners": "Admins & Eigentümer"
    },
    "filters": {
      "all": "Alle",
      "owners": "Eigentümer",
      "admins": "Admins",
      "billing": "Abrechnung",
      "members": "Mitglieder",
      "clients": "Kunden",
      "pending": "Ausstehend"
    },
    "roles": {
      "owner": "Eigentümer",
      "admin": "Admins",
      "billing": "Abrechnung",
      "member": "Mitglieder",
      "client": "Kunden"
    },
    "emptyState": {
      "noMembers": "Noch keine Mitglieder in diesem Workspace.",
      "noMatch": "Keine Mitglieder entsprechen dem Filter \"{filter}\"."
    },
    "confirm": {
      "cancelInvite": "Diese ausstehende Einladung stornieren?",
      "regenerateLink": "Einladungslink neu generieren? Der alte Link funktioniert dann nicht mehr.",
      "removeMember": "Dieses Mitglied aus dem Workspace entfernen? Dies kann nicht rückgängig gemacht werden."
    },
    "toast": {
      "cancelFailed": "Stornierung fehlgeschlagen",
      "newLinkCopied": "Neuer Einladungslink in die Zwischenablage kopiert.",
      "regenerateFailed": "Neugenerierung fehlgeschlagen",
      "roleUpdateFailed": "Rollenaktualisierung fehlgeschlagen",
      "memberRemoved": "Mitglied entfernt.",
      "removeFailed": "Entfernen fehlgeschlagen",
      "memberDisabled": "Mitglied deaktiviert.",
      "disableFailed": "Deaktivieren fehlgeschlagen",
      "disableUnavailableMock": "Deaktivieren ist auf der Mock-Ebene nicht verfügbar.",
      "memberEnabled": "Mitglied aktiviert.",
      "enableFailed": "Aktivieren fehlgeschlagen",
      "enableUnavailableMock": "Aktivieren ist auf der Mock-Ebene nicht verfügbar."
    },
    "pendingInvites": {
      "heading": "Ausstehende Einladungen ({count})",
      "tableHeaders": {
        "email": "E-Mail",
        "role": "Rolle",
        "expires": "Läuft ab",
        "actions": "Aktionen"
      },
      "copyLink": "Link kopieren",
      "regenerateLink": "Link neu generieren",
      "cancel": "Stornieren",
      "linkHiddenNote": "Link aus Sicherheitsgründen ausgeblendet. Klicken Sie auf Link neu generieren, um einen neuen auszustellen."
    },
    "rolesLegend": {
      "lead": "**Über Rollen —**",
      "owners": "**Eigentümer** verwalten Abrechnung und Workspace-Einstellungen.",
      "admins": "**Admins** verwalten die Benutzer der Organisation.",
      "billing": "**Abrechnungs**-Benutzer verwalten Rechnungen und Abonnement.",
      "members": "**Mitglieder** können Audit-Funktionen nutzen.",
      "clients": "**Kunden** haben eingeschränkten Lesezugriff."
    },
    "footerHint": "Einladungen sind vorerst nur als Mock verfügbar. Echter E-Mail-Versand und Firebase Auth ersetzen diese Ebene in der Backend-Phase."
  },
  orgCreate: {
    "heading": "Workspace erstellen",
    "subtitle": {
      "signedIn": "Angemeldet als {email}",
      "anonymous": "Einen neuen Organisations-Workspace einrichten"
    },
    "form": {
      "nameLabel": "Workspace-Name",
      "namePlaceholder": "z. B. Acme Corp",
      "planLabel": "Plan"
    },
    "planDesc": {
      "free": "Bis zu 3 Audits, 1 Platz",
      "starter": "10 Audits, 5 Plätze",
      "professional": "Unbegrenzte Audits, 20 Plätze",
      "enterprise": "Individuelle Limits, SSO, SLA"
    },
    "submit": {
      "idle": "Workspace erstellen",
      "loading": "Workspace wird erstellt…"
    },
    "backToDashboard": "← Zurück zum Dashboard"
  },
  auditHistory: {
    "header": {
      "title": "Audit-Verlauf",
      "subtitle": "Eingereichte Audits für diesen Workspace. Erstellen Sie einen Bericht, um eine teilbare Momentaufnahme zu generieren."
    },
    "states": {
      "loading": "Audit-Verlauf wird geladen…",
      "error": "Audit-Verlauf konnte nicht geladen werden. Versuchen Sie es später erneut."
    },
    "empty": {
      "title": "Noch keine eingereichten Audits",
      "description": "Eingereichte Audits erscheinen hier für diesen Workspace. Starten Sie ein neues Audit, um loszulegen.",
      "startAudit": "+ Audit starten"
    },
    "columns": {
      "submitted": "Eingereicht",
      "score": "Score",
      "risk": "Risiko",
      "findings": "Feststellungen"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Bericht erstellen"
    },
    "toast": {
      "reportGenerated": "Bericht erstellt"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Audit eingereicht",
        "preview": "Audit-Vorschau"
      },
      "title": "Audit-Ergebnis",
      "submissionId": "Einreichungs-ID {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Das bedeutet Ihr Audit",
      "summary": {
        "overallScore": "Gesamt-Score {score}/100 — {risk} Risiko.",
        "findingsSingular": "{n} Feststellung bei {m} empfohlenen Maßnahme.",
        "findingsPlural": "{n} Feststellungen bei {m} empfohlenen Maßnahmen.",
        "maturity": "AI-Reife: Stufe {level} von 5."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agenten",
      "intro": "Finden Sie AI-Agenten, die zu Ihrem Workflow passen. AiLunaPro All-in-One-Agenten sind hervorgehoben.",
      "locked": {
        "title": "Agenten sind für Kundenkonten nicht verfügbar",
        "backToDashboard": "Zurück zum Dashboard"
      },
      "filters": {
        "industryLabel": "Branche",
        "integrationLabel": "Integration",
        "allIndustries": "Alle Branchen",
        "allIntegrations": "Alle Integrationen",
        "clearFilters": "Filter zurücksetzen",
        "clearRecommendationsHint": "Empfehlungen löschen, um Filter zu verwenden."
      },
      "loading": "Agenten werden geladen…",
      "emptyFiltered": "Keine Agenten entsprechen den ausgewählten Filtern.",
      "sections": {
        "topRecommendations": "Top-Empfehlungen",
        "otherAgents": "Weitere Agenten"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} Pkt.",
      "whyToggleOne": "Warum? ({count} Grund)",
      "whyToggleOther": "Warum? ({count} Gründe)"
    },
    "recommendPanel": {
      "title": "Meine Empfehlungen personalisieren",
      "subtitle": "Fügen Sie ein paar Präferenzen hinzu, um Agenten passend zu Ihrem Kontext zu sortieren.",
      "fields": {
        "industry": "Branche",
        "companySize": "Unternehmensgröße",
        "targetWorkflow": "Ziel-Workflow",
        "subscriptionPlan": "Abonnementplan",
        "currentMaturity": "Aktuelle AI-Reife",
        "integrations": "Integrationen (kommagetrennt, max. 10)"
      },
      "placeholders": {
        "industry": "z. B. Einzelhandel, SaaS, Gesundheitswesen",
        "integrations": "z. B. hubspot, slack, email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Einzelperson",
        "sme": "KMU",
        "enterprise": "Enterprise"
      },
      "maturityOptions": {
        "low": "Niedrig",
        "medium": "Mittel",
        "high": "Hoch"
      },
      "workflowOptions": {
        "support": "Kundensupport",
        "sales": "Vertrieb und Lead-Nachverfolgung",
        "finance": "Finanzen und Rechnungsstellung",
        "documents": "Dokumente und Verträge",
        "reporting": "Berichte und Dashboards",
        "admin": "Administrative Arbeit",
        "compliance": "Compliance und Governance",
        "marketing": "Marketing und Inhalte",
        "hr": "HR und Personalwesen"
      },
      "helperText": "Fügen Sie mindestens eine Präferenz hinzu, um Empfehlungen zu personalisieren.",
      "submit": "Agenten empfehlen",
      "submitting": "Wird berechnet…",
      "clearRecommendations": "Empfehlungen löschen"
    },
    "card": {
      "external": "Extern",
      "savesPerMonth": "⏱ Spart ~{hours} Std. / Monat",
      "moreIntegrations": "+{count}",
      "viewDetails": "Details ansehen",
      "getThisAgent": "Diesen Agenten holen"
    },
    "detail": {
      "lockedNotice": "Agenten sind für Kundenkonten nicht verfügbar.",
      "backToAgents": "← Zurück zu den Agenten",
      "loading": "Wird geladen…",
      "errors": {
        "missingAgentId": "Fehlende Agenten-ID",
        "missingOrgContext": "Fehlender Org-Kontext"
      },
      "pills": {
        "external": "Extern",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "Einrichtung · {complexity}",
        "recommendedAllInOne": "Empfohlen All-in-One",
        "compliance": "Compliance",
        "audit": "Audit"
      },
      "cta": "Diesen Agenten holen →",
      "sections": {
        "overview": "Überblick",
        "problemSolved": "Gelöstes Problem",
        "bestFit": "Beste Eignung",
        "integrations": "Integrationen",
        "expectedRoi": "Erwarteter ROI",
        "pricing": "Preise"
      },
      "bestFit": {
        "industries": "Branchen",
        "companySize": "Unternehmensgröße",
        "minBudget": "Mindestbudget",
        "minBudgetValue": "{amount}/Mon."
      },
      "roi": {
        "timeSaved": "Eingesparte Zeit",
        "timeSavedValue": "{hours} Std./Mon.",
        "costSaved": "Eingesparte Kosten",
        "costSavedValue": "{amount}/Mon.",
        "payback": "Amortisation",
        "paybackValue": "{months} Monate"
      },
      "pricing": {
        "modelPrefix": "Modell: **{model}**",
        "install": " · Einrichtung: {amount}",
        "monthly": " · Monatlich: {amount}",
        "onRequest": " · Preis auf Anfrage"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Geführter Aktionsplan",
      "title": "Ihr Aktionsplan",
      "intro": "Wir haben Ihre Audit-Antworten in einen sequenzierten, kontextbezogenen Plan übersetzt. Lesen Sie jeden Abschnitt unten durch — jede Aussage verlinkt zurück auf Ihre Daten.",
      "score": "Score {globalScore} / 100",
      "backToResult": "← Zurück zum Ergebnis"
    },
    "detected": {
      "eyebrow": "01 · Diagnose",
      "title": "Was wir festgestellt haben",
      "topIssuesLabel": "Wichtigste identifizierte Probleme",
      "noIssues": "✓ Keine Probleme zu melden — das Audit hat alle Regeln bestanden.",
      "weakestAreaLabel": "Schwächster Bereich",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "Die Lücke dieses Abschnitts zu schließen ist der wirkungsvollste Schritt für Ihren Gesamtscore.",
      "noWeakArea": "Kein schwacher Bereich festgestellt."
    },
    "priorities": {
      "eyebrow": "02 · Prioritäten",
      "title": "Was Sie zuerst beheben sollten",
      "intro": "Von {count} empfohlenen Maßnahmen bringen Ihnen diese drei den höchsten Ertrag im Verhältnis zum Aufwand. Jede verlinkt zurück auf die Findings, die sie schließt.",
      "whyItMattersLabel": "Warum es wichtig ist: ",
      "expectedOutcomeLabel": "Erwartetes Ergebnis: ",
      "impactBadge": "{impact} Wirkung",
      "timeframeDays": "{days}T",
      "closesFindingsOne": "schließt {count} Finding",
      "closesFindingsOther": "schließt {count} Findings",
      "startWithThis": "Hiermit beginnen →",
      "startWithThisTooltip": "Kommt nach J2",
      "mostLeverage": "Größte Hebelwirkung für den Aufwand"
    },
    "operatingModel": {
      "eyebrow": "03 · Betriebsmodell",
      "title": "Was automatisieren oder strukturieren",
      "intro": "Jeder Punkt unten hat einen primären Ausführungsmodus. Zu automatisieren, wo man strukturieren sollte (oder umgekehrt), ist ein häufiges Fehlermuster.",
      "categories": {
        "automate": {
          "eyebrow": "Tools & Systeme",
          "title": "Automatisieren",
          "tagline": "Punkte, bei denen die Hebelwirkung vom System kommt, nicht vom Menschen."
        },
        "structure": {
          "eyebrow": "Richtlinien & Governance",
          "title": "Strukturieren",
          "tagline": "Punkte, die formale Verantwortung, Richtlinien oder Framework-Ausrichtung erfordern."
        },
        "process": {
          "eyebrow": "Wiederkehrender Ablauf",
          "title": "Betreiben",
          "tagline": "Punkte, die Prozesse sind, die Sie in einem festen Rhythmus weiterführen."
        },
        "train": {
          "eyebrow": "Menschen",
          "title": "Schulen",
          "tagline": "Punkte, die Verhalten durch Weiterbildung verändern."
        }
      },
      "actionsCountOne": "{count} Maßnahme",
      "actionsCountOther": "{count} Maßnahmen",
      "timeframeDays": "{days}T",
      "emptyColumn": "Hier ist derzeit nichts."
    },
    "whyItMatters": {
      "eyebrow": "04 · Kontext",
      "title": "Warum das wichtig ist",
      "frameworksReferenced": "In dieser Bewertung referenzierte Frameworks"
    },
    "impact": {
      "eyebrow": "05 · Wirkung",
      "title": "Erwartete geschäftliche Auswirkung",
      "ifTop3": "Wenn Sie die drei wichtigsten Maßnahmen abschließen",
      "scoreLift": "Ihr prognostizierter Gesamtscore steigt von {currentScore} auf {projectedScore}. Dies ist eine richtungsweisende Simulation auf Basis der Findings, die jede Maßnahme schließt — die tatsächliche Veränderung hängt von der Umsetzungstiefe ab.",
      "projectedLabel": "Prognostiziert",
      "deltaPts": "+{delta} Pkt.",
      "noChange": "keine Änderung",
      "toneHighLift": "Hoher Zuwachs",
      "toneSteadyGain": "Stetiger Zuwachs",
      "toneHoldTheLine": "Position halten",
      "outcomes": {
        "auditReadinessTitle": "Audit-Bereitschaft",
        "auditReadinessHigh": "Sie gehen in einem Sicherheitsfragebogen von „unvollständig\" zu „belastbar\" über.",
        "auditReadinessSteady": "Bestehende Aufstellung dokumentiert und in Audits leichter referenzierbar.",
        "incidentExposureTitle": "Vorfallsrisiko",
        "incidentExposureHigh": "Reduzierter Schadensradius und schnellere mittlere Eindämmungszeit, wenn KI Schaden verursacht.",
        "incidentExposureSteady": "Vorhersehbare Reaktion und klarere Verantwortlichkeiten für KI-spezifische Vorfälle.",
        "customerTrustTitle": "Kundenvertrauen",
        "customerTrustHigh": "Offenlegung, Model Cards und Erklärbarkeit geben Ihren Support- und Vertriebsteams klare Antworten.",
        "internalVelocityTitle": "Interne Geschwindigkeit",
        "internalVelocitySteady": "Entwickler liefern schneller, wenn Richtlinien und Prüfpfade eindeutig sind."
      },
      "disclaimer": "Der prognostizierte Score ist eine richtungsweisende Simulation, berechnet aus der Finding-Abdeckung und den Abschnittsgewichtungen. Er ist keine Garantie."
    },
    "nextStep": {
      "eyebrow": "06 · Empfohlen",
      "title": "Ihr nächster Schritt",
      "nextOneThing": "Nächste 1 Sache",
      "savedAt": "Lokal gespeichert um {timestamp}.",
      "localOnlyNote": "Wir halten diesen Plan lokal verfügbar — kein Upload, kein Account-Upgrade erforderlich. Kommen Sie zurück, sobald Ihr Team bereit ist zu handeln.",
      "ctas": {
        "saveDefault": "✓ Diesen Aktionsplan speichern",
        "saved": "✓ Gespeichert",
        "reminderSet": "✓ Erinnerung gesetzt",
        "exported": "✓ Exportiert",
        "remind7Day": "⏰ 7-Tage-Erinnerung setzen",
        "remind30Day": "⏰ 30-Tage-Erinnerung setzen",
        "remind60Day": "⏰ 60-Tage-Erinnerung setzen",
        "remindQuarterly": "⏰ Vierteljährlichen Check-in setzen",
        "exportPlan": "⬇ Plan exportieren"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "Sie agieren in einem Kontext, den Regulierungsbehörden bereits als hochriskant behandeln. Der EU AI Act, die GDPR und branchenspezifische Vorschriften (HIPAA-Äquivalente, Frameworks für Finanzdienstleistungen) bringen alle zusätzliche Pflichten mit sich, wenn KI sensible Daten verarbeitet oder folgenreiche Entscheidungen über Menschen trifft.",
        "customerFacingTransparency": "Ihre KI ist kundenseitig, was bedeutet, dass Transparenzpflichten gelten (EU AI Act Article 50, Verbraucherschutzregeln) und die Reputationsrisiken höher sind als bei internen Tools.",
        "internalBaseline": "Selbst bei interner KI-Nutzung fungieren anerkannte Frameworks (ISO/IEC 42001, NIST AI RMF) zunehmend als Basis für die Lieferanten-Due-Diligence und Enterprise-Geschäfte.",
        "riskInactionHigh": "In Ihrem aktuellen Risikoband sind die Kosten der Untätigkeit asymmetrisch. Ein einziger Vorfall — ein Modell, das Daten preisgibt, eine unfaire Entscheidung, ein Ausfall ohne Runbook — ist wesentlich teurer als die unten empfohlenen Korrekturen.",
        "riskInactionMedium": "Sie befinden sich in einem belastbaren Mittelband. Das Risiko besteht jetzt im Stagnieren: Organisationen, die hier aufhören, fallen typischerweise zurück, während ihr KI-Fußabdruck wächst. Das Schließen der Lücken mittlerer Schwere sichert die aktuelle Aufstellung.",
        "riskInactionLow": "Sie haben bereits eine bedeutende Aufstellung. Das Risiko ist ein Rückschritt, während Ihr KI-Fußabdruck skaliert. Laufende Investitionen sind überwiegend Wartung, Dokumentation und schrittweise Vertiefung.",
        "weakestSection": "Ihr schwächster Bereich ist **{title}** ({score}%). Ihn zu stärken erhöht direkt den Gesamtscore, aber noch wichtiger: Es beseitigt den Weg des geringsten Widerstands für einen Vorfall.",
        "commercialEnabler": "Enterprise-Käufer und regulierte Kunden verlangen in Sicherheitsfragebögen zunehmend Nachweise zur KI-Governance. Viele der Punkte in Ihrem Aktionsplan dienen gleichzeitig als kommerzielle Wegbereiter, nicht nur als Compliance-Arbeit."
      },
      "riskOneLiner": {
        "low": "Sie sind gut aufgestellt — der Fokus verlagert sich auf Wartung und kontinuierliche Verbesserung.",
        "medium": "Sie haben eine belastbare Grundlage, jedoch mit wesentlichen Lücken, die es bald zu schließen lohnt.",
        "high": "Sie haben mehrere Lücken, die Ihr Risiko erheblich erhöhen. Priorisieren Sie die untenstehenden Maßnahmen.",
        "critical": "Sie haben eine oder mehrere kritische Lücken. Die Punkte mit höchster Priorität sollten innerhalb von Tagen, nicht Wochen, angegangen werden."
      },
      "contextChips": {
        "highRiskIndustry": "Hochrisikobranche",
        "sensitiveData": "Sensible Daten im Geltungsbereich",
        "customerFacing": "Kundenseitige KI",
        "missionCritical": "Geschäftskritischer Geltungsbereich",
        "standardProfile": "Standard-Risikoprofil"
      },
      "nextStep": {
        "criticalHeadline": "Beheben Sie das kritische Finding innerhalb der nächsten 7 Tage",
        "criticalRationaleFallback": "Es ist der wesentlichste Punkt in Ihrem Aktionsplan.",
        "highHeadline": "Beginnen Sie mit den 30-Tage-Quick-Wins",
        "highRationaleFallback": "Eine Hochrisiko-Aufstellung reagiert schnell auf eine kleine Anzahl gezielter Maßnahmen. Wählen Sie drei Quick-Wins aus der Roadmap und übernehmen Sie diesen Monat die Verantwortung dafür.",
        "mediumHeadline": "Festigen Sie Ihre Governance-Grundlagen",
        "mediumRationale": "Sie sind über das anfängliche Gerangel hinaus. Der nächste sich verstärkende Schritt ist es, zu formalisieren, was Sie informell tun — eine schriftliche Richtlinie, ein anerkanntes Framework, dokumentierte Eskalation. Das macht Audits und Enterprise-Geschäfte zur Routine.",
        "lowHeadline": "Von konform zu optimiert wechseln",
        "lowRationale": "Ihre Aufstellung ist stark. Die Hebelwirkung liegt jetzt in Dokumentation und kontinuierlicher Verbesserung — Model Cards, Schulungsauffrischungen und die Integration von KI-Szenarien in Ihre Incident-Response-Übungen."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Compliance-Score",
      "riskLabel": "Aktuelles Risikoniveau",
      "maturityLabel": "KI-Reifegrad",
      "nextStepLabel": "Empfohlener nächster Schritt",
      "nextStepTitle": "Audit des HR-Screening-Tools abschließen",
      "nextStepBody": "Dieses Audit ist zu 60 % abgeschlossen. Es zu beenden steigert Ihren Compliance-Score um geschätzte +7 Punkte.",
      "continueAudit": "Audit fortsetzen →",
      "toast": {
        "noPermission": "Sie haben keine Berechtigung, Audits fortzusetzen.",
        "noDraft": "Kein Audit-Entwurf gefunden — ein neues Audit wird gestartet."
      }
    },
    "recentReports": {
      "card": {
        "share": "Teilen",
        "view": "Ansehen"
      },
      "export": {
        "title": "Exportoptionen",
        "blurb": "Exportieren Sie Ihre Compliance-Daten in mehreren Formaten für Stakeholder.",
        "exportAs": "Als {fmt} exportieren"
      },
      "toast": {
        "reportNotAvailable": "Bericht noch nicht verfügbar.",
        "shareLinkCopied": "Freigabelink kopiert.",
        "shareLinkFailed": "Link konnte nicht kopiert werden. Versuchen Sie es erneut.",
        "noReportsToExport": "Noch keine Berichte zum Exportieren.",
        "csvDownloaded": "CSV heruntergeladen.",
        "jsonDownloaded": "JSON heruntergeladen."
      }
    },
    "cta": {
      "heading": "Bereit für vollständige KI-Compliance?",
      "body": "Schließen Sie sich Organisationen an, die AiLunaPro nutzen, um ihre Compliance-Workflows zu automatisieren, Risiken zu reduzieren und Vertrauen bei Stakeholdern aufzubauen.",
      "toast": {
        "alreadyActivePlan": "Sie haben bereits einen aktiven Plan.",
        "demoRequestSent": "Demo-Anfrage gesendet. Wir prüfen sie und melden uns bei Ihnen."
      },
      "demoModal": {
        "title": "Demo vereinbaren",
        "subtitle": "Erzählen Sie uns etwas über Ihr Team, und wir melden uns bei Ihnen.",
        "placeholderFullName": "Vollständiger Name",
        "placeholderWorkEmail": "Geschäftliche E-Mail",
        "placeholderCompany": "Unternehmen",
        "placeholderMessage": "Worüber möchten Sie sprechen?",
        "privacyNote": "Wir verwenden diese Angaben ausschließlich, um auf Ihre Anfrage zu antworten.",
        "cancel": "Abbrechen",
        "submit": "Demo anfragen",
        "submitting": "Wird gesendet…",
        "errorFallback": "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
      }
    }
  },
  support: {
    "cta": "Support kontaktieren",
    "title": "Support kontaktieren",
    "subtitle": "Melde ein Problem oder stelle eine Frage — wir antworten per E-Mail.",
    "typeLabel": "Worum geht es?",
    "typeBug": "Fehler",
    "typeQuestion": "Frage",
    "typeBilling": "Abrechnung",
    "descriptionLabel": "Beschreibung",
    "descriptionPlaceholder": "Was ist passiert? Schritte, erwartetes Verhalten, alles Hilfreiche.",
    "emailLabel": "E-Mail",
    "emailPlaceholder": "du@firma.com",
    "priorityLabel": "Priorität",
    "optional": "(optional)",
    "prioLow": "Niedrig",
    "prioMedium": "Mittel",
    "prioHigh": "Hoch",
    "submit": "Senden",
    "submitting": "Wird gesendet…",
    "success": "Danke — deine Nachricht wurde gesendet. Wir antworten per E-Mail.",
    "close": "Schließen",
    "errType": "Bitte einen Typ wählen.",
    "errDescription": "Bitte das Problem beschreiben.",
    "errEmail": "Bitte eine gültige E-Mail eingeben."
  },
  feedback: {
    "title": "Wie war diese Erfahrung?",
    "satisfactionLabel": "Bewerte deine Erfahrung",
    "sat1": "Sehr schlecht",
    "sat2": "Schlecht",
    "sat3": "Okay",
    "sat4": "Gut",
    "sat5": "Ausgezeichnet",
    "difficultyLabel": "War es einfach zu nutzen?",
    "diffEasy": "Einfach",
    "diffOk": "Okay",
    "diffHard": "Schwierig",
    "blockerLabel": "Was hat Sie daran gehindert, weiterzumachen?",
    "blockerPlaceholder": "Optional — sagen Sie uns, was im Weg stand",
    "suggestionLabel": "Können wir etwas verbessern?",
    "suggestionPlaceholder": "Optional",
    "submit": "Senden",
    "success": "Danke — wir lesen jede Rückmeldung.",
    "dismissAria": "Feedback schließen"
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "KI-Reifegrad-Diagnose",
        "subtitle": "Beantworten Sie 8 kurze Fragen. Erhalten Sie Ihren KI-Reifegrad-Score und sehen Sie, welche AiLunaPro-Agenten zu Ihrer Phase passen.",
        "freeLine": "Kostenlos · Kein Konto erforderlich · Dauert etwa 2 Minuten"
      },
      "resumeNotice": "Willkommen zurück — wir haben Ihre vorherigen Antworten wiederhergestellt, damit Sie dort weitermachen können, wo Sie aufgehört haben.",
      "questionLegend": "Frage {n} / {total}",
      "leadCapture": {
        "heading": "Wohin sollen wir Ihr Ergebnis senden?",
        "emailLabel": "E-Mail",
        "requiredMark": "*",
        "emailPlaceholder": "sie@unternehmen.com",
        "companyNameLabel": "Firmenname",
        "optionalMark": "(optional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Wir verwenden diese Informationen ausschließlich, um Ihre Diagnose zu erstellen und Sie zu relevanten KI-Diensten zu kontaktieren. Es ist kein Konto erforderlich.",
        "consentLabel": "Ich bin damit einverstanden, mein KI-Diagnoseergebnis sowie relevante Folgeinformationen von AiLunaPro zu erhalten. Mir ist bewusst, dass meine Antworten und meine E-Mail-Adresse verarbeitet werden, um dieses Diagnoseergebnis zu erstellen und zu speichern, und dass ich jederzeit die Löschung meiner Daten verlangen kann."
      },
      "submit": {
        "loading": "Ihr Ergebnis wird berechnet…",
        "unlock": "Vollständigen Bericht per E-Mail erhalten →",
        "idle": "Meinen KI-Reifegrad-Score erhalten"
      },
      "signInPrompt": "Haben Sie bereits ein Konto?",
      "signInLink": "Anmelden",
      "errors": {
        "answers": "Bitte beantworten Sie jede Frage.",
        "email": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        "consent": "Sie müssen zustimmen, um Ihr Ergebnis zu erhalten.",
        "captchaLoading": "Captcha wird geladen — bitte warten."
      },
      "buckets": {
        "low": {
          "title": "Ihr KI-Reifegrad ist im Entstehen",
          "message": "Ihr Unternehmen befindet sich in einem frühen Stadium. Beginnen Sie mit einfacher Automatisierung, einer Bestandsaufnahme der KI-Nutzung und praktischen Support-Agenten."
        },
        "medium": {
          "title": "Ihr KI-Reifegrad entwickelt sich",
          "message": "Sie verfügen bereits über einige KI-Grundlagen. Der nächste Schritt besteht darin, die Nutzung zu strukturieren, den ROI zu messen und Dokumenten- und Reporting-Workflows zu verbessern."
        },
        "high": {
          "title": "Ihr KI-Reifegrad ist fortgeschritten",
          "message": "Sie sind bereit, KI mit stärkerer Governance, Compliance, Reporting und spezialisierter Automatisierung zu skalieren."
        }
      },
      "result": {
        "scoreLabel": "Ihr KI-Reifegrad-Score",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Empfohlene AiLunaPro-Agenten",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Diesen Agenten holen",
        "ctaHeading": "Möchten Sie ein tiefergehendes Audit und Ihren vollständigen Aktionsplan?",
        "ctaBody": "Erstellen Sie einen kostenlosen AiLunaPro-Workspace, um Zugriff auf das vollständige Audit, das Register und den Agentenkatalog zu erhalten.",
        "ctaButton": "Kostenloses Konto erstellen ↗",
        "ctaFootnote": "Geht weiter auf **dashboard.ailunapro.com** — der AiLuna-Plattform für KI-Agenten und -Lösungen, dem nächsten Schritt nach Ihrem Audit.",
        "retakeButton": "Diagnose erneut durchführen"
      }
    },
    "roi": {
      "header": {
        "title": "KI-ROI-Rechner",
        "subtitle": "Schätzen Sie die Zeit und das Geld, die Sie mit AiLunaPro-KI-Agenten sparen können.",
        "freeLine": "Kostenlos · Kein Konto erforderlich · Dauert etwa 1 Minute · USD"
      },
      "resumeNotice": "Willkommen zurück — wir haben Ihre vorherigen Eingaben wiederhergestellt, damit Sie dort weitermachen können, wo Sie aufgehört haben.",
      "form": {
        "teamLegend": "Ihr Team",
        "teamSizeLabel": "Teamgröße",
        "teamSizePlaceholder": "z. B. 10",
        "monthlyHoursLabel": "Monatliche Stunden, die Ihr Team für repetitive Arbeit aufwendet",
        "monthlyHoursPlaceholder": "z. B. 80",
        "hourlyCostLabel": "Durchschnittliche Stundenkosten (USD)",
        "targetWorkflowLabel": "Ziel-Workflow",
        "workflowPlaceholderOption": "Workflow auswählen…"
      },
      "leadCapture": {
        "legend": "Wohin sollen wir Ihre Schätzung senden?",
        "emailLabel": "E-Mail",
        "emailPlaceholder": "sie@unternehmen.com",
        "companyNameLabel": "Firmenname",
        "optionalMark": "(optional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Wir verwenden diese Informationen ausschließlich, um Ihre Schätzung zu erstellen und Sie zu relevanten KI-Diensten zu kontaktieren. Es ist kein Konto erforderlich.",
        "consentLabel": "Ich bin damit einverstanden, meine KI-ROI-Schätzung sowie relevante Folgeinformationen von AiLunaPro zu erhalten. Mir ist bewusst, dass meine Antworten und meine E-Mail-Adresse verarbeitet werden, um diese Schätzung zu erstellen und zu speichern, und dass ich jederzeit die Löschung meiner Daten verlangen kann."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "Wird berechnet…",
        "unlock": "Vollständigen Bericht per E-Mail erhalten →",
        "idle": "Meinen ROI berechnen"
      },
      "signInPrompt": "Haben Sie bereits ein Konto?",
      "signInLink": "Anmelden",
      "errors": {
        "teamSize": "Die Teamgröße muss eine ganze Zahl zwischen 1 und 10000 sein.",
        "hours": "Die monatlichen Stunden müssen eine Zahl zwischen 0 und 10000 sein.",
        "cost": "Die Stundenkosten müssen eine Zahl zwischen 1 und 1000 USD sein.",
        "workflow": "Bitte wählen Sie einen Workflow aus.",
        "email": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        "consent": "Sie müssen zustimmen, um Ihre Schätzung zu erhalten.",
        "captchaLoading": "Captcha wird geladen — bitte warten."
      },
      "result": {
        "monthlySavingsLabel": "Geschätzte monatliche Einsparungen",
        "monthlySavingsUnit": "/Mon.",
        "yearlySavingsLabel": "Jährliche Einsparungen",
        "timeSavedLabel": "Eingesparte Zeit",
        "timeSavedValue": "{hours} Std./Mon.",
        "paybackLabel": "Amortisation",
        "paybackValue": "{months} Monate",
        "paybackEmpty": "—",
        "disclaimer": "Dies ist eine Schätzung auf Grundlage der von Ihnen angegebenen Informationen und konservativer Automatisierungsannahmen. Die tatsächlichen Einsparungen können abweichen.",
        "pricingNote": "Die Amortisation geht von Referenz-Agentenkosten von {cost}/month aus; die tatsächliche Preisgestaltung variiert je nach Agent.",
        "recommendedAgentsHeading": "Empfohlene AiLunaPro-Agenten",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Diesen Agenten holen",
        "ctaHeading": "Möchten Sie eine tiefergehende Analyse und Ihren vollständigen Aktionsplan?",
        "ctaBody": "Erstellen Sie einen kostenlosen AiLunaPro-Workspace, um Zugriff auf das vollständige Audit, das Register und den Agentenkatalog zu erhalten.",
        "ctaButton": "Kostenloses Konto erstellen ↗",
        "ctaFootnote": "Geht weiter auf **dashboard.ailunapro.com** — der AiLuna-Plattform für KI-Agenten und -Lösungen, dem nächsten Schritt nach Ihrem Audit.",
        "rerunButton": "Weitere Berechnung durchführen"
      }
    },
    "quote": {
      "header": {
        "title": "Angebot anfordern",
        "subtitle": "Erhalten Sie sofort eine indikative Preisspanne für ein individuelles KI-Agenten-, Automatisierungs- oder Website-Projekt.",
        "freeLine": "Kostenlose Schätzung · Kein Konto erforderlich · Nur indikativ"
      },
      "resumeNotice": "Willkommen zurück — wir haben Ihre vorherigen Eingaben wiederhergestellt.",
      "form": {
        "serviceLegend": "Was benötigen Sie?",
        "serviceLabel": "Art der Leistung",
        "servicePlaceholder": "Leistung auswählen…",
        "tierLabel": "Projektkomplexität",
        "tierPlaceholder": "Komplexitätsstufe auswählen…",
        "descriptionLabel": "Projektbeschreibung",
        "descriptionPlaceholder": "Beschreiben Sie kurz Ihr Projekt, Ihre Ziele und die zu integrierenden Tools. Bitte fügen Sie keine vertraulichen oder personenbezogenen Daten hinzu.",
        "optionalLegend": "Ein paar weitere Angaben (optional)",
        "businessSizeLabel": "Unternehmensgröße",
        "urgencyLabel": "Dringlichkeit",
        "budgetBandLabel": "Budgetrahmen",
        "notSpecified": "Nicht angegeben"
      },
      "services": {
        "ai_agent": "KI-Agent",
        "automation": "Automatisierungs-Workflow",
        "website": "Website / Web-App",
        "audit": "Machbarkeitsprüfung"
      },
      "tiers": {
        "simple": "Einfach",
        "contextual": "Kontextbezogen (MVP)",
        "autonomous": "Autonom",
        "multi_agent": "Multi-Agenten-System",
        "intermediate": "Mittel",
        "complex": "Komplex",
        "custom": "Individuell / maßgeschneidert",
        "feasibility": "Machbarkeitsstudie"
      },
      "businessSizes": {
        "solo": "Solo / Freelancer",
        "small": "Klein (2–20)",
        "medium": "Mittel (21–100)",
        "large": "Groß (100+)"
      },
      "urgencies": {
        "low": "Flexibel",
        "standard": "Standard",
        "high": "Dringend"
      },
      "budgetBands": {
        "under_10k": "Unter $10k",
        "10k_50k": "$10k–$50k",
        "50k_150k": "$50k–$150k",
        "over_150k": "Über $150k"
      },
      "requiredMark": "*",
      "submit": {
        "idle": "Meine Schätzung erhalten"
      },
      "errors": {
        "service": "Bitte wählen Sie eine Art der Leistung.",
        "tier": "Bitte wählen Sie eine Komplexitätsstufe.",
        "description": "Bitte beschreiben Sie Ihr Projekt (mindestens 20 Zeichen)."
      },
      "result": {
        "rangeLabel": "Geschätzte Preisspanne",
        "openEndedSuffix": "+",
        "recommendedLabel": "Empfohlene Lösung",
        "scopeHeading": "Was typischerweise enthalten ist",
        "nextStepsHeading": "Nächste Schritte",
        "opsCostNote": "KI-Agenten- und Automatisierungsprojekte verursachen zudem Betriebskosten (Tokens, Infrastruktur), die typischerweise {min}–{max}% auf die Entwicklung aufschlagen.",
        "disclaimer": "Indikative, unverbindliche Schätzung ausschließlich zu Budgetierungszwecken — nur zu Informationszwecken. Der endgültige Preis hängt von einem detaillierten Leistungsumfang ab.",
        "ctaHeading": "Bereit, den nächsten Schritt zu gehen?",
        "ctaBody": "Erstellen Sie einen kostenlosen AiLunaPro-Workspace, um ein gebrandetes PDF-Angebot zu erstellen und Ihr Projekt zu starten.",
        "ctaButton": "Kostenloses Konto erstellen ↗",
        "rerunButton": "Von vorne beginnen"
      },
      "solutions": {
        "ai_agent.simple": "Einfacher KI-Agent",
        "ai_agent.contextual": "Kontextbezogener KI-Agent (MVP)",
        "ai_agent.autonomous": "Autonomer KI-Agent",
        "ai_agent.multi_agent": "Multi-Agenten-System",
        "automation.simple": "Einfacher Automatisierungs-Workflow",
        "automation.contextual": "Kontextbezogener Automatisierungs-Workflow",
        "automation.autonomous": "Autonomes Automatisierungssystem",
        "automation.multi_agent": "Multi-Agenten-Automatisierungsplattform",
        "website.simple": "Einfache Website",
        "website.intermediate": "Mittlere Website",
        "website.complex": "Komplexe Web-Plattform",
        "website.custom": "Individuelle / maßgeschneiderte Plattform",
        "audit.feasibility": "Machbarkeits- und Scoping-Studie"
      },
      "scope": {
        "discovery": "Discovery- & Anforderungs-Workshop",
        "design": "Lösungsdesign & Architektur",
        "integration": "Integration mit Ihren Tools (CRM/ERP, APIs)",
        "deployment": "Bereitstellung & Übergabe",
        "monitoring": "Einrichtung von Monitoring & Support",
        "mapping": "Prozessabbildung & Workflow-Design",
        "build": "Aufbau & Entwicklung",
        "content": "Einrichtung von Inhalten & Daten",
        "launch": "Launch & Go-live",
        "assessment": "Bewertung des Ist-Zustands",
        "gapAnalysis": "Gap-Analyse",
        "recommendations": "Priorisierte Empfehlungen",
        "roadmap": "Umsetzungs-Roadmap"
      },
      "nextSteps": {
        "discoveryCall": "Vereinbaren Sie ein Discovery-Gespräch, um den Umfang zu präzisieren",
        "scoping": "Erhalten Sie ein detailliertes Scoping-Dokument",
        "proposal": "Erhalten Sie ein formelles Angebot & einen Zeitplan"
      },
      "generate": {
        "button": "Offizielles Angebot erstellen",
        "cost": "{n} Tokens",
        "loading": "Wird erstellt…",
        "success": "Ihr Angebot wurde erstellt und in Ihrem Arbeitsbereich gespeichert.",
        "error": "Angebot konnte nicht erstellt werden. Bitte erneut versuchen.",
        "needOrg": "Wählen Sie einen Arbeitsbereich, um ein Angebot zu erstellen."
      },
      "guided": {
        "goalsLabel": "Häufige Ziele — wählen Sie passende aus",
        "detailsLabel": "Sonst noch etwas? (optional)",
        "detailsPlaceholder": "Ergänzen Sie Details: zu integrierende Tools, Zeitrahmen, Must-haves… Bitte keine vertraulichen oder personenbezogenen Daten angeben.",
        "paymentNote": "Bei individuellen Projekten erfolgt die Zahlung in der Regel per Banküberweisung gegen Rechnung. Nach der Projektfreigabe wird eine finale Rechnung erstellt. Diese Schätzung ist unverbindlich und nicht vertraglich.",
        "selectError": "Wählen Sie mindestens ein Ziel oder fügen Sie eine kurze Beschreibung hinzu.",
        "suggestions": {
          "support": "Kundensupport automatisieren",
          "crm": "KI mit meinem CRM verbinden",
          "workflows": "Interne Arbeitsabläufe automatisieren",
          "dataEntry": "Dateneingabe automatisieren",
          "reporting": "Automatisiertes Reporting & Auswertungen",
          "integrations": "Meine bestehenden Tools integrieren",
          "notifications": "Automatisierte Benachrichtigungen & Warnungen",
          "dataSync": "Daten zwischen Systemen synchronisieren",
          "showcase": "Mein Unternehmen präsentieren",
          "leads": "Leads generieren",
          "ecommerce": "Online verkaufen (E-Commerce)",
          "dashboard": "Internes Dashboard / Portal",
          "booking": "Online-Buchung / Terminplanung",
          "feasibility": "Machbarkeit bewerten",
          "readiness": "KI- / EU-AI-Act-Bereitschaft prüfen",
          "vendorCompare": "Lösungen / Anbieter vergleichen",
          "roadmap": "Umsetzungs-Roadmap erhalten"
        }
      },
      "pdf": {
        "download": "PDF herunterladen",
        "docTitle": "Projektangebot",
        "summaryHeading": "Projektzusammenfassung",
        "pricingHeading": "Geschätzte Investition"
      },
      "email": {
        "clientLabel": "E-Mail des Kunden (optional) — leer lassen, um sie an sich selbst zu senden",
        "clientPlaceholder": "kunde@firma.com",
        "button": "Angebot per E-Mail senden",
        "sent": "Angebot an Ihren Posteingang gesendet.",
        "error": "E-Mail konnte nicht gesendet werden. Bitte erneut versuchen."
      },
      "override": {
        "toggle": "Preis anpassen (Admin)",
        "minLabel": "Min (USD)",
        "maxLabel": "Max (USD)",
        "reasonLabel": "Begründung",
        "save": "Anpassung speichern",
        "error": "Anpassung konnte nicht gespeichert werden.",
        "invalid": "Geben Sie einen gültigen Min/Max-Wert (USD) und eine kurze Begründung ein.",
        "adjustedNote": "Angepasster Preis: {range}"
      },
      "proposal": {
        "execSummaryTemplate": "Dieses Angebot beschreibt {solution}, zugeschnitten auf Ihre Ziele und bestehenden Tools.",
        "solutionHeading": "Vorgeschlagene Lösung",
        "paymentHeading": "Zahlung",
        "timelineHeading": "Indikativer Zeitplan",
        "coverClient": "Erstellt für",
        "coverDate": "Datum",
        "coverValid": "Gültig bis",
        "coverRef": "Referenz",
        "solutionDesc": {
          "ai_agent": "Ein maßgeschneiderter KI-Agent, der Ihre Ziele automatisiert und sich mit Ihren bestehenden Tools (CRM/ERP, APIs) verbindet.",
          "automation": "Ein Automatisierungs-Workflow, der Ihre Tools verbindet und manuelle, sich wiederholende Schritte beseitigt.",
          "website": "Eine professionelle Website oder Web-Plattform, ausgerichtet auf Ihre Geschäftsziele.",
          "audit": "Eine Machbarkeits- und Scoping-Studie, die das Projekt vor dem Bau absichert."
        },
        "timeline": {
          "agent": "Discovery & Konzeption — 1–2 Wochen\nEntwicklung & Integration — 4–8 Wochen\nTests & Deployment — 1–2 Wochen",
          "website": "Discovery & Konzeption — 1–2 Wochen\nEntwicklung — 3–6 Wochen\nInhalte & Launch — 1 Woche",
          "audit": "Bewertung — 1 Woche\nAnalyse & Empfehlungen — 1 Woche"
        },
        "justification": {
          "heading": "So wird diese Schätzung berechnet",
          "market": "Basierend auf 2026er Marktreferenzen für {category}-Projekte mit {tier}-Komplexität.",
          "complexity": "Spiegelt die {tier}-Komplexität des Projekts wider.",
          "scope": "Umfasst {count} zentrale Arbeitspakete, einschließlich der Integration Ihrer Tools.",
          "ops": "KI-Agenten- und Automatisierungsprojekte verursachen zusätzlich {min}–{max}% Betriebskosten (Tokens, Infrastruktur)."
        }
      },
      "flow": {
        "heading": "So funktioniert es",
        "s1": "Angebot annehmen",
        "s2": "Wir bestätigen den Endbetrag",
        "s3": "Sie erhalten Ihre Rechnung",
        "s4": "Sie führen die Zahlung aus"
      },
      "decision": {
        "invoiceDraftTitle": "Rechnung erstellt (Entwurf)",
        "invoiceStatusDraft": "Entwurf",
        "invoiceWaiting": "Wir bestätigen den Endbetrag und senden Ihnen dann Ihre Rechnung.",
        "adjustHeading": "Möchten Sie dieses Angebot anpassen oder besprechen?",
        "messagePlaceholder": "Fügen Sie eine Nachricht hinzu — was möchten Sie anpassen?",
        "messageSend": "Anfrage senden",
        "budgetLabel": "Ihr Budget (optional)",
        "budgetPlaceholder": "z. B. 50000",
        "verdictBelow": "Ihr Budget liegt unter dem geschätzten Bereich.",
        "verdictWithin": "Ihr Budget liegt im geschätzten Bereich.",
        "verdictAbove": "Ihr Budget liegt über dem geschätzten Bereich.",
        "accept": "Diese Schätzung annehmen",
        "discuss": "Besprechen / Anpassung anfragen",
        "accepted": "Schätzung angenommen — wir melden uns in Kürze.",
        "discussionSent": "Anfrage gesendet — wir melden uns zur Besprechung.",
        "error": "Ihre Entscheidung konnte nicht gespeichert werden. Bitte erneut versuchen."
      },
      "negotiation": {
        "heading": "Verhandlungsübersicht",
        "initialLabel": "Erste Schätzung",
        "budgetLabel": "Ihr Budget",
        "adjustedLabel": "Angepasster Preis"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Niedrig",
      "medium": "Mittel",
      "high": "Hoch",
      "critical": "Kritisch",
      "completed": "Abgeschlossen",
      "inProgress": "In Bearbeitung",
      "draft": "Entwurf",
      "published": "Veröffentlicht",
      "archived": "Archiviert",
      "effortLow": "Geringer Aufwand",
      "effortMedium": "Mittl. Aufwand",
      "effortHigh": "Hoher Aufwand"
    },
    "riskWord": {
      "critical": "Kritisches Risiko",
      "high": "Hohes Risiko",
      "medium": "Mittleres Risiko",
      "low": "Geringes Risiko",
      "minimal": "Minimales Risiko"
    },
    "approval": {
      "approved": "Genehmigt",
      "pending": "Ausstehend",
      "underReview": "In Prüfung",
      "rejected": "Abgelehnt"
    },
    "oversight": {
      "hitl": "Human-in-the-Loop",
      "hotl": "Human-on-the-Loop",
      "oot": "Autonom"
    },
    "dataTypes": {
      "pii": "Personenbezogene Daten (PII)",
      "health": "Gesundheitsdaten",
      "financial": "Finanziell / transaktional",
      "biometric": "Biometrisch",
      "children": "Daten zu Minderjährigen",
      "public": "Öffentlich / offen",
      "internal": "Interne Dokumente",
      "employee": "Mitarbeiterdaten"
    },
    "confidence": {
      "low": "niedrig",
      "medium": "mittel",
      "high": "hoch"
    },
    "memberStatus": {
      "active": "Aktiv",
      "pending": "Ausstehend",
      "invited": "Eingeladen",
      "disabled": "Deaktiviert"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automatisiert Kundenantworten und reduziert den Support-Aufwand.",
        "description": "KI-Agent, der häufig gestellte Fragen beantwortet, Support-Anfragen qualifiziert, Tickets weiterleitet und Kundenservice-Teams unterstützt. Er hilft Unternehmen, eine durchgehend verfügbare erste Support-Ebene aufzubauen, ohne menschliche Teams zu ersetzen.",
        "problemSolved": "Langsame Reaktionszeiten gegenüber Kunden, wiederkehrende Anfragen und überlastete Support-Teams."
      },
      "sales-agent": {
        "tagline": "Qualifiziert Interessenten und bereitet kommerzielle Follow-ups vor.",
        "description": "Vertriebsorientierter KI-Agent, der Leads qualifiziert, kommerzielle Antworten vorbereitet, Follow-ups erstellt und Verkaufschancen strukturiert. Er hilft Vertriebsteams, Zeit bei wiederkehrenden Aufgaben zu sparen und die Nachverfolgung von Interessenten zu verbessern.",
        "problemSolved": "Schlecht qualifizierte Interessenten, vergessene Follow-ups und vergeudete Vertriebszeit."
      },
      "finance-agent": {
        "tagline": "Unterstützt bei Rechnungen, Angeboten und dem Mahnwesen.",
        "description": "KI-Agent, der bei der Klassifizierung von Finanzdokumenten, der Erstellung von Angeboten, der Rechnungsverfolgung, dem Generieren von Zahlungserinnerungen und dem Erkennen einfacher Unstimmigkeiten hilft. Er ersetzt keine Buchhaltung, reduziert aber den finanziellen Verwaltungsaufwand erheblich.",
        "problemSolved": "Manuelle Rechnungsbearbeitung, verspätetes Mahnwesen und Eingabefehler."
      },
      "hr-agent": {
        "tagline": "Unterstützt HR-Teams bei Vorauswahl, Zusammenfassungen und Dokumentation.",
        "description": "KI-Agent, der wiederkehrende HR-Aufgaben unterstützt, etwa CV-Zusammenfassungen, Bewerbernotizen, interne Antworten, Mitarbeiterdokumentation und administrative HR-Nachverfolgung. Er hilft Teams, Informationen zu strukturieren und den Zeitaufwand für manuelle Dokumentenarbeit zu reduzieren.",
        "problemSolved": "HR-Teams verlieren Zeit durch das Sichten von Dokumenten, wiederkehrende Antworten und manuelle Nachverfolgung."
      },
      "compliance-agent": {
        "tagline": "Hilft, KI-Compliance, Risiken und Register zu strukturieren.",
        "description": "KI-Agent, der die Compliance-Dokumentation, interne Kontrollen, die Vorbereitung des KI-Registers und Maßnahmenpläne unterstützt. Besonders nützlich für Organisationen mit Verpflichtungen in den Bereichen Governance, Nachvollziehbarkeit und KI-Compliance.",
        "problemSolved": "Organisationen fehlt ein klarer Überblick über die KI-Compliance, die Dokumentation ist verstreut und KI-Risiken bleiben unkontrolliert."
      },
      "marketing-agent": {
        "tagline": "Erstellt Inhalte, Kampagnen und Marketing-Ideen.",
        "description": "KI-Agent, der Posts, E-Mails, Landingpage-Inhalte, Kampagnenideen, Zusammenfassungen und Marketing-Assets passend zum Unternehmensprofil generiert. Er hilft kleinen Teams, konsistenter zu veröffentlichen, ohne die Zahl der Tools zu erhöhen.",
        "problemSolved": "Marketing-Teams kämpfen mit der Konsistenz von Inhalten, zeitaufwendiger Erstellung und verstreuten Kampagnen-Assets."
      },
      "reporting-agent": {
        "tagline": "Erstellt Zusammenfassungen, Dashboards und Entscheidungsberichte.",
        "description": "KI-Agent, der interne Daten und Informationen in Zusammenfassungen, Berichte, Aktionspläne und entscheidungsreife Erkenntnisse umwandelt. Er hilft Führungskräften und Managern, einen klareren Überblick zu gewinnen, ohne Stunden mit der manuellen Konsolidierung von Informationen zu verbringen.",
        "problemSolved": "Manuelle Berichte dauern zu lange in der Erstellung, und Entscheidungsträgern fehlen prägnante Zusammenfassungen."
      },
      "audit-agent": {
        "tagline": "Unterstützt KI-Audit, Reifegradbewertung und Aktionspläne.",
        "description": "KI-Agent, der hilft, Audits zu strukturieren, Antworten zu analysieren, Risiken zu identifizieren und umsetzbare Empfehlungen zu erstellen. Er verbindet KI-Audit, Compliance und Geschäftstransformation zu einem praxisnahen Workflow.",
        "problemSolved": "KI-Audits sind zeitaufwendig, werden manuell ausgewertet und lassen sich schwer priorisieren."
      },
      "document-agent": {
        "tagline": "Klassifiziert, fasst zusammen und extrahiert Informationen aus Dokumenten.",
        "description": "KI-Agent, der Dokumente verarbeitet, wichtige Informationen extrahiert, Zusammenfassungen erstellt und Dateien organisiert. Nützlich für Organisationen, die mit vielen Anhängen, Verträgen, Berichten, HR-Akten, Finanzdokumenten oder Compliance-Nachweisen arbeiten.",
        "problemSolved": "Dokumente sind schlecht organisiert, langsam zu durchsuchen und teuer manuell zusammenzufassen."
      },
      "admin-agent": {
        "tagline": "Automatisiert die tägliche Verwaltungsarbeit.",
        "description": "Universeller KI-Agent für E-Mails, Termine, Follow-ups, Zusammenfassungen, Notizen, Aufgabenorganisation und tägliche administrative Workflows. Er hilft Gründern, selbstständigen Fachkräften und kleinen Teams, Zeit bei wiederkehrender operativer Arbeit zu sparen.",
        "problemSolved": "Verwaltungsarbeit kostet zu viel Zeit, Aufgaben sind repetitiv und die Organisation erfolgt manuell."
      }
    },
    "industries": {
      "all": "Alle",
      "b2b": "B2B",
      "construction": "Bauwesen",
      "consulting": "Beratung",
      "creator": "Creator",
      "ecommerce": "E-Commerce",
      "education": "Bildung",
      "enterprise": "Großunternehmen",
      "finance": "Finanzen",
      "healthcare": "Gesundheitswesen",
      "legal": "Recht",
      "public-sector": "Öffentlicher Sektor",
      "real-estate": "Immobilien",
      "retail": "Einzelhandel",
      "saas": "SaaS",
      "services": "Dienstleistungen"
    },
    "companySize": {
      "enterprise": "Großunternehmen",
      "sme": "KMU",
      "solo": "Solo"
    },
    "profile": {
      "high": "Hoch",
      "medium": "Mittel"
    },
    "complexity": {
      "high": "Hoch",
      "low": "Niedrig",
      "medium": "Mittel"
    },
    "model": {
      "subscription": "Abonnement"
    },
    "integrations": {
      "accounting": "Buchhaltung",
      "audit-ai": "Audit AI",
      "calendar": "Kalender",
      "cloud-storage": "Cloud-Speicher",
      "compliance-tools": "Compliance-Tools",
      "crm": "CRM",
      "dashboard": "Dashboard",
      "documents": "Dokumente",
      "email": "E-Mail",
      "helpdesk": "Helpdesk",
      "hris": "HRIS",
      "registry": "Register",
      "social-media": "Social Media",
      "spreadsheet": "Tabellenkalkulation",
      "website": "Website"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "Wie wird KI derzeit in Ihrer Organisation eingesetzt?",
        "options": {
          "none": "Wir nutzen noch keine KI",
          "individual": "Einzelne Personen nutzen KI individuell",
          "team": "Mehrere Teams nutzen KI-Tools",
          "structured": "KI wird in strukturierten Workflows eingesetzt"
        }
      },
      "process_automation": {
        "label": "Wie viel Ihrer wiederkehrenden Arbeit ist heute automatisiert?",
        "options": {
          "none": "Fast nichts ist automatisiert",
          "basic": "Einige einfache Aufgaben sind automatisiert",
          "moderate": "Einige wichtige Workflows sind automatisiert",
          "advanced": "Automatisierung gehört zum Tagesgeschäft"
        }
      },
      "data_readiness": {
        "label": "Wie gut sind Ihre Geschäftsdaten für die KI-Nutzung vorbereitet?",
        "options": {
          "scattered": "Daten sind verstreut und schwer zugänglich",
          "partial": "Einige Daten sind organisiert",
          "mostly_ready": "Die meisten wichtigen Daten sind strukturiert",
          "ready": "Daten sind sauber, zugänglich und regelmäßig aktualisiert"
        }
      },
      "compliance_awareness": {
        "label": "Wie gut sind Sie auf KI-Governance und Compliance vorbereitet?",
        "options": {
          "unknown": "Wir haben KI-Risiken noch nicht bewertet",
          "basic": "Wir kennen die KI-Risiken, haben aber keinen Prozess",
          "documented": "Einige KI-Anwendungsfälle sind dokumentiert",
          "governed": "Wir haben klare KI-Governance- und Prüfprozesse"
        }
      },
      "shadow_ai": {
        "label": "Wissen Sie, welche KI-Tools im gesamten Unternehmen genutzt werden?",
        "options": {
          "no_visibility": "Nein, wir haben keinen Überblick",
          "partial_visibility": "Wir kennen einige Tools, aber nicht alle",
          "mostly_visible": "Wir verfolgen die meisten KI-Tools",
          "full_inventory": "Wir führen ein klares Inventar der KI-Tools"
        }
      },
      "business_impact": {
        "label": "Wie klar messen Sie den geschäftlichen Nutzen von KI?",
        "options": {
          "not_measured": "Wir messen ihn noch nicht",
          "qualitative": "Wir haben nur qualitatives Feedback",
          "some_metrics": "Wir erfassen einige Zeit- oder Kosteneinsparungen",
          "clear_roi": "Wir messen ROI und Geschäftsergebnisse"
        }
      },
      "team_skills": {
        "label": "Wie sicher sind Ihre Teams im verantwortungsvollen Einsatz von KI?",
        "options": {
          "low": "Sehr begrenzte Sicherheit",
          "basic": "Grundlegende Vertrautheit",
          "good": "Gute Sicherheit bei gängigen Aufgaben",
          "strong": "Starke Praktiken für verantwortungsvolle KI"
        }
      },
      "implementation_priority": {
        "label": "Was ist derzeit Ihre wichtigste KI-Priorität?",
        "options": {
          "save_time": "Zeit bei wiederkehrender Arbeit sparen",
          "improve_sales": "Vertrieb oder Kundennachverfolgung verbessern",
          "support_customers": "Kundensupport verbessern",
          "compliance": "KI-Compliance und Governance verbessern",
          "documents": "Dokumente und Berichte schneller verarbeiten"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "Kundensupport",
    "sales": "Vertrieb und Lead-Nachverfolgung",
    "finance": "Finanzen und Rechnungsstellung",
    "documents": "Dokumente und Verträge",
    "reporting": "Reporting und Dashboards",
    "admin": "Administrative Arbeit",
    "compliance": "Compliance und Governance",
    "marketing": "Marketing und Content",
    "hr": "HR und Personalwesen"
  },
};
