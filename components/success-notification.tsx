"use client"

import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessNotificationProps {
  show: boolean
  message: string
  onClose: () => void
}

export function SuccessNotification({ show, message, onClose }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // Задержка перед показом уведомления
      const showTimer = setTimeout(() => {
        setIsVisible(true)
      }, 300) // 300мс задержка

      // Автоматическое скрытие через 6 секунд
      const hideTimer = setTimeout(() => {
        onClose()
      }, 6000)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    } else {
      setIsVisible(false)
    }
  }, [show, onClose])

  if (!show || !isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <div className={cn(
        "bg-white border border-green-300 rounded-xl shadow-2xl p-6 flex items-start space-x-4",
        "backdrop-blur-sm bg-white/95",
        "animate-in slide-in-from-top-4 duration-500 ease-out",
        "ring-1 ring-green-200/50"
      )}>
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Успешно выполнено
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
          aria-label="Закрыть уведомление"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Хук для управления уведомлениями
export function useSuccessNotification() {
  const [notification, setNotification] = useState({
    show: false,
    message: ""
  })

  const showNotification = (message: string) => {
    setNotification({
      show: true,
      message
    })
  }

  const hideNotification = () => {
    setNotification({
      show: false,
      message: ""
    })
  }

  return {
    notification,
    showNotification,
    hideNotification
  }
}
