"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { StatusButton } from "@/components/ui/status-button"
import { Check } from "lucide-react"

interface CarInfo {
  id?: string;
  make?: string;
  model?: string;
  year?: number;
}

interface ActionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  car: CarInfo | null
  mode: 'booking' | 'callback'
  title: string
}

export function ActionDrawer({ open, onOpenChange, car, mode, title }: ActionDrawerProps) {
  const [form, setForm] = useState({ name: "", phone: "+375", message: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numbers = e.target.value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)
    setForm({ ...form, phone: "+375" + afterPrefix })
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  const isFormValid = useMemo(() => {
    return form.name.trim() !== "" && isPhoneValid(form.phone)
  }, [form.name, form.phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      setFormError("Пожалуйста, заполните все обязательные поля.")
      return
    }
    setFormError(null)

    await submitButtonState.execute(async () => {
      try {
        const payload = {
          ...form,
          carId: car?.id,
          carInfo: `${car?.make || ''} ${car?.model || ''} ${car?.year || ''}`.trim(),
          type: mode,
          status: "new",
          createdAt: new Date().toISOString(),
        }

        // Отправка в Telegram
        await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                phone: form.phone,
                message: form.message,
                carMake: car?.make,
                carModel: car?.model,
                carYear: car?.year,
                carId: car?.id,
                type: mode === 'booking' ? 'car_booking' : 'callback'
            })
        });

        // Сохранение в Firestore
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await addDoc(collection(db, "leads"), payload);

        showSuccess(mode === 'booking'
          ? "Заявка на бронирование успешно отправлена!"
          : "Заявка на обратный звонок успешно отправлена!"
        )
        setTimeout(() => {
          onOpenChange(false)
          setForm({ name: "", phone: "+375", message: "" })
        }, 3000)

      } catch (error) {
        console.error(`Failed to submit ${mode} application:`, error)
        setFormError("Произошла ошибка при отправке. Попробуйте еще раз.")
        throw error
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form id={`form-${mode}`} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor={`name-${mode}`}>Ваше имя</Label>
              <Input id={`name-${mode}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor={`phone-${mode}`}>Номер телефона</Label>
              <div className="relative">
                <Input id={`phone-${mode}`} value={form.phone} onChange={handlePhoneChange} placeholder="+375XXXXXXXXX" required className="pr-10" />
                {isPhoneValid(form.phone) && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
            {mode === 'booking' && (
              <div>
                <Label htmlFor={`message-${mode}`}>Комментарий</Label>
                <Textarea id={`message-${mode}`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Удобное время для просмотра..." />
              </div>
            )}
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            {submitButtonState.error && <p className="text-sm text-red-600">Произошла ошибка при отправке. Попробуйте еще раз.</p>}
          </form>
        </div>

        <SheetFooter className="p-6 border-t bg-white">
            <StatusButton
              type="submit"
              form={`form-${mode}`}
              className="w-full"
              state={submitButtonState.state}
              disabled={!isFormValid}
              loadingText="Отправляем..."
              successText="Заявка отправлена!"
            >
              {mode === 'booking' ? 'Записаться на просмотр' : 'Заказать звонок'}
            </StatusButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}