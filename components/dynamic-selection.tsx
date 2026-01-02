"use client"

import { useState, useMemo } from "react"
import CarCard from "@/components/car-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingDown, Diamond, Globe } from "lucide-react"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  transmission: string
  imageUrls: string[]
  isAvailable: boolean
  fromEurope?: boolean
  createdAt?: { seconds: number } | any
  [key: string]: any
}

interface DynamicSelectionProps {
  cars: Car[]
}

export default function DynamicSelection({ cars }: DynamicSelectionProps) {
  // Фильтруем только доступные автомобили
  const availableCars = useMemo(() => {
    return cars.filter(car => car.isAvailable !== false)
  }, [cars])

  // Категории (tabs)
  const categories = [
    {
      id: "new",
      label: "Свежие",
      icon: Sparkles,
      filter: (cars: Car[]) => [...cars].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0
        const timeB = b.createdAt?.seconds || 0
        return timeB - timeA
      }).slice(0, 4)
    },
    {
      id: "budget",
      label: "До 15 000 $",
      icon: TrendingDown,
      filter: (cars: Car[]) => cars.filter(car => car.price <= 15000).slice(0, 4)
    },
    {
      id: "premium",
      label: "Премиум",
      icon: Diamond,
      filter: (cars: Car[]) => cars.filter(car => car.price > 30000).slice(0, 4)
    },
    {
      id: "europe",
      label: "Из Европы",
      icon: Globe,
      filter: (cars: Car[]) => cars.filter(car => car.fromEurope === true).slice(0, 4)
    }
  ]

  const [activeTab, setActiveTab] = useState("new")

  return (
    <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Подобрали для вас
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Лучшие предложения в популярных категориях
            </p>
          </div>

          <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                  ${activeTab === cat.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700"}
                `}
              >
                <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? "text-white" : "text-gray-400"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
           {categories.map((cat) => (
             <div key={cat.id} className={activeTab === cat.id ? "block animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {cat.filter(availableCars).length > 0 ? (
                    cat.filter(availableCars).map((car) => (
                      <CarCard key={`${cat.id}-${car.id}`} car={car} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 mb-4">
                        <cat.icon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        В этой категории пока пусто
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Попробуйте выбрать другую категорию или посмотрите весь каталог
                      </p>
                    </div>
                  )}
                </div>

                {cat.filter(availableCars).length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="ghost" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" asChild>
                      <Link href="/catalog">
                        Показать больше <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                )}
             </div>
           ))}
        </div>

      </div>
    </section>
  )
}
