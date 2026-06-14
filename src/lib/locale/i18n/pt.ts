/** B6.0 — Portuguese dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts). */
import type { Dict } from './en';

export const pt: Dict = {
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
        "journeyCostSaved": "Custo economizado estimado ≈ ${amount}/mês."
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
    "stillConnecting": "Ainda a ligar…"
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
      "heading": "Como quer começar?",
      "express": {
        "title": "Audit Express",
        "body": "Uma visão rápida da prontidão para a IA, em cerca de 5 minutos — algumas perguntas rápidas, uma análise opcional do site e um ROI indicativo. Ideal para uma primeira abordagem.",
        "cta": "Iniciar o Audit Express →"
      },
      "full": {
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
};
