/** B6.0 — Spanish dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const es: Dict = {
  navGroups: {
    core:    'Principal',
    audit:   'Auditoría y análisis',
    crm:     'Ventas / CRM',
    admin:   'Administración',
    billing: 'Facturación',
    tools:   'Herramientas',
    system:  'Sistema',
  },
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
    toolsSection:          'Herramientas',
    aiRoiCalculator:       'Calculadora de ROI de IA',
    aiMaturityDiagnostic:  'Diagnóstico de madurez en IA',
    requestQuote:          'Solicitar presupuesto',
    myQuotes:              'Mis presupuestos',
    invoices:              'Facturas',
  },
  bankSettings: {
    heading: 'Datos bancarios',
    subtitle: 'Se muestran en las facturas como opción de pago.',
    countryLabel: 'Código de país',
    countryPlaceholder: 'ej. ES',
    regionLabel: 'Región bancaria',
    regionEu: 'Europa (IBAN)',
    regionUs: 'Estados Unidos',
    regionGlobal: 'Asia / Global',
    fAccountName: 'Nombre de la cuenta',
    fAccountNumber: 'Número de cuenta',
    fRoutingNumber: 'Número de ruta',
    fBankName: 'Nombre del banco',
    fAccountHolder: 'Titular de la cuenta',
    save: 'Guardar datos bancarios',
    saved: 'Datos bancarios guardados',
    saveError: 'No se pudo guardar. Inténtalo de nuevo.',
    validationError: 'Comprueba este valor.',
    ownerOnly: 'Solo los propietarios y administradores pueden editar los datos bancarios.',
  },
  invoices: {
    title: 'Facturas',
    subtitle: 'Facturas creadas cuando un cliente acepta un presupuesto.',
    loading: 'Cargando…',
    error: 'No se pudieron cargar tus facturas. Inténtalo de nuevo.',
    empty: 'Aún no hay facturas.',
    quoteLabel: 'Presupuesto',
    statusDraft: 'Borrador',
    statusPending: 'Pendiente',
    statusPaid: 'Pagada',
    amountPending: 'Por confirmar',
    clientBudget: 'Presupuesto del cliente',
    proposedBudget: 'Presupuesto propuesto',
    confirmSend: 'Confirmar y enviar factura',
    amountLabel: 'Importe final (USD)',
    confirmBtn: 'Confirmar y enviar',
    cancel: 'Cancelar',
    sent: 'Factura enviada correctamente',
    sentNoEmail: 'Factura creada, pero no se pudo enviar el correo.',
    resendNoRecipient: 'Esta factura no tiene correo del cliente.',
    statusAwaitingTransfer: 'Transferencia pendiente',
    confirmError: 'No se pudo enviar. Inténtalo de nuevo.',
    pendingHeading: 'Pendiente de confirmación',
    queueHeading: 'Pendiente de tu tarificación',
    queueEmpty: 'No hay presupuestos pendientes de tarificación en este momento.',
    queueSubtitle: 'Un cliente ha respondido: define el importe final para crear la factura.',
    stageAcceptedLabel: 'Aceptado',
    stageNegotiationLabel: 'Negociación',
    nextAccepted: 'Siguiente: define el importe final para crear y enviar la factura.',
    nextNegotiation: 'Siguiente: revisa el presupuesto del cliente y luego define el importe final.',
    clientMessageLabel: 'Mensaje del cliente',
    finalizeBtn: 'Confirmar importe y crear factura',
    invoicesHeading: 'Facturas',
    resendBtn: 'Reenviar correo de la factura',
    fromEmail: 'Abierto desde tu correo',
    notFound: 'No se ha podido encontrar este presupuesto o factura.',
  },
  adminCenter: {
    nav: 'Admin Center',
    title: 'Admin Center',
    subtitle: 'Supervisa los presupuestos, las facturas y la actividad de los clientes de tu organización en un solo lugar.',
    restricted: 'El Admin Center está restringido a los superadministradores.',
    activityHeading: 'Actividad reciente',
    activityEmpty: 'Todavía no hay actividad.',
    evtAccepted: 'Presupuesto validado por el cliente',
    evtAdjustment: 'El cliente solicitó un cambio de presupuesto',
    evtInvoiceSent: 'Factura enviada',
    evtPaid: 'Pago recibido',
    statusWaitingResponse: 'Esperando tu respuesta',
    replyHint: 'responde al correo de notificación para contestar',
    allQuotesHeading: 'Todos los presupuestos — ciclo de vida completo',
    allQuotesEmpty: 'Aún no se ha enviado ningún presupuesto.',
    tlCreated: 'Creado',
    tlSent: 'Enviado',
    tlAccepted: 'Aceptado',
    tlChanges: 'Cambios solicitados',
    tlInvoiced: 'Facturado',
    blocked: 'Bloqueado',
    suspended: 'Suspendido',
    editBudget: 'Editar presupuesto',
    budgetUsdLabel: 'Presupuesto (USD)',
    save: 'Guardar',
    block: 'Bloquear',
    suspend: 'Suspender',
    reactivate: 'Reactivar',
    sendQuote: 'Enviar presupuesto',
    createInvoice: 'Crear factura',
    invoicePending: 'Factura pendiente',
    sendAndPay: 'Enviar y pagar',
    markPaidBtn: 'Marcar como pagado',
    awaitingTransfer: 'Transferencia pendiente',
    openPaymentLink: 'Abrir enlace de pago',
    genPaymentLink: 'Generar enlace de pago',
    superadminHeading: 'Visibilidad superadmin — todos los presupuestos',
    orgQuotesHeading: 'Todos los presupuestos de la organización',
    platformHeading: 'Plataforma — todos los presupuestos (todas las organizaciones)',
    platformEmpty: 'Aún no hay presupuestos en ninguna organización.',
    priceLabel: 'Precio',
    uidLabel: 'ID de usuario',
    orgLabel: 'Organización',
    sourceLabel: 'Origen',
    currencyLabel: 'Moneda',
    stripeIdLabel: 'ID de Stripe',
    quoteIdLabel: 'ID del presupuesto',
    paidLabel: 'Pagado',
    paymentPaid: 'Pagado',
    paymentPending: 'Pendiente de pago',
    paymentNone: 'Sin factura',
    discussionsHeading: 'Conversaciones con clientes',
    discussionsEmpty: 'Todavía no hay mensajes de clientes.',
    contextLabel: 'Contexto',
  },
  myQuotes: {
    title: 'Mis presupuestos',
    subtitle: 'Sigue las propuestas que has enviado: estado, presupuesto y la última actividad.',
    loading: 'Cargando…',
    error: 'No se pudieron cargar tus presupuestos. Inténtalo de nuevo.',
    empty: 'Aún no has enviado ningún presupuesto.',
    createCta: 'Crear un presupuesto',
    quoteLabel: 'Presupuesto',
    proposedBudget: 'Presupuesto propuesto',
    statusSent: 'Enviado',
    statusReviewing: 'En revisión',
    statusNegotiation: 'Negociación',
    statusValidated: 'Validado',
    statusInvoiced: 'Facturado',
    statusBlocked: 'Bloqueado',
    statusSuspended: 'Suspendido',
    changesRequested: 'El cliente solicitó cambios',
    negotiationNextStep: 'Define el importe final en el Admin Center para responder.',
    waitingResponse: 'Esperando la respuesta del cliente',
    lastActivity: 'Última actividad',
    actCreated: 'Presupuesto creado',
    actSent: 'Propuesta enviada al cliente',
    actAccepted: 'El cliente aceptó el presupuesto',
    actChangesRequested: 'El cliente solicitó cambios',
    actInvoiced: 'Factura creada',
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
    "nextTools": {
      "title": "Sigue explorando",
      "subtitle": "Herramientas ligeras que puedes ejecutar cuando quieras, sin configuración.",
      "roi": "Calcular tu ROI",
      "diagnostic": "Hacer otro diagnóstico rápido"
    },
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
        "journeyCostSaved": "Coste ahorrado estimado ≈ {amount}/mes."
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
    },
    "quickTools": {
      "title": "Herramientas rápidas",
      "subtitle": "Comprobaciones ligeras que puedes repetir cuando quieras, independientes de tu auditoría completa.",
      "diagnostic": {
        "label": "Hacer un diagnóstico rápido",
        "hint": "Evalúa tu madurez en IA en ~2 min"
      },
      "roi": {
        "label": "Calcular tu ROI",
        "hint": "Mira el tiempo y los costes que podrías ahorrar"
      }
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
    "stillConnecting": "Conectando todavía…",
    "valueDisplay": {
      "actionHint": "Usa {tokens} tokens · ≈ {value} de valor",
      "actionHintFree": "Gratis · ≈ {value} de valor",
      "sessionTracker": "Esta sesión: {value} de valor · {tokens} tokens"
    }
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
      "pendingGreetingDiagnostic": "Hemos guardado tu diagnóstico. Una auditoría completa lo convierte en un plan de acción detallado. Elige cómo continuar.",
      "pendingGreetingRoi": "Hemos guardado tu estimación de ROI. Una auditoría completa la convierte en un plan de acción detallado. Elige cómo continuar.",
      "heading": "¿Cómo quiere empezar?",
      "express": {
        "badge": "Recomendado para tu primera auditoría",
        "time": "~5 min",
        "title": "Audit Express",
        "body": "Una instantánea rápida de preparación para la IA de unos 5 minutos — unas pocas preguntas rápidas, un análisis opcional del sitio web y un ROI indicativo. Ideal para un primer vistazo.",
        "cta": "Iniciar Audit Express →"
      },
      "full": {
        "time": "~15 min",
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
  registry: {
    "page": {
      "title": "Registro de IA",
      "subtitle": "Haz seguimiento de cada herramienta de IA utilizada en tu organización: propósito, datos, supervisión y mitigaciones. El registro alimenta tus auditorías e informes.",
      "designGuideLink": "¿Diseñas un sistema nuevo? Abre la guía de diseño →",
      "addTool": "+ Añadir herramienta",
      "loading": "Cargando registro…",
      "error": "No se pudo cargar el registro. Actualiza para reintentar."
    },
    "summary": {
      "totalTools": "Herramientas totales",
      "approved": "Aprobadas",
      "pendingReview": "Pendientes de revisión",
      "highRisk": "Alto riesgo"
    },
    "filters": {
      "searchPlaceholder": "Buscar herramientas, propósito, notas…",
      "allDepartments": "Todos los departamentos",
      "allRisks": "Todos los riesgos",
      "allApproval": "Toda aprobación",
      "clear": "Borrar filtros",
      "risk": {
        "low": "Bajo",
        "medium": "Medio",
        "high": "Alto",
        "critical": "Crítico"
      }
    },
    "table": {
      "tool": "Herramienta",
      "department": "Departamento",
      "risk": "Riesgo",
      "approval": "Aprobación",
      "oversight": "Supervisión",
      "reviewDate": "Fecha de revisión"
    },
    "empty": {
      "noItems": {
        "title": "Aún no hay herramientas de IA en el registro",
        "body": "Haz seguimiento de cada herramienta de IA utilizada en tu organización: propósito, datos, supervisión y mitigaciones. El registro alimenta tus auditorías e informes.",
        "action": "+ Añade tu primera herramienta"
      },
      "noMatches": {
        "title": "Ninguna herramienta coincide con estos filtros",
        "body": "Prueba a ampliar los filtros o bórralos para ver el registro completo.",
        "action": "Borrar filtros"
      }
    },
    "modal": {
      "titleAdd": "Añadir herramienta de IA",
      "titleEdit": "Editar herramienta de IA",
      "subtitleAdd": "Haz seguimiento de una herramienta de IA utilizada por tu equipo. Todos los campos se pueden editar más tarde.",
      "subtitleEdit": "Actualiza lo que tu equipo sabe sobre esta herramienta. Los cambios se guardan de inmediato en el registro local.",
      "fields": {
        "toolName": "Nombre de la herramienta",
        "purpose": "Propósito",
        "dataTypes": "Tipos de datos procesados",
        "mitigations": "Mitigaciones",
        "notes": "Notas",
        "department": "Departamento",
        "approvalStatus": "Estado de aprobación",
        "riskLevel": "Nivel de riesgo",
        "humanOversight": "Supervisión humana",
        "nextReviewDate": "Próxima fecha de revisión"
      },
      "placeholders": {
        "toolName": "p. ej. Copiloto de atención al cliente",
        "purpose": "¿Qué hace esta herramienta?",
        "mitigation": "Añade una mitigación y pulsa Intro",
        "notes": "Proveedor, residencia, responsable, cualquier cosa que merezca registrarse…"
      },
      "riskOptions": {
        "low": "Bajo",
        "medium": "Medio",
        "high": "Alto",
        "critical": "Crítico"
      },
      "reviewDateHint": "Déjalo vacío si no hay ninguna revisión programada.",
      "auditTrail": "Creado {createdDate} · Última actualización {updatedDate}",
      "removeMitigationAria": "Eliminar mitigación {index}",
      "requiredError": "Obligatorio",
      "deleteConfirm": "¿Eliminar \"{toolName}\" del registro? Esto no se puede deshacer.",
      "buttons": {
        "delete": "Eliminar herramienta",
        "cancel": "Cancelar",
        "addToRegistry": "Añadir al registro",
        "saveChanges": "Guardar cambios"
      }
    }
  },
  systemBuilder: {
    "chrome": {
      "pageTitle": "Constructor de sistemas de IA",
      "pageIntro": "Una guía de diseño previa al despliegue. Recorre seis dimensiones (propósito y riesgo, datos, modelo, supervisión, monitorización, documentación) para diseñar un sistema de IA de forma responsable. Tu paso y las marcas de la lista de comprobación se guardan únicamente en este dispositivo.",
      "designSteps": "Pasos de diseño",
      "checklist": "Lista de comprobación",
      "doneSuffix": "· {doneCount}/{total} completados",
      "keyQuestions": "Preguntas clave",
      "references": "Referencias (orientativas, no constituyen asesoramiento legal)",
      "previousStep": "← Paso anterior",
      "nextStep": "Paso siguiente →",
      "stepOf": "Paso {n} de {total}",
      "endOfGuide": "✓ Fin de la guía: cubiertas las seis dimensiones"
    },
    "steps": {
      "purpose": {
        "title": "1. Propósito y clasificación de riesgo",
        "intro": "Define para qué sirve el sistema, a quién afecta y qué nivel de riesgo tiene antes de construir nada. Esto ancla cada decisión posterior.",
        "checklist": {
          "c1": "Redacta un propósito previsto en una sola frase (sin jerga).",
          "c2": "Enumera a las personas o grupos afectados (usuarios, clientes, terceros).",
          "c3": "Clasifica el nivel de riesgo: inaceptable / alto (Annex III) / limitado / mínimo, o GPAI.",
          "c4": "Documenta el alcance del caso de uso y su límite (qué queda fuera de alcance).",
          "c5": "Enumera los usos indebidos previsibles / usos no autorizados y qué te negarás a hacer."
        },
        "questions": {
          "q1": "¿Quién tiene la autoridad para desplegar o pausar este sistema?",
          "q2": "¿Qué ocurre, en concreto, si el sistema se equivoca?",
          "q3": "¿Qué derechos legales, condiciones de seguridad o libertades podrían verse afectados?"
        }
      },
      "data": {
        "title": "2. Gobernanza de datos",
        "intro": "Si tus datos son erróneos, el sistema es erróneo. Inventaríalos, clasifícalos, justifica por qué los conservas y vigila los sesgos.",
        "checklist": {
          "c1": "Crea un inventario de datos: origen, propietario, sensibilidad, retención.",
          "c2": "Establece una base legal (GDPR Art. 6) para cada categoría procesada.",
          "c3": "Documenta la calidad: relevancia, representatividad, lagunas, sesgos conocidos.",
          "c4": "Aplica la minimización de datos: recopila solo lo necesario; consérvalos solo el tiempo necesario.",
          "c5": "Planifica revisiones periódicas de sesgos y vías de acción correctiva."
        },
        "questions": {
          "q1": "¿De dónde procede cada conjunto de datos y quién es responsable de él?",
          "q2": "¿El conjunto de datos incluye categorías sensibles (Art. 9 GDPR)? ¿Sobre qué base?",
          "q3": "¿Qué señales de sesgo medirás y frente a qué referencia?"
        }
      },
      "model": {
        "title": "3. Selección y validación del modelo",
        "intro": "Elige el modelo más pequeño que funcione. Valídalo tal como lo usarán realmente los atacantes y los usuarios. Documenta lo que no puede hacer.",
        "checklist": {
          "c1": "Justifica la elección del tamaño / familia del modelo frente al caso de uso real.",
          "c2": "Define objetivos de precisión y robustez y cómo los medirás.",
          "c3": "Realiza pruebas adversarias / de red team (inyección de prompts, jailbreaks, salidas sesgadas).",
          "c4": "Documenta los modos de fallo conocidos y los usos explícitamente excluidos.",
          "c5": "Versiona cada artefacto del modelo y entrega notas de cambios con los despliegues."
        },
        "questions": {
          "q1": "¿Por qué este modelo y qué alternativa más económica descartaste?",
          "q2": "¿Qué aspecto tiene el sistema cuando se equivoca? ¿Y cómo lo sabes?",
          "q3": "¿Tu conjunto de pruebas es representativo del tráfico de producción?"
        }
      },
      "oversight": {
        "title": "4. Supervisión humana",
        "intro": "Decide cómo las personas mantienen el control de los resultados de consecuencia. Asegúrate de que los controles funcionen de verdad bajo presión.",
        "checklist": {
          "c1": "Elige el modo de supervisión por tipo de decisión: in-loop, on-loop u out-of-loop.",
          "c2": "Designa a los revisores y documenta los SLA para las decisiones de alto riesgo.",
          "c3": "Proporciona controles de anulación / pausa / interruptor de emergencia que el revisor pueda usar.",
          "c4": "Redacta un runbook de escalado (a quién se avisa y con qué contexto).",
          "c5": "Registra cada anulación / pausa para la revisión posterior al incidente."
        },
        "questions": {
          "q1": "¿Quién revisa las salidas de alto riesgo? ¿Y tiene el tiempo y el contexto para hacerlo?",
          "q2": "¿Puede un solo operador detener el sistema sin necesidad de una reunión?",
          "q3": "¿Cómo evitas la aprobación mecánica (\"complacencia con la automatización\")?"
        }
      },
      "monitoring": {
        "title": "5. Monitorización e incidentes",
        "intro": "La monitorización posterior al despliegue no es opcional. La deriva es silenciosa. Los incidentes no.",
        "checklist": {
          "c1": "Define las métricas de monitorización posterior al despliegue (precisión, latencia, daño, deriva).",
          "c2": "Implementa la detección de deriva en las entradas y las salidas.",
          "c3": "Registra los incidentes en una única cola con gravedad y responsable.",
          "c4": "Documenta las vías de notificación (regulador, cliente, interno).",
          "c5": "Programa reevaluaciones periódicas (trimestrales como mínimo)."
        },
        "questions": {
          "q1": "¿Qué única métrica, si se mueve, te indica que debes pausar el sistema?",
          "q2": "¿A quién se avisa a las 3 de la madrugada y qué runbook abre?",
          "q3": "¿Cuándo ensayaste por última vez un escenario de incidente de IA?"
        }
      },
      "docs": {
        "title": "6. Documentación y transparencia",
        "intro": "Deja por escrito qué es el sistema, qué no es y qué necesitan saber los usuarios. Actualízalo en cada cambio sustancial.",
        "checklist": {
          "c1": "Mantén la documentación técnica conforme al Art. 11 (propósito, datos, entrenamiento, evaluación, riesgos).",
          "c2": "Publica una ficha de modelo / sistema por cada sistema; actualízala en cada versión.",
          "c3": "Añade una divulgación de IA orientada al usuario en cada superficie del cliente.",
          "c4": "Actualiza los avisos de privacidad para reflejar el procesamiento con IA.",
          "c5": "Conserva los registros de formación del personal que opera el sistema."
        },
        "questions": {
          "q1": "¿Qué necesitan saber los usuarios finales para usar este sistema de forma responsable?",
          "q2": "¿Qué necesitaría un auditor externo el primer día?",
          "q3": "¿Cómo de actualizada está la ficha de modelo / sistema en este momento?"
        }
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "Informes",
      "intro": "Los informes generados son instantáneas de una auditoría en un momento concreto. Cada uno se puede exportar, compartir y se mantiene estable cuando inicias una nueva auditoría.",
      "generateFromDraft": "+ Generar desde el borrador actual",
      "startNewAudit": "Iniciar una nueva auditoría",
      "loading": "Cargando informes…",
      "errorMessage": "Aún no se ha cargado ningún informe. Esto puede ocurrir si el espacio de trabajo es nuevo o si no se puede acceder a Firestore.",
      "retry": "Reintentar",
      "traceabilityHint": "Los informes son instantáneas en un momento concreto guardadas en tu espacio de trabajo. La vista de detalle recalcula el resultado completo a partir de la instantánea de respuestas de cada informe, de modo que los informes históricos siguen siendo precisos aunque evolucionen las reglas de puntuación."
    },
    "detail": {
      "loading": "Cargando informe…",
      "notFoundTitle": "Informe no encontrado",
      "notFoundBody": "Este informe ya no existe o se ha eliminado.",
      "backToReports": "← Volver a los informes",
      "rename": {
        "titleAriaLabel": "Título del informe",
        "saving": "…",
        "saveTitle": "Guardar título",
        "cancel": "Cancelar",
        "renameButton": "Renombrar"
      },
      "download": {
        "preparing": "Preparando…",
        "downloadPdf": "⬇ Descargar PDF"
      },
      "errors": {
        "tokensInsufficientExport": "No hay tokens suficientes para exportar. Compra tokens para continuar.",
        "downloadFailed": "La descarga ha fallado. Inténtalo de nuevo.",
        "renameForbidden": "Solo los propietarios o administradores pueden renombrar informes.",
        "renameFailed": "No se ha podido renombrar. Inténtalo de nuevo.",
        "tokensInsufficient": "No hay tokens suficientes. Compra tokens para continuar.",
        "shareDisabled": "Compartir está deshabilitado para este informe.",
        "shareForbidden": "Solo los propietarios o administradores pueden compartir informes.",
        "shareCreateFailed": "No se ha podido crear un enlace para compartir. Inténtalo de nuevo.",
        "revokeFailed": "No se ha podido revocar el enlace. Inténtalo de nuevo.",
        "toggleSharingFailed": "No se ha podido actualizar la opción de compartir. Inténtalo de nuevo."
      },
      "share": {
        "heading": "Enlace para compartir",
        "description": "Un enlace firmado y sin inicio de sesión al PDF de este informe. Crearlo o regenerarlo cuenta para tus exportaciones de PDF.",
        "working": "Procesando…",
        "generateNewLink": "Generar nuevo enlace",
        "revoke": "Revocar",
        "shareLink": "Enlace para compartir",
        "enableSharing": "Habilitar compartir",
        "disableSharing": "Deshabilitar compartir",
        "copied": "Copiado",
        "copy": "Copiar",
        "expires": "Caduca el {date}.",
        "activeLinkExists": "Existe un enlace activo (caduca el {date}). Genera un nuevo enlace para volver a ver la URL: esto revoca el anterior.",
        "disabledNotice": "Compartir está deshabilitado: los enlaces existentes ya no funcionan.",
        "useTokensAndCreateLink": "Usar tokens y crear enlace"
      },
      "status": {
        "notShared": "No compartido",
        "active": "Activo",
        "expired": "Caducado",
        "revoked": "Revocado",
        "disabled": "Deshabilitado"
      },
      "footer": {
        "openAssistancePlan": "Abrir plan de asistencia",
        "deleteReport": "Eliminar informe",
        "deleteConfirm": "¿Eliminar este informe? Esta acción no se puede deshacer."
      },
      "metadata": {
        "heading": "Metadatos",
        "reportId": "ID del informe",
        "sourceDraft": "Borrador de origen",
        "status": "Estado",
        "weakestSection": "Sección más débil",
        "frameworks": "Marcos"
      }
    },
    "share": {
      "unavailableTitle": "Informe compartido no disponible",
      "backToReports": "← Volver a los informes",
      "copySuccess": "Enlace para compartir copiado.",
      "copyFailure": "No se ha podido copiar el enlace. Inténtalo de nuevo.",
      "banner": {
        "label": "🔗 Informe compartido: vista de solo lectura",
        "description": "Vista de solo lectura para las personas de tu espacio de trabajo, abierta desde el enlace para compartir de la aplicación. Los botones de acciones internas están ocultos.",
        "copyShareLink": "🔗 Copiar enlace para compartir",
        "backToInternalView": "← Volver a la vista interna"
      },
      "topline": {
        "kicker": "Informe de conformidad de IA",
        "score": "Puntuación",
        "scoreOutOf": "/100",
        "generated": "Generado el {date}"
      },
      "poweredBy": "Con la tecnología de AiLunaPro · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "Audit Express guardadas",
      "subtitle": "Tus instantáneas guardadas de Audit Express. Descarga el PDF o elimina un resultado guardado.",
      "runAuditExpress": "Ejecutar Audit Express",
      "loading": "Cargando…",
      "empty": {
        "prefix": "Aún no hay auditorías guardadas. Usa",
        "runLink": "Ejecutar Audit Express",
        "suffix": "para crear una."
      },
      "meta": {
        "engineLabel": "motor",
        "engineFallback": "n/d",
        "confidenceLabel": "confianza"
      }
    },
    "actions": {
      "view": "Ver",
      "rename": "Renombrar",
      "delete": "Eliminar",
      "download": "Descargar PDF",
      "save": "Guardar",
      "cancel": "Cancelar",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Título de la auditoría",
      "viewDetailsTooltip": "Ver detalles"
    },
    "errors": {
      "load": "No se han podido cargar tus auditorías guardadas. Inténtalo de nuevo.",
      "tokensInsufficient": "No hay tokens suficientes para exportar. Compra tokens para continuar.",
      "download": "La descarga ha fallado. Inténtalo de nuevo.",
      "delete": "La eliminación ha fallado. Inténtalo de nuevo.",
      "rename": "No se ha podido renombrar. Inténtalo de nuevo."
    },
    "pdfLimitModal": {
      "ariaLabel": "Límite de exportación de PDF",
      "title": "Has utilizado tus {freeCount} exportaciones de PDF gratuitas",
      "body": "Descargar más PDF requiere tokens ({tokenCost} tokens por exportación).",
      "useTokens": "Usar tokens y descargar",
      "useTokensBusy": "…",
      "buyTokens": "Mejorar plan o comprar tokens",
      "cancel": "Cancelar"
    },
    "detail": {
      "backToList": "← Auditorías guardadas",
      "loading": "Cargando…",
      "meta": {
        "engineLabel": "motor",
        "engineFallback": "n/d",
        "confidenceLabel": "confianza"
      },
      "rename": "Renombrar",
      "save": "Guardar",
      "cancel": "Cancelar",
      "titleAriaLabel": "Título de la auditoría",
      "busy": "…",
      "notRecomputed": "No se ha podido recalcular esta auditoría.",
      "downloadPdf": "Descargar PDF",
      "downloadPdfBusy": "Preparando…",
      "backToSaved": "Volver a las auditorías guardadas"
    },
    "detailErrors": {
      "notFound": "Esta auditoría ya no existe.",
      "load": "No se ha podido cargar esta auditoría. Inténtalo de nuevo.",
      "rename": "No se ha podido renombrar. Inténtalo de nuevo.",
      "tokensInsufficient": "No hay tokens suficientes. Compra tokens para continuar.",
      "sharingDisabled": "Compartir está deshabilitado para esta auditoría.",
      "createShareLink": "No se ha podido crear un enlace para compartir. Inténtalo de nuevo.",
      "revokeShareLink": "No se ha podido revocar el enlace. Inténtalo de nuevo.",
      "updateSharing": "No se ha podido actualizar la opción de compartir. Inténtalo de nuevo."
    },
    "recommendedAgents": {
      "heading": "Agentes recomendados",
      "exploreAll": "Explorar todos los agentes →",
      "disclaimer": "Coincidencias indicativas basadas en esta auditoría. Revisa la idoneidad antes de adoptarlos.",
      "meta": {
        "hoursSaved": "~{hours} h/mes ahorradas",
        "plan": "Plan {plan}",
        "setup": "Configuración {complexity}"
      }
    },
    "share": {
      "heading": "Enlace para compartir",
      "description": "Un enlace firmado y sin inicio de sesión al PDF de esta auditoría. Crearlo o regenerarlo cuenta para tus exportaciones de PDF.",
      "generateNewLink": "Generar nuevo enlace",
      "shareLink": "Enlace para compartir",
      "working": "Procesando…",
      "revoke": "Revocar",
      "enableSharing": "Habilitar compartir",
      "disableSharing": "Deshabilitar compartir",
      "copy": "Copiar",
      "copied": "Copiado",
      "expires": "Caduca el {date}.",
      "activeLinkExists": "Existe un enlace activo (caduca el {date}). Genera un nuevo enlace para volver a ver la URL: esto revoca el anterior.",
      "disabledNotice": "Compartir está deshabilitado: los enlaces existentes ya no funcionan.",
      "limitModalActionLabel": "Usar tokens y crear enlace"
    },
    "shareStatus": {
      "notShared": "No compartido",
      "active": "Activo",
      "expired": "Caducado",
      "revoked": "Revocado",
      "disabled": "Deshabilitado"
    }
  },
  billingPage: {
    "header": {
      "title": "Facturación",
      "subtitle": "Gestiona tu plan, uso y facturas.",
      "readOnlyBadge": "Vista de solo lectura."
    },
    "plans": {
      "bestValueBadge": "Mejor relación calidad-precio",
      "priceApprox": "{approx}{suffix} aprox. · facturado en USD",
      "cta": {
        "redirecting": "Redirigiendo…",
        "currentPlan": "Plan actual",
        "freeCurrent": "Free — actual",
        "startForFree": "Empieza gratis",
        "subscribe": "Suscribirse"
      },
      "free": {
        "description": "Prueba la plataforma con acceso limitado.",
        "features": {
          "limitedAuditAccess": "Acceso limitado a auditorías",
          "basicDashboard": "Panel básico",
          "demoReports": "Informes de demostración",
          "communitySupport": "Soporte de la comunidad"
        }
      },
      "starter": {
        "description": "Realiza auditorías reales por tu cuenta.",
        "features": {
          "coreAuditWorkflow": "Flujo de auditoría esencial",
          "basicComplianceReports": "Informes de conformidad básicos",
          "starterAuditVolume": "Volumen de auditoría Starter",
          "essentialAiRecommendations": "Recomendaciones de IA esenciales",
          "emailSupport": "Soporte por correo electrónico"
        }
      },
      "professional": {
        "description": "Para equipos en crecimiento que realizan auditorías avanzadas.",
        "features": {
          "higherAuditVolume": "Mayor volumen de auditoría",
          "advancedReports": "Informes avanzados",
          "teamCollaboration": "Colaboración en equipo",
          "priorityAiRecommendations": "Recomendaciones de IA prioritarias",
          "prioritySupport": "Soporte prioritario"
        }
      },
      "enterprise": {
        "description": "Gobernanza y control de nivel organizativo.",
        "features": {
          "highestAuditVolume": "El mayor volumen de auditoría",
          "advancedTeamManagement": "Gestión avanzada de equipos",
          "organizationControls": "Controles de la organización",
          "customBranding": "Personalización de marca",
          "dedicatedSupport": "Soporte dedicado",
          "enterpriseReadyGovernance": "Gobernanza lista para empresas"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Moneda de facturación detectada según tu región: {currency} {symbol}",
        "default": "Moneda de facturación: {currency} {symbol}"
      },
      "secureCheckoutBadge": "Pago seguro con tecnología de Stripe",
      "heading": "Elige el plan que se ajuste a tu flujo de auditoría",
      "subheadingPrefix": "Empieza en el modo de prueba de Stripe. No se realiza ningún cargo real — usa la tarjeta de prueba",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Plan actual",
      "statusNoSubscription": "Sin suscripción",
      "freePlanNote": "Plan Free — sin suscripción activa",
      "paidPlanSummary": "${price}/mes · facturado {billingCycle}",
      "renews": " · Se renueva el {date}",
      "cancelsAtPeriodEnd": "⚠ Se cancela al final del periodo ({date})",
      "billedInCurrency": "Tu suscripción activa se factura en {currency}.",
      "resumePlan": "Reanudar plan",
      "cancelPlan": "Cancelar plan"
    },
    "billingActions": {
      "title": "Acciones de facturación",
      "manageSubscription": "Gestionar suscripción",
      "managePaymentMethods": "Gestionar métodos de pago",
      "loading": "Cargando…",
      "paymentMethodsHint": "Actualiza la tarjeta, establece la predeterminada, elimina — gestionado de forma segura por Stripe.",
      "noCustomerYet": "Aún no hay cliente en Stripe. Los métodos de pago estarán disponibles tras tu primera suscripción o compra de tokens.",
      "portalError": "No se puede abrir el portal de Stripe. Comprueba que el Worker esté en ejecución."
    },
    "tokens": {
      "title": "Tokens",
      "balance": "{balance} / {allocation} este ciclo",
      "balanceLoading": "Cargando saldo de tokens…",
      "manageTokens": "Gestionar tokens"
    },
    "usage": {
      "sectionTitle": "Uso de este periodo",
      "auditsLabel": "Auditorías",
      "seatsLabel": "Plazas",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Periodo: {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Facturas",
      "empty": "Aún no hay facturas.",
      "loading": "Cargando facturas…",
      "emptyAfterFirstCycle": "Las facturas aparecerán aquí tras tu primer ciclo de facturación.",
      "tableHeaders": {
        "date": "Fecha",
        "description": "Descripción",
        "amount": "Importe",
        "status": "Estado",
        "invoiceNumber": "Número de factura",
        "actions": "Acciones"
      },
      "statusUnknown": "desconocido",
      "actionView": "Ver",
      "actionPdf": "PDF",
      "managedInStripeNote": "El método de pago y los datos de facturación se gestionan de forma segura en Stripe."
    },
    "mockPlans": {
      "sectionTitle": "Planes",
      "currentBadge": "Actual",
      "free": "Free",
      "priceSuffix": "/mes",
      "switch": "Cambiar",
      "contactOwnerToChange": "Contacta con el propietario para cambiar de plan"
    },
    "mockConfirm": {
      "title": "Cambiar a {plan}",
      "body": "Esta es una acción simulada — no se realizará ningún cargo real.",
      "cancel": "Cancelar",
      "confirm": "Confirmar (simulado)"
    },
    "locked": {
      "title": "Acceso a facturación restringido",
      "subtitle": "Contacta con el propietario de tu espacio de trabajo para ver o gestionar la facturación.",
      "backToDashboard": "Volver al panel",
      "contactWorkspaceOwner": "Contactar con el propietario del espacio de trabajo",
      "askOwnerToast": "Solicita acceso a facturación al propietario de tu espacio de trabajo."
    },
    "success": {
      "headline": {
        "failed": "Error de sincronización",
        "active": "Tu plan {plan} está activo",
        "activating": "Gracias — tu suscripción se está activando"
      },
      "subtext": {
        "failedFallback": "No hemos podido finalizar tu suscripción automáticamente.",
        "redirecting": "Te estamos redirigiendo a Facturación…",
        "syncing": "Estamos sincronizando tu suscripción con Stripe."
      },
      "pill": {
        "failed": "Error de sincronización",
        "activated": "Suscripción activada",
        "syncing": "Sincronizando suscripción…",
        "almostDone": "Casi listo…"
      },
      "backToBilling": "Volver a Facturación",
      "retrySync": "Reintentar sincronización",
      "errors": {
        "stillProcessing": "El pago aún se está procesando. Espera un momento y vuelve a intentarlo.",
        "sessionInvalid": "Esta sesión de pago ya no es válida. Inicia una nueva suscripción.",
        "notSignedIn": "No has iniciado sesión. Inicia sesión y vuelve a intentarlo.",
        "orgLinkFailed": "No se ha podido vincular esta suscripción a tu organización. Contacta con el soporte.",
        "generic": "Algo ha salido mal al activar tu suscripción.",
        "noSessionDetected": "No hemos podido detectar tu sesión de pago. Vuelve a Facturación e inténtalo de nuevo."
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "Tokens",
      "subtitle": "Controla el uso, supervisa tu asignación mensual y compra recargas cuando lo necesites."
    },
    "locked": {
      "title": "Tokens no disponibles",
      "clientMessage": "Los tokens no son visibles desde una cuenta de cliente.",
      "workspaceMessage": "Los tokens no están disponibles para este espacio de trabajo.",
      "backToDashboard": "Volver al panel"
    },
    "webhook": {
      "notice": "Pago recibido. Esperando el webhook de Stripe para actualizar tu saldo de tokens.",
      "refreshBalance": "Actualizar saldo"
    },
    "balance": {
      "loading": "Cargando saldo…",
      "empty": "Aún no hay saldo de tokens. Se creará en tu primera auditoría.",
      "statBalance": "Saldo",
      "statMonthlyAllocation": "Asignación mensual",
      "statConsumed": "Consumido",
      "statRollover": "Saldo acumulado",
      "statTopups": "Recargas",
      "cycleEnds": "El ciclo termina: {cycleEnd}",
      "lastReset": "Último restablecimiento: {lastReset}"
    },
    "packs": {
      "sectionTitle": "Desbloquea más análisis",
      "sectionNote": "Los packs de tokens se facturan actualmente en USD. Los tokens de recarga no caducan nunca.",
      "readOnlyNotice": "Puedes ver los tokens, pero solo los propietarios, administradores y gestores de facturación pueden comprar packs.",
      "starterLabel": "Starter",
      "starterBlurb": "Completa un ciclo con saldo bajo.",
      "proLabel": "Pro",
      "proBlurb": "La recarga más habitual.",
      "maxLabel": "Max",
      "maxBlurb": "Un gran impulso para cargas de trabajo intensas.",
      "tokensUnit": "tokens",
      "amountPrefix": "+{amount}",
      "buyPack": "Desbloquear mi plan completo",
      "redirecting": "Redirigiendo…",
      "readOnlyButton": "Solo lectura"
    },
    "planUsage": {
      "title": "Uso del plan",
      "included": "{limit} auditorías/mes incluidas en tu plan",
      "thisMonth": "{used} / {limit} auditorías este mes",
      "unlimited": "Auditorías ilimitadas",
      "limitFree": "Has usado todas las {limit} auditorías incluidas. Cambia a un plan superior para seguir auditando.",
      "limitPaid": "Has usado {used}/{limit} auditorías — las auditorías adicionales ahora consumen tokens.",
      "upgradeCta": "Cambiar de plan"
    },
    "usage": {
      "sectionTitle": "Uso reciente",
      "loading": "Cargando uso…",
      "empty": "Aún no hay uso.",
      "colDate": "Fecha",
      "colModule": "Módulo",
      "colAction": "Acción",
      "colTokens": "Tokens",
      "colStatus": "Estado",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Compra de tokens completada. Tu saldo se actualizará en breve.",
      "purchaseCancelled": "Compra de tokens cancelada.",
      "buyForbidden": "Solo los propietarios, administradores o gestores de facturación pueden comprar packs de tokens."
    }
  },
  teamPage: {
    "header": {
      "title": "Equipo",
      "subtitlePrefix": "Gestiona quién tiene acceso a",
      "subtitleSuffix": "y qué puede hacer.",
      "subtitleFallbackOrg": "tu espacio de trabajo",
      "inviteButton": "+ Invitar miembro"
    },
    "stats": {
      "totalMembers": "Total de miembros",
      "active": "Activos",
      "pendingInvites": "Invitaciones pendientes",
      "adminsAndOwners": "Administradores y propietarios"
    },
    "filters": {
      "all": "Todos",
      "owners": "Propietarios",
      "admins": "Administradores",
      "billing": "Facturación",
      "members": "Miembros",
      "clients": "Clientes",
      "pending": "Pendientes"
    },
    "roles": {
      "owner": "Propietarios",
      "admin": "Administradores",
      "billing": "Facturación",
      "member": "Miembros",
      "client": "Clientes"
    },
    "emptyState": {
      "noMembers": "Aún no hay miembros en este espacio de trabajo.",
      "noMatch": "Ningún miembro coincide con el filtro \"{filter}\"."
    },
    "confirm": {
      "cancelInvite": "¿Cancelar esta invitación pendiente?",
      "regenerateLink": "¿Regenerar el enlace de invitación? El enlace anterior dejará de funcionar.",
      "removeMember": "¿Quitar a este miembro del espacio de trabajo? Esta acción no se puede deshacer."
    },
    "toast": {
      "cancelFailed": "Error al cancelar",
      "newLinkCopied": "Nuevo enlace de invitación copiado al portapapeles.",
      "regenerateFailed": "Error al regenerar",
      "roleUpdateFailed": "Error al actualizar el rol",
      "memberRemoved": "Miembro eliminado.",
      "removeFailed": "Error al eliminar",
      "memberDisabled": "Miembro deshabilitado.",
      "disableFailed": "Error al deshabilitar",
      "disableUnavailableMock": "La opción de deshabilitar no está disponible en la capa simulada.",
      "memberEnabled": "Miembro habilitado.",
      "enableFailed": "Error al habilitar",
      "enableUnavailableMock": "La opción de habilitar no está disponible en la capa simulada."
    },
    "pendingInvites": {
      "heading": "Invitaciones pendientes ({count})",
      "tableHeaders": {
        "email": "Correo electrónico",
        "role": "Rol",
        "expires": "Caduca",
        "actions": "Acciones"
      },
      "copyLink": "Copiar enlace",
      "regenerateLink": "Regenerar enlace",
      "cancel": "Cancelar",
      "linkHiddenNote": "Enlace oculto por seguridad. Haz clic en Regenerar enlace para emitir uno nuevo."
    },
    "rolesLegend": {
      "lead": "**Acerca de los roles —**",
      "owners": "Los **Propietarios** gestionan la facturación y la configuración del espacio de trabajo.",
      "admins": "Los **Administradores** gestionan los usuarios de la organización.",
      "billing": "Los usuarios de **Facturación** gestionan las facturas y la suscripción.",
      "members": "Los **Miembros** pueden usar las funciones de auditoría.",
      "clients": "Los **Clientes** tienen acceso limitado de solo lectura."
    },
    "footerHint": "Por ahora, las invitaciones son solo simuladas. El envío real de correos y Firebase Auth reemplazarán esta capa en la fase de backend."
  },
  orgCreate: {
    "heading": "Crear un espacio de trabajo",
    "subtitle": {
      "signedIn": "Sesión iniciada como {email}",
      "anonymous": "Configura un nuevo espacio de trabajo de organización"
    },
    "form": {
      "nameLabel": "Nombre del espacio de trabajo",
      "namePlaceholder": "p. ej. Acme Corp",
      "planLabel": "Plan"
    },
    "planDesc": {
      "free": "Hasta 3 auditorías, 1 puesto",
      "starter": "15 auditorías, 5 puestos",
      "professional": "30 auditorías, 20 puestos",
      "enterprise": "Límites personalizados, SSO, SLA"
    },
    "submit": {
      "idle": "Crear espacio de trabajo",
      "loading": "Creando espacio de trabajo…"
    },
    "backToDashboard": "← Volver al panel"
  },
  auditHistory: {
    "header": {
      "title": "Historial de auditorías",
      "subtitle": "Auditorías enviadas para este espacio de trabajo. Genera un informe para crear una instantánea que puedas compartir."
    },
    "states": {
      "loading": "Cargando el historial de auditorías…",
      "error": "No se pudo cargar el historial de auditorías. Inténtalo de nuevo más tarde."
    },
    "empty": {
      "title": "Aún no hay auditorías enviadas",
      "description": "Las auditorías enviadas aparecen aquí para este espacio de trabajo. Ejecuta una Nueva auditoría para empezar.",
      "startAudit": "+ Iniciar una auditoría"
    },
    "columns": {
      "submitted": "Enviada",
      "score": "Puntuación",
      "risk": "Riesgo",
      "findings": "Hallazgos"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Generar informe"
    },
    "toast": {
      "reportGenerated": "Informe generado"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Auditoría enviada",
        "preview": "Vista previa de la auditoría"
      },
      "title": "Resultado de la auditoría",
      "submissionId": "ID de envío {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Esto es lo que significa tu auditoría",
      "summary": {
        "overallScore": "Puntuación global {score}/100 — riesgo {risk}.",
        "findingsSingular": "{n} hallazgo en {m} acción recomendada.",
        "findingsPlural": "{n} hallazgos en {m} acciones recomendadas.",
        "maturity": "Madurez en IA: nivel {level} de 5."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agentes",
      "intro": "Encuentra agentes de IA que se ajusten a tu flujo de trabajo. Los agentes todo en uno de AiLunaPro aparecen destacados.",
      "locked": {
        "title": "Los agentes no están disponibles para las cuentas de cliente",
        "backToDashboard": "Volver al panel"
      },
      "filters": {
        "industryLabel": "Sector",
        "integrationLabel": "Integración",
        "allIndustries": "Todos los sectores",
        "allIntegrations": "Todas las integraciones",
        "clearFilters": "Borrar filtros",
        "clearRecommendationsHint": "Borra las recomendaciones para usar los filtros."
      },
      "loading": "Cargando agentes…",
      "emptyFiltered": "Ningún agente coincide con los filtros seleccionados.",
      "quoteBridgeTitle": "¿Listo para ponerlos en marcha?",
      "quoteBridgeCta": "Obtener un presupuesto para esto",
      "quoteBridgeSeed": "Proyecto de automatización con IA basado en mis agentes recomendados: {agents}",
      "sections": {
        "topRecommendations": "Mejores recomendaciones",
        "otherAgents": "Otros agentes"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} pts",
      "whyToggleOne": "¿Por qué? ({count} motivo)",
      "whyToggleOther": "¿Por qué? ({count} motivos)"
    },
    "recommendPanel": {
      "title": "Personalizar mis recomendaciones",
      "subtitle": "Añade algunas preferencias para clasificar los agentes que se ajusten a tu contexto.",
      "fields": {
        "industry": "Sector",
        "companySize": "Tamaño de la empresa",
        "targetWorkflow": "Flujo de trabajo objetivo",
        "subscriptionPlan": "Plan de suscripción",
        "currentMaturity": "Madurez actual en IA",
        "integrations": "Integraciones (separadas por comas, máx. 10)"
      },
      "placeholders": {
        "industry": "p. ej. retail, saas, sanidad",
        "integrations": "p. ej. hubspot, slack, email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Autónomo",
        "sme": "Pyme",
        "enterprise": "Gran empresa"
      },
      "maturityOptions": {
        "low": "Baja",
        "medium": "Media",
        "high": "Alta"
      },
      "workflowOptions": {
        "support": "Atención al cliente",
        "sales": "Ventas y seguimiento de leads",
        "finance": "Finanzas y facturación",
        "documents": "Documentos y contratos",
        "reporting": "Informes y paneles",
        "admin": "Trabajo administrativo",
        "compliance": "Cumplimiento y gobernanza",
        "marketing": "Marketing y contenido",
        "hr": "RR. HH. y gestión de personas"
      },
      "helperText": "Añade al menos una preferencia para personalizar las recomendaciones.",
      "submit": "Recomendar agentes",
      "submitting": "Calculando…",
      "clearRecommendations": "Borrar recomendaciones",
      "limitTitle": "Has alcanzado tu límite mensual.",
      "limitBody": "Has usado todas tus recomendaciones este mes.",
      "limitBodyCount": "Has usado tus {used} de {limit} recomendaciones este mes.",
      "upgradeCta": "Cambia a un plan superior para continuar",
      "usageProgress": "{used} / {limit} recomendaciones usadas este mes"
    },
    "card": {
      "external": "Externo",
      "savesPerMonth": "⏱ Ahorra ~{hours} h / mes",
      "moreIntegrations": "+{count}",
      "viewDetails": "Ver detalles",
      "getThisAgent": "Obtener este agente"
    },
    "detail": {
      "lockedNotice": "Los agentes no están disponibles para las cuentas de cliente.",
      "backToAgents": "← Volver a los agentes",
      "loading": "Cargando…",
      "errors": {
        "missingAgentId": "Falta el ID del agente",
        "missingOrgContext": "Falta el contexto de la organización"
      },
      "pills": {
        "external": "Externo",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "Configuración · {complexity}",
        "recommendedAllInOne": "Todo en uno recomendado",
        "compliance": "Cumplimiento",
        "audit": "Auditoría"
      },
      "cta": "Obtener este agente →",
      "sections": {
        "overview": "Resumen",
        "problemSolved": "Problema resuelto",
        "bestFit": "Mejor encaje",
        "integrations": "Integraciones",
        "expectedRoi": "ROI previsto",
        "pricing": "Precios"
      },
      "bestFit": {
        "industries": "Sectores",
        "companySize": "Tamaño de la empresa",
        "minBudget": "Presupuesto mínimo",
        "minBudgetValue": "{amount}/mes"
      },
      "roi": {
        "timeSaved": "Tiempo ahorrado",
        "timeSavedValue": "{hours} h/mes",
        "costSaved": "Coste ahorrado",
        "costSavedValue": "{amount}/mes",
        "payback": "Periodo de amortización",
        "paybackValue": "{months} meses"
      },
      "pricing": {
        "modelPrefix": "Modelo: **{model}**",
        "install": " · Instalación: {amount}",
        "monthly": " · Mensual: {amount}",
        "onRequest": " · Precio bajo solicitud"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Plan de acción guiado",
      "title": "Tu plan de acción",
      "intro": "Hemos traducido tus respuestas de la auditoría en un plan contextual y secuenciado. Lee cada sección a continuación: cada afirmación enlaza con tus datos.",
      "score": "Puntuación {globalScore} / 100",
      "backToResult": "← Volver al resultado"
    },
    "detected": {
      "eyebrow": "01 · Diagnóstico",
      "title": "Qué hemos detectado",
      "topIssuesLabel": "Principales problemas identificados",
      "noIssues": "✓ No hay problemas que destacar: la auditoría superó todas las reglas.",
      "weakestAreaLabel": "Área más débil",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "Cerrar la brecha de esta sección es la acción de mayor impacto sobre tu puntuación global.",
      "noWeakArea": "No se ha detectado ningún área débil."
    },
    "priorities": {
      "eyebrow": "02 · Prioridades",
      "title": "Qué deberías corregir primero",
      "intro": "De las {count} acciones recomendadas, estas tres te ofrecen el mayor retorno en relación con el esfuerzo. Cada una enlaza con los hallazgos que resuelve.",
      "whyItMattersLabel": "Por qué importa: ",
      "expectedOutcomeLabel": "Resultado esperado: ",
      "impactBadge": "Impacto {impact}",
      "timeframeDays": "{days}d",
      "closesFindingsOne": "resuelve {count} hallazgo",
      "closesFindingsOther": "resuelve {count} hallazgos",
      "startWithThis": "Empieza por aquí →",
      "startWithThisTooltip": "Próximamente tras J2",
      "mostLeverage": "Mayor impacto por el esfuerzo"
    },
    "operatingModel": {
      "eyebrow": "03 · Modelo operativo",
      "title": "Qué automatizar o estructurar",
      "intro": "Cada elemento a continuación tiene un modo de ejecución principal. Automatizar cuando deberías estructurar (o viceversa) es un patrón de fallo habitual.",
      "categories": {
        "automate": {
          "eyebrow": "Herramientas y sistemas",
          "title": "Automatizar",
          "tagline": "Elementos en los que el impacto proviene del sistema, no de la persona."
        },
        "structure": {
          "eyebrow": "Política y gobernanza",
          "title": "Estructurar",
          "tagline": "Elementos que requieren responsabilidad formal, política o alineación con un marco."
        },
        "process": {
          "eyebrow": "Actividad recurrente",
          "title": "Operar",
          "tagline": "Elementos que son procesos que mantienes en marcha con una cadencia."
        },
        "train": {
          "eyebrow": "Personas",
          "title": "Formar",
          "tagline": "Elementos que cambian el comportamiento mediante la formación."
        }
      },
      "actionsCountOne": "{count} acción",
      "actionsCountOther": "{count} acciones",
      "timeframeDays": "{days}d",
      "emptyColumn": "Aquí no hay nada por ahora."
    },
    "whyItMatters": {
      "eyebrow": "04 · Contexto",
      "title": "Por qué esto importa",
      "frameworksReferenced": "Marcos referenciados en esta evaluación"
    },
    "impact": {
      "eyebrow": "05 · Impacto",
      "title": "Impacto esperado en el negocio",
      "ifTop3": "Si completas las 3 acciones principales",
      "scoreLift": "Tu puntuación global proyectada pasa de {currentScore} a {projectedScore}. Se trata de una simulación orientativa basada en los hallazgos que resuelve cada acción; el avance real depende de la profundidad de la ejecución.",
      "projectedLabel": "Proyectado",
      "deltaPts": "+{delta} pts",
      "noChange": "sin cambios",
      "toneHighLift": "Gran mejora",
      "toneSteadyGain": "Avance constante",
      "toneHoldTheLine": "Mantener la posición",
      "outcomes": {
        "auditReadinessTitle": "Preparación para auditorías",
        "auditReadinessHigh": "Pasas de \"incompleto\" a \"defendible\" en un cuestionario de seguridad.",
        "auditReadinessSteady": "La postura actual queda documentada y resulta más fácil de referenciar en auditorías.",
        "incidentExposureTitle": "Exposición a incidentes",
        "incidentExposureHigh": "Menor radio de impacto y un tiempo medio de contención más rápido cuando la IA causa daños.",
        "incidentExposureSteady": "Respuesta predecible y responsabilidades más claras para incidentes específicos de IA.",
        "customerTrustTitle": "Confianza del cliente",
        "customerTrustHigh": "La divulgación, las fichas de modelo y la explicabilidad dan a tus equipos de soporte y ventas respuestas claras.",
        "internalVelocityTitle": "Velocidad interna",
        "internalVelocitySteady": "Los desarrolladores avanzan más rápido cuando las vías de política y revisión son inequívocas."
      },
      "disclaimer": "La puntuación proyectada es una simulación orientativa calculada a partir de la cobertura de los hallazgos y la ponderación de las secciones. No constituye una garantía."
    },
    "nextStep": {
      "eyebrow": "06 · Recomendado",
      "title": "Tu siguiente paso",
      "nextOneThing": "La próxima acción",
      "savedAt": "Guardado localmente a las {timestamp}.",
      "localOnlyNote": "Mantendremos este plan disponible localmente: sin subida de datos ni necesidad de mejorar tu cuenta. Vuelve cuando tu equipo esté listo para actuar.",
      "ctas": {
        "saveDefault": "✓ Guardar este plan de acción",
        "saved": "✓ Guardado",
        "reminderSet": "✓ Recordatorio configurado",
        "exported": "✓ Exportado",
        "remind7Day": "⏰ Configurar recordatorio a 7 días",
        "remind30Day": "⏰ Configurar recordatorio a 30 días",
        "remind60Day": "⏰ Configurar recordatorio a 60 días",
        "remindQuarterly": "⏰ Configurar revisión trimestral",
        "exportPlan": "⬇ Exportar plan"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "Operas en un contexto que los reguladores ya consideran de alto riesgo. El EU AI Act, el GDPR y las normas sectoriales (equivalentes a HIPAA, marcos de servicios financieros) imponen deberes adicionales cuando la IA procesa datos sensibles o toma decisiones trascendentes sobre las personas.",
        "customerFacingTransparency": "Tu IA está orientada al cliente, lo que implica que se aplican obligaciones de transparencia (EU AI Act Article 50, normas de protección al consumidor) y los riesgos reputacionales son mayores que en las herramientas internas.",
        "internalBaseline": "Incluso para el uso interno de IA, los marcos reconocidos (ISO/IEC 42001, NIST AI RMF) actúan cada vez más como referencia básica en la diligencia debida de proveedores y en los acuerdos con empresas.",
        "riskInactionHigh": "En tu banda de riesgo actual, el coste de la inacción es asimétrico. Un solo incidente —un modelo que filtra datos, una decisión injusta, una interrupción sin plan de respuesta— resulta materialmente más caro que las correcciones que se recomiendan a continuación.",
        "riskInactionMedium": "Te encuentras en una banda intermedia defendible. El riesgo ahora es estancarte: las organizaciones que se detienen aquí suelen retroceder a medida que crece su huella de IA. Cerrar las brechas de gravedad media consolida la postura actual.",
        "riskInactionLow": "Ya cuentas con una postura sólida. El riesgo es la regresión a medida que tu huella de IA crece. La inversión continua consiste principalmente en mantenimiento, documentación y una profundización gradual.",
        "weakestSection": "Tu área más débil es **{title}** ({score}%). Reforzarla aumenta directamente la puntuación global, pero, lo que es más importante, elimina la vía de menor resistencia para un incidente.",
        "commercialEnabler": "Los compradores corporativos y los clientes regulados solicitan cada vez más pruebas de gobernanza de IA en los cuestionarios de seguridad. Muchos de los elementos de tu plan de acción funcionan también como facilitadores comerciales, no solo como trabajo de cumplimiento."
      },
      "riskOneLiner": {
        "low": "Estás en buena forma: el foco pasa al mantenimiento y la mejora continua.",
        "medium": "Tienes una base defendible, pero con brechas materiales que conviene cerrar pronto.",
        "high": "Tienes varias brechas que aumentan materialmente tu exposición. Prioriza las acciones siguientes.",
        "critical": "Tienes una o más brechas críticas. Los elementos de máxima prioridad deberían abordarse en días, no en semanas."
      },
      "contextChips": {
        "highRiskIndustry": "Sector de alto riesgo",
        "sensitiveData": "Datos sensibles en el alcance",
        "customerFacing": "IA orientada al cliente",
        "missionCritical": "Alcance de misión crítica",
        "standardProfile": "Perfil de riesgo estándar"
      },
      "nextStep": {
        "criticalHeadline": "Aborda el hallazgo crítico en los próximos 7 días",
        "criticalRationaleFallback": "Es el elemento más relevante de tu plan de acción.",
        "highHeadline": "Empieza por las victorias rápidas de 30 días",
        "highRationaleFallback": "Una postura de alto riesgo responde con rapidez a un pequeño número de acciones específicas. Elige tres victorias rápidas de la hoja de ruta y hazte cargo de ellas este mes.",
        "mediumHeadline": "Consolida los cimientos de tu gobernanza",
        "mediumRationale": "Ya has superado la fase inicial de improvisación. El siguiente paso acumulativo es formalizar lo que haces de manera informal: una política por escrito, un marco reconocido, una escalada documentada. Esto es lo que convierte las auditorías y los acuerdos con empresas en algo rutinario.",
        "lowHeadline": "Pasa de cumplir a optimizar",
        "lowRationale": "Tu postura es sólida. El impacto ahora está en la documentación y la mejora continua: fichas de modelo, reciclajes de formación e integración de escenarios de IA en tus simulacros de respuesta a incidentes."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Puntuación de cumplimiento",
      "riskLabel": "Nivel de riesgo actual",
      "maturityLabel": "Nivel de madurez en IA",
      "nextStepLabel": "Siguiente paso recomendado",
      "nextStepTitle": "Completa la auditoría de la herramienta de selección de RR. HH.",
      "nextStepBody": "Esta auditoría está completada al 60 %. Terminarla aumentará tu puntuación de cumplimiento en unos +7 puntos estimados.",
      "continueAudit": "Continuar auditoría →",
      "toast": {
        "noPermission": "No tienes permiso para continuar auditorías.",
        "noDraft": "No se ha encontrado ninguna auditoría en borrador: se inicia una nueva auditoría."
      }
    },
    "recentReports": {
      "card": {
        "share": "Compartir",
        "view": "Ver"
      },
      "export": {
        "title": "Opciones de exportación",
        "blurb": "Exporta tus datos de cumplimiento en varios formatos para las partes interesadas.",
        "exportAs": "Exportar como {fmt}"
      },
      "toast": {
        "reportNotAvailable": "El informe aún no está disponible.",
        "shareLinkCopied": "Enlace para compartir copiado.",
        "shareLinkFailed": "No se ha podido copiar el enlace. Inténtalo de nuevo.",
        "noReportsToExport": "Aún no hay informes para exportar.",
        "csvDownloaded": "CSV descargado.",
        "jsonDownloaded": "JSON descargado."
      }
    },
    "cta": {
      "heading": "¿Listo para lograr el cumplimiento total en IA?",
      "body": "Únete a las organizaciones que utilizan AiLunaPro para automatizar sus flujos de trabajo de cumplimiento, reducir el riesgo y generar confianza con las partes interesadas.",
      "toast": {
        "alreadyActivePlan": "Ya tienes un plan activo.",
        "demoRequestSent": "Solicitud de demostración enviada. La revisaremos y nos pondremos en contacto contigo."
      },
      "demoModal": {
        "title": "Programar una demostración",
        "subtitle": "Cuéntanos un poco sobre tu equipo y nos pondremos en contacto.",
        "placeholderFullName": "Nombre completo",
        "placeholderWorkEmail": "Correo electrónico profesional",
        "placeholderCompany": "Empresa",
        "placeholderMessage": "¿Sobre qué te gustaría hablar?",
        "privacyNote": "Solo utilizamos estos datos para responder a tu solicitud.",
        "cancel": "Cancelar",
        "submit": "Solicitar demostración",
        "submitting": "Enviando…",
        "errorFallback": "No se ha podido enviar tu solicitud. Inténtalo de nuevo."
      }
    }
  },
  support: {
    "cta": "Contactar con soporte",
    "title": "Contactar con soporte",
    "subtitle": "Informa de un problema o haz una pregunta — te responderemos por correo.",
    "typeLabel": "¿Sobre qué es?",
    "typeBug": "Error",
    "typeQuestion": "Pregunta",
    "typeBilling": "Facturación",
    "descriptionLabel": "Descríbelo",
    "descriptionPlaceholder": "¿Qué ha pasado? Pasos, qué esperabas, cualquier detalle útil.",
    "emailLabel": "Correo",
    "emailPlaceholder": "tu@empresa.com",
    "priorityLabel": "Prioridad",
    "optional": "(opcional)",
    "prioLow": "Baja",
    "prioMedium": "Media",
    "prioHigh": "Alta",
    "submit": "Enviar",
    "submitting": "Enviando…",
    "success": "Gracias — tu mensaje se ha enviado. Te responderemos por correo.",
    "close": "Cerrar",
    "errType": "Elige un tipo.",
    "errDescription": "Describe el problema.",
    "errEmail": "Introduce un correo válido."
  },
  feedback: {
    "title": "¿Qué tal ha ido la experiencia?",
    "satisfactionLabel": "Valora tu experiencia",
    "sat1": "Muy mala",
    "sat2": "Mala",
    "sat3": "Normal",
    "sat4": "Buena",
    "sat5": "Excelente",
    "difficultyLabel": "¿Fue fácil de usar?",
    "diffEasy": "Fácil",
    "diffOk": "Normal",
    "diffHard": "Difícil",
    "blockerLabel": "¿Qué te impidió seguir adelante?",
    "blockerPlaceholder": "Opcional — cuéntanos qué te bloqueó",
    "suggestionLabel": "¿Algo que podamos mejorar?",
    "suggestionPlaceholder": "Opcional",
    "submit": "Enviar",
    "success": "Gracias — leemos cada comentario.",
    "dismissAria": "Cerrar comentario"
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "Diagnóstico de madurez en IA",
        "subtitle": "Responde a 8 preguntas breves. Obtén tu puntuación de madurez en IA y descubre qué agentes de AiLunaPro encajan con tu etapa.",
        "freeLine": "Gratis · No requiere cuenta · Tarda unos 2 minutos"
      },
      "resumeNotice": "Te damos la bienvenida de nuevo: hemos restaurado tus respuestas anteriores para que puedas continuar donde lo dejaste.",
      "questionLegend": "Pregunta {n} / {total}",
      "leadCapture": {
        "heading": "¿A dónde te enviamos tu resultado?",
        "emailLabel": "Correo electrónico",
        "requiredMark": "*",
        "emailPlaceholder": "tu@empresa.com",
        "companyNameLabel": "Nombre de la empresa",
        "optionalMark": "(opcional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Solo usamos esta información para generar tu diagnóstico y hacer un seguimiento sobre servicios de IA relevantes. No se requiere ninguna cuenta.",
        "consentLabel": "Acepto recibir el resultado de mi diagnóstico de IA y la información de seguimiento relevante de AiLunaPro. Entiendo que mis respuestas y mi correo electrónico se tratarán para generar y almacenar este resultado de diagnóstico, y que puedo solicitar la eliminación de mis datos en cualquier momento."
      },
      "submit": {
        "loading": "Calculando tu resultado…",
        "unlock": "Enviarme mi informe completo por correo →",
        "idle": "Obtener mi puntuación de madurez en IA"
      },
      "signInPrompt": "¿Ya tienes una cuenta?",
      "signInLink": "Iniciar sesión",
      "errors": {
        "answers": "Responde a todas las preguntas.",
        "email": "Introduce una dirección de correo electrónico válida.",
        "consent": "Debes aceptar para recibir tu resultado.",
        "captchaLoading": "El captcha se está cargando: espera un momento."
      },
      "buckets": {
        "low": {
          "title": "Tu madurez en IA es incipiente",
          "message": "Tu organización se encuentra en una etapa temprana. Empieza con automatización sencilla, un inventario del uso de IA y agentes de apoyo prácticos."
        },
        "medium": {
          "title": "Tu madurez en IA está en desarrollo",
          "message": "Ya cuentas con algunas bases de IA. El siguiente paso es estructurar el uso, medir el ROI y mejorar los flujos de trabajo de documentos e informes."
        },
        "high": {
          "title": "Tu madurez en IA es avanzada",
          "message": "Estás listo para escalar la IA con una gobernanza, un cumplimiento, unos informes y una automatización especializada más sólidos."
        }
      },
      "result": {
        "scoreLabel": "Tu puntuación de madurez en IA",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Agentes de AiLunaPro recomendados",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obtener este agente",
        "ctaHeading": "¿Quieres una auditoría más profunda y tu plan de acción completo?",
        "ctaBody": "Crea un espacio de trabajo gratuito de AiLunaPro para acceder a la auditoría completa, el registro y el catálogo de agentes.",
        "ctaButton": "Crea tu cuenta gratuita ↗",
        "ctaFootnote": "Continúa en **dashboard.ailunapro.com**: la plataforma AiLuna de agentes y soluciones de IA, el siguiente paso tras tu auditoría.",
        "retakeButton": "Volver a realizar el diagnóstico"
      }
    },
    "roi": {
      "header": {
        "title": "Calculadora de ROI de IA",
        "subtitle": "Estima el tiempo y el dinero que puedes ahorrar con los agentes de IA de AiLunaPro.",
        "freeLine": "Gratis · No requiere cuenta · Tarda alrededor de 1 minuto · USD"
      },
      "resumeNotice": "Te damos la bienvenida de nuevo: hemos restaurado tus datos anteriores para que puedas continuar donde lo dejaste.",
      "form": {
        "teamLegend": "Tu equipo",
        "teamSizeLabel": "Tamaño del equipo",
        "teamSizePlaceholder": "p. ej. 10",
        "monthlyHoursLabel": "Horas mensuales que tu equipo dedica a tareas repetitivas",
        "monthlyHoursPlaceholder": "p. ej. 80",
        "hourlyCostLabel": "Coste medio por hora (USD)",
        "targetWorkflowLabel": "Flujo de trabajo objetivo",
        "workflowPlaceholderOption": "Selecciona un flujo de trabajo…"
      },
      "leadCapture": {
        "legend": "¿A dónde te enviamos tu estimación?",
        "emailLabel": "Correo electrónico",
        "emailPlaceholder": "tu@empresa.com",
        "companyNameLabel": "Nombre de la empresa",
        "optionalMark": "(opcional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Solo usamos esta información para generar tu estimación y hacer un seguimiento sobre servicios de IA relevantes. No se requiere ninguna cuenta.",
        "consentLabel": "Acepto recibir mi estimación de ROI de IA y la información de seguimiento relevante de AiLunaPro. Entiendo que mis respuestas y mi correo electrónico se tratarán para generar y almacenar esta estimación, y que puedo solicitar la eliminación de mis datos en cualquier momento."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "Calculando…",
        "unlock": "Enviarme mi informe completo por correo →",
        "idle": "Revela mis ahorros"
      },
      "signInPrompt": "¿Ya tienes una cuenta?",
      "signInLink": "Iniciar sesión",
      "errors": {
        "teamSize": "El tamaño del equipo debe ser un número entero entre 1 y 10000.",
        "hours": "Las horas mensuales deben ser un número entre 0 y 10000.",
        "cost": "El coste por hora debe ser un número entre 1 y 1000 USD.",
        "workflow": "Selecciona un flujo de trabajo.",
        "email": "Introduce una dirección de correo electrónico válida.",
        "consent": "Debes aceptar para recibir tu estimación.",
        "captchaLoading": "El captcha se está cargando: espera un momento."
      },
      "result": {
        "monthlySavingsLabel": "Ahorro mensual estimado",
        "monthlySavingsUnit": "/mes",
        "yearlySavingsLabel": "Ahorro anual",
        "timeSavedLabel": "Tiempo ahorrado",
        "timeSavedValue": "{hours} h/mes",
        "paybackLabel": "Amortización",
        "paybackValue": "{months} meses",
        "paybackEmpty": "—",
        "disclaimer": "Se trata de una estimación basada en la información que has proporcionado y en supuestos de automatización conservadores. El ahorro real puede variar.",
        "pricingNote": "La amortización supone un coste de agente de referencia de {cost}/month; el precio real varía según el agente.",
        "recommendedAgentsHeading": "Agentes de AiLunaPro recomendados",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obtener este agente",
        "ctaHeading": "¿Quieres un análisis más profundo y tu plan de acción completo?",
        "ctaBody": "Crea un espacio de trabajo gratuito de AiLunaPro para acceder a la auditoría completa, el registro y el catálogo de agentes.",
        "ctaButton": "Crea tu cuenta gratuita ↗",
        "ctaFootnote": "Continúa en **dashboard.ailunapro.com**: la plataforma AiLuna de agentes y soluciones de IA, el siguiente paso tras tu auditoría.",
        "rerunButton": "Ejecutar otro cálculo"
      }
    },
    "quote": {
      "header": {
        "title": "Solicitar un presupuesto",
        "subtitle": "Obtén al instante un rango de precios indicativo para un proyecto a medida de agente de IA, automatización o sitio web.",
        "freeLine": "Estimación gratuita · No requiere cuenta · Solo indicativo"
      },
      "resumeNotice": "Te damos la bienvenida de nuevo: hemos restaurado tus selecciones anteriores.",
      "form": {
        "serviceLegend": "¿Qué necesitas?",
        "serviceLabel": "Tipo de servicio",
        "servicePlaceholder": "Selecciona un servicio…",
        "tierLabel": "Complejidad del proyecto",
        "tierPlaceholder": "Selecciona un nivel de complejidad…",
        "descriptionLabel": "Descripción del proyecto",
        "descriptionPlaceholder": "Describe brevemente tu proyecto, tus objetivos y las herramientas que integrar. No incluyas datos confidenciales ni personales.",
        "optionalLegend": "Algunos detalles más (opcional)",
        "businessSizeLabel": "Tamaño de la empresa",
        "urgencyLabel": "Urgencia",
        "budgetBandLabel": "Rango de presupuesto",
        "notSpecified": "Sin especificar"
      },
      "services": {
        "ai_agent": "Agente de IA",
        "automation": "Flujo de trabajo de automatización",
        "website": "Sitio web / aplicación web",
        "audit": "Auditoría de viabilidad"
      },
      "tiers": {
        "simple": "Simple",
        "contextual": "Contextual (MVP)",
        "autonomous": "Autónomo",
        "multi_agent": "Sistema multiagente",
        "intermediate": "Intermedio",
        "complex": "Complejo",
        "custom": "A medida / personalizado",
        "feasibility": "Estudio de viabilidad"
      },
      "businessSizes": {
        "solo": "En solitario / autónomo",
        "small": "Pequeña (2–20)",
        "medium": "Mediana (21–100)",
        "large": "Grande (100+)"
      },
      "urgencies": {
        "low": "Flexible",
        "standard": "Estándar",
        "high": "Urgente"
      },
      "budgetBands": {
        "under_10k": "Menos de $10k",
        "10k_50k": "$10k–$50k",
        "50k_150k": "$50k–$150k",
        "over_150k": "Más de $150k"
      },
      "requiredMark": "*",
      "submit": {
        "idle": "Obtener mi estimación"
      },
      "errors": {
        "service": "Elige un tipo de servicio.",
        "tier": "Elige un nivel de complejidad.",
        "description": "Describe tu proyecto (al menos 20 caracteres)."
      },
      "result": {
        "rangeLabel": "Rango de precios estimado",
        "openEndedSuffix": "+",
        "recommendedLabel": "Solución recomendada",
        "costOfDelay": "Cada mes de espera supone un coste real en tiempo y dinero perdidos.",
        "costOfDelayAmount": "Cada mes de espera te cuesta unos {amount} en tiempo y dinero perdidos.",
        "decisionHeading": "Tu decisión de un vistazo",
        "decisionSummaryStrong": "Inviertes {invest} para recuperar {yearly}/año — un retorno de {y1}× el primer año.",
        "decisionSummaryLong": "Inviertes {invest} para recuperar {yearly}/año — se amortiza en ~{months} meses.",
        "decisionReturnLabel": "Retorno primer año",
        "decisionThreeYearLabel": "Retorno a 3 años",
        "decisionBreakevenLabel": "Amortización",
        "decisionMultiple": "{mult}×",
        "decisionMonths": "~{months} meses",
        "ctaStartRecovering": "Empieza a recuperar {amount}/mes",
        "scopeHeading": "Lo que normalmente se incluye",
        "nextStepsHeading": "Próximos pasos",
        "opsCostNote": "Los proyectos de agentes de IA y de automatización conllevan también costes operativos (tokens, infraestructura) que normalmente añaden entre un {min} y un {max}% adicional sobre el desarrollo.",
        "disclaimer": "Estimación indicativa y no contractual, únicamente con fines presupuestarios: solo a título informativo. El precio final depende de un alcance detallado.",
        "ctaHeading": "¿Listo para avanzar?",
        "ctaBody": "Crea un espacio de trabajo gratuito de AiLunaPro para generar un presupuesto en PDF con tu marca y empezar tu proyecto.",
        "ctaButton": "Crea tu cuenta gratuita ↗",
        "rerunButton": "Empezar de nuevo"
      },
      "solutions": {
        "ai_agent.simple": "Agente de IA simple",
        "ai_agent.contextual": "Agente de IA contextual (MVP)",
        "ai_agent.autonomous": "Agente de IA autónomo",
        "ai_agent.multi_agent": "Sistema multiagente",
        "automation.simple": "Flujo de trabajo de automatización simple",
        "automation.contextual": "Flujo de trabajo de automatización contextual",
        "automation.autonomous": "Sistema de automatización autónomo",
        "automation.multi_agent": "Plataforma de automatización multiagente",
        "website.simple": "Sitio web simple",
        "website.intermediate": "Sitio web intermedio",
        "website.complex": "Plataforma web compleja",
        "website.custom": "Plataforma a medida / personalizada",
        "audit.feasibility": "Estudio de viabilidad y alcance"
      },
      "scope": {
        "discovery": "Taller de descubrimiento y requisitos",
        "design": "Diseño y arquitectura de la solución",
        "integration": "Integración con tus herramientas (CRM/ERP, API)",
        "deployment": "Despliegue y entrega",
        "monitoring": "Configuración de monitorización y soporte",
        "mapping": "Mapeo de procesos y diseño de flujos de trabajo",
        "build": "Construcción y desarrollo",
        "content": "Configuración de contenido y datos",
        "launch": "Lanzamiento y puesta en marcha",
        "assessment": "Evaluación del estado actual",
        "gapAnalysis": "Análisis de brechas",
        "recommendations": "Recomendaciones priorizadas",
        "roadmap": "Hoja de ruta de implementación"
      },
      "nextSteps": {
        "discoveryCall": "Reserva una llamada de descubrimiento para afinar el alcance",
        "scoping": "Recibe un documento detallado de alcance",
        "proposal": "Obtén una propuesta formal y un calendario"
      },
      "generate": {
        "button": "Recibir mi plan personalizado",
        "cost": "{n} tokens",
        "loading": "Generando…",
        "success": "Tu presupuesto se ha generado y guardado en tu espacio de trabajo.",
        "error": "No se pudo generar el presupuesto. Inténtalo de nuevo.",
        "needOrg": "Selecciona un espacio de trabajo para generar un presupuesto."
      },
      "guided": {
        "goalsLabel": "Objetivos habituales — selecciona los que apliquen",
        "detailsLabel": "¿Algo más? (opcional)",
        "detailsPlaceholder": "Añade detalles: herramientas a integrar, plazos, imprescindibles… No incluyas datos confidenciales ni personales.",
        "paymentNote": "En los proyectos a medida, el pago suele realizarse por transferencia bancaria contra factura. Se generará una factura final tras la validación del proyecto. Esta estimación es indicativa y no contractual.",
        "selectError": "Selecciona al menos un objetivo o añade una breve descripción.",
        "suggestions": {
          "support": "Automatizar la atención al cliente",
          "crm": "Conectar la IA a mi CRM",
          "workflows": "Automatizar flujos de trabajo internos",
          "dataEntry": "Automatizar la entrada de datos",
          "reporting": "Informes y análisis automatizados",
          "integrations": "Integrar mis herramientas actuales",
          "notifications": "Notificaciones y alertas automatizadas",
          "dataSync": "Sincronizar datos entre sistemas",
          "showcase": "Mostrar mi empresa",
          "leads": "Generar clientes potenciales",
          "ecommerce": "Vender en línea (e-commerce)",
          "dashboard": "Panel / portal interno",
          "booking": "Reservas / citas en línea",
          "feasibility": "Evaluar la viabilidad",
          "readiness": "Comprobar la preparación para IA / EU AI Act",
          "vendorCompare": "Comparar soluciones / proveedores",
          "roadmap": "Obtener una hoja de ruta de implementación"
        }
      },
      "pdf": {
        "download": "Descargar PDF",
        "docTitle": "Presupuesto del proyecto",
        "summaryHeading": "Resumen del proyecto",
        "pricingHeading": "Inversión estimada"
      },
      "email": {
        "clientLabel": "Correo del cliente (opcional) — déjalo vacío para enviártelo a ti",
        "clientPlaceholder": "cliente@empresa.com",
        "button": "Enviarme este presupuesto por correo",
        "sent": "Presupuesto enviado a tu correo.",
        "error": "No se pudo enviar el correo. Inténtalo de nuevo."
      },
      "send": {
        "heading": "Envía la propuesta a tu cliente",
        "intro": "Introduce el correo de tu cliente y tu presupuesto propuesto — le enviaremos la propuesta por correo para que la acepte o solicite cambios.",
        "emailLabel": "Correo del cliente",
        "emailRequired": "El correo del cliente es obligatorio para enviar la propuesta.",
        "budgetBelowMin": "El presupuesto debe ser al menos {min} (el mínimo estimado).",
        "submit": "Enviar propuesta al cliente",
        "hint": "Tu cliente recibe la propuesta y acepta el presupuesto o solicita cambios.",
        "sentTo": "Propuesta enviada a {email}",
        "sentNext": "Te avisaremos cuando tu cliente responda. Haz el seguimiento en el Admin Center.",
        "track": "Abrir el Admin Center"
      },
      "override": {
        "toggle": "Ajustar precio (admin)",
        "minLabel": "Mín (USD)",
        "maxLabel": "Máx (USD)",
        "reasonLabel": "Justificación",
        "save": "Guardar ajuste",
        "error": "No se pudo guardar el ajuste.",
        "invalid": "Introduce un mín/máx (USD) válido y una breve justificación.",
        "adjustedNote": "Precio ajustado: {range}"
      },
      "proposal": {
        "execSummaryTemplate": "Esta propuesta describe {solution} adaptado a tus objetivos y herramientas actuales.",
        "solutionHeading": "Solución propuesta",
        "paymentHeading": "Pago",
        "timelineHeading": "Cronograma indicativo",
        "coverClient": "Preparado para",
        "coverDate": "Fecha",
        "coverValid": "Válido hasta",
        "coverRef": "Referencia",
        "solutionDesc": {
          "ai_agent": "Un agente de IA a medida que automatiza tus objetivos y se conecta con tus herramientas actuales (CRM/ERP, API).",
          "automation": "Un flujo de automatización que conecta tus herramientas y elimina las tareas manuales repetitivas.",
          "website": "Un sitio web o plataforma profesional creado en torno a tus objetivos de negocio.",
          "audit": "Un estudio de viabilidad y alcance que reduce el riesgo antes de cualquier desarrollo."
        },
        "timeline": {
          "agent": "Descubrimiento y diseño — 1–2 semanas\nDesarrollo e integración — 4–8 semanas\nPruebas y despliegue — 1–2 semanas",
          "website": "Descubrimiento y diseño — 1–2 semanas\nDesarrollo — 3–6 semanas\nContenido y lanzamiento — 1 semana",
          "audit": "Evaluación — 1 semana\nAnálisis y recomendaciones — 1 semana"
        },
        "justification": {
          "heading": "Cómo se calcula esta estimación",
          "market": "Basado en referencias de mercado de 2026 para proyectos {category} de complejidad {tier}.",
          "complexity": "Refleja la complejidad {tier} del proyecto.",
          "scope": "Cubre {count} líneas de trabajo principales, incluida la integración con tus herramientas.",
          "ops": "Los proyectos de agentes de IA y automatización añaden un {min}–{max}% de costes operativos (tokens, infraestructura)."
        }
      },
      "accepted": {
        "bankProceedCta": "Continuar con transferencia bancaria",
        "bankMessage": "Para proyectos de más de 15 000 $, el pago se realiza de forma segura mediante transferencia bancaria.",
        "title": "Tu respuesta ha sido enviada",
        "s1": "Estamos revisando tu solicitud",
        "s2": "Un experto confirmará el importe final",
        "s3": "Recibirás una factura",
        "s4": "Después realizas el pago",
        "trackCta": "Seguir tu solicitud",
        "viewInvoice": "Ver tu factura",
        "emailTitle": "Un paso por dar",
        "emailBody": "Para confirmar y recibir tu factura, acepta la propuesta en tu espacio de trabajo de AiLunaPro.",
        "confirmTitle": "Confirma el presupuesto propuesto",
        "confirmBody": "Confirma para aceptar el presupuesto propuesto — prepararemos tu factura y avisaremos a nuestro equipo.",
        "confirmCta": "Aceptar presupuesto propuesto",
        "confirming": "Confirmando…",
        "confirmError": "Algo salió mal. Inténtalo de nuevo o responde al correo de tu presupuesto.",
        "discussConfirmBody": "Confirma para enviar tu solicitud de ajuste a nuestro equipo.",
        "discussCta": "Enviar solicitud",
        "sentTitle": "Solicitud recibida",
        "sentBody": "Hemos recibido tu solicitud y nos pondremos en contacto para ajustar la propuesta.",
        "discussTitle": "Solicitar un ajuste de precio",
        "discussBody": "Para solicitar un cambio, responde al correo de tu propuesta y te daremos seguimiento.",
        "back": "Volver a la herramienta de presupuestos"
      },
      "flow": {
        "heading": "Cómo funciona",
        "s1": "Acepta la propuesta",
        "s2": "Confirmamos el importe final",
        "s3": "Recibes tu factura",
        "s4": "Realizas el pago"
      },
      "decision": {
        "priceLabel": "Tu precio",
        "suggestedLabel": "Precio sugerido (sistema)",
        "finalLabel": "Precio final enviado (USD)",
        "reasonPlaceholder": "Motivo del ajuste (opcional)",
        "resetPrice": "Restablecer",
        "billedUsd": "Facturado en USD. El cliente lo ve convertido a su moneda.",
        "adjustHeading": "Propón tu presupuesto",
        "messagePlaceholder": "Añade un mensaje — ¿qué te gustaría ajustar?",
        "messageSend": "Enviar solicitud",
        "budgetLabel": "Tu presupuesto propuesto",
        "budgetIntro": "Este es el importe que propones. Tu cliente lo valida o solicita un ajuste.",
        "budgetPlaceholder": "ej. 50000",
        "rangeLabel": "Rango estimado",
        "verdictBelow": "Tu presupuesto está por debajo del rango estimado.",
        "verdictWithin": "Tu presupuesto está dentro del rango estimado.",
        "verdictAbove": "Tu presupuesto está por encima del rango estimado.",
        "budgetRequired": "Introduce tu presupuesto antes de enviar.",
        "submitHint": "Tu cliente validará este importe o solicitará un ajuste.",
        "accept": "Enviar mi presupuesto",
        "discuss": "Solicitar un ajuste de precio",
        "accepted": "Estimación aceptada — te contactaremos en breve.",
        "discussionSent": "Solicitud enviada — nos pondremos en contacto para hablarlo.",
        "error": "No se pudo guardar tu decisión. Inténtalo de nuevo."
      },
      "progress": {
        "submit": "Enviar",
        "review": "Revisión",
        "validation": "Validación",
        "invoice": "Factura"
      },
      "status": {
        "title": "Seguimiento de tu solicitud",
        "intro": "Aquí puedes ver en qué punto de nuestro proceso está tu solicitud. Te enviaremos un correo en cada paso.",
        "reviewNote": "Un experto está revisando tu solicitud y confirmará el importe final.",
        "nextStep": "Siguiente paso: un administrador confirmará el importe.",
        "payNow": "Pagar ahora",
        "payReady": "Tu factura está lista: paga de forma segura ahora.",
        "openPanel": "Abrir el panel de facturas",
        "stateReview": "Revisión",
        "stateNegotiation": "Negociación",
        "stateWaiting": "Esperando al administrador",
        "stateInvoice": "Factura",
        "budgetLabel": "Tu presupuesto propuesto",
        "waitingValidation": "Esperando validación",
        "bank": {
          "heading": "Instrucciones de transferencia bancaria",
          "secureNote": "Realiza tu pago mediante transferencia bancaria segura con los datos siguientes.",
          "cardHint": "Pago seguro por transferencia bancaria",
          "amountLabel": "Importe",
          "referenceLabel": "Referencia de pago",
          "companyLabel": "Empresa",
          "bankLabel": "Banco",
          "ibanLabel": "IBAN",
          "swiftLabel": "SWIFT / BIC",
          "deadlineLabel": "Pagar antes del",
          "initiateBtn": "He realizado la transferencia",
          "awaitingConfirm": "Gracias — lo confirmaremos en cuanto llegue tu transferencia.",
          "invoiceNote": "Se emite una factura una vez recibido el pago."
        },
        "waitingActive": "Estamos finalizando tu importe: podrás pagar en cuanto esté listo.",
        "back": "Volver a la herramienta de presupuestos"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Bajo",
      "medium": "Medio",
      "high": "Alto",
      "critical": "Crítico",
      "completed": "Completado",
      "inProgress": "En curso",
      "draft": "Borrador",
      "published": "Publicado",
      "archived": "Archivado",
      "effortLow": "Esfuerzo bajo",
      "effortMedium": "Esfuerzo medio",
      "effortHigh": "Esfuerzo alto"
    },
    "riskWord": {
      "critical": "Riesgo crítico",
      "high": "Riesgo alto",
      "medium": "Riesgo medio",
      "low": "Riesgo bajo",
      "minimal": "Riesgo mínimo"
    },
    "approval": {
      "approved": "Aprobado",
      "pending": "Pendiente",
      "underReview": "En revisión",
      "rejected": "Rechazado"
    },
    "oversight": {
      "hitl": "Humano en el bucle",
      "hotl": "Humano sobre el bucle",
      "oot": "Autónomo"
    },
    "dataTypes": {
      "pii": "Datos personales (PII)",
      "health": "Datos de salud",
      "financial": "Financieros / transaccionales",
      "biometric": "Biométricos",
      "children": "Datos de menores",
      "public": "Públicos / abiertos",
      "internal": "Documentos internos",
      "employee": "Datos de empleados"
    },
    "confidence": {
      "low": "baja",
      "medium": "media",
      "high": "alta"
    },
    "memberStatus": {
      "active": "Activo",
      "pending": "Pendiente",
      "invited": "Invitado",
      "disabled": "Deshabilitado"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automatiza las respuestas a clientes y reduce la carga del soporte.",
        "description": "Agente de IA diseñado para responder a preguntas frecuentes, cualificar solicitudes de soporte, enrutar tickets y asistir a los equipos de atención al cliente. Ayuda a las empresas a estructurar un primer nivel de soporte disponible de forma continua sin reemplazar a los equipos humanos.",
        "problemSolved": "Tiempos de respuesta lentos, solicitudes repetitivas y equipos de soporte saturados."
      },
      "sales-agent": {
        "tagline": "Cualifica prospectos y prepara los seguimientos comerciales.",
        "description": "Agente de IA orientado a ventas, diseñado para cualificar leads, preparar respuestas comerciales, generar seguimientos y estructurar oportunidades. Ayuda a los equipos de ventas a ahorrar tiempo en tareas repetitivas y a mejorar el seguimiento de prospectos.",
        "problemSolved": "Prospectos mal cualificados, seguimientos olvidados y tiempo comercial desperdiciado."
      },
      "finance-agent": {
        "tagline": "Asiste con facturas, presupuestos y cobros.",
        "description": "Agente de IA diseñado para ayudar a clasificar documentos financieros, preparar presupuestos, hacer seguimiento de facturas, generar recordatorios de cobro y señalar anomalías sencillas. No reemplaza a un contable, pero reduce notablemente el tiempo administrativo financiero.",
        "problemSolved": "Procesamiento manual de facturas, cobros tardíos y errores de introducción de datos."
      },
      "hr-agent": {
        "tagline": "Asiste a los equipos de RR. HH. con cribado, resúmenes y documentación.",
        "description": "Agente de IA diseñado para apoyar tareas repetitivas de RR. HH. como resúmenes de CV, notas de candidatos, respuestas internas, documentación de empleados y seguimiento administrativo de RR. HH. Ayuda a los equipos a estructurar la información y a reducir el tiempo dedicado al trabajo documental manual.",
        "problemSolved": "Los equipos de RR. HH. pierden tiempo en el cribado de documentos, respuestas repetitivas y seguimiento manual."
      },
      "compliance-agent": {
        "tagline": "Ayuda a estructurar el cumplimiento, los riesgos y los registros de IA.",
        "description": "Agente de IA diseñado para apoyar la documentación de cumplimiento, los controles internos, la preparación del registro de IA y los planes de mitigación. Resulta especialmente útil para organizaciones expuestas a obligaciones de gobernanza, trazabilidad y cumplimiento en materia de IA.",
        "problemSolved": "Las organizaciones carecen de una visibilidad clara sobre el cumplimiento de la IA, con documentación dispersa y riesgos de IA sin gestionar."
      },
      "marketing-agent": {
        "tagline": "Genera contenidos, campañas e ideas de marketing.",
        "description": "Agente de IA diseñado para generar publicaciones, correos electrónicos, contenidos de páginas de destino, ideas de campañas, resúmenes y recursos de marketing adaptados al perfil de la empresa. Ayuda a los equipos pequeños a publicar con mayor regularidad sin multiplicar las herramientas.",
        "problemSolved": "Los equipos de marketing tienen dificultades con la coherencia del contenido, la creación que consume mucho tiempo y los recursos de campaña dispersos."
      },
      "reporting-agent": {
        "tagline": "Crea resúmenes, paneles e informes para la toma de decisiones.",
        "description": "Agente de IA diseñado para transformar datos e información internos en resúmenes, informes, planes de acción y análisis listos para la dirección. Ayuda a líderes y responsables a obtener una visión más clara sin dedicar horas a consolidar la información manualmente.",
        "problemSolved": "Los informes manuales tardan demasiado en elaborarse y los responsables de la toma de decisiones carecen de resúmenes concisos."
      },
      "audit-agent": {
        "tagline": "Apoya la auditoría de IA, la evaluación de madurez y los planes de acción.",
        "description": "Agente de IA diseñado para ayudar a estructurar auditorías, analizar respuestas, identificar riesgos y elaborar recomendaciones accionables. Conecta la auditoría de IA, el cumplimiento y la transformación del negocio en un flujo de trabajo práctico.",
        "problemSolved": "Las auditorías de IA consumen mucho tiempo, se analizan manualmente y resultan difíciles de priorizar."
      },
      "document-agent": {
        "tagline": "Clasifica, resume y extrae información de los documentos.",
        "description": "Agente de IA diseñado para procesar documentos, extraer información clave, generar resúmenes y organizar archivos. Resulta útil para organizaciones que manejan numerosos adjuntos, contratos, informes, expedientes de RR. HH., documentos financieros o evidencias de cumplimiento.",
        "problemSolved": "Los documentos están mal organizados, son lentos de buscar y costosos de resumir manualmente."
      },
      "admin-agent": {
        "tagline": "Automatiza el trabajo administrativo diario.",
        "description": "Agente de IA de uso general para correos electrónicos, citas, seguimientos, resúmenes, notas, organización de tareas y flujos de trabajo administrativos diarios. Ayuda a fundadores, profesionales independientes y equipos pequeños a ahorrar tiempo en el trabajo operativo repetitivo.",
        "problemSolved": "El trabajo administrativo consume demasiado tiempo, las tareas son repetitivas y la organización es manual."
      }
    },
    "industries": {
      "all": "Todos",
      "b2b": "B2B",
      "construction": "Construcción",
      "consulting": "Consultoría",
      "creator": "Creadores de contenido",
      "ecommerce": "Comercio electrónico",
      "education": "Educación",
      "enterprise": "Gran empresa",
      "finance": "Finanzas",
      "healthcare": "Sanidad",
      "legal": "Legal",
      "public-sector": "Sector público",
      "real-estate": "Inmobiliario",
      "retail": "Comercio minorista",
      "saas": "SaaS",
      "services": "Servicios"
    },
    "companySize": {
      "enterprise": "Gran empresa",
      "sme": "PYME",
      "solo": "Autónomo"
    },
    "profile": {
      "high": "Alto",
      "medium": "Medio"
    },
    "complexity": {
      "high": "Alta",
      "low": "Baja",
      "medium": "Media"
    },
    "model": {
      "subscription": "Suscripción"
    },
    "integrations": {
      "accounting": "Contabilidad",
      "audit-ai": "Auditoría de IA",
      "calendar": "Calendario",
      "cloud-storage": "Almacenamiento en la nube",
      "compliance-tools": "Herramientas de cumplimiento",
      "crm": "CRM",
      "dashboard": "Panel de control",
      "documents": "Documentos",
      "email": "Correo electrónico",
      "helpdesk": "Centro de asistencia",
      "hris": "HRIS",
      "registry": "Registro",
      "social-media": "Redes sociales",
      "spreadsheet": "Hoja de cálculo",
      "website": "Sitio web"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "¿Cómo se usa la IA actualmente en tu organización?",
        "options": {
          "none": "Todavía no usamos IA",
          "individual": "Algunas personas usan IA de forma individual",
          "team": "Varios equipos usan herramientas de IA",
          "structured": "La IA se usa en flujos de trabajo estructurados"
        }
      },
      "process_automation": {
        "label": "¿Qué parte de tu trabajo repetitivo está automatizada hoy?",
        "options": {
          "none": "Casi nada está automatizado",
          "basic": "Hay algunas tareas sencillas automatizadas",
          "moderate": "Algunos flujos de trabajo importantes están automatizados",
          "advanced": "La automatización forma parte de las operaciones diarias"
        }
      },
      "data_readiness": {
        "label": "¿Hasta qué punto están tus datos preparados para usar IA?",
        "options": {
          "scattered": "Los datos están dispersos y son difíciles de consultar",
          "partial": "Algunos datos están organizados",
          "mostly_ready": "La mayoría de los datos clave están estructurados",
          "ready": "Los datos están limpios, accesibles y se actualizan con regularidad"
        }
      },
      "compliance_awareness": {
        "label": "¿Hasta qué punto estás preparado para la gobernanza y el cumplimiento en IA?",
        "options": {
          "unknown": "Todavía no hemos evaluado los riesgos de la IA",
          "basic": "Conocemos los riesgos de la IA, pero no tenemos ningún proceso",
          "documented": "Algunos casos de uso de IA están documentados",
          "governed": "Tenemos procesos claros de gobernanza y revisión de la IA"
        }
      },
      "shadow_ai": {
        "label": "¿Sabes qué herramientas de IA se usan en toda la empresa?",
        "options": {
          "no_visibility": "No, no tenemos visibilidad",
          "partial_visibility": "Conocemos algunas herramientas, pero no todas",
          "mostly_visible": "Hacemos seguimiento de la mayoría de las herramientas de IA",
          "full_inventory": "Mantenemos un inventario claro de las herramientas de IA"
        }
      },
      "business_impact": {
        "label": "¿Con qué claridad mides el impacto de la IA en el negocio?",
        "options": {
          "not_measured": "Todavía no lo medimos",
          "qualitative": "Solo tenemos opiniones cualitativas",
          "some_metrics": "Hacemos seguimiento de algún ahorro de tiempo o coste",
          "clear_roi": "Medimos el ROI y los resultados de negocio"
        }
      },
      "team_skills": {
        "label": "¿Qué nivel de confianza tienen tus equipos para usar la IA de forma responsable?",
        "options": {
          "low": "Confianza muy limitada",
          "basic": "Familiaridad básica",
          "good": "Buena confianza para tareas habituales",
          "strong": "Prácticas sólidas de IA responsable"
        }
      },
      "implementation_priority": {
        "label": "¿Cuál es tu principal prioridad en IA ahora mismo?",
        "options": {
          "save_time": "Ahorrar tiempo en trabajo repetitivo",
          "improve_sales": "Mejorar las ventas o el seguimiento de clientes",
          "support_customers": "Mejorar la atención al cliente",
          "compliance": "Mejorar el cumplimiento y la gobernanza en IA",
          "documents": "Procesar documentos e informes más rápido"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "Atención al cliente",
    "sales": "Ventas y seguimiento de clientes potenciales",
    "finance": "Finanzas y facturación",
    "documents": "Documentos y contratos",
    "reporting": "Informes y cuadros de mando",
    "admin": "Trabajo administrativo",
    "compliance": "Cumplimiento y gobernanza",
    "marketing": "Marketing y contenidos",
    "hr": "RR. HH. y gestión de personas"
  },
  auditTools: {
    nav: {
      worksheetLabel: "Auditoría Tiempo → Dinero",
      worksheetHint: "Con tus datos reales, tarea por tarea",
      visibilityLabel: "Visibilidad en IA y redes",
      visibilityHint: "Presencia en ChatGPT/Perplexity + auditoría social",
    },
    worksheet: {
      title: "Auditoría Tiempo → Dinero",
      subtitle: "Introduce tus datos reales (sin estimaciones). Para cada tarea, la herramienta calcula su veredicto, su coste anual real y las horas recuperables. Elige tu moneda y el periodo de tus ingresos (mes/año/semana): la herramienta se adapta a tu país.",
      profile: {
        sectionTitle: "① Tu perfil",
        incomeMonth: "Ingresos netos mensuales",
        incomeYear: "Ingresos netos anuales",
        incomeWeek: "Ingresos netos semanales",
        periodLabel: "Periodo de ingresos",
        periodMonth: "al mes",
        periodYear: "al año",
        periodWeek: "a la semana",
        currencyLabel: "Moneda",
        hoursLabel: "Horas / semana",
        hourlyRate: "→ Tarifa por hora",
        perHour: "/ h",
        invalidHint: "Introduce unos ingresos y unas horas > 0 para calcular la tarifa por hora.",
        helperPrompt: "¿No sabes tus horas/semana?",
        helperHoursPerDay: "Horas / día",
        helperDaysPerWeek: "Días / semana",
        helperCalc: "Calcular mis horas",
      },
      tasks: {
        sectionTitle: "② Tus tareas",
        tip: "Consejo: escribe el título exacto (verbo + objeto), p. ej. \"revisar las propuestas\", no \"administración\".",
        colTask: "Tarea",
        colHours: "H / sem",
        colWho: "¿Quién puede hacerlo?",
        colRules: "¿Reglas claras?",
        colEnergy: "Energía",
        colVerdict: "Veredicto",
        colCost: "Coste / año",
        colRecovered: "H rec.",
        taskPlaceholder: "Nombre de la tarea",
        addRow: "+ Añadir una tarea",
        addCommon: "+ Añadir una tarea común…",
        addCommonHint: "¿No sabes qué añadir? Elige una tarea común.",
        splitInto: "Dividir en {n} tareas",
      },
      who: { self: "Solo yo", specialist: "Un especialista formado", anyone: "Cualquier persona formada" },
      rules: { yes: "Sí", no: "No" },
      energy: { energizing: "Estimulante", neutral: "Neutra", draining: "Agotadora" },
      verdict: { keep: "✅ MANTENER", automate: "🤖 AUTOMATIZAR", delegate: "→ DELEGAR", rethink: "⚠️ REPLANTEAR" },
      summary: {
        recoveredHoursYear: "Horas recuperables / año",
        recoveredValueYear: "Valor recuperable / año",
        toAutomate: "Por automatizar",
        toDelegate: "Por delegar",
      },
      quickWins: {
        title: "③ Haz esto primero (Quick-Wins)",
        sub: "Tareas recuperables ordenadas por impacto (coste/año) ÷ esfuerzo. Empieza por arriba.",
        effortLow: "bajo",
        effortMed: "medio",
        effortLabel: "esfuerzo",
        perYearSuffix: "/año",
      },
      cta: {
        headline: "Puedes recuperar {value} al año.",
        body: "{count} tarea(s) por automatizar o delegar. Calculamos el precio de la implementación en un presupuesto a medida.",
        button: "Crear mi plan de automatización →",
      },
      actions: {
        save: "💾 Guardar",
        loadExample: "Cargar un ejemplo",
        reset: "Restablecer",
        savedCloud: "Auditoría guardada ✓ (nube + local)",
        savedLocal: "Auditoría guardada ✓ (local en este dispositivo)",
        needProfile: "Completa el perfil y al menos una tarea.",
        loadOk: "Auditoría cargada ✓",
        loadFail: "No se pudo cargar.",
        deleteFail: "No se pudo eliminar.",
      },
      savedList: {
        title: "Mis auditorías guardadas",
        perYear: "/año rec.",
        cloud: "nube",
        local: "local",
        load: "Cargar",
        delete: "Eliminar",
      },
      verdictRule: "Veredicto: Solo yo + estimulante → Mantener · de lo contrario Replantear. Si no, Cualquiera + reglas claras → Automatizar · de lo contrario Delegar.",
      quoteSeedMain: "Automatizar / delegar {count} tarea(s) identificada(s) mediante la Auditoría Tiempo → Dinero (≈ {value}/año recuperables)",
      quoteSeedTasks: ". Tareas: {tasks}.",
      quoteSeedEnd: ".",
    },
    visibility: {
      title: "Autoevaluación de visibilidad en IA y redes",
      subtitle: "Evalúa tu presencia en las respuestas de IA (GEO) y en las redes sociales. Responde No / Parcial / Sí; la puntuación y las recomendaciones se actualizan en tiempo real.",
      disclaimer: "Indicador declarativo de madurez: la puntuación refleja tus propias respuestas, no es una medición de los motores de IA. Para una auditoría medida, solicita un plan de acción.",
      choices: { non: "No", partiel: "Parcial", oui: "Sí" },
      dims: {
        geoTitle: "Visibilidad en IA (GEO / búsqueda con IA)",
        geoSub: "Presencia y exactitud en ChatGPT, Perplexity, Gemini, Google AI.",
        socialTitle: "Redes sociales y contenido",
        socialSub: "Autoridad, métricas útiles, constancia, supervisión del contenido generado por IA.",
      },
      scoreGlobal: "Puntuación global (declarativa)",
      note: "Nota",
      answeredOf: "{a}/{t} respondidas",
      empty: "Responde las preguntas de abajo: tu puntuación de madurez y tus recomendaciones aparecerán aquí.",
      recosTitle: "Recomendaciones prioritarias",
      geoTag: "GEO",
      socialTag: "Redes",
      cta: {
        headline: "Convierte la nota {grade} en un plan de acción.",
        body: "Calculamos el precio de implementar tus {count} prioridades en un presupuesto.",
        button: "Obtener un plan de acción / presupuesto →",
      },
      reset: "Restablecer",
      questions: {
        byId: {
          geo_offer:      { label: "¿Las herramientas de IA (ChatGPT, Perplexity, Gemini) describen correctamente tu oferta y tus ventajas (USP)?", reco: "Publica páginas claras de \"fuente de verdad\" (oferta, USP, precios) para que los motores de IA citen los datos correctos." },
          geo_appear:     { label: "¿Aparece tu marca en las respuestas de IA para tus consultas clave?", reco: "Prueba tus 10 consultas clave en ChatGPT/Perplexity; busca presencia y corrige las páginas que falten." },
          geo_cited:      { label: "¿Citan los motores de IA tu sitio como fuente?", reco: "Encuentra las fuentes externas citadas (Reddit, Quora, medios) donde no estás presente → una lista priorizada de PR digital." },
          geo_competitor: { label: "¿Sabes cómo te compara la IA con tus competidores (a quién destaca)?", reco: "Audita el posicionamiento competitivo en las respuestas de IA e identifica el argumento que hace ganar al competidor." },
          geo_sentiment:  { label: "¿El sentimiento de la IA sobre tu marca es positivo y exacto?", reco: "Corrige en la fuente (tu sitio) los datos negativos o incorrectos para que los motores de IA actualicen su percepción." },
          geo_structured: { label: "¿Tienes contenido estructurado (FAQ, schema, páginas pilar) optimizado para que la IA lo capte?", reco: "Añade FAQ, datos estructurados (schema.org) y páginas pilar para que te capten como fuente de verdad." },
          soc_story:      { label: "¿Tu contenido en redes genera autoridad (storytelling) en lugar de spam de demos?", reco: "Pasa del spam de funciones al storytelling (fracasos/aciertos) para generar autoridad." },
          soc_meetings:   { label: "¿Mides las reuniones cualificadas generadas (más allá de likes/impresiones)?", reco: "Mide la métrica de \"reuniones cualificadas\": eso es lo que cuenta, no los likes." },
          soc_cadence:    { label: "¿Publicas con una cadencia regular y sostenible?", reco: "Establece un calendario editorial regular (una cadencia sostenible supera a los picos irregulares)." },
          soc_unique:     { label: "¿Tu contenido refleja una experiencia única y difícil de copiar (\"conviértete en producto\")?", reco: "Destaca tu ángulo o experiencia única para escapar de la competencia genérica." },
          soc_repurpose:  { label: "¿Reutilizas tu contenido en varios formatos?", reco: "Reutiliza cada pieza en varios formatos (post, vídeo, carrusel) para multiplicar el alcance." },
          soc_oversight:  { label: "¿Supervisas el contenido generado por IA (anti \"Shadow Social\" / alucinaciones)?", reco: "Añade revisión humana al contenido de IA para evitar alucinaciones y pérdida de autenticidad." },
        },
      },
    },
    taskCatalog: {
      groups: {
        admin: "Administración",
        sales: "Ventas y prospección",
        support: "Atención al cliente",
        marketing: "Marketing y contenido",
        finance: "Finanzas y RR. HH.",
        ops: "Operaciones",
        strategy: "Estrategia",
      },
      tasks: {
        emails_reply: "Responder correos",
        appointments: "Concertar citas",
        schedule: "Gestión de agenda / calendario",
        filing: "Archivo de documentos",
        cold_calls: "Llamadas salientes (prospección)",
        followups: "Seguimiento de clientes",
        quotes_write: "Redactar presupuestos",
        crm_entry: "Introducción de datos en el CRM",
        inbound_calls: "Llamadas entrantes (soporte)",
        support_l1: "Atención al cliente de nivel 1",
        reviews_faq: "Respuestas a reseñas / FAQ",
        content_social: "Creación de contenido para redes",
        social_planning: "Programación de redes sociales",
        market_research: "Estudio de mercado / monitorización",
        accounting: "Contabilidad / facturación",
        weekly_report: "Informe semanal",
        cv_screening: "Cribado de CV / preselección",
        expenses: "Notas de gastos",
        data_entry: "Introducción / codificación de datos",
        inventory: "Control de stock / inventario",
        translation: "Traducción de contenido",
        blog_writing: "Redacción de artículos / blog",
        high_prospecting: "Prospección de alto nivel / reuniones",
        vision: "Estrategia y visión",
        onboarding: "Onboarding de clientes",
        email_support: "Correos de atención al cliente",
        email_sales: "Correos de seguimiento de ventas",
        meetings_internal: "Reuniones internas",
        meetings_client: "Reuniones con clientes",
        content_create: "Creación de contenido",
        content_publish: "Programación / publicación",
        invoice_issue: "Emisión de facturas",
        quotes_custom: "Presupuestos personalizados",
        interviews: "Entrevistas a candidatos",
      },
      hints: {
        calls: "Ambiguo: ¿llamadas ENTRANTES (soporte) o SALIENTES (prospección)? El veredicto cambia: sepáralas.",
        email: "Sé específico: ¿atención al cliente, seguimiento de ventas o intercambios internos? Cada uno tiene un veredicto distinto.",
        meeting: "¿Interna o con cliente? ¿Recurrente o puntual? Las reuniones clave con clientes vale la pena conservarlas.",
        content: "Separa la CREACIÓN (criterio, conservar) de la PUBLICACIÓN/programación (basada en reglas, automatizable).",
        invoice: "Emisión estándar (reglas claras → automatizar) frente a negociación/personalización (criterio → conservar/delegar).",
        report: "Si los datos ya están estructurados, los informes suelen ser automatizables.",
        recruit: "Cribado de CV (criterios claros → automatizable) frente a la entrevista final (criterio humano → conservar).",
        data: "¿Entrada estructurada? La introducción/copia de datos es casi siempre automatizable.",
        writing: "Primer borrador (copiloto de IA, rápido) frente a validación/edición final (criterio humano).",
        translate: "Volumen repetitivo → automatizable; matiz de marketing/legal → revisión humana.",
        logistics: "Optimización de rutas / control de stock → automatizable; relación con transportistas → humano.",
      },
      seed: {
        emails_slack: "Responder correos / Slack",
        accounting_billing: "Contabilidad, facturación",
        prospecting_clients: "Prospección / reuniones con clientes",
        crm_data: "Introducción de datos en el CRM",
        social_mgmt: "Gestión de redes sociales",
        manual_reporting: "Informe semanal manual",
        planning_agenda: "Gestión de agenda / calendario",
        client_quote: "Presupuesto para cliente",
      },
    },
  },
  contacts: {
    nav: "Contactos",
    title: "Contactos",
    subtitleOrg: "Gestiona los contactos y leads de tu organización.",
    subtitleAll: "Todos los contactos de todas las organizaciones (solo lectura).",
    modeOrg: "Mi organización",
    modeAll: "Todas las organizaciones",
    readOnlyNotice: "Vista de solo lectura entre organizaciones (operador de la plataforma). Cambia a «Mi organización» para gestionar tus propios contactos.",
    noAccess: "No tienes acceso a los contactos.",
    create: "+ Nuevo contacto",
    searchPlaceholder: "Buscar nombre, email, empresa…",
    allTags: "Todas las etiquetas",
    allSources: "Todas las fuentes",
    allStatuses: "Todos los estados",
    colName: "Nombre",
    colEmail: "Email",
    colCompany: "Empresa",
    colOrg: "Org.",
    colTags: "Etiquetas",
    colSource: "Fuente",
    colStatus: "Estado",
    colCreated: "Creado",
    colActions: "Acciones",
    loading: "Cargando…",
    empty: "Ningún contacto coincide.",
    edit: "Editar",
    block: "Bloquear",
    unblock: "Desbloquear",
    delete: "Eliminar",
    createTitle: "Nuevo contacto",
    editTitle: "Editar contacto",
    phone: "Teléfono",
    tagsLabel: "Etiquetas",
    tagsPlaceholder: "etiquetas, separadas, por comas",
    notesLabel: "Notas",
    cancel: "Cancelar",
    save: "Guardar",
    sources: {
      manual: "Manual",
      quote: "Presupuesto",
      worksheet: "Cuestionario",
      visibility: "Auditoría de visibilidad",
      import: "Importación",
    },
    statuses: {
      active: "Activo",
      inactive: "Inactivo",
      blocked: "Bloqueado",
    },
    errors: {
      DUPLICATE_EMAIL: "Ya existe un contacto con este email en esta organización.",
      FORBIDDEN: "Solo puedes gestionar los contactos que has creado.",
      FORBIDDEN_STATUS: "Solo un propietario o administrador puede bloquear o cambiar el estado de un contacto.",
      INVALID_INPUT: "Revisa los datos del contacto (se requieren un nombre y un email válidos).",
      NOT_FOUND: "Este contacto ya no existe.",
      LOAD_FAILED: "No se han podido cargar los contactos.",
      SAVE_FAILED: "No se ha podido guardar. Inténtalo de nuevo.",
    },
  },
};
