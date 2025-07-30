"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileText, Clock, CheckCircle, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PrivacyData {
  title: string
  lastUpdated: string
  sections: {
    introduction: string
    dataCollection: string
    dataUsage: string
    dataSecurity: string
    userRights: string
    cookies: string
    thirdParty: string
    contact: string
  }
}

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('introduction')
  const [privacyData, setPrivacyData] = useState<PrivacyData>({
    title: "Политика конфиденциальности",
    lastUpdated: "15.01.2025",
    sections: {
      introduction: `Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных пользователей веб-сайта и клиентов автохауса "БелАвто Центр". Мы привержены защите вашей конфиденциальности и обеспечиваем высокий уровень безопасности персональных данных в соответствии с требованиями законодательства Республики Беларусь.

Данная политика применяется ко всем пользователям нашего сайта, клиентам автохауса и лицам, обращающимся за консультациями или услугами. Используя наш веб-сайт, обращаясь в автохаус или предоставляя нам свои персональные данные любым способом, вы подтверждаете согласие с условиями данной Политики конфиденциальности.

Мы оставляем за собой право обновлять данную политику в соответствии с изменениями в законодательстве или деятельности компании. О всех существенных изменениях мы уведомляем пользователей заблаговременно.`,

      dataCollection: `Автохаус "БелАвто Центр" собирает следующие категории персональных данных:

• Контактная информация: ФИО, номер телефона, адрес электронной почты, почтовый адрес
• Документальные данные: паспортные данные, данные водительского удостоверения (при необходимости)
• Финансовая информация: сведения о доходах для оформления кредита/лизинга, банковские реквизиты
• Техническая информация: IP-адрес, тип браузера, операционная система, время посещения сайта
• Предпочтения клиента: интересующие модели автомобилей, ценовой диапазон, способ покупки
• Информация об автомобиле: данные о trade-in автомобиле, техническое состояние
• Коммуникационные данные: история переписки, записи телефонных разговоров (с согласия)

Персональные данные собираются исключительно с вашего добровольного согласия при:
- Заполнении форм на сайте
- Личном обращении в автохаус
- Телефонном звонке
- Подписании договоров и соглашений
- Участии в маркетинговых акциях`,

      dataUsage: `Собранные персональные данные используются автохаусом исключительно в следующих целях:

• Консультирование по выбору автомобиля и предоставление информации о моделях, ценах, характеристиках
• Обработка заявок на покупку, кредитование и лизинг автомобилей
• Организация и проведение тест-драйвов
• Оценка автомобилей по программе trade-in
• Оформление документов купли-продажи, постановки на учет, страхования
• Взаимодействие с банками-партнерами и лизинговыми компаниями
• Послепродажное обслуживание и техническая поддержка
• Информирование о новых поступлениях, акциях и специальных предложениях (с согласия)
• Проведение маркетинговых исследований и улучшение качества услуг
• Выполнение обязательств по законодательству (налоговое, валютное регулирование)
• Урегулирование споров и рассмотрение жалоб

Данные не используются для целей, не связанных с деятельностью автохауса. Обработка осуществляется на основании согласия субъекта данных, договорных обязательств или требований законодательства.`,

      dataSecurity: `Автохаус "БелАвто Центр" применяет комплексные меры защиты персональных данных:

Технические меры безопасности:
• SSL-шифрование для защиты данных при передаче через интернет
• Защищенные серверы с многоуровневой системой аутентификации
• Регулярное обновление программного обеспечения и систем безопасности
• Антивирусная защита и мониторинг сетевой активности
• Резервное копирование данных с шифрованием архивов

Организационные меры:
• Ограничение доступа к персональным данным только уполномоченными сотрудниками
• Обучение персонала правилам обработки персональных данных
• Документооборот с соблюдением требований конфиденциальности
• Контроль действий сотрудников при работе с персональными данными
• Назначение ответственного за обеспечение безопасности персональных данных

Физическая защита:
• Охраняемые помещения с ограниченным доступом
• Видеонаблюдение в местах хранения документов
• Сейфы для хранения документов с персональными данными
• Контроль доступа в серверные помещения

Мы постоянно совершенствуем меры защиты в соответствии с развитием технологий и изменениями в законодательстве.`,

      userRights: `В соответствии с Законом Республики Беларусь "О защите персональных данных", каждый субъект персональных данных имеет следующие права:

Право на информацию:
• Получение сведений о том, какие персональные данные обрабатываются
• Информация о целях и правовых основаниях обработки
• Срок обработки и хранения данных

Право на доступ:
• Получение копии обрабатываемых персональных данных
• Информация об источниках получения данных
• Категории лиц, которым могут быть переданы данные

Право на исправление:
• Внесение изменений в неточные или неполные данные
• Дополнение персональных данных

Право на удаление ("право на забвение"):
• Требование удаления персональных данных при отсутствии законных оснований для обработки
• Удаление данных по истечении срока их обработки

Право на ограничение обработки:
• Приостановление обработки данных на время рассмотрения споров
• Ограничение обработки при оспаривании точности данных

Право на отзыв согласия:
• Отзыв согласия на обработку персональных данных в любое время
• Прекращение получения маркетинговых сообщений

Для реализации своих прав обращайтесь к нам любым удобным способом. Мы рассматриваем обращения в течение 15 рабочих дней и предоставляем ответ в письменном виде или по электронной почте.`,

      cookies: `Веб-сайт автохауса "БелАвто Центр" использует файлы cookies и аналогичные технологии для обеспечения функциональности и улучшения пользовательского опыта:

Типы используемых cookies:

Необходимые cookies:
• Обеспечивают базовую функциональность сайта
• Запоминают настройки безопасности и согласия
• Поддерживают сеансы пользователей

Функциональные cookies:
• Запоминают ваши предпочтения (язык, регион)
• Сохраняют данные форм при переходах между страницами
• Персонализируют контент в соответствии с интересами

Аналитические cookies:
• Google Analytics для анализа посещаемости сайта
• Яндекс.Метрика для изучения поведения пользователей
• Статистика популярности разделов и страниц

Маркетинговые cookies (с согласия):
• Ретаргетинг в социальных сетях
• Персонализированная реклама
• Отслеживание эффективности рекламных кампаний

Управление cookies:
Вы можете управлять использованием cookies через настройки браузера. Отключение необходимых cookies может ограничить функциональность сайта. Для отключения аналитических и маркетинговых cookies используйте настройки согласия на нашем сайте.

Также мы используем пиксели отслеживания, веб-маяки и локальное хранилище для улучшения работы сайта и анализа пользовательского опыта.`,

      thirdParty: `Автохаус "БелАвто Центр" может передавать персональные данные третьим лицам только в случаях и на условиях, предусмотренных настоящей политикой:

Банки-партнеры:
• БелВЭБ, Беларусбанк, БПС-Сбербанк для оформления кредитов
• Передаются данные, необходимые для кредитной заявки
• Заключены соглашения о конфиденциальности

Лизинговые компании:
• БЛК Лизинг, Райффайзен-Лизинг для оформления лизинга
• Передача данных происходит с письменного согласия клиента
• Обеспечивается защита данных на уровне партнеров

Страховые компании:
• БелВЭБ Страхование, Белгосстрах для оформления полисов
• Передаются минимально необходимые данные для страхования
• Соблюдаются требования конфиденциальности

Государственные органы:
• ГАИ для постановки автомобилей на учет
• Налоговые органы при необходимости отчетности
• Передача осуществляется на основании требований законодательства

Поставщики услуг:
• IT-компании для технической поддержки сайта
• Службы доставки для отправки документов
• Аудиторские и консалтинговые компании

Гарантии защиты:
• Все партнеры подписывают соглашения о неразглашении
• Передаются только необходимые для выполнения услуги данные
• Контролируется соблюдение требований безопасности
• Данные не передаются для маркетинговых целей третьих лиц без согласия

Международная передача данных осуществляется только в страны с адекватным уровнем защиты персональных данных.`,

      contact: `По всем вопросам, связанным с обработкой персональных данных, защитой конфиденциальности и реализацией ваших прав, обращайтесь к нам:

Адрес автохауса:
220002, г. Минск, пр. Независимости, 125
(ориентир: рядом с ТЦ "Столица")

Контактные телефоны:
+375 17 123-45-67 (офис, пн-пт 9:00-19:00, сб-вс 10:00-18:00)
+375 29 123-45-67 (менеджер по работе с клиентами)
+375 29 765-43-21 (WhatsApp, Viber, Telegram)

Электронная почта:
info@belavtocenter.by (общие вопросы)
privacy@belavtocenter.by (вопросы по персональным данным)
manager@belavtocenter.by (менеджер по продажам)

Ответственный за обеспечение безопасности персональных данных:
Петров Алексей Викторович
Должность: Заместитель директора по безопасности
Телефон: +375 17 123-45-68
Email: security@belavtocenter.by

Руководитель организации:
Сидоров Максим Александрович, Директор
ООО "БелАвто Центр"
УНП: 123456789
Лицензия на осуществление деятельности по оказанию услуг по купле-продаже автотранспортных средств №02330/0756439 от 15.03.2023

График работы:
Понедельник-Пятница: 9:00-19:00
Суббота-Воскресенье: 10:00-18:00
Без перерыва на обед

Мы гарантируем рассмотрение всех обращений в течение 15 рабочих дней с момента получения. Ответ предоставляется в письменном виде по почте или электронной почте в зависимости от способа обращения. Консультации по телефону предоставляются в рабочее время.

При обращении просим указывать характер вопроса и контактные данные для оперативного реагирования.`
    }
  })

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    try {
      const privacyDoc = await getDoc(doc(db, "pages", "privacy"))
      if (privacyDoc.exists()) {
        setPrivacyData(privacyDoc.data() as PrivacyData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Loading skeleton */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sections = [
    {
      id: 'introduction',
      title: 'Общие положения',
      icon: FileText,
      content: privacyData.sections.introduction,
      description: 'Основные принципы и область применения'
    },
    {
      id: 'dataCollection',
      title: 'Сбор данных',
      icon: Shield,
      content: privacyData.sections.dataCollection,
      description: 'Виды собираемой информации'
    },
    {
      id: 'dataUsage',
      title: 'Использование',
      icon: CheckCircle,
      content: privacyData.sections.dataUsage,
      description: 'Цели обработки данных'
    },
    {
      id: 'dataSecurity',
      title: 'Безопасность',
      icon: Shield,
      content: privacyData.sections.dataSecurity,
      description: 'Меры защиты информации'
    },
    {
      id: 'userRights',
      title: 'Права пользователей',
      icon: CheckCircle,
      content: privacyData.sections.userRights,
      description: 'Ваши законные права'
    },
    {
      id: 'cookies',
      title: 'Cookies',
      icon: FileText,
      content: privacyData.sections.cookies,
      description: 'Использование файлов cookies'
    },
    {
      id: 'thirdParty',
      title: 'Третьи лица',
      icon: ExternalLink,
      content: privacyData.sections.thirdParty,
      description: 'Передача данных партнерам'
    },
    {
      id: 'contact',
      title: 'Контакты',
      icon: FileText,
      content: privacyData.sections.contact,
      description: 'Обратная связь'
    }
  ]

  const activeContent = sections.find(section => section.id === activeSection)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-slate-700 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-4 w-4" /></li>
              <li className="text-slate-900 font-medium">Политика конфиденциальности</li>
            </ol>
          </nav>

          {/* Title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{privacyData.title}</h1>
                <div className="flex items-center space-x-2 mt-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Обновлено: {privacyData.lastUpdated}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-slate-600">
                {sections.length} разделов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Содержание</h3>
                  <nav className="space-y-1">
                    {sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group ${
                          activeSection === section.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                            activeSection === section.id
                              ? 'bg-white/20'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}>
                            <span className={`text-xs font-bold ${
                              activeSection === section.id ? 'text-white' : 'text-slate-600'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className={`font-medium text-sm ${
                              activeSection === section.id ? 'text-white' : 'text-slate-900'
                            }`}>
                              {section.title}
                            </div>
                            <div className={`text-xs ${
                              activeSection === section.id ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content area */}
          <div className="lg:col-span-3">
            {activeContent && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                      <activeContent.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{activeContent.title}</h2>
                      <p className="text-slate-600 text-sm mt-1">{activeContent.description}</p>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    {activeContent.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.trim().startsWith('•')) {
                        // Handle bullet points
                        const items = paragraph.split('\n').filter(item => item.trim().startsWith('•'))
                        return (
                          <ul key={idx} className="space-y-2 my-6">
                            {items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0" />
                                <span className="text-slate-700 leading-relaxed">
                                  {item.replace('•', '').trim()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )
                      } else {
                        return (
                          <p key={idx} className="text-slate-700 leading-relaxed mb-6 whitespace-pre-line">
                            {paragraph.trim()}
                          </p>
                        )
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom notice */}
            <Card className="mt-8 border-0 shadow-sm bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Согласие на обработку персональных данных
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Используя наш сайт и предоставляя персональные данные, вы выражаете согласие на их обработку
                      в соответствии с настоящей политикой. Мы гарантируем защиту ваших данных и их использование
                      исключительно для указанных целей.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
