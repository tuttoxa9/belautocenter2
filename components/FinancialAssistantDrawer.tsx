"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { parseFirestoreDoc } from "@/lib/firestore-parser"

// --- TYPES ---
interface PartnerBank {
  id: number; name: string; logo: string; rate: number; minRate?: number;
  minDownPayment: number; maxTerm: number; maxLoanTerm?: number; features: string[];
  color: string; logoUrl?: string;
}

interface LeasingCompany {
  name: string; logoUrl?: string; minAdvance: number; maxTerm: number;
  interestRate?: number; logo?: string;
}

interface CarData {
  id: string; make: string; model: string; year: number; price: number; imageUrls: string[];
}

interface FinancialAssistantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: CarData | null;
}

// --- CACHE ---
let staticDataCache: {
  banks?: PartnerBank[]; leasingCompanies?: LeasingCompany[]; lastLoadTime?: number;
} = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function FinancialAssistantDrawer({ open, onOpenChange, car }: FinancialAssistantDrawerProps) {
  const isMobile = useIsMobile();
  const usdBynRate = useUsdBynRate();
  const { showSuccess } = useNotification();
  const creditButtonState = useButtonState();

  // --- COMPONENT STATE ---
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [leasingCompanies, setLeasingCompanies] = useState<LeasingCompany[]>([]);
  const [loadingLeasing, setLoadingLeasing] = useState(true);
  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit');
  const [downPayment, setDownPayment] = useState([0]);
  const [loanTerm, setLoanTerm] = useState([60]);
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null);
  const [leasingAdvance, setLeasingAdvance] = useState([0]);
  const [leasingTerm, setLeasingTerm] = useState([36]);
  const [residualValue, setResidualValue] = useState([20]);
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null);
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true);
  const [creditForm, setCreditForm] = useState({ name: "", phone: "+375", message: "" });

  // --- DATA LOADING ---
  useEffect(() => {
    loadStaticData();
  }, []);

  useEffect(() => {
    if (open && car?.price) {
      const price = car.price;
      const rate = usdBynRate || 1;
      if (isBelarusianRubles) {
        setDownPayment([Math.round(price * 0.2 * rate)]);
        setLeasingAdvance([Math.round(price * 0.2 * rate)]);
      } else {
        setDownPayment([Math.round(price * 0.2)]);
        setLeasingAdvance([Math.round(price * 0.2)]);
      }
      setLoanTerm([60]);
      setLeasingTerm([36]);
      setResidualValue([20]);
    }
  }, [open, car, isBelarusianRubles, usdBynRate]);

  const loadStaticData = async () => {
    const now = Date.now();
    if (staticDataCache.lastLoadTime && (now - staticDataCache.lastLoadTime) < CACHE_DURATION) {
      setPartnerBanks(staticDataCache.banks || []);
      setSelectedBank(staticDataCache.banks?.[0] || null);
      setLeasingCompanies(staticDataCache.leasingCompanies || []);
      setSelectedLeasingCompany(staticDataCache.leasingCompanies?.[0] || null);
      setLoadingBanks(false);
      setLoadingLeasing(false);
      return;
    }
    setLoadingBanks(true);
    setLoadingLeasing(true);
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages`;
      const [banksResponse, leasingResponse] = await Promise.all([
        fetch(`${baseUrl}/credit`),
        fetch(`${baseUrl}/leasing`),
      ]);
      const banksRawData = await banksResponse.json();
      const leasingRawData = await leasingResponse.json();
      const creditPageData = parseFirestoreDoc(banksRawData);
      const leasingPageData = parseFirestoreDoc(leasingRawData);
      const banks = creditPageData.partners || [];
      const leasing = leasingPageData.leasingCompanies || leasingPageData.partners || [];

      staticDataCache = { banks, leasingCompanies: leasing, lastLoadTime: now };
      setPartnerBanks(banks);
      setLeasingCompanies(leasing);
      if (banks.length > 0) setSelectedBank(banks[0]);
      if (leasing.length > 0) setSelectedLeasingCompany(leasing[0]);
    } catch (error) {
      console.error("Error loading finance data:", error);
    } finally {
      setLoadingBanks(false);
      setLoadingLeasing(false);
    }
  };

  // --- DERIVED VALUES & CALCULATIONS ---
  const carPriceInCurrency = car ? (isBelarusianRubles && usdBynRate ? car.price * usdBynRate : car.price) : 0;
  const creditAmountValue = Math.max(0, carPriceInCurrency - downPayment[0]);

  const calculateMonthlyPayment = () => {
    if (!selectedBank) return 0;
    const principal = creditAmountValue;
    const rateValue = selectedBank.rate ?? selectedBank.minRate ?? 0;
    const rate = rateValue / 100 / 12;
    const term = loanTerm[0];
    if (rate <= 0) return term > 0 ? principal / term : 0;
    return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  };

  const calculateLeasingPayment = () => {
    const advance = leasingAdvance[0];
    const term = leasingTerm[0];
    const residualVal = (carPriceInCurrency * residualValue[0]) / 100;
    const leasingSum = carPriceInCurrency - advance - residualVal;
    return term > 0 ? leasingSum / term : 0;
  };

  // --- HANDLERS ---
  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d+]/g, "");
    return `+375${numbers.slice(4, 13)}`;
  };

  const isPhoneValid = (phone: string) => phone.length === 13;

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    await creditButtonState.execute(async () => {
      const payload = {
        ...creditForm, carId: car.id, carInfo: `${car.make} ${car.model} ${car.year}`,
        type: financeType, status: "new", createdAt: new Date(),
        downPayment: financeType === 'credit' ? downPayment[0] : leasingAdvance[0],
        loanTerm: financeType === 'credit' ? loanTerm[0] : leasingTerm[0],
        selectedBank: selectedBank?.name ?? "",
        selectedLeasingCompany: selectedLeasingCompany?.name ?? "",
        monthlyPayment: financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment(),
        currency: isBelarusianRubles ? "BYN" : "USD", financeType: financeType,
        creditAmount: creditAmountValue,
      };
      // Intentionally not awaiting these for faster UI response
      fetch('/api/send-telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, type: `${financeType}_request`}) });
      import('firebase/firestore').then(({collection, addDoc, db}) => addDoc(collection(db, "leads"), payload));

      onOpenChange(false);
      setCreditForm({ name: "", phone: "+375", message: "" });
      showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена!`);
    });
  };

  // --- UI RENDER ---
  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(price) + (isBelarusianRubles ? ' BYN' : ' $');
  const title = "Расчет кредита и лизинга";
  const carName = car ? `${car.make} ${car.model} ${car.year}` : "";
  const carImage = car?.imageUrls?.[0] ? getCachedImageUrl(car.imageUrls[0]) : "/placeholder.svg";

  const renderContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {car && (
          <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border">
            <Image src={carImage} alt={carName} width={80} height={60} className="rounded-lg object-cover" />
            <div>
              <p className="font-bold text-slate-900">{carName}</p>
              <p className="text-slate-800 font-semibold">{new Intl.NumberFormat("ru-RU").format(car.price)} $</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center space-x-1 bg-slate-100 rounded-full p-1">
          {(['credit', 'leasing'] as const).map(type => (
            <button key={type} onClick={() => setFinanceType(type)}
              className={`flex-1 text-sm font-semibold py-2 px-4 rounded-full transition-all ${financeType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}>
              {type === 'credit' ? 'Кредит' : 'Лизинг'}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border">
          <Checkbox id="currency-switch-drawer" checked={isBelarusianRubles} onCheckedChange={handleCurrencyChange as (checked: boolean) => void} />
          <Label htmlFor="currency-switch-drawer" className="text-sm font-medium cursor-pointer">Расчет в белорусских рублях</Label>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-slate-800">Калькулятор</h3>
          {financeType === 'credit' ? (
            <div className="space-y-5">
              <div>
                <Label className="flex justify-between"><span>Первый взнос</span> <span>{formatPrice(downPayment[0])}</span></Label>
                <Slider value={downPayment} onValueChange={setDownPayment} max={carPriceInCurrency * 0.8} step={100} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Срок кредита</span> <span>{loanTerm[0]} мес.</span></Label>
                <Slider value={loanTerm} onValueChange={setLoanTerm} max={120} min={12} step={1} className="mt-2" />
              </div>
              <div>
                <Label>Банк-партнер</Label>
                <Select value={selectedBank?.name} onValueChange={v => setSelectedBank(partnerBanks.find(b => b.name === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Выберите банк" /></SelectTrigger>
                  <SelectContent>{loadingBanks ? <SelectItem value="loading" disabled>Загрузка...</SelectItem> : partnerBanks.map(b => <SelectItem key={b.id} value={b.name}>{b.name} - от {b.rate || b.minRate}%</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          ) : (
             <div className="space-y-5">
              <div>
                <Label className="flex justify-between"><span>Авансовый платеж</span> <span>{formatPrice(leasingAdvance[0])}</span></Label>
                <Slider value={leasingAdvance} onValueChange={setLeasingAdvance} max={carPriceInCurrency * 0.8} step={100} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Срок лизинга</span> <span>{leasingTerm[0]} мес.</span></Label>
                <Slider value={leasingTerm} onValueChange={setLeasingTerm} max={84} min={12} step={1} className="mt-2" />
              </div>
               <div>
                <Label className="flex justify-between"><span>Остаточная стоимость</span> <span>{residualValue[0]}%</span></Label>
                <Slider value={residualValue} onValueChange={setResidualValue} max={50} min={1} step={1} className="mt-2" />
              </div>
              <div>
                <Label>Лизинговая компания</Label>
                 <Select value={selectedLeasingCompany?.name} onValueChange={v => setSelectedLeasingCompany(leasingCompanies.find(c => c.name === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Выберите компанию" /></SelectTrigger>
                  <SelectContent>{loadingLeasing ? <SelectItem value="loading" disabled>Загрузка...</SelectItem> : leasingCompanies.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg text-slate-800">Ваш расчет</h3>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                 <div className="flex justify-between items-baseline">
                    <span className="text-slate-600 text-sm">Ежемесячный платеж</span>
                    <span className="font-bold text-2xl text-blue-600">{formatPrice(financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment())}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{financeType === 'credit' ? 'Сумма кредита' : 'Сумма договора'}</span>
                    <span className="font-semibold text-slate-800">{formatPrice(financeType === 'credit' ? creditAmountValue : carPriceInCurrency)}</span>
                 </div>
            </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg text-slate-800">Оформить заявку</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="drawer-name">Имя</Label>
              <Input id="drawer-name" value={creditForm.name} onChange={e => setCreditForm({...creditForm, name: e.target.value})} placeholder="Ваше имя" required />
            </div>
            <div>
              <Label htmlFor="drawer-phone">Телефон</Label>
              <Input id="drawer-phone" type="tel" value={creditForm.phone} onChange={e => setCreditForm({...creditForm, phone: formatPhoneNumber(e.target.value)})} placeholder="+375 (XX) XXX-XX-XX" required />
            </div>
             <div>
              <Label htmlFor="drawer-comment">Комментарий</Label>
              <Input id="drawer-comment" value={creditForm.message} onChange={e => setCreditForm({...creditForm, message: e.target.value})} placeholder="Дополнительная информация (необязательно)" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
        <Button onClick={handleCreditSubmit} className="w-full h-12 text-base" disabled={!isPhoneValid(creditForm.phone) || !creditForm.name || creditButtonState.isLoading}>
            {creditButtonState.isLoading ? 'Отправка...' : `Отправить заявку на ${financeType === 'credit' ? 'кредит' : 'лизинг'}`}
        </Button>
        <p className="text-xs text-slate-500 mt-3 text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-blue-600">политикой обработки персональных данных</a>.</p>
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[480px] sm:max-w-[540px] p-0 flex flex-col">
          <SheetHeader className="p-4 sm:p-6 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {renderContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="text-left"><DrawerTitle>{title}</DrawerTitle></DrawerHeader>
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}