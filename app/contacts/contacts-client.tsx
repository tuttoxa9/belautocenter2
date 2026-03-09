'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  ArrowRight,
  Instagram
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusButton } from '@/components/ui/status-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import YandexMap from '@/components/yandex-map'
import { useButtonState } from '@/hooks/use-button-state'
import { useNotification } from '@/components/providers/notification-provider'
import { formatPhoneNumber, isPhoneValid } from "@/lib/validation"

interface ContactsData {
  title?: string
  subtitle?: string
  address?: string
  addressNote?: string
  phone?: string
  phone2?: string
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

interface ContactsClientProps {
  contactsData: ContactsData
}

export default function ContactsClient({ contactsData }: ContactsClientProps) {
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPhoneValid(contactForm.phone)) {
      return
    }

    await submitButtonState.execute(async () => {
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

      setContactForm({ name: '', phone: '', message: '' })
      showSuccess("Ваше сообщение успешно отправлено! Мы ответим вам в ближайшее время.")
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400" prefetch={true}>
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-slate-900 dark:text-white font-medium">Контакты</li>
            </ol>
          </nav>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {contactsData.title || 'Контакты'}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl">
              {contactsData.subtitle || 'Свяжитесь с нами любым удобным способом'}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Phone Card */}
          <Card className="border border-slate-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a] h-full rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <Phone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xl mb-4">Телефон</h3>
              <div className="flex-1 space-y-3 mb-6">
                {contactsData.phone && (
                  <a
                    href={`tel:${contactsData.phone.replace(/\s/g, '')}`}
                    className="block text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-lg font-medium"
                  >
                    {contactsData.phone}
                  </a>
                )}
                {contactsData.phone2 && (
                  <a
                    href={`tel:${contactsData.phone2.replace(/\s/g, '')}`}
                    className="block text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-lg font-medium"
                  >
                    {contactsData.phone2}
                  </a>
                )}
              </div>
              {contactsData.phoneNote && (
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-auto">{contactsData.phoneNote}</p>
              )}
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="border border-slate-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a] h-full rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xl mb-4">Email</h3>
              <div className="flex-1 mb-6 flex items-center justify-center">
                {contactsData.email && (
                  <a
                    href={`mailto:${contactsData.email}`}
                    className="text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-lg font-medium break-all"
                  >
                    {contactsData.email}
                  </a>
                )}
              </div>
              {contactsData.emailNote && (
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-auto">{contactsData.emailNote}</p>
              )}
            </CardContent>
          </Card>

          {/* Working Hours Card */}
          <Card className="border border-slate-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a] h-full rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xl mb-4">Время работы</h3>
              <div className="flex-1 w-full max-w-[220px] mb-6 space-y-4">
                {contactsData.workingHours?.weekdays && (
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-800 pb-3">
                    <span className="text-slate-500 dark:text-gray-400">Пн-Пт</span>
                    <span className="text-slate-900 dark:text-white font-medium">{contactsData.workingHours.weekdays}</span>
                  </div>
                )}
                {contactsData.workingHours?.weekends && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-gray-400">Сб-Вс</span>
                    <span className="text-slate-900 dark:text-white font-medium">{contactsData.workingHours.weekends}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          {/* Map */}
          <Card className="border border-slate-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="flex-1 relative w-full h-full min-h-[350px]">
              {contactsData.address ? (
                <YandexMap
                  address={contactsData.address}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-gray-900 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-slate-400 dark:text-gray-600" />
                </div>
              )}
            </div>
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-slate-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">Наш адрес</h3>
                  {contactsData.address && (
                    <p className="text-slate-700 dark:text-gray-300 text-base mb-1">{contactsData.address}</p>
                  )}
                  {contactsData.addressNote && (
                    <p className="text-slate-500 dark:text-gray-500 text-sm">{contactsData.addressNote}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Card className="border border-slate-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a] rounded-2xl flex flex-col h-full">
            <CardHeader className="p-6 md:p-8 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Написать нам</CardTitle>
              <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm md:text-base">
                Оставьте свои контактные данные, и наш менеджер свяжется с вами для консультации.
              </p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0 flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                <div>
                  <Label htmlFor="name" className="text-slate-700 dark:text-gray-300 font-medium mb-1.5 block">
                    Ваше имя
                  </Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Введите ваше имя"
                    className="h-12 border-slate-200 dark:border-gray-800 dark:bg-black dark:text-white focus:border-slate-400 dark:focus:border-gray-600 focus:ring-0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-700 dark:text-gray-300 font-medium mb-1.5 block">
                    Номер телефона
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="+375XXXXXXXXX"
                      className="h-12 border-slate-200 dark:border-gray-800 dark:bg-black dark:text-white focus:border-slate-400 dark:focus:border-gray-600 focus:ring-0 pr-10"
                      required
                    />
                    {isPhoneValid(contactForm.phone) && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 dark:text-green-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <Label htmlFor="message" className="text-slate-700 dark:text-gray-300 font-medium mb-1.5 block">
                    Ваше сообщение
                  </Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Расскажите, чем мы можем помочь..."
                    className="flex-1 min-h-[120px] border-slate-200 dark:border-gray-800 dark:bg-black dark:text-white focus:border-slate-400 dark:focus:border-gray-600 focus:ring-0 resize-none"
                    required
                  />
                </div>

                <div className="pt-4">
                  <StatusButton
                    type="submit"
                    size="lg"
                    state={submitButtonState.state}
                    className="w-full h-12 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold rounded-xl text-base"
                    loadingText="Отправляем..."
                    successText="Отправлено!"
                    errorText="Ошибка отправки"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить сообщение
                  </StatusButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Section */}
        {(contactsData.socialMedia && Object.keys(contactsData.socialMedia).length > 0) ? (
          <div className="pt-10 border-t border-slate-200 dark:border-gray-800">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Мы в социальных сетях</h2>
              <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">
                Подписывайтесь на нас, чтобы следить за новыми поступлениями, акциями и обзорами автомобилей.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactsData.socialMedia.instagram && (
                <a
                  href={contactsData.socialMedia.instagram.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-gray-800 text-center hover:border-pink-300 dark:hover:border-pink-800/50 group"
                >
                  <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/10 rounded-2xl flex items-center justify-center mb-5 text-pink-500 dark:text-pink-400 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/20">
                    <Instagram className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xl mb-2">Instagram</h4>
                  <p className="text-slate-700 dark:text-gray-300 font-medium mb-1">{contactsData.socialMedia.instagram.name}</p>
                  <p className="text-slate-500 dark:text-gray-500 text-sm">Фото и видео</p>
                </a>
              )}

              {contactsData.socialMedia.telegram && (
                <a
                  href={contactsData.socialMedia.telegram.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-gray-800 text-center hover:border-blue-300 dark:hover:border-blue-800/50 group"
                >
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center mb-5 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.584 7.44c-.12.528-.432.66-.876.412l-2.424-1.788-1.164 1.12c-.132.132-.24.24-.492.24l.168-2.388 4.416-3.984c.192-.168-.036-.264-.3-.096l-5.46 3.432-2.352-.744c-.516-.156-.528-.516.108-.768l9.192-3.54c.432-.156.804.108.672.672z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xl mb-2">Telegram</h4>
                  <p className="text-slate-700 dark:text-gray-300 font-medium mb-1">{contactsData.socialMedia.telegram.name}</p>
                  <p className="text-slate-500 dark:text-gray-500 text-sm">Быстрые консультации</p>
                </a>
              )}

              {contactsData.socialMedia.avby && (
                <a
                  href={contactsData.socialMedia.avby.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-gray-800 text-center hover:border-emerald-300 dark:hover:border-emerald-800/50 group"
                >
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20">
                    <Image
                      src="/av.png"
                      alt="av.by"
                      width={32}
                      height={24}
                      className="object-contain dark:invert opacity-80 group-hover:opacity-100"
                    />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xl mb-2">av.by</h4>
                  <p className="text-slate-700 dark:text-gray-300 font-medium mb-1">{contactsData.socialMedia.avby.name}</p>
                  <p className="text-slate-500 dark:text-gray-500 text-sm">Наш профиль</p>
                </a>
              )}

              {contactsData.socialMedia.tiktok && (
                <a
                  href={contactsData.socialMedia.tiktok.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-gray-800 text-center hover:border-slate-400 dark:hover:border-gray-600 group"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mb-5 text-slate-900 dark:text-white group-hover:bg-slate-200 dark:group-hover:bg-gray-800">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xl mb-2">TikTok</h4>
                  <p className="text-slate-700 dark:text-gray-300 font-medium mb-1">{contactsData.socialMedia.tiktok.name}</p>
                  <p className="text-slate-500 dark:text-gray-500 text-sm">Короткие видео</p>
                </a>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
