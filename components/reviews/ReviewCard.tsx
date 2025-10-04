import Link from "next/link"
import { Review } from "@/lib/reviews-actions"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Star, User, Calendar } from "lucide-react"
import ReviewText from "./ReviewText"

interface ReviewCardProps {
  review: Review
}

const StarRating = ({ rating, size = 4 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-${size} w-${size} ${
            i < rating ? "text-amber-400 fill-current" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewDate = new Date(review.createdAt)

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-slate-300/70">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0">
            <User className="h-6 w-6 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-lg truncate">{review.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={review.rating} />
              <span className="text-xs font-medium text-slate-500 pt-px">{review.rating}/5</span>
            </div>
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-5 flex-grow">
          <ReviewText text={review.text} />
        </div>

        {/* Product Link */}
        {review.product && review.product.image && (
          <Link
            href={`/catalog/${review.product.slug}`}
            className="group block bg-slate-50 rounded-xl p-3 mb-5 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all"
            prefetch={false}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCachedImageUrl(review.product.image, { width: 100, height: 100, quality: 75 })}
                  alt={review.product.name}
                  className="w-full h-full object-cover"
                  unoptimized // Используем unoptimized, как указано в памяти
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Отзыв о</p>
                <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                  {review.product.name}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Footer */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 border-t border-slate-200/80 pt-4 mt-auto">
          <Calendar className="h-4 w-4" />
          <span>
            {reviewDate.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}