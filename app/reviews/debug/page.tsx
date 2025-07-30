"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  carModel?: string
  imageUrl?: string
  status: string
  createdAt: any
  updatedAt?: any
}

export default function ReviewsDebugPage() {
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadAllReviews()
  }, [])

  const loadAllReviews = async () => {
    try {
      console.log("Загружаем все отзывы для диагностики...")

      // Простой запрос без сортировки
      let snapshot = await getDocs(collection(db, "reviews"))
      console.log("Простой запрос - количество документов:", snapshot.docs.length)

      // С сортировкой
      try {
        const sortedQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"))
        snapshot = await getDocs(sortedQuery)
        console.log("Запрос с сортировкой - количество документов:", snapshot.docs.length)
      } catch (sortError) {
        console.error("Ошибка сортировки:", sortError)
        setError("Ошибка сортировки: " + sortError.message)
      }

      const reviewsData = snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("Документ:", doc.id, data)
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
        }
      }) as Review[]

      console.log("Все загруженные отзывы:", reviewsData)
      setAllReviews(reviewsData)
    } catch (error: any) {
      console.error("Ошибка загрузки отзывов:", error)
      setError("Ошибка загрузки: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Диагностика отзывов</h1>
        <p>Загружаем данные...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Диагностика отзывов</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Статистика</h2>
        <p><strong>Всего отзывов в коллекции:</strong> {allReviews.length}</p>
        <p><strong>Отзывы со статусом "published":</strong> {allReviews.filter(r => r.status === "published").length}</p>
        <p><strong>Отзывы со статусом "pending":</strong> {allReviews.filter(r => r.status === "pending").length}</p>
        <p><strong>Отзывы со статусом "rejected":</strong> {allReviews.filter(r => r.status === "rejected").length}</p>
        <p><strong>Отзывы без статуса:</strong> {allReviews.filter(r => !r.status).length}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Все отзывы в Firebase</h2>
        {allReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>ID:</strong> {review.id}</p>
                <p><strong>Имя:</strong> {review.name}</p>
                <p><strong>Рейтинг:</strong> {review.rating}</p>
                <p><strong>Статус:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    review.status === "published" ? "bg-green-100 text-green-800" :
                    review.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    review.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {review.status || "НЕ УКАЗАН"}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Модель авто:</strong> {review.carModel || "Не указана"}</p>
                <p><strong>Есть изображение:</strong> {review.imageUrl ? "Да" : "Нет"}</p>
                <p><strong>Дата создания:</strong> {
                  review.createdAt ?
                    (review.createdAt.toDate ? review.createdAt.toDate().toLocaleString("ru-RU") : review.createdAt.toString()) :
                    "Не указана"
                }</p>
                <p><strong>Дата обновления:</strong> {
                  review.updatedAt ?
                    (review.updatedAt.toDate ? review.updatedAt.toDate().toLocaleString("ru-RU") : review.updatedAt.toString()) :
                    "Не указана"
                }</p>
              </div>
            </div>
            <div className="mt-4">
              <p><strong>Текст отзыва:</strong></p>
              <p className="mt-2 p-3 bg-gray-50 rounded">{review.text}</p>
            </div>
          </div>
        ))}
      </div>

      {allReviews.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Внимание:</strong> В коллекции "reviews" не найдено ни одного документа.
        </div>
      )}
    </div>
  )
}
