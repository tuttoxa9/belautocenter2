"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { getCachedImageUrl } from "@/lib/image-cache"

interface LazyThumbnailProps {
  src: string
  alt: string
  isSelected: boolean
  onClick: () => void
  index: number
}

export default function LazyThumbnail({ src, alt, isSelected, onClick, index }: LazyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const imgRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '150px', // Начинаем загрузку за 150px до появления для более плавной работы
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [shouldLoad])

  // Загружаем первые 3 миниатюры сразу (для быстрого доступа)
  useEffect(() => {
    if (index < 3) {
      setShouldLoad(true)
    }
  }, [index])

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
            src={getCachedImageUrl(src)}
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
