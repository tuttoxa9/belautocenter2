import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 bg-[length:200%_100%] animate-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
