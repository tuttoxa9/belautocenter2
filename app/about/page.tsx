import AboutClient from './about-client';
import { db } from '@/lib/firebase-admin';
import { AboutData } from '@/types/about';

async function getAboutData(): Promise<AboutData | null> {
    try {
        const docRef = db.collection('pages').doc('about');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data() as AboutData;
        } else {
            // Fallback to default data if not found in Firestore
            return {
                pageTitle: "О компании \"АвтоБел Центр\"",
                pageSubtitle: "Мы помогаем людям найти идеальный автомобиль уже более 12 лет. Наша миссия — сделать покупку автомобиля простой, безопасной и выгодной.",
                stats: [
                  { icon: 'Users', label: "Довольных клиентов", value: "2500+" },
                  { icon: 'Award', label: "Лет на рынке", value: "12" },
                  { icon: 'Shield', label: "Проданных автомобилей", value: "5000+" },
                  { icon: 'Clock', label: "Среднее время продажи", value: "7 дней" },
                ],
                companyInfo: {
                  fullName: 'ООО "Белавто Центр"',
                  unp: "191234567",
                  registrationDate: "15.03.2012",
                  legalAddress: "г. Минск, ул. Примерная, 123, офис 45",
                },
                bankDetails: {
                  account: "BY12 ALFA 1234 5678 9012 3456 7890",
                  bankName: 'ОАО "Альфа-Банк"',
                  bik: "ALFABY2X",
                  bankAddress: "г. Минск, пр. Дзержинского, 1",
                },
              };
        }
    } catch (error) {
        console.error("Error fetching about page data:", error);
        return null;
    }
}

export const revalidate = 3600; // Revalidate every hour

export default async function AboutPage() {
    const aboutData = await getAboutData();
    return <AboutClient initialData={aboutData} />;
}
