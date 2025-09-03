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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-700/80 z-10" />
        <Image
          src="/mercedes-new-bg.jpg"
          alt="Автомобили БелАвтоЦентр"
          fill
          className="object-cover"
          priority
        />

        {/* Floating elements for modern design */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl z-5"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl z-5"></div>

        <div className={`relative z-20 text-center text-white px-6 max-w-6xl mx-auto transform transition-all duration-1500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8 border border-white/20">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">Официальный дилер • 15+ лет на рынке</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 drop-shadow-2xl leading-tight">
            Автомобильные
            <span className="block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              услуги
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light text-slate-200 leading-relaxed">
            Полный спектр профессиональных услуг: лизинг, кредитование, trade-in, выкуп и комиссионная продажа автомобилей
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-medium">Быстрое оформление</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="font-medium">Гарантия качества</span>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="font-medium">Лучшие условия</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 rounded-2xl font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Выбрать услугу
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Modern Services Section */}
      <section id="services" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className={`text-center mb-16 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <Car className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Наши услуги</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              Выберите подходящую
              <span className="block text-slate-600">услугу</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Мы предлагаем полный спектр автомобильных услуг с индивидуальным подходом к каждому клиенту
            </p>
          </div>

          {/* Tab Navigation */}
          <div className={`flex justify-center mb-12 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-slate-100 rounded-2xl p-2">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'services'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Услуги
              </button>
              <button
                onClick={() => setActiveTab('process')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                const isSelected = selectedService === service.id

                return (
                  <div
                    key={service.id}
                    className={`group relative bg-white rounded-3xl border-2 overflow-hidden transform transition-all duration-700 cursor-pointer ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } ${
                      isSelected
                        ? 'border-slate-900 shadow-2xl scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xl hover:scale-102'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {/* Service Image */}
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-90`} />

                      {/* Icon */}
                      <div className="absolute top-6 left-6">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-6 right-6">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Overlay with title */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-3 w-3 text-slate-600" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Selection button */}
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className={`text-center font-medium transition-all duration-300 ${
                          isSelected
                            ? 'text-green-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {isSelected ? '✓ Выбрано' : 'Нажмите для выбора'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Process Steps */}
          {activeTab === 'process' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dealSteps.map((step, index) => {
                  const IconComponent = step.icon
                  const isExpanded = expandedStep === step.id

                  return (
                    <div
                      key={step.id}
                      className={`group bg-white rounded-3xl border border-slate-200 overflow-hidden transform transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      } hover:shadow-xl hover:border-slate-300`}
                      style={{ transitionDelay: `${600 + index * 100}ms` }}
                    >
                      <div
                        className="p-8 cursor-pointer"
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <span className="text-white font-bold text-lg">{step.id}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <IconComponent className="h-5 w-5 text-slate-600" />
                              <h4 className="text-xl font-bold text-slate-900">
                                {step.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-sm">Подробнее</span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`transition-all duration-500 overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-slate-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
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
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Info */}
            <div className={`transform transition-all duration-1000 delay-800 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 bg-slate-200 rounded-full px-4 py-2 mb-6">
                <Phone className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Свяжитесь с нами</span>
              </div>

              <h3 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Готовы обсудить
                <span className="block text-slate-600">ваши потребности?</span>
              </h3>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Оставьте заявку и получите персональное предложение в течение 15 минут
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Быстрый ответ</h4>
                    <p className="text-slate-600 text-sm">Свяжемся в течение 15 минут</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Индивидуальный расчет</h4>
                    <p className="text-slate-600 text-sm">Персональные условия для вас</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Полное сопровождение</h4>
                    <p className="text-slate-600 text-sm">Поддержка на всех этапах</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className={`transform transition-all duration-1000 delay-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-10">
                {selectedService && (
                  <div className="mb-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-slate-900">
                        Выбранная услуга:
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 ml-8">
                      {services.find(s => s.id === selectedService)?.title}
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold text-slate-900 mb-3 block">
                      Ваше имя *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="h-12 text-base rounded-xl border-slate-200 focus:border-slate-400"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base font-semibold text-slate-900 mb-3 block">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="h-12 text-base rounded-xl border-slate-200 focus:border-slate-400"
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-base font-semibold text-slate-900 mb-3 block">
                      Комментарий (необязательно)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="text-base rounded-xl border-slate-200 focus:border-slate-400 resize-none"
                      placeholder="Расскажите подробнее о ваших потребностях..."
                      rows={4}
                    />
                  </div>

                  <StatusButton
                    {...submitButtonState}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 transition-all duration-300"
                  >
                    Отправить заявку
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </StatusButton>

                  <p className="text-center text-sm text-slate-500 leading-relaxed">
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="/privacy" className="text-slate-700 underline hover:text-slate-900">
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
