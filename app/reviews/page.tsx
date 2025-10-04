import { getReviews } from "@/lib/reviews-actions"
import ReviewsList from "@/components/reviews/ReviewsList"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const REVIEWS_PER_PAGE = 12

export const metadata = {
  title: "Отзывы клиентов | BelAuto",
  description: "Посмотрите, что говорят наши клиенты! Реальные отзывы о покупке автомобилей в BelAuto.",
  keywords: ["отзывы", "клиенты", "покупка авто", "мнения"],
}

export default async function ReviewsPage() {
  const { reviews: initialReviews, lastVisible } = await getReviews(REVIEWS_PER_PAGE)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Хлебные крошки и заголовок */}
        <div className="mb-8">
          <nav className="mb-4 text-sm text-slate-500">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <ArrowRight className="h-3 w-3" />
              </li>
              <li className="font-medium text-slate-800">Отзывы</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Зал славы BelAuto
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-3xl">
            Истории и впечатления наших клиентов, которые уже осуществили свою мечту о новом автомобиле.
          </p>
        </div>

        {/* Контейнер для списка отзывов */}
        <ReviewsList initialReviews={initialReviews} initialLastVisible={lastVisible} />
      </div>
    </div>
  )
}