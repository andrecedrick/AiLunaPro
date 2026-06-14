/** B6.5 — Russian dictionary. Typed `: Dict` ⇒ compile-time completeness.
 *  LTR. Neutral UI chrome only (no regulatory/disclaimer copy — see en.ts).
 *  Cyrillic renders natively in the UI; PDFs fall back to English (pdfLocale). */
import type { Dict } from './en';

export const ru: Dict = {
  nav: {
    dashboard:             'Панель',
    'new-audit':           'Новый аудит',
    reports:               'Отчёты',
    'audit-history':       'История аудитов',
    'audit-express-run':   'Запустить Audit Express',
    'audit-express-saved': 'Сохранённые аудиты',
    registry:              'Реестр ИИ',
    'system-builder':      'Конструктор систем',
    agents:                'Агенты',
    team:                  'Команда',
    settings:              'Настройки',
    billing:               'Оплата',
    help:                  'Помощь',
  },
  shell: {
    complianceSuite:  'Пакет соответствия',
    signOut:          'Выйти',
    workspaces:       'Рабочие пространства',
    createWorkspace:  'Создать рабочее пространство',
    searchWorkspaces: 'Поиск пространства…',
    language:         'Язык',
    currency:         'Валюта',
  },
  settings: {
    title:               'Настройки',
    themeTitle:          'Тема',
    themeHint:           'Выберите внешний вид AiLunaPro. Применяется сразу.',
    light:               'Светлая',
    dark:                'Тёмная',
    languageTitle:       'Язык',
    languageHint:        'Используется для интерфейса и писем. Перевод выходит по разделам; непереведённые части остаются на английском.',
    currencyTitle:       'Валюта по умолчанию',
    currencyHint:        'Только для отображения. Оплата и пакеты токенов остаются в USD.',
    profileTitle:        'Профиль',
    profileHint:         'Настраивает тон рекомендаций и стартовый ресурс. Никогда не меняет оценку, выводы и нормативные сопоставления.',
    notificationsTitle:  'Уведомления по эл. почте',
    notificationsHint:   'Выберите, какие письма получать. Настройка отправителя появится позже.',
    weeklyDigest:        'Еженедельная сводка соответствия',
    weeklyDigestDesc:    'Сводка новых выводов и решённых задач каждый понедельник.',
    reportReady:         'Отчёт готов',
    reportReadyDesc:     'Сообщить по почте, когда запрошенный отчёт сформирован.',
    teamActivity:        'Активность команды',
    teamActivityDesc:    'Приглашения, изменения ролей и удаления участников в моих пространствах.',
    langToast:           'Язык: {value}',
    currencyToast:       'Валюта: {value}',
    profileToast:        'Профиль: {value}',
  },
  questions: {
    "ui": {
      "sectionsNav": "Разделы аудита",
      "questionCount": "{n} вопросов",
      "yes": "Да",
      "no": "Нет"
    },
    "section": {
      "profile": {
        "title": "Профиль",
        "subtitle": "Краткий обзор вашей организации"
      },
      "ai-tools": {
        "title": "Инструменты AI",
        "subtitle": "Какие инструменты AI реально использует ваша организация?"
      },
      "data": {
        "title": "Данные",
        "subtitle": "Какие данные поступают в ваши системы AI?"
      },
      "governance": {
        "title": "Управление",
        "subtitle": "Политики, ответственность и подотчётность"
      },
      "security": {
        "title": "Безопасность",
        "subtitle": "Защита систем AI и их данных"
      },
      "transparency": {
        "title": "Прозрачность",
        "subtitle": "Раскрытие информации и объяснимость"
      },
      "human-oversight": {
        "title": "Человеческий надзор",
        "subtitle": "Сохранение контроля со стороны человека"
      },
      "training-maturity": {
        "title": "Обучение и зрелость",
        "subtitle": "Насколько ваша организация грамотна в области AI?"
      }
    },
    "field": {
      "profile.org_name": {
        "label": "Название организации",
        "placeholder": "напр. Acme Corp"
      },
      "profile.industry": {
        "label": "Основная отрасль"
      },
      "profile.size": {
        "label": "Размер компании"
      },
      "profile.region": {
        "label": "Основной регион деятельности"
      },
      "tools.categories": {
        "label": "Какие категории AI используются в продакшене?",
        "helper": "Выберите все подходящие варианты."
      },
      "tools.vendors": {
        "label": "Основные поставщики / продукты AI",
        "placeholder": "напр. OpenAI GPT-4, Anthropic Claude, собственная модель на AWS Bedrock…"
      },
      "tools.scope": {
        "label": "Масштаб развёртывания"
      },
      "tools.builds_custom": {
        "label": "Обучаете ли вы собственные модели или выполняете их тонкую настройку?"
      },
      "data.types": {
        "label": "Какие типы данных обрабатываются AI?"
      },
      "data.residency": {
        "label": "Где преимущественно хранятся данные?"
      },
      "data.governance_framework": {
        "label": "Внедрена ли документированная система управления данными?"
      },
      "data.sources": {
        "label": "Опишите ваши основные источники данных",
        "placeholder": "напр. CRM, телеметрия продукта, обращения в поддержку клиентов, сторонние наборы данных…"
      },
      "gov.committee": {
        "label": "Есть ли у вас комитет по управлению AI или назначенный ответственный?"
      },
      "gov.written_policy": {
        "label": "Существует ли письменная политика в области AI, утверждённая руководством?"
      },
      "gov.frameworks": {
        "label": "Каким стандартам вы соответствуете?"
      },
      "gov.structure": {
        "label": "Опишите вашу структуру управления",
        "placeholder": "Кто отвечает за риски AI? Как эскалируются решения?"
      },
      "sec.controls": {
        "label": "Какие меры безопасности применяются для систем AI?"
      },
      "sec.red_team": {
        "label": "Проходили ли ваши системы AI red-team или состязательное тестирование?"
      },
      "sec.incident_readiness": {
        "label": "Насколько вы готовы к инциденту, связанному с AI?"
      },
      "sec.review_process": {
        "label": "Опишите ваш процесс проверки безопасности новых систем AI"
      },
      "trans.disclosure": {
        "label": "Раскрываете ли вы факт использования AI конечным пользователям при взаимодействии с ним?"
      },
      "trans.cards": {
        "label": "Ведёте ли вы карточки моделей или карточки систем?"
      },
      "trans.explainability": {
        "label": "Насколько объяснимы решения вашего AI для затронутых пользователей?"
      },
      "trans.measures": {
        "label": "Опишите ваши меры по обеспечению прозрачности",
        "placeholder": "Публичный реестр AI, раскрытие информации в приложении, журналы аудита, доступные пользователям…"
      },
      "over.model": {
        "label": "Какая модель надзора лучше всего описывает вашу систему?"
      },
      "over.escalation": {
        "label": "Документированы ли процедуры эскалации при ошибках или вреде от AI?"
      },
      "over.review_categories": {
        "label": "Какие категории решений требуют обязательной проверки человеком?"
      },
      "over.processes": {
        "label": "Опишите ваши процессы надзора своими словами"
      },
      "train.staff_training": {
        "label": "Проводите ли вы обучение AI-грамотности для сотрудников?"
      },
      "train.maturity": {
        "label": "Самооценка зрелости соответствия в области AI"
      },
      "train.topics": {
        "label": "Какие темы охватывает ваше обучение?"
      },
      "train.program": {
        "label": "Опишите вашу программу обучения (или чего в ней не хватает)"
      }
    },
    "option": {
      "profile.industry.finance": "Финансы и банковское дело",
      "profile.industry.health": "Здравоохранение и науки о жизни",
      "profile.industry.tech": "Технологии / SaaS",
      "profile.industry.retail": "Розничная торговля и электронная коммерция",
      "profile.industry.public": "Государственный сектор",
      "profile.industry.other": "Другое",
      "profile.size.xs": "1–10 сотрудников",
      "profile.size.s": "11–50",
      "profile.size.m": "51–200",
      "profile.size.l": "201–1000",
      "profile.size.xl": "1000+",
      "profile.region.eu": "Европейский союз",
      "profile.region.uk": "Великобритания",
      "profile.region.us": "Соединённые Штаты",
      "profile.region.ca": "Канада",
      "profile.region.apac": "Азиатско-Тихоокеанский регион",
      "profile.region.global": "Глобально / несколько регионов",
      "tools.categories.llm": "Большие языковые модели (чаты, агенты, копайлоты)",
      "tools.categories.ml": "Классические ML / прогнозные модели",
      "tools.categories.cv": "Компьютерное зрение",
      "tools.categories.speech": "Речь и аудио",
      "tools.categories.rec": "Рекомендательные системы",
      "tools.categories.rpa": "RPA / автоматизация с компонентами AI",
      "tools.scope.pilot": "Только пилоты / эксперименты",
      "tools.scope.internal": "Внутреннее использование сотрудниками",
      "tools.scope.customer": "Функции для клиентов",
      "tools.scope.critical": "Критически важные / регулируемые решения",
      "data.types.pii": "Персональные данные (PII)",
      "data.types.health": "Медицинские данные",
      "data.types.financial": "Финансовые / транзакционные данные",
      "data.types.biometric": "Биометрические данные",
      "data.types.children": "Данные о несовершеннолетних",
      "data.types.public": "Публичные / открытые данные",
      "data.residency.eu": "EU / EEA",
      "data.residency.us": "Соединённые Штаты",
      "data.residency.mixed": "Смешанно / несколько регионов",
      "data.residency.unknown": "Не уверен",
      "gov.frameworks.eu-ai-act": "EU AI Act",
      "gov.frameworks.iso-42001": "ISO/IEC 42001",
      "gov.frameworks.nist-aimrf": "NIST AI RMF",
      "gov.frameworks.soc2": "SOC 2",
      "gov.frameworks.gdpr": "GDPR",
      "gov.frameworks.none": "Формально нет",
      "sec.controls.encryption": "Шифрование при хранении и передаче",
      "sec.controls.rbac": "Управление доступом на основе ролей",
      "sec.controls.audit_logs": "Журналирование аудита доступа к модели и входных данных",
      "sec.controls.secrets": "Управление секретами (без жёстко прописанных ключей)",
      "sec.controls.isolation": "Изоляция арендаторов / данных",
      "sec.incident_readiness.1": "1 — Нет плана",
      "sec.incident_readiness.2": "2 — Неформальный план",
      "sec.incident_readiness.3": "3 — Документирован, но не протестирован",
      "sec.incident_readiness.4": "4 — Документирован и отработан",
      "sec.incident_readiness.5": "5 — Непрерывно, интегрировано с SOC",
      "trans.explainability.none": "Объяснения не предоставляются",
      "trans.explainability.generic": "Только общие пояснения",
      "trans.explainability.category": "Причины на уровне категорий",
      "trans.explainability.individual": "Объяснения по каждому решению по запросу",
      "trans.explainability.realtime": "Объяснения в реальном времени внутри продукта",
      "over.model.hitl": "Человек в контуре (проверяется каждое решение)",
      "over.model.hotl": "Человек над контуром (выборочная проверка)",
      "over.model.oot": "Человек вне контура (автономно)",
      "over.review_categories.hr": "Решения по найму / HR",
      "over.review_categories.credit": "Кредитные / финансовые решения",
      "over.review_categories.health": "Рекомендации, связанные со здоровьем",
      "over.review_categories.content": "Результаты модерации контента",
      "over.review_categories.legal": "Юридические решения / решения по соответствию",
      "train.maturity.1": "1 — Начальный / бессистемный",
      "train.maturity.2": "2 — Развивающийся",
      "train.maturity.3": "3 — Определённый",
      "train.maturity.4": "4 — Управляемый",
      "train.maturity.5": "5 — Оптимизированный",
      "train.topics.bias": "Предвзятость и справедливость",
      "train.topics.privacy": "Конфиденциальность и защита данных",
      "train.topics.security": "Безопасность AI и злоупотребления",
      "train.topics.usage": "Политики допустимого использования",
      "train.topics.incident": "Реагирование на инциденты"
    }
  },
  results: {
    "insightCard": {
      "whatThisMeans": "Что это значит",
      "whyItMatters": "Почему это важно",
      "howItPlaysOut": "Как это проявляется",
      "exampleHeading": "Пример — как выигрывает похожий бизнес",
      "illustrative": "(Для иллюстрации.)",
      "doThisNext": "Сделайте дальше",
      "doThisNextWithHeading": "Сделайте дальше — {heading}",
      "onceDone": "По завершении: {outcome}",
      "referencesPrefix": "Источники: {refs}"
    },
    "explained": {
      "heading": "Что означают ваши результаты",
      "subtitle": "Каждый пункт ниже объясняет, что мы обнаружили, почему это важно и какой самый быстрый следующий шаг — с указанием баллов, которые можно вернуть.",
      "emptyTitle": "Пробелов не выявлено — прочный фундамент",
      "emptyWhatItMeans": "Ваши ответы не вызвали ни одного замечания — ваша практика работы с ИИ уже охватывает базовые проверяемые нами аспекты.",
      "emptyWhyItMatters": "Это надёжная основа. Следующий прирост приходит от последовательного и масштабного применения этих мер контроля.",
      "emptyFlowInput": "хорошие практики",
      "emptyFlowProcess": "сделать их рутиной",
      "emptyFlowOutput": "стабильные меры контроля",
      "emptyFlowGain": "устойчивое, масштабируемое доверие",
      "emptyExample": "Команды на этом этапе переходят от «мы это делаем» к «это работает само по себе», автоматизируя ручные операции. (Для иллюстрации.)",
      "emptyDoNextHeading": "Масштабируйте",
      "emptyDoNextStep1": "Автоматизируйте меры контроля, которые сегодня выполняете вручную.",
      "emptyDoNextStep2": "Периодически проводите повторный аудит, чтобы удержать планку.",
      "ctaSeeAgentsForThis": "Посмотреть агентов, которые это умеют",
      "ctaSeeRecommendedAgents": "Посмотреть рекомендованных агентов",
      "ctaOpenDesignGuide": "Открыть руководство по проектированию",
      "ptsToRecover": "−{n} баллов к возврату",
      "priorityCritical": "Приоритет: критический",
      "priorityHigh": "Приоритет: высокий",
      "priorityMedium": "Приоритет: средний",
      "priorityLow": "Приоритет: низкий",
      "effortBadge": "Усилия: {effort}",
      "effortBadgeDefault": "Усилия: средние",
      "timeframeBadge": "~{days} дн.",
      "timeframeBadgeDefault": "~30 дн."
    },
    "findings": {
      "title": "Замечания",
      "total": "всего: {n}",
      "empty": "✓ Замечаний не выявлено. Продолжайте повышать зрелость с помощью рекомендаций справа.",
      "severityCritical": "Критические",
      "severityHigh": "Высокие",
      "severityMedium": "Средние",
      "severityLow": "Низкие",
      "severityCount": "{label} ({count})",
      "recommendationLink": "→ рекомендаций: {count}"
    },
    "recommendations": {
      "title": "Рекомендации",
      "actionsCount": "действий: {n}",
      "starterResource": "Рекомендованный стартовый ресурс",
      "empty": "На данный момент нет применимых рекомендаций.",
      "impactCritical": "Критический эффект",
      "impactHigh": "Высокий эффект",
      "impactMedium": "Средний эффект",
      "impactLow": "Низкий эффект",
      "timeframeDays": "{n} дн.",
      "addressesFindings": "устраняет замечаний: {count}"
    },
    "actionPlan": {
      "title": "Приоритизированный план действий",
      "roadmapNote": "Дорожная карта показывает, когда выпускать; план действий показывает, что исправить в первую очередь.",
      "bandCriticalTitle": "Критические",
      "bandImportantTitle": "Важные",
      "bandImportantSubtitle": "Краткосрочные — решить в текущем квартале.",
      "bandImprovementTitle": "Улучшения",
      "bandImprovementSubtitle": "Лучшая практика — запланировать для повышения зрелости.",
      "itemCount": "пунктов: {n}",
      "bandEmpty": "В этой категории нет пунктов — сейчас здесь делать нечего.",
      "moreNotShown": "+ ещё {n} не показано",
      "impactPill": "Эффект",
      "effortPill": "Усилия",
      "expectedOutcome": "Ожидаемый результат —"
    }
  },
};
