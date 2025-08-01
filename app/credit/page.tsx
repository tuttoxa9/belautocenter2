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
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Check } from "lucide-react"
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
      const newCarPrice = Math.max(3000, Math.round(calculator.carPrice[0] * usdBynRate))
      const newDownPayment = Math.max(300, Math.round(calculator.downPayment[0] * usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        downPayment: [newDownPayment]
      })
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        downPayment: newDownPayment.toString()
      })
    } else {
      const newCarPrice = Math.max(1000, Math.round(calculator.carPrice[0] / usdBynRate))
      const newDownPayment = Math.max(100, Math.round(calculator.downPayment[0] / usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        downPayment: [newDownPayment]
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await submitButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        type: "credit_request",
        status: "new",
        createdAt: new Date(),
      })

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

  const monthlyPayment = calculateMonthlyPayment()
  const totalAmount = monthlyPayment * calculator.loanTerm[0]
  const overpayment = totalAmount - (calculator.carPrice[0] - calculator.downPayment[0])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded-full w-48 mb-6 md:mb-8"></div>
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 p-4 md:p-8">
              <div className="space-y-4 md:space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 md:h-20 bg-slate-100 rounded-xl md:rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-slate-600">Не удалось загрузить информацию о кредитах</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Breadcrumbs */}
        <nav className="mb-6 md:mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Главная
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="text-slate-900 font-medium">Автокредит</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6 md:mb-8">
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-8 md:px-8 md:py-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPHN2Zz4=')] opacity-10"></div>
            <div className="relative">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">{settings?.title}</h1>
              <p className="text-lg md:text-xl text-slate-300 mb-4 md:mb-6">{settings?.subtitle}</p>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base">{settings?.description}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-8 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">

            {/* Calculator Section */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">

              {/* Calculator Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Кредитный калькулятор</h2>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="currency"
                    checked={isBelarusianRubles}
                    onCheckedChange={handleCurrencyChange}
                    className="data-[state=checked]:bg-slate-900"
                  />
                  <Label htmlFor="currency" className="text-sm font-medium text-slate-700 cursor-pointer">
                    В белорусских рублях
                  </Label>
                </div>
              </div>

              {/* Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                {/* Car Price */}
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <label className="text-sm font-semibold text-slate-900">Стоимость автомобиля</label>
                    <span className="text-base md:text-lg font-bold text-slate-900">{formatCurrency(calculator.carPrice[0])}</span>
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
                    className="mb-3 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.carPrice}
                    onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Down Payment */}
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <label className="text-sm font-semibold text-slate-900">Первоначальный взнос</label>
                    <span className="text-base md:text-lg font-bold text-slate-900">{formatCurrency(calculator.downPayment[0])}</span>
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
                    className="mb-3 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.downPayment}
                    onChange={(e) => handleManualInputChange('downPayment', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Loan Term */}
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <label className="text-sm font-semibold text-slate-900">Срок кредита</label>
                    <span className="text-base md:text-lg font-bold text-slate-900">{calculator.loanTerm[0]} мес.</span>
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
                    className="mb-3 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.loanTerm}
                    onChange={(e) => handleManualInputChange('loanTerm', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                    placeholder="Месяцы"
                  />
                </div>

                {/* Interest Rate */}
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <label className="text-sm font-semibold text-slate-900">Процентная ставка</label>
                    <span className="text-base md:text-lg font-bold text-slate-900">{calculator.interestRate[0]}%</span>
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
                    className="mb-3 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.interestRate}
                    onChange={(e) => handleManualInputChange('interestRate', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                    placeholder="Процент"
                    disabled={manualInputs.selectedBank !== '' && manualInputs.selectedBank !== 'custom'}
                  />
                </div>
              </div>

              {/* Bank Selection */}
              <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                <label className="text-sm font-semibold text-slate-900 mb-3 md:mb-4 block">Выберите банк-партнер</label>
                <Select
                  value={manualInputs.selectedBank}
                  onValueChange={handleBankSelection}
                >
                  <SelectTrigger className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-12">
                    <SelectValue placeholder="Выберите банк или введите ставку вручную" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings?.partners?.map((partner) => (
                      <SelectItem
                        key={partner.name}
                        value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                        className="flex items-center justify-between p-2 md:p-3"
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          {partner.logoUrl && (
                            <Image
                              src={getCachedImageUrl(partner.logoUrl)}
                              alt={partner.name}
                              width={20}
                              height={20}
                              className="object-contain rounded md:w-6 md:h-6"
                            />
                          )}
                          <span className="font-medium text-sm md:text-base">{partner.name}</span>
                        </div>
                        <span className="text-xs md:text-sm text-slate-600">{partner.minRate}%</span>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Ввести ставку вручную</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Результат расчета</h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur">
                    <div className="text-xs md:text-sm text-slate-300 mb-1">Сумма кредита</div>
                    <div className="text-base md:text-xl font-bold">{formatCurrency(calculator.carPrice[0] - calculator.downPayment[0])}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur">
                    <div className="text-xs md:text-sm text-slate-300 mb-1">Ежемесячный платеж</div>
                    <div className="text-base md:text-xl font-bold text-green-400">{formatCurrency(monthlyPayment)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur">
                    <div className="text-xs md:text-sm text-slate-300 mb-1">Общая сумма</div>
                    <div className="text-base md:text-xl font-bold">{formatCurrency(totalAmount)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur">
                    <div className="text-xs md:text-sm text-slate-300 mb-1">Переплата</div>
                    <div className="text-base md:text-xl font-bold text-red-400">{formatCurrency(overpayment)}</div>
                  </div>
                </div>
                {!isBelarusianRubles && usdBynRate && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/20">
                    <div className="text-xs md:text-sm text-slate-300">
                      В белорусских рублях: <span className="font-semibold text-white">{convertUsdToByn(monthlyPayment, usdBynRate)} BYN/месяц</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 h-full">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6">Подать заявку</h2>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-slate-900 mb-2 block">Ваше имя</Label>
                    <Input
                      id="name"
                      value={creditForm.name}
                      onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                      className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                      placeholder="Введите ваше имя"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-900 mb-2 block">Номер телефона</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={creditForm.phone}
                        onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                        className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl pr-10 h-10 md:h-auto"
                        placeholder="+375XXXXXXXXX"
                        required
                      />
                      {isPhoneValid(creditForm.phone) && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-900 mb-2 block">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={creditForm.email}
                      onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                      className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="carPrice" className="text-sm font-medium text-slate-900 mb-2 block">Стоимость ($)</Label>
                      <Input
                        id="carPrice"
                        type="number"
                        value={creditForm.carPrice}
                        onChange={(e) => setCreditForm({ ...creditForm, carPrice: e.target.value })}
                        className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="downPayment" className="text-sm font-medium text-slate-900 mb-2 block">Взнос ($)</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={creditForm.downPayment}
                        onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                        className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                        placeholder="15000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="loanTerm" className="text-sm font-medium text-slate-900 mb-2 block">Срок</Label>
                      <Select
                        value={creditForm.loanTerm}
                        onValueChange={(value) => setCreditForm({ ...creditForm, loanTerm: value })}
                      >
                        <SelectTrigger className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto">
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
                      <Label htmlFor="bank" className="text-sm font-medium text-slate-900 mb-2 block">Банк</Label>
                      <Select
                        value={creditForm.bank}
                        onValueChange={(value) => setCreditForm({ ...creditForm, bank: value })}
                      >
                        <SelectTrigger className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings?.partners?.map((partner) => (
                            <SelectItem
                              key={partner.name}
                              value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                            >
                              {partner.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="any">Любой банк</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-slate-900 mb-2 block">Комментарий</Label>
                    <Input
                      id="message"
                      value={creditForm.message}
                      onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                      className="bg-white border-slate-200 focus:border-slate-400 rounded-lg md:rounded-xl h-10 md:h-auto"
                      placeholder="Дополнительная информация..."
                    />
                  </div>

                  <StatusButton
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg md:rounded-xl py-3 mt-4 md:mt-6 h-12 md:h-auto"
                    state={submitButtonState.state}
                    loadingText="Отправляем..."
                    successText="Отправлено!"
                    errorText="Ошибка"
                  >
                    Отправить заявку на кредит
                  </StatusButton>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Partners & Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Partners */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6">Банки-партнеры</h3>
            <div className="space-y-3 md:space-y-4">
              {settings?.partners?.map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    {partner.logoUrl && (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                        <img
                          src={getCachedImageUrl(partner.logoUrl)}
                          alt={partner.name}
                          className="h-6 w-8 md:h-8 md:w-10 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 text-sm md:text-base">{partner.name}</div>
                      <div className="text-xs md:text-sm text-slate-600">до {partner.maxTerm} месяцев</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base md:text-lg font-bold text-slate-900">от {partner.minRate}%</div>
                    <div className="text-xs md:text-sm text-slate-600">годовых</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6">Преимущества</h3>
            <div className="space-y-3 md:space-y-4">
              {settings?.benefits?.map((benefit, index) => (
                <div key={index} className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-colors">
                  <h4 className="font-semibold text-slate-900 mb-1 md:mb-2 text-sm md:text-base">{benefit.title}</h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
              <CreditConditions />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
