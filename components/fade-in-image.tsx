"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getCachedImageUrl } from "@/lib/image-cache"

interface FadeInImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
}

export default function FadeInImage({
  src,
  alt,
  className,
  fallback = "/placeholder.svg?height=200&width=300",
  width = 300,
  height = 200,
  priority = false,
  sizes = "100vw"
}: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Мемоизируем URL для оптимизации производительности
  const cachedSrc = useMemo(() => getCachedImageUrl(src || fallback), [src, fallback])

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && !hasError && (
        <div className={cn("absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer", className)} />
      )}
      <Image
        src={hasError ? fallback : cachedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true)
          setIsLoaded(true)
        }}
      />
    </div>
  )
}
