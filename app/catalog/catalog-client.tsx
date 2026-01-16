"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import CarCard from "@/components/car-card"
import { Filter, SlidersHorizontal, ArrowRight, X, RotateCcw, Search } from "lucide-react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  engineVolume: number;
  fuelType: string;
  transmission: string;
  imageUrls: string[];
  isAvailable: boolean;
  fromEurope?: boolean;
}

interface CatalogClientProps {
  initialCars: Car[]
}

const MobileFiltersContent = ({ filters, setFilters, availableMakes, availableModels }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Марка</Label>
      <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })} disabled={availableMakes.length === 0}>
        <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-11 text-base"><SelectValue placeholder="Выберите марку" /></SelectTrigger>
        <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <SelectItem value="all" className="text-base py-3">Все марки</SelectItem>
          {availableMakes.map(make => <SelectItem key={make} value={make} className="text-base py-3">{make}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Модель</Label>
      <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })} disabled={filters.make === "all" || availableModels.length === 0}>
        <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-11 text-base"><SelectValue placeholder={filters.make === "all" ? "Сначала выберите марку" : "Выберите модель"} /></SelectTrigger>
        <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <SelectItem value="all" className="text-base py-3">Все модели</SelectItem>
          {availableModels.map(model => <SelectItem key={model} value={model} className="text-base py-3">{model}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Цена ($)</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="От" value={filters.priceFrom} onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
        <Input type="number" placeholder="До" value={filters.priceTo} onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
      </div>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Год выпуска</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="От" value={filters.yearFrom} onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
        <Input type="number" placeholder="До" value={filters.yearTo} onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
      </div>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Пробег (тыс. км)</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="От" value={filters.mileageFrom} onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
        <Input type="number" placeholder="До" value={filters.mileageTo} onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-11 text-base" />
      </div>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Коробка передач</Label>
      <Select value={filters.transmission} onValueChange={(value) => setFilters({ ...filters, transmission: value })}>
        <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-11 text-base"><SelectValue placeholder="Любая" /></SelectTrigger>
        <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <SelectItem value="any" className="text-base py-3">Любая</SelectItem>
          <SelectItem value="Механика" className="text-base py-3">Механика</SelectItem>
          <SelectItem value="Автомат" className="text-base py-3">Автомат</SelectItem>
          <SelectItem value="Вариатор" className="text-base py-3">Вариатор</SelectItem>
          <SelectItem value="Робот" className="text-base py-3">Робот</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Тип топлива</Label>
      <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
        <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-11 text-base"><SelectValue placeholder="Любой" /></SelectTrigger>
        <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <SelectItem value="any" className="text-base py-3">Любой</SelectItem>
          <SelectItem value="Бензин" className="text-base py-3">Бензин</SelectItem>
          <SelectItem value="Дизель" className="text-base py-3">Дизель</SelectItem>
          <SelectItem value="Гибрид" className="text-base py-3">Гибрид</SelectItem>
          <SelectItem value="Электро" className="text-base py-3">Электро</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Привод</Label>
      <Select value={filters.driveTrain} onValueChange={(value) => setFilters({ ...filters, driveTrain: value })}>
        <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-11 text-base"><SelectValue placeholder="Любой" /></SelectTrigger>
        <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
          <SelectItem value="any" className="text-base py-3">Любой</SelectItem>
          <SelectItem value="Передний" className="text-base py-3">Передний</SelectItem>
          <SelectItem value="Задний" className="text-base py-3">Задний</SelectItem>
          <SelectItem value="Полный" className="text-base py-3">Полный</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="fromEuropeOnly"
        checked={filters.fromEuropeOnly}
        onChange={(e) => setFilters({ ...filters, fromEuropeOnly: e.target.checked })}
      />
      <Label htmlFor="fromEuropeOnly">Без пробега по РБ</Label>
    </div>
  </div>
);

const MobileFiltersFooter = ({ applyFilters, resetFilters, setIsFilterOpen }) => (
  <div className="flex space-x-3">
    <Button onClick={() => { applyFilters(); setIsFilterOpen(false) }} className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Применить</Button>
    <Button onClick={() => { resetFilters(); setIsFilterOpen(false) }} variant="outline" className="flex-1 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><RotateCcw className="h-4 w-4 mr-2" />Сбросить</Button>
  </div>
);

const DesktopFilters = ({ filters, setFilters, availableMakes, availableModels, hasActiveFilters, resetFilters, applyFilters }) => (
  <Card className="sticky top-24 border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
    <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 py-4">
      <CardTitle className="flex items-center justify-between">
        <span className="text-gray-900 dark:text-white font-medium text-lg">Фильтры</span>
        {hasActiveFilters() && <Button onClick={resetFilters} variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-8 w-8 p-0 rounded-lg"><X className="h-4 w-4" /></Button>}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 p-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Марка</Label>
        <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })} disabled={availableMakes.length === 0}>
          <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-9 text-sm rounded-lg"><SelectValue placeholder="Выберите марку" /></SelectTrigger>
          <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg rounded-lg">
            <SelectItem value="all">Все марки</SelectItem>
            {availableMakes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Модель</Label>
        <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })} disabled={filters.make === "all" || availableModels.length === 0}>
          <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-9 text-sm rounded-lg"><SelectValue placeholder={filters.make === "all" ? "Сначала выберите марку" : "Выберите модель"} /></SelectTrigger>
          <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg rounded-lg">
            <SelectItem value="all">Все модели</SelectItem>
            {availableModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Цена ($)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="От" value={filters.priceFrom} onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
          <Input type="number" placeholder="До" value={filters.priceTo} onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Год выпуска</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="От" value={filters.yearFrom} onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
          <Input type="number" placeholder="До" value={filters.yearTo} onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Пробег (тыс. км)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="От" value={filters.mileageFrom} onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
          <Input type="number" placeholder="До" value={filters.mileageTo} onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 h-9 text-sm rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Коробка</Label>
          <Select value={filters.transmission} onValueChange={(value) => setFilters({ ...filters, transmission: value })}>
            <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-9 text-sm rounded-lg"><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="any">Любая</SelectItem>
              <SelectItem value="Механика">Механика</SelectItem>
              <SelectItem value="Автомат">Автомат</SelectItem>
              <SelectItem value="Вариатор">Вариатор</SelectItem>
              <SelectItem value="Робот">Робот</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Топливо</Label>
          <Select value={filters.fuelType} onValueChange={(value) => setFilters({ ...filters, fuelType: value })}>
            <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-9 text-sm rounded-lg"><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="any">Любой</SelectItem>
              <SelectItem value="Бензин">Бензин</SelectItem>
              <SelectItem value="Дизель">Дизель</SelectItem>
              <SelectItem value="Гибрид">Гибрид</SelectItem>
              <SelectItem value="Электро">Электро</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Привод</Label>
          <Select value={filters.driveTrain} onValueChange={(value) => setFilters({ ...filters, driveTrain: value })}>
            <SelectTrigger className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-9 text-sm rounded-lg"><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="any">Любой</SelectItem>
              <SelectItem value="Передний">Передний</SelectItem>
              <SelectItem value="Задний">Задний</SelectItem>
              <SelectItem value="Полный">Полный</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="fromEuropeOnlyDesktop"
          checked={filters.fromEuropeOnly}
          onChange={(e) => setFilters({ ...filters, fromEuropeOnly: e.target.checked })}
        />
        <Label htmlFor="fromEuropeOnlyDesktop">Без пробега по РБ</Label>
      </div>
      <div className="pt-3">
        <Button onClick={applyFilters} className="w-full h-9 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">Применить фильтры</Button>
      </div>
    </CardContent>
  </Card>
);

