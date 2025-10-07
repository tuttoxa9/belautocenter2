"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { StatusButton } from "@/components/ui/status-button"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { convertUsdToByn, formatPrice, formatPhoneNumber } from "@/lib/utils"
import {
  Check,
} from "lucide-react"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  imageUrls: string[]
}

interface PartnerBank {
  id: number
  name: string
  logo?: string
  logoUrl?: string
  rate?: number
  minRate?: number
  minDownPayment: number
  maxTerm?: number
  maxLoanTerm?: number
  features: string[]
  color: string
}

interface LeasingCompany {
  name:string
  logo?: string
  logoUrl?: string
  minAdvance: number
  maxTerm: number
  interestRate?: number
}


interface FinancialAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  car: Car | null
  partnerBanks: PartnerBank[]
  leasingCompanies: LeasingCompany[]
}

export function FinancialAssistant({
  open,
  onOpenChange,
  car,
  partnerBanks,
  leasingCompanies,
}: FinancialAssistantProps) {
  const { showSuccess } = useNotification()
  const usdBynRate = useUsdBynRate()
  const creditButtonState = useButtonState()

  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit')
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true)

  // Calculator states
  const [downPayment, setDownPayment] = useState([20000])
  const [loanTerm, setLoanTerm] = useState([60])
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)

  const [leasingAdvance, setLeasingAdvance] = useState([15000])
  const [leasingTerm, setLeasingTerm] = useState([36])
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)

  // Manual input states to prevent cursor jumping
  const [manualInputs, setManualInputs] = useState({
      downPayment: '20000',
      loanTerm: '60',
      leasingAdvance: '15000',
      leasingTerm: '36',
  })

  // Form state
  const [form, setForm] = useState({ name: "", phone: "+375", message: "" })
  const [formError, setFormError] = useState<string | null>(null)

  const isPhoneValid = (phone: string) => phone.length === 13 && phone.startsWith("+375")
  const isFormValid = form.name.trim() !== "" && isPhoneValid(form.phone)

  const carPriceInCurrency = car?.price ? (isBelarusianRubles && usdBynRate ? car.price * usdBynRate : car.price) : 0;

  // Sync manual inputs when slider values change
  useEffect(() => {
    setManualInputs(prev => ({
        ...prev,
        downPayment: downPayment[0].toString(),
        loanTerm: loanTerm[0].toString(),
    }))
  }, [downPayment, loanTerm])

  useEffect(() => {
    setManualInputs(prev => ({
        ...prev,
        leasingAdvance: leasingAdvance[0].toString(),
        leasingTerm: leasingTerm[0].toString(),
    }))
  }, [leasingAdvance, leasingTerm])


  // Initialize component and reset values when opening
  useEffect(() => {
    if (open && car && car.price) {
      const price = car.price
      const newDownPayment = isBelarusianRubles && usdBynRate ? Math.round(price * 0.2 * usdBynRate) : price * 0.2;
      const newLeasingAdvance = isBelarusianRubles && usdBynRate ? Math.round(price * 0.2 * usdBynRate) : price * 0.2;

      setDownPayment([newDownPayment])
      setLeasingAdvance([newLeasingAdvance])
      setLoanTerm([60])
      setLeasingTerm([36])
    }
    if (partnerBanks.length > 0) {
      setSelectedBank(partnerBanks[0])
    }
    if (leasingCompanies.length > 0) {
      setSelectedLeasingCompany(leasingCompanies[0])
    }
  }, [open, car, isBelarusianRubles, usdBynRate, partnerBanks, leasingCompanies])

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)
    if (!car || !car.price || !usdBynRate) return

    const price = car.price
    if (checked) { // to BYN
      setDownPayment([Math.round(price * 0.2 * usdBynRate)])
      setLeasingAdvance([Math.round(price * 0.2 * usdBynRate)])
    } else { // to USD
      setDownPayment([price * 0.2])
      setLeasingAdvance([price * 0.2])
    }
  }

  const handleManualInputChange = (field: keyof typeof manualInputs, value: string) => {
      setManualInputs(prev => ({ ...prev, [field]: value }));
      const numValue = Number(value);
      if (isNaN(numValue)) return;

      switch(field) {
          case 'downPayment':
              setDownPayment([numValue]);
              break;
          case 'loanTerm':
              setLoanTerm([numValue]);
              break;
          case 'leasingAdvance':
              setLeasingAdvance([numValue]);
              break;
          case 'leasingTerm':
              setLeasingTerm([numValue]);
              break;
      }
  }

  const creditAmountValue = carPriceInCurrency - downPayment[0];

  const calculateMonthlyPayment = () => {
    if (!selectedBank || creditAmountValue <= 0) return 0
    const principal = creditAmountValue
    const rateValue = selectedBank.rate ?? selectedBank.minRate ?? 0
    const rate = rateValue / 100 / 12
    const term = loanTerm[0]

    if (!rate || rate <= 0 || term <= 0) return term > 0 ? principal / term : 0
    return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
  }

  const calculateLeasingPayment = () => {
    const leasingSum = carPriceInCurrency - leasingAdvance[0]
    const term = leasingTerm[0]
    return term > 0 ? leasingSum / term : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
        setFormError("Пожалуйста, заполните все обязательные поля корректно.");
        return;
    }
    setFormError(null);

    await creditButtonState.execute(async () => {
      try {
        const payload = {
            ...form,
            carId: car?.id,
            carInfo: `${car?.make} ${car?.model} ${car?.year}`,
            type: financeType,
            status: "new",
            createdAt: new Date(),
            currency: isBelarusianRubles ? "BYN" : "USD",
            financeType: financeType,
            ...(financeType === 'credit' ? {
                creditAmount: creditAmountValue,
                downPayment: downPayment[0],
                loanTerm: loanTerm[0],
                selectedBank: selectedBank ? selectedBank.name : "",
                monthlyPayment: calculateMonthlyPayment(),
            } : {
                leasingAmount: carPriceInCurrency,
                leasingAdvance: leasingAdvance[0],
                leasingTerm: leasingTerm[0],
                selectedLeasingCompany: selectedLeasingCompany ? selectedLeasingCompany.name : "",
                monthlyPayment: calculateLeasingPayment(),
            })
        };

        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await addDoc(collection(db, "leads"), payload)

        await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, type: financeType === 'credit' ? 'credit_request' : 'leasing_request' })
        });

        showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена!`)
        onOpenChange(false)
        setTimeout(() => setForm({ name: "", phone: "+375", message: "" }), 300)

      } catch (error) {
        setFormError("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.");
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:w-[540px] lg:w-[480px] flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-6 border-b">
          <SheetTitle className="text-xl sm:text-2xl">Расчет кредита и лизинга</SheetTitle>
          {car && (
            <div className="flex items-center gap-4 pt-2">
                <Image src={getCachedImageUrl(car.imageUrls?.[0] || '')} alt={`${car.make} ${car.model}`} width={80} height={60} className="rounded-lg object-cover"/>
                <div>
                    <SheetDescription className="font-semibold text-base text-slate-800">{car.make} {car.model}, {car.year}</SheetDescription>
                    <p className="font-bold text-lg">{formatPrice(car.price, 'USD')}</p>
                </div>
            </div>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-center space-x-1 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => setFinanceType('credit')} className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all ${financeType === 'credit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Кредит</button>
                    <button onClick={() => setFinanceType('leasing')} className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-all ${financeType === 'leasing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Лизинг</button>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <Checkbox id="currency-switch" checked={isBelarusianRubles} onCheckedChange={handleCurrencyChange} />
                    <Label htmlFor="currency-switch" className="text-sm font-medium">Расчет в белорусских рублях</Label>
                </div>

                {financeType === 'credit' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="downPaymentInput" className="text-sm">Первый взнос</Label>
                            <Input id="downPaymentInput" type="number" value={manualInputs.downPayment} onChange={(e) => handleManualInputChange('downPayment', e.target.value)} className="mt-1"/>
                            <Slider value={downPayment} onValueChange={setDownPayment} max={carPriceInCurrency * 0.8} min={carPriceInCurrency * 0.1} step={isBelarusianRubles ? 100 : 50} className="mt-2"/>
                        </div>
                        <div>
                            <Label htmlFor="loanTermInput" className="text-sm">Срок кредита (мес.)</Label>
                            <Input id="loanTermInput" type="number" value={manualInputs.loanTerm} onChange={(e) => handleManualInputChange('loanTerm', e.target.value)} className="mt-1"/>
                            <Slider value={loanTerm} onValueChange={setLoanTerm} max={84} min={12} step={1} className="mt-2"/>
                        </div>
                        <div>
                            <Label className="text-sm">Банк</Label>
                            <Select value={selectedBank?.name} onValueChange={(value) => setSelectedBank(partnerBanks.find(b => b.name === value) || null)}>
                                <SelectTrigger><SelectValue placeholder="Выберите банк" /></SelectTrigger>
                                <SelectContent>{partnerBanks.map(bank => <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="leasingAdvanceInput" className="text-sm">Аванс</Label>
                            <Input id="leasingAdvanceInput" type="number" value={manualInputs.leasingAdvance} onChange={(e) => handleManualInputChange('leasingAdvance', e.target.value)} className="mt-1"/>
                            <Slider value={leasingAdvance} onValueChange={setLeasingAdvance} max={carPriceInCurrency * 0.8} min={carPriceInCurrency * 0.1} step={isBelarusianRubles ? 100 : 50} className="mt-2"/>
                        </div>
                        <div>
                            <Label htmlFor="leasingTermInput" className="text-sm">Срок (мес.)</Label>
                            <Input id="leasingTermInput" type="number" value={manualInputs.leasingTerm} onChange={(e) => handleManualInputChange('leasingTerm', e.target.value)} className="mt-1"/>
                            <Slider value={leasingTerm} onValueChange={setLeasingTerm} max={72} min={12} step={1} className="mt-2"/>
                        </div>
                        <div>
                            <Label className="text-sm">Лизинговая компания</Label>
                            <Select value={selectedLeasingCompany?.name} onValueChange={(value) => setSelectedLeasingCompany(leasingCompanies.find(c => c.name === value) || null)}>
                                <SelectTrigger><SelectValue placeholder="Выберите компанию" /></SelectTrigger>
                                <SelectContent>{leasingCompanies.map(company => <SelectItem key={company.name} value={company.name}>{company.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="text-lg font-bold">Результат</h4>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-600">Ежемесячный платеж</span>
                    <span className="font-bold text-2xl text-blue-600">{formatPrice(financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment(), isBelarusianRubles ? 'BYN' : 'USD')}</span>
                </div>
            </div>

            <div className="space-y-4">
                 <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <div className="relative">
                        <Input id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: formatPhoneNumber(e.target.value)})} required className="pr-10" />
                        {isPhoneValid(form.phone) && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
                    </div>
                </div>
                <div>
                    <Label htmlFor="message">Комментарий</Label>
                    <Textarea id="message" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
                </div>
                 {formError && <p className="text-red-500 text-sm">{formError}</p>}
                 <p className="text-xs text-slate-500">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой обработки персональных данных</a>.</p>
                 <p className="text-xs text-slate-500">Наш менеджер свяжется с вами в течение 15 минут в рабочее время.</p>
            </div>
        </div>

        <SheetFooter className="p-4 sm:p-6 bg-white border-t sticky bottom-0">
            <SheetClose asChild><Button variant="outline">Закрыть</Button></SheetClose>
            <StatusButton onClick={handleSubmit} disabled={!isFormValid} className="w-full" state={creditButtonState.state} loadingText="Отправляем..." successText="Заявка отправлена!" errorText="Ошибка">
                Отправить заявку на {financeType === 'credit' ? 'кредит' : 'лизинг'}
            </StatusButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}