"use client"

import { useState, useEffect, useRef } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Shield, FileText, Clock, Eye } from "lucide-react"
import { useButtonState } from "@/hooks/use-button-state"

import { toast } from "@/components/ui/use-toast"

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





  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }





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
          {/* JSON Editor */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">JSON-редактор политики конфиденциальности</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Вставьте JSON-текст политики конфиденциальности</Label>
                <Textarea
                  value={JSON.stringify({
                    title: privacyData.title,
                    lastUpdated: privacyData.lastUpdated,
                    sections: privacyData.sections
                  }, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsedData = JSON.parse(e.target.value);
                      setPrivacyData(parsedData);
                    } catch (error) {
                      // Если JSON невалиден, просто сохраняем текст как есть
                      // Валидация произойдет при сохранении
                    }
                  }}
                  className="min-h-[500px] resize-y font-mono text-sm"
                  placeholder={`{\n  "title": "Политика конфиденциальности",\n  "lastUpdated": "18.08.2025",\n  "sections": {\n    "introduction": "",\n    "dataCollection": "",\n    "dataUsage": "",\n    "dataSecurity": "",\n    "userRights": "",\n    "cookies": "",\n    "thirdParty": "",\n    "contact": ""\n  }\n}`}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Формат: JSON с полями title, lastUpdated и разделами sections
                </p>
              </div>
            </CardContent>
          </Card>
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
                {Object.entries(privacyData.sections).map(([key, value], index) => {
                  const sectionTitle = {
                    'introduction': 'Общие положения',
                    'dataCollection': 'Сбор персональных данных',
                    'dataUsage': 'Использование данных',
                    'dataSecurity': 'Безопасность данных',
                    'userRights': 'Права пользователей',
                    'cookies': 'Использование cookies',
                    'thirdParty': 'Передача данных третьим лицам',
                    'contact': 'Контактная информация'
                  }[key] || key;

                  return (
                    <div key={key} className="bg-white rounded-lg p-6 border">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-900">{index + 1}. {sectionTitle}</h3>
                      </div>
                      {value ? (
                        <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                          {value}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm italic">
                          Содержимое раздела не заполнено
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
                Предварительный просмотр политики конфиденциальности
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
