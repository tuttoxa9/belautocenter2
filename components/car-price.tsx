"use client"

import { useState, useEffect } from "react"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn, cn } from "@/lib/utils"

interface CarPriceProps {
  carId: string
  initialPrice: number
  className?: string
  priceClassName?: string
  showByn?: boolean
}

export default function CarPrice({
  carId,
  initialPrice,
  className,
  priceClassName,
  showByn = true
}: CarPriceProps) {
  const [price, setPrice] = useState<number>(initialPrice)
  const usdBynRate = useUsdBynRate()

  useEffect(() => {
    // Делаем дополнительный запрос для 100% уверенности в актуальности цены
    // Запрос идет к нашему API, который берет данные из Vercel Cache
    const fetchLatestPrice = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}/price`)
        if (response.ok) {
          const data = await response.json()
          if (data.price !== null && data.price !== undefined) {
            setPrice(data.price)
          }
        }
      } catch (error) {
        console.error(`[CarPrice] Failed to fetch latest price for ${carId}:`, error)
      }
    }

    fetchLatestPrice()
  }, [carId])

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price)

  if (!price) return <span className={className}>Цена по запросу</span>

  return (
    <div className={cn("flex flex-col", className)}>
      <div className={cn("font-bold text-slate-900 dark:text-white", priceClassName)}>
        {formattedPrice}
      </div>
      {showByn && usdBynRate && (
        <div className="text-xs text-slate-500 dark:text-gray-400 font-medium">
          ≈ {convertUsdToByn(price, usdBynRate)} BYN
        </div>
      )}
    </div>
  )
}
