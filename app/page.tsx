import { firestoreApi } from "@/lib/firestore-api"
import HomeClient from "./home-client"

interface HomepageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
}

export default async function HomePage() {
  // Параллельная загрузка данных на сервере
  const [settingsDoc, allCars] = await Promise.all([
    firestoreApi.getDocument("pages", "main").catch(() => null),
    firestoreApi.getCollection("cars").catch(() => [])
  ])

  // Фильтрация для блока "Featured Cars" на сервере
  let featuredCars = allCars.filter((car: any) => car.showOnHomepage === true)

  if (featuredCars.length === 0) {
    featuredCars = allCars
      .filter((car: any) => car.isAvailable !== false && car.status !== 'sold')
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 4)
  } else {
    featuredCars = featuredCars
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 4)
  }

  const settings = settingsDoc as HomepageSettings | null

  return (
    <HomeClient
      initialSettings={settings}
      featuredCars={featuredCars}
      allCars={allCars}
    />
  )
}
