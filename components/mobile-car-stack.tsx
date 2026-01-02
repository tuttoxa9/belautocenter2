"use client"

import { useState, useEffect } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import CarCard from "@/components/car-card"
import { Hand, ArrowLeft, ArrowRight } from "lucide-react"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  currency: string
  mileage: number
  engineVolume: number
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
  for (let i = 0; i < visibleCount; i++) {
    visibleCards.push({
      offset: i, // 0 is top, 1 is behind, 2 is last
      key: (currentIndex + i) % cars.length // Cycling index
    })
  }

  // Handle swipe logic
  const handleSwipe = (dir: number) => {
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-[520px] flex justify-center items-center overflow-hidden py-4">
      <div className="relative w-full h-full flex justify-center items-center">
        <AnimatePresence mode="popLayout">
          {visibleCards.slice().reverse().map(({ offset, key }) => (
            <CardItem
              key={`${key}-${currentIndex}`} // Force re-render/animation when position changes in stack
              car={cars[key]}
              index={offset}
              total={visibleCount}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Visual Hint */}
       <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-50">
          <div className="flex items-center gap-3 px-4 py-2 bg-black/60 dark:bg-white/10 backdrop-blur-md rounded-full text-white/90 dark:text-white border border-white/10 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ArrowLeft className="w-4 h-4 opacity-50" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hand className="w-4 h-4 animate-pulse" />
              <span>Смахните</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-50" />
          </div>
       </div>
    </div>
  )
}

function CardItem({ car, index, total, onSwipe }: { car: Car, index: number, total: number, onSwipe: (dir: number) => void }) {
  const isTop = index === 0
  const x = useMotionValue(0)
  const rotateX = useTransform(x, [-200, 200], [-15, 15])

  // Opacity for top card as it gets swiped
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.8, 1, 0.8, 0])

  // Stack physics
  // More visible scaling
  const scale = 1 - index * 0.06
  // More visible Y offset
  const y = index * 24
  // Alternating rotation for the stack look
  const rotateStatic = index === 0 ? 0 : (index % 2 === 0 ? 2 : -2)

  const zIndex = 50 - index

  // Opacity for background cards
  const baseOpacity = Math.max(0.4, 1 - index * 0.15)

  // Ensure strict safety for CarCard props
  const safeCar = {
    ...car,
    currency: car.currency || 'USD',
    engineVolume: Number(car.engineVolume) || 0
  }

  return (
    <motion.div
      style={{
        zIndex,
        x: isTop ? x : 0,
        rotate: isTop ? rotateX : rotateStatic,
        opacity: isTop ? opacity : baseOpacity,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragSnapToOrigin
      dragElastic={0.7}
      onDragEnd={(e, info) => {
        if (!isTop) return
        const swipeThreshold = 80
        if (info.offset.x > swipeThreshold) {
          onSwipe(1)
        } else if (info.offset.x < -swipeThreshold) {
          onSwipe(-1)
        }
      }}
      initial={{ scale: 0.9, y: y + 50, opacity: 0 }}
      animate={{
        scale: scale,
        y: y,
        opacity: isTop ? 1 : baseOpacity,
        rotate: isTop ? 0 : rotateStatic // Animate rotation to static state
      }}
      exit={{
        x: x.get() < 0 ? -300 : 300,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`absolute w-[90%] max-w-sm h-[440px] origin-top ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
    >
      <div className="h-full w-full relative group">
        <div className={`absolute inset-0 bg-black/5 rounded-3xl transform translate-y-2 translate-x-0 blur-md transition-opacity duration-300 ${isTop ? 'opacity-40' : 'opacity-0'}`} />
        <div className="h-full w-full relative overflow-hidden rounded-3xl shadow-xl border border-white/20 dark:border-white/5 bg-white dark:bg-zinc-900">
           {/* Prevent clicks on links when dragging is handled by checking movement,
               but here we rely on pointer-events-auto.
               We simply render the card. */}
           <CarCard car={safeCar} />

           {/* Overlay for inactive cards to darken them further */}
           {!isTop && (
             <div className="absolute inset-0 bg-white/40 dark:bg-black/40 z-10 pointer-events-none" />
           )}
        </div>
      </div>
    </motion.div>
  )
}
