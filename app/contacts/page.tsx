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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-slate-900 font-medium">Контакты</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <Phone className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">{contactsData.title || 'Контакты'}</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
                <span>Свяжитесь с нами</span>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{contactsData.title || 'Контакты'}</h1>
                <p className="text-slate-600 mt-1">{contactsData.subtitle || 'Свяжитесь с нами любым удобным способом'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

          {/* Phone Card */}
          {contactsData.phone && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 flex-shrink-0">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm md:text-base">Телефон</h3>
                    <p className="text-slate-600 text-xs md:text-sm truncate">Звоните в любое время</p>
                  </div>
                </div>
                <a
                  href={`tel:${contactsData.phone.replace(/\s/g, '')}`}
                  className="text-slate-700 hover:text-slate-900 font-medium text-base md:text-lg block transition-colors"
                >
                  {contactsData.phone}
                </a>
                {contactsData.phoneNote && (
                  <p className="text-slate-500 text-xs md:text-sm mt-2">{contactsData.phoneNote}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email Card */}
          {contactsData.email && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 flex-shrink-0">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm md:text-base">Email</h3>
                    <p className="text-slate-600 text-xs md:text-sm truncate">Напишите нам</p>
                  </div>
                </div>
                <a
                  href={`mailto:${contactsData.email}`}
                  className="text-slate-700 hover:text-slate-900 font-medium text-sm md:text-lg block transition-colors break-all"
                >
                  {contactsData.email}
                </a>
                {contactsData.emailNote && (
                  <p className="text-slate-500 text-xs md:text-sm mt-2">{contactsData.emailNote}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Working Hours Card */}
          {contactsData.workingHours && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 md:col-span-2 lg:col-span-1">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 flex-shrink-0">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm md:text-base">Время работы</h3>
                    <p className="text-slate-600 text-xs md:text-sm truncate">Режим работы</p>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  {contactsData.workingHours.weekdays && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-slate-700 font-medium">Пн-Пт:</span>
                      <span className="text-slate-600 text-right">{contactsData.workingHours.weekdays}</span>
                    </div>
                  )}
                  {contactsData.workingHours.weekends && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-slate-700 font-medium">Сб-Вс:</span>
                      <span className="text-slate-600 text-right">{contactsData.workingHours.weekends}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map and Contact Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Map Section */}
          {contactsData.address && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-0">
                <div className="w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-t-lg">
                  <YandexMap
                    address={contactsData.address}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50 flex-shrink-0">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">Наш адрес</h3>
                      <p className="text-slate-600 text-xs md:text-sm truncate">Приезжайте к нам</p>
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium text-sm md:text-base">{contactsData.address}</p>
                  {contactsData.addressNote && (
                    <p className="text-slate-500 text-xs md:text-sm mt-2">{contactsData.addressNote}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Form */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50 mr-2 md:mr-3 flex-shrink-0">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                Написать нам
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium text-xs md:text-sm">
                    Ваше имя
                  </Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Введите ваше имя"
                    className="mt-1 border-slate-200 focus:border-slate-400 focus:ring-0 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-700 font-medium text-xs md:text-sm">
                    Номер телефона
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="+375XXXXXXXXX"
                      className="border-slate-200 focus:border-slate-400 focus:ring-0 pr-10 text-sm"
                      required
                    />
                    {isPhoneValid(contactForm.phone) && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-slate-700 font-medium text-xs md:text-sm">
                    Ваше сообщение
                  </Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Расскажите, чем мы можем помочь..."
                    rows={3}
                    className="mt-1 border-slate-200 focus:border-slate-400 focus:ring-0 resize-none text-sm"
                    required
                  />
                </div>

                <StatusButton
                  type="submit"
                  size="lg"
                  state={submitButtonState.state}
                  className="w-full bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                  loadingText="Отправляем..."
                  successText="Отправлено!"
                  errorText="Ошибка отправки"
                >
                  <Send className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Отправить сообщение
                </StatusButton>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Social Media - Blue gradient theme */}
        {contactsData.socialMedia && Object.keys(contactsData.socialMedia).length > 0 && (
          <section className="relative pt-12 pb-32 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 rounded-t-[40px] -mb-20 overflow-hidden mt-8 w-screen -mx-[50vw] ml-[50%] min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/80 to-cyan-400/70"></div>
            <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center space-x-3 mb-8">
                  <div className="w-11 h-11 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-white tracking-tight">
                    Мы в социальных сетях
                  </h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
                  {contactsData.socialMedia.instagram && (
                    <a
                      href={contactsData.socialMedia.instagram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                        <Instagram className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800 text-base">Instagram</p>
                        <p className="text-slate-600 text-sm font-light">{contactsData.socialMedia.instagram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.telegram && (
                    <a
                      href={contactsData.socialMedia.telegram.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800 text-base">Telegram</p>
                        <p className="text-slate-600 text-sm font-light">{contactsData.socialMedia.telegram.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.avby && (
                    <a
                      href={contactsData.socialMedia.avby.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-200">
                        <Image
                          src="/av.png"
                          alt="av.by"
                          width={28}
                          height={21}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800 text-base">av.by</p>
                        <p className="text-slate-600 text-sm font-light">{contactsData.socialMedia.avby.name}</p>
                      </div>
                    </a>
                  )}

                  {contactsData.socialMedia.tiktok && (
                    <a
                      href={contactsData.socialMedia.tiktok.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800 text-base">TikTok</p>
                        <p className="text-slate-600 text-sm font-light">{contactsData.socialMedia.tiktok.name}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
