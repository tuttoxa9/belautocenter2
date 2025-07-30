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
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // 5 секунд

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className={cn(
        "bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3",
        "animate-in slide-in-from-top-2 duration-300"
      )}>
        <div className="flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
        >
          <X className="h-5 w-5" />
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
