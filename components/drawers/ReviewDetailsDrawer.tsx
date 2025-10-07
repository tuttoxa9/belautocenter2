"use client"

import React from "react"
import Image from "next/image"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { Star, User, Calendar } from "lucide-react"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  carModel?: string
  imageUrl?: string
  createdAt: Date
}

interface ReviewDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: Review | null
}

const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`${sizeClasses[size]} ${i < rating ? "text-amber-400 fill-current" : "text-slate-300"}`}
    />
  ))
}

export function ReviewDetailsDrawer({ open, onOpenChange, review }: ReviewDetailsDrawerProps) {
  if (!review) {
    return null
  }

  const renderContent = () => (
    <div className="space-y-6">
      {review.imageUrl && (
        <div className="rounded-xl overflow-hidden bg-slate-100">
          <div className="relative aspect-[4/3]">
            <Image
              src={getCachedImageUrl(review.imageUrl)}
              alt="Фото отзыва"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 flex-shrink-0">
          <User className="h-6 w-6 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-lg truncate">{review.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex">{renderStars(review.rating, "md")}</div>
            <span className="text-sm text-slate-500">{review.rating}/5</span>
          </div>
        </div>
      </div>

      {review.carModel && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/50">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Автомобиль:</span> {review.carModel}
          </p>
        </div>
      )}

      <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
        <p>{review.text}</p>
      </div>

      <div className="flex items-center space-x-2 text-sm text-slate-500 pt-4 border-t border-slate-200/50">
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span>
          Опубликовано {new Date(review.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  )

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Отзыв клиента"
    >
      {renderContent()}
    </UniversalDrawer>
  )
}