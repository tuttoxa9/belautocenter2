"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import {
  ArrowRight,
  Check,
  Award,
  BarChart2,
  Users,
  MessageCircle,
  TrendingUp,
  Shield,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Bot,
  Megaphone,
  BarChart3,
  Goal
} from "lucide-react"

// Новые иконки для соответствия новому дизайну
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8.6c-1.5-1.4-3.6-.8-4.2.8v8.3c0 .8.6 1.4 1.4 1.4h.1c.8 0 1.4-.6 1.4-1.4V12h2.2c1.2 0 2.2-1 2.2-2.2s-1-2.2-2.2-2.2z" />
    <path d="M6 12V4h4.4c1.2 0 2.2 1 2.2 2.2S11.6 8.4 10.4 8.4H6z" />
  </svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
)

const VKIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.24 12.33c-.2.2-.47.3-.78.3-.3 0-.58-.1-.78-.3-.2-.2-.3-.47-.3-.78 0-.3.1-.58.3-.78.2-.2.47-.3.78-.3.3 0 .58.1.78.3.2.2.3.47.3.78 0 .3-.1.58-.3.78zm-4.48 0c-.2.2-.47.3-.78.3-.31 0-.58-.1-.78-.3-.2-.2-.3-.47-.3-.78 0-.3.1-.58.3-.78.2-.2.47-.3.78-.3.31 0 .58.1.78.3.2.2.3.47.3.78 0 .3-.1.58-.3.78zm2.24-4.48c-.2.2-.47.3-.78.3-.3 0-.58-.1-.78-.3-.2-.2-.3-.47-.3-.78 0-.3.1-.58.3-.78.2-.2.47-.3.78-.3.3 0 .58.1.78.3.2.2.3.47.3.78 0 .3-.1.58-.3.78z" />
    </svg>
)

// Hero Section
const HeroSection = () => (
  <div className="relative text-white py-32 px-4 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 z-0"></div>
    <div className="absolute inset-0 bg-black opacity-30 z-10"></div>
    <div className="container mx-auto text-center relative z-20">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in-down">
        Продайте ваш автомобиль. Быстро. Выгодно.
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-blue-200 animate-fade-in-up">
        Комиссия всего <span className="font-bold text-yellow-300">450$</span>. У конкурентов от 800$.
      </p>
      <Button
        size="lg"
        className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 text-lg px-10 py-7 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-transform animate-bounce"
        onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Оставить заявку <ArrowRight className="ml-2" />
      </Button>
    </div>
  </div>
)

// Why Us Section
const WhyUsSection = () => {
    const advantages = [
      {
        icon: Award,
        title: 'Фиксированная комиссия 450$',
        description: 'Никаких скрытых платежей. У конкурентов — от 800$.'
      },
      {
        icon: BarChart2,
        title: 'Быстрая продажа',
        description: 'Активно используем все современные площадки для рекламы.'
      },
      {
        icon: Users,
        title: 'Активные соцсети',
        description: 'Ваш автомобиль увидят тысячи потенциальных покупателей.'
      }
    ]

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Почему мы — ваш лучший выбор?</h2>
                    <p className="text-gray-600 mt-2">Мы предлагаем то, чего не могут другие.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {advantages.map((adv, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <adv.icon className="w-12 h-12 text-blue-500 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{adv.title}</h3>
                            <p className="text-gray-600">{adv.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        { icon: MessageCircle, title: 'Заявка', description: 'Вы оставляете заявку, мы связываемся в течение 15 минут.' },
        { icon: TrendingUp, title: 'Оценка', description: 'Проводим профессиональную оценку вашего авто.' },
        { icon: Shield, title: 'Договор', description: 'Заключаем прозрачный договор с фиксированной комиссией.' },
        { icon: Check, title: 'Продажа', description: 'Находим покупателя и сопровождаем сделку до конца.' },
    ]
    return (
        <div className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Как мы работаем</h2>
                    <p className="text-gray-600 mt-2">Всего 4 простых шага к успешной продаже.</p>
                </div>
                <div className="relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-5 bottom-5 w-1 bg-gray-200 rounded-full hidden md:block"></div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center flex flex-col items-center">
                                <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 z-10">
                                    <step.icon className="w-8 h-8"/>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                <p className="text-gray-600 mt-2">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Marketing Channels Section
const MarketingSection = () => {
    const channels = [
        { icon: Instagram, name: 'Instagram', color: 'text-pink-500' },
        { icon: TikTokIcon, name: 'TikTok', color: 'text-black' },
        { icon: GoogleIcon, name: 'Google', color: 'text-red-500' },
        { icon: VKIcon, name: 'VK', color: 'text-blue-600' },
        { icon: Facebook, name: 'Facebook', color: 'text-blue-800' },
        { icon: Megaphone, name: 'Рекламные сети', color: 'text-yellow-500' },
        { icon: BarChart3, name: 'Ведение соц. сетей', color: 'text-green-500' },
        { icon: Goal, name: 'Таргетинг', color: 'text-purple-500' }
    ]

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Где мы рекламируем ваш автомобиль</h2>
                    <p className="text-gray-600 mt-2">Мы используем все самые эффективные каналы для быстрой продажи.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {channels.map((channel, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
                            <channel.icon className={`w-12 h-12 mx-auto mb-4 ${channel.color}`} />
                            <h3 className="text-lg font-semibold text-gray-800">{channel.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Contact Section
const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', phone: '+375', message: '' })
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      submitButtonState.setLoading(true)
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service_request',
          ...formData,
        }),
      })

      if (response.ok) {
        submitButtonState.setSuccess(true)
        showSuccess('Заявка отправлена! Мы скоро свяжемся с вами.')
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
    <div id="contact-form" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-8 md:p-12 rounded-2xl shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">Готовы продать?</h2>
              <p className="mb-6">Оставьте свои контакты, и наш специалист свяжется с вами для бесплатной консультации.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><Phone className="w-6 h-6" /><span>+375 (29) 359-60-00</span></div>
                <div className="flex items-center gap-3"><Mail className="w-6 h-6" /><span>info@auto-sale.by</span></div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <form className="space-y-4">
                <Input
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="h-12 bg-gray-100 border-gray-300"
                  placeholder="Ваше имя *"
                />
                <Input
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="h-12 bg-gray-100 border-gray-300"
                  placeholder="Телефон *"
                />

                <Textarea
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  className="bg-gray-100 border-gray-300"
                  placeholder="Комментарий (марка, модель, год)"
                  rows={3}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitButtonState.isLoading}
                  className="w-full h-12 text-base rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold"
                >
                  {submitButtonState.isLoading ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </form>
              <p className="text-center text-xs text-gray-500 mt-4">
                Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function SalePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <WhyUsSection />
      <HowItWorksSection />
      <MarketingSection />
      <ContactSection />
    </div>
  )
}
