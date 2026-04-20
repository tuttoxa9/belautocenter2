"use client"

import { useState, useEffect } from "react"
import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { convertUsdToByn, cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreditCalculator } from "@/hooks/use-credit-calculator"

interface CarPriceProps {
  carId: string
  initialPrice: number
  className?: string
  priceClassName?: string
  usdPriceClassName?: string
  showByn?: boolean
  showCredit?: boolean
  showDisclaimer?: boolean
}

export default function CarPrice({
  carId,
  initialPrice,
  className,
  priceClassName,
  usdPriceClassName,
  showByn = true,
  showCredit = true,
  showDisclaimer = false
}: CarPriceProps) {
  const [price, setPrice] = useState<number>(initialPrice)
  const usdBynRate = useUsdBynRate()
  const creditData = useCreditCalculator(price)

  useEffect(() => {
    // Делаем дополнительный запрос для 100% уверенности в актуальности цены
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

  const isLoading = showByn && !usdBynRate

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className={cn("h-[1.25em] bg-slate-200 dark:bg-zinc-800 rounded animate-pulse w-32", priceClassName)} />
        <div className={cn("h-[1em] bg-slate-200 dark:bg-zinc-800 rounded animate-pulse w-24", usdPriceClassName)} />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {showByn && usdBynRate ? (
        <>
          <div className={cn("font-bold text-slate-900 dark:text-white", priceClassName)}>
            {convertUsdToByn(price, usdBynRate)} BYN
          </div>
          <div className={cn("text-[10px] text-slate-500 dark:text-gray-400 font-medium self-start", usdPriceClassName)}>
            ≈ {formattedPrice} 
            {showDisclaimer && (
              <span className="opacity-70 font-normal ml-1">(не является средством расчёта)</span>
            )}
          </div>
          {showCredit && creditData && creditData.monthlyPayment > 0 && (
            <div className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-1">
              от {creditData.monthlyPayment} BYN/мес
            </div>
          )}
        </>
      ) : (
        <div className={cn("font-bold text-slate-900 dark:text-white", priceClassName)}>
          {formattedPrice}
        </div>
      )}
    </div>
  )
}
