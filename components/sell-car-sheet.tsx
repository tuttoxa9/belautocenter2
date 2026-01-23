"use client"

import React, { useState } from "react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Phone, DollarSign, Clock, ShieldCheck, Car } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useButtonState } from "@/hooks/use-button-state"
import { StatusButton } from "@/components/ui/status-button"
import { useNotification } from "@/components/providers/notification-provider"
import { firestoreApi } from "@/lib/firestore-api"

interface SellCarSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SellCarSheet({ open, onOpenChange }: SellCarSheetProps) {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({ name: "", phone: "+375" })
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

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

    await submitButtonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", {
          ...formData,
          type: "sell_car_request",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        // Ignore firestore error
      }

      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "sell_car_request",
        }),
      })

      onOpenChange(false)
      setFormData({ name: "", phone: "+375" })
      showSuccess("Заявка успешно отправлена! Мы свяжемся с вами для оценки автомобиля.")
    })
  }

  const benefits = [
    {
      icon: DollarSign,
      title: "Выгодная цена",
      description: "Оценка до 95% от рыночной стоимости"
    },
    {
      icon: Clock,
      title: "Быстрая сделка",
      description: "Деньги в день обращения, оформление за 1 час"
    },
    {
      icon: ShieldCheck,
      title: "Безопасность",
      description: "Юридическая чистота и официальный договор"
    },
    {
      icon: Car,
      title: "Любые авто",
      description: "Выкупаем автомобили любых марок и годов"
    }
  ]

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Продать автомобиль"
      position="right"
    >
      <div className="space-y-8">
        {/* Intro Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="mb-2 text-xl font-bold">Срочный выкуп авто</h3>
            <p className="text-blue-100">
              Хотите быстро и выгодно продать свой автомобиль? Мы предлагаем лучшие условия на рынке!
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map((item, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:text-blue-400">
                <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contacts Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-medium text-slate-500 dark:text-gray-400">
            Позвоните нам для предварительной оценки
          </p>
          {settings?.main?.phone ? (
            <a
              href={`tel:${settings.main.phone.replace(/\s/g, "")}`}
              className="mb-1 block text-2xl font-bold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
            >
              {settings.main.phone}
            </a>
          ) : (
            <div className="h-8 w-48 mx-auto bg-slate-200 dark:bg-gray-800 animate-pulse rounded"></div>
          )}
          <p className="text-xs text-slate-400 dark:text-gray-500">
            {settings?.main?.workingHours || "Ежедневно с 9:00 до 21:00"}
          </p>
        </div>

        {/* Callback Form */}
        <div>
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-gray-800"></div>
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">или оставьте заявку</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-gray-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-name">Ваше имя</Label>
              <Input
                id="sell-name"
                placeholder="Как к вам обращаться"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50 dark:bg-gray-800/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-phone">Номер телефона</Label>
              <div className="relative">
                <Input
                  id="sell-phone"
                  placeholder="+375XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  className="bg-slate-50 pr-10 dark:bg-gray-800/50"
                  required
                />
                {isPhoneValid(formData.phone) && (
                  <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </div>

            <StatusButton
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-700"
              size="lg"
              state={submitButtonState.state}
              loadingText="Отправка..."
              successText="Заявка принята!"
            >
              <Phone className="mr-2 h-4 w-4" />
              Жду звонка
            </StatusButton>

            <p className="text-center text-xs text-slate-400 dark:text-gray-500">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
            </p>
          </form>
        </div>
      </div>
    </UniversalDrawer>
  )
}
