'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Server Action для сброса кэша конкретного автомобиля и списка всех авто
 * @param carId ID автомобиля для сброса кэша
 */
export async function revalidateCar(carId: string) {
  console.log(`[Revalidation] Triggering revalidate for car: ${carId}`);

  try {
    // Сбрасываем кэш данных для конкретного авто
    revalidateTag(`car-${carId}`);

    // Сбрасываем кэш списка автомобилей
    revalidateTag('cars-data');

    // Сбрасываем закэшированные страницы, используя 'page' чтобы очистить Server Components
    revalidatePath(`/catalog/${carId}`, 'page');
    revalidatePath('/catalog', 'page');
    revalidatePath('/', 'page');

    return { success: true };
  } catch (error) {
    console.error('[Revalidation] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Server Action для полного сброса кэша каталога
 */
export async function revalidateAllCars() {
  console.log('[Revalidation] Triggering full catalog revalidate');

  try {
    revalidateTag('cars-data');
    revalidatePath('/catalog', 'page');
    revalidatePath('/', 'page');

    return { success: true };
  } catch (error) {
    console.error('[Revalidation] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
