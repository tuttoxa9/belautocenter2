"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import {
  Car,
  CreditCard,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Phone,
  CheckCircle,
  ArrowRight,
  Star,
  Calculator,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Handshake,
  Settings,
  Trophy
} from "lucide-react"

const services = [
  {
    id: 'leasing',
    title: 'Лизинг автомобилей',
    description: 'Выгодные условия лизинга с минимальным первоначальным взносом от 10%',
    icon: Car,
    features: ['От 10% первоначальный взнос', 'Срок до 5 лет', 'Быстрое оформление'],
    image: '/car_credit.png',
    gradient: 'from-slate-700 to-slate-800'
  },
  {
    id: 'credit',
    title: 'Кредит от 9%',
    description: 'Автокредит по минимальной ставке от 9% годовых без отказов',
    icon: CreditCard,
    features: ['От 9% годовых', 'Без отказов', 'Решение за 30 минут'],
    image: '/car_credit2.png',
    gradient: 'from-gray-700 to-gray-800'
  },
  {
    id: 'tradein',
    title: 'Trade-in (Трейд-ин)',
    description: 'Обмен вашего старого автомобиля на новый с доплатой',
    icon: RefreshCw,
    features: ['Оценка за 15 минут', 'Юридическая чистота', 'Выгодная цена'],
    image: '/car_credit3.png',
    gradient: 'from-zinc-700 to-zinc-800'
  },
  {
    id: 'buyout',
    title: 'Выкуп автомобилей',
    description: 'Быстрый выкуп вашего автомобиля по рыночной стоимости',
    icon: DollarSign,
    features: ['Оценка в день обращения', 'Расчет наличными', 'Все документы'],
    image: '/mercedes-bg.jpg',
    gradient: 'from-stone-700 to-stone-800'
  },
  {
    id: 'exchange',
    title: 'Обмен автомобилей',
    description: 'Обмен автомобиля на автомобиль без денежных операций',
    icon: TrendingUp,
    features: ['Равноценный обмен', 'Проверка истории', 'Безопасная сделка'],
    image: '/audi-bg.jpg',
    gradient: 'from-neutral-700 to-neutral-800'
  },
  {
    id: 'commission',
    title: 'Комиссионная продажа',
    description: 'Продадим ваш автомобиль быстро и по выгодной цене',
    icon: Shield,
    features: ['Профессиональная фотосъемка', 'Размещение на площадках', 'Сопровождение сделки'],
    image: '/vwt.jpg',
    gradient: 'from-slate-600 to-slate-700'
  }
]

const dealSteps = [
  {
    id: 1,
    title: 'Визит или звонок',
    icon: Phone,
    description: 'Свяжитесь с нами удобным для вас способом или приезжайте к нам в офис по адресу в Минске. Наши специалисты готовы ответить на все ваши вопросы.',
    color: 'from-slate-600 to-slate-700'
  },
  {
    id: 2,
    title: 'Осмотр машины',
    icon: Eye,
    description: 'Если вы находитесь не в Минске, мы можем организовать выезд нашего специалиста к вам для осмотра автомобиля и составления договора на месте.',
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 3,
    title: 'Согласование стоимости',
    icon: DollarSign,
    description: 'Определяем справедливую рыночную цену вашего автомобиля. В процессе оценки учитываем текущее состояние, пробег и рыночную ситуацию.',
    color: 'from-zinc-600 to-zinc-700'
  },
  {
    id: 4,
    title: 'Подготовка документов',
    icon: FileText,
    description: 'Все документы оформляются максимально прозрачно. Составляем акт приема-передачи, а также заключаем с вами договор, где прописываем все условия для обеих сторон.',
    color: 'from-stone-600 to-stone-700'
  },
  {
    id: 5,
    title: 'Подготовка авто',
    icon: Settings,
    description: 'Организуем предпродажную подготовку: чистку и полировку, устранение мелких недостатков, диагностику и устранение технических проблем.',
    color: 'from-neutral-600 to-neutral-700'
  },
  {
    id: 6,
    title: 'Реализация',
    icon: Trophy,
    description: 'Активно занимаемся рекламой и общаемся с потенциальными покупателями. При необходимости помогаем покупателям с оформлением кредита или лизинга.',
    color: 'from-slate-700 to-slate-800'
  },
  {
    id: 7,
    title: 'Завершение сделки',
    icon: Handshake,
    description: 'Вы (или доверенное лицо) получаете оговоренную ранее сумму на руки либо на расчетный лицевой счет.',
    color: 'from-gray-700 to-gray-800'
  }
]

export default function SalePage() {
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '+375',
    message: ''
  })
  const [isVisible, setIsVisible] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'services' | 'process'>('services')

  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          type: 'service_request',
          service: selectedService,
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
        }),
      })

      if (response.ok) {
        submitButtonState.setSuccess(true)
        showSuccess('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
        setFormData({ name: '', phone: '+375', message: '' })
        setSelectedService('')
      } else {
        throw new Error('Ошибка отправки')
      }
    } catch (error) {
      submitButtonState.setError(true)
      console.error('Ошибка отправки заявки:', error)
    }
  }

  const canSubmit = formData.name.trim() && formData.phone.length >= 13

  return (
    <div className="min-h-screen bg-white">
      {/* New Hero Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className={`container mx-auto text-center px-4 md:px-6 max-w-4xl transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6 text-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-slate-700">Официальный дилер • 15+ лет опыта</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
            Профессиональные
            <span className="block text-primary">
              автомобильные услуги
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-slate-600">
            Полный спектр услуг: от лизинга и кредитования до выкупа и комиссионной продажи вашего автомобиля.
          </p>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-slate-900 text-white hover:bg-slate-800 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Наши услуги
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Связаться с нами
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Services Section */}
      <section id="services" className="py-16 md:py-24 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-3 md:px-4 py-1.5 md:py-2 mb-3 md:mb-4">
              <Car className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
              <span className="text-xs md:text-sm font-medium text-slate-700">Наши услуги</span>
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-slate-900 leading-tight">
              Выберите подходящую
              <span className="block text-slate-600">услугу</span>
            </h2>
            <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Мы предлагаем полный спектр автомобильных услуг с индивидуальным подходом к каждому клиенту
            </p>
          </div>

          {/* Tab Navigation */}
          <div className={`flex justify-center mb-6 md:mb-8 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-slate-100 rounded-xl md:rounded-2xl p-1 md:p-2">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  activeTab === 'services'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Услуги
              </button>
              <button
                onClick={() => setActiveTab('process')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  activeTab === 'process'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Процесс работы
              </button>
            </div>
          </div>

          {/* Services Grid */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                const isSelected = selectedService === service.id

                return (
                  <div
                    key={service.id}
                    className={`group bg-white rounded-2xl border transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      isSelected
                        ? 'border-slate-900 shadow-2xl scale-105'
                        : 'border-slate-200 hover:shadow-xl hover:border-slate-300'
                    }`}
                    style={{ transitionDelay: `${100 + index * 100}ms` }}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 mb-4 text-sm min-h-[60px]">
                        {service.description}
                      </p>
                      <div className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`border-t-2 text-center py-3 font-medium text-sm transition-all duration-300 rounded-b-2xl ${
                      isSelected
                        ? 'border-slate-900 text-slate-900 bg-slate-100'
                        : 'border-transparent text-slate-500 group-hover:text-slate-700'
                    }`}>
                      {isSelected ? '✓ Выбрано' : 'Выбрать эту услугу'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Process Steps */}
          {activeTab === 'process' && (
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {dealSteps.map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <div key={step.id} className={`flex items-start gap-6 transform transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: `${100 + index * 100}ms` }}>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {index < dealSteps.length - 1 && (
                          <div className="w-px h-16 bg-slate-200 mt-4"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">
                          {step.id}. {step.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modern Contact Section */}
      <section id="contact-form" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left side - Info */}
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-4">
                <Phone className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Свяжитесь с нами</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                Готовы обсудить ваши потребности?
              </h3>

              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Оставьте заявку, и наш менеджер свяжется с вами в течение 15 минут, чтобы предложить лучшие условия.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Быстрый ответ</h4>
                    <p className="text-slate-600 text-sm">Свяжемся в течение 15 минут</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Индивидуальный расчет</h4>
                    <p className="text-slate-600 text-sm">Персональные условия для вас</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className={`transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 md:p-8">
                {selectedService && (
                  <div className="mb-6 p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="font-semibold text-slate-900 text-sm">
                          Выбранная услуга:
                        </span>
                        <p className="text-slate-700 text-sm">
                          {services.find(s => s.id === selectedService)?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-900 mb-2 block">
                      Ваше имя *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="h-12 text-sm rounded-lg border-slate-300 focus:border-slate-500"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-900 mb-2 block">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="h-12 text-sm rounded-lg border-slate-300 focus:border-slate-500"
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-slate-900 mb-2 block">
                      Комментарий (необязательно)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="text-sm rounded-lg border-slate-300 focus:border-slate-500 resize-none"
                      placeholder="Расскажите подробнее..."
                      rows={3}
                    />
                  </div>

                  <StatusButton
                    {...submitButtonState}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 text-base font-semibold rounded-lg bg-slate-900 hover:bg-slate-800"
                  >
                    Отправить заявку
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </StatusButton>

                  <p className="text-center text-xs text-slate-500">
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="/privacy" className="underline hover:text-slate-900">
                      политикой конфиденциальности
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
