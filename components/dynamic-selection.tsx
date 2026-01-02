"use client"

import { useState, useMemo } from "react"
import CarCard from "@/components/car-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CarFront, Zap, CircleDollarSign, ShieldCheck } from "lucide-react"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  transmission: string
  bodyType?: string
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

  // Категории (tabs) - обновленные критерии
  const categories = [
    {
      id: "suv",
      label: "Внедорожники",
      icon: ShieldCheck,
      filter: (cars: Car[]) => cars.filter(car =>
        (car.bodyType?.toLowerCase().includes("внедорожник") || car.bodyType?.toLowerCase().includes("кроссовер") || car.bodyType?.toLowerCase().includes("suv"))
      ).slice(0, 4)
    },
    {
      id: "sedan",
      label: "Седаны",
      icon: CarFront,
      filter: (cars: Car[]) => cars.filter(car =>
        car.bodyType?.toLowerCase().includes("седан")
      ).slice(0, 4)
    },
    {
      id: "electric",
      label: "Электро и Гибриды",
      icon: Zap,
      filter: (cars: Car[]) => cars.filter(car =>
        ["электро", "гибрид"].includes(car.fuelType?.toLowerCase())
      ).slice(0, 4)
    },
    {
      id: "budget",
      label: "До 20 000 $",
      icon: CircleDollarSign,
      filter: (cars: Car[]) => cars.filter(car => car.price <= 20000).slice(0, 4)
    }
  ]

  const [activeTab, setActiveTab] = useState("suv")

  return (
    <section className="py-16 bg-white dark:bg-black relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Подобрали для вас
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl">
            Мы собрали лучшие предложения в самых популярных категориях для вашего удобства
          </p>
        </div>

        {/* Improved Tabs UI */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-sm font-semibold transition-all duration-300
                  ${activeTab === cat.id
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md transform scale-[1.02]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50"}
                `}
              >
                <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? "text-blue-600 dark:text-blue-400" : "opacity-70"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
           {categories.map((cat) => (
             <div key={cat.id} className={activeTab === cat.id ? "block animate-in fade-in zoom-in-95 duration-500" : "hidden"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {cat.filter(availableCars).length > 0 ? (
                    cat.filter(availableCars).map((car) => (
                      <CarCard key={`${cat.id}-${car.id}`} car={car} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-6">
                        <cat.icon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        В этой категории пока пусто
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Мы постоянно обновляем наш каталог. Попробуйте выбрать другую категорию или посмотрите все автомобили.
                      </p>
                      <Button variant="outline" className="mt-6 rounded-xl" asChild>
                        <Link href="/catalog">Перейти в каталог</Link>
                      </Button>
                    </div>
                  )}
                </div>

                {cat.filter(availableCars).length > 0 && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      className="gap-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl px-8 py-6 text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                      asChild
                    >
                      <Link href="/catalog">
                        Смотреть все предложения <ArrowRight className="w-5 h-5" />
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
