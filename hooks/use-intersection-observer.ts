import { useEffect, useRef, useState } from 'react'

// Глобальный observer для оптимизации производительности
let globalObserver: IntersectionObserver | null = null
const observedElements = new WeakMap<Element, () => void>()

interface UseIntersectionObserverOptions {
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    rootMargin = '150px',
    threshold = 0.1,
    triggerOnce = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Создаем глобальный observer только при первом использовании
    if (!globalObserver) {
      globalObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = observedElements.get(entry.target)
            if (callback) {
              callback()
            }
          })
        },
        {
          root: null,
          rootMargin,
          threshold
        }
      )
    }

    // Создаем callback для этого элемента
    const callback = () => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        if (triggerOnce) {
          globalObserver?.unobserve(element)
          observedElements.delete(element)
        }
      } else if (!triggerOnce) {
        setIsIntersecting(false)
      }
    }

    // Используем временную переменную для entry
    let entry: IntersectionObserverEntry

    const enhancedCallback = () => {
      // Находим соответствующий entry
      const entries = globalObserver?.takeRecords() || []
      const foundEntry = entries.find(e => e.target === element)
      if (foundEntry) {
        entry = foundEntry
        callback()
      }
    }

    // Сохраняем callback и начинаем наблюдение
    observedElements.set(element, enhancedCallback)
    globalObserver.observe(element)

    return () => {
      if (element && globalObserver) {
        globalObserver.unobserve(element)
        observedElements.delete(element)
      }
    }
  }, [rootMargin, threshold, triggerOnce])

  return { ref: elementRef, isIntersecting }
}

// Улучшенная версия с правильной обработкой entries
export function useIntersectionObserverV2(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    rootMargin = '150px',
    threshold = 0.1,
    triggerOnce = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === element) {
            if (entry.isIntersecting) {
              setIsIntersecting(true)
              if (triggerOnce) {
                observer.unobserve(element)
              }
            } else if (!triggerOnce) {
              setIsIntersecting(false)
            }
          }
        })
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [rootMargin, threshold, triggerOnce])

  return { ref: elementRef, isIntersecting }
}
