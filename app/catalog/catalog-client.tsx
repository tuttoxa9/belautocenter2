"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CarCard from "@/components/car-card"
import { Filter, SlidersHorizontal, ArrowRight, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"

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
  initialCars: Car[];
  totalCars: number;
  totalPages: number;
  currentPage: number;
  availableMakes: string[];
  availableModels: string[];
  searchParams: any;
}

export default function CatalogClient({
  initialCars,
  totalCars,
  totalPages,
  currentPage,
  availableMakes,
  availableModels: allModels, // Rename to avoid conflict
  searchParams
}: CatalogClientProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [displayedCars, setDisplayedCars] = useState<Car[]>(initialCars);
  const [availableModels, setAvailableModels] = useState<string[]>(allModels);
  const [filters, setFilters] = useState({
    priceFrom: searchParams.priceFrom || "",
    priceTo: searchParams.priceTo || "",
    make: searchParams.make || "all",
    model: searchParams.model || "all",
    yearFrom: searchParams.yearFrom || "",
    yearTo: searchParams.yearTo || "",
    mileageFrom: searchParams.mileageFrom || "",
    mileageTo: searchParams.mileageTo || "",
    transmission: searchParams.transmission || "any",
    fuelType: searchParams.fuelType || "any",
    driveTrain: searchParams.driveTrain || "any",
  });
  const [sortBy, setSortBy] = useState(searchParams.sortBy || "date-desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "any") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('sortBy', sortBy);
    params.set('page', '1'); // Reset to first page on filter change
    router.push(`/catalog?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', value);
    params.set('page', '1'); // Reset to first page on sort change
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/catalog?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/catalog');
  };

  // Dynamically update available models when make changes
  useEffect(() => {
    if (filters.make === "all") {
      setAvailableModels(allModels);
    } else {
      // This part is tricky without all cars data.
      // We assume the server will handle the filtering,
      // but for a better UX, we could fetch models for the selected make.
      // For now, we'll leave it as is, or we'd need another API endpoint.
    }
  }, [filters.make, allModels]);


  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value && value !== "all" && value !== "any");
  };

  const MobileFiltersContent = () => (
    <div className="space-y-4">
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
    </div>
  );

  const MobileFiltersFooter = () => (
    <div className="flex space-x-3">
      <Button
        onClick={() => {
          handleFilterChange();
          setIsFilterOpen(false);
        }}
        className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
      >
        Применить
      </Button>
      <Button
        onClick={() => {
          resetFilters();
          setIsFilterOpen(false);
        }}
        variant="outline"
        className="flex-1 h-11 bg-white border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Сбросить
      </Button>
    </div>
  );

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
            onClick={handleFilterChange}
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
            <Button
              variant="outline"
              className="w-full h-11 bg-white border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters() && (
                <span className="ml-2 w-2 h-2 bg-slate-500 rounded-full"></span>
              )}
            </Button>
            <UniversalDrawer
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              title="Фильтры поиска"
              footer={<MobileFiltersFooter />}
            >
              <MobileFiltersContent />
            </UniversalDrawer>
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
                  Найдено {totalCars} автомобилей
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                  <div className="flex items-center space-x-2 px-3">
                    <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-48 border-0 bg-transparent h-9 text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 shadow-lg rounded-lg">
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

            {/* Сетка автомобилей */}
            {!isClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: initialCars.length || 6 }).map((_, index) => (
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
            ) : displayedCars.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {displayedCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 pt-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Страница {currentPage} из {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  По вашим критериям автомобили не найдены
                </h3>
                <p className="text-gray-500 mb-6">
                  Попробуйте изменить параметры поиска или сбросить фильтры.
                </p>
                <Button
                  onClick={resetFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
