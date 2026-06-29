/** B6.0 — Portuguese dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const pt: Dict = {
  navGroups: {
    core:    'Geral',
    audit:   'Auditoria e análise',
    crm:     'Vendas / CRM',
    admin:   'Administração',
    billing: 'Faturação',
    tools:   'Ferramentas',
    system:  'Sistema',
  },
  nav: {
    dashboard:             'Painel',
    'new-audit':           'Nova auditoria',
    reports:               'Relatórios',
    'audit-history':       'Histórico de auditorias',
    'audit-express-run':   'Executar Audit Express',
    'audit-express-saved': 'Auditorias salvas',
    registry:              'Registro de IA',
    'system-builder':      'Construtor de sistema',
    agents:                'Agentes',
    team:                  'Equipe',
    settings:              'Configurações',
    billing:               'Faturamento',
    help:                  'Ajuda',
    toolsSection:          'Ferramentas',
    aiRoiCalculator:       'Calculadora de ROI de IA',
    aiMaturityDiagnostic:  'Diagnóstico de maturidade em IA',
    requestQuote: 'Solicitar orçamento',
    invoices: 'Faturas',
    myQuotes: 'Os meus orçamentos',
  },
  bankSettings: {
    heading: 'Dados bancários',
    subtitle: 'Apresentados nas faturas como opção de pagamento.',
    countryLabel: 'Código do país',
    countryPlaceholder: 'ex. PT',
    regionLabel: 'Região bancária',
    regionEu: 'Europa (IBAN)',
    regionUs: 'Estados Unidos',
    regionGlobal: 'Ásia / Global',
    fAccountName: 'Nome da conta',
    fAccountNumber: 'Número da conta',
    fRoutingNumber: 'Número de encaminhamento',
    fBankName: 'Nome do banco',
    fAccountHolder: 'Titular da conta',
    save: 'Guardar dados bancários',
    saved: 'Dados bancários guardados',
    saveError: 'Não foi possível guardar. Tente novamente.',
    validationError: 'Verifique este valor.',
    ownerOnly: 'Apenas proprietários e administradores podem editar os dados bancários.',
  },
  invoices: {
    title: 'Faturas',
    subtitle: 'Faturas criadas quando um cliente aceita um orçamento.',
    loading: 'A carregar…',
    error: 'Não foi possível carregar as suas faturas. Tente novamente.',
    empty: 'Ainda não há faturas.',
    quoteLabel: 'Orçamento',
    statusDraft: 'Rascunho',
    statusPending: 'Pendente',
    statusPaid: 'Paga',
    amountPending: 'A confirmar',
    clientBudget: 'Orçamento do cliente',
    proposedBudget: 'Orçamento proposto',
    confirmSend: 'Confirmar e enviar fatura',
    amountLabel: 'Valor final (USD)',
    confirmBtn: 'Confirmar e enviar',
    cancel: 'Cancelar',
    sent: 'Fatura enviada com sucesso',
    sentNoEmail: 'Fatura criada, mas não foi possível enviar o email.',
    confirmError: 'Não foi possível enviar. Tente novamente.',
    pendingHeading: 'A aguardar confirmação',
    queueHeading: 'A aguardar a sua definição de preço',
    queueEmpty: 'Não há orçamentos a aguardar definição de preço de momento.',
    queueSubtitle: 'Um cliente respondeu — defina o valor final para criar a fatura.',
    stageAcceptedLabel: 'Aceite',
    stageNegotiationLabel: 'Negociação',
    nextAccepted: 'A seguir: defina o valor final para criar e enviar a fatura.',
    nextNegotiation: 'A seguir: reveja o orçamento do cliente e depois defina o valor final.',
    clientMessageLabel: 'Mensagem do cliente',
    finalizeBtn: 'Confirmar valor e criar fatura',
    invoicesHeading: 'Faturas',
    resendBtn: 'Reenviar email da fatura',
    fromEmail: 'Aberto a partir do seu email',
    notFound: 'Não foi possível encontrar este orçamento ou fatura.',
  },
  adminCenter: {
    nav: 'Admin Center',
    title: 'Admin Center',
    subtitle: 'Acompanhe orçamentos, faturas e a atividade dos clientes da sua organização num só lugar.',
    restricted: 'O Admin Center está reservado a superadministradores.',
    activityHeading: 'Atividade recente',
    activityEmpty: 'Ainda não há atividade.',
    evtAccepted: 'Orçamento validado pelo cliente',
    evtAdjustment: 'Cliente solicitou alteração do orçamento',
    evtInvoiceSent: 'Fatura enviada',
    evtPaid: 'Pagamento recebido',
    discussionsHeading: 'Conversas com clientes',
    discussionsEmpty: 'Ainda não há mensagens de clientes.',
    contextLabel: 'Contexto',
    statusWaitingResponse: 'A aguardar a sua resposta',
    replyHint: 'responda ao e-mail de notificação para responder',
    allQuotesHeading: 'Todos os orçamentos — ciclo de vida completo',
    allQuotesEmpty: 'Ainda não foram enviados orçamentos.',
    tlCreated: 'Criado',
    tlSent: 'Enviado',
    tlAccepted: 'Aceite',
    tlChanges: 'Alterações solicitadas',
    tlInvoiced: 'Faturado',
    blocked: 'Bloqueado',
    suspended: 'Suspenso',
    editBudget: 'Editar orçamento',
    budgetUsdLabel: 'Orçamento (USD)',
    save: 'Guardar',
    block: 'Bloquear',
    suspend: 'Suspender',
    reactivate: 'Reativar',
    sendQuote: 'Enviar orçamento',
    sendAndPay: 'Enviar e pagar',
    openPaymentLink: 'Abrir link de pagamento',
    genPaymentLink: 'Gerar link de pagamento',
  },
  myQuotes: {
    title: 'Os meus orçamentos',
    subtitle: 'Acompanhe as propostas que enviou — estado, orçamento e a atividade mais recente.',
    loading: 'A carregar…',
    error: 'Não foi possível carregar os seus orçamentos. Tente novamente.',
    empty: 'Ainda não enviou nenhum orçamento.',
    createCta: 'Criar um orçamento',
    quoteLabel: 'Orçamento',
    proposedBudget: 'Orçamento proposto',
    statusSent: 'Enviado',
    statusReviewing: 'Em análise',
    statusNegotiation: 'Negociação',
    statusValidated: 'Validado',
    statusInvoiced: 'Faturado',
    statusBlocked: 'Bloqueado',
    statusSuspended: 'Suspenso',
    changesRequested: 'O cliente solicitou alterações',
    negotiationNextStep: 'Defina o valor final no Admin Center para responder.',
    waitingResponse: 'A aguardar a resposta do cliente',
    lastActivity: 'Última atividade',
    actCreated: 'Orçamento criado',
    actSent: 'Proposta enviada ao cliente',
    actAccepted: 'O cliente aceitou o orçamento',
    actChangesRequested: 'O cliente solicitou alterações',
    actInvoiced: 'Fatura criada',
  },
  shell: {
    complianceSuite:  'Suite de conformidade',
    signOut:          'Sair',
    workspaces:       'Espaços de trabalho',
    createWorkspace:  'Criar espaço de trabalho',
    searchWorkspaces: 'Buscar espaço…',
    language:         'Idioma',
    currency:         'Moeda',
  },
  settings: {
    title:               'Preferências',
    themeTitle:          'Tema',
    themeHint:           'Escolha a aparência do AiLunaPro. Aplicado imediatamente.',
    light:               'Claro',
    dark:                'Escuro',
    languageTitle:       'Idioma',
    languageHint:        'Usado para rótulos da interface e e-mails. A tradução está sendo lançada seção por seção; as áreas não traduzidas permanecem em inglês.',
    currencyTitle:       'Moeda padrão',
    currencyHint:        'Apenas preferência de exibição. A cobrança e os pacotes de tokens permanecem em USD.',
    profileTitle:        'Perfil',
    profileHint:         'Ajusta o tom da orientação e o recurso inicial recomendado. Nunca altera a pontuação, as constatações nem qualquer correspondência regulatória.',
    notificationsTitle:  'Notificações por e-mail',
    notificationsHint:   'Escolha quais e-mails você recebe. A configuração do remetente chega em uma fase posterior.',
    weeklyDigest:        'Resumo semanal de conformidade',
    weeklyDigestDesc:    'Resumo de novas constatações e ações resolvidas toda segunda-feira.',
    reportReady:         'Relatório pronto',
    reportReadyDesc:     'Avise-me por e-mail quando um relatório solicitado for gerado.',
    teamActivity:        'Atividade da equipe',
    teamActivityDesc:    'Convites, mudanças de função e remoções de membros nos meus espaços de trabalho.',
    langToast:           'Idioma: {value}',
    currencyToast:       'Moeda: {value}',
    profileToast:        'Perfil: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Secções da auditoria",
      "questionCount": "{n} perguntas",
      "yes": "Sim",
      "no": "Não"
    },
    "section": {
      "profile": {
        "title": "Perfil",
        "subtitle": "A sua organização num relance"
      },
      "ai-tools": {
        "title": "Ferramentas de IA",
        "subtitle": "Que IA é que a sua organização utiliza efetivamente?"
      },
      "data": {
        "title": "Dados",
        "subtitle": "Que dados alimentam os seus sistemas de IA?"
      },
      "governance": {
        "title": "Governação",
        "subtitle": "Políticas, responsabilidade e prestação de contas"
      },
      "security": {
        "title": "Segurança",
        "subtitle": "Proteger os sistemas de IA e os seus dados"
      },
      "transparency": {
        "title": "Transparência",
        "subtitle": "Divulgação e explicabilidade"
      },
      "human-oversight": {
        "title": "Supervisão Humana",
        "subtitle": "Manter os humanos no controlo"
      },
      "training-maturity": {
        "title": "Formação e Maturidade",
        "subtitle": "Qual é a literacia em IA da sua organização?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Nome da organização",
        "placeholder": "ex. Acme Corp"
      },
      "profile.industry": {
        "label": "Setor principal"
      },
      "profile.size": {
        "label": "Dimensão da empresa"
      },
      "profile.region": {
        "label": "Principal região de operação"
      },
      "tools.categories": {
        "label": "Que categorias de IA estão em produção?",
        "helper": "Selecione todas as que se aplicam."
      },
      "tools.vendors": {
        "label": "Principais fornecedores / produtos de IA",
        "placeholder": "ex. OpenAI GPT-4, Anthropic Claude, modelo interno em AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Âmbito de implementação"
      },
      "tools.builds_custom": {
        "label": "Treina ou afina os seus próprios modelos?"
      },
      "data.types": {
        "label": "Que tipos de dados são processados pela IA?"
      },
      "data.residency": {
        "label": "Onde são armazenados os dados, principalmente?"
      },
      "data.governance_framework": {
        "label": "Existe uma estrutura documentada de governação de dados?"
      },
      "data.sources": {
        "label": "Descreva as suas principais fontes de dados",
        "placeholder": "ex. CRM, telemetria de produto, tickets de apoio ao cliente, conjuntos de dados de terceiros…"
      },
      "gov.committee": {
        "label": "Possui um comité de governação de IA ou um responsável designado?"
      },
      "gov.written_policy": {
        "label": "Existe uma política de IA escrita e aprovada pela liderança?"
      },
      "gov.frameworks": {
        "label": "Com que estruturas está alinhado?"
      },
      "gov.structure": {
        "label": "Descreva a sua estrutura de governação",
        "placeholder": "Quem é responsável pelo risco de IA? Como são escaladas as decisões?"
      },
      "sec.controls": {
        "label": "Que controlos de segurança estão implementados para os sistemas de IA?"
      },
      "sec.red_team": {
        "label": "Os seus sistemas de IA foram submetidos a red teaming ou a testes adversariais?"
      },
      "sec.incident_readiness": {
        "label": "Quão preparado está para um incidente específico de IA?"
      },
      "sec.review_process": {
        "label": "Descreva o seu processo de revisão de segurança para novos sistemas de IA"
      },
      "trans.disclosure": {
        "label": "Divulga a utilização de IA aos utilizadores finais quando interagem com ela?"
      },
      "trans.cards": {
        "label": "Mantém cartões de modelo (model cards) ou cartões de sistema (system cards)?"
      },
      "trans.explainability": {
        "label": "Quão explicáveis são as suas decisões de IA para os utilizadores afetados?"
      },
      "trans.measures": {
        "label": "Descreva as suas medidas de transparência",
        "placeholder": "Registo público de IA, divulgações na aplicação, registos de auditoria disponíveis aos utilizadores…"
      },
      "over.model": {
        "label": "Que modelo de supervisão descreve melhor a sua configuração?"
      },
      "over.escalation": {
        "label": "Os procedimentos de escalada estão documentados para erros ou danos da IA?"
      },
      "over.review_categories": {
        "label": "Que categorias de decisão exigem revisão humana obrigatória?"
      },
      "over.processes": {
        "label": "Descreva os seus processos de supervisão por palavras suas"
      },
      "train.staff_training": {
        "label": "Oferece formação em literacia de IA ao pessoal?"
      },
      "train.maturity": {
        "label": "Maturidade de conformidade em IA autoavaliada"
      },
      "train.topics": {
        "label": "Que temas são abordados na sua formação?"
      },
      "train.program": {
        "label": "Descreva o seu programa de formação (ou o que está em falta)"
      }
    },
    "option": {
      "profile.industry.finance": "Finanças e Banca",
      "profile.industry.health": "Saúde e Ciências da Vida",
      "profile.industry.tech": "Tecnologia / SaaS",
      "profile.industry.retail": "Retalho e Comércio Eletrónico",
      "profile.industry.public": "Setor público",
      "profile.industry.other": "Outro",
      "profile.size.xs": "1–10 colaboradores",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "União Europeia",
      "profile.region.uk": "Reino Unido",
      "profile.region.us": "Estados Unidos",
      "profile.region.ca": "Canadá",
      "profile.region.apac": "Ásia-Pacífico",
      "profile.region.global": "Global / multirregião",
      "tools.categories.llm": "Grandes Modelos de Linguagem (chat, agentes, copilotos)",
      "tools.categories.ml": "ML clássico / modelos preditivos",
      "tools.categories.cv": "Visão computacional",
      "tools.categories.speech": "Voz e áudio",
      "tools.categories.rec": "Sistemas de recomendação",
      "tools.categories.rpa": "RPA / automação com componentes de IA",
      "tools.scope.pilot": "Apenas pilotos / experiências",
      "tools.scope.internal": "Utilização interna pelo pessoal",
      "tools.scope.customer": "Funcionalidades voltadas para o cliente",
      "tools.scope.critical": "Decisões críticas / reguladas",
      "data.types.pii": "Dados pessoais (PII)",
      "data.types.health": "Dados de saúde",
      "data.types.financial": "Dados financeiros / transacionais",
      "data.types.biometric": "Dados biométricos",
      "data.types.children": "Dados sobre menores",
      "data.types.public": "Dados públicos / abertos",
      "data.residency.eu": "UE / EEE",
      "data.residency.us": "Estados Unidos",
      "data.residency.mixed": "Misto / multirregião",
      "data.residency.unknown": "Não tenho a certeza",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Nenhuma formalmente",
      "sec.controls.encryption": "Encriptação em repouso e em trânsito",
      "sec.controls.rbac": "Controlo de acesso baseado em funções",
      "sec.controls.audit_logs": "Registo de auditoria do acesso ao modelo e das entradas",
      "sec.controls.secrets": "Gestão de segredos (sem chaves codificadas)",
      "sec.controls.isolation": "Isolamento de inquilino / dados",
      "sec.incident_readiness.1": "1 — Sem plano",
      "sec.incident_readiness.2": "2 — Plano informal",
      "sec.incident_readiness.3": "3 — Documentado mas não testado",
      "sec.incident_readiness.4": "4 — Documentado e ensaiado",
      "sec.incident_readiness.5": "5 — Contínuo, integrado com SOC",
      "trans.explainability.none": "Sem explicações fornecidas",
      "trans.explainability.generic": "Apenas divulgações genéricas",
      "trans.explainability.category": "Razões ao nível da categoria",
      "trans.explainability.individual": "Explicações por decisão a pedido",
      "trans.explainability.realtime": "Explicações em tempo real, no produto",
      "over.model.hitl": "Humano no circuito (cada decisão revista)",
      "over.model.hotl": "Humano sobre o circuito (revisão por amostragem)",
      "over.model.oot": "Humano fora do circuito (autónomo)",
      "over.review_categories.hr": "Decisões de contratação / RH",
      "over.review_categories.credit": "Decisões de crédito / financeiras",
      "over.review_categories.health": "Recomendações relacionadas com saúde",
      "over.review_categories.content": "Resultados de moderação de conteúdos",
      "over.review_categories.legal": "Decisões jurídicas / de conformidade",
      "train.maturity.1": "1 — Inicial / pontual",
      "train.maturity.2": "2 — Em desenvolvimento",
      "train.maturity.3": "3 — Definido",
      "train.maturity.4": "4 — Gerido",
      "train.maturity.5": "5 — Otimizado",
      "train.topics.bias": "Viés e equidade",
      "train.topics.privacy": "Privacidade e proteção de dados",
      "train.topics.security": "Segurança de IA e utilização indevida",
      "train.topics.usage": "Políticas de utilização aceitável",
      "train.topics.incident": "Resposta a incidentes"
    }
  },
  results: {
    "nextTools": {
      "title": "Continue a explorar",
      "subtitle": "Ferramentas leves que pode executar quando quiser — sem configuração.",
      "roi": "Estimar o seu ROI",
      "diagnostic": "Fazer outro diagnóstico rápido"
    },
    "insightCard": {
      "whatThisMeans": "O que isto significa",
      "whyItMatters": "Por que é importante",
      "howItPlaysOut": "Como se traduz na prática",
      "exampleHeading": "Exemplo — como uma empresa semelhante beneficia",
      "illustrative": "(Ilustrativo.)",
      "doThisNext": "Faça isto a seguir",
      "doThisNextWithHeading": "Faça isto a seguir — {heading}",
      "onceDone": "Após concluir: {outcome}",
      "referencesPrefix": "Referências: {refs}"
    },
    "explained": {
      "heading": "O que os seus resultados significam",
      "subtitle": "Cada item abaixo explica o que encontrámos, por que é importante e qual o próximo passo mais rápido — com os pontos de pontuação que pode recuperar.",
      "emptyTitle": "Nenhuma lacuna detetada — base sólida",
      "emptyWhatItMeans": "As suas respostas não geraram quaisquer constatações — a sua prática de IA já cobre os aspetos essenciais que verificamos.",
      "emptyWhyItMatters": "Isto é uma base sólida. Os próximos ganhos vêm de operar estes controlos de forma consistente e em escala.",
      "emptyFlowInput": "boas práticas",
      "emptyFlowProcess": "torná-las rotina",
      "emptyFlowOutput": "controlos consistentes",
      "emptyFlowGain": "confiança duradoura e escalável",
      "emptyExample": "As equipas neste nível passam de “fazemos isto” para “isto funciona sozinho” — automatizando as partes manuais. (Ilustrativo.)",
      "emptyDoNextHeading": "Leve à escala",
      "emptyDoNextStep1": "Automatize os controlos que hoje executa manualmente.",
      "emptyDoNextStep2": "Reaudite periodicamente para manter o nível.",
      "ctaSeeAgentsForThis": "Ver agentes que podem fazer isto",
      "ctaSeeRecommendedAgents": "Ver agentes recomendados",
      "ctaOpenDesignGuide": "Abrir o guia de conceção",
      "ptsToRecover": "−{n} pts a recuperar",
      "priorityCritical": "Prioridade: Crítica",
      "priorityHigh": "Prioridade: Alta",
      "priorityMedium": "Prioridade: Média",
      "priorityLow": "Prioridade: Baixa",
      "effortBadge": "Esforço: {effort}",
      "effortBadgeDefault": "Esforço: médio",
      "timeframeBadge": "~{days} dias",
      "timeframeBadgeDefault": "~30 dias"
    },
    "findings": {
      "title": "Constatações",
      "total": "{n} no total",
      "empty": "✓ Nenhuma constatação detetada. Continue a desenvolver a maturidade através das recomendações à direita.",
      "severityCritical": "Crítica",
      "severityHigh": "Alta",
      "severityMedium": "Média",
      "severityLow": "Baixa",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ {count} recomendação{plural}"
    },
    "recommendations": {
      "title": "Recomendações",
      "actionsCount": "{n} ações",
      "starterResource": "Recurso inicial recomendado",
      "empty": "Nenhuma recomendação acionável de momento.",
      "impactCritical": "Impacto crítico",
      "impactHigh": "Impacto alto",
      "impactMedium": "Impacto médio",
      "impactLow": "Impacto baixo",
      "timeframeDays": "{n}d",
      "addressesFindings": "resolve {count} constatação{plural}"
    },
    "actionPlan": {
      "title": "Plano de Ação Priorizado",
      "roadmapNote": "O roteiro mostra quando entregar; o Plano de Ação mostra o que corrigir primeiro.",
      "bandCriticalTitle": "Crítico",
      "bandImportantTitle": "Importante",
      "bandImportantSubtitle": "Curto prazo — resolver no trimestre atual.",
      "bandImprovementTitle": "Melhoria",
      "bandImprovementSubtitle": "Boa prática — agendar para maturidade.",
      "itemCount": "{n} item{plural}",
      "bandEmpty": "Nenhum item nesta faixa — nada acionável aqui por agora.",
      "moreNotShown": "+{n} não apresentados",
      "impactPill": "Impacto",
      "effortPill": "Esforço",
      "expectedOutcome": "Resultado esperado —"
    }
  },
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Qual área você mais gostaria de melhorar?",
          "opt": {
            "support": "Atendimento ao cliente",
            "sales": "Vendas",
            "finance": "Finanças",
            "documents": "Documentos",
            "reporting": "Relatórios",
            "admin": "Administração",
            "compliance": "Conformidade",
            "marketing": "Marketing",
            "hr": "RH"
          }
        },
        "monthlyHours": {
          "label": "Aproximadamente quantas horas por mês são dedicadas a trabalho repetitivo?",
          "opt": {
            "low": "Pouco (~20)",
            "medium": "Razoável (~80)",
            "high": "Muito (~160)"
          }
        },
        "hourlyCost": {
          "label": "Custo médio aproximado por hora desse trabalho?",
          "opt": {
            "low": "Mais baixo (~$25)",
            "medium": "Médio (~$45)",
            "high": "Mais alto (~$75)"
          }
        },
        "aiUsage": {
          "label": "Como a IA é usada na sua organização hoje?",
          "opt": {
            "none": "Ainda não",
            "individual": "Individualmente",
            "team": "Entre equipes",
            "structured": "Em fluxos de trabalho estruturados"
          }
        },
        "shadowAi": {
          "label": "Quanta visibilidade você tem sobre as ferramentas de IA em uso?",
          "opt": {
            "no_visibility": "Nenhuma",
            "partial_visibility": "Alguma",
            "mostly_visible": "A maioria",
            "full_inventory": "Inventário completo"
          }
        }
      },
      "run": {
        "title": "Executar Audit Express",
        "subtitle": "Um panorama rápido e apenas estimativo da prontidão para IA — salvo automaticamente no seu espaço de trabalho.",
        "errPreviewCode": "Não foi possível executar a prévia ({code}).",
        "errPreview": "Não foi possível executar a prévia.",
        "errAnalysisCode": "Análise indisponível ({code}).",
        "errAnalysis": "Análise indisponível. Tente novamente.",
        "errDocCode": "Análise do documento indisponível ({code}).",
        "errDoc": "Análise do documento indisponível. Tente novamente.",
        "analyzeSiteTitle": "Analisar um site público (opcional)",
        "analyzeSiteHint": "Lê apenas páginas públicas, respeita o robots.txt. Enriquece “O que esta empresa faz”.",
        "deepScan": "Varredura profunda (mais lenta, mais páginas)",
        "saving": "Salvando seu resultado…",
        "journeyHeadline": "Veja o que o seu panorama significa",
        "journeyReadiness": "Prontidão para IA: {bucket} ({score}/100).",
        "journeyTimeSaved": "Tempo economizado estimado ≈ {hours} horas/mês.",
        "journeyCostSaved": "Custo economizado estimado ≈ {amount}/mês."
      },
      "cta": {
        "computing": "Calculando…",
        "getPreview": "Obter prévia",
        "analyzing": "Analisando…",
        "analyzeSite": "Analisar site",
        "preparing": "Preparando…",
        "downloadPdf": "Baixar PDF",
        "viewSaved": "Ver Auditorias Salvas",
        "seeAgents": "Ver agentes compatíveis com sua auditoria →",
        "runFullAudit": "Executar uma auditoria completa",
        "extracting": "Extraindo…",
        "analyzeDocument": "Analisar documento →",
        "save": "Salvar",
        "cancel": "Cancelar"
      },
      "result": {
        "snapshotHeading": "Seu panorama · Prontidão para IA: {bucket} ({score}/100)",
        "whatThisMeans": "O que isso significa",
        "opportunityLabel": "A oportunidade — faixas indicativas",
        "timeBack": "Tempo recuperado",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Impacto no custo",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Retorno do investimento",
        "howSavingLabel": "Como a economia acontece",
        "flowRepetitive": "tarefas repetitivas",
        "flowAssisted": "assistido / automatizado",
        "flowSameWork": "mesmo trabalho, menos tempo manual",
        "flowHoursBack": "horas recuperadas para trabalho de maior valor",
        "roiUnavailable": "Estimativa de ROI indisponível para esta auditoria.",
        "whatToDoFirst": "O que fazer primeiro",
        "step1": "Escolha uma tarefa de alto volume (respostas de atendimento, lançamento de faturas, relatórios).",
        "step2": "Teste um assistente nela por ~2 semanas.",
        "step3": "Meça as horas antes/depois — mantenha o que compensa.",
        "businessHeading": "O que esta empresa faz",
        "businessType": "Tipo:",
        "businessAudience": "Público:",
        "businessConfidence": "confiança {confidence}",
        "businessUnknown": "desconhecido",
        "offers": "Oferece: {list}",
        "automationHeading": "Oportunidades de automação",
        "opportunityItem": "{title} — {impact} impacto / {effort} esforço"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Tendência da pontuação",
      "subtitle": "Pontuação de maturidade de IA ao longo do tempo",
      "empty": {
        "title": "As tendências aparecem após várias auditorias",
        "hint": "Depois de submeter várias auditorias neste espaço de trabalho, a sua pontuação de maturidade de IA será apresentada aqui a partir do seu histórico real."
      }
    },
    "automation": {
      "title": "Oportunidades de automação",
      "subtitle": "Adaptadas ao seu uso de IA",
      "empty": {
        "title": "Execute uma auditoria para obter oportunidades adaptadas",
        "hint": "As oportunidades de automação derivam das respostas da sua auditoria e do seu registo de IA. Conclua uma auditoria e adicione as suas ferramentas de IA para ver sugestões aqui."
      }
    },
    "businessImpact": {
      "title": "Impacto no negócio",
      "subtitle": "Resultados medidos do seu programa de conformidade",
      "empty": {
        "title": "As métricas de impacto aparecem à medida que o seu programa amadurece",
        "hint": "Execute auditorias ao longo do tempo para criar um histórico. A redução de risco, o progresso da governação e o tempo poupado serão calculados a partir do seu histórico real — sem estimativas."
      }
    },
    "recentReports": {
      "title": "Relatórios recentes",
      "countOne": "{n} relatório gerado",
      "countOther": "{n} relatórios gerados",
      "viewAll": "Ver todos →",
      "empty": {
        "title": "Ainda não há relatórios",
        "hint": "Gere um relatório a partir de uma auditoria submetida — aparece aqui e em Relatórios deste espaço de trabalho."
      }
    },
    "kpi": {
      "auditsSubmitted": "Auditorias submetidas",
      "reportsGenerated": "Relatórios gerados",
      "aiToolsRegistered": "Ferramentas de IA registadas",
      "loadErrorSuffix": " — não foi possível carregar"
    },
    "maturity": {
      "rung": {
        "initial": "Inicial",
        "managed": "Gerido",
        "defined": "Definido",
        "advanced": "Avançado",
        "optimal": "Ótimo"
      }
    },
    "cta": {
      "poweredBy": "Desenvolvido por Luna AI",
      "scheduleDemo": "Agendar demonstração",
      "startFreeTrial": "Iniciar teste gratuito →"
    },
    "quickTools": {
      "title": "Ferramentas rápidas",
      "subtitle": "Verificações leves que pode repetir quando quiser — separadas da sua auditoria completa.",
      "diagnostic": {
        "label": "Fazer um diagnóstico rápido",
        "hint": "Avalie a sua maturidade em IA em ~2 min"
      },
      "roi": {
        "label": "Estimar o seu ROI",
        "hint": "Veja o tempo e os custos que pode poupar"
      }
    }
  },
  topbar: {
    "title": {
      "dashboard": "Dashboard",
      "audit/new": "Nova auditoria",
      "audit/result": "Resultado da auditoria",
      "audit/assistance": "Guia de implementação",
      "audit/history": "Histórico de auditorias",
      "reports": "Relatórios",
      "reports/detail": "Relatório",
      "reports/share": "Relatório partilhado",
      "registry": "Registo de IA",
      "system-builder": "System Builder",
      "agents": "Agentes",
      "agents/detail": "Agente",
      "team": "Equipa",
      "settings": "Definições",
      "billing": "Faturação",
      "billing/tokens": "Tokens",
      "help": "Ajuda",
      "audit-express/run": "Executar Audit Express",
      "audit-express/saved": "Auditorias guardadas",
      "audit-express/detail": "Auditoria guardada"
    },
    "subtitle": {
      "dashboard": "Visão geral da conformidade de IA"
    },
    "search": {
      "placeholder": "Pesquisar auditorias, relatórios…",
      "toast": "A pesquisar \"{query}\"…"
    },
    "dateRange": {
      "last7": "Últimos 7 dias",
      "last30": "Últimos 30 dias",
      "thisMonth": "Este mês",
      "lastMonth": "Mês passado",
      "customRange": "Intervalo personalizado…",
      "from": "De",
      "to": "Até",
      "apply": "Aplicar intervalo",
      "toast": "Intervalo de datas: {label}",
      "errPickBoth": "Selecione uma data de início e de fim.",
      "errOrder": "A data de início deve ser anterior à data de fim."
    },
    "notifications": {
      "label": "Notificações",
      "title": "Notificações",
      "empty": "Ainda não há notificações."
    },
    "tokens": {
      "aria": "{n} tokens restantes — gerir tokens",
      "title": "{n} tokens restantes · clique para gerir",
      "balance": "{used} / {total}",
      "corruptTitle": "O saldo de tokens contém dados inválidos — clique para reparar",
      "corruptLabel": "Os tokens precisam de reparação"
    },
    "luna": {
      "aria": "Abrir a Luna, a sua guia",
      "title": "Luna — a sua guia",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Mudar para o modo escuro",
      "toLight": "Mudar para o modo claro"
    },
    "newAudit": {
      "label": "Nova auditoria",
      "denied": "A sua função não permite criar auditorias. As auditorias estão disponíveis para os perfis Proprietário, Administrador e Membro."
    },
    "sidebar": {
      "openMenu": "Abrir o menu de navegação",
      "closeMenu": "Fechar o menu de navegação",
      "menu": "Menu",
      "expand": "Expandir a barra lateral",
      "collapse": "Recolher a barra lateral"
    }
  },
  auditForm: {
    "title": "Nova auditoria",
    "subtitle": "Percorra 8 secções para avaliar a sua postura de conformidade de IA. O seu progresso é guardado à medida que avança — pode sair e voltar a qualquer momento.",
    "loading": "A carregar a auditoria…",
    "forbiddenTitle": "A sua função não permite criar auditorias",
    "forbiddenBody": "As auditorias estão disponíveis para os perfis Proprietário, Administrador e Membro. Contacte um proprietário ou administrador do espaço de trabalho se precisar de acesso às auditorias.",
    "errorLoad": "Falha ao carregar a auditoria. Atualize para tentar novamente.",
    "pageTitle": "Nova auditoria",
    "pageIntro": "Percorra 8 secções para avaliar a sua postura de conformidade de IA. O seu progresso é guardado à medida que avança — pode sair e voltar a qualquer momento.",
    "stepOf": "Passo {current} de {total}",
    "overallProgress": "Progresso global",
    "previous": "← Anterior",
    "saveDraft": "Guardar rascunho",
    "saveContinue": "Guardar e continuar →",
    "submit": "Submeter auditoria ✓",
    "saved": "✓ Guardado"
  },
  settingsPages: {
    "shell": {
      "title": "Definições",
      "subtitle": "Faça a gestão do seu perfil, organização e preferências."
    },
    "tabs": {
      "profile": "Perfil",
      "org": "Organização",
      "preferences": "Preferências",
      "billing": "Faturação"
    },
    "profile": {
      "sectionTitle": "Perfil",
      "avatarHint": "O avatar é gerado a partir das suas iniciais. O carregamento personalizado será disponibilizado mais tarde.",
      "displayName": "Nome a apresentar",
      "displayNamePlaceholder": "O seu nome completo",
      "email": "E-mail",
      "emailPlaceholder": "voce@exemplo.com",
      "emailVerificationTitle": "Verificação de e-mail",
      "emailVerified": "✓ O seu e-mail está verificado.",
      "sendVerification": "Enviar e-mail de verificação",
      "sendingVerification": "A enviar…",
      "passwordTitle": "Palavra-passe",
      "passwordHint": "Enviaremos uma ligação de redefinição para o seu e-mail. A ligação expira após uma hora.",
      "sendPasswordReset": "Enviar e-mail de redefinição da palavra-passe",
      "sendingReset": "A enviar…",
      "savedToast": "Perfil atualizado."
    },
    "org": {
      "sectionTitle": "Organização",
      "fallbackName": "Espaço de trabalho",
      "nameLabel": "Nome da organização",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Apenas o proprietário do espaço de trabalho pode renomear ou eliminar a organização.",
      "planTitle": "Plano",
      "dangerZoneTitle": "Zona de perigo",
      "dangerZoneHint": "Eliminar uma organização remove todos os seus dados: auditorias, relatórios, registo e membros da equipa. Esta ação não pode ser anulada.",
      "deleteButton": "Eliminar organização…",
      "deleteDialogTitle": "Eliminar \"{name}\"?",
      "deleteDialogBody1": "Isto irá remover permanentemente a organização, todas as suas auditorias, relatórios, itens do registo e participações na equipa.",
      "deleteDialogBody2": "Ser-lhe-á pedido para confirmar mais uma vez antes de qualquer dado ser afetado.",
      "deleteConfirmLabel": "Compreendo, continuar",
      "renamedToast": "Organização renomeada.",
      "deletionDeferredToast": "A eliminação de organizações será ativada numa etapa posterior do backend."
    },
    "billing": {
      "sectionTitle": "Faturação",
      "checkingAccess": "A verificar o acesso…"
    }
  },
  common: {
    "saveChanges": "Guardar alterações",
    "saving": "A guardar…",
    "cancel": "Cancelar",
    "loading": "A carregar…",
    "save": "Guardar",
    "confirm": "Confirmar",
    "close": "Fechar",
    "tryAgain": "Tentar novamente",
    "reloadPage": "Recarregar a página",
    "retryNow": "Tentar novamente agora",
    "reload": "Recarregar",
    "somethingWentWrong": "Algo correu mal",
    "couldntLoadThePage": "Não foi possível carregar a página",
    "stillConnecting": "Ainda a ligar…",
    "valueDisplay": {
      "actionHint": "Usa {tokens} tokens · ≈ {value} de valor",
      "actionHintFree": "Grátis · ≈ {value} de valor",
      "sessionTracker": "Esta sessão: {value} de valor · {tokens} tokens"
    }
  },
  journey: {
    "label": {
      "choice": "Escolher",
      "audit": "Auditar",
      "understanding": "Compreender",
      "adoption": "Adotar"
    },
    "hint": {
      "choice": "Escolha como começar — Audit Express para uma visão rápida, ou uma Nova auditoria para maior profundidade.",
      "audit": "Conclua a sua auditoria — explicaremos o que significa e o que fazer a seguir.",
      "understanding": "Eis o que a sua auditoria significa. Reveja as informações e, em seguida, escolha o próximo passo."
    },
    "progress": {
      "ariaLabel": "Progresso do percurso guiado"
    },
    "chooseAuditType": "Escolher o tipo de auditoria →",
    "dismissAriaLabel": "Dispensar o percurso guiado",
    "dismiss": "Dispensar",
    "next": {
      "whatNext": "O que gostaria de fazer a seguir?",
      "recommendedTag": "Recomendado",
      "backToDashboard": "Voltar ao dashboard",
      "cta": {
        "agents": {
          "title": "Ver agentes recomendados",
          "body": "Ferramentas adequadas à sua auditoria que podem poupar tempo no trabalho que assinalou."
        },
        "billing": {
          "title": "Explorar a adesão",
          "body": "Planos, tokens e o que está incluído — adote ao seu próprio ritmo."
        },
        "systemBuilder": {
          "title": "Abrir o System Builder",
          "body": "Um guia só de leitura para conceber o seu sistema de IA em seis dimensões."
        }
      }
    },
    "start": {
      "greetingTitle": "Olá, sou a Luna — vamos começar.",
      "greetingBody": "Escolha como prefere começar. Pode mudar a qualquer momento e pode sempre ir diretamente para o seu dashboard.",
      "pendingGreetingDiagnostic": "Guardámos o seu diagnóstico. Uma auditoria completa transforma-o num plano de ação completo. Escolha como continuar.",
      "pendingGreetingRoi": "Guardámos a sua estimativa de ROI. Uma auditoria completa transforma-a num plano de ação completo. Escolha como continuar.",
      "heading": "Como quer começar?",
      "express": {
        "badge": "Recomendado para a sua primeira auditoria",
        "time": "~5 min",
        "title": "Audit Express",
        "body": "Uma visão rápida da prontidão para a IA, em cerca de 5 minutos — algumas perguntas rápidas, uma análise opcional do site e um ROI indicativo. Ideal para uma primeira abordagem.",
        "cta": "Iniciar o Audit Express →"
      },
      "full": {
        "time": "~15 min",
        "title": "Nova auditoria (completa)",
        "body": "O questionário estruturado completo — uma pontuação de conformidade e maturidade mais aprofundada que pode transformar num relatório partilhável. Ideal para uma avaliação minuciosa.",
        "cta": "Criar uma nova auditoria →"
      },
      "skip": "Ignorar — ir diretamente para o meu dashboard"
    }
  },
  auth: {
    "login": {
      "title": "Iniciar sessão",
      "subtitle": "Bem-vindo de volta ao AiLunaPro",
      "forgotPassword": "Esqueceu-se da palavra-passe?",
      "signingIn": "A iniciar sessão…",
      "signInButton": "Iniciar sessão",
      "noAccountPrompt": "Ainda não tem uma conta?",
      "signUpLink": "Registar-se"
    },
    "field": {
      "emailAddress": "Endereço de e-mail",
      "password": "Palavra-passe",
      "fullName": "Nome completo",
      "workEmail": "E-mail profissional"
    },
    "placeholder": {
      "email": "voce@empresa.com",
      "fullName": "Sofia Martins"
    },
    "signup": {
      "title": "Crie a sua conta",
      "subtitle": "Inicie o seu percurso de conformidade de IA",
      "passwordHint": "Mínimo de 8 caracteres",
      "creatingAccount": "A criar a conta…",
      "createAccountButton": "Criar conta",
      "haveAccountPrompt": "Já tem uma conta?",
      "signInLink": "Iniciar sessão"
    },
    "forgot": {
      "title": "Redefinir palavra-passe",
      "subtitleSent": "Verifique a sua caixa de entrada para encontrar a ligação de redefinição.",
      "subtitle": "Introduza o seu e-mail e enviar-lhe-emos uma ligação de redefinição.",
      "sentDetail": "Verifique a pasta de spam se não chegar.",
      "backToSignIn": "← Voltar ao início de sessão",
      "sending": "A enviar…",
      "sendResetLink": "Enviar ligação de redefinição",
      "rememberPrompt": "Lembra-se da sua palavra-passe?",
      "signInLink": "Iniciar sessão"
    },
    "invite": {
      "titleParsing": "A ler o convite…",
      "titleAuthRequired": "Inicie sessão para aceitar",
      "titleVerifying": "A verificar o convite…",
      "titleAccepting": "A adicioná-lo ao espaço de trabalho…",
      "titleDone": "Bem-vindo à equipa!",
      "titleError": "Problema com o convite",
      "authRequiredBody": "Inicie sessão ou crie uma conta para aceitar este convite.",
      "redirecting": "A redirecionar…",
      "pleaseWait": "Aguarde um momento.",
      "createAccountButton": "Criar conta",
      "signInButton": "Iniciar sessão",
      "backToDashboard": "Voltar ao dashboard"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "Central de Ajuda",
      "subtitle": "Encontre respostas, aprenda fluxos de trabalho e resolva problemas comuns.",
      "onThisPage": "Nesta página",
      "tocAria": "Secções de ajuda",
      "keyTakeaways": "Pontos-chave",
      "needMoreHelpTitle": "Precisa de mais ajuda?",
      "needMoreHelpBody": "Contacte o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro."
    },
    "gettingStarted": {
      "title": "Primeiros Passos",
      "lede": "A AiLunaPro é uma suíte de conformidade e transformação por IA para organizações que adotam IA — auditorias, um registo de IA, recomendações de agentes, estimativas de ROI e um modelo de uso baseado em tokens num único espaço de trabalho.",
      "take1": "Comece pelo painel e, em seguida, execute uma Nova Auditoria a partir da barra lateral.",
      "take2": "Duas ferramentas públicas não exigem início de sessão: o Diagnóstico Express e a Calculadora de ROI.",
      "take3": "Proprietários e administradores convidam colegas de equipa com ligações válidas por 7 dias.",
      "firstActionsTitle": "As suas três primeiras ações",
      "fa1": "Abra o painel e reveja a sua pontuação atual de maturidade em IA.",
      "fa2": "Execute uma Nova Auditoria a partir da barra lateral para registar o seu uso e riscos de IA.",
      "fa3": "Explore o catálogo de Agentes para ver quais os agentes da AiLunaPro que se adequam ao seu fluxo de trabalho.",
      "leadMagnetsTitle": "Ferramentas públicas de captação",
      "lm1": "Diagnóstico Express — uma avaliação gratuita de maturidade em IA com 8 perguntas, sem necessidade de conta.",
      "lm2": "Calculadora de ROI — estime o tempo e o dinheiro que a sua equipa pode poupar com os agentes da AiLunaPro.",
      "publicLinks": "Pode encontrar ambas em `#/diagnostic` e `#/roi-calculator`. Partilhe estas ligações com colegas — não exigem início de sessão.",
      "inviteTitle": "Convidar colegas de equipa",
      "inviteBody": "Proprietários e administradores podem convidar colegas de equipa a partir da página Equipa na barra lateral. Cada convidado recebe uma ligação válida por 7 dias. As funções são atribuídas no momento do convite.",
      "flowTitle": "Como funciona o fluxo",
      "flowStep1": "Nova Auditoria",
      "flowStep2": "Submeter Auditoria",
      "flowStep3": "Auditoria guardada + pontuação",
      "flowStep4": "Gerar relatório",
      "flowStep5": "Lista de Relatórios",
      "flowCaption": "Da auditoria a um instantâneo de relatório partilhável"
    },
    "auditVsReport": {
      "title": "Auditoria vs Relatório",
      "inShortTitle": "Em resumo",
      "inShort1": "Uma **Auditoria** capta as suas respostas e calcula a sua pontuação.",
      "inShort2": "Um **Relatório** é um **instantâneo** de uma auditoria, criado intencionalmente para partilhar ou arquivar.",
      "calloutSubmit": "**Submeter guarda a sua auditoria + pontuação.** Um **Relatório** é um instantâneo, criado apenas quando clica em **Gerar relatório**.",
      "whatIsAuditTitle": "O que é uma Auditoria?",
      "wa1": "As suas respostas a perguntas estruturadas.",
      "wa2": "A sua pontuação de conformidade / maturidade.",
      "wa3": "Uma análise dinâmica que pode evoluir com as regras de pontuação.",
      "calloutEditable": "Uma auditoria permanece editável até gerar um relatório.",
      "whatIsReportTitle": "O que é um Relatório?",
      "wr1": "Um instantâneo congelado num momento específico no tempo.",
      "wr2": "Criado apenas ao clicar em **Gerar relatório**.",
      "wr3": "Estável mesmo que execute novas auditorias mais tarde. Exportável e partilhável, listado em **Relatórios** para o espaço de trabalho ativo.",
      "flowStep1": "Submeter Auditoria",
      "flowStep2": "Auditoria guardada",
      "flowStep3": "Gerar relatório?",
      "flowStep4": "Instantâneo de relatório",
      "flowStep5": "Lista de Relatórios",
      "flowCaption": "Um relatório só é criado em Gerar relatório",
      "calloutFlow": "**Submeter Auditoria** → guarda a auditoria + pontuação. **Gerar relatório** → cria um instantâneo visível em *Relatórios*.",
      "closing": "Uma vista de **Histórico de auditorias** (distinta dos Relatórios) está disponível na barra lateral. *Em breve:* relatório automático opcional ao submeter."
    },
    "reportsWorkspaces": {
      "title": "Relatórios e Espaços de Trabalho",
      "p1": "Os relatórios são **por espaço de trabalho**, não globais. A lista de Relatórios mostra apenas os relatórios do espaço de trabalho **ativo**.",
      "flowStep1": "Espaço de trabalho A → os seus relatórios",
      "flowStep2": "Espaço de trabalho B → os seus relatórios",
      "flowCaption": "Cada espaço de trabalho mantém os seus próprios relatórios",
      "calloutWarn": "Não vê um relatório antigo? Provavelmente pertence a **outro espaço de trabalho**. Mude de espaço de trabalho a partir do seletor no topo da barra lateral.",
      "calloutNote": "O filtro de data do painel **não** afeta a lista de Relatórios."
    },
    "fillingAudit": {
      "title": "Como preencher a auditoria corretamente",
      "p1": "Boas respostas tornam uma auditoria credível. Reserve um minuto para responder com honestidade — o resultado reflete o que introduzir.",
      "calloutInfo": "Os campos de texto livre **“Descrever…”** acrescentam contexto. A sua **pontuação provém das perguntas estruturadas (de escolha)**, não do texto livre. Use informação clara, real e legível para um relatório credível.",
      "li1": "Responda a todas as perguntas estruturadas — são elas que determinam a pontuação e as conclusões.",
      "li2": "Use os campos de texto livre para contexto real (responsáveis, ferramentas, processos), não texto de marcação de posição.",
      "li3": "Volte a executar a auditoria à medida que as suas práticas evoluem para acompanhar o progresso."
    },
    "agents": {
      "title": "Agentes de IA",
      "lede": "O catálogo de Agentes lista dez agentes de IA prontos a usar para fluxos de trabalho empresariais comuns. Cada cartão mostra uma descrição, o ROI esperado, um plano mínimo recomendado e uma ligação para começar.",
      "take1": "Dez agentes próprios, cada um identificado como AiLunaPro.",
      "take2": "Um selo de plano (Starter+ / Professional+ / Enterprise+) sugere o nível típico.",
      "take3": "“Obter este agente” inicia o fluxo de inscrição padrão — ainda sem compra dentro da aplicação.",
      "catalogTitle": "Catálogo (10 agentes)",
      "cat1": "automatize as respostas a clientes e reduza a carga de trabalho do suporte.",
      "cat2": "qualifique potenciais clientes e prepare seguimentos comerciais.",
      "cat3": "auxilie com faturas, orçamentos e cobranças.",
      "cat4": "auxilie as equipas de RH com triagem, resumos e documentação.",
      "cat5": "ajude a estruturar a conformidade de IA, riscos e registos.",
      "cat6": "gere conteúdos, campanhas e ideias de marketing.",
      "cat7": "crie resumos, painéis e relatórios de decisão.",
      "cat8": "apoie a auditoria de IA, a avaliação de maturidade e os planos de ação.",
      "cat9": "classifique, resuma e extraia informação de documentos.",
      "cat10": "automatize o trabalho administrativo diário.",
      "sourceBadgeTitle": "Selo de origem",
      "sourceBadgeBody": "Os agentes são identificados como **AiLunaPro** quando são próprios. Versões futuras irão apresentar alternativas externas com o seu próprio selo.",
      "planBadgeTitle": "Selo de plano",
      "planBadgeBody": "Cada cartão mostra um selo de plano mínimo (Starter+, Professional+, Enterprise+). Indica o nível de subscrição recomendado para o uso típico.",
      "getAgentTitle": "Obter este agente",
      "getAgentBody": "Clique no botão \"Obter este agente\" para iniciar a integração. Os agentes ainda não podem ser adquiridos diretamente na AiLunaPro — a ligação leva-o pelo fluxo de inscrição padrão."
    },
    "tokens": {
      "title": "Tokens",
      "intro": "Os tokens são a unidade de consumo de IA na AiLunaPro. Cada auditoria, recomendação ou chamada de agente usa tokens da alocação mensal do seu espaço de trabalho.",
      "howTitle": "Como funcionam os tokens",
      "how1": "A sua subscrição inclui uma alocação mensal de tokens adequada ao plano.",
      "how2": "A cada ciclo, o seu saldo é renovado. Um pequeno transporte (limitado a uma alocação mensal) transita para evitar perder tokens não utilizados.",
      "how3": "Se o seu saldo ficar baixo, pode comprar um pacote de recarga a qualquer momento.",
      "how4": "Os tokens de recarga são adicionados ao seu saldo e nunca expiram.",
      "how5": "As recargas complementam a sua subscrição — não a substituem.",
      "packsTitle": "Pacotes de recarga",
      "packsBody": "Estão disponíveis três pacotes: Starter (+5,000 tokens), Pro (+25,000 tokens), Max (+100,000 tokens). Os pacotes de tokens são atualmente faturados em USD.",
      "balanceTitle": "Onde ver o seu saldo",
      "balanceBody": "O selo de tokens na barra superior mostra o seu saldo atual e a alocação mensal. Clique nele para abrir a página de Tokens e ver o histórico completo de uso e comprar uma recarga.",
      "runOutTitle": "Quando os tokens se esgotam",
      "runOutBody": "As ações de IA que exigem mais tokens do que o seu saldo mostram uma mensagem clara de \"tokens insuficientes\" e uma ligação para comprar uma recarga. Proprietários, administradores e gestores de faturação podem comprar pacotes. Os membros podem ver saldos, mas não podem comprar."
    },
    "billing": {
      "title": "Faturação",
      "lede": "A AiLunaPro oferece os planos Free, Starter, Professional e Enterprise, que diferem na alocação de tokens, no volume de auditorias e nas capacidades de equipa. O pagamento e a gestão funcionam através do Stripe.",
      "take1": "A faturação e os pacotes de tokens são em USD; o seletor de moeda é apenas de apresentação por agora.",
      "take2": "Proprietários/administradores subscrevem e gerem planos a partir da página Faturação (Portal do Cliente Stripe).",
      "take3": "O plano Free inclui auditorias limitadas e 100 tokens por mês.",
      "currencyTitle": "Moeda",
      "currencyBody": "A faturação e os pacotes de tokens são atualmente em USD. O seletor de moeda da barra lateral é apenas uma preferência de apresentação. Ainda não altera a moeda do pagamento Stripe nem o preço dos pacotes de tokens. A faturação multi-moeda está planeada para uma versão futura.",
      "subscribingTitle": "Subscrever",
      "subscribingBody": "A partir da página Faturação, proprietários e administradores podem escolher um plano e concluir o pagamento via Stripe. A subscrição é ativada imediatamente após o pagamento bem-sucedido e a sua alocação de tokens atualiza-se automaticamente.",
      "manageTitle": "Gerir a sua subscrição",
      "manageBody": "O botão \"Gerir subscrição\" abre o Portal do Cliente Stripe, onde pode atualizar o seu método de pagamento, mudar de plano, ver faturas ou cancelar. O cancelamento entra em vigor no final do período atual.",
      "invoicesTitle": "Faturas",
      "invoicesBody": "As faturas surgem na página Faturação após cada renovação. Clique em Ver ou PDF para descarregar uma cópia.",
      "freeTitle": "Plano Free",
      "freeBody": "O plano Free dá acesso limitado a auditorias e 100 tokens por mês. Use-o para explorar o produto antes de subscrever."
    },
    "diagnostic": {
      "title": "Diagnóstico Express",
      "intro": "O Diagnóstico Express é uma avaliação gratuita de 8 perguntas que lhe dá uma pontuação de maturidade em IA de 0 a 100, juntamente com uma breve lista de agentes da AiLunaPro recomendados.",
      "accessTitle": "Onde aceder",
      "accessBody": "Abra `#/diagnostic` no seu navegador. Não requer início de sessão. Demora cerca de dois minutos. Pode partilhar a ligação com colegas.",
      "getTitle": "O que recebe",
      "get1": "Uma pontuação normalizada de 0 a 100.",
      "get2": "Um nível de maturidade: Emergente, Em desenvolvimento ou Avançado.",
      "get3": "Três agentes recomendados adaptados à sua fase.",
      "get4": "Uma ligação direta para criar a sua conta gratuita na AiLunaPro.",
      "privacyTitle": "Privacidade",
      "privacyBody": "As respostas submetidas e o seu e-mail são armazenados apenas para gerar o seu diagnóstico e para dar seguimento sobre serviços de IA relevantes. Pode solicitar a eliminação a qualquer momento."
    },
    "roiCalculator": {
      "title": "Calculadora de ROI",
      "intro": "A Calculadora de ROI estima quanto tempo e dinheiro a sua equipa pode poupar ao adotar agentes de IA da AiLunaPro para um fluxo de trabalho específico.",
      "accessTitle": "Onde aceder",
      "accessBody": "Abra `#/roi-calculator` no seu navegador. Não requer início de sessão. Demora cerca de um minuto.",
      "inputsTitle": "Entradas",
      "in1": "Dimensão da equipa (1 a 10,000).",
      "in2": "Horas mensais que a sua equipa dedica a trabalho repetitivo.",
      "in3": "Custo médio por hora em USD (predefinido em 50).",
      "in4": "Fluxo de trabalho alvo (um de nove: suporte, vendas, finanças, documentos, relatórios, administração, conformidade, marketing, RH).",
      "outputsTitle": "Resultados",
      "out1": "Custo mensal estimado poupado (USD).",
      "out2": "Custo anual estimado poupado (USD).",
      "out3": "Tempo estimado poupado por mês (horas).",
      "out4": "Período de retorno estimado em meses.",
      "out5": "Dois agentes da AiLunaPro recomendados para o fluxo de trabalho escolhido.",
      "aboutTitle": "Sobre a estimativa",
      "aboutBody": "O resultado baseia-se na informação que fornece e em pressupostos de automatização conservadores. As poupanças reais podem variar. O retorno usa um custo de agente provisório de $99/month até o preço dos agentes ser finalizado."
    },
    "team": {
      "title": "Equipa e Funções",
      "intro": "A AiLunaPro suporta cinco funções por espaço de trabalho. Cada função tem um âmbito específico:",
      "thRole": "Função",
      "thManageWorkspace": "Gerir espaço de trabalho",
      "thManageBilling": "Gerir faturação",
      "thRunAudits": "Executar auditorias",
      "thViewReports": "Ver relatórios",
      "limited": "limitado",
      "inviteTitle": "Convidar colegas de equipa",
      "inviteBody": "Proprietários e administradores abrem a página Equipa, clicam em Convidar, introduzem o endereço de e-mail e escolhem uma função. O convidado recebe uma ligação válida por 7 dias. Se uma ligação expirar ou for perdida, proprietários e administradores podem regenerá-la.",
      "rolesTitle": "Alterar funções",
      "rolesBody": "Proprietários e administradores podem alterar a função de um colega de equipa a partir da página Equipa. Os membros podem ser temporariamente desativados (sem acesso) e reativados mais tarde, ou removidos do espaço de trabalho."
    },
    "settings": {
      "title": "Definições",
      "lede": "Faça a gestão do seu perfil, organização, aparência e preferências de notificação. Os seletores de idioma e moeda são preferências de apresentação por agora.",
      "take1": "Os detalhes de perfil e organização encontram-se em Definições.",
      "take2": "O tema (claro/escuro) persiste entre sessões.",
      "take3": "O idioma e a moeda são apenas de apresentação até essas funcionalidades estarem disponíveis.",
      "profileTitle": "Perfil",
      "profileBody": "Atualize o seu nome de exibição e endereço de e-mail em **Definições → Perfil**.",
      "orgTitle": "Organização",
      "orgBody": "Os proprietários podem renomear a organização em **Definições → Organização**.",
      "themeTitle": "Tema",
      "themeBody": "Alterne entre o modo claro e escuro em **Definições → Preferências**. A sua escolha persiste entre sessões.",
      "languageTitle": "Idioma",
      "languageBody": "O seletor de idioma na barra lateral e nas Definições é apenas uma preferência. A aplicação é atualmente apresentada em inglês. O suporte completo multilíngue está planeado para uma versão futura.",
      "currencyTitle": "Moeda",
      "currencyBody": "O seletor de moeda na barra lateral e nas Definições é apenas uma preferência de apresentação. A faturação e o preço dos pacotes de tokens permanecem em USD até a faturação multi-moeda ser implementada.",
      "emailTitle": "Notificações por e-mail",
      "emailBody": "Escolha quais os e-mails que pretende receber: resumo semanal de conformidade, notificações de relatório pronto e atividade da equipa. **Definições → Preferências → Notificações por e-mail**."
    },
    "analytics": {
      "title": "Análises e Cookies (Opcional)",
      "intro": "A AiLunaPro usa análises de produto opcionais e respeitadoras da privacidade para nos ajudar a melhorar a fiabilidade e a resolver problemas mais depressa. É inteiramente opcional e permanece desativada até que a autorize.",
      "offByDefault": "**Desativada por predefinição** — nada é recolhido até que escolha **Permitir**.",
      "collectedTitle": "O que é recolhido",
      "chipNoPersonal": "Sem dados pessoais",
      "chipNoRecording": "Sem gravação de sessão",
      "chipNoAds": "Sem rastreio publicitário",
      "collectedBody": "Apenas sinais de uso anónimos, como visualizações de página e eventos de fiabilidade.",
      "optTitle": "Ative ou desative a qualquer momento",
      "opt1": "Na sua primeira visita, escolha Permitir ou Não, obrigado no pequeno banner.",
      "opt2": "A sua escolha é guardada neste dispositivo — o banner não voltará a perguntar.",
      "opt3": "Para a alterar, limpe o armazenamento deste site no navegador (dados do site) e recarregue.",
      "dntTitle": "Não Rastrear",
      "dntBody": "Se o seu navegador enviar um sinal de “Não Rastrear”, as análises permanecem desativadas automaticamente e não é mostrado nenhum banner.",
      "blockedTitle": "Se as análises estiverem bloqueadas",
      "blockedBody": "Alguns navegadores, extensões ou redes bloqueiam pedidos de análise. Isso não há problema nenhum — a aplicação funciona normalmente de qualquer forma, e não é necessária nenhuma ação."
    },
    "troubleshooting": {
      "title": "Resolução de Problemas",
      "lede": "Soluções rápidas para os problemas mais comuns. A maioria resolve-se com uma atualização da página; se não, o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro podem ajudar.",
      "take1": "Atualize primeiro a página — resolve a maioria dos problemas de carregamento, saldo e sessão.",
      "take2": "Os créditos de tokens chegam poucos segundos após um pagamento bem-sucedido.",
      "take3": "Um ecrã em branco costuma ser uma extensão do navegador ou um filtro de rede.",
      "loadTitle": "A página não carrega",
      "loadBody": "O serviço pode estar temporariamente indisponível. Atualize a página. Se o problema persistir, contacte o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro.",
      "signedOutTitle": "A sua sessão foi terminada inesperadamente",
      "signedOutBody": "A sua sessão pode ter expirado. Inicie sessão novamente. Se a sua sessão continuar a ser terminada, contacte o proprietário do seu espaço de trabalho.",
      "balanceTitle": "O saldo de tokens parece incorreto",
      "balanceBody": "Atualize a página primeiro. Se o seu saldo continuar a parecer errado após a atualização, contacte o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro.",
      "balanceCheckoutTitle": "O saldo de tokens não foi atualizado após o pagamento",
      "balanceCheckoutBody": "Aguarde um momento e atualize a página. Os créditos de tokens chegam poucos segundos após um pagamento bem-sucedido. Se o saldo continuar sem atualizar, contacte o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro.",
      "captchaTitle": "O captcha continua a falhar nos formulários públicos",
      "captchaBody": "Recarregue a página e complete o captcha novamente. Se o problema persistir, experimente um navegador diferente ou contacte o suporte da AiLunaPro.",
      "syncTitle": "A sincronização da subscrição falhou",
      "syncBody": "Na página de sucesso de Faturação, clique em Repetir sincronização. Se a falha persistir, contacte o suporte da AiLunaPro e inclua o seu recibo Stripe.",
      "inviteTitle": "A ligação de convite não funciona",
      "inviteBody": "Os convites expiram após 7 dias. Peça ao proprietário ou administrador do seu espaço de trabalho para regenerar o convite a partir da página Equipa.",
      "roadmapTitle": "Qual é a diferença entre Roadmap e Plano de Ação?",
      "roadmapBody": "Ambas as vistas derivam das mesmas conclusões e recomendações da auditoria, mas respondem a perguntas diferentes. O **Roadmap** responde a **quando** entregar o trabalho — os itens são agrupados por horizonte (30 / 60 / 90 dias) para ajudar no planeamento e na capacidade. O **Plano de Ação Priorizado** responde ao **que corrigir primeiro** — os itens são agrupados por prioridade (Crítico / Importante / Melhoria) usando uma regra determinística fixa sobre a gravidade existente das conclusões e o impacto das recomendações. São complementares, não duplicados. Nenhuma das vistas altera a pontuação, e nenhuma é uma certificação de conformidade.",
      "blankTitle": "Ecrã em branco, \"Oops\" ou esquema partido?",
      "blankBody": "Isto é quase sempre um **bloqueador de anúncios ou extensão de privacidade** do navegador (ou um filtro corporativo/VPN/DNS) a bloquear os scripts, estilos ou pedidos de dados da aplicação — pode ver **ERR_BLOCKED_BY_CLIENT** na consola. Resolva permitindo **audit.ailunapro.com** e ***.googleapis.com** no seu bloqueador, ou abra a aplicação num perfil de navegador limpo sem extensões e, em seguida, recarregue.",
      "emailTitle": "Não recebeu o e-mail de verificação ou de reposição de palavra-passe?",
      "emailBody": "Os e-mails de verificação e de reposição de palavra-passe são enviados pelo Firebase a partir do endereço no-reply configurado no seu projeto (o remetente predefinido do Firebase até que um domínio de remetente personalizado seja verificado). Verifique primeiro a sua pasta de **spam / promoções**. Pode reenviar o e-mail de verificação em **Definições → Perfil**, ou solicitar uma nova ligação de reposição na página **Esqueci-me da palavra-passe**. Após verificar, termine a sessão e volte a iniciá-la para que a sua conta reflita o estado verificado. (Os convites de equipa são separados e enviados através do fornecedor de e-mail da AiLunaPro.)"
    },
    "faq": {
      "title": "Perguntas Frequentes",
      "q1": "Porque não vejo os meus relatórios antigos?",
      "a1": "Os relatórios são **por espaço de trabalho**. Um relatório mais antigo provavelmente pertence a um espaço de trabalho diferente — mude de espaço de trabalho a partir do seletor no topo da barra lateral. O filtro de data do painel não afeta a lista de Relatórios.",
      "q2": "Porque é que Relatórios está vazio?",
      "a2": "Uma auditoria submetida, por si só, não cria um relatório. Abra uma auditoria submetida e clique em **Gerar relatório** para criar um instantâneo — depois aparece em Relatórios.",
      "q3": "O texto aleatório afeta a minha pontuação?",
      "a3": "Não. A pontuação provém das perguntas estruturadas (de escolha). Os campos de texto livre “Descrever…” acrescentam apenas contexto — mas respostas claras e reais tornam o seu relatório credível.",
      "q4": "O que é guardado, e quando?",
      "a4": "**Submeter Auditoria** guarda as suas respostas + pontuação. **Gerar relatório** cria um instantâneo separado e partilhável. Consulte “Auditoria vs Relatório” acima.",
      "q5": "Os meus dados estão seguros?",
      "a5": "A AiLunaPro usa acesso autenticado, permissões baseadas em funções, regras de segurança do Firestore e gravações do lado do servidor para operações sensíveis. As quantidades de tokens, as ações de faturação e as alterações de equipa são validadas pelo servidor.",
      "q6": "Posso eliminar os meus dados?",
      "a6": "Sim. Contacte o proprietário do seu espaço de trabalho ou o suporte da AiLunaPro para solicitar a eliminação da sua conta ou dos dados do seu espaço de trabalho.",
      "q7": "Porque é que os pacotes de tokens são em USD?",
      "a7": "A AiLunaPro está a implementar o suporte multi-moeda por fases. As subscrições suportam várias moedas via Stripe. Os pacotes de tokens passarão a ser multi-moeda numa versão futura.",
      "q8": "O que faz o seletor de moeda?",
      "a8": "É apenas uma preferência de apresentação. Ainda não altera a moeda do pagamento Stripe nem o preço dos pacotes de tokens.",
      "q9": "O que faz o seletor de idioma?",
      "a9": "Armazena o seu idioma preferido. A tradução completa da interface está em curso e será disponibilizada numa versão futura.",
      "q10": "Como contacto o suporte?",
      "a10": "Para questões de conta, faturação ou técnicas, contacte primeiro o proprietário do seu espaço de trabalho. Para problemas que exijam a nossa ajuda, contacte diretamente o suporte da AiLunaPro.",
      "q11": "Os agentes já podem ser adquiridos dentro da AiLunaPro?",
      "a11": "Ainda não. O catálogo de Agentes lista agentes de IA recomendados. Selecionar \"Obter este agente\" leva-o pelo fluxo de integração padrão. A compra direta na aplicação está planeada para uma fase posterior.",
      "q12": "A estimativa de ROI é garantida?",
      "a12": "Não. A Calculadora de ROI dá uma estimativa conservadora com base na informação que fornece. As poupanças reais dependem do seu fluxo de trabalho, da qualidade da integração e da adoção."
    }
  },
  systemBuilder: {
    "chrome": {
      "pageTitle": "Construtor de Sistemas de IA",
      "pageIntro": "Um guia de design pré-implementação. Percorra seis dimensões — finalidade e risco, dados, modelo, supervisão, monitorização, documentação — para conceber um sistema de IA de forma responsável. A sua etapa e marcações da checklist são guardadas apenas neste dispositivo.",
      "designSteps": "Etapas de design",
      "checklist": "Checklist",
      "doneSuffix": "· {doneCount}/{total} concluídos",
      "keyQuestions": "Perguntas-chave",
      "references": "Referências (carácter consultivo, não aconselhamento jurídico)",
      "previousStep": "← Etapa anterior",
      "nextStep": "Etapa seguinte →",
      "stepOf": "Etapa {n} de {total}",
      "endOfGuide": "✓ Fim do guia — as seis dimensões abordadas"
    },
    "steps": {
      "purpose": {
        "title": "1. Finalidade e classificação de risco",
        "intro": "Defina para que serve o sistema, quem afeta e qual o seu nível de risco antes de construir o que quer que seja. Isto serve de âncora a todas as decisões posteriores.",
        "checklist": {
          "c1": "Escreva uma finalidade prevista numa frase (sem jargão).",
          "c2": "Liste as pessoas ou grupos afetados (utilizadores, clientes, terceiros).",
          "c3": "Classifique o nível de risco: inaceitável / elevado (Annex III) / limitado / mínimo — ou GPAI.",
          "c4": "Documente o âmbito do caso de uso e o seu limite (o que está fora do âmbito).",
          "c5": "Liste o uso indevido previsível / uso fora do indicado e o que se recusará a fazer."
        },
        "questions": {
          "q1": "Quem tem autoridade para implementar ou suspender este sistema?",
          "q2": "O que acontece — concretamente — se o sistema errar?",
          "q3": "Que direitos legais, condições de segurança ou liberdades poderão ser afetados?"
        }
      },
      "data": {
        "title": "2. Governação de dados",
        "intro": "Se os seus dados estiverem errados, o sistema estará errado. Inventarie-os, classifique-os, justifique por que os detém e fique atento a enviesamentos.",
        "checklist": {
          "c1": "Crie um inventário de dados: origem, responsável, sensibilidade, retenção.",
          "c2": "Estabeleça uma base legal (GDPR Art. 6) para cada categoria processada.",
          "c3": "Documente a qualidade: relevância, representatividade, lacunas, enviesamentos conhecidos.",
          "c4": "Aplique a minimização de dados: recolha apenas o necessário; retenha apenas o tempo necessário.",
          "c5": "Planeie revisões periódicas de enviesamento e vias de ação corretiva."
        },
        "questions": {
          "q1": "De onde veio cada conjunto de dados e quem é responsável por ele?",
          "q2": "O conjunto de dados inclui categorias sensíveis (Art. 9 GDPR)? Com que base?",
          "q3": "Que sinais de enviesamento vai medir e contra que referência?"
        }
      },
      "model": {
        "title": "3. Seleção e validação do modelo",
        "intro": "Escolha o menor modelo que funcione. Valide-o da forma como os atacantes e os utilizadores realmente o vão usar. Documente o que ele não consegue fazer.",
        "checklist": {
          "c1": "Justifique a escolha da dimensão / família do modelo face ao caso de uso real.",
          "c2": "Defina metas de precisão + robustez e como as vai medir.",
          "c3": "Realize testes adversariais / de red-team (prompt injection, jailbreaks, resultados enviesados).",
          "c4": "Documente os modos de falha conhecidos e os usos explicitamente proibidos.",
          "c5": "Versione cada artefacto do modelo e inclua notas de alteração nas implementações."
        },
        "questions": {
          "q1": "Porquê este modelo e que alternativa mais barata descartou?",
          "q2": "Como se apresenta o sistema quando erra — e como é que o sabe?",
          "q3": "O seu conjunto de testes é representativo do tráfego em produção?"
        }
      },
      "oversight": {
        "title": "4. Supervisão humana",
        "intro": "Decida como os humanos mantêm o controlo sobre os resultados de impacto significativo. Garanta que os controlos funcionam mesmo sob pressão.",
        "checklist": {
          "c1": "Escolha o modo de supervisão por tipo de decisão: in-loop, on-loop ou out-of-loop.",
          "c2": "Nomeie revisores e documente SLAs para decisões de elevado impacto.",
          "c3": "Disponibilize controlos de substituição / pausa / kill-switch que o revisor possa usar.",
          "c4": "Escreva um runbook de escalonamento (quem é acionado, com que contexto).",
          "c5": "Registe cada substituição / pausa para revisão pós-incidente."
        },
        "questions": {
          "q1": "Quem revê os resultados de elevado impacto — e tem o tempo e o contexto para o fazer?",
          "q2": "Pode um único operador parar o sistema sem uma reunião?",
          "q3": "Como evita a aprovação automática (\"complacência com a automação\")?"
        }
      },
      "monitoring": {
        "title": "5. Monitorização e incidentes",
        "intro": "A monitorização pós-implementação não é opcional. A deriva é silenciosa. Os incidentes não.",
        "checklist": {
          "c1": "Defina métricas de monitorização pós-implementação (precisão, latência, dano, deriva).",
          "c2": "Implemente deteção de deriva nas entradas e nas saídas.",
          "c3": "Registe os incidentes numa única fila com gravidade e responsável.",
          "c4": "Documente as vias de comunicação (regulador, cliente, interno).",
          "c5": "Agende reavaliações periódicas (no mínimo trimestrais)."
        },
        "questions": {
          "q1": "Que métrica isolada, ao mover-se, lhe indica que deve suspender o sistema?",
          "q2": "Quem é acionado às 3 da manhã e que runbook abre?",
          "q3": "Quando ensaiou pela última vez um cenário de incidente de IA?"
        }
      },
      "docs": {
        "title": "6. Documentação e transparência",
        "intro": "Documente o que o sistema é, o que não é e o que os utilizadores precisam de saber. Atualize a cada alteração material.",
        "checklist": {
          "c1": "Mantenha documentação técnica conforme o Art. 11 (finalidade, dados, treino, avaliação, riscos).",
          "c2": "Publique um cartão de modelo / sistema por sistema; atualize a cada versão.",
          "c3": "Adicione uma divulgação de IA visível ao utilizador em cada superfície de cliente.",
          "c4": "Atualize os avisos de privacidade para refletir o processamento de IA.",
          "c5": "Mantenha registos de formação do pessoal que opera o sistema."
        },
        "questions": {
          "q1": "O que precisam os utilizadores finais de saber para usar este sistema de forma responsável?",
          "q2": "O que precisaria um auditor externo logo no primeiro dia?",
          "q3": "Quão atualizado está o cartão de modelo / sistema neste momento?"
        }
      }
    }
  },
  registry: {
    "page": {
      "title": "Registo de IA",
      "subtitle": "Acompanhe todas as ferramentas de IA usadas na sua organização — finalidade, dados, supervisão e mitigações. O registo alimenta as suas auditorias e relatórios.",
      "designGuideLink": "A conceber um novo sistema? Abrir o guia de design →",
      "addTool": "+ Adicionar ferramenta",
      "loading": "A carregar o registo…",
      "error": "Falha ao carregar o registo. Atualize para tentar novamente."
    },
    "summary": {
      "totalTools": "Total de ferramentas",
      "approved": "Aprovadas",
      "pendingReview": "Revisão pendente",
      "highRisk": "Alto risco"
    },
    "filters": {
      "searchPlaceholder": "Pesquisar ferramentas, finalidade, notas…",
      "allDepartments": "Todos os departamentos",
      "allRisks": "Todos os riscos",
      "allApproval": "Todas as aprovações",
      "clear": "Limpar filtros",
      "risk": {
        "low": "Baixo",
        "medium": "Médio",
        "high": "Alto",
        "critical": "Crítico"
      }
    },
    "table": {
      "tool": "Ferramenta",
      "department": "Departamento",
      "risk": "Risco",
      "approval": "Aprovação",
      "oversight": "Supervisão",
      "reviewDate": "Data de revisão"
    },
    "empty": {
      "noItems": {
        "title": "Ainda não existem ferramentas de IA no registo",
        "body": "Acompanhe todas as ferramentas de IA usadas na sua organização — finalidade, dados, supervisão e mitigações. O registo alimenta as suas auditorias e relatórios.",
        "action": "+ Adicionar a sua primeira ferramenta"
      },
      "noMatches": {
        "title": "Nenhuma ferramenta corresponde a estes filtros",
        "body": "Tente alargar os filtros ou limpe-os para ver o registo completo.",
        "action": "Limpar filtros"
      }
    },
    "modal": {
      "titleAdd": "Adicionar ferramenta de IA",
      "titleEdit": "Editar ferramenta de IA",
      "subtitleAdd": "Acompanhe uma ferramenta de IA usada pela sua equipa. Todos os campos podem ser editados mais tarde.",
      "subtitleEdit": "Atualize o que a sua equipa sabe sobre esta ferramenta. As alterações são guardadas de imediato no registo local.",
      "fields": {
        "toolName": "Nome da ferramenta",
        "purpose": "Finalidade",
        "dataTypes": "Tipos de dados processados",
        "mitigations": "Mitigações",
        "notes": "Notas",
        "department": "Departamento",
        "approvalStatus": "Estado de aprovação",
        "riskLevel": "Nível de risco",
        "humanOversight": "Supervisão humana",
        "nextReviewDate": "Data da próxima revisão"
      },
      "placeholders": {
        "toolName": "ex. Copiloto de apoio ao cliente",
        "purpose": "O que faz esta ferramenta?",
        "mitigation": "Adicione uma mitigação e prima Enter",
        "notes": "Fornecedor, residência, responsável, qualquer coisa que valha a pena registar…"
      },
      "riskOptions": {
        "low": "Baixo",
        "medium": "Médio",
        "high": "Alto",
        "critical": "Crítico"
      },
      "reviewDateHint": "Deixe em branco se não houver revisão agendada.",
      "auditTrail": "Criada {createdDate} · Última atualização {updatedDate}",
      "removeMitigationAria": "Remover mitigação {index}",
      "requiredError": "Obrigatório",
      "deleteConfirm": "Remover \"{toolName}\" do registo? Esta ação não pode ser anulada.",
      "buttons": {
        "delete": "Eliminar ferramenta",
        "cancel": "Cancelar",
        "addToRegistry": "Adicionar ao registo",
        "saveChanges": "Guardar alterações"
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "Relatórios",
      "intro": "Os relatórios gerados são instantâneos de uma auditoria num momento específico. Cada um é exportável, partilhável e permanece estável quando inicia uma nova auditoria.",
      "generateFromDraft": "+ Gerar a partir do rascunho atual",
      "startNewAudit": "Iniciar uma nova auditoria",
      "loading": "A carregar relatórios…",
      "errorMessage": "Ainda não há relatórios carregados. Isto pode acontecer se o espaço de trabalho for novo ou se o Firestore estiver inacessível.",
      "retry": "Tentar novamente",
      "traceabilityHint": "Os relatórios são instantâneos pontuais guardados no seu espaço de trabalho. A vista de detalhe recalcula o resultado completo a partir do instantâneo de respostas de cada relatório — por isso os relatórios históricos permanecem exatos mesmo depois de as regras de pontuação evoluírem."
    },
    "detail": {
      "loading": "A carregar relatório…",
      "notFoundTitle": "Relatório não encontrado",
      "notFoundBody": "Este relatório já não existe ou foi eliminado.",
      "backToReports": "← Voltar aos relatórios",
      "rename": {
        "titleAriaLabel": "Título do relatório",
        "saving": "…",
        "saveTitle": "Guardar título",
        "cancel": "Cancelar",
        "renameButton": "Renomear"
      },
      "download": {
        "preparing": "A preparar…",
        "downloadPdf": "⬇ Descarregar PDF"
      },
      "errors": {
        "tokensInsufficientExport": "Tokens insuficientes para exportar. Compre tokens para continuar.",
        "downloadFailed": "Falha ao descarregar. Tente novamente.",
        "renameForbidden": "Apenas proprietários ou administradores podem renomear relatórios.",
        "renameFailed": "Não foi possível renomear. Tente novamente.",
        "tokensInsufficient": "Tokens insuficientes. Compre tokens para continuar.",
        "shareDisabled": "A partilha está desativada para este relatório.",
        "shareForbidden": "Apenas proprietários ou administradores podem partilhar relatórios.",
        "shareCreateFailed": "Não foi possível criar uma ligação de partilha. Tente novamente.",
        "revokeFailed": "Não foi possível revogar a ligação. Tente novamente.",
        "toggleSharingFailed": "Não foi possível atualizar a partilha. Tente novamente."
      },
      "share": {
        "heading": "Ligação partilhável",
        "description": "Uma ligação assinada, sem início de sessão, para o PDF deste relatório. Criar ou regenerar conta para as suas exportações de PDF.",
        "working": "A processar…",
        "generateNewLink": "Gerar nova ligação",
        "revoke": "Revogar",
        "shareLink": "Ligação de partilha",
        "enableSharing": "Ativar partilha",
        "disableSharing": "Desativar partilha",
        "copied": "Copiado",
        "copy": "Copiar",
        "expires": "Expira a {date}.",
        "activeLinkExists": "Existe uma ligação ativa (expira a {date}). Gere uma nova ligação para ver o URL novamente — isto revoga a anterior.",
        "disabledNotice": "A partilha está desativada — as ligações existentes já não funcionam.",
        "useTokensAndCreateLink": "Usar tokens e criar ligação"
      },
      "status": {
        "notShared": "Não partilhado",
        "active": "Ativo",
        "expired": "Expirado",
        "revoked": "Revogado",
        "disabled": "Desativado"
      },
      "footer": {
        "openAssistancePlan": "Abrir plano de assistência",
        "deleteReport": "Eliminar relatório",
        "deleteConfirm": "Eliminar este relatório? Esta ação não pode ser anulada."
      },
      "metadata": {
        "heading": "Metadados",
        "reportId": "ID do relatório",
        "sourceDraft": "Rascunho de origem",
        "status": "Estado",
        "weakestSection": "Secção mais fraca",
        "frameworks": "Frameworks"
      }
    },
    "share": {
      "unavailableTitle": "Relatório partilhado indisponível",
      "backToReports": "← Voltar aos relatórios",
      "copySuccess": "Ligação de partilha copiada.",
      "copyFailure": "Não foi possível copiar a ligação. Tente novamente.",
      "banner": {
        "label": "🔗 Relatório partilhado — vista só de leitura",
        "description": "Vista só de leitura para pessoas do seu espaço de trabalho, aberta a partir da ligação de partilha na aplicação. Os botões de ação internos estão ocultos.",
        "copyShareLink": "🔗 Copiar ligação de partilha",
        "backToInternalView": "← Voltar à vista interna"
      },
      "topline": {
        "kicker": "Relatório de Conformidade de IA",
        "score": "Pontuação",
        "scoreOutOf": "/100",
        "generated": "Gerado a {date}"
      },
      "poweredBy": "Desenvolvido por AiLunaPro · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "Audit Express guardadas",
      "subtitle": "Os seus instantâneos guardados do Audit Express. Descarregue o PDF ou remova um resultado guardado.",
      "runAuditExpress": "Executar Audit Express",
      "loading": "A carregar…",
      "empty": {
        "prefix": "Ainda não há auditorias guardadas. Use",
        "runLink": "Executar Audit Express",
        "suffix": "para criar uma."
      },
      "meta": {
        "engineLabel": "motor",
        "engineFallback": "n/d",
        "confidenceLabel": "confiança"
      }
    },
    "actions": {
      "view": "Ver",
      "rename": "Renomear",
      "delete": "Eliminar",
      "download": "Descarregar PDF",
      "save": "Guardar",
      "cancel": "Cancelar",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "Título da auditoria",
      "viewDetailsTooltip": "Ver detalhes"
    },
    "errors": {
      "load": "Não foi possível carregar as suas auditorias guardadas. Tente novamente.",
      "tokensInsufficient": "Tokens insuficientes para exportar. Compre tokens para continuar.",
      "download": "Falha ao descarregar. Tente novamente.",
      "delete": "Falha ao eliminar. Tente novamente.",
      "rename": "Não foi possível renomear. Tente novamente."
    },
    "pdfLimitModal": {
      "ariaLabel": "Limite de exportação de PDF",
      "title": "Já utilizou as suas {freeCount} exportações de PDF gratuitas",
      "body": "Descarregar mais PDFs requer tokens ({tokenCost} tokens por exportação).",
      "useTokens": "Usar tokens e descarregar",
      "useTokensBusy": "…",
      "buyTokens": "Atualizar ou comprar tokens",
      "cancel": "Cancelar"
    },
    "detail": {
      "backToList": "← Auditorias guardadas",
      "loading": "A carregar…",
      "meta": {
        "engineLabel": "motor",
        "engineFallback": "n/d",
        "confidenceLabel": "confiança"
      },
      "rename": "Renomear",
      "save": "Guardar",
      "cancel": "Cancelar",
      "titleAriaLabel": "Título da auditoria",
      "busy": "…",
      "notRecomputed": "Não foi possível recalcular esta auditoria.",
      "downloadPdf": "Descarregar PDF",
      "downloadPdfBusy": "A preparar…",
      "backToSaved": "Voltar às auditorias guardadas"
    },
    "detailErrors": {
      "notFound": "Esta auditoria já não existe.",
      "load": "Não foi possível carregar esta auditoria. Tente novamente.",
      "rename": "Não foi possível renomear. Tente novamente.",
      "tokensInsufficient": "Tokens insuficientes. Compre tokens para continuar.",
      "sharingDisabled": "A partilha está desativada para esta auditoria.",
      "createShareLink": "Não foi possível criar uma ligação de partilha. Tente novamente.",
      "revokeShareLink": "Não foi possível revogar a ligação. Tente novamente.",
      "updateSharing": "Não foi possível atualizar a partilha. Tente novamente."
    },
    "recommendedAgents": {
      "heading": "Agentes recomendados",
      "exploreAll": "Explorar todos os agentes →",
      "disclaimer": "Correspondências indicativas com base nesta auditoria. Avalie a adequação antes de adotar.",
      "meta": {
        "hoursSaved": "~{hours} h/mês poupadas",
        "plan": "plano {plan}",
        "setup": "configuração {complexity}"
      }
    },
    "share": {
      "heading": "Ligação partilhável",
      "description": "Uma ligação assinada, sem início de sessão, para o PDF desta auditoria. Criar ou regenerar conta para as suas exportações de PDF.",
      "generateNewLink": "Gerar nova ligação",
      "shareLink": "Ligação de partilha",
      "working": "A processar…",
      "revoke": "Revogar",
      "enableSharing": "Ativar partilha",
      "disableSharing": "Desativar partilha",
      "copy": "Copiar",
      "copied": "Copiado",
      "expires": "Expira a {date}.",
      "activeLinkExists": "Existe uma ligação ativa (expira a {date}). Gere uma nova ligação para ver o URL novamente — isto revoga a anterior.",
      "disabledNotice": "A partilha está desativada — as ligações existentes já não funcionam.",
      "limitModalActionLabel": "Usar tokens e criar ligação"
    },
    "shareStatus": {
      "notShared": "Não partilhado",
      "active": "Ativo",
      "expired": "Expirado",
      "revoked": "Revogado",
      "disabled": "Desativado"
    }
  },
  billingPage: {
    "header": {
      "title": "Faturação",
      "subtitle": "Faça a gestão do seu plano, utilização e faturas.",
      "readOnlyBadge": "Vista só de leitura."
    },
    "plans": {
      "bestValueBadge": "Melhor valor",
      "priceApprox": "{approx}{suffix} aprox. · faturado em USD",
      "cta": {
        "redirecting": "A redirecionar…",
        "currentPlan": "Plano atual",
        "freeCurrent": "Free — atual",
        "startForFree": "Começar gratuitamente",
        "subscribe": "Subscrever"
      },
      "free": {
        "description": "Experimente a plataforma com acesso limitado.",
        "features": {
          "limitedAuditAccess": "Acesso limitado a auditorias",
          "basicDashboard": "Painel básico",
          "demoReports": "Relatórios de demonstração",
          "communitySupport": "Apoio da comunidade"
        }
      },
      "starter": {
        "description": "Realize auditorias reais por conta própria.",
        "features": {
          "coreAuditWorkflow": "Fluxo de auditoria essencial",
          "basicComplianceReports": "Relatórios de conformidade básicos",
          "starterAuditVolume": "Volume de auditorias Starter",
          "essentialAiRecommendations": "Recomendações essenciais de AI",
          "emailSupport": "Apoio por email"
        }
      },
      "professional": {
        "description": "Para equipas em crescimento que realizam auditorias avançadas.",
        "features": {
          "higherAuditVolume": "Maior volume de auditorias",
          "advancedReports": "Relatórios avançados",
          "teamCollaboration": "Colaboração em equipa",
          "priorityAiRecommendations": "Recomendações de AI prioritárias",
          "prioritySupport": "Apoio prioritário"
        }
      },
      "enterprise": {
        "description": "Governação e controlo ao nível da organização.",
        "features": {
          "highestAuditVolume": "Volume de auditorias mais elevado",
          "advancedTeamManagement": "Gestão avançada de equipas",
          "organizationControls": "Controlos da organização",
          "customBranding": "Marca personalizada",
          "dedicatedSupport": "Apoio dedicado",
          "enterpriseReadyGovernance": "Governação pronta para empresas"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "Moeda de faturação detetada a partir da sua região: {currency} {symbol}",
        "default": "Moeda de faturação: {currency} {symbol}"
      },
      "secureCheckoutBadge": "Pagamento seguro através de Stripe",
      "heading": "Escolha o plano que se adequa ao seu fluxo de auditoria",
      "subheadingPrefix": "Comece no modo de teste do Stripe. Não são feitas cobranças reais — utilize o cartão de teste",
      "subheadingSuffix": "."
    },
    "currentPlan": {
      "label": "Plano atual",
      "statusNoSubscription": "Sem subscrição",
      "freePlanNote": "Plano Free — sem subscrição ativa",
      "paidPlanSummary": "${price}/mês · faturado {billingCycle}",
      "renews": " · Renova {date}",
      "cancelsAtPeriodEnd": "⚠ Cancela no fim do período ({date})",
      "billedInCurrency": "A sua subscrição ativa é faturada em {currency}.",
      "resumePlan": "Retomar plano",
      "cancelPlan": "Cancelar plano"
    },
    "billingActions": {
      "title": "Ações de faturação",
      "manageSubscription": "Gerir subscrição",
      "managePaymentMethods": "Gerir métodos de pagamento",
      "loading": "A carregar…",
      "paymentMethodsHint": "Atualizar cartão, definir predefinido, remover — tratado de forma segura pela Stripe.",
      "noCustomerYet": "Ainda não existe cliente Stripe. Os métodos de pagamento ficam disponíveis após a sua primeira subscrição ou compra de tokens.",
      "portalError": "Não foi possível abrir o portal Stripe. Verifique se o Worker está em execução."
    },
    "tokens": {
      "title": "Tokens",
      "balance": "{balance} / {allocation} neste ciclo",
      "balanceLoading": "A carregar o saldo de tokens…",
      "manageTokens": "Gerir tokens"
    },
    "usage": {
      "sectionTitle": "Utilização neste período",
      "auditsLabel": "Auditorias",
      "seatsLabel": "Lugares",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "Período: {start} – {end}"
    },
    "invoices": {
      "sectionTitle": "Faturas",
      "empty": "Ainda não existem faturas.",
      "loading": "A carregar faturas…",
      "emptyAfterFirstCycle": "As faturas aparecerão aqui após o seu primeiro ciclo de faturação.",
      "tableHeaders": {
        "date": "Data",
        "description": "Descrição",
        "amount": "Montante",
        "status": "Estado",
        "invoiceNumber": "Número da fatura",
        "actions": "Ações"
      },
      "statusUnknown": "desconhecido",
      "actionView": "Ver",
      "actionPdf": "PDF",
      "managedInStripeNote": "O método de pagamento e os dados de faturação são geridos de forma segura na Stripe."
    },
    "mockPlans": {
      "sectionTitle": "Planos",
      "currentBadge": "Atual",
      "free": "Free",
      "priceSuffix": "/mês",
      "switch": "Mudar",
      "contactOwnerToChange": "Contacte o proprietário para mudar de plano"
    },
    "mockConfirm": {
      "title": "Mudar para {plan}",
      "body": "Esta é uma ação simulada — não ocorrerá nenhuma cobrança real.",
      "cancel": "Cancelar",
      "confirm": "Confirmar (simulação)"
    },
    "locked": {
      "title": "Acesso à faturação restrito",
      "subtitle": "Contacte o proprietário do seu espaço de trabalho para ver ou gerir a faturação.",
      "backToDashboard": "Voltar ao painel",
      "contactWorkspaceOwner": "Contactar o proprietário do espaço de trabalho",
      "askOwnerToast": "Peça acesso à faturação ao proprietário do seu espaço de trabalho."
    },
    "success": {
      "headline": {
        "failed": "Falha na sincronização",
        "active": "O seu plano {plan} está ativo",
        "activating": "Obrigado — a sua subscrição está a ser ativada"
      },
      "subtext": {
        "failedFallback": "Não foi possível finalizar a sua subscrição automaticamente.",
        "redirecting": "A redirecioná-lo para a Faturação…",
        "syncing": "Estamos a sincronizar a sua subscrição com a Stripe."
      },
      "pill": {
        "failed": "Falha na sincronização",
        "activated": "Subscrição ativada",
        "syncing": "A sincronizar subscrição…",
        "almostDone": "Quase concluído…"
      },
      "backToBilling": "Voltar à Faturação",
      "retrySync": "Tentar sincronizar novamente",
      "errors": {
        "stillProcessing": "O pagamento ainda está a ser processado. Aguarde um momento e tente novamente.",
        "sessionInvalid": "Esta sessão de pagamento já não é válida. Inicie uma nova subscrição.",
        "notSignedIn": "Não tem sessão iniciada. Inicie sessão e tente novamente.",
        "orgLinkFailed": "Não foi possível associar esta subscrição à sua organização. Contacte o apoio.",
        "generic": "Ocorreu um problema ao ativar a sua subscrição.",
        "noSessionDetected": "Não foi possível detetar a sua sessão de pagamento. Volte à Faturação e tente novamente."
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "Tokens",
      "subtitle": "Acompanhe a utilização, monitorize a sua alocação mensal e compre recargas quando necessário."
    },
    "locked": {
      "title": "Tokens indisponíveis",
      "clientMessage": "Os tokens não são visíveis a partir de uma conta de cliente.",
      "workspaceMessage": "Os tokens estão indisponíveis para este espaço de trabalho.",
      "backToDashboard": "Voltar ao painel"
    },
    "webhook": {
      "notice": "Pagamento recebido. A aguardar que o webhook da Stripe atualize o seu saldo de tokens.",
      "refreshBalance": "Atualizar saldo"
    },
    "balance": {
      "loading": "A carregar saldo…",
      "empty": "Ainda não existe saldo de tokens. Será criado na sua primeira auditoria.",
      "statBalance": "Saldo",
      "statMonthlyAllocation": "Alocação mensal",
      "statConsumed": "Consumido",
      "statRollover": "Transitado",
      "statTopups": "Recargas",
      "cycleEnds": "O ciclo termina: {cycleEnd}",
      "lastReset": "Última reposição: {lastReset}"
    },
    "packs": {
      "sectionTitle": "Desbloquear mais análises",
      "sectionNote": "Os pacotes de tokens são atualmente faturados em USD. Os tokens de recarga nunca expiram.",
      "readOnlyNotice": "Pode ver os tokens, mas apenas proprietários, administradores e gestores de faturação podem comprar pacotes.",
      "starterLabel": "Starter",
      "starterBlurb": "Reforce um ciclo em baixa.",
      "proLabel": "Pro",
      "proBlurb": "A recarga mais comum.",
      "maxLabel": "Max",
      "maxBlurb": "Reforço para grande carga de trabalho.",
      "tokensUnit": "tokens",
      "amountPrefix": "+{amount}",
      "buyPack": "Desbloquear o meu plano completo",
      "redirecting": "A redirecionar…",
      "readOnlyButton": "Só de leitura"
    },
    "planUsage": {
      "title": "Utilização do plano",
      "included": "{limit} análises/mês incluídas no seu plano",
      "thisMonth": "{used} / {limit} análises este mês",
      "unlimited": "Análises ilimitadas",
      "limitFree": "Já utilizou as {limit} análises incluídas. Faça upgrade para continuar a fazer análises.",
      "limitPaid": "Já utilizou {used}/{limit} análises — as análises adicionais passam a usar tokens.",
      "upgradeCta": "Mudar de plano"
    },
    "usage": {
      "sectionTitle": "Utilização recente",
      "loading": "A carregar utilização…",
      "empty": "Ainda não existe utilização.",
      "colDate": "Data",
      "colModule": "Módulo",
      "colAction": "Ação",
      "colTokens": "Tokens",
      "colStatus": "Estado",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "Compra de tokens concluída. O seu saldo será atualizado em breve.",
      "purchaseCancelled": "Compra de tokens cancelada.",
      "buyForbidden": "Apenas proprietários, administradores ou gestores de faturação podem comprar pacotes de tokens."
    }
  },
  teamPage: {
    "header": {
      "title": "Equipa",
      "subtitlePrefix": "Faça a gestão de quem tem acesso a",
      "subtitleSuffix": "e do que podem fazer.",
      "subtitleFallbackOrg": "o seu espaço de trabalho",
      "inviteButton": "+ Convidar membro"
    },
    "stats": {
      "totalMembers": "Total de membros",
      "active": "Ativos",
      "pendingInvites": "Convites pendentes",
      "adminsAndOwners": "Administradores e proprietários"
    },
    "filters": {
      "all": "Todos",
      "owners": "Proprietários",
      "admins": "Administradores",
      "billing": "Faturação",
      "members": "Membros",
      "clients": "Clientes",
      "pending": "Pendentes"
    },
    "roles": {
      "owner": "Proprietários",
      "admin": "Administradores",
      "billing": "Faturação",
      "member": "Membros",
      "client": "Clientes"
    },
    "emptyState": {
      "noMembers": "Ainda não há membros neste espaço de trabalho.",
      "noMatch": "Nenhum membro corresponde ao filtro \"{filter}\"."
    },
    "confirm": {
      "cancelInvite": "Cancelar este convite pendente?",
      "regenerateLink": "Regenerar o link de convite? O link antigo deixará de funcionar.",
      "removeMember": "Remover este membro do espaço de trabalho? Esta ação não pode ser anulada."
    },
    "toast": {
      "cancelFailed": "Falha ao cancelar",
      "newLinkCopied": "Novo link de convite copiado para a área de transferência.",
      "regenerateFailed": "Falha ao regenerar",
      "roleUpdateFailed": "Falha ao atualizar a função",
      "memberRemoved": "Membro removido.",
      "removeFailed": "Falha ao remover",
      "memberDisabled": "Membro desativado.",
      "disableFailed": "Falha ao desativar",
      "disableUnavailableMock": "Desativar não está disponível na camada de simulação.",
      "memberEnabled": "Membro ativado.",
      "enableFailed": "Falha ao ativar",
      "enableUnavailableMock": "Ativar não está disponível na camada de simulação."
    },
    "pendingInvites": {
      "heading": "Convites pendentes ({count})",
      "tableHeaders": {
        "email": "Email",
        "role": "Função",
        "expires": "Expira",
        "actions": "Ações"
      },
      "copyLink": "Copiar link",
      "regenerateLink": "Regenerar link",
      "cancel": "Cancelar",
      "linkHiddenNote": "Link oculto por segurança. Clique em Regenerar link para emitir um novo."
    },
    "rolesLegend": {
      "lead": "**Sobre as funções —**",
      "owners": "Os **Proprietários** fazem a gestão da faturação e das definições do espaço de trabalho.",
      "admins": "Os **Administradores** fazem a gestão dos utilizadores da organização.",
      "billing": "Os utilizadores de **Faturação** fazem a gestão das faturas e da subscrição.",
      "members": "Os **Membros** podem usar as funcionalidades de auditoria.",
      "clients": "Os **Clientes** têm acesso limitado de visualização."
    },
    "footerHint": "Os convites são apenas simulados por agora. O envio real de emails e o Firebase Auth substituirão esta camada na fase de backend."
  },
  orgCreate: {
    "heading": "Criar um espaço de trabalho",
    "subtitle": {
      "signedIn": "Sessão iniciada como {email}",
      "anonymous": "Configure um novo espaço de trabalho da organização"
    },
    "form": {
      "nameLabel": "Nome do espaço de trabalho",
      "namePlaceholder": "ex.: Acme Corp",
      "planLabel": "Plano"
    },
    "planDesc": {
      "free": "Até 3 auditorias, 1 lugar",
      "starter": "15 auditorias, 5 lugares",
      "professional": "30 auditorias, 20 lugares",
      "enterprise": "Limites personalizados, SSO, SLA"
    },
    "submit": {
      "idle": "Criar espaço de trabalho",
      "loading": "A criar o espaço de trabalho…"
    },
    "backToDashboard": "← Voltar ao painel"
  },
  auditHistory: {
    "header": {
      "title": "Histórico de auditorias",
      "subtitle": "Auditorias submetidas para este espaço de trabalho. Gere um relatório para criar um instantâneo partilhável."
    },
    "states": {
      "loading": "A carregar o histórico de auditorias…",
      "error": "Não foi possível carregar o histórico de auditorias. Tente novamente mais tarde."
    },
    "empty": {
      "title": "Ainda não há auditorias submetidas",
      "description": "As auditorias submetidas aparecem aqui para este espaço de trabalho. Execute uma Nova Auditoria para começar.",
      "startAudit": "+ Iniciar uma auditoria"
    },
    "columns": {
      "submitted": "Submetida",
      "score": "Pontuação",
      "risk": "Risco",
      "findings": "Constatações"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "Gerar relatório"
    },
    "toast": {
      "reportGenerated": "Relatório gerado"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "Auditoria submetida",
        "preview": "Pré-visualização da auditoria"
      },
      "title": "Resultado da Auditoria",
      "submissionId": "ID da submissão {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "Eis o que a sua auditoria significa",
      "summary": {
        "overallScore": "Pontuação geral {score}/100 — risco {risk}.",
        "findingsSingular": "{n} constatação em {m} ação recomendada.",
        "findingsPlural": "{n} constatações em {m} ações recomendadas.",
        "maturity": "Maturidade de AI: nível {level} de 5."
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "Agentes",
      "intro": "Encontre agentes de AI que se adequam ao seu fluxo de trabalho. Os agentes tudo-em-um da AiLunaPro estão destacados.",
      "locked": {
        "title": "Os agentes não estão disponíveis para contas de cliente",
        "backToDashboard": "Voltar ao painel"
      },
      "filters": {
        "industryLabel": "Setor",
        "integrationLabel": "Integração",
        "allIndustries": "Todos os setores",
        "allIntegrations": "Todas as integrações",
        "clearFilters": "Limpar filtros",
        "clearRecommendationsHint": "Limpe as recomendações para usar os filtros."
      },
      "loading": "A carregar agentes…",
      "emptyFiltered": "Nenhum agente corresponde aos filtros selecionados.",
      "sections": {
        "topRecommendations": "Principais recomendações",
        "otherAgents": "Outros agentes"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} pts",
      "whyToggleOne": "Porquê? ({count} motivo)",
      "whyToggleOther": "Porquê? ({count} motivos)"
    },
    "recommendPanel": {
      "title": "Personalizar as minhas recomendações",
      "subtitle": "Adicione algumas preferências para classificar os agentes que se adequam ao seu contexto.",
      "fields": {
        "industry": "Setor",
        "companySize": "Dimensão da empresa",
        "targetWorkflow": "Fluxo de trabalho-alvo",
        "subscriptionPlan": "Plano de subscrição",
        "currentMaturity": "Maturidade de AI atual",
        "integrations": "Integrações (separadas por vírgulas, máx. 10)"
      },
      "placeholders": {
        "industry": "ex.: retalho, saas, saúde",
        "integrations": "ex.: hubspot, slack, email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "Individual",
        "sme": "PME",
        "enterprise": "Enterprise"
      },
      "maturityOptions": {
        "low": "Baixa",
        "medium": "Média",
        "high": "Alta"
      },
      "workflowOptions": {
        "support": "Apoio ao cliente",
        "sales": "Vendas e seguimento de leads",
        "finance": "Finanças e faturação",
        "documents": "Documentos e contratos",
        "reporting": "Relatórios e painéis",
        "admin": "Trabalho administrativo",
        "compliance": "Conformidade e governação",
        "marketing": "Marketing e conteúdos",
        "hr": "RH e gestão de pessoas"
      },
      "helperText": "Adicione pelo menos uma preferência para personalizar as recomendações.",
      "submit": "Recomendar agentes",
      "submitting": "A calcular…",
      "clearRecommendations": "Limpar recomendações"
    },
    "card": {
      "external": "Externo",
      "savesPerMonth": "⏱ Poupa ~{hours} h / mês",
      "moreIntegrations": "+{count}",
      "viewDetails": "Ver detalhes",
      "getThisAgent": "Obter este agente"
    },
    "detail": {
      "lockedNotice": "Os agentes não estão disponíveis para contas de cliente.",
      "backToAgents": "← Voltar aos agentes",
      "loading": "A carregar…",
      "errors": {
        "missingAgentId": "ID do agente em falta",
        "missingOrgContext": "Contexto da organização em falta"
      },
      "pills": {
        "external": "Externo",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "Configuração · {complexity}",
        "recommendedAllInOne": "Tudo-em-Um Recomendado",
        "compliance": "Conformidade",
        "audit": "Auditoria"
      },
      "cta": "Obter este agente →",
      "sections": {
        "overview": "Visão geral",
        "problemSolved": "Problema resolvido",
        "bestFit": "Melhor adequação",
        "integrations": "Integrações",
        "expectedRoi": "ROI esperado",
        "pricing": "Preços"
      },
      "bestFit": {
        "industries": "Setores",
        "companySize": "Dimensão da empresa",
        "minBudget": "Orçamento mín.",
        "minBudgetValue": "{amount}/mês"
      },
      "roi": {
        "timeSaved": "Tempo poupado",
        "timeSavedValue": "{hours} h/mês",
        "costSaved": "Custo poupado",
        "costSavedValue": "{amount}/mês",
        "payback": "Retorno",
        "paybackValue": "{months} meses"
      },
      "pricing": {
        "modelPrefix": "Modelo: **{model}**",
        "install": " · Instalação: {amount}",
        "monthly": " · Mensal: {amount}",
        "onRequest": " · Preço sob consulta"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ Plano de ação guiado",
      "title": "O seu plano de ação",
      "intro": "Traduzimos as suas respostas da auditoria num plano sequenciado e contextual. Leia cada secção abaixo — cada afirmação remete para os seus dados.",
      "score": "Pontuação {globalScore} / 100",
      "backToResult": "← Voltar ao resultado"
    },
    "detected": {
      "eyebrow": "01 · Diagnóstico",
      "title": "O que detetámos",
      "topIssuesLabel": "Principais problemas identificados",
      "noIssues": "✓ Nenhum problema a assinalar — a auditoria validou todas as regras.",
      "weakestAreaLabel": "Área mais fraca",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "Fechar a lacuna desta secção é a ação com maior impacto na sua pontuação global.",
      "noWeakArea": "Nenhuma área fraca detetada."
    },
    "priorities": {
      "eyebrow": "02 · Prioridades",
      "title": "O que deve corrigir primeiro",
      "intro": "Das {count} ações recomendadas, estas três oferecem o maior retorno face ao esforço. Cada uma remete para os achados que resolve.",
      "whyItMattersLabel": "Por que é importante: ",
      "expectedOutcomeLabel": "Resultado esperado: ",
      "impactBadge": "impacto {impact}",
      "timeframeDays": "{days}d",
      "closesFindingsOne": "fecha {count} achado",
      "closesFindingsOther": "fecha {count} achados",
      "startWithThis": "Comece por aqui →",
      "startWithThisTooltip": "Em breve, após o J2",
      "mostLeverage": "Maior impacto para o esforço"
    },
    "operatingModel": {
      "eyebrow": "03 · Modelo operacional",
      "title": "O que automatizar ou estruturar",
      "intro": "Cada item abaixo tem um modo principal de execução. Automatizar onde deveria estruturar (ou vice-versa) é um padrão de falha comum.",
      "categories": {
        "automate": {
          "eyebrow": "Ferramentas e sistemas",
          "title": "Automatizar",
          "tagline": "Itens em que o impacto vem do sistema, não da pessoa."
        },
        "structure": {
          "eyebrow": "Política e governança",
          "title": "Estruturar",
          "tagline": "Itens que requerem responsabilidade formal, política ou alinhamento com um framework."
        },
        "process": {
          "eyebrow": "Movimento recorrente",
          "title": "Operar",
          "tagline": "Itens que são processos que mantém em execução com uma cadência."
        },
        "train": {
          "eyebrow": "Pessoas",
          "title": "Formar",
          "tagline": "Itens que mudam comportamentos através da educação."
        }
      },
      "actionsCountOne": "{count} ação",
      "actionsCountOther": "{count} ações",
      "timeframeDays": "{days}d",
      "emptyColumn": "Nada aqui de momento."
    },
    "whyItMatters": {
      "eyebrow": "04 · Contexto",
      "title": "Por que isto é importante",
      "frameworksReferenced": "Frameworks referenciados nesta avaliação"
    },
    "impact": {
      "eyebrow": "05 · Impacto",
      "title": "Impacto esperado no negócio",
      "ifTop3": "Se concluir as 3 principais ações",
      "scoreLift": "A sua pontuação global projetada passa de {currentScore} para {projectedScore}. Trata-se de uma simulação direcional baseada nos achados que cada ação resolve — a variação real depende da profundidade da execução.",
      "projectedLabel": "Projetada",
      "deltaPts": "+{delta} pts",
      "noChange": "sem alteração",
      "toneHighLift": "Grande ganho",
      "toneSteadyGain": "Ganho constante",
      "toneHoldTheLine": "Manter a posição",
      "outcomes": {
        "auditReadinessTitle": "Preparação para auditorias",
        "auditReadinessHigh": "Passa de \"incompleto\" para \"defensável\" num questionário de segurança.",
        "auditReadinessSteady": "Postura existente documentada e mais fácil de referenciar em auditorias.",
        "incidentExposureTitle": "Exposição a incidentes",
        "incidentExposureHigh": "Raio de impacto reduzido e tempo médio de contenção mais rápido quando a AI causa danos.",
        "incidentExposureSteady": "Resposta previsível e responsabilidade mais clara para incidentes específicos de AI.",
        "customerTrustTitle": "Confiança dos clientes",
        "customerTrustHigh": "Divulgação, model cards e explicabilidade dão às suas equipas de suporte e vendas respostas claras.",
        "internalVelocityTitle": "Velocidade interna",
        "internalVelocitySteady": "Os builders entregam mais depressa quando os caminhos de política e revisão são inequívocos."
      },
      "disclaimer": "A pontuação projetada é uma simulação direcional calculada a partir da cobertura de achados e dos pesos das secções. Não constitui uma garantia."
    },
    "nextStep": {
      "eyebrow": "06 · Recomendado",
      "title": "O seu próximo passo",
      "nextOneThing": "Próxima 1 coisa",
      "savedAt": "Guardado localmente às {timestamp}.",
      "localOnlyNote": "Manteremos este plano disponível localmente — sem upload, sem necessidade de atualizar a conta. Volte sempre que a sua equipa estiver pronta para agir.",
      "ctas": {
        "saveDefault": "✓ Guardar este plano de ação",
        "saved": "✓ Guardado",
        "reminderSet": "✓ Lembrete definido",
        "exported": "✓ Exportado",
        "remind7Day": "⏰ Definir lembrete de 7 dias",
        "remind30Day": "⏰ Definir lembrete de 30 dias",
        "remind60Day": "⏰ Definir lembrete de 60 dias",
        "remindQuarterly": "⏰ Definir revisão trimestral",
        "exportPlan": "⬇ Exportar plano"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "Opera num contexto que os reguladores já tratam como de alto risco. O EU AI Act, o GDPR e as regras setoriais (equivalentes ao HIPAA, frameworks de serviços financeiros) impõem deveres adicionais quando a AI processa dados sensíveis ou toma decisões consequentes sobre pessoas.",
        "customerFacingTransparency": "A sua AI está voltada para o cliente, o que significa que se aplicam obrigações de transparência (EU AI Act Article 50, regras de proteção do consumidor) e os riscos reputacionais são mais elevados do que nas ferramentas internas.",
        "internalBaseline": "Mesmo no uso interno de AI, frameworks reconhecidos (ISO/IEC 42001, NIST AI RMF) funcionam cada vez mais como base de referência para a due diligence de fornecedores e os negócios empresariais.",
        "riskInactionHigh": "Na sua faixa de risco atual, o custo da inação é assimétrico. Um único incidente — um modelo a divulgar dados, uma decisão injusta, uma indisponibilidade sem runbook — é materialmente mais dispendioso do que as correções recomendadas abaixo.",
        "riskInactionMedium": "Encontra-se numa faixa intermédia defensável. O risco agora é estagnar: as organizações que param aqui costumam regredir à medida que a sua pegada de AI cresce. Fechar as lacunas de gravidade média consolida a postura atual.",
        "riskInactionLow": "Já possui uma postura significativa. O risco é a regressão à medida que a sua pegada de AI escala. O investimento contínuo é sobretudo manutenção, documentação e aprofundamento gradual.",
        "weakestSection": "A sua área mais fraca é **{title}** ({score}%). Reforçá-la aumenta diretamente a pontuação global, mas, mais importante ainda, remove o caminho de menor resistência para um incidente.",
        "commercialEnabler": "Os compradores empresariais e os clientes regulados pedem cada vez mais provas de governança de AI nos questionários de segurança. Muitos dos itens do seu plano de ação funcionam também como facilitadores comerciais, e não apenas como trabalho de conformidade."
      },
      "riskOneLiner": {
        "low": "Está em boa forma — o foco passa para a manutenção e a melhoria contínua.",
        "medium": "Tem uma base defensável, mas com lacunas materiais que vale a pena fechar em breve.",
        "high": "Tem várias lacunas que aumentam materialmente a sua exposição. Dê prioridade às ações abaixo.",
        "critical": "Tem uma ou mais lacunas críticas. Os itens de maior prioridade devem ser tratados em dias, não em semanas."
      },
      "contextChips": {
        "highRiskIndustry": "Setor de alto risco",
        "sensitiveData": "Dados sensíveis no âmbito",
        "customerFacing": "AI voltada para o cliente",
        "missionCritical": "Âmbito de missão crítica",
        "standardProfile": "Perfil de risco padrão"
      },
      "nextStep": {
        "criticalHeadline": "Tratar o achado crítico nos próximos 7 dias",
        "criticalRationaleFallback": "É o item mais material do seu plano de ação.",
        "highHeadline": "Comece pelos ganhos rápidos de 30 dias",
        "highRationaleFallback": "A postura de alto risco responde rapidamente a um pequeno número de ações direcionadas. Escolha três ganhos rápidos do roadmap e assuma a responsabilidade por eles este mês.",
        "mediumHeadline": "Consolide as suas bases de governança",
        "mediumRationale": "Já passou da fase de improviso inicial. O próximo passo cumulativo é formalizar o que faz informalmente — uma política escrita, um framework reconhecido, escalonamento documentado. É isto que torna as auditorias e os negócios empresariais rotineiros.",
        "lowHeadline": "Passe de conforme a otimizado",
        "lowRationale": "A sua postura é sólida. O impacto agora está na documentação e na melhoria contínua — model cards, reciclagem de formação e integração de cenários de AI nos seus ensaios de resposta a incidentes."
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "Pontuação de conformidade",
      "riskLabel": "Nível de risco atual",
      "maturityLabel": "Nível de maturidade de AI",
      "nextStepLabel": "Próximo passo recomendado",
      "nextStepTitle": "Concluir auditoria da HR Screening Tool",
      "nextStepBody": "Esta auditoria está 60% concluída. Terminá-la aumentará a sua pontuação de conformidade em cerca de +7 pontos.",
      "continueAudit": "Continuar auditoria →",
      "toast": {
        "noPermission": "Não tem permissão para continuar auditorias.",
        "noDraft": "Nenhum rascunho de auditoria encontrado — a iniciar uma nova auditoria."
      }
    },
    "recentReports": {
      "card": {
        "share": "Partilhar",
        "view": "Ver"
      },
      "export": {
        "title": "Opções de exportação",
        "blurb": "Exporte os seus dados de conformidade em vários formatos para as partes interessadas.",
        "exportAs": "Exportar como {fmt}"
      },
      "toast": {
        "reportNotAvailable": "Relatório ainda não disponível.",
        "shareLinkCopied": "Link de partilha copiado.",
        "shareLinkFailed": "Não foi possível copiar o link. Tente novamente.",
        "noReportsToExport": "Ainda não há relatórios para exportar.",
        "csvDownloaded": "CSV transferido.",
        "jsonDownloaded": "JSON transferido."
      }
    },
    "cta": {
      "heading": "Pronto para alcançar a conformidade total em AI?",
      "body": "Junte-se às organizações que usam o AiLunaPro para automatizar os seus fluxos de conformidade, reduzir o risco e gerar confiança junto das partes interessadas.",
      "toast": {
        "alreadyActivePlan": "Já tem um plano ativo.",
        "demoRequestSent": "Pedido de demonstração enviado. Vamos analisá-lo e entrar em contacto consigo."
      },
      "demoModal": {
        "title": "Agendar uma demonstração",
        "subtitle": "Conte-nos um pouco sobre a sua equipa e entraremos em contacto.",
        "placeholderFullName": "Nome completo",
        "placeholderWorkEmail": "Email profissional",
        "placeholderCompany": "Empresa",
        "placeholderMessage": "O que gostaria de discutir?",
        "privacyNote": "Usamos estes dados apenas para responder ao seu pedido.",
        "cancel": "Cancelar",
        "submit": "Pedir demonstração",
        "submitting": "A enviar…",
        "errorFallback": "Não foi possível enviar o seu pedido. Tente novamente."
      }
    }
  },
  support: {
    "cta": "Contactar o suporte",
    "title": "Contactar o suporte",
    "subtitle": "Comunique um problema ou faça uma pergunta — respondemos por e-mail.",
    "typeLabel": "Sobre o que é?",
    "typeBug": "Erro",
    "typeQuestion": "Pergunta",
    "typeBilling": "Faturação",
    "descriptionLabel": "Descreva",
    "descriptionPlaceholder": "O que aconteceu? Passos, o que esperava, qualquer detalhe útil.",
    "emailLabel": "E-mail",
    "emailPlaceholder": "voce@empresa.com",
    "priorityLabel": "Prioridade",
    "optional": "(opcional)",
    "prioLow": "Baixa",
    "prioMedium": "Média",
    "prioHigh": "Alta",
    "submit": "Enviar",
    "submitting": "A enviar…",
    "success": "Obrigado — a sua mensagem foi enviada. Responderemos por e-mail.",
    "close": "Fechar",
    "errType": "Escolha um tipo.",
    "errDescription": "Descreva o problema.",
    "errEmail": "Introduza um e-mail válido."
  },
  feedback: {
    "title": "Como foi esta experiência?",
    "satisfactionLabel": "Avalie a sua experiência",
    "sat1": "Muito má",
    "sat2": "Má",
    "sat3": "Razoável",
    "sat4": "Boa",
    "sat5": "Excelente",
    "difficultyLabel": "Foi fácil de usar?",
    "diffEasy": "Fácil",
    "diffOk": "Razoável",
    "diffHard": "Difícil",
    "blockerLabel": "O que o impediu de avançar?",
    "blockerPlaceholder": "Opcional — diga-nos o que o bloqueou",
    "suggestionLabel": "Há algo que possamos melhorar?",
    "suggestionPlaceholder": "Opcional",
    "submit": "Enviar",
    "success": "Obrigado — lemos cada comentário.",
    "dismissAria": "Fechar comentário"
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "Diagnóstico de Maturidade em AI",
        "subtitle": "Responda a 8 perguntas curtas. Obtenha a sua pontuação de maturidade em AI e veja quais agentes da AiLunaPro se adequam ao seu estágio.",
        "freeLine": "Gratuito · Não requer conta · Leva cerca de 2 minutos"
      },
      "resumeNotice": "Bem-vindo de volta — restauramos as suas respostas anteriores para que possa continuar de onde parou.",
      "questionLegend": "Pergunta {n} / {total}",
      "leadCapture": {
        "heading": "Para onde devemos enviar o seu resultado?",
        "emailLabel": "E-mail",
        "requiredMark": "*",
        "emailPlaceholder": "voce@empresa.com",
        "companyNameLabel": "Nome da empresa",
        "optionalMark": "(opcional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Utilizamos estas informações apenas para gerar o seu diagnóstico e fazer o acompanhamento sobre serviços de AI relevantes. Não é necessária nenhuma conta.",
        "consentLabel": "Concordo em receber o resultado do meu diagnóstico de AI e informações de acompanhamento relevantes da AiLunaPro. Compreendo que as minhas respostas e o meu e-mail serão processados para gerar e armazenar este resultado de diagnóstico, e que posso solicitar a eliminação dos meus dados a qualquer momento."
      },
      "submit": {
        "loading": "A calcular o seu resultado…",
        "unlock": "Enviar-me o relatório completo por e-mail →",
        "idle": "Obter a minha pontuação de maturidade em AI"
      },
      "signInPrompt": "Já tem uma conta?",
      "signInLink": "Iniciar sessão",
      "errors": {
        "answers": "Por favor, responda a todas as perguntas.",
        "email": "Por favor, introduza um endereço de e-mail válido.",
        "consent": "Tem de aceitar para receber o seu resultado.",
        "captchaLoading": "O captcha está a carregar — por favor, aguarde."
      },
      "buckets": {
        "low": {
          "title": "A sua maturidade em AI está emergente",
          "message": "A sua organização está num estágio inicial. Comece com automação simples, um inventário de uso de AI e agentes práticos de suporte."
        },
        "medium": {
          "title": "A sua maturidade em AI está em desenvolvimento",
          "message": "Já tem algumas bases de AI. O próximo passo é estruturar o uso, medir o ROI e melhorar os fluxos de trabalho de documentos e relatórios."
        },
        "high": {
          "title": "A sua maturidade em AI está avançada",
          "message": "Está pronto para escalar a AI com governação, conformidade, relatórios e automação especializada mais robustos."
        }
      },
      "result": {
        "scoreLabel": "A sua pontuação de maturidade em AI",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "Agentes recomendados da AiLunaPro",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obter este agente",
        "ctaHeading": "Quer uma auditoria mais aprofundada e o seu plano de ação completo?",
        "ctaBody": "Crie um espaço de trabalho AiLunaPro gratuito para aceder à auditoria completa, ao registo e ao catálogo de agentes.",
        "ctaButton": "Crie a sua conta gratuita ↗",
        "ctaFootnote": "Continua em **dashboard.ailunapro.com** — a plataforma AiLuna de agentes e soluções de AI, o próximo passo após a sua auditoria.",
        "retakeButton": "Refazer o diagnóstico"
      }
    },
    "roi": {
      "header": {
        "title": "Calculadora de ROI de AI",
        "subtitle": "Estime o tempo e o dinheiro que pode poupar com os agentes de AI da AiLunaPro.",
        "freeLine": "Gratuito · Não requer conta · Leva cerca de 1 minuto · USD"
      },
      "resumeNotice": "Bem-vindo de volta — restauramos os seus dados anteriores para que possa continuar de onde parou.",
      "form": {
        "teamLegend": "A sua equipa",
        "teamSizeLabel": "Tamanho da equipa",
        "teamSizePlaceholder": "ex.: 10",
        "monthlyHoursLabel": "Horas mensais que a sua equipa gasta em trabalho repetitivo",
        "monthlyHoursPlaceholder": "ex.: 80",
        "hourlyCostLabel": "Custo médio por hora (USD)",
        "targetWorkflowLabel": "Fluxo de trabalho alvo",
        "workflowPlaceholderOption": "Selecione um fluxo de trabalho…"
      },
      "leadCapture": {
        "legend": "Para onde devemos enviar a sua estimativa?",
        "emailLabel": "E-mail",
        "emailPlaceholder": "voce@empresa.com",
        "companyNameLabel": "Nome da empresa",
        "optionalMark": "(opcional)",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "Utilizamos estas informações apenas para gerar a sua estimativa e fazer o acompanhamento sobre serviços de AI relevantes. Não é necessária nenhuma conta.",
        "consentLabel": "Concordo em receber a minha estimativa de ROI de AI e informações de acompanhamento relevantes da AiLunaPro. Compreendo que as minhas respostas e o meu e-mail serão processados para gerar e armazenar esta estimativa, e que posso solicitar a eliminação dos meus dados a qualquer momento."
      },
      "requiredMark": "*",
      "submit": {
        "loading": "A calcular…",
        "unlock": "Enviar-me o relatório completo por e-mail →",
        "idle": "Revelar as minhas poupanças"
      },
      "signInPrompt": "Já tem uma conta?",
      "signInLink": "Iniciar sessão",
      "errors": {
        "teamSize": "O tamanho da equipa tem de ser um número inteiro entre 1 e 10000.",
        "hours": "As horas mensais têm de ser um número entre 0 e 10000.",
        "cost": "O custo por hora tem de ser um número entre 1 e 1000 USD.",
        "workflow": "Por favor, selecione um fluxo de trabalho.",
        "email": "Por favor, introduza um endereço de e-mail válido.",
        "consent": "Tem de aceitar para receber a sua estimativa.",
        "captchaLoading": "O captcha está a carregar — por favor, aguarde."
      },
      "result": {
        "monthlySavingsLabel": "Poupança mensal estimada",
        "monthlySavingsUnit": "/mês",
        "yearlySavingsLabel": "Poupança anual",
        "timeSavedLabel": "Tempo poupado",
        "timeSavedValue": "{hours} h/mês",
        "paybackLabel": "Retorno",
        "paybackValue": "{months} meses",
        "paybackEmpty": "—",
        "disclaimer": "Esta é uma estimativa baseada nas informações que forneceu e em pressupostos de automação conservadores. As poupanças reais podem variar.",
        "pricingNote": "O retorno assume um custo de referência de agente de {cost}/mês; os preços reais variam por agente.",
        "recommendedAgentsHeading": "Agentes recomendados da AiLunaPro",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "Obter este agente",
        "ctaHeading": "Quer uma análise mais aprofundada e o seu plano de ação completo?",
        "ctaBody": "Crie um espaço de trabalho AiLunaPro gratuito para aceder à auditoria completa, ao registo e ao catálogo de agentes.",
        "ctaButton": "Crie a sua conta gratuita ↗",
        "ctaFootnote": "Continua em **dashboard.ailunapro.com** — a plataforma AiLuna de agentes e soluções de AI, o próximo passo após a sua auditoria.",
        "rerunButton": "Executar outro cálculo"
      }
    },
    "quote": {
      "header": {
        "title": "Solicitar um orçamento",
        "subtitle": "Obtenha uma faixa de preço instantânea e indicativa para um projeto personalizado de agente de IA, automação ou website.",
        "freeLine": "Estimativa gratuita · Não requer conta · Apenas indicativa"
      },
      "resumeNotice": "Bem-vindo de volta — restauramos as suas seleções anteriores.",
      "form": {
        "serviceLegend": "Do que precisa?",
        "serviceLabel": "Tipo de serviço",
        "servicePlaceholder": "Selecione um serviço…",
        "tierLabel": "Complexidade do projeto",
        "tierPlaceholder": "Selecione um nível de complexidade…",
        "descriptionLabel": "Descrição do projeto",
        "descriptionPlaceholder": "Descreva brevemente o seu projeto, os seus objetivos e as ferramentas a integrar. Por favor, não inclua dados confidenciais ou pessoais.",
        "optionalLegend": "Mais alguns detalhes (opcional)",
        "businessSizeLabel": "Dimensão da empresa",
        "urgencyLabel": "Urgência",
        "budgetBandLabel": "Faixa de orçamento",
        "notSpecified": "Não especificado"
      },
      "services": {
        "ai_agent": "Agente de IA",
        "automation": "Fluxo de automação",
        "website": "Website / aplicação web",
        "audit": "Auditoria de viabilidade"
      },
      "tiers": {
        "simple": "Simples",
        "contextual": "Contextual (MVP)",
        "autonomous": "Autónomo",
        "multi_agent": "Sistema multiagente",
        "intermediate": "Intermédio",
        "complex": "Complexo",
        "custom": "Personalizado / à medida",
        "feasibility": "Estudo de viabilidade"
      },
      "businessSizes": {
        "solo": "Individual / freelancer",
        "small": "Pequena (2–20)",
        "medium": "Média (21–100)",
        "large": "Grande (100+)"
      },
      "urgencies": {
        "low": "Flexível",
        "standard": "Padrão",
        "high": "Urgente"
      },
      "budgetBands": {
        "under_10k": "Menos de $10k",
        "10k_50k": "$10k–$50k",
        "50k_150k": "$50k–$150k",
        "over_150k": "Mais de $150k"
      },
      "requiredMark": "*",
      "submit": {
        "idle": "Obter a minha estimativa"
      },
      "errors": {
        "service": "Por favor, escolha um tipo de serviço.",
        "tier": "Por favor, escolha um nível de complexidade.",
        "description": "Por favor, descreva o seu projeto (pelo menos 20 caracteres)."
      },
      "result": {
        "rangeLabel": "Faixa de preço estimada",
        "openEndedSuffix": "+",
        "recommendedLabel": "Solução recomendada",
        "scopeHeading": "O que normalmente está incluído",
        "nextStepsHeading": "Próximos passos",
        "opsCostNote": "Os projetos de agentes de IA e de automação implicam também custos operacionais (tokens, infraestrutura) que normalmente acrescentam {min}–{max}% ao custo de desenvolvimento.",
        "disclaimer": "Estimativa indicativa e não contratual, apenas para fins de orçamentação — meramente informativa. O preço final depende de um âmbito detalhado.",
        "ctaHeading": "Pronto para avançar?",
        "ctaBody": "Crie um espaço de trabalho AiLunaPro gratuito para gerar um orçamento em PDF com a sua marca e iniciar o seu projeto.",
        "ctaButton": "Crie a sua conta gratuita ↗",
        "rerunButton": "Recomeçar"
      },
      "solutions": {
        "ai_agent.simple": "Agente de IA simples",
        "ai_agent.contextual": "Agente de IA contextual (MVP)",
        "ai_agent.autonomous": "Agente de IA autónomo",
        "ai_agent.multi_agent": "Sistema multiagente",
        "automation.simple": "Fluxo de automação simples",
        "automation.contextual": "Fluxo de automação contextual",
        "automation.autonomous": "Sistema de automação autónomo",
        "automation.multi_agent": "Plataforma de automação multiagente",
        "website.simple": "Website simples",
        "website.intermediate": "Website intermédio",
        "website.complex": "Plataforma web complexa",
        "website.custom": "Plataforma personalizada / à medida",
        "audit.feasibility": "Estudo de viabilidade e definição de âmbito"
      },
      "scope": {
        "discovery": "Workshop de descoberta e requisitos",
        "design": "Conceção da solução e arquitetura",
        "integration": "Integração com as suas ferramentas (CRM/ERP, APIs)",
        "deployment": "Implementação e transição",
        "monitoring": "Configuração de monitorização e suporte",
        "mapping": "Mapeamento de processos e conceção de fluxos de trabalho",
        "build": "Construção e desenvolvimento",
        "content": "Configuração de conteúdos e dados",
        "launch": "Lançamento e entrada em produção",
        "assessment": "Avaliação do estado atual",
        "gapAnalysis": "Análise de lacunas",
        "recommendations": "Recomendações priorizadas",
        "roadmap": "Roteiro de implementação"
      },
      "nextSteps": {
        "discoveryCall": "Agende uma reunião de descoberta para refinar o âmbito",
        "scoping": "Receba um documento detalhado de definição de âmbito",
        "proposal": "Obtenha uma proposta formal e um cronograma"
      },
      "generate": {
        "button": "Receber o meu plano personalizado",
        "cost": "{n} tokens",
        "loading": "A gerar…",
        "success": "O seu orçamento foi gerado e guardado no seu espaço de trabalho.",
        "error": "Não foi possível gerar o orçamento. Tente novamente.",
        "needOrg": "Selecione um espaço de trabalho para gerar um orçamento."
      },
      "guided": {
        "goalsLabel": "Objetivos comuns — selecione os que se aplicam",
        "detailsLabel": "Mais alguma coisa? (opcional)",
        "detailsPlaceholder": "Adicione detalhes: ferramentas a integrar, prazos, requisitos essenciais… Não inclua dados confidenciais ou pessoais.",
        "paymentNote": "Em projetos personalizados, o pagamento é normalmente feito por transferência bancária mediante fatura. Uma fatura final será gerada após a validação do projeto. Esta estimativa é indicativa e não contratual.",
        "selectError": "Selecione pelo menos um objetivo ou adicione uma breve descrição.",
        "suggestions": {
          "support": "Automatizar o apoio ao cliente",
          "crm": "Ligar a IA ao meu CRM",
          "workflows": "Automatizar fluxos de trabalho internos",
          "dataEntry": "Automatizar a introdução de dados",
          "reporting": "Relatórios e análises automatizados",
          "integrations": "Integrar as minhas ferramentas atuais",
          "notifications": "Notificações e alertas automatizados",
          "dataSync": "Sincronizar dados entre sistemas",
          "showcase": "Apresentar a minha empresa",
          "leads": "Gerar leads",
          "ecommerce": "Vender online (e-commerce)",
          "dashboard": "Painel / portal interno",
          "booking": "Reservas / marcações online",
          "feasibility": "Avaliar a viabilidade",
          "readiness": "Verificar a preparação para IA / EU AI Act",
          "vendorCompare": "Comparar soluções / fornecedores",
          "roadmap": "Obter um roteiro de implementação"
        }
      },
      "pdf": {
        "download": "Descarregar PDF",
        "docTitle": "Orçamento do projeto",
        "summaryHeading": "Resumo do projeto",
        "pricingHeading": "Investimento estimado"
      },
      "email": {
        "clientLabel": "Email do cliente (opcional) — deixe vazio para enviar para si",
        "clientPlaceholder": "cliente@empresa.com",
        "button": "Enviar-me este orçamento por e-mail",
        "sent": "Orçamento enviado para o seu e-mail.",
        "error": "Não foi possível enviar o e-mail. Tente novamente."
      },
      "send": {
        "heading": "Envie a proposta ao seu cliente",
        "intro": "Introduza o e-mail do seu cliente e o orçamento proposto — enviaremos a proposta por e-mail para que ele a aceite ou solicite alterações.",
        "emailLabel": "E-mail do cliente",
        "emailRequired": "O e-mail do cliente é obrigatório para enviar a proposta.",
        "submit": "Enviar proposta ao cliente",
        "hint": "O seu cliente recebe a proposta e aceita o orçamento ou solicita alterações.",
        "sentTo": "Proposta enviada para {email}",
        "sentNext": "Iremos notificá-lo quando o seu cliente responder. Acompanhe no Admin Center.",
        "track": "Abrir o Admin Center"
      },
      "override": {
        "toggle": "Ajustar preço (admin)",
        "minLabel": "Mín (USD)",
        "maxLabel": "Máx (USD)",
        "reasonLabel": "Justificação",
        "save": "Guardar ajuste",
        "error": "Não foi possível guardar o ajuste.",
        "invalid": "Introduza um mín/máx (USD) válido e uma breve justificação.",
        "adjustedNote": "Preço ajustado: {range}"
      },
      "proposal": {
        "execSummaryTemplate": "Esta proposta descreve {solution} adaptado aos seus objetivos e ferramentas existentes.",
        "solutionHeading": "Solução proposta",
        "paymentHeading": "Pagamento",
        "timelineHeading": "Cronograma indicativo",
        "coverClient": "Preparado para",
        "coverDate": "Data",
        "coverValid": "Válido até",
        "coverRef": "Referência",
        "solutionDesc": {
          "ai_agent": "Um agente de IA personalizado que automatiza os seus objetivos e se liga às suas ferramentas existentes (CRM/ERP, APIs).",
          "automation": "Um fluxo de automação que liga as suas ferramentas e elimina tarefas manuais repetitivas.",
          "website": "Um site ou plataforma profissional construído em torno dos seus objetivos de negócio.",
          "audit": "Um estudo de viabilidade e enquadramento que reduz o risco antes de qualquer desenvolvimento."
        },
        "timeline": {
          "agent": "Descoberta e conceção — 1–2 semanas\nDesenvolvimento e integração — 4–8 semanas\nTestes e implementação — 1–2 semanas",
          "website": "Descoberta e conceção — 1–2 semanas\nDesenvolvimento — 3–6 semanas\nConteúdo e lançamento — 1 semana",
          "audit": "Avaliação — 1 semana\nAnálise e recomendações — 1 semana"
        },
        "justification": {
          "heading": "Como esta estimativa é calculada",
          "market": "Com base em referências de mercado de 2026 para projetos {category} de complexidade {tier}.",
          "complexity": "Reflete a complexidade {tier} do projeto.",
          "scope": "Abrange {count} frentes de trabalho principais, incluindo a integração com as suas ferramentas.",
          "ops": "Projetos de agentes de IA e automação acrescentam {min}–{max}% de custos operacionais (tokens, infraestrutura)."
        }
      },
      "accepted": {
        "title": "A sua resposta foi enviada",
        "s1": "Estamos a analisar o seu pedido",
        "s2": "Um especialista irá confirmar o valor final",
        "s3": "Irá receber uma fatura",
        "s4": "Depois efetua o pagamento",
        "trackCta": "Acompanhar o seu pedido",
        "viewInvoice": "Ver a sua fatura",
        "emailTitle": "Falta um passo",
        "emailBody": "Para confirmar e receber a sua fatura, aceite a proposta no seu espaço de trabalho AiLunaPro.",
        "confirmTitle": "Confirme o orçamento proposto",
        "confirmBody": "Confirme para aceitar o orçamento proposto — vamos preparar a sua fatura e avisar a nossa equipa.",
        "confirmCta": "Aceitar o orçamento proposto",
        "confirming": "A confirmar…",
        "confirmError": "Algo correu mal. Tente novamente ou responda ao e-mail do seu orçamento.",
        "discussConfirmBody": "Confirme para enviar o seu pedido de ajuste à nossa equipa.",
        "discussCta": "Enviar pedido",
        "sentTitle": "Pedido recebido",
        "sentBody": "Recebemos o seu pedido e entraremos em contacto para ajustar a proposta.",
        "discussTitle": "Solicitar um ajuste de preço",
        "discussBody": "Para solicitar uma alteração, responda ao e-mail da sua proposta e iremos dar seguimento.",
        "back": "Voltar à ferramenta de orçamentos"
      },
      "flow": {
        "heading": "Como funciona",
        "s1": "Aceite a proposta",
        "s2": "Confirmamos o valor final",
        "s3": "Recebe a sua fatura",
        "s4": "Efetua o pagamento"
      },
      "decision": {
        "adjustHeading": "Proponha o seu orçamento",
        "budgetIntro": "Este é o valor que propõe. O seu cliente valida-o ou solicita um ajuste.",
        "rangeLabel": "Faixa estimada",
        "messagePlaceholder": "Adicione uma mensagem — o que gostaria de ajustar?",
        "messageSend": "Enviar pedido",
        "budgetLabel": "O orçamento que propõe",
        "budgetPlaceholder": "ex. 50000",
        "budgetRequired": "Indique o seu orçamento antes de enviar.",
        "verdictBelow": "O seu orçamento está abaixo da faixa estimada.",
        "verdictWithin": "O seu orçamento está dentro da faixa estimada.",
        "verdictAbove": "O seu orçamento está acima da faixa estimada.",
        "accept": "Enviar o meu orçamento",
        "submitHint": "O seu cliente irá validar este valor ou solicitar um ajuste.",
        "discuss": "Solicitar um ajuste de preço",
        "accepted": "Estimativa aceite — entraremos em contacto em breve.",
        "discussionSent": "Pedido enviado — entraremos em contacto para conversar.",
        "error": "Não foi possível guardar a sua decisão. Tente novamente."
      },
      "negotiation": {
        "heading": "Resumo da negociação",
        "initialLabel": "Estimativa inicial",
        "budgetLabel": "O seu orçamento",
        "adjustedLabel": "Preço ajustado"
      },
      "progress": {
        "submit": "Enviar",
        "review": "Análise",
        "validation": "Validação",
        "invoice": "Fatura"
      },
      "status": {
        "title": "Acompanhamento do seu pedido",
        "intro": "Veja em que ponto do nosso processo está o seu pedido. Iremos enviar-lhe um e-mail em cada etapa.",
        "reviewNote": "Um especialista está a analisar o seu pedido e irá confirmar o valor final.",
        "nextStep": "Passo seguinte: um administrador irá confirmar o valor.",
        "openPanel": "Abrir o painel de faturas",
        "stateReview": "Em análise",
        "stateNegotiation": "Negociação",
        "stateWaiting": "A aguardar administrador",
        "stateInvoice": "Fatura",
        "budgetLabel": "O orçamento que propõe",
        "waitingValidation": "A aguardar validação",
        "back": "Voltar à ferramenta de orçamentos"
      }
    }
  },
  enums: {
    "badge": {
      "low": "Baixo",
      "medium": "Médio",
      "high": "Alto",
      "critical": "Crítico",
      "completed": "Concluído",
      "inProgress": "Em andamento",
      "draft": "Rascunho",
      "published": "Publicado",
      "archived": "Arquivado",
      "effortLow": "Esforço baixo",
      "effortMedium": "Esforço médio",
      "effortHigh": "Esforço alto"
    },
    "riskWord": {
      "critical": "Risco crítico",
      "high": "Risco alto",
      "medium": "Risco médio",
      "low": "Risco baixo",
      "minimal": "Risco mínimo"
    },
    "approval": {
      "approved": "Aprovado",
      "pending": "Pendente",
      "underReview": "Em análise",
      "rejected": "Rejeitado"
    },
    "oversight": {
      "hitl": "Humano no circuito",
      "hotl": "Humano sobre o circuito",
      "oot": "Autónomo"
    },
    "dataTypes": {
      "pii": "Dados pessoais (PII)",
      "health": "Dados de saúde",
      "financial": "Financeiro / transacional",
      "biometric": "Biométrico",
      "children": "Dados de menores",
      "public": "Público / aberto",
      "internal": "Documentos internos",
      "employee": "Registos de colaboradores"
    },
    "confidence": {
      "low": "baixa",
      "medium": "média",
      "high": "alta"
    },
    "memberStatus": {
      "active": "Ativo",
      "pending": "Pendente",
      "invited": "Convidado",
      "disabled": "Desativado"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "Automatiza respostas a clientes e reduz a carga de trabalho do suporte.",
        "description": "Agente de AI projetado para responder a perguntas frequentes, qualificar solicitações de suporte, encaminhar tickets e auxiliar as equipes de atendimento ao cliente. Ajuda as empresas a estruturar um primeiro nível de suporte disponível de forma contínua, sem substituir as equipes humanas.",
        "problemSolved": "Tempos de resposta lentos aos clientes, solicitações repetitivas e equipes de suporte sobrecarregadas."
      },
      "sales-agent": {
        "tagline": "Qualifica prospects e prepara follow-ups comerciais.",
        "description": "Agente de AI focado em vendas, projetado para qualificar leads, preparar respostas comerciais, gerar follow-ups e estruturar oportunidades. Ajuda as equipes de vendas a economizar tempo em tarefas repetitivas e a melhorar o acompanhamento de prospects.",
        "problemSolved": "Prospects mal qualificados, follow-ups esquecidos e tempo de vendas desperdiçado."
      },
      "finance-agent": {
        "tagline": "Auxilia com faturas, orçamentos e cobranças.",
        "description": "Agente de AI projetado para ajudar a classificar documentos financeiros, preparar orçamentos, acompanhar faturas, gerar lembretes de cobrança e sinalizar anomalias simples. Não substitui um contador, mas reduz consideravelmente o tempo administrativo financeiro.",
        "problemSolved": "Processamento manual de faturas, cobranças atrasadas e erros de digitação."
      },
      "hr-agent": {
        "tagline": "Auxilia equipes de RH com triagem, resumos e documentação.",
        "description": "Agente de AI projetado para apoiar tarefas repetitivas de RH, como resumos de CV, anotações sobre candidatos, respostas internas, documentação de colaboradores e acompanhamento administrativo de RH. Ajuda as equipes a estruturar informações e a reduzir o tempo gasto com trabalho manual de documentos.",
        "problemSolved": "As equipes de RH perdem tempo com triagem de documentos, respostas repetitivas e acompanhamento manual."
      },
      "compliance-agent": {
        "tagline": "Ajuda a estruturar conformidade, riscos e registros de AI.",
        "description": "Agente de AI projetado para apoiar a documentação de conformidade, os controles internos, a preparação do registro de AI e os planos de mitigação. É especialmente útil para organizações expostas a obrigações de governança, rastreabilidade e conformidade de AI.",
        "problemSolved": "As organizações não têm visibilidade clara sobre a conformidade de AI, com documentação dispersa e riscos de AI não gerenciados."
      },
      "marketing-agent": {
        "tagline": "Gera conteúdo, campanhas e ideias de marketing.",
        "description": "Agente de AI projetado para gerar publicações, e-mails, conteúdo de landing pages, ideias de campanha, resumos e materiais de marketing adaptados ao perfil da empresa. Ajuda equipes pequenas a publicar com mais consistência sem multiplicar ferramentas.",
        "problemSolved": "As equipes de marketing enfrentam dificuldades com a consistência do conteúdo, a criação demorada e materiais de campanha dispersos."
      },
      "reporting-agent": {
        "tagline": "Cria resumos, dashboards e relatórios de decisão.",
        "description": "Agente de AI projetado para transformar dados e informações internas em resumos, relatórios, planos de ação e insights prontos para a gestão. Ajuda líderes e gestores a obter uma visão mais clara sem passar horas consolidando informações manualmente.",
        "problemSolved": "Os relatórios manuais demoram muito para serem produzidos, e os tomadores de decisão carecem de resumos concisos."
      },
      "audit-agent": {
        "tagline": "Apoia auditoria de AI, avaliação de maturidade e planos de ação.",
        "description": "Agente de AI projetado para ajudar a estruturar auditorias, analisar respostas, identificar riscos e produzir recomendações acionáveis. Conecta auditoria de AI, conformidade e transformação de negócios em um fluxo de trabalho prático.",
        "problemSolved": "As auditorias de AI são demoradas, analisadas manualmente e difíceis de priorizar."
      },
      "document-agent": {
        "tagline": "Classifica, resume e extrai informações de documentos.",
        "description": "Agente de AI projetado para processar documentos, extrair informações-chave, gerar resumos e organizar arquivos. É útil para organizações que lidam com muitos anexos, contratos, relatórios, arquivos de RH, documentos financeiros ou evidências de conformidade.",
        "problemSolved": "Os documentos são mal organizados, lentos para pesquisar e caros para resumir manualmente."
      },
      "admin-agent": {
        "tagline": "Automatiza o trabalho administrativo do dia a dia.",
        "description": "Agente de AI de uso geral para e-mails, agendamentos, follow-ups, resumos, anotações, organização de tarefas e fluxos de trabalho administrativos diários. Ajuda fundadores, profissionais independentes e equipes pequenas a economizar tempo em trabalho operacional repetitivo.",
        "problemSolved": "O trabalho administrativo toma tempo demais, as tarefas são repetitivas e a organização é manual."
      }
    },
    "industries": {
      "all": "Todos",
      "b2b": "B2B",
      "construction": "Construção",
      "consulting": "Consultoria",
      "creator": "Criadores de conteúdo",
      "ecommerce": "E-commerce",
      "education": "Educação",
      "enterprise": "Grandes empresas",
      "finance": "Finanças",
      "healthcare": "Saúde",
      "legal": "Jurídico",
      "public-sector": "Setor público",
      "real-estate": "Imobiliário",
      "retail": "Varejo",
      "saas": "SaaS",
      "services": "Serviços"
    },
    "companySize": {
      "enterprise": "Grande empresa",
      "sme": "PME",
      "solo": "Autônomo"
    },
    "profile": {
      "high": "Alto",
      "medium": "Médio"
    },
    "complexity": {
      "high": "Alta",
      "low": "Baixa",
      "medium": "Média"
    },
    "model": {
      "subscription": "Assinatura"
    },
    "integrations": {
      "accounting": "Contabilidade",
      "audit-ai": "Audit AI",
      "calendar": "Agenda",
      "cloud-storage": "Armazenamento em nuvem",
      "compliance-tools": "Ferramentas de conformidade",
      "crm": "CRM",
      "dashboard": "Dashboard",
      "documents": "Documentos",
      "email": "E-mail",
      "helpdesk": "Helpdesk",
      "hris": "HRIS",
      "registry": "Registro",
      "social-media": "Redes sociais",
      "spreadsheet": "Planilha",
      "website": "Site"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "Como a IA é usada atualmente na sua organização?",
        "options": {
          "none": "Ainda não usamos IA",
          "individual": "Algumas pessoas usam IA individualmente",
          "team": "Várias equipes usam ferramentas de IA",
          "structured": "A IA é usada em fluxos de trabalho estruturados"
        }
      },
      "process_automation": {
        "label": "Quanto do seu trabalho repetitivo está automatizado hoje?",
        "options": {
          "none": "Quase nada está automatizado",
          "basic": "Algumas tarefas simples estão automatizadas",
          "moderate": "Alguns fluxos de trabalho importantes estão automatizados",
          "advanced": "A automação faz parte das operações diárias"
        }
      },
      "data_readiness": {
        "label": "Quão preparados estão os dados da sua empresa para o uso de IA?",
        "options": {
          "scattered": "Os dados estão dispersos e difíceis de acessar",
          "partial": "Alguns dados estão organizados",
          "mostly_ready": "A maioria dos dados essenciais está estruturada",
          "ready": "Os dados estão limpos, acessíveis e atualizados com frequência"
        }
      },
      "compliance_awareness": {
        "label": "Quão preparado você está para a governança e conformidade de IA?",
        "options": {
          "unknown": "Ainda não avaliamos os riscos de IA",
          "basic": "Conhecemos os riscos de IA, mas não temos processo",
          "documented": "Alguns casos de uso de IA estão documentados",
          "governed": "Temos governança e processos de revisão de IA claros"
        }
      },
      "shadow_ai": {
        "label": "Você sabe quais ferramentas de IA são usadas em toda a empresa?",
        "options": {
          "no_visibility": "Não, não temos visibilidade",
          "partial_visibility": "Conhecemos algumas ferramentas, mas não todas",
          "mostly_visible": "Monitoramos a maioria das ferramentas de IA",
          "full_inventory": "Mantemos um inventário claro de ferramentas de IA"
        }
      },
      "business_impact": {
        "label": "Com que clareza você mede o impacto da IA no negócio?",
        "options": {
          "not_measured": "Ainda não medimos",
          "qualitative": "Temos apenas feedback qualitativo",
          "some_metrics": "Acompanhamos alguma economia de tempo ou custo",
          "clear_roi": "Medimos o ROI e os resultados de negócio"
        }
      },
      "team_skills": {
        "label": "Quão confiantes estão suas equipes em usar IA de forma responsável?",
        "options": {
          "low": "Confiança muito limitada",
          "basic": "Familiaridade básica",
          "good": "Boa confiança para tarefas comuns",
          "strong": "Práticas sólidas de IA responsável"
        }
      },
      "implementation_priority": {
        "label": "Qual é a sua principal prioridade com IA neste momento?",
        "options": {
          "save_time": "Economizar tempo em trabalho repetitivo",
          "improve_sales": "Melhorar as vendas ou o acompanhamento de clientes",
          "support_customers": "Melhorar o atendimento ao cliente",
          "compliance": "Melhorar a conformidade e a governança de IA",
          "documents": "Processar documentos e relatórios mais rápido"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "Atendimento ao cliente",
    "sales": "Vendas e acompanhamento de leads",
    "finance": "Finanças e faturamento",
    "documents": "Documentos e contratos",
    "reporting": "Relatórios e dashboards",
    "admin": "Trabalho administrativo",
    "compliance": "Conformidade e governança",
    "marketing": "Marketing e conteúdo",
    "hr": "RH e gestão de pessoas"
  },
  auditTools: {
    nav: {
      worksheetLabel: "Auditoria Tempo → Dinheiro",
      worksheetHint: "Use os seus dados reais, tarefa por tarefa",
      visibilityLabel: "Visibilidade em IA e Redes Sociais",
      visibilityHint: "Presença no ChatGPT/Perplexity + auditoria social",
    },
    worksheet: {
      title: "Auditoria Tempo → Dinheiro",
      subtitle: "Insira os seus dados reais (sem estimativas). Para cada tarefa, a ferramenta calcula o veredito, o custo anual real e as horas recuperáveis. Escolha a sua moeda e o período do seu rendimento (mês/ano/semana) — a ferramenta adapta-se ao seu país.",
      profile: {
        sectionTitle: "① O seu perfil",
        incomeMonth: "Rendimento líquido mensal",
        incomeYear: "Rendimento líquido anual",
        incomeWeek: "Rendimento líquido semanal",
        periodLabel: "Período do rendimento",
        periodMonth: "por mês",
        periodYear: "por ano",
        periodWeek: "por semana",
        currencyLabel: "Moeda",
        hoursLabel: "Horas / semana",
        hourlyRate: "→ Valor por hora",
        perHour: "/ h",
        invalidHint: "Insira um rendimento e horas > 0 para calcular o valor por hora.",
        helperPrompt: "Não sabe as suas horas/semana?",
        helperHoursPerDay: "Horas / dia",
        helperDaysPerWeek: "Dias / semana",
        helperCalc: "Calcular as minhas horas",
      },
      tasks: {
        sectionTitle: "② As suas tarefas",
        tip: "Dica: escreva o título exato (verbo + objeto), por exemplo \"rever as propostas\", e não \"administrativo\".",
        colTask: "Tarefa",
        colHours: "H / sem",
        colWho: "Quem a pode fazer?",
        colRules: "Regras claras?",
        colEnergy: "Energia",
        colVerdict: "Veredito",
        colCost: "Custo / ano",
        colRecovered: "H rec.",
        taskPlaceholder: "Nome da tarefa",
        addRow: "+ Adicionar uma tarefa",
        addCommon: "+ Adicionar uma tarefa comum…",
        addCommonHint: "Não sabe o que adicionar? Escolha uma tarefa comum.",
        splitInto: "Dividir em {n} tarefas",
      },
      who: { self: "Só eu", specialist: "Um especialista formado", anyone: "Qualquer pessoa formada" },
      rules: { yes: "Sim", no: "Não" },
      energy: { energizing: "Energizante", neutral: "Neutra", draining: "Desgastante" },
      verdict: { keep: "✅ MANTER", automate: "🤖 AUTOMATIZAR", delegate: "→ DELEGAR", rethink: "⚠️ REPENSAR" },
      summary: {
        recoveredHoursYear: "Horas recuperáveis / ano",
        recoveredValueYear: "Valor recuperável / ano",
        toAutomate: "Para automatizar",
        toDelegate: "Para delegar",
      },
      quickWins: {
        title: "③ Faça isto primeiro (Quick-Wins)",
        sub: "Tarefas recuperáveis ordenadas por impacto (custo/ano) ÷ esforço. Comece pelo topo.",
        effortLow: "baixo",
        effortMed: "médio",
        effortLabel: "esforço",
        perYearSuffix: "/ano",
      },
      cta: {
        headline: "Pode recuperar {value} por ano.",
        body: "{count} tarefa(s) para automatizar ou delegar. Orçamentamos a implementação num orçamento personalizado.",
        button: "Criar o meu plano de automatização →",
      },
      actions: {
        save: "💾 Guardar",
        loadExample: "Carregar um exemplo",
        reset: "Repor",
        savedCloud: "Auditoria guardada ✓ (cloud + local)",
        savedLocal: "Auditoria guardada ✓ (local neste dispositivo)",
        needProfile: "Preencha o perfil e pelo menos uma tarefa.",
        loadOk: "Auditoria carregada ✓",
        loadFail: "Não foi possível carregar.",
        deleteFail: "Não foi possível eliminar.",
      },
      savedList: {
        title: "As minhas auditorias guardadas",
        perYear: "/ano recup.",
        cloud: "cloud",
        local: "local",
        load: "Carregar",
        delete: "Eliminar",
      },
      verdictRule: "Veredito: Só eu + energizante → Manter · caso contrário Repensar. Senão Qualquer pessoa + regras claras → Automatizar · caso contrário Delegar.",
      quoteSeedMain: "Automatizar / delegar {count} tarefa(s) identificada(s) através da Auditoria Tempo → Dinheiro (≈ {value}/ano recuperáveis)",
      quoteSeedTasks: ". Tarefas: {tasks}.",
      quoteSeedEnd: ".",
    },
    visibility: {
      title: "Autoavaliação de Visibilidade em IA e Redes Sociais",
      subtitle: "Avalie a sua presença nas respostas de IA (GEO) e nas redes sociais. Responda Não / Parcial / Sim; a pontuação e as recomendações atualizam-se em tempo real.",
      disclaimer: "Indicador de maturidade declarativo: a pontuação reflete as suas próprias respostas, não é uma medição dos motores de IA. Para uma auditoria medida, peça um plano de ação.",
      choices: { non: "Não", partiel: "Parcial", oui: "Sim" },
      dims: {
        geoTitle: "Visibilidade em IA (GEO / Pesquisa por IA)",
        geoSub: "Presença e exatidão no ChatGPT, Perplexity, Gemini, Google AI.",
        socialTitle: "Redes sociais e conteúdo",
        socialSub: "Autoridade, métricas úteis, consistência, supervisão de conteúdo gerado por IA.",
      },
      scoreGlobal: "Pontuação global (declarativa)",
      note: "Nota",
      answeredOf: "{a}/{t} respondidas",
      empty: "Responda às perguntas abaixo — a sua pontuação de maturidade e as recomendações aparecerão aqui.",
      recosTitle: "Recomendações prioritárias",
      geoTag: "GEO",
      socialTag: "Social",
      cta: {
        headline: "Transforme a nota {grade} num plano de ação.",
        body: "Orçamentamos a implementação das suas {count} prioridades num orçamento.",
        button: "Obter um plano de ação / orçamento →",
      },
      reset: "Repor",
      questions: {
        byId: {
          geo_offer:      { label: "As ferramentas de IA (ChatGPT, Perplexity, Gemini) descrevem corretamente a sua oferta e as suas vantagens (USP)?", reco: "Publique páginas claras de \"fonte da verdade\" (oferta, USP, preços) para que os motores de IA citem os factos certos." },
          geo_appear:     { label: "A sua marca aparece nas respostas de IA para as suas consultas-chave?", reco: "Teste as suas 10 consultas-chave no ChatGPT/Perplexity; procure ter presença e corrija as páginas em falta." },
          geo_cited:      { label: "O seu site é citado como fonte pelos motores de IA?", reco: "Identifique as fontes de terceiros citadas (Reddit, Quora, media) onde está ausente → uma lista priorizada de digital-PR." },
          geo_competitor: { label: "Sabe como a IA o compara com os seus concorrentes (a quem dá destaque)?", reco: "Audite o posicionamento competitivo nas respostas de IA e identifique o argumento que faz o concorrente vencer." },
          geo_sentiment:  { label: "O sentimento da IA sobre a sua marca é positivo e exato?", reco: "Corrija factos negativos/incorretos na origem (o seu site) para que os motores de IA atualizem a sua perceção." },
          geo_structured: { label: "Tem conteúdo estruturado (FAQ, schema, páginas pilar) otimizado para ser captado pela IA?", reco: "Adicione FAQ, dados estruturados (schema.org) e páginas pilar para ser captado como fonte da verdade." },
          soc_story:      { label: "O seu conteúdo social constrói autoridade (storytelling) em vez de spam de demonstração?", reco: "Passe do spam de funcionalidades para o storytelling (fracassos/êxitos) para construir autoridade." },
          soc_meetings:   { label: "Mede as reuniões qualificadas geradas (para além de likes/impressões)?", reco: "Acompanhe a métrica \"reuniões qualificadas\": é isso que conta, não os likes." },
          soc_cadence:    { label: "Publica com uma cadência regular e sustentável?", reco: "Crie um calendário editorial regular (uma cadência sustentável supera picos irregulares)." },
          soc_unique:     { label: "O seu conteúdo reflete uma expertise única e difícil de copiar (\"productize yourself\")?", reco: "Destaque o seu ângulo/expertise única para escapar à concorrência genérica." },
          soc_repurpose:  { label: "Reaproveita o seu conteúdo em vários formatos?", reco: "Reaproveite cada peça em vários formatos (post, vídeo, carrossel) para multiplicar o alcance." },
          soc_oversight:  { label: "O conteúdo gerado por IA é supervisionado (anti \"Shadow Social\" / alucinações)?", reco: "Adicione revisão humana ao conteúdo de IA para evitar alucinações e perda de autenticidade." },
        },
      },
    },
    taskCatalog: {
      groups: {
        admin: "Administrativo",
        sales: "Vendas e prospeção",
        support: "Apoio ao cliente",
        marketing: "Marketing e conteúdo",
        finance: "Finanças e RH",
        ops: "Operações",
        strategy: "Estratégia",
      },
      tasks: {
        emails_reply: "Responder a e-mails",
        appointments: "Marcar reuniões",
        schedule: "Gestão de calendário / agenda",
        filing: "Arquivo de documentos",
        cold_calls: "Chamadas de saída (prospeção)",
        followups: "Acompanhamento de clientes",
        quotes_write: "Elaboração de orçamentos",
        crm_entry: "Inserção de dados no CRM",
        inbound_calls: "Chamadas recebidas (apoio)",
        support_l1: "Apoio ao cliente de nível 1",
        reviews_faq: "Respostas a avaliações / FAQ",
        content_social: "Criação de conteúdo para redes sociais",
        social_planning: "Agendamento de redes sociais",
        market_research: "Pesquisa de mercado / monitorização",
        accounting: "Contabilidade / faturação",
        weekly_report: "Relatório semanal",
        cv_screening: "Triagem de CV / pré-seleção",
        expenses: "Notas de despesas",
        data_entry: "Inserção / introdução de dados",
        inventory: "Controlo de stock / inventário",
        translation: "Tradução de conteúdo",
        blog_writing: "Escrita de artigos / blogue",
        high_prospecting: "Prospeção / reuniões de alto nível",
        vision: "Estratégia e visão",
        onboarding: "Integração de clientes",
        email_support: "E-mails de apoio ao cliente",
        email_sales: "E-mails de acompanhamento de vendas",
        meetings_internal: "Reuniões internas",
        meetings_client: "Reuniões com clientes",
        content_create: "Criação de conteúdo",
        content_publish: "Agendamento / publicação",
        invoice_issue: "Emissão de faturas",
        quotes_custom: "Orçamentos personalizados",
        interviews: "Entrevistas a candidatos",
      },
      hints: {
        calls: "Ambíguo: chamadas RECEBIDAS (apoio) ou de SAÍDA (prospeção)? O veredito difere — separe-as.",
        email: "Seja específico: apoio ao cliente, acompanhamento de vendas ou trocas internas? Cada um tem um veredito diferente.",
        meeting: "Interna ou com cliente? Recorrente ou pontual? As reuniões importantes com clientes vale a pena manter.",
        content: "Separe a CRIAÇÃO (critério, manter) e a PUBLICAÇÃO/agendamento (baseado em regras, automatizável).",
        invoice: "Emissão padrão (regras claras → automatizar) vs negociação/personalizado (critério → manter/delegar).",
        report: "Se os dados já estão estruturados, o reporte é muitas vezes automatizável.",
        recruit: "Triagem de CV (critérios claros → automatizável) vs entrevista final (juízo humano → manter).",
        data: "Entrada estruturada? A inserção/cópia de dados é quase sempre automatizável.",
        writing: "Primeiro rascunho (copiloto de IA, rápido) vs validação/edição final (juízo humano).",
        translate: "Volume repetitivo → automatizável; nuance de marketing/jurídica → revisão humana.",
        logistics: "Otimização de rotas / controlo de stock → automatizável; relação com transportadoras → humana.",
      },
      seed: {
        emails_slack: "Responder a e-mails / Slack",
        accounting_billing: "Contabilidade, faturação",
        prospecting_clients: "Prospeção / reuniões com clientes",
        crm_data: "Inserção de dados no CRM",
        social_mgmt: "Gestão de redes sociais",
        manual_reporting: "Relatório semanal manual",
        planning_agenda: "Gestão de calendário / agenda",
        client_quote: "Orçamento de cliente",
      },
    },
  },
  contacts: {
    nav: "Contactos",
    title: "Contactos",
    subtitleOrg: "Faz a gestão dos contactos e leads da tua organização.",
    subtitleAll: "Todos os contactos de todas as organizações (apenas leitura).",
    modeOrg: "A minha organização",
    modeAll: "Todas as organizações",
    readOnlyNotice: "Vista entre organizações apenas de leitura (operador da plataforma). Muda para “A minha organização” para gerir os teus próprios contactos.",
    noAccess: "Não tens acesso aos contactos.",
    create: "+ Novo contacto",
    searchPlaceholder: "Pesquisar nome, e-mail, empresa…",
    allTags: "Todas as etiquetas",
    allSources: "Todas as origens",
    allStatuses: "Todos os estados",
    colName: "Nome",
    colEmail: "E-mail",
    colCompany: "Empresa",
    colOrg: "Org",
    colTags: "Etiquetas",
    colSource: "Origem",
    colStatus: "Estado",
    colCreated: "Criado",
    colActions: "Ações",
    loading: "A carregar…",
    empty: "Nenhum contacto corresponde.",
    edit: "Editar",
    block: "Bloquear",
    unblock: "Desbloquear",
    delete: "Eliminar",
    createTitle: "Novo contacto",
    editTitle: "Editar contacto",
    phone: "Telefone",
    tagsLabel: "Etiquetas",
    tagsPlaceholder: "etiquetas, separadas, por vírgulas",
    notesLabel: "Notas",
    cancel: "Cancelar",
    save: "Guardar",
    sources: {
      manual: "Manual",
      quote: "Orçamento",
      worksheet: "Folha de trabalho",
      visibility: "Auditoria de visibilidade",
      import: "Importação",
    },
    statuses: {
      active: "Ativo",
      inactive: "Inativo",
      blocked: "Bloqueado",
    },
    errors: {
      DUPLICATE_EMAIL: "Já existe um contacto com este e-mail nesta organização.",
      FORBIDDEN: "Só podes gerir os contactos que criaste.",
      FORBIDDEN_STATUS: "Só um proprietário ou administrador pode bloquear ou alterar o estado de um contacto.",
      INVALID_INPUT: "Verifica os dados do contacto (são obrigatórios um nome e um e-mail válidos).",
      NOT_FOUND: "Este contacto já não existe.",
      LOAD_FAILED: "Não foi possível carregar os contactos.",
      SAVE_FAILED: "Não foi possível guardar. Tenta novamente.",
    },
  },
};
