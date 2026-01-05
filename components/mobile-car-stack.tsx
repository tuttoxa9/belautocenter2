"use client"

import { useRef } from "react"
import CarCard from "@/components/car-card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  bodyType?: string
  imageUrls: string[]
  isAvailable: boolean
  fromEurope?: boolean
  status?: string
  [key: string]: any
}

interface MobileCarStackProps {
  cars: Car[]
}

export default function MobileCarStack({ cars }: MobileCarStackProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!cars || cars.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.85 // Scroll by approx one card width
      const targetScroll =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="w-full py-6">
      <div
        ref={scrollContainerRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cars.map((car) => {
             const safeCar = {
                ...car,
                currency: car.currency || 'USD',
                engineVolume: Number(car.engineVolume) || 0
              }

            return (
              <div
                key={car.id}
                className="snap-center shrink-0 w-[85vw] max-w-sm"
              >
                 <div className="h-full w-full rounded-2xl overflow-hidden shadow-md bg-transparent">
                    <CarCard car={safeCar} />
                 </div>
              </div>
            )
        })}
      </div>

      <div className="flex justify-center items-center gap-6 mt-2">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
          onClick={() => scroll("left")}
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Назад</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
          onClick={() => scroll("right")}
        >
          <ArrowRight className="h-6 w-6" />
          <span className="sr-only">Вперед</span>
        </Button>
      </div>
    </div>
  )
}
