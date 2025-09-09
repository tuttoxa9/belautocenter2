"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { getCachedImageUrl } from "@/lib/image-cache"
import { useIntersectionObserverV2 } from "@/hooks/use-intersection-observer"

interface LazyThumbnailProps {
  src: string
  alt: string
  isSelected: boolean
  onClick: () => void
  index: number
}

export default function LazyThumbnail({ src, alt, isSelected, onClick, index }: LazyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(index < 3) // Загружаем первые 3 сразу

  // Используем оптимизированный хук для IntersectionObserver
  const { ref: imgRef, isIntersecting } = useIntersectionObserverV2({
    rootMargin: '150px',
    threshold: 0.1,
    triggerOnce: true
  })

  // Мемоизируем URL изображения
  const cachedImageUrl = useMemo(() => getCachedImageUrl(src), [src])

  // Устанавливаем shouldLoad при пересечении или если это первые 3 элемента
  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isIntersecting, shouldLoad])

  return (
    <button
      ref={imgRef}
      onClick={onClick}
      className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
          : 'ring-1 ring-slate-200 hover:ring-slate-300'
      }`}
    >
      {shouldLoad ? (
        <div className="w-full h-full relative">
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-pulse" />
          )}
          <Image
            src={cachedImageUrl}
            alt={alt}
            width={56}
            height={56}
            quality={60}
            sizes="56px"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
          <div className="w-6 h-6 bg-slate-300 rounded-full animate-pulse" />
        </div>
      )}
    </button>
  )
}
