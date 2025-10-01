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
import { ChevronRight, Check, DollarSign, Zap, Shield, FileText, Award, Phone, Car, Star, CheckCircle, CreditCard, ChevronDown, ChevronUp, Calculator } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { firestoreApi } from "@/lib/firestore-api"
import CreditConditions from "@/components/credit-conditions"
import { getCachedImageUrl } from "@/lib/image-cache"
import CreditCarsCarousel from "@/components/credit-cars-carousel"

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

  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      const data = await firestoreApi.getDocument("pages", "credit")
      if (data) {
        setSettings(data as CreditPageSettings)
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
      try {
        await firestoreApi.addDocument("leads", {
          ...creditForm,
          type: "credit_request",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
      }

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...creditForm,
          type: "credit_request",
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
      showSuccess(
        "Заявка на кредит успешно отправлена! Мы рассмотрим ее и свяжемся с вами в ближайшее время."
      )
    })
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalAmount = monthlyPayment * calculator.loanTerm[0]
  const overpayment = totalAmount - (calculator.carPrice[0] - calculator.downPayment[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Breadcrumbs - статичные, показываем всегда */}
        <nav className="mb-6 md:mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-900 transition-colors" prefetch={true}>
                Главная
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="text-slate-900 font-medium">Автокредит</li>
          </ol>
        </nav>

        {/* Hero Section - заголовки и описание со скелетонами */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6 md:mb-8">
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-6 md:px-8 md:py-12 min-h-[120px] md:min-h-[220px]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPHN2Zz4=')] opacity-10"></div>

            {/* Credit Image - статичное, показываем всегда */}
            <div className="absolute -top-6 right-0 md:-top-12 md:right-4 z-10">
              <Image
                src="/car_credit3new.png"
                alt="Car Credit"
                width={300}
                height={300}
                className="w-32 h-32 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            </div>

            <div className="relative z-20">
              {loading ? (
                <div className="space-y-2 md:space-y-4">
                  <div className="h-6 md:h-10 bg-slate-400 rounded w-64 md:w-96 animate-pulse"></div>
                  <div className="h-4 md:h-6 bg-slate-300 rounded w-48 md:w-80 animate-pulse"></div>
                  <div className="hidden md:block h-4 bg-slate-300 rounded w-72 animate-pulse mt-2 md:mt-6"></div>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-4">
                  <h1 className="text-xl md:text-4xl font-bold text-white relative z-30 leading-tight">{settings?.title}</h1>
                  <p className="text-sm md:text-lg md:text-xl text-slate-300 relative z-30 leading-tight">{settings?.subtitle}</p>
                  <p className="hidden md:block text-slate-400 leading-relaxed text-sm md:text-base relative z-30 mt-2 md:mt-6">{settings?.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">

            {/* Banks Partners Section - только логотипы со скелетонами, остальное статично */}
            <div className="lg:hidden mb-4">
              <div className="flex justify-between items-center">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-6 w-9 bg-slate-200 rounded animate-pulse"></div>
                  ))
                ) : (
                  settings?.partners?.slice(0, 6).map((partner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center group relative"
                      title={`${partner.name} - от ${partner.minRate}%`}
                    >
                      {partner.logoUrl && (
                        <img
                          src={getCachedImageUrl(partner.logoUrl)}
                          alt={partner.name}
                          className="h-6 w-9 object-contain hover:opacity-75 transition-opacity"
                        />
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        от {partner.minRate}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculator Section - статичная часть */}
            <div className="lg:col-span-3 space-y-2 md:space-y-6">

              {/* Calculator Header - статичный */}
              <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                    className="lg:hover:none flex items-center gap-2 lg:cursor-default flex-1 lg:flex-none lg:pointer-events-none"
                  >
                    <h2 className="text-base md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
                      <Calculator className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                      Калькулятор
                    </h2>
                  </button>
                  {isMounted && (
                    <button
                      onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                      className="lg:hidden bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-all duration-200"
                    >
                      {isCalculatorExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                  )}
                </div>
                {isMounted && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Checkbox
                      id="currency"
                      checked={isBelarusianRubles}
                      onCheckedChange={handleCurrencyChange}
                      className="data-[state=checked]:bg-slate-900"
                    />
                    <Label htmlFor="currency" className="text-xs md:text-sm font-medium text-slate-700 cursor-pointer">
                      В белорусских рублях
                    </Label>
                  </div>
                )}
              </div>

              {/* Parameters Grid - статичный калькулятор */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden lg:max-h-screen lg:opacity-100 ${
                !isMounted ? 'max-h-0 opacity-0 lg:max-h-screen lg:opacity-100' :
                (isCalculatorExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 lg:max-h-screen lg:opacity-100')
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 pt-2 lg:pt-0">

                {/* Car Price - статичный */}
                <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900">Стоимость авто</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900">{formatCurrency(calculator.carPrice[0])}</span>
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
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.carPrice}
                    onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Down Payment - статичный */}
                <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900">Первый взнос</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900">{formatCurrency(calculator.downPayment[0])}</span>
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
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.downPayment}
                    onChange={(e) => handleManualInputChange('downPayment', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Loan Term - статичный */}
                <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900">Срок кредита</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900">{calculator.loanTerm[0]} мес.</span>
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
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.loanTerm}
                    onChange={(e) => handleManualInputChange('loanTerm', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Месяцы"
                  />
                </div>

                {/* Interest Rate - статичный */}
                <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900">Процентная ставка</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900">{calculator.interestRate[0]}%</span>
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
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.interestRate}
                    onChange={(e) => handleManualInputChange('interestRate', e.target.value)}
                    className="bg-white border-slate-200 focus:border-slate-400 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Процент"
                    disabled={manualInputs.selectedBank !== '' && manualInputs.selectedBank !== 'custom'}
                  />
                </div>
                </div>

                  {/* Bank Selection - со скелетоном для опций из БД */}
                <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6">
                  <label className="text-xs md:text-sm font-semibold text-slate-900 mb-1 md:mb-4 block">Выберите банк-партнер</label>
                  <Select
                    value={manualInputs.selectedBank}
                    onValueChange={handleBankSelection}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:border-slate-400 rounded text-xs md:text-sm h-8 md:h-12">
                      <SelectValue placeholder="Выберите банк или введите ставку вручную" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <div className="p-2">
                          <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Card - статичный */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg md:rounded-2xl p-3 md:p-6 text-white">
                  <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4">Результат расчета</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Сумма кредита</div>
                      <div className="text-sm md:text-xl font-bold">{formatCurrency(calculator.carPrice[0] - calculator.downPayment[0])}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Ежемесячный платеж</div>
                      <div className="text-sm md:text-xl font-bold text-green-400">{formatCurrency(monthlyPayment)}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Общая сумма</div>
                      <div className="text-sm md:text-xl font-bold">{formatCurrency(totalAmount)}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Переплата</div>
                      <div className="text-sm md:text-xl font-bold text-red-400">{formatCurrency(overpayment)}</div>
                    </div>
                  </div>
                  {!isBelarusianRubles && usdBynRate && (
                    <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/20">
                      <div className="text-xs md:text-sm text-slate-300">
                        В белорусских рублях: <span className="font-semibold text-white">{convertUsdToByn(monthlyPayment, usdBynRate)} BYN/месяц</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Form - статичная форма */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl md:rounded-3xl p-3 md:p-6 h-full shadow-lg border border-slate-200">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4">Подать заявку</h2>
                <p className="text-sm text-slate-600 mb-3 md:hidden">Заполните форму и мы свяжемся с вами</p>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-3">
                  <div className="space-y-3 md:space-y-2">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-slate-800 mb-1 block">
                        Ваше имя
                      </Label>
                      <Input
                        id="name"
                        value={creditForm.name}
                        onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                        className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200"
                        placeholder="Введите ваше имя"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-800 mb-1 block">
                        Номер телефона
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={creditForm.phone}
                          onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                          className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg pr-10 h-10 text-sm transition-all duration-200"
                          placeholder="+375XXXXXXXXX"
                          required
                        />
                        {isPhoneValid(creditForm.phone) && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-800 mb-1 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={creditForm.email}
                        onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                        className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    <div>
                      <Label htmlFor="carPrice" className="text-sm font-medium text-slate-800 mb-1 block">
                        Стоимость ($)
                      </Label>
                      <Input
                        id="carPrice"
                        type="number"
                        value={creditForm.carPrice}
                        onChange={(e) => setCreditForm({ ...creditForm, carPrice: e.target.value })}
                        className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200"
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="downPayment" className="text-sm font-medium text-slate-800 mb-1 block">
                        Взнос ($)
                      </Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={creditForm.downPayment}
                        onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                        className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200"
                        placeholder="15000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    <div>
                      <Label htmlFor="loanTerm" className="text-sm font-medium text-slate-800 mb-1 block">
                        Срок
                      </Label>
                      <Select
                        value={creditForm.loanTerm}
                        onValueChange={(value) => setCreditForm({ ...creditForm, loanTerm: value })}
                      >
                        <SelectTrigger className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200">
                          <SelectValue placeholder="Месяцы" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 мес</SelectItem>
                          <SelectItem value="24">24 мес</SelectItem>
                          <SelectItem value="36">36 мес</SelectItem>
                          <SelectItem value="48">48 мес</SelectItem>
                          <SelectItem value="60">60 мес</SelectItem>
                          <SelectItem value="72">72 мес</SelectItem>
                          <SelectItem value="84">84 мес</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bank" className="text-sm font-medium text-slate-800 mb-1 block">
                        Банк
                      </Label>
                      <Select
                        value={creditForm.bank}
                        onValueChange={(value) => setCreditForm({ ...creditForm, bank: value })}
                      >
                        <SelectTrigger className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200">
                          <SelectValue placeholder="Любой" />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <div className="p-2">
                              <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                              <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                              <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                            </div>
                          ) : (
                            <>
                              {settings?.partners?.map((partner) => (
                                <SelectItem
                                  key={partner.name}
                                  value={partner.name.toLowerCase().replace(/[\s-]/g, '')}
                                >
                                  {partner.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="any">Любой банк</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-slate-800 mb-1 block">
                      Комментарий
                    </Label>
                    <Input
                      id="message"
                      value={creditForm.message}
                      onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                      className="bg-white border border-slate-200 focus:border-blue-400 rounded-lg h-10 text-sm transition-all duration-200"
                      placeholder="Дополнительная информация..."
                    />
                  </div>

                  <StatusButton
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 mt-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                    state={submitButtonState.state}
                    loadingText="Отправляем..."
                    successText="Отправлено!"
                    errorText="Ошибка"
                  >
                    Отправить заявку на кредит
                  </StatusButton>

                  <p className="text-xs text-slate-600 leading-tight text-center">
                    Нажимая кнопку "Отправить заявку на кредит", вы соглашаетесь с{" "}
                    <Link href="/privacy#data-processing" className="text-blue-600 hover:text-blue-800 underline" prefetch={true}>
                      условиями обработки персональных данных
                    </Link>
                    {" "}и даете согласие на их использование.
                  </p>

                  {/* Partners Section - со скелетонами для логотипов из БД */}
                  <div className="hidden lg:block mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Банки-партнеры</h4>
                    <div className="grid grid-cols-3 gap-2 justify-items-center">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                        ))
                      ) : (
                        settings?.partners?.map((partner, index) => (
                          <div
                            key={index}
                            className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:shadow-lg hover:border-slate-300 transition-all duration-200 group relative"
                            title={`${partner.name} - от ${partner.minRate}%`}
                          >
                            {partner.logoUrl && (
                              <img
                                src={getCachedImageUrl(partner.logoUrl)}
                                alt={partner.name}
                                className="h-8 w-10 object-contain"
                              />
                            )}
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              от {partner.minRate}%
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>


                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Cars Carousel */}
        <CreditCarsCarousel />

        {/* Benefits Section - со скелетонами только для данных из БД */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6">Наши преимущества</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-300 rounded-lg md:rounded-xl animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-slate-300 rounded w-24 mb-1 md:mb-2 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                settings?.benefits?.map((benefit, index) => {
                  const iconComponents = [DollarSign, Zap, Shield, FileText, Award, Phone, Car, Star, CheckCircle, CreditCard];
                  const IconComponent = iconComponents[index % iconComponents.length];

                  return (
                    <div key={index} className="group p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl hover:bg-slate-100 transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all shadow-md">
                          <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 mb-1 md:mb-2 text-sm md:text-base leading-tight">{benefit.title}</h4>
                          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200">
                <CreditConditions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
