"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusButton } from "@/components/ui/status-button"
import { X, ChevronLeft, Car, Phone, MessageCircle, Instagram, DollarSign, RotateCcw, TrendingUp } from "lucide-react"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { getCachedImageUrl } from "@/lib/image-cache"

interface SaleModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  carMake: string
  carModel: string
  estimatedPrice: string
  isInterestedInExchange: boolean
  isInterestedInTradeIn: boolean
  phone: string
}

export default function SaleModal({ isOpen, onClose }: SaleModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    carMake: "",
    carModel: "",
    estimatedPrice: "",
    isInterestedInExchange: false,
    isInterestedInTradeIn: false,
    phone: "+375"
  })

  // Блокируем скролл основной страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Очищаем стили при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const [funnelSettings, setFunnelSettings] = useState({
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

  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  // Загружаем настройки воронки из Firebase
  useEffect(() => {
    const loadFunnelSettings = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore")
        const { db } = await import("@/lib/firebase")

        const docRef = doc(db, "settings", "funnel")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setFunnelSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error("Ошибка загрузки настроек воронки:", error)
      }
    }

    loadFunnelSettings()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      submitButtonState.setLoading(true)

      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sale_funnel',
          carMake: formData.carMake,
          carModel: formData.carModel,
          estimatedPrice: formData.estimatedPrice,
          isInterestedInExchange: formData.isInterestedInExchange,
          isInterestedInTradeIn: formData.isInterestedInTradeIn,
          phone: formData.phone,
          message: `Заявка на продажу автомобиля: ${formData.carMake} ${formData.carModel}, оценочная стоимость: ${formData.estimatedPrice}`,
        }),
      })

      if (response.ok) {
        submitButtonState.setSuccess(true)
        showSuccess(funnelSettings.successMessage)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error('Ошибка отправки')
      }
    } catch (error) {
      submitButtonState.setError(true)
      console.error('Ошибка отправки заявки:', error)
    }
  }

  const canProceedStep1 = formData.carMake.trim() && formData.carModel.trim() && formData.estimatedPrice.trim()
  const canSubmit = formData.phone.length >= 13 // +375 + 9 цифр

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-2 sm:mx-4 mb-0 sm:mb-4
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        max-h-[90vh] sm:max-h-[85vh] flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-2 md:gap-3">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevStep}
                className="p-1"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
            <h2 className="text-base md:text-lg font-semibold">
              Продажа автомобиля
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 md:px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground mb-2">
            <span>Шаг {currentStep} из 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
            <div
              className="bg-primary h-1.5 md:h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Hero Image Section - верхняя часть модального окна */}
        {currentStep === 1 && (
          <div className="relative h-32 md:h-40 overflow-hidden rounded-lg md:rounded-xl mx-4 md:mx-6 mt-4 md:mt-6">
            {funnelSettings.heroImage && (
              <div className="relative w-full h-full">
                <img
                  src={getCachedImageUrl(funnelSettings.heroImage)}
                  alt="Hero"
                  className="w-full h-full object-cover rounded-lg md:rounded-xl opacity-0 transition-opacity duration-500"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4 md:p-6 rounded-lg md:rounded-xl">
              <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white drop-shadow-lg">Мы продадим ваш автомобиль быстро!</h3>
              <p className="text-white text-xs md:text-sm font-medium drop-shadow-md">
                В БелАвто Центре доступна комиссионная продажа!
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* Step 1: Car Info */}
          {currentStep === 1 && (
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">
                  Марка автомобиля *
                </label>
                <Input
                  value={formData.carMake}
                  onChange={(e) => handleInputChange('carMake', e.target.value)}
                  className="h-10 md:h-11 text-sm rounded-lg"
                  placeholder="Например: Toyota"
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">
                  Модель автомобиля *
                </label>
                <Input
                  value={formData.carModel}
                  onChange={(e) => handleInputChange('carModel', e.target.value)}
                  className="h-10 md:h-11 text-sm rounded-lg"
                  placeholder="Например: Camry"
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">
                  Ваша оценочная стоимость *
                </label>
                <Input
                  value={formData.estimatedPrice}
                  onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                  className="h-10 md:h-11 text-sm rounded-lg"
                  placeholder="Например: $25,000"
                />
              </div>

              <div className="space-y-2 md:space-y-3 pt-3 md:pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exchange"
                    checked={formData.isInterestedInExchange}
                    onCheckedChange={(checked) => handleInputChange('isInterestedInExchange', !!checked)}
                  />
                  <label htmlFor="exchange" className="text-xs md:text-sm">
                    Меня интересует обмен
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tradeIn"
                    checked={formData.isInterestedInTradeIn}
                    onCheckedChange={(checked) => handleInputChange('isInterestedInTradeIn', !!checked)}
                  />
                  <label htmlFor="tradeIn" className="text-xs md:text-sm">
                    Меня интересует trade-in
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-3 md:space-y-4">
              <div className="text-center mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{funnelSettings.step2Title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {funnelSettings.step2Subtitle}
                </p>
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium mb-1 md:mb-2 block">
                  Номер телефона *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-10 md:h-11 text-sm rounded-lg"
                  placeholder="+375 (29) 123-45-67"
                />
              </div>
            </div>
          )}

          {/* Step 3: Final */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm">
                  <Car className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{funnelSettings.step3Title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">
                  {funnelSettings.step3Subtitle}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
                <h4 className="font-semibold text-gray-900 text-base md:text-lg mb-3 md:mb-4">Ваши данные</h4>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Car className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-xs md:text-sm font-medium">{formData.carMake} {formData.carModel}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-md">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-xs md:text-sm font-medium">{formData.estimatedPrice}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-xs md:text-sm font-medium">{formData.phone}</span>
                </div>

                {formData.isInterestedInExchange && (
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-stone-600 to-stone-700 flex items-center justify-center flex-shrink-0 shadow-md">
                      <RotateCcw className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs md:text-sm font-medium">Интересует обмен</span>
                  </div>
                )}

                {formData.isInterestedInTradeIn && (
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center flex-shrink-0 shadow-md">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="text-gray-700 text-xs md:text-sm font-medium">Интересует trade-in</span>
                  </div>
                )}
              </div>

              {/* Alternative contact methods */}
              <div className="border-t pt-3 md:pt-4">
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 text-center">
                  Или свяжитесь с нами напрямую:
                </p>
                <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                  {funnelSettings.telegramLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 text-xs"
                      onClick={() => window.open(funnelSettings.telegramLink, '_blank')}
                    >
                      <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Telegram</span>
                    </Button>
                  )}
                  {funnelSettings.instagramLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 text-xs"
                      onClick={() => window.open(funnelSettings.instagramLink, '_blank')}
                    >
                      <Instagram className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Instagram</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 md:gap-2 text-xs"
                    onClick={() => window.open(`tel:${funnelSettings.phoneNumber}`, '_blank')}
                  >
                    <Phone className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Позвонить</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t bg-gray-50">
          {currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 1 ? !canProceedStep1 : currentStep === 2 ? !canSubmit : false}
              className="w-full h-11 md:h-12 text-sm md:text-base rounded-lg md:rounded-xl"
            >
              {currentStep === 2 ? 'Отправить заявку' : 'Продолжить'}
            </Button>
          ) : (
            <StatusButton
              {...submitButtonState}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-11 md:h-12 text-sm md:text-base rounded-lg md:rounded-xl"
            >
              Отправить заявку
            </StatusButton>
          )}
        </div>
      </div>
    </div>
  )
}
