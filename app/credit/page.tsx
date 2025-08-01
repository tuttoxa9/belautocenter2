"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, CreditCard, CheckCircle, Building, Percent, Clock, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Shield, TrendingDown, Check, ArrowRight, ChevronRight, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import CreditConditions from "@/components/credit-conditions"
import { getCachedImageUrl } from "@/lib/image-cache"

interface CreditPageSettings {
  title: string
  subtitle: string
  description: string
  benefits: Array<{
    icon: string
    title: string
    description: string
  }>
  partners: Array<{
    name: string
    logoUrl: string
    minRate: number
    maxTerm: number
  }>
}

export default function CreditPage() {
  const [settings, setSettings] = useState<CreditPageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(false)
  const usdBynRate = useUsdBynRate()
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  const [calculator, setCalculator] = useState({
    carPrice: [50000],
    downPayment: [15000],
    loanTerm: [36],
    interestRate: [15],
  })

  const [manualInputs, setManualInputs] = useState({
    carPrice: '',
    downPayment: '',
    loanTerm: '',
    interestRate: '',
    selectedBank: ''
  })

  const [creditForm, setCreditForm] = useState({
    name: "",
    phone: "+375",
    email: "",
    carPrice: "",
    downPayment: "",
    loanTerm: "",
    bank: "",
    message: "",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    // Инициализируем ручные поля значениями слайдеров
    setManualInputs({
      carPrice: calculator.carPrice[0].toString(),
      downPayment: calculator.downPayment[0].toString(),
      loanTerm: calculator.loanTerm[0].toString(),
      interestRate: calculator.interestRate[0].toString(),
      selectedBank: ''
    })
  }, [])

  const loadSettings = async () => {
    try {
      const doc_ref = doc(db, "pages", "credit")
      const doc_snap = await getDoc(doc_ref)

      if (doc_snap.exists()) {
        setSettings(doc_snap.data() as CreditPageSettings)
      } else {
        // Default fallback data only if no data exists
        setSettings({
          title: "Автокредит на выгодных условиях",
          subtitle: "Получите кредит на автомобиль мечты уже сегодня",
          description: "Мы работаем с ведущими банками Беларуси и поможем вам получить автокредит на самых выгодных условиях.",
          benefits: [],
          partners: []
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = () => {
    const principal = calculator.carPrice[0] - calculator.downPayment[0]
    const monthlyRate = calculator.interestRate[0] / 100 / 12
    const numPayments = calculator.loanTerm[0]

    if (monthlyRate === 0) {
      return principal / numPayments
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    return monthlyPayment
  }

  const formatCurrency = (amount: number) => {
    if (isBelarusianRubles) {
      return new Intl.NumberFormat("ru-BY", {
        style: "currency",
        currency: "BYN",
        minimumFractionDigits: 0,
      }).format(amount)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCreditMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getCreditMaxValue = () => {
    return isBelarusianRubles ? 300000 : 100000
  }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!usdBynRate) return

    if (checked) {
      // Переключение на BYN - устанавливаем минимальные значения для BYN
      const newCarPrice = Math.max(3000, Math.round(calculator.carPrice[0] * usdBynRate))
      const newDownPayment = Math.max(300, Math.round(calculator.downPayment[0] * usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        downPayment: [newDownPayment]
      })
      // Обновляем ручные поля
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        downPayment: newDownPayment.toString()
      })
    } else {
      // Переключение на USD
      const newCarPrice = Math.max(1000, Math.round(calculator.carPrice[0] / usdBynRate))
      const newDownPayment = Math.max(100, Math.round(calculator.downPayment[0] / usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        downPayment: [newDownPayment]
      })
      // Обновляем ручные поля
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        downPayment: newDownPayment.toString()
      })
    }
  }

  const handleManualInputChange = (field: string, value: string) => {
    setManualInputs({ ...manualInputs, [field]: value })

    const numValue = parseFloat(value) || 0

    switch (field) {
      case 'carPrice':
        const clampedCarPrice = Math.max(getCreditMinValue(), Math.min(getCreditMaxValue(), numValue))
        setCalculator({ ...calculator, carPrice: [clampedCarPrice] })
        break
      case 'downPayment':
        const minDown = calculator.carPrice[0] * 0.1
        const maxDown = calculator.carPrice[0] * 0.8
        const clampedDownPayment = Math.max(minDown, Math.min(maxDown, numValue))
        setCalculator({ ...calculator, downPayment: [clampedDownPayment] })
        break
      case 'loanTerm':
        const clampedTerm = Math.max(12, Math.min(84, numValue))
        setCalculator({ ...calculator, loanTerm: [clampedTerm] })
        break
      case 'interestRate':
        const clampedRate = Math.max(10, Math.min(25, numValue))
        setCalculator({ ...calculator, interestRate: [clampedRate] })
        break
    }
  }

  const handleBankSelection = (bankValue: string) => {
    setManualInputs({ ...manualInputs, selectedBank: bankValue })

    if (bankValue !== 'custom' && settings?.partners) {
      const selectedBank = settings.partners.find(partner =>
        partner.name.toLowerCase().replace(/[\s-]/g, '') === bankValue
      )
      if (selectedBank) {
        setCalculator({ ...calculator, interestRate: [selectedBank.minRate] })
        setManualInputs({ ...manualInputs, selectedBank: bankValue, interestRate: selectedBank.minRate.toString() })
      }
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы кроме +
    let numbers = value.replace(/[^\d+]/g, "")

    // Если нет + в начале, добавляем +375
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }

    // Берем только +375 и следующие 9 цифр максимум
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
      // Сохраняем в Firebase
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        type: "credit_request",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...creditForm,
          type: 'credit_request',
        }),
      })

      setCreditForm({
        name: "",
        phone: "+375",
        email: "",
        carPrice: "",
        downPayment: "",
        loanTerm: "",
        bank: "",
        message: "",
      })
      showSuccess("Заявка на кредит успешно отправлена! Мы рассмотрим ее и свяжемся с вами в ближайшее время.")
    })
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "percent":
        return Percent
      case "clock":
        return Clock
      case "building":
        return Building
      case "dollar-sign":
        return DollarSign
      case "file-text":
        return FileText
      case "users":
        return Users
      case "zap":
        return Zap
      case "award":
        return Award
      case "target":
        return Target
      case "briefcase":
        return Briefcase
      case "trending-up":
        return TrendingUp
      case "handshake":
        return Handshake
      case "check-square":
        return CheckSquare
      case "coins":
        return Coins
      case "timer":
        return Timer
      case "heart":
        return Heart
      case "shield":
        return Shield
      case "trending-down":
        return TrendingDown
      default:
        return CreditCard
    }
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalAmount = monthlyPayment * calculator.loanTerm[0]
  const overpayment = totalAmount - (calculator.carPrice[0] - calculator.downPayment[0])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-gray-50 rounded-lg border p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Не удалось загрузить информацию о кредитах</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Главная
              </Link>
            </li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li className="text-gray-900">Автокредит</li>
          </ol>
        </nav>

        {/* Основной блок */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          {/* Заголовок */}
          <div className="px-8 py-6 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{settings?.title}</h1>
            <p className="text-gray-600">{settings?.description}</p>
          </div>

          {/* Основной контент */}
          <div className="grid md:grid-cols-2 divide-x divide-gray-200">

            {/* Калькулятор */}
            <div className="p-6 bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Расчет кредита</h2>

              {/* Валюта */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="currency-switch"
                    checked={isBelarusianRubles}
                    onCheckedChange={handleCurrencyChange}
                  />
                  <Label htmlFor="currency-switch" className="text-sm text-gray-700">
                    В белорусских рублях
                  </Label>
                </div>
              </div>

              {/* Параметры */}
              <div className="space-y-6">
                {/* Стоимость */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-900">Стоимость автомобиля</Label>
                    <span className="text-sm font-medium">{formatCurrency(calculator.carPrice[0])}</span>
                  </div>
                  <Slider
                    value={calculator.carPrice}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, carPrice: value })
                      setManualInputs({ ...manualInputs, carPrice: value[0].toString() })
                    }}
                    max={getCreditMaxValue()}
                    min={getCreditMinValue()}
                    step={isBelarusianRubles ? 500 : 1000}
                    className="mb-2"
                  />
                  <Input
                    type="number"
                    placeholder="Введите сумму"
                    value={manualInputs.carPrice}
                    onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                    className="h-9 text-sm"
                    min={getCreditMinValue()}
                    max={getCreditMaxValue()}
                  />
                </div>

                {/* Взнос */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-900">Первоначальный взнос</Label>
                    <span className="text-sm font-medium">{formatCurrency(calculator.downPayment[0])}</span>
                  </div>
                  <Slider
                    value={calculator.downPayment}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, downPayment: value })
                      setManualInputs({ ...manualInputs, downPayment: value[0].toString() })
                    }}
                    max={calculator.carPrice[0] * 0.8}
                    min={calculator.carPrice[0] * 0.1}
                    step={isBelarusianRubles ? 200 : 500}
                    className="mb-2"
                  />
                  <Input
                    type="number"
                    placeholder="Введите сумму"
                    value={manualInputs.downPayment}
                    onChange={(e) => handleManualInputChange('downPayment', e.target.value)}
                    className="h-9 text-sm"
                    min={calculator.carPrice[0] * 0.1}
                    max={calculator.carPrice[0] * 0.8}
                  />
                </div>

                {/* Срок */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-900">Срок кредита</Label>
                    <span className="text-sm font-medium">{calculator.loanTerm[0]} мес.</span>
                  </div>
                  <Slider
                    value={calculator.loanTerm}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, loanTerm: value })
                      setManualInputs({ ...manualInputs, loanTerm: value[0].toString() })
                    }}
                    max={84}
                    min={12}
                    step={3}
                    className="mb-2"
                  />
                  <Input
                    type="number"
                    placeholder="Месяцы"
                    value={manualInputs.loanTerm}
                    onChange={(e) => handleManualInputChange('loanTerm', e.target.value)}
                    className="h-9 text-sm"
                    min={12}
                    max={84}
                  />
                </div>

                {/* Ставка */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-900">Процентная ставка</Label>
                    <span className="text-sm font-medium">{calculator.interestRate[0]}%</span>
                  </div>
                  <Slider
                    value={calculator.interestRate}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, interestRate: value })
                      setManualInputs({ ...manualInputs, interestRate: value[0].toString() })
                    }}
                    max={25}
                    min={10}
                    step={0.25}
                    disabled={manualInputs.selectedBank !== '' && manualInputs.selectedBank !== 'custom'}
                    className="mb-2"
                  />
                  <Input
                    type="number"
                    placeholder="Процент"
                    value={manualInputs.interestRate}
                    onChange={(e) => handleManualInputChange('interestRate', e.target.value)}
                    className="h-9 text-sm"
                    min={10}
                    max={25}
                    step={0.25}
                    disabled={manualInputs.selectedBank !== '' && manualInputs.selectedBank !== 'custom'}
                  />
                </div>

                {/* Банк */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Банк</Label>
                  <Select
                    value={manualInputs.selectedBank}
                    onValueChange={handleBankSelection}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Выберите банк">
                        {manualInputs.selectedBank && manualInputs.selectedBank !== 'custom' && settings?.partners ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 flex-1 pr-4">
                              {(() => {
                                const selectedPartner = settings.partners.find(partner =>
                                  partner.name.toLowerCase().replace(/[\s-]/g, '') === manualInputs.selectedBank
                                )
                                return selectedPartner ? (
                                  <>
                                    {selectedPartner.logoUrl && (
                                      <Image
                                        src={getCachedImageUrl(selectedPartner.logoUrl)}
                                        alt={`${selectedPartner.name} логотип`}
                                        width={16}
                                        height={16}
                                        className="object-contain"
                                      />
                                    )}
                                    <span className="text-sm">{selectedPartner.name}</span>
                                  </>
                                ) : null
                              })()}
                            </div>
                            {(() => {
                              const selectedPartner = settings.partners.find(partner =>
                                partner.name.toLowerCase().replace(/[\s-]/g, '') === manualInputs.selectedBank
                              )
                              return selectedPartner ? (
                                <span className="text-xs text-gray-500">{selectedPartner.minRate}%</span>
                              ) : null
                            })()}
                          </div>
                        ) : manualInputs.selectedBank === 'custom' ? (
                          'Ввести ставку вручную'
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {settings?.partners?.map((partner) => (
                        <SelectItem
                          key={partner.name}
                          value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                          className="relative pr-12"
                        >
                          <div className="flex items-center gap-2 pr-8">
                            {partner.logoUrl && (
                              <Image
                                src={getCachedImageUrl(partner.logoUrl)}
                                alt={`${partner.name} логотип`}
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                            )}
                            <span className="text-sm">{partner.name}</span>
                          </div>
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">{partner.minRate}%</span>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Ввести ставку вручную</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Результат */}
              <div className="mt-6 p-4 bg-gray-50 rounded border">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Сумма кредита:</span>
                    <span className="font-medium">{formatCurrency(calculator.carPrice[0] - calculator.downPayment[0])}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 px-2 bg-white rounded border">
                    <span className="text-gray-600">Ежемесячный платеж:</span>
                    <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Общая сумма:</span>
                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Переплата:</span>
                    <span className="font-medium text-red-600">{formatCurrency(overpayment)}</span>
                  </div>
                  {!isBelarusianRubles && usdBynRate && (
                    <div className="pt-2 mt-2 border-t text-xs text-gray-500">
                      В BYN: {convertUsdToByn(monthlyPayment, usdBynRate)} руб./мес.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Форма */}
            <div className="p-6 bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Заявка на кредит</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-900 mb-1 block">Имя</Label>
                    <Input
                      id="name"
                      value={creditForm.name}
                      onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                      placeholder="Ваше имя"
                      className="h-9"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-1 block">Телефон</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={creditForm.phone}
                        onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375XXXXXXXXX"
                        className="h-9 pr-8"
                        required
                      />
                      {isPhoneValid(creditForm.phone) && (
                        <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-1 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={creditForm.email}
                    onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carPrice" className="text-sm font-medium text-gray-900 mb-1 block">Стоимость ($)</Label>
                    <Input
                      id="carPrice"
                      type="number"
                      value={creditForm.carPrice}
                      onChange={(e) => setCreditForm({ ...creditForm, carPrice: e.target.value })}
                      placeholder="50000"
                      className="h-9"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment" className="text-sm font-medium text-gray-900 mb-1 block">Взнос ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={creditForm.downPayment}
                      onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                      placeholder="15000"
                      className="h-9"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanTerm" className="text-sm font-medium text-gray-900 mb-1 block">Срок</Label>
                    <Select
                      value={creditForm.loanTerm}
                      onValueChange={(value) => setCreditForm({ ...creditForm, loanTerm: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Месяцы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="48">48 месяцев</SelectItem>
                        <SelectItem value="60">60 месяцев</SelectItem>
                        <SelectItem value="72">72 месяца</SelectItem>
                        <SelectItem value="84">84 месяца</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bank" className="text-sm font-medium text-gray-900 mb-1 block">Банк</Label>
                    <Select
                      value={creditForm.bank}
                      onValueChange={(value) => setCreditForm({ ...creditForm, bank: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Выберите банк">
                          {creditForm.bank && creditForm.bank !== 'any' && settings?.partners ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 flex-1 pr-4">
                                {(() => {
                                  const selectedPartner = settings.partners.find(partner =>
                                    partner.name.toLowerCase().replace(/[\s-]/g, '') === creditForm.bank
                                  )
                                  return selectedPartner ? (
                                    <>
                                      {selectedPartner.logoUrl && (
                                        <Image
                                          src={getCachedImageUrl(selectedPartner.logoUrl)}
                                          alt={`${selectedPartner.name} логотип`}
                                          width={16}
                                          height={16}
                                          className="object-contain"
                                        />
                                      )}
                                      <span className="text-sm">{selectedPartner.name}</span>
                                    </>
                                  ) : null
                                })()}
                              </div>
                              {(() => {
                                const selectedPartner = settings.partners.find(partner =>
                                  partner.name.toLowerCase().replace(/[\s-]/g, '') === creditForm.bank
                                )
                                return selectedPartner ? (
                                  <span className="text-xs text-gray-500">{selectedPartner.minRate}%</span>
                                ) : null
                              })()}
                            </div>
                          ) : creditForm.bank === 'any' ? (
                            'Любой банк'
                          ) : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {settings?.partners?.map((partner) => (
                          <SelectItem
                            key={partner.name}
                            value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                            className="relative pr-12"
                          >
                            <div className="flex items-center gap-2 pr-8">
                              {partner.logoUrl && (
                                <Image
                                  src={getCachedImageUrl(partner.logoUrl)}
                                  alt={`${partner.name} логотип`}
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                              )}
                              <span className="text-sm">{partner.name}</span>
                            </div>
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">{partner.minRate}%</span>
                          </SelectItem>
                        ))}
                        <SelectItem value="any">Любой банк</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-900 mb-1 block">Комментарий</Label>
                  <Input
                    id="message"
                    value={creditForm.message}
                    onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                    placeholder="Дополнительная информация..."
                    className="h-9"
                  />
                </div>

                <StatusButton
                  type="submit"
                  className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white"
                  state={submitButtonState.state}
                  loadingText="Отправляем..."
                  successText="Отправлено!"
                  errorText="Ошибка"
                >
                  Отправить заявку
                </StatusButton>
              </form>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Банки */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Банки-партнеры</h3>
                <div className="grid grid-cols-2 gap-3">
                  {settings?.partners?.map((partner, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        {partner.logoUrl && (
                          <img
                            src={getCachedImageUrl(partner.logoUrl)}
                            alt={partner.name}
                            className="h-6 w-8 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">{partner.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">от {partner.minRate}%</div>
                        <div className="text-xs text-gray-500">до {partner.maxTerm}м</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Преимущества */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Преимущества</h3>
                <div className="space-y-3">
                  {settings?.benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{benefit.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <CreditConditions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
