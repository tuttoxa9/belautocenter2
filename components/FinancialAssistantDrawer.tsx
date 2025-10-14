"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { parseFirestoreDoc } from "@/lib/firestore-parser"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"

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
    if (rate <= 0 || term <= 0) return term > 0 ? principal / term : 0;
    return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  };

  const calculateLeasingPayment = () => {
    const advance = leasingAdvance[0];
    const term = leasingTerm[0];
    const leasingSum = carPriceInCurrency - advance - ((carPriceInCurrency * residualValue[0]) / 100);
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
    <>
      {car && (
        <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border mb-5">
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
      <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border mt-5">
        <Checkbox id="currency-switch-drawer" checked={isBelarusianRubles} onCheckedChange={handleCurrencyChange as (checked: boolean) => void} />
        <Label htmlFor="currency-switch-drawer" className="text-sm font-medium cursor-pointer">Расчет в белорусских рублях</Label>
      </div>
      <div className="space-y-4 mt-5">
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
      <div className="space-y-4 pt-5 border-t mt-6">
          <h3 className="font-semibold text-lg text-slate-900">Ваш расчет</h3>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-5">
            {/* Декоративный фон */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPHN2Zz4=')] opacity-10"></div>

            {/* Логотип банка/компании в правом верхнем углу */}
            {financeType === 'credit' && selectedBank?.logoUrl && (
              <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-md z-20">
                <Image
                  src={getCachedImageUrl(selectedBank.logoUrl)}
                  alt={selectedBank.name}
                  width={50}
                  height={30}
                  className="object-contain"
                />
              </div>
            )}
            {financeType === 'leasing' && selectedLeasingCompany?.logoUrl && (
              <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-md z-20">
                <Image
                  src={getCachedImageUrl(selectedLeasingCompany.logoUrl)}
                  alt={selectedLeasingCompany.name}
                  width={50}
                  height={30}
                  className="object-contain"
                />
              </div>
            )}

            <div className="relative space-y-4">
              {/* Главный платеж */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-300 mb-1">Ежемесячный платеж</p>
                    <p className="font-bold text-2xl sm:text-3xl text-white leading-tight">{formatPrice(financeType === 'credit' ? calculateMonthlyPayment() : calculateLeasingPayment())}</p>
                  </div>
                </div>
              </div>

              {/* Детали расчёта */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">{financeType === 'credit' ? 'Сумма кредита' : 'Сумма договора'}</p>
                  <p className="font-semibold text-sm text-white">{formatPrice(financeType === 'credit' ? creditAmountValue : carPriceInCurrency)}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Срок</p>
                  <p className="font-semibold text-sm text-white">{financeType === 'credit' ? loanTerm[0] : leasingTerm[0]} мес.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">{financeType === 'credit' ? 'Первый взнос' : 'Аванс'}</p>
                  <p className="font-semibold text-sm text-white">{formatPrice(financeType === 'credit' ? downPayment[0] : leasingAdvance[0])}</p>
                </div>

                {financeType === 'credit' && selectedBank && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Ставка</p>
                    <p className="font-semibold text-sm text-white">{selectedBank.rate || selectedBank.minRate}%</p>
                  </div>
                )}

                {financeType === 'leasing' && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Остаточная</p>
                    <p className="font-semibold text-sm text-white">{residualValue[0]}%</p>
                  </div>
                )}
              </div>

              {/* Информация о партнёре */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-1">Партнёр</p>
                <p className="text-sm font-medium text-white">
                  {financeType === 'credit' ? selectedBank?.name || 'Не выбран' : selectedLeasingCompany?.name || 'Не выбрана'}
                </p>
              </div>
            </div>
          </div>
      </div>
      <div className="space-y-4 pt-4 border-t mt-5">
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
    </>
  );

  const renderFooter = () => (
    <>
      <Button onClick={handleCreditSubmit} className="w-full h-12 text-base" disabled={!isPhoneValid(creditForm.phone) || !creditForm.name || creditButtonState.isLoading}>
          {creditButtonState.isLoading ? 'Отправка...' : `Отправить заявку на ${financeType === 'credit' ? 'кредит' : 'лизинг'}`}
      </Button>
      <p className="text-xs text-slate-500 mt-3 text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-blue-600">политикой обработки персональных данных</a>.</p>
    </>
  );

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={renderFooter()}
    >
      {renderContent()}
    </UniversalDrawer>
  );
}
