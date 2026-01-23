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
  Shield,
  FileText,
  Calculator,
  Settings,
  Handshake,
  Clock,
  Car
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
        // Ignore firestore error
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
      title: "Комиссия 450$",
      desc: "Экономия до 350$ (обычно от 800$)",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Zap,
      title: "Быстрая продажа",
      desc: "Средний срок продажи 7-14 дней",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      icon: Target,
      title: "Максимальный охват",
      desc: "Instagram, TikTok, Google, av.by",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Shield,
      title: "Безопасность",
      desc: "Юридическая чистота сделки",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ]

  const steps = [
    { id: 1, title: "Заявка", icon: Phone },
    { id: 2, title: "Оценка", icon: Calculator },
    { id: 3, title: "Договор", icon: FileText },
    { id: 4, title: "Подготовка", icon: Settings },
    { id: 5, title: "Реклама", icon: BarChart3 },
    { id: 6, title: "Продажа", icon: Handshake }
  ]

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Комиссионная продажа авто"
      className="sm:max-w-[1000px] w-full" // Значительно увеличиваем ширину на десктопе
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full">

        {/* LEFT COLUMN: INFO (Scrollable on mobile, Left side on desktop) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-950 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Car className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">Выгодно</span>
                <span className="text-blue-200 text-sm font-medium">Комиссия всего 450$</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">Продадим ваш автомобиль быстро и дорого</h3>
              <p className="text-blue-100 text-sm md:text-base mb-5 max-w-lg">
                Полное сопровождение сделки: от профессиональной фотосъемки и рекламы до оформления документов. Вы платите только за результат.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-lg">450$</div>
                    <div className="text-[10px] text-blue-100">Комиссия</div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-lg">7-14</div>
                    <div className="text-[10px] text-blue-100">Дней</div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-lg">15+</div>
                    <div className="text-[10px] text-blue-100">Площадок</div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-lg">100k+</div>
                    <div className="text-[10px] text-blue-100">Охват</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Advantages Grid */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Почему выбирают нас
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advantages.map((adv, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className={`p-2 rounded-lg shrink-0 ${adv.bg} ${adv.color}`}>
                    <adv.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{adv.title}</h5>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-tight mt-0.5">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="hidden sm:block">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Этапы работы
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {steps.map((step) => (
                 <div key={step.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-zinc-700 shrink-0">
                      <step.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-0.5">0{step.id}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white leading-none">{step.title}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Social Proof Compact */}
          <div className="flex flex-wrap gap-2">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-xs font-medium border border-pink-100 dark:border-pink-900/30">
                <Instagram className="w-3.5 h-3.5" /> Instagram
             </div>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <FaTiktok className="w-3.5 h-3.5" /> TikTok
             </div>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                <Target className="w-3.5 h-3.5" /> Google Ads
             </div>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium border border-green-100 dark:border-green-900/30">
                <CheckCircle className="w-3.5 h-3.5" /> av.by
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FORM (Sticky on Desktop) */}
        <div className="lg:col-span-5 flex flex-col h-full">
           <div className="lg:sticky lg:top-0 space-y-4 h-full flex flex-col">

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl flex-1 flex flex-col justify-center relative overflow-hidden group">

                {/* Decorative gradient blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>

                <div className="text-center mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Начните продажу</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Оставьте номер телефона, и мы перезвоним в течение 15 минут
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  <div className="space-y-1.5">
                    <Label htmlFor="sell-name" className="text-xs uppercase text-slate-500 font-bold tracking-wider ml-1">Ваше имя</Label>
                    <Input
                      id="sell-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Как к вам обращаться?"
                      className="h-12 bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sell-phone" className="text-xs uppercase text-slate-500 font-bold tracking-wider ml-1">Телефон</Label>
                    <Input
                      id="sell-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                      placeholder="+375 (XX) XXX-XX-XX"
                      className="h-12 bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                      required
                    />
                  </div>

                  <StatusButton
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300"
                    state={submitButtonState.state}
                    disabled={!isPhoneValid(formData.phone) || !formData.name}
                    loadingText="Отправляем..."
                    successText="Заявка отправлена!"
                  >
                    Получить консультацию
                  </StatusButton>

                  <p className="text-[10px] text-center text-slate-400 leading-tight pt-2">
                    Нажимая кнопку, вы соглашаетесь с условиями <a href="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">политики конфиденциальности</a>
                  </p>
                </form>
              </div>

              {/* Direct Contacts Block */}
              {settings && (
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Наши контакты</p>
                  <div className="flex flex-col gap-1">
                    {settings.phone && (
                      <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                        {settings.phone}
                      </a>
                    )}
                    {settings.workingHours && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {settings.workingHours}
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>
        </div>

      </div>
    </UniversalDrawer>
  )
}
