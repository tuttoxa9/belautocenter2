import CreditClient from './credit-client'
import { db } from '@/lib/firebase-admin'
import { CreditPageSettings } from '@/types/credit'

async function getCreditPageSettings(): Promise<CreditPageSettings | null> {
  try {
    const docRef = db.collection('pages').doc('credit');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as CreditPageSettings;
    } else {
      // Возвращаем дефолтные настройки, если документ не найден
      return {
        title: "Автокредит на выгодных условиях",
        subtitle: "Получите кредит на автомобиль мечты уже сегодня",
        description: "Мы работаем с ведущими банками Беларуси и поможем вам получить автокредит на самых выгодных условиях.",
        benefits: [],
        partners: []
      };
    }
  } catch (error) {
    console.error("Error fetching credit page settings:", error);
    return null;
  }
}

export const revalidate = 3600; // Revalidate every hour

export default async function CreditPage() {
  const settings = await getCreditPageSettings();

  return <CreditClient initialSettings={settings} />
}
