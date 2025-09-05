"use client"

import React, { useState, useEffect } from "react"
import { firestoreApi } from "@/lib/firestore-api"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { CheckCircle, ArrowRight } from "lucide-react"
import FadeInSection from "@/components/fade-in-section"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const hardcodedSaleItems = [
    {
      id: 'buyout',
      title: 'Срочный выкуп авто',
      description: 'Мы предлагаем самый быстрый и прозрачный способ продажи вашего автомобиля. Получите до 95% от рыночной стоимости в день обращения без скрытых комиссий и долгого ожидания.',
      imageUrl: '/mainTouran.PNG',
      features: ['Оценка онлайн за 5 минут', 'Бесплатный выезд оценщика', 'Деньги в течение 1 часа', 'Полное юридическое сопровождение'],
    },
    {
      id: 'commission',
      title: 'Комиссионная продажа',
      description: 'Доверьте продажу вашего автомобиля профессионалам. Мы возьмем на себя все заботы: от предпродажной подготовки и профессиональной фотосъемки до поиска покупателя и оформления сделки.',
      imageUrl: '/mercedes-new-bg.jpg',
      features: ['Продажа по вашей цене', 'Безопасная сделка', 'Охраняемая стоянка', 'Мощная рекламная поддержка'],
    },
    {
      id: 'tradein',
      title: 'Trade-In',
      description: 'Обменяйте свой старый автомобиль на любой другой из нашего каталога. Это самый удобный способ обновить машину, сэкономив время и нервы. Оценим ваш авто по высокой ставке.',
      imageUrl: '/audi-bg.jpg',
      features: ['Принимаем авто любой марки и года', 'Быстрая и честная оценка', 'Экономия времени', 'Возможность доплаты в кредит или лизинг'],
    },
]

export default function SalePage() {
  const [formData, setFormData] = useState({ name: '', phone: '+375', carInfo: '' })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitButtonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", {
          ...formData,
          type: "sale_evaluation",
          status: "new",
          createdAt: new Date(),
        })

        await fetch("/api/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            message: `Заявка на оценку: ${formData.carInfo}`,
            type: 'sale_funnel',
          }),
        });

        showSuccess("Заявка на оценку отправлена!")
        setFormData({ name: '', phone: '+375', carInfo: '' })
      } catch (error) {
        console.error("Failed to submit evaluation request", error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-16">
        <FadeInSection delay={100}>
          <h1 className="text-5xl font-bold text-center mb-12 font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
            Услуги по продаже и выкупу
          </h1>
        </FadeInSection>
        <div className="space-y-24">
          {hardcodedSaleItems.map((item, index) => (
            <FadeInSection key={item.id}>
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
              >
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl h-96 ${
                    index % 2 === 0 ? "md:order-last" : ""
                  }`}
                >
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-4xl font-aviano font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {item.title}
                  </h2>
                  <p className="text-slate-300 font-roboto leading-relaxed">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.features?.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="font-roboto">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:from-yellow-500 hover:to-orange-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
                  >
                    Узнать подробнее
                  </Button>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-24 bg-slate-800/50 mt-24">
        <div className="container mx-auto max-w-4xl text-center">
          <FadeInSection>
            <h2 className="text-4xl font-bold mb-4">Быстрая онлайн-оценка вашего авто</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время с предварительной оценкой вашего автомобиля.
            </p>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 text-left">
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
