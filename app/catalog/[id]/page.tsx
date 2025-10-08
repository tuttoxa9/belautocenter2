import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"
import { getCachedImageUrl } from "@/lib/image-cache"
import { parseFirestoreDoc } from "@/lib/firestore-parser"

// Re-use the revalidation config from the original file
export const revalidate = 86400 // 24 часа
export const dynamicParams = true

// NEW: Reusable function to fetch car data.
async function getCar(id: string): Promise<any | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${id}`

    const response = await fetch(firestoreUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Direct-Firestore/1.0'
      }
    })

    if (!response.ok) {
      return null
    }

    const doc = await response.json()
    const carData = parseFirestoreDoc(doc)

    if (carData) {
        carData.id = id
    }

    return carData
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error)
    return null
  }
}

// Updated generateMetadata to use the new getCar function.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const carData = await getCar(params.id)

  if (!carData) {
    return {
      title: "Автомобиль не найден | Белавто Центр",
      description: "Автомобиль с указанным ID не найден в каталоге Белавто Центр"
    }
  }

  // ... (rest of the metadata logic is the same)
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
}

// Updated page component to fetch data and pass it to the client component.
export default async function CarDetailsPage({ params }: { params: { id: string } }) {
  const carData = await getCar(params.id)

  // The client component will now receive the car data directly.
  return <CarDetailsClient carId={params.id} initialCarData={carData} />
}
