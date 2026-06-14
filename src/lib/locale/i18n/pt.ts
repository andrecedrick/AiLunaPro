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
};
