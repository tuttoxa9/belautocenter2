"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusButton } from "@/components/ui/status-button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ImageUpload from "./image-upload"

interface FunnelSettings {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  step1Title: string
  step1Subtitle: string
  step2Title: string
  step2Subtitle: string
  step3Title: string
  step3Subtitle: string
  telegramLink: string
  instagramLink: string
  phoneNumber: string
  successMessage: string
}

export default function AdminFunnel() {
  const [settings, setSettings] = useState<FunnelSettings>({
    heroTitle: "Продайте свой автомобиль выгодно!",
    heroSubtitle: "Заполните информацию о вашем автомобиле",
    heroImage: "",
    step1Title: "О вашем автомобиле",
    step1Subtitle: "Расскажите нам о марке, модели и оценочной стоимости",
    step2Title: "Как с вами связаться?",
    step2Subtitle: "Введите номер телефона для связи",
    step3Title: "Почти готово!",
    step3Subtitle: "Мы получим вашу заявку и свяжемся в течение 15 минут",
    telegramLink: "",
    instagramLink: "",
    phoneNumber: "+375 (29) 123-45-67",
    successMessage: "Заявка отправлена! Мы свяжемся с вами в ближайшее время."
  })

  const [isLoading, setIsLoading] = useState(true)
  const saveButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const docRef = doc(db, "settings", "funnel")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<FunnelSettings>
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек воронки:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      saveButtonState.setLoading(true)

      const docRef = doc(db, "settings", "funnel")
      await setDoc(docRef, settings, { merge: true })

      saveButtonState.setSuccess(true)
      showSuccess("Настройки воронки сохранены")
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error)
      saveButtonState.setError(true)
    }
  }

  const handleInputChange = (field: keyof FunnelSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Воронка продажи</h2>
          <p className="text-muted-foreground">
            Настройте тексты и изображения для воронки продажи автомобилей
          </p>
        </div>
        <StatusButton state={saveButtonState.state} onClick={handleSave}>
          Сохранить
        </StatusButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Основные настройки */}
        <Card>
          <CardHeader>
            <CardTitle>Главный экран</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heroTitle">Заголовок</Label>
              <Input
                id="heroTitle"
                value={settings.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                placeholder="Продайте свой автомобиль выгодно!"
              />
            </div>

            <div>
              <Label htmlFor="heroSubtitle">Подзаголовок</Label>
              <Textarea
                id="heroSubtitle"
                value={settings.heroSubtitle}
                onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                placeholder="Заполните информацию о вашем автомобиле"
                rows={2}
              />
            </div>

            <div>
              <Label>Главное изображение</Label>
              <ImageUpload
                value={settings.heroImage}
                onChange={(url) => handleInputChange('heroImage', url)}
                bucket="funnel-images"
              />
            </div>
          </CardContent>
        </Card>

        {/* Настройки шагов */}
        <Card>
          <CardHeader>
            <CardTitle>Шаги воронки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="step1Title">Шаг 1 - Заголовок</Label>
              <Input
                id="step1Title"
                value={settings.step1Title}
                onChange={(e) => handleInputChange('step1Title', e.target.value)}
                placeholder="О вашем автомобиле"
              />
            </div>

            <div>
              <Label htmlFor="step1Subtitle">Шаг 1 - Подзаголовок</Label>
              <Textarea
                id="step1Subtitle"
                value={settings.step1Subtitle}
                onChange={(e) => handleInputChange('step1Subtitle', e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="step2Title">Шаг 2 - Заголовок</Label>
              <Input
                id="step2Title"
                value={settings.step2Title}
                onChange={(e) => handleInputChange('step2Title', e.target.value)}
                placeholder="Как с вами связаться?"
              />
            </div>

            <div>
              <Label htmlFor="step2Subtitle">Шаг 2 - Подзаголовок</Label>
              <Textarea
                id="step2Subtitle"
                value={settings.step2Subtitle}
                onChange={(e) => handleInputChange('step2Subtitle', e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="step3Title">Шаг 3 - Заголовок</Label>
              <Input
                id="step3Title"
                value={settings.step3Title}
                onChange={(e) => handleInputChange('step3Title', e.target.value)}
                placeholder="Почти готово!"
              />
            </div>

            <div>
              <Label htmlFor="step3Subtitle">Шаг 3 - Подзаголовок</Label>
              <Textarea
                id="step3Subtitle"
                value={settings.step3Subtitle}
                onChange={(e) => handleInputChange('step3Subtitle', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Контакты */}
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Номер телефона</Label>
              <Input
                id="phoneNumber"
                value={settings.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+375 (29) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="telegramLink">Ссылка на Telegram</Label>
              <Input
                id="telegramLink"
                value={settings.telegramLink}
                onChange={(e) => handleInputChange('telegramLink', e.target.value)}
                placeholder="https://t.me/username"
              />
            </div>

            <div>
              <Label htmlFor="instagramLink">Ссылка на Instagram</Label>
              <Input
                id="instagramLink"
                value={settings.instagramLink}
                onChange={(e) => handleInputChange('instagramLink', e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
          </CardContent>
        </Card>

        {/* Сообщения */}
        <Card>
          <CardHeader>
            <CardTitle>Сообщения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="successMessage">Сообщение об успешной отправке</Label>
              <Textarea
                id="successMessage"
                value={settings.successMessage}
                onChange={(e) => handleInputChange('successMessage', e.target.value)}
                placeholder="Заявка отправлена! Мы свяжемся с вами в ближайшее время."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Превью ссылки */}
      <Card>
        <CardHeader>
          <CardTitle>Ссылка на воронку</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value="https://belautocenter.by/sale"
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText("https://belautocenter.by/sale")
                showSuccess("Ссылка скопирована!")
              }}
            >
              Копировать
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Используйте эту ссылку в рекламных объявлениях
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
