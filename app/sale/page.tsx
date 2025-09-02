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
    gradient: 'from-blue-500 to-blue-700'
  },
  {
    id: 'credit',
    title: 'Кредит от 9%',
    description: 'Автокредит по минимальной ставке от 9% годовых без отказов',
    icon: CreditCard,
    features: ['От 9% годовых', 'Без отказов', 'Решение за 30 минут'],
    image: '/car_credit2.png',
    gradient: 'from-green-500 to-green-700'
  },
  {
    id: 'tradein',
    title: 'Trade-in (Трейд-ин)',
    description: 'Обмен вашего старого автомобиля на новый с доплатой',
    icon: RefreshCw,
    features: ['Оценка за 15 минут', 'Юридическая чистота', 'Выгодная цена'],
    image: '/car_credit3.png',
    gradient: 'from-purple-500 to-purple-700'
  },
  {
    id: 'buyout',
    title: 'Выкуп автомобилей',
    description: 'Быстрый выкуп вашего автомобиля по рыночной стоимости',
    icon: DollarSign,
    features: ['Оценка в день обращения', 'Расчет наличными', 'Все документы'],
    image: '/mercedes-bg.jpg',
    gradient: 'from-orange-500 to-orange-700'
  },
  {
    id: 'exchange',
    title: 'Обмен автомобилей',
    description: 'Обмен автомобиля на автомобиль без денежных операций',
    icon: TrendingUp,
    features: ['Равноценный обмен', 'Проверка истории', 'Безопасная сделка'],
    image: '/audi-bg.jpg',
    gradient: 'from-red-500 to-red-700'
  },
  {
    id: 'commission',
    title: 'Комиссионная продажа',
    description: 'Продадим ваш автомобиль быстро и по выгодной цене',
    icon: Shield,
    features: ['Профессиональная фотосъемка', 'Размещение на площадках', 'Сопровождение сделки'],
    image: '/vwt.jpg',
    gradient: 'from-teal-500 to-teal-700'
  }
]

const dealSteps = [
  {
    id: 1,
    title: 'Визит или звонок',
    icon: Phone,
    description: 'Свяжитесь с нами удобным для вас способом или приезжайте к нам в офис по адресу в Минске. Наши специалисты готовы ответить на все ваши вопросы.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Осмотр машины',
    icon: Eye,
    description: 'Если вы находитесь не в Минске, мы можем организовать выезд нашего специалиста к вам для осмотра автомобиля и составления договора на месте.',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    title: 'Согласование стоимости',
    icon: DollarSign,
    description: 'Определяем справедливую рыночную цену вашего автомобиля. В процессе оценки учитываем текущее состояние, пробег и рыночную ситуацию.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    title: 'Подготовка документов',
    icon: FileText,
    description: 'Все документы оформляются максимально прозрачно. Составляем акт приема-передачи, а также заключаем с вами договор, где прописываем все условия для обеих сторон.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 5,
    title: 'Подготовка авто',
    icon: Settings,
    description: 'Организуем предпродажную подготовку: чистку и полировку, устранение мелких недостатков, диагностику и устранение технических проблем.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 6,
    title: 'Реализация',
    icon: Trophy,
    description: 'Активно занимаемся рекламой и общаемся с потенциальными покупателями. При необходимости помогаем покупателям с оформлением кредита или лизинга.',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 7,
    title: 'Завершение сделки',
    icon: Handshake,
    description: 'Вы (или доверенное лицо) получаете оговоренную ранее сумму на руки либо на расчетный лицевой счет.',
    color: 'from-indigo-500 to-indigo-600'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        <Image
          src="/mercedes-new-bg.jpg"
          alt="Автомобили БелАвтоЦентр"
          fill
          className="object-cover"
          priority
        />
        <div className={`relative z-20 text-center text-white px-4 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Наши услуги
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light drop-shadow-md">
            Полный спектр автомобильных услуг: от покупки до продажи
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <CheckCircle className="h-5 w-5" />
              <span>Официальный дилер</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="h-5 w-5" />
              <span>15+ лет опыта</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="h-5 w-5" />
              <span>Гарантия качества</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with rounded top */}
      <div className="bg-white rounded-t-[2rem] relative -mt-8 z-10">
        {/* Services Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
          <div className={`text-center mb-12 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Наши услуги и процесс работы
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Полный спектр автомобильных услуг и пошаговый процесс сделки
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
            {/* Services Column */}
            <div className="lg:col-span-3">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Выберите подходящую услугу</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-700 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  } group cursor-pointer`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-active:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-80`} />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {selectedService === service.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>

                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
              </div>
            </div>

            {/* Deal Process Column */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Как проходит сделка</h3>
                <div className="space-y-4">
                  {dealSteps.map((step, index) => {
                    const IconComponent = step.icon
                    const isExpanded = expandedStep === step.id

                    return (
                      <div
                        key={step.id}
                        className={`bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transform transition-all duration-700 ${
                          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                        style={{ transitionDelay: `${600 + index * 50}ms` }}
                      >
                        <div
                          className="p-5 cursor-pointer transition-colors"
                          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white font-bold text-base">{step.id}</span>
                              </div>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
                                  <IconComponent className="h-4 w-4 text-gray-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                  {step.title}
                                </h4>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`transition-all duration-300 overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-5 pb-5">
                            <div className="pl-13">
                              <div className="bg-white rounded-lg p-4 border">
                                <p className="text-base text-gray-700 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
          {/* Contact Form */}
          <div className={`max-w-2xl mx-auto transform transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Оставьте заявку
                </h3>
                <p className="text-gray-600">
                  Мы свяжемся с вами в течение 15 минут и ответим на все вопросы
                </p>
              </div>

              {selectedService && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Выбрана услуга: {services.find(s => s.id === selectedService)?.title}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Ваше имя *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="mt-1"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Номер телефона *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="mt-1"
                    placeholder="+375 (XX) XXX-XX-XX"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Сообщение (необязательно)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    className="mt-1"
                    placeholder="Расскажите подробнее о ваших потребностях..."
                    rows={4}
                  />
                </div>

                <StatusButton
                  {...submitButtonState}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full h-12 text-base font-medium"
                >
                  Отправить заявку
                  <ArrowRight className="ml-2 h-4 w-4" />
                </StatusButton>

                <div className="text-center text-sm text-gray-500">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="/privacy" className="text-blue-600 underline">
                    политикой конфиденциальности
                  </a>
                </div>
              </div>
            </div>
          </div>


          {/* Additional Info */}
          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 transform transition-all duration-1000 delay-1200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="text-center p-6 bg-gray-50 rounded-xl border">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Быстрое оформление</h4>
              <p className="text-gray-600 text-sm">Решение по заявке в течение 30 минут</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Выгодные условия</h4>
              <p className="text-gray-600 text-sm">Индивидуальный подход к каждому клиенту</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Полная поддержка</h4>
              <p className="text-gray-600 text-sm">Сопровождение на всех этапах сделки</p>
            </div>
          </div>
          </div>
        </section>
      </div>
    </div>
  )
}
