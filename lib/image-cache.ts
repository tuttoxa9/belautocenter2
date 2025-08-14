// Cloudflare Worker URL for image caching
const WORKER_URL = process.env.NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL || 'https://images.belautocenter.by';
// Cloudflare R2 public URL
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-c7e57409d13c43939eba55c8df8a0e5d.r2.dev';

/**
 * Converts Storage URL (Firebase or R2) to cached URL via Cloudflare Worker
 * @param storageUrl - Original Storage URL (Firebase or R2)
 * @returns Cached URL via Cloudflare Worker
 */
export function getCachedImageUrl(storageUrl: string): string {
  // If no URL provided, return empty string
  if (!storageUrl) {
    return '';
  }

  // If it's already a cached URL, return as is
  if (storageUrl.includes(WORKER_URL)) {
    return storageUrl;
  }

  // Для изображений из R2 мы можем использовать их напрямую,
  // так как они уже оптимизированы и доступны через CDN
  if (storageUrl.includes(R2_PUBLIC_URL)) {
    return storageUrl;
  }

  // Если это не URL Firebase Storage, вернуть как есть
  if (!storageUrl.includes('firebasestorage.googleapis.com') &&
      !storageUrl.includes('firebasestorage.app')) {
    return storageUrl;
  }

  try {
    // Parse Firebase Storage URL and extract the path
    const url = new URL(storageUrl);

    // Extract path from Firebase Storage URL
    // Example: /v0/b/autobel-a6390.appspot.com/o/путь%2Fк%2Fкартинке.jpg
    const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);

    if (pathMatch && pathMatch[1]) {
      // Decode the path and convert %2F back to /
      const decodedPath = decodeURIComponent(pathMatch[1]);

      // Remove any query parameters like ?alt=media
      const cleanPath = decodedPath.split('?')[0];

      // Construct new URL: https://images.belautocenter.by/images/cars/картинка.jpg
      return `${WORKER_URL}/${cleanPath}`;
    }
  } catch (error) {
    console.warn('Failed to parse Storage URL:', storageUrl, error);
  }

  // Fallback to original URL if parsing fails
  return storageUrl;
}

/**
 * Converts array of Firebase Storage URLs to cached URLs
 * @param firebaseUrls - Array of Firebase Storage URLs
 * @returns Array of cached URLs
 */
export function getCachedImageUrls(firebaseUrls: string[]): string[] {
  return firebaseUrls.map(url => getCachedImageUrl(url));
}
