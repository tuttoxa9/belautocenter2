import { getCachedImageUrl } from './image-cache'

// Глобальный кэш предзагруженных изображений
const preloadedImages = new Set<string>()

// Пул Image объектов для переиспользования
const imagePool: HTMLImageElement[] = []
const MAX_POOL_SIZE = 10

// Получаем Image объект из пула или создаем новый
function getImageFromPool(): HTMLImageElement {
  if (imagePool.length > 0) {
    return imagePool.pop()!
  }
  return new window.Image()
}

// Возвращаем Image объект в пул
function returnImageToPool(img: HTMLImageElement) {
  if (imagePool.length < MAX_POOL_SIZE) {
    // Очищаем Image объект перед возвратом в пул
    img.src = ''
    img.onload = null
    img.onerror = null
    imagePool.push(img)
  }
}

/**
 * Предзагружает изображения оптимизированным способом
 * @param urls - массив URL изображений для предзагрузки
 * @param maxConcurrent - максимальное количество одновременных загрузок
 */
export function preloadImages(urls: string[], maxConcurrent = 3): Promise<void> {
  if (!urls.length) return Promise.resolve()

  return new Promise((resolve) => {
    let loadedCount = 0
    let currentIndex = 0
    const totalImages = urls.length

    const loadNext = () => {
      if (currentIndex >= totalImages) {
        if (loadedCount >= totalImages) {
          resolve()
        }
        return
      }

      const url = getCachedImageUrl(urls[currentIndex])
      currentIndex++

      // Проверяем, не загружено ли уже изображение
      if (preloadedImages.has(url)) {
        loadedCount++
        loadNext()
        return
      }

      const img = getImageFromPool()

      const onComplete = () => {
        preloadedImages.add(url)
        returnImageToPool(img)
        loadedCount++

        if (loadedCount >= totalImages) {
          resolve()
        } else {
          loadNext()
        }
      }

      img.onload = onComplete
      img.onerror = onComplete
      img.src = url
    }

    // Запускаем загрузку с ограничением количества одновременных запросов
    for (let i = 0; i < Math.min(maxConcurrent, totalImages); i++) {
      loadNext()
    }
  })
}

/**
 * Предзагружает одно изображение
 * @param url - URL изображения
 */
export function preloadImage(url: string): Promise<void> {
  return preloadImages([url], 1)
}

/**
 * Проверяет, предзагружено ли изображение
 * @param url - URL изображения
 */
export function isImagePreloaded(url: string): boolean {
  return preloadedImages.has(getCachedImageUrl(url))
}

/**
 * Очищает кэш предзагруженных изображений
 */
export function clearPreloadCache(): void {
  preloadedImages.clear()
}
