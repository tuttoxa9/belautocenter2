import CatalogClient from './catalog-client'
import { firestoreApi } from '@/lib/firestore-api'
import type { Car } from '@/types/car'

// Устанавливаем кэширование на 24 часа
export const revalidate = 86400
export const runtime = 'edge' // Обязательно для Cloudflare Pages

// Теперь это асинхронный серверный компонент
export default async function CatalogPage() {
  // Загружаем данные на сервере
  const allCars = await firestoreApi.getCollection('cars')

  // Фильтруем только доступные автомобили
  const availableCars = allCars.filter((car: any) => car.isAvailable !== false) as Car[]

  // Передаем предзагруженные данные на клиент
  return <CatalogClient initialCars={availableCars} />
}
