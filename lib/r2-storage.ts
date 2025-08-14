import { v4 as uuidv4 } from 'uuid';

// R2 bucket публичный URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev';

// Генерирует уникальное имя файла с сохранением расширения
const generateUniqueFilename = (originalFilename: string): string => {
  const extension = originalFilename.split('.').pop() || '';
  const randomId = uuidv4().replace(/-/g, '').substring(0, 12);
  const timestamp = Date.now();
  return `${timestamp}-${randomId}.${extension}`;
};

/**
 * Загружает изображение в Cloudflare R2
 * @param file - Файл для загрузки
 * @param path - Путь в хранилище (папка)
 * @returns URL загруженного файла
 */
export const uploadImageToR2 = async (file: File, path: string): Promise<string> => {
  try {
    // Генерируем уникальное имя файла
    const uniqueFilename = generateUniqueFilename(file.name);

    // Создаем полный путь к файлу (например, images/cars/123456-abc123.jpg)
    const filePath = `images/${path}/${uniqueFilename}`;

    console.log('Начало загрузки в Cloudflare R2:', filePath);

    // Формируем URL для API эндпоинта загрузки (должен быть создан в API)
    const uploadUrl = '/api/r2-upload';

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);

    // Выполняем запрос на загрузку
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
    }

    // Получаем результат загрузки
    const result = await response.json();

    // Формируем публичный URL для файла
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`;
    console.log('Файл загружен, URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Ошибка загрузки изображения в R2:", error);
    if (error instanceof Error) {
      throw new Error(`Ошибка загрузки изображения в R2: ${error.message}`);
    }
    throw new Error("Неизвестная ошибка при загрузке изображения в R2");
  }
};

/**
 * Удаляет изображение из Cloudflare R2
 * @param url - URL изображения для удаления
 * @returns Promise<void>
 */
export const deleteImageFromR2 = async (url: string): Promise<void> => {
  try {
    // Проверяем, является ли URL R2 URL
    if (!url.includes(R2_PUBLIC_URL)) {
      console.warn('URL не соответствует R2 хранилищу:', url);
      return;
    }

    // Извлекаем путь файла из URL
    const filePath = url.replace(R2_PUBLIC_URL + '/', '');

    // Формируем URL для API эндпоинта удаления
    const deleteUrl = '/api/r2-delete';

    // Выполняем запрос на удаление
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: filePath }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка удаления: ${response.status} ${response.statusText}`);
    }

    console.log('Файл успешно удален из R2:', filePath);
  } catch (error) {
    console.error("Ошибка удаления изображения из R2:", error);
    throw error;
  }
};
