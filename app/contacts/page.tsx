import { firestoreApi } from "@/lib/firestore-api"
import ContactsClient from "./contacts-client"

export const revalidate = false // Статическая генерация для Vercel (снижает CPU). Кэш будет обновляться On-Demand.

export default async function ContactsPage() {
  // Загружаем данные контактов и глобальные настройки параллельно
  const [contactsData, settingsData] = await Promise.all([
    firestoreApi.getDocument("pages", "contacts").catch(() => null),
    firestoreApi.getDocument("settings", "main").catch(() => null)
  ])

  // Формируем итоговые данные, отдавая приоритет специфичным настройкам страницы контактов
  // Если их нет, используем глобальные настройки или fallback-значения
  const data = {
    title: contactsData?.title || "Контакты",
    subtitle: contactsData?.subtitle || "Свяжитесь с нами любым удобным способом",
    address: contactsData?.address || settingsData?.address || "г. Минск",
    addressNote: contactsData?.addressNote || "",
    phone: contactsData?.phone || settingsData?.phone || "+375 29 359 60 00",
    phone2: contactsData?.phone2 || settingsData?.phone2 || "",
    phoneNote: contactsData?.phoneNote || "",
    email: contactsData?.email || settingsData?.email || "info@belautocenter.by",
    emailNote: contactsData?.emailNote || "",
    workingHours: contactsData?.workingHours || (typeof settingsData?.workingHours === 'object' ? settingsData?.workingHours : { weekdays: settingsData?.workingHours || "Пн-Пт: 9:00 - 18:00" }),
    socialMedia: contactsData?.socialMedia || settingsData?.socialMedia || {}
  }

  // Очистка данных от несериализуемых объектов (на всякий случай)
  const cleanData = JSON.parse(JSON.stringify(data))

  return <ContactsClient contactsData={cleanData} />
}
