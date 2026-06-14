/** B6.0 — Spanish dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const es: Dict = {
  nav: {
    dashboard:             'Panel',
    'new-audit':           'Nueva auditoría',
    reports:               'Informes',
    'audit-history':       'Historial de auditorías',
    'audit-express-run':   'Ejecutar Audit Express',
    'audit-express-saved': 'Auditorías guardadas',
    registry:              'Registro de IA',
    'system-builder':      'Constructor de sistemas',
    agents:                'Agentes',
    team:                  'Equipo',
    settings:              'Ajustes',
    billing:               'Facturación',
    help:                  'Ayuda',
  },
  shell: {
    complianceSuite:  'Suite de cumplimiento',
    signOut:          'Cerrar sesión',
    workspaces:       'Espacios de trabajo',
    createWorkspace:  'Crear espacio de trabajo',
    searchWorkspaces: 'Buscar espacio…',
    language:         'Idioma',
    currency:         'Moneda',
  },
  settings: {
    title:               'Preferencias',
    themeTitle:          'Tema',
    themeHint:           'Elige el aspecto de AiLunaPro. Se aplica de inmediato.',
    light:               'Claro',
    dark:                'Oscuro',
    languageTitle:       'Idioma',
    languageHint:        'Se usa para las etiquetas de la interfaz y los correos. La traducción se implementa sección por sección; las áreas sin traducir permanecen en inglés.',
    currencyTitle:       'Moneda predeterminada',
    currencyHint:        'Solo preferencia de visualización. La facturación y los packs de tokens siguen en USD.',
    profileTitle:        'Perfil',
    profileHint:         'Ajusta el tono de la orientación y el recurso inicial recomendado. Nunca cambia la puntuación, los hallazgos ni ninguna correspondencia normativa.',
    notificationsTitle:  'Notificaciones por correo',
    notificationsHint:   'Elige qué correos recibes. La configuración del remitente llegará en una fase posterior.',
    weeklyDigest:        'Resumen semanal de cumplimiento',
    weeklyDigestDesc:    'Resumen de nuevos hallazgos y acciones resueltas cada lunes.',
    reportReady:         'Informe listo',
    reportReadyDesc:     'Avísame por correo cuando se genere un informe que solicité.',
    teamActivity:        'Actividad del equipo',
    teamActivityDesc:    'Invitaciones, cambios de rol y bajas de miembros en mis espacios de trabajo.',
    langToast:           'Idioma: {value}',
    currencyToast:       'Moneda: {value}',
    profileToast:        'Perfil: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Secciones de la auditoría",
      "questionCount": "{n} preguntas",
      "yes": "Sí",
      "no": "No"
    },
    "section": {
      "profile": {
        "title": "Perfil",
        "subtitle": "Tu organización de un vistazo"
      },
      "ai-tools": {
        "title": "Herramientas de IA",
        "subtitle": "¿Qué IA utiliza realmente tu organización?"
      },
      "data": {
        "title": "Datos",
        "subtitle": "¿Qué datos alimentan tus sistemas de IA?"
      },
      "governance": {
        "title": "Gobernanza",
        "subtitle": "Políticas, responsabilidad y rendición de cuentas"
      },
      "security": {
        "title": "Seguridad",
        "subtitle": "Protección de los sistemas de IA y sus datos"
      },
      "transparency": {
        "title": "Transparencia",
        "subtitle": "Divulgación y explicabilidad"
      },
      "human-oversight": {
        "title": "Supervisión humana",
        "subtitle": "Mantener a las personas en control"
      },
      "training-maturity": {
        "title": "Formación y madurez",
        "subtitle": "¿Qué nivel de alfabetización en IA tiene tu organización?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Nombre de la organización",
        "placeholder": "p. ej. Acme Corp"
      },
      "profile.industry": {
        "label": "Sector principal"
      },
      "profile.size": {
        "label": "Tamaño de la empresa"
      },
      "profile.region": {
        "label": "Región principal de operación"
      },
      "tools.categories": {
        "label": "¿Qué categorías de IA están en producción?",
        "helper": "Selecciona todas las que correspondan."
      },
      "tools.vendors": {
        "label": "Principales proveedores / productos de IA",
        "placeholder": "p. ej. OpenAI GPT-4, Anthropic Claude, modelo propio en AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Alcance del despliegue"
      },
      "tools.builds_custom": {
        "label": "¿Entrenas o ajustas tus propios modelos?"
      },
      "data.types": {
        "label": "¿Qué tipos de datos procesa la IA?"
      },
      "data.residency": {
        "label": "¿Dónde se almacenan principalmente los datos?"
      },
      "data.governance_framework": {
        "label": "¿Existe un marco documentado de gobernanza de datos?"
      },
      "data.sources": {
        "label": "Describe tus principales fuentes de datos",
        "placeholder": "p. ej. CRM, telemetría de producto, tickets de soporte al cliente, conjuntos de datos de terceros…"
      },
      "gov.committee": {
        "label": "¿Tienes un comité de gobernanza de IA o un responsable designado?"
      },
      "gov.written_policy": {
        "label": "¿Existe una política de IA escrita y aprobada por la dirección?"
      },
      "gov.frameworks": {
        "label": "¿Con qué marcos te alineas?"
      },
      "gov.structure": {
        "label": "Describe tu estructura de gobernanza",
        "placeholder": "¿Quién es responsable del riesgo de IA? ¿Cómo se escalan las decisiones?"
      },
      "sec.controls": {
        "label": "¿Qué controles de seguridad existen para los sistemas de IA?"
      },
      "sec.red_team": {
        "label": "¿Tus sistemas de IA han sido sometidos a red team o pruebas adversarias?"
      },
      "sec.incident_readiness": {
        "label": "¿Qué tan preparado estás ante un incidente específico de IA?"
      },
      "sec.review_process": {
        "label": "Describe tu proceso de revisión de seguridad para nuevos sistemas de IA"
      },
      "trans.disclosure": {
        "label": "¿Informas a los usuarios finales del uso de IA cuando interactúan con ella?"
      },
      "trans.cards": {
        "label": "¿Mantienes fichas de modelo (model cards) o de sistema (system cards)?"
      },
      "trans.explainability": {
        "label": "¿Qué tan explicables son tus decisiones de IA para los usuarios afectados?"
      },
      "trans.measures": {
        "label": "Describe tus medidas de transparencia",
        "placeholder": "Registro público de IA, divulgaciones dentro de la app, registros de auditoría disponibles para los usuarios…"
      },
      "over.model": {
        "label": "¿Qué modelo de supervisión describe mejor tu configuración?"
      },
      "over.escalation": {
        "label": "¿Los procedimientos de escalado están documentados para errores o daños de la IA?"
      },
      "over.review_categories": {
        "label": "¿Qué categorías de decisiones requieren revisión humana obligatoria?"
      },
      "over.processes": {
        "label": "Describe tus procesos de supervisión con tus propias palabras"
      },
      "train.staff_training": {
        "label": "¿Ofreces formación en alfabetización en IA al personal?"
      },
      "train.maturity": {
        "label": "Madurez de cumplimiento en IA autoevaluada"
      },
      "train.topics": {
        "label": "¿Qué temas cubre tu formación?"
      },
      "train.program": {
        "label": "Describe tu programa de formación (o lo que falta)"
      }
    },
    "option": {
      "profile.industry.finance": "Finanzas y banca",
      "profile.industry.health": "Salud y ciencias de la vida",
      "profile.industry.tech": "Tecnología / SaaS",
      "profile.industry.retail": "Comercio minorista y e-commerce",
      "profile.industry.public": "Sector público",
      "profile.industry.other": "Otro",
      "profile.size.xs": "1–10 empleados",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "Unión Europea",
      "profile.region.uk": "Reino Unido",
      "profile.region.us": "Estados Unidos",
      "profile.region.ca": "Canadá",
      "profile.region.apac": "Asia-Pacífico",
      "profile.region.global": "Global / multirregión",
      "tools.categories.llm": "Modelos de lenguaje grandes (chat, agentes, copilotos)",
      "tools.categories.ml": "ML clásico / modelos predictivos",
      "tools.categories.cv": "Visión por computadora",
      "tools.categories.speech": "Voz y audio",
      "tools.categories.rec": "Sistemas de recomendación",
      "tools.categories.rpa": "RPA / automatización con componentes de IA",
      "tools.scope.pilot": "Solo pilotos / experimentos",
      "tools.scope.internal": "Uso interno orientado al personal",
      "tools.scope.customer": "Funciones orientadas al cliente",
      "tools.scope.critical": "Decisiones críticas / reguladas",
      "data.types.pii": "Datos personales (PII)",
      "data.types.health": "Datos de salud",
      "data.types.financial": "Datos financieros / transaccionales",
      "data.types.biometric": "Datos biométricos",
      "data.types.children": "Datos de menores",
      "data.types.public": "Datos públicos / abiertos",
      "data.residency.eu": "UE / EEA",
      "data.residency.us": "Estados Unidos",
      "data.residency.mixed": "Mixto / multirregión",
      "data.residency.unknown": "No estoy seguro",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Ninguno formalmente",
      "sec.controls.encryption": "Cifrado en reposo y en tránsito",
      "sec.controls.rbac": "Control de acceso basado en roles",
      "sec.controls.audit_logs": "Registro de auditoría del acceso al modelo y las entradas",
      "sec.controls.secrets": "Gestión de secretos (sin claves codificadas)",
      "sec.controls.isolation": "Aislamiento de inquilinos / datos",
      "sec.incident_readiness.1": "1 — Sin plan",
      "sec.incident_readiness.2": "2 — Plan informal",
      "sec.incident_readiness.3": "3 — Documentado pero sin probar",
      "sec.incident_readiness.4": "4 — Documentado y ensayado",
      "sec.incident_readiness.5": "5 — Continuo, integrado con SOC",
      "trans.explainability.none": "No se ofrecen explicaciones",
      "trans.explainability.generic": "Solo divulgaciones genéricas",
      "trans.explainability.category": "Motivos a nivel de categoría",
      "trans.explainability.individual": "Explicaciones por decisión bajo solicitud",
      "trans.explainability.realtime": "Explicaciones en tiempo real, dentro del producto",
      "over.model.hitl": "Humano en el bucle (cada decisión se revisa)",
      "over.model.hotl": "Humano sobre el bucle (revisión por muestreo)",
      "over.model.oot": "Humano fuera del bucle (autónomo)",
      "over.review_categories.hr": "Decisiones de contratación / RR. HH.",
      "over.review_categories.credit": "Decisiones de crédito / financieras",
      "over.review_categories.health": "Recomendaciones relacionadas con la salud",
      "over.review_categories.content": "Resultados de moderación de contenido",
      "over.review_categories.legal": "Decisiones legales / de cumplimiento",
      "train.maturity.1": "1 — Inicial / ad hoc",
      "train.maturity.2": "2 — En desarrollo",
      "train.maturity.3": "3 — Definido",
      "train.maturity.4": "4 — Gestionado",
      "train.maturity.5": "5 — Optimizado",
      "train.topics.bias": "Sesgo y equidad",
      "train.topics.privacy": "Privacidad y protección de datos",
      "train.topics.security": "Seguridad de la IA y uso indebido",
      "train.topics.usage": "Políticas de uso aceptable",
      "train.topics.incident": "Respuesta a incidentes"
    }
  },
  results: {
    "insightCard": {
      "whatThisMeans": "Qué significa esto",
      "whyItMatters": "Por qué es importante",
      "howItPlaysOut": "Cómo se traduce en la práctica",
      "exampleHeading": "Ejemplo — cómo se beneficia una empresa similar",
      "illustrative": "(Ilustrativo.)",
      "doThisNext": "Haz esto a continuación",
      "doThisNextWithHeading": "Haz esto a continuación — {heading}",
      "onceDone": "Una vez hecho: {outcome}",
      "referencesPrefix": "Referencias: {refs}"
    },
    "explained": {
      "heading": "Qué significan tus resultados",
      "subtitle": "Cada elemento a continuación explica qué encontramos, por qué importa y el siguiente paso más rápido — con los puntos de puntuación que puedes recuperar.",
      "emptyTitle": "Sin brechas detectadas — base sólida",
      "emptyWhatItMeans": "Tus respuestas no generaron ningún hallazgo — tu práctica de IA ya cubre los aspectos básicos que verificamos.",
      "emptyWhyItMatters": "Es una base sólida. Las próximas mejoras vienen de operar estos controles de forma constante y a escala.",
      "emptyFlowInput": "buenas prácticas",
      "emptyFlowProcess": "conviértelas en rutina",
      "emptyFlowOutput": "controles constantes",
      "emptyFlowGain": "confianza duradera y escalable",
      "emptyExample": "Los equipos en este punto pasan de “lo hacemos” a “esto funciona solo” — automatizando las partes manuales. (Ilustrativo.)",
      "emptyDoNextHeading": "Escálalo",
      "emptyDoNextStep1": "Automatiza los controles que hoy ejecutas a mano.",
      "emptyDoNextStep2": "Vuelve a auditar periódicamente para mantener el nivel.",
      "ctaSeeAgentsForThis": "Ver agentes que pueden hacer esto",
      "ctaSeeRecommendedAgents": "Ver agentes recomendados",
      "ctaOpenDesignGuide": "Abrir la guía de diseño",
      "ptsToRecover": "−{n} pts por recuperar",
      "priorityCritical": "Prioridad: Crítica",
      "priorityHigh": "Prioridad: Alta",
      "priorityMedium": "Prioridad: Media",
      "priorityLow": "Prioridad: Baja",
      "effortBadge": "Esfuerzo: {effort}",
      "effortBadgeDefault": "Esfuerzo: medio",
      "timeframeBadge": "~{days} días",
      "timeframeBadgeDefault": "~30 días"
    },
    "findings": {
      "title": "Hallazgos",
      "total": "{n} en total",
      "empty": "✓ No se detectaron hallazgos. Sigue desarrollando tu madurez con las recomendaciones de la derecha.",
      "severityCritical": "Crítica",
      "severityHigh": "Alta",
      "severityMedium": "Media",
      "severityLow": "Baja",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} recomendación{plural}"
    },
    "recommendations": {
      "title": "Recomendaciones",
      "actionsCount": "{n} acciones",
      "starterResource": "Recurso inicial recomendado",
      "empty": "No hay recomendaciones accionables en este momento.",
      "impactCritical": "Impacto crítico",
      "impactHigh": "Impacto alto",
      "impactMedium": "Impacto medio",
      "impactLow": "Impacto bajo",
      "timeframeDays": "{n}d",
      "addressesFindings": "aborda {count} hallazgo{plural}"
    },
    "actionPlan": {
      "title": "Plan de acción priorizado",
      "roadmapNote": "La hoja de ruta muestra cuándo lanzar; el Plan de acción muestra qué corregir primero.",
      "bandCriticalTitle": "Crítico",
      "bandImportantTitle": "Importante",
      "bandImportantSubtitle": "Corto plazo — abordar en el trimestre actual.",
      "bandImprovementTitle": "Mejora",
      "bandImprovementSubtitle": "Buena práctica — programar para la madurez.",
      "itemCount": "{n} elemento{plural}",
      "bandEmpty": "Sin elementos en esta categoría — nada accionable aquí por ahora.",
      "moreNotShown": "+{n} más no mostrados",
      "impactPill": "Impacto",
      "effortPill": "Esfuerzo",
      "expectedOutcome": "Resultado esperado —"
    }
  },
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "¿Qué área te gustaría mejorar más?",
          "opt": {
            "support": "Atención al cliente",
            "sales": "Ventas",
            "finance": "Finanzas",
            "documents": "Documentos",
            "reporting": "Informes",
            "admin": "Administración",
            "compliance": "Cumplimiento",
            "marketing": "Marketing",
            "hr": "RR. HH."
          }
        },
        "monthlyHours": {
          "label": "¿Cuántas horas al mes dedicas aproximadamente al trabajo repetitivo?",
          "opt": {
            "low": "Pocas (~20)",
            "medium": "Bastantes (~80)",
            "high": "Muchas (~160)"
          }
        },
        "hourlyCost": {
          "label": "¿Coste medio aproximado por hora de ese trabajo?",
          "opt": {
            "low": "Más bajo (~$25)",
            "medium": "Medio (~$45)",
            "high": "Más alto (~$75)"
          }
        },
        "aiUsage": {
          "label": "¿Cómo se usa la IA en tu organización hoy?",
          "opt": {
            "none": "Todavía no",
            "individual": "De forma individual",
            "team": "Entre equipos",
            "structured": "En flujos de trabajo estructurados"
          }
        },
        "shadowAi": {
          "label": "¿Qué visibilidad tienes sobre las herramientas de IA en uso?",
          "opt": {
            "no_visibility": "Ninguna",
            "partial_visibility": "Algo",
            "mostly_visible": "La mayoría",
            "full_inventory": "Inventario completo"
          }
        }
      },
      "run": {
        "title": "Ejecutar Audit Express",
        "subtitle": "Una instantánea rápida y solo estimativa de tu preparación para la IA, guardada automáticamente en tu espacio de trabajo.",
        "errPreviewCode": "No se pudo ejecutar la vista previa ({code}).",
        "errPreview": "No se pudo ejecutar la vista previa.",
        "errAnalysisCode": "Análisis no disponible ({code}).",
        "errAnalysis": "Análisis no disponible. Inténtalo de nuevo.",
        "errDocCode": "Análisis de documento no disponible ({code}).",
        "errDoc": "Análisis de documento no disponible. Inténtalo de nuevo.",
        "analyzeSiteTitle": "Analizar un sitio web público (opcional)",
        "analyzeSiteHint": "Lee solo páginas públicas, respeta robots.txt. Enriquece “Qué hace este negocio”.",
        "deepScan": "Escaneo profundo (más lento, más páginas)",
        "saving": "Guardando tu resultado…",
        "journeyHeadline": "Esto es lo que significa tu instantánea",
        "journeyReadiness": "Preparación para la IA: {bucket} ({score}/100).",
        "journeyTimeSaved": "Tiempo ahorrado estimado ≈ {hours} horas/mes.",
        "journeyCostSaved": "Coste ahorrado estimado ≈ ${amount}/mes."
      },
      "cta": {
        "computing": "Calculando…",
        "getPreview": "Obtener vista previa",
        "analyzing": "Analizando…",
        "analyzeSite": "Analizar sitio",
        "preparing": "Preparando…",
        "downloadPdf": "Descargar PDF",
        "viewSaved": "Ver auditorías guardadas",
        "seeAgents": "Ver agentes adaptados a tu auditoría →",
        "runFullAudit": "Ejecutar una auditoría completa",
        "extracting": "Extrayendo…",
        "analyzeDocument": "Analizar documento →",
        "save": "Guardar",
        "cancel": "Cancelar"
      },
      "result": {
        "snapshotHeading": "Tu instantánea · Preparación para la IA: {bucket} ({score}/100)",
        "whatThisMeans": "Qué significa esto",
        "opportunityLabel": "La oportunidad — rangos indicativos",
        "timeBack": "Tiempo recuperado",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Impacto en costes",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Amortización",
        "howSavingLabel": "Cómo se produce el ahorro",
        "flowRepetitive": "tareas repetitivas",
        "flowAssisted": "asistido / automatizado",
        "flowSameWork": "el mismo trabajo, menos tiempo manual",
        "flowHoursBack": "horas recuperadas para trabajo de mayor valor",
        "roiUnavailable": "Estimación de ROI no disponible para esta auditoría.",
        "whatToDoFirst": "Qué hacer primero",
        "step1": "Elige una tarea de gran volumen (respuestas de soporte, registro de facturas, informes).",
        "step2": "Prueba un asistente en ella durante ~2 semanas.",
        "step3": "Mide las horas antes/después — conserva lo que se amortiza.",
        "businessHeading": "Qué hace este negocio",
        "businessType": "Tipo:",
        "businessAudience": "Audiencia:",
        "businessConfidence": "confianza {confidence}",
        "businessUnknown": "desconocido",
        "offers": "Ofrece: {list}",
        "automationHeading": "Oportunidades de automatización",
        "opportunityItem": "{title} — impacto {impact} / esfuerzo {effort}"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Tendencia de la puntuación",
      "subtitle": "Puntuación de madurez de IA a lo largo del tiempo",
      "empty": {
        "title": "Las tendencias aparecen tras varias auditorías",
        "hint": "Una vez que hayas enviado varias auditorías en este espacio de trabajo, tu puntuación de madurez de IA se representará aquí a partir de tu historial real."
      }
    },
    "automation": {
      "title": "Oportunidades de automatización",
      "subtitle": "Adaptadas a tu uso de la IA",
      "empty": {
        "title": "Realiza una auditoría para obtener oportunidades personalizadas",
        "hint": "Las oportunidades de automatización se derivan de tus respuestas de auditoría y de tu registro de IA. Completa una auditoría y añade tus herramientas de IA para ver sugerencias aquí."
      }
    },
    "businessImpact": {
      "title": "Impacto empresarial",
      "subtitle": "Resultados medidos de tu programa de cumplimiento",
      "empty": {
        "title": "Las métricas de impacto aparecen a medida que tu programa madura",
        "hint": "Realiza auditorías a lo largo del tiempo para crear un historial. La reducción de riesgos, el progreso de la gobernanza y el tiempo ahorrado se calcularán a partir de tu historial real, sin estimaciones."
      }
    },
    "recentReports": {
      "title": "Informes recientes",
      "countOne": "{n} informe generado",
      "countOther": "{n} informes generados",
      "viewAll": "Ver todos →",
      "empty": {
        "title": "Aún no hay informes",
        "hint": "Genera un informe a partir de una auditoría enviada: aparecerá aquí y en Informes para este espacio de trabajo."
      }
    },
    "kpi": {
      "auditsSubmitted": "Auditorías enviadas",
      "reportsGenerated": "Informes generados",
      "aiToolsRegistered": "Herramientas de IA registradas",
      "loadErrorSuffix": " — no se pudo cargar"
    },
    "maturity": {
      "rung": {
        "initial": "Inicial",
        "managed": "Gestionado",
        "defined": "Definido",
        "advanced": "Avanzado",
        "optimal": "Óptimo"
      }
    },
    "cta": {
      "poweredBy": "Con tecnología de Luna AI",
      "scheduleDemo": "Programar demo",
      "startFreeTrial": "Iniciar prueba gratuita →"
    }
  },
  topbar: {
    "title": {
      "dashboard": "Panel",
      "audit/new": "Nueva auditoría",
      "audit/result": "Resultado de la auditoría",
      "audit/assistance": "Guía de implementación",
      "audit/history": "Historial de auditorías",
      "reports": "Informes",
      "reports/detail": "Informe",
      "reports/share": "Informe compartido",
      "registry": "Registro de IA",
      "system-builder": "Constructor de sistemas",
      "agents": "Agentes",
      "agents/detail": "Agente",
      "team": "Equipo",
      "settings": "Configuración",
      "billing": "Facturación",
      "billing/tokens": "Tokens",
      "help": "Ayuda",
      "audit-express/run": "Ejecutar Audit Express",
      "audit-express/saved": "Auditorías guardadas",
      "audit-express/detail": "Auditoría guardada"
    },
    "subtitle": {
      "dashboard": "Resumen de cumplimiento de IA"
    },
    "search": {
      "placeholder": "Buscar auditorías, informes…",
      "toast": "Buscando \"{query}\"…"
    },
    "dateRange": {
      "last7": "Últimos 7 días",
      "last30": "Últimos 30 días",
      "thisMonth": "Este mes",
      "lastMonth": "Mes pasado",
      "customRange": "Intervalo personalizado…",
      "from": "Desde",
      "to": "Hasta",
      "apply": "Aplicar intervalo",
      "toast": "Intervalo de fechas: {label}",
      "errPickBoth": "Seleccione una fecha de inicio y una de fin.",
      "errOrder": "La fecha de inicio debe ser anterior a la fecha de fin."
    },
    "notifications": {
      "label": "Notificaciones",
      "title": "Notificaciones",
      "empty": "Aún no hay notificaciones."
    },
    "tokens": {
      "aria": "Quedan {n} tokens — gestionar tokens",
      "title": "Quedan {n} tokens · haga clic para gestionar",
      "balance": "{used} / {total}",
      "corruptTitle": "El saldo de tokens contiene datos no válidos — haga clic para reparar",
      "corruptLabel": "Los tokens necesitan reparación"
    },
    "luna": {
      "aria": "Abrir Luna, su guía",
      "title": "Luna — su guía",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Cambiar al modo oscuro",
      "toLight": "Cambiar al modo claro"
    },
    "newAudit": {
      "label": "Nueva auditoría",
      "denied": "Su rol no permite crear auditorías. Las auditorías son para Propietario, Administrador y Miembro."
    },
    "sidebar": {
      "openMenu": "Abrir el menú de navegación",
      "closeMenu": "Cerrar el menú de navegación",
      "menu": "Menú",
      "expand": "Expandir la barra lateral",
      "collapse": "Contraer la barra lateral"
    }
  },
  auditForm: {
    "title": "Nueva auditoría",
    "subtitle": "Complete 8 secciones para evaluar su postura de cumplimiento de IA. Su progreso se guarda a medida que avanza — puede salir y volver en cualquier momento.",
    "loading": "Cargando auditoría…",
    "forbiddenTitle": "Su rol no permite crear auditorías",
    "forbiddenBody": "Las auditorías están disponibles para los roles de Propietario, Administrador y Miembro. Consulte a un propietario o administrador del espacio de trabajo si necesita acceso a las auditorías.",
    "errorLoad": "No se pudo cargar la auditoría. Actualice para reintentar.",
    "pageTitle": "Nueva auditoría",
    "pageIntro": "Complete 8 secciones para evaluar su postura de cumplimiento de IA. Su progreso se guarda a medida que avanza — puede salir y volver en cualquier momento.",
    "stepOf": "Paso {current} de {total}",
    "overallProgress": "Progreso general",
    "previous": "← Anterior",
    "saveDraft": "Guardar borrador",
    "saveContinue": "Guardar y continuar →",
    "submit": "Enviar auditoría ✓",
    "saved": "✓ Guardado"
  },
  settingsPages: {
    "shell": {
      "title": "Configuración",
      "subtitle": "Gestione su perfil, organización y preferencias."
    },
    "tabs": {
      "profile": "Perfil",
      "org": "Organización",
      "preferences": "Preferencias",
      "billing": "Facturación"
    },
    "profile": {
      "sectionTitle": "Perfil",
      "avatarHint": "El avatar se genera a partir de sus iniciales. La carga personalizada llegará más adelante.",
      "displayName": "Nombre para mostrar",
      "displayNamePlaceholder": "Su nombre completo",
      "email": "Correo electrónico",
      "emailPlaceholder": "usted@ejemplo.com",
      "emailVerificationTitle": "Verificación del correo electrónico",
      "emailVerified": "✓ Su correo electrónico está verificado.",
      "sendVerification": "Enviar correo de verificación",
      "sendingVerification": "Enviando…",
      "passwordTitle": "Contraseña",
      "passwordHint": "Le enviaremos un enlace de restablecimiento a su correo electrónico. El enlace caduca después de una hora.",
      "sendPasswordReset": "Enviar correo de restablecimiento de contraseña",
      "sendingReset": "Enviando…",
      "savedToast": "Perfil actualizado."
    },
    "org": {
      "sectionTitle": "Organización",
      "fallbackName": "Espacio de trabajo",
      "nameLabel": "Nombre de la organización",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Solo el propietario del espacio de trabajo puede renombrar o eliminar la organización.",
      "planTitle": "Plan",
      "dangerZoneTitle": "Zona de peligro",
      "dangerZoneHint": "Eliminar una organización borra todos sus datos: auditorías, informes, registro y miembros del equipo. Esta acción no se puede deshacer.",
      "deleteButton": "Eliminar organización…",
      "deleteDialogTitle": "¿Eliminar \"{name}\"?",
      "deleteDialogBody1": "Esto eliminará de forma permanente la organización, todas sus auditorías, informes, elementos del registro y membresías del equipo.",
      "deleteDialogBody2": "Se le pedirá que confirme una vez más antes de que se toque cualquier dato.",
      "deleteConfirmLabel": "Lo entiendo, continuar",
      "renamedToast": "Organización renombrada.",
      "deletionDeferredToast": "La eliminación de organizaciones se habilitará en un paso posterior del backend."
    },
    "billing": {
      "sectionTitle": "Facturación",
      "checkingAccess": "Comprobando el acceso…"
    }
  },
  common: {
    "saveChanges": "Guardar cambios",
    "saving": "Guardando…",
    "cancel": "Cancelar",
    "loading": "Cargando…",
    "save": "Guardar",
    "confirm": "Confirmar",
    "close": "Cerrar",
    "tryAgain": "Intentar de nuevo",
    "reloadPage": "Recargar la página",
    "retryNow": "Reintentar ahora",
    "reload": "Recargar",
    "somethingWentWrong": "Algo salió mal",
    "couldntLoadThePage": "No se pudo cargar la página",
    "stillConnecting": "Conectando todavía…"
  },
  journey: {
    "label": {
      "choice": "Elegir",
      "audit": "Auditar",
      "understanding": "Comprender",
      "adoption": "Adoptar"
    },
    "hint": {
      "choice": "Elija cómo empezar — Audit Express para una instantánea rápida, o una Nueva auditoría para mayor profundidad.",
      "audit": "Complete su auditoría — le explicaremos qué significa y qué hacer a continuación.",
      "understanding": "Esto es lo que significa su auditoría. Revise las conclusiones y luego elija el siguiente paso."
    },
    "progress": {
      "ariaLabel": "Progreso del recorrido guiado"
    },
    "chooseAuditType": "Elegir tipo de auditoría →",
    "dismissAriaLabel": "Descartar el recorrido guiado",
    "dismiss": "Descartar",
    "next": {
      "whatNext": "¿Qué le gustaría hacer a continuación?",
      "recommendedTag": "Recomendado",
      "backToDashboard": "Volver al panel",
      "cta": {
        "agents": {
          "title": "Ver agentes recomendados",
          "body": "Herramientas ajustadas a su auditoría que pueden ahorrar tiempo en el trabajo que señaló."
        },
        "billing": {
          "title": "Explorar la membresía",
          "body": "Planes, tokens y lo que se incluye — adopte a su propio ritmo."
        },
        "systemBuilder": {
          "title": "Abrir el Constructor de sistemas",
          "body": "Una guía de solo lectura para diseñar su sistema de IA a través de seis dimensiones."
        }
      }
    },
    "start": {
      "greetingTitle": "Hola, soy Luna — empecemos.",
      "greetingBody": "Elija cómo le gustaría empezar. Puede cambiar en cualquier momento y siempre puede ir directamente a su panel.",
      "heading": "¿Cómo quiere empezar?",
      "express": {
        "title": "Audit Express",
        "body": "Una instantánea rápida de preparación para la IA de unos 5 minutos — unas pocas preguntas rápidas, un análisis opcional del sitio web y un ROI indicativo. Ideal para un primer vistazo.",
        "cta": "Iniciar Audit Express →"
      },
      "full": {
        "title": "Nueva auditoría (completa)",
        "body": "El cuestionario estructurado completo — una evaluación más profunda de cumplimiento y madurez que puede convertir en un informe compartible. Ideal para una evaluación exhaustiva.",
        "cta": "Crear una nueva auditoría →"
      },
      "skip": "Omitir — ir directamente a mi panel"
    }
  },
  auth: {
    "login": {
      "title": "Iniciar sesión",
      "subtitle": "Bienvenido de nuevo a AiLunaPro",
      "forgotPassword": "¿Olvidó su contraseña?",
      "signingIn": "Iniciando sesión…",
      "signInButton": "Iniciar sesión",
      "noAccountPrompt": "¿No tiene una cuenta?",
      "signUpLink": "Registrarse"
    },
    "field": {
      "emailAddress": "Dirección de correo electrónico",
      "password": "Contraseña",
      "fullName": "Nombre completo",
      "workEmail": "Correo electrónico del trabajo"
    },
    "placeholder": {
      "email": "usted@empresa.com",
      "fullName": "Sofía Martín"
    },
    "signup": {
      "title": "Cree su cuenta",
      "subtitle": "Comience su recorrido de cumplimiento de IA",
      "passwordHint": "Mínimo 8 caracteres",
      "creatingAccount": "Creando cuenta…",
      "createAccountButton": "Crear cuenta",
      "haveAccountPrompt": "¿Ya tiene una cuenta?",
      "signInLink": "Iniciar sesión"
    },
    "forgot": {
      "title": "Restablecer contraseña",
      "subtitleSent": "Revise su bandeja de entrada para encontrar un enlace de restablecimiento.",
      "subtitle": "Introduzca su correo electrónico y le enviaremos un enlace de restablecimiento.",
      "sentDetail": "Revise su carpeta de correo no deseado si no llega.",
      "backToSignIn": "← Volver a iniciar sesión",
      "sending": "Enviando…",
      "sendResetLink": "Enviar enlace de restablecimiento",
      "rememberPrompt": "¿Recuerda su contraseña?",
      "signInLink": "Iniciar sesión"
    },
    "invite": {
      "titleParsing": "Leyendo la invitación…",
      "titleAuthRequired": "Inicie sesión para aceptar",
      "titleVerifying": "Verificando la invitación…",
      "titleAccepting": "Añadiéndolo al espacio de trabajo…",
      "titleDone": "¡Bienvenido al equipo!",
      "titleError": "Problema con la invitación",
      "authRequiredBody": "Inicie sesión o cree una cuenta para aceptar esta invitación.",
      "redirecting": "Redirigiendo…",
      "pleaseWait": "Espere un momento, por favor.",
      "createAccountButton": "Crear cuenta",
      "signInButton": "Iniciar sesión",
      "backToDashboard": "Volver al panel"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "Centro de ayuda",
      "subtitle": "Encuentra respuestas, aprende flujos de trabajo y soluciona problemas habituales.",
      "onThisPage": "En esta página",
      "tocAria": "Secciones de ayuda",
      "keyTakeaways": "Puntos clave",
      "needMoreHelpTitle": "¿Necesitas más ayuda?",
      "needMoreHelpBody": "Contacta con el propietario de tu espacio de trabajo o con el soporte de AiLunaPro."
    },
    "gettingStarted": {
      "title": "Primeros pasos",
      "lede": "AiLunaPro es una suite de cumplimiento y transformación de IA para organizaciones que adoptan IA: auditorías, un registro de IA, recomendaciones de agentes, estimaciones de ROI y un modelo de uso basado en tokens, todo en un mismo espacio de trabajo.",
      "take1": "Empieza desde el panel y, a continuación, ejecuta una Nueva auditoría desde la barra lateral.",
      "take2": "Dos herramientas públicas no requieren inicio de sesión: Diagnóstico Express y la Calculadora de ROI.",
      "take3": "Los propietarios y administradores invitan a compañeros de equipo con enlaces de 7 días.",
      "firstActionsTitle": "Tus tres primeras acciones",
      "fa1": "Abre el panel y revisa tu puntuación actual de madurez en IA.",
      "fa2": "Ejecuta una Nueva auditoría desde la barra lateral para registrar tu uso de IA y tus riesgos.",
      "fa3": "Explora el catálogo de Agentes para ver qué agentes de AiLunaPro encajan con tu flujo de trabajo.",
      "leadMagnetsTitle": "Recursos públicos de captación",
      "lm1": "Diagnóstico Express: una evaluación gratuita de madurez en IA con 8 preguntas, sin necesidad de cuenta.",
      "lm2": "Calculadora de ROI: estima el tiempo y el dinero que tu equipo puede ahorrar con los agentes de AiLunaPro.",
      "publicLinks": "Puedes encontrar ambas en `#/diagnostic` y `#/roi-calculator`. Comparte estos enlaces con tus colegas: no requieren inicio de sesión.",
      "inviteTitle": "Invitar a compañeros de equipo",
      "inviteBody": "Los propietarios y administradores pueden invitar a compañeros de equipo desde la página de Equipo en la barra lateral. Cada persona invitada recibe un enlace válido durante 7 días. Los roles se asignan en el momento de la invitación.",
      "flowTitle": "Cómo fluye",
      "flowStep1": "Nueva auditoría",
      "flowStep2": "Enviar auditoría",
      "flowStep3": "Auditoría guardada + puntuación",
      "flowStep4": "Generar informe",
      "flowStep5": "Lista de informes",
      "flowCaption": "De la auditoría a una instantánea de informe que se puede compartir"
    },
    "auditVsReport": {
      "title": "Auditoría vs Informe",
      "inShortTitle": "En resumen",
      "inShort1": "Una **Auditoría** registra tus respuestas y calcula tu puntuación.",
      "inShort2": "Un **Informe** es una **instantánea** de una auditoría, creada intencionadamente para compartir o archivar.",
      "calloutSubmit": "**Al enviar se guarda tu auditoría + puntuación.** Un **Informe** es una instantánea, creada solo cuando haces clic en **Generar informe**.",
      "whatIsAuditTitle": "¿Qué es una Auditoría?",
      "wa1": "Tus respuestas a preguntas estructuradas.",
      "wa2": "Tu puntuación de cumplimiento / madurez.",
      "wa3": "Un análisis dinámico que puede evolucionar con las reglas de puntuación.",
      "calloutEditable": "Una auditoría permanece editable hasta que generas un informe.",
      "whatIsReportTitle": "¿Qué es un Informe?",
      "wr1": "Una instantánea congelada en un momento concreto.",
      "wr2": "Creado solo al hacer clic en **Generar informe**.",
      "wr3": "Estable incluso si ejecutas nuevas auditorías más adelante. Exportable y compartible, listado en **Informes** para el espacio de trabajo activo.",
      "flowStep1": "Enviar auditoría",
      "flowStep2": "Auditoría guardada",
      "flowStep3": "¿Generar informe?",
      "flowStep4": "Instantánea de informe",
      "flowStep5": "Lista de informes",
      "flowCaption": "Un informe se crea solo con Generar informe",
      "calloutFlow": "**Enviar auditoría** → guarda la auditoría + puntuación. **Generar informe** → crea una instantánea visible en *Informes*.",
      "closing": "En la barra lateral hay disponible una vista de **Historial de auditorías** (distinta de Informes). *Próximamente:* informe automático opcional al enviar."
    },
    "reportsWorkspaces": {
      "title": "Informes y espacios de trabajo",
      "p1": "Los informes son **por espacio de trabajo**, no globales. La lista de Informes muestra solo los informes del espacio de trabajo **activo**.",
      "flowStep1": "Espacio de trabajo A → sus informes",
      "flowStep2": "Espacio de trabajo B → sus informes",
      "flowCaption": "Cada espacio de trabajo mantiene sus propios informes",
      "calloutWarn": "¿No ves un informe antiguo? Probablemente pertenece a **otro espacio de trabajo**. Cambia de espacio de trabajo desde el selector situado en la parte superior de la barra lateral.",
      "calloutNote": "El filtro de fechas del panel **no** afecta a la lista de Informes."
    },
    "fillingAudit": {
      "title": "Cómo rellenar la auditoría correctamente",
      "p1": "Unos buenos datos de entrada generan una auditoría creíble. Tómate un minuto para responder con sinceridad: el resultado refleja lo que introduces.",
      "calloutInfo": "Los campos de texto libre **«Describe…»** añaden contexto. Tu **puntuación procede de las preguntas estructuradas (de elección)**, no del texto libre. Usa información clara, real y legible para obtener un informe creíble.",
      "li1": "Responde a todas las preguntas estructuradas: impulsan la puntuación y los hallazgos.",
      "li2": "Usa los campos de texto libre para aportar contexto real (responsables, herramientas, procesos), no texto de relleno.",
      "li3": "Vuelve a ejecutar la auditoría a medida que evolucionan tus prácticas para hacer un seguimiento del progreso."
    },
    "agents": {
      "title": "Agentes de IA",
      "lede": "El catálogo de Agentes lista diez agentes de IA listos para usar en flujos de trabajo empresariales habituales. Cada tarjeta muestra una descripción, el ROI previsto, un plan mínimo recomendado y un enlace para empezar.",
      "take1": "Diez agentes propios, cada uno etiquetado como AiLunaPro.",
      "take2": "Una insignia de plan (Starter+ / Professional+ / Enterprise+) sugiere el nivel habitual.",
      "take3": "«Obtener este agente» inicia el flujo de registro estándar, todavía sin compra dentro de la aplicación.",
      "catalogTitle": "Catálogo (10 agentes)",
      "cat1": "automatiza las respuestas a clientes y reduce la carga de soporte.",
      "cat2": "cualifica prospectos y prepara seguimientos comerciales.",
      "cat3": "ayuda con facturas, presupuestos y cobros.",
      "cat4": "ayuda a los equipos de RR. HH. con la criba, los resúmenes y la documentación.",
      "cat5": "ayuda a estructurar el cumplimiento, los riesgos y los registros de IA.",
      "cat6": "genera contenido, campañas e ideas de marketing.",
      "cat7": "crea resúmenes, paneles e informes de decisión.",
      "cat8": "apoya la auditoría de IA, la evaluación de madurez y los planes de acción.",
      "cat9": "clasifica, resume y extrae información de documentos.",
      "cat10": "automatiza el trabajo administrativo diario.",
      "sourceBadgeTitle": "Insignia de origen",
      "sourceBadgeBody": "Los agentes se etiquetan como **AiLunaPro** cuando son propios. Las versiones futuras mostrarán alternativas externas con su propia insignia.",
      "planBadgeTitle": "Insignia de plan",
      "planBadgeBody": "Cada tarjeta muestra una insignia de plan mínimo (Starter+, Professional+, Enterprise+). Indica el nivel de suscripción recomendado para un uso habitual.",
      "getAgentTitle": "Obtener este agente",
      "getAgentBody": "Haz clic en el botón \"Obtener este agente\" para iniciar la incorporación. Los agentes aún no se pueden comprar directamente dentro de AiLunaPro: el enlace te lleva a través del flujo de registro estándar."
    },
    "tokens": {
      "title": "Tokens",
      "intro": "Los tokens son la unidad de consumo de IA dentro de AiLunaPro. Cada auditoría, recomendación o llamada a un agente utiliza tokens de la asignación mensual de tu espacio de trabajo.",
      "howTitle": "Cómo funcionan los tokens",
      "how1": "Tu suscripción incluye una asignación mensual de tokens acorde con el plan.",
      "how2": "En cada ciclo, tu saldo se renueva. Una pequeña transferencia (limitada a una asignación mensual) se traslada al siguiente para evitar perder tokens sin usar.",
      "how3": "Si tu saldo baja, puedes comprar un paquete de recarga en cualquier momento.",
      "how4": "Los tokens de recarga se añaden a tu saldo y nunca caducan.",
      "how5": "Las recargas complementan tu suscripción: no la sustituyen.",
      "packsTitle": "Paquetes de recarga",
      "packsBody": "Hay tres paquetes disponibles: Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). Los paquetes de tokens se facturan actualmente en USD.",
      "balanceTitle": "Dónde ver tu saldo",
      "balanceBody": "La insignia de tokens en la barra superior muestra tu saldo actual y tu asignación mensual. Haz clic en ella para abrir la página de Tokens, donde verás el historial de uso completo y podrás comprar una recarga.",
      "runOutTitle": "Cuando se agotan los tokens",
      "runOutBody": "Las acciones de IA que necesitan más tokens de los que tienes en el saldo muestran un mensaje claro de \"no hay tokens suficientes\" y un enlace para comprar una recarga. Los propietarios, administradores y gestores de facturación pueden comprar paquetes. Los miembros pueden ver los saldos, pero no comprar."
    },
    "billing": {
      "title": "Facturación",
      "lede": "AiLunaPro ofrece los planes Free, Starter, Professional y Enterprise, que se diferencian por la asignación de tokens, el volumen de auditorías y las capacidades de equipo. El pago y la gestión se realizan a través de Stripe.",
      "take1": "La facturación y los paquetes de tokens son en USD; el selector de moneda es solo de visualización por ahora.",
      "take2": "Los propietarios/administradores se suscriben y gestionan los planes desde la página de Facturación (Portal de Clientes de Stripe).",
      "take3": "El plan Free incluye auditorías limitadas y 100 tokens al mes.",
      "currencyTitle": "Moneda",
      "currencyBody": "La facturación y los paquetes de tokens son actualmente en USD. El selector de moneda de la barra lateral es solo una preferencia de visualización. Todavía no cambia la moneda del pago en Stripe ni el precio de los paquetes de tokens. La facturación multidivisa está prevista para una versión futura.",
      "subscribingTitle": "Suscribirse",
      "subscribingBody": "Desde la página de Facturación, los propietarios y administradores pueden elegir un plan y completar el pago a través de Stripe. La suscripción se activa de inmediato tras un pago correcto y tu asignación de tokens se actualiza automáticamente.",
      "manageTitle": "Gestionar tu suscripción",
      "manageBody": "El botón \"Gestionar suscripción\" abre el Portal de Clientes de Stripe, donde puedes actualizar tu método de pago, cambiar de plan, ver facturas o cancelar. La cancelación surte efecto al final del periodo actual.",
      "invoicesTitle": "Facturas",
      "invoicesBody": "Las facturas aparecen en la página de Facturación tras cada renovación. Haz clic en Ver o PDF para descargar una copia.",
      "freeTitle": "Plan Free",
      "freeBody": "El plan Free ofrece acceso limitado a auditorías y 100 tokens al mes. Úsalo para explorar el producto antes de suscribirte."
    },
    "diagnostic": {
      "title": "Diagnóstico Express",
      "intro": "Diagnóstico Express es una evaluación gratuita de 8 preguntas que te ofrece una puntuación de madurez en IA de 0 a 100, junto con una breve lista de agentes de AiLunaPro recomendados.",
      "accessTitle": "Dónde acceder",
      "accessBody": "Abre `#/diagnostic` en tu navegador. No requiere inicio de sesión. Tarda unos dos minutos. Puedes compartir el enlace con tus colegas.",
      "getTitle": "Qué obtienes",
      "get1": "Una puntuación normalizada de 0 a 100.",
      "get2": "Un nivel de madurez: Emergente, En desarrollo o Avanzado.",
      "get3": "Tres agentes recomendados adaptados a tu etapa.",
      "get4": "Un enlace directo para crear tu cuenta gratuita de AiLunaPro.",
      "privacyTitle": "Privacidad",
      "privacyBody": "Las respuestas enviadas y tu correo electrónico se almacenan únicamente para generar tu diagnóstico y para hacer un seguimiento sobre servicios de IA relevantes. Puedes solicitar su eliminación en cualquier momento."
    },
    "roiCalculator": {
      "title": "Calculadora de ROI",
      "intro": "La Calculadora de ROI estima cuánto tiempo y dinero puede ahorrar tu equipo al adoptar los agentes de IA de AiLunaPro para un flujo de trabajo concreto.",
      "accessTitle": "Dónde acceder",
      "accessBody": "Abre `#/roi-calculator` en tu navegador. No requiere inicio de sesión. Tarda alrededor de un minuto.",
      "inputsTitle": "Datos de entrada",
      "in1": "Tamaño del equipo (de 1 a 10,000).",
      "in2": "Horas mensuales que tu equipo dedica a trabajo repetitivo.",
      "in3": "Coste medio por hora en USD (por defecto, 50).",
      "in4": "Flujo de trabajo objetivo (uno de nueve: soporte, ventas, finanzas, documentos, generación de informes, administración, cumplimiento, marketing, RR. HH.).",
      "outputsTitle": "Resultados",
      "out1": "Coste mensual ahorrado estimado (USD).",
      "out2": "Coste anual ahorrado estimado (USD).",
      "out3": "Tiempo ahorrado estimado al mes (horas).",
      "out4": "Periodo de amortización estimado en meses.",
      "out5": "Dos agentes de AiLunaPro recomendados para el flujo de trabajo elegido.",
      "aboutTitle": "Acerca de la estimación",
      "aboutBody": "El resultado se basa en la información que proporcionas y en supuestos de automatización conservadores. El ahorro real puede variar. La amortización usa un coste de agente provisional de $99/month hasta que se finalicen los precios de los agentes."
    },
    "team": {
      "title": "Equipo y roles",
      "intro": "AiLunaPro admite cinco roles por espacio de trabajo. Cada rol tiene un alcance específico:",
      "thRole": "Rol",
      "thManageWorkspace": "Gestionar espacio de trabajo",
      "thManageBilling": "Gestionar facturación",
      "thRunAudits": "Ejecutar auditorías",
      "thViewReports": "Ver informes",
      "limited": "limitado",
      "inviteTitle": "Invitar a compañeros de equipo",
      "inviteBody": "Los propietarios y administradores abren la página de Equipo, hacen clic en Invitar, introducen la dirección de correo electrónico y eligen un rol. La persona invitada recibe un enlace válido durante 7 días. Si un enlace caduca o se pierde, los propietarios y administradores pueden regenerarlo.",
      "rolesTitle": "Cambiar roles",
      "rolesBody": "Los propietarios y administradores pueden cambiar el rol de un compañero de equipo desde la página de Equipo. Los miembros pueden desactivarse temporalmente (sin acceso) y reactivarse más adelante, o eliminarse del espacio de trabajo."
    },
    "settings": {
      "title": "Ajustes",
      "lede": "Gestiona tu perfil, tu organización, la apariencia y las preferencias de notificación. Los selectores de idioma y moneda son preferencias de visualización por ahora.",
      "take1": "Los datos de perfil y organización están en Ajustes.",
      "take2": "El tema (claro/oscuro) se mantiene entre sesiones.",
      "take3": "El idioma y la moneda son solo de visualización hasta que esas funciones estén disponibles.",
      "profileTitle": "Perfil",
      "profileBody": "Actualiza tu nombre visible y tu dirección de correo electrónico desde **Ajustes → Perfil**.",
      "orgTitle": "Organización",
      "orgBody": "Los propietarios pueden renombrar la organización desde **Ajustes → Organización**.",
      "themeTitle": "Tema",
      "themeBody": "Cambia entre el modo claro y oscuro desde **Ajustes → Preferencias**. Tu elección se mantiene entre sesiones.",
      "languageTitle": "Idioma",
      "languageBody": "El selector de idioma en la barra lateral y en Ajustes es solo una preferencia. La aplicación se muestra actualmente en inglés. La compatibilidad completa con varios idiomas está prevista para una versión futura.",
      "currencyTitle": "Moneda",
      "currencyBody": "El selector de moneda en la barra lateral y en Ajustes es solo una preferencia de visualización. La facturación y el precio de los paquetes de tokens se mantienen en USD hasta que se implemente la facturación multidivisa.",
      "emailTitle": "Notificaciones por correo electrónico",
      "emailBody": "Elige qué correos quieres recibir: resumen semanal de cumplimiento, notificaciones de informes listos y actividad del equipo. **Ajustes → Preferencias → Notificaciones por correo electrónico**."
    },
    "analytics": {
      "title": "Analítica y cookies (opcional)",
      "intro": "AiLunaPro usa una analítica de producto opcional y respetuosa con la privacidad para ayudarnos a mejorar la fiabilidad y resolver problemas más rápido. Es totalmente opcional y permanece desactivada hasta que la autorices.",
      "offByDefault": "**Desactivada por defecto**: no se recopila nada hasta que eliges **Permitir**.",
      "collectedTitle": "Qué se recopila",
      "chipNoPersonal": "Sin datos personales",
      "chipNoRecording": "Sin grabación de sesión",
      "chipNoAds": "Sin seguimiento publicitario",
      "collectedBody": "Solo señales de uso anónimas, como vistas de página y eventos de fiabilidad.",
      "optTitle": "Activa o desactiva cuando quieras",
      "opt1": "En tu primera visita, elige Permitir o No, gracias en el pequeño banner.",
      "opt2": "Tu elección se guarda en este dispositivo: el banner no volverá a preguntar.",
      "opt3": "Para cambiarla, borra el almacenamiento del navegador de este sitio (datos del sitio) y recarga.",
      "dntTitle": "No rastrear",
      "dntBody": "Si tu navegador envía una señal de «No rastrear», la analítica permanece desactivada automáticamente y no se muestra ningún banner.",
      "blockedTitle": "Si se bloquea la analítica",
      "blockedBody": "Algunos navegadores, extensiones o redes bloquean las solicitudes de analítica. No hay ningún problema: la aplicación funciona con normalidad en cualquier caso y no es necesario hacer nada."
    },
    "troubleshooting": {
      "title": "Solución de problemas",
      "lede": "Soluciones rápidas para los problemas más habituales. La mayoría se resuelven con una recarga; si no, el propietario de tu espacio de trabajo o el soporte de AiLunaPro pueden ayudarte.",
      "take1": "Recarga primero: resuelve la mayoría de los fallos de carga, saldo y sesión.",
      "take2": "Los créditos de tokens llegan a los pocos segundos de un pago correcto.",
      "take3": "Una pantalla en blanco suele deberse a una extensión del navegador o a un filtro de red.",
      "loadTitle": "La página no carga",
      "loadBody": "Es posible que el servicio no esté disponible temporalmente. Recarga la página. Si el problema continúa, contacta con el propietario de tu espacio de trabajo o con el soporte de AiLunaPro.",
      "signedOutTitle": "Se cierra tu sesión de forma inesperada",
      "signedOutBody": "Es posible que tu sesión haya caducado. Vuelve a iniciar sesión. Si se sigue cerrando tu sesión, contacta con el propietario de tu espacio de trabajo.",
      "balanceTitle": "El saldo de tokens parece incorrecto",
      "balanceBody": "Recarga la página primero. Si tu saldo sigue pareciendo incorrecto tras recargar, contacta con el propietario de tu espacio de trabajo o con el soporte de AiLunaPro.",
      "balanceCheckoutTitle": "El saldo de tokens no se actualizó tras el pago",
      "balanceCheckoutBody": "Espera un momento y recarga la página. Los créditos de tokens llegan a los pocos segundos de un pago correcto. Si el saldo sigue sin actualizarse, contacta con el propietario de tu espacio de trabajo o con el soporte de AiLunaPro.",
      "captchaTitle": "El captcha sigue fallando en los formularios públicos",
      "captchaBody": "Recarga la página y completa el captcha de nuevo. Si el problema persiste, prueba con otro navegador o contacta con el soporte de AiLunaPro.",
      "syncTitle": "Falló la sincronización de la suscripción",
      "syncBody": "En la página de éxito de Facturación, haz clic en Reintentar sincronización. Si el fallo persiste, contacta con el soporte de AiLunaPro e incluye tu recibo de Stripe.",
      "inviteTitle": "El enlace de invitación no funciona",
      "inviteBody": "Las invitaciones caducan a los 7 días. Pide al propietario o administrador de tu espacio de trabajo que regenere la invitación desde la página de Equipo.",
      "roadmapTitle": "¿Cuál es la diferencia entre Hoja de ruta y Plan de acción?",
      "roadmapBody": "Ambas vistas derivan de los mismos hallazgos y recomendaciones de la auditoría, pero responden a preguntas distintas. La **Hoja de ruta** responde a **cuándo** entregar el trabajo: los elementos se agrupan por horizonte (30 / 60 / 90 días) para ayudar con la planificación y la capacidad. El **Plan de acción priorizado** responde a **qué corregir primero**: los elementos se agrupan por prioridad (Crítica / Importante / Mejora) mediante una regla determinista fija sobre la gravedad de los hallazgos existentes y el impacto de las recomendaciones. Son complementarios, no duplicados. Ninguna de las vistas cambia la puntuación, y ninguna es una certificación de cumplimiento.",
      "blankTitle": "¿Pantalla en blanco, «Vaya» o diseño roto?",
      "blankBody": "Casi siempre se debe a un **bloqueador de anuncios o una extensión de privacidad** del navegador (o a un filtro corporativo/VPN/DNS) que bloquea los scripts, los estilos o las solicitudes de datos de la aplicación; puede que veas **ERR_BLOCKED_BY_CLIENT** en la consola. Soluciónalo permitiendo **audit.ailunapro.com** y ***.googleapis.com** en tu bloqueador, o abre la aplicación en un perfil de navegador limpio sin extensiones y vuelve a cargar.",
      "emailTitle": "¿No recibiste el correo de verificación o de restablecimiento de contraseña?",
      "emailBody": "Los correos de verificación y de restablecimiento de contraseña los envía Firebase desde la dirección de no-reply configurada en tu proyecto (el remitente predeterminado de Firebase hasta que se verifique un dominio de remitente personalizado). Comprueba primero tu carpeta de **spam / promociones**. Puedes reenviar el correo de verificación desde **Ajustes → Perfil**, o solicitar un nuevo enlace de restablecimiento desde la página **¿Olvidaste tu contraseña?**. Tras verificar, cierra la sesión y vuelve a iniciarla para que tu cuenta refleje el estado verificado. (Las invitaciones de equipo son independientes y se envían a través del proveedor de correo de AiLunaPro.)"
    },
    "faq": {
      "title": "Preguntas frecuentes",
      "q1": "¿Por qué no veo mis informes antiguos?",
      "a1": "Los informes son **por espacio de trabajo**. Un informe antiguo probablemente pertenece a otro espacio de trabajo: cambia de espacio de trabajo desde el selector situado en la parte superior de la barra lateral. El filtro de fechas del panel no afecta a la lista de Informes.",
      "q2": "¿Por qué está vacía la sección Informes?",
      "a2": "Una auditoría enviada por sí sola no crea un informe. Abre una auditoría enviada y haz clic en **Generar informe** para crear una instantánea: entonces aparecerá en Informes.",
      "q3": "¿El texto aleatorio afecta a mi puntuación?",
      "a3": "No. La puntuación procede de las preguntas estructuradas (de elección). Los campos de texto libre «Describe…» solo añaden contexto, pero un dato claro y real hace que tu informe sea creíble.",
      "q4": "¿Qué se guarda y cuándo?",
      "a4": "**Enviar auditoría** guarda tus respuestas + puntuación. **Generar informe** crea una instantánea independiente que se puede compartir. Consulta «Auditoría vs Informe» más arriba.",
      "q5": "¿Mis datos son seguros?",
      "a5": "AiLunaPro usa acceso autenticado, permisos basados en roles, reglas de seguridad de Firestore y escrituras del lado del servidor para operaciones sensibles. Las cantidades de tokens, las acciones de facturación y los cambios de equipo se validan en el servidor.",
      "q6": "¿Puedo eliminar mis datos?",
      "a6": "Sí. Contacta con el propietario de tu espacio de trabajo o con el soporte de AiLunaPro para solicitar la eliminación de tu cuenta o de los datos de tu espacio de trabajo.",
      "q7": "¿Por qué los paquetes de tokens son en USD?",
      "a7": "AiLunaPro está implantando la compatibilidad multidivisa por fases. Las suscripciones admiten varias monedas a través de Stripe. Los paquetes de tokens pasarán a ser multidivisa en una versión futura.",
      "q8": "¿Qué hace el selector de moneda?",
      "a8": "Es solo una preferencia de visualización. Todavía no cambia la moneda del pago en Stripe ni el precio de los paquetes de tokens.",
      "q9": "¿Qué hace el selector de idioma?",
      "a9": "Almacena tu idioma preferido. La traducción completa de la interfaz está en curso y llegará en una versión futura.",
      "q10": "¿Cómo contacto con el soporte?",
      "a10": "Para preguntas sobre la cuenta, la facturación o técnicas, contacta primero con el propietario de tu espacio de trabajo. Para problemas que necesiten nuestra ayuda, contacta directamente con el soporte de AiLunaPro.",
      "q11": "¿Ya se pueden comprar agentes dentro de AiLunaPro?",
      "a11": "Todavía no. El catálogo de Agentes lista agentes de IA recomendados. Al seleccionar \"Obtener este agente\" pasas por el flujo de incorporación estándar. La compra directa dentro de la aplicación está prevista para una fase posterior.",
      "q12": "¿Está garantizada la estimación de ROI?",
      "a12": "No. La Calculadora de ROI ofrece una estimación conservadora basada en la información que proporcionas. El ahorro real depende de tu flujo de trabajo, la calidad de la integración y la adopción."
    }
  },
};
