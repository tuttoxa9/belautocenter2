import { useState, useCallback, useRef } from 'react'

interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

interface UseDebouncedTouchOptions {
  minSwipeDistance?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  debounceMs?: number
}

export function useDebouncedTouch({
  minSwipeDistance = 50,
  onSwipeLeft,
  onSwipeRight,
  debounceMs = 16 // ~60fps
}: UseDebouncedTouchOptions): TouchHandlers {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Используем ref для debounce
  const lastMoveTime = useRef<number>(0)
  const rafId = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return

    const now = Date.now()
    if (now - lastMoveTime.current < debounceMs) return

    // Отменяем предыдущий RAF если он есть
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }

    // Планируем обновление на следующий кадр
    rafId.current = requestAnimationFrame(() => {
      const currentTouch = e.targetTouches[0].clientX
      setTouchEnd(currentTouch)
      lastMoveTime.current = now
    })
  }, [touchStart, debounceMs])

  const onTouchEnd = useCallback(() => {
    // Отменяем RAF если он активен
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }

    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    // Сбрасываем состояние
    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}
