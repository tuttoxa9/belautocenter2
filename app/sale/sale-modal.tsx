"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusButton } from "@/components/ui/status-button"
import { X, ChevronLeft, Car, Phone, MessageCircle, Instagram, DollarSign, RotateCcw, TrendingUp, CheckCircle } from "lucide-react"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { isPhoneValid } from "@/lib/validation"

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
    if (!isPhoneValid(formData.phone)) {
      return
    }

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
    }
  }

  const canProceedStep1 = formData.carMake.trim() && formData.carModel.trim() && formData.estimatedPrice.trim()
  const canSubmit = isPhoneValid(formData.phone)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 modal-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative glass-dark rounded-2xl w-full max-w-md
        transform transition-all duration-500 ease-out
        ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'}
        max-h-full flex flex-col text-white
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevStep}
                className="text-white hover:bg-white/10 hover:text-white rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              Заявка на продажу
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span>Шаг {currentStep} из 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* Step 1: Car Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold">{funnelSettings.step1Title}</h3>
                <p className="text-slate-400">{funnelSettings.step1Subtitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Марка автомобиля *</label>
                <Input
                  value={formData.carMake}
                  onChange={(e) => handleInputChange('carMake', e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                  placeholder="Например: Toyota"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Модель автомобиля *</label>
                <Input
                  value={formData.carModel}
                  onChange={(e) => handleInputChange('carModel', e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                  placeholder="Например: Camry"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Ваша оценочная стоимость *</label>
                <Input
                  value={formData.estimatedPrice}
                  onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                  placeholder="Например: $25,000"
                />
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox id="exchange" checked={formData.isInterestedInExchange} onCheckedChange={(checked) => handleInputChange('isInterestedInExchange', !!checked)} className="border-white/20" />
                  <label htmlFor="exchange" className="text-sm text-slate-300">Меня интересует обмен</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="tradeIn" checked={formData.isInterestedInTradeIn} onCheckedChange={(checked) => handleInputChange('isInterestedInTradeIn', !!checked)} className="border-white/20" />
                  <label htmlFor="tradeIn" className="text-sm text-slate-300">Меня интересует trade-in</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold">{funnelSettings.step2Title}</h3>
                <p className="text-slate-400">{funnelSettings.step2Subtitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Номер телефона *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg"
                  placeholder="+375 (29) 123-45-67"
                />
              </div>
            </div>
          )}

          {/* Step 3: Final */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold">{funnelSettings.step3Title}</h3>
                <p className="text-slate-400">{funnelSettings.step3Subtitle}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-lg mb-2">Ваши данные</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><Car className="h-5 w-5 text-yellow-400" /></div>
                  <span className="text-slate-300 text-sm">{formData.carMake} {formData.carModel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><DollarSign className="h-5 w-5 text-yellow-400" /></div>
                  <span className="text-slate-300 text-sm">{formData.estimatedPrice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><Phone className="h-5 w-5 text-yellow-400" /></div>
                  <span className="text-slate-300 text-sm">{formData.phone}</span>
                </div>
                {formData.isInterestedInExchange && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><RotateCcw className="h-5 w-5 text-yellow-400" /></div>
                    <span className="text-slate-300 text-sm">Интересует обмен</span>
                  </div>
                )}
                {formData.isInterestedInTradeIn && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><TrendingUp className="h-5 w-5 text-yellow-400" /></div>
                    <span className="text-slate-300 text-sm">Интересует trade-in</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          {currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 1 ? !canProceedStep1 : currentStep === 2 ? !canSubmit : false}
              className="w-full h-12 text-base rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold"
            >
              {currentStep === 1 ? 'Продолжить' : 'Подтвердить и отправить'}
            </Button>
          ) : (
            <StatusButton
              {...submitButtonState}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 text-base rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold"
            >
              Отправить заявку
            </StatusButton>
          )}
        </div>
      </div>
    </div>
  )
}
