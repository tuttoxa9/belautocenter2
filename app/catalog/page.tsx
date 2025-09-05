import CatalogClient from './catalog-client'
import { db } from '@/lib/firebase-admin'
import { Car } from '@/types/car';

async function getCars(): Promise<Car[]> {
  try {
    const carsSnapshot = await db.collection('cars').where('isAvailable', '!=', false).get();
    if (carsSnapshot.empty) {
      console.log("No cars found in Firestore.");
      return [];
    }
    const cars = carsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        make: data.make || '',
        model: data.model || '',
        year: data.year || 0,
        price: data.price || 0,
        mileage: data.mileage || 0,
        transmission: data.transmission || '',
        fuelType: data.fuelType || '',
        driveTrain: data.driveTrain || '',
        images: data.images || [],
        isAvailable: data.isAvailable,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      } as Car;
    });
    return cars;
  } catch (error) {
    console.error("Error fetching cars directly from Firestore:", error);
    // В случае ошибки возвращаем пустой массив, чтобы страница не падала
    return [];
  }
}


// Устанавливаем ревалидацию для страницы, чтобы данные периодически обновлялись
export const revalidate = 3600; // 1 час

export default async function CatalogPage() {
  // Загружаем автомобили на сервере
  const cars = await getCars()

  // Передаем предварительно загруженные данные в клиентский компонент
  return <CatalogClient initialCars={cars} />
}
