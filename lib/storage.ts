import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const imagePath = `images/${path}/${Date.now()}_${file.name}`
    console.log('Создание reference для Firebase Storage:', imagePath)
    const storageRef = ref(storage, imagePath)
    console.log('Начало загрузки в Firebase Storage...')
    const snapshot = await uploadBytes(storageRef, file)
    console.log('Файл загружен, получение URL...')
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Получен downloadURL:', downloadURL)
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
    const imageRef = ref(storage, url)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Ошибка удаления изображения:", error)
    throw error
  }
}
