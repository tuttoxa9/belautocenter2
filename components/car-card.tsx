"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

import { useState, useEffect, useMemo } from "react"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useIntersectionObserverV2 } from "@/hooks/use-intersection-observer"
import { BlurImage } from "@/components/ui/blur-image"
import CarPrice from "@/components/car-price"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn, cn } from "@/lib/utils"
import { useCreditCalculator } from "@/hooks/use-credit-calculator"

interface CarCardProps {
  disableImageBlur?: boolean
  car: {
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
    fromEurope?: boolean
  }
}

export default function CarCard({ car, disableImageBlur }: CarCardProps) {
  const usdBynRate = useUsdBynRate()
  const [dataReady, setDataReady] = useState(false)
  const creditData = useCreditCalculator(car.price)

  // Используем оптимизированный хук для IntersectionObserver
  const { ref: cardRef, isIntersecting } = useIntersectionObserverV2({
    rootMargin: '200px',
    threshold: 0.1,
    triggerOnce: true
  })

  // Данные готовы к отображению сразу
  useEffect(() => {
    setDataReady(true);
  }, []);

  // Мемоизируем тяжелые вычисления для оптимизации производительности
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(car.price)
  }, [car.price])

  const formattedMileage = useMemo(() => {
    return new Intl.NumberFormat("ru-BY").format(car.mileage)
  }, [car.mileage])

  const formattedEngineVolume = useMemo(() => {
    // Всегда показываем с одним знаком после запятой (3.0, 2.5, 1.6)
    return car.engineVolume.toFixed(1)
  }, [car.engineVolume])

  // Мемоизируем URL первого изображения
  const primaryImageUrl = useMemo(() => {
    return getCachedImageUrl(car.imageUrls?.[0] || '')
  }, [car.imageUrls])

  return (
    <Card ref={cardRef} className="overflow-hidden border-0 bg-white/70 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/60 rounded-2xl h-full group transition-all duration-200 dark:border dark:border-gray-800">
      <Link href={`/catalog/${car.id}`} className="block h-full flex flex-col" prefetch={false}>
        {/* Image Section */}
        <div className="relative w-full aspect-[4/3] sm:h-56 sm:aspect-auto">
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-200/60 dark:from-gray-800/90 dark:to-black/90 rounded-t-2xl">
            {isIntersecting ? (
              <BlurImage
                src={primaryImageUrl || "/placeholder.svg?height=200&width=280"}
                alt={`${car.make} ${car.model}`}
                fill
                quality={75}
                showProgress={true}
                enabled={isIntersecting}
                containerClassName="h-full w-full"
                className={cn(
                  "object-cover duration-500",
                  disableImageBlur && "blur-0 grayscale-0 scale-100"
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            )}



            {/* Гарантия */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
              {!dataReady ? (
                <div className="h-5 w-16 sm:h-6 sm:w-20 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
                  <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Гарантия</span>
                </div>
              )}
            </div>

            {/* Year Badge */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
              {!dataReady ? (
                <div className="h-5 w-10 sm:h-6 sm:w-12 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              ) : (
                <span className="bg-black/75 dark:bg-gray-700/90 text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm">
                  {car.year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
          {!dataReady ? (
            // Скелетон до готовности данных
            <>
              <div className="mb-2">
                <div className="h-[1.2em] bg-slate-200 dark:bg-zinc-800 rounded w-32 animate-pulse mb-1 text-sm sm:text-base"></div>
                <div className="flex flex-col gap-1 mb-1 sm:mb-2">
                  <div className="h-[1.25em] bg-slate-200 dark:bg-zinc-800 rounded animate-pulse w-20 text-base sm:text-lg"></div>
                  <div className="h-[1em] bg-slate-200 dark:bg-zinc-800 rounded animate-pulse w-24 text-[11px] sm:text-xs"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-12 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-14 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-8 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            </>
          ) : (
            // Реальные данные после готовности
            <>
              {/* Header - более компактный */}
              <div className="mb-1.5 sm:mb-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5 mb-0.5 sm:mb-1 flex-col sm:flex-row sm:items-center flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors truncate w-full sm:w-auto sm:max-w-full">
                      {car.make} {car.model}
                    </h3>
                    {car.fromEurope && (
                      <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded-full leading-none">
                        Без пробега
                      </span>
                    )}
                  </div>
                  <CarPrice
                    carId={car.id}
                    initialPrice={car.price}
                    className="mb-0 sm:mb-1"
                    priceClassName="text-base sm:text-lg"
                    usdPriceClassName="text-[11px] sm:text-xs"
                    showByn={true}
                    showCredit={false}
                  />
                </div>
                <div className="flex flex-col items-end shrink-0 pl-1">
                  {!dataReady || creditData.loading ? (
                    <div className="h-7 w-20 sm:h-8 sm:w-24 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse shadow-sm"></div>
                  ) : creditData.monthlyPayment ? (
                    <div className="bg-white dark:bg-zinc-800/95 text-slate-800 dark:text-slate-100 text-[10px] sm:text-xs font-bold px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/50 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] whitespace-nowrap transition-colors">
                      {creditData.monthlyPayment} <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-0.5">BYN/мес</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Specs - более компактные */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Пробег</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[60%] text-right">{formattedMileage} км</span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Двигатель</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[60%] text-right">
                    {car.fuelType === "Электро" ? car.fuelType : `${formattedEngineVolume} ${car.fuelType}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-600 dark:text-gray-400">КПП</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[60%] text-right">{car.transmission}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
