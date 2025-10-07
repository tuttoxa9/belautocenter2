"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusButton } from "@/components/ui/status-button"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { Check } from "lucide-react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"

interface CallbackDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId?: string;
  carInfo?: string;
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

export function CallbackDrawer({ open, onOpenChange, carId, carInfo }: CallbackDrawerProps) {
  const [form, setForm] = useState({ name: "", phone: "+375" })
  const buttonState = useButtonState()
  const { showSuccess } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await buttonState.execute(async () => {
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        await addDoc(collection(db, "leads"), {
          ...form,
          carId: carId || "N/A",
          carInfo: carInfo || "General Inquiry",
          type: "callback",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        console.error("Error saving lead to Firestore:", error)
      }

      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          carId: carId,
          carInfo: carInfo,
          type: 'callback'
        })
      })

      setForm({ name: "", phone: "+375" })
      showSuccess("Заявка на обратный звонок успешно отправлена!")
      onOpenChange(false)
    })
  }

  const renderContent = () => (
    <form id="callback-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="callbackName">Ваше имя</Label>
        <Input
          id="callbackName"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Иван Иванов"
          required
        />
      </div>
      <div>
        <Label htmlFor="callbackPhone">Номер телефона</Label>
        <div className="relative">
          <Input
            id="callbackPhone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
            placeholder="+375 (XX) XXX-XX-XX"
            required
            className="pr-10"
          />
          {isPhoneValid(form.phone) && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
      </div>
    </form>
  );

  const renderFooter = () => (
    <>
      <StatusButton
        type="submit"
        form="callback-form"
        className="w-full"
        state={buttonState.state}
        disabled={!isPhoneValid(form.phone) || !form.name}
        loadingText="Отправляем..."
        successText="Заявка отправлена!"
        errorText="Ошибка"
      >
        Жду звонка
      </StatusButton>
       <p className="text-xs text-slate-500 mt-3 text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-blue-600">политикой обработки персональных данных</a>.</p>
    </>
  );

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Заказать обратный звонок"
      footer={renderFooter()}
    >
      {renderContent()}
    </UniversalDrawer>
  )
}