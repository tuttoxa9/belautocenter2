"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { SuccessNotification } from "@/components/success-notification"

interface NotificationContextType {
  showSuccess: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState({
    show: false,
    message: ""
  })

  const showSuccess = (message: string) => {
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

  return (
    <NotificationContext.Provider value={{ showSuccess }}>
      {children}
      <SuccessNotification
        show={notification.show}
        message={notification.message}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
