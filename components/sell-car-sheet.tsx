"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { StatusButton } from "@/components/ui/status-button"
import { Phone, Clock } from "lucide-react"
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
          message: "Заявка на продажу авто (из меню)"
        }),
      })

      setFormData({ name: "", phone: "+375" })
      showSuccess("Заявка принята! Мы свяжемся с вами для обсуждения.")
      setTimeout(() => onOpenChange(false), 2000)
    })
  }

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Продать авто"
      className="sm:max-w-[500px] w-full"
    >
      <div className="flex flex-col h-full gap-8 py-2">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-light text-slate-900 dark:text-white">
            Быстрая продажа
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Оставьте заявку, и мы перезвоним вам в течение 15 минут для обсуждения оценки и продажи вашего автомобиля.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-name" className="text-sm font-medium">Как к вам обращаться?</Label>
              <Input
                id="sell-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Имя"
                className="h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-phone" className="text-sm font-medium">Номер телефона</Label>
              <Input
                id="sell-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                placeholder="+375 (XX) XXX-XX-XX"
                className="h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <StatusButton
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 rounded-xl transition-all"
              state={submitButtonState.state}
              disabled={!isPhoneValid(formData.phone) || !formData.name}
              loadingText="Отправляем..."
              successText="Заявка отправлена"
            >
              Отправить заявку
            </StatusButton>

            <p className="text-xs text-center text-slate-400">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <a href="/privacy" className="underline hover:text-slate-900 dark:hover:text-white transition-colors">
                политикой конфиденциальности
              </a>
            </p>
          </div>
        </form>

        {settings && (
          <div className="mt-auto pt-8 flex flex-col items-center justify-center gap-2">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span className="font-medium">{settings.phone}</span>
              </a>
            )}
            {settings.workingHours && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{settings.workingHours}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </UniversalDrawer>
  )
}
