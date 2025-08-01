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
import { Calculator, CreditCard, CheckCircle, Building, Percent, Clock, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Heart, Shield, TrendingDown, Check, ArrowRight, ChevronRight, Star, Sparkles, AlertCircle } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="text-center mb-12">
              <div className="h-8 bg-slate-200 rounded-lg w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-64 mx-auto mb-6"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-80 mx-auto"></div>
            </div>

            {/* Main content skeleton */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8 mb-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-12 bg-slate-200 rounded-lg"></div>
                    ))}
                  </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ошибка загрузки</h2>
          <p className="text-slate-600">Не удалось загрузить информацию о кредитах</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-900 transition-colors duration-200">
                Главная
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="text-slate-900 font-medium">Автокредит</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Выгодные условия кредитования</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {settings?.title}
          </h1>
          <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            {settings?.subtitle}
          </p>
          <p className="text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {settings?.description}
          </p>
        </div>

        {/* Основной контейнер */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 backdrop-blur-sm overflow-hidden">

          {/* Кредитный калькулятор и форма */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">

            {/* Левая часть - Калькулятор */}
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Калькулятор кредита</h2>
                </div>
                <p className="text-slate-600">Рассчитайте ежемесячный платеж и условия</p>
              </div>

              {/* Переключатель валюты */}
              <div className="mb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                  <Checkbox
                    id="currency-switch"
                    checked={isBelarusianRubles}
                    onCheckedChange={handleCurrencyChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="currency-switch" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Рассчитать в белорусских рублях
                  </Label>
                </div>
              </div>

              {/* Параметры кредита */}
              <div className="space-y-8">
                {/* Стоимость автомобиля */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-slate-900">Стоимость автомобиля</Label>
                    <div className="text-lg font-bold text-slate-900">{formatCurrency(calculator.carPrice[0])}</div>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={calculator.carPrice}
                      onValueChange={(value) => {
                        setCalculator({ ...calculator, carPrice: value })
                        setManualInputs({ ...manualInputs, carPrice: value[0].toString() })
                      }}
                      max={getCreditMaxValue()}
                      min={getCreditMinValue()}
                      step={isBelarusianRubles ? 500 : 1000}
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&>span]:h-2 [&>span]:bg-slate-200 [&_[data-orientation=horizontal]]:bg-blue-600"
                    />
                    <Input
                      type="number"
                      placeholder="Введите стоимость"
                      value={manualInputs.carPrice}
                      onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                      min={getCreditMinValue()}
                      max={getCreditMaxValue()}
                    />
                  </div>
                </div>

                {/* Первоначальный взнос */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-slate-900">Первоначальный взнос</Label>
                    <div className="text-lg font-bold text-slate-900">{formatCurrency(calculator.downPayment[0])}</div>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={calculator.downPayment}
                      onValueChange={(value) => {
                        setCalculator({ ...calculator, downPayment: value })
                        setManualInputs({ ...manualInputs, downPayment: value[0].toString() })
                      }}
                      max={calculator.carPrice[0] * 0.8}
                      min={calculator.carPrice[0] * 0.1}
                      step={isBelarusianRubles ? 200 : 500}
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-green-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&>span]:h-2 [&>span]:bg-slate-200 [&_[data-orientation=horizontal]]:bg-green-600"
                    />
                    <Input
                      type="number"
                      placeholder="Введите взнос"
                      value={manualInputs.downPayment}
                      onChange={(e) => handleManualInputChange('downPayment', e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-green-500 transition-all duration-200"
                      min={calculator.carPrice[0] * 0.1}
                      max={calculator.carPrice[0] * 0.8}
                    />
                  </div>
                </div>

                {/* Срок кредита */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-slate-900">Срок кредита</Label>
                    <div className="text-lg font-bold text-slate-900">{calculator.loanTerm[0]} мес.</div>
                  </div>
                  <div className="space-y-3">
                    <Slider
                      value={calculator.loanTerm}
                      onValueChange={(value) => {
                        setCalculator({ ...calculator, loanTerm: value })
                        setManualInputs({ ...manualInputs, loanTerm: value[0].toString() })
                      }}
                      max={84}
                      min={12}
                      step={3}
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&>span]:h-2 [&>span]:bg-slate-200 [&_[data-orientation=horizontal]]:bg-purple-600"
                    />
                    <Input
                      type="number"
                      placeholder="Месяцев"
                      value={manualInputs.loanTerm}
                      onChange={(e) => handleManualInputChange('loanTerm', e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all duration-200"
                      min={12}
                      max={84}
                    />
                  </div>
                </div>

                {/* Процентная ставка */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-slate-900">Процентная ставка</Label>
                    <div className="text-lg font-bold text-slate-900">{calculator.interestRate[0]}%</div>
                  </div>
                  <div className="space-y-3">
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
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&>span]:h-2 [&>span]:bg-slate-200 [&_[data-orientation=horizontal]]:bg-orange-600"
                    />
                    <Input
                      type="number"
                      placeholder="Ставка %"
                      value={manualInputs.interestRate}
                      onChange={(e) => handleManualInputChange('interestRate', e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 transition-all duration-200"
                      min={10}
                      max={25}
                      step={0.25}
                      disabled={manualInputs.selectedBank !== '' && manualInputs.selectedBank !== 'custom'}
                    />
                  </div>
                </div>

                {/* Выбор банка */}
                <div>
                  <Label className="text-sm font-semibold text-slate-900 mb-3 block">Выберите банк</Label>
                  <Select
                    value={manualInputs.selectedBank}
                    onValueChange={handleBankSelection}
                  >
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200">
                      <SelectValue placeholder="Выберите банк или введите ставку вручную">
                        {manualInputs.selectedBank && manualInputs.selectedBank !== 'custom' && settings?.partners ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 flex-1 pr-4">
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
                                        width={24}
                                        height={24}
                                        className="object-contain rounded flex-shrink-0"
                                      />
                                    )}
                                    <span className="font-medium">{selectedPartner.name}</span>
                                  </>
                                ) : null
                              })()}
                            </div>
                            {(() => {
                              const selectedPartner = settings.partners.find(partner =>
                                partner.name.toLowerCase().replace(/[\s-]/g, '') === manualInputs.selectedBank
                              )
                              return selectedPartner ? (
                                <span className="text-sm font-bold text-blue-600 flex-shrink-0">{selectedPartner.minRate}%</span>
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
                          className="relative pr-16 hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3 pr-8">
                            {partner.logoUrl && (
                              <Image
                                src={getCachedImageUrl(partner.logoUrl)}
                                alt={`${partner.name} логотип`}
                                width={24}
                                height={24}
                                className="object-contain rounded flex-shrink-0"
                              />
                            )}
                            <span className="truncate font-medium">{partner.name}</span>
                          </div>
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-blue-600">{partner.minRate}%</span>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="hover:bg-slate-50">Ввести ставку вручную</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Результаты расчета */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Результат расчета
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Сумма кредита:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(calculator.carPrice[0] - calculator.downPayment[0])}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-blue-200">
                    <span className="text-slate-700 font-medium">Ежемесячный платеж:</span>
                    <span className="font-bold text-xl text-blue-600">{formatCurrency(monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Общая сумма выплат:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Переплата:</span>
                    <span className="font-bold text-red-600">{formatCurrency(overpayment)}</span>
                  </div>
                  {!isBelarusianRubles && usdBynRate && (
                    <div className="pt-3 mt-3 border-t border-blue-200">
                      <div className="text-sm text-blue-700 flex justify-between items-center">
                        <span>В белорусских рублях:</span>
                        <span className="font-semibold">{convertUsdToByn(monthlyPayment, usdBynRate)} BYN/мес.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Правая часть - Форма заявки */}
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Заявка на кредит</h2>
                </div>
                <p className="text-slate-600">Заполните форму и мы свяжемся с вами</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-900 mb-2 block">Ваше имя</Label>
                    <Input
                      id="name"
                      value={creditForm.name}
                      onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                      placeholder="Введите ваше имя"
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-900 mb-2 block">Номер телефона</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={creditForm.phone}
                        onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="+375XXXXXXXXX"
                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 pr-10"
                        required
                      />
                      {isPhoneValid(creditForm.phone) && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-900 mb-2 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={creditForm.email}
                    onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carPrice" className="text-sm font-semibold text-slate-900 mb-2 block">Стоимость автомобиля ($)</Label>
                    <Input
                      id="carPrice"
                      type="number"
                      value={creditForm.carPrice}
                      onChange={(e) => setCreditForm({ ...creditForm, carPrice: e.target.value })}
                      placeholder="50000"
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment" className="text-sm font-semibold text-slate-900 mb-2 block">Первоначальный взнос ($)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={creditForm.downPayment}
                      onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                      placeholder="15000"
                      className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanTerm" className="text-sm font-semibold text-slate-900 mb-2 block">Срок кредита</Label>
                    <Select
                      value={creditForm.loanTerm}
                      onValueChange={(value) => setCreditForm({ ...creditForm, loanTerm: value })}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Выберите срок" />
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
                    <Label htmlFor="bank" className="text-sm font-semibold text-slate-900 mb-2 block">Предпочитаемый банк</Label>
                    <Select
                      value={creditForm.bank}
                      onValueChange={(value) => setCreditForm({ ...creditForm, bank: value })}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Выберите банк">
                          {creditForm.bank && creditForm.bank !== 'any' && settings?.partners ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3 flex-1 pr-4">
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
                                          width={24}
                                          height={24}
                                          className="object-contain rounded flex-shrink-0"
                                        />
                                      )}
                                      <span className="font-medium">{selectedPartner.name}</span>
                                    </>
                                  ) : null
                                })()}
                              </div>
                              {(() => {
                                const selectedPartner = settings.partners.find(partner =>
                                  partner.name.toLowerCase().replace(/[\s-]/g, '') === creditForm.bank
                                )
                                return selectedPartner ? (
                                  <span className="text-sm font-bold text-blue-600 flex-shrink-0">{selectedPartner.minRate}%</span>
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
                            className="relative pr-16 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3 pr-8">
                              {partner.logoUrl && (
                                <Image
                                  src={getCachedImageUrl(partner.logoUrl)}
                                  alt={`${partner.name} логотип`}
                                  width={24}
                                  height={24}
                                  className="object-contain rounded flex-shrink-0"
                                />
                              )}
                              <span className="truncate font-medium">{partner.name}</span>
                            </div>
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-blue-600">{partner.minRate}%</span>
                          </SelectItem>
                        ))}
                        <SelectItem value="any" className="hover:bg-slate-50">Любой банк</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-semibold text-slate-900 mb-2 block">Дополнительная информация</Label>
                  <Input
                    id="message"
                    value={creditForm.message}
                    onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                    placeholder="Расскажите о ваших пожеланиях..."
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <StatusButton
                  type="submit"
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  state={submitButtonState.state}
                  loadingText="Отправляем заявку..."
                  successText="Заявка отправлена!"
                  errorText="Ошибка отправки"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Отправить заявку на кредит
                </StatusButton>
              </form>
            </div>
          </div>

          {/* Банки-партнеры и преимущества */}
          <div className="border-t border-slate-200 p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Банки-партнеры */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Банки-партнеры</h2>
                  <p className="text-slate-600">Работаем с надежными финансовыми партнерами</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {settings?.partners?.map((partner, index) => (
                    <div key={index} className="group p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200 flex-shrink-0">
                          <img
                            src={partner.logoUrl ? getCachedImageUrl(partner.logoUrl) : "/placeholder.svg"}
                            alt={partner.name}
                            className="h-8 w-10 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {partner.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-slate-600">от {partner.minRate}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-slate-600">до {partner.maxTerm} мес.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Персональные условия</h4>
                      <p className="text-sm text-slate-600">
                        Обращайтесь к нам для получения индивидуального предложения с лучшими условиями
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Преимущества */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Наши преимущества</h2>
                  <p className="text-slate-600">Почему выбирают нас для автокредитования</p>
                </div>

                <div className="space-y-4">
                  {settings?.benefits?.map((benefit, index) => {
                    const IconComponent = getIcon(benefit.icon)
                    return (
                      <div key={index} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <IconComponent className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Условия кредитования */}
                <div className="mt-8">
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
