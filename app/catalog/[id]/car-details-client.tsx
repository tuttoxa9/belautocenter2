"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { parseFirestoreDoc } from "@/lib/firestore-parser"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useSettings } from "@/hooks/use-settings"
import { FinancialAssistantDrawer } from "@/components/FinancialAssistantDrawer"
import {
  Gauge,
  Fuel,
  Settings,
  Car,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Building2,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  Check
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import MarkdownRenderer from "@/components/markdown-renderer"
import { preloadImages } from "@/lib/image-preloader"

let staticDataCache: {
  banks?: PartnerBank[]
  leasingCompanies?: LeasingCompany[]
  contactPhones?: { main?: string, additional?: string }
  lastLoadTime?: number
} = {}

const CACHE_DURATION = 5 * 60 * 1000

const CarNotFoundComponent = ({ contactPhone, contactPhone2 }: { contactPhone: string, contactPhone2?: string }) => {
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = !isLoading && settings?.main?.showroomInfo?.phone
    ? settings.main.showroomInfo.phone
    : '';

  const phoneNumber2 = !isLoading && settings?.main?.showroomInfo?.phone2
    ? settings.main.showroomInfo.phone2
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Автомобиль не найден</h1>
          <p className="text-slate-600 mb-6">
            К сожалению, автомобиль с указанным ID не существует или произошла ошибка при загрузке данных.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Нужна помощь?</h3>
          <p className="text-slate-600 mb-4">Свяжитесь с нами для получения информации об автомобилях</p>
          {isLoading || isSettingsLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-blue-600">
              {phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
                    {phoneNumber}
                  </a>
                </div>
              )}
              {phoneNumber2 && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${phoneNumber2.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
                    {phoneNumber2}
                  </a>
                </div>
              )}
              {!phoneNumber && !phoneNumber2 && (
                <>
                  {contactPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
                        {contactPhone}
                      </a>
                    </div>
                  )}
                  {contactPhone2 && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <a href={`tel:${contactPhone2.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
                        {contactPhone2}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => window.location.href = '/catalog'}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        >
          Перейти к каталогу
        </Button>
      </div>
    </div>
  );
};

interface Car {
  id: string; make: string; model: string; year: number; price: number; currency: string; mileage: number; engineVolume: number; fuelType: string; transmission: string; driveTrain: string; bodyType: string; color: string; description: string; imageUrls: string[]; isAvailable: boolean; features: string[]; specifications: Record<string, string>; tiktok_url?: string; youtube_url?: string;
}
interface PartnerBank {
  id: number; name: string; logo: string; rate: number; minDownPayment: number; maxTerm: number; features: string[]; color: string;
}
interface LeasingCompany {
  name: string; logoUrl?: string; minAdvance: number; maxTerm: number; interestRate?: number;
}
interface CarDetailsClientProps {
  carId: string;
}

export default function CarDetailsClient({ carId }: CarDetailsClientProps) {
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [contactPhone, setContactPhone] = useState<string>("")
  const [contactPhone2, setContactPhone2] = useState<string>("")
  const [carNotFound, setCarNotFound] = useState(false)
  const usdBynRate = useUsdBynRate()
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [isCreditOpen, setIsCreditOpen] = useState(false)
  const [isFinancialAssistantOpen, setFinancialAssistantOpen] = useState(false)
  const [creditForm, setCreditForm] = useState({ name: "", phone: "+375", message: "" })
  const [isCreditFormOpen, setIsCreditFormOpen] = useState(false)
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [leasingCompanies, setLeasingCompanies] = useState<LeasingCompany[]>([])
  const [loadingLeasing, setLoadingLeasing] = useState(true)
  const [financeType, setFinanceType] = useState<'credit' | 'leasing'>('credit')
  const [creditAmount, setCreditAmount] = useState([75000])
  const [downPayment, setDownPayment] = useState([20000])
  const [loanTerm, setLoanTerm] = useState([60])
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)
  const [leasingAmount, setLeasingAmount] = useState([75000])
  const [leasingAdvance, setLeasingAdvance] = useState([15000])
  const [leasingTerm, setLeasingTerm] = useState([36])
  const [residualValue, setResidualValue] = useState([20])
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const galleryScrollRef = useRef<HTMLDivElement>(null)
  const creditButtonState = useButtonState()
  const { showSuccess } = useNotification()
  const { settings } = useSettings()

  useEffect(() => {
    if (carId) {
      loadCarData(carId)
      setCurrentImageIndex(0)
    }
  }, [carId])

  useEffect(() => {
    loadStaticData()
  }, [])

  useEffect(() => {
    if (isCreditOpen && car && car.price) {
      const price = car.price
      if (isBelarusianRubles && usdBynRate) {
        setCreditAmount([Math.round(price * 0.8 * usdBynRate)])
        setDownPayment([Math.round(price * 0.2 * usdBynRate)])
        setLeasingAmount([Math.round(price * usdBynRate)])
        setLeasingAdvance([Math.round(price * 0.2 * usdBynRate)])
      } else {
        setCreditAmount([price * 0.8])
        setDownPayment([price * 0.2])
        setLeasingAmount([price])
        setLeasingAdvance([price * 0.2])
      }
      setLoanTerm([60])
      setLeasingTerm([36])
      setResidualValue([20])
    }
  }, [isCreditOpen, car, isBelarusianRubles, usdBynRate])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullscreenOpen) return
      switch (event.key) {
        case 'Escape': setIsFullscreenOpen(false); break
        case 'ArrowLeft': event.preventDefault(); if (car?.imageUrls && car.imageUrls.length > 1) { setFullscreenImageIndex((prev) => (prev - 1 + car.imageUrls.length) % car.imageUrls.length) }; break
        case 'ArrowRight': event.preventDefault(); if (car?.imageUrls && car.imageUrls.length > 1) { setFullscreenImageIndex((prev) => (prev + 1) % car.imageUrls.length) }; break
      }
    }
    if (isFullscreenOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isFullscreenOpen, car?.imageUrls])

  const navigateToImage = (index: number) => {
    if (!car?.imageUrls || car.imageUrls.length === 0) return;
    const clampedIndex = Math.max(0, Math.min(index, car.imageUrls.length - 1));
    setCurrentImageIndex(clampedIndex);
    if (galleryScrollRef.current) {
      const containerWidth = galleryScrollRef.current.clientWidth;
      const targetScrollLeft = clampedIndex * containerWidth;
      galleryScrollRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  };

  const navigatePrevious = () => {
    if (!car?.imageUrls || car.imageUrls.length <= 1) return;
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : car.imageUrls.length - 1;
    navigateToImage(newIndex);
  };

  const navigateNext = () => {
    if (!car?.imageUrls || car.imageUrls.length <= 1) return;
    const newIndex = currentImageIndex < car.imageUrls.length - 1 ? currentImageIndex + 1 : 0;
    navigateToImage(newIndex);
  };

  const handleScroll = () => {
    if (!galleryScrollRef.current || !car?.imageUrls) return;
    const containerWidth = galleryScrollRef.current.clientWidth;
    const scrollLeft = galleryScrollRef.current.scrollLeft;
    const newIndex = Math.round(scrollLeft / containerWidth);
    if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < car.imageUrls.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  const loadStaticData = async () => {
    try {
      const now = Date.now()
      if (staticDataCache.lastLoadTime && (now - staticDataCache.lastLoadTime) < CACHE_DURATION && staticDataCache.banks && staticDataCache.leasingCompanies && staticDataCache.contactPhones) {
        setPartnerBanks(staticDataCache.banks)
        setSelectedBank(staticDataCache.banks[0] || null)
        setLeasingCompanies(staticDataCache.leasingCompanies)
        setSelectedLeasingCompany(staticDataCache.leasingCompanies[0] || null)
        setContactPhone(staticDataCache.contactPhones.main || "+375 29 123-45-67")
        setContactPhone2(staticDataCache.contactPhones.additional || "")
        return
      }
      setLoadingBanks(true); setLoadingLeasing(true);
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages`
      const endpoints = { banks: `${baseUrl}/credit`, leasing: `${baseUrl}/leasing`, contacts: `${baseUrl}/contacts` }
      const [banksResponse, leasingResponse, contactsResponse] = await Promise.all([
        fetch(endpoints.banks, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Direct-Firestore/1.0' } }),
        fetch(endpoints.leasing, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Direct-Firestore/1.0' } }),
        fetch(endpoints.contacts, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Direct-Firestore/1.0' } })
      ])
      const banksRawData = await banksResponse.json(); const leasingRawData = await leasingResponse.json(); const contactsRawData = await contactsResponse.json()
      const creditPageData = parseFirestoreDoc(banksRawData); const leasingPageData = parseFirestoreDoc(leasingRawData); const contacts = parseFirestoreDoc(contactsRawData);
      const banks = creditPageData.partners || []; const leasingCompanies = leasingPageData.leasingCompanies || leasingPageData.partners || [];
      staticDataCache = { banks, leasingCompanies, contactPhones: { main: contacts.phone || "+375 29 123-45-67", additional: contacts.phone2 || "" }, lastLoadTime: now }
      if (banks && banks.length > 0) { setPartnerBanks(banks); setSelectedBank(banks[0]) } else { setPartnerBanks([]) }
      if (leasingCompanies && leasingCompanies.length > 0) { setLeasingCompanies(leasingCompanies); setSelectedLeasingCompany(leasingCompanies[0]) } else { setLeasingCompanies([]) }
      setContactPhone(staticDataCache.contactPhones.main); setContactPhone2(staticDataCache.contactPhones.additional)
    } catch (error) {
      console.error("Failed to load static data:", error);
      setPartnerBanks([]); setLeasingCompanies([]); setContactPhone("+375 29 123-45-67"); setContactPhone2("")
    } finally {
      setLoadingBanks(false); setLoadingLeasing(false);
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`
      const response = await fetch(firestoreUrl, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'NextJS-Direct-Firestore/1.0' } })
      let carData = null
      if (response.ok) {
        const doc = await response.json(); carData = parseFirestoreDoc(doc)
      }
      if (carData) {
        const cleanCarData = JSON.parse(JSON.stringify(carData)); setCar(cleanCarData as Car); setCarNotFound(false)
        if (cleanCarData.imageUrls && cleanCarData.imageUrls.length > 1) { preloadImages(cleanCarData.imageUrls.slice(0, 3)) }
        const price = cleanCarData.price || 95000; setCreditAmount([price * 0.8]); setDownPayment([price * 0.2])
      } else {
        setCarNotFound(true); setCar(null)
      }
    } catch (error) {
      console.error("Failed to load car data:", error);
      setCarNotFound(true); setCar(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currencyType?: 'USD' | 'BYN') => {
    if (currencyType === 'BYN' || (currencyType === undefined && isBelarusianRubles)) {
      return new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(price)
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)
  }

  const getCreditMinValue = () => { return isBelarusianRubles ? 3000 : 1000 }
  const getCreditMaxValue = () => { if (isBelarusianRubles && usdBynRate) { return car && car.price ? car.price * usdBynRate : 200000 }; return car && car.price ? car.price : 200000 }
  const getCurrentCreditAmount = () => { return creditAmount[0] }
  const getCurrentDownPayment = () => { return downPayment[0] }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)
    if (!car || !car.price || !usdBynRate) return
    if (checked) {
      setCreditAmount([Math.round(car.price * 0.8 * usdBynRate)]); setDownPayment([Math.round(car.price * 0.2 * usdBynRate)]); setLeasingAmount([Math.round(car.price * usdBynRate)]); setLeasingAdvance([Math.round(car.price * 0.2 * usdBynRate)])
    } else {
      setCreditAmount([car.price * 0.8]); setDownPayment([car.price * 0.2]); setLeasingAmount([car.price]); setLeasingAdvance([car.price * 0.2])
    }
  }

  const formatMileage = (mileage: number) => { return new Intl.NumberFormat("ru-BY").format(mileage) }
  const formatEngineVolume = (volume: number) => { return volume.toFixed(1) }
  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, ""); if (!numbers.startsWith("+375")) { numbers = "+375" }; const prefix = "+375"; const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9); return prefix + afterPrefix
  }
  const isPhoneValid = (phone: string) => { return phone.length === 13 && phone.startsWith("+375") }

  const calculateMonthlyPayment = () => {
    if (!selectedBank) return 0; const principal = getCurrentCreditAmount(); const rateValue = selectedBank.rate !== undefined ? selectedBank.rate : selectedBank.minRate !== undefined ? selectedBank.minRate : 0; const rate = rateValue / 100 / 12; const term = loanTerm[0]; if (!rate || rate <= 0) return principal / term; const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1); return monthlyPayment
  }

  const calculateLeasingPayment = () => {
    const carPrice = isBelarusianRubles && usdBynRate ? (car && car.price ? car.price * usdBynRate : 0) : (car && car.price ? car.price : 0); const advance = isBelarusianRubles && usdBynRate ? leasingAdvance[0] : leasingAdvance[0]; const term = leasingTerm[0]; const residualVal = (carPrice * residualValue[0]) / 100; const leasingSum = carPrice - advance - residualVal; return leasingSum / term
  }

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await creditButtonState.execute(async () => {
      try {
        const { collection, addDoc } = await import('firebase/firestore'); const { db } = await import('@/lib/firebase')
        await addDoc(collection(db, "leads"), {
          ...creditForm, carId: carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: financeType, status: "new", createdAt: new Date(), creditAmount: getCurrentCreditAmount(), downPayment: getCurrentDownPayment(), loanTerm: loanTerm[0], selectedBank: selectedBank ? selectedBank.name : "", monthlyPayment: calculateMonthlyPayment(), currency: isBelarusianRubles ? "BYN" : "USD", financeType: financeType
        })
      } catch (error) {
        console.error("Failed to save lead to Firestore:", error);
      }
      await fetch('/api/send-telegram', {
        method: 'POST', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          name: creditForm.name, phone: creditForm.phone, message: creditForm.message, carMake: car && car.make ? car.make : '', carModel: car && car.model ? car.model : '', carYear: car && car.year ? car.year : '', carId: carId, carPrice: isBelarusianRubles ? formatPrice(getCurrentCreditAmount() + getCurrentDownPayment(), 'BYN') : formatPrice(car?.price || 0, 'USD'), downPayment: isBelarusianRubles ? formatPrice(getCurrentDownPayment(), 'BYN') : formatPrice(getCurrentDownPayment() / (usdBynRate || 1), 'USD'), loanTerm: loanTerm[0], bank: selectedBank ? selectedBank.name : "Не выбран", financeType: financeType, type: financeType === 'credit' ? 'credit_request' : 'leasing_request'
        })
      })
      setIsCreditFormOpen(false); setCreditForm({ name: "", phone: "+375", message: "" }); showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена! Мы рассмотрим ее и свяжемся с вами в ближайшее время.`)
    })
  }

  if (carNotFound) {
    return <CarNotFoundComponent contactPhone={contactPhone} contactPhone2={contactPhone2} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-1 sm:px-2 lg:px-4 py-4 sm:py-6 max-w-7xl">
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
            <li><button onClick={() => router.push('/')} className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100">Главная</button></li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li><button onClick={() => router.push('/catalog')} className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100">Каталог</button></li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li className="text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded-md">{loading ? <div className="h-4 bg-slate-300 rounded w-20 animate-pulse inline-block"></div> : `${car?.make || ''} ${car?.model || ''}`}</li>
          </ol>
        </nav>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div>
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 p-3 sm:p-6">
              <div className="flex items-start justify-between gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    {loading ? <div className="h-8 sm:h-10 lg:h-12 bg-slate-300 rounded w-48 animate-pulse"></div> : <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{car?.make} {car?.model}</h1>}
                    <div className="self-start sm:self-auto">{loading ? <div className="h-6 sm:h-7 bg-slate-300 rounded-full w-16 animate-pulse"></div> : car?.isAvailable ? <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">В наличии</div> : <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">Продан</div>}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-600">
                    {loading ? (<><div className="h-6 bg-slate-300 rounded-lg w-12 animate-pulse"></div><div className="h-6 bg-slate-300 rounded-lg w-16 animate-pulse"></div><div className="h-6 bg-slate-300 rounded-lg w-14 animate-pulse"></div></>) : (<><span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.year}</span><span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.color}</span><span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.bodyType}</span></>)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {loading ? (<><div className="h-6 sm:h-8 lg:h-9 bg-slate-300 rounded w-24 mb-1 animate-pulse ml-auto"></div><div className="h-4 sm:h-5 lg:h-6 bg-slate-300 rounded w-20 animate-pulse ml-auto"></div><div className="h-3 sm:h-4 bg-slate-300 rounded w-16 mt-1 animate-pulse ml-auto"></div></>) : (<>
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 leading-tight">{car?.price ? formatPrice(car.price) : 'Цена по запросу'}</div>
                    {usdBynRate && car?.price && <div className="text-sm sm:text-base lg:text-lg font-semibold text-slate-600">≈ {new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(car.price * usdBynRate)}</div>}
                    <div className="text-xs sm:text-sm text-slate-500 mt-1">от {car?.price ? formatPrice(Math.round(car.price * 0.8 / 60)) : '0'}/мес</div>
                  </>)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-8 lg:border-r border-slate-200/50">
                <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-lg sm:rounded-xl mx-1 sm:mx-2 lg:mx-3 my-1 sm:my-2 lg:my-3 overflow-hidden">
                  {loading ? <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 bg-slate-300 rounded-full animate-pulse"></div></div> : (
                    <>
                      <div ref={galleryScrollRef} onScroll={handleScroll} className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                        <div className="flex h-full" style={{ width: `${(car?.imageUrls?.length || 1) * 100}%` }}>
                          {car?.imageUrls?.map((url, index) => (<div key={index} className="h-full flex-shrink-0 relative cursor-pointer" style={{ width: `${100 / (car?.imageUrls?.length || 1)}%` }} onClick={() => { setCurrentImageIndex(index); setFullscreenImageIndex(index); setIsFullscreenOpen(true) }}><Image src={getCachedImageUrl(url)} alt={`${car?.make} ${car?.model} - фото ${index + 1}`} fill className="object-contain" priority={index === 0} quality={80} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px" /></div>)) || [<div key="placeholder" className="h-full flex-shrink-0 relative cursor-pointer w-full" onClick={() => { setCurrentImageIndex(0); setFullscreenImageIndex(0); setIsFullscreenOpen(true) }}><Image src="/placeholder.svg" alt={`${car?.make} ${car?.model}`} fill className="object-contain" priority quality={80} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px" /></div>]}
                        </div>
                      </div>
                      {car?.imageUrls && car.imageUrls.length >= 1 && <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"><button onClick={() => { setFullscreenImageIndex(currentImageIndex); setIsFullscreenOpen(true) }} className="w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Открыть в полноэкранном режиме"><svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button></div>}
                      {car?.imageUrls && car.imageUrls.length > 1 && <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-3"><button onClick={(e) => { e.stopPropagation(); navigatePrevious() }} className="w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Предыдущее фото"><ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></button><div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm font-medium">{currentImageIndex + 1} из {car.imageUrls.length}</div><button onClick={(e) => { e.stopPropagation(); navigateNext() }} className="w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Следующее фото"><ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></button></div>}
                    </>
                  )}
                </div>
                {(car?.tiktok_url || car?.youtube_url) && (
                  <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-200/50 lg:border-b-0 lg:border-t lg:border-slate-200/50">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Видеообзоры</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {car.tiktok_url && <a href={car.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 bg-black text-white rounded-xl font-semibold transition-colors duration-200 hover:bg-gray-800"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.10-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg><span>Обзор в Tik Tok</span></a>}
                      {car.youtube_url && <a href={car.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200 hover:bg-red-700"><svg className="w-6 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg><span>Обзор в YouTube</span></a>}
                    </div>
                  </div>
                )}
                <div className="hidden lg:block p-6 bg-slate-50/50 border-slate-200/50">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Описание</h4>
                  <div className="bg-white rounded-xl p-4 border border-slate-200/50">{loading ? <div className="space-y-2"><div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div></div> : car?.description ? <MarkdownRenderer content={car.description} className="text-sm leading-relaxed" /> : <p className="text-slate-500 italic text-sm">Описание отсутствует</p>}</div>
                </div>
              </div>
              <div className="lg:hidden p-3 sm:p-4 bg-slate-50/50 border-b border-slate-200/50">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Описание</h4>
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/50">{loading ? <div className="space-y-2"><div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div></div> : car?.description ? <MarkdownRenderer content={car.description} className="text-sm leading-relaxed" /> : <p className="text-slate-500 italic text-sm">Описание отсутствует</p>}</div>
              </div>
              <div className="lg:col-span-4">
                <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  <div>
                    <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-3 lg:mb-4">Характеристики</h3>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <div className="relative bg-gradient-to-br from-blue-50 via-slate-50 to-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50 overflow-hidden"><div className="absolute top-2 right-2 opacity-10"><Gauge className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" /></div><div className="relative z-10"><div className="text-xs text-slate-500 font-medium mb-1">Пробег</div>{loading ? <div className="h-5 lg:h-7 bg-slate-300 rounded w-20 animate-pulse"></div> : <div className="text-sm lg:text-lg font-bold text-slate-900">{formatMileage(car?.mileage || 0)} км</div>}</div></div>
                      <div className="relative bg-gradient-to-br from-green-50 via-slate-50 to-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50 overflow-hidden"><div className="absolute top-2 right-2 opacity-10"><Fuel className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" /></div><div className="relative z-10"><div className="text-xs text-slate-500 font-medium mb-1">Двигатель</div>{loading ? <div className="h-5 lg:h-7 bg-slate-300 rounded w-16 animate-pulse"></div> : <div className="text-sm lg:text-lg font-bold text-slate-900">{car?.fuelType === "Электро" ? car.fuelType : `${formatEngineVolume(car?.engineVolume || 0)}л ${car?.fuelType}`}</div>}</div></div>
                      <div className="relative bg-gradient-to-br from-purple-50 via-slate-50 to-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50 overflow-hidden"><div className="absolute top-2 right-2 opacity-10"><Settings className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" /></div><div className="relative z-10"><div className="text-xs text-slate-500 font-medium mb-1">КПП</div>{loading ? <div className="h-5 lg:h-7 bg-slate-300 rounded w-12 animate-pulse"></div> : <div className="text-sm lg:text-lg font-bold text-slate-900">{car?.transmission}</div>}</div></div>
                      <div className="relative bg-gradient-to-br from-orange-50 via-slate-50 to-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50 overflow-hidden"><div className="absolute top-2 right-2 opacity-10"><Car className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" /></div><div className="relative z-10"><div className="text-xs text-slate-500 font-medium mb-1">Привод</div>{loading ? <div className="h-5 lg:h-7 bg-slate-300 rounded w-14 animate-pulse"></div> : <div className="text-sm lg:text-lg font-bold text-slate-900">{car?.driveTrain}</div>}</div></div>
                    </div>
                  </div>
                  {loading ? <div><h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Комплектация</h4><div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/50"><div className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-300 rounded-full animate-pulse flex-shrink-0"></div><div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div></div>)}</div></div> : car?.features && car.features.length > 0 && <div><h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Комплектация</h4><div className="space-y-2">{car.features.map((feature, index) => <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/50"><div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" /></div><span className="text-slate-700 font-medium text-xs sm:text-sm">{feature}</span></div>)}</div></div>}
                  {loading ? <div><h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Технические данные</h4><div className="space-y-1 sm:space-y-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-xl border border-slate-200/50"><div className="h-4 bg-slate-300 rounded w-20 animate-pulse"></div><div className="h-4 bg-slate-300 rounded w-16 animate-pulse"></div></div>)}</div></div> : car?.specifications && <div><h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Технические данные</h4><div className="space-y-1 sm:space-y-2">{Object.entries(car.specifications).map(([key, value]) => <div key={key} className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-xl border border-slate-200/50"><span className="text-slate-600 font-medium text-xs sm:text-sm">{key}</span><span className="text-slate-900 font-bold text-xs sm:text-sm">{value}</span></div>)}</div></div>}
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Финансирование</h4>
                    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/50">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-center"><div className="text-xs sm:text-sm text-slate-500 mb-1">Кредит от</div>{loading ? <div className="h-5 sm:h-6 bg-slate-300 rounded w-16 mx-auto animate-pulse"></div> : <div className="text-sm sm:text-lg font-bold text-slate-900">{car?.price && usdBynRate ? formatPrice(Math.round(car.price * 0.8 / 60)) : '0'}/мес</div>}</div>
                        <div className="text-center"><div className="text-xs sm:text-sm text-slate-500 mb-1">Лизинг от</div>{loading ? <div className="h-5 sm:h-6 bg-slate-300 rounded w-16 mx-auto animate-pulse"></div> : <div className="text-sm sm:text-lg font-bold text-slate-900">{car?.price && usdBynRate ? formatPrice(Math.round(car.price * 0.7 / 36)) : '0'}/мес</div>}</div>
                      </div>
                      <Button onClick={() => setFinancialAssistantOpen(true)} className="w-full bg-slate-900 hover:bg-black text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"><Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Рассчитать кредит/лизинг</Button>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-slate-200/50">
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      <Button onClick={() => setIsBookingOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Записаться на просмотр</Button>
                      <Button onClick={() => setIsCallbackOpen(true)} className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"><Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Заказать звонок</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 sm:p-6 border-t border-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
                <div className="text-center md:text-left">{loading ? <div className="space-y-2"><div className="h-5 bg-blue-400/40 rounded w-40 mx-auto md:mx-0 animate-pulse"></div><div className="h-4 bg-blue-400/40 rounded w-52 mx-auto md:mx-0 animate-pulse"></div></div> : <><div className="font-medium text-base sm:text-lg mb-1">{settings?.main?.showroomInfo?.companyName || ""}</div><div className="text-blue-100 text-xs sm:text-sm">{settings?.main?.showroomInfo?.address || ""}</div></>}</div>
                <div className="text-center">{loading ? <div className="h-5 bg-blue-400/40 rounded w-40 mx-auto animate-pulse"></div> : <div className="flex items-center justify-center space-x-2 text-blue-100 text-xs sm:text-sm"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /><div><div>{settings?.main?.showroomInfo?.workingHours?.weekdays || ""}</div></div></div>}</div>
                <div className="text-center md:text-right">{loading ? <div className="space-y-2"><div className="h-5 bg-blue-400/40 rounded w-32 mx-auto md:ml-auto animate-pulse"></div><div className="h-5 bg-blue-400/40 rounded w-32 mx-auto md:ml-auto animate-pulse"></div></div> : <div className="flex flex-col items-center md:items-end space-y-1">{settings?.main?.showroomInfo?.phone && <div className="flex items-center space-x-2"><Phone className="h-3 w-3 sm:h-4 sm:w-4" /><div className="font-medium text-base sm:text-lg">{settings.main.showroomInfo.phone}</div></div>}{settings?.main?.showroomInfo?.phone2 && <div className="flex items-center space-x-2"><Phone className="h-3 w-3 sm:h-4 sm:w-4" /><div className="font-medium text-base sm:text-lg">{settings.main.showroomInfo.phone2}</div></div>}</div>}</div>
              </div>
            </div>
          </div>
        </div>
        <FinancialAssistantDrawer open={isFinancialAssistantOpen} onOpenChange={setFinancialAssistantOpen} car={car} />
        <Dialog open={isCreditOpen} onOpenChange={setIsCreditOpen}>
          <DialogContent className="max-w-lg sm:max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
            <DialogHeader className="pb-2 sm:pb-4">
              <DialogTitle className="text-lg sm:text-2xl">Калькулятор финансирования</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Калькулятор */}
              <div className="space-y-3 sm:space-y-6">
                {/* Переключатель типа финансирования */}
                <div className="flex items-center justify-center space-x-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setFinanceType('credit')}
                    className={`flex-1 text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-md transition-all ${
                      financeType === 'credit'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Кредит
                  </button>
                  <button
                    onClick={() => setFinanceType('leasing')}
                    className={`flex-1 text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-md transition-all ${
                      financeType === 'leasing'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Лизинг
                  </button>
                </div>

                {/* Переключатель валюты */}
                <div className="flex items-center space-x-2 p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="currency-switch"
                    checked={isBelarusianRubles}
                    onCheckedChange={handleCurrencyChange}
                  />
                  <Label htmlFor="currency-switch" className="text-xs sm:text-sm font-medium">
                    В белорусских рублях
                  </Label>
                </div>

                {financeType === 'credit' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Стоимость авто</Label>
                        <Input
                          type="number"
                          value={car?.price ? (isBelarusianRubles && usdBynRate ? Math.round(car.price * usdBynRate) : car.price) : 0}
                          readOnly
                          className="bg-slate-50 text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Сумма кредита</Label>
                        <Input
                          type="number"
                          value={creditAmount[0]}
                          onChange={(e) => {
                            const newCreditAmount = Number(e.target.value)
                            setCreditAmount([newCreditAmount])

                            // Автоматически пересчитываем первый взнос
                            const carPriceInSelectedCurrency = car?.price ?
                              (isBelarusianRubles && usdBynRate ? car.price * usdBynRate : car.price) : 0
                            const newDownPayment = Math.max(0, carPriceInSelectedCurrency - newCreditAmount)
                            setDownPayment([newDownPayment])
                          }}
                          min={getCreditMinValue()}
                          max={getCreditMaxValue()}
                          step={isBelarusianRubles ? 100 : 1000}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Первый взнос</Label>
                        <Input
                          type="number"
                          value={downPayment[0]}
                          onChange={(e) => {
                            const newDownPayment = Number(e.target.value)
                            setDownPayment([newDownPayment])

                            // Автоматически пересчитываем сумму кредита
                            const carPriceInSelectedCurrency = car?.price ?
                              (isBelarusianRubles && usdBynRate ? car.price * usdBynRate : car.price) : 0
                            const newCreditAmount = Math.max(0, carPriceInSelectedCurrency - newDownPayment)
                            setCreditAmount([newCreditAmount])
                          }}
                          min={car?.price ? (isBelarusianRubles && usdBynRate ? car.price * 0.1 * usdBynRate : car.price * 0.1) : 0}
                          max={car?.price ? (isBelarusianRubles && usdBynRate ? car.price * 0.5 * usdBynRate : car.price * 0.5) : 100000}
                          step={isBelarusianRubles ? 100 : 1000}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Срок (мес.)</Label>
                        <Input
                          type="number"
                          value={loanTerm[0]}
                          onChange={(e) => setLoanTerm([Number(e.target.value)])}
                          min={12}
                          max={96}
                          step={6}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm">Банк</Label>
                      {partnerBanks.length > 0 ? (
                        <Select
                          value={selectedBank?.name}
                          onValueChange={(value) => {
                            const bank = partnerBanks.find(b => b.name === value) || partnerBanks[0];
                            setSelectedBank(bank);

                            // ★★★ ДОБАВЛЕНО: Отладочный код для проверки выбранного банка ★★★
                            // ★★★ КОНЕЦ ★★★
                          }}
                        >
                          <SelectTrigger className="h-8 sm:h-10">
                            <SelectValue placeholder="Выберите банк">
                              {selectedBank && (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {(selectedBank.logo || selectedBank.logoUrl) && (
                                      <Image
                                        src={getCachedImageUrl(selectedBank.logo || selectedBank.logoUrl)}
                                        alt={`${selectedBank.name} логотип`}
                                        width={16}
                                        height={16}
                                        className="object-contain rounded"
                                      />
                                    )}
                                    <span className="text-xs sm:text-sm truncate">{selectedBank.name}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600">{selectedBank.rate || selectedBank.minRate}%</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {partnerBanks.map((bank, index) => (
                              <SelectItem key={bank.name || index} value={bank.name} className="relative pr-12">
                                <div className="flex items-center gap-2 w-full">
                                  {(bank.logo || bank.logoUrl) && (
                                    <Image
                                      src={getCachedImageUrl(bank.logo || bank.logoUrl)}
                                      alt={`${bank.name} логотип`}
                                      width={16}
                                      height={16}
                                      className="object-contain rounded flex-shrink-0"
                                    />
                                  )}
                                  <span className="truncate pr-6 text-xs sm:text-sm">{bank.name}</span>
                                </div>
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-slate-600">{bank.rate || bank.minRate}%</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : loadingBanks ? (
                        <div className="text-center py-2">
                          <div className="w-full h-6 sm:h-8 bg-slate-200 rounded animate-pulse mb-1 sm:mb-2"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-xs">Банки не найдены</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Стоимость авто</Label>
                        <Input
                          type="number"
                          value={leasingAmount[0]}
                          onChange={(e) => setLeasingAmount([Number(e.target.value)])}
                          min={getCreditMinValue()}
                          max={getCreditMaxValue()}
                          step={isBelarusianRubles ? 100 : 1000}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Аванс</Label>
                        <Input
                          type="number"
                          value={leasingAdvance[0]}
                          onChange={(e) => {
                            const newAdvance = Number(e.target.value)
                            setLeasingAdvance([newAdvance])

                            // Автоматически пересчитываем стоимость лизинга
                            const carPriceInSelectedCurrency = car?.price ?
                              (isBelarusianRubles && usdBynRate ? car.price * usdBynRate : car.price) : 0
                            setLeasingAmount([carPriceInSelectedCurrency])
                          }}
                          min={car?.price ? (isBelarusianRubles && usdBynRate ? car.price * 0.1 * usdBynRate : car.price * 0.1) : 0}
                          max={car?.price ? (isBelarusianRubles && usdBynRate ? car.price * 0.5 * usdBynRate : car.price * 0.5) : 100000}
                          step={isBelarusianRubles ? 100 : 1000}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Срок (мес.)</Label>
                        <Input
                          type="number"
                          value={leasingTerm[0]}
                          onChange={(e) => setLeasingTerm([Number(e.target.value)])}
                          min={12}
                          max={84}
                          step={3}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Остаток (%)</Label>
                        <Input
                          type="number"
                          value={residualValue[0]}
                          onChange={(e) => setResidualValue([Number(e.target.value)])}
                          min={10}
                          max={50}
                          step={5}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm">Лизинговая компания</Label>
                      {leasingCompanies.length > 0 ? (
                        <Select
                          value={selectedLeasingCompany ? selectedLeasingCompany.name.toLowerCase().replace(/[\s-]/g, '') : ''}
                          onValueChange={(value) => {
                            const company = leasingCompanies.find(c => c.name.toLowerCase().replace(/[\s-]/g, '') === value) || leasingCompanies[0];
                            setSelectedLeasingCompany(company);

                            // ★★★ ДОБАВЛЕНО: Отладочный код для проверки выбранной лизинговой компании ★★★
                            // ★★★ КОНЕЦ ★★★
                          }}
                        >
                          <SelectTrigger className="h-8 sm:h-10">
                            <SelectValue placeholder="Выберите компанию">
                              {selectedLeasingCompany && (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {selectedLeasingCompany.logoUrl && (
                                      <Image
                                        src={getCachedImageUrl(selectedLeasingCompany.logoUrl)}
                                        alt={`${selectedLeasingCompany.name} логотип`}
                                        width={16}
                                        height={16}
                                        className="object-contain rounded"
                                      />
                                    )}
                                    <span className="text-xs sm:text-sm truncate">{selectedLeasingCompany.name}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600">{selectedLeasingCompany.minAdvance}%</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {leasingCompanies.map((company) => (
                              <SelectItem
                                key={company.name}
                                value={company.name.toLowerCase().replace(/[\s-]/g, '')}
                                className="relative pr-12"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {company.logoUrl && (
                                    <Image
                                      src={getCachedImageUrl(company.logoUrl)}
                                      alt={`${company.name} логотип`}
                                      width={16}
                                      height={16}
                                      className="object-contain rounded flex-shrink-0"
                                    />
                                  )}
                                  <span className="truncate pr-6 text-xs sm:text-sm">{company.name}</span>
                                </div>
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-slate-600">{company.minAdvance}%</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : loadingLeasing ? (
                        <div className="text-center py-2">
                          <div className="w-full h-6 sm:h-8 bg-slate-200 rounded animate-pulse mb-1 sm:mb-2"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-xs">Компании не найдены</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Результат */}
              <div className="bg-slate-50 rounded-lg p-3 sm:p-6">
                <h4 className="text-base sm:text-xl font-bold mb-2 sm:mb-4">Результат</h4>
                {financeType === 'credit' ? (
                  selectedBank ? (
                    <div className="space-y-3 sm:space-y-4 relative">
                      {/* Логотип банка в правом верхнем углу */}
                      {(selectedBank.logo || selectedBank.logoUrl) && (
                        <div className="absolute top-0 right-8">
                          <Image
                            src={getCachedImageUrl(selectedBank.logo || selectedBank.logoUrl)}
                            alt={`${selectedBank.name} логотип`}
                            width={60}
                            height={60}
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <div className="pr-16">
                        <div className="text-xs sm:text-sm text-slate-500">Ежемесячный платеж</div>
                        <div className="text-xl sm:text-3xl font-bold text-slate-900">
                          {isBelarusianRubles
                            ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment())
                            : formatPrice(calculateMonthlyPayment())
                          }
                        </div>
                        {!isBelarusianRubles && usdBynRate && (
                          <div className="text-sm sm:text-xl font-semibold text-slate-700">
                            ≈ {convertUsdToByn(calculateMonthlyPayment(), usdBynRate)} BYN
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <div className="text-slate-500">Переплата</div>
                          <div className="font-semibold">
                            {isBelarusianRubles
                              ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment() * loanTerm[0] - getCurrentCreditAmount())
                              : formatPrice(calculateMonthlyPayment() * loanTerm[0] - creditAmount[0])
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Общая сумма</div>
                          <div className="font-semibold">
                            {isBelarusianRubles
                              ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateMonthlyPayment() * loanTerm[0] + getCurrentDownPayment())
                              : formatPrice(calculateMonthlyPayment() * loanTerm[0] + downPayment[0])
                            }
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 sm:pt-4">
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">{selectedBank.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                          <span>Ставка: {selectedBank.rate || selectedBank.minRate}%</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                          <span>Макс. срок: {selectedBank.maxTerm || selectedBank.maxLoanTerm || 60} мес.</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-3 sm:mt-6 h-8 sm:h-10 text-xs sm:text-sm"
                        onClick={() => {
                          setIsCreditOpen(false)
                          setTimeout(() => setIsCreditFormOpen(true), 150)
                        }}
                      >
                        Подать заявку на кредит
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 sm:h-64 text-center">
                      {loadingBanks ? (
                        <div className="w-full space-y-2 sm:space-y-4">
                          <div className="w-full h-8 sm:h-12 bg-slate-200 rounded animate-pulse"></div>
                          <div className="w-3/4 h-3 sm:h-4 bg-slate-200 rounded animate-pulse mx-auto"></div>
                        </div>
                      ) : partnerBanks.length === 0 ? (
                        <>
                          <AlertCircle className="h-6 w-6 sm:h-10 sm:w-10 text-amber-500 mb-2 sm:mb-4" />
                          <p className="text-sm sm:text-base text-slate-700 font-medium">Банки не найдены</p>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Обратитесь к менеджеру</p>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-6 w-6 sm:h-10 sm:w-10 text-slate-400 mb-2 sm:mb-4" />
                          <p className="text-sm sm:text-base text-slate-700 font-medium">Выберите банк</p>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Для расчета кредита</p>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  <div className="space-y-3 sm:space-y-4 relative">
                    {/* Логотип лизинговой компании в правом верхнем углу */}
                    {selectedLeasingCompany && (selectedLeasingCompany.logo || selectedLeasingCompany.logoUrl) && (
                      <div className="absolute top-0 right-8">
                        <Image
                          src={getCachedImageUrl(selectedLeasingCompany.logo || selectedLeasingCompany.logoUrl)}
                          alt={`${selectedLeasingCompany.name} логотип`}
                          width={selectedLeasingCompany.name === 'А-Лизинг' ? 60 : 150}
                          height={selectedLeasingCompany.name === 'А-Лизинг' ? 60 : 150}
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="pr-16">
                      <div className="text-xs sm:text-sm text-slate-500">Ежемесячный платеж</div>
                      <div className="text-xl sm:text-3xl font-bold text-slate-900">
                        {isBelarusianRubles
                          ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateLeasingPayment())
                          : formatPrice(calculateLeasingPayment())
                        }
                      </div>
                      {!isBelarusianRubles && usdBynRate && (
                        <div className="text-sm sm:text-xl font-semibold text-slate-700">
                          ≈ {convertUsdToByn(calculateLeasingPayment(), usdBynRate)} BYN
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <div className="text-slate-500">Общие выплаты</div>
                        <div className="font-semibold">
                          {isBelarusianRubles
                            ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(calculateLeasingPayment() * leasingTerm[0] + leasingAdvance[0])
                            : formatPrice(calculateLeasingPayment() * leasingTerm[0] + leasingAdvance[0])
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Остаточная стоимость</div>
                        <div className="font-semibold">
                          {isBelarusianRubles
                            ? new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format((leasingAmount[0] * residualValue[0]) / 100)
                            : formatPrice((leasingAmount[0] * residualValue[0]) / 100)
                          }
                        </div>
                      </div>
                    </div>
                    {selectedLeasingCompany && (
                      <div className="pt-2 sm:pt-4">
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">{selectedLeasingCompany.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                          <span>Мин. аванс: {selectedLeasingCompany.minAdvance}%</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                          <span>Макс. срок: {selectedLeasingCompany.maxTerm} мес.</span>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full mt-3 sm:mt-6 h-8 sm:h-10 text-xs sm:text-sm"
                      onClick={() => {
                        setIsCreditOpen(false)
                        setTimeout(() => setIsCreditFormOpen(true), 150)
                      }}
                    >
                      Подать заявку на лизинг
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог бронирования */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Записаться на просмотр</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bookingName">Ваше имя</Label>
                <Input
                  id="bookingName"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bookingPhone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="bookingPhone"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(bookingForm.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bookingMessage">Комментарий</Label>
                <Textarea
                  id="bookingMessage"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  placeholder="Удобное время для просмотра..."
                />
              </div>
              <StatusButton
                type="submit"
                className="w-full"
                state={bookingButtonState.state}
                loadingText="Отправляем..."
                successText="Заявка отправлена!"
                errorText="Ошибка"
              >
                Записаться на просмотр
              </StatusButton>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог обратного звонка */}
        <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Заказать обратный звонок</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCallbackSubmit} className="space-y-4">
              <div>
                <Label htmlFor="callbackName">Ваше имя</Label>
                <Input
                  id="callbackName"
                  value={callbackForm.name}
                  onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="callbackPhone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="callbackPhone"
                    value={callbackForm.phone}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, phone: formatPhoneNumber(e.target.value) })
                    }
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(callbackForm.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              <StatusButton
                type="submit"
                className="w-full"
                state={callbackButtonState.state}
                loadingText="Отправляем..."
                successText="Заявка отправлена!"
                errorText="Ошибка"
              >
                Заказать звонок
              </StatusButton>
            </form>
          </DialogContent>
        </Dialog>

        {/* Диалог кредитной заявки */}
        <Dialog open={isCreditFormOpen} onOpenChange={setIsCreditFormOpen}>
          <DialogContent className="max-w-md sm:max-w-lg p-3 sm:p-6">
            <DialogHeader className="pb-2 sm:pb-4">
              <DialogTitle className="text-base sm:text-lg">Подать заявку на {financeType === 'credit' ? 'кредит' : 'лизинг'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreditSubmit} className="space-y-3 sm:space-y-4">
              {/* Компактная форма на мобильных - имя и телефон в одной строке */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="creditName" className="text-sm">Ваше имя</Label>
                  <Input
                    id="creditName"
                    value={creditForm.name}
                    onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                    required
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="creditPhone" className="text-sm">Номер телефона</Label>
                  <div className="relative">
                    <Input
                      id="creditPhone"
                      value={creditForm.phone}
                      onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="+375XXXXXXXXX"
                      required
                      className="pr-8 h-9 sm:h-10 text-sm"
                    />
                    {isPhoneValid(creditForm.phone) && (
                      <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="creditMessage" className="text-sm">Комментарий (необязательно)</Label>
                <Textarea
                  id="creditMessage"
                  value={creditForm.message}
                  onChange={(e) => setCreditForm({ ...creditForm, message: e.target.value })}
                  placeholder="Дополнительная информация..."
                  className="min-h-[60px] sm:min-h-[80px] text-sm"
                />
              </div>

              {/* Компактные данные о выбранном кредите */}
              {(selectedBank || (financeType === 'leasing' && selectedLeasingCompany)) && (
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">Параметры {financeType === 'credit' ? 'кредита' : 'лизинга'}:</h4>
                  <div className="text-xs sm:text-sm space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-600">Автомобиль:</span>
                        <div className="font-medium">{car?.make} {car?.model}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">{financeType === 'credit' ? 'Сумма кредита' : 'Сумма лизинга'}:</span>
                        <div className="font-medium">
                          {financeType === 'credit'
                            ? formatPrice(getCurrentCreditAmount())
                            : formatPrice(leasingAmount[0])
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">{financeType === 'credit' ? 'Первый взнос' : 'Аванс'}:</span>
                        <div className="font-medium">
                          {financeType === 'credit'
                            ? formatPrice(getCurrentDownPayment())
                            : formatPrice(leasingAdvance[0])
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Ежемесячно:</span>
                        <div className="font-medium text-blue-600">
                          {financeType === 'credit'
                            ? formatPrice(calculateMonthlyPayment())
                            : formatPrice(calculateLeasingPayment())
                          }
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-200 mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{financeType === 'credit' ? 'Банк' : 'Компания'}:</span>
                        <span className="font-medium">
                          {financeType === 'credit'
                            ? (selectedBank ? selectedBank.name : '')
                            : (selectedLeasingCompany ? selectedLeasingCompany.name : '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <StatusButton
                type="submit"
                className="w-full h-9 sm:h-10 text-sm"
                state={creditButtonState.state}
                loadingText="Отправляем..."
                successText="Заявка отправлена!"
                errorText="Ошибка"
              >
                Отправить заявку на {financeType === 'credit' ? 'кредит' : 'лизинг'}
              </StatusButton>
            </form>
          </DialogContent>
        </Dialog>

        {/* Полноэкранная галерея */}
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-full h-full p-0 bg-black/95 border-none">
            {car?.imageUrls && car.imageUrls.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Кнопка закрытия */}
                <button
                  onClick={() => setIsFullscreenOpen(false)}
                  className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Закрыть"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Основное изображение */}
                <div
                  className="relative w-full h-full flex items-center justify-center select-none"
                  onTouchStart={(e) => {
                    setTouchEnd(null)
                    setTouchStart(e.targetTouches[0].clientX)
                  }}
                  onTouchMove={(e) => {
                    if (!touchStart) return
                    setTouchEnd(e.targetTouches[0].clientX)
                  }}
                  onTouchEnd={() => {
                    if (!touchStart || !touchEnd) return
                    const distance = touchStart - touchEnd
                    const isLeftSwipe = distance > 50
                    const isRightSwipe = distance < -50

                    if (isLeftSwipe && car.imageUrls.length > 1) {
                      setFullscreenImageIndex((prev) => (prev + 1) % car.imageUrls.length)
                    }
                    if (isRightSwipe && car.imageUrls.length > 1) {
                      setFullscreenImageIndex((prev) => (prev - 1 + car.imageUrls.length) % car.imageUrls.length)
                    }
                  }}
                >
                  <Image
                    src={getCachedImageUrl(car.imageUrls[fullscreenImageIndex])}
                    alt={`${car?.make} ${car?.model} - фото ${fullscreenImageIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    quality={90}
                    sizes="100vw"
                  />
                </div>

                {/* Навигация */}
                {car.imageUrls.length > 1 && (
                  <>
                    {/* Кнопка предыдущего изображения */}
                    <button
                      onClick={() => setFullscreenImageIndex((prev) => (prev - 1 + car.imageUrls.length) % car.imageUrls.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-40"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft className="h-8 w-8 text-white" />
                    </button>

                    {/* Кнопка следующего изображения */}
                    <button
                      onClick={() => setFullscreenImageIndex((prev) => (prev + 1) % car.imageUrls.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-40"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight className="h-8 w-8 text-white" />
                    </button>
                  </>
                )}

                {/* Счетчик изображений */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                    {fullscreenImageIndex + 1} из {car.imageUrls.length}
                  </div>
                </div>

                {/* Миниатюры для десктопа */}
                {car.imageUrls.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex space-x-2 z-40 max-w-4xl overflow-x-auto scrollbar-hide pb-1">
                    <div className="flex space-x-2 px-2">
                      {car.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setFullscreenImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === fullscreenImageIndex
                              ? 'border-white shadow-lg scale-105'
                              : 'border-white/30 hover:border-white/60 hover:scale-102'
                          }`}
                        >
                          <Image
                            src={getCachedImageUrl(url)}
                            alt={`${car?.make} ${car?.model} - миниатюра ${index + 1}`}
                            width={64}
                            height={64}
                            quality={60}
                            sizes="64px"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Индикаторы точек для мобильных */}
                {car.imageUrls.length > 1 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 md:hidden z-40">
                    <div className="flex space-x-2">
                      {car.imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setFullscreenImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === fullscreenImageIndex
                              ? 'bg-white shadow-lg scale-125'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}