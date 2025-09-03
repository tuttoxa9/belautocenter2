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
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-700/80 z-10" />
        <Image
          src="/mercedes-new-bg.jpg"
          alt="Автомобили БелАвтоЦентр"
          fill
          className="object-cover"
          priority
        />

        {/* Floating elements for modern design */}
        <div className="absolute top-10 md:top-20 left-5 md:left-10 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full blur-xl z-5"></div>
        <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-xl z-5"></div>

        <div className={`relative z-20 text-center text-white px-4 md:px-6 max-w-6xl mx-auto transform transition-all duration-1500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 md:px-4 py-2 mb-6 md:mb-8 border border-white/20 text-sm">
            <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
            <span className="text-xs md:text-sm font-medium">Официальный дилер • 15+ лет опыта</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 drop-shadow-2xl leading-tight">
            Автомобильные
            <span className="block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              услуги
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-4xl mx-auto font-light text-slate-200 leading-relaxed">
            Полный спектр профессиональных услуг: лизинг, кредитование, trade-in, выкуп и комиссионная продажа автомобилей
          </p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-12">
            <div className="flex items-center gap-2 md:gap-3 bg-white/15 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-6 py-2 md:py-3 border border-white/20">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
              <span className="font-medium text-sm md:text-base">Быстрое оформление</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white/15 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-6 py-2 md:py-3 border border-white/20">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
              <span className="font-medium text-sm md:text-base">Гарантия качества</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white/15 backdrop-blur-md rounded-xl md:rounded-2xl px-3 md:px-6 py-2 md:py-3 border border-white/20">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              <span className="font-medium text-sm md:text-base">Лучшие условия</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl md:rounded-2xl font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Выбрать услугу
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </section>

      {/* Modern Services Section */}
      <section id="services" className="py-16 md:py-24 px-4 bg-white rounded-t-3xl -mt-8 relative z-10">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                const isSelected = selectedService === service.id

                return (
                  <div
                    key={service.id}
                    className={`group relative bg-white rounded-2xl md:rounded-3xl border-2 overflow-hidden transform transition-all duration-700 cursor-pointer ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    } ${
                      isSelected
                        ? 'border-slate-900 shadow-xl md:shadow-2xl scale-102 md:scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-lg md:hover:shadow-xl hover:scale-101 md:hover:scale-102'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                    onClick={() => setSelectedService(service.id)}
                  >
                    {/* Service Image */}
                    <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-90`} />

                      {/* Icon */}
                      <div className="absolute top-4 md:top-6 left-4 md:left-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                          <IconComponent className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-4 md:top-6 right-4 md:right-6">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Overlay with title */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg leading-tight">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-6 lg:p-8">
                      <p className="text-slate-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>

                      <div className="space-y-2 md:space-y-3">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-slate-600" />
                            </div>
                            <span className="text-xs md:text-sm text-slate-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Selection button */}
                      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-100">
                        <div className={`text-center font-medium transition-all duration-300 text-sm md:text-base ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {dealSteps.map((step, index) => {
                  const IconComponent = step.icon
                  const isExpanded = expandedStep === step.id

                  return (
                    <div
                      key={step.id}
                      className={`group bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden transform transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      } hover:shadow-lg md:hover:shadow-xl hover:border-slate-300`}
                      style={{ transitionDelay: `${600 + index * 100}ms` }}
                    >
                      <div
                        className="p-4 md:p-6 lg:p-8 cursor-pointer"
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                      >
                        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${step.color} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <span className="text-white font-bold text-base md:text-lg">{step.id}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 md:gap-3 mb-2">
                              <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                              <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                                {step.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-xs md:text-sm">Подробнее</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`transition-all duration-500 overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="pt-3 md:pt-4 border-t border-slate-100">
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
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
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left side - Info */}
            <div className={`transform transition-all duration-1000 delay-800 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 bg-slate-200 rounded-full px-3 md:px-4 py-2 mb-4 md:mb-6">
                <Phone className="h-3 w-3 md:h-4 md:w-4 text-slate-600" />
                <span className="text-xs md:text-sm font-medium text-slate-700">Свяжитесь с нами</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight">
                Готовы обсудить
                <span className="block text-slate-600">ваши потребности?</span>
              </h3>

              <p className="text-lg md:text-xl text-slate-600 mb-6 md:mb-8 leading-relaxed">
                Оставьте заявку и получите персональное предложение в течение 15 минут
              </p>

              {/* Benefits */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm md:text-base">Быстрый ответ</h4>
                    <p className="text-slate-600 text-xs md:text-sm">Свяжемся в течение 15 минут</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Calculator className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm md:text-base">Индивидуальный расчет</h4>
                    <p className="text-slate-600 text-xs md:text-sm">Персональные условия для вас</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Shield className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm md:text-base">Полное сопровождение</h4>
                    <p className="text-slate-600 text-xs md:text-sm">Поддержка на всех этапах</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className={`transform transition-all duration-1000 delay-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-200 p-6 md:p-8 lg:p-10">
                {selectedService && (
                  <div className="mb-6 md:mb-8 p-3 md:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl md:rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      <span className="font-semibold text-slate-900 text-sm md:text-base">
                        Выбранная услуга:
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 ml-6 md:ml-8 text-sm md:text-base">
                      {services.find(s => s.id === selectedService)?.title}
                    </p>
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3 block">
                      Ваше имя *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="h-11 md:h-12 text-sm md:text-base rounded-lg md:rounded-xl border-slate-200 focus:border-slate-400"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3 block">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="h-11 md:h-12 text-sm md:text-base rounded-lg md:rounded-xl border-slate-200 focus:border-slate-400"
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3 block">
                      Комментарий (необязательно)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="text-sm md:text-base rounded-lg md:rounded-xl border-slate-200 focus:border-slate-400 resize-none"
                      placeholder="Расскажите подробнее о ваших потребностях..."
                      rows={3}
                    />
                  </div>

                  <StatusButton
                    {...submitButtonState}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-lg md:rounded-xl bg-slate-900 hover:bg-slate-800 transition-all duration-300"
                  >
                    Отправить заявку
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </StatusButton>

                  <p className="text-center text-xs md:text-sm text-slate-500 leading-relaxed">
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
