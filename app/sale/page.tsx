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
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Phone,
  CheckCircle,
  ArrowRight,
  Star,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
} from "lucide-react"

// Новая структура преимуществ
const advantages = [
  {
    icon: DollarSign,
    title: "Фиксированная комиссия",
    description: "Наша комиссия всего 450$, в то время как у конкурентов она начинается от 800$.",
  },
  {
    icon: Clock,
    title: "Быстрая продажа",
    description: "Продаём ваш автомобиль в кратчайшие сроки благодаря мощной рекламной поддержке.",
  },
  {
    icon: TrendingUp,
    title: "Эффективная реклама",
    description: "Используем все современные площадки: Instagram, TikTok, Google, VK, Facebook.",
  },
  {
    icon: Shield,
    title: "Юридическая чистота",
    description: "Полное сопровождение сделки и гарантия безопасности для обеих сторон.",
  },
]

// Упрощенный процесс работы
const workProcess = [
  {
    step: 1,
    title: "Заявка и оценка",
    description: "Вы оставляете заявку, мы проводим быструю и справедливую онлайн-оценку вашего авто.",
  },
  {
    step: 2,
    title: "Договор и подготовка",
    description: "Заключаем прозрачный договор и проводим предпродажную подготовку автомобиля.",
  },
  {
    step: 3,
    title: "Продажа",
    description: "Активно рекламируем и находим покупателя на ваш автомобиль.",
  },
  {
    step: 4,
    title: "Расчет",
    description: "Вы получаете деньги сразу после завершения сделки.",
  },
]

export default function SalePage() {
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
    // Устанавливаем новый фон для страницы
    document.body.style.backgroundColor = '#111827';
    return () => {
      // Возвращаем стандартный фон при уходе со страницы
      document.body.style.backgroundColor = '';
    };
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
          service: 'Комиссионная продажа', // Услуга теперь одна
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
        }),
      })

      if (response.ok) {
        submitButtonState.setSuccess(true)
        showSuccess('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
        setFormData({ name: '', phone: '+375', message: '' })
      } else {
        throw new Error('Ошибка отправки')
      }
    } catch (error) {
      submitButtonState.setError(true)
    }
  }

  const canSubmit = formData.name.trim() && formData.phone.length >= 13

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-amber-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Продайте авто
              <span className="text-amber-400"> выгодно и быстро</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-300">
              Наша комиссия всего <span className="font-bold text-white">450$</span>, у конкурентов от <span className="font-bold text-white">800$</span>. Мы продаём быстро, эффективно используя рекламу в <span className="font-bold text-white">Instagram, TikTok, Google</span> и других соцсетях.
            </p>
            <Button
              size="lg"
              className="bg-amber-400 text-black hover:bg-amber-300 text-base px-10 py-6 rounded-xl font-bold shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40 transition-all duration-300"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Оставить заявку
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Мы предлагаем лучшие условия на рынке и комплексный подход к продаже вашего автомобиля.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className={`bg-gray-800 p-6 rounded-2xl border border-gray-700 transform transition-all duration-500 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-400/10 hover:-translate-y-2 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionDelay: `${100 + index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4 border border-gray-600">
                  <advantage.icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Мы активно ведем соцсети
                </h3>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    Подписывайтесь, чтобы быть в курсе всех новостей и актуальных предложений!
                </p>
                <div className="flex justify-center items-center gap-6">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-8 h-8"/></a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-8 h-8"/></a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-8 h-8"/></a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors"><MessageCircle className="w-8 h-8"/></a>
                </div>
            </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section id="process" className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Как мы работаем
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Простой и понятный процесс продажи вашего авто в 4 шага.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
             {/* Горизонтальная линия для десктопов */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {workProcess.map((item) => (
                <div key={item.step} className="text-center relative p-4">
                  <div className="w-16 h-16 bg-amber-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-4 border-gray-900 z-10 relative">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 md:py-24 bg-gray-800/50">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Оставьте заявку
            </h2>
            <p className="text-lg text-gray-400 mt-2">
              Наш менеджер свяжется с вами в течение 15 минут.
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-300 mb-2 block">Ваше имя *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg focus:border-amber-400 focus:ring-amber-400" placeholder="Введите ваше имя" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-300 mb-2 block">Номер телефона *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg focus:border-amber-400 focus:ring-amber-400" placeholder="+375 (XX) XXX-XX-XX" />
              </div>
              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-300 mb-2 block">Комментарий (необязательно)</Label>
                <Textarea id="message" value={formData.message} onChange={(e) => handleFormChange('message', e.target.value)} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 rounded-lg resize-none focus:border-amber-400 focus:ring-amber-400" placeholder="Марка и модель авто, год выпуска..." rows={3} />
              </div>
              <StatusButton {...submitButtonState} onClick={handleSubmit} disabled={!canSubmit} className="w-full h-12 text-base rounded-lg bg-amber-400 text-black hover:bg-amber-300 font-bold">
                Отправить
                <ArrowRight className="ml-2 h-5 w-5" />
              </StatusButton>
              <p className="text-center text-xs text-gray-500">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/privacy" className="underline hover:text-white">политикой конфиденциальности</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
