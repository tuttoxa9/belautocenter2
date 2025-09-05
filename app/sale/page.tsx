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
    image: '/car_credit3new.png',
    gradient: 'from-indigo-700 to-indigo-800'
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

export default function SalePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', phone: '+375', carInfo: '' })
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    document.body.classList.add('bg-slate-900');

    const loadData = async () => {
      try {
        setLoading(true)
        const saleItems = await firestoreApi.getCollection("saleItems")
        setItems(saleItems)
      } catch (error) {
        console.error("Error loading sale items:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

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
        {loading ? (
          <div className="text-center">
            <p>Загрузка...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-400">
            <p>Информация об услугах скоро появится.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {items.map((item, index) => (
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
        )}
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
