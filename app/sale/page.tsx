"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import SaleModal from "./sale-modal"

export default function SalePage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Показываем лоадер на 0.7 секунды, затем модальное окно
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowModal(true)
    }, 700)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => router.push("/"), 300) // Даем время на анимацию закрытия
  }

  return (
    <div className="min-h-screen relative">
      {/* Основной контент главной страницы (загружается всегда) */}
      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Найди свой автомобиль надежным способом</h1>
            <p className="text-xl text-muted-foreground">Поможем вам с приобретением автомобиля</p>
          </div>

          {/* Простой макет каталога */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md p-4 h-64">
                <div className="bg-gray-300 rounded h-32 mb-4"></div>
                <div className="bg-gray-300 rounded h-4 mb-2"></div>
                <div className="bg-gray-300 rounded h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно с воронкой */}
      <SaleModal
        isOpen={showModal}
        onClose={handleClose}
      />
    </div>
  )
}
