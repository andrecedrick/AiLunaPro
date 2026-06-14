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
};
