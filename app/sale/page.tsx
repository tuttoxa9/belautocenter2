"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SalePage() {
  const router = useRouter()

  useEffect(() => {
    // Перенаправляем на главную страницу с параметром sale=true
    router.replace("/?sale=true")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
}
