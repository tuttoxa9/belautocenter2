"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn } from "@/lib/utils"

interface CarCardProps {
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
  }
}

export default function CarCard({ car }: CarCardProps) {
  const usdBynRate = useUsdBynRate()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [shouldLoadImage, setShouldLoadImage] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Отладочная информация для проверки данных автомобиля
  console.log(`Отрисовка карточки: ${car.make} ${car.model}`, {
    id: car.id,
    imageUrls: car.imageUrls,
    firstImage: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : null
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadImage) {
            setShouldLoadImage(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '100px', // Начинаем загрузку за 100px до появления
        threshold: 0.1
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [shouldLoadImage])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("ru-BY").format(mileage)
  }

  const formatEngineVolume = (volume: number) => {
    // Всегда показываем с одним знаком после запятой (3.0, 2.5, 1.6)
    return volume.toFixed(1)
  }

  return (
    <Card ref={cardRef} className="overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl h-full group transition-all duration-200">
      <Link href={`/catalog/${car.id}`} className="block h-full">
        {/* Image Section */}
        <div className="relative">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-200/60 rounded-t-2xl h-56">
            {shouldLoadImage ? (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-pulse" />
                )}
                <Image
                  src={getCachedImageUrl(car.imageUrls[0] || "/placeholder.svg?height=200&width=280")}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className={`object-cover group-hover:scale-102 transition-all duration-300 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </>
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <div className="w-12 h-12 bg-slate-300 rounded-full animate-pulse" />
              </div>
            )}



            {/* Year */}
            <div className="absolute top-3 right-3">
              <span className="bg-black/75 text-white text-xs font-medium px-2 py-1 rounded">
                {car.year}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3 space-y-2">
          {/* Header - более компактный */}
          <div className="mb-2">
            <h3 className="font-semibold text-slate-900 text-base leading-tight mb-1 group-hover:text-slate-700 transition-colors">
              {car.make} {car.model}
            </h3>
            <div className="font-bold text-slate-900 text-lg">
              {car?.price ? formatPrice(car.price) : 'Цена по запросу'}
            </div>
            {usdBynRate && car?.price && (
              <div className="text-xs text-slate-500 font-medium">
                ≈ {convertUsdToByn(car.price, usdBynRate)} BYN
              </div>
            )}
          </div>

          {/* Specs - более компактные */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Пробег</span>
              <span className="font-medium text-slate-900">{formatMileage(car.mileage)} км</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Двигатель</span>
              <span className="font-medium text-slate-900">
                {car.fuelType === "Электро" ? car.fuelType : `${formatEngineVolume(car.engineVolume)} ${car.fuelType}`}
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
}
