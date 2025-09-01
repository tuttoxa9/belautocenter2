// Cloudflare Worker URL для доступа к изображениям
const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://images.belautocenter.by';

/**
 * Преобразует путь к изображению или URL в полный URL для отображения
 * @param imagePathOrUrl - Путь к изображению или полный URL
 * @returns URL для отображения изображения
 */
export function getCachedImageUrl(imagePathOrUrl: string): string {
  // Если путь не указан, возвращаем пустую строку
  if (!imagePathOrUrl) {
    return '';
  }

  // Если URL уже содержит хост, возвращаем как есть
  if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
    // Если это уже URL из нашего хоста изображений, возвращаем как есть
    if (imagePathOrUrl.includes(IMAGE_HOST)) {
      return imagePathOrUrl;
    }

    // Если это URL из Firebase Storage, извлекаем путь и преобразуем его
    if (imagePathOrUrl.includes('firebasestorage.googleapis.com') ||
        imagePathOrUrl.includes('firebasestorage.app')) {
      try {
        // Парсим URL и извлекаем путь
        const url = new URL(imagePathOrUrl);

        // Извлекаем путь из Firebase Storage URL
        // Пример: /v0/b/autobel-a6390.appspot.com/o/путь%2Fк%2Fкартинке.jpg
        const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);

        if (pathMatch && pathMatch[1]) {
          // Декодируем путь и преобразуем %2F обратно в /
          const decodedPath = decodeURIComponent(pathMatch[1]);

          // Убираем параметры запроса вроде ?alt=media
          const cleanPath = decodedPath.split('?')[0];

          // Формируем новый URL: https://images.belautocenter.by/путь/к/картинке.jpg
          return `${IMAGE_HOST}/${cleanPath}`;
        }
      } catch (error) {
        // Не удалось разобрать Storage URL, возвращаем как есть
      }

      // Если не удалось разобрать URL, возвращаем как есть
      return imagePathOrUrl;
    }

    // Для других внешних URL возвращаем как есть
    return imagePathOrUrl;
  }

  // Если это относительный путь (из Firestore), формируем полный URL
  // Пример: "cars/car-id-123/photo-name.jpg" -> "https://images.belautocenter.by/cars/car-id-123/photo-name.jpg"
  return `${IMAGE_HOST}/${imagePathOrUrl}`;
}

/**
 * Преобразует массив путей или URL в массив полных URL для отображения
 * @param paths - Массив путей к изображениям или полных URL
 * @returns Массив URL для отображения изображений
 */
export function getCachedImageUrls(paths: string[]): string[] {
  return paths.map(path => getCachedImageUrl(path));
}
