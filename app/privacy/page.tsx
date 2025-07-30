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
    lastUpdated: "01.01.2024",
    sections: {
      introduction: "",
      dataCollection: "",
      dataUsage: "",
      dataSecurity: "",
      userRights: "",
      cookies: "",
      thirdParty: "",
      contact: ""
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
