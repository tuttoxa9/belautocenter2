"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Shield, FileText, Clock, Eye, ChevronDown, ChevronRight } from "lucide-react"
import { useButtonState } from "@/hooks/use-button-state"

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

export default function AdminPrivacy() {
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const saveButtonState = useButtonState()
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

  const savePrivacyData = async () => {
    try {
      const updatedData = {
        ...privacyData,
        lastUpdated: new Date().toLocaleDateString('ru-RU')
      }
      await setDoc(doc(db, "pages", "privacy"), updatedData)
      setPrivacyData(updatedData)
      saveButtonState.setSuccess()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      saveButtonState.setError()
    }
  }

  const updateSection = (sectionKey: keyof PrivacyData['sections'], value: string) => {
    setPrivacyData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: value
      }
    }))
  }

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey)
    } else {
      newExpanded.add(sectionKey)
    }
    setExpandedSections(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  const sections = [
    {
      key: 'introduction' as keyof PrivacyData['sections'],
      title: 'Общие положения',
      description: 'Введение и основные принципы политики конфиденциальности',
      icon: FileText
    },
    {
      key: 'dataCollection' as keyof PrivacyData['sections'],
      title: 'Сбор персональных данных',
      description: 'Какие данные собираются и как',
      icon: Shield
    },
    {
      key: 'dataUsage' as keyof PrivacyData['sections'],
      title: 'Использование данных',
      description: 'Цели и способы использования персональных данных',
      icon: Eye
    },
    {
      key: 'dataSecurity' as keyof PrivacyData['sections'],
      title: 'Безопасность данных',
      description: 'Меры по защите персональных данных',
      icon: Shield
    },
    {
      key: 'userRights' as keyof PrivacyData['sections'],
      title: 'Права пользователей',
      description: 'Права субъектов персональных данных',
      icon: FileText
    },
    {
      key: 'cookies' as keyof PrivacyData['sections'],
      title: 'Использование cookies',
      description: 'Политика использования файлов cookies',
      icon: FileText
    },
    {
      key: 'thirdParty' as keyof PrivacyData['sections'],
      title: 'Передача данных третьим лицам',
      description: 'Условия передачи данных партнерам',
      icon: Shield
    },
    {
      key: 'contact' as keyof PrivacyData['sections'],
      title: 'Контактная информация',
      description: 'Контакты для обращений по вопросам конфиденциальности',
      icon: FileText
    }
  ]

  const totalChars = Object.values(privacyData.sections).join('').length
  const completedSections = Object.values(privacyData.sections).filter(section => section.trim().length > 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Политика конфиденциальности</h2>
            <p className="text-gray-600">Управление содержимым политики конфиденциальности</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{completedSections}/{sections.length} разделов</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{totalChars.toLocaleString()} символов</span>
            </div>
          </div>
          <StatusButton
            onClick={savePrivacyData}
            variant="default"
            className="bg-slate-900 hover:bg-slate-800"
            state={saveButtonState.state}
            successText="Сохранено!"
            errorText="Ошибка"
            loadingText="Сохраняем..."
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </StatusButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'edit'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Редактирование
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Предварительный просмотр
          </button>
        </nav>
      </div>

      {activeTab === 'edit' ? (
        <div className="space-y-6">
          {/* Basic settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Основные настройки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Заголовок страницы</Label>
                  <Input
                    value={privacyData.title}
                    onChange={(e) => setPrivacyData({ ...privacyData, title: e.target.value })}
                    className="mt-1"
                    placeholder="Политика конфиденциальности"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Дата последнего обновления</Label>
                  <Input
                    value={privacyData.lastUpdated}
                    onChange={(e) => setPrivacyData({ ...privacyData, lastUpdated: e.target.value })}
                    className="mt-1"
                    placeholder="дд.мм.гггг"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const isExpanded = expandedSections.has(section.key)
              const isCompleted = privacyData.sections[section.key].trim().length > 0

              return (
                <Card key={section.key} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(section.key)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <section.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                              <h3 className="font-semibold text-gray-900">{section.title}</h3>
                              {isCompleted && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {privacyData.sections[section.key].length} символов
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <Textarea
                        value={privacyData.sections[section.key]}
                        onChange={(e) => updateSection(section.key, e.target.value)}
                        className="min-h-[200px] resize-y"
                        placeholder={`Введите содержимое раздела "${section.title}"`}
                      />
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* Preview tab */
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Предварительный просмотр</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-8 space-y-6">
              <div className="text-center border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{privacyData.title}</h1>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Обновлено: {privacyData.lastUpdated}</span>
                </div>
              </div>

              <div className="grid gap-6">
                {sections.map((section, index) => (
                  <div key={section.key} className="bg-white rounded-lg p-6 border">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <section.icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{index + 1}. {section.title}</h3>
                    </div>
                    {privacyData.sections[section.key] ? (
                      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {privacyData.sections[section.key]}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm italic">
                        Содержимое раздела не заполнено
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
                Статистика: {completedSections} из {sections.length} разделов заполнено |
                {totalChars.toLocaleString()} символов общего объема
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
