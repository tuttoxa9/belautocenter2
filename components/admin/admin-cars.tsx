"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Car, Code } from "lucide-react"
import ImageUpload from "@/components/admin/image-upload"
import { useButtonState } from "@/hooks/use-button-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Textarea } from "@/components/ui/textarea"

export default function AdminCars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCar, setEditingCar] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState("")
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
    specifications: {
      "Двигатель": "",
      "Разгон 0-100": "",
      "Расход топлива": "",
      "Привод": "",
      "Коробка передач": "",
      "Мощность": ""
    },
    features: [],
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
      setCars(carsData)
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const carData = {
        ...carForm,
        price: Number(carForm.price),
        mileage: Number(carForm.mileage),
        engineVolume: carForm.fuelType === "Электро" ? 0 : parseFloat(carForm.engineVolume),
        year: Number(carForm.year),
        imageUrls: carForm.imageUrls.filter((url) => url.trim() !== ""),
        createdAt: editingCar ? editingCar.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingCar) {
        await updateDoc(doc(db, "cars", editingCar.id), carData)
        await cacheInvalidator.onUpdate(editingCar.id)
      } else {
        const docRef = await addDoc(collection(db, "cars"), carData)
        await cacheInvalidator.onCreate(docRef.id)
      }

      setIsDialogOpen(false)
      setEditingCar(null)
      resetForm()
      loadCars()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения автомобиля")
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
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (carId) => {
    if (confirm("Удалить этот автомобиль?")) {
      try {
        await deleteDoc(doc(db, "cars", carId))
        await cacheInvalidator.onDelete(carId)
        loadCars()
      } catch (error) {
        console.error("Ошибка удаления:", error)
        alert("Ошибка удаления автомобиля")
      }
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
      specifications: {
        "Двигатель": "",
        "Разгон 0-100": "",
        "Расход топлива": "",
        "Привод": "",
        "Коробка передач": "",
        "Мощность": ""
      },
      features: [],
    })
    setJsonInput("")
    setJsonError("")
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

      // Преобразуем поля, если они не соответствуют ожидаемому типу
      const processedData = {
        ...parsedData,
        price: parsedData.price ? parsedData.price.toString() : "",
        mileage: parsedData.mileage ? parsedData.mileage.toString() : "",
        engineVolume: parsedData.engineVolume ? parsedData.engineVolume.toString() : "",
        year: parsedData.year ? parsedData.year.toString() : new Date().getFullYear().toString(),
        imageUrls: Array.isArray(parsedData.imageUrls) && parsedData.imageUrls.length > 0
          ? parsedData.imageUrls
          : [""],
        isAvailable: typeof parsedData.isAvailable === 'boolean' ? parsedData.isAvailable : true,
        specifications: parsedData.specifications || {
          "Двигатель": "",
          "Разгон 0-100": "",
          "Расход топлива": "",
          "Привод": "",
          "Коробка передач": "",
          "Мощность": ""
        },
        features: Array.isArray(parsedData.features) ? parsedData.features : []
      }

      // Устанавливаем данные в форму
      setCarForm(processedData)
      setJsonError("")
    } catch (error) {
      setJsonError("Ошибка при обработке JSON: " + error.message)
    }
  }

  const addImageUrl = () => {
    setCarForm({
      ...carForm,
      imageUrls: [...carForm.imageUrls, ""],
    })
  }

  const updateImageUrl = (index, value) => {
    const newUrls = [...carForm.imageUrls]
    newUrls[index] = value
    setCarForm({ ...carForm, imageUrls: newUrls })
  }

  const removeImageUrl = (index) => {
    const newUrls = carForm.imageUrls.filter((_, i) => i !== index)
    setCarForm({ ...carForm, imageUrls: newUrls.length > 0 ? newUrls : [""] })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
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
        <h2 className="text-xl md:text-2xl font-bold truncate">Управление автомобилями</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingCar(null)
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Добавить автомобиль</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">{editingCar ? "Редактировать" : "Добавить"} автомобиль</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form">Форма</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="json" className="mt-2 space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">Вставьте JSON данные автомобиля</Label>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="font-mono text-xs h-64"
                    placeholder='{\n  "make": "BMW",\n  "model": "M5 Competition",\n  "year": 2020,\n  "price": 95000,\n  "mileage": 45000,\n  "bodyType": "Седан",\n  "color": "Синий металлик",\n  "engineVolume": 4.4,\n  "fuelType": "Бензин",\n  "transmission": "Автомат",\n  "driveTrain": "Полный",\n  "isAvailable": true,\n  "imageUrls": ["cars/example1.jpg", "cars/example2.jpg"],\n  "description": "Текст описания",\n  "features": ["Адаптивная подвеска", "Карбоновые тормоза"],\n  "specifications": {\n    "Двигатель": "4.4 V8 Twin-Turbo",\n    "Мощность": "625",\n    "Разгон 0-100": "3.3"\n  }\n}'
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
              </TabsContent>
              <TabsContent value="form" className="mt-2">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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

              <div>
                <Label className="text-sm">Описание (Markdown поддерживается)</Label>
                <div className="text-xs text-gray-500 mb-2">
                  Поддерживается: **жирный**, *курсив*, # заголовки, - списки, [ссылки](url)
                </div>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Редактирование</TabsTrigger>
                    <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={6}
                      value={carForm.description}
                      onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                      placeholder="Подробное описание автомобиля...&#10;&#10;Можно использовать:&#10;**Жирный текст**&#10;*Курсивный текст*&#10;# Заголовок&#10;- Пункт списка&#10;- Другой пункт"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="w-full p-3 border rounded-md bg-gray-50 min-h-[150px]">
                      {carForm.description ? (
                        <MarkdownRenderer content={carForm.description} />
                      ) : (
                        <p className="text-gray-500 italic">Введите описание для предпросмотра...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Label className="text-sm">Фотографии</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {carForm.imageUrls.map((url, index) => (
                    <ImageUpload
                      key={index}
                      currentImage={url}
                      path="cars"
                      onUpload={(newUrl) => updateImageUrl(index, newUrl)}
                      className="col-span-1"
                    />
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={addImageUrl} size="sm" className="text-xs">
                    <Plus className="h-3 w-3 mr-2" />
                    Добавить фото
                  </Button>
                  {carForm.imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const newUrls = carForm.imageUrls.slice(0, -1)
                        setCarForm({ ...carForm, imageUrls: newUrls.length > 0 ? newUrls : [""] })
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Удалить последнее
                    </Button>
                  )}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={carForm.isAvailable}
                  onChange={(e) => setCarForm({ ...carForm, isAvailable: e.target.checked })}
                />
                <Label htmlFor="isAvailable">В наличии</Label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button type="submit" className="flex-1 text-sm">
                  {editingCar ? "Сохранить" : "Добавить"}
                </Button>
                <Button type="button" variant="outline" className="text-sm" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cars && cars.map((car) => (
          <Card key={car.id}>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="font-semibold text-sm md:text-base truncate flex-1">
                  {car.make} {car.model}
                </h3>
                <Badge variant={car.isAvailable ? "default" : "secondary"} className="text-xs flex-shrink-0">
                  {car.isAvailable ? "В наличии" : "Продан"}
                </Badge>
              </div>
              <div className="text-xs md:text-sm text-gray-600 space-y-1">
                <p>Год: {car.year}</p>
                <p>Цена: ${car.price?.toLocaleString()}</p>
                <p>Пробег: {car.mileage?.toLocaleString()} км</p>
              </div>
              <div className="flex space-x-2 mt-3 md:mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(car)} className="flex-1">
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

      {cars.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Автомобили не добавлены</p>
        </div>
      )}
    </div>
  )
}
