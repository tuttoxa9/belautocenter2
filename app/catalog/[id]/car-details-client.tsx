"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
import {
  Gauge,
  Fuel,
  Settings,
  Car,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
  Calculator,
  Building2,
  MapPin,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  Check
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import CarDetailsSkeleton from "@/components/car-details-skeleton"

// Компонент ошибки для несуществующего автомобиля
const CarNotFoundComponent = ({ contactPhone }: { contactPhone: string }) => (
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
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Phone className="h-5 w-5" />
          <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
            {contactPhone}
          </a>
        </div>
      </div>

      <Button
        onClick={() => window.location.href = '/catalog'}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
      >
        Перейти к каталогу
      </Button>
    </div>
  </div>
)

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  engineVolume: number;
  fuelType: string;
  transmission: string;
  driveTrain: string;
  bodyType: string;
  color: string;
  description: string;
  imageUrls: string[];
  isAvailable: boolean;
  features: string[];
  specifications: Record<string, string>;
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
}

interface LeasingCompany {
  name: string;
  logoUrl?: string;
  minAdvance: number;
  maxTerm: number;
  interestRate?: number;
}

interface CarDetailsClientProps {
  carId: string;
}

export default function CarDetailsClient({ carId }: CarDetailsClientProps) {
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [contactPhone, setContactPhone] = useState<string>("")
  const [carNotFound, setCarNotFound] = useState(false)
  const usdBynRate = useUsdBynRate()
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
  // Состояние кредитного калькулятора
  const [creditAmount, setCreditAmount] = useState([75000])
  const [downPayment, setDownPayment] = useState([20000])
  const [loanTerm, setLoanTerm] = useState([60])
  const [selectedBank, setSelectedBank] = useState<PartnerBank | null>(null)
  // Состояние лизингового калькулятора
  const [leasingAmount, setLeasingAmount] = useState([75000])
  const [leasingAdvance, setLeasingAdvance] = useState([15000])
  const [leasingTerm, setLeasingTerm] = useState([36])
  const [residualValue, setResidualValue] = useState([20])
  const [selectedLeasingCompany, setSelectedLeasingCompany] = useState<LeasingCompany | null>(null)
  // Состояние для валюты
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(false)
  // Touch events для свайпов на мобильных устройствах
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  // Button states
  const bookingButtonState = useButtonState()
  const callbackButtonState = useButtonState()
  const creditButtonState = useButtonState()

  // Notification hook
  const { showSuccess } = useNotification()

  // Settings hook
  const { settings } = useSettings()

  useEffect(() => {
    if (carId) {
      loadCarData(carId)
    }
    // Load partner banks from Firestore
    loadPartnerBanks()
    // Load leasing companies from Firestore
    loadLeasingCompanies()
    // Load contact data for error message
    loadContactData()
  }, [carId])

  // Сброс значений калькулятора при открытии модального окна кредита
  useEffect(() => {
    if (isCreditOpen && car) {
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

  const loadPartnerBanks = async () => {
    try {
      setLoadingBanks(true)
      const creditDoc = await getDoc(doc(db, "pages", "credit"))
      if (creditDoc.exists() && creditDoc.data()?.partners) {
        const partners = creditDoc.data()?.partners
        // Convert partners to the format we need
        const formattedPartners = partners.map((partner: any, index: number) => ({
          id: index + 1,
          name: partner.name,
          logo: partner.logoUrl || "",
          rate: partner.minRate,
          minDownPayment: 15, // Default value
          maxTerm: partner.maxTerm,
          features: ["Выгодные условия", "Быстрое одобрение"],
          color: ["emerald", "blue", "purple", "red"][index % 4] // Cycle through colors
        }))
        // Sort banks by rate (ascending - lowest first)
        const sortedPartners = formattedPartners.sort((a, b) => a.rate - b.rate)
        setPartnerBanks(sortedPartners)
        // Set the best bank (lowest rate) as default selected bank
        if (sortedPartners.length > 0) {
          setSelectedBank(sortedPartners[0])
        }
      } else {
        console.warn("Банки-партнеры не найдены в Firestore")
        setPartnerBanks([])
      }
    } catch (error) {
      console.error("Ошибка загрузки банков-партнеров:", error)
      setPartnerBanks([])
    } finally {
      setLoadingBanks(false)
    }
  }

  const loadLeasingCompanies = async () => {
    try {
      setLoadingLeasing(true)
      const leasingDoc = await getDoc(doc(db, "pages", "leasing"))
      if (leasingDoc.exists() && leasingDoc.data()?.leasingCompanies) {
        const companies = leasingDoc.data()?.leasingCompanies
        // Sort leasing companies by minAdvance (ascending - lowest first)
        const sortedCompanies = companies.sort((a: any, b: any) => a.minAdvance - b.minAdvance)
        setLeasingCompanies(sortedCompanies)
        // Set the best leasing company (lowest advance) as default selected
        if (sortedCompanies.length > 0) {
          setSelectedLeasingCompany(sortedCompanies[0])
        }
      } else {
        console.warn("Лизинговые компании не найдены в Firestore")
        setLeasingCompanies([])
      }
    } catch (error) {
      console.error("Ошибка загрузки лизинговых компаний:", error)
      setLeasingCompanies([])
    } finally {
      setLoadingLeasing(false)
    }
  }

  const loadContactData = async () => {
    try {
      const contactsDoc = await getDoc(doc(db, "pages", "contacts"))
      if (contactsDoc.exists()) {
        const data = contactsDoc.data()
        setContactPhone(data?.phone || "+375 29 123-45-67")
      } else {
        setContactPhone("+375 29 123-45-67") // fallback phone
      }
    } catch (error) {
      console.error("Ошибка загрузки контактных данных:", error)
      setContactPhone("+375 29 123-45-67") // fallback phone
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)
      const carDoc = await getDoc(doc(db, "cars", carId))
      if (carDoc.exists()) {
        const carData = { id: carDoc.id, ...carDoc.data() }
        setCar(carData as Car)
        setCarNotFound(false)
        // Устанавливаем значения калькулятора по умолчанию
        const price = carData.price || 95000
        setCreditAmount([price * 0.8])
        setDownPayment([price * 0.2])
      } else {
        console.error("Автомобиль не найден")
        setCarNotFound(true)
        setCar(null)
      }
    } catch (error) {
      console.error("Ошибка загрузки данных автомобиля:", error)
      setCarNotFound(true)
      setCar(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (isBelarusianRubles && usdBynRate) {
      return new Intl.NumberFormat("ru-BY", {
        style: "currency",
        currency: "BYN",
        minimumFractionDigits: 0,
      }).format(price * usdBynRate)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCreditMinValue = () => {
    return isBelarusianRubles ? 3000 : 1000
  }

  const getCreditMaxValue = () => {
    if (isBelarusianRubles && usdBynRate) {
      return car ? car.price * usdBynRate : 200000
    }
    return car ? car.price : 200000
  }

  const getCurrentCreditAmount = () => {
    if (isBelarusianRubles && usdBynRate) {
      return creditAmount[0] * usdBynRate
    }
    return creditAmount[0]
  }

  const getCurrentDownPayment = () => {
    if (isBelarusianRubles && usdBynRate) {
      return downPayment[0] * usdBynRate
    }
    return downPayment[0]
  }

  // При переключении валюты пересчитываем значения
  const handleCurrencyChange = (checked: boolean) => {
    setIsBelarusianRubles(checked)

    if (!car || !usdBynRate) return

    if (checked) {
      // Переключение на BYN
      setCreditAmount([Math.round(car.price * 0.8 * usdBynRate)])
      setDownPayment([Math.round(car.price * 0.2 * usdBynRate)])
      setLeasingAmount([Math.round(car.price * usdBynRate)])
      setLeasingAdvance([Math.round(car.price * 0.2 * usdBynRate)])
    } else {
      // Переключение на USD
      setCreditAmount([car.price * 0.8])
      setDownPayment([car.price * 0.2])
      setLeasingAmount([car.price])
      setLeasingAdvance([car.price * 0.2])
    }
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const formatEngineVolume = (volume: number) => {
    // Всегда показываем с одним знаком после запятой (3.0, 2.5, 1.6)
    return volume.toFixed(1)
  }

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы кроме +
    let numbers = value.replace(/[^\d+]/g, "")

    // Если нет + в начале, добавляем +375
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }

    // Берем только +375 и следующие 9 цифр максимум
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)

    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  // Расчет ежемесячного платежа
  const calculateMonthlyPayment = () => {
    if (!selectedBank) return 0
    const principal = getCurrentCreditAmount()
    const rate = selectedBank.rate / 100 / 12
    const term = loanTerm[0]
    if (rate === 0) return principal / term
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    return monthlyPayment
  }

  // Расчет ежемесячного лизингового платежа
  const calculateLeasingPayment = () => {
    const carPrice = isBelarusianRubles && usdBynRate ? car?.price * usdBynRate || 0 : car?.price || 0
    const advance = isBelarusianRubles && usdBynRate ? leasingAdvance[0] : leasingAdvance[0]
    const term = leasingTerm[0]
    const residualVal = (carPrice * residualValue[0]) / 100

    const leasingSum = carPrice - advance - residualVal
    return leasingSum / term
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await bookingButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...bookingForm,
        carId: carId,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: "booking",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: bookingForm.message,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          carId: carId,
          type: 'car_booking'
        })
      })

      setIsBookingOpen(false)
      setBookingForm({ name: "", phone: "+375", message: "" })
      showSuccess("Заявка на бронирование успешно отправлена! Мы свяжемся с вами в ближайшее время.")
    })
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await callbackButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...callbackForm,
        carId: carId,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: "callback",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: callbackForm.name,
          phone: callbackForm.phone,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          carId: carId,
          type: 'callback'
        })
      })

      setIsCallbackOpen(false)
      setCallbackForm({ name: "", phone: "+375" })
      showSuccess("Заявка на обратный звонок успешно отправлена! Мы свяжемся с вами в ближайшее время.")
    })
  }

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await creditButtonState.execute(async () => {
      // Сохраняем в Firestore
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        carId: carId,
        carInfo: `${car?.make} ${car?.model} ${car?.year}`,
        type: financeType,
        status: "new",
        createdAt: new Date(),
        creditAmount: getCurrentCreditAmount(),
        downPayment: getCurrentDownPayment(),
        loanTerm: loanTerm[0],
        selectedBank: selectedBank?.name || "",
        monthlyPayment: calculateMonthlyPayment(),
        currency: isBelarusianRubles ? "BYN" : "USD",
        financeType: financeType
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: creditForm.name,
          phone: creditForm.phone,
          message: creditForm.message,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          carId: carId,
          carPrice: formatPrice(isBelarusianRubles ? getCurrentCreditAmount() + getCurrentDownPayment() : car?.price || 0),
          downPayment: formatPrice(getCurrentDownPayment()),
          loanTerm: loanTerm[0],
          bank: selectedBank?.name || "Не выбран",
          financeType: financeType,
          type: financeType === 'credit' ? 'credit_request' : 'leasing_request'
        })
      })

      setIsCreditFormOpen(false)
      setCreditForm({ name: "", phone: "+375", message: "" })
      showSuccess(`Заявка на ${financeType === 'credit' ? 'кредит' : 'лизинг'} успешно отправлена! Мы рассмотрим ее и свяжемся с вами в ближайшее время.`)
    })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (car?.imageUrls?.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (car?.imageUrls?.length || 1)) % (car?.imageUrls?.length || 1))
  }

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    const offset = currentTouch - touchStart
    // Ограничиваем смещение для плавности
    const maxOffset = 100
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset))
    setDragOffset(clampedOffset)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    setDragOffset(0)

    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && car?.imageUrls && car.imageUrls.length > 1) {
      nextImage()
    }
    if (isRightSwipe && car?.imageUrls && car.imageUrls.length > 1) {
      prevImage()
    }
  }

  if (loading) {
    return <CarDetailsSkeleton />
  }

  if (carNotFound) {
    return <CarNotFoundComponent contactPhone={contactPhone} />
  }

  if (!car) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Хлебные крошки - улучшенный дизайн как на странице контактов */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-sm text-slate-500">
            <li>
              <button
                onClick={() => router.push('/')}
                className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              >
                Главная
              </button>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            </li>
            <li>
              <button
                onClick={() => router.push('/catalog')}
                className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              >
                Каталог
              </button>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            </li>
            <li className="text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded-md">
              {car.make} {car.model}
            </li>
          </ol>
        </nav>

        {/* Компактный заголовок - улучшенный дизайн */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-5">
            <div className="flex flex-col space-y-4">
              {/* Заголовок с бейджом */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {car.make} {car.model}
                    </h1>
                    {car.isAvailable ? (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        В наличии
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Продан
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded-lg text-sm font-medium">{car.year}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-lg text-sm font-medium">{car.color}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-lg text-sm font-medium">{car.bodyType}</span>
                  </div>
                </div>
              </div>

              {/* Цена */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                      {formatPrice(car.price)}
                    </div>
                    {usdBynRate && (
                      <div className="text-lg font-semibold text-slate-600">
                        ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-1">от</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(Math.round(car.price * 0.8 / 60))}/мес
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="space-y-4">

          {/* Основной контент: Галерея + Информация + Кнопки */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Левая колонка: Галерея + Компактные характеристики */}
            <div className="lg:col-span-7 space-y-4">
              {/* Галерея изображений - улучшенный iOS-подобный дизайн */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <div
                  className="relative h-80 sm:h-96 lg:h-[500px] select-none bg-gradient-to-br from-slate-50 via-white to-slate-100"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    className="w-full h-full transition-transform duration-200 ease-out"
                    style={{
                      transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0px)',
                      opacity: isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset) / 200) : 1
                    }}
                  >
                    <Image
                      src={getCachedImageUrl(car.imageUrls?.[currentImageIndex] || "/placeholder.svg")}
                      alt={`${car.make} {car.model}`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Навигация по фотографиям - iOS стиль */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft className="h-6 w-6 text-slate-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <ChevronRight className="h-6 w-6 text-slate-700" />
                      </button>
                    </>
                  )}

                  {/* Индикатор точек - iOS стиль */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <div className="flex space-x-2">
                        {car.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? 'bg-white shadow-lg scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Счетчик фотографий */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm font-medium">
                        {currentImageIndex + 1}/{car.imageUrls.length}
                      </div>
                    </div>
                  )}
                </div>

                {/* Миниатюры - компактный дизайн */}
                {car.imageUrls && car.imageUrls.length > 1 && (
                  <div className="p-4 bg-slate-50/80 backdrop-blur-sm">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                      {car.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-lg'
                              : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:scale-105'
                          }`}
                        >
                          <Image
                            src={getCachedImageUrl(url)}
                            alt={`${car.make} ${car.model} - фото ${index + 1}`}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Компактные характеристики для мобильной версии - iOS стиль */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-5 lg:hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  Характеристики
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Gauge className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Пробег</div>
                        <div className="text-sm font-bold text-slate-900">{formatMileage(car.mileage)} км</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Fuel className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Двигатель</div>
                        <div className="text-sm font-bold text-slate-900">{formatEngineVolume(car.engineVolume)}л {car.fuelType}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">КПП</div>
                        <div className="text-sm font-bold text-slate-900">{car.transmission}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Привод</div>
                        <div className="text-sm font-bold text-slate-900">{car.driveTrain}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Вкладки - улучшенный iOS-подобный дизайн */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-t-2xl p-2 w-full h-auto border-b border-slate-200/50">
                    <TabsTrigger
                      value="description"
                      className="rounded-xl font-semibold text-xs sm:text-sm py-3 px-2 text-center transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800"
                    >
                      Описание
                    </TabsTrigger>
                    <TabsTrigger
                      value="equipment"
                      className="rounded-xl font-semibold text-xs sm:text-sm py-3 px-2 text-center transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800"
                    >
                      Комплектация
                    </TabsTrigger>
                    <TabsTrigger
                      value="credit"
                      className="rounded-xl font-semibold text-xs sm:text-sm py-3 px-2 text-center transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800"
                    >
                      Финансы
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-5 min-h-[200px]">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-2"></div>
                          Описание
                        </h4>
                        <p className="text-slate-700 text-sm leading-relaxed bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">{car.description}</p>
                      </div>

                      {/* Технические характеристики */}
                      {car.specifications && (
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-2"></div>
                            Характеристики
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(car.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-3 px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                                <span className="text-slate-600 font-medium text-sm">{key}</span>
                                <span className="text-slate-900 font-bold text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="equipment" className="p-5 min-h-[200px]">
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-2"></div>
                        Комплектация
                      </h4>
                      {car.features && car.features.length > 0 ? (
                        <div className="space-y-2">
                          {car.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-slate-700 font-medium text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="h-8 w-8 text-slate-500" />
                          </div>
                          <p className="text-slate-500 text-sm">Комплектация не указана</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="credit" className="p-5 min-h-[200px]">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg mr-2"></div>
                        Финансирование
                      </h4>

                      {/* Переключатель между кредитом и лизингом */}
                      <div className="flex items-center justify-center space-x-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-1.5 border border-slate-200/50">
                        <button
                          onClick={() => setFinanceType('credit')}
                          className={`flex-1 text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                            financeType === 'credit'
                              ? 'bg-white text-slate-900 shadow-lg scale-105'
                              : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                          }`}
                        >
                          Кредит
                        </button>
                        <button
                          onClick={() => setFinanceType('leasing')}
                          className={`flex-1 text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                            financeType === 'leasing'
                              ? 'bg-white text-slate-900 shadow-lg scale-105'
                              : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                          }`}
                        >
                          Лизинг
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/50">
                        <h5 className="text-base font-bold text-slate-900 mb-3 flex items-center">
                          <Calculator className="h-4 w-4 mr-2 text-slate-600" />
                          {financeType === 'credit' ? 'Расчет кредита' : 'Расчет лизинга'}
                        </h5>

                        {financeType === 'credit' ? (
                          <>
                            <div className="space-y-3">
                              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium">Ежемесячный платеж</div>
                                <div className="text-xl font-bold text-slate-900 mb-1">
                                  {selectedBank ? formatPrice(calculateMonthlyPayment()) : "Выберите банк"}
                                </div>
                                {selectedBank && usdBynRate && (
                                  <div className="text-sm font-semibold text-slate-600">
                                    ≈ {convertUsdToByn(calculateMonthlyPayment(), usdBynRate)} BYN
                                  </div>
                                )}
                              </div>

                              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium">Общая сумма</div>
                                <div className="text-lg font-bold text-slate-900 mb-1">
                                  {selectedBank ? formatPrice(calculateMonthlyPayment() * loanTerm[0] + downPayment[0]) : "Выберите банк"}
                                </div>
                                {selectedBank && usdBynRate && (
                                  <div className="text-sm font-semibold text-slate-600">
                                    ≈ {convertUsdToByn(calculateMonthlyPayment() * loanTerm[0] + downPayment[0], usdBynRate)} BYN
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Лучший банк */}
                            {partnerBanks.length > 0 && (
                              <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-600 font-medium">Лучшее предложение:</span>
                                    <div className="flex items-center space-x-2">
                                      {partnerBanks[0]?.logo && (
                                        <Image
                                          src={getCachedImageUrl(partnerBanks[0].logo)}
                                          alt={`${partnerBanks[0].name} логотип`}
                                          width={20}
                                          height={20}
                                          className="object-contain rounded"
                                        />
                                      )}
                                      <span className="font-bold text-slate-900 text-sm">{partnerBanks[0]?.rate}%</span>
                                    </div>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-lg font-bold">
                                    +{partnerBanks.length - 1}
                                  </div>
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => setIsCreditOpen(true)}
                              className="w-full mt-4 bg-gradient-to-br from-slate-900 to-black hover:from-black hover:to-slate-900 text-white text-sm font-semibold rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                              size="lg"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Рассчитать кредит
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium">Ежемесячный платеж</div>
                                <div className="text-xl font-bold text-slate-900 mb-1">
                                  {formatPrice(Math.round((car.price * 0.7) / 36))}
                                </div>
                                {usdBynRate && (
                                  <div className="text-sm font-semibold text-slate-600">
                                    ≈ {convertUsdToByn(Math.round((car.price * 0.7) / 36), usdBynRate)} BYN
                                  </div>
                                )}
                              </div>

                              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium">Авансовый платеж</div>
                                <div className="text-lg font-bold text-slate-900 mb-1">
                                  {formatPrice(Math.round(car.price * 0.2))}
                                </div>
                                {usdBynRate && (
                                  <div className="text-sm font-semibold text-slate-600">
                                    ≈ {convertUsdToByn(Math.round(car.price * 0.2), usdBynRate)} BYN
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Лучшая лизинговая компания */}
                            {leasingCompanies.length > 0 && (
                              <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-600 font-medium">Лучшее предложение:</span>
                                    <div className="flex items-center space-x-2">
                                      {leasingCompanies[0]?.logoUrl && (
                                        <Image
                                          src={getCachedImageUrl(leasingCompanies[0].logoUrl)}
                                          alt={`${leasingCompanies[0].name} логотип`}
                                          width={20}
                                          height={20}
                                          className="object-contain rounded"
                                        />
                                      )}
                                      <span className="font-bold text-slate-900 text-sm">{leasingCompanies[0]?.minAdvance}%</span>
                                    </div>
                                  </div>
                                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-lg font-bold">
                                    +{leasingCompanies.length - 1}
                                  </div>
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => {
                                setFinanceType('leasing')
                                setIsCreditOpen(true)
                              }}
                              className="w-full mt-4 bg-gradient-to-br from-slate-900 to-black hover:from-black hover:to-slate-900 text-white text-sm font-semibold rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                              size="lg"
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Рассчитать лизинг
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Боковая панель: Характеристики для десктопа + Кнопки */}
            <div className="lg:col-span-5 space-y-6">

              {/* Ключевые характеристики - только для десктопа */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Основные характеристики</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm mb-3 border border-slate-200/50">
                      <Gauge className="h-8 w-8 text-slate-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{formatMileage(car.mileage)} км</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm mb-3 border border-slate-200/50">
                      <Fuel className="h-8 w-8 text-slate-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{formatEngineVolume(car.engineVolume)} {car.fuelType}</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm mb-3 border border-slate-200/50">
                      <Settings className="h-8 w-8 text-slate-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{car.transmission}</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm mb-3 border border-slate-200/50">
                      <Car className="h-8 w-8 text-slate-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{car.driveTrain}</div>
                  </div>
                </div>
              </div>

              {/* Кнопки действий - улучшенный дизайн */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    <Heart className="h-3 w-3 text-white" />
                  </div>
                  Действия
                </h3>
                <div className="space-y-3">
                  <Dialog open={isCreditOpen} onOpenChange={setIsCreditOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-br from-slate-900 to-black hover:from-black hover:to-slate-900 text-white font-semibold rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" size="lg">
                        <Calculator className="h-5 w-5 mr-3" />
                        Лизинг / Кредит
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 text-slate-900 border-2 border-slate-200 font-semibold rounded-2xl py-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105" size="lg">
                        <Eye className="h-5 w-5 mr-3" />
                        Записаться на просмотр
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 text-slate-900 border-2 border-slate-200 font-semibold rounded-2xl py-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105" size="lg">
                        <Phone className="h-5 w-5 mr-3" />
                        Заказать звонок
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              {/* Контактная информация - для ПК отдельный блок */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {settings?.main?.showroomInfo?.title || "Где посмотреть"}
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-6 items-center">
                  <div>
                    <div className="font-medium text-slate-800 text-sm mb-1">
                      {settings?.main?.showroomInfo?.companyName || "Автохаус Белавто Центр"}
                    </div>
                    <div className="text-slate-600 text-xs font-light">
                      {settings?.main?.showroomInfo?.address || "г. Минск, ул. Большое Стиклево 83"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 col-span-2">
                    <Clock className="h-3 w-3" />
                    <div className="text-xs font-light">
                      <span>{settings?.main?.showroomInfo?.workingHours?.weekdays || "Пн-Пт: 9:00-21:00"}</span>
                      <span className="ml-2">{settings?.main?.showroomInfo?.workingHours?.weekends || "Сб-Вс: 10:00-20:00"}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-800">
                    <Phone className="h-3 w-3" />
                    <div className="font-medium text-sm">{settings?.main?.showroomInfo?.phone || "+375 29 123-45-67"}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Контактная информация для мобильных - синий как в соцсетях */}
        <section className="lg:hidden relative pt-12 pb-32 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 rounded-t-[30px] -mb-20 overflow-hidden w-screen -mx-[calc((100vw-100%)/2)] mt-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/80 to-cyan-400/70"></div>
          <div className="px-4 sm:px-6 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/30">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-light text-white tracking-tight">
                  {settings?.main?.showroomInfo?.title || "Где посмотреть"}
                </h3>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 p-6 max-w-sm mx-auto shadow-sm">
                <div className="space-y-4 text-center">
                  <div>
                    <div className="font-medium text-slate-800 text-base mb-1">
                      {settings?.main?.showroomInfo?.companyName || "Автохаус Белавто Центр"}
                    </div>
                    <div className="text-slate-600 text-sm font-light">
                      {settings?.main?.showroomInfo?.address || "г. Минск, ул. Большое Стиклево 83"}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <div className="text-sm font-light">
                      <span className="block">{settings?.main?.showroomInfo?.workingHours?.weekdays || "Пн-Пт: 9:00-21:00"}</span>
                      <span className="block">{settings?.main?.showroomInfo?.workingHours?.weekends || "Сб-Вс: 10:00-20:00"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-slate-800">
                    <Phone className="h-4 w-4" />
                    <div className="font-medium text-base">{settings?.main?.showroomInfo?.phone || "+375 29 123-45-67"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Диалоги */}
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
                          value={isBelarusianRubles && usdBynRate ? Math.round(car.price * usdBynRate) : car.price}
                          readOnly
                          className="bg-slate-50 text-xs sm:text-sm h-8 sm:h-10"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Сумма кредита</Label>
                        <Input
                          type="number"
                          value={creditAmount[0]}
                          onChange={(e) => setCreditAmount([Number(e.target.value)])}
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
                          onChange={(e) => setDownPayment([Number(e.target.value)])}
                          min={isBelarusianRubles && usdBynRate ? car.price * 0.1 * usdBynRate : car.price * 0.1}
                          max={isBelarusianRubles && usdBynRate ? car.price * 0.5 * usdBynRate : car.price * 0.5}
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
                          value={selectedBank?.id?.toString()}
                          onValueChange={(value) =>
                            setSelectedBank(partnerBanks.find(b => b.id === parseInt(value)) || partnerBanks[0])
                          }
                        >
                          <SelectTrigger className="h-8 sm:h-10">
                            <SelectValue placeholder="Выберите банк">
                              {selectedBank && (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {selectedBank.logo && (
                                      <Image
                                        src={getCachedImageUrl(selectedBank.logo)}
                                        alt={`${selectedBank.name} логотип`}
                                        width={16}
                                        height={16}
                                        className="object-contain rounded"
                                      />
                                    )}
                                    <span className="text-xs sm:text-sm truncate">{selectedBank.name}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600">{selectedBank.rate}%</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {partnerBanks.map((bank) => (
                              <SelectItem key={bank.id} value={bank.id.toString()} className="relative pr-12">
                                <div className="flex items-center gap-2 w-full">
                                  {bank.logo && (
                                    <Image
                                      src={getCachedImageUrl(bank.logo)}
                                      alt={`${bank.name} логотип`}
                                      width={16}
                                      height={16}
                                      className="object-contain rounded flex-shrink-0"
                                    />
                                  )}
                                  <span className="truncate pr-6 text-xs sm:text-sm">{bank.name}</span>
                                </div>
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-slate-600">{bank.rate}%</span>
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
                          onChange={(e) => setLeasingAdvance([Number(e.target.value)])}
                          min={isBelarusianRubles && usdBynRate ? car.price * 0.1 * usdBynRate : car.price * 0.1}
                          max={isBelarusianRubles && usdBynRate ? car.price * 0.5 * usdBynRate : car.price * 0.5}
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
                          value={selectedLeasingCompany?.name?.toLowerCase().replace(/[\s-]/g, '')}
                          onValueChange={(value) =>
                            setSelectedLeasingCompany(leasingCompanies.find(c => c.name.toLowerCase().replace(/[\s-]/g, '') === value) || leasingCompanies[0])
                          }
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
                      {selectedBank.logo && (
                        <div className="absolute top-0 right-8">
                          <Image
                            src={getCachedImageUrl(selectedBank.logo)}
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
                          <span>Ставка: {selectedBank.rate}%</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                          <span>Макс. срок: {selectedBank.maxTerm} мес.</span>
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
                    {selectedLeasingCompany?.logo && (
                      <div className="absolute top-0 right-8">
                        <Image
                          src={getCachedImageUrl(selectedLeasingCompany.logo)}
                          alt={`${selectedLeasingCompany.name} логотип`}
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
                          {financeType === 'credit' ? selectedBank?.name : selectedLeasingCompany?.name}
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
      </div>
    </div>
  )
}