export default function CatalogClient({ initialCars }: CatalogClientProps) {
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [filteredCars, setFilteredCars] = useState<Car[]>(initialCars)
  const [displayedCars, setDisplayedCars] = useState<Car[]>([])
  const [loading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [carsPerPage] = useState(12)
  const [hasMore, setHasMore] = useState(true)
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
    fromEuropeOnly: false,
  })
  const [sortBy, setSortBy] = useState("date-desc")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setCars(initialCars)
    setFilteredCars(initialCars)
  }, [initialCars])

  useEffect(() => {
    const uniqueMakes = [...new Set(cars.map(car => car.make))].sort()
    setAvailableMakes(uniqueMakes)
    const uniqueModels = [...new Set(cars.map(car => car.model))].sort()
    setAvailableModels(uniqueModels)
  }, [cars])

  useEffect(() => {
    if (filters.make === "all") {
      const allModels = [...new Set(cars.map(car => car.model))].sort()
      setAvailableModels(allModels)
    } else {
      const modelsForMake = [...new Set(cars.filter(car => car.make === filters.make).map(car => car.model))].sort()
      setAvailableModels(modelsForMake)
      if (filters.model !== "all" && !modelsForMake.includes(filters.model)) {
        setFilters(prev => ({ ...prev, model: "all" }))
      }
    }
  }, [filters.make, cars, filters.model])

  const applyFilters = useCallback(() => {
    if (!cars || cars.length === 0) {
      setFilteredCars([]);
      setDisplayedCars([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }

    const filtered = cars.filter((car) => {
      if (!car) return false

      const carPrice = car.price || 0
      const carYear = car.year || 0
      const carMileage = car.mileage || 0
      const priceFrom = filters.priceFrom ? parseInt(filters.priceFrom, 10) || 0 : 0
      const priceTo = filters.priceTo ? parseInt(filters.priceTo, 10) || 0 : 0
      const yearFrom = filters.yearFrom ? parseInt(filters.yearFrom, 10) || 0 : 0
      const yearTo = filters.yearTo ? parseInt(filters.yearTo, 10) || 0 : 0
      const mileageFrom = filters.mileageFrom ? parseInt(filters.mileageFrom, 10) || 0 : 0
      const mileageTo = filters.mileageTo ? parseInt(filters.mileageTo, 10) || 0 : 0

      const matchesSearchQuery =
        !searchQuery ||
        (car.make && car.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (car.model && car.model.toLowerCase().includes(searchQuery.toLowerCase()))

      return (
        matchesSearchQuery &&
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
        (filters.driveTrain === "any" || car.driveTrain === filters.driveTrain) &&
        (!filters.fromEuropeOnly || car.fromEurope)
      )
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return (a.price || 0) - (b.price || 0)
        case "price-desc": return (b.price || 0) - (a.price || 0)
        case "year-desc": return b.year - a.year
        case "year-asc": return a.year - b.year
        case "mileage-asc": return a.mileage - b.mileage
        case "mileage-desc": return b.mileage - a.mileage
        case "date-desc": return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        case "date-asc": return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        default: return 0
      }
    })

    setFilteredCars(filtered)
    setCurrentPage(1)
    const initialDisplayed = filtered.slice(0, carsPerPage)
    setDisplayedCars(initialDisplayed)
    setHasMore(filtered.length > carsPerPage)
  }, [cars, filters, sortBy, carsPerPage, searchQuery])

  useEffect(() => {
    applyFilters()
  }, [sortBy, applyFilters])

  const loadMoreCars = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
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
      priceFrom: "", priceTo: "", make: "all", model: "all",
      yearFrom: "", yearTo: "", mileageFrom: "", mileageTo: "",
      transmission: "any", fuelType: "any", driveTrain: "any",
      fromEuropeOnly: false,
    })
    setSearchQuery("")
    applyFilters()
  }

  const handleSearch = () => {
    applyFilters()
  }

  const hasActiveFilters = () => {
    return filters.priceFrom !== "" || filters.priceTo !== "" || filters.make !== "all" ||
           filters.model !== "all" || filters.yearFrom !== "" || filters.yearTo !== "" ||
           filters.mileageFrom !== "" || filters.mileageTo !== "" || filters.transmission !== "any" ||
           filters.fuelType !== "any" || filters.driveTrain !== "any" || searchQuery !== "" || filters.fromEuropeOnly
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <div className="container px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" prefetch={true}>Главная</Link></li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li className="text-gray-900 dark:text-white font-medium">Каталог</li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск по маркам и моделям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 h-12 text-base pl-12 rounded-lg w-full"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-md transition-colors">Найти</Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden mb-6">
            <Button variant="outline" className="w-full h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white rounded-lg transition-colors" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters() && <span className="ml-2 w-2 h-2 bg-slate-500 dark:bg-blue-500 rounded-full"></span>}
            </Button>
            <UniversalDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen} title="Фильтры поиска" footer={<MobileFiltersFooter applyFilters={applyFilters} resetFilters={resetFilters} setIsFilterOpen={setIsFilterOpen} />}><MobileFiltersContent filters={filters} setFilters={setFilters} availableMakes={availableMakes} availableModels={availableModels} /></UniversalDrawer>
          </div>

          <div className="lg:w-96 hidden lg:block"><DesktopFilters filters={filters} setFilters={setFilters} availableMakes={availableMakes} availableModels={availableModels} hasActiveFilters={hasActiveFilters} resetFilters={resetFilters} applyFilters={applyFilters} /></div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Каталог автомобилей</h1>
                <p className="text-gray-600 dark:text-gray-400">Найдено {loading ? <span className="inline-block bg-gray-200 dark:bg-zinc-800 rounded h-4 w-6 align-middle animate-pulse mx-2"></span> : filteredCars.length} автомобилей</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-1">
                  <div className="flex items-center space-x-2 px-3">
                    <SlidersHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 border-0 bg-transparent dark:text-white h-9 text-sm font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-lg rounded-lg">
                        <SelectItem value="date-desc">Новые объявления</SelectItem>
                        <SelectItem value="date-asc">Старые объявления</SelectItem>
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
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
                    <div className="bg-gray-200 dark:bg-zinc-800 h-48"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <button onClick={loadMoreCars} disabled={loadingMore} className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-blue-800 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2">
                      {loadingMore ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Загружаем...</>) : (<>Показать ещё<span className="text-sm text-slate-300 dark:text-blue-200">({Math.min(carsPerPage, filteredCars.length - displayedCars.length)} из {filteredCars.length - displayedCars.length})</span></>)}
                    </button>
                  </div>
                )}
                {!hasMore && displayedCars.length > 0 && displayedCars.length === filteredCars.length && (
                  <div className="text-center pt-6"><p className="text-gray-500 dark:text-gray-400">Показаны все найденные автомобили ({filteredCars.length})</p></div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {cars.length === 0 ? "Автомобили не добавлены в каталог" : "По вашим критериям автомобили не найдены"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {cars.length === 0 ? "Скоро здесь появятся новые автомобили" : "Попробуйте изменить параметры поиска"}
                </p>
                {cars.length > 0 && (
                  <Button onClick={() => { resetFilters(); setCurrentPage(1); setHasMore(true) }} className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200">
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
