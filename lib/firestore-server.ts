import { parseFirestoreDoc, parseFirestoreCollection } from './firestore-parser';
import type { Car } from '@/types/car';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

/**
 * Получает все документы из коллекции напрямую из Firestore REST API.
 * Эта функция предназначена для использования только на сервере.
 */
export async function getAllCars(): Promise<Car[]> {
  try {
    const response = await fetch(`${firestoreBaseUrl}/cars`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Server-Side-Build/1.0'
      },
      // Используем кэширование Next.js fetch
      cache: 'no-store' // Отключаем кэш для этого запроса, чтобы revalidate страницы работал корректно
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firestore API error:", errorText);
      throw new Error(`Failed to fetch cars: ${response.status}`);
    }

    const rawData = await response.json();
    return parseFirestoreCollection(rawData);
  } catch (error) {
    console.error("Error in getAllCars:", error);
    return [];
  }
}

/**
 * Получает один документ по ID напрямую из Firestore REST API.
 * Эта функция предназначена для использования только на сервере.
 */
export async function getCarById(id: string): Promise<Car | null> {
  try {
    const response = await fetch(`${firestoreBaseUrl}/cars/${id}`, {
       headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Server-Side-Build/1.0'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error(`Firestore API error for car ${id}:`, errorText);
      throw new Error(`Failed to fetch car ${id}: ${response.status}`);
    }

    const rawData = await response.json();
    return parseFirestoreDoc(rawData);
  } catch (error) {
    console.error(`Error in getCarById for car ${id}:`, error);
    return null;
  }
}