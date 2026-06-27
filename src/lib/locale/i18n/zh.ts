/** B6.5 — Simplified Chinese dictionary. Typed `: Dict` ⇒ compile-time
 *  completeness. LTR. Neutral UI chrome only (no regulatory/disclaimer copy —
 *  see en.ts). CJK renders via system fonts in the UI; PDFs fall back to
 *  English (pdfLocale). */
import type { Dict } from './en';

export const zh: Dict = {
  nav: {
    dashboard:             '仪表板',
    'new-audit':           '新建审计',
    reports:               '报告',
    'audit-history':       '审计历史',
    'audit-express-run':   '运行 Audit Express',
    'audit-express-saved': '已保存的审计',
    registry:              'AI 注册表',
    'system-builder':      '系统构建器',
    agents:                '智能体',
    team:                  '团队',
    settings:              '设置',
    billing:               '账单',
    help:                  '帮助',
    toolsSection:          '工具',
    aiRoiCalculator:       'AI ROI 计算器',
    aiMaturityDiagnostic:  'AI 成熟度诊断',
    requestQuote:          '申请报价',
    myQuotes:              '我的报价',
    invoices:              '发票',
  },
  bankSettings: {
    heading: '银行转账信息',
    subtitle: '作为付款方式显示在发票上。',
    countryLabel: '国家代码',
    countryPlaceholder: '如 CN',
    regionLabel: '银行区域',
    regionEu: '欧洲（IBAN）',
    regionUs: '美国',
    regionGlobal: '亚洲 / 全球',
    fAccountName: '账户名称',
    fAccountNumber: '账号',
    fRoutingNumber: '路由号码',
    fBankName: '银行名称',
    fAccountHolder: '账户持有人',
    save: '保存银行信息',
    saved: '银行信息已保存',
    saveError: '保存失败，请重试。',
    validationError: '请检查此值。',
    ownerOnly: '仅所有者和管理员可以编辑银行信息。',
  },
  invoices: {
    title: '发票',
    subtitle: '客户接受报价时创建的发票。',
    loading: '加载中…',
    error: '无法加载您的发票，请重试。',
    empty: '暂无发票。',
    quoteLabel: '报价',
    statusDraft: '草稿',
    statusPending: '待处理',
    statusPaid: '已支付',
    amountPending: '待确认',
    clientBudget: '客户预算',
    proposedBudget: '建议预算',
    confirmSend: '确认并发送发票',
    amountLabel: '最终金额（USD）',
    confirmBtn: '确认并发送',
    cancel: '取消',
    sent: '发票已成功发送',
    sentNoEmail: '发票已创建，但邮件发送失败。',
    confirmError: '发送失败，请重试。',
    pendingHeading: '待确认',
    queueHeading: '等待您定价',
    queueEmpty: '当前没有待定价的报价。',
    queueSubtitle: '客户已回复——请设置最终金额以创建发票。',
    stageAcceptedLabel: '已接受',
    stageNegotiationLabel: '协商中',
    nextAccepted: '下一步：设置最终金额以创建并发送发票。',
    nextNegotiation: '下一步：查看客户预算，然后设置最终金额。',
    clientMessageLabel: '客户留言',
    finalizeBtn: '确认金额并创建发票',
    invoicesHeading: '发票',
    resendBtn: '重新发送发票邮件',
    fromEmail: '从您的邮件打开',
    notFound: '未找到此报价或发票。',
  },
  adminCenter: {
    nav: 'Admin Center',
    title: 'Admin Center',
    subtitle: '在一个地方监控贵组织的报价、发票和客户活动。',
    restricted: 'Admin Center 仅限超级管理员访问。',
    activityHeading: '近期活动',
    activityEmpty: '暂无活动。',
    evtAccepted: '客户已确认预算',
    evtAdjustment: '客户请求修改预算',
    evtInvoiceSent: '发票已发送',
    evtPaid: '已收到付款',
    discussionsHeading: '客户沟通',
    discussionsEmpty: '暂无客户留言。',
    contextLabel: '上下文',
    statusWaitingResponse: '等待您的回复',
    replyHint: '回复通知邮件即可回应',
    allQuotesHeading: '所有报价 — 完整生命周期',
    allQuotesEmpty: '尚未发送任何报价。',
    tlCreated: '已创建',
    tlSent: '已发送',
    tlAccepted: '已接受',
    tlChanges: '已请求修改',
    tlInvoiced: '已开具发票',
    blocked: '已封禁',
    suspended: '已暂停',
    editBudget: '编辑预算',
    budgetUsdLabel: '预算 (USD)',
    save: '保存',
    block: '封禁',
    suspend: '暂停',
    reactivate: '重新启用',
    sendQuote: '发送报价',
    sendAndPay: '发送并付款',
    openPaymentLink: '打开付款链接',
    genPaymentLink: '生成付款链接',
  },
  myQuotes: {
    title: '我的报价',
    subtitle: '跟踪您发送的提案——状态、预算及最新动态。',
    loading: '加载中…',
    error: '无法加载您的报价，请重试。',
    empty: '您尚未发送任何报价。',
    createCta: '创建报价',
    quoteLabel: '报价',
    proposedBudget: '建议预算',
    statusSent: '已发送',
    statusReviewing: '审核中',
    statusNegotiation: '协商中',
    statusValidated: '已确认',
    statusInvoiced: '已开具发票',
    statusBlocked: '已封禁',
    statusSuspended: '已暂停',
    changesRequested: '客户请求修改',
    negotiationNextStep: '请在 Admin Center 中设置最终金额以作回复。',
    waitingResponse: '等待客户回复',
    lastActivity: '最近活动',
    actCreated: '报价已创建',
    actSent: '提案已发送给客户',
    actAccepted: '客户已接受预算',
    actChangesRequested: '客户请求修改',
    actInvoiced: '发票已创建',
  },
  shell: {
    complianceSuite:  '合规套件',
    signOut:          '退出登录',
    workspaces:       '工作区',
    createWorkspace:  '创建工作区',
    searchWorkspaces: '搜索工作区…',
    language:         '语言',
    currency:         '货币',
  },
  settings: {
    title:               '偏好设置',
    themeTitle:          '主题',
    themeHint:           '选择 AiLunaPro 的外观，立即生效。',
    light:               '浅色',
    dark:                '深色',
    languageTitle:       '语言',
    languageHint:        '用于界面文本和邮件。翻译正在逐节推出；未翻译的部分仍为英文。',
    currencyTitle:       '默认货币',
    currencyHint:        '仅用于显示。计费和代币包仍以美元结算。',
    profileTitle:        '档案',
    profileHint:         '调整指导的语气和推荐的起始资源。绝不更改评分、发现或任何法规对应关系。',
    notificationsTitle:  '电子邮件通知',
    notificationsHint:   '选择您接收的邮件。发件人设置将在后续阶段提供。',
    weeklyDigest:        '每周合规摘要',
    weeklyDigestDesc:    '每周一汇总新发现和已解决的操作。',
    reportReady:         '报告就绪',
    reportReadyDesc:     '当我请求的报告生成时通过邮件通知我。',
    teamActivity:        '团队动态',
    teamActivityDesc:    '我的工作区中的邀请、角色变更和成员移除。',
    langToast:           '语言：{value}',
    currencyToast:       '货币：{value}',
    profileToast:        '档案：{value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "审计章节",
      "questionCount": "{n} 个问题",
      "yes": "是",
      "no": "否"
    },
    "section": {
      "profile": {
        "title": "概况",
        "subtitle": "您的组织概览"
      },
      "ai-tools": {
        "title": "AI 工具",
        "subtitle": "您的组织实际使用哪些 AI？"
      },
      "data": {
        "title": "数据",
        "subtitle": "哪些数据驱动您的 AI 系统？"
      },
      "governance": {
        "title": "治理",
        "subtitle": "政策、归属与问责"
      },
      "security": {
        "title": "安全",
        "subtitle": "保护 AI 系统及其数据"
      },
      "transparency": {
        "title": "透明度",
        "subtitle": "信息披露与可解释性"
      },
      "human-oversight": {
        "title": "人工监督",
        "subtitle": "让人类保持掌控"
      },
      "training-maturity": {
        "title": "培训与成熟度",
        "subtitle": "您的组织对 AI 的认知水平如何？"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "组织名称",
        "placeholder": "例如 Acme Corp"
      },
      "profile.industry": {
        "label": "主营行业"
      },
      "profile.size": {
        "label": "公司规模"
      },
      "profile.region": {
        "label": "主要运营地区"
      },
      "tools.categories": {
        "label": "哪些 AI 类别已投入生产？",
        "helper": "选择所有适用项。"
      },
      "tools.vendors": {
        "label": "主要 AI 供应商／产品",
        "placeholder": "例如 OpenAI GPT-4、Anthropic Claude、基于 AWS Bedrock 的自研模型……"
      },
      "tools.scope": {
        "label": "部署范围"
      },
      "tools.builds_custom": {
        "label": "您是否训练或微调自己的模型？"
      },
      "data.types": {
        "label": "AI 处理哪些类型的数据？"
      },
      "data.residency": {
        "label": "数据主要存储在哪里？"
      },
      "data.governance_framework": {
        "label": "是否已建立成文的数据治理框架？"
      },
      "data.sources": {
        "label": "描述您的主要数据来源",
        "placeholder": "例如 CRM、产品遥测数据、客户支持工单、第三方数据集……"
      },
      "gov.committee": {
        "label": "您是否设有 AI 治理委员会或指定负责人？"
      },
      "gov.written_policy": {
        "label": "是否有经领导层批准的成文 AI 政策？"
      },
      "gov.frameworks": {
        "label": "您遵循哪些框架？"
      },
      "gov.structure": {
        "label": "描述您的治理结构",
        "placeholder": "谁负责 AI 风险？决策如何上报？"
      },
      "sec.controls": {
        "label": "AI 系统已部署哪些安全控制措施？"
      },
      "sec.red_team": {
        "label": "您的 AI 系统是否经过红队演练或对抗性测试？"
      },
      "sec.incident_readiness": {
        "label": "您对 AI 专项事件的应对准备程度如何？"
      },
      "sec.review_process": {
        "label": "描述您对新 AI 系统的安全审查流程"
      },
      "trans.disclosure": {
        "label": "当最终用户与 AI 交互时，您是否向其披露 AI 的使用？"
      },
      "trans.cards": {
        "label": "您是否维护模型卡或系统卡？"
      },
      "trans.explainability": {
        "label": "您的 AI 决策对受影响用户的可解释程度如何？"
      },
      "trans.measures": {
        "label": "描述您的透明度措施",
        "placeholder": "公开 AI 登记册、应用内披露、向用户开放的审计日志……"
      },
      "over.model": {
        "label": "哪种监督模式最符合您的设置？"
      },
      "over.escalation": {
        "label": "针对 AI 错误或危害，是否已制定成文的上报流程？"
      },
      "over.review_categories": {
        "label": "哪些决策类别必须进行人工审查？"
      },
      "over.processes": {
        "label": "用您自己的话描述您的监督流程"
      },
      "train.staff_training": {
        "label": "您是否为员工提供 AI 素养培训？"
      },
      "train.maturity": {
        "label": "自评 AI 合规成熟度"
      },
      "train.topics": {
        "label": "您的培训涵盖哪些主题？"
      },
      "train.program": {
        "label": "描述您的培训计划（或缺失的部分）"
      }
    },
    "option": {
      "profile.industry.finance": "金融与银行",
      "profile.industry.health": "医疗与生命科学",
      "profile.industry.tech": "科技／SaaS",
      "profile.industry.retail": "零售与电子商务",
      "profile.industry.public": "公共部门",
      "profile.industry.other": "其他",
      "profile.size.xs": "1–10 名员工",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "欧盟",
      "profile.region.uk": "英国",
      "profile.region.us": "美国",
      "profile.region.ca": "加拿大",
      "profile.region.apac": "亚太地区",
      "profile.region.global": "全球／多地区",
      "tools.categories.llm": "大语言模型（聊天、智能体、辅助工具）",
      "tools.categories.ml": "经典 ML／预测模型",
      "tools.categories.cv": "计算机视觉",
      "tools.categories.speech": "语音与音频",
      "tools.categories.rec": "推荐系统",
      "tools.categories.rpa": "含 AI 组件的 RPA／自动化",
      "tools.scope.pilot": "仅试点／实验",
      "tools.scope.internal": "面向内部员工使用",
      "tools.scope.customer": "面向客户的功能",
      "tools.scope.critical": "关键任务／受监管决策",
      "data.types.pii": "个人数据（PII）",
      "data.types.health": "健康数据",
      "data.types.financial": "财务／交易数据",
      "data.types.biometric": "生物识别数据",
      "data.types.children": "未成年人数据",
      "data.types.public": "公开／开放数据",
      "data.residency.eu": "EU／EEA",
      "data.residency.us": "美国",
      "data.residency.mixed": "混合／多地区",
      "data.residency.unknown": "不确定",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "无正式框架",
      "sec.controls.encryption": "静态与传输中加密",
      "sec.controls.rbac": "基于角色的访问控制",
      "sec.controls.audit_logs": "模型访问与输入的审计日志",
      "sec.controls.secrets": "密钥管理（无硬编码密钥）",
      "sec.controls.isolation": "租户／数据隔离",
      "sec.incident_readiness.1": "1 — 无计划",
      "sec.incident_readiness.2": "2 — 非正式计划",
      "sec.incident_readiness.3": "3 — 已成文但未测试",
      "sec.incident_readiness.4": "4 — 已成文并演练",
      "sec.incident_readiness.5": "5 — 持续进行，并与 SOC 集成",
      "trans.explainability.none": "不提供任何解释",
      "trans.explainability.generic": "仅通用披露",
      "trans.explainability.category": "类别级原因",
      "trans.explainability.individual": "应请求提供单次决策解释",
      "trans.explainability.realtime": "实时、产品内解释",
      "over.model.hitl": "人在环中（每项决策均经审查）",
      "over.model.hotl": "人在环上（抽样审查）",
      "over.model.oot": "人在环外（自主运行）",
      "over.review_categories.hr": "招聘／HR 决策",
      "over.review_categories.credit": "信贷／财务决策",
      "over.review_categories.health": "健康相关建议",
      "over.review_categories.content": "内容审核结果",
      "over.review_categories.legal": "法律／合规决策",
      "train.maturity.1": "1 — 初始／临时",
      "train.maturity.2": "2 — 发展中",
      "train.maturity.3": "3 — 已定义",
      "train.maturity.4": "4 — 已管理",
      "train.maturity.5": "5 — 已优化",
      "train.topics.bias": "偏见与公平性",
      "train.topics.privacy": "隐私与数据保护",
      "train.topics.security": "AI 安全与滥用",
      "train.topics.usage": "可接受使用政策",
      "train.topics.incident": "事件响应"
    }
  },
  results: {
    "nextTools": {
      "title": "继续探索",
      "subtitle": "可随时运行的轻量工具 — 无需设置。",
      "roi": "估算你的 ROI",
      "diagnostic": "再做一次快速诊断"
    },
    "insightCard": {
      "whatThisMeans": "这意味着什么",
      "whyItMatters": "为什么重要",
      "howItPlaysOut": "实际如何体现",
      "exampleHeading": "示例——同类企业如何从中受益",
      "illustrative": "（仅供说明。）",
      "doThisNext": "下一步行动",
      "doThisNextWithHeading": "下一步行动——{heading}",
      "onceDone": "完成后：{outcome}",
      "referencesPrefix": "参考依据：{refs}"
    },
    "explained": {
      "heading": "您的结果意味着什么",
      "subtitle": "下面每一项都说明了我们的发现、为什么重要，以及最快的下一步——并标注您可以挽回的分数。",
      "emptyTitle": "未触发任何缺口——基础扎实",
      "emptyWhatItMeans": "您的回答未触发任何发现项——您的 AI 实践已涵盖我们检查的基本要点。",
      "emptyWhyItMatters": "这是一个坚实的基础。下一步的提升来自持续且规模化地落实这些控制措施。",
      "emptyFlowInput": "良好实践",
      "emptyFlowProcess": "使其常态化",
      "emptyFlowOutput": "稳定一致的控制",
      "emptyFlowGain": "持久且可扩展的信任",
      "emptyExample": "处于此阶段的团队正从“我们在做这件事”迈向“这件事自动运行”——将手动环节自动化。（仅供说明。）",
      "emptyDoNextHeading": "规模化推进",
      "emptyDoNextStep1": "将您今天手动执行的控制措施自动化。",
      "emptyDoNextStep2": "定期重新审计以保持水准。",
      "ctaSeeAgentsForThis": "查看可处理此项的智能体",
      "ctaSeeRecommendedAgents": "查看推荐的智能体",
      "ctaOpenDesignGuide": "打开设计指南",
      "ptsToRecover": "可挽回 −{n} 分",
      "priorityCritical": "优先级：严重",
      "priorityHigh": "优先级：高",
      "priorityMedium": "优先级：中",
      "priorityLow": "优先级：低",
      "effortBadge": "投入：{effort}",
      "effortBadgeDefault": "投入：中等",
      "timeframeBadge": "约 {days} 天",
      "timeframeBadgeDefault": "约 30 天"
    },
    "findings": {
      "title": "发现项",
      "total": "共 {n} 项",
      "empty": "✓ 未触发任何发现项。请通过右侧的建议持续提升成熟度。",
      "severityCritical": "严重",
      "severityHigh": "高",
      "severityMedium": "中",
      "severityLow": "低",
      "severityCount": "{label}（{count}）",
      "recommendationLink": "→ {count} 条建议"
    },
    "recommendations": {
      "title": "建议",
      "actionsCount": "{n} 项行动",
      "starterResource": "推荐的入门资源",
      "empty": "目前暂无可执行的建议。",
      "impactCritical": "影响：严重",
      "impactHigh": "影响：高",
      "impactMedium": "影响：中",
      "impactLow": "影响：低",
      "timeframeDays": "{n} 天",
      "addressesFindings": "解决 {count} 项发现"
    },
    "actionPlan": {
      "title": "优先行动计划",
      "roadmapNote": "路线图显示何时交付；行动计划显示应优先修复什么。",
      "bandCriticalTitle": "严重",
      "bandImportantTitle": "重要",
      "bandImportantSubtitle": "短期——在本季度内处理。",
      "bandImprovementTitle": "改进",
      "bandImprovementSubtitle": "最佳实践——纳入成熟度规划。",
      "itemCount": "{n} 项",
      "bandEmpty": "此区间暂无条目——目前没有可执行的事项。",
      "moreNotShown": "另有 {n} 项未显示",
      "impactPill": "影响",
      "effortPill": "投入",
      "expectedOutcome": "预期成果——"
    }
  },
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "您最希望改进哪个领域？",
          "opt": {
            "support": "客户支持",
            "sales": "销售",
            "finance": "财务",
            "documents": "文档",
            "reporting": "报告",
            "admin": "行政",
            "compliance": "合规",
            "marketing": "营销",
            "hr": "HR"
          }
        },
        "monthlyHours": {
          "label": "每月大约有多少小时用于重复性工作？",
          "opt": {
            "low": "较少（~20）",
            "medium": "中等（~80）",
            "high": "较多（~160）"
          }
        },
        "hourlyCost": {
          "label": "这类工作的大致平均每小时成本是多少？",
          "opt": {
            "low": "较低（~$25）",
            "medium": "中等（~$45）",
            "high": "较高（~$75）"
          }
        },
        "aiUsage": {
          "label": "目前贵组织如何使用 AI？",
          "opt": {
            "none": "尚未使用",
            "individual": "个人使用",
            "team": "跨团队使用",
            "structured": "用于结构化工作流"
          }
        },
        "shadowAi": {
          "label": "您对正在使用的 AI 工具有多大的可见性？",
          "opt": {
            "no_visibility": "没有",
            "partial_visibility": "部分",
            "mostly_visible": "大部分",
            "full_inventory": "完整清单"
          }
        }
      },
      "run": {
        "title": "运行 Audit Express",
        "subtitle": "一份快速的、仅供估算的 AI 就绪度快照 — 自动保存至您的工作区。",
        "errPreviewCode": "无法运行预览（{code}）。",
        "errPreview": "无法运行预览。",
        "errAnalysisCode": "分析不可用（{code}）。",
        "errAnalysis": "分析不可用。请重试。",
        "errDocCode": "文档分析不可用（{code}）。",
        "errDoc": "文档分析不可用。请重试。",
        "analyzeSiteTitle": "分析一个公开网站（可选）",
        "analyzeSiteHint": "仅读取公开页面，遵循 robots.txt。丰富“该业务的内容”。",
        "deepScan": "深度扫描（更慢，覆盖更多页面）",
        "saving": "正在保存您的结果…",
        "journeyHeadline": "以下是您的快照含义",
        "journeyReadiness": "AI 就绪度：{bucket}（{score}/100）。",
        "journeyTimeSaved": "预计节省时间 ≈ {hours} 小时/月。",
        "journeyCostSaved": "预计节省成本 ≈ {amount}/月。"
      },
      "cta": {
        "computing": "计算中…",
        "getPreview": "获取预览",
        "analyzing": "分析中…",
        "analyzeSite": "分析网站",
        "preparing": "准备中…",
        "downloadPdf": "下载 PDF",
        "viewSaved": "查看已保存的审计",
        "seeAgents": "查看与您审计匹配的智能体 →",
        "runFullAudit": "运行完整审计",
        "extracting": "提取中…",
        "analyzeDocument": "分析文档 →",
        "save": "保存",
        "cancel": "取消"
      },
      "result": {
        "snapshotHeading": "您的快照 · AI 就绪度：{bucket}（{score}/100）",
        "whatThisMeans": "这意味着什么",
        "opportunityLabel": "机会 — 指示性区间",
        "timeBack": "节省的时间",
        "timeBackValue": "{range}（≈ {low}–{high} h/yr）",
        "costImpact": "成本影响",
        "costImpactValue": "{range}（≈ {low}–{high}/yr）",
        "payback": "回本周期",
        "howSavingLabel": "节省如何实现",
        "flowRepetitive": "重复性任务",
        "flowAssisted": "辅助 / 自动化",
        "flowSameWork": "同样的工作，更少的手动时间",
        "flowHoursBack": "把时间投入更高价值的工作",
        "roiUnavailable": "本次审计无法提供 ROI 估算。",
        "whatToDoFirst": "首先该做什么",
        "step1": "选择一个高频任务（支持回复、发票录入、报告）。",
        "step2": "用一个助手在该任务上试点约 2 周。",
        "step3": "衡量前后的小时数 — 保留能带来回报的部分。",
        "businessHeading": "该业务的内容",
        "businessType": "类型：",
        "businessAudience": "受众：",
        "businessConfidence": "置信度 {confidence}",
        "businessUnknown": "未知",
        "offers": "提供内容：{list}",
        "automationHeading": "自动化机会",
        "opportunityItem": "{title} — {impact} 影响 / {effort} 投入"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "评分趋势",
      "subtitle": "AI 成熟度评分随时间变化",
      "empty": {
        "title": "多次审计后将显示趋势",
        "hint": "在本工作区提交多次审计后，系统将根据您的真实历史记录在此绘制 AI 成熟度评分图表。"
      }
    },
    "automation": {
      "title": "自动化机会",
      "subtitle": "为您的 AI 使用情况量身定制",
      "empty": {
        "title": "运行审计以获取量身定制的机会",
        "hint": "自动化机会源自您的审计答案和 AI 清单。完成一次审计并添加您的 AI 工具，即可在此查看建议。"
      }
    },
    "businessImpact": {
      "title": "业务影响",
      "subtitle": "来自您的合规计划的可衡量成果",
      "empty": {
        "title": "随着计划成熟，将显示影响指标",
        "hint": "持续运行审计以积累记录。风险降低、治理进展和节省的时间将根据您的真实历史记录计算得出——并非估算值。"
      }
    },
    "recentReports": {
      "title": "近期报告",
      "countOne": "已生成 {n} 份报告",
      "countOther": "已生成 {n} 份报告",
      "viewAll": "查看全部 →",
      "empty": {
        "title": "暂无报告",
        "hint": "从已提交的审计生成报告——它将显示在此处以及本工作区的“报告”下。"
      }
    },
    "kpi": {
      "auditsSubmitted": "已提交的审计",
      "reportsGenerated": "已生成的报告",
      "aiToolsRegistered": "已注册的 AI 工具",
      "loadErrorSuffix": " — 无法加载"
    },
    "maturity": {
      "rung": {
        "initial": "初始级",
        "managed": "受管理级",
        "defined": "已定义级",
        "advanced": "高级",
        "optimal": "最优级"
      }
    },
    "cta": {
      "poweredBy": "由 Luna AI 提供支持",
      "scheduleDemo": "预约演示",
      "startFreeTrial": "开始免费试用 →"
    },
    "quickTools": {
      "title": "快捷工具",
      "subtitle": "可随时重新运行的轻量检查 — 独立于完整审计。",
      "diagnostic": {
        "label": "运行快速诊断",
        "hint": "约 2 分钟评估你的 AI 成熟度"
      },
      "roi": {
        "label": "估算你的 ROI",
        "hint": "查看可能节省的时间与成本"
      }
    }
  },
  topbar: {
    "title": {
      "dashboard": "仪表盘",
      "audit/new": "新建审计",
      "audit/result": "审计结果",
      "audit/assistance": "实施指南",
      "audit/history": "审计历史",
      "reports": "报告",
      "reports/detail": "报告",
      "reports/share": "共享报告",
      "registry": "AI 登记册",
      "system-builder": "系统构建器",
      "agents": "智能体",
      "agents/detail": "智能体",
      "team": "团队",
      "settings": "设置",
      "billing": "账单",
      "billing/tokens": "Tokens",
      "help": "帮助",
      "audit-express/run": "运行 Audit Express",
      "audit-express/saved": "已保存的审计",
      "audit-express/detail": "已保存的审计"
    },
    "subtitle": {
      "dashboard": "AI 合规总览"
    },
    "search": {
      "placeholder": "搜索审计、报告…",
      "toast": "正在搜索“{query}”…"
    },
    "dateRange": {
      "last7": "最近 7 天",
      "last30": "最近 30 天",
      "thisMonth": "本月",
      "lastMonth": "上月",
      "customRange": "自定义范围…",
      "from": "起始",
      "to": "结束",
      "apply": "应用范围",
      "toast": "日期范围：{label}",
      "errPickBoth": "请选择起始日期和结束日期。",
      "errOrder": "起始日期必须早于结束日期。"
    },
    "notifications": {
      "label": "通知",
      "title": "通知",
      "empty": "暂无通知。"
    },
    "tokens": {
      "aria": "剩余 {n} 个 tokens — 管理 tokens",
      "title": "剩余 {n} 个 tokens · 点击管理",
      "balance": "{used} / {total}",
      "corruptTitle": "Token 余额包含无效数据 — 点击修复",
      "corruptLabel": "Tokens 需要修复"
    },
    "luna": {
      "aria": "打开 Luna，您的向导",
      "title": "Luna — 您的向导",
      "label": "Luna"
    },
    "theme": {
      "toDark": "切换到深色模式",
      "toLight": "切换到浅色模式"
    },
    "newAudit": {
      "label": "新建审计",
      "denied": "您的角色不允许创建审计。审计功能面向所有者、管理员和成员开放。"
    },
    "sidebar": {
      "openMenu": "打开导航菜单",
      "closeMenu": "关闭导航菜单",
      "menu": "菜单",
      "expand": "展开侧边栏",
      "collapse": "收起侧边栏"
    }
  },
  auditForm: {
    "title": "新建审计",
    "subtitle": "通过 8 个板块逐步评估您的 AI 合规状况。系统会在您操作时自动保存进度 — 您可以随时离开并继续。",
    "loading": "正在加载审计…",
    "forbiddenTitle": "您的角色不允许创建审计",
    "forbiddenBody": "审计功能面向所有者、管理员和成员角色开放。如需审计权限，请联系工作区的所有者或管理员。",
    "errorLoad": "加载审计失败。请刷新重试。",
    "pageTitle": "新建审计",
    "pageIntro": "通过 8 个板块逐步评估您的 AI 合规状况。系统会在您操作时自动保存进度 — 您可以随时离开并继续。",
    "stepOf": "第 {current} 步，共 {total} 步",
    "overallProgress": "总体进度",
    "previous": "← 上一步",
    "saveDraft": "保存草稿",
    "saveContinue": "保存并继续 →",
    "submit": "提交审计 ✓",
    "saved": "✓ 已保存"
  },
  settingsPages: {
    "shell": {
      "title": "设置",
      "subtitle": "管理您的个人资料、组织和偏好设置。"
    },
    "tabs": {
      "profile": "个人资料",
      "org": "组织",
      "preferences": "偏好设置",
      "billing": "账单"
    },
    "profile": {
      "sectionTitle": "个人资料",
      "avatarHint": "头像根据您的姓名首字母生成。自定义上传功能即将推出。",
      "displayName": "显示名称",
      "displayNamePlaceholder": "您的全名",
      "email": "邮箱",
      "emailPlaceholder": "you@example.com",
      "emailVerificationTitle": "邮箱验证",
      "emailVerified": "✓ 您的邮箱已验证。",
      "sendVerification": "发送验证邮件",
      "sendingVerification": "正在发送…",
      "passwordTitle": "密码",
      "passwordHint": "我们将向您的邮箱发送一个重置链接。该链接将在一小时后失效。",
      "sendPasswordReset": "发送密码重置邮件",
      "sendingReset": "正在发送…",
      "savedToast": "个人资料已更新。"
    },
    "org": {
      "sectionTitle": "组织",
      "fallbackName": "工作区",
      "nameLabel": "组织名称",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "只有工作区所有者才能重命名或删除组织。",
      "planTitle": "套餐",
      "dangerZoneTitle": "危险操作区",
      "dangerZoneHint": "删除组织将移除其所有数据：审计、报告、登记册和团队成员。此操作无法撤销。",
      "deleteButton": "删除组织…",
      "deleteDialogTitle": "删除“{name}”？",
      "deleteDialogBody1": "这将永久移除该组织及其所有审计、报告、登记册条目和团队成员关系。",
      "deleteDialogBody2": "在触及任何数据之前，系统会再次请您确认。",
      "deleteConfirmLabel": "我已了解，继续",
      "renamedToast": "组织已重命名。",
      "deletionDeferredToast": "组织删除功能将在后续的后端步骤中启用。"
    },
    "billing": {
      "sectionTitle": "账单",
      "checkingAccess": "正在检查访问权限…"
    }
  },
  common: {
    "saveChanges": "保存更改",
    "saving": "正在保存…",
    "cancel": "取消",
    "loading": "正在加载…",
    "save": "保存",
    "confirm": "确认",
    "close": "关闭",
    "tryAgain": "重试",
    "reloadPage": "重新加载页面",
    "retryNow": "立即重试",
    "reload": "重新加载",
    "somethingWentWrong": "出现了问题",
    "couldntLoadThePage": "无法加载页面",
    "stillConnecting": "仍在连接…"
  },
  journey: {
    "label": {
      "choice": "选择",
      "audit": "审计",
      "understanding": "理解",
      "adoption": "采用"
    },
    "hint": {
      "choice": "选择开始方式 — 使用 Audit Express 快速了解概况，或新建审计深入评估。",
      "audit": "完成您的审计 — 我们将为您解释其含义以及下一步该做什么。",
      "understanding": "这是您的审计结果含义。查看洞察，然后选择下一步。"
    },
    "progress": {
      "ariaLabel": "引导式旅程进度"
    },
    "chooseAuditType": "选择审计类型 →",
    "dismissAriaLabel": "关闭引导式旅程",
    "dismiss": "关闭",
    "next": {
      "whatNext": "接下来您想做什么？",
      "recommendedTag": "推荐",
      "backToDashboard": "返回仪表盘",
      "cta": {
        "agents": {
          "title": "查看推荐的智能体",
          "body": "与您的审计匹配的工具，可在您标记的工作上为您节省时间。"
        },
        "billing": {
          "title": "了解会员方案",
          "body": "套餐、tokens 及所含内容 — 按您自己的节奏采用。"
        },
        "systemBuilder": {
          "title": "打开系统构建器",
          "body": "一份只读指南，帮助您从六个维度设计 AI 系统。"
        }
      }
    },
    "start": {
      "greetingTitle": "您好，我是 Luna — 让我们开始吧。",
      "greetingBody": "选择您希望的开始方式。您可以随时切换，也可以随时直接前往仪表盘。",
      "pendingGreetingDiagnostic": "我们已保存您的诊断。完整审计可将其转化为完整的行动计划。请选择如何继续。",
      "pendingGreetingRoi": "我们已保存您的 ROI 估算。完整审计可将其转化为完整的行动计划。请选择如何继续。",
      "heading": "您想如何开始？",
      "express": {
        "badge": "推荐作为您的首次审计",
        "time": "约 5 分钟",
        "title": "Audit Express",
        "body": "一份快速的、约 5 分钟的 AI 就绪情况概览 — 几个快速问题、可选的网站分析以及指示性 ROI。最适合初步了解。",
        "cta": "开始 Audit Express →"
      },
      "full": {
        "time": "约 15 分钟",
        "title": "新建审计（完整）",
        "body": "完整的结构化问卷 — 更深入的合规性 + 成熟度评分，可转化为可共享的报告。最适合全面评估。",
        "cta": "创建新建审计 →"
      },
      "skip": "跳过 — 直接前往我的仪表盘"
    }
  },
  auth: {
    "login": {
      "title": "登录",
      "subtitle": "欢迎回到 AiLunaPro",
      "forgotPassword": "忘记密码？",
      "signingIn": "正在登录…",
      "signInButton": "登录",
      "noAccountPrompt": "还没有账户？",
      "signUpLink": "注册"
    },
    "field": {
      "emailAddress": "邮箱地址",
      "password": "密码",
      "fullName": "全名",
      "workEmail": "工作邮箱"
    },
    "placeholder": {
      "email": "you@company.com",
      "fullName": "Sophie Martin"
    },
    "signup": {
      "title": "创建您的账户",
      "subtitle": "开启您的 AI 合规之旅",
      "passwordHint": "至少 8 个字符",
      "creatingAccount": "正在创建账户…",
      "createAccountButton": "创建账户",
      "haveAccountPrompt": "已有账户？",
      "signInLink": "登录"
    },
    "forgot": {
      "title": "重置密码",
      "subtitleSent": "请查收您收件箱中的重置链接。",
      "subtitle": "输入您的邮箱，我们将向您发送一个重置链接。",
      "sentDetail": "如果没有收到，请检查您的垃圾邮件文件夹。",
      "backToSignIn": "← 返回登录",
      "sending": "正在发送…",
      "sendResetLink": "发送重置链接",
      "rememberPrompt": "想起密码了？",
      "signInLink": "登录"
    },
    "invite": {
      "titleParsing": "正在读取邀请…",
      "titleAuthRequired": "登录以接受",
      "titleVerifying": "正在验证邀请…",
      "titleAccepting": "正在将您加入工作区…",
      "titleDone": "欢迎加入团队！",
      "titleError": "邀请出现问题",
      "authRequiredBody": "登录或创建账户以接受此邀请。",
      "redirecting": "正在跳转…",
      "pleaseWait": "请稍候片刻。",
      "createAccountButton": "创建账户",
      "signInButton": "登录",
      "backToDashboard": "返回仪表盘"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
  help: {
    "header": {
      "title": "帮助中心",
      "subtitle": "查找答案、了解工作流程并排查常见问题。",
      "onThisPage": "本页内容",
      "tocAria": "帮助章节",
      "keyTakeaways": "要点",
      "needMoreHelpTitle": "需要更多帮助？",
      "needMoreHelpBody": "请联系您的工作区所有者或 AiLunaPro 支持团队。"
    },
    "gettingStarted": {
      "title": "快速入门",
      "lede": "AiLunaPro 是一套面向采用 AI 的组织的合规与 AI 转型套件——在一个工作区中集成审计、AI 注册表、智能体推荐、ROI 估算以及基于令牌的用量模型。",
      "take1": "从仪表盘开始，然后在侧边栏运行**新建审计**。",
      "take2": "两个无需登录的公开工具：快速诊断和 ROI 计算器。",
      "take3": "所有者和管理员可通过 7 天有效期的链接邀请团队成员。",
      "firstActionsTitle": "您的前三个操作",
      "fa1": "打开仪表盘，查看您当前的 AI 成熟度评分。",
      "fa2": "在侧边栏运行**新建审计**，记录您的 AI 使用情况和风险。",
      "fa3": "浏览智能体目录，了解哪些 AiLunaPro 智能体适合您的工作流程。",
      "leadMagnetsTitle": "公开引流工具",
      "lm1": "快速诊断——一份免费的 8 题 AI 成熟度评估，无需账户。",
      "lm2": "ROI 计算器——估算您的团队使用 AiLunaPro 智能体可节省的时间和成本。",
      "publicLinks": "您可以在 `#/diagnostic` 和 `#/roi-calculator` 找到这两个工具。可将这些链接分享给同事——它们无需登录。",
      "inviteTitle": "邀请团队成员",
      "inviteBody": "所有者和管理员可从侧边栏的**团队页面**邀请团队成员。每位受邀者会收到一个有效期为 7 天的链接。角色在邀请时分配。",
      "flowTitle": "流程如何运转",
      "flowStep1": "新建审计",
      "flowStep2": "提交审计",
      "flowStep3": "审计已保存 + 评分",
      "flowStep4": "生成报告",
      "flowStep5": "报告列表",
      "flowCaption": "从审计到可共享的报告快照"
    },
    "auditVsReport": {
      "title": "审计与报告的区别",
      "inShortTitle": "简而言之",
      "inShort1": "**审计**记录您的回答并计算评分。",
      "inShort2": "**报告**是审计的**快照**，是为共享或存档而主动创建的。",
      "calloutSubmit": "**提交即保存您的审计 + 评分。** **报告**是一份快照，仅在您点击**生成报告**时创建。",
      "whatIsAuditTitle": "什么是审计？",
      "wa1": "您对结构化问题的回答。",
      "wa2": "您的合规 / 成熟度评分。",
      "wa3": "一项可随评分规则演变的动态分析。",
      "calloutEditable": "在生成报告之前，审计始终可编辑。",
      "whatIsReportTitle": "什么是报告？",
      "wr1": "特定时间点上冻结的快照。",
      "wr2": "仅在点击**生成报告**时创建。",
      "wr3": "即使您之后运行新的审计，它也保持稳定。可导出和共享，列于当前工作区的**报告**下。",
      "flowStep1": "提交审计",
      "flowStep2": "审计已保存",
      "flowStep3": "生成报告？",
      "flowStep4": "报告快照",
      "flowStep5": "报告列表",
      "flowCaption": "报告仅在生成报告时创建",
      "calloutFlow": "**提交审计** → 保存审计 + 评分。**生成报告** → 创建一份在*报告*中可见的快照。",
      "closing": "侧边栏提供**审计历史**视图（区别于报告）。*即将推出：* 提交时可选自动生成报告。"
    },
    "reportsWorkspaces": {
      "title": "报告与工作区",
      "p1": "报告是**按工作区**划分的，而非全局共享。报告列表仅显示**当前**工作区的报告。",
      "flowStep1": "工作区 A → 其报告",
      "flowStep2": "工作区 B → 其报告",
      "flowCaption": "每个工作区保留各自的报告",
      "calloutWarn": "找不到旧报告？它很可能属于**另一个工作区**。请通过侧边栏顶部的选择器切换工作区。",
      "calloutNote": "仪表盘的日期筛选器**不会**影响报告列表。"
    },
    "fillingAudit": {
      "title": "如何正确填写审计",
      "p1": "良好的输入造就可信的审计。请花一分钟如实作答——结果会反映您所填写的内容。",
      "calloutInfo": "**“描述……”**自由文本字段用于补充背景。您的**评分来自结构化（选择题）问题**，而非自由文本。请使用清晰、真实、可读的信息，以生成可信的报告。",
      "li1": "回答每一道结构化问题——它们决定评分和分析结果。",
      "li2": "在自由文本字段中填写真实背景（负责人、工具、流程），而非占位文字。",
      "li3": "随着您的实践不断演进，重新运行审计以跟踪进展。"
    },
    "agents": {
      "title": "AI 智能体",
      "lede": "智能体目录列出了十个可直接使用的 AI 智能体，适用于常见业务工作流程。每张卡片展示描述、预期 ROI、推荐的最低套餐以及一个上手链接。",
      "take1": "十个自有智能体，均标记为 AiLunaPro。",
      "take2": "套餐徽章（Starter+ / Professional+ / Enterprise+）提示典型适用层级。",
      "take3": "“获取此智能体”将启动标准注册流程——暂不支持应用内购买。",
      "catalogTitle": "目录（10 个智能体）",
      "cat1": "自动化客户回复，减轻支持工作量。",
      "cat2": "甄别潜在客户并准备商务跟进。",
      "cat3": "协助处理发票、报价和催收。",
      "cat4": "协助 HR 团队进行筛选、摘要和文档编制。",
      "cat5": "帮助构建 AI 合规、风险和注册表。",
      "cat6": "生成内容、营销活动和营销创意。",
      "cat7": "创建摘要、仪表盘和决策报告。",
      "cat8": "支持 AI 审计、成熟度评估和行动计划。",
      "cat9": "对文档进行分类、摘要和信息提取。",
      "cat10": "自动化日常行政工作。",
      "sourceBadgeTitle": "来源徽章",
      "sourceBadgeBody": "自有智能体会被标记为 **AiLunaPro**。未来版本将呈现外部替代方案，并附带各自的徽章。",
      "planBadgeTitle": "套餐徽章",
      "planBadgeBody": "每张卡片显示一个最低套餐徽章（Starter+、Professional+、Enterprise+）。它指明典型用量下推荐的订阅层级。",
      "getAgentTitle": "获取此智能体",
      "getAgentBody": "点击“获取此智能体”按钮即可开始上手引导。目前尚无法在 AiLunaPro 内直接购买智能体——该链接将引导您完成标准注册流程。"
    },
    "tokens": {
      "title": "令牌",
      "intro": "令牌是 AiLunaPro 内 AI 消耗的计量单位。每次审计、推荐或智能体调用都会消耗您工作区每月配额中的令牌。",
      "howTitle": "令牌如何运作",
      "how1": "您的订阅包含与套餐相匹配的每月令牌配额。",
      "how2": "每个周期，您的余额都会刷新。少量结余（上限为一个月配额）会顺延，以免浪费未用完的令牌。",
      "how3": "如果余额不足，您可随时购买充值包。",
      "how4": "充值令牌会计入您的余额，且永不过期。",
      "how5": "充值是对订阅的补充——而非替代订阅。",
      "packsTitle": "充值包",
      "packsBody": "提供三种充值包：Starter（+5,000 tokens）、Pro（+25,000 tokens）、Max（+100,000 tokens）。令牌包目前以 USD 计费。",
      "balanceTitle": "在哪里查看余额",
      "balanceBody": "顶栏的令牌徽章会显示您当前的余额和每月配额。点击它即可打开令牌页面，查看完整的用量历史并购买充值包。",
      "runOutTitle": "令牌用尽时",
      "runOutBody": "当 AI 操作所需令牌超过余额时，会显示清晰的“令牌不足”提示及购买充值包的链接。所有者、管理员和账单管理员可购买充值包。成员可查看余额但无法购买。"
    },
    "billing": {
      "title": "账单",
      "lede": "AiLunaPro 提供 Free、Starter、Professional 和 Enterprise 套餐，区别在于令牌配额、审计量和团队功能。结账和管理通过 Stripe 进行。",
      "take1": "账单和令牌包以 USD 计价；货币选择器目前仅用于显示。",
      "take2": "所有者/管理员可在账单页面（Stripe 客户门户）订阅和管理套餐。",
      "take3": "Free 套餐包含有限的审计量和每月 100 个令牌。",
      "currencyTitle": "货币",
      "currencyBody": "账单和令牌包目前以 USD 计价。侧边栏的货币选择器仅为显示偏好。它暂不更改 Stripe 结账货币或令牌包定价。多币种计费计划在未来版本中推出。",
      "subscribingTitle": "订阅",
      "subscribingBody": "在账单页面，所有者和管理员可选择套餐并通过 Stripe 完成结账。付款成功后订阅立即生效，您的令牌配额会自动更新。",
      "manageTitle": "管理您的订阅",
      "manageBody": "“管理订阅”按钮会打开 Stripe 客户门户，您可在此更新付款方式、更改套餐、查看发票或取消订阅。取消将在当前周期结束时生效。",
      "invoicesTitle": "发票",
      "invoicesBody": "每次续订后，发票会出现在账单页面。点击查看或 PDF 即可下载副本。",
      "freeTitle": "Free 套餐",
      "freeBody": "Free 套餐提供有限的审计访问权限和每月 100 个令牌。可用它在订阅前体验产品。"
    },
    "diagnostic": {
      "title": "快速诊断",
      "intro": "快速诊断是一份免费的 8 题评估，为您提供 0 到 100 的 AI 成熟度评分，并附上一份简短的 AiLunaPro 推荐智能体清单。",
      "accessTitle": "在哪里访问",
      "accessBody": "在浏览器中打开 `#/diagnostic`。无需登录。约需两分钟。您可以将链接分享给同事。",
      "getTitle": "您将获得",
      "get1": "0 到 100 的标准化评分。",
      "get2": "一个成熟度等级：起步、发展或领先。",
      "get3": "三个契合您所处阶段的推荐智能体。",
      "get4": "一个用于创建免费 AiLunaPro 账户的直接链接。",
      "privacyTitle": "隐私",
      "privacyBody": "提交的回答和您的电子邮箱仅用于生成您的诊断结果，以及就相关 AI 服务进行跟进。您可随时申请删除。"
    },
    "roiCalculator": {
      "title": "ROI 计算器",
      "intro": "ROI 计算器估算您的团队在特定工作流程中采用 AiLunaPro AI 智能体可节省的时间和成本。",
      "accessTitle": "在哪里访问",
      "accessBody": "在浏览器中打开 `#/roi-calculator`。无需登录。约需一分钟。",
      "inputsTitle": "输入项",
      "in1": "团队规模（1 至 10,000）。",
      "in2": "您的团队每月花在重复性工作上的小时数。",
      "in3": "平均每小时成本（USD，默认为 50）。",
      "in4": "目标工作流程（九选一：客服、销售、财务、文档、报告、行政、合规、营销、人力资源）。",
      "outputsTitle": "输出项",
      "out1": "预计每月节省成本（USD）。",
      "out2": "预计每年节省成本（USD）。",
      "out3": "预计每月节省时间（小时）。",
      "out4": "预计回本周期（月）。",
      "out5": "针对所选工作流程推荐的两个 AiLunaPro 智能体。",
      "aboutTitle": "关于该估算",
      "aboutBody": "结果基于您提供的信息和保守的自动化假设。实际节省可能有所不同。在智能体定价确定之前，回本计算采用 $99/month 的占位智能体成本。"
    },
    "team": {
      "title": "团队与角色",
      "intro": "AiLunaPro 为每个工作区支持五种角色。每种角色都有特定的权限范围：",
      "thRole": "角色",
      "thManageWorkspace": "管理工作区",
      "thManageBilling": "管理账单",
      "thRunAudits": "运行审计",
      "thViewReports": "查看报告",
      "limited": "受限",
      "inviteTitle": "邀请团队成员",
      "inviteBody": "所有者和管理员打开团队页面，点击邀请，输入电子邮箱地址并选择角色。受邀者会收到一个有效期为 7 天的链接。如果链接过期或丢失，所有者和管理员可重新生成。",
      "rolesTitle": "更改角色",
      "rolesBody": "所有者和管理员可在团队页面更改团队成员的角色。成员可被临时停用（无访问权限）并在之后重新启用，或从工作区中移除。"
    },
    "settings": {
      "title": "设置",
      "lede": "管理您的个人资料、组织、外观和通知偏好。语言和货币选择器目前仅为显示偏好。",
      "take1": "个人资料与组织详情位于设置之下。",
      "take2": "主题（浅色/深色）在多个会话间保持。",
      "take3": "在相关功能上线之前，语言和货币仅用于显示。",
      "profileTitle": "个人资料",
      "profileBody": "可在**设置 → 个人资料**中更新您的显示名称和电子邮箱地址。",
      "orgTitle": "组织",
      "orgBody": "所有者可在**设置 → 组织**中重命名组织。",
      "themeTitle": "主题",
      "themeBody": "可在**设置 → 偏好设置**中切换浅色和深色模式。您的选择会在多个会话间保持。",
      "languageTitle": "语言",
      "languageBody": "侧边栏和设置中的语言选择器仅为偏好设置。应用目前以英语显示。完整的多语言支持计划在未来版本中推出。",
      "currencyTitle": "货币",
      "currencyBody": "侧边栏和设置中的货币选择器仅为显示偏好。在实现多币种计费之前，账单和令牌包定价仍以 USD 计价。",
      "emailTitle": "电子邮件通知",
      "emailBody": "选择您希望接收哪些邮件：每周合规摘要、报告就绪通知以及团队动态。**设置 → 偏好设置 → 电子邮件通知**。"
    },
    "analytics": {
      "title": "分析与 Cookie（可选）",
      "intro": "AiLunaPro 使用可选的、注重隐私的产品分析，帮助我们提升可靠性并更快修复问题。它完全可选，在您允许之前一直处于关闭状态。",
      "offByDefault": "**默认关闭**——在您选择**允许**之前不会收集任何数据。",
      "collectedTitle": "收集哪些内容",
      "chipNoPersonal": "无个人数据",
      "chipNoRecording": "无会话录制",
      "chipNoAds": "无广告追踪",
      "collectedBody": "仅收集匿名的使用信号，例如页面浏览和可靠性事件。",
      "optTitle": "随时选择启用或停用",
      "opt1": "首次访问时，在小横幅中选择允许或不用了。",
      "opt2": "您的选择会保存在此设备上——横幅不会再次询问。",
      "opt3": "若要更改，请清除本站点的浏览器存储（站点数据）并重新加载。",
      "dntTitle": "请勿追踪",
      "dntBody": "如果您的浏览器发送“请勿追踪”信号，分析将自动保持关闭，且不会显示横幅。",
      "blockedTitle": "如果分析被拦截",
      "blockedBody": "某些浏览器、扩展程序或网络会拦截分析请求。这完全没有问题——无论哪种情况，应用都能正常运行，无需任何操作。"
    },
    "troubleshooting": {
      "title": "故障排查",
      "lede": "针对最常见问题的快速修复方法。大多数问题刷新即可解决；若不行，您的工作区所有者或 AiLunaPro 支持团队可提供帮助。",
      "take1": "先刷新——它能解决大多数加载、余额和会话方面的小问题。",
      "take2": "付款成功后，令牌额度会在几秒内到账。",
      "take3": "空白屏幕通常是由浏览器扩展程序或网络过滤器引起的。",
      "loadTitle": "页面无法加载",
      "loadBody": "服务可能暂时不可用。请刷新页面。如果问题持续，请联系您的工作区所有者或 AiLunaPro 支持团队。",
      "signedOutTitle": "意外退出登录",
      "signedOutBody": "您的会话可能已过期。请重新登录。如果您反复被退出登录，请联系您的工作区所有者。",
      "balanceTitle": "令牌余额显示有误",
      "balanceBody": "请先刷新页面。如果刷新后余额仍然显示有误，请联系您的工作区所有者或 AiLunaPro 支持团队。",
      "balanceCheckoutTitle": "结账后令牌余额未更新",
      "balanceCheckoutBody": "请稍候片刻并刷新页面。付款成功后，令牌额度会在几秒内到账。如果余额仍未更新，请联系您的工作区所有者或 AiLunaPro 支持团队。",
      "captchaTitle": "公开表单上的验证码反复失败",
      "captchaBody": "请重新加载页面并再次完成验证码。如果问题持续，请尝试其他浏览器或联系 AiLunaPro 支持团队。",
      "syncTitle": "订阅同步失败",
      "syncBody": "在账单成功页面，点击重试同步。如果失败持续，请联系 AiLunaPro 支持团队并附上您的 Stripe 收据。",
      "inviteTitle": "邀请链接无法使用",
      "inviteBody": "邀请会在 7 天后过期。请让您的工作区所有者或管理员从团队页面重新生成邀请。",
      "roadmapTitle": "路线图与行动计划有何区别？",
      "roadmapBody": "这两个视图都源自相同的审计分析结果和推荐，但它们回答不同的问题。**路线图**回答**何时**交付工作——条目按时间范围（30 / 60 / 90 天）分组，以助力规划和产能安排。**优先级行动计划**回答**应先修复什么**——条目根据对现有分析严重程度和推荐影响所采用的固定确定性规则，按优先级（关键 / 重要 / 改进）分组。它们相互补充，并非重复。两个视图都不会改变评分，且均非合规认证。",
      "blankTitle": "空白屏幕、“糟糕”提示或布局错乱？",
      "blankBody": "这几乎总是由浏览器的**广告拦截器或隐私扩展程序**（或企业/VPN/DNS 过滤器）拦截了应用的脚本、样式或数据请求所致——您可能会在控制台中看到 **ERR_BLOCKED_BY_CLIENT**。修复方法是在您的拦截器中允许 **audit.ailunapro.com** 和 ***.googleapis.com**，或在没有扩展程序的干净浏览器配置文件中打开应用，然后重新加载。",
      "emailTitle": "没收到验证邮件或密码重置邮件？",
      "emailBody": "验证邮件和密码重置邮件由 Firebase 从您项目配置的 no-reply 地址发送（在自定义发件人域名验证之前，默认使用 Firebase 发件人）。请先检查您的**垃圾邮件 / 推广**文件夹。您可以从**设置 → 个人资料**重新发送验证邮件，或从**忘记密码**页面申请新的重置链接。验证后，请退出并重新登录，以便您的账户反映已验证状态。（团队邀请是单独的，通过 AiLunaPro 的电子邮件提供商发送。）"
    },
    "faq": {
      "title": "常见问题",
      "q1": "为什么我看不到我的旧报告？",
      "a1": "报告是**按工作区**划分的。较旧的报告很可能属于另一个工作区——请通过侧边栏顶部的选择器切换工作区。仪表盘的日期筛选器不会影响报告列表。",
      "q2": "为什么报告是空的？",
      "a2": "仅提交审计不会创建报告。请打开一份已提交的审计并点击**生成报告**以创建快照——它随后会出现在报告下。",
      "q3": "随意输入的文字会影响我的评分吗？",
      "a3": "不会。评分来自结构化（选择题）问题。自由文本的“描述……”字段仅补充背景——但清晰、真实的输入会让您的报告更可信。",
      "q4": "什么会被保存，何时保存？",
      "a4": "**提交审计**会保存您的回答 + 评分。**生成报告**会创建一份独立的、可共享的快照。请参阅上文“审计与报告的区别”。",
      "q5": "我的数据安全吗？",
      "a5": "AiLunaPro 采用身份验证访问、基于角色的权限、Firestore 安全规则，以及对敏感操作的服务端写入。令牌数量、账单操作和团队变更均由服务器验证。",
      "q6": "我可以删除我的数据吗？",
      "a6": "可以。请联系您的工作区所有者或 AiLunaPro 支持团队，申请删除您的账户或工作区数据。",
      "q7": "为什么令牌包以 USD 计价？",
      "a7": "AiLunaPro 正在分阶段推出多币种支持。订阅已通过 Stripe 支持多种货币。令牌包将在未来版本中支持多币种。",
      "q8": "货币选择器有什么作用？",
      "a8": "它仅为显示偏好。它暂不更改 Stripe 结账货币或令牌包定价。",
      "q9": "语言选择器有什么作用？",
      "a9": "它会保存您的首选语言。完整的界面翻译正在进行中，将在未来版本中推出。",
      "q10": "我该如何联系支持团队？",
      "a10": "如有账户、账单或技术问题，请先联系您的工作区所有者。如有需要我们协助的问题，请直接联系 AiLunaPro 支持团队。",
      "q11": "现在可以在 AiLunaPro 内购买智能体吗？",
      "a11": "暂时不行。智能体目录列出了推荐的 AI 智能体。选择“获取此智能体”会引导您完成标准上手流程。应用内直接购买计划在后续阶段推出。",
      "q12": "ROI 估算有保证吗？",
      "a12": "没有。ROI 计算器基于您提供的信息给出保守的估算。实际节省取决于您的工作流程、集成质量和采用程度。"
    }
  },
  registry: {
    "page": {
      "title": "AI 注册表",
      "subtitle": "追踪贵组织使用的每一个 AI 工具——用途、数据、监督与缓解措施。注册表为您的审计与报告提供数据来源。",
      "designGuideLink": "正在设计一个新系统？打开设计指南 →",
      "addTool": "+ 添加工具",
      "loading": "正在加载注册表…",
      "error": "加载注册表失败。刷新以重试。"
    },
    "summary": {
      "totalTools": "工具总数",
      "approved": "已批准",
      "pendingReview": "待审查",
      "highRisk": "高风险"
    },
    "filters": {
      "searchPlaceholder": "搜索工具、用途、备注…",
      "allDepartments": "所有部门",
      "allRisks": "所有风险等级",
      "allApproval": "所有审批状态",
      "clear": "清除筛选",
      "risk": {
        "low": "低",
        "medium": "中",
        "high": "高",
        "critical": "严重"
      }
    },
    "table": {
      "tool": "工具",
      "department": "部门",
      "risk": "风险",
      "approval": "审批",
      "oversight": "监督",
      "reviewDate": "审查日期"
    },
    "empty": {
      "noItems": {
        "title": "注册表中尚无 AI 工具",
        "body": "追踪贵组织使用的每一个 AI 工具——用途、数据、监督与缓解措施。注册表为您的审计与报告提供数据来源。",
        "action": "+ 添加您的第一个工具"
      },
      "noMatches": {
        "title": "没有工具符合这些筛选条件",
        "body": "尝试放宽筛选条件，或清除筛选以查看完整注册表。",
        "action": "清除筛选"
      }
    },
    "modal": {
      "titleAdd": "添加 AI 工具",
      "titleEdit": "编辑 AI 工具",
      "subtitleAdd": "追踪您团队使用的 AI 工具。所有字段均可稍后编辑。",
      "subtitleEdit": "更新您团队对此工具的了解。更改会立即保存到本地注册表。",
      "fields": {
        "toolName": "工具名称",
        "purpose": "用途",
        "dataTypes": "处理的数据类型",
        "mitigations": "缓解措施",
        "notes": "备注",
        "department": "部门",
        "approvalStatus": "审批状态",
        "riskLevel": "风险等级",
        "humanOversight": "人工监督",
        "nextReviewDate": "下次审查日期"
      },
      "placeholders": {
        "toolName": "例如：客户支持副驾驶",
        "purpose": "此工具的作用是什么？",
        "mitigation": "添加一项缓解措施并按回车",
        "notes": "供应商、数据驻留地、负责人，任何值得记录的内容…"
      },
      "riskOptions": {
        "low": "低",
        "medium": "中",
        "high": "高",
        "critical": "严重"
      },
      "reviewDateHint": "如未安排审查，请留空。",
      "auditTrail": "创建于 {createdDate} · 最后更新于 {updatedDate}",
      "removeMitigationAria": "移除缓解措施 {index}",
      "requiredError": "必填",
      "deleteConfirm": "将“{toolName}”从注册表中移除？此操作无法撤销。",
      "buttons": {
        "delete": "删除工具",
        "cancel": "取消",
        "addToRegistry": "添加到注册表",
        "saveChanges": "保存更改"
      }
    }
  },
  systemBuilder: {
    "chrome": {
      "pageTitle": "AI 系统构建器",
      "pageIntro": "一份部署前的设计指南。逐一审视六个维度——用途与风险、数据、模型、监督、监测、文档——以负责任的方式设计 AI 系统。您的步骤进度与清单勾选仅保存在本设备上。",
      "designSteps": "设计步骤",
      "checklist": "清单",
      "doneSuffix": "· 已完成 {doneCount}/{total}",
      "keyQuestions": "关键问题",
      "references": "参考资料（仅供参考，不构成法律意见）",
      "previousStep": "← 上一步",
      "nextStep": "下一步 →",
      "stepOf": "第 {n} 步，共 {total} 步",
      "endOfGuide": "✓ 指南结束——六个维度已全部涵盖"
    },
    "steps": {
      "purpose": {
        "title": "1. 用途与风险分类",
        "intro": "在构建任何东西之前，先明确系统的用途、它影响哪些人，以及它的风险有多高。这将为后续的每一项决策奠定基础。",
        "checklist": {
          "c1": "用一句话写明预期用途（不使用行话）。",
          "c2": "列出受影响的个人或群体（用户、客户、第三方）。",
          "c3": "对风险等级进行分类：不可接受 / 高风险（Annex III）/ 有限 / 极低——或 GPAI。",
          "c4": "记录用例范围及其边界（哪些内容不在范围内）。",
          "c5": "列出可预见的滥用 / 越界使用，以及您将拒绝执行的事项。"
        },
        "questions": {
          "q1": "谁有权部署或暂停此系统？",
          "q2": "如果系统出错，具体会发生什么？",
          "q3": "哪些合法权利、安全条件或自由可能受到影响？"
        }
      },
      "data": {
        "title": "2. 数据治理",
        "intro": "如果数据有误，系统就会出错。盘点数据、对其分类、说明持有理由，并警惕偏见。",
        "checklist": {
          "c1": "建立数据清单：来源、负责人、敏感度、保留期限。",
          "c2": "为处理的每一类数据确立合法依据（GDPR Art. 6）。",
          "c3": "记录数据质量：相关性、代表性、缺口、已知偏见。",
          "c4": "践行数据最小化：仅收集所需数据；仅在必要时间内保留。",
          "c5": "规划定期偏见审查及纠正措施路径。"
        },
        "questions": {
          "q1": "每个数据集来自何处，由谁负责？",
          "q2": "数据集是否包含敏感类别（Art. 9 GDPR）？依据是什么？",
          "q3": "您将测量哪些偏见信号，以何种基线作为对照？"
        }
      },
      "model": {
        "title": "3. 模型选择与验证",
        "intro": "选择能胜任的最小模型。以攻击者和用户实际使用的方式验证它。记录它无法做到的事情。",
        "checklist": {
          "c1": "针对实际用例，论证所选模型规模 / 系列的合理性。",
          "c2": "定义准确性 + 鲁棒性目标，以及您将如何测量它们。",
          "c3": "开展对抗 / 红队测试（提示注入、越狱、带偏见的输出）。",
          "c4": "记录已知的失效模式与明确的禁用情形。",
          "c5": "为每个模型工件标注版本，并在部署时附带变更说明。"
        },
        "questions": {
          "q1": "为何选择此模型，您排除了哪个更便宜的替代方案？",
          "q2": "系统出错时是什么样子——您又如何知晓？",
          "q3": "您的测试集是否能代表生产环境的流量？"
        }
      },
      "oversight": {
        "title": "4. 人工监督",
        "intro": "决定人类如何对重大结果保持掌控。确保这些控制措施在高压下真正有效。",
        "checklist": {
          "c1": "按决策类型选择监督模式：人在环内、人在环上或人在环外。",
          "c2": "为高风险决策指定审查人员并记录 SLA。",
          "c3": "提供审查人员可使用的覆盖 / 暂停 / 紧急停止控制。",
          "c4": "编写升级处置手册（通知谁、附带何种背景信息）。",
          "c5": "记录每一次覆盖 / 暂停，以供事后审查。"
        },
        "questions": {
          "q1": "谁审查高风险输出——他们是否有时间和背景信息来完成审查？",
          "q2": "单个操作员能否无需开会即可停止系统？",
          "q3": "您如何避免走过场式批准（“自动化自满”）？"
        }
      },
      "monitoring": {
        "title": "5. 监测与事件",
        "intro": "部署后的监测并非可选项。漂移是无声的，事件则不然。",
        "checklist": {
          "c1": "定义部署后的监测指标（准确性、延迟、危害、漂移）。",
          "c2": "对输入和输出实施漂移检测。",
          "c3": "将事件记录到单一队列，标注严重程度和负责人。",
          "c4": "记录报告路径（监管机构、客户、内部）。",
          "c5": "安排定期重新评估（至少每季度一次）。"
        },
        "questions": {
          "q1": "哪一个指标一旦变动，就提示您应暂停系统？",
          "q2": "凌晨三点谁会被通知，他们应打开哪份处置手册？",
          "q3": "您上次演练 AI 事件场景是在什么时候？"
        }
      },
      "docs": {
        "title": "6. 文档与透明度",
        "intro": "写明系统是什么、不是什么，以及用户需要知道什么。每次实质性变更后都要更新。",
        "checklist": {
          "c1": "按 Art. 11 维护技术文档（用途、数据、训练、评估、风险）。",
          "c2": "为每个系统发布模型 / 系统说明卡；每次发布时更新。",
          "c3": "在每个面向客户的界面上添加面向用户的 AI 披露说明。",
          "c4": "更新隐私声明以反映 AI 处理活动。",
          "c5": "为操作该系统的员工保留培训记录。"
        },
        "questions": {
          "q1": "最终用户需要了解什么才能负责任地使用此系统？",
          "q2": "外部审计员在第一天会需要哪些资料？",
          "q3": "模型 / 系统说明卡目前的更新程度如何？"
        }
      }
    }
  },
  reportsPages: {
    "list": {
      "title": "报告",
      "intro": "生成的报告是审计在某一时间点的快照。每份报告均可导出、共享，并在您开始新的审计时保持稳定不变。",
      "generateFromDraft": "+ 从当前草稿生成",
      "startNewAudit": "开始新的审计",
      "loading": "正在加载报告…",
      "errorMessage": "尚未加载任何报告。如果工作区是新建的，或 Firestore 无法访问，可能会出现这种情况。",
      "retry": "重试",
      "traceabilityHint": "报告是保存到您工作区的时间点快照。详情视图会根据每份报告的答案快照重新计算完整结果——因此即使评分规则发生演变，历史报告仍保持准确。"
    },
    "detail": {
      "loading": "正在加载报告…",
      "notFoundTitle": "未找到报告",
      "notFoundBody": "此报告已不存在或已被删除。",
      "backToReports": "← 返回报告",
      "rename": {
        "titleAriaLabel": "报告标题",
        "saving": "…",
        "saveTitle": "保存标题",
        "cancel": "取消",
        "renameButton": "重命名"
      },
      "download": {
        "preparing": "正在准备…",
        "downloadPdf": "⬇ 下载 PDF"
      },
      "errors": {
        "tokensInsufficientExport": "令牌不足，无法导出。请购买令牌以继续。",
        "downloadFailed": "下载失败。请重试。",
        "renameForbidden": "只有所有者或管理员才能重命名报告。",
        "renameFailed": "无法重命名。请重试。",
        "tokensInsufficient": "令牌不足。请购买令牌以继续。",
        "shareDisabled": "此报告的共享功能已禁用。",
        "shareForbidden": "只有所有者或管理员才能共享报告。",
        "shareCreateFailed": "无法创建共享链接。请重试。",
        "revokeFailed": "无法撤销链接。请重试。",
        "toggleSharingFailed": "无法更新共享设置。请重试。"
      },
      "share": {
        "heading": "可共享链接",
        "description": "指向此报告 PDF 的已签名免登录链接。创建或重新生成会计入您的 PDF 导出次数。",
        "working": "处理中…",
        "generateNewLink": "生成新链接",
        "revoke": "撤销",
        "shareLink": "共享链接",
        "enableSharing": "启用共享",
        "disableSharing": "禁用共享",
        "copied": "已复制",
        "copy": "复制",
        "expires": "于 {date} 过期。",
        "activeLinkExists": "已存在有效链接（于 {date} 过期）。生成新链接可再次查看 URL——这将撤销旧链接。",
        "disabledNotice": "共享已禁用——现有链接已不再有效。",
        "useTokensAndCreateLink": "使用令牌并创建链接"
      },
      "status": {
        "notShared": "未共享",
        "active": "有效",
        "expired": "已过期",
        "revoked": "已撤销",
        "disabled": "已禁用"
      },
      "footer": {
        "openAssistancePlan": "打开协助计划",
        "deleteReport": "删除报告",
        "deleteConfirm": "删除此报告？此操作无法撤销。"
      },
      "metadata": {
        "heading": "元数据",
        "reportId": "报告 ID",
        "sourceDraft": "源草稿",
        "status": "状态",
        "weakestSection": "最薄弱的部分",
        "frameworks": "框架"
      }
    },
    "share": {
      "unavailableTitle": "共享报告不可用",
      "backToReports": "← 返回报告",
      "copySuccess": "共享链接已复制。",
      "copyFailure": "无法复制链接。请重试。",
      "banner": {
        "label": "🔗 共享报告 — 只读视图",
        "description": "面向您工作区中成员的只读视图，通过应用内共享链接打开。内部操作按钮已隐藏。",
        "copyShareLink": "🔗 复制共享链接",
        "backToInternalView": "← 返回内部视图"
      },
      "topline": {
        "kicker": "AI 合规报告",
        "score": "评分",
        "scoreOutOf": "/100",
        "generated": "生成于 {date}"
      },
      "poweredBy": "由 AiLunaPro 提供支持 · Compliance Suite"
    }
  },
  savedAudits: {
    "list": {
      "title": "已保存的 Audit Express",
      "subtitle": "您保存的 Audit Express 快照。下载 PDF 或删除已保存的结果。",
      "runAuditExpress": "运行 Audit Express",
      "loading": "正在加载…",
      "empty": {
        "prefix": "尚无已保存的审计。使用",
        "runLink": "运行 Audit Express",
        "suffix": "来创建一个。"
      },
      "meta": {
        "engineLabel": "引擎",
        "engineFallback": "不适用",
        "confidenceLabel": "置信度"
      }
    },
    "actions": {
      "view": "查看",
      "rename": "重命名",
      "delete": "删除",
      "download": "下载 PDF",
      "save": "保存",
      "cancel": "取消",
      "busy": "…"
    },
    "fields": {
      "titleAriaLabel": "审计标题",
      "viewDetailsTooltip": "查看详情"
    },
    "errors": {
      "load": "无法加载您已保存的审计。请重试。",
      "tokensInsufficient": "令牌不足，无法导出。请购买令牌以继续。",
      "download": "下载失败。请重试。",
      "delete": "删除失败。请重试。",
      "rename": "无法重命名。请重试。"
    },
    "pdfLimitModal": {
      "ariaLabel": "PDF 导出限制",
      "title": "您已用完 {freeCount} 次免费 PDF 导出",
      "body": "下载更多 PDF 需要令牌（每次导出 {tokenCost} 个令牌）。",
      "useTokens": "使用令牌并下载",
      "useTokensBusy": "…",
      "buyTokens": "升级或购买令牌",
      "cancel": "取消"
    },
    "detail": {
      "backToList": "← 已保存的审计",
      "loading": "正在加载…",
      "meta": {
        "engineLabel": "引擎",
        "engineFallback": "不适用",
        "confidenceLabel": "置信度"
      },
      "rename": "重命名",
      "save": "保存",
      "cancel": "取消",
      "titleAriaLabel": "审计标题",
      "busy": "…",
      "notRecomputed": "无法重新计算此审计。",
      "downloadPdf": "下载 PDF",
      "downloadPdfBusy": "正在准备…",
      "backToSaved": "返回已保存的审计"
    },
    "detailErrors": {
      "notFound": "此审计已不存在。",
      "load": "无法加载此审计。请重试。",
      "rename": "无法重命名。请重试。",
      "tokensInsufficient": "令牌不足。请购买令牌以继续。",
      "sharingDisabled": "此审计的共享功能已禁用。",
      "createShareLink": "无法创建共享链接。请重试。",
      "revokeShareLink": "无法撤销链接。请重试。",
      "updateSharing": "无法更新共享设置。请重试。"
    },
    "recommendedAgents": {
      "heading": "推荐的智能体",
      "exploreAll": "探索所有智能体 →",
      "disclaimer": "基于此审计的指示性匹配。采用前请评估适配性。",
      "meta": {
        "hoursSaved": "每月约节省 {hours} 小时",
        "plan": "{plan} 套餐",
        "setup": "{complexity} 配置"
      }
    },
    "share": {
      "heading": "可共享链接",
      "description": "指向此审计 PDF 的已签名免登录链接。创建或重新生成会计入您的 PDF 导出次数。",
      "generateNewLink": "生成新链接",
      "shareLink": "共享链接",
      "working": "处理中…",
      "revoke": "撤销",
      "enableSharing": "启用共享",
      "disableSharing": "禁用共享",
      "copy": "复制",
      "copied": "已复制",
      "expires": "于 {date} 过期。",
      "activeLinkExists": "已存在有效链接（于 {date} 过期）。生成新链接可再次查看 URL——这将撤销旧链接。",
      "disabledNotice": "共享已禁用——现有链接已不再有效。",
      "limitModalActionLabel": "使用令牌并创建链接"
    },
    "shareStatus": {
      "notShared": "未共享",
      "active": "有效",
      "expired": "已过期",
      "revoked": "已撤销",
      "disabled": "已禁用"
    }
  },
  billingPage: {
    "header": {
      "title": "账单",
      "subtitle": "管理您的套餐、用量和发票。",
      "readOnlyBadge": "只读视图。"
    },
    "plans": {
      "bestValueBadge": "超值之选",
      "priceApprox": "约 {approx}{suffix} · 以 USD 计费",
      "cta": {
        "redirecting": "正在跳转…",
        "currentPlan": "当前套餐",
        "freeCurrent": "Free — 当前",
        "startForFree": "免费开始",
        "subscribe": "订阅"
      },
      "free": {
        "description": "以受限权限试用平台。",
        "features": {
          "limitedAuditAccess": "受限的审计访问",
          "basicDashboard": "基础仪表盘",
          "demoReports": "演示报告",
          "communitySupport": "社区支持"
        }
      },
      "starter": {
        "description": "独立运行真实审计。",
        "features": {
          "coreAuditWorkflow": "核心审计工作流",
          "basicComplianceReports": "基础合规报告",
          "starterAuditVolume": "Starter 审计额度",
          "essentialAiRecommendations": "基础 AI 建议",
          "emailSupport": "电子邮件支持"
        }
      },
      "professional": {
        "description": "面向运行进阶审计的成长型团队。",
        "features": {
          "higherAuditVolume": "更高审计额度",
          "advancedReports": "进阶报告",
          "teamCollaboration": "团队协作",
          "priorityAiRecommendations": "优先 AI 建议",
          "prioritySupport": "优先支持"
        }
      },
      "enterprise": {
        "description": "组织级治理与管控。",
        "features": {
          "highestAuditVolume": "最高审计额度",
          "advancedTeamManagement": "进阶团队管理",
          "organizationControls": "组织管控",
          "customBranding": "自定义品牌",
          "dedicatedSupport": "专属支持",
          "enterpriseReadyGovernance": "企业级治理"
        }
      }
    },
    "pricingSection": {
      "currencyBadge": {
        "detected": "已根据您所在地区检测到计费货币：{currency} {symbol}",
        "default": "计费货币：{currency} {symbol}"
      },
      "secureCheckoutBadge": "由 Stripe 提供安全结账",
      "heading": "选择适合您审计工作流的套餐",
      "subheadingPrefix": "在 Stripe 测试模式下开始。不会产生任何真实扣费 — 请使用测试卡",
      "subheadingSuffix": "。"
    },
    "currentPlan": {
      "label": "当前套餐",
      "statusNoSubscription": "无订阅",
      "freePlanNote": "Free 套餐 — 无有效订阅",
      "paidPlanSummary": "${price}/月 · 按{billingCycle}计费",
      "renews": " · 续订于 {date}",
      "cancelsAtPeriodEnd": "⚠ 将在周期结束时取消（{date}）",
      "billedInCurrency": "您的有效订阅以 {currency} 计费。",
      "resumePlan": "恢复套餐",
      "cancelPlan": "取消套餐"
    },
    "billingActions": {
      "title": "账单操作",
      "manageSubscription": "管理订阅",
      "managePaymentMethods": "管理支付方式",
      "loading": "加载中…",
      "paymentMethodsHint": "更新卡片、设为默认、移除 — 均由 Stripe 安全处理。",
      "noCustomerYet": "尚无 Stripe 客户。在您首次订阅或购买令牌后，支付方式即可使用。",
      "portalError": "无法打开 Stripe 门户。请确认 Worker 正在运行。"
    },
    "tokens": {
      "title": "令牌",
      "balance": "本周期 {balance} / {allocation}",
      "balanceLoading": "令牌余额加载中…",
      "manageTokens": "管理令牌"
    },
    "usage": {
      "sectionTitle": "本期用量",
      "auditsLabel": "审计",
      "seatsLabel": "席位",
      "unlimitedValue": "{used} / ∞",
      "boundedValue": "{used} / {limit}",
      "periodRange": "周期：{start} – {end}"
    },
    "invoices": {
      "sectionTitle": "发票",
      "empty": "暂无发票。",
      "loading": "正在加载发票…",
      "emptyAfterFirstCycle": "发票将在您首个计费周期后显示于此。",
      "tableHeaders": {
        "date": "日期",
        "description": "描述",
        "amount": "金额",
        "status": "状态",
        "invoiceNumber": "发票编号",
        "actions": "操作"
      },
      "statusUnknown": "未知",
      "actionView": "查看",
      "actionPdf": "PDF",
      "managedInStripeNote": "支付方式和账单详情均由 Stripe 安全管理。"
    },
    "mockPlans": {
      "sectionTitle": "套餐",
      "currentBadge": "当前",
      "free": "Free",
      "priceSuffix": "/月",
      "switch": "切换",
      "contactOwnerToChange": "联系所有者以更改套餐"
    },
    "mockConfirm": {
      "title": "切换至 {plan}",
      "body": "这是模拟操作 — 不会产生任何真实扣费。",
      "cancel": "取消",
      "confirm": "确认（模拟）"
    },
    "locked": {
      "title": "账单访问受限",
      "subtitle": "请联系您的工作区所有者以查看或管理账单。",
      "backToDashboard": "返回仪表盘",
      "contactWorkspaceOwner": "联系工作区所有者",
      "askOwnerToast": "请向您的工作区所有者申请账单访问权限。"
    },
    "success": {
      "headline": {
        "failed": "同步失败",
        "active": "您的 {plan} 套餐已生效",
        "activating": "感谢您 — 正在激活您的订阅"
      },
      "subtext": {
        "failedFallback": "我们无法自动完成您的订阅。",
        "redirecting": "正在将您跳转至账单页面…",
        "syncing": "我们正在将您的订阅与 Stripe 同步。"
      },
      "pill": {
        "failed": "同步失败",
        "activated": "订阅已激活",
        "syncing": "正在同步订阅…",
        "almostDone": "即将完成…"
      },
      "backToBilling": "返回账单",
      "retrySync": "重试同步",
      "errors": {
        "stillProcessing": "支付仍在处理中。请稍候片刻后重试。",
        "sessionInvalid": "此结账会话已失效。请重新发起订阅。",
        "notSignedIn": "您尚未登录。请登录后重试。",
        "orgLinkFailed": "无法将此订阅关联到您的组织。请联系支持团队。",
        "generic": "激活您的订阅时出现问题。",
        "noSessionDetected": "我们无法检测到您的结账会话。请返回账单页面后重试。"
      }
    }
  },
  tokensPage: {
    "header": {
      "title": "令牌",
      "subtitle": "跟踪用量、监控每月配额，并在需要时购买充值包。"
    },
    "locked": {
      "title": "令牌不可用",
      "clientMessage": "客户端账户无法查看令牌。",
      "workspaceMessage": "此工作区无法使用令牌。",
      "backToDashboard": "返回仪表盘"
    },
    "webhook": {
      "notice": "已收到付款。正在等待 Stripe webhook 更新您的令牌余额。",
      "refreshBalance": "刷新余额"
    },
    "balance": {
      "loading": "正在加载余额…",
      "empty": "尚无令牌余额。它将在您首次审计时创建。",
      "statBalance": "余额",
      "statMonthlyAllocation": "每月配额",
      "statConsumed": "已消耗",
      "statRollover": "结转",
      "statTopups": "充值",
      "cycleEnds": "周期结束：{cycleEnd}",
      "lastReset": "上次重置：{lastReset}"
    },
    "packs": {
      "sectionTitle": "购买更多令牌",
      "sectionNote": "令牌包目前以 USD 计费。充值令牌永不过期。",
      "readOnlyNotice": "您可以查看令牌，但只有所有者、管理员和账单管理员才能购买充值包。",
      "starterLabel": "Starter",
      "starterBlurb": "为额度偏低的周期补充。",
      "proLabel": "Pro",
      "proBlurb": "最常见的充值。",
      "maxLabel": "Max",
      "maxBlurb": "大型工作负载加成。",
      "tokensUnit": "令牌",
      "amountPrefix": "+{amount}",
      "buyPack": "购买充值包",
      "redirecting": "正在跳转…",
      "readOnlyButton": "只读"
    },
    "usage": {
      "sectionTitle": "近期用量",
      "loading": "正在加载用量…",
      "empty": "暂无用量。",
      "colDate": "日期",
      "colModule": "模块",
      "colAction": "操作",
      "colTokens": "令牌",
      "colStatus": "状态",
      "tokensSpent": "−{tokens}"
    },
    "toasts": {
      "purchaseCompleted": "令牌购买已完成。您的余额将很快更新。",
      "purchaseCancelled": "令牌购买已取消。",
      "buyForbidden": "只有所有者、管理员或账单管理员才能购买令牌包。"
    }
  },
  teamPage: {
    "header": {
      "title": "团队",
      "subtitlePrefix": "管理谁可以访问",
      "subtitleSuffix": "以及他们可以执行的操作。",
      "subtitleFallbackOrg": "您的工作区",
      "inviteButton": "+ 邀请成员"
    },
    "stats": {
      "totalMembers": "成员总数",
      "active": "活跃",
      "pendingInvites": "待处理邀请",
      "adminsAndOwners": "管理员和所有者"
    },
    "filters": {
      "all": "全部",
      "owners": "所有者",
      "admins": "管理员",
      "billing": "账单",
      "members": "成员",
      "clients": "客户",
      "pending": "待处理"
    },
    "roles": {
      "owner": "所有者",
      "admin": "管理员",
      "billing": "账单",
      "member": "成员",
      "client": "客户"
    },
    "emptyState": {
      "noMembers": "此工作区暂无成员。",
      "noMatch": "没有成员符合“{filter}”筛选条件。"
    },
    "confirm": {
      "cancelInvite": "取消此待处理邀请？",
      "regenerateLink": "重新生成邀请链接？旧链接将失效。",
      "removeMember": "将此成员从工作区中移除？此操作无法撤销。"
    },
    "toast": {
      "cancelFailed": "取消失败",
      "newLinkCopied": "新的邀请链接已复制到剪贴板。",
      "regenerateFailed": "重新生成失败",
      "roleUpdateFailed": "角色更新失败",
      "memberRemoved": "成员已移除。",
      "removeFailed": "移除失败",
      "memberDisabled": "成员已停用。",
      "disableFailed": "停用失败",
      "disableUnavailableMock": "模拟层不支持停用。",
      "memberEnabled": "成员已启用。",
      "enableFailed": "启用失败",
      "enableUnavailableMock": "模拟层不支持启用。"
    },
    "pendingInvites": {
      "heading": "待处理邀请（{count}）",
      "tableHeaders": {
        "email": "邮箱",
        "role": "角色",
        "expires": "过期时间",
        "actions": "操作"
      },
      "copyLink": "复制链接",
      "regenerateLink": "重新生成链接",
      "cancel": "取消",
      "linkHiddenNote": "出于安全考虑，链接已隐藏。点击“重新生成链接”以签发新链接。"
    },
    "rolesLegend": {
      "lead": "**关于角色 —**",
      "owners": "**所有者**管理账单和工作区设置。",
      "admins": "**管理员**管理组织用户。",
      "billing": "**账单**用户管理发票和订阅。",
      "members": "**成员**可以使用审计功能。",
      "clients": "**客户**拥有受限的查看访问权限。"
    },
    "footerHint": "目前邀请仅为模拟功能。在后端阶段，真实的邮件发送和 Firebase Auth 将取代此层。"
  },
  orgCreate: {
    "heading": "创建工作区",
    "subtitle": {
      "signedIn": "已以 {email} 登录",
      "anonymous": "设置新的组织工作区"
    },
    "form": {
      "nameLabel": "工作区名称",
      "namePlaceholder": "例如 Acme Corp",
      "planLabel": "套餐"
    },
    "planDesc": {
      "free": "最多 3 次审计，1 个席位",
      "starter": "10 次审计，5 个席位",
      "professional": "无限次审计，20 个席位",
      "enterprise": "自定义限额、SSO、SLA"
    },
    "submit": {
      "idle": "创建工作区",
      "loading": "正在创建工作区…"
    },
    "backToDashboard": "← 返回仪表板"
  },
  auditHistory: {
    "header": {
      "title": "审计历史",
      "subtitle": "此工作区已提交的审计。生成报告以创建可共享的快照。"
    },
    "states": {
      "loading": "正在加载审计历史…",
      "error": "无法加载审计历史。请稍后重试。"
    },
    "empty": {
      "title": "暂无已提交的审计",
      "description": "已提交的审计将显示在此工作区中。运行一次新审计即可开始。",
      "startAudit": "+ 开始审计"
    },
    "columns": {
      "submitted": "提交时间",
      "score": "评分",
      "risk": "风险",
      "findings": "发现"
    },
    "row": {
      "scoreOutOf": "/100",
      "generateReport": "生成报告"
    },
    "toast": {
      "reportGenerated": "报告已生成"
    }
  },
  auditResultPage: {
    "header": {
      "badge": {
        "submitted": "审计已提交",
        "preview": "审计预览"
      },
      "title": "审计结果",
      "submissionId": "提交 ID {id} · {submittedAt}"
    },
    "journeyNext": {
      "headline": "以下是您的审计结果的含义",
      "summary": {
        "overallScore": "总分 {score}/100 — {risk} 风险。",
        "findingsSingular": "{n} 项发现，涉及 {m} 项建议操作。",
        "findingsPlural": "{n} 项发现，涉及 {m} 项建议操作。",
        "maturity": "AI 成熟度：5 级中的第 {level} 级。"
      }
    }
  },
  agentsPages: {
    "list": {
      "title": "代理",
      "intro": "查找适合您工作流程的 AI 代理。AiLunaPro 一体化代理已重点标出。",
      "locked": {
        "title": "客户账户无法使用代理",
        "backToDashboard": "返回仪表板"
      },
      "filters": {
        "industryLabel": "行业",
        "integrationLabel": "集成",
        "allIndustries": "所有行业",
        "allIntegrations": "所有集成",
        "clearFilters": "清除筛选条件",
        "clearRecommendationsHint": "清除推荐以使用筛选条件。"
      },
      "loading": "正在加载代理…",
      "emptyFiltered": "没有代理符合所选筛选条件。",
      "sections": {
        "topRecommendations": "热门推荐",
        "otherAgents": "其他代理"
      },
      "rankBadge": "#{rank}",
      "scorePts": "{score} 分",
      "whyToggleOne": "原因？（{count} 条理由）",
      "whyToggleOther": "原因？（{count} 条理由）"
    },
    "recommendPanel": {
      "title": "个性化我的推荐",
      "subtitle": "添加几项偏好设置，以便根据您的情况对代理进行排名。",
      "fields": {
        "industry": "行业",
        "companySize": "公司规模",
        "targetWorkflow": "目标工作流程",
        "subscriptionPlan": "订阅套餐",
        "currentMaturity": "当前 AI 成熟度",
        "integrations": "集成（用逗号分隔，最多 10 个）"
      },
      "placeholders": {
        "industry": "例如 零售、saas、医疗保健",
        "integrations": "例如 hubspot、slack、email"
      },
      "selectNone": "—",
      "companySizeOptions": {
        "solo": "个人",
        "sme": "中小企业",
        "enterprise": "企业"
      },
      "maturityOptions": {
        "low": "低",
        "medium": "中",
        "high": "高"
      },
      "workflowOptions": {
        "support": "客户支持",
        "sales": "销售和潜在客户跟进",
        "finance": "财务和开票",
        "documents": "文档和合同",
        "reporting": "报告和仪表板",
        "admin": "行政工作",
        "compliance": "合规和治理",
        "marketing": "营销和内容",
        "hr": "人力资源和人员运营"
      },
      "helperText": "至少添加一项偏好以个性化推荐。",
      "submit": "推荐代理",
      "submitting": "正在计算…",
      "clearRecommendations": "清除推荐"
    },
    "card": {
      "external": "外部",
      "savesPerMonth": "⏱ 每月节省约 {hours} 小时",
      "moreIntegrations": "+{count}",
      "viewDetails": "查看详情",
      "getThisAgent": "获取此代理"
    },
    "detail": {
      "lockedNotice": "客户账户无法使用代理。",
      "backToAgents": "← 返回代理",
      "loading": "正在加载…",
      "errors": {
        "missingAgentId": "缺少代理 id",
        "missingOrgContext": "缺少组织上下文"
      },
      "pills": {
        "external": "外部",
        "minPlanSuffix": "{plan}+",
        "tokens": "Tokens · {profile}",
        "setup": "设置 · {complexity}",
        "recommendedAllInOne": "推荐一体化方案",
        "compliance": "合规",
        "audit": "审计"
      },
      "cta": "获取此代理 →",
      "sections": {
        "overview": "概览",
        "problemSolved": "解决的问题",
        "bestFit": "最佳适配",
        "integrations": "集成",
        "expectedRoi": "预期 ROI",
        "pricing": "定价"
      },
      "bestFit": {
        "industries": "行业",
        "companySize": "公司规模",
        "minBudget": "最低预算",
        "minBudgetValue": "{amount}/月"
      },
      "roi": {
        "timeSaved": "节省时间",
        "timeSavedValue": "{hours} 小时/月",
        "costSaved": "节省成本",
        "costSavedValue": "{amount}/月",
        "payback": "回本周期",
        "paybackValue": "{months} 个月"
      },
      "pricing": {
        "modelPrefix": "模式：**{model}**",
        "install": " · 安装：{amount}",
        "monthly": " · 每月：{amount}",
        "onRequest": " · 价格面议"
      }
    }
  },
  assistancePage: {
    "header": {
      "badge": "✨ 指导性行动计划",
      "title": "您的行动计划",
      "intro": "我们已将您的审计回答转化为一份按顺序排列、结合具体情境的计划。请逐一阅读下方各部分——每条结论都可追溯到您的数据。",
      "score": "评分 {globalScore} / 100",
      "backToResult": "← 返回结果"
    },
    "detected": {
      "eyebrow": "01 · 诊断",
      "title": "我们检测到的问题",
      "topIssuesLabel": "识别出的首要问题",
      "noIssues": "✓ 没有需要呈现的问题——审计通过了每一条规则。",
      "weakestAreaLabel": "最薄弱的领域",
      "weakestAreaScore": "{score}%",
      "weakestAreaHint": "弥补这一部分的差距，是提升您整体评分中最具杠杆效应的举措。",
      "noWeakArea": "未检测到薄弱领域。"
    },
    "priorities": {
      "eyebrow": "02 · 优先事项",
      "title": "您应当优先修复的内容",
      "intro": "在 {count} 项推荐措施中，这三项相对于投入的精力能为您带来最高的回报。每项都可追溯到它所解决的发现事项。",
      "whyItMattersLabel": "为何重要：",
      "expectedOutcomeLabel": "预期成果：",
      "impactBadge": "{impact} 影响",
      "timeframeDays": "{days}天",
      "closesFindingsOne": "解决 {count} 项发现",
      "closesFindingsOther": "解决 {count} 项发现",
      "startWithThis": "从这里开始 →",
      "startWithThisTooltip": "J2 之后推出",
      "mostLeverage": "投入产出比最高"
    },
    "operatingModel": {
      "eyebrow": "03 · 运营模式",
      "title": "应自动化或建立结构的内容",
      "intro": "下方每个项目都有一种主要的执行方式。在应当建立结构的地方进行自动化（或反之），是一种常见的失败模式。",
      "categories": {
        "automate": {
          "eyebrow": "工具与系统",
          "title": "自动化",
          "tagline": "杠杆来自系统而非人力的项目。"
        },
        "structure": {
          "eyebrow": "政策与治理",
          "title": "建立结构",
          "tagline": "需要正式的责任归属、政策或框架对齐的项目。"
        },
        "process": {
          "eyebrow": "周期性运转",
          "title": "运营",
          "tagline": "需要按固定节奏持续运行的流程类项目。"
        },
        "train": {
          "eyebrow": "人员",
          "title": "培训",
          "tagline": "通过教育改变行为方式的项目。"
        }
      },
      "actionsCountOne": "{count} 项措施",
      "actionsCountOther": "{count} 项措施",
      "timeframeDays": "{days}天",
      "emptyColumn": "目前此处没有内容。"
    },
    "whyItMatters": {
      "eyebrow": "04 · 背景",
      "title": "为何这很重要",
      "frameworksReferenced": "本次评估引用的框架"
    },
    "impact": {
      "eyebrow": "05 · 影响",
      "title": "预期的业务影响",
      "ifTop3": "如果您完成排名前 3 的措施",
      "scoreLift": "您预测的整体评分将从 {currentScore} 提升至 {projectedScore}。这是基于每项措施所解决发现事项的方向性模拟——实际变化取决于执行的深度。",
      "projectedLabel": "预测值",
      "deltaPts": "+{delta} 分",
      "noChange": "无变化",
      "toneHighLift": "大幅提升",
      "toneSteadyGain": "稳步提升",
      "toneHoldTheLine": "保持现状",
      "outcomes": {
        "auditReadinessTitle": "审计就绪度",
        "auditReadinessHigh": "在安全问卷中，您将从“不完整”转变为“有据可依”。",
        "auditReadinessSteady": "现有态势得到记录，在审计中更易于引用。",
        "incidentExposureTitle": "事件暴露度",
        "incidentExposureHigh": "当 AI 造成损害时，影响范围更小，平均遏制时间更短。",
        "incidentExposureSteady": "针对 AI 特定事件的响应可预期，责任归属更清晰。",
        "customerTrustTitle": "客户信任",
        "customerTrustHigh": "披露说明、模型卡片和可解释性，能让您的支持和销售团队给出明确的答复。",
        "internalVelocityTitle": "内部效率",
        "internalVelocitySteady": "当政策与审查路径清晰明确时，开发者交付更快。"
      },
      "disclaimer": "预测评分是根据发现覆盖率和各部分权重计算得出的方向性模拟，并非保证。"
    },
    "nextStep": {
      "eyebrow": "06 · 推荐",
      "title": "您的下一步",
      "nextOneThing": "接下来的 1 件事",
      "savedAt": "已于 {timestamp} 在本地保存。",
      "localOnlyNote": "我们会将此计划保留在本地以供查阅——无需上传，也无需升级账户。当您的团队准备好行动时，随时回来即可。",
      "ctas": {
        "saveDefault": "✓ 保存此行动计划",
        "saved": "✓ 已保存",
        "reminderSet": "✓ 已设置提醒",
        "exported": "✓ 已导出",
        "remind7Day": "⏰ 设置 7 天提醒",
        "remind30Day": "⏰ 设置 30 天提醒",
        "remind60Day": "⏰ 设置 60 天提醒",
        "remindQuarterly": "⏰ 设置季度回访",
        "exportPlan": "⬇ 导出计划"
      }
    },
    "narrative": {
      "whyItMatters": {
        "regHighStakes": "您所处的领域已被监管机构视为高风险。当 AI 处理敏感数据或对人作出重大决策时，EU AI Act、GDPR 以及特定行业的规则（HIPAA 同等法规、金融服务框架）都会施加额外的义务。",
        "customerFacingTransparency": "您的 AI 面向客户，这意味着透明度义务随之适用（EU AI Act Article 50、消费者保护规则），其声誉风险也高于内部工具。",
        "internalBaseline": "即便是内部使用的 AI，公认的框架（ISO/IEC 42001、NIST AI RMF）也日益成为供应商尽职调查和企业级交易的基准。",
        "riskInactionHigh": "在您当前的风险等级下，不作为的代价是不对称的。一次事件——模型泄露数据、不公平的决策、没有应急手册的中断——其代价远高于下方推荐的修复措施。",
        "riskInactionMedium": "您处于一个有据可依的中间等级。当前的风险在于停滞不前：止步于此的组织通常会随着其 AI 应用规模的扩大而倒退。弥补中等严重性的差距可巩固当前的态势。",
        "riskInactionLow": "您已具备相当扎实的态势。风险在于随着 AI 应用规模扩大而出现倒退。后续投入主要是维护、记录和逐步深化。",
        "weakestSection": "您最薄弱的领域是 **{title}**（{score}%）。强化它会直接提升整体评分，但更重要的是，它能消除事件发生时阻力最小的路径。",
        "commercialEnabler": "企业级买家和受监管的客户越来越多地在安全问卷中要求提供 AI 治理证据。您行动计划中的许多项目不仅是合规工作，同时也是商业上的助力。"
      },
      "riskOneLiner": {
        "low": "您的状况良好——重心转向维护和持续改进。",
        "medium": "您具备有据可依的基准，但仍存在值得尽快弥补的实质性差距。",
        "high": "您存在若干差距，实质性地提高了您的暴露度。请优先处理下方的措施。",
        "critical": "您存在一项或多项严重差距。最高优先级的项目应在几天内解决，而非几周。"
      },
      "contextChips": {
        "highRiskIndustry": "高风险行业",
        "sensitiveData": "范围内涉及敏感数据",
        "customerFacing": "面向客户的 AI",
        "missionCritical": "关键任务范围",
        "standardProfile": "标准风险概况"
      },
      "nextStep": {
        "criticalHeadline": "在接下来的 7 天内解决该严重发现事项",
        "criticalRationaleFallback": "这是您行动计划中最具实质性的项目。",
        "highHeadline": "从 30 天速赢项目开始",
        "highRationaleFallback": "高风险态势会对少数有针对性的措施迅速作出反应。从路线图中挑选三个速赢项目，并在本月内负责落实。",
        "mediumHeadline": "夯实您的治理基础",
        "mediumRationale": "您已度过最初的手忙脚乱阶段。下一个能产生复利效应的举措，是将您非正式的做法正式化——书面政策、公认的框架、记录在案的升级流程。这正是让审计和企业级交易变得例行化的关键。",
        "lowHeadline": "从合规迈向优化",
        "lowRationale": "您的态势很强。如今的杠杆在于记录和持续改进——模型卡片、培训复训，以及将 AI 场景纳入您的事件响应演练。"
      }
    }
  },
  dashboardHome: {
    "hero": {
      "scoreLabel": "合规评分",
      "riskLabel": "当前风险等级",
      "maturityLabel": "AI 成熟度等级",
      "nextStepLabel": "推荐的下一步",
      "nextStepTitle": "完成 HR 筛选工具审计",
      "nextStepBody": "此审计已完成 60%。完成它预计可将您的合规评分提升 +7 分。",
      "continueAudit": "继续审计 →",
      "toast": {
        "noPermission": "您没有继续审计的权限。",
        "noDraft": "未找到草稿审计——正在开始新的审计。"
      }
    },
    "recentReports": {
      "card": {
        "share": "分享",
        "view": "查看"
      },
      "export": {
        "title": "导出选项",
        "blurb": "以多种格式导出您的合规数据，供相关方使用。",
        "exportAs": "导出为 {fmt}"
      },
      "toast": {
        "reportNotAvailable": "报告尚不可用。",
        "shareLinkCopied": "分享链接已复制。",
        "shareLinkFailed": "无法复制链接。请重试。",
        "noReportsToExport": "尚无可导出的报告。",
        "csvDownloaded": "CSV 已下载。",
        "jsonDownloaded": "JSON 已下载。"
      }
    },
    "cta": {
      "heading": "准备好实现全面的 AI 合规了吗？",
      "body": "加入正在使用 AiLunaPro 的组织，自动化合规工作流程、降低风险，并赢得相关方的信任。",
      "toast": {
        "alreadyActivePlan": "您已拥有一个有效的方案。",
        "demoRequestSent": "演示请求已发送。我们会进行审核并尽快与您联系。"
      },
      "demoModal": {
        "title": "预约演示",
        "subtitle": "向我们简单介绍一下您的团队，我们会与您联系。",
        "placeholderFullName": "全名",
        "placeholderWorkEmail": "工作邮箱",
        "placeholderCompany": "公司",
        "placeholderMessage": "您想讨论些什么？",
        "privacyNote": "我们仅使用这些信息来回应您的请求。",
        "cancel": "取消",
        "submit": "请求演示",
        "submitting": "发送中…",
        "errorFallback": "无法发送您的请求。请重试。"
      }
    }
  },
  support: {
    "cta": "联系支持",
    "title": "联系支持",
    "subtitle": "报告问题或提出疑问——我们会通过邮件回复。",
    "typeLabel": "关于什么？",
    "typeBug": "故障",
    "typeQuestion": "问题",
    "typeBilling": "账单",
    "descriptionLabel": "描述一下",
    "descriptionPlaceholder": "发生了什么？步骤、你的预期，以及任何有用的信息。",
    "emailLabel": "邮箱",
    "emailPlaceholder": "you@company.com",
    "priorityLabel": "优先级",
    "optional": "（选填）",
    "prioLow": "低",
    "prioMedium": "中",
    "prioHigh": "高",
    "submit": "发送",
    "submitting": "发送中…",
    "success": "谢谢——你的消息已发送，我们会通过邮件回复。",
    "close": "关闭",
    "errType": "请选择类型。",
    "errDescription": "请描述问题。",
    "errEmail": "请输入有效的邮箱。"
  },
  feedback: {
    "title": "这次体验如何？",
    "satisfactionLabel": "为你的体验评分",
    "sat1": "很差",
    "sat2": "较差",
    "sat3": "一般",
    "sat4": "不错",
    "sat5": "很好",
    "difficultyLabel": "使用起来容易吗？",
    "diffEasy": "容易",
    "diffOk": "一般",
    "diffHard": "困难",
    "blockerLabel": "是什么让你没能继续？",
    "blockerPlaceholder": "选填——告诉我们遇到了什么问题",
    "suggestionLabel": "有什么可以改进的吗？",
    "suggestionPlaceholder": "选填",
    "submit": "提交",
    "success": "谢谢——我们会认真阅读每条反馈。",
    "dismissAria": "关闭反馈"
  },
  publicTools: {
    "diagnostic": {
      "header": {
        "title": "AI 成熟度诊断",
        "subtitle": "回答 8 个简短问题。获取您的 AI 成熟度评分，并了解哪些 AiLunaPro 智能体适合您当前的阶段。",
        "freeLine": "免费 · 无需注册账户 · 约需 2 分钟"
      },
      "resumeNotice": "欢迎回来——我们已恢复您之前的回答，您可以从上次中断的地方继续。",
      "questionLegend": "问题 {n} / {total}",
      "leadCapture": {
        "heading": "我们应将结果发送到哪里？",
        "emailLabel": "电子邮箱",
        "requiredMark": "*",
        "emailPlaceholder": "you@company.com",
        "companyNameLabel": "公司名称",
        "optionalMark": "（选填）",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "我们仅使用此信息来生成您的诊断结果，并就相关 AI 服务进行后续跟进。无需注册账户。",
        "consentLabel": "我同意接收我的 AI 诊断结果以及来自 AiLunaPro 的相关后续信息。我理解我的回答和电子邮箱将被处理，以生成并存储此诊断结果，并且我可以随时请求删除我的数据。"
      },
      "submit": {
        "loading": "正在计算您的结果……",
        "unlock": "将我的完整报告发送到邮箱 →",
        "idle": "获取我的 AI 成熟度评分"
      },
      "signInPrompt": "已有账户？",
      "signInLink": "登录",
      "errors": {
        "answers": "请回答每一个问题。",
        "email": "请输入有效的电子邮箱地址。",
        "consent": "您必须同意接收结果。",
        "captchaLoading": "验证码正在加载——请稍候。"
      },
      "buckets": {
        "low": {
          "title": "您的 AI 成熟度处于起步阶段（Emerging）",
          "message": "您的组织正处于早期阶段。建议从简单的自动化、AI 使用清单以及实用的支持型智能体入手。"
        },
        "medium": {
          "title": "您的 AI 成熟度处于发展阶段（Developing）",
          "message": "您已具备一定的 AI 基础。下一步是规范使用方式、衡量 ROI，并改进文档与报告工作流。"
        },
        "high": {
          "title": "您的 AI 成熟度处于领先阶段（Advanced）",
          "message": "您已准备好通过更强的治理、合规、报告和专业化自动化来扩展 AI。"
        }
      },
      "result": {
        "scoreLabel": "您的 AI 成熟度评分",
        "scoreUnit": "/100",
        "recommendedAgentsHeading": "推荐的 AiLunaPro 智能体",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "获取此智能体",
        "ctaHeading": "想要更深入的审计和完整的行动计划吗？",
        "ctaBody": "创建一个免费的 AiLunaPro 工作区，即可访问完整的审计、登记册和智能体目录。",
        "ctaButton": "创建您的免费账户 ↗",
        "ctaFootnote": "继续前往 **dashboard.ailunapro.com**——面向 AI 智能体与解决方案的 AiLuna 平台，是您审计之后的下一步。",
        "retakeButton": "重新进行诊断"
      }
    },
    "roi": {
      "header": {
        "title": "AI ROI 计算器",
        "subtitle": "估算使用 AiLunaPro AI 智能体可为您节省的时间和金钱。",
        "freeLine": "免费 · 无需注册账户 · 约需 1 分钟 · USD"
      },
      "resumeNotice": "欢迎回来——我们已恢复您之前的输入，您可以从上次中断的地方继续。",
      "form": {
        "teamLegend": "您的团队",
        "teamSizeLabel": "团队规模",
        "teamSizePlaceholder": "例如 10",
        "monthlyHoursLabel": "您的团队每月花在重复性工作上的小时数",
        "monthlyHoursPlaceholder": "例如 80",
        "hourlyCostLabel": "平均每小时成本（USD）",
        "targetWorkflowLabel": "目标工作流",
        "workflowPlaceholderOption": "选择一个工作流……"
      },
      "leadCapture": {
        "legend": "我们应将您的估算结果发送到哪里？",
        "emailLabel": "电子邮箱",
        "emailPlaceholder": "you@company.com",
        "companyNameLabel": "公司名称",
        "optionalMark": "（选填）",
        "companyNamePlaceholder": "Acme Corp",
        "helperText": "我们仅使用此信息来生成您的估算结果，并就相关 AI 服务进行后续跟进。无需注册账户。",
        "consentLabel": "我同意接收我的 AI ROI 估算结果以及来自 AiLunaPro 的相关后续信息。我理解我的回答和电子邮箱将被处理，以生成并存储此估算结果，并且我可以随时请求删除我的数据。"
      },
      "requiredMark": "*",
      "submit": {
        "loading": "正在计算……",
        "unlock": "将我的完整报告发送到邮箱 →",
        "idle": "计算我的 ROI"
      },
      "signInPrompt": "已有账户？",
      "signInLink": "登录",
      "errors": {
        "teamSize": "团队规模必须是 1 到 10000 之间的整数。",
        "hours": "每月小时数必须是 0 到 10000 之间的数字。",
        "cost": "每小时成本必须是 1 到 1000 USD 之间的数字。",
        "workflow": "请选择一个工作流。",
        "email": "请输入有效的电子邮箱地址。",
        "consent": "您必须同意接收估算结果。",
        "captchaLoading": "验证码正在加载——请稍候。"
      },
      "result": {
        "monthlySavingsLabel": "预计每月节省",
        "monthlySavingsUnit": "/月",
        "yearlySavingsLabel": "每年节省",
        "timeSavedLabel": "节省的时间",
        "timeSavedValue": "{hours} 小时/月",
        "paybackLabel": "回本周期",
        "paybackValue": "{months} 个月",
        "paybackEmpty": "—",
        "disclaimer": "这是基于您提供的信息和保守的自动化假设得出的估算。实际节省可能有所不同。",
        "pricingNote": "回本周期假设参考智能体成本为 {cost}/月；实际定价因智能体而异。",
        "recommendedAgentsHeading": "推荐的 AiLunaPro 智能体",
        "agentCardBrand": "AiLunaPro",
        "agentCardCta": "获取此智能体",
        "ctaHeading": "想要更深入的分析和完整的行动计划吗？",
        "ctaBody": "创建一个免费的 AiLunaPro 工作区，即可访问完整的审计、登记册和智能体目录。",
        "ctaButton": "创建您的免费账户 ↗",
        "ctaFootnote": "继续前往 **dashboard.ailunapro.com**——面向 AI 智能体与解决方案的 AiLuna 平台，是您审计之后的下一步。",
        "rerunButton": "再进行一次计算"
      }
    },
    "quote": {
      "header": {
        "title": "申请报价",
        "subtitle": "即时获取定制 AI 智能体、自动化或网站项目的指示性价格区间。",
        "freeLine": "免费估算 · 无需账户 · 仅供参考"
      },
      "resumeNotice": "欢迎回来——我们已为您恢复之前的选择。",
      "form": {
        "serviceLegend": "您需要什么？",
        "serviceLabel": "服务类型",
        "servicePlaceholder": "选择一项服务…",
        "tierLabel": "项目复杂度",
        "tierPlaceholder": "选择复杂度级别…",
        "descriptionLabel": "项目描述",
        "descriptionPlaceholder": "简要描述您的项目、目标以及需要集成的工具。请勿填写机密或个人数据。",
        "optionalLegend": "补充信息（可选）",
        "businessSizeLabel": "企业规模",
        "urgencyLabel": "紧急程度",
        "budgetBandLabel": "预算范围",
        "notSpecified": "未指定"
      },
      "services": {
        "ai_agent": "AI 智能体",
        "automation": "自动化工作流",
        "website": "网站 / Web 应用",
        "audit": "可行性审计"
      },
      "tiers": {
        "simple": "简单",
        "contextual": "情境化（MVP）",
        "autonomous": "自主",
        "multi_agent": "多智能体系统",
        "intermediate": "中级",
        "complex": "复杂",
        "custom": "定制 / 量身打造",
        "feasibility": "可行性研究"
      },
      "businessSizes": {
        "solo": "个人 / 自由职业者",
        "small": "小型（2–20 人）",
        "medium": "中型（21–100 人）",
        "large": "大型（100 人以上）"
      },
      "urgencies": {
        "low": "灵活",
        "standard": "标准",
        "high": "紧急"
      },
      "budgetBands": {
        "under_10k": "$10k 以下",
        "10k_50k": "$10k–$50k",
        "50k_150k": "$50k–$150k",
        "over_150k": "$150k 以上"
      },
      "requiredMark": "*",
      "submit": {
        "idle": "获取我的估算"
      },
      "errors": {
        "service": "请选择一项服务类型。",
        "tier": "请选择复杂度级别。",
        "description": "请描述您的项目（至少 20 个字符）。"
      },
      "result": {
        "rangeLabel": "估算价格区间",
        "openEndedSuffix": "+",
        "recommendedLabel": "推荐方案",
        "scopeHeading": "通常包含的内容",
        "nextStepsHeading": "后续步骤",
        "opsCostNote": "AI 智能体与自动化项目还会产生运营成本（令牌、基础设施），通常会在开发费用之外额外增加 {min}–{max}%。",
        "disclaimer": "此为指示性、非合同性的估算，仅用于预算参考——仅供参考。最终价格取决于详细的项目范围。",
        "ctaHeading": "准备好开始了吗？",
        "ctaBody": "创建免费的 AiLunaPro 工作区，即可生成带品牌的 PDF 报价并启动您的项目。",
        "ctaButton": "创建您的免费账户 ↗",
        "rerunButton": "重新开始"
      },
      "solutions": {
        "ai_agent.simple": "简单 AI 智能体",
        "ai_agent.contextual": "情境化 AI 智能体（MVP）",
        "ai_agent.autonomous": "自主 AI 智能体",
        "ai_agent.multi_agent": "多智能体系统",
        "automation.simple": "简单自动化工作流",
        "automation.contextual": "情境化自动化工作流",
        "automation.autonomous": "自主自动化系统",
        "automation.multi_agent": "多智能体自动化平台",
        "website.simple": "简单网站",
        "website.intermediate": "中级网站",
        "website.complex": "复杂 Web 平台",
        "website.custom": "定制 / 量身打造平台",
        "audit.feasibility": "可行性与范围研究"
      },
      "scope": {
        "discovery": "需求调研工作坊",
        "design": "方案设计与架构",
        "integration": "与您的工具集成（CRM/ERP、API）",
        "deployment": "部署与交接",
        "monitoring": "监控与支持配置",
        "mapping": "流程梳理与工作流设计",
        "build": "构建与开发",
        "content": "内容与数据配置",
        "launch": "上线与发布",
        "assessment": "现状评估",
        "gapAnalysis": "差距分析",
        "recommendations": "优先级建议",
        "roadmap": "实施路线图"
      },
      "nextSteps": {
        "discoveryCall": "预约需求沟通电话以细化范围",
        "scoping": "获取详细的范围说明文档",
        "proposal": "获取正式提案与时间表"
      },
      "generate": {
        "button": "生成正式报价",
        "cost": "{n} tokens",
        "loading": "正在生成…",
        "success": "您的报价已生成并保存到您的工作区。",
        "error": "无法生成报价，请重试。",
        "needOrg": "请选择一个工作区以生成报价。"
      },
      "guided": {
        "goalsLabel": "常见目标 — 选择适用项",
        "detailsLabel": "还有其他需求吗？（可选）",
        "detailsPlaceholder": "补充细节：需集成的工具、时间安排、必备功能……请勿填写机密或个人数据。",
        "paymentNote": "对于定制项目，通常按发票通过银行转账付款。项目确认后将生成最终发票。此估算仅供参考，不具合同约束力。",
        "selectError": "请至少选择一个目标或添加简短描述。",
        "suggestions": {
          "support": "自动化客户支持",
          "crm": "将 AI 接入我的 CRM",
          "workflows": "自动化内部工作流",
          "dataEntry": "自动化数据录入",
          "reporting": "自动化报表与洞察",
          "integrations": "集成我现有的工具",
          "notifications": "自动化通知与提醒",
          "dataSync": "在系统之间同步数据",
          "showcase": "展示我的公司",
          "leads": "获取销售线索",
          "ecommerce": "在线销售（电商）",
          "dashboard": "内部仪表板 / 门户",
          "booking": "在线预订 / 预约",
          "feasibility": "评估可行性",
          "readiness": "检查 AI / 欧盟 AI 法案合规度",
          "vendorCompare": "比较方案 / 供应商",
          "roadmap": "获取实施路线图"
        }
      },
      "pdf": {
        "download": "下载 PDF",
        "docTitle": "项目报价",
        "summaryHeading": "项目概要",
        "pricingHeading": "预计投资"
      },
      "email": {
        "clientLabel": "客户邮箱（可选）— 留空则发送给您自己",
        "clientPlaceholder": "client@company.com",
        "button": "将此报价发送到我的邮箱",
        "sent": "报价已发送到您的邮箱。",
        "error": "无法发送邮件，请重试。"
      },
      "send": {
        "heading": "将提案发送给您的客户",
        "intro": "输入您客户的电子邮箱和您提议的预算——我们将通过邮件把提案发送给他们，供其接受或请求修改。",
        "emailLabel": "客户邮箱",
        "emailRequired": "发送提案需要填写客户邮箱。",
        "submit": "将提案发送给客户",
        "hint": "您的客户会收到提案，并可接受预算或请求修改。",
        "sentTo": "提案已发送至 {email}",
        "sentNext": "当您的客户回复时，我们会通知您。可在 Admin Center 中跟踪进度。",
        "track": "打开 Admin Center"
      },
      "override": {
        "toggle": "调整价格（管理员）",
        "minLabel": "最低 (USD)",
        "maxLabel": "最高 (USD)",
        "reasonLabel": "理由",
        "save": "保存调整",
        "error": "无法保存调整。",
        "invalid": "请输入有效的最低/最高金额 (USD) 和简短理由。",
        "adjustedNote": "调整后价格：{range}"
      },
      "proposal": {
        "execSummaryTemplate": "本提案介绍为您的目标和现有工具量身定制的{solution}。",
        "solutionHeading": "建议方案",
        "paymentHeading": "付款",
        "timelineHeading": "参考时间表",
        "coverClient": "致",
        "coverDate": "日期",
        "coverValid": "有效期至",
        "coverRef": "编号",
        "solutionDesc": {
          "ai_agent": "定制 AI 智能体，自动化您的目标并接入您现有的工具（CRM/ERP、API）。",
          "automation": "自动化工作流，连接您的工具并消除手动重复操作。",
          "website": "围绕您的业务目标打造的专业网站或 Web 平台。",
          "audit": "可行性与范围研究，在开发前降低项目风险。"
        },
        "timeline": {
          "agent": "调研与设计 — 1–2 周\n开发与集成 — 4–8 周\n测试与部署 — 1–2 周",
          "website": "调研与设计 — 1–2 周\n开发 — 3–6 周\n内容与上线 — 1 周",
          "audit": "评估 — 1 周\n分析与建议 — 1 周"
        },
        "justification": {
          "heading": "此估算如何计算",
          "market": "基于 2026 年市场参考，面向{tier}复杂度的{category}项目。",
          "complexity": "反映项目的{tier}复杂度。",
          "scope": "涵盖 {count} 个核心工作流，包括与您工具的集成。",
          "ops": "AI 智能体与自动化项目额外增加 {min}–{max}% 的运营成本（令牌、基础设施）。"
        }
      },
      "accepted": {
        "title": "您的回复已发送",
        "s1": "我们正在审核您的请求",
        "s2": "专家将确认最终金额",
        "s3": "您将收到一张发票",
        "s4": "随后您完成付款",
        "trackCta": "跟踪您的请求",
        "viewInvoice": "查看您的发票",
        "emailTitle": "仅剩一步",
        "emailBody": "如需确认并接收您的发票，请在您的 AiLunaPro 工作区中接受此报价。",
        "confirmTitle": "确认提议的预算",
        "confirmBody": "确认即表示接受提议的预算——我们将为您准备发票并通知我们的团队。",
        "confirmCta": "接受提议的预算",
        "confirming": "正在确认…",
        "confirmError": "出了点问题。请重试，或回复您的报价邮件。",
        "discussConfirmBody": "确认即可将您的调整请求发送给我们的团队。",
        "discussCta": "发送请求",
        "sentTitle": "请求已收到",
        "sentBody": "我们已收到您的请求，将与您联系以调整提案。",
        "discussTitle": "请求价格调整",
        "discussBody": "如需提出修改，请回复您的报价邮件，我们将与您跟进。",
        "back": "返回报价工具"
      },
      "flow": {
        "heading": "工作流程",
        "s1": "接受方案",
        "s2": "我们确认最终金额",
        "s3": "您收到发票",
        "s4": "您完成付款"
      },
      "decision": {
        "adjustHeading": "提出您的预算",
        "messagePlaceholder": "添加留言 — 您希望调整什么？",
        "messageSend": "发送请求",
        "budgetLabel": "您提出的预算",
        "budgetIntro": "这是您提出的金额。您的客户将确认该金额或请求调整。",
        "rangeLabel": "估算区间",
        "budgetPlaceholder": "例如 50000",
        "budgetRequired": "请先填写您的预算，然后再提交。",
        "verdictBelow": "您的预算低于估算区间。",
        "verdictWithin": "您的预算在估算区间内。",
        "verdictAbove": "您的预算高于估算区间。",
        "submitHint": "您的客户将确认该金额或请求调整。",
        "accept": "提交我的预算",
        "discuss": "请求价格调整",
        "accepted": "已接受估算——我们将尽快跟进。",
        "discussionSent": "请求已发送——我们将与您联系沟通。",
        "error": "无法保存您的选择，请重试。"
      },
      "negotiation": {
        "heading": "谈判摘要",
        "initialLabel": "初始估算",
        "budgetLabel": "您的预算",
        "adjustedLabel": "调整后价格"
      },
      "progress": {
        "submit": "提交",
        "review": "审核",
        "validation": "验证",
        "invoice": "发票"
      },
      "status": {
        "title": "跟踪您的请求",
        "intro": "这里显示您的请求在我们流程中的进度。每一步我们都会通过邮件通知您。",
        "reviewNote": "专家正在审核您的请求，并将确认最终金额。",
        "nextStep": "下一步：管理员将确认金额。",
        "openPanel": "打开发票面板",
        "stateReview": "审核中",
        "stateNegotiation": "协商中",
        "stateWaiting": "等待管理员",
        "stateInvoice": "发票",
        "budgetLabel": "您提出的预算",
        "waitingValidation": "等待确认",
        "back": "返回报价工具"
      }
    }
  },
  enums: {
    "badge": {
      "low": "低",
      "medium": "中",
      "high": "高",
      "critical": "严重",
      "completed": "已完成",
      "inProgress": "进行中",
      "draft": "草稿",
      "published": "已发布",
      "archived": "已归档",
      "effortLow": "低投入",
      "effortMedium": "中投入",
      "effortHigh": "高投入"
    },
    "riskWord": {
      "critical": "严重风险",
      "high": "高风险",
      "medium": "中风险",
      "low": "低风险",
      "minimal": "极低风险"
    },
    "approval": {
      "approved": "已批准",
      "pending": "待处理",
      "underReview": "审核中",
      "rejected": "已驳回"
    },
    "oversight": {
      "hitl": "人工介入（在环）",
      "hotl": "人工监督（在线）",
      "oot": "自主运行"
    },
    "dataTypes": {
      "pii": "个人数据 (PII)",
      "health": "健康数据",
      "financial": "财务 / 交易",
      "biometric": "生物识别",
      "children": "未成年人数据",
      "public": "公开 / 开放",
      "internal": "内部文档",
      "employee": "员工记录"
    },
    "confidence": {
      "low": "低",
      "medium": "中",
      "high": "高"
    },
    "memberStatus": {
      "active": "活跃",
      "pending": "待处理",
      "invited": "已邀请",
      "disabled": "已停用"
    }
  },
  agentsContent: {
    "byId": {
      "support-agent": {
        "tagline": "自动化客户回复，减轻支持团队的工作负担。",
        "description": "AI 智能体专为解答常见问题、甄别支持请求、分配工单并协助客服团队而设计。它帮助企业搭建可全天候运行的第一级支持，而无需取代人工团队。",
        "problemSolved": "客户响应缓慢、请求重复以及支持团队负荷过重。"
      },
      "sales-agent": {
        "tagline": "甄别潜在客户并准备商务跟进。",
        "description": "面向销售的 AI 智能体，专为甄别潜在客户、准备商务回复、生成跟进内容并梳理商机而设计。它帮助销售团队节省重复性工作的时间，并改善对潜在客户的跟进。",
        "problemSolved": "潜在客户甄别不到位、遗忘跟进以及销售时间浪费。"
      },
      "finance-agent": {
        "tagline": "协助处理发票、报价和催收。",
        "description": "AI 智能体专为帮助分类财务文档、准备报价、跟踪发票、生成催收提醒并标记简单异常而设计。它不取代会计，但能大幅减少财务行政工作的时间。",
        "problemSolved": "人工处理发票、催收延迟以及录入错误。"
      },
      "hr-agent": {
        "tagline": "协助 HR 团队完成筛选、摘要和文档工作。",
        "description": "AI 智能体专为支持重复性 HR 任务而设计，例如 CV 摘要、候选人备注、内部回复、员工文档及 HR 行政跟进。它帮助团队梳理信息，并减少手工文档工作所花费的时间。",
        "problemSolved": "HR 团队在文档筛选、重复回答和手工跟进上耗费时间。"
      },
      "compliance-agent": {
        "tagline": "帮助梳理 AI 合规、风险与登记册。",
        "description": "AI 智能体专为支持合规文档、内部控制、AI 登记册准备及缓解方案而设计。它对面临治理、可追溯性和 AI 合规义务的组织尤为有用。",
        "problemSolved": "组织对 AI 合规缺乏清晰可见性、文档分散以及 AI 风险失管。"
      },
      "marketing-agent": {
        "tagline": "生成内容、营销活动与营销创意。",
        "description": "AI 智能体专为生成帖子、邮件、落地页内容、营销活动创意、摘要及契合企业画像的营销素材而设计。它帮助小团队在不增加工具数量的情况下更稳定地进行发布。",
        "problemSolved": "营销团队在内容一致性、耗时的创作以及分散的活动素材上面临困难。"
      },
      "reporting-agent": {
        "tagline": "创建摘要、仪表盘和决策报告。",
        "description": "AI 智能体专为将内部数据和信息转化为摘要、报告、行动计划及可供管理层使用的洞察而设计。它帮助领导者和管理者获得更清晰的全局视图，而无需花费数小时手工整合信息。",
        "problemSolved": "人工报告耗时过长，决策者缺乏简明的摘要。"
      },
      "audit-agent": {
        "tagline": "支持 AI 审计、成熟度评估和行动计划。",
        "description": "AI 智能体专为帮助梳理审计、分析答复、识别风险并产出可执行建议而设计。它将 AI 审计、合规与业务转型衔接为一套实用的工作流程。",
        "problemSolved": "AI 审计耗时、需手工分析且难以确定优先级。"
      },
      "document-agent": {
        "tagline": "对文档进行分类、摘要和信息提取。",
        "description": "AI 智能体专为处理文档、提取关键信息、生成摘要并整理文件而设计。它适用于需要处理大量附件、合同、报告、HR 文件、财务文档或合规证据的组织。",
        "problemSolved": "文档整理混乱、检索缓慢，手工摘要成本高昂。"
      },
      "admin-agent": {
        "tagline": "自动化日常行政工作。",
        "description": "通用型 AI 智能体，用于处理邮件、预约、跟进、摘要、笔记、任务整理及日常行政工作流。它帮助创始人、独立专业人士和小团队节省重复性运营工作的时间。",
        "problemSolved": "行政工作耗时过多、任务重复且整理全靠手工。"
      }
    },
    "industries": {
      "all": "全部",
      "b2b": "B2B",
      "construction": "建筑",
      "consulting": "咨询",
      "creator": "创作者",
      "ecommerce": "电子商务",
      "education": "教育",
      "enterprise": "企业",
      "finance": "金融",
      "healthcare": "医疗健康",
      "legal": "法律",
      "public-sector": "公共部门",
      "real-estate": "房地产",
      "retail": "零售",
      "saas": "SaaS",
      "services": "服务业"
    },
    "companySize": {
      "enterprise": "大型企业",
      "sme": "中小企业",
      "solo": "个人/独立"
    },
    "profile": {
      "high": "高",
      "medium": "中"
    },
    "complexity": {
      "high": "高",
      "low": "低",
      "medium": "中"
    },
    "model": {
      "subscription": "订阅"
    },
    "integrations": {
      "accounting": "会计",
      "audit-ai": "Audit AI",
      "calendar": "日历",
      "cloud-storage": "云存储",
      "compliance-tools": "合规工具",
      "crm": "CRM",
      "dashboard": "仪表盘",
      "documents": "文档",
      "email": "电子邮件",
      "helpdesk": "服务台",
      "hris": "HRIS",
      "registry": "登记册",
      "social-media": "社交媒体",
      "spreadsheet": "电子表格",
      "website": "网站"
    }
  },
  diagnosticQuestions: {
    "byId": {
      "ai_usage": {
        "label": "贵组织目前如何使用 AI？",
        "options": {
          "none": "我们尚未使用 AI",
          "individual": "部分员工个人使用 AI",
          "team": "多个团队使用 AI 工具",
          "structured": "AI 已用于规范化的工作流程"
        }
      },
      "process_automation": {
        "label": "目前有多少重复性工作已实现自动化？",
        "options": {
          "none": "几乎没有任何自动化",
          "basic": "少数简单任务已自动化",
          "moderate": "部分重要流程已自动化",
          "advanced": "自动化已融入日常运营"
        }
      },
      "data_readiness": {
        "label": "贵企业的数据为 AI 使用做好了多少准备？",
        "options": {
          "scattered": "数据分散且难以访问",
          "partial": "部分数据已整理",
          "mostly_ready": "大部分关键数据已结构化",
          "ready": "数据干净、易访问且定期更新"
        }
      },
      "compliance_awareness": {
        "label": "您为 AI 治理与合规做了多少准备？",
        "options": {
          "unknown": "我们尚未评估 AI 风险",
          "basic": "我们了解 AI 风险但尚无流程",
          "documented": "部分 AI 用例已记录在案",
          "governed": "我们拥有清晰的 AI 治理与审查流程"
        }
      },
      "shadow_ai": {
        "label": "您是否了解公司各处使用了哪些 AI 工具？",
        "options": {
          "no_visibility": "否，我们缺乏可见性",
          "partial_visibility": "我们了解部分工具，但并非全部",
          "mostly_visible": "我们跟踪大部分 AI 工具",
          "full_inventory": "我们维护着清晰的 AI 工具清单"
        }
      },
      "business_impact": {
        "label": "您对 AI 带来的业务影响衡量得有多清晰？",
        "options": {
          "not_measured": "我们尚未对其进行衡量",
          "qualitative": "我们仅有定性的反馈",
          "some_metrics": "我们跟踪部分时间或成本节省",
          "clear_roi": "我们衡量 ROI 与业务成果"
        }
      },
      "team_skills": {
        "label": "您的团队对负责任地使用 AI 有多大信心？",
        "options": {
          "low": "信心非常有限",
          "basic": "基本熟悉",
          "good": "对常见任务有较好信心",
          "strong": "拥有成熟的负责任 AI 实践"
        }
      },
      "implementation_priority": {
        "label": "您当前的主要 AI 优先事项是什么？",
        "options": {
          "save_time": "节省重复性工作的时间",
          "improve_sales": "提升销售或客户跟进",
          "support_customers": "改善客户支持",
          "compliance": "提升 AI 合规与治理",
          "documents": "更快处理文档与报告"
        }
      }
    }
  },
  roiWorkflows: {
    "support": "客户支持",
    "sales": "销售与潜在客户跟进",
    "finance": "财务与开票",
    "documents": "文档与合同",
    "reporting": "报表与仪表盘",
    "admin": "行政事务",
    "compliance": "合规与治理",
    "marketing": "营销与内容",
    "hr": "人力资源与人事运营"
  },
  auditTools: {
    nav: {
      worksheetLabel: "时间 → 金钱审计",
      worksheetHint: "用你的真实数据，逐项任务分析",
      visibilityLabel: "AI 与社媒可见度",
      visibilityHint: "在 ChatGPT/Perplexity 中的曝光度 + 社媒审计",
    },
    worksheet: {
      title: "时间 → 金钱审计",
      subtitle: "请输入你的真实数据（不要估算）。工具会为每项任务给出判定、真实年度成本以及可挽回的工时。选择你的货币和收入周期（月/年/周）——工具会自动适配你所在的国家。",
      profile: {
        sectionTitle: "① 你的概况",
        incomeMonth: "月净收入",
        incomeYear: "年净收入",
        incomeWeek: "周净收入",
        periodLabel: "收入周期",
        periodMonth: "每月",
        periodYear: "每年",
        periodWeek: "每周",
        currencyLabel: "货币",
        hoursLabel: "每周工时",
        hourlyRate: "→ 时薪",
        perHour: "/ 小时",
        invalidHint: "请输入收入并填写大于 0 的工时，以便计算时薪。",
        helperPrompt: "不知道自己每周的工时？",
        helperHoursPerDay: "每天工时",
        helperDaysPerWeek: "每周天数",
        helperCalc: "计算我的工时",
      },
      tasks: {
        sectionTitle: "② 你的任务",
        tip: "提示：写下确切的标题（动词 + 对象），例如\"审阅提案\"，而不是\"行政\"。",
        colTask: "任务",
        colHours: "时/周",
        colWho: "谁能做？",
        colRules: "规则清晰？",
        colEnergy: "精力",
        colVerdict: "判定",
        colCost: "年成本",
        colRecovered: "挽回时",
        taskPlaceholder: "任务名称",
        addRow: "+ 添加任务",
        addCommon: "+ 添加常见任务…",
        addCommonHint: "不知道加什么？选一个常见任务。",
        splitInto: "拆分为 {n} 项任务",
      },
      who: { self: "只有我", specialist: "受过训练的专家", anyone: "任何受过训练的人" },
      rules: { yes: "是", no: "否" },
      energy: { energizing: "充满活力", neutral: "中性", draining: "消耗精力" },
      verdict: { keep: "✅ 保留", automate: "🤖 自动化", delegate: "→ 委派", rethink: "⚠️ 重新思考" },
      summary: {
        recoveredHoursYear: "每年可挽回工时",
        recoveredValueYear: "每年可挽回价值",
        toAutomate: "待自动化",
        toDelegate: "待委派",
      },
      quickWins: {
        title: "③ 优先做这些（速赢）",
        sub: "可挽回的任务按影响（年成本）÷ 投入排序。从最上面开始做。",
        effortLow: "低",
        effortMed: "中",
        effortLabel: "投入",
        perYearSuffix: "/年",
      },
      cta: {
        headline: "你每年可以挽回 {value}。",
        body: "有 {count} 项任务可以自动化或委派。我们会在定制报价中为实施环节定价。",
        button: "申请自动化报价 →",
      },
      actions: {
        save: "💾 保存",
        loadExample: "加载示例",
        reset: "重置",
        savedCloud: "审计已保存 ✓（云端 + 本地）",
        savedLocal: "审计已保存 ✓（保存在本设备本地）",
        needProfile: "请填写概况以及至少一项任务。",
        loadOk: "审计已加载 ✓",
        loadFail: "无法加载。",
        deleteFail: "无法删除。",
      },
      savedList: {
        title: "我保存的审计",
        perYear: "/年 可挽回",
        cloud: "云端",
        local: "本地",
        load: "加载",
        delete: "删除",
      },
      verdictRule: "判定规则：只有我 + 充满活力 → 保留 · 否则 重新思考。其余情况：任何人 + 规则清晰 → 自动化 · 否则 委派。",
      quoteSeedMain: "对通过\"时间 → 金钱审计\"识别出的 {count} 项任务进行自动化／委派（约 {value}/年 可挽回）",
      quoteSeedTasks: "。任务：{tasks}。",
      quoteSeedEnd: "。",
    },
    visibility: {
      title: "AI 与社媒可见度自评",
      subtitle: "评估你在 AI 答案（GEO）和社交媒体上的曝光度。回答 否／部分／是；得分与建议会实时更新。",
      disclaimer: "这是一项声明式成熟度指标：得分反映的是你自己的回答，并非对 AI 引擎的实测。如需实测审计，请申请行动计划。",
      choices: { non: "否", partiel: "部分", oui: "是" },
      dims: {
        geoTitle: "AI 可见度（GEO / AI 搜索）",
        geoSub: "在 ChatGPT、Perplexity、Gemini、Google AI 中的曝光度与准确性。",
        socialTitle: "社交媒体与内容",
        socialSub: "权威性、有用的指标、稳定性、AI 内容的把控。",
      },
      scoreGlobal: "综合得分（声明式）",
      note: "评级",
      answeredOf: "已回答 {a}/{t}",
      empty: "回答下方的问题——你的成熟度得分与建议将显示在这里。",
      recosTitle: "优先建议",
      geoTag: "GEO",
      socialTag: "社媒",
      cta: {
        headline: "把 {grade} 级转化为一份行动计划。",
        body: "我们会在报价中为你的 {count} 项优先事项的实施定价。",
        button: "获取行动计划 / 报价 →",
      },
      reset: "重置",
      questions: {
        byId: {
          geo_offer:      { label: "AI 工具（ChatGPT、Perplexity、Gemini）是否准确描述了你的产品和你的优势（USP）？", reco: "发布清晰的\"权威信息来源\"页面（产品、USP、定价），让 AI 引擎引用正确的事实。" },
          geo_appear:     { label: "对于你的关键查询，你的品牌是否出现在 AI 答案中？", reco: "在 ChatGPT/Perplexity 中测试你的 10 个关键查询；以出现为目标，补齐缺失的页面。" },
          geo_cited:      { label: "你的网站是否被 AI 引擎作为来源引用？", reco: "找出被引用的第三方来源（Reddit、Quora、媒体）中你缺席的地方 → 形成一份按优先级排序的数字公关清单。" },
          geo_competitor: { label: "你是否了解 AI 如何把你和竞争对手作比较（它更突出谁）？", reco: "审计 AI 答案中的竞争定位，找出让竞争对手胜出的论点。" },
          geo_sentiment:  { label: "AI 对你品牌的情感是否正面且准确？", reco: "在源头（你的网站）修正负面/错误的事实，让 AI 引擎更新对你的认知。" },
          geo_structured: { label: "你是否有结构化内容（FAQ、schema、支柱页面），并经过优化以便被 AI 抓取？", reco: "添加 FAQ、结构化数据（schema.org）和支柱页面，以便作为权威信息来源被抓取。" },
          soc_story:      { label: "你的社媒内容是否通过讲故事来建立权威，而不是堆砌产品演示？", reco: "从功能式刷屏转向讲故事（失败/成功）来建立权威。" },
          soc_meetings:   { label: "你是否衡量所产生的优质会面（而不仅是点赞/曝光量）？", reco: "追踪\"优质会面\"这一指标：真正重要的是它，而不是点赞。" },
          soc_cadence:    { label: "你是否以稳定、可持续的节奏发布内容？", reco: "建立稳定的内容日历（可持续的节奏胜过不规律的爆发）。" },
          soc_unique:     { label: "你的内容是否体现了难以复制的独特专长（\"把自己产品化\"）？", reco: "突出你独特的角度/专长，以摆脱同质化竞争。" },
          soc_repurpose:  { label: "你是否把内容改编成多种形式复用？", reco: "把每一份内容改编成多种形式（帖子、视频、轮播图），以放大触达。" },
          soc_oversight:  { label: "AI 生成的内容是否经过人工把控（防范\"影子社媒\"/幻觉）？", reco: "为 AI 内容增加人工审核，以避免幻觉和真实感的流失。" },
        },
      },
    },
    taskCatalog: {
      groups: {
        admin: "行政事务",
        sales: "销售与开发客户",
        support: "客户支持",
        marketing: "营销与内容",
        finance: "财务与人力资源",
        ops: "运营",
        strategy: "战略",
      },
      tasks: {
        emails_reply: "回复邮件",
        appointments: "预约安排",
        schedule: "日历／日程管理",
        filing: "文档归档",
        cold_calls: "外呼电话（开发客户）",
        followups: "客户跟进",
        quotes_write: "撰写报价单",
        crm_entry: "CRM 数据录入",
        inbound_calls: "来电接听（支持）",
        support_l1: "一级客户支持",
        reviews_faq: "评价回复／FAQ",
        content_social: "社媒内容创作",
        social_planning: "社媒发布排期",
        market_research: "市场调研／监测",
        accounting: "记账／开具发票",
        weekly_report: "每周报告",
        cv_screening: "简历筛选／初选",
        expenses: "费用报销",
        data_entry: "数据录入／编码",
        inventory: "库存跟踪",
        translation: "内容翻译",
        blog_writing: "撰写文章／博客",
        high_prospecting: "高层级开发／会面",
        vision: "战略与愿景",
        onboarding: "客户引导",
        email_support: "客户支持邮件",
        email_sales: "销售跟进邮件",
        meetings_internal: "内部会议",
        meetings_client: "客户会议",
        content_create: "内容创作",
        content_publish: "排期／发布",
        invoice_issue: "开具发票",
        quotes_custom: "定制报价",
        interviews: "候选人面试",
      },
      hints: {
        calls: "含义模糊：是来电（支持）还是外呼（开发客户）？两者的结论不同——请拆分。",
        email: "请具体说明：客户支持、销售跟进，还是内部往来？每种的结论各不相同。",
        meeting: "内部还是客户？例行还是一次性？高价值的客户会议值得保留。",
        content: "区分创作（需判断，保留）和发布／排期（按规则，可自动化）。",
        invoice: "标准开具（规则清晰→自动化）vs 议价／定制（需判断→保留或委派）。",
        report: "如果数据已结构化，报告往往可以自动化。",
        recruit: "简历筛选（标准清晰→可自动化）vs 终面（需人工判断→保留）。",
        data: "输入已结构化？数据录入／复制几乎总是可自动化的。",
        writing: "初稿（AI 辅助，快速）vs 终稿校验／编辑（需人工判断）。",
        translate: "重复性的大批量→可自动化；营销／法律细节→需人工审核。",
        logistics: "路线优化／库存跟踪→可自动化；承运商关系→需人工。",
      },
      seed: {
        emails_slack: "回复邮件／Slack",
        accounting_billing: "记账、开具发票",
        prospecting_clients: "开发客户／客户会面",
        crm_data: "CRM 数据录入",
        social_mgmt: "社媒管理",
        manual_reporting: "手动每周报告",
        planning_agenda: "日历／日程管理",
        client_quote: "客户报价",
      },
    },
  },
};
