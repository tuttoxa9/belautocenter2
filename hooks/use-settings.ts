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

interface FinanceSettings {
  rateSource: "nbrb" | "custom" | "hybrid";
  customRate: number;
  hybridMarkup: number;
}

interface Settings {
  main: MainSettings
  finance: FinanceSettings
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
      const [mainDoc, financeDoc] = await Promise.all([
        getDoc(doc(db, "settings", "main")),
        getDoc(doc(db, "settings", "finance")),
      ]);

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

      const defaultFinanceSettings: FinanceSettings = {
        rateSource: "nbrb",
        customRate: 3.25,
        hybridMarkup: 0.1,
      };

      const mainSettings = mainDoc.exists()
        ? { ...defaultSettings, ...JSON.parse(JSON.stringify(mainDoc.data())) }
        : defaultSettings;

      const financeSettings = financeDoc.exists()
        ? { ...defaultFinanceSettings, ...JSON.parse(JSON.stringify(financeDoc.data())) }
        : defaultFinanceSettings;


      setSettings({
        main: mainSettings,
        finance: financeSettings,
      });

    } catch (err) {
      setError("Ошибка загрузки настроек")
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, error, refetch: loadSettings }
}
