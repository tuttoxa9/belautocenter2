"use client"

import { useState } from "react"
import { getReviews, Review } from "@/lib/reviews-actions"
import ReviewCard from "./ReviewCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type LastVisible = { createdAt: string } | null

interface ReviewsListProps {
  initialReviews: Review[]
  initialLastVisible: LastVisible
}

export default function ReviewsList({ initialReviews, initialLastVisible }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [lastVisible, setLastVisible] = useState<LastVisible>(initialLastVisible)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialReviews.length > 0 && initialLastVisible !== null)

  const loadMoreReviews = async () => {
    if (!lastVisible || loading) return

    setLoading(true)
    try {
      const { reviews: newReviews, lastVisible: newLastVisible } = await getReviews(12, lastVisible)
      setReviews(prevReviews => [...prevReviews, ...newReviews])
      setLastVisible(newLastVisible)
      setHasMore(newReviews.length > 0 && newLastVisible !== null)
    } catch (error) {
      console.error("Failed to load more reviews:", error)
      // Можно добавить обработку ошибок для пользователя
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {reviews.length > 0 ? (
        <div
          className="sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          {reviews.map(review => (
            <div key={review.id} className="break-inside-avoid">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-800">Отзывов пока нет</h2>
          <p className="text-slate-500 mt-2">Станьте первым, кто поделится своим мнением!</p>
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-10">
          <Button
            onClick={loadMoreReviews}
            disabled={loading}
            size="lg"
            className="bg-slate-800 hover:bg-slate-900 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Показать ещё"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}