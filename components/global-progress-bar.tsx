"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export const GlobalProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start animation on route change
    setIsAnimating(true)
    
    // Finish animation after a short delay (simulating page load)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none h-1 overflow-hidden">
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ 
              width: ["0%", "30%", "70%", "100%"],
              opacity: [1, 1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1,
              times: [0, 0.2, 0.4, 1],
              ease: "easeInOut"
            }}
            className="h-full bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
