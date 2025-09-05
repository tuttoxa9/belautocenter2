"use client"

import React from "react"
import { useIntersectionObserverV2 } from "@/hooks/use-intersection-observer"

interface FadeInSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function FadeInSection({
  children,
  className = "",
  delay = 0,
}: FadeInSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserverV2({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`transition-all duration-1000 ease-out ${
          isIntersecting
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
