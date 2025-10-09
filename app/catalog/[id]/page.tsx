// app/catalog/[id]/page.tsx

import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"

export const runtime = 'edge';
import { getCachedImageUrl } from "@/lib/image-cache"

// Хелпер для парсинга Firestore документа
function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null

  const result: any = {}
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = convertFieldValue(value)
  }
  return result
}

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

// Функция загрузки автомобиля из Firestore
async function getCarFromFirestore(id: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${id}`

  try {
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'  // Кэширование на уровне Edge
    })

    if (!response.ok) {
      return null
    }

    const doc = await response.json()
    return parseFirestoreDoc(doc)
  } catch (error) {
    console.error('Error loading car:', error)
    return null
  }
}

// Динамическая генерация метатегов
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const carData = await getCarFromFirestore(params.id)

  if (!carData) {
    return {
      title: "Автомобиль не найден | Белавто Центр",
      description: "Автомобиль с указанным ID не найден в каталоге Белавто Центр"
    }
  }

  const carTitle = `${carData.make} ${carData.model} ${carData.year} г.`
  const carPrice = carData.price ? `${new Intl.NumberFormat("en-US").format(carData.price)}` : 'Цена по запросу'

  const engineInfo = carData.fuelType === "Электро"
    ? carData.fuelType
    : `${carData.engineVolume ? carData.engineVolume.toFixed(1) : '?'}л ${carData.fuelType || 'бензин'}`

  const carDescription = `${carTitle} • ${carPrice} • ${carData.transmission || 'Автомат'} • ${engineInfo} • ${carData.driveTrain || 'Передний'} привод • Пробег ${carData.mileage ? new Intl.NumberFormat("ru-BY").format(carData.mileage) : 0} км • ${carData.color || 'Цвет не указан'}`

  const mainImage = carData.imageUrls && carData.imageUrls.length > 0
    ? getCachedImageUrl(carData.imageUrls[0])
    : getCachedImageUrl('/uploads/car.jpg')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belautocenter.by'
  const carUrl = `${siteUrl}/catalog/${params.id}`

  return {
    title: `${carTitle} | Белавто Центр`,
    description: carDescription,
    keywords: `${carData.make}, ${carData.model}, ${carData.year}, автомобиль, купить авто, Беларусь, Белавто Центр, ${carData.transmission}, ${carData.fuelType}`,

    openGraph: {
      title: `${carTitle} - ${carPrice}`,
      description: carDescription,
      url: carUrl,
      siteName: 'Белавто Центр',
      images: [{ url: mainImage, width: 1200, height: 630, alt: carTitle }],
      locale: 'ru_BY',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: `${carTitle} - ${carPrice}`,
      description: carDescription,
      images: [mainImage],
    },

    robots: {
      index: carData.isAvailable !== false,
      follow: true,
    },
  }
}

// Серверный компонент страницы
export default async function CarDetailsPage({ params }: { params: { id: string } }) {
  const carData = await getCarFromFirestore(params.id)

  // Передаем данные в клиентский компонент
  return <CarDetailsClient carId={params.id} initialCar={carData} />
}