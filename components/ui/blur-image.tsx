"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface BlurImageProps extends ImageProps {
  containerClassName?: string
}

export function BlurImage({ className, containerClassName, src, alt, ...props }: BlurImageProps) {
  const [isLoading, setLoading] = useState(true)

  return (
    <div className={cn("overflow-hidden relative", containerClassName)}>
      <Image
        {...props}
        src={src}
        alt={alt}
        className={cn(
          "transition-all duration-700 ease-in-out",
          isLoading
            ? "scale-[1.02] blur-xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={(e) => {
          setLoading(false)
          props.onLoad?.(e)
        }}
        onError={(e) => {
          setLoading(false)
          props.onError?.(e)
        }}
      />
    </div>
  )
}
