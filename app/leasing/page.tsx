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
import { ChevronRight, Check, DollarSign, Zap, Shield, FileText, Award, Phone, Car, Star, CheckCircle, CreditCard, ChevronDown, ChevronUp, Calculator, Building, TrendingDown, Clock, Users, Target, Briefcase } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { firestoreApi } from "@/lib/firestore-api"
import LeasingConditions from "@/components/leasing-conditions"
import LeasingCarsCarousel from "@/components/leasing-cars-carousel"

import { getCachedImageUrl } from "@/lib/image-cache"

interface LeasingPageSettings {
  title: string
  subtitle: string
  description: string
  benefits: Array<{
    icon: string
    title: string
    description: string
  }>
  leasingCompanies: Array<{
    name: string
    logoUrl: string
    minAdvance: number
    maxTerm: number
  }>
}

export default function LeasingPage() {
  const [settings, setSettings] = useState<LeasingPageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true)
  const usdBynRate = useUsdBynRate()
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()

  const [calculator, setCalculator] = useState({
    carPrice: [50000],
    advance: [15000],
    leasingTerm: [36],
    residualValue: [20],
  })

  const [manualInputs, setManualInputs] = useState({
    carPrice: '',
    advance: '',
    leasingTerm: '',
    residualValue: '',
    selectedCompany: ''
  })

  const [leasingForm, setLeasingForm] = useState({
    clientType: "organization", // "organization" или "individual"
    // Поля для организации
    companyName: "",
    contactPerson: "",
    unp: "",
    // Поля для физ. лица
    fullName: "",
    // Общие поля
    phone: "+375",
    email: "",
    carPrice: "",
    advance: "",
    leasingTerm: "",
    company: "",
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
      advance: calculator.advance[0].toString(),
      leasingTerm: calculator.leasingTerm[0].toString(),
      residualValue: calculator.residualValue[0].toString(),
      selectedCompany: ''
    })
  }, [])

  const loadSettings = async () => {
    try {
      const data = await firestoreApi.getDocument("pages", "leasing")
      if (data) {
        setSettings(data as LeasingPageSettings)
      } else {
        // Fallback settings
        setSettings({
          title: "Автомобиль в лизинг – выгодное решение для бизнеса",
          subtitle: "Получите автомобиль в лизинг на выгодных условиях уже сегодня",
          description: "Лизинг автомобилей - это удобный способ получить транспорт для бизнеса без больших первоначальных затрат. Налоговые льготы, гибкие условия и возможность выкупа.",
          benefits: [],
          leasingCompanies: []
        })
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = () => {
    const principal = calculator.carPrice[0] - calculator.advance[0] - (calculator.carPrice[0] * calculator.residualValue[0] / 100)
    const monthlyPayment = principal / calculator.leasingTerm[0]
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

  const getLeasingMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getLeasingMaxValue = () => {
    return isBelarusianRubles ? 300000 : 100000
  }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!usdBynRate) return

    if (checked) {
      const newCarPrice = Math.max(3000, Math.round(calculator.carPrice[0] * usdBynRate))
      const newAdvance = Math.max(300, Math.round(calculator.advance[0] * usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        advance: [newAdvance]
      })
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        advance: newAdvance.toString()
      })
    } else {
      const newCarPrice = Math.max(1000, Math.round(calculator.carPrice[0] / usdBynRate))
      const newAdvance = Math.max(100, Math.round(calculator.advance[0] / usdBynRate))

      setCalculator({
        ...calculator,
        carPrice: [newCarPrice],
        advance: [newAdvance]
      })
      setManualInputs({
        ...manualInputs,
        carPrice: newCarPrice.toString(),
        advance: newAdvance.toString()
      })
    }
  }

  const handleManualInputChange = (field: string, value: string) => {
    setManualInputs({ ...manualInputs, [field]: value })

    const numValue = parseFloat(value) || 0

    switch (field) {
      case 'carPrice':
        const clampedCarPrice = Math.max(getLeasingMinValue(), Math.min(getLeasingMaxValue(), numValue))
        setCalculator({ ...calculator, carPrice: [clampedCarPrice] })
        break
      case 'advance':
        const minAdvance = 0
        const maxAdvance = calculator.carPrice[0] * 0.8
        const clampedAdvance = Math.max(minAdvance, Math.min(maxAdvance, numValue))
        setCalculator({ ...calculator, advance: [clampedAdvance] })
        break
      case 'leasingTerm':
        const clampedTerm = Math.max(12, Math.min(120, numValue))
        setCalculator({ ...calculator, leasingTerm: [clampedTerm] })
        break
      case 'residualValue':
        const clampedResidual = Math.max(10, Math.min(50, numValue))
        setCalculator({ ...calculator, residualValue: [clampedResidual] })
        break
    }
  }

  const handleCompanySelection = (companyValue: string) => {
    setManualInputs({ ...manualInputs, selectedCompany: companyValue })
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

  const isFormValid = () => {
    const baseFieldsValid =
      isPhoneValid(leasingForm.phone) &&
      leasingForm.carPrice.trim() !== "" &&
      leasingForm.advance.trim() !== "" &&
      leasingForm.leasingTerm !== "" &&
      leasingForm.company !== ""

    if (leasingForm.clientType === "organization") {
      return (
        baseFieldsValid &&
        leasingForm.companyName.trim() !== "" &&
        leasingForm.contactPerson.trim() !== "" &&
        leasingForm.unp.trim() !== ""
      )
    } else {
      return (
        baseFieldsValid &&
        leasingForm.fullName.trim() !== ""
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid()) {
      return
    }

    await submitButtonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", {
          ...leasingForm,
          type: "leasing_request",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
      }

      const clientName =
        leasingForm.clientType === "individual"
          ? leasingForm.fullName
          : leasingForm.contactPerson

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clientName,
          phone: leasingForm.phone,
          email: leasingForm.email,
          carPrice: leasingForm.carPrice,
          downPayment: leasingForm.advance,
          loanTerm: leasingForm.leasingTerm,
          message: leasingForm.message,
          clientType: leasingForm.clientType,
          companyName: leasingForm.companyName,
          unp: leasingForm.unp,
          type: "leasing_request",
        }),
      })

      setLeasingForm({
        clientType: "organization",
        companyName: "",
        contactPerson: "",
        unp: "",
        fullName: "",
        phone: "+375",
        email: "",
        carPrice: "",
        advance: "",
        leasingTerm: "",
        company: "",
        message: "",
      })
      showSuccess(
        "Заявка на лизинг успешно отправлена! Мы рассмотрим ее и свяжемся с вами в ближайшее время."
      )
    })
  }

  const monthlyPayment = calculateMonthlyPayment()
  const residualValue = (calculator.carPrice[0] * calculator.residualValue[0]) / 100
  const totalAmount = monthlyPayment * calculator.leasingTerm[0] + calculator.advance[0]
  const leasingSum = calculator.carPrice[0] - calculator.advance[0] - residualValue



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-black dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Breadcrumbs - статичные, показываем всегда */}
        <nav className="mb-6 md:mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-300">
            <li>
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors" prefetch={true}>
                Главная
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="text-slate-900 dark:text-white font-medium">Лизинг</li>
          </ol>
        </nav>

        {/* Hero Section - заголовки и описание со скелетонами */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden mb-6 md:mb-8">
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-zinc-950 dark:to-black px-4 py-6 md:px-8 md:py-12 min-h-[120px] md:min-h-[220px]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPHN2Zz4=')] opacity-10"></div>

            {/* Leasing Image - статичное, показываем всегда */}
            <div className="absolute -top-6 right-0 md:-top-12 md:right-4 z-10">
              <Image
                src="/car_credit3new.png"
                alt="Car Leasing"
                width={300}
                height={300}
                className="w-32 h-32 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            </div>

            <div className="relative z-20">
              {loading ? (
                <div className="space-y-2 md:space-y-4">
                  <div className="h-6 md:h-10 bg-slate-400 dark:bg-zinc-700 rounded w-64 md:w-96 animate-pulse"></div>
                  <div className="h-4 md:h-6 bg-slate-300 dark:bg-zinc-800 rounded w-48 md:w-80 animate-pulse"></div>
                  <div className="hidden md:block h-4 bg-slate-300 dark:bg-zinc-800 rounded w-72 animate-pulse mt-2 md:mt-6"></div>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-4">
                  <h1 className="text-xl md:text-4xl font-bold text-white dark:text-slate-100 relative z-30 leading-tight">{settings?.title}</h1>
                  <p className="text-sm md:text-lg md:text-xl text-slate-300 dark:text-slate-400 relative z-30 leading-tight">{settings?.subtitle}</p>
                  <p className="hidden md:block text-slate-400 dark:text-slate-500 leading-relaxed text-sm md:text-base relative z-30 mt-2 md:mt-6">{settings?.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">

            {/* Leasing Companies Section - только логотипы со скелетонами, остальное статично */}
            <div className="lg:hidden mb-4">
              <div className="flex justify-between items-center">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-6 w-9 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                  ))
                ) : (
                  settings?.leasingCompanies?.slice(0, 6).map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center group relative"
                      title={`${company.name} - от ${company.minAdvance}%`}
                    >
                      {company.logoUrl && (
                        <img
                          src={getCachedImageUrl(company.logoUrl)}
                          alt={company.name}
                          className="h-6 w-9 object-contain hover:opacity-75 transition-opacity"
                        />
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-zinc-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        от {company.minAdvance}%
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
                    <h2 className="text-base md:text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Calculator className="h-5 w-5 md:h-6 md:w-6 text-slate-600 dark:text-slate-400" />
                      Калькулятор лизинга
                    </h2>
                  </button>
                  {isMounted && (
                    <button
                      onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                      className="lg:hidden bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 p-2 rounded-lg transition-all duration-200"
                    >
                      {isCalculatorExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
                {isMounted && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="currency"
                      checked={isBelarusianRubles}
                      onCheckedChange={handleCurrencyChange}
                      className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-slate-100"
                    />
                    <Label htmlFor="currency" className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
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
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">Стоимость авто</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(calculator.carPrice[0])}</span>
                  </div>
                  <Slider
                    value={calculator.carPrice}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, carPrice: value })
                      setManualInputs({ ...manualInputs, carPrice: value[0].toString() })
                    }}
                    max={getLeasingMaxValue()}
                    min={getLeasingMinValue()}
                    step={isBelarusianRubles ? 500 : 1000}
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.carPrice}
                    onChange={(e) => handleManualInputChange('carPrice', e.target.value)}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 dark:text-slate-100 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Advance Payment - статичный */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">Авансовый платеж</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(calculator.advance[0])}</span>
                  </div>
                  <Slider
                    value={calculator.advance}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, advance: value })
                      setManualInputs({ ...manualInputs, advance: value[0].toString() })
                    }}
                    max={calculator.carPrice[0] * 0.8}
                    min={0}
                    step={isBelarusianRubles ? 200 : 500}
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.advance}
                    onChange={(e) => handleManualInputChange('advance', e.target.value)}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 dark:text-slate-100 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Введите сумму"
                  />
                </div>

                {/* Leasing Term - статичный */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">Срок лизинга</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900 dark:text-slate-100">{calculator.leasingTerm[0]} мес.</span>
                  </div>
                  <Slider
                    value={calculator.leasingTerm}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, leasingTerm: value })
                      setManualInputs({ ...manualInputs, leasingTerm: value[0].toString() })
                    }}
                    max={120}
                    min={12}
                    step={3}
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.leasingTerm}
                    onChange={(e) => handleManualInputChange('leasingTerm', e.target.value)}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 dark:text-slate-100 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Месяцы"
                  />
                </div>

                {/* Residual Value - статичный */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-2xl p-2 md:p-6 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center justify-between mb-1 md:mb-4">
                    <label className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">Остаточная стоимость</label>
                    <span className="text-xs md:text-lg font-bold text-slate-900 dark:text-slate-100">{calculator.residualValue[0]}%</span>
                  </div>
                  <Slider
                    value={calculator.residualValue}
                    onValueChange={(value) => {
                      setCalculator({ ...calculator, residualValue: value })
                      setManualInputs({ ...manualInputs, residualValue: value[0].toString() })
                    }}
                    max={50}
                    min={10}
                    step={5}
                    className="mb-1 md:mb-4"
                  />
                  <Input
                    type="number"
                    value={manualInputs.residualValue}
                    onChange={(e) => handleManualInputChange('residualValue', e.target.value)}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 dark:text-slate-100 rounded text-xs md:text-sm h-7 md:h-auto"
                    placeholder="Процент"
                  />
                </div>
                </div>

                  {/* Company Selection - со скелетоном для опций из БД */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-2xl p-2 md:p-6">
                  <label className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 md:mb-4 block">Выберите лизинговую компанию</label>
                  <Select
                    value={manualInputs.selectedCompany}
                    onValueChange={handleCompanySelection}
                  >
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 focus:border-slate-400 dark:focus:border-zinc-500 dark:text-slate-100 rounded text-xs md:text-sm h-8 md:h-12">
                      <SelectValue placeholder="Выберите компанию или введите ставку вручную" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <div className="p-2">
                          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          {settings?.leasingCompanies?.map((company) => (
                            <SelectItem
                              key={company.name}
                              value={company.name.toLowerCase().replace(/[\s-]/g, '')}
                              className="flex items-center justify-between p-2 md:p-3"
                            >
                              <div className="flex items-center gap-2 md:gap-3">
                                {company.logoUrl && (
                                  <Image
                                    src={getCachedImageUrl(company.logoUrl)}
                                    alt={company.name}
                                    width={20}
                                    height={20}
                                    className="object-contain rounded md:w-6 md:h-6"
                                  />
                                )}
                                <span className="font-medium text-sm md:text-base">{company.name}</span>
                              </div>
                              <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{company.minAdvance}%</span>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Ввести условия вручную</SelectItem>
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
                      <div className="text-xs text-slate-300 mb-1">Сумма лизинга</div>
                      <div className="text-sm md:text-xl font-bold">{formatCurrency(leasingSum)}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Ежемесячный платеж</div>
                      <div className="text-sm md:text-xl font-bold text-green-400">{formatCurrency(monthlyPayment)}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Остаточная стоимость</div>
                      <div className="text-sm md:text-xl font-bold">{formatCurrency(residualValue)}</div>
                    </div>
                    <div className="bg-white/10 rounded-md md:rounded-xl p-2 md:p-4 backdrop-blur">
                      <div className="text-xs text-slate-300 mb-1">Общая сумма</div>
                      <div className="text-sm md:text-xl font-bold text-blue-400">{formatCurrency(totalAmount)}</div>
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
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-800/50 rounded-2xl md:rounded-3xl p-3 md:p-6 h-full shadow-lg border border-slate-200 dark:border-zinc-700">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 md:mb-4">Подать заявку на лизинг</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 md:hidden">Заполните форму и мы свяжемся с вами</p>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-3">
                  {/* Выбор типа клиента */}
                  <div>
                    <Label className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 block">Тип клиента</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="organization"
                          checked={leasingForm.clientType === "organization"}
                          onChange={(e) => setLeasingForm({ ...leasingForm, clientType: e.target.value })}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Организация</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="individual"
                          checked={leasingForm.clientType === "individual"}
                          onChange={(e) => setLeasingForm({ ...leasingForm, clientType: e.target.value })}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Физ. лицо</span>
                      </label>
                    </div>
                  </div>

                  {/* Поля для организации */}
                  {leasingForm.clientType === "organization" && (
                    <>
                      <div>
                        <Label htmlFor="companyName" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                          Название организации
                        </Label>
                        <Input
                          id="companyName"
                          value={leasingForm.companyName}
                          onChange={(e) => setLeasingForm({ ...leasingForm, companyName: e.target.value })}
                          className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                          placeholder="ООО 'Ваша компания'"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2">
                        <div>
                          <Label htmlFor="contactPerson" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                            Контактное лицо
                          </Label>
                          <Input
                            id="contactPerson"
                            value={leasingForm.contactPerson}
                            onChange={(e) => setLeasingForm({ ...leasingForm, contactPerson: e.target.value })}
                            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                            placeholder="Иван Иванов"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="unp" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                            УНП
                          </Label>
                          <Input
                            id="unp"
                            value={leasingForm.unp}
                            onChange={(e) => setLeasingForm({ ...leasingForm, unp: e.target.value })}
                            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                            placeholder="123456789"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Поля для физ. лица */}
                  {leasingForm.clientType === "individual" && (
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        ФИО
                      </Label>
                      <Input
                        id="fullName"
                        value={leasingForm.fullName}
                        onChange={(e) => setLeasingForm({ ...leasingForm, fullName: e.target.value })}
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                        placeholder="Иванов Иван Иванович"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        Номер телефона
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={leasingForm.phone}
                          onChange={(e) => setLeasingForm({ ...leasingForm, phone: formatPhoneNumber(e.target.value) })}
                          className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg pr-10 h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                          placeholder="+375XXXXXXXXX"
                          required
                        />
                        {isPhoneValid(leasingForm.phone) && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    <div>
                      <Label htmlFor="carPrice" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        Стоимость ($)
                      </Label>
                      <Input
                        id="carPrice"
                        type="number"
                        value={leasingForm.carPrice}
                        onChange={(e) => setLeasingForm({ ...leasingForm, carPrice: e.target.value })}
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="advance" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        Авансовый ($)
                      </Label>
                      <Input
                        id="advance"
                        type="number"
                        value={leasingForm.advance}
                        onChange={(e) => setLeasingForm({ ...leasingForm, advance: e.target.value })}
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
                        placeholder="15000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    <div>
                      <Label htmlFor="leasingTerm" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        Срок
                      </Label>
                      <Select
                        value={leasingForm.leasingTerm}
                        onValueChange={(value) => setLeasingForm({ ...leasingForm, leasingTerm: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200">
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
                          <SelectItem value="96">96 мес</SelectItem>
                          <SelectItem value="108">108 мес</SelectItem>
                          <SelectItem value="120">120 мес</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">
                        Компания
                      </Label>
                      <Select
                        value={leasingForm.company}
                        onValueChange={(value) => setLeasingForm({ ...leasingForm, company: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg h-10 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200">
                          <SelectValue placeholder="Любая" />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <div className="p-2">
                              <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                              <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
                              <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            </div>
                          ) : (
                            <>
                              {settings?.leasingCompanies?.map((company) => (
                                <SelectItem
                                  key={company.name}
                                  value={company.name.toLowerCase().replace(/[\s-]/g, '')}
                                >
                                  {company.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="any">Любая компания</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <StatusButton
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 mt-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    state={submitButtonState.state}
                    loadingText="Отправляем..."
                    successText="Отправлено!"
                    errorText="Ошибка"
                    disabled={!isFormValid()}
                  >
                    Отправить заявку на лизинг
                  </StatusButton>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight text-center">
                    Нажимая кнопку "Отправить заявку на лизинг", вы соглашаетесь с{" "}
                    <Link href="/privacy#data-processing" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" prefetch={true}>
                      условиями обработки персональных данных
                    </Link>
                    {" "}и даете согласие на их использование.
                  </p>

                  {/* Partners Section - со скелетонами для логотипов из БД */}
                  <div className="hidden lg:block mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Лизинговые компании</h4>
                    <div className="grid grid-cols-3 gap-2 justify-items-center">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                        ))
                      ) : (
                        settings?.leasingCompanies?.map((company, index) => (
                          <div
                            key={index}
                            className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 flex items-center justify-center hover:shadow-lg hover:border-slate-300 transition-all duration-200 group relative"
                            title={`${company.name} - от ${company.minAdvance}%`}
                          >
                            {company.logoUrl && (
                              <img
                                src={getCachedImageUrl(company.logoUrl)}
                                alt={company.name}
                                className="h-8 w-10 object-contain"
                              />
                            )}
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              от {company.minAdvance}%
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

        {/* Карусель автомобилей - переместили выше преимуществ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 dark:border-zinc-800 overflow-hidden mb-6 md:mb-8">
          <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 md:mb-6">Доступные автомобили</h3>
            <LeasingCarsCarousel />
          </div>
        </div>

        {/* Benefits Section - со скелетонами только для данных из БД */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 md:mb-6">Преимущества лизинга</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-3 md:p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-xl border border-slate-200 dark:border-zinc-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-300 dark:bg-zinc-800 rounded-lg md:rounded-xl animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-slate-300 dark:bg-zinc-800 rounded w-24 mb-1 md:mb-2 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                settings?.benefits?.map((benefit, index) => {
                  const iconComponents = [DollarSign, TrendingDown, Shield, Building, Clock, FileText, Users, Zap, Award, Target, Briefcase, Car, Star, CheckCircle];
                  const IconComponent = iconComponents[index % iconComponents.length];

                  return (
                    <div key={index} className="group p-3 md:p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all shadow-md">
                          <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 md:mb-2 text-sm md:text-base leading-tight">{benefit.title}</h4>
                          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200 dark:border-zinc-700">
              <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200 dark:border-zinc-700">
                <LeasingConditions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
