"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusButton } from "@/components/ui/status-button"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { Check } from "lucide-react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface BookViewingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
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

export function BookViewingDrawer({ open, onOpenChange, car }: BookViewingDrawerProps) {
  const [form, setForm] = useState({ name: "", phone: "+375", message: "" })
  const buttonState = useButtonState()
  const { showSuccess } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!car) return;

    await buttonState.execute(async () => {
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        await addDoc(collection(db, "leads"), {
          ...form,
          carId: car.id,
          carInfo: `${car.make || ''} ${car.model || ''} ${car.year || ''}`,
          type: "booking",
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
          message: form.message,
          carMake: car.make || '',
          carModel: car.model || '',
          carYear: car.year || '',
          carId: car.id,
          type: 'car_booking'
        })
      })

      setForm({ name: "", phone: "+375", message: "" })
      showSuccess("Заявка на бронирование успешно отправлена!")
      onOpenChange(false)
    })
  }

  const renderContent = () => (
    <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bookingName">Ваше имя</Label>
        <Input
          id="bookingName"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Иван Иванов"
          required
        />
      </div>
      <div>
        <Label htmlFor="bookingPhone">Номер телефона</Label>
        <div className="relative">
          <Input
            id="bookingPhone"
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
      <div>
        <Label htmlFor="bookingMessage">Комментарий</Label>
        <Textarea
          id="bookingMessage"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Удобное время для просмотра, вопросы и т.д."
        />
      </div>
    </form>
  );

  const renderFooter = () => (
    <>
      <StatusButton
        type="submit"
        form="booking-form"
        className="w-full"
        state={buttonState.state}
        disabled={!isPhoneValid(form.phone) || !form.name}
        loadingText="Отправляем..."
        successText="Заявка отправлена!"
        errorText="Ошибка"
      >
        Записаться на просмотр
      </StatusButton>
       <p className="text-xs text-slate-500 mt-3 text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-blue-600">политикой обработки персональных данных</a>.</p>
    </>
  );

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Запись на просмотр авто"
      footer={renderFooter()}
    >
      {renderContent()}
    </UniversalDrawer>
  )
}