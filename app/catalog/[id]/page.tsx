import type { Metadata } from "next"
import CarDetailsClient from "./car-details-client"

// Принудительная статическая генерация с кэшированием на сутки
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 86400 // 24 часа

// Простые метатеги без серверного компонента
export const metadata: Metadata = {
  title: "Автомобиль | Белавто Центр",
  description: "Подробная информация об автомобиле в каталоге Белавто Центр"
}

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  return <CarDetailsClient carId={params.id} />
}
