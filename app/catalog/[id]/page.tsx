import type React from "react"
import type { Metadata } from "next"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import CarDetailsClient from "./car-details-client"

// export const runtime = 'edge'

// Функция для генерации метатегов
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const carDoc = await getDoc(doc(db, "cars", params.id))

    if (!carDoc.exists()) {
      return {
        title: "Автомобиль не найден | Белавто Центр",
        description: "Запрашиваемый автомобиль не найден в каталоге Белавто Центр"
      }
    }

    const car = { id: carDoc.id, ...carDoc.data() } as any
    const carTitle = `${car.make} ${car.model} ${car.year}`
    const carDescription = `${carTitle} - ${car.color}, ${car.mileage?.toLocaleString()} км, ${car.engineVolume}л ${car.fuelType}, ${car.transmission}. Цена: ${car.price?.toLocaleString()}. Кредит и лизинг в Белавто Центр, Минск.`

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
