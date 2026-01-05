"use client"

import { useState, useMemo } from "react"
import CarCard from "@/components/car-card"
import MobileCarStack from "@/components/mobile-car-stack"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Zap, CircleDollarSign, ShieldCheck } from "lucide-react"

export interface Car {
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
  createdAt?: { seconds: number } | any
  [key: string]: any
}

interface DynamicSelectionProps {
  cars: Car[]
}

export default function DynamicSelection({ cars }: DynamicSelectionProps) {
  // Фильтруем только доступные автомобили
  const availableCars = useMemo(() => {
    return cars.filter(car =>
      car.isAvailable !== false && car.status !== 'sold'
    )
  }, [cars])

  // Функция для получения "случайных" авто, которые меняются раз в сутки
  const getDailyRandomCars = (filteredCars: Car[], count: number = 5) => {
    if (filteredCars.length <= count) return filteredCars;

    // Используем дату как seed
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Перемешиваем массив детерминированно
    const shuffled = [...filteredCars].sort((a, b) => {
      // Простой хеш от ID + seed
      const hashA = (a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      const hashB = (b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      return hashA - hashB;
    });

    return shuffled.slice(0, count);
  };

  // Категории (tabs) - обновленные критерии
  const categories = [
    {
      id: "suv",
      label: "Внедорожники",
      icon: ShieldCheck,
      filter: (cars: Car[]) => getDailyRandomCars(cars.filter(car =>
        (car.bodyType?.toLowerCase().includes("внедорожник") || car.bodyType?.toLowerCase().includes("кроссовер") || car.bodyType?.toLowerCase().includes("suv"))
      ))
    },
    {
      id: "fresh",
      label: "Свежие",
      icon: Sparkles,
      filter: (cars: Car[]) => {
        // Свежие сортируем по году и дате добавления, тут не нужен рандом, нужны САМЫЕ новые
        return [...cars].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year; // Сначала по году
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Потом по дате добавления
        }).slice(0, 5);
      }
    },
    {
      id: "electric",
      label: "Электро и Гибриды",
      icon: Zap,
      filter: (cars: Car[]) => getDailyRandomCars(cars.filter(car =>
        ["электро", "гибрид"].includes(car.fuelType?.toLowerCase())
      ))
    },
    {
      id: "budget",
      label: "До 6 000 $",
      icon: CircleDollarSign,
      filter: (cars: Car[]) => getDailyRandomCars(cars.filter(car => car.price <= 6000))
    }
  ]

  const [activeTab, setActiveTab] = useState("suv")

  return (
    <section className="py-16 bg-white dark:bg-black relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Подобрали для вас
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl text-sm md:text-base">
            Мы собрали лучшие предложения в самых популярных категориях
          </p>
        </div>

        {/* Improved Tabs UI */}
        <div className="flex justify-center mb-8 md:mb-12">
          {/* Mobile: Scrollable container */}
          <div className="md:hidden w-full overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 flex justify-start snap-x">
             <div className="flex flex-nowrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`
                      snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                      ${activeTab === cat.id
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md"
                        : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-zinc-800"}
                    `}
                  >
                    <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? "text-white dark:text-gray-900" : "opacity-70"}`} />
                    {cat.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Desktop: Centered wrapped container */}
          <div className="hidden md:inline-flex flex-wrap justify-center gap-2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800">
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

                {/* Desktop View: Grid */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {cat.filter(availableCars).length > 0 ? (
                    cat.filter(availableCars).map((car) => {
                       const safeCar = { ...car, currency: car.currency || 'USD', engineVolume: Number(car.engineVolume) || 0 };
                       return <CarCard key={`${cat.id}-${car.id}`} car={safeCar} />
                    })
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

                {/* Mobile View: Swipeable Stack */}
                <div className="md:hidden">
                  {cat.filter(availableCars).length > 0 ? (
                    <MobileCarStack cars={cat.filter(availableCars)} />
                  ) : (
                    <div className="py-12 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-sm mb-4">
                        <cat.icon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Пусто
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                        В этой категории пока нет авто.
                      </p>
                      <Button variant="outline" size="sm" className="mt-4 rounded-xl" asChild>
                        <Link href="/catalog">В каталог</Link>
                      </Button>
                    </div>
                  )}
                </div>

                {cat.filter(availableCars).length > 0 && (
                  <div className="mt-10 flex justify-center hidden md:flex">
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

                {cat.filter(availableCars).length > 0 && (
                  <div className="mt-6 flex justify-center md:hidden">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-xl px-6 py-5 text-sm font-semibold w-full max-w-xs"
                      asChild
                    >
                      <Link href="/catalog">
                        Смотреть все <ArrowRight className="w-4 h-4" />
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
