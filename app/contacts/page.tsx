'use client'

import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import YandexMap from '@/components/yandex-map'

// Пример данных - замените на реальные данные из вашего API/CMS
const contactsData = {
  title: "Контакты",
  subtitle: "Свяжитесь с нами любым удобным способом",
  address: "г. Минск, ул. Примерная, 123",
  addressNote: "Рядом с метро",
  phone: "+375 29 123 45 67",
  phoneNote: "Звонки принимаем круглосуточно",
  email: "info@belautocenter.by",
  emailNote: "Ответим в течение часа",
  workingHours: {
    weekdays: "Пн-Пт: 9:00 - 18:00",
    weekends: "Сб-Вс: 10:00 - 16:00"
  },
  socialMedia: {
    instagram: {
      name: "@belautocenter",
      url: "https://instagram.com/belautocenter"
    },
    telegram: {
      name: "@belautocenter",
      url: "https://t.me/belautocenter"
    },
    avby: {
      name: "Белавтоцентр",
      url: "https://av.by"
    },
    tiktok: {
      name: "@belautocenter",
      url: "https://tiktok.com/@belautocenter"
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
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Здесь будет логика отправки формы
      await new Promise(resolve => setTimeout(resolve, 2000)) // Имитация отправки

      // Очистка формы после успешной отправки
      setContactForm({ name: '', phone: '', message: '' })

      // Показать уведомление об успехе
      console.log('Форма отправлена успешно')
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">

        {/* Хлебные крошки */}
        <nav className="mb-6 lg:mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Главная
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Контакты</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-8 lg:mb-16">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 tracking-tight">
            {contactsData.title}
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {contactsData.subtitle}
          </p>
        </div>

        {/* Основное содержимое */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-16">

          {/* Левая колонка - Карта */}
          <div className="space-y-6 lg:space-y-8">
            {/* Карта */}
            <Card className="overflow-hidden shadow-xl border-0 bg-white">
              <CardContent className="p-0">
                <div className="relative">
                  <YandexMap
                    address={contactsData.address}
                    className="h-64 lg:h-96 w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
                <div className="p-4 lg:p-6 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                      <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base lg:text-lg mb-1">Наш адрес</h3>
                      <p className="text-gray-700 font-medium text-sm lg:text-base">{contactsData.address}</p>
                      <p className="text-gray-500 text-xs lg:text-sm">{contactsData.addressNote}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контактная информация */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Телефон */}
              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center space-y-3 lg:space-y-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <Phone className="h-6 w-6 lg:h-8 lg:w-8 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Телефон</h3>
                      <a
                        href={`tel:${contactsData.phone.replace(/\s/g, '')}`}
                        className="text-gray-700 hover:text-gray-900 font-medium transition-colors block text-xs lg:text-base"
                      >
                        {contactsData.phone}
                      </a>
                      <p className="text-gray-500 text-xs mt-1">{contactsData.phoneNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center space-y-3 lg:space-y-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <Mail className="h-6 w-6 lg:h-8 lg:w-8 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Email</h3>
                      <a
                        href={`mailto:${contactsData.email}`}
                        className="text-gray-700 hover:text-gray-900 font-medium transition-colors block text-xs lg:text-base truncate"
                      >
                        {contactsData.email}
                      </a>
                      <p className="text-gray-500 text-xs mt-1">{contactsData.emailNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Правая колонка - Форма и дополнительная информация */}
          <div className="space-y-6 lg:space-y-8">
            {/* Форма обратной связи */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="pb-4 lg:pb-6">
                <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                  <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-gray-700" />
                  Написать нам
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium text-sm lg:text-base">
                      Ваше имя
                    </Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Введите ваше имя"
                      className="h-10 lg:h-12 border-gray-200 focus:border-gray-400 focus:ring-0 shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium text-sm lg:text-base">
                      Номер телефона
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375XXXXXXXXX"
                        className="h-10 lg:h-12 border-gray-200 focus:border-gray-400 focus:ring-0 shadow-sm pr-10"
                        required
                      />
                      {isPhoneValid(contactForm.phone) && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium text-sm lg:text-base">
                      Ваше сообщение
                    </Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Расскажите, чем мы можем помочь..."
                      rows={3}
                      className="border-gray-200 focus:border-gray-400 focus:ring-0 shadow-sm resize-none text-sm lg:text-base"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-12 lg:h-14 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Отправить сообщение
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-700" />
                  Время работы
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm lg:text-base">Будние дни</p>
                      <p className="text-gray-600 text-xs lg:text-sm truncate">{contactsData.workingHours.weekdays}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs lg:text-sm flex-shrink-0 ml-2">
                      Открыто
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm lg:text-base">Выходные</p>
                      <p className="text-gray-600 text-xs lg:text-sm truncate">{contactsData.workingHours.weekends}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs lg:text-sm flex-shrink-0 ml-2">
                      Ограничено
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Социальные сети */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-4 lg:pb-6">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 flex items-center justify-center">
              <Star className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-700" />
              Мы в социальных сетях
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {contactsData.socialMedia.instagram && (
                <a
                  href={contactsData.socialMedia.instagram.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Instagram className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-xs lg:text-sm">Instagram</p>
                    <p className="text-gray-600 text-xs truncate max-w-full">{contactsData.socialMedia.instagram.name}</p>
                  </div>
                </a>
              )}

              {contactsData.socialMedia.telegram && (
                <a
                  href={contactsData.socialMedia.telegram.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-xs lg:text-sm">Telegram</p>
                    <p className="text-gray-600 text-xs truncate max-w-full">{contactsData.socialMedia.telegram.name}</p>
                  </div>
                </a>
              )}

              {contactsData.socialMedia.avby && (
                <a
                  href={contactsData.socialMedia.avby.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md border border-gray-200">
                    <Image
                      src="/av.png"
                      alt="av.by"
                      width={24}
                      height={17}
                      className="object-contain lg:w-8 lg:h-6"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-xs lg:text-sm">av.by</p>
                    <p className="text-gray-600 text-xs truncate max-w-full">{contactsData.socialMedia.avby.name}</p>
                  </div>
                </a>
              )}

              {contactsData.socialMedia.tiktok && (
                <a
                  href={contactsData.socialMedia.tiktok.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <svg className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-xs lg:text-sm">TikTok</p>
                    <p className="text-gray-600 text-xs truncate max-w-full">{contactsData.socialMedia.tiktok.name}</p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
