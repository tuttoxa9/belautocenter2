"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { firestoreApi } from "@/lib/firestore-api"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useSettings } from "@/hooks/use-settings"
import { Gauge, Fuel, Settings, Car, Phone, CreditCard, ChevronLeft, ChevronRight, Heart, CheckCircle, Calculator, Building2, MapPin, Eye, Calendar, Clock, AlertCircle, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import CarDetailsSkeleton from "@/components/car-details-skeleton"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useDebouncedTouch } from "@/hooks/use-debounced-touch"
import { preloadImages } from "@/lib/image-preloader"

let staticDataCache: {
  banks?: any[]
  leasingCompanies?: any[]
  contactPhones?: { main?: string, additional?: string }
  lastLoadTime?: number
} = {}

const CACHE_DURATION = 5 * 60 * 1000

const CarNotFoundComponent = ({ contactPhone, contactPhone2 }: { contactPhone: string, contactPhone2?: string }) => {
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = !isLoading && settings?.main?.showroomInfo?.phone ? settings.main.showroomInfo.phone : '';
  const phoneNumber2 = !isLoading && settings?.main?.showroomInfo?.phone2 ? settings.main.showroomInfo.phone2 : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Автомобиль не найден</h1>
          <p className="text-slate-600 mb-6">К сожалению, автомобиль с указанным ID не существует или произошла ошибка при загрузке данных.</p>
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
              {phoneNumber && <div className="flex items-center space-x-2"><Phone className="h-5 w-5" /><a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">{phoneNumber}</a></div>}
              {phoneNumber2 && <div className="flex items-center space-x-2"><Phone className="h-5 w-5" /><a href={`tel:${phoneNumber2.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">{phoneNumber2}</a></div>}
              {!phoneNumber && !phoneNumber2 && <div className="flex items-center space-x-2"><Phone className="h-5 w-5" /><a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">{contactPhone}</a></div>}
            </div>
          )}
        </div>
        <Button onClick={() => window.location.href = '/catalog'} className="w-full bg-slate-900 hover:bg-slate-800 text-white">Перейти к каталогу</Button>
      </div>
    </div>
  );
};

interface Car {
  id: string; make: string; model: string; year: number; price: number; currency: string;
  mileage: number; engineVolume: number; fuelType: string; transmission: string;
  driveTrain: string; bodyType: string; color: string; description: string;
  imageUrls: string[]; isAvailable: boolean; features: string[];
  specifications: Record<string, string>;
}
interface PartnerBank {
  id: number; name: string; logo: string; rate: number; minDownPayment: number;
  maxTerm: number; features: string[]; color: string;
}
interface LeasingCompany {
  name: string; logoUrl?: string; minAdvance: number; maxTerm: number; interestRate?: number;
}
interface CarDetailsClientProps { carId: string; }

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
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "+375", message: "" })
  const [callbackForm, setCallbackForm] = useState({ name: "", phone: "+375" })
  const [creditForm, setCreditForm] = useState({ name: "", phone: "+375", message: "" })
  const [isCreditFormOpen, setIsCreditFormOpen] = useState(false)
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([])
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
  const bookingButtonState = useButtonState()
  const callbackButtonState = useButtonState()
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

  const navigatePrevious = () => { if (!car?.imageUrls || car.imageUrls.length <= 1) return; navigateToImage(currentImageIndex > 0 ? currentImageIndex - 1 : car.imageUrls.length - 1); };
  const navigateNext = () => { if (!car?.imageUrls || car.imageUrls.length <= 1) return; navigateToImage(currentImageIndex < car.imageUrls.length - 1 ? currentImageIndex + 1 : 0); };

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
      setLoadingBanks(true)
      setLoadingLeasing(true)
      const [creditPageData, leasingPageData, contacts] = await Promise.all([
        firestoreApi.getDocument("pages", "credit"),
        firestoreApi.getDocument("pages", "leasing"),
        firestoreApi.getDocument("pages", "contacts"),
      ])
      const banks = creditPageData?.partners || [];
      const leasingCompanies = leasingPageData?.leasingCompanies || leasingPageData?.partners || [];
      staticDataCache = {
        banks, leasingCompanies,
        contactPhones: { main: contacts?.phone || "+375 29 123-45-67", additional: contacts?.phone2 || "" },
        lastLoadTime: now
      }
      if (banks && banks.length > 0) { setPartnerBanks(banks); setSelectedBank(banks[0]); }
      else { console.warn("Банки-партнеры не найдены"); setPartnerBanks([]); }
      if (leasingCompanies && leasingCompanies.length > 0) { setLeasingCompanies(leasingCompanies); setSelectedLeasingCompany(leasingCompanies[0]); }
      else { console.warn("Лизинговые компании не найдены"); setLeasingCompanies([]); }
      setContactPhone(staticDataCache.contactPhones.main)
      setContactPhone2(staticDataCache.contactPhones.additional)
    } catch (error) {
      console.error("Ошибка загрузки статических данных:", error)
      setPartnerBanks([]); setLeasingCompanies([]); setContactPhone("+375 29 123-45-67"); setContactPhone2("");
    } finally {
      setLoadingBanks(false); setLoadingLeasing(false);
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)
      const carData = await firestoreApi.getDocument("cars", carId)
      if (carData) {
        const cleanCarData = JSON.parse(JSON.stringify(carData))
        setCar(cleanCarData as Car)
        setCarNotFound(false)
        if (cleanCarData.imageUrls && cleanCarData.imageUrls.length > 1) {
          preloadImages(cleanCarData.imageUrls.slice(0, 3))
        }
        const price = cleanCarData.price || 95000
        setCreditAmount([price * 0.8]); setDownPayment([price * 0.2]);
      } else {
        console.error("Автомобиль не найден"); setCarNotFound(true); setCar(null);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных автомобиля:", error); setCarNotFound(true); setCar(null);
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (isBelarusianRubles && usdBynRate) {
      return new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(price * usdBynRate)
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)
  }

  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)
    if (!car || !car.price || !usdBynRate) return
    if (checked) {
      setCreditAmount([Math.round(car.price * 0.8 * usdBynRate)]); setDownPayment([Math.round(car.price * 0.2 * usdBynRate)]);
      setLeasingAmount([Math.round(car.price * usdBynRate)]); setLeasingAdvance([Math.round(car.price * 0.2 * usdBynRate)]);
    } else {
      setCreditAmount([car.price * 0.8]); setDownPayment([car.price * 0.2]);
      setLeasingAmount([car.price]); setLeasingAdvance([car.price * 0.2]);
    }
  }

  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) { numbers = "+375" }
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)
    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => phone.length === 13 && phone.startsWith("+375")

  const calculateMonthlyPayment = () => {
    if (!selectedBank) return 0
    const principal = creditAmount[0]
    const rateValue = selectedBank.rate !== undefined ? selectedBank.rate : 0;
    const rate = rateValue / 100 / 12
    const term = loanTerm[0]
    if (!rate || rate <= 0) return principal / term
    return principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
  }

  const calculateLeasingPayment = () => {
    const carPrice = isBelarusianRubles && usdBynRate ? (car?.price || 0) * usdBynRate : (car?.price || 0)
    const advance = leasingAdvance[0]
    const term = leasingTerm[0]
    const residualVal = (carPrice * residualValue[0]) / 100
    return (carPrice - advance - residualVal) / term
  }

  const handleFormSubmit = async (buttonState: any, leadData: any, successMessage: string) => {
    await buttonState.execute(async () => {
      try {
        await firestoreApi.addDocument("leads", leadData)
      } catch (error) {
        console.warn('API save via worker failed:', error)
      }
      await fetch('/api/send-telegram', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, type: 'telegram_notification' }) // Simplified for example
      })
      showSuccess(successMessage)
    })
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const leadData = { ...bookingForm, carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: "booking", status: "new", createdAt: new Date() };
    await handleFormSubmit(bookingButtonState, leadData, "Заявка на бронирование успешно отправлена! Мы свяжемся с вами в ближайшее время.");
    setIsBookingOpen(false)
    setBookingForm({ name: "", phone: "+375", message: "" })
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const leadData = { ...callbackForm, carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: "callback", status: "new", createdAt: new Date() };
    await handleFormSubmit(callbackButtonState, leadData, "Заявка на обратный звонок успешно отправлена! Мы свяжемся с вами в ближайшее время.");
    setIsCallbackOpen(false)
    setCallbackForm({ name: "", phone: "+375" })
  }

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const leadData = {
      ...creditForm, carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: financeType, status: "new", createdAt: new Date(),
      creditAmount: creditAmount[0], downPayment: downPayment[0], loanTerm: loanTerm[0],
      selectedBank: selectedBank?.name || "", monthlyPayment: calculateMonthlyPayment(),
      currency: isBelarusianRubles ? "BYN" : "USD", financeType
    };
    await handleFormSubmit(creditButtonState, leadData, `Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена!`);
    setIsCreditFormOpen(false)
    setCreditForm({ name: "", phone: "+375", message: "" })
  }

  if (carNotFound) { return <CarNotFoundComponent contactPhone={contactPhone} contactPhone2={contactPhone2} /> }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* REMAINDER OF JSX IS IDENTICAL AND OMITTED FOR BREVITY */}
    </div>
  )
}
