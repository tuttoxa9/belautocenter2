"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Eye,
  DollarSign,
  FileText,
  Settings,
  Trophy,
  Handshake,
} from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"
import FadeInSection from "@/components/fade-in-section"
import RotatingText from "@/components/ui/rotating-text"

const hardcodedSaleItems = [
    {
      id: 'buyout',
      title: 'Срочный выкуп авто',
      description: 'Мы предлагаем самый быстрый и прозрачный способ продажи вашего автомобиля. Получите до 95% от рыночной стоимости в день обращения без скрытых комиссий и долгого ожидания.',
      imageUrl: '/mainTouran.PNG',
      features: ['Оценка онлайн за 5 минут', 'Бесплатный выезд оценщика', 'Деньги в течение 1 часа', 'Полное юридическое сопровождение'],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'commission',
      title: 'Комиссионная продажа',
      description: 'Доверьте продажу вашего автомобиля профессионалам. Мы возьмем на себя все заботы: от предпродажной подготовки и профессиональной фотосъемки до поиска покупателя и оформления сделки.',
      imageUrl: '/mercedes-new-bg.jpg',
      features: ['Продажа по вашей цене', 'Безопасная сделка', 'Охраняемая стоянка', 'Мощная рекламная поддержка'],
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'tradein',
      title: 'Trade-In',
      description: 'Обменяйте свой старый автомобиль на любой другой из нашего каталога. Это самый удобный способ обновить машину, сэкономив время и нервы. Оценим ваш авто по высокой ставке.',
      imageUrl: '/audi-bg.jpg',
      features: ['Принимаем авто любой марки и года', 'Быстрая и честная оценка', 'Экономия времени', 'Возможность доплаты в кредит или лизинг'],
      gradient: 'from-purple-500 to-violet-500',
    },
]

const dealSteps = [
  {
    id: 1,
    title: 'Визит или звонок',
    icon: Phone,
    description: 'Свяжитесь с нами удобным для вас способом или приезжайте к нам в офис.',
  },
  {
    id: 2,
    title: 'Осмотр машины',
    icon: Eye,
    description: 'Наши специалисты проводят тщательный осмотр для формирования справедливой цены.',
  },
  {
    id: 3,
    title: 'Согласование стоимости',
    icon: DollarSign,
    description: 'Определяем финальную цену с учетом состояния, пробега и рыночной ситуации.',
  },
  {
    id: 4,
    title: 'Подготовка документов',
    icon: FileText,
    description: 'Оформляем все документы прозрачно, заключаем договор со всеми условиями.',
  },
  {
    id: 5,
    title: 'Завершение сделки',
    icon: Handshake,
    description: 'Вы получаете оговоренную сумму на руки либо на расчетный счет.',
  }
]

export default function SalePage() {
  const [formData, setFormData] = useState({ name: '', phone: '+375', carInfo: '' })
  const [selectedService, setSelectedService] = useState('')
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    document.body.classList.add('bg-slate-900');
    return () => {
      document.body.classList.remove('bg-slate-900');
    };
  }, [])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceSelect = (serviceId: string) => {
    const selected = hardcodedSaleItems.find(s => s.id === serviceId)
    setSelectedService(selected?.title || '')
    const form = document.getElementById('contact-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitButtonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", {
          ...formData,
          type: "sale_evaluation",
          service: selectedService,
          status: "new",
          createdAt: new Date(),
        })

        await fetch("/api/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            message: `Заявка на оценку: ${formData.carInfo}\nУслуга: ${selectedService}`,
            type: 'sale_funnel',
          }),
        });

        showSuccess("Заявка на оценку отправлена!")
        setFormData({ name: '', phone: '+375', carInfo: '' })
        setSelectedService('')
      } catch (error) {
        console.error("Failed to submit evaluation request", error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative text-center py-24 md:py-40">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5"></div>
        <div className="relative z-10 container mx-auto px-4">
          <FadeInSection>
            <h1 className="text-5xl md:text-7xl font-aviano font-bold mb-6">
              Быстрый{' '}
              <span className="inline-block">
                <RotatingText
                  texts={['выкуп', 'обмен', 'трейд-ин']}
                  splitBy="words"
                  mainClassName="text-yellow-400"
                  staggerDuration={0.05}
                />
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-roboto">
              Полный спектр услуг по продаже, покупке и обмену автомобилей с пробегом. Гарантируем лучшие цены, прозрачность и первоклассный сервис.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hardcodedSaleItems.map((item, index) => (
              <FadeInSection key={item.id} delay={index * 100}>
                <div
                  onClick={() => handleServiceSelect(item.id)}
                  className={`group relative rounded-2xl p-8 h-full border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedService === item.title
                    ? 'border-yellow-400 bg-slate-800'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${item.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl font-etude font-bold mb-4">{item.title}</h3>
                    <p className="text-slate-400 font-roboto mb-6 flex-grow">{item.description}</p>
                    <ul className="space-y-3 mb-8">
                      {item.features?.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                          <span className="font-roboto text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="lg"
                      className={`w-full mt-auto font-bold rounded-lg shadow-lg transition-all duration-300 ${
                        selectedService === item.title
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-slate-700 text-white group-hover:bg-slate-600'
                      }`}
                    >
                      Выбрать
                    </Button>
                  </div>
                </div>
              </FadeInSection>
            ))}
        </div>
      </div>

      {/* "How it Works" Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
            <FadeInSection>
                <h2 className="text-4xl font-aviano font-bold text-center mb-16">
                    Как происходит <span className="text-yellow-400">сделка</span>
                </h2>
            </FadeInSection>
            <div className="relative max-w-3xl mx-auto">
                <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-slate-700" aria-hidden="true"></div>
                <div className="space-y-4">
                    {dealSteps.map((step, index) => (
                        <FadeInSection key={step.id}>
                            <div className="relative flex items-center group">
                                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16 text-left'}`}>
                                    <h3 className="text-2xl font-etude font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">{step.title}</h3>
                                    <p className="text-slate-400 mt-2">{step.description}</p>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-800 border-4 border-yellow-400 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                                    <step.icon className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="w-1/2"></div>
                            </div>
                        </FadeInSection>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact-form" className="py-24 bg-slate-800/50 mt-12">
        <div className="container mx-auto max-w-4xl text-center">
          <FadeInSection>
            <h2 className="text-4xl font-bold mb-4">Быстрая онлайн-оценка вашего авто</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время с предварительной оценкой вашего автомобиля.
            </p>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 text-left bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
              {selectedService && (
                  <div className="mb-6 p-3 bg-slate-700 rounded-xl text-center">
                      <p className="text-slate-300 text-sm">Выбранная услуга:</p>
                      <p className="font-semibold text-white text-lg">{selectedService}</p>
                  </div>
              )}
              <div>
                <Label htmlFor="carInfo" className="text-sm font-medium text-slate-300 mb-2 block">Марка, модель и год выпуска</Label>
                <Input id="carInfo" value={formData.carInfo} onChange={(e) => handleFormChange('carInfo', e.target.value)} className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg" placeholder="Например, BMW 5-series 2020" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-300 mb-2 block">Ваше имя</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg" placeholder="Иван" required />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-300 mb-2 block">Номер телефона</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-lg" placeholder="+375 (XX) XXX-XX-XX" required />
                </div>
              </div>
              <StatusButton {...submitButtonState} type="submit" className="w-full h-12 text-base rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold">
                Получить оценку
                <ArrowRight className="ml-2 h-5 w-5" />
              </StatusButton>
            </form>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}
