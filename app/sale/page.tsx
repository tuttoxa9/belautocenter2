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
import { useSubmission } from "@/components/providers/submission-provider"
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
  const { submitForm } = useSubmission()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    await submitForm(async () => {
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

      if (!response.ok) {
        throw new Error('Ошибка отправки')
      }

      showSuccess('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
      setFormData({ name: '', phone: '+375', message: '' })
      setSelectedService('')
    }) // Здесь нет окна для закрытия
  }

  const canSubmit = formData.name.trim() && formData.phone.length >= 13

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] opacity-10 bg-cover bg-center"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className={`text-center max-w-4xl mx-auto transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold text-white">Продайте автомобиль выгоднее</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Комиссия всего{' '}
              <span className="relative inline-block">
                <span className="text-yellow-300">450$</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M2 5C50 2 150 2 198 5" stroke="#fde047" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100 font-medium">
              Пока у конкурентов начинается от 800$
            </p>
            <p className="text-lg md:text-xl mb-10 text-blue-50 max-w-2xl mx-auto">
              Продаём быстро и эффективно, используя рекламу в Instagram, TikTok, Google, VK, Facebook и активно ведём соцсети
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 text-lg px-10 py-7 rounded-2xl font-bold shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Оставить заявку
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-900 text-lg px-10 py-7 rounded-2xl font-bold transition-all duration-300"
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
      <section id="advantages" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block relative mb-4">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900">
                Наши преимущества
              </h2>
            </div>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              Почему клиенты выбирают нас для продажи своих автомобилей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon
              return (
                <div
                  key={advantage.id}
                  className={`relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border-2 border-blue-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="absolute -top-6 left-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-3">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {advantage.description}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm">
                      <CheckCircle className="h-4 w-4" />
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
      <section id="services" className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block relative mb-4">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900">
                Все наши услуги
              </h2>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
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
                  className={`group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 shadow-2xl shadow-emerald-200'
                      : 'border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedService(isSelected ? '' : service.id)}
                >
                  {/* Price Badge */}
                  {service.price && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform rotate-6">
                      {service.price}
                    </div>
                  )}

                  {/* Selection Indicator */}
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle className="h-5 w-5 text-white" />}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <FeatureIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
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
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Как мы работаем
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Прозрачный процесс от заявки до продажи
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Мобильная версия */}
            <div className="block md:hidden space-y-3">
              {dealSteps.map((step) => {
                const IconComponent = step.icon
                return (
                  <div key={step.id} className="flex items-start gap-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 text-white font-semibold text-sm flex-shrink-0">
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Десктопная версия */}
            <div className="hidden md:block">
              <div className="grid grid-cols-6 gap-6 relative">
                {/* Соединительная линия */}
                <div className="absolute top-6 left-0 right-0 h-px bg-gray-200" style={{ left: '8.33%', right: '8.33%' }}></div>

                {dealSteps.map((step) => {
                  const IconComponent = step.icon
                  return (
                    <div key={step.id} className="flex flex-col items-center text-center relative">
                      {/* Номер */}
                      <div className="w-12 h-12 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center mb-3 relative z-10">
                        <span className="text-lg font-bold text-gray-900">{step.id}</span>
                      </div>

                      {/* Иконка */}
                      <div className="mb-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                      </div>

                      {/* Текст */}
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-500 leading-snug">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Section - Social Media + Contact Form */}
      <section id="contact-form" className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Левая половина - Активное продвижение в соцсетях */}
            <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Активное продвижение в соцсетях
                </h2>
                <p className="text-lg text-blue-100 mb-8">
                  Мы используем все современные каналы для максимально быстрой продажи вашего автомобиля
                </p>

                <div className="space-y-4 mb-8">
                  {socialPlatforms.map((platform, index) => {
                    const IconComponent = platform.icon
                    return (
                      <div
                        key={platform.name}
                        className={`bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-6 py-4 flex items-center gap-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6" style={{ color: platform.color }} />
                        </div>
                        <span className="text-white font-bold text-lg">{platform.name}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-4xl font-bold text-yellow-300 mb-2">100K+</div>
                      <div className="text-blue-100 text-sm">Охват аудитории</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-yellow-300 mb-2">15+</div>
                      <div className="text-blue-100 text-sm">Площадок размещения</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-yellow-300 mb-2">7-14</div>
                      <div className="text-blue-100 text-sm">Дней до продажи</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая половина - Давайте попробуем с заявкой */}
            <div className="space-y-6">
              {/* Заголовок с эмодзи */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
                    Давайте попробуем?
                  </h2>
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl">
                    😊
                  </div>
                </div>
                <div className="flex justify-center mb-8">
                  <ArrowDown className="h-10 w-10 text-emerald-500 animate-bounce" />
                </div>
              </div>

              {/* Форма */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-100">
                {selectedService && (
                  <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-emerald-900 block">Выбранная услуга:</span>
                        <p className="text-emerald-700">{services.find(s => s.id === selectedService)?.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-blue-900 mb-2 block">
                      Ваше имя *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="h-14 bg-blue-50 border-2 border-blue-200 text-blue-900 placeholder:text-blue-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-blue-900 mb-2 block">
                      Номер телефона *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="h-14 bg-blue-50 border-2 border-blue-200 text-blue-900 placeholder:text-blue-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-blue-900 mb-2 block">
                      Комментарий
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="bg-blue-50 border-2 border-blue-200 text-blue-900 placeholder:text-blue-400 rounded-xl resize-none focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Расскажите о вашем автомобиле..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Отправить заявку
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                  <p className="text-center text-xs text-gray-500">
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="/privacy" className="underline hover:text-blue-600">политикой конфиденциальности</a>
                  </p>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  Или свяжитесь с нами напрямую
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border-2 border-blue-200 rounded-2xl px-6 py-3 flex-1">
                      <a
                        href="tel:+375293596000"
                        className="text-blue-900 font-bold text-lg hover:text-emerald-600 transition-colors"
                      >
                        +375 29 359-60-00
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold">Режим работы</p>
                      <p className="text-gray-600">Пн-Вс: 9:00 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 shadow-xl text-white">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-8 w-8 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Специальное предложение</h4>
                    <p className="text-orange-100">
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
