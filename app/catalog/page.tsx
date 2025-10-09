// app/catalog/page.tsx

import CatalogClient from './catalog-client'
import { Metadata } from 'next'

export const runtime = 'edge';

// Функция для загрузки данных из Firestore
async function getCarsFromFirestore() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`

  try {
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // БЕЗ кэширования в Next.js Data Cache
      // Кэширование делается на уровне Edge Cache Worker
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch cars:', response.status)
      return []
    }

    const data = await response.json()

    // Парсинг Firestore документов
    const cars = data.documents?.map((doc: any) => {
      const id = doc.name.split('/').pop() || ''
      const fields: Record<string, any> = {}

      for (const [key, value] of Object.entries(doc.fields || {})) {
        fields[key] = convertFieldValue(value)
      }

      return { id, ...fields }
    }) || []

    // Фильтруем только доступные автомобили
    return cars.filter((car: any) => car.isAvailable !== false)
  } catch (error) {
    console.error('Error loading cars:', error)
    return []
  }
}

// Хелпер для конвертации Firestore полей
function convertFieldValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue
  if (value.integerValue !== undefined) return parseInt(value.integerValue)
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue)
  if (value.booleanValue !== undefined) return value.booleanValue
  if (value.timestampValue !== undefined) return new Date(value.timestampValue)
  if (value.arrayValue !== undefined) {
    return value.arrayValue.values?.map((v: any) => convertFieldValue(v)) || []
  }
  if (value.mapValue !== undefined) {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = convertFieldValue(v)
    }
    return result
  }
  if (value.nullValue !== undefined) return null
  return value
}

// Метаданные страницы
export const metadata: Metadata = {
  title: 'Каталог автомобилей | Белавто Центр',
  description: 'Широкий выбор качественных автомобилей с пробегом в Минске. Проверенные авто из Европы и США.',
}

// Серверный компонент страницы
export default async function CatalogPage() {
  // Загружаем данные на сервере
  const cars = await getCarsFromFirestore()

  // Передаем данные в клиентский компонент
  return <CatalogClient initialCars={cars} />
}