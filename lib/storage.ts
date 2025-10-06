// Импортируем константу для хоста изображений и аутентификацию Firebase
import { auth } from './firebase';
const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://images.belautocenter.by';

export interface UploadResult {
  path: string;
  uploadSessionId?: string;
  convertedToWebP?: boolean;
  originalType?: string;
  originalSize?: number;
  savedAs?: string;
  message?: string;
  conversionResult?: {
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    reason: string;
    originalSize: number;
    convertedSize: number;
  };
}

/**
 * Загружает изображение на Cloudflare Worker
 * @param file - Файл для загрузки
 * @param path - Путь (папка) для хранения файла, например 'cars'
 * @param autoWebP - Автоматически конвертировать в WebP (по умолчанию true)
 * @returns Promise<UploadResult> - Результат загрузки с детальной информацией
 */
export const uploadImage = async (file: File, path: string, autoWebP: boolean = true): Promise<UploadResult> => {
  try {

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
    formData.append('autoWebP', autoWebP.toString());

    // Получаем токен аутентификации текущего пользователя
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    // Формируем заголовки запроса
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Отправляем POST-запрос на эндпоинт загрузки с заголовком авторизации
    const response = await fetch(`${IMAGE_HOST}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
    }

    // Получаем ответ от воркера
    const result = await response.json();

    if (!result.success || !result.path) {
      throw new Error(result.error || 'Сервер не вернул путь к файлу');
    }

    // Проверяем информацию о конвертации из нового формата
    const conversionResult = result.conversionResult;
    const wasConverted = conversionResult?.status === 'SUCCESS';

    // Логируем результат конвертации для отладки
    if (conversionResult) {
      console.log(`Конвертация ${conversionResult.status}: ${conversionResult.reason}`);
      if (wasConverted) {
        console.log(`Image converted to WebP: ${result.originalType} -> ${result.savedAs}`);
      }
    }

    // Создаем сообщение для пользователя на основе результата конвертации
    let userMessage = 'Файл успешно загружен';
    if (conversionResult) {
      if (conversionResult.status === 'SUCCESS') {
        const compressionPercent = ((conversionResult.originalSize - conversionResult.convertedSize) / conversionResult.originalSize * 100).toFixed(1);
        userMessage = `Файл загружен и оптимизирован в WebP (сжатие ${compressionPercent}%)`;
      } else if (conversionResult.status === 'FAILED') {
        userMessage = `Файл загружен, но конвертация в WebP не удалась: ${conversionResult.reason}`;
      } else {
        userMessage = `Файл загружен без конвертации: ${conversionResult.reason}`;
      }
    }

    // Возвращаем расширенную информацию о загрузке
    return {
      path: result.path,
      uploadSessionId: result.uploadSessionId,
      convertedToWebP: wasConverted,
      originalType: result.originalType,
      originalSize: conversionResult?.originalSize || 0,
      savedAs: result.savedAs,
      message: userMessage,
      conversionResult: conversionResult
    };
  } catch (error) {
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

    // Получаем токен аутентификации текущего пользователя
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    // Формируем заголовки запроса
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Отправляем POST-запрос на эндпоинт удаления
    const response = await fetch(`${IMAGE_HOST}/delete-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка сервера' }));
      throw new Error(`Ошибка удаления: ${errorData.error || response.statusText}`);
    }

  } catch (error) {
    throw error;
  }
}
