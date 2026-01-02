"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
    <div className="w-full my-8 sm:my-16 mx-auto max-w-7xl px-4 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          Автомобиль дня
        </h2>
        <div className="hidden sm:flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Предложение обновится через: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[30px] shadow-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-colors duration-300">

        <div className="flex flex-col lg:flex-row items-center p-4 sm:p-8 lg:p-10 gap-6 lg:gap-10">

          {/* Изображение автомобиля */}
          <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md group">
            <BlurImage
              src={mainImage}
              alt={`${dealCar.make} ${dealCar.model}`}
              fill
              containerClassName="h-full w-full"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Информация */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5 sm:gap-6">
            <div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 tracking-tight leading-tight text-gray-900 dark:text-white">
                {dealCar.make} {dealCar.model}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
                Идеальный выбор сегодня
              </p>
            </div>

            {/* Характеристики */}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{dealCar.year} г.</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2">
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{dealCar.mileage.toLocaleString('ru-RU')} км</span>
              </div>
              {dealCar.fuelType && (
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2">
                  <Fuel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{dealCar.fuelType}</span>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-gray-200 dark:bg-zinc-800" />

            {/* Цена и Таймер (Mobile only for timer) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Специальная цена</p>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(dealCar.price)}
                </div>
              </div>

              {/* Таймер для мобильных */}
              <div className="sm:hidden w-full bg-gray-100 dark:bg-zinc-800 p-3 rounded-xl flex items-center justify-between text-sm">
                 <span className="text-gray-500 dark:text-gray-400">До конца акции:</span>
                 <span className="font-mono font-bold text-gray-900 dark:text-white">
                   {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                 </span>
              </div>
            </div>

            {/* Кнопка */}
            <div className="mt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-lg px-8 py-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
    </div>
  )
}
