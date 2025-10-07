"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { convertUsdToByn } from "@/lib/utils"
import { parseFirestoreDoc } from "@/lib/firestore-parser"
import { StatusButton } from "@/components/ui/status-button"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { AlertCircle, Banknote, Calendar, Car, Percent, Building2, Calculator, Check } from "lucide-react"

// Кэш для статических данных (загружается один раз за сессию)
let staticDataCache: {
  banks?: any[]
  leasingCompanies?: any[]
  lastLoadTime?: number
} = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrls: string[];
}

interface PartnerBank {
  id: number;
  name: string;
  logo: string;
  logoUrl?: string;
  rate: number;
  minRate?: number;
  minDownPayment: number;
  maxTerm: number;
  maxLoanTerm?: number;
  features: string[];
  color: string;
}

interface LeasingCompany {
  name: string;
  logoUrl?: string;
  logo?: string;
  minAdvance: number;
  maxTerm: number;
  interestRate?: number;
}

interface FinancialAssistantDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  car: Car | null
}

export function FinancialAssistantDrawer({ open, onOpenChange, car }: FinancialAssistantDrawerProps) {
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [leasingCompanies, setLeasingCompanies] = useState<LeasingCompany[]>([])
  const [loadingLeasing, setLoadingLeasing] = useState(true)

  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit')

  // Состояния калькуляторов
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [loanTerm, setLoanTerm] = useState(60)
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)

  const [leasingAdvancePercent, setLeasingAdvancePercent] = useState(20)
  const [leasingTerm, setLeasingTerm] = useState(36)
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)

  // Состояние формы
  const [form, setForm] = useState({ name: "", phone: "+375", comment: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const submitButtonState = useButtonState()
  const { showSuccess } = useNotification()
  const usdBynRate = useUsdBynRate()

  const carPriceByn = useMemo(() => {
    if (!car || !car.price || !usdBynRate) return 0
    return Math.round(car.price * usdBynRate)
  }, [car, usdBynRate])

  // --- Расчеты для кредита ---
  const downPaymentByn = useMemo(() => {
    return Math.round((carPriceByn * downPaymentPercent) / 100)
  }, [carPriceByn, downPaymentPercent])

  const creditAmountByn = useMemo(() => {
    return carPriceByn - downPaymentByn
  }, [carPriceByn, downPaymentByn])

  const creditMonthlyPayment = useMemo(() => {
    if (!selectedBank) return 0
    const principal = creditAmountByn
    const rateValue = selectedBank.rate ?? selectedBank.minRate ?? 0
    const rate = rateValue / 100 / 12
    const term = loanTerm

    if (!rate || rate <= 0) return principal / term
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    return monthlyPayment
  }, [creditAmountByn, loanTerm, selectedBank])

  // --- Расчеты для лизинга ---
  const leasingAdvanceByn = useMemo(() => {
    return Math.round((carPriceByn * leasingAdvancePercent) / 100)
  }, [carPriceByn, leasingAdvancePercent])

  const leasingAmountByn = useMemo(() => {
    return carPriceByn - leasingAdvanceByn
  }, [carPriceByn, leasingAdvanceByn])

  const leasingMonthlyPayment = useMemo(() => {
    // Упрощенная формула, т.к. нет данных о выкупном платеже в ТЗ
    return leasingAmountByn / leasingTerm
  }, [leasingAmountByn, leasingTerm])


  useEffect(() => {
    if (open) {
      loadStaticData()
    }
  }, [open])

  useEffect(() => {
    if (car) {
      // Reset defaults when car changes
      setDownPaymentPercent(20)
      setLoanTerm(60)
      setLeasingAdvancePercent(20)
      setLeasingTerm(36)
    }
  }, [car])

  const loadStaticData = async () => {
    const now = Date.now()
    if (
      staticDataCache.lastLoadTime &&
      now - staticDataCache.lastLoadTime < CACHE_DURATION &&
      staticDataCache.banks &&
      staticDataCache.leasingCompanies
    ) {
      setPartnerBanks(staticDataCache.banks)
      setSelectedBank(staticDataCache.banks[0] || null)
      setLeasingCompanies(staticDataCache.leasingCompanies)
      setSelectedLeasingCompany(staticDataCache.leasingCompanies[0] || null)
      setLoadingBanks(false)
      setLoadingLeasing(false)
      return
    }

    setLoadingBanks(true)
    setLoadingLeasing(true)
    try {
      // Используем apiClient для запросов
      const [banksResponse, leasingResponse] = await Promise.all([
        fetch('/api/banks'),
        fetch('/api/leasing')
      ]);

      const banksData = await banksResponse.json();
      const leasingData = await leasingResponse.json();

      const banks = banksData.partners || []
      const leasingCompanies = leasingData.partners || []

      staticDataCache = {
        banks,
        leasingCompanies,
        lastLoadTime: now,
      }

      setPartnerBanks(banks)
      setSelectedBank(banks[0] || null)
      setLeasingCompanies(leasingCompanies)
      setSelectedLeasingCompany(leasingCompanies[0] || null)

    } catch (error) {
      console.error("Failed to load financial data:", error)
      setPartnerBanks([])
      setLeasingCompanies([])
    } finally {
      setLoadingBanks(false)
      setLoadingLeasing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-BY", {
      style: "currency",
      currency: "BYN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSliderChange = (setter: (value: number) => void) => (value: number[]) => {
    setter(value[0])
  }

  const handleInputChange = (setter: (value: number) => void, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10)
    if (isNaN(value)) value = 0
    if (value > max) value = max
    setter(value)
  }

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
          carInfo: `${car?.make} ${car?.model} ${car?.year}`,
          type: financeType,
          status: "new",
          createdAt: new Date().toISOString(),
          currency: "BYN",
          financeDetails: {
            carPrice: carPriceByn,
            downPayment: financeType === 'credit' ? downPaymentByn : leasingAdvanceByn,
            loanTerm: financeType === 'credit' ? loanTerm : leasingTerm,
            monthlyPayment: financeType === 'credit' ? creditMonthlyPayment : leasingMonthlyPayment,
            partner: financeType === 'credit' ? selectedBank?.name : selectedLeasingCompany?.name,
          }
        }

        // Отправка в Telegram
        await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                phone: form.phone,
                message: form.comment,
                carMake: car?.make,
                carModel: car?.model,
                carYear: car?.year,
                carId: car?.id,
                carPrice: formatPrice(carPriceByn),
                downPayment: formatPrice(financeType === 'credit' ? downPaymentByn : leasingAdvanceByn),
                loanTerm: financeType === 'credit' ? loanTerm : leasingTerm,
                bank: financeType === 'credit' ? selectedBank?.name : selectedLeasingCompany?.name,
                financeType: financeType,
                type: financeType === 'credit' ? 'credit_request' : 'leasing_request'
            })
        });

        // Сохранение в Firestore
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await addDoc(collection(db, "leads"), payload);

        showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена!`)
        setTimeout(() => {
          onOpenChange(false)
          setForm({ name: "", phone: "+375", comment: "" })
        }, 3000)

      } catch (error) {
        console.error("Failed to submit application:", error)
        setFormError("Произошла ошибка при отправке. Попробуйте еще раз.")
        throw error // re-throw to let useButtonState handle it
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 sm:p-6 border-b">
          <SheetTitle className="text-xl sm:text-2xl">Финансовый помощник</SheetTitle>
          {car && (
            <SheetDescription as="div" className="!mt-2">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-12 rounded-md overflow-hidden shrink-0">
                  <Image
                    src={getCachedImageUrl(car.imageUrls?.[0] || '/placeholder.svg')}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{car.make} {car.model}</p>
                  <p className="text-sm text-slate-500">{car.year} год</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-slate-900">{formatPrice(carPriceByn)}</p>
                  <p className="text-xs text-slate-500">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(car.price)}</p>
                </div>
              </div>
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Tabs value={financeType} onValueChange={(v) => setFinanceType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credit">Кредит</TabsTrigger>
              <TabsTrigger value="leasing">Лизинг</TabsTrigger>
            </TabsList>
            <TabsContent value="credit" className="space-y-6 pt-4">
              {/* Calculator Block */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="downPayment">Первый взнос: <span className="font-bold text-blue-600">{downPaymentPercent}%</span></Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="downPayment"
                      min={10}
                      max={90}
                      step={1}
                      value={[downPaymentPercent]}
                      onValueChange={handleSliderChange(setDownPaymentPercent)}
                    />
                    <Input
                      type="text"
                      className="w-28"
                      value={downPaymentByn.toLocaleString('ru-RU')}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\s/g, ''), 10)
                        if (!isNaN(val)) {
                            setDownPaymentPercent(Math.round((val / carPriceByn) * 100))
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="loanTerm">Срок кредита: <span className="font-bold text-blue-600">{loanTerm} мес.</span></Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="loanTerm"
                      min={12}
                      max={selectedBank?.maxTerm || selectedBank?.maxLoanTerm || 96}
                      step={6}
                      value={[loanTerm]}
                      onValueChange={handleSliderChange(setLoanTerm)}
                    />
                    <Input
                        type="number"
                        className="w-28"
                        value={loanTerm}
                        onChange={handleInputChange(setLoanTerm, selectedBank?.maxTerm || selectedBank?.maxLoanTerm || 96)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bank">Банк</Label>
                  {loadingBanks ? <div className="h-10 bg-slate-200 rounded-md animate-pulse mt-2"></div> :
                    <Select
                      value={selectedBank?.name}
                      onValueChange={(value) => setSelectedBank(partnerBanks.find(b => b.name === value) || null)}
                    >
                      <SelectTrigger id="bank">
                        <SelectValue placeholder="Выберите банк" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerBanks.map(bank => (
                          <SelectItem key={bank.id} value={bank.name}>
                            <div className="flex items-center gap-2">
                                {(bank.logo || bank.logoUrl) && <Image src={getCachedImageUrl(bank.logo || bank.logoUrl)} alt={bank.name} width={20} height={20} />}
                                <span>{bank.name}</span>
                                <span className="ml-auto text-xs text-slate-500">{bank.rate || bank.minRate}%</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  }
                </div>
              </div>

              {/* Result Block */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Предварительный расчет</h3>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Ежемесячный платеж</p>
                  <p className="text-3xl font-bold text-slate-900">{formatPrice(creditMonthlyPayment)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-slate-600">Сумма кредита</p>
                        <p className="font-semibold">{formatPrice(creditAmountByn)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-600">Ставка</p>
                        <p className="font-semibold">{selectedBank?.rate || selectedBank?.minRate}%</p>
                    </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="leasing" className="space-y-6 pt-4">
               {/* Calculator Block */}
               <div className="space-y-4">
                <div>
                  <Label htmlFor="leasingAdvance">Аванс: <span className="font-bold text-blue-600">{leasingAdvancePercent}%</span></Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="leasingAdvance"
                      min={selectedLeasingCompany?.minAdvance || 10}
                      max={90}
                      step={1}
                      value={[leasingAdvancePercent]}
                      onValueChange={handleSliderChange(setLeasingAdvancePercent)}
                    />
                    <Input
                      type="text"
                      className="w-28"
                      value={leasingAdvanceByn.toLocaleString('ru-RU')}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\s/g, ''), 10)
                        if (!isNaN(val)) {
                            setLeasingAdvancePercent(Math.round((val / carPriceByn) * 100))
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="leasingTerm">Срок лизинга: <span className="font-bold text-blue-600">{leasingTerm} мес.</span></Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="leasingTerm"
                      min={12}
                      max={selectedLeasingCompany?.maxTerm || 84}
                      step={6}
                      value={[leasingTerm]}
                      onValueChange={handleSliderChange(setLeasingTerm)}
                    />
                     <Input
                        type="number"
                        className="w-28"
                        value={leasingTerm}
                        onChange={handleInputChange(setLeasingTerm, selectedLeasingCompany?.maxTerm || 84)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="leasingCompany">Лизинговая компания</Label>
                   {loadingLeasing ? <div className="h-10 bg-slate-200 rounded-md animate-pulse mt-2"></div> :
                    <Select
                      value={selectedLeasingCompany?.name}
                      onValueChange={(value) => setSelectedLeasingCompany(leasingCompanies.find(c => c.name === value) || null)}
                    >
                      <SelectTrigger id="leasingCompany">
                        <SelectValue placeholder="Выберите компанию" />
                      </SelectTrigger>
                      <SelectContent>
                        {leasingCompanies.map(c => (
                          <SelectItem key={c.name} value={c.name}>
                            <div className="flex items-center gap-2">
                                {(c.logo || c.logoUrl) && <Image src={getCachedImageUrl(c.logo || c.logoUrl)} alt={c.name} width={20} height={20} />}
                                <span>{c.name}</span>
                                <span className="ml-auto text-xs text-slate-500">от {c.minAdvance}%</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  }
                </div>
              </div>

              {/* Result Block */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Предварительный расчет</h3>
                <div className="text-center">
                  <p className="text-sm text-slate-600">Ежемесячный платеж</p>
                  <p className="text-3xl font-bold text-slate-900">{formatPrice(leasingMonthlyPayment)}</p>
                  <p className="text-xs text-slate-500">*без учета выкупного платежа</p>
                </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-slate-600">Сумма финансирования</p>
                        <p className="font-semibold">{formatPrice(leasingAmountByn)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-600">Мин. аванс</p>
                        <p className="font-semibold">{selectedLeasingCompany?.minAdvance}%</p>
                    </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Block */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Отправить заявку</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                 <div className="relative">
                    <Input id="phone" value={form.phone} onChange={handlePhoneChange} required className="pr-10"/>
                    {isPhoneValid(form.phone) && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                 </div>
              </div>
              <div>
                <Label htmlFor="comment">Комментарий (необязательно)</Label>
                <Textarea id="comment" value={form.comment} onChange={(e) => setForm({...form, comment: e.target.value})} />
              </div>
               {formError && <p className="text-sm text-red-600">{formError}</p>}
               {submitButtonState.error && <p className="text-sm text-red-600">Произошла ошибка при отправке. Попробуйте еще раз.</p>}
            </form>
          </div>
        </div>

        {/* Sticky Footer */}
        <SheetFooter className="p-4 sm:p-6 border-t bg-white">
          <div className="w-full space-y-3">
             <StatusButton
                onClick={handleSubmit}
                className="w-full"
                state={submitButtonState.state}
                disabled={!isFormValid}
                loadingText="Отправляем..."
                successText="Заявка отправлена!"
              >
                Отправить заявку на {financeType === 'credit' ? 'кредит' : 'лизинг'}
              </StatusButton>
            <p className="text-xs text-slate-500 text-center">
              Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой обработки персональных данных</a>.
              Наш менеджер свяжется с вами в течение 15 минут в рабочее время.
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}