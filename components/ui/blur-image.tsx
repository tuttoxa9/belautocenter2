"use client"

import Image, { ImageProps } from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useFetchProgress } from "@/hooks/use-fetch-progress"
import { motion, AnimatePresence } from "framer-motion"

interface BlurImageProps extends ImageProps {
  containerClassName?: string
  showProgress?: boolean
  enabled?: boolean
}

export function BlurImage({ 
  className, 
  containerClassName, 
  src, 
  alt, 
  showProgress = false,
  enabled = true,
  ...props 
}: BlurImageProps) {
  const [isReady, setIsReady] = useState(false)
  
  // Use progress tracking if enabled and requested
  const { progress, isLoaded, dataUrl, reset } = useFetchProgress(
    showProgress ? src as string : null,
    enabled
  )

  const displaySrc = showProgress && dataUrl ? dataUrl : src
  const isLoading = showProgress ? !isLoaded : !isReady

  return (
    <div className={cn("overflow-hidden relative group/img", containerClassName)}>
      {/* Progress UI */}
      <AnimatePresence>
        {showProgress && !isLoaded && enabled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            <div className="relative w-12 h-12">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="125.6"
                  initial={{ strokeDashoffset: 125.6 }}
                  animate={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }}
                  fill="transparent"
                  className="text-blue-600 dark:text-blue-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Image
        {...props}
        src={displaySrc}
        alt={alt}
        className={cn(
          "transition-all duration-700 ease-in-out",
          isLoading
            ? "scale-[1.02] blur-xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={(e) => {
          setIsReady(true)
          props.onLoad?.(e)
        }}
        onError={(e) => {
          setIsReady(true)
          props.onError?.(e)
        }}
      />
    </div>
  )
}
