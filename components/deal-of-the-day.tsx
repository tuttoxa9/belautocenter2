"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Gauge, Calendar, Fuel, Wallet, ChevronRight } from "lucide-react"
import { BlurImage } from "@/components/ui/blur-image"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"

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

  const usdBynRate = useUsdBynRate()

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

  // Расчет кредита
  const creditPayment = useMemo(() => {
    if (!dealCar || !usdBynRate) return null;

    const priceByn = convertUsdToByn(dealCar.price, usdBynRate);
    const months = 120;
    const rate = 13.5; // Самая низкая ставка

    // Аннуитетный платеж
    const monthlyRate = rate / 12 / 100;
    const annuityFactor = (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const payment = priceByn * annuityFactor;

    return Math.round(payment);
  }, [dealCar, usdBynRate]);

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
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Эксклюзивное предложение</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Автомобиль дня
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2 rounded-full shadow-sm">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold leading-none">Обновление через</span>
             <span className="font-mono font-bold text-gray-900 dark:text-white text-lg leading-none">
               {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
             </span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-2xl transition-all duration-300">
        <div className="grid lg:grid-cols-12 gap-0">

          {/* Изображение автомобиля (Large area) */}
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[500px] bg-gray-100 dark:bg-zinc-800 overflow-hidden group">
            <BlurImage
              src={mainImage}
              alt={`${dealCar.make} ${dealCar.model}`}
              fill
              containerClassName="h-full w-full"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Градиент снизу для текста на мобильных если нужно */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />

            <div className="absolute bottom-4 left-4 right-4 lg:hidden text-white">
              <h3 className="text-2xl font-bold mb-1">{dealCar.make} {dealCar.model}</h3>
              <p className="opacity-90">{dealCar.year} г. • {dealCar.mileage.toLocaleString('ru-RU')} км</p>
            </div>
          </div>

          {/* Информация (Sidebar) */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900 relative">

            {/* Header info (Desktop only) */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {dealCar.make} <br/> <span className="text-blue-600 dark:text-blue-400">{dealCar.model}</span>
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400">
                Лучшее предложение за сегодня
              </p>
            </div>

            {/* Характеристики Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">
                    <Calendar className="w-3.5 h-3.5" /> Год выпуска
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{dealCar.year}</div>
               </div>
               <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">
                    <Gauge className="w-3.5 h-3.5" /> Пробег
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{dealCar.mileage.toLocaleString('ru-RU')} км</div>
               </div>
               <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">
                    <Fuel className="w-3.5 h-3.5" /> Топливо
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white truncate">{dealCar.fuelType || "н/д"}</div>
               </div>
               <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">
                    <Wallet className="w-3.5 h-3.5" /> Цена
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(dealCar.price)}</div>
               </div>
            </div>

            {/* Credit Offer Block */}
            {creditPayment && (
              <div className="mb-8 p-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl shadow-lg relative overflow-hidden group/credit">
                 <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Wallet className="w-24 h-24" />
                 </div>

                 <div className="relative z-10">
                    <div className="text-blue-100 text-sm font-medium mb-1">В кредит без взноса</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">от {creditPayment}</span>
                      <span className="text-xl">BYN/мес</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-100/80">
                       <span className="bg-white/20 px-2 py-0.5 rounded">120 мес</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded">13.5%</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded">0% аванс</span>
                    </div>
                 </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-lg h-14 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-between px-8 group/btn"
              asChild
            >
              <Link href={`/catalog/${dealCar.id}`}>
                <span>Смотреть детали</span>
                <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* Mobile Timer (if hidden on top) */}
            <div className="mt-6 sm:hidden flex items-center justify-center gap-2 text-xs text-gray-500">
               <Clock className="w-3 h-3" />
               До конца предложения: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
