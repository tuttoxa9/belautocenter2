"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Gauge, Calendar, Fuel } from "lucide-react"
import { BlurImage } from "@/components/ui/blur-image"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType?: string
  images: string[]
  imageUrls?: string[] // В CarCard используется imageUrls, добавим для совместимости
  [key: string]: any
}

interface DealOfTheDayProps {
  cars: Car[]
}

export default function DealOfTheDay({ cars }: DealOfTheDayProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  // Выбираем машину дня на основе текущей даты
  const dealCar = useMemo(() => {
    if (!cars || cars.length === 0) return null

    // Используем дату как seed
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

    // Простой генератор псевдослучайных чисел
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    // Выбираем индекс
    const index = Math.floor(pseudoRandom(seed) * cars.length)
    return cars[index]
  }, [cars])

  // Получаем и кэшируем URL изображения
  const mainImage = useMemo(() => {
    if (!dealCar) return '/placeholder-car.jpg'

    // Проверяем imageUrls (как в CarCard) и images
    const rawUrl = (dealCar.imageUrls && dealCar.imageUrls.length > 0)
      ? dealCar.imageUrls[0]
      : (dealCar.images && dealCar.images.length > 0)
        ? dealCar.images[0]
        : '/placeholder-car.jpg'

    return getCachedImageUrl(rawUrl)
  }, [dealCar])

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted || !dealCar) return null

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[30px] shadow-2xl my-8 sm:my-16 group mx-auto max-w-7xl">
      {/* Фоновое размытое изображение */}
      <div
        className="absolute inset-0 z-0 transform scale-110 transition-transform duration-1000 group-hover:scale-115"
        style={{
          backgroundImage: `url(${mainImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.4)',
        }}
      />

      {/* Градиент оверлей для читаемости */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/90 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/50 lg:to-transparent dark:from-black/90 dark:via-black/70" />

      <div className="relative z-20 flex flex-col lg:flex-row items-center p-4 sm:p-8 lg:p-12 gap-6 lg:gap-12">

        {/* Изображение автомобиля */}
        <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2 sm:mt-0">
          <BlurImage
            src={mainImage}
            alt={`${dealCar.make} ${dealCar.model}`}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
            <Badge className="bg-blue-600/90 hover:bg-blue-700 text-white border-none px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-md shadow-lg text-xs sm:text-sm">
              ✨ Автомобиль дня
            </Badge>
          </div>
        </div>

        {/* Информация */}
        <div className="w-full lg:w-1/2 text-white flex flex-col gap-4 sm:gap-6 pb-2 sm:pb-0">
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 tracking-tight leading-tight">
              {dealCar.make} {dealCar.model}
            </h2>
            <p className="text-base sm:text-xl text-gray-300 font-light">
              Идеальный выбор сегодня
            </p>
          </div>

          {/* Характеристики */}
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-base text-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span>{dealCar.year} г.</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
              <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span>{dealCar.mileage.toLocaleString('ru-RU')} км</span>
            </div>
            {dealCar.fuelType && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
                <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                <span>{dealCar.fuelType}</span>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-1 sm:my-2" />

          {/* Цена и Таймер */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Специальная цена</p>
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {formatPrice(dealCar.price)}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end order-1 sm:order-2 w-full sm:w-auto bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-white/5 sm:border-none">
              <div className="flex items-center gap-2 text-blue-300 mb-1 text-xs sm:text-sm font-medium">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                <span>Предложение обновится через</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 font-mono text-xl sm:text-2xl font-bold tracking-wider sm:bg-black/40 sm:px-4 sm:py-2 rounded-lg sm:border sm:border-white/10">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-gray-500 animate-pulse">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-gray-500 animate-pulse">:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Кнопка */}
          <div className="mt-2 sm:mt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              asChild
            >
              <Link href={`/catalog/${dealCar.id}`}>
                Подробнее об авто
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
