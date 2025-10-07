import { Suspense } from 'react'
import CatalogClient from './catalog-client'
import { db } from '@/lib/firebase-admin'
import { Car } from '@/types/car'

// Кэшируем страницу каталога на 6 часов (инкрементальная статическая регенерация)
// Это значительно сократит использование Vercel Functions.
export const revalidate = 21600

// Функция для безопасной сериализации данных из Firestore
const serializeFirestoreData = (doc: any): Car => {
  const data = doc.data()
  // Преобразуем Timestamp в миллисекунды для совместимости с клиентом
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key].toMillis === 'function') {
      data[key] = data[key].toMillis()
    }
  });
  return {
    id: doc.id,
    ...data,
  } as Car
}

// Получаем данные для фильтров (марки, модели)
// В идеале, это должно кэшироваться или храниться в отдельном документе
async function getFilterData() {
  if (!db) return { makes: [], models: [] }

  try {
    const carsSnapshot = await db.collection('cars').where('isAvailable', '==', true).get()
    const cars = carsSnapshot.docs.map(doc => doc.data())

    const makes = [...new Set(cars.map(car => car.make))].sort()
    const models = [...new Set(cars.map(car => car.model))].sort()

    return { makes, models }
  } catch (error) {
    console.error("Failed to fetch filter data:", error)
    return { makes: [], models: [] }
  }
}

// Основная функция для получения отфильтрованных и отсортированных автомобилей
async function getCars(searchParams: { [key: string]: string | string[] | undefined }) {
  if (!db) {
    // Если база данных не инициализирована, возвращаем ошибку
    return { cars: [], totalCars: 0, totalPages: 0, error: "Database connection failed on server. Check environment variables." }
  }

  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('cars')

    // Базовый фильтр: только доступные автомобили
    query = query.where('isAvailable', '==', true)

    // Применение фильтров
    if (searchParams.make && searchParams.make !== 'all') {
      query = query.where('make', '==', searchParams.make)
    }
    if (searchParams.model && searchParams.model !== 'all') {
      query = query.where('model', '==', searchParams.model)
    }
    if (searchParams.priceFrom) {
      query = query.where('price', '>=', Number(searchParams.priceFrom))
    }
    if (searchParams.priceTo) {
      query = query.where('price', '<=', Number(searchParams.priceTo))
    }
    if (searchParams.yearFrom) {
      query = query.where('year', '>=', Number(searchParams.yearFrom))
    }
    if (searchParams.yearTo) {
      query = query.where('year', '<=', Number(searchParams.yearTo))
    }
    if (searchParams.transmission && searchParams.transmission !== 'any') {
      query = query.where('transmission', '==', searchParams.transmission)
    }
    if (searchParams.fuelType && searchParams.fuelType !== 'any') {
      query = query.where('fuelType', '==', searchParams.fuelType)
    }
    if (searchParams.driveTrain && searchParams.driveTrain !== 'any') {
      query = query.where('driveTrain', '==', searchParams.driveTrain)
    }

    // Сортировка
    const sortBy = searchParams.sortBy || 'date-desc'
    switch (sortBy) {
      case 'price-asc': query = query.orderBy('price', 'asc'); break
      case 'price-desc': query = query.orderBy('price', 'desc'); break
      case 'year-desc': query = query.orderBy('year', 'desc'); break
      case 'year-asc': query = query.orderBy('year', 'asc'); break
      case 'mileage-asc': query = query.orderBy('mileage', 'asc'); break
      case 'mileage-desc': query = query.orderBy('mileage', 'desc'); break
      default: query = query.orderBy('createdAt', 'desc'); break
    }

    // Получаем общее количество для пагинации (до применения limit/offset)
    const totalSnapshot = await query.get()
    const totalCars = totalSnapshot.size

    // Пагинация
    const page = Number(searchParams.page || '1')
    const limit = 12
    const totalPages = Math.ceil(totalCars / limit)
    const offset = (page - 1) * limit

    const paginatedQuery = query.offset(offset).limit(limit)
    const carsSnapshot = await paginatedQuery.get()

    const cars = carsSnapshot.docs.map(serializeFirestoreData)

    return { cars, totalCars, totalPages }
  } catch (error) {
    console.error("Failed to fetch cars:", error)
    return { cars: [], totalCars: 0, totalPages: 0 }
  }
}

// Обновленный серверный компонент страницы каталога
export default async function CatalogPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Загружаем данные параллельно для ускорения
  const [filterData, carsData] = await Promise.all([
    getFilterData(),
    getCars(searchParams)
  ])

  return (
    <Suspense fallback={<div>Загрузка каталога...</div>}>
      <CatalogClient
        initialCars={carsData.cars}
        availableMakes={filterData.makes}
        availableModels={filterData.models}
        totalCars={carsData.totalCars}
        totalPages={carsData.totalPages}
        searchParams={searchParams}
        error={carsData.error}
      />
    </Suspense>
  )
}