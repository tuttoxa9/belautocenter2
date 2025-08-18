"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Car, ArrowLeft, ArrowRight, CreditCard } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"

interface CarData {
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
  imageUrls: string[]
  isAvailable: boolean
  createdAt?: any
}

export default function CreditCarsCarousel() {
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const usdBynRate = useUsdBynRate()

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      setLoading(true)
      console.log('Карусель: Начинаем загрузку автомобилей через Firebase')

      const snapshot = await getDocs(collection(db, "cars"))
      console.log('Карусель: Получено документов из Firebase:', snapshot.docs.length)

      const carsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((car: CarData) => {
          const hasPrice = car && car.price && car.price > 0
          if (!hasPrice && car) {
            console.log('Карусель: Автомобиль без цены:', car.id, car.make, car.model, 'price:', car.price)
          }
          return hasPrice
        })
        .slice(0, 10)

      console.log('Карусель: Загружено автомобилей для карусели:', carsData.length)
      console.log('Карусель: Итоговые данные автомобилей:', carsData)
      setCars(carsData as CarData[])
    } catch (error) {
      console.error("Карусель: Ошибка загрузки автомобилей:", error)
    } finally {
      console.log('Карусель: Загрузка завершена, loading = false')
      setLoading(false)
    }
  }

  const calculateMonthlyPayment = (carPrice: number) => {
    const downPaymentPercent = 0.2 // 20% первоначальный взнос
    const interestRate = 0.15 // 15% годовых (самая выгодная ставка)
    const loanTermMonths = 36 // 3 года

    const principal = carPrice * (1 - downPaymentPercent)
    const monthlyRate = interestRate / 12
    const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
      (Math.pow(1 + monthlyRate, loanTermMonths) - 1)

    return monthlyPayment
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX)
    setScrollLeft(carouselRef.current.scrollLeft)
    setDragDistance(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const walk = startX - e.pageX
    setDragDistance(Math.abs(walk))
    carouselRef.current.scrollLeft = scrollLeft + walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX)
    setScrollLeft(carouselRef.current.scrollLeft)
    setDragDistance(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return
    const walk = startX - e.touches[0].pageX
    setDragDistance(Math.abs(walk))
    carouselRef.current.scrollLeft = scrollLeft + walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const scrollToCard = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const cardWidth = window.innerWidth >= 768 ? 280 + 16 : 240 + 12 // ширина карточки + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-300 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-slate-300 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="min-w-[240px] md:min-w-[280px] bg-slate-100 rounded-xl p-3 md:p-4 animate-pulse">
                <div className="h-28 md:h-40 bg-slate-200 rounded-lg mb-3 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 md:h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 md:h-4 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cars.length === 0) {
    console.log('Карусель: автомобили не загружены, loading:', loading)
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-8">
          <div className="text-center text-slate-500">
            {loading ? 'Загружаем автомобили...' : 'Автомобили не найдены'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg md:text-2xl font-semibold text-slate-900">
              Популярные автомобили в кредит
            </h3>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollToCard('left')}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={() => scrollToCard('right')}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {cars.map((car) => {
            const monthlyPayment = calculateMonthlyPayment(car.price)

            const handleCardClick = (e: React.MouseEvent) => {
              // Если была прокрутка (drag), не открываем ссылку
              if (dragDistance > 5) {
                e.preventDefault()
                return
              }
            }

            return (
              <Card key={car.id} className="min-w-[240px] md:min-w-[280px] max-w-[240px] md:max-w-[280px] overflow-hidden hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white group hover:border-slate-300">
                <Link href={`/catalog/${car.id}`} className="block" onClick={handleCardClick}>
                  {/* Image Section */}
                  <div className="relative">
                    <div className="relative overflow-hidden bg-slate-100 h-28 md:h-40">
                      <Image
                        src={getCachedImageUrl(car.imageUrls?.[0] || "/placeholder.svg?height=160&width=280")}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-300"
                        sizes="(max-width: 768px) 240px, 280px"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-black/75 text-white text-xs font-medium">
                          {car.year}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-3 md:p-4">
                    <div className="mb-3">
                      <h4 className="font-semibold text-slate-900 text-base leading-tight mb-1 group-hover:text-slate-700 transition-colors">
                        {car.make} {car.model}
                      </h4>
                      <div className="font-bold text-slate-900 text-lg">
                        {formatCurrency(car.price)}
                      </div>
                      {usdBynRate && (
                        <div className="text-xs text-slate-500 font-medium">
                          ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
                        </div>
                      )}
                    </div>

                    {/* Monthly Payment Highlight */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="text-xs text-green-700 font-medium mb-1">Ежемесячный платеж от:</div>
                      <div className="text-lg font-bold text-green-800">
                        {formatCurrency(monthlyPayment)}
                      </div>
                      {usdBynRate && (
                        <div className="text-xs text-green-600">
                          ≈ {convertUsdToByn(monthlyPayment, usdBynRate)} BYN/мес
                        </div>
                      )}
                      <div className="text-xs text-green-600 mt-1">
                        При 20% взносе, 15% годовых, 36 мес.
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Пробег</span>
                        <span className="font-medium text-slate-900">{formatMileage(car.mileage)} км</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Двигатель</span>
                        <span className="font-medium text-slate-900">
                          {car.fuelType === "Электро" ? car.fuelType : `${car.engineVolume?.toFixed(1)} ${car.fuelType}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">КПП</span>
                        <span className="font-medium text-slate-900">{car.transmission}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Смотреть все автомобили
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
