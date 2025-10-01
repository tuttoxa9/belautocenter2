import CatalogClient from './catalog-client'
import { firestoreApi } from '@/lib/firestore-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог автомобилей с пробегом',
  description: 'Ознакомьтесь с нашим полным каталогом проверенных автомобилей с пробегом. Лучшие цены в Минске. Кредит и лизинг.',
  alternates: {
    canonical: '/catalog',
  },
}

export const revalidate = 3600

async function getCars() {
  // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
  console.log("--- [SERVER-SIDE] GETCARS DEBUG ---");
  const workerUrl = typeof window === 'undefined'
    ? (process.env.INTERNAL_WORKER_URL || 'http://127.0.0.1:42155')
    : (process.env.NEXT_PUBLIC_API_HOST || '');
  console.log(`[SERVER-SIDE] Determined worker base URL: ${workerUrl}`);
  // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

  try {
    console.log("[SERVER-SIDE] Attempting to fetch cars via firestoreApi...");
    const cars = await firestoreApi.getCollection("cars");
    console.log(`[SERVER-SIDE] Successfully fetched ${cars.length} cars.`);
    return cars.filter((car: any) => car.isAvailable !== false);
  } catch (error: any) {
    // --- УЛУЧШЕННОЕ ЛОГИРОВАНИЕ ОШИБКИ ---
    console.error("[SERVER-SIDE] FATAL: Failed to fetch cars on server.");
    console.error(`[SERVER-SIDE] Error message: ${error.message}`);
    if (error.cause) {
      console.error(`[SERVER-SIDE] Error cause:`, error.cause);
    }
    console.error(`[SERVER-SIDE] Full error object:`, error);
    // --- КОНЕЦ УЛУЧШЕННОГО ЛОГИРОВАНИЯ ---
    return [];
  }
}

export default async function CatalogPage() {
  const initialCars = await getCars()
  return <CatalogClient initialCars={initialCars} />
}
