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
  Eye,
  FileText,
  Handshake,
  Settings,
  Trophy,
  Zap,
  Target,
  Users,
  BarChart3,
  Instagram,
  Facebook,
  TrendingDown,
  Sparkles,
  ArrowDown
} from "lucide-react"
import { FaTiktok, FaVk } from "react-icons/fa"

const advantages = [
  {
    id: 'commission',
    icon: DollarSign,
    title: 'Комиссия всего 450$',
    description: 'В то время как конкуренты берут от 800$',
    highlight: 'Экономия до 350$'
  },
  {
    id: 'speed',
    icon: Zap,
    title: 'Быстрая продажа',
    description: 'Эффективная реклама на всех площадках',
    highlight: 'Результат за 7-14 дней'
  },
  {
    id: 'reach',
    icon: Target,
    title: 'Максимальный охват',
    description: 'Instagram, TikTok, Google, VK, Facebook',
    highlight: '100,000+ потенциальных покупателей'
  }
]

const services = [
  {
    id: 'commission',
    title: 'Комиссионная продажа',
    description: 'Профессиональная продажа вашего автомобиля с полным сопровождением',
    icon: Shield,
    features: [
      { text: 'Съёмка видео обзора', icon: Eye },
      { text: 'Красивые фотографии', icon: Eye },
      { text: '450$ входит в стоимость авто', icon: DollarSign },
      { text: 'Размещение на 15+ площадках', icon: BarChart3 }
    ],
    price: '450$'
  },
  {
    id: 'leasing',
    title: 'Лизинг автомобилей',
    description: 'Выгодные лизинговые программы для бизнеса и физических лиц',
    icon: Car,
    features: [
      { text: 'Первый взнос от 10%', icon: DollarSign },
      { text: 'Срок до 5 лет', icon: Clock },
      { text: 'Без скрытых платежей', icon: Shield },
      { text: 'Оформление за 1 день', icon: Zap }
    ],
    price: null
  },
  {
    id: 'credit',
    title: 'Автокредит от 18%',
    description: 'Минимальная ставка и быстрое одобрение без отказов',
    icon: CreditCard,
    features: [
      { text: 'Ставка от 18% годовых', icon: TrendingDown },
      { text: 'Одобрение 99%', icon: CheckCircle },
      { text: 'Решение за 30 минут', icon: Clock },
      { text: 'Без справок о доходах', icon: FileText }
    ],
    price: null
  },
  {
    id: 'tradein',
    title: 'Trade-in (Трейд-ин)',
    description: 'Обмен старого авто на новое с выгодной доплатой',
    icon: RefreshCw,
    features: [
      { text: 'Оценка за 15 минут', icon: Clock },
      { text: 'Максимальная цена за ваш авто', icon: DollarSign },
      { text: 'Проверка юридической чистоты', icon: Shield },
      { text: 'Помощь в выборе нового авто', icon: Car }
    ],
    price: null
  },
  {
    id: 'exchange',
    title: 'Обмен автомобилей',
    description: 'Прямой обмен автомобиля на автомобиль',
    icon: TrendingUp,
    features: [
      { text: 'Равноценный обмен', icon: DollarSign },
      { text: 'Проверка истории авто', icon: FileText },
      { text: 'Юридическая безопасность', icon: Shield },
      { text: 'Без денежных операций', icon: CheckCircle }
    ],
    price: null
  },
  {
    id: 'buyout',
    title: 'Выкуп автомобилей',
    description: 'Быстрый выкуп вашего автомобиля по честной цене',
    icon: DollarSign,
    features: [
      { text: 'Оценка в день обращения', icon: Clock },
      { text: 'Расчет наличными сразу', icon: DollarSign },
      { text: 'Все документы за наш счет', icon: FileText },
      { text: 'Выкуп в любом состоянии', icon: Car }
    ],
    price: null
  }
]

