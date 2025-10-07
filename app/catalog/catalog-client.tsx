"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CarCard from "@/components/car-card"
import { Filter, SlidersHorizontal, ArrowRight, X, RotateCcw, Loader2 } from "lucide-react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import type { Car } from '@/types/car'

interface CatalogClientProps {
  initialCars: Car[];
  availableMakes: string[];
  availableModels: string[];
  totalCars: number;
  totalPages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

// Компонент для пагинации
const Pagination = ({ totalPages, currentPage, createPageUrl }: { totalPages: number; currentPage: number; createPageUrl: (page: number) => string; }) => {
  if (totalPages <= 1) return null

  const pageNumbers = []
  const maxPagesToShow = 5

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
  let endPage = startPage + maxPagesToShow - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex justify-center items-center space-x-2 pt-8">
      {currentPage > 1 && (
        <Link href={createPageUrl(currentPage - 1)} scroll={false}>
          <Button variant="outline" size="sm">Назад</Button>
        </Link>
      )}
      {startPage > 1 && (
        <>
          <Link href={createPageUrl(1)} scroll={false}><Button variant="outline" size="sm">1</Button></Link>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pageNumbers.map(page => (
        <Link key={page} href={createPageUrl(page)} scroll={false}>
          <Button variant={page === currentPage ? "default" : "outline"} size="sm">
            {page}
          </Button>
        </Link>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Link href={createPageUrl(totalPages)} scroll={false}><Button variant="outline" size="sm">{totalPages}</Button></Link>
        </>
      )}
      {currentPage < totalPages && (
        <Link href={createPageUrl(currentPage + 1)} scroll={false}>
          <Button variant="outline" size="sm">Вперед</Button>
        </Link>
      )}
    </div>
  )
}

export default function CatalogClient({
  initialCars,
  availableMakes,
  availableModels: allModels, // Переименовываем для ясности
  totalCars,
  totalPages,
  searchParams,
}: CatalogClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Фильтры теперь управляются локальным состоянием, синхронизированным с URL
  const [filters, setFilters] = useState({
    priceFrom: searchParams.priceFrom as string || "",
    priceTo: searchParams.priceTo as string || "",
    make: searchParams.make as string || "all",
    model: searchParams.model as string || "all",
    yearFrom: searchParams.yearFrom as string || "",
    yearTo: searchParams.yearTo as string || "",
    transmission: searchParams.transmission as string || "any",
    fuelType: searchParams.fuelType as string || "any",
    driveTrain: searchParams.driveTrain as string || "any",
  })
  const [sortBy, setSortBy] = useState(searchParams.sortBy as string || "date-desc")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Динамически вычисляем доступные модели на клиенте для лучшего UX
  const [availableModels, setAvailableModels] = useState<string[]>(allModels)

  useEffect(() => {
    if (filters.make === "all") {
      setAvailableModels(allModels)
    } else {
      // Это потребует запроса к серверу, если мы хотим точные модели.
      // Для простоты пока оставим так, но в идеале это тоже серверная логика.
      // В данном рефакторинге это не критично, так как сервер все равно вернет правильные авто.
      const modelsForMake = allModels.filter(model => model.toLowerCase().startsWith(filters.make.toLowerCase()))
      setAvailableModels(modelsForMake)
    }
  }, [filters.make, allModels])

  // Функция для создания нового URL с обновленными параметрами
  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === "all" || value === "any") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    // Сбрасываем страницу при изменении фильтров
    params.delete('page')
    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false })
    })
  }

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    const newFilters = { ...filters, [key]: value };
    // Если изменили марку, сбрасываем модель
    if (key === 'make') {
      newFilters.model = 'all';
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    updateUrl(filters)
    setIsFilterOpen(false) // Закрываем мобильные фильтры после применения
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const params = new URLSearchParams(window.location.search)
    params.set('sortBy', value)
    params.delete('page')
    startTransition(() => {
      router.push(`/catalog?${params.toString()}`, { scroll: false })
    })
  }

  const resetFilters = () => {
    startTransition(() => {
      router.push('/catalog', { scroll: false })
    })
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    return `/catalog?${params.toString()}`
  }

  const hasActiveFilters = Object.values(filters).some(val => val && val !== "all" && val !== "any")

  const MobileFiltersContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Марка</Label>
        <Select value={filters.make} onValueChange={(v) => handleFilterChange('make', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все марки</SelectItem>
            {availableMakes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Модель</Label>
        <Select value={filters.model} onValueChange={(v) => handleFilterChange('model', v)} disabled={filters.make === 'all'}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все модели</SelectItem>
            {availableModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Цена ($)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="От" value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} />
          <Input type="number" placeholder="До" value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Год выпуска</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="От" value={filters.yearFrom} onChange={(e) => handleFilterChange('yearFrom', e.target.value)} />
          <Input type="number" placeholder="До" value={filters.yearTo} onChange={(e) => handleFilterChange('yearTo', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const MobileFiltersFooter = () => (
    <div className="flex space-x-3">
      <Button onClick={applyFilters} className="flex-1">Применить</Button>
      <Button onClick={resetFilters} variant="outline" className="flex-1"><RotateCcw className="h-4 w-4 mr-2" />Сбросить</Button>
    </div>
  );

  const DesktopFilters = () => (
    <Card className="sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Фильтры</CardTitle>
        {hasActiveFilters && <Button onClick={resetFilters} variant="ghost" size="sm"><X className="h-4 w-4" /></Button>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поля фильтров идентичны мобильным, но с вызовом applyFilters по кнопке */}
        <div className="space-y-2">
          <Label>Марка</Label>
          <Select value={filters.make} onValueChange={(v) => handleFilterChange('make', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все марки</SelectItem>
              {availableMakes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Модель</Label>
          <Select value={filters.model} onValueChange={(v) => handleFilterChange('model', v)} disabled={filters.make === 'all'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все модели</SelectItem>
              {availableModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Цена ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="От" value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} />
            <Input type="number" placeholder="До" value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} />
          </div>
        </div>
        <Button onClick={applyFilters} className="w-full">Применить</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Главная</Link></li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li className="font-medium">Каталог</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden">
            <Button variant="outline" className="w-full" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />Фильтры
            </Button>
            <UniversalDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen} title="Фильтры" footer={<MobileFiltersFooter />}>
              <MobileFiltersContent />
            </UniversalDrawer>
          </div>

          <div className="lg:w-80 hidden lg:block"><DesktopFilters /></div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Найдено {totalCars} автомобилей</p>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Новые объявления</SelectItem>
                  <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                  <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
              {initialCars.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialCars.map(car => <CarCard key={car.id} car={car} />)}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold">Автомобили не найдены</h3>
                  <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
                  <Button onClick={resetFilters} className="mt-4">Сбросить фильтры</Button>
                </div>
              )}
              {isPending && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </div>

            <Pagination
              totalPages={totalPages}
              currentPage={Number(searchParams.page || '1')}
              createPageUrl={createPageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  )
}