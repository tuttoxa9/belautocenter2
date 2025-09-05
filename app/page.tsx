import HomeClient from './home-client'
import { db } from '@/lib/firebase-admin'
import { Car } from '@/types/car'
import { HomepageSettings, HomePageData } from '@/types/home'

async function getHomePageData(): Promise<HomePageData> {
    try {
        const carsQuery = db.collection('cars')
            .orderBy('createdAt', 'desc')
            .limit(4);

        const settingsDocRef = db.collection('settings').doc('homepage');

        const [carsSnapshot, settingsDoc] = await Promise.all([
            carsQuery.get(),
            settingsDocRef.get()
        ]);

        const cars = carsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            } as Car;
        });

        const settings = settingsDoc.exists
            ? settingsDoc.data() as HomepageSettings
            : {
                heroTitle: "Найди свой автомобиль надежным способом",
                heroSubtitle: "",
                heroButtonText: "Посмотреть каталог",
                ctaTitle: "Не нашли подходящий автомобиль?",
                ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
              };

        return JSON.parse(JSON.stringify({ cars, settings }));

    } catch (error) {
        console.error("Error fetching homepage data:", error);
        // Return default data on error to prevent the page from crashing
        return {
            cars: [],
            settings: {
                heroTitle: "Найди свой автомобиль надежным способом",
                heroSubtitle: "",
                heroButtonText: "Посмотреть каталог",
                ctaTitle: "Не нашли подходящий автомобиль?",
                ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
            }
        };
    }
}

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
    const homePageData = await getHomePageData();
    return <HomeClient initialData={homePageData} />
}
