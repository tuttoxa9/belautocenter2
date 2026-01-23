"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { StatusButton } from "@/components/ui/status-button"
import {
  DollarSign,
  Zap,
  Target,
  CheckCircle,
  Phone,
  Instagram,
  BarChart3,
  Shield
} from "lucide-react"
import { FaTiktok } from "react-icons/fa"
import { firestoreApi } from "@/lib/firestore-api"
import { formatPhoneNumber, isPhoneValid } from "@/lib/validation"

interface SellCarSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Settings {
  phone: string
  phone2?: string
  workingHours?: string
}

export function SellCarSheet({ open, onOpenChange }: SellCarSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "+375",
  })
  const [settings, setSettings] = useState<Settings | null>(null)

  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    try {
      const data = await firestoreApi.getDocument("settings", "main")
      if (data) {
        setSettings(data as Settings)
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPhoneValid(formData.phone)) {
      return
    }

    await submitButtonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", {
          ...formData,
          type: "commission_sale_request",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        // Ignore firestore error if any, still try telegram
      }

      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "commission_sale_request",
          message: "Заявка на комиссионную продажу (из меню)"
        }),
      })

      setFormData({ name: "", phone: "+375" })
      showSuccess("Заявка принята! Мы свяжемся с вами для обсуждения продажи вашего авто.")
      setTimeout(() => onOpenChange(false), 2000)
    })
  }

  const advantages = [
    {
      icon: DollarSign,
      title: "Комиссия всего 450$",
      desc: "Экономия до 350$ по сравнению с конкурентами",
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    {
      icon: Zap,
      title: "Быстрая продажа",
      desc: "Средний срок продажи 7-14 дней",
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      icon: Target,
      title: "Максимальный охват",
      desc: "Реклама в Instagram, TikTok, Google, av.by",
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    }
  ]

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Продать автомобиль"
      className="sm:w-[500px]" // Override width for better look
    >
      <div className="space-y-6">

        {/* Hero Info */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Комиссионная продажа</h3>
            <p className="text-blue-100 text-sm mb-4">
              Мы возьмем на себя все заботы по продаже вашего автомобиля. Профессиональная фотосъемка, размещение на всех площадках и общение с покупателями.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>Оплата только по факту продажи</span>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="grid gap-3">
          {advantages.map((adv, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className={`p-2 rounded-lg ${adv.bg} ${adv.color}`}>
                <adv.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{adv.title}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-between px-2 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
             <Instagram className="w-4 h-4 text-pink-500" />
             <FaTiktok className="w-4 h-4 text-black dark:text-white" />
             <BarChart3 className="w-4 h-4 text-blue-500" />
             <span>Активное продвижение</span>
           </div>
           <div className="text-xs font-bold text-slate-900 dark:text-white">
             100k+ охват
           </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            Заявка на продажу
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sell-name">Ваше имя</Label>
              <Input
                id="sell-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Введите имя"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="sell-phone">Телефон</Label>
              <Input
                id="sell-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                placeholder="+375 (XX) XXX-XX-XX"
                className="mt-1"
                required
              />
            </div>

            <StatusButton
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              state={submitButtonState.state}
              disabled={!isPhoneValid(formData.phone) || !formData.name}
              loadingText="Отправляем..."
              successText="Отправлено!"
            >
              Отправить заявку
            </StatusButton>
            <p className="text-[10px] text-center text-slate-400">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        </div>

        {/* Contacts */}
        {settings && (
          <div className="text-center space-y-2 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Или позвоните нам напрямую</p>
            <div className="flex flex-col gap-1">
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                  {settings.phone}
                </a>
              )}
              {settings.phone2 && (
                <a href={`tel:${settings.phone2.replace(/\s/g, "")}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                  {settings.phone2}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </UniversalDrawer>
  )
}
