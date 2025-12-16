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
  rateSource: "nbrb" | "custom" | "hybrid";
  customRate: number;
  hybridMarkup: number;
}

export default function AdminFinance() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FinanceSettings>({
    rateSource: "nbrb",
    customRate: 3.25,
    hybridMarkup: 0.1,
  })
  const [customRateInput, setCustomRateInput] = useState("3.25")
  const [hybridMarkupInput, setHybridMarkupInput] = useState("0.1")
  const [nbrbRate, setNbrbRate] = useState<number | null>(null)

  const fetchNbrbRate = async () => {
    try {
      const res = await fetch('https://api.nbrb.by/exrates/rates/431');
      if (res.ok) {
        const data = await res.json();
        setNbrbRate(data.Cur_OfficialRate);
      }
    } catch (error) {
      console.error("Failed to fetch NBRB rate", error);
    }
  };

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const financeDoc = await getDoc(doc(db, "settings", "finance"))
      if (financeDoc.exists()) {
        const data = financeDoc.data() as FinanceSettings
        setSettings(data)
        setCustomRateInput(String(data.customRate || "3.25"))
        setHybridMarkupInput(String(data.hybridMarkup || "0.1"))
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
    fetchNbrbRate()
  }, [loadSettings])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const rateToSave = parseFloat(customRateInput) || 0
      const markupToSave = parseFloat(hybridMarkupInput) || 0
      const newSettings = {
        ...settings,
        customRate: rateToSave,
        hybridMarkup: markupToSave
      }

      await setDoc(doc(db, "settings", "finance"), newSettings)

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
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomRateInput(value)
    }
  }

  const handleHybridMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setHybridMarkupInput(value)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid">Гибридный (курс НБ РБ + наценка)</Label>
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
            </div>
          )}

          {settings.rateSource === "hybrid" && (
            <div className="pl-6 pt-2">
              <Label htmlFor="hybridMarkupInput">Ваша наценка</Label>
              <Input
                id="hybridMarkupInput"
                type="text"
                value={hybridMarkupInput}
                onChange={handleHybridMarkupChange}
                className="max-w-xs mt-1"
                placeholder="Например: 0.1"
              />
            </div>
          )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {settings.rateSource === 'hybrid' ? 'Расчет гибридного курса' : 'Курс НБРБ на сегодня'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!nbrbRate ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">Курс НБРБ</span>
                  <span className="text-2xl font-bold">{nbrbRate}</span>
                </div>

                {settings.rateSource === 'hybrid' && (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">Ваша наценка</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">+</span>
                        <span className="text-2xl font-bold">{parseFloat(hybridMarkupInput) || 0}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-500">Итоговый курс</span>
                        <span className="text-3xl font-bold text-blue-600">
                          = {(nbrbRate + (parseFloat(hybridMarkupInput) || 0)).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
