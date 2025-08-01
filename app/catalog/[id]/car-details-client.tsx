"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useSettings } from "@/hooks/use-settings"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"
import { getCachedImageUrl } from "@/lib/image-cache"
import CarDetailsSkeleton from "@/components/car-details-skeleton"
import { 
  ArrowRight, 
  Phone, 
  Calendar, 
  Calculator, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Clock,
  Check,
  Star,
  Fuel,
  Gauge,
  Settings,
  Zap
} from "lucide-react"
import { doc, getDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  currency: string
  mileage: number
  engineVolume: number
  fuelType: string
  transmission: string
  driveTrain: string
  bodyType: string
  color: string
  description: string
  imageUrls: string[]
  isAvailable: boolean
  specifications: Record<string, string>
  features: string[]
}

interface CarDetailsClientProps {
  carId: string
}

export default function CarDetailsClient({ carId }: CarDetailsClientProps) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [isCreditOpen, setIsCreditOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("specs")
  
  const callbackButtonState = useButtonState()
  const creditButtonState = useButtonState()
  const bookingButtonState = useButtonState()
  const { showSuccess } = useNotification()
  const { settings } = useSettings()
  const usdBynRate = useUsdBynRate()

  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "+375",
  })

  const [creditForm, setCreditForm] = useState({
    name: "",
    phone: "+375",
    email: "",
    carPrice: "",
    downPayment: "",
    loanTerm: "36",
    bank: "",
    message: "",
  })

  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "+375",
    date: "",
    time: "",
    message: "",
  })

  useEffect(() => {
    loadCar()
  }, [carId])

  useEffect(() => {
    if (car) {
      setCreditForm(prev => ({
        ...prev,
        carPrice: car.price.toString()
      }))
    }
  }, [car])

  const loadCar = async () => {
    try {
      const carDoc = await getDoc(doc(db, "cars", carId))
      if (carDoc.exists()) {
        setCar({ id: carDoc.id, ...carDoc.data() } as Car)
      }
    } catch (error) {
      console.error("Ошибка загрузки автомобиля:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    let numbers = value.replace(/[^\d+]/g, "")
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)
    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await callbackButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...callbackForm,
        carId: car?.id,
        carMake: car?.make,
        carModel: car?.model,
        carYear: car?.year,
        type: "callback",
        status: "new",
        createdAt: new Date(),
      })

      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...callbackForm,
          carId: car?.id,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          type: 'callback'
        })
      })

      setCallbackForm({ name: "", phone: "+375" })
      setIsCallbackOpen(false)
      showSuccess("Заявка на обратный звонок отправлена! Мы свяжемся с вами в ближайшее время.")
    })
  }

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await creditButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...creditForm,
        carId: car?.id,
        carMake: car?.make,
        carModel: car?.model,
        carYear: car?.year,
        type: "credit_request",
        status: "new",
        createdAt: new Date(),
      })

      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...creditForm,
          carId: car?.id,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          type: 'credit_request'
        })
      })

      setCreditForm({
        name: "",
        phone: "+375",
        email: "",
        carPrice: car?.price.toString() || "",
        downPayment: "",
        loanTerm: "36",
        bank: "",
        message: "",
      })
      setIsCreditOpen(false)
      showSuccess("Заявка на кредит отправлена! Мы рассмотрим ее и свяжемся с вами.")
    })
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await bookingButtonState.execute(async () => {
      await addDoc(collection(db, "leads"), {
        ...bookingForm,
        carId: car?.id,
        carMake: car?.make,
        carModel: car?.model,
        carYear: car?.year,
        type: "car_booking",
        status: "new",
        createdAt: new Date(),
      })

      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          carId: car?.id,
          carMake: car?.make,
          carModel: car?.model,
          carYear: car?.year,
          type: 'car_booking'
        })
      })

      setBookingForm({ name: "", phone: "+375", date: "", time: "", message: "" })
      setIsBookingOpen(false)
      showSuccess("Заявка на просмотр отправлена! Мы свяжемся с вами для согласования времени.")
    })
  }

  const nextImage = () => {
    if (car && car.imageUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.imageUrls.length)
    }
  }

  const prevImage = () => {
    if (car && car.imageUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + car.imageUrls.length) % car.imageUrls.length)
    }
  }

  if (loading) {
    return <CarDetailsSkeleton />
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Автомобиль не найден</h1>
          <p className="text-gray-600 mb-6">Запрашиваемый автомобиль не существует или был удален</p>
          <Button asChild>
            <Link href="/catalog">Вернуться к каталогу</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-6 max-w-7xl">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Главная
              </Link>
            </li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li>
              <Link href="/catalog" className="hover:text-blue-600 transition-colors">
                Каталог
              </Link>
            </li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li className="text-gray-900 font-medium">{car.make} {car.model} {car.year}</li>
          </ol>
        </nav>

        {/* Единый блок с информацией об автомобиле */}
        <Card className="overflow-hidden shadow-lg border-0 bg-white">
          <CardContent className="p-0">
            {/* Заголовок и статус */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{car.make} {car.model}</h1>
                    <Badge variant={car.isAvailable ? "default" : "secondary"} className="text-sm">
                      {car.isAvailable ? "В наличии" : "Продан"}
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-600">{car.year} год • {car.color} • {car.bodyType}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{formatPrice(car.price)}</div>
                  {usdBynRate && (
                    <p className="text-sm text-gray-500">≈ {convertUsdToByn(car.price, usdBynRate)} BYN</p>
                  )}
                </div>
              </div>
            </div>

            {/* Основной контент */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Галерея изображений */}
              <div className="lg:col-span-8 border-r border-gray-100">
                <div className="relative">
                  {/* Основное изображение */}
                  <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
                    {car.imageUrls && car.imageUrls.length > 0 ? (
                      <Image
                        src={getCachedImageUrl(car.imageUrls[currentImageIndex])}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-lg">Фото недоступно</span>
                      </div>
                    )}

                    {/* Кнопки навигации */}
                    {car.imageUrls && car.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Действия */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                        <Heart className="h-5 w-5 text-gray-700" />
                      </button>
                      <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                        <Share2 className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    {/* Индикаторы изображений */}
                    {car.imageUrls && car.imageUrls.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {car.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Миниатюры */}
                  {car.imageUrls && car.imageUrls.length > 1 && (
                    <div className="p-4 flex space-x-3 overflow-x-auto bg-gray-50">
                      {car.imageUrls.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Image
                            src={getCachedImageUrl(imageUrl)}
                            alt={`${car.make} ${car.model} - фото ${index + 1}`}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Информация и действия */}
              <div className="lg:col-span-4">
                <div className="p-6 space-y-6">
                  {/* Ключевые характеристики */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Основные характеристики</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{car.mileage?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">км пробег</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{car.engineVolume}л</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{car.fuelType}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900 mb-1">{car.transmission}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">КПП</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900 mb-1">{car.driveTrain}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Привод</div>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="space-y-3">
                    <Dialog open={isCreditOpen} onOpenChange={setIsCreditOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                          <Calculator className="h-5 w-5 mr-2" />
                          Рассчитать кредит
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Заявка на кредит</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreditSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Имя</Label>
                              <Input
                                value={creditForm.name}
                                onChange={(e) => setCreditForm({ ...creditForm, name: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>Телефон</Label>
                              <Input
                                value={creditForm.phone}
                                onChange={(e) => setCreditForm({ ...creditForm, phone: formatPhoneNumber(e.target.value) })}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={creditForm.email}
                              onChange={(e) => setCreditForm({ ...creditForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Первый взнос ($)</Label>
                              <Input
                                type="number"
                                value={creditForm.downPayment}
                                onChange={(e) => setCreditForm({ ...creditForm, downPayment: e.target.value })}
                                placeholder="15000"
                              />
                            </div>
                            <div>
                              <Label>Срок (мес.)</Label>
                              <Input
                                value={creditForm.loanTerm}
                                onChange={(e) => setCreditForm({ ...creditForm, loanTerm: e.target.value })}
                              />
                            </div>
                          </div>
                          <StatusButton
                            type="submit"
                            className="w-full"
                            state={creditButtonState.state}
                            loadingText="Отправляем..."
                            successText="Отправлено!"
                          >
                            Отправить заявку
                          </StatusButton>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full py-3 rounded-lg font-medium">
                          <Calendar className="h-5 w-5 mr-2" />
                          Записаться на просмотр
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Запись на просмотр</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Имя</Label>
                              <Input
                                value={bookingForm.name}
                                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>Телефон</Label>
                              <Input
                                value={bookingForm.phone}
                                onChange={(e) => setBookingForm({ ...bookingForm, phone: formatPhoneNumber(e.target.value) })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Дата</Label>
                              <Input
                                type="date"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>
                            <div>
                              <Label>Время</Label>
                              <Input
                                type="time"
                                value={bookingForm.time}
                                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Комментарий</Label>
                            <Input
                              value={bookingForm.message}
                              onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                              placeholder="Дополнительные пожелания..."
                            />
                          </div>
                          <StatusButton
                            type="submit"
                            className="w-full"
                            state={bookingButtonState.state}
                            loadingText="Отправляем..."
                            successText="Отправлено!"
                          >
                            Записаться
                          </StatusButton>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full py-3 rounded-lg font-medium">
                          <Phone className="h-5 w-5 mr-2" />
                          Заказать звонок
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Заказать обратный звонок</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCallbackSubmit} className="space-y-4">
                          <div>
                            <Label>Ваше имя</Label>
                            <Input
                              value={callbackForm.name}
                              onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Номер телефона</Label>
                            <div className="relative">
                              <Input
                                value={callbackForm.phone}
                                onChange={(e) => setCallbackForm({ ...callbackForm, phone: formatPhoneNumber(e.target.value) })}
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
                            successText="Отправлено!"
                          >
                            Заказать звонок
                          </StatusButton>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Информация о салоне */}
                  {settings?.main?.showroomInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{settings.main.showroomInfo.title}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{settings.main.showroomInfo.companyName}</div>
                          <div className="text-gray-600">{settings.main.showroomInfo.address}</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <div>
                            <div>{settings.main.showroomInfo.workingHours.weekdays}</div>
                            <div>{settings.main.showroomInfo.workingHours.weekends}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${settings.main.showroomInfo.phone}`} className="hover:text-blue-600">
                            {settings.main.showroomInfo.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Детальная информация - вкладки */}
            <div className="border-t border-gray-100">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-gray-50 rounded-none h-12">
                  <TabsTrigger value="specs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Характеристики
                  </TabsTrigger>
                  <TabsTrigger value="features" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Комплектация
                  </TabsTrigger>
                  <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Описание
                  </TabsTrigger>
                  <TabsTrigger value="credit" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Кредит
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="p-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.specifications && Object.entries(car.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium">{key}</span>
                        <span className="text-gray-900 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="features" className="p-6 mt-0">
                  {car.features && car.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 py-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Информация о комплектации не указана</p>
                  )}
                </TabsContent>

                <TabsContent value="description" className="p-6 mt-0">
                  {car.description ? (
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed">{car.description}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Описание не указано</p>
                  )}
                </TabsContent>

                <TabsContent value="credit" className="p-6 mt-0">
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Кредитные условия</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Стоимость автомобиля:</span>
                          <span className="font-semibold text-blue-900">{formatPrice(car.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Минимальный взнос:</span>
                          <span className="font-semibold text-blue-900">{formatPrice(car.price * 0.2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Максимальный срок:</span>
                          <span className="font-semibold text-blue-900">84 месяца</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsCreditOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Подать заявку на кредит
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}