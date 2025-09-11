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
  ChevronDown
} from "lucide-react"

const services = [
  {
    id: 'commission',
    title: 'Комиссионная продажа',
    description: 'Продадим ваш автомобиль быстро и по выгодной цене',
    icon: Shield,
    features: ['Профессиональная фотосъемка', 'Размещение на площадках', 'Сопровождение сделки'],
    image: '/car_credit3new.png',
    gradient: 'from-indigo-700 to-indigo-800'
  },
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
    id: 'exchange',
    title: 'Обмен автомобилей',
    description: 'Обмен автомобиля на автомобиль без денежных операций',
    icon: TrendingUp,
    features: ['Равноценный обмен', 'Проверка истории', 'Безопасная сделка'],
    image: '/audi-bg.jpg',
    gradient: 'from-neutral-700 to-neutral-800'
  },
  {
    id: 'buyout',
    title: 'Выкуп автомобилей',
    description: 'Быстрый выкуп вашего автомобиля по рыночной стоимости',
    icon: DollarSign,
    features: ['Оценка в день обращения', 'Расчет наличными', 'Все документы'],
    image: '/mercedes-bg.jpg',
    gradient: 'from-stone-700 to-stone-800'
  }
]

const dealSteps = [
  {
    id: 1,
    title: 'Визит или звонок',
    icon: Phone,
    description: 'Свяжитесь с нами удобным для вас способом или приезжайте к нам в офис по адресу в Минске. Наши специалисты готовы ответить на все ваши вопросы.',
  },
  {
    id: 2,
    title: 'Осмотр машины',
    icon: Eye,
    description: 'Если вы находитесь не в Минске, мы можем организовать выезд нашего специалиста к вам для осмотра автомобиля и составления договора на месте.',
  },
  {
    id: 3,
    title: 'Согласование стоимости',
    icon: DollarSign,
    description: 'Определяем справедливую рыночную цену вашего автомобиля. В процессе оценки учитываем текущее состояние, пробег и рыночную ситуацию.',
  },
  {
    id: 4,
    title: 'Подготовка документов',
    icon: FileText,
    description: 'Все документы оформляются максимально прозрачно. Составляем акт приема-передачи, а также заключаем с вами договор, где прописываем все условия для обеих сторон.',
  },
  {
    id: 5,
    title: 'Подготовка авто',
    icon: Settings,
    description: 'Организуем предпродажную подготовку: чистку и полировку, устранение мелких недостатков, диагностику и устранение технических проблем.',
  },
  {
    id: 6,
    title: 'Реализация',
    icon: Trophy,
    description: 'Активно занимаемся рекламой и общаемся с потенциальными покупателями. При необходимости помогаем покупателям с оформлением кредита или лизинга.',
  },
  {
    id: 7,
    title: 'Завершение сделки',
    icon: Handshake,
    description: 'Вы (или доверенное лицо) получаете оговоренную ранее сумму на руки либо на расчетный лицевой счет.',
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
  const [activeTab, setActiveTab] = useState<'services' | 'process'>('services')
  const [expandedServices, setExpandedServices] = useState<string[]>([])

  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    setIsVisible(true)

    // Fix for footer corner color on dark pages
    document.body.classList.add('bg-slate-900');
    return () => {
      document.body.classList.remove('bg-slate-900');
    };
  }, [])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* New Hero Section */}
      <section className="relative overflow-hidden bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 bg-slate-700 rounded-full px-4 py-2 mb-6 text-sm">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-slate-200">Премиальные автоуслуги для вас</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Продайте ваш автомобиль
                <span className="block text-yellow-400">
                  быстро и выгодно
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-6 md:mb-10 max-w-lg text-slate-300">
                Мы предлагаем полный комплекс услуг по выкупу, обмену и комиссионной продаже автомобилей с гарантией лучшей цены и юридической чистоты.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Кнопки для мобильных - в колонку */}
                <div className="flex flex-col sm:hidden w-full gap-3">
                  <Button
                    size="lg"
                    className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 w-full"
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Начать продажу
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-slate-700 text-white hover:bg-slate-600 text-base px-8 py-6 rounded-xl font-semibold w-full"
                    onClick={() => {
                      setActiveTab('process');
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Как это работает?
                  </Button>
                </div>
                {/* Кнопки для десктопа - в ряд */}
                <div className="hidden sm:flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Начать продажу
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-slate-700 text-white hover:bg-slate-600 text-base px-8 py-6 rounded-xl font-semibold"
                    onClick={() => {
                      setActiveTab('process');
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Как это работает?
                  </Button>
                </div>
                {/* Номер телефона для мобильных устройств */}
                <div className="sm:hidden mt-4">
                  <div className="bg-transparent border border-slate-600/50 rounded-3xl px-6 py-3 backdrop-blur-sm">
                    <a
                      href="tel:+375293596000"
                      className="text-white font-semibold text-lg hover:text-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      +375 29 359-60-00
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className={`relative h-64 md:h-auto transform transition-all duration-1000 delay-300 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}>
              <Image
                src="/mercedes-new-bg.jpg"
                alt="Продажа автомобиля"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Services Section */}
      <section id="services" className="py-16 md:py-24 bg-slate-800/50">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 bg-slate-700 rounded-full px-4 py-2 mb-4">
              <Car className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-200">Наши услуги</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
              Что мы предлагаем
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Мы предлагаем полный спектр автомобильных услуг с индивидуальным подходом к каждому клиенту, гарантируя прозрачность и высокое качество на каждом этапе.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className={`flex justify-center mb-6 md:mb-8 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-slate-800 rounded-xl md:rounded-2xl p-1 md:p-2">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  activeTab === 'services'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Услуги
              </button>
              <button
                onClick={() => setActiveTab('process')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                  activeTab === 'process'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Процесс работы
              </button>
            </div>
          </div>

          {/* Services Grid */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon
                const isSelected = selectedService === service.id
                const isExpanded = expandedServices.includes(service.id)

                return (
                  <div
                    key={service.id}
                    className={`group relative rounded-2xl border-2 overflow-hidden transform transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/30 ${
                      isSelected
                        ? 'bg-slate-700/50 border-yellow-400 shadow-xl shadow-yellow-400/20'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                    style={{ transitionDelay: `${200 + index * 100}ms` }}
                    onClick={() => {
                      // Только переключаем развернутое состояние
                      toggleServiceExpansion(service.id)
                    }}
                  >
                    {/* Мобильная версия (свернутая) */}
                    <div className="md:hidden">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900/50 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/10 transition-colors">
                            <IconComponent className="h-5 w-5 text-yellow-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {service.title}
                          </h3>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {/* Развернутое содержимое для мобильных */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-4 pb-4 border-t border-slate-700">
                          <p className="text-slate-400 mb-3 text-sm mt-3">
                            {service.description}
                          </p>
                          <div className="space-y-2">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                <span className="text-sm text-slate-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                          {/* Кнопка выбора услуги в развернутом блоке */}
                          <div className="mt-4 flex justify-center">
                            <div
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: isSelected ? '#facc15' : '#475569',
                                color: isSelected ? '#0f172a' : '#f8fafc'
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedService(isSelected ? '' : service.id)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {isSelected ? 'Услуга выбрана' : 'Выбрать услугу'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Десктопная версия (обычная) */}
                    <div className="hidden md:block p-6 flex flex-col items-start text-left h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-900/50 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/10 transition-colors">
                          <IconComponent className="h-6 w-6 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 mb-4 text-sm min-h-[60px] flex-grow">
                        {service.description}
                      </p>
                      <div className="space-y-2 w-full">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      {/* Галочка выбора для десктопа */}
                      <div
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: isSelected ? '#facc15' : 'transparent', border: '2px solid #facc15' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedService(isSelected ? '' : service.id)
                        }}
                      >
                        {isSelected && <CheckCircle className="h-5 w-5 text-slate-900" />}
                      </div>
                    </div>


                  </div>
                )
              })}
            </div>
          )}

          {/* Process Steps */}
          {activeTab === 'process' && (
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-700"></div>

                <div className="space-y-12">
                  {dealSteps.map((step, index) => {
                    const IconComponent = step.icon
                    return (
                      <div key={step.id} className={`relative flex items-start gap-6 transform transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`} style={{ transitionDelay: `${200 + index * 100}ms` }}>
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-12 h-12 bg-slate-800 border-2 border-yellow-400 text-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-yellow-400/50 transition-colors">
                          <h4 className="text-lg font-bold text-white mb-2">
                            Шаг {step.id}: {step.title}
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modern Contact Section */}
      <section id="contact-form" className="py-16 md:py-24 bg-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left side - Info */}
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 bg-slate-700 rounded-full px-4 py-2 mb-4">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-slate-200">Свяжитесь с нами</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Готовы обсудить ваши потребности?
              </h3>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Оставьте заявку, и наш менеджер свяжется с вами в течение 15 минут, чтобы предложить лучшие условия.
              </p>
            </div>
            {/* Right side - Form */}
            <div className={`transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6 md:p-8">
                {selectedService && (
                  <div className="mb-6 p-3 bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-yellow-400" />
                      <div>
                        <span className="font-semibold text-white text-sm">Выбранная услуга:</span>
                        <p className="text-slate-300 text-sm">{services.find(s => s.id === selectedService)?.title}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-slate-300 mb-2 block">Ваше имя *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg" placeholder="Введите ваше имя" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-300 mb-2 block">Номер телефона *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg" placeholder="+375 (XX) XXX-XX-XX" />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-slate-300 mb-2 block">Комментарий (необязательно)</Label>
                    <Textarea id="message" value={formData.message} onChange={(e) => handleFormChange('message', e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg resize-none" placeholder="Расскажите подробнее..." rows={3} />
                  </div>
                  <StatusButton {...submitButtonState} onClick={handleSubmit} disabled={!canSubmit} className="w-full h-12 text-base rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold">
                    Отправить заявку
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </StatusButton>
                  <p className="text-center text-xs text-slate-500">
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="/privacy" className="underline hover:text-white">политикой конфиденциальности</a>
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
