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
};
