"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileText, Clock, CheckCircle, ArrowRight, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Mobile-friendly loading skeleton */}
          <div className="space-y-4">
            <div className="h-16 bg-slate-200 rounded-lg animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-4 bg-white rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
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

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-slate-700 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-slate-900 font-medium">Политика конфиденциальности</li>
            </ol>
          </nav>

          {/* Compact Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">{privacyData.title}</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Обновлено: {privacyData.lastUpdated}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-1">
              {sections.length} разделов
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Messenger style */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <Card key={section.id} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {/* Section Header - Messenger style */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Icon - fixed size, left aligned */}
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content - flexible, right side */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm lg:text-base truncate">
                            {section.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">
                            {section.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                          <span className="text-xs text-slate-500 bg-slate-100 rounded px-2 py-1">
                            {index + 1}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      <div className="flex space-x-3 p-4">
                        {/* Icon spacer to align with content */}
                        <div className="w-10 flex-shrink-0"></div>

                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-sm prose-slate max-w-none">
                            {section.content.split('\n\n').map((paragraph, idx) => {
                              if (paragraph.trim().startsWith('•')) {
                                // Handle bullet points
                                const items = paragraph.split('\n').filter(item => item.trim().startsWith('•'))
                                return (
                                  <ul key={idx} className="space-y-2 my-4 list-none">
                                    {items.map((item, itemIdx) => (
                                      <li key={itemIdx} className="flex items-start space-x-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-slate-700 text-sm leading-relaxed">
                                          {item.replace('•', '').trim()}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )
                              } else {
                                return (
                                  <p key={idx} className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
                                    {paragraph.trim()}
                                  </p>
                                )
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Compact Bottom notice */}
        <Card className="mt-6 border-0 shadow-sm bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm mb-2">
                  Согласие на обработку данных
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Используя наш сайт, вы соглашаетесь с обработкой персональных данных согласно данной политике.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
