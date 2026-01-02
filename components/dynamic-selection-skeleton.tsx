import { Skeleton } from "@/components/ui/skeleton"
import CarCardSkeleton from "@/components/car-card-skeleton"

export default function DynamicSelectionSkeleton() {
  return (
    <section className="py-16 bg-white dark:bg-black relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-40 rounded-[1.2rem]" />
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarCardSkeleton key={index} />
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="mt-10 flex justify-center">
          <Skeleton className="h-14 w-64 rounded-xl" />
        </div>
      </div>
    </section>
  )
}
