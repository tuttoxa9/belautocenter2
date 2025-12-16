"use client"

import React, { useState, useEffect, useCallback } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FinanceSettings {
  rateSource: "nbrb" | "custom"
  customRate: number
}

export default function AdminFinance() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FinanceSettings>({
    rateSource: "nbrb",
    customRate: 3.25,
  })
  const [customRateInput, setCustomRateInput] = useState("3.25")

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const financeDoc = await getDoc(doc(db, "settings", "finance"))
      if (financeDoc.exists()) {
        const data = financeDoc.data() as FinanceSettings
        setSettings(data)
        setCustomRateInput(String(data.customRate))
      }
    } catch (error) {
      console.error("Error loading finance settings:", error)
      toast.error("Ошибка загрузки финансовых настроек.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Преобразуем значение из поля ввода в число
      const rateToSave = parseFloat(customRateInput) || 0
      const newSettings = { ...settings, customRate: rateToSave }

      await setDoc(doc(db, "settings", "finance"), newSettings)

      // Обновляем основное состояние после успешного сохранения
      setSettings(newSettings)

      toast.success("Финансовые настройки сохранены!")
    } catch (error) {
      console.error("Error saving finance settings:", error)
      toast.error("Ошибка сохранения настроек.")
    } finally {
      setSaving(false)
    }
  }

  const handleRateSourceChange = (value: "nbrb" | "custom") => {
    setSettings((prev) => ({ ...prev, rateSource: value }))
  }

  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Разрешаем ввод только чисел и одной точки
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomRateInput(value)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Финансы</h2>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Курс валют для отображения цен</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings.rateSource}
            onValueChange={handleRateSourceChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nbrb" id="nbrb" />
              <Label htmlFor="nbrb">Использовать курс Национального Банка РБ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Использовать свой курс</Label>
            </div>
          </RadioGroup>

          {settings.rateSource === "custom" && (
            <div className="pl-6 pt-2">
              <Label htmlFor="customRateInput">Собственный курс (USD к BYN)</Label>
              <Input
                id="customRateInput"
                type="text"
                value={customRateInput}
                onChange={handleCustomRateChange}
                className="max-w-xs mt-1"
                placeholder="Например: 3.25"
              />
               <p className="text-sm text-gray-500 mt-2">
                Введите число, на которое будет умножаться цена в долларах.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
