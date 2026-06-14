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
        "journeyCostSaved": "预计节省成本 ≈ ${amount}/月。"
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
      "heading": "您想如何开始？",
      "express": {
        "title": "Audit Express",
        "body": "一份快速的、约 5 分钟的 AI 就绪情况概览 — 几个快速问题、可选的网站分析以及指示性 ROI。最适合初步了解。",
        "cta": "开始 Audit Express →"
      },
      "full": {
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
};
