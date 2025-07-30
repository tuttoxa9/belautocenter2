'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  Send,
  ArrowRight,
  Instagram
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusButton } from '@/components/ui/status-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import YandexMap from '@/components/yandex-map'
import ContactsSkeleton from '@/components/contacts-skeleton'
import { useButtonState } from '@/hooks/use-button-state'
import { useNotification } from '@/components/providers/notification-provider'

interface ContactsData {
  title?: string
  subtitle?: string
  address?: string
  addressNote?: string
  phone?: string
  phoneNote?: string
  email?: string
  emailNote?: string
  workingHours?: {
    weekdays?: string
    weekends?: string
  }
  socialMedia?: {
    instagram?: {
      name?: string
      url?: string
    }
    telegram?: {
      name?: string
      url?: string
    }
    avby?: {
      name?: string
      url?: string
    }
    tiktok?: {
      name?: string
      url?: string
    }
  }
}


const formatPhoneNumber = (value: string) => {
  return value.replace(/[^\d+]/g, '')
}

const isPhoneValid = (phone: string) => {
  return phone.length >= 13 && phone.startsWith('+375')
}

export default function ContactsPage() {
  const [contactsData, setContactsData] = useState<ContactsData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    const fetchContactsData = async () => {
      try {
        // Используем прямой импорт Firebase как в админке
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        const contactsDoc = await getDoc(doc(db, "pages", "contacts"))

        if (contactsDoc.exists()) {
          const data = contactsDoc.data() as ContactsData
          setContactsData(data)
        } else {
          // Если документ не существует, используем fallback данные
          setContactsData({
            title: "Контакты",
            subtitle: "Свяжитесь с нами любым удобным способом",
            address: "г. Минск",
            phone: "+375 29 000 00 00",
            email: "info@belautocenter.by",
            workingHours: {
              weekdays: "Пн-Пт: 9:00 - 18:00",
              weekends: "Сб-Вс: 10:00 - 16:00"
            },
            socialMedia: {}
          })
        }
      } catch (err) {
        console.error('Ошибка загрузки данных контактов:', err)
        setError('Не удалось загрузить данные контактов')

        // Fallback данные при ошибке
        setContactsData({
          title: "Контакты",
          subtitle: "Свяжитесь с нами любым удобным способом",
          address: "г. Минск",
          phone: "+375 29 000 00 00",
          email: "info@belautocenter.by",
          workingHours: {
            weekdays: "Пн-Пт: 9:00 - 18:00",
            weekends: "Сб-Вс: 10:00 - 16:00"
          },
          socialMedia: {}
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContactsData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await submitButtonState.execute(async () => {
      // Отправка через API
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_form',
          name: contactForm.name,
          phone: contactForm.phone,
          message: contactForm.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки сообщения')
      }

      // Очистка формы после успешной отправки
      setContactForm({ name: '', phone: '', message: '' })
      showSuccess("Ваше сообщение успешно отправлено! Мы ответим вам в ближайшее время.")
    })
  }

  if (loading) {
    return <ContactsSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">

        {/* Хлебные крошки */}
        <nav className="mb-6 lg:mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-700 transition-colors font-medium">
                Главная
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-semibold">Контакты</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-xl opacity-20 scale-150"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl flex items-center justify-center border border-slate-700/50 transform hover:scale-105 transition-transform duration-300">
              <Phone className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
            {contactsData.title || 'Контакты'}
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            {contactsData.subtitle || 'Свяжитесь с нами любым удобным способом'}
          </p>
        </div>

        {/* Основное содержимое */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 lg:mb-20">

          {/* Левая колонка - Карта */}
          <div className="space-y-8 lg:space-y-10">
            {/* Карта */}
            {contactsData.address && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <Card className="relative overflow-hidden shadow-2xl border-0 bg-white rounded-3xl transform hover:scale-[1.02] transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-3xl">
                      <div className="w-full h-80 lg:h-96 overflow-hidden">
                        <YandexMap
                          address={contactsData.address}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                    <div className="p-6 lg:p-8 bg-gradient-to-br from-white via-slate-50 to-white">
                      <div className="flex items-start space-x-4 lg:space-x-6 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-30"></div>
                          <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700/50 transform hover:scale-110 transition-transform duration-300">
                            <MapPin className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg lg:text-xl mb-2">Наш адрес</h3>
                          <p className="text-slate-700 font-semibold text-base lg:text-lg">{contactsData.address}</p>
                          {contactsData.addressNote && (
                            <p className="text-slate-500 text-sm lg:text-base mt-1">{contactsData.addressNote}</p>
                          )}
                        </div>
                      </div>

                      {/* Время работы */}
                      {contactsData.workingHours && (
                        <div className="border-t border-slate-200 pt-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-md opacity-30"></div>
                              <div className="relative w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-xl border border-slate-600/50">
                                <Clock className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base lg:text-lg">Время работы</h3>
                          </div>
                          <div className="ml-13 space-y-2">
                            {contactsData.workingHours.weekdays && (
                              <div className="flex items-center justify-between text-sm lg:text-base bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg px-4 py-2 shadow-sm">
                                <span className="text-slate-800 font-semibold">Пн-Пт:</span>
                                <span className="text-slate-600 font-medium">{contactsData.workingHours.weekdays}</span>
                              </div>
                            )}
                            {contactsData.workingHours.weekends && (
                              <div className="flex items-center justify-between text-sm lg:text-base bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg px-4 py-2 shadow-sm">
                                <span className="text-slate-800 font-semibold">Сб-Вс:</span>
                                <span className="text-slate-600 font-medium">{contactsData.workingHours.weekends}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Контактная информация */}
            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              {/* Телефон */}
              {contactsData.phone && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <Card className="relative bg-white shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
                    <CardContent className="p-6 lg:p-8">
                      <div className="text-center space-y-4 lg:space-y-6">
                        <div className="relative inline-flex">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-30"></div>
                          <div className="relative w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border border-slate-700/50 transform hover:scale-110 transition-transform duration-300">
                            <Phone className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg">Телефон</h3>
                          <a
                            href={`tel:${contactsData.phone.replace(/\s/g, '')}`}
                            className="text-slate-700 hover:text-slate-900 font-semibold transition-colors block text-sm lg:text-lg hover:scale-105 transform duration-200"
                          >
                            {contactsData.phone}
                          </a>
                          {contactsData.phoneNote && (
                            <p className="text-slate-500 text-xs lg:text-sm mt-2">{contactsData.phoneNote}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Email */}
              {contactsData.email && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <Card className="relative bg-white shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl">
                    <CardContent className="p-6 lg:p-8">
                      <div className="text-center space-y-4 lg:space-y-6">
                        <div className="relative inline-flex">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30"></div>
                          <div className="relative w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border border-slate-700/50 transform hover:scale-110 transition-transform duration-300">
                            <Mail className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg">Email</h3>
                          <a
                            href={`mailto:${contactsData.email}`}
                            className="text-slate-700 hover:text-slate-900 font-semibold transition-colors block text-sm lg:text-lg truncate hover:scale-105 transform duration-200"
                          >
                            {contactsData.email}
                          </a>
                          {contactsData.emailNote && (
                            <p className="text-slate-500 text-xs lg:text-sm mt-2">{contactsData.emailNote}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - Форма и дополнительная информация */}
          <div className="space-y-8 lg:space-y-10">
            {/* Форма обратной связи */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Card className="relative bg-white shadow-2xl border-0 rounded-3xl">
                <CardHeader className="pb-6 lg:pb-8 pt-8 lg:pt-10">
                  <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center">
                    <div className="relative mr-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-30"></div>
                      <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-xl border border-slate-700/50">
                        <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                    </div>
                    Написать нам
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-8 lg:px-10 pb-8 lg:pb-10">
                  <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-slate-700 font-semibold text-base lg:text-lg">
                        Ваше имя
                      </Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Введите ваше имя"
                        className="h-12 lg:h-14 border-slate-300 focus:border-slate-500 focus:ring-0 shadow-lg bg-gradient-to-r from-white to-slate-50 rounded-xl text-base font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-slate-700 font-semibold text-base lg:text-lg">
                        Номер телефона
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                          placeholder="+375XXXXXXXXX"
                          className="h-12 lg:h-14 border-slate-300 focus:border-slate-500 focus:ring-0 shadow-lg bg-gradient-to-r from-white to-slate-50 rounded-xl pr-12 text-base font-medium"
                          required
                        />
                        {isPhoneValid(contactForm.phone) && (
                          <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-slate-700 font-semibold text-base lg:text-lg">
                        Ваше сообщение
                      </Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Расскажите, чем мы можем помочь..."
                        rows={4}
                        className="border-slate-300 focus:border-slate-500 focus:ring-0 shadow-lg resize-none text-base lg:text-lg bg-gradient-to-r from-white to-slate-50 rounded-xl font-medium"
                        required
                      />
                    </div>

                    <StatusButton
                      type="submit"
                      size="lg"
                      state={submitButtonState.state}
                      className="w-full h-14 lg:h-16 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-900 hover:via-black hover:to-slate-900 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 rounded-xl text-lg"
                      loadingText="Отправляем..."
                      successText="Отправлено!"
                      errorText="Ошибка отправки"
                    >
                      <Send className="h-6 w-6 mr-3" />
                      Отправить сообщение
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </StatusButton>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        {contactsData.socialMedia && Object.keys(contactsData.socialMedia).length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <Card className="relative bg-white shadow-2xl border-0 rounded-3xl">
              <CardHeader className="pb-6 lg:pb-8 pt-8 lg:pt-10">
                <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center justify-center">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur-md opacity-30"></div>
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-xl border border-slate-700/50">
                      <Star className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  Мы в социальных сетях
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 lg:px-10 pb-8 lg:pb-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 lg:space-y-6 p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border border-slate-700/50">
                          <Instagram className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-sm lg:text-base">Instagram</p>
                        <p className="text-slate-600 text-xs lg:text-sm truncate max-w-full font-medium">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 lg:space-y-6 p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border border-slate-700/50">
                          <svg className="h-7 w-7 lg:h-8 lg:w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-sm lg:text-base">Telegram</p>
                        <p className="text-slate-600 text-xs lg:text-sm truncate max-w-full font-medium">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 lg:space-y-6 p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border-2 border-slate-200">
                          <Image
                            src="/av.png"
                            alt="av.by"
                            width={32}
                            height={24}
                            className="object-contain lg:w-10 lg:h-8"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-sm lg:text-base">av.by</p>
                        <p className="text-slate-600 text-xs lg:text-sm truncate max-w-full font-medium">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 lg:space-y-6 p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border border-slate-700/50">
                          <svg className="h-7 w-7 lg:h-8 lg:w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-900 text-sm lg:text-base">TikTok</p>
                        <p className="text-slate-600 text-xs lg:text-sm truncate max-w-full font-medium">{contactsData.socialMedia.tiktok.name}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
