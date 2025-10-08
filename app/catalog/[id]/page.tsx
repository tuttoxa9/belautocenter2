import type { Metadata } from "next"
import { notFound } from "next/navigation"
import CarDetailsClient from "./car-details-client"
import { getCarById, getFinancialPartners } from "@/lib/firestore.server"
import { getCachedImageUrl } from "@/lib/image-cache"
import type { Car } from "@/types/car"

// Устанавливаем кэширование на 24 часа
export const revalidate = 86400
export const runtime = 'edge' // Обязательно для Cloudflare Pages

type Props = {
  params: { id: string }
}

// Генерация метатегов (теперь использует общую функцию)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const carData = await getCarById(params.id) // Use new server function

  if (!carData) {
    return {
      title: "Автомобиль не найден | Белавто Центр",
      description: "Запрашиваемый автомобиль не найден в нашем каталоге.",
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
    openGraph: {
      title: `${carTitle} - ${carPrice}`,
      description: carDescription,
      url: carUrl,
      siteName: 'Белавто Центр',
      images: [{ url: mainImage, width: 1200, height: 630, alt: carTitle }],
      locale: 'ru_BY',
      type: 'website',
    },
  }
}

// Основной компонент страницы
export default async function CarDetailsPage({ params }: Props) {
  // Загружаем все необходимые данные параллельно
  const [car, { banks, leasingCompanies }] = await Promise.all([
    getCarById(params.id),
    getFinancialPartners(),
  ]);

  // Если автомобиль не найден, показываем страницу 404
  if (!car || car.isAvailable === false) {
    notFound()
  }

  // Передаем все данные клиенту
  return <CarDetailsClient car={car} banks={banks} leasingCompanies={leasingCompanies} />
}
