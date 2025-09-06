import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"
import { getCachedImageUrl } from "@/lib/image-cache"
import { firestoreApi } from "@/lib/firestore-api"

// Принудительная статическая генерация с кэшированием на сутки
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 86400 // 24 часа

// Динамическая генерация метатегов на основе данных автомобиля
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    // Загружаем данные автомобиля через firestoreApi
    const carData = await firestoreApi.getDocument("cars", params.id)

    if (!carData) {
      return {
        title: "Автомобиль не найден | Белавто Центр",
        description: "Автомобиль с указанным ID не найден в каталоге Белавто Центр"
      }
    }

    // Формируем данные для метатегов
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
        site: '@belautocenter',
        creator: '@belautocenter',
      },
      robots: {
        index: carData.isAvailable !== false,
        follow: true,
      },
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
    console.error('Error generating metadata:', error)
    return {
      title: "Автомобиль | Белавто Центр",
      description: "Подробная информация об автомобиле в каталоге Белавто Центр"
    }
  }
}

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  return <CarDetailsClient carId={params.id} />
}
