"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import CarCard from "@/components/car-card"
import { Filter, SlidersHorizontal, ArrowRight, X, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  driveTrain: string;
}

interface CatalogClientProps {
  initialCars: Car[]
}

export default function CatalogClient({ initialCars }: CatalogClientProps) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filteredCars, setFilteredCars] = useState<Car[]>(initialCars)
  const [displayedCars, setDisplayedCars] = useState<Car[]>([]) // Новое состояние для отображаемых авто
  const [loading, setLoading] = useState(initialCars.length === 0)
  const [loadingMore, setLoadingMore] = useState(false) // Состояние загрузки дополнительных авто
  const [currentPage, setCurrentPage] = useState(1) // Текущая страница
  const [carsPerPage] = useState(12) // Количество авто на странице
  const [hasMore, setHasMore] = useState(true) // Есть ли ещё авто для загрузки
  const [availableMakes, setAvailableMakes] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [filters, setFilters] = useState({
    priceFrom: "",
    priceTo: "",
    make: "all",
    model: "all",
    yearFrom: "",
    yearTo: "",
    mileageFrom: "",
    mileageTo: "",
    transmission: "any",
    fuelType: "any",
    driveTrain: "any",
  })
  const [sortBy, setSortBy] = useState("year-asc") // Изменили по умолчанию на "сначала старые"
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Загружаем данные на клиенте, если они не были предзагружены
  useEffect(() => {
    if (initialCars.length === 0) {
      loadCarsFromCloudflare()
    }
  }, [initialCars.length])

  const loadCarsFromCloudflare = async () => {
    try {
      setLoading(true)

      // Используем прямой вызов Firestore (исключены vercel functions)
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-Direct-Firestore/1.0'
        }
      })

      if (!response.ok) {
        console.error(`Failed to fetch cars: ${response.status}`)
        return
      }

      const data = await response.json()

      let processedCars: Car[]

      if (data.documents) {
        // Формат прямого Firestore API
        processedCars = data.documents
          .map((doc: any) => {
            const id = doc.name.split('/').pop() || ''
            const fields: Record<string, any> = {}

            for (const [key, value] of Object.entries(doc.fields || {})) {
              fields[key] = convertFieldValue(value)
            }

            return { id, ...fields }
          })
          .filter((car: any) => car.isAvailable !== false)
      } else if (Array.isArray(data)) {
        // Формат Cloudflare Worker (уже обработанные данные)
        processedCars = data.filter((car: any) => car.isAvailable !== false)
      } else {
        processedCars = []
      }

      setCars(processedCars)
      setFilteredCars(processedCars)
    } catch (error) {
      console.error('Error loading cars:', error)
    } finally {
      setLoading(false)
    }
  }

  // Функция для конвертации значения поля из формата Firestore
  const convertFieldValue = (value: any): any => {
    if (value.stringValue !== undefined) {
      return value.stringValue
    } else if (value.integerValue !== undefined) {
      return parseInt(value.integerValue)
    } else if (value.doubleValue !== undefined) {
      return parseFloat(value.doubleValue)
    } else if (value.booleanValue !== undefined) {
      return value.booleanValue
    } else if (value.timestampValue !== undefined) {
      return new Date(value.timestampValue)
    } else if (value.arrayValue !== undefined) {
      return value.arrayValue.values?.map((v: any) => convertFieldValue(v)) || []
    } else if (value.mapValue !== undefined) {
      const result: Record<string, any> = {}
      for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
        result[k] = convertFieldValue(v)
      }
      return result
    } else if (value.nullValue !== undefined) {
      return null
    }
    return value
  }

  // Инициализация доступных марок и моделей
  useEffect(() => {
    const uniqueMakes = [...new Set(cars.map(car => car.make))].sort()
    setAvailableMakes(uniqueMakes)

    const uniqueModels = [...new Set(cars.map(car => car.model))].sort()
    setAvailableModels(uniqueModels)
  }, [cars])

  // Динамическое обновление доступных моделей при изменении марки
  useEffect(() => {
    if (filters.make === "all") {
      const allModels = [...new Set(cars.map(car => car.model))].sort()
      setAvailableModels(allModels)
    } else {
      const modelsForMake = [...new Set(cars.filter(car => car.make === filters.make).map(car => car.model))].sort()
      setAvailableModels(modelsForMake)
      // Сбрасываем модель если она не доступна для выбранной марки
      if (filters.model !== "all" && !modelsForMake.includes(filters.model)) {
        setFilters(prev => ({ ...prev, model: "all" }))
      }
    }
  }, [filters.make, cars])

  const applyFilters = useCallback(() => {
    if (!cars || cars.length === 0) {
      setFilteredCars([]);
      setDisplayedCars([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }

    const filtered = cars.filter((car) => {
      // Добавляем проверки на null и undefined для всех полей
      if (!car) return false;

      const carPrice = car.price || 0;
      const carYear = car.year || 0;
      const carMileage = car.mileage || 0;

      // Безопасный парсинг чисел с защитой от NaN
      const priceFrom = filters.priceFrom ? Number.parseInt(filters.priceFrom) || 0 : 0;
      const priceTo = filters.priceTo ? Number.parseInt(filters.priceTo) || 0 : 0;
      const yearFrom = filters.yearFrom ? Number.parseInt(filters.yearFrom) || 0 : 0;
      const yearTo = filters.yearTo ? Number.parseInt(filters.yearTo) || 0 : 0;
      const mileageFrom = filters.mileageFrom ? Number.parseInt(filters.mileageFrom) || 0 : 0;
      const mileageTo = filters.mileageTo ? Number.parseInt(filters.mileageTo) || 0 : 0;

      return (
        (filters.priceFrom === "" || priceFrom === 0 || carPrice >= priceFrom) &&
        (filters.priceTo === "" || priceTo === 0 || carPrice <= priceTo) &&
        (filters.make === "all" || car.make === filters.make) &&
        (filters.model === "all" || car.model === filters.model) &&
        (filters.yearFrom === "" || yearFrom === 0 || carYear >= yearFrom) &&
        (filters.yearTo === "" || yearTo === 0 || carYear <= yearTo) &&
        (filters.mileageFrom === "" || mileageFrom === 0 || carMileage >= mileageFrom) &&
        (filters.mileageTo === "" || mileageTo === 0 || carMileage <= mileageTo) &&
        (filters.transmission === "any" || car.transmission === filters.transmission) &&
        (filters.fuelType === "any" || car.fuelType === filters.fuelType) &&
        (filters.driveTrain === "any" || car.driveTrain === filters.driveTrain)
      )
    })

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0)
        case "price-desc":
          return (b.price || 0) - (a.price || 0)
        case "year-desc":
          return b.year - a.year
        case "year-asc":
          return a.year - b.year
        case "mileage-asc":
          return a.mileage - b.mileage
        case "mileage-desc":
          return b.mileage - a.mileage
        default:
          return 0
      }
    })

    setFilteredCars(filtered)
    // Сбрасываем пагинацию при применении фильтров
    setCurrentPage(1)
    const initialDisplayed = filtered.slice(0, carsPerPage)
    setDisplayedCars(initialDisplayed)
    setHasMore(filtered.length > carsPerPage)
  }, [cars, filters, sortBy, carsPerPage])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Функция для загрузки дополнительных авто
  const loadMoreCars = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Имитируем небольшую задержку для UX
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = currentPage * carsPerPage
      const endIndex = startIndex + carsPerPage
      const newCars = filteredCars.slice(startIndex, endIndex)

      if (newCars.length > 0) {
        setDisplayedCars(prev => [...prev, ...newCars])
        setCurrentPage(nextPage)
        setHasMore(endIndex < filteredCars.length)
      } else {
        setHasMore(false)
      }

      setLoadingMore(false)
    }, 300)
  }, [currentPage, carsPerPage, filteredCars, loadingMore, hasMore])

  const resetFilters = () => {
    setFilters({
      priceFrom: "",
      priceTo: "",
      make: "all",
      model: "all",
      yearFrom: "",
      yearTo: "",
      mileageFrom: "",
      mileageTo: "",
      transmission: "any",
      fuelType: "any",
      driveTrain: "any",
    })
  }

  const hasActiveFilters = () => {
    return filters.priceFrom !== "" || filters.priceTo !== "" || filters.make !== "all" ||
           filters.model !== "all" || filters.yearFrom !== "" || filters.yearTo !== "" ||
           filters.mileageFrom !== "" || filters.mileageTo !== "" || filters.transmission !== "any" ||
           filters.fuelType !== "any" || filters.driveTrain !== "any"
  }

  // Мобильные фильтры компонент
  const MobileFilters = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {/* Марка */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Марка</Label>
        <Select
          value={filters.make}
          onValueChange={(value) => setFilters({ ...filters, make: value })}
          disabled={availableMakes.length === 0}
        >
          <SelectTrigger className="border border-gray-200 bg-white h-11 text-base">
            <SelectValue placeholder="Выберите марку" />
          </SelectTrigger>
          <SelectContent className="border-gray-200 shadow-lg">
            <SelectItem value="all" className="text-base py-3">Все марки</SelectItem>
            {availableMakes.length > 0 && availableMakes.map(make => (
              <SelectItem key={make} value={make} className="text-base py-3">{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Модель */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Модель</Label>
        <Select
          value={filters.model}
          onValueChange={(value) => setFilters({ ...filters, model: value })}
          disabled={filters.make === "all" || availableModels.length === 0}
        >
          <SelectTrigger className="border border-gray-200 bg-white h-11 text-base">
            <SelectValue placeholder={filters.make === "all" ? "Сначала выберите марку" : "Выберите модель"} />
          </SelectTrigger>
          <SelectContent className="border-gray-200 shadow-lg">
            <SelectItem value="all" className="text-base py-3">Все модели</SelectItem>
            {availableModels.length > 0 && availableModels.map(model => (
              <SelectItem key={model} value={model} className="text-base py-3">{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Цена */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Цена ($)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="От"
            value={filters.priceFrom}
            onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
            className="border border-gray-200 bg-white h-11 text-base"
          />
          <Input
            type="number"
            placeholder="До"
            value={filters.priceTo}
            onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
            className="border border-gray-200 bg-white h-11 text-base"
          />
        </div>
      </div>

      {/* Год */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Год выпуска</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="От"
            value={filters.yearFrom}
            onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
            className="border border-gray-200 bg-white h-11 text-base"
          />
          <Input
            type="number"
            placeholder="До"
            value={filters.yearTo}
            onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
            className="border border-gray-200 bg-white h-11 text-base"
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex space-x-3 pt-4">
        <Button
          onClick={() => {
            setIsFilterOpen(false)
          }}
          className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
        >
          Применить
        </Button>
        <Button
          onClick={() => {
            resetFilters()
            setIsFilterOpen(false)
          }}
          variant="outline"
          className="flex-1 h-11 bg-white border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Сбросить
        </Button>
      </div>
    </div>
  )

  // Десктопные фильтры компонент
  const DesktopFilters = () => (
    <Card className="sticky top-24 border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-200/50 py-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-900 font-medium text-lg">Фильтры</span>
          {hasActiveFilters() && (
            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Марка и Модель в одном ряду */}
        <div className="grid grid-cols-1 gap-4">
          {/* Марка */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Марка</Label>
            <Select
              value={filters.make}
              onValueChange={(value) => setFilters({ ...filters, make: value })}
              disabled={availableMakes.length === 0}
            >
              <SelectTrigger className="border border-gray-200 bg-white h-9 text-sm rounded-lg">
                <SelectValue placeholder="Выберите марку" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="all">Все марки</SelectItem>
                {availableMakes.map(make => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Модель */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Модель</Label>
            <Select
              value={filters.model}
              onValueChange={(value) => setFilters({ ...filters, model: value })}
              disabled={filters.make === "all" || availableModels.length === 0}
            >
              <SelectTrigger className="border border-gray-200 bg-white h-9 text-sm rounded-lg">
                <SelectValue placeholder={filters.make === "all" ? "Сначала выберите марку" : "Выберите модель"} />
              </SelectTrigger>
              <SelectContent className="border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="all">Все модели</SelectItem>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Цена */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Цена ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="От"
              value={filters.priceFrom}
              onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
            <Input
              type="number"
              placeholder="До"
              value={filters.priceTo}
              onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Год и Пробег в одном ряду */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Год от</Label>
            <Input
              type="number"
              placeholder="2010"
              value={filters.yearFrom}
              onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Год до</Label>
            <Input
              type="number"
              placeholder="2024"
              value={filters.yearTo}
              onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Пробег */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Пробег (тыс. км)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="От"
              value={filters.mileageFrom}
              onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
            <Input
              type="number"
              placeholder="До"
              value={filters.mileageTo}
              onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
              className="border border-gray-200 bg-white h-9 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Дополнительные фильтры в компактном виде */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Коробка передач</Label>
          <Select
            value={filters.transmission}
            onValueChange={(value) => setFilters({ ...filters, transmission: value })}
          >
            <SelectTrigger className="border border-gray-200 bg-white h-9 text-sm rounded-lg">
              <SelectValue placeholder="Любая" />
            </SelectTrigger>
            <SelectContent className="border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="any">Любая</SelectItem>
              <SelectItem value="Механика">Механика</SelectItem>
              <SelectItem value="Автомат">Автомат</SelectItem>
              <SelectItem value="Вариатор">Вариатор</SelectItem>
              <SelectItem value="Робот">Робот</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Тип топлива</Label>
          <Select
            value={filters.fuelType}
            onValueChange={(value) => setFilters({ ...filters, fuelType: value })}
          >
            <SelectTrigger className="border border-gray-200 bg-white h-9 text-sm rounded-lg">
              <SelectValue placeholder="Любой" />
            </SelectTrigger>
            <SelectContent className="border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="any">Любой</SelectItem>
              <SelectItem value="Бензин">Бензин</SelectItem>
              <SelectItem value="Дизель">Дизель</SelectItem>
              <SelectItem value="Гибрид">Гибрид</SelectItem>
              <SelectItem value="Электро">Электро</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Привод</Label>
          <Select
            value={filters.driveTrain}
            onValueChange={(value) => setFilters({ ...filters, driveTrain: value })}
          >
            <SelectTrigger className="border border-gray-200 bg-white h-9 text-sm rounded-lg">
              <SelectValue placeholder="Любой" />
            </SelectTrigger>
            <SelectContent className="border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="any">Любой</SelectItem>
              <SelectItem value="Передний">Передний</SelectItem>
              <SelectItem value="Задний">Задний</SelectItem>
              <SelectItem value="Полный">Полный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-3">
          <Button
            onClick={applyFilters}
            className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Применить фильтры
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors" prefetch={true}>
                Главная
              </Link>
            </li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li className="text-gray-900 font-medium">Каталог</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Мобильная кнопка фильтров */}
          <div className="lg:hidden mb-6">
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 bg-white border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                  {hasActiveFilters() && (
                    <span className="ml-2 w-2 h-2 bg-slate-500 rounded-full"></span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm rounded-2xl border border-gray-200 bg-white">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-lg font-medium text-gray-900">Фильтры поиска</DialogTitle>
                </DialogHeader>
                <MobileFilters />
              </DialogContent>
            </Dialog>
          </div>

          {/* Десктопные фильтры */}
          <div className="lg:w-80 hidden lg:block">
            <DesktopFilters />
          </div>

          {/* Основная область */}
          <div className="flex-1">
            {/* Сортировка и результаты */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог автомобилей</h1>
                <p className="text-gray-600">
                  Найдено {loading ? (
                    <span className="inline-block bg-gray-200 rounded h-4 w-6 align-middle animate-pulse mx-2"></span>
                  ) : (
                    filteredCars.length
                  )} автомобилей
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                <div className="flex items-center space-x-2 px-3">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-0 bg-transparent h-9 text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 shadow-lg rounded-lg">
                      <SelectItem value="year-asc">Год: сначала старые</SelectItem>
                      <SelectItem value="year-desc">Год: сначала новые</SelectItem>
                      <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                      <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                      <SelectItem value="mileage-asc">Пробег: по возрастанию</SelectItem>
                      <SelectItem value="mileage-desc">Пробег: по убыванию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Сетка автомобилей */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCars && filteredCars.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {displayedCars.map((car, index) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>

                {/* Кнопка "Показать ещё" */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={loadMoreCars}
                      disabled={loadingMore}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Загружаем...
                        </>
                      ) : (
                        <>
                          Показать ещё
                          <span className="text-sm text-slate-300">
                            ({Math.min(carsPerPage, filteredCars.length - displayedCars.length)} из {filteredCars.length - displayedCars.length})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Информация о загруженных автомобилях */}
                {!hasMore && displayedCars.length > 0 && displayedCars.length === filteredCars.length && (
                  <div className="text-center pt-6">
                    <p className="text-gray-500">
                      Показаны все найденные автомобили ({filteredCars.length})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {cars.length === 0 ? "Автомобили не добавлены в каталог" : "По вашим критериям автомобили не найдены"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {cars.length === 0 ? "Скоро здесь появятся новые автомобили" : "Попробуйте изменить параметры поиска"}
                </p>
                {cars.length > 0 && (
                  <Button
                    onClick={() => {
                      resetFilters()
                      setCurrentPage(1)
                      setHasMore(true)
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
