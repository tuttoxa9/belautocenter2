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
  ExternalLink,
  Check,
  Send,
  MessageCircle,
  Navigation,
  Calendar,
  Star
} from "lucide-react"
import YandexMap from "@/components/yandex-map"

// Настройки кэширования для App Router
export const dynamic = 'force-static'
export const revalidate = 300

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "+375",
    message: "",
  })

  const [contactsData, setContactsData] = useState({
    title: "Контакты",
    subtitle: "Свяжитесь с нами любым удобным способом",
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

  useEffect(() => {
    loadContactsData()
  }, [])

  const loadContactsData = async () => {
    try {
      // Оптимизированная загрузка с кэшированием
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

      alert("Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.")
      setContactForm({ name: "", phone: "+375", message: "" })
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
      alert("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            {/* Loading skeleton */}
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div className="h-80 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
                Главная
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium">Контакты</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium">
            <MessageCircle className="w-4 h-4 mr-2" />
            Связаться с нами
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {contactsData.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {contactsData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - Map & Form */}
          <div className="xl:col-span-2 space-y-8">
            {/* Map Section */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Где нас найти
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <YandexMap
                  address={contactsData.address}
                  className="h-80 md:h-96 w-full"
                />
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{contactsData.address}</p>
                      <p className="text-sm text-gray-600">{contactsData.addressNote}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Остались вопросы? Напишите нам
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Ваше имя *
                      </Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Введите ваше имя"
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Номер телефона *
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                          placeholder="+375XXXXXXXXX"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12 pr-10"
                          required
                        />
                        {isPhoneValid(contactForm.phone) && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Ваше сообщение *
                    </Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Расскажите, чем мы можем помочь..."
                      rows={5}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 h-auto rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
              <a
                href={`tel:${contactsData.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="h-5 w-5" />
                <span className="font-semibold hidden sm:block">Позвонить</span>
              </a>
              <a
                href={`mailto:${contactsData.email}`}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="h-5 w-5" />
                <span className="font-semibold hidden sm:block">Написать</span>
              </a>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {/* Phone */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">Телефон</h3>
                      <a href={`tel:${contactsData.phone.replace(/\s/g, '')}`} className="text-green-600 hover:text-green-700 font-semibold transition-colors truncate block">
                        {contactsData.phone}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">{contactsData.phoneNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">Email</h3>
                      <a href={`mailto:${contactsData.email}`} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors truncate block">
                        {contactsData.email}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">{contactsData.emailNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-2">Время работы</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 font-medium">{contactsData.workingHours.weekdays}</p>
                        <p className="text-sm text-gray-700 font-medium">{contactsData.workingHours.weekends}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white pb-3">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Мы в соцсетях
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 group border border-pink-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">Instagram</p>
                        <p className="text-xs text-gray-600 truncate max-w-full">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 group border border-blue-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">Telegram</p>
                        <p className="text-xs text-gray-600 truncate max-w-full">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 group border border-indigo-100"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-indigo-100">
                        <Image
                          src="/av.png"
                          alt="av.by"
                          width={28}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">av.by</p>
                        <p className="text-xs text-gray-600 truncate max-w-full">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 group border border-gray-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-sm">TikTok</p>
                        <p className="text-xs text-gray-600 truncate max-w-full">{contactsData.socialMedia.tiktok.name}</p>
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
