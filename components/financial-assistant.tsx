"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { parseFirestoreDoc } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  X,
  CheckCircle2,
} from "lucide-react"

// --- TYPE DEFINITIONS ---
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
  rate: number;
  minDownPayment: number;
  maxTerm: number;
  features: string[];
  color: string;
  minRate?: number;
  logoUrl?: string;
  maxLoanTerm?: number;
}

interface LeasingCompany {
  name: string;
  logoUrl?: string;
  minAdvance: number;
  maxTerm: number;
  interestRate?: number;
  logo?: string;
}

// --- PROPS INTERFACE ---
interface FinancialAssistantProps {
  car: Car | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Кэш для статических данных
let staticDataCache: {
  banks?: PartnerBank[]
  leasingCompanies?: LeasingCompany[]
  lastLoadTime?: number
} = {}

const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

const FinancialAssistant: React.FC<FinancialAssistantProps> = ({ car, isOpen, onOpenChange }) => {
  const isMobile = useIsMobile()
  const side = isMobile ? 'bottom' : 'right'
  const usdBynRate = useUsdBynRate()
  const { showSuccess } = useNotification()
  const creditButtonState = useButtonState()

  // --- COMPONENT STATE ---
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([])
  const [leasingCompanies, setLeasingCompanies] = useState<LeasingCompany[]>([])
  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit')

  // Calculator states
  const [downPayment, setDownPayment] = useState(0)
  const [loanTerm, setLoanTerm] = useState(60)
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)

