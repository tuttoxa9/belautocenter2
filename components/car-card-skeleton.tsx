import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-white/70 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/60 rounded-2xl h-full dark:border dark:border-gray-800">
      {/* Image Section - Компактная */}
      <div className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-200/60 dark:from-gray-800/90 dark:to-black/90 rounded-t-2xl">
          <div className="w-full h-56 rounded-t-2xl bg-gray-200/60 dark:bg-zinc-800/60 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                 style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <div className="h-6 w-16 rounded-xl bg-gray-200/60 dark:bg-zinc-800/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Year Badge */}
          <div className="absolute top-2 right-2">
            <div className="h-5 w-10 sm:h-6 sm:w-12 rounded bg-gray-200/60 dark:bg-zinc-800/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Компактная */}
      <CardContent className="p-3 space-y-2">
        {/* Title and Price */}
        <div className="mb-1.5 sm:mb-2 flex flex-col xl:flex-row xl:justify-between items-start gap-2 xl:gap-3">
          <div className="w-full xl:flex-1 xl:min-w-0 space-y-2">
            <div className="h-5 w-32 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>

            <div className="space-y-1">
              <div className="h-6 w-20 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                     style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
              </div>
              <div className="h-4 w-24 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                     style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-auto flex flex-col shrink-0 pt-0.5 xl:pt-0">
            <div className="h-10 w-full xl:w-28 sm:h-11 bg-gray-200/60 dark:bg-zinc-800/60 rounded-lg overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Specifications List - Компактная */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 w-12 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-16 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-14 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-8 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-12 bg-gray-200/60 dark:bg-zinc-800/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-zinc-700/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
