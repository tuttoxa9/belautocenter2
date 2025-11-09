import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl h-full">
      {/* Image Section - Компактная */}
      <div className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-200/60 dark:from-gray-700/80 dark:to-gray-800/60 rounded-t-2xl">
          <div className="w-full h-56 rounded-t-2xl bg-gray-200/60 dark:bg-gray-700/60 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                 style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <div className="h-6 w-16 rounded-xl bg-gray-200/60 dark:bg-gray-700/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Year Badge */}
          <div className="absolute top-2 right-2">
            <div className="h-6 w-12 rounded-xl bg-gray-200/60 dark:bg-gray-700/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Компактная */}
      <CardContent className="p-3 space-y-2">
        {/* Title and Price */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                 style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
          </div>

          <div className="space-y-1">
            <div className="h-6 w-20 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-4 w-24 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Specifications List - Компактная */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 w-12 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-16 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-14 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-8 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
            <div className="h-3 w-12 bg-gray-200/60 dark:bg-gray-700/60 rounded overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 dark:via-gray-600/20 to-transparent animate-shimmer"
                   style={{ backgroundSize: '200% 100%', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
