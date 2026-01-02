import { Skeleton } from "@/components/ui/skeleton"

export default function DealOfTheDaySkeleton() {
  return (
    <div className="w-full my-8 sm:my-16 mx-auto max-w-7xl px-4 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 dark:bg-zinc-800" />
          <Skeleton className="h-8 w-48 dark:bg-zinc-800" />
        </div>
        <div className="hidden sm:block">
           <Skeleton className="h-10 w-40 rounded-full dark:bg-zinc-800" />
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl">
        <div className="grid lg:grid-cols-12 gap-0">
          {/* Image Skeleton */}
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[500px] bg-gray-100 dark:bg-zinc-800">
             <Skeleton className="h-full w-full absolute inset-0 dark:bg-zinc-800" />
          </div>

          {/* Info Skeleton */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900">
            <div className="hidden lg:block mb-8">
              <Skeleton className="h-10 w-3/4 mb-2 dark:bg-zinc-800" />
              <Skeleton className="h-10 w-1/2 mb-2 dark:bg-zinc-800" />
              <Skeleton className="h-6 w-1/3 mt-4 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
               {Array.from({ length: 4 }).map((_, i) => (
                 <Skeleton key={i} className="h-20 w-full rounded-2xl dark:bg-zinc-800" />
               ))}
            </div>

            <Skeleton className="h-32 w-full rounded-3xl mb-8 dark:bg-zinc-800" />
            <Skeleton className="h-14 w-full rounded-2xl dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
