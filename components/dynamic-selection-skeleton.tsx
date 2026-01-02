import { Skeleton } from "@/components/ui/skeleton"

export default function DynamicSelectionSkeleton() {
  return (
    <div className="w-full my-12">
        <div className="flex justify-between items-end mb-6 px-4">
             <div className="space-y-2">
                 <Skeleton className="h-4 w-32 dark:bg-zinc-800" />
                 <Skeleton className="h-8 w-64 dark:bg-zinc-800" />
             </div>
        </div>

        <div className="flex gap-4 overflow-hidden px-4">
             {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="min-w-[280px] w-[280px]">
                      <Skeleton className="h-[200px] w-full rounded-2xl mb-3 dark:bg-zinc-800" />
                      <Skeleton className="h-4 w-3/4 mb-2 dark:bg-zinc-800" />
                      <Skeleton className="h-4 w-1/2 dark:bg-zinc-800" />
                 </div>
             ))}
        </div>
    </div>
  )
}
