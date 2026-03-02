import { firestoreApi } from "@/lib/firestore-api"
import HomeClient from "./home-client"

export const revalidate = false // Статическая генерация для Vercel (снижает CPU). Кэш будет обновляться On-Demand.

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
  let featuredCars = allCars.filter((car: any) =>
    car.showOnHomepage === true &&
    car.isAvailable !== false &&
    car.status !== 'sold'
  )

  // Если вручную выбрано меньше 4 машин, дополняем их самыми свежими
  if (featuredCars.length < 4) {
    const additionalCars = allCars
      .filter((car: any) =>
        car.isAvailable !== false &&
        car.status !== 'sold' &&
        car.showOnHomepage !== true // исключаем те, что уже добавлены
      )
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 4 - featuredCars.length)

    featuredCars = [...featuredCars, ...additionalCars]
  } else {
    // Если выбрано больше 4 машин, обрезаем до 4 (либо можно оставить все, но по ТЗ вроде 4)
    featuredCars = featuredCars.slice(0, 4)
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