const socialPlatforms = [
  { name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Google Ads', icon: Target, color: '#4285F4' },
  { name: 'VK', icon: FaVk, color: '#0077FF' },
  { name: 'Facebook', icon: Facebook, color: '#1877F2' }
]

const dealSteps = [
  {
    id: 1,
    title: 'Заявка',
    icon: Phone,
    description: 'Оставьте заявку или позвоните нам'
  },
  {
    id: 2,
    title: 'Оценка',
    icon: Calculator,
    description: 'Проведем осмотр и оценим авто'
  },
  {
    id: 3,
    title: 'Договор',
    icon: FileText,
    description: 'Подпишем договор комиссии'
  },
  {
    id: 4,
    title: 'Подготовка',
    icon: Settings,
    description: 'Фото, детейлинг, размещение'
  },
  {
    id: 5,
    title: 'Реклама',
    icon: BarChart3,
    description: 'Продвижение на всех площадках'
  },
  {
    id: 6,
    title: 'Продажа',
    icon: Handshake,
    description: 'Найдем покупателя и закроем сделку'
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
    }
  }

  const canSubmit = formData.name.trim() && formData.phone.length >= 13

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className={`text-center max-w-4xl mx-auto transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 mb-6 border border-white/20">
              <span className="text-sm font-medium text-white">Продайте автомобиль выгоднее</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
              Комиссия всего{' '}
              <span className="text-yellow-400">450$</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-semibold">
              Пока у конкурентов начинается от 800$
            </p>
            <p className="text-lg md:text-xl mb-10 text-white/70 max-w-2xl mx-auto">
              Продаём быстро и эффективно, используя рекламу в Instagram, TikTok, Google, VK, Facebook и активно ведём соцсети
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 text-lg px-8 py-6 rounded-lg font-bold shadow-lg transition-all duration-300"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Оставить заявку
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6 rounded-lg font-semibold transition-all duration-300"
                onClick={() => document.getElementById('advantages')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Узнать подробнее
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Наши преимущества
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Почему клиенты выбирают нас для продажи своих автомобилей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon
              return (
                <div
                  key={advantage.id}
                  className={`relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                  }}
                >
                  <div className="mb-6">
                    <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {advantage.description}
                    </p>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <CheckCircle className="h-5 w-5 text-blue-900" />
                      {advantage.highlight}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Все наши услуги
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Полный спектр автомобильных услуг с индивидуальным подходом
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => {
              const IconComponent = service.icon
              const isSelected = selectedService === service.id

              return (
                <div
                  key={service.id}
                  className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-blue-900 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => setSelectedService(isSelected ? '' : service.id)}
                  style={{ boxShadow: isSelected ? '0 4px 24px rgba(0,0,0,0.08)' : '0 4px 24px rgba(0,0,0,0.04)' }}
                >
                  {/* Price Badge */}
                  {service.price && (
                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                      {service.price}
                    </div>
                  )}

                  {/* Selection Indicator */}
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle className="h-5 w-5 text-white" />}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => {
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-900 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Минималистичная версия */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Как мы работаем
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Прозрачный процесс от заявки до продажи
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Мобильная версия */}
            <div className="block md:hidden space-y-4">
              {dealSteps.map((step) => {
                const IconComponent = step.icon
                return (
                  <div key={step.id} className="flex items-start gap-5 bg-white rounded-xl p-6 shadow-sm" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white font-bold text-lg flex-shrink-0">
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Десктопная версия */}
            <div className="hidden md:block">
              <div className="grid grid-cols-6 gap-8 relative">
                {/* Соединительная линия */}
                <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200" style={{ left: '8.33%', right: '8.33%' }}></div>

                {dealSteps.map((step) => {
                  const IconComponent = step.icon
                  return (
                    <div key={step.id} className="flex flex-col items-center text-center relative">
                      {/* Номер */}
                      <div className="w-16 h-16 rounded-xl bg-blue-900 flex items-center justify-center mb-4 relative z-10">
                        <span className="text-2xl font-bold text-white">{step.id}</span>
                      </div>

                      {/* Иконка */}
                      <div className="mb-3">
                        <IconComponent className="h-6 w-6 text-blue-900" />
                      </div>

                      {/* Текст */}
                      <h4 className="font-bold text-gray-900 text-base mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Section - Social Media + Contact Form */}
      <section id="contact-form" className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Левая половина - Активное продвижение в соцсетях */}
          <div className="bg-blue-900 p-8 md:p-12 lg:p-16 relative overflow-hidden flex items-center">
            <div className="w-full">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Активное продвижение в соцсетях
                </h2>
                <p className="text-lg text-white/80 mb-10">
                  Мы используем все современные каналы для максимально быстрой продажи вашего автомобиля
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {socialPlatforms.map((platform, index) => {
                    const IconComponent = platform.icon
                    return (
                      <div
                        key={platform.name}
                        className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 flex items-center gap-3 transform transition-all duration-300 ${
                          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5" style={{ color: platform.color }} />
                        </div>
                        <span className="text-white font-semibold text-base">{platform.name}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">100K+</div>
                      <div className="text-gray-600 text-sm font-medium">Охват аудитории</div>
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">15+</div>
                      <div className="text-gray-600 text-sm font-medium">Площадок размещения</div>
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">7-14</div>
                      <div className="text-gray-600 text-sm font-medium">Дней до продажи</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая половина - Форма с заявкой */}
          <div className="p-8 md:p-12 lg:p-16 flex items-center bg-gray-50">
            <div className="w-full max-w-2xl mx-auto space-y-6">
              {/* Заголовок */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Бесплатная оценка авто<br />за 15 минут
                </h2>
                <p className="text-lg text-gray-600">
                  Оставьте заявку и получите предложение
                </p>
              </div>

              {/* Форма */}
              <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                {selectedService && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-900" />
                      <div>
                        <span className="font-semibold text-gray-900 block text-sm">Выбранная услуга:</span>
                        <p className="text-gray-700">{services.find(s => s.id === selectedService)?.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-900 mb-2 block">
                      Ваше имя *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="h-12 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-900 mb-2 block">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="h-12 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-900 mb-2 block">
                      Комментарий
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg resize-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      placeholder="Расскажите о вашем автомобиле..."
                      rows={4}
                    />
                  </div>
                  <StatusButton
                    {...submitButtonState}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 text-base rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold shadow-md transition-all"
                  >
                    Получить предложение
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </StatusButton>
                  <p className="text-center text-xs text-gray-500">
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="/privacy" className="underline hover:text-gray-900">политикой конфиденциальности</a>
                  </p>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Или свяжитесь с нами напрямую
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="border border-gray-200 rounded-lg px-6 py-3 flex-1">
                      <a
                        href="tel:+375293596000"
                        className="text-gray-900 font-bold text-lg hover:text-blue-900 transition-colors"
                      >
                        +375 29 359-60-00
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">Режим работы</p>
                      <p className="text-gray-600">Пн-Вс: 9:00 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 rounded-2xl p-8 shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <Star className="h-8 w-8 flex-shrink-0 text-yellow-400" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Специальное предложение</h4>
                    <p className="text-white/80">
                      Оставьте заявку сегодня и получите бесплатную профессиональную фотосъемку вашего автомобиля!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
