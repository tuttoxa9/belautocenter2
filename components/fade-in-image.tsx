"use client"

import { BlurImage } from "@/components/ui/blur-image"
import { useMemo, useState } from "react"
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
  const [hasError, setHasError] = useState(false)

  // Мемоизируем URL для оптимизации производительности
  // Если произошла ошибка, используем fallback
  const cachedSrc = useMemo(() => getCachedImageUrl(src || fallback), [src, fallback])
  const finalSrc = hasError ? fallback : cachedSrc

  return (
    <BlurImage
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
      containerClassName="h-full w-full"
      onError={() => setHasError(true)}
    />
  )
}