  const [leasingAdvance, setLeasingAdvance] = useState(0)
  const [leasingTerm, setLeasingTerm] = useState(36)
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)

  // Form state
  const [form, setForm] = useState({ name: "", phone: "+375" })
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const carPriceByn = car && usdBynRate ? Math.round(car.price * usdBynRate) : 0;

  // --- DATA LOADING ---
  useEffect(() => {
    if (isOpen) {
        loadStaticData()
    }
  }, [isOpen])

  // Reset calculator values when the sheet is opened or car changes
  useEffect(() => {
    if (isOpen && car && car.price && usdBynRate) {
        // Устанавливаем значения по умолчанию при открытии
        const initialDownPayment = Math.round(carPriceByn * 0.2);
        const initialAdvance = Math.round(carPriceByn * 0.2);

        setDownPayment(initialDownPayment);
        setLoanTerm(60);

        setLeasingAdvance(initialAdvance);
        setLeasingTerm(36);

        setForm({ name: "", phone: "+375" })
        setIsFormSubmitted(false)
    }
  }, [isOpen, car, usdBynRate, carPriceByn])

  const loadStaticData = async () => {
      const now = Date.now()
      if (staticDataCache.lastLoadTime && (now - staticDataCache.lastLoadTime) < CACHE_DURATION && staticDataCache.banks && staticDataCache.leasingCompanies) {
        setPartnerBanks(staticDataCache.banks)
        setSelectedBank(staticDataCache.banks[0] || null)
        setLeasingCompanies(staticDataCache.leasingCompanies)
        setSelectedLeasingCompany(staticDataCache.leasingCompanies[0] || null)
        return
      }

      try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
        const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages`

        const [banksResponse, leasingResponse] = await Promise.all([
            fetch(`${baseUrl}/credit`),
            fetch(`${baseUrl}/leasing`),
        ])

        const banksRawData = await banksResponse.json()
        const leasingRawData = await leasingResponse.json()

        const creditPageData = parseFirestoreDoc(banksRawData);
        const leasingPageData = parseFirestoreDoc(leasingRawData);

        const banks = creditPageData.partners || [];
        const leasingCompanies = leasingPageData.leasingCompanies || leasingPageData.partners || [];

        staticDataCache = { banks, leasingCompanies, lastLoadTime: now }

        if (banks.length > 0) {
            setPartnerBanks(banks)
            setSelectedBank(banks[0])
        }
        if (leasingCompanies.length > 0) {
            setLeasingCompanies(leasingCompanies)
            setSelectedLeasingCompany(leasingCompanies[0])
        }
      } catch (error) {
        console.error("Failed to load static financial data:", error)
        setPartnerBanks([])
        setLeasingCompanies([])
      }
  }

  // --- CALCULATOR LOGIC ---
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ru-BY", {
            style: "currency",
            currency: "BYN",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const creditAmount = carPriceByn - downPayment;

    const calculateMonthlyPayment = () => {
        if (!selectedBank || creditAmount <= 0) return 0
        const principal = creditAmount;
        const rateValue = selectedBank.rate ?? selectedBank.minRate ?? 0;
        const rate = rateValue / 100 / 12
        const term = loanTerm;
        if (!rate || rate <= 0) return principal / term;
        return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    }

    const calculateLeasingPayment = () => {
        const leasingSum = carPriceByn - leasingAdvance;
        if (leasingSum <= 0) return 0;
        return leasingSum / leasingTerm;
    };

  // --- FORM HANDLING ---
  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) {
      numbers = "+375" + numbers.replace(/\D/g, "");
    }
    return "+375" + numbers.slice(4).replace(/\D/g, "").slice(0, 9)
  }

  const isPhoneValid = (phone: string) => phone.length === 13 && phone.startsWith("+375")

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'phone') {
        setForm({ ...form, [id]: formatPhoneNumber(value) });
    } else {
        setForm({ ...form, [id]: value });
    }
  };

  const isFormValid = form.name.trim() !== "" && isPhoneValid(form.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!car || !isFormValid) return;

    await creditButtonState.execute(async () => {
      const leadData = {
          ...form,
          carId: car.id,
          carInfo: `${car.make} ${car.model} ${car.year}`,
          type: financeType,
          status: "new",
          createdAt: new Date(),
          currency: "BYN",
          financeDetails: {
              carPrice: carPriceByn,
              downPayment: financeType === 'credit' ? downPayment : leasingAdvance,
              term: financeType === 'credit' ? loanTerm : leasingTerm,
              monthlyPayment: financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment(),
              partner: financeType === 'credit' ? selectedBank?.name : selectedLeasingCompany?.name,
          }
      };

      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await addDoc(collection(db, "leads"), leadData);
      } catch (error) {
        console.error("Firebase submission failed:", error);
      }

      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            carMake: car.make,
            carModel: car.model,
            carYear: car.year,
            carId: car.id,
            carPrice: formatPrice(leadData.financeDetails.carPrice),
            downPayment: formatPrice(leadData.financeDetails.downPayment),
            loanTerm: leadData.financeDetails.term,
            bank: leadData.financeDetails.partner || "Не выбран",
            financeType: financeType,
            type: financeType === 'credit' ? 'credit_request' : 'leasing_request'
        })
      });

      setIsFormSubmitted(true);
      showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена!`);
      setTimeout(() => {
        onOpenChange(false);
      }, 4000);
    })
  }

  const renderCalculator = () => {
    if (financeType === 'credit') {
        const minDownPayment = Math.round(carPriceByn * 0.1);
        const maxDownPayment = Math.round(carPriceByn * 0.9);
        return (
            <>
                {/* Первый взнос */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="downPayment">Первый взнос</Label>
                        <span className="font-semibold">{formatPrice(downPayment)}</span>
                    </div>
                    <Slider id="downPayment" value={[downPayment]} onValueChange={(val) => setDownPayment(val[0])} min={minDownPayment} max={maxDownPayment} step={100} />
                </div>
                {/* Срок кредита */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="loanTerm">Срок кредита (мес.)</Label>
                        <span className="font-semibold">{loanTerm}</span>
                    </div>
                    <Slider id="loanTerm" value={[loanTerm]} onValueChange={(val) => setLoanTerm(val[0])} min={12} max={120} step={1} />
                </div>
                {/* Банк */}
                <div>
                    <Label htmlFor="bank">Банк</Label>
                    <Select value={selectedBank?.name} onValueChange={(val) => setSelectedBank(partnerBanks.find(b => b.name === val) || null)}>
                        <SelectTrigger id="bank">
                            <SelectValue placeholder="Выберите банк" />
                        </SelectTrigger>
                        <SelectContent>
                            {partnerBanks.map(bank => <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </>
        )
    }
    if (financeType === 'leasing') {
        const minAdvance = Math.round(carPriceByn * 0.1);
        const maxAdvance = Math.round(carPriceByn * 0.6);
        return (
             <>
                {/* Аванс */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="leasingAdvance">Аванс</Label>
                        <span className="font-semibold">{formatPrice(leasingAdvance)}</span>
                    </div>
                    <Slider id="leasingAdvance" value={[leasingAdvance]} onValueChange={(val) => setLeasingAdvance(val[0])} min={minAdvance} max={maxAdvance} step={100} />
                </div>
                {/* Срок лизинга */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="leasingTerm">Срок (мес.)</Label>
                        <span className="font-semibold">{leasingTerm}</span>
                    </div>
                    <Slider id="leasingTerm" value={[leasingTerm]} onValueChange={(val) => setLeasingTerm(val[0])} min={12} max={60} step={1} />
                </div>
                {/* Лизинговая компания */}
                <div>
                    <Label htmlFor="leasingCompany">Лизинговая компания</Label>
                     <Select value={selectedLeasingCompany?.name} onValueChange={(val) => setSelectedLeasingCompany(leasingCompanies.find(c => c.name === val) || null)}>
                        <SelectTrigger id="leasingCompany">
                            <SelectValue placeholder="Выберите компанию" />
                        </SelectTrigger>
                        <SelectContent>
                             {leasingCompanies.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </>
        )
    }
    return null;
  }

  const renderResult = () => {
      const monthlyPayment = financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment();
      const partner = financeType === 'credit' ? selectedBank : selectedLeasingCompany;

      return (
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="text-center">
                  <p className="text-sm text-slate-600">Ежемесячный платеж</p>
                  <p className="text-3xl font-bold text-slate-900">{formatPrice(monthlyPayment)}</p>
              </div>
              {partner && (
                  <div className="text-xs text-slate-500 text-center border-t pt-3">
                      Условия от: <span className="font-semibold">{partner.name}</span>
                  </div>
              )}
          </div>
      )
  }

  // --- RENDER ---
  if (!car) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={`
          ${isMobile
            ? 'h-[95vh] rounded-t-2xl'
            : 'w-[480px]'
          }
          flex flex-col bg-white p-0 border-none shadow-2xl`
        }
        onEscapeKeyDown={() => onOpenChange(false)}
        onPointerDownOutside={() => onOpenChange(false)}
      >
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 border-b flex-row items-center justify-between">
          <div>
            <SheetTitle className="text-lg font-bold">Финансовый помощник</SheetTitle>
            <div className="text-sm text-slate-500 mt-1">
                {car.make} {car.model}, {car.year} - <span className="font-semibold">{formatPrice(carPriceByn)}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>

        {isFormSubmitted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Заявка принята!</h3>
                <p className="text-slate-600 mt-2">Наш менеджер свяжется с вами в течение 15 минут в рабочее время для подтверждения.</p>
            </div>
        ) : (
            <>
                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Тип финансирования */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                        <Button type="button" onClick={() => setFinanceType('credit')} variant={financeType === 'credit' ? 'secondary' : 'ghost'} className="h-9">Кредит</Button>
                        <Button type="button" onClick={() => setFinanceType('leasing')} variant={financeType === 'leasing' ? 'secondary' : 'ghost'} className="h-9">Лизинг</Button>
                    </div>

                    {/* Калькулятор */}
                    <div className="space-y-4">
                        {renderCalculator()}
                    </div>

                    {/* Результат */}
                    <div className="!mt-6">
                        {renderResult()}
                    </div>

                    {/* Форма заявки */}
                    <div className="!mt-8 space-y-4">
                        <h4 className="font-semibold text-slate-800 border-b pb-2">Оставить заявку</h4>
                        <div>
                            <Label htmlFor="name">Имя</Label>
                            <Input id="name" value={form.name} onChange={handleFormChange} required placeholder="Ваше имя" />
                        </div>
                        <div>
                            <Label htmlFor="phone">Телефон</Label>
                            <Input id="phone" value={form.phone} onChange={handleFormChange} required placeholder="+375 (XX) XXX-XX-XX" />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <SheetFooter className="p-4 sm:p-6 border-t bg-white sticky bottom-0">
                    <div className="w-full space-y-2">
                        <StatusButton
                            type="submit"
                            form="financial-assistant-form"
                            className="w-full h-12 text-base"
                            state={creditButtonState.state}
                            disabled={!isFormValid || creditButtonState.state.loading}
                            onClick={handleSubmit}
                            loadingText="Отправляем..."
                        >
                            {financeType === 'credit' ? 'Отправить заявку на кредит' : 'Отправить заявку на лизинг'}
                        </StatusButton>
                        <p className="text-xs text-slate-500 text-center">
                            Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-slate-800">политикой обработки персональных данных</a>.
                        </p>
                    </div>
                </SheetFooter>
            </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default FinancialAssistant;