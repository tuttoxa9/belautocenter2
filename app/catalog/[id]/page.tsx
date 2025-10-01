import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"
import { getCachedImageUrl } from "@/lib/image-cache"

// Принудительная статическая генерация с кэшированием на сутки
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 86400 // 24 часа

// Функция для парсинга данных Firestore
const parseFirestoreDoc = (doc: any): any => {
  if (!doc || !doc.fields) return null

  const result: any = {}
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = convertFieldValue(value)
  }
  return result
}

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

// Динамическая генерация метатегов на основе данных автомобиля
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    // Загружаем данные автомобиля из Firestore
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${params.id}`

    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Direct-Firestore/1.0'
      }
    })

    if (!response.ok) {
      // Если автомобиль не найден, возвращаем базовые метатеги
      return {
        title: "Автомобиль не найден | Белавто Центр",
        description: "Автомобиль с указанным ID не найден в каталоге Белавто Центр"
      }
    }

    const doc = await response.json()
    const carData = parseFirestoreDoc(doc)

    if (!carData) {
      return {
        title: "Автомобиль не найден | Белавто Центр",
        description: "Автомобиль с указанным ID не найден в каталоге Белавто Центр"
      }
    }

    // Формируем данные для метатегов
    const carTitle = `${carData.make} ${carData.model} ${carData.year} г.`
    const carPrice = carData.price ? `${new Intl.NumberFormat("en-US").format(carData.price)}` : 'Цена по запросу'
    // Создаем простое описание без markdown разметки
    const engineInfo = carData.fuelType === "Электро"
      ? carData.fuelType
      : `${carData.engineVolume ? carData.engineVolume.toFixed(1) : '?'}л ${carData.fuelType || 'бензин'}`

    const carDescription = `${carTitle} • ${carPrice} • ${carData.transmission || 'Автомат'} • ${engineInfo} • ${carData.driveTrain || 'Передний'} привод • Пробег ${carData.mileage ? new Intl.NumberFormat("ru-BY").format(carData.mileage) : 0} км • ${carData.color || 'Цвет не указан'}`

    // Основное изображение автомобиля - используем правильную функцию для формирования URL
    const mainImage = carData.imageUrls && carData.imageUrls.length > 0
      ? getCachedImageUrl(carData.imageUrls[0])
      : getCachedImageUrl('/uploads/car.jpg')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://belautocenter.by'
    const carUrl = `${siteUrl}/catalog/${params.id}`

    return {
      title: `${carTitle} | Белавто Центр`,
      description: carDescription,
      keywords: `${carData.make}, ${carData.model}, ${carData.year}, автомобиль, купить авто, Беларусь, Белавто Центр, ${carData.transmission}, ${carData.fuelType}`,

      // Open Graph метатеги
      openGraph: {
        title: `${carTitle} - ${carPrice}`,
        description: carDescription,
        url: carUrl,
        siteName: 'Белавто Центр',
        images: [
          {
            url: mainImage,
            width: 1200,
            height: 630,
            alt: carTitle,
          }
        ],
        locale: 'ru_BY',
        type: 'website',
      },

      // Twitter Card метатеги
      twitter: {
        card: 'summary_large_image',
        title: `${carTitle} - ${carPrice}`,
        description: carDescription,
        images: [mainImage],
        site: '@belautocenter',
        creator: '@belautocenter',
      },

      // Дополнительные метатеги
      robots: {
        index: carData.isAvailable !== false,
        follow: true,
      },

      // Структурированные данные для поисковых систем
      other: {
        'product:price:amount': carData.price?.toString() || '',
        'product:price:currency': 'USD',
        'product:availability': carData.isAvailable !== false ? 'in stock' : 'out of stock',
        'product:condition': 'used',
        'product:brand': carData.make || '',
        'product:model': carData.model || '',
        'product:year': carData.year?.toString() || '',
      }
    }
  } catch (error) {
    return {
      title: "Автомобиль | Белавто Центр",
      description: "Подробная информация об автомобиле в каталоге Белавто Центр"
    }
  }
}

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  return <CarDetailsClient carId={params.id} />
}
