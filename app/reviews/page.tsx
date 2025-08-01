"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User, MessageSquare, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  carModel?: string
  imageUrl?: string
  createdAt: Date
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [expandedReview, setExpandedReview] = useState<string | null>(null)

  console.log("ReviewsPage состояние:", {
    reviewsCount: reviews.length,
    filteredCount: filteredReviews.length,
    loading,
    filterRating
  })

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    if (filterRating) {
      setFilteredReviews(reviews.filter(review => review.rating === filterRating))
    } else {
      setFilteredReviews(reviews)
    }
  }, [reviews, filterRating])

  const loadReviews = async () => {
    try {
      // Сначала загружаем все отзывы для отладки
      const allReviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"))
      const allSnapshot = await getDocs(allReviewsQuery)
      console.log("Все отзывы в Firebase:", allSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
      )
      const snapshot = await getDocs(reviewsQuery)
      const reviewsData = snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("Обрабатываем отзыв:", doc.id, data)
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      }) as Review[]

      console.log("Отфильтрованные отзывы (published):", reviewsData)
      setReviews(reviewsData)
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error)
      // Попробуем загрузить без фильтра по статусу
      try {
        console.log("Пробуем загрузить без фильтра по статусу...")
        const simpleQuery = query(collection(db, "reviews"))
        const simpleSnapshot = await getDocs(simpleQuery)
        const simpleReviewsData = simpleSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Review[]

        console.log("Отзывы без фильтра:", simpleReviewsData)
        // Фильтруем на клиенте
        const publishedReviews = simpleReviewsData.filter(review => review.status === "published")
        setReviews(publishedReviews)
      } catch (fallbackError) {
        console.error("Ошибка резервной загрузки:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    }
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${i < rating ? "text-amber-400 fill-current" : "text-slate-300"}`}
      />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Загрузка основного блока */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden mb-8">
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
                <div className="h-8 bg-slate-200 rounded-xl w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-xl w-1/2"></div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200/50 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, j) => (
                              <div key={j} className="h-4 w-4 bg-slate-200 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const distribution = getRatingDistribution()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">

        {/* Единый контейнер в стиле страницы автомобиля */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">

          {/* Header с хлебными крошками */}
          <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
            {/* Breadcrumbs */}
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-slate-500">
                <li>
                  <Link href="/" className="hover:text-slate-700 transition-colors">
                    Главная
                  </Link>
                </li>
                <li><ArrowRight className="h-3 w-3" /></li>
                <li className="text-slate-900 font-medium">Отзывы клиентов</li>
              </ol>
            </nav>

            {/* Title and Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Отзывы наших клиентов</h1>
                  <p className="text-slate-600 mt-1">Реальные истории от довольных покупателей</p>
                </div>
              </div>

              {/* Статистика рейтинга */}
              {reviews.length > 0 && (
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{getAverageRating()}</div>
                    <div className="flex justify-center mb-1">{renderStars(Math.round(Number(getAverageRating())), "sm")}</div>
                    <div className="text-xs text-slate-500">{reviews.length} отзывов</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Фильтры */}
          {reviews.length > 0 && (
            <div className="p-4 lg:p-6 bg-slate-50/50 border-b border-slate-200/50">
              <div className="flex items-center space-x-3 overflow-x-auto">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Фильтр по рейтингу:</span>
                <button
                  onClick={() => setFilterRating(null)}
                  className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl transition-colors ${
                    filterRating === null
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Все
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`flex-shrink-0 flex items-center space-x-2 text-sm px-4 py-2 rounded-xl transition-colors ${
                      filterRating === rating
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{rating}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          <div className="p-4 lg:p-6">
            {console.log("Рендеринг отзывов:", { reviews: reviews.length, filteredReviews: filteredReviews.length, filterRating })}
            {filteredReviews && filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviews.map((review) => {
                  console.log("Рендерим отзыв:", review.id, review.name, review.status)
                  const isExpanded = expandedReview === review.id
                  return (
                  <div key={review.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    {/* Review Image */}
                    {review.imageUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden bg-white">
                        <img
                          src={getCachedImageUrl(review.imageUrl)}
                          alt="Фото отзыва"
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{review.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(review.rating, "sm")}</div>
                          <span className="text-xs text-slate-500">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Car Model */}
                    {review.carModel && (
                      <div className="bg-white rounded-xl px-3 py-2 mb-4 border border-slate-200/50">
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Автомобиль:</span> {review.carModel}
                        </p>
                      </div>
                    )}

                    {/* Review Text */}
                    <div className="mb-4">
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleExpandReview(review.id)}
                      >
                        <p className={`text-slate-700 text-sm leading-relaxed transition-all duration-200 ${
                          isExpanded ? 'line-clamp-none' : 'line-clamp-4'
                        }`}>
                          {review.text}
                        </p>
                        {review.text.length > 120 && (
                          <button className="text-xs text-slate-500 hover:text-slate-700 mt-2 transition-colors">
                            {isExpanded ? 'Скрыть' : 'Читать полностью'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400 pt-3 border-t border-slate-200/50">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {review.createdAt.toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )})}
              </div>
            ) : filterRating ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Нет отзывов с {filterRating} звездами
                </h3>
                <p className="text-slate-600 mb-6">
                  Попробуйте выбрать другой рейтинг или сбросьте фильтр
                </p>
                <button
                  onClick={() => setFilterRating(null)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Показать все отзывы
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Пока нет отзывов
                </h3>
                <p className="text-slate-600">
                  Станьте первым, кто оставит отзыв о нашей работе!
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          {reviews.length > 0 && (
            <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200/50">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Поделитесь своим опытом
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Ваш отзыв поможет другим клиентам сделать правильный выбор
                    </p>
                  </div>
                </div>
                <Link
                  href="/contacts"
                  className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  <span>Связаться с нами</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
