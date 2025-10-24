"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { SuccessNotification } from "@/components/success-notification"
import { Toaster, toast } from 'sonner'


interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState({
    show: false,
    message: ""
  })

  const showSuccess = (message: string) => {
    toast.success(message)
  }

  const showError = (message: string) => {
    toast.error(message)
  }

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      <Toaster position="top-center" richColors />
      {children}
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
