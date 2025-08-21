import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl h-full">
      {/* Image Section - Компактная */}
      <div className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-200/60 rounded-t-2xl">
          <Skeleton className="w-full h-56 rounded-t-2xl bg-gray-200/60" />

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Skeleton className="h-6 w-16 rounded-xl bg-gray-200/60" />
          </div>

          {/* Year Badge */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-6 w-12 rounded-xl bg-gray-200/60" />
          </div>
        </div>
      </div>

      {/* Content Section - Компактная */}
      <CardContent className="p-3 space-y-2">
        {/* Title and Price */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-gray-200/60" />

          <div className="space-y-1">
            <Skeleton className="h-6 w-20 bg-gray-200/60" />
            <Skeleton className="h-4 w-24 bg-gray-200/60" />
          </div>
        </div>

        {/* Specifications List - Компактная */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 bg-gray-200/60" />
            <Skeleton className="h-3 w-16 bg-gray-200/60" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 bg-gray-200/60" />
            <Skeleton className="h-3 w-14 bg-gray-200/60" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-8 bg-gray-200/60" />
            <Skeleton className="h-3 w-12 bg-gray-200/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
