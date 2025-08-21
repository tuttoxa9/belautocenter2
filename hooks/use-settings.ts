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

      // Дефолтные значения
      const defaultSettings = {
        companyName: "Белавто Центр",
        phone: "+375 29 123-45-67",
        email: "info@belavto.by",
        address: "г. Минск, ул. Примерная, 123",
        workingHours: "Пн-Пт: 9:00-21:00",
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
            weekdays: "Пн-Пт: 9:00-21:00"
          }
        }
      }

      if (mainDoc.exists()) {
        const rawData = mainDoc.data()
        // Очистка данных от несериализуемых объектов Firestore
        const firestoreData = JSON.parse(JSON.stringify(rawData)) as Partial<MainSettings>
        setSettings({
          main: {
            ...defaultSettings,
            ...firestoreData,
            socialMedia: {
              ...defaultSettings.socialMedia,
              ...(firestoreData.socialMedia || {})
            },
            showroomInfo: {
              ...defaultSettings.showroomInfo,
              ...(firestoreData.showroomInfo || {}),
              workingHours: {
                ...defaultSettings.showroomInfo.workingHours,
                ...(firestoreData.showroomInfo && firestoreData.showroomInfo.workingHours ? firestoreData.showroomInfo.workingHours : {})
              }
            }
          }
        })
      } else {
        setSettings({
          main: defaultSettings
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
