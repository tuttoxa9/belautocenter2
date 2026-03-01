"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { revalidateCar } from "@/app/actions/revalidate"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Car, Code, Search, Eye, Check } from "lucide-react"
import ImageUpload from "@/components/admin/image-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useButtonState } from "@/hooks/use-button-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Textarea } from "@/components/ui/textarea"
import { getCachedImageUrl } from "@/lib/image-cache"

export default function AdminCars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCar, setEditingCar] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [sortOption, setSortOption] = useState("createdAt_desc") // По умолчанию сортировка по дате добавления (новые вначале)
  const [filterOption, setFilterOption] = useState("available") // По умолчанию автомобили в наличии
  const [mainTab, setMainTab] = useState("all") // 'all' для всех машин, 'homepage' для машин на главной
  const [isAddHomepageDialogOpen, setIsAddHomepageDialogOpen] = useState(false)
  const cacheInvalidator = createCacheInvalidator('cars')
  const saveButtonState = useButtonState()
  const deleteButtonStates = {}
  const [carForm, setCarForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    engineVolume: "",
    fuelType: "",
    transmission: "",
    driveTrain: "",
    bodyType: "",
    color: "",
    description: "",
    imageUrls: [""],
    isAvailable: true,
    showOnHomepage: false,
    specifications: {
      "Двигатель": "",
      "Разгон 0-100": "",
      "Расход топлива": "",
      "Привод": "",
      "Коробка передач": "",
      "Мощность": ""
    },
    features: [],
    tiktok_url: "",
    youtube_url: "",
    fromEurope: false,
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cars"))
      const carsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Сортировка по умолчанию: сначала новые (по дате создания)
      const sortedCars = [...carsData].sort((a, b) => {
        // Используем createdAt (timestamp) для сортировки
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
        return dateB - dateA // От новых к старым
      })
      setCars(sortedCars)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const carData = {
        ...carForm,
        price: Number(carForm.price),
        mileage: Number(carForm.mileage),
        engineVolume: carForm.fuelType === "Электро" ? 0 : parseFloat(carForm.engineVolume),
        year: Number(carForm.year),
        imageUrls: carForm.imageUrls.filter((url) => url.trim() !== ""),
        fromEurope: carForm.fromEurope,
        createdAt: editingCar ? editingCar.createdAt : new Date(),
        updatedAt: new Date(),
      }

      let carId: string;

      if (editingCar) {
        await updateDoc(doc(db, "cars", editingCar.id), carData)
        carId = editingCar.id
        await cacheInvalidator.onUpdate(carId)
        // Вызываем On-Demand Revalidation
        await revalidateCar(carId)
      } else {
        const docRef = await addDoc(collection(db, "cars"), carData)
        carId = docRef.id
        await cacheInvalidator.onCreate(carId)
        // Вызываем On-Demand Revalidation
        await revalidateCar(carId)
      }

      setIsSheetOpen(false)
      setEditingCar(null)
      resetForm()
      loadCars()
    } catch (error) {
      alert("Ошибка сохранения автомобиля")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setCarForm({
      ...car,
      price: (car.price || 0).toString(),
      mileage: (car.mileage || 0).toString(),
      engineVolume: (car.engineVolume || 0).toString(),
      year: (car.year || 0).toString(),
      imageUrls: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls : [""],
      specifications: car.specifications || {},
      features: car.features || [],
      showOnHomepage: car.showOnHomepage || false,
      fromEurope: car.fromEurope || false,
      tiktok_url: car.tiktok_url || "",
      youtube_url: car.youtube_url || "",
    })
    setIsSheetOpen(true)
  }

  const handleDelete = async (carId) => {
    if (confirm("Удалить этот автомобиль?")) {
      try {
        await deleteDoc(doc(db, "cars", carId))
        await cacheInvalidator.onDelete(carId)
        // Вызываем On-Demand Revalidation
        await revalidateCar(carId)
        loadCars()
      } catch (error) {
        alert("Ошибка удаления автомобиля")
      }
    }
  }

  const addToHomepage = async (carId) => {
    try {
      await updateDoc(doc(db, "cars", carId), {
        showOnHomepage: true,
        updatedAt: new Date()
      })
      await cacheInvalidator.onUpdate(carId)
      await revalidateCar(carId)

      // Обновляем локальное состояние
      setCars(cars.map(car =>
        car.id === carId ? { ...car, showOnHomepage: true } : car
      ))
    } catch (error) {
      alert("Ошибка при добавлении автомобиля на главную")
    }
  }

  const removeFromHomepage = async (carId) => {
    try {
      await updateDoc(doc(db, "cars", carId), {
        showOnHomepage: false,
        updatedAt: new Date()
      })
      await cacheInvalidator.onUpdate(carId)
      await revalidateCar(carId)

      // Обновляем локальное состояние
      setCars(cars.map(car =>
        car.id === carId ? { ...car, showOnHomepage: false } : car
      ))
    } catch (error) {
      alert("Ошибка при удалении автомобиля с главной")
    }
  }

  const resetForm = () => {
    setCarForm({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      mileage: "",
      engineVolume: "",
      fuelType: "",
      transmission: "",
      driveTrain: "",
      bodyType: "",
      color: "",
      description: "",
      imageUrls: [""],
      isAvailable: true,
      showOnHomepage: false,
      fromEurope: false,
      specifications: {
        "Двигатель": "",
        "Разгон 0-100": "",
        "Расход топлива": "",
        "Привод": "",
        "Коробка передач": "",
        "Мощность": ""
      },
      features: [],
      tiktok_url: "",
      youtube_url: "",
    })
    setJsonInput("")
    setJsonError("")
    setActiveTab("basic")
  }

  const processJsonInput = () => {
    try {
      // Пробуем распарсить JSON
      const parsedData = JSON.parse(jsonInput)

      // Проверка обязательных полей
      if (!parsedData.make || !parsedData.model) {
        setJsonError("Обязательные поля (make, model) отсутствуют в JSON")
        return
      }

      // Маппинг noMileageInRB -> fromEurope (для обратной совместимости)
      const fromEuropeValue = parsedData.fromEurope !== undefined
        ? parsedData.fromEurope
        : (parsedData.noMileageInRB !== undefined ? parsedData.noMileageInRB : false)

      // Преобразуем поля, если они не соответствуют ожидаемому типу
      const processedData = {
        make: parsedData.make || "",
        model: parsedData.model || "",
        price: parsedData.price ? parsedData.price.toString() : "",
        mileage: parsedData.mileage ? parsedData.mileage.toString() : "",
        engineVolume: parsedData.engineVolume ? parsedData.engineVolume.toString() : "",
        year: parsedData.year ? parsedData.year.toString() : new Date().getFullYear().toString(),
        imageUrls: Array.isArray(parsedData.imageUrls) && parsedData.imageUrls.length > 0
          ? parsedData.imageUrls
          : [""],
        isAvailable: typeof parsedData.isAvailable === 'boolean' ? parsedData.isAvailable : true,
        showOnHomepage: typeof parsedData.showOnHomepage === 'boolean' ? parsedData.showOnHomepage : false,
        fromEurope: fromEuropeValue,
        specifications: parsedData.specifications || {
          "Двигатель": "",
          "Разгон 0-100": "",
          "Расход топлива": "",
          "Привод": "",
          "Коробка передач": "",
          "Мощность": ""
        },
        features: Array.isArray(parsedData.features) ? parsedData.features : [],
        fuelType: parsedData.fuelType || "",
        transmission: parsedData.transmission || "",
        driveTrain: parsedData.driveTrain || "",
        bodyType: parsedData.bodyType || "",
        color: parsedData.color || "",
        description: parsedData.description || "",
        tiktok_url: parsedData.tiktok_url || "",
        youtube_url: parsedData.youtube_url || ""
      }

      // Устанавливаем данные в форму (без createdAt и updatedAt - они устанавливаются автоматически)
      setCarForm(processedData)
      setJsonError("")
    } catch (error) {
      setJsonError("Ошибка при обработке JSON: " + error.message)
    }
  }



  // Применение сортировки
  const applySorting = (carsToSort) => {
    const sorted = [...carsToSort]

    switch (sortOption) {
      case "createdAt_desc": // Новые вначале (по дате добавления)
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
          const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
          return dateB - dateA
        })
      case "createdAt_asc": // Старые вначале (по дате добавления)
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0)
          const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0)
          return dateA - dateB
        })
      case "price_asc": // По возрастанию цены
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price_desc": // По убыванию цены
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "year_desc": // Новые модели вначале (по году)
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
      case "year_asc": // Старые модели вначале (по году)
        return sorted.sort((a, b) => (a.year || 0) - (b.year || 0))
      case "mileage_asc": // По возрастанию пробега
        return sorted.sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
      case "mileage_desc": // По убыванию пробега
        return sorted.sort((a, b) => (b.mileage || 0) - (a.mileage || 0))
      default:
        return sorted
    }
  }

  // Применение фильтрации
  const applyFilters = (carsToFilter) => {
    let filtered = [...carsToFilter]

    // Фильтр по доступности
    if (filterOption === "available") {
      filtered = filtered.filter(car => car.isAvailable === true)
    } else if (filterOption === "sold") {
      filtered = filtered.filter(car => car.isAvailable === false)
    }

    return filtered
  }

  // Фильтрация автомобилей по поисковому запросу
  const filteredBySearch = cars.filter((car) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      car.make?.toLowerCase().includes(query) ||
      car.model?.toLowerCase().includes(query) ||
      car.year?.toString().includes(query) ||
      car.price?.toString().includes(query) ||
      car.color?.toLowerCase().includes(query) ||
      car.bodyType?.toLowerCase().includes(query) ||
      car.fuelType?.toLowerCase().includes(query) ||
      car.transmission?.toLowerCase().includes(query) ||
      car.driveTrain?.toLowerCase().includes(query)
    )
  })

  // Применяем последовательно фильтрацию и сортировку
  const filteredCars = applySorting(applyFilters(filteredBySearch))

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-lg space-y-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-muted rounded flex-1"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold truncate">Управление автомобилями</h2>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingCar(null)
                setActiveTab("basic")
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Добавить автомобиль</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="admin-sheet-wide overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-lg md:text-xl">{editingCar ? "Редактировать" : "Добавить"} автомобиль</SheetTitle>
            </SheetHeader>

            {/* Навигация по разделам */}
            <div className="flex gap-1 mb-6 mt-4 bg-muted/50 dark:bg-zinc-800/50 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "basic"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Основная информация
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "images"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Изображения
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "json"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                JSON
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Раздел: Основная информация */}
              {activeTab === "basic" && (
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-sm">Марка</Label>
                  <Input
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Модель</Label>
                  <Input
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <Label className="text-sm">Год</Label>
                  <Input
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Цена ($)</Label>
                  <Input
                    type="number"
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <Label className="text-sm">Пробег (км)</Label>
                  <Input
                    type="number"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Объем двигателя (л)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={carForm.engineVolume}
                    onChange={(e) => setCarForm({ ...carForm, engineVolume: e.target.value })}
                    disabled={carForm.fuelType === "Электро"}
                    placeholder={carForm.fuelType === "Электро" ? "Не требуется для электро" : ""}
                    required={carForm.fuelType !== "Электро"}
                  />
                </div>
                <div>
                  <Label>Тип топлива</Label>
                  <Select
                    value={carForm.fuelType}
                    onValueChange={(value) => {
                      const newForm = { ...carForm, fuelType: value }
                      // Очищаем объем двигателя для электро
                      if (value === "Электро") {
                        newForm.engineVolume = ""
                      }
                      setCarForm(newForm)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип топлива" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Бензин">Бензин</SelectItem>
                      <SelectItem value="Дизель">Дизель</SelectItem>
                      <SelectItem value="Гибрид">Гибрид</SelectItem>
                      <SelectItem value="Электро">Электро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Коробка передач</Label>
                  <Select
                    value={carForm.transmission}
                    onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите КПП" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Автомат">Автомат</SelectItem>
                      <SelectItem value="Механика">Механика</SelectItem>
                      <SelectItem value="Вариатор">Вариатор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Привод</Label>
                  <Select
                    value={carForm.driveTrain}
                    onValueChange={(value) => setCarForm({ ...carForm, driveTrain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите привод" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Передний">Передний</SelectItem>
                      <SelectItem value="Задний">Задний</SelectItem>
                      <SelectItem value="Полный">Полный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Тип кузова</Label>
                  <Input
                    value={carForm.bodyType}
                    onChange={(e) => setCarForm({ ...carForm, bodyType: e.target.value })}
                    placeholder="Седан, Хэтчбек, Внедорожник..."
                  />
                </div>
                <div>
                  <Label>Цвет</Label>
                  <Input
                    value={carForm.color}
                    onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                    placeholder="Черный металлик"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Ссылка на обзор в TikTok</Label>
                  <Input
                    value={carForm.tiktok_url}
                    onChange={(e) => setCarForm({ ...carForm, tiktok_url: e.target.value })}
                    placeholder="https://www.tiktok.com/@user/video/123"
                  />
                </div>
                <div>
                  <Label>Ссылка на обзор в YouTube</Label>
                  <Input
                    value={carForm.youtube_url}
                    onChange={(e) => setCarForm({ ...carForm, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=123"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Описание (Markdown поддерживается)</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Поддерживается: **жирный**, *курсив*, # заголовки, - списки, [ссылки](url)
                </div>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Редактирование</TabsTrigger>
                    <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    <Textarea
                      className="w-full p-2 border rounded-md text-sm min-h-[150px]"
                      rows={6}
                      value={carForm.description}
                      onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                      placeholder="Подробное описание автомобиля...&#10;&#10;Можно использовать:&#10;**Жирный текст**&#10;*Курсивный текст*&#10;# Заголовок&#10;- Пункт списка&#10;- Другой пункт"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="w-full p-3 border rounded-md bg-muted/30 dark:bg-zinc-900/50 min-h-[150px]">
                      {carForm.description ? (
                        <MarkdownRenderer content={carForm.description} />
                      ) : (
                        <p className="text-muted-foreground italic">Введите описание для предпросмотра...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={carForm.isAvailable}
                        onChange={(e) => setCarForm({ ...carForm, isAvailable: e.target.checked })}
                      />
                      <Label htmlFor="isAvailable">В наличии</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showOnHomepage"
                        checked={carForm.showOnHomepage}
                        onChange={(e) => setCarForm({ ...carForm, showOnHomepage: e.target.checked })}
                      />
                      <Label htmlFor="showOnHomepage">Показывать на главной странице</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fromEurope"
                        checked={carForm.fromEurope}
                        onChange={(e) => setCarForm({ ...carForm, fromEurope: e.target.checked })}
                      />
                      <Label htmlFor="fromEurope">Без пробега по РБ</Label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Характеристики</Label>
                    <div className="space-y-2">
                      {Object.entries(carForm.specifications).map(([key, value], index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder="Название"
                            value={key}
                            className="text-sm"
                            onChange={(e) => {
                              const newSpecs = { ...carForm.specifications }
                              delete newSpecs[key]
                              newSpecs[e.target.value] = value
                              setCarForm({ ...carForm, specifications: newSpecs })
                            }}
                          />
                          <Input
                            placeholder="Значение"
                            value={value}
                            className="text-sm"
                            onChange={(e) => {
                              setCarForm({
                                ...carForm,
                                specifications: {
                                  ...carForm.specifications,
                                  [key]: e.target.value
                                }
                              })
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              const newSpecs = { ...carForm.specifications }
                              delete newSpecs[key]
                              setCarForm({ ...carForm, specifications: newSpecs })
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs w-full sm:w-auto"
                        onClick={() => {
                          setCarForm({
                            ...carForm,
                            specifications: {
                              ...carForm.specifications,
                              "": ""
                            }
                          })
                        }}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Добавить характеристику
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Комплектация</Label>
                    <div className="space-y-2">
                      {carForm.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Особенность"
                            value={feature}
                            className="text-sm"
                            onChange={(e) => {
                              const newFeatures = [...carForm.features]
                              newFeatures[index] = e.target.value
                              setCarForm({ ...carForm, features: newFeatures })
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFeatures = carForm.features.filter((_, i) => i !== index)
                              setCarForm({ ...carForm, features: newFeatures })
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs w-full sm:w-auto"
                        onClick={() => {
                          setCarForm({
                            ...carForm,
                            features: [...carForm.features, ""]
                          })
                        }}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Добавить особенность
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Раздел: Изображения */}
              {activeTab === "images" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Фотографии автомобиля</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Загрузите качественные фотографии автомобиля. Первое изображение будет использоваться как главное.
                    </p>
                    <ImageUpload
                      multiple={true}
                      currentImages={carForm.imageUrls.filter(url => url.trim() !== "")}
                      path="cars"
                      onMultipleUpload={(allUrls) => {
                        setCarForm({ ...carForm, imageUrls: allUrls.length > 0 ? allUrls : [""] })
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Раздел: JSON */}
              {activeTab === "json" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Импорт данных из JSON</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Вставьте JSON с данными автомобиля для быстрого заполнения формы. Это перезапишет текущие данные.
                    </p>
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="font-mono text-xs h-64"
                    />
                    {jsonError && (
                      <div className="text-sm text-red-600 mt-2">{jsonError}</div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        onClick={processJsonInput}
                        className="flex-1"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Применить JSON
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setJsonInput("")}
                        className="flex-1"
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>

                  {/* Предпросмотр текущих данных формы */}
                  <div>
                    <Label className="text-sm mb-2 block">Предпросмотр данных формы</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Просмотр текущих данных в JSON формате
                    </p>
                    <Textarea
                      value={JSON.stringify({
                        make: carForm.make,
                        model: carForm.model,
                        year: Number(carForm.year),
                        price: Number(carForm.price),
                        mileage: Number(carForm.mileage),
                        engineVolume: carForm.fuelType === "Электро" ? 0 : parseFloat(carForm.engineVolume),
                        fuelType: carForm.fuelType,
                        transmission: carForm.transmission,
                        driveTrain: carForm.driveTrain,
                        bodyType: carForm.bodyType,
                        color: carForm.color,
                        description: carForm.description,
                        imageUrls: carForm.imageUrls.filter(url => url.trim() !== ""),
                        isAvailable: carForm.isAvailable,
                        showOnHomepage: carForm.showOnHomepage,
                        specifications: carForm.specifications,
                        features: carForm.features,
                        tiktok_url: carForm.tiktok_url,
                        youtube_url: carForm.youtube_url
                      }, null, 2)}
                      className="font-mono text-xs h-64"
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Кнопки управления */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                <Button type="submit" className="flex-1 text-sm" loading={isSaving}>
                  {editingCar ? "Сохранить изменения" : "Добавить автомобиль"}
                </Button>
                <Button type="button" variant="outline" className="text-sm" onClick={() => setIsSheetOpen(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Каталог</TabsTrigger>
          <TabsTrigger value="homepage">На главной</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="text-sm text-muted-foreground font-medium mb-4">
            {filteredCars.length === cars.length
              ? `Всего автомобилей: ${cars.length}`
              : `Показано ${filteredCars.length} из ${cars.length} автомобилей`}
          </div>

      {/* Статистика автомобилей */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-card dark:bg-zinc-900/50 rounded-lg shadow-sm border border-border p-4">
          <div className="text-sm text-muted-foreground">Всего автомобилей</div>
          <div className="text-2xl font-bold mt-1 text-foreground">{cars.length}</div>
        </div>
        <div className="bg-card dark:bg-zinc-900/50 rounded-lg shadow-sm border border-border p-4">
          <div className="text-sm text-muted-foreground">В наличии</div>
          <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">
            {cars.filter(car => car.isAvailable === true).length}
          </div>
          <div className="text-sm text-muted-foreground mt-1 font-medium">
            {cars.filter(car => car.isAvailable === true).reduce((sum, car) => sum + (car.price || 0), 0).toLocaleString('ru-RU')} $
          </div>
        </div>
        <div className="bg-card dark:bg-zinc-900/50 rounded-lg shadow-sm border border-border p-4">
          <div className="text-sm text-muted-foreground">Проданные</div>
          <div className="text-2xl font-bold mt-1 text-gray-500 dark:text-gray-400">
            {cars.filter(car => car.isAvailable === false).length}
          </div>
          <div className="text-sm text-muted-foreground mt-1 font-medium">
            {cars.filter(car => car.isAvailable === false).reduce((sum, car) => sum + (car.price || 0), 0).toLocaleString('ru-RU')} $
          </div>
        </div>
      </div>

      {/* Поле поиска, сортировка и фильтрация */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по марке, модели, году, цене..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
            >
              Очистить
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Сортировка */}
          <div className="w-48">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">Сначала новые</SelectItem>
                <SelectItem value="createdAt_asc">Сначала старые</SelectItem>
                <SelectItem value="price_asc">По возрастанию цены</SelectItem>
                <SelectItem value="price_desc">По убыванию цены</SelectItem>
                <SelectItem value="year_desc">Новые модели вначале</SelectItem>
                <SelectItem value="year_asc">Старые модели вначале</SelectItem>
                <SelectItem value="mileage_asc">По возрастанию пробега</SelectItem>
                <SelectItem value="mileage_desc">По убыванию пробега</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Фильтрация */}
          <div className="w-36">
            <Select value={filterOption} onValueChange={setFilterOption}>
              <SelectTrigger>
                <SelectValue placeholder="Фильтр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="available">В наличии</SelectItem>
                <SelectItem value="sold">Проданные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCars && filteredCars.map((car) => (
          <Card key={car.id} className="relative overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <Link href={`/catalog/${car.id}`} target="_blank" className="absolute top-2 right-2 bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all z-10">
                <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </Link>
              {car.imageUrls && car.imageUrls.length > 0 && car.imageUrls[0] && (
                <div className="mb-3">
                  <img
                    src={getCachedImageUrl(car.imageUrls[0])}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-semibold text-sm md:text-base truncate flex-1">
                  {car.make} {car.model}
                </h3>
                <Badge variant={car.isAvailable ? "default" : "secondary"} className="text-xs flex-shrink-0">
                  {car.isAvailable ? "В наличии" : "Продан"}
                </Badge>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                <p>Год: {car.year}</p>
                <p>Цена: ${car.price?.toLocaleString()}</p>
                <p>Пробег: {car.mileage?.toLocaleString()} км</p>
              </div>
              <div className="flex space-x-2 mt-3 md:mt-4">
                <Button size="sm" variant="outline" onClick={() => {
                  handleEdit(car)
                  setActiveTab("basic")
                }} className="flex-1">
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs">Изменить</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(car.id)} className="flex-1">
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs">Удалить</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
          <p className="text-muted-foreground">Автомобили не добавлены</p>
        </div>
      )}

      {filteredCars.length === 0 && cars.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
          {searchQuery ? (
            <p className="text-muted-foreground">По запросу "{searchQuery}" ничего не найдено</p>
          ) : (
            <p className="text-muted-foreground">Нет автомобилей, соответствующих выбранным фильтрам</p>
          )}
          <div className="flex gap-2 justify-center mt-2">
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Очистить поиск
              </Button>
            )}
            {filterOption !== "all" && (
              <Button
                variant="outline"
                onClick={() => setFilterOption("all")}
              >
                Показать все
              </Button>
            )}
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold">Автомобили на главной странице</h3>
            <Button onClick={() => setIsAddHomepageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить на главную
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cars.filter(car => car.showOnHomepage).map((car) => (
              <Card key={car.id} className="relative overflow-hidden border-2 border-primary/20">
                <CardContent className="p-3 md:p-4">
                  {car.imageUrls && car.imageUrls.length > 0 && car.imageUrls[0] && (
                    <div className="mb-3">
                      <img
                        src={getCachedImageUrl(car.imageUrls[0])}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-sm md:text-base truncate flex-1">
                      {car.make} {car.model}
                    </h3>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground space-y-1 mb-3">
                    <p>Год: {car.year}</p>
                    <p>Цена: ${car.price?.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => removeFromHomepage(car.id)}
                  >
                    Убрать с главной
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {cars.filter(car => car.showOnHomepage).length === 0 && (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground">На главной странице пока нет автомобилей</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddHomepageDialogOpen} onOpenChange={setIsAddHomepageDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Добавить автомобиль на главную</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.filter(car => !car.showOnHomepage).map((car) => (
                <Card key={car.id} className="relative overflow-hidden">
                  <CardContent className="p-3">
                    {car.imageUrls && car.imageUrls.length > 0 && car.imageUrls[0] && (
                      <div className="mb-2">
                        <img
                          src={getCachedImageUrl(car.imageUrls[0])}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm truncate mb-1">
                      {car.make} {car.model}
                    </h3>
                    <div className="text-xs text-muted-foreground mb-3 flex justify-between">
                      <span>{car.year}</span>
                      <span className="font-medium text-foreground">${car.price?.toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => addToHomepage(car.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Добавить на главную
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {cars.filter(car => !car.showOnHomepage).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Нет доступных автомобилей для добавления
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
