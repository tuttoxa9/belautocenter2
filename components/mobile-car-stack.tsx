"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import CarCard from "@/components/car-card"

// Reuse the interface from dynamic-selection or define a compatible one
interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  transmission: string
  bodyType?: string
  imageUrls: string[]
  isAvailable: boolean
  fromEurope?: boolean
  status?: string
  [key: string]: any
}

interface MobileCarStackProps {
  cars: Car[]
}

export default function MobileCarStack({ cars }: MobileCarStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!cars || cars.length === 0) return null

  // We want to show 3 cards max
  const visibleCount = Math.min(cars.length, 3)
  const visibleCards = []

  // Create an array of visible cards relative to the current index
  // keys are absolute indices (currentIndex, currentIndex+1, etc)
  for (let i = 0; i < visibleCount; i++) {
    visibleCards.push({
      offset: i,
      key: currentIndex + i
    })
  }

  // Handle swipe logic
  const handleSwipe = (dir: number) => {
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-[450px] flex justify-center items-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        {visibleCards.slice().reverse().map(({ offset, key }) => (
          <CardItem
            key={key}
            car={cars[key % cars.length]}
            index={offset} // 0 is top
            onSwipe={handleSwipe}
          />
        ))}
      </AnimatePresence>

       <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-0 opacity-40">
          <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            <span>← Смахните</span>
            <span>или</span>
            <span>Смахните →</span>
          </div>
       </div>
    </div>
  )
}

function CardItem({ car, index, onSwipe }: { car: Car, index: number, onSwipe: (dir: number) => void }) {
  const isTop = index === 0
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])

  // Opacity for top card as it gets swiped
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  // Styles for stack position
  const scale = 1 - index * 0.05
  const y = index * 15 // px offset down
  const zIndex = 50 - index

  // Background card opacity (fade out as they go deeper)
  const baseOpacity = index === 0 ? 1 : Math.max(0.5, 1 - index * 0.2)

  return (
    <motion.div
      style={{
        zIndex,
        x: isTop ? x : 0,
        y, // We don't animate y with motion value here, we let layout/animate prop handle it
        scale,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : baseOpacity,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // Prevent drag from intercepting clicks immediately, but if moved it prevents click
      dragSnapToOrigin
      onDragEnd={(e, info) => {
        if (!isTop) return
        const swipeThreshold = 100
        if (info.offset.x > swipeThreshold) {
          onSwipe(1)
        } else if (info.offset.x < -swipeThreshold) {
          onSwipe(-1)
        }
      }}
      // Initial state when entering the stack (at the bottom)
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      // Animate to current position
      animate={{
        scale: scale,
        y: y,
        opacity: isTop ? 1 : baseOpacity
      }}
      // Exit state when swiped (only top card really exits, others just move up)
      exit={{
        x: x.get() < 0 ? -300 : 300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`absolute w-[90%] max-w-sm h-[400px] ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
    >
      <div className="h-full w-full pointer-events-auto select-none">
         {/* Pointer events auto so we can click links inside top card.
             But wait, if isTop is false, wrapper is pointer-events-none.
             So only top card is interactive. Correct.
         */}
        <CarCard car={car} />
      </div>
    </motion.div>
  )
}
