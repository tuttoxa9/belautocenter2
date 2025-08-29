"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car } from "lucide-react"
import SaleModal from "./sale-modal"

// Динамически импортируем компонент главной страницы
const HomePage = React.lazy(() => import("../page"))

export default function SalePage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [homePageLoaded, setHomePageLoaded] = useState(false)

  useEffect(() => {
    // Показываем лоадер на 1 секунду, затем модальное окно
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowModal(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => router.push("/"), 300) // Даем время на анимацию закрытия
  }

  return (
    <div className="min-h-screen relative">
      {/* Затемненный overlay когда модальное окно открыто */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      )}

      {/* Полноценная главная страница в фоне */}
      <div className="relative">
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-gray-100 animate-pulse">
              <div className="h-[80vh] bg-gray-300"></div>
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-gray-300 rounded-lg h-64"></div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <HomePage />
        </React.Suspense>
      </div>

      {/* Красивый лоадер */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                <Car className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-blue-200 animate-ping"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Загружаем предложение...</h3>
            <p className="text-gray-600">Подождите несколько секунд</p>
            <div className="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с воронкой */}
      <SaleModal
        isOpen={showModal}
        onClose={handleClose}
      />
    </div>
  )
}
