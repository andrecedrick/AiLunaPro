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
        "journeyCostSaved": "Geschätzte eingesparte Kosten ≈ ${amount}/Monat."
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
      "heading": "Wie möchten Sie starten?",
      "express": {
        "title": "Audit Express",
        "body": "Eine schnelle Momentaufnahme der KI-Bereitschaft in ca. 5 Minuten — ein paar kurze Fragen, eine optionale Website-Analyse, ein indikativer ROI. Ideal für einen ersten Eindruck.",
        "cta": "Audit Express starten →"
      },
      "full": {
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
};
