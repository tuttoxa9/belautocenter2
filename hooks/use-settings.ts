import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ShowroomInfo {
  title: string
  companyName: string
  address: string
  phone: string
  workingHours: {
    weekdays: string
    weekends: string
  }
}

interface MainSettings {
  companyName: string
  phone: string
  email: string
  address: string
  workingHours: string
  socialMedia: {
    instagram: string
    telegram: string
    avby: string
    tiktok: string
  }
  yandexMapsApiKey: string
  showroomInfo: ShowroomInfo
}

interface Settings {
  main: MainSettings
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const mainDoc = await getDoc(doc(db, "settings", "main"))

      if (mainDoc.exists()) {
        setSettings({
          main: mainDoc.data() as MainSettings
        })
      } else {
        // Дефолтные значения если настройки не найдены
        setSettings({
          main: {
            companyName: "Белавто Центр",
            phone: "+375 29 123-45-67",
            email: "info@belavto.by",
            address: "г. Минск, ул. Примерная, 123",
            workingHours: "Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00",
            socialMedia: {
              instagram: "#",
              telegram: "#",
              avby: "#",
              tiktok: "#",
            },
            yandexMapsApiKey: "",
            showroomInfo: {
              title: "Где посмотреть",
              companyName: "Автохаус Белавто Центр",
              address: "г. Минск, ул. Большое Стиклево 83",
              phone: "+375 29 123-45-67",
              workingHours: {
                weekdays: "Пн-Пт: 9:00-21:00",
                weekends: "Сб-Вс: 10:00-20:00"
              }
            }
          }
        })
      }
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err)
      setError("Ошибка загрузки настроек")
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, error, refetch: loadSettings }
}
