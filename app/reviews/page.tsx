"use client"

import { useState, useEffect } from "react"
import { firestoreApi } from "@/lib/firestore-api"
import { Card, CardContent } from "@/components/ui/card"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { Star, User, MessageSquare, Calendar, ArrowRight, Filter, ChevronDown, X } from "lucide-react"
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
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showFilters, setShowFilters] = useState(false)

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
      setLoading(true)
      const allReviews = await firestoreApi.getCollection("reviews")

      const reviewsData = allReviews
        .filter((review: any) => review.status === "published")
        .map((review: any) => ({
          ...review,
          createdAt: review.createdAt ? new Date(review.createdAt) : new Date(),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setReviews(reviewsData as Review[])
    } catch (error) {
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



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <div className="animate-pulse">
            {/* Единый контейнер в стиле страницы автомобиля */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">

              {/* Header - адаптивный для мобилки */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
                {/* Breadcrumbs */}
                <nav className="mb-3 sm:mb-4">
                  <ol className="flex items-center space-x-2 text-xs sm:text-sm">
                    <li>
                      <div className="h-3 sm:h-4 bg-slate-200 rounded w-12 animate-pulse"></div>
                    </li>
                    <li><div className="h-3 w-3 bg-slate-200 rounded animate-pulse"></div></li>
                    <li><div className="h-3 sm:h-4 bg-slate-200 rounded w-16 animate-pulse"></div></li>
                  </ol>
                </nav>

                {/* Title and Stats - мобильная адаптация */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-6 sm:h-8 lg:h-9 bg-slate-300 rounded w-40 sm:w-56 animate-pulse mb-1"></div>
                      <div className="h-3 sm:h-4 bg-slate-200 rounded w-36 sm:w-48 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Статистика рейтинга - компактная для мобилки */}
                  <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="h-5 sm:h-6 bg-slate-300 rounded w-8 mx-auto animate-pulse mb-1"></div>
                        <div className="flex justify-center space-x-1">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="h-3 w-3 bg-slate-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                      <div className="h-3 sm:h-4 bg-slate-200 rounded w-20 sm:w-24 animate-pulse"></div>
                    </div>
                    {/* Кнопка фильтра для мобилки */}
                    <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-lg lg:hidden">
                      <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
                      <div className="h-3 w-3 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Фильтры - скрываемые на мобилке */}
              <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-200/50 hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                  <div className="flex space-x-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 bg-slate-200 rounded-xl w-12 animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Grid - мобильная адаптация */}
              <div className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-6 lg:space-y-0">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200/50">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-slate-300 rounded w-24 sm:w-32 animate-pulse mb-1"></div>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, j) => (
                                <div key={j} className="h-3 w-3 bg-slate-200 rounded animate-pulse"></div>
                              ))}
                            </div>
                            <div className="h-3 bg-slate-200 rounded w-8 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Car Model */}
                      <div className="bg-white rounded-lg px-3 py-2 mb-3 sm:mb-4 border border-slate-200/50">
                        <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                      </div>

                      {/* Review Text */}
                      <div className="mb-3 sm:mb-4 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-slate-200/50">
                        <div className="h-3 w-3 bg-slate-200 rounded animate-pulse flex-shrink-0"></div>
                        <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">

        {/* Единый контейнер в стиле страницы автомобиля */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">

          {/* Header - адаптивный для мобилки */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/50">
            {/* Breadcrumbs */}
            <nav className="mb-3 sm:mb-4">
              <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors" prefetch={true}>
                    Главная
                  </Link>
                </li>
                <li><ArrowRight className="h-3 w-3" /></li>
                <li className="text-slate-900 font-medium">Отзывы</li>
              </ol>
            </nav>

            {/* Title and Stats - мобильная адаптация */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    Отзывы клиентов
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base mt-1">
                    Реальные истории покупателей
                  </p>
                </div>
              </div>

              {/* Статистика рейтинга - компактная для мобилки */}
              {reviews.length > 0 && (
                <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-slate-900">{getAverageRating()}</div>
                      <div className="flex justify-center">{renderStars(Math.round(Number(getAverageRating())), "sm")}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      из {reviews.length} отзывов
                    </div>
                  </div>

                  {/* Кнопка фильтра для мобилки */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors lg:hidden"
                  >
                    <Filter className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Фильтр</span>
                    <ChevronDown className={`h-3 w-3 text-slate-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Фильтры - скрываемые на мобилке */}
          {reviews.length > 0 && (
            <div className={`p-4 sm:p-6 bg-slate-50/50 border-b border-slate-200/50 transition-all duration-300 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}>
              <div className="space-y-3 lg:space-y-0 lg:flex lg:items-center lg:space-x-3">
                <span className="text-sm font-medium text-slate-700 block lg:whitespace-nowrap">
                  Фильтр по рейтингу:
                </span>
                <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:overflow-x-auto">
                  <button
                    onClick={() => {
                      setFilterRating(null)
                      setShowFilters(false)
                    }}
                    className={`flex-shrink-0 text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors ${
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
                      onClick={() => {
                        setFilterRating(filterRating === rating ? null : rating)
                        setShowFilters(false)
                      }}
                      className={`flex-shrink-0 flex items-center space-x-1 sm:space-x-2 text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors ${
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
            </div>
          )}

          {/* Reviews Grid - мобильная адаптация */}
          <div className="p-4 sm:p-6">
            {filteredReviews && filteredReviews.length > 0 ? (
              <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-6 lg:space-y-0">
                {filteredReviews.map((review) => {
                  return (
                  <div key={review.id} className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200/50 hover:shadow-md transition-all duration-300">
                    {/* Review Image - компактнее для мобилки */}
                    {review.imageUrl && (
                      <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden bg-white">
                        <img
                          src={getCachedImageUrl(review.imageUrl)}
                          alt="Фото отзыва"
                          className="w-full aspect-[4/3] sm:aspect-square object-cover"
                        />
                      </div>
                    )}

                    {/* User Info - компактнее */}
                    <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{review.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(review.rating, "sm")}</div>
                          <span className="text-xs text-slate-500">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Car Model - компактнее */}
                    {review.carModel && (
                      <div className="bg-white rounded-lg px-3 py-2 mb-3 sm:mb-4 border border-slate-200/50">
                        <p className="text-xs sm:text-sm text-slate-600">
                          <span className="font-medium">Автомобиль:</span> {review.carModel}
                        </p>
                      </div>
                    )}

                    {/* Review Text - с модальным окном */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed line-clamp-3 sm:line-clamp-4">
                        {review.text}
                      </p>
                      {review.text.length > 100 && (
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 mt-2 transition-colors font-medium"
                        >
                          Читать полностью
                        </button>
                      )}
                    </div>

                    {/* Date - компактнее */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400 pt-3 border-t border-slate-200/50">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
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
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Нет отзывов с {filterRating} звездами
                </h3>
                <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Попробуйте выбрать другой рейтинг или сбросьте фильтр
                </p>
                <button
                  onClick={() => setFilterRating(null)}
                  className="bg-slate-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm sm:text-base"
                >
                  Показать все отзывы
                </button>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Пока нет отзывов
                </h3>
                <p className="text-slate-600 text-sm sm:text-base">
                  Станьте первым, кто оставит отзыв о нашей работе!
                </p>
              </div>
            )}
          </div>

          {/* Call to Action - мобильная адаптация */}
          {reviews.length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200/50">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </div>
                  <div className="text-left flex-1 sm:flex-initial">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      Поделитесь своим опытом
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Ваш отзыв поможет другим клиентам
                    </p>
                  </div>
                </div>
                <Link
                  href="/contacts"
                  prefetch={true}
                  className="inline-flex items-center justify-center space-x-2 bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors w-full sm:w-auto text-sm sm:text-base"
                >
                  <span>Связаться с нами</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drawer для полного отзыва */}
        <UniversalDrawer
          open={!!selectedReview}
          onOpenChange={(open) => !open && setSelectedReview(null)}
          title={`Отзыв от ${selectedReview?.name || ''}`}
          className="sm:max-w-4xl"
          noPadding
        >
          {selectedReview && (
            <div className="flex flex-col h-full">
              {/* Верхняя часть - изображение */}
              <div className="w-full bg-slate-50 flex items-center justify-center p-6 border-b border-slate-200">
                {selectedReview.imageUrl ? (
                  <div className="w-full h-80 max-w-lg rounded-2xl overflow-hidden bg-white shadow-lg">
                    <img
                      src={getCachedImageUrl(selectedReview.imageUrl)}
                      alt="Фото отзыва"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-80 max-w-lg rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                        <User className="h-8 w-8 text-slate-500" />
                      </div>
                      <p className="text-slate-600 font-medium">{selectedReview.name}</p>
                      <div className="flex justify-center">
                        {renderStars(selectedReview.rating, "md")}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Нижняя часть - информация и текст */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex">{renderStars(selectedReview.rating, "md")}</div>
                  <span className="text-sm text-slate-500">{selectedReview.rating}/5</span>
                </div>

                {/* Модель автомобиля */}
                {selectedReview.carModel && (
                  <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 border border-slate-200/50">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Автомобиль:</span> {selectedReview.carModel}
                    </p>
                  </div>
                )}

                {/* Полный текст отзыва */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                    {selectedReview.text}
                  </p>
                </div>

                {/* Дата */}
                <div className="flex items-center space-x-2 text-sm text-slate-500 pt-6 border-t border-slate-200/50 mt-6">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Опубликовано {selectedReview.createdAt.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </UniversalDrawer>
      </div>
    </div>
  )
}
