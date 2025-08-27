"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { apiClient } from "@/lib/api-client"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { parseFirestoreDoc } from "@/lib/firestore-parser"
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
import MarkdownRenderer from "@/components/markdown-renderer"
import LazyThumbnail from "@/components/lazy-thumbnail"

// Компонент ошибки для несуществующего автомобиля
const CarNotFoundComponent = ({ contactPhone, contactPhone2 }: { contactPhone: string, contactPhone2?: string }) => {
  // Используем hook из контекста для получения настроек
  const { settings, isLoading: isSettingsLoading } = useSettings();
  // State для отображения скелетона
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Установим задержку, чтобы сначала загрузились настройки
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Получаем номера телефонов из настроек, если доступны, иначе используем переданные параметры
  // Но только если настройки загружены
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
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors">
                    {contactPhone}
                  </a>
                </div>
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
  const [contactPhone2, setContactPhone2] = useState<string>("")
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
  // Состояние для валюты (по умолчанию - белорусские рубли)
  const [isBelarusianRubles, setIsBelarusianRubles] = useState(true)
  // Touch events для свайпов на мобильных устройствах
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  // Полноэкранный просмотр фотографий
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)

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
    // Load all static data in one request
    loadStaticData()
  }, [carId])

  // Сброс значений калькулятора при открытии модального окна кредита
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

  // Получаем хост для изображений
  const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://images.belautocenter.by';

  const loadStaticData = async () => {
    try {
      setLoadingBanks(true)
      setLoadingLeasing(true)

      const apiUrl = process.env.NEXT_PUBLIC_API_HOST

      // Определяем эндпоинты Firestore, которые будет проксировать воркер
      const endpoints = {
        banks: `${apiUrl}/pages/credit`,
        leasing: `${apiUrl}/pages/leasing`,
        contacts: `${apiUrl}/pages/contacts`
      }

      // Выполняем запросы параллельно для максимальной скорости
      const [banksResponse, leasingResponse, contactsResponse] = await Promise.all([
        fetch(endpoints.banks),
        fetch(endpoints.leasing),
        fetch(endpoints.contacts)
      ])

      // Получаем JSON из каждого ответа
      const banksRawData = await banksResponse.json()
      const leasingRawData = await leasingResponse.json()
      const contactsRawData = await contactsResponse.json()

      // ★★★ ДОБАВЬ ЭТОТ ЛОГ ★★★
      console.log("СЫРЫЕ ДАННЫЕ ПО ЛИЗИНГУ (ИЗМЕНЕНИЕ):", JSON.stringify(leasingRawData, null, 2));
      // ★★★ КОНЕЦ ★★★

      // Дополнительный отладочный лог для анализа структуры данных лизинга
      console.log("СТРУКТУРА ДАННЫХ ЛИЗИНГА:", {
        hasPartnersField: leasingRawData?.fields?.partners !== undefined,
        hasLeasingCompaniesField: leasingRawData?.fields?.leasingCompanies !== undefined,
        availableFields: Object.keys(leasingRawData?.fields || {})
      });

      // --- НАЧАЛО ФИНАЛЬНОГО ИСПРАВЛЕНИЯ ---

      // 1. "Переводим" каждый полученный документ в понятный JS-объект
      const creditPageData = parseFirestoreDoc(banksRawData);
      const leasingPageData = parseFirestoreDoc(leasingRawData);
      const contacts = parseFirestoreDoc(contactsRawData);

      // 2. Безопасно извлекаем из них чистые массивы с партнерами
      const banks = creditPageData.partners || [];
      // ★★★ ВОТ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ★★★
      // Делаем код более гибким - сначала проверяем поле leasingCompanies, затем partners
      const leasingCompanies = leasingPageData.leasingCompanies || leasingPageData.partners || [];

      // ★★★ ДОБАВЬ И ЭТОТ ЛОГ ★★★
      console.log("ДАННЫЕ ПО ЛИЗИНГУ ПОСЛЕ ПАРСИНГА:", {
        foundIn: leasingPageData.leasingCompanies ? 'leasingCompanies' : (leasingPageData.partners ? 'partners' : 'не найдено'),
        count: leasingCompanies.length,
        items: leasingCompanies,
        parsedData: leasingPageData
      });
      // ★★★ КОНЕЦ ★★★

      // --- КОНЕЦ ФИНАЛЬНОГО ИСПРАВЛЕНИЯ ---

      // Расширенные отладочные логи для проверки
      console.log("ДАННЫЕ СТРАНИЦЫ КРЕДИТОВ:", creditPageData);
      console.log("ДАННЫЕ СТРАНИЦЫ ЛИЗИНГА:", leasingPageData);
      console.log("ПОСЛЕ ПАРСИНГА (Банки):", banks.length > 0 ? banks[0] : "Массив пуст");
      console.log("ПОСЛЕ ПАРСИНГА (Лизинг):", leasingCompanies.length > 0 ? leasingCompanies[0] : "Массив пуст");
      console.log("БАНКИ (все):", banks);
      console.log("ЛИЗИНГОВЫЕ КОМПАНИИ (все):", leasingCompanies);

      // Устанавливаем данные банков
      if (banks && banks.length > 0) {
        setPartnerBanks(banks)
        setSelectedBank(banks[0]) // Выбираем лучший банк по умолчанию
      } else {
        console.warn("Банки-партнеры не найдены")
        setPartnerBanks([])
      }

      // Устанавливаем данные лизинговых компаний
      if (leasingCompanies && leasingCompanies.length > 0) {
        console.log("УСТАНОВКА ЛИЗИНГОВЫХ КОМПАНИЙ:", leasingCompanies);
        console.log("ПЕРВАЯ ЛИЗИНГОВАЯ КОМПАНИЯ:", leasingCompanies[0]);
        setLeasingCompanies(leasingCompanies)
        setSelectedLeasingCompany(leasingCompanies[0]) // Выбираем лучшую компанию по умолчанию
      } else {
        console.warn("Лизинговые компании не найдены")
        console.log("ДАННЫЕ ЛИЗИНГА (RAW):", leasingRawData);
        console.log("ДАННЫЕ ЛИЗИНГА (PARSED):", leasingPageData);
        setLeasingCompanies([])
      }

      // Устанавливаем контактные телефоны из документа контактов
      setContactPhone(contacts.phone || "+375 29 123-45-67")
      setContactPhone2(contacts.phone2 || "")

    } catch (error) {
      console.error("Ошибка загрузки статических данных:", error)
      setPartnerBanks([])
      setLeasingCompanies([])
      setContactPhone("+375 29 123-45-67")
      setContactPhone2("")
    } finally {
      setLoadingBanks(false)
      setLoadingLeasing(false)
    }
  }

  const loadCarData = async (carId: string) => {
    try {
      setLoading(true)

      // Используем прямой запрос к Cloudflare Worker
      const apiHost = process.env.NEXT_PUBLIC_API_HOST
      let carData = null

      if (apiHost) {
        // Запрос к Cloudflare Worker
        const response = await fetch(`${apiHost}/cars/${carId}`)
        if (response.ok) {
          const rawData = await response.json()
          // ★★★ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Парсим данные от Cloudflare Worker ★★★
          carData = parseFirestoreDoc(rawData)
        }
      }

      // Fallback на прямой запрос к Firestore если Cloudflare Worker недоступен
      if (!carData) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`

        const response = await fetch(firestoreUrl, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-Direct-Firestore/1.0'
          }
        })

        if (response.ok) {
          const doc = await response.json()
          // Используем тот же парсер, что и для основного запроса
          carData = parseFirestoreDoc(doc)
        }
      }

      if (carData) {
        // Очистка данных от несериализуемых объектов
        const cleanCarData = JSON.parse(JSON.stringify(carData))
        setCar(cleanCarData as Car)
        setCarNotFound(false)

        // Предзагрузка первых 3 изображений для быстрого переключения
        if (cleanCarData.imageUrls && cleanCarData.imageUrls.length > 1) {
          cleanCarData.imageUrls.slice(0, 3).forEach((url: string) => {
            const img = new window.Image()
            img.src = getCachedImageUrl(url)
          })
        }

        // Устанавливаем значения калькулятора по умолчанию
        const price = cleanCarData.price || 95000
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

  // Функция для конвертации значения поля из формата Firestore
  // Функция для конвертации полей удалена, теперь везде используется parseFirestoreDoc

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
      return car && car.price ? car.price * usdBynRate : 200000
    }
    return car && car.price ? car.price : 200000
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

    if (!car || !car.price || !usdBynRate) return

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

    // Используем rate, если доступно, иначе minRate
    const rateValue = selectedBank.rate !== undefined ? selectedBank.rate :
                    selectedBank.minRate !== undefined ? selectedBank.minRate : 0;

    const rate = rateValue / 100 / 12
    const term = loanTerm[0]

    // ★★★ РАСШИРЕННЫЙ отладочный код для проверки данных перед расчетом ★★★
    console.log("ДАННЫЕ ДЛЯ КАЛЬКУЛЯТОРА:", {
        amount: principal,
        selectedBank: selectedBank,
        rate: rate,
        rateValue: rateValue,
        rateField: selectedBank.rate !== undefined ? 'rate' :
                   selectedBank.minRate !== undefined ? 'minRate' : 'отсутствует',
        term: term
    });
    // ★★★ КОНЕЦ ★★★

    if (!rate || rate <= 0) return principal / term
    const monthlyPayment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    return monthlyPayment
  }

  // Расчет ежемесячного лизингового платежа
  const calculateLeasingPayment = () => {
    const carPrice = isBelarusianRubles && usdBynRate ? (car && car.price ? car.price * usdBynRate : 0) : (car && car.price ? car.price : 0)
    const advance = isBelarusianRubles && usdBynRate ? leasingAdvance[0] : leasingAdvance[0]
    const term = leasingTerm[0]
    const residualVal = (carPrice * residualValue[0]) / 100

    const leasingSum = carPrice - advance - residualVal
    return leasingSum / term
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await bookingButtonState.execute(async () => {
      // Сохраняем данные через Firebase клиентский SDK (независимо от результата)
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        await addDoc(collection(db, "leads"), {
          ...bookingForm,
          carId: carId,
          carInfo: `${car && car.make ? car.make : ''} ${car && car.model ? car.model : ''} ${car && car.year ? car.year : ''}`,
          type: "booking",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        console.warn('Firebase save failed:', error)
      }

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: bookingForm.message,
          carMake: car && car.make ? car.make : '',
          carModel: car && car.model ? car.model : '',
          carYear: car && car.year ? car.year : '',
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
      // Сохраняем данные через Firebase клиентский SDK (независимо от результата)
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        await addDoc(collection(db, "leads"), {
          ...callbackForm,
          carId: carId,
          carInfo: `${car?.make} ${car?.model} ${car?.year}`,
          type: "callback",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        console.warn('Firebase save failed:', error)
      }

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: callbackForm.name,
          phone: callbackForm.phone,
          carMake: car && car.make ? car.make : '',
          carModel: car && car.model ? car.model : '',
          carYear: car && car.year ? car.year : '',
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
      // Сохраняем данные через Firebase клиентский SDK (независимо от результата)
      try {
        const { collection, addDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

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
          selectedBank: selectedBank ? selectedBank.name : "",
          monthlyPayment: calculateMonthlyPayment(),
          currency: isBelarusianRubles ? "BYN" : "USD",
          financeType: financeType
        })
      } catch (error) {
        console.warn('Firebase save failed:', error)
      }

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: creditForm.name,
          phone: creditForm.phone,
          message: creditForm.message,
          carMake: car && car.make ? car.make : '',
          carModel: car && car.model ? car.model : '',
          carYear: car && car.year ? car.year : '',
          carId: carId,
          carPrice: formatPrice(isBelarusianRubles ? getCurrentCreditAmount() + getCurrentDownPayment() : car?.price || 0),
          downPayment: formatPrice(getCurrentDownPayment()),
          loanTerm: loanTerm[0],
          bank: selectedBank ? selectedBank.name : "Не выбран",
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
    setCurrentImageIndex((prev) => {
      const nextIndex = (prev + 1) % (car?.imageUrls?.length || 1)
      // Предзагружаем следующее изображение
      if (car?.imageUrls && car.imageUrls.length > nextIndex + 1) {
        const img = new window.Image()
        img.src = getCachedImageUrl(car.imageUrls[nextIndex + 1])
      }
      return nextIndex
    })
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const prevIndex = (prev - 1 + (car?.imageUrls?.length || 1)) % (car?.imageUrls?.length || 1)
      // Предзагружаем предыдущее изображение
      if (car?.imageUrls && prevIndex > 0) {
        const img = new window.Image()
        img.src = getCachedImageUrl(car.imageUrls[prevIndex - 1])
      }
      return prevIndex
    })
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

  if (carNotFound) {
    return <CarNotFoundComponent contactPhone={contactPhone} contactPhone2={contactPhone2} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-6xl">
        {/* Хлебные крошки */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
            <li>
              <button
                onClick={() => router.push('/')}
                className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              >
                Главная
              </button>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-slate-400" />
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
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </li>
            <li className="text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded-md">
              {loading ? (
                <div className="h-4 bg-slate-300 rounded w-20 animate-pulse inline-block"></div>
              ) : (
                `${car?.make || ''} ${car?.model || ''}`
              )}
            </li>
          </ol>
        </nav>

        {/* ЕДИНЫЙ ОСНОВНОЙ БЛОК */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div>

          {/* Заголовок и цена - компактный верхний блок */}
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 p-3 sm:p-6">
            {/* Мобильная компоновка - горизонтальная для экономии места */}
            <div className="flex items-start justify-between gap-3 lg:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  {loading ? (
                    <div className="h-8 sm:h-10 lg:h-12 bg-slate-300 rounded w-48 animate-pulse"></div>
                  ) : (
                    <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                      {car?.make} {car?.model}
                    </h1>
                  )}
                  <div className="self-start sm:self-auto">
                    {loading ? (
                      <div className="h-6 sm:h-7 bg-slate-300 rounded-full w-16 animate-pulse"></div>
                    ) : car?.isAvailable ? (
                      <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">
                        В наличии
                      </div>
                    ) : (
                      <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold inline-block">
                        Продан
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-600">
                  {loading ? (
                    <>
                      <div className="h-6 bg-slate-300 rounded-lg w-12 animate-pulse"></div>
                      <div className="h-6 bg-slate-300 rounded-lg w-16 animate-pulse"></div>
                      <div className="h-6 bg-slate-300 rounded-lg w-14 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.year}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.color}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.bodyType}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Цена справа - всегда горизонтально */}
              <div className="text-right flex-shrink-0">
                {loading ? (
                  <>
                    <div className="h-6 sm:h-8 lg:h-9 bg-slate-300 rounded w-24 mb-1 animate-pulse ml-auto"></div>
                    <div className="h-4 sm:h-5 lg:h-6 bg-slate-300 rounded w-20 animate-pulse ml-auto"></div>
                    <div className="h-3 sm:h-4 bg-slate-300 rounded w-16 mt-1 animate-pulse ml-auto"></div>
                  </>
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 leading-tight">
                      {car?.price ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(car.price) : 'Цена по запросу'}
                    </div>
                    {usdBynRate && car?.price && (
                      <div className="text-sm sm:text-base lg:text-lg font-semibold text-slate-600">
                        ≈ {new Intl.NumberFormat("ru-BY", {
                          style: "currency",
                          currency: "BYN",
                          minimumFractionDigits: 0,
                        }).format(car.price * usdBynRate)}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-slate-500 mt-1">
                      от {car?.price ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(Math.round(car.price * 0.8 / 60)) : '0'}/мес
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Основной контент - мобильная и десктопная версии */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Левая колонка: Галерея */}
            <div className="lg:col-span-7 lg:border-r border-slate-200/50">
              <div
                className="relative h-64 sm:h-72 md:h-80 lg:h-[400px] select-none bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl mx-4 my-4 overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-slate-300 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-full h-full transition-transform duration-200 ease-out cursor-pointer"
                      style={{
                        transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0px)',
                        opacity: isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset) / 200) : 1
                      }}
                      onClick={() => {
                        if (!isDragging) {
                          setFullscreenImageIndex(currentImageIndex)
                          setIsFullscreenOpen(true)
                        }
                      }}
                    >
                      <Image
                        src={getCachedImageUrl(car?.imageUrls?.[currentImageIndex] || "/placeholder.svg")}
                        alt={`${car?.make} ${car?.model}`}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Навигация по фотографиям */}
                    {car?.imageUrls && car.imageUrls.length > 1 && (
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

                    {/* Индикатор точек */}
                    {car?.imageUrls && car.imageUrls.length > 1 && (
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

                    {/* Счетчик фотографий и кнопка полноэкранного режима */}
                    {car?.imageUrls && car.imageUrls.length >= 1 && (
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        {car.imageUrls.length > 1 && (
                          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm font-medium">
                            {currentImageIndex + 1}/{car.imageUrls.length}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setFullscreenImageIndex(currentImageIndex)
                            setIsFullscreenOpen(true)
                          }}
                          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                          aria-label="Открыть в полноэкранном режиме"
                        >
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Миниатюры внизу галереи с ленивой загрузкой */}
              {loading ? (
                <div className="p-4 bg-slate-50/50 border-b lg:border-b-0 border-slate-200/50">
                  <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-300 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : car?.imageUrls && car.imageUrls.length > 1 && (
                <div className="p-4 bg-slate-50/50 border-b lg:border-b-0 border-slate-200/50">
                  <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                    {car.imageUrls.map((url, index) => (
                      <LazyThumbnail
                        key={index}
                        src={url}
                        alt={`${car?.make} ${car?.model} - фото ${index + 1}`}
                        isSelected={index === currentImageIndex}
                        onClick={() => setCurrentImageIndex(index)}
                        onDoubleClick={() => {
                          setFullscreenImageIndex(index)
                          setIsFullscreenOpen(true)
                        }}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Описание под галереей для десктопов */}
              <div className="hidden lg:block p-6 bg-slate-50/50 border-slate-200/50">
                <h4 className="text-lg font-bold text-slate-900 mb-3">
                  Описание
                </h4>
                <div className="bg-white rounded-xl p-4 border border-slate-200/50">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                  ) : car?.description ? (
                    <MarkdownRenderer
                      content={car.description}
                      className="text-sm leading-relaxed"
                    />
                  ) : (
                    <p className="text-slate-500 italic text-sm">Описание отсутствует</p>
                  )}
                </div>
              </div>
            </div>

            {/* Описание для мобильных устройств под галереей */}
            <div className="lg:hidden p-3 sm:p-4 bg-slate-50/50 border-b border-slate-200/50">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                Описание
              </h4>
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/50">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                  </div>
                ) : car?.description ? (
                  <MarkdownRenderer
                    content={car.description}
                    className="text-sm leading-relaxed"
                  />
                ) : (
                  <p className="text-slate-500 italic text-sm">Описание отсутствует</p>
                )}
              </div>
            </div>

            {/* Правая колонка: Характеристики и действия */}
            <div className="lg:col-span-5">
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

                {/* Основные характеристики - компактный стиль */}
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-3 lg:mb-4">
                    Характеристики
                  </h3>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50">
                      <div className="text-xs text-slate-500 font-medium mb-1">Пробег</div>
                      {loading ? (
                        <div className="h-5 lg:h-7 bg-slate-300 rounded w-20 animate-pulse"></div>
                      ) : (
                        <div className="text-sm lg:text-lg font-bold text-slate-900">{formatMileage(car?.mileage || 0)} км</div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50">
                      <div className="text-xs text-slate-500 font-medium mb-1">Двигатель</div>
                      {loading ? (
                        <div className="h-5 lg:h-7 bg-slate-300 rounded w-16 animate-pulse"></div>
                      ) : (
                        <div className="text-sm lg:text-lg font-bold text-slate-900">
                          {car?.fuelType === "Электро" ? car.fuelType : `${formatEngineVolume(car?.engineVolume || 0)}л ${car?.fuelType}`}
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50">
                      <div className="text-xs text-slate-500 font-medium mb-1">КПП</div>
                      {loading ? (
                        <div className="h-5 lg:h-7 bg-slate-300 rounded w-12 animate-pulse"></div>
                      ) : (
                        <div className="text-sm lg:text-lg font-bold text-slate-900">{car?.transmission}</div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50">
                      <div className="text-xs text-slate-500 font-medium mb-1">Привод</div>
                      {loading ? (
                        <div className="h-5 lg:h-7 bg-slate-300 rounded w-14 animate-pulse"></div>
                      ) : (
                        <div className="text-sm lg:text-lg font-bold text-slate-900">{car?.driveTrain}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Комплектация */}
                {loading ? (
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                      Комплектация
                    </h4>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-300 rounded-full animate-pulse flex-shrink-0"></div>
                          <div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : car?.features && car.features.length > 0 && (
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                      Комплектация
                    </h4>
                    <div className="space-y-2">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                          </div>
                          <span className="text-slate-700 font-medium text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Технические характеристики */}
                {loading ? (
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                      Технические данные
                    </h4>
                    <div className="space-y-1 sm:space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-xl border border-slate-200/50">
                          <div className="h-4 bg-slate-300 rounded w-20 animate-pulse"></div>
                          <div className="h-4 bg-slate-300 rounded w-16 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : car?.specifications && (
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                      Технические данные
                    </h4>
                    <div className="space-y-1 sm:space-y-2">
                      {Object.entries(car.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-xl border border-slate-200/50">
                          <span className="text-slate-600 font-medium text-xs sm:text-sm">{key}</span>
                          <span className="text-slate-900 font-bold text-xs sm:text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Финансирование - компактный блок */}
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                    Финансирование
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/50">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="text-center">
                        <div className="text-xs sm:text-sm text-slate-500 mb-1">Кредит от</div>
                        {loading ? (
                          <div className="h-5 sm:h-6 bg-slate-300 rounded w-16 mx-auto animate-pulse"></div>
                        ) : (
                          <div className="text-sm sm:text-lg font-bold text-slate-900">
                            {car?.price && usdBynRate ? formatPrice(Math.round(car.price * 0.8 / 60)) : '0'}/мес
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-xs sm:text-sm text-slate-500 mb-1">Лизинг от</div>
                        {loading ? (
                          <div className="h-5 sm:h-6 bg-slate-300 rounded w-16 mx-auto animate-pulse"></div>
                        ) : (
                          <div className="text-sm sm:text-lg font-bold text-slate-900">
                            {car?.price && usdBynRate ? formatPrice(Math.round(car.price * 0.7 / 36)) : '0'}/мес
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsCreditOpen(true)}
                      className="w-full bg-slate-900 hover:bg-black text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Рассчитать кредит/лизинг
                    </Button>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Записаться на просмотр
                        </Button>
                      </DialogTrigger>
                    </Dialog>

                    <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Заказать звонок
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Контактная информация внизу */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 sm:p-6 border-t border-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
              <div className="text-center md:text-left">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 bg-blue-400/40 rounded w-40 mx-auto md:mx-0 animate-pulse"></div>
                    <div className="h-4 bg-blue-400/40 rounded w-52 mx-auto md:mx-0 animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-base sm:text-lg mb-1">
                      {settings?.main?.showroomInfo?.companyName || ""}
                    </div>
                    <div className="text-blue-100 text-xs sm:text-sm">
                      {settings?.main?.showroomInfo?.address || ""}
                    </div>
                  </>
                )}
              </div>

              <div className="text-center">
                {loading ? (
                  <div className="h-5 bg-blue-400/40 rounded w-40 mx-auto animate-pulse"></div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-blue-100 text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <div>
                      <div>{settings?.main?.showroomInfo?.workingHours?.weekdays || ""}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center md:text-right">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 bg-blue-400/40 rounded w-32 mx-auto md:ml-auto animate-pulse"></div>
                    <div className="h-5 bg-blue-400/40 rounded w-32 mx-auto md:ml-auto animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center md:items-end space-y-1">
                    {settings?.main?.showroomInfo?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <div className="font-medium text-base sm:text-lg">
                          {settings.main.showroomInfo.phone}
                        </div>
                      </div>
                    )}
                    {settings?.main?.showroomInfo?.phone2 && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <div className="font-medium text-base sm:text-lg">
                          {settings.main.showroomInfo.phone2}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

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
                            console.log("ВЫБРАННЫЙ БАНК:", bank);
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
                          onChange={(e) => setLeasingAdvance([Number(e.target.value)])}
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
                            console.log("ВЫБРАННАЯ ЛИЗИНГОВАЯ КОМПАНИЯ:", company);
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
