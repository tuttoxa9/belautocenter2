"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusButton } from "@/components/ui/status-button"
import { Textarea } from "@/components/ui/textarea"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { formatPrice, formatPhoneNumber, isPhoneValid } from "@/lib/utils"
import { X, Car, User, Phone, MessageSquare } from "lucide-react"

// Определяем типы для пропсов
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrls: string[];
}

interface PartnerBank {
  name: string;
  logo?: string;
  logoUrl?: string;
  rate?: number;
  minRate?: number;
  minDownPayment: number;
  maxTerm: number;
  maxLoanTerm?: number;
}

interface LeasingCompany {
  name: string;
  logoUrl?: string;
  minAdvance: number;
  maxTerm: number;
}

interface FinancialAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
  usdBynRate: number | null;
  partnerBanks: PartnerBank[];
  leasingCompanies: LeasingCompany[];
}

export default function FinancialAssistantDrawer({
  isOpen,
  onClose,
  car,
  usdBynRate,
  partnerBanks,
  leasingCompanies,
}: FinancialAssistantDrawerProps) {
  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit')
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true)

  // Состояния калькуляторов
  const [downPaymentPercent, setDownPaymentPercent] = useState(20) // Первый взнос в %
  const [loanTerm, setLoanTerm] = useState(60) // Срок кредита в месяцах
  const [advancePercent, setAdvancePercent] = useState(20) // Аванс в %
  const [leasingTerm, setLeasingTerm] = useState(36) // Срок лизинга в месяцах

  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)

  // Состояния формы
  const [form, setForm] = useState({ name: "", phone: "+375", comment: "" })

  const submitButtonState = useButtonState()
  const { showSuccess, showError } = useNotification()

  // Инициализация и сброс состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setFinanceType('credit')
      setIsBelarusianRubles(true)
      setDownPaymentPercent(20)
      setLoanTerm(60)
      setAdvancePercent(20)
      setLeasingTerm(36)
      setForm({ name: "", phone: "+375", comment: "" })

      if (partnerBanks.length > 0) {
        setSelectedBank(partnerBanks[0])
      }
      if (leasingCompanies.length > 0) {
        setSelectedLeasingCompany(leasingCompanies[0])
      }
    }
  }, [isOpen, partnerBanks, leasingCompanies])

  // Мемоизированные значения для расчетов
  const carPrice = useMemo(() => car?.price || 0, [car])
  const carPriceByn = useMemo(() => carPrice * (usdBynRate || 1), [carPrice, usdBynRate])

  const {
    downPaymentValue,
    creditAmount,
    monthlyPayment,
    overpayment,
  } = useMemo(() => {
    const price = isBelarusianRubles ? carPriceByn : carPrice
    const downPaymentValue = (price * downPaymentPercent) / 100
    const creditAmount = price - downPaymentValue

    if (!selectedBank) return { downPaymentValue, creditAmount, monthlyPayment: 0, overpayment: 0 }

    const rate = (selectedBank.rate ?? selectedBank.minRate ?? 0) / 100 / 12
    if (rate <= 0) {
        const monthlyPayment = creditAmount / loanTerm
        return { downPaymentValue, creditAmount, monthlyPayment, overpayment: 0 }
    }

    const monthlyPayment = creditAmount * (rate * Math.pow(1 + rate, loanTerm)) / (Math.pow(1 + rate, loanTerm) - 1)
    const totalRepayment = monthlyPayment * loanTerm
    const overpayment = totalRepayment - creditAmount

    return { downPaymentValue, creditAmount, monthlyPayment, overpayment }
  }, [carPrice, carPriceByn, isBelarusianRubles, downPaymentPercent, loanTerm, selectedBank])

  const {
    advanceValue,
    leasingAmount,
    leasingMonthlyPayment,
  } = useMemo(() => {
    const price = isBelarusianRubles ? carPriceByn : carPrice
    const advanceValue = (price * advancePercent) / 100
    const leasingAmount = price - advanceValue
    const leasingMonthlyPayment = leasingTerm > 0 ? leasingAmount / leasingTerm : 0

    return { advanceValue, leasingAmount, leasingMonthlyPayment }
  }, [carPrice, carPriceByn, isBelarusianRubles, advancePercent, leasingTerm])


  const handleFormChange = (field: keyof typeof form, value: string) => {
    if (field === 'phone') {
        value = formatPhoneNumber(value)
    }
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = useMemo(() => {
    return form.name.trim() !== "" && isPhoneValid(form.phone)
  }, [form])

  const handleSubmit = async () => {
    if (!isFormValid || !car) return;

    // Данные для сохранения в Firestore (более "сырые")
    const firestoreLeadData = {
      ...form,
      carId: car.id,
      carInfo: `${car.make} ${car.model}, ${car.year}`,
      type: financeType,
      status: "new",
      createdAt: new Date(),
      currency: isBelarusianRubles ? "BYN" : "USD",
      ...(financeType === 'credit' && {
        downPayment: downPaymentValue,
        creditAmount: creditAmount,
        loanTerm: loanTerm,
        monthlyPayment: monthlyPayment,
        selectedBank: selectedBank?.name || "Не выбран",
      }),
      ...(financeType === 'leasing' && {
        advance: advanceValue,
        leasingAmount: leasingAmount,
        leasingTerm: leasingTerm,
        monthlyPayment: leasingMonthlyPayment,
        selectedCompany: selectedLeasingCompany?.name || "Не выбрана",
      }),
    };

    // Данные для отправки в Telegram (отформатированные)
    const telegramLeadData = {
      ...firestoreLeadData,
      createdAt: new Date().toISOString(),
      carPrice: formatPrice(isBelarusianRubles ? carPriceByn : carPrice, isBelarusianRubles ? 'BYN' : 'USD'),
      downPayment: financeType === 'credit' ? formatPrice(downPaymentValue, isBelarusianRubles ? 'BYN' : 'USD') : undefined,
      creditAmount: financeType === 'credit' ? formatPrice(creditAmount, isBelarusianRubles ? 'BYN' : 'USD') : undefined,
      loanTerm: financeType === 'credit' ? `${loanTerm} мес.` : undefined,
      advance: financeType === 'leasing' ? formatPrice(advanceValue, isBelarusianRubles ? 'BYN' : 'USD') : undefined,
      leasingAmount: financeType === 'leasing' ? formatPrice(leasingAmount, isBelarusianRubles ? 'BYN' : 'USD') : undefined,
      leasingTerm: financeType === 'leasing' ? `${leasingTerm} мес.` : undefined,
      monthlyPayment: formatPrice(financeType === 'credit' ? monthlyPayment : leasingMonthlyPayment, isBelarusianRubles ? 'BYN' : 'USD'),
      bank: selectedBank?.name || "Не выбран",
      company: selectedLeasingCompany?.name || "Не выбрана",
    };

    await submitButtonState.execute(async () => {
      try {
        // 1. Сохраняем в Firestore
        const { collection, addDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await addDoc(collection(db, "leads"), firestoreLeadData);

        // 2. Отправляем уведомление в Telegram
        const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...telegramLeadData, type: 'financial_request' }),
        });

        if (!response.ok) throw new Error('Ошибка при отправке заявки');

        showSuccess("Спасибо! Ваша заявка принята.");
        setTimeout(() => {
          onClose();
        }, 3000);

      } catch (error) {
        showError("Произошла ошибка. Попробуйте еще раз.");
        throw error;
      }
    });
  };

  if (!car) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:max-w-[480px] md:max-w-[540px] flex flex-col p-0"
        side="right"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-200 text-left">
          <SheetTitle className="text-xl font-bold">Расчет кредита и лизинга</SheetTitle>
          <div className="flex items-center gap-4 pt-2">
            <Image
              src={getCachedImageUrl(car.imageUrls[0])}
              alt={`${car.make} ${car.model}`}
              width={80}
              height={60}
              className="rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900">{car.make} {car.model}, {car.year}</p>
              <p className="text-lg font-bold text-blue-600">{formatPrice(car.price, 'USD')}</p>
              {usdBynRate && <p className="text-sm text-slate-500">≈ {formatPrice(carPriceByn, 'BYN')}</p>}
            </div>
          </div>
          <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute top-3 right-3">
                  <X className="h-5 w-5" />
              </Button>
          </SheetClose>
        </SheetHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Finance Type Switcher */}
          <Tabs value={financeType} onValueChange={(v) => setFinanceType(v as 'credit' | 'leasing')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credit">Кредит</TabsTrigger>
              <TabsTrigger value="leasing">Лизинг</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Calculator Block */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
            {financeType === 'credit' ? (
              <div className="space-y-4">
                {/* Down Payment */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <Label>Первый взнос</Label>
                    <span className="text-lg font-semibold text-slate-800">{formatPrice(downPaymentValue, isBelarusianRubles ? 'BYN' : 'USD')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[downPaymentPercent]}
                      onValueChange={(v) => setDownPaymentPercent(v[0])}
                      min={10} max={80} step={1}
                    />
                    <div className="w-20 text-center border rounded-md p-2 bg-white">{downPaymentPercent}%</div>
                  </div>
                </div>
                {/* Loan Term */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <Label>Срок кредита</Label>
                    <span className="text-lg font-semibold text-slate-800">{loanTerm} мес.</span>
                  </div>
                  <Slider
                    value={[loanTerm]}
                    onValueChange={(v) => setLoanTerm(v[0])}
                    min={12} max={selectedBank?.maxTerm || 84} step={6}
                  />
                </div>
                {/* Bank Selection */}
                <div>
                  <Label>Банк</Label>
                  <Select value={selectedBank?.name} onValueChange={(name) => setSelectedBank(partnerBanks.find(b => b.name === name) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите банк" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerBanks.map(bank => (
                        <SelectItem key={bank.name} value={bank.name}>
                          <div className="flex items-center gap-2">
                            {bank.logo && <Image src={getCachedImageUrl(bank.logo)} alt={bank.name} width={20} height={20} />}
                            <span>{bank.name}</span>
                            <span className="ml-auto text-sm text-slate-500">{bank.rate || bank.minRate}%</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Advance Payment */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <Label>Аванс</Label>
                    <span className="text-lg font-semibold text-slate-800">{formatPrice(advanceValue, isBelarusianRubles ? 'BYN' : 'USD')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[advancePercent]}
                      onValueChange={(v) => setAdvancePercent(v[0])}
                      min={10} max={50} step={1}
                    />
                    <div className="w-20 text-center border rounded-md p-2 bg-white">{advancePercent}%</div>
                  </div>
                </div>
                {/* Leasing Term */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <Label>Срок лизинга</Label>
                    <span className="text-lg font-semibold text-slate-800">{leasingTerm} мес.</span>
                  </div>
                  <Slider
                    value={[leasingTerm]}
                    onValueChange={(v) => setLeasingTerm(v[0])}
                    min={12} max={selectedLeasingCompany?.maxTerm || 60} step={6}
                  />
                </div>
                {/* Leasing Company Selection */}
                <div>
                  <Label>Лизинговая компания</Label>
                   <Select value={selectedLeasingCompany?.name} onValueChange={(name) => setSelectedLeasingCompany(leasingCompanies.find(c => c.name === name) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите компанию" />
                    </SelectTrigger>
                    <SelectContent>
                      {leasingCompanies.map(c => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center gap-2">
                            {c.logoUrl && <Image src={getCachedImageUrl(c.logoUrl)} alt={c.name} width={20} height={20} />}
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Result Block */}
          <div className="text-center">
            <p className="text-sm text-slate-600">Ежемесячный платеж</p>
            <p className="text-4xl font-bold text-blue-600 my-1">
              {formatPrice(financeType === 'credit' ? monthlyPayment : leasingMonthlyPayment, isBelarusianRubles ? 'BYN' : 'USD')}
            </p>
            {financeType === 'credit' && (
                <p className="text-xs text-slate-500">Переплата: {formatPrice(overpayment, isBelarusianRubles ? 'BYN' : 'USD')}</p>
            )}
          </div>

          {/* Application Form Block */}
          <div className="space-y-3">
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input placeholder="Ваше имя" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} className="pl-10" />
            </div>
             <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input placeholder="Номер телефона" value={form.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className="pl-10" />
            </div>
            <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Textarea placeholder="Комментарий (необязательно)" value={form.comment} onChange={(e) => handleFormChange('comment', e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <SheetFooter className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
          <div className="w-full space-y-3">
            <StatusButton
              onClick={handleSubmit}
              disabled={!isFormValid}
              state={submitButtonState.state}
              className="w-full h-12 text-base"
            >
              Отправить заявку на {financeType === 'credit' ? 'кредит' : 'лизинг'}
            </StatusButton>
            <p className="text-xs text-slate-500 text-center">
              Нажимая кнопку, вы соглашаетесь с <a href="/privacy" target="_blank" className="underline">политикой обработки персональных данных</a>.
            </p>
            <p className="text-xs text-slate-500 text-center">
              Наш менеджер свяжется с вами в течение 15 минут в рабочее время.
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}