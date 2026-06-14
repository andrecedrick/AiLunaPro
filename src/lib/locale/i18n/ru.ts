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
  audit: {
    "express": {
      "q": {
        "workflow": {
          "label": "Какую область вы хотели бы улучшить в первую очередь?",
          "opt": {
            "support": "Поддержка клиентов",
            "sales": "Продажи",
            "finance": "Финансы",
            "documents": "Документы",
            "reporting": "Отчётность",
            "admin": "Администрирование",
            "compliance": "Комплаенс",
            "marketing": "Маркетинг",
            "hr": "HR"
          }
        },
        "monthlyHours": {
          "label": "Примерно сколько часов в месяц уходит на рутинную работу?",
          "opt": {
            "low": "Немного (~20)",
            "medium": "Умеренно (~80)",
            "high": "Много (~160)"
          }
        },
        "hourlyCost": {
          "label": "Примерная средняя стоимость часа такой работы?",
          "opt": {
            "low": "Ниже (~$25)",
            "medium": "Средняя (~$45)",
            "high": "Выше (~$75)"
          }
        },
        "aiUsage": {
          "label": "Как сегодня используется AI в вашей организации?",
          "opt": {
            "none": "Пока никак",
            "individual": "Индивидуально",
            "team": "В разных командах",
            "structured": "В структурированных рабочих процессах"
          }
        },
        "shadowAi": {
          "label": "Насколько вы видите, какие AI-инструменты используются?",
          "opt": {
            "no_visibility": "Совсем нет",
            "partial_visibility": "Частично",
            "mostly_visible": "В основном",
            "full_inventory": "Полный реестр"
          }
        }
      },
      "run": {
        "title": "Запустить Audit Express",
        "subtitle": "Быстрый ориентировочный срез готовности к AI — автоматически сохраняется в вашем рабочем пространстве.",
        "errPreviewCode": "Не удалось выполнить предпросмотр ({code}).",
        "errPreview": "Не удалось выполнить предпросмотр.",
        "errAnalysisCode": "Анализ недоступен ({code}).",
        "errAnalysis": "Анализ недоступен. Пожалуйста, попробуйте снова.",
        "errDocCode": "Анализ документа недоступен ({code}).",
        "errDoc": "Анализ документа недоступен. Пожалуйста, попробуйте снова.",
        "analyzeSiteTitle": "Проанализировать публичный сайт (необязательно)",
        "analyzeSiteHint": "Читает только публичные страницы, соблюдает robots.txt. Дополняет раздел «Чем занимается этот бизнес».",
        "deepScan": "Глубокое сканирование (медленнее, больше страниц)",
        "saving": "Сохранение вашего результата…",
        "journeyHeadline": "Вот что означает ваш срез",
        "journeyReadiness": "Готовность к AI: {bucket} ({score}/100).",
        "journeyTimeSaved": "Оценочная экономия времени ≈ {hours} часов/месяц.",
        "journeyCostSaved": "Оценочная экономия затрат ≈ ${amount}/месяц."
      },
      "cta": {
        "computing": "Вычисление…",
        "getPreview": "Получить предпросмотр",
        "analyzing": "Анализ…",
        "analyzeSite": "Проанализировать сайт",
        "preparing": "Подготовка…",
        "downloadPdf": "Скачать PDF",
        "viewSaved": "Посмотреть сохранённые аудиты",
        "seeAgents": "Посмотреть агентов, подобранных под ваш аудит →",
        "runFullAudit": "Запустить полный аудит",
        "extracting": "Извлечение…",
        "analyzeDocument": "Проанализировать документ →",
        "save": "Сохранить",
        "cancel": "Отмена"
      },
      "result": {
        "snapshotHeading": "Ваш срез · Готовность к AI: {bucket} ({score}/100)",
        "whatThisMeans": "Что это означает",
        "opportunityLabel": "Возможность — ориентировочные диапазоны",
        "timeBack": "Высвобожденное время",
        "timeBackValue": "{range} (≈ {low}–{high} h/yr)",
        "costImpact": "Влияние на затраты",
        "costImpactValue": "{range} (≈ {low}–{high}/yr)",
        "payback": "Окупаемость",
        "howSavingLabel": "Как достигается экономия",
        "flowRepetitive": "рутинные задачи",
        "flowAssisted": "с помощью AI / автоматизированно",
        "flowSameWork": "та же работа, меньше ручного времени",
        "flowHoursBack": "высвобожденные часы для более ценной работы",
        "roiUnavailable": "Оценка ROI для этого аудита недоступна.",
        "whatToDoFirst": "С чего начать",
        "step1": "Выберите одну объёмную задачу (ответы поддержки, ввод счетов, отчётность).",
        "step2": "Запустите на ней одного ассистента в пилотном режиме на ~2 недели.",
        "step3": "Измерьте часы до/после — оставьте то, что окупается.",
        "businessHeading": "Чем занимается этот бизнес",
        "businessType": "Тип:",
        "businessAudience": "Аудитория:",
        "businessConfidence": "достоверность {confidence}",
        "businessUnknown": "неизвестно",
        "offers": "Предложения: {list}",
        "automationHeading": "Возможности автоматизации",
        "opportunityItem": "{title} — влияние {impact} / усилия {effort}"
      }
    }
  },
  dashboard: {
    "analytics": {
      "title": "Динамика оценки",
      "subtitle": "Оценка зрелости ИИ во времени",
      "empty": {
        "title": "Тренды появляются после нескольких аудитов",
        "hint": "После того как вы отправите несколько аудитов в этом рабочем пространстве, ваша оценка зрелости ИИ будет построена здесь на основе вашей реальной истории."
      }
    },
    "automation": {
      "title": "Возможности автоматизации",
      "subtitle": "С учётом вашего использования ИИ",
      "empty": {
        "title": "Запустите аудит, чтобы получить персональные возможности",
        "hint": "Возможности автоматизации формируются на основе ваших ответов в аудите и реестра ИИ. Завершите аудит и добавьте свои инструменты ИИ, чтобы увидеть рекомендации здесь."
      }
    },
    "businessImpact": {
      "title": "Влияние на бизнес",
      "subtitle": "Измеримые результаты вашей программы соответствия",
      "empty": {
        "title": "Метрики влияния появятся по мере развития вашей программы",
        "hint": "Проводите аудиты со временем, чтобы накопить историю. Снижение рисков, прогресс управления и сэкономленное время будут рассчитаны на основе вашей реальной истории — без оценочных значений."
      }
    },
    "recentReports": {
      "title": "Недавние отчёты",
      "countOne": "Создан {n} отчёт",
      "countOther": "Создано отчётов: {n}",
      "viewAll": "Показать все →",
      "empty": {
        "title": "Отчётов пока нет",
        "hint": "Создайте отчёт из отправленного аудита — он появится здесь и в разделе «Отчёты» для этого рабочего пространства."
      }
    },
    "kpi": {
      "auditsSubmitted": "Отправлено аудитов",
      "reportsGenerated": "Создано отчётов",
      "aiToolsRegistered": "Зарегистрировано инструментов ИИ",
      "loadErrorSuffix": " — не удалось загрузить"
    },
    "maturity": {
      "rung": {
        "initial": "Начальный",
        "managed": "Управляемый",
        "defined": "Определённый",
        "advanced": "Продвинутый",
        "optimal": "Оптимальный"
      }
    },
    "cta": {
      "poweredBy": "На платформе Luna AI",
      "scheduleDemo": "Запланировать демо",
      "startFreeTrial": "Начать бесплатный период →"
    }
  },
  topbar: {
    "title": {
      "dashboard": "Панель управления",
      "audit/new": "Новый аудит",
      "audit/result": "Результат аудита",
      "audit/assistance": "Руководство по внедрению",
      "audit/history": "История аудитов",
      "reports": "Отчёты",
      "reports/detail": "Отчёт",
      "reports/share": "Общий отчёт",
      "registry": "Реестр AI",
      "system-builder": "Конструктор систем",
      "agents": "Агенты",
      "agents/detail": "Агент",
      "team": "Команда",
      "settings": "Настройки",
      "billing": "Биллинг",
      "billing/tokens": "Токены",
      "help": "Помощь",
      "audit-express/run": "Запустить Audit Express",
      "audit-express/saved": "Сохранённые аудиты",
      "audit-express/detail": "Сохранённый аудит"
    },
    "subtitle": {
      "dashboard": "Обзор соответствия AI"
    },
    "search": {
      "placeholder": "Поиск аудитов, отчётов…",
      "toast": "Поиск «{query}»…"
    },
    "dateRange": {
      "last7": "Последние 7 дней",
      "last30": "Последние 30 дней",
      "thisMonth": "Этот месяц",
      "lastMonth": "Прошлый месяц",
      "customRange": "Произвольный диапазон…",
      "from": "С",
      "to": "По",
      "apply": "Применить диапазон",
      "toast": "Диапазон дат: {label}",
      "errPickBoth": "Укажите дату начала и дату окончания.",
      "errOrder": "Дата начала должна быть раньше даты окончания."
    },
    "notifications": {
      "label": "Уведомления",
      "title": "Уведомления",
      "empty": "Уведомлений пока нет."
    },
    "tokens": {
      "aria": "Осталось токенов: {n} — управление токенами",
      "title": "Осталось токенов: {n} · нажмите для управления",
      "balance": "{used} / {total}",
      "corruptTitle": "Баланс токенов содержит некорректные данные — нажмите для восстановления",
      "corruptLabel": "Требуется восстановление токенов"
    },
    "luna": {
      "aria": "Открыть Luna, вашего помощника",
      "title": "Luna — ваш помощник",
      "label": "Luna"
    },
    "theme": {
      "toDark": "Переключить на тёмную тему",
      "toLight": "Переключить на светлую тему"
    },
    "newAudit": {
      "label": "Новый аудит",
      "denied": "Ваша роль не позволяет создавать аудиты. Аудиты доступны для ролей «Владелец», «Администратор» и «Участник»."
    },
    "sidebar": {
      "openMenu": "Открыть меню навигации",
      "closeMenu": "Закрыть меню навигации",
      "menu": "Меню",
      "expand": "Развернуть боковую панель",
      "collapse": "Свернуть боковую панель"
    }
  },
  auditForm: {
    "title": "Новый аудит",
    "subtitle": "Пройдите 8 разделов, чтобы оценить ваш уровень соответствия AI. Ваш прогресс сохраняется автоматически — вы можете выйти и вернуться в любое время.",
    "loading": "Загрузка аудита…",
    "forbiddenTitle": "Ваша роль не позволяет создавать аудиты",
    "forbiddenBody": "Аудиты доступны для ролей «Владелец», «Администратор» и «Участник». Обратитесь к владельцу или администратору рабочего пространства, если вам нужен доступ к аудитам.",
    "errorLoad": "Не удалось загрузить аудит. Обновите страницу, чтобы повторить попытку.",
    "pageTitle": "Новый аудит",
    "pageIntro": "Пройдите 8 разделов, чтобы оценить ваш уровень соответствия AI. Ваш прогресс сохраняется автоматически — вы можете выйти и вернуться в любое время.",
    "stepOf": "Шаг {current} из {total}",
    "overallProgress": "Общий прогресс",
    "previous": "← Назад",
    "saveDraft": "Сохранить черновик",
    "saveContinue": "Сохранить и продолжить →",
    "submit": "Отправить аудит ✓",
    "saved": "✓ Сохранено"
  },
  settingsPages: {
    "shell": {
      "title": "Настройки",
      "subtitle": "Управляйте вашим профилем, организацией и настройками."
    },
    "tabs": {
      "profile": "Профиль",
      "org": "Организация",
      "preferences": "Настройки",
      "billing": "Биллинг"
    },
    "profile": {
      "sectionTitle": "Профиль",
      "avatarHint": "Аватар создаётся из ваших инициалов. Загрузка собственного изображения появится позже.",
      "displayName": "Отображаемое имя",
      "displayNamePlaceholder": "Ваше полное имя",
      "email": "Эл. почта",
      "emailPlaceholder": "you@example.com",
      "emailVerificationTitle": "Подтверждение эл. почты",
      "emailVerified": "✓ Ваша эл. почта подтверждена.",
      "sendVerification": "Отправить письмо для подтверждения",
      "sendingVerification": "Отправка…",
      "passwordTitle": "Пароль",
      "passwordHint": "Мы отправим ссылку для сброса на вашу эл. почту. Ссылка действительна в течение одного часа.",
      "sendPasswordReset": "Отправить письмо для сброса пароля",
      "sendingReset": "Отправка…",
      "savedToast": "Профиль обновлён."
    },
    "org": {
      "sectionTitle": "Организация",
      "fallbackName": "Рабочее пространство",
      "nameLabel": "Название организации",
      "namePlaceholder": "Acme Corp",
      "ownerOnlyNotice": "Только владелец рабочего пространства может переименовать или удалить организацию.",
      "planTitle": "Тариф",
      "dangerZoneTitle": "Опасная зона",
      "dangerZoneHint": "Удаление организации удаляет все её данные: аудиты, отчёты, реестр и участников команды. Это действие необратимо.",
      "deleteButton": "Удалить организацию…",
      "deleteDialogTitle": "Удалить «{name}»?",
      "deleteDialogBody1": "Это навсегда удалит организацию, все её аудиты, отчёты, элементы реестра и членство в команде.",
      "deleteDialogBody2": "Вам будет предложено подтвердить ещё раз, прежде чем какие-либо данные будут затронуты.",
      "deleteConfirmLabel": "Я понимаю, продолжить",
      "renamedToast": "Организация переименована.",
      "deletionDeferredToast": "Удаление организации будет включено на более позднем этапе разработки бэкенда."
    },
    "billing": {
      "sectionTitle": "Биллинг",
      "checkingAccess": "Проверка доступа…"
    }
  },
  common: {
    "saveChanges": "Сохранить изменения",
    "saving": "Сохранение…",
    "cancel": "Отмена",
    "loading": "Загрузка…",
    "save": "Сохранить",
    "confirm": "Подтвердить",
    "close": "Закрыть",
    "tryAgain": "Повторить попытку",
    "reloadPage": "Перезагрузить страницу",
    "retryNow": "Повторить сейчас",
    "reload": "Перезагрузить",
    "somethingWentWrong": "Что-то пошло не так",
    "couldntLoadThePage": "Не удалось загрузить страницу",
    "stillConnecting": "Подключение…"
  },
  journey: {
    "label": {
      "choice": "Выбор",
      "audit": "Аудит",
      "understanding": "Анализ",
      "adoption": "Внедрение"
    },
    "hint": {
      "choice": "Выберите, как начать — Audit Express для быстрого обзора или Новый аудит для углублённой оценки.",
      "audit": "Завершите ваш аудит — мы объясним, что это значит и что делать дальше.",
      "understanding": "Вот что означает ваш аудит. Изучите выводы, затем выберите следующий шаг."
    },
    "progress": {
      "ariaLabel": "Прогресс пошагового сопровождения"
    },
    "chooseAuditType": "Выбрать тип аудита →",
    "dismissAriaLabel": "Закрыть пошаговое сопровождение",
    "dismiss": "Закрыть",
    "next": {
      "whatNext": "Что бы вы хотели сделать дальше?",
      "recommendedTag": "Рекомендуется",
      "backToDashboard": "Назад к панели управления",
      "cta": {
        "agents": {
          "title": "Посмотреть рекомендованных агентов",
          "body": "Инструменты, подобранные под ваш аудит, которые помогут сэкономить время на отмеченных вами задачах."
        },
        "billing": {
          "title": "Изучить подписку",
          "body": "Тарифы, токены и что в них входит — внедряйте в своём темпе."
        },
        "systemBuilder": {
          "title": "Открыть Конструктор систем",
          "body": "Руководство только для чтения по проектированию вашей AI-системы по шести измерениям."
        }
      }
    },
    "start": {
      "greetingTitle": "Здравствуйте, я Luna — давайте начнём.",
      "greetingBody": "Выберите, как вы хотите начать. Вы можете переключиться в любое время и всегда можете перейти прямо к вашей панели управления.",
      "heading": "Как вы хотите начать?",
      "express": {
        "title": "Audit Express",
        "body": "Быстрый снимок готовности к AI примерно за 5 минут — несколько коротких вопросов, опциональный анализ сайта, ориентировочный ROI. Лучше всего для первого взгляда.",
        "cta": "Запустить Audit Express →"
      },
      "full": {
        "title": "Новый аудит (полный)",
        "body": "Полная структурированная анкета — более глубокая оценка соответствия и зрелости, которую можно превратить в отчёт для совместного доступа. Лучше всего для тщательной оценки.",
        "cta": "Создать новый аудит →"
      },
      "skip": "Пропустить — перейти прямо к панели управления"
    }
  },
  auth: {
    "login": {
      "title": "Вход",
      "subtitle": "С возвращением в AiLunaPro",
      "forgotPassword": "Забыли пароль?",
      "signingIn": "Вход…",
      "signInButton": "Войти",
      "noAccountPrompt": "Нет аккаунта?",
      "signUpLink": "Зарегистрироваться"
    },
    "field": {
      "emailAddress": "Адрес эл. почты",
      "password": "Пароль",
      "fullName": "Полное имя",
      "workEmail": "Рабочая эл. почта"
    },
    "placeholder": {
      "email": "you@company.com",
      "fullName": "Иван Петров"
    },
    "signup": {
      "title": "Создайте аккаунт",
      "subtitle": "Начните ваш путь к соответствию AI",
      "passwordHint": "Минимум 8 символов",
      "creatingAccount": "Создание аккаунта…",
      "createAccountButton": "Создать аккаунт",
      "haveAccountPrompt": "Уже есть аккаунт?",
      "signInLink": "Войти"
    },
    "forgot": {
      "title": "Сброс пароля",
      "subtitleSent": "Проверьте вашу почту — мы отправили ссылку для сброса.",
      "subtitle": "Введите вашу эл. почту, и мы отправим вам ссылку для сброса.",
      "sentDetail": "Проверьте папку «Спам», если письмо не пришло.",
      "backToSignIn": "← Назад ко входу",
      "sending": "Отправка…",
      "sendResetLink": "Отправить ссылку для сброса",
      "rememberPrompt": "Вспомнили пароль?",
      "signInLink": "Войти"
    },
    "invite": {
      "titleParsing": "Чтение приглашения…",
      "titleAuthRequired": "Войдите, чтобы принять",
      "titleVerifying": "Проверка приглашения…",
      "titleAccepting": "Добавляем вас в рабочее пространство…",
      "titleDone": "Добро пожаловать в команду!",
      "titleError": "Проблема с приглашением",
      "authRequiredBody": "Войдите или создайте аккаунт, чтобы принять это приглашение.",
      "redirecting": "Перенаправление…",
      "pleaseWait": "Пожалуйста, подождите немного.",
      "createAccountButton": "Создать аккаунт",
      "signInButton": "Войти",
      "backToDashboard": "Назад к панели управления"
    },
    "card": {
      "logoAlt": "AiLunaPro"
    }
  },
};
