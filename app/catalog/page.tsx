import CatalogClient from './catalog-client'
import { parseFirestoreDoc } from '@/lib/firestore-parser';

// Определяем тип для автомобиля для строгой типизации
interface Car {
  id: string;
  make: string;
  model:string;
  [key: string]: any; // Позволяет другие поля
}

// Функция для получения автомобилей с сервера
async function getCars(): Promise<Car[]> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars`;

    // Выполняем запрос с ISR-кэшированием на 24 часа и тегом 'cars'
    const response = await fetch(firestoreUrl, {
      next: {
        revalidate: 86400, // 24 часа
        tags: ['cars'],
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SSR/1.0'
      }
    });

    if (!response.ok) {
      // В случае ошибки возвращаем пустой массив, чтобы страница не ломалась
      console.error(`Failed to fetch cars: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // Парсим каждый документ и фильтруем те, что не удалось распарсить
    const cars = (data.documents || [])
      .map(parseFirestoreDoc)
      .filter((car: any) => car && car.id);

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return []; // Возвращаем пустой массив в случае исключения
  }
}

// Теперь это асинхронный серверный компонент
export default async function CatalogPage() {
  // Получаем данные на сервере во время рендеринга
  const cars = await getCars();

  // Передаем данные в клиентский компонент как initialCars
  return <CatalogClient initialCars={cars} />
}