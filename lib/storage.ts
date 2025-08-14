// Импортируем функции из R2 Storage модуля
import { uploadImageToR2, deleteImageFromR2 } from "./r2-storage"

// Для обратной совместимости оставляем те же имена функций, но используем R2
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    console.log('Начало загрузки изображения в Cloudflare R2...')
    const downloadURL = await uploadImageToR2(file, path)
    console.log('Получен R2 URL:', downloadURL)
    return downloadURL
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error)
    if (error instanceof Error) {
      throw new Error(`Ошибка загрузки изображения: ${error.message}`)
    }
    throw new Error("Неизвестная ошибка при загрузке изображения")
  }
}

export const deleteImage = async (url: string): Promise<void> => {
  try {
    await deleteImageFromR2(url)
  } catch (error) {
    console.error("Ошибка удаления изображения:", error)
    throw error
  }
}
