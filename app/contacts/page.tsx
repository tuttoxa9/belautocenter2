"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Send,
  MessageCircle,
  Navigation,
  Calendar,
  Wrench,
  Car,
  Headphones,
  Settings,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Star,
  Timer,
  AlertCircle
} from "lucide-react"
import YandexMap from "@/components/yandex-map"

// Используем динамический рендеринг для клиентского компонента
export const dynamic = 'force-dynamic'

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStation, setActiveStation] = useState(0)
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "+375",
    message: "",
    serviceType: "general"
  })

  const [contactsData, setContactsData] = useState({
    title: "Контакты",
    subtitle: "Автосервисная станция полного цикла",
    address: "Минск, Большое Стиклево 83",
    addressNote: 'Рядом с торговым центром "Примерный"',
    phone: "+375 29 123-45-67",
    phoneNote: "Звонки принимаем ежедневно",
    email: "info@avtobusiness.by",
    emailNote: "Отвечаем в течение часа",
    workingHours: {
      weekdays: "Понедельник - Пятница: 9:00 - 21:00",
      weekends: "Суббота - Воскресенье: 10:00 - 20:00",
    },
    socialMedia: {
      instagram: {
        name: "@avtobusiness_by",
        url: "https://instagram.com/avtobusiness_by"
      },
      telegram: {
        name: "@avtobusiness",
        url: "https://t.me/avtobusiness"
      },
      avby: {
        name: "av.by/company/avtobusiness",
        url: "https://av.by/company/avtobusiness"
      },
      tiktok: {
        name: "@avtobusiness_by",
        url: "https://tiktok.com/@avtobusiness_by"
      },
    },
  })

  // Рабочие станции автосервиса
  const serviceStations = [
    {
      id: "reception",
      title: "Приёмка",
      description: "Регистрация и консультация",
      icon: Headphones,
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    {
      id: "diagnostics",
      title: "Диагностика",
      description: "Техническая поддержка",
      icon: Settings,
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600",
      borderColor: "border-orange-200",
      textColor: "text-orange-700"
    },
    {
      id: "service",
      title: "Сервис",
      description: "Обслуживание и ремонт",
      icon: Wrench,
      color: "green",
      bgGradient: "from-green-500 to-green-600",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      id: "delivery",
      title: "Выдача",
      description: "Оформление документов",
      icon: CheckCircle,
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    }
  ]

  const contactChannels = [
    {
      type: "phone",
      icon: Phone,
      title: "Горячая линия",
      value: contactsData.phone,
      description: "Экстренная связь 24/7",
      action: `tel:${contactsData.phone.replace(/\s/g, '')}`,
      gradient: "from-red-500 to-red-600",
      status: "Активна"
    },
    {
      type: "email",
      icon: Mail,
      title: "Email поддержка",
      value: contactsData.email,
      description: "Ответ в течение часа",
      action: `mailto:${contactsData.email}`,
      gradient: "from-blue-500 to-blue-600",
      status: "Онлайн"
    },
    {
      type: "location",
      icon: MapPin,
      title: "Сервисный центр",
      value: contactsData.address,
      description: contactsData.addressNote,
      action: "#map",
      gradient: "from-green-500 to-green-600",
      status: "Открыт"
    }
  ]

  useEffect(() => {
    loadContactsData()
    // Автоматическая смена активной станции
    const interval = setInterval(() => {
      setActiveStation(prev => (prev + 1) % serviceStations.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadContactsData = async () => {
    try {
      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        setContactsData(contactsDoc.data() as typeof contactsData)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)
    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "contact-forms"), {
        ...contactForm,
        timestamp: new Date(),
        status: "new"
      })

      try {
        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...contactForm,
            type: 'contact_form',
          }),
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
      }

      alert("Заявка принята в работу! Наш мастер свяжется с вами в ближайшее время.")
      setContactForm({ name: "", phone: "+375", message: "", serviceType: "general" })
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            {/* Автосервисная загрузка */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto animate-spin">
                <Car className="w-8 h-8 text-white m-4" />
              </div>
              <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Заголовок станции */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <Badge variant="outline" className="mb-6 px-6 py-3 text-base font-medium bg-blue-600/20 border-blue-400 text-blue-300">
              <Car className="w-5 h-5 mr-2" />
              Автосервисная станция
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              {contactsData.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {contactsData.subtitle}
            </p>
          </div>
        </div>

        {/* Рабочие станции */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {serviceStations.map((station, index) => (
            <Card
              key={station.id}
              className={`relative overflow-hidden border-0 bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer transition-all duration-500 hover:scale-105 ${
                activeStation === index ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/25' : ''
              }`}
              onClick={() => setActiveStation(index)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${station.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  activeStation === index ? 'scale-110' : ''
                }`}>
                  <station.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{station.title}</h3>
                <p className="text-sm text-gray-400">{station.description}</p>
                {activeStation === index && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Основная рабочая зона */}
          <div className="xl:col-span-2 space-y-8">
            {/* Панель управления станцией */}
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Settings className="h-6 w-6 mr-3" />
                  Станция №{activeStation + 1}: {serviceStations[activeStation].title}
                  <Badge className="ml-auto bg-green-500 text-white">
                    <Zap className="w-4 h-4 mr-1" />
                    Активна
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300 font-medium flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Имя клиента *
                      </Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Введите ваше имя"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300 font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Контактный номер *
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                          placeholder="+375XXXXXXXXX"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12 pr-10"
                          required
                        />
                        {isPhoneValid(contactForm.phone) && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-gray-300 font-medium flex items-center">
                      <Wrench className="w-4 h-4 mr-2" />
                      Тип обслуживания
                    </Label>
                    <select
                      id="serviceType"
                      value={contactForm.serviceType}
                      onChange={(e) => setContactForm({ ...contactForm, serviceType: e.target.value })}
                      className="w-full h-12 bg-gray-700 border border-gray-600 text-white rounded-md px-3 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="general">Общие вопросы</option>
                      <option value="sales">Продажа автомобилей</option>
                      <option value="service">Сервисное обслуживание</option>
                      <option value="parts">Запчасти</option>
                      <option value="warranty">Гарантийные вопросы</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300 font-medium flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Описание задачи *
                    </Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Опишите вашу задачу или вопрос..."
                      rows={5}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 h-auto rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Timer className="animate-spin h-5 w-5 mr-2" />
                        Обработка заявки...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Отправить в работу
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Карта местоположения */}
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden" id="map">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  GPS навигация к сервису
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <YandexMap
                  address={contactsData.address}
                  className="h-80 md:h-96 w-full"
                />
                <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-800">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-semibold text-white">{contactsData.address}</p>
                      <p className="text-sm text-gray-300">{contactsData.addressNote}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Панель мониторинга */}
          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900">
              <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white pb-3">
                <CardTitle className="text-lg font-bold flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Каналы связи
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {contactChannels.map((channel, index) => (
                  <a
                    key={channel.type}
                    href={channel.action}
                    className="block p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${channel.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <channel.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white text-sm">{channel.title}</h3>
                          <Badge className="text-xs px-2 py-1 bg-green-500 text-white">
                            {channel.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 truncate">{channel.value}</p>
                        <p className="text-xs text-gray-400">{channel.description}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Режим работы */}
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-3">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Режим работы станции
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Будние дни</p>
                      <p className="text-xs text-gray-400">{contactsData.workingHours.weekdays}</p>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Открыт
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Выходные</p>
                      <p className="text-xs text-gray-400">{contactsData.workingHours.weekends}</p>
                    </div>
                    <Badge className="bg-yellow-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Ограничен
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Социальные сети */}
            <Card className="border-0 bg-gradient-to-br from-gray-800 to-gray-900">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white pb-3">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Социальные каналы
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-xl hover:from-pink-800/50 hover:to-purple-800/50 transition-all duration-300 group border border-pink-800/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-white text-sm">Instagram</p>
                        <p className="text-xs text-gray-400 truncate max-w-full">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl hover:from-blue-800/50 hover:to-cyan-800/50 transition-all duration-300 group border border-blue-800/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-white text-sm">Telegram</p>
                        <p className="text-xs text-gray-400 truncate max-w-full">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-xl hover:from-indigo-800/50 hover:to-blue-800/50 transition-all duration-300 group border border-indigo-800/30"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-indigo-800/30">
                        <Image
                          src="/av.png"
                          alt="av.by"
                          width={28}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-white text-sm">av.by</p>
                        <p className="text-xs text-gray-400 truncate max-w-full">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-gray-900/50 to-slate-900/50 rounded-xl hover:from-gray-800/50 hover:to-slate-800/50 transition-all duration-300 group border border-gray-800/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-white text-sm">TikTok</p>
                        <p className="text-xs text-gray-400 truncate max-w-full">{contactsData.socialMedia.tiktok.name}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
