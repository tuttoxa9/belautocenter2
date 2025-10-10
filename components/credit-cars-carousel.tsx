"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
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
  return <CarsCarousel />
}

export function CarsCarousel() {
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const usdBynRate = useUsdBynRate()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      setLoading(true)

      const snapshot = await getDocs(collection(db, "cars"))

      const carsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((car: CarData) => {
          const hasPrice = car && car.price && car.price > 0
          const isAvailable = car.isAvailable !== false // Исключаем проданные автомобили
          if (!hasPrice && car) {
          }
          return hasPrice && isAvailable
        })
        .slice(0, 10)

      setCars(carsData as CarData[])
    } catch (error) {
    } finally {
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

  // Убираем автопереключение для мобилок

  const goToSlide = (index: number) => {
    setActiveIndex(index)
  }

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % cars.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  // Прокрутка к активной карточке
  useEffect(() => {
    if (!carouselRef.current || cars.length === 0) return

    const cardWidth = window.innerWidth >= 768 ? 220 + 16 : 200 + 12
    const scrollPosition = activeIndex * cardWidth

    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }, [activeIndex, cars.length])

  if (!isMounted || loading) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
            </div>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="min-w-[200px] md:min-w-[220px] bg-slate-100 rounded-xl p-2 md:p-3 animate-pulse">
                <div className="h-24 md:h-32 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cars.length === 0) {
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
          </div>
        </div>

        <div className="relative">
          {/* Левая стрелочка */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full items-center justify-center transition-all duration-200 border border-slate-200 hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>

          {/* Правая стрелочка */}
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full items-center justify-center transition-all duration-200 border border-slate-200 hover:shadow-xl"
          >
            <ArrowRight className="h-5 w-5 text-slate-700" />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
          {cars.map((car, index) => {
            const monthlyPayment = calculateMonthlyPayment(car.price)

            return (
              <Card key={car.id} className="min-w-[200px] md:min-w-[220px] max-w-[200px] md:max-w-[220px] overflow-hidden hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white group hover:border-slate-300">
                <Link href={`/catalog/${car.id}`} className="block" prefetch={true}>
                  {/* Image Section */}
                  <div className="relative">
                    <div className="relative overflow-hidden bg-slate-100 h-24 md:h-32">
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
                  <CardContent className="p-2 md:p-3">
                    <div className="mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1 group-hover:text-slate-700 transition-colors">
                        {car.make} {car.model}
                      </h4>
                      <div className="font-bold text-slate-900 text-base">
                        {formatCurrency(car.price)}
                      </div>
                    </div>

                    {/* Monthly Payment - Simplified */}
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="text-xs text-green-700 mb-1">от {formatCurrency(monthlyPayment)}/мес</div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
          </div>
        </div>

        {/* Индикаторы для мобилок */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {cars.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/catalog"
            prefetch={true}
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
