import type React from "react"
import type { Metadata } from "next"
import { getCachedImageUrl } from "@/lib/image-cache"
import CarDetailsClient from "./car-details-client"

// export const runtime = 'edge'

// Функция для конвертации значения поля из формата Firestore
function convertFieldValue(value: any): any {
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

// Серверная функция для загрузки автомобиля через Cloudflare Worker
async function loadCarFromCloudflare(carId: string) {
  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST
    if (!apiHost) {
      console.error('NEXT_PUBLIC_API_HOST is not defined, falling back to Firestore')
      // Fallback to direct Firestore if no Cloudflare Worker
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`

      const response = await fetch(firestoreUrl, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-Direct-Firestore/1.0'
        }
      })

      if (!response.ok) {
        return null
      }

      const doc = await response.json()
      if (!doc || !doc.fields) {
        return null
      }

      const fields: Record<string, any> = {}
      for (const [key, value] of Object.entries(doc.fields || {})) {
        fields[key] = convertFieldValue(value)
      }

      const id = doc.name.split('/').pop() || carId
      return { id, ...fields }
    }

    // Используем Cloudflare Worker
    const response = await fetch(`${apiHost}/cars/${carId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error loading car:', error)
    return null
  }
}

// Функция для генерации метатегов
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const car = await loadCarFromCloudflare(params.id)

    if (!car) {
      return {
        title: "Автомобиль не найден | Белавто Центр",
        description: "Запрашиваемый автомобиль не найден в каталоге Белавто Центр"
      }
    }
    const carTitle = `${car.make} ${car.model} ${car.year}`
    const engineInfo = car.fuelType === "Электро" ? car.fuelType : `${car.engineVolume}л ${car.fuelType}`
    const carDescription = `${carTitle} - ${car.color}, ${car.mileage?.toLocaleString()} км, ${engineInfo}, ${car.transmission}. Цена: ${car.price?.toLocaleString()}. Кредит и лизинг в Белавто Центр, Минск.`

    // Определяем изображение для социальных сетей
    let carImage = 'https://belautocenter.by/social-preview.jpg' // fallback по умолчанию

    if (car.imageUrls && car.imageUrls.length > 0) {
      const firstImageUrl = car.imageUrls[0]
      const cachedUrl = getCachedImageUrl(firstImageUrl)

      // Убеждаемся, что URL абсолютный
      if (cachedUrl.startsWith('http://') || cachedUrl.startsWith('https://')) {
        carImage = cachedUrl
      } else if (cachedUrl.startsWith('/')) {
        carImage = `https://belautocenter.by${cachedUrl}`
      } else {
        carImage = firstImageUrl // используем оригинальный URL Firebase как fallback
      }

      console.log('Car:', carTitle)
      console.log('Original image URL:', firstImageUrl)
      console.log('Final image URL for meta:', carImage)
    }

    const carUrl = `https://belautocenter.by/catalog/${params.id}`

    return {
      title: `${carTitle} - купить в Минске | Белавто Центр`,
      description: carDescription,
      openGraph: {
        title: `${carTitle} | Белавто Центр`,
        description: carDescription,
        url: carUrl,
        siteName: 'Белавто Центр',
        images: [
          {
            url: carImage,
            width: 1200,
            height: 630,
            alt: `${carTitle} - фото автомобиля`,
            type: 'image/jpeg',
          },
        ],
        locale: 'ru_RU',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${carTitle} | Белавто Центр`,
        description: carDescription,
        images: [carImage],
      },
      alternates: {
        canonical: carUrl,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: "Белавто Центр - автомобили с пробегом",
      description: "Большой выбор качественных автомобилей с пробегом в Минске"
    }
  }
}

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  return <CarDetailsClient carId={params.id} />
}
