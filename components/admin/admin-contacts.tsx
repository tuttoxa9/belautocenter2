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
import { Save, Loader2, MapPin, Phone, Mail, Clock, Instagram } from "lucide-react"
import { useButtonState } from "@/hooks/use-button-state"

interface ContactsData {
  title?: string
  subtitle?: string
  address?: string
  addressNote?: string
  phone?: string
  phoneNote?: string
  email?: string
  emailNote?: string
  workingHours?: {
    weekdays?: string
    weekends?: string
  }
  socialMedia?: {
    instagram?: {
      name?: string
      url?: string
    }
    telegram?: {
      name?: string
      url?: string
    }
    avby?: {
      name?: string
      url?: string
    }
    tiktok?: {
      name?: string
      url?: string
    }
  }
}

export default function AdminContacts() {
  const [loading, setLoading] = useState(true)
  const saveButtonState = useButtonState()
  const [contactsData, setContactsData] = useState<ContactsData>({
    title: "Контакты",
    subtitle: "Свяжитесь с нами любым удобным способом",
    address: "г. Минск, ул. Примерная, 123",
    addressNote: "Напротив торгового центра",
    phone: "+375 29 123-45-67",
    phoneNote: "Звонки принимаем с 9:00 до 21:00",
    email: "info@belavto.by",
    emailNote: "Отвечаем в течение 2 часов",
    workingHours: {
      weekdays: "Пн-Пт: 9:00-21:00",
      weekends: "Сб-Вс: 10:00-20:00"
    },
    socialMedia: {
      instagram: {
        name: "@belavto_center",
        url: "https://instagram.com/belavto_center"
      },
      telegram: {
        name: "@belavto_bot",
        url: "https://t.me/belavto_bot"
      },
      avby: {
        name: "АвтоБел Центр",
        url: "https://av.by/company/belavto"
      },
      tiktok: {
        name: "@belavto_center",
        url: "https://tiktok.com/@belavto_center"
      }
    }
  })

  useEffect(() => {
    loadContactsData()
  }, [])

  const loadContactsData = async () => {
    try {
      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        const data = contactsDoc.data() as ContactsData
        setContactsData(data)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных контактов:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "pages", "contacts"), contactsData)
      saveButtonState.setSuccess()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      saveButtonState.setError()
    }
  }

  const updateField = (field: string, value: any) => {
    setContactsData(prev => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (parentField: string, childField: string, value: any) => {
    setContactsData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof ContactsData],
        [childField]: value
      }
    }))
  }

  const updateSocialMedia = (platform: string, field: string, value: string) => {
    setContactsData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: {
          ...(prev.socialMedia?.[platform as keyof NonNullable<ContactsData['socialMedia']>] || {}),
          [field]: value
        }
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Управление контактами</h2>
          <p className="text-gray-600">Редактирование контактной информации и социальных сетей</p>
        </div>
        <div className="sm:w-64">
          <StatusButton
            onClick={handleSave}
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700"
            state={saveButtonState.state}
            size="lg"
            successText="Сохранено!"
            errorText="Ошибка"
            loadingText="Сохраняем..."
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить изменения
          </StatusButton>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Заголовок страницы</Label>
                <Input
                  id="title"
                  value={contactsData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Подзаголовок</Label>
                <Input
                  id="subtitle"
                  value={contactsData.subtitle || ""}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Контактная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Контактная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  value={contactsData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="addressNote">Пометка к адресу</Label>
                <Input
                  id="addressNote"
                  value={contactsData.addressNote || ""}
                  onChange={(e) => updateField("addressNote", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={contactsData.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phoneNote">Пометка к телефону</Label>
                <Input
                  id="phoneNote"
                  value={contactsData.phoneNote || ""}
                  onChange={(e) => updateField("phoneNote", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactsData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emailNote">Пометка к email</Label>
                <Input
                  id="emailNote"
                  value={contactsData.emailNote || ""}
                  onChange={(e) => updateField("emailNote", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Часы работы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Часы работы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekdays">Будние дни</Label>
                <Input
                  id="weekdays"
                  value={contactsData.workingHours?.weekdays || ""}
                  onChange={(e) => updateNestedField("workingHours", "weekdays", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weekends">Выходные</Label>
                <Input
                  id="weekends"
                  value={contactsData.workingHours?.weekends || ""}
                  onChange={(e) => updateNestedField("workingHours", "weekends", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Социальные сети */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Социальные сети
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instagram */}
            <div>
              <h4 className="font-medium mb-2">Instagram</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramName">Название</Label>
                  <Input
                    id="instagramName"
                    value={contactsData.socialMedia?.instagram?.name || ""}
                    onChange={(e) => updateSocialMedia("instagram", "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instagramUrl">URL</Label>
                  <Input
                    id="instagramUrl"
                    value={contactsData.socialMedia?.instagram?.url || ""}
                    onChange={(e) => updateSocialMedia("instagram", "url", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Telegram */}
            <div>
              <h4 className="font-medium mb-2">Telegram</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telegramName">Название</Label>
                  <Input
                    id="telegramName"
                    value={contactsData.socialMedia?.telegram?.name || ""}
                    onChange={(e) => updateSocialMedia("telegram", "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="telegramUrl">URL</Label>
                  <Input
                    id="telegramUrl"
                    value={contactsData.socialMedia?.telegram?.url || ""}
                    onChange={(e) => updateSocialMedia("telegram", "url", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AV.by */}
            <div>
              <h4 className="font-medium mb-2">AV.by</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avbyName">Название</Label>
                  <Input
                    id="avbyName"
                    value={contactsData.socialMedia?.avby?.name || ""}
                    onChange={(e) => updateSocialMedia("avby", "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="avbyUrl">URL</Label>
                  <Input
                    id="avbyUrl"
                    value={contactsData.socialMedia?.avby?.url || ""}
                    onChange={(e) => updateSocialMedia("avby", "url", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* TikTok */}
            <div>
              <h4 className="font-medium mb-2">TikTok</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tiktokName">Название</Label>
                  <Input
                    id="tiktokName"
                    value={contactsData.socialMedia?.tiktok?.name || ""}
                    onChange={(e) => updateSocialMedia("tiktok", "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktokUrl">URL</Label>
                  <Input
                    id="tiktokUrl"
                    value={contactsData.socialMedia?.tiktok?.url || ""}
                    onChange={(e) => updateSocialMedia("tiktok", "url", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
