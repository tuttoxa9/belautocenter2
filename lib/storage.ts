// Импортируем константу для хоста изображений
const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://images.belautocenter.by';

/**
 * Загружает изображение на Cloudflare Worker
 * @param file - Файл для загрузки
 * @param path - Путь (папка) для хранения файла, например 'cars'
 * @returns Promise<string> - Путь к файлу (без хоста), который нужно сохранить в Firestore
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    console.log('Начало загрузки изображения через Cloudflare Worker...')

    // Генерируем уникальный путь для файла, имя файла также подвергается санитизации
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^\w\s.-]/g, '')  // Удаляем все спецсимволы кроме пробелов, точек и дефисов
      .replace(/\s+/g, '-')       // Заменяем пробелы на дефисы
      .replace(/-+/g, '-')        // Заменяем множественные дефисы на один
      .trim();

    const uniquePath = `${path}/${Date.now()}-${cleanFileName}`;

    // Создаем объект FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', uniquePath);

    // Отправляем POST-запрос на эндпоинт загрузки
    const response = await fetch(`${IMAGE_HOST}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
    }

    // Получаем ответ от воркера
    const result = await response.json();

    if (!result.path) {
      throw new Error('Сервер не вернул путь к файлу');
    }

    console.log('Файл успешно загружен, путь:', result.path);

    // Возвращаем только путь к файлу, который будет сохранен в Firestore
    return result.path;
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error);
    if (error instanceof Error) {
      throw new Error(`Ошибка загрузки изображения: ${error.message}`);
    }
    throw new Error("Неизвестная ошибка при загрузке изображения");
  }
}

/**
 * Удаляет изображение через Cloudflare Worker
 * @param path - Путь к файлу, сохраненный в Firestore (без хоста)
 * @returns Promise<void>
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    console.log('Удаление изображения через Cloudflare Worker:', path);

    // Отправляем POST-запрос на эндпоинт удаления
    const response = await fetch(`${IMAGE_HOST}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка удаления: ${response.status} ${response.statusText}`);
    }

    console.log('Файл успешно удален:', path);
  } catch (error) {
    console.error("Ошибка удаления изображения:", error);
    throw error;
  }
}
