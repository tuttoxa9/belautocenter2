"use client"

import React, { useState, useEffect, Suspense } from "react"
import SaleModal from "./sale-modal"

// Динамически импортируем компонент главной страницы
const HomePage = React.lazy(() => import("../page"))

export default function SalePage() {
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
  }

  return (
    <div className="min-h-screen relative">
      {/* Затемненный overlay когда модальное окно открыто */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-40" />
      )}

      {/* Полноценная главная страница в фоне */}
      <div className="relative">
        <Suspense
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
        </Suspense>
      </div>

      {/* Простой лоадер поверх главной */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
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
