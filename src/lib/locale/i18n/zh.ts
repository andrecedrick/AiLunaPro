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
};
