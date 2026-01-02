import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

export default function DealOfTheDaySkeleton() {
  return (
    <div className="w-full my-8 sm:my-16 mx-auto max-w-7xl px-4 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2 rounded-full shadow-sm">
          <Clock className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <div className="flex flex-col">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-0">
          {/* Изображение */}
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[500px] bg-gray-100 dark:bg-zinc-800">
            <Skeleton className="absolute inset-0" />
          </div>

          {/* Информация */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900">
            {/* Header info (Desktop only) */}
            <div className="hidden lg:block mb-8">
              <Skeleton className="h-12 w-48 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>

            {/* Характеристики Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>

            {/* Credit Offer Block */}
            <div className="mb-8 p-5 bg-gray-100 dark:bg-zinc-800 rounded-3xl">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-48 mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>

            <Skeleton className="w-full h-14 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
