"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User, MessageSquare, Calendar, Award, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-16 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
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
    )
  }

  const distribution = getRatingDistribution()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-slate-700 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-4 w-4" /></li>
              <li className="text-slate-900 font-medium">Отзывы клиентов</li>
            </ol>
          </nav>

          {/* Title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Отзывы наших клиентов</h1>
                <p className="text-slate-600 mt-1">Реальные истории от довольных покупателей</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-slate-600">
                {reviews.length} отзывов
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics - More Compact and Professional */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {reviews.length > 0 && (
          <div className="mb-6">
            {/* Simple Rating Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  {/* Rating Summary */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-slate-900">{getAverageRating()}</span>
                        <div className="flex">{renderStars(Math.round(Number(getAverageRating())), "sm")}</div>
                        <span className="text-sm text-slate-600">({reviews.length})</span>
                      </div>
                      <p className="text-xs text-slate-500">Средний рейтинг клиентов</p>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    <button
                      onClick={() => setFilterRating(null)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-md transition-colors ${
                        filterRating === null
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Все
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                        className={`flex-shrink-0 flex items-center space-x-1 text-xs px-2 py-1.5 rounded-md transition-colors ${
                          filterRating === rating
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{rating}</span>
                        <Star className="h-2.5 w-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Grid */}
        {console.log("Рендеринг отзывов:", { reviews: reviews.length, filteredReviews: filteredReviews.length, filterRating })}
        {filteredReviews && filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => {
              console.log("Рендерим отзыв:", review.id, review.name, review.status)
              const isExpanded = expandedReview === review.id
              return (
              <Card key={review.id} className="border border-slate-200 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5">
                  {/* Review Image - No hover effect */}
                  {review.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={getCachedImageUrl(review.imageUrl)}
                        alt="Фото отзыва"
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  )}

                  {/* User Info - Compact */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm truncate">{review.name}</h3>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <div className="flex">{renderStars(review.rating, "sm")}</div>
                        <span className="text-xs text-slate-500 ml-1">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Car Model - Compact */}
                  {review.carModel && (
                    <div className="bg-slate-50 rounded-md px-3 py-2 mb-3">
                      <p className="text-xs text-slate-700">
                        <span className="text-slate-500">Автомобиль:</span> <span className="font-medium">{review.carModel}</span>
                      </p>
                    </div>
                  )}

                  {/* Review Text - Simplified */}
                  <div className="mb-3">
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
                        <button className="text-xs text-slate-500 hover:text-slate-700 mt-1 transition-colors">
                          {isExpanded ? 'Скрыть' : 'Читать полностью'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date - Simple */}
                  <div className="flex items-center space-x-1 text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {review.createdAt.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        ) : filterRating ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Нет отзывов с {filterRating} звездами
              </h3>
              <p className="text-slate-600 mb-4">
                Попробуйте выбрать другой рейтинг или сбросьте фильтр
              </p>
              <button
                onClick={() => setFilterRating(null)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Показать все отзывы
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Пока нет отзывов
              </h3>
              <p className="text-slate-600">
                Станьте первым, кто оставит отзыв о нашей работе!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {reviews.length > 0 && (
          <Card className="mt-8 border-0 shadow-sm bg-slate-900">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white">
                    Поделитесь своим опытом
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Ваш отзыв поможет другим клиентам сделать правильный выбор
                  </p>
                </div>
              </div>
              <Link
                href="/contacts"
                className="inline-flex items-center space-x-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                <span>Связаться с нами</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
