import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"
import { getCachedImageUrl } from "@/lib/image-cache"
import { parseFirestoreDoc } from "@/lib/firestore-parser"

// --- ТИПЫ ---
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  [key: string]: any;
}

interface PageProps {
  params: { id: string }
}

// --- ФУНКЦИЯ ПОЛУЧЕНИЯ ДАННЫХ ---
// Эта функция будет использоваться и для метаданных, и для страницы
async function getCar(id: string): Promise<Car | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${id}`;

    // Используем тег 'cars', как указано в ТЗ, для ревалидации
    const response = await fetch(firestoreUrl, {
      next: {
        revalidate: 86400, // 24 часа
        tags: ['cars'],
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SSR-CarDetails/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch car ${id}: ${response.status}`);
      return null;
    }

    const doc = await response.json();
    const carData = parseFirestoreDoc(doc);

    return carData as Car;
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error);
    return null;
  }
}

// --- ГЕНЕРАЦИЯ МЕТАДАННЫХ ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const carData = await getCar(params.id);

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
    },
    robots: {
      index: carData.isAvailable !== false,
      follow: true,
    },
  }
}

// --- КОМПОНЕНТ СТРАНИЦЫ (RSC) ---
export default async function CarDetailsPage({ params }: PageProps) {
  // Получаем данные на сервере
  const car = await getCar(params.id);

  // Передаем ПОЛНЫЙ ОБЪЕКТ автомобиля в клиентский компонент.
  // car-details-client будет отвечать за отображение ошибки, если car === null
  return <CarDetailsClient car={car} />
}