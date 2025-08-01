"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileText, Clock, CheckCircle, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Database, Lock, Eye, Users, Cookie, Share2, Mail } from "lucide-react"
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
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-8">
          {/* Desktop Loading skeleton */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8">
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

          {/* Mobile Loading skeleton */}
          <div className="lg:hidden space-y-4">
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
      description: 'Основные принципы и область применения',
      gradient: 'from-blue-600 via-purple-600 to-indigo-700'
    },
    {
      id: 'dataCollection',
      title: 'Сбор данных',
      icon: Database,
      content: privacyData.sections.dataCollection,
      description: 'Виды собираемой информации',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600'
    },
    {
      id: 'dataUsage',
      title: 'Использование',
      icon: Eye,
      content: privacyData.sections.dataUsage,
      description: 'Цели обработки данных',
      gradient: 'from-amber-500 via-orange-500 to-red-500'
    },
    {
      id: 'dataSecurity',
      title: 'Безопасность',
      icon: Lock,
      content: privacyData.sections.dataSecurity,
      description: 'Меры защиты информации',
      gradient: 'from-red-600 via-pink-600 to-rose-700'
    },
    {
      id: 'userRights',
      title: 'Права пользователей',
      icon: Users,
      content: privacyData.sections.userRights,
      description: 'Ваши законные права',
      gradient: 'from-violet-600 via-purple-600 to-indigo-700'
    },
    {
      id: 'cookies',
      title: 'Cookies',
      icon: Cookie,
      content: privacyData.sections.cookies,
      description: 'Использование файлов cookies',
      gradient: 'from-yellow-500 via-amber-500 to-orange-600'
    },
    {
      id: 'thirdParty',
      title: 'Третьи лица',
      icon: Share2,
      content: privacyData.sections.thirdParty,
      description: 'Передача данных партнерам',
      gradient: 'from-teal-600 via-cyan-600 to-blue-700'
    },
    {
      id: 'contact',
      title: 'Контакты',
      icon: Mail,
      content: privacyData.sections.contact,
      description: 'Обратная связь',
      gradient: 'from-green-600 via-emerald-600 to-teal-700'
    }
  ]

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const activeContent = sections.find(section => section.id === activeSection)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-slate-900 font-medium">Политика конфиденциальности</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <Shield className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">{privacyData.title}</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
                <span>Обновлено: {privacyData.lastUpdated}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-lg px-3 py-2 shadow-sm border border-indigo-200">
              {sections.length} разделов
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50">
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
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 shadow-sm">
                {sections.length} разделов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Mobile: Messenger style, Desktop: Original */}
      <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <Card key={section.id} className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 transition-all"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20`}>
                      <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">
                            {section.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">
                            {section.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                          <span className="text-xs text-slate-500 bg-gradient-to-br from-slate-100 to-slate-200 rounded px-2 py-1 shadow-sm">
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

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100">
                      <div className="flex space-x-3 p-4">
                        <div className="w-10 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-sm prose-slate max-w-none">
                            {section.content.split('\n\n').map((paragraph, idx) => {
                              if (paragraph.trim().startsWith('•')) {
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

        {/* Desktop Layout - Original Style */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {/* Sidebar navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Содержание</h3>
                  <nav className="space-y-1">
                    {sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group shadow-sm ${
                          activeSection === section.id
                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md'
                            : 'bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-200 ${
                            activeSection === section.id
                              ? 'bg-gradient-to-br from-white/20 to-white/10 border border-white/20'
                              : 'bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-slate-300 group-hover:to-slate-400 border border-slate-300/50'
                          }`}>
                            <section.icon className={`h-3 w-3 ${
                              activeSection === section.id ? 'text-white' : 'text-slate-600'
                            }`} />
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
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50">
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
            <Card className="mt-8 border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-105 transition-transform duration-200 border border-white/20">
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

        {/* Mobile Bottom notice - styled like CTA section */}
        <section className="lg:hidden relative pt-8 pb-32 bg-gradient-to-br from-slate-950 to-blue-800 text-white rounded-t-[30px] -mb-20 overflow-hidden mt-6 -mx-4">
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">
                  Согласие на обработку данных
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">
                Используя наш сайт, вы соглашаетесь с обработкой персональных данных согласно данной политике.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
