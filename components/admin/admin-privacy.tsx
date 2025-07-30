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
    lastUpdated: new Date().toLocaleDateString('ru-RU'),
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
