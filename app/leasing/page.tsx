import LeasingClient from './leasing-client'
import { db } from '@/lib/firebase-admin'
import { LeasingPageSettings } from '@/types/leasing'

async function getLeasingPageSettings(): Promise<LeasingPageSettings | null> {
  try {
    const docRef = db.collection('pages').doc('leasing');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as LeasingPageSettings;
    } else {
      // Возвращаем дефолтные настройки, если документ не найден
      return {
        title: "Автомобиль в лизинг – выгодное решение для бизнеса",
        subtitle: "Получите автомобиль в лизинг на выгодных условиях уже сегодня",
        description: "Лизинг автомобилей - это удобный способ получить транспорт для бизнеса без больших первоначальных затрат. Налоговые льготы, гибкие условия и возможность выкупа.",
        benefits: [],
        leasingCompanies: []
      };
    }
  } catch (error) {
    console.error("Error fetching leasing page settings:", error);
    return null;
  }
}

export const revalidate = 3600; // Revalidate every hour

export default async function LeasingPage() {
  const settings = await getLeasingPageSettings();

  return <LeasingClient initialSettings={settings} />
}
