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
};
