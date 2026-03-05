"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { StatusButton } from "@/components/ui/status-button"
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

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title=""
      className="sm:max-w-md w-full bg-white dark:bg-black rounded-t-[32px] sm:rounded-2xl"
    >
      <div className="flex flex-col pt-2 pb-8 px-2 sm:px-6">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">Продать авто</h2>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
            Оставьте заявку, и мы свяжемся с вами за 15 минут
          </p>
        </div>

        {/* Форма */}
        <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-[28px] p-6 sm:p-8 mb-6 border border-slate-100 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sell-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Имя
              </Label>
              <Input
                id="sell-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Как к вам обращаться"
                className="h-14 text-base bg-white dark:bg-black border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-0 rounded-2xl shadow-sm transition-all px-5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Телефон
              </Label>
              <Input
                id="sell-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                placeholder="+375 (XX) XXX-XX-XX"
                className="h-14 text-base bg-white dark:bg-black border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-0 rounded-2xl shadow-sm transition-all px-5"
                required
              />
            </div>

            <StatusButton
              type="submit"
              className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-bold text-lg rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-4"
              state={submitButtonState.state}
              disabled={!isPhoneValid(formData.phone) || !formData.name}
              loadingText="Отправляем..."
              successText="Отправлено"
              errorText="Ошибка"
            >
              Оставить заявку
            </StatusButton>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 font-medium">
              Нажимая кнопку, вы принимаете{' '}
              <a href="/privacy" className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                политику конфиденциальности
              </a>
            </p>
          </form>
        </div>

        {/* Контакты */}
        {settings && (
          <div className="text-center">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="inline-block text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                {settings.phone}
              </a>
            )}
            {settings.workingHours && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {settings.workingHours}
              </p>
            )}
          </div>
        )}
      </div>
    </UniversalDrawer>
  )
}
