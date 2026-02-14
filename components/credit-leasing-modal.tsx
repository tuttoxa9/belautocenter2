"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, Search, CheckCircle, Loader2 } from "lucide-react"
import { useCreditLeasingModal } from "@/components/providers/credit-leasing-modal-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { firestoreApi } from "@/lib/firestore-api"
import { formatPhoneNumber, isPhoneValid } from "@/lib/validation"
import { useNotification } from "@/components/providers/notification-provider"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  imageUrls?: string[]
}

export function CreditLeasingModal() {
  const { isOpen, closeModal } = useCreditLeasingModal()
  const { showSuccess } = useNotification()
  const [phone, setPhone] = useState("+375")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isPhoneFieldValid = isPhoneValid(phone)

  useEffect(() => {
    if (isOpen) {
      loadCars()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      // Reset state when closing
      setPhone("+375")
      setSearchQuery("")
      setSelectedCar(null)
      setIsSearching(false)
    }
  }, [isOpen])

  const loadCars = async () => {
    try {
      const data = await firestoreApi.getCollection("cars")
      setCars(data as Car[])
    } catch (error) {
      console.error("Error loading cars:", error)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCars(cars.slice(0, 10))
    } else {
      const filtered = cars.filter(car =>
        `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCars(filtered.slice(0, 10))
    }
  }, [searchQuery, cars])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const data = {
        phone,
        car: selectedCar ? `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})` : "Своя сумма",
        type: "credit_leasing_request",
        status: "new",
        createdAt: new Date()
      }

      await firestoreApi.addDocument("leads", data)

      await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      showSuccess("Заявка успешно отправлена! Мы свяжемся с вами.")
      closeModal()
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-y-auto font-sans"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <button onClick={closeModal} className="p-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={closeModal} className="p-2 hover:opacity-70 transition-opacity">
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-start pt-12 px-6 max-w-md mx-auto w-full">
            <div className="w-full text-center space-y-4">
              <h1 className="text-2xl font-bold tracking-tight leading-tight">Давайте подадим заявку на одобрение кредита</h1>
              <p className="text-[#a8a8a8] text-[14px] leading-snug">
                Нам понадобится ваш номер телефона
              </p>

              <div className="space-y-6 pt-2">
                <div className="relative">
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="Номер мобильного телефона"
                    className="bg-[#121212] border-[#262626] text-white h-11 rounded-xl focus:ring-1 focus:ring-blue-500 placeholder:text-[#8e8e8e] text-sm"
                  />
                  {isPhoneFieldValid && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>

                <AnimatePresence>
                  {isPhoneFieldValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6 overflow-visible"
                    >
                      <div className="relative group pt-2">
                        {!isSearching && !selectedCar ? (
                          <button
                            onClick={() => {
                              setIsSearching(true)
                              setTimeout(() => searchInputRef.current?.focus(), 100)
                            }}
                            className="w-full bg-[#121212] border border-[#262626] text-white h-11 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-sm"
                          >
                            <span>Своя сумма</span>
                            <Search className="h-4 w-4 text-[#8e8e8e]" />
                          </button>
                        ) : selectedCar && !isSearching ? (
                          <button
                            onClick={() => {
                              setIsSearching(true)
                              setTimeout(() => searchInputRef.current?.focus(), 100)
                            }}
                            className="w-full bg-[#121212] border border-[#262626] text-white h-11 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-sm"
                          >
                            <span className="font-medium">{selectedCar.make} {selectedCar.model}</span>
                            <X className="h-4 w-4 text-[#8e8e8e]" onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCar(null)
                            }} />
                          </button>
                        ) : (
                          <div className="relative w-full">
                            <Input
                              ref={searchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Поиск марки или модели..."
                              className="bg-[#121212] border-[#262626] text-white h-11 rounded-xl focus:ring-1 focus:ring-blue-500 pl-10 text-sm"
                              onBlur={() => {
                                if (searchQuery === "") {
                                  setTimeout(() => setIsSearching(false), 200)
                                }
                              }}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8e8e8e]" />

                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-[#262626] rounded-xl overflow-hidden z-50 shadow-2xl max-h-[400px] overflow-y-auto">
                              <div
                                className="p-4 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#262626] text-left text-sm"
                                onClick={() => {
                                  setSelectedCar(null)
                                  setIsSearching(false)
                                  setSearchQuery("")
                                }}
                              >
                                <span className="text-[#0095f6] font-semibold">Своя сумма</span>
                              </div>
                              {filteredCars.map(car => (
                                <div
                                  key={car.id}
                                  className="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#262626] text-left flex items-center gap-4"
                                  onClick={() => {
                                    setSelectedCar(car)
                                    setIsSearching(false)
                                    setSearchQuery("")
                                  }}
                                >
                                  <div className="w-20 h-14 relative flex-shrink-0 bg-zinc-800 rounded-md overflow-hidden">
                                    {car.imageUrls && car.imageUrls[0] ? (
                                      <Image
                                        src={getCachedImageUrl(car.imageUrls[0])}
                                        alt={`${car.make} ${car.model}`}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Search className="h-4 w-4 text-zinc-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{car.make} {car.model}</div>
                                    <div className="text-[#8e8e8e] text-xs">{car.year} г.</div>
                                  </div>
                                  <div className="text-[#0095f6] font-bold text-sm">
                                    ${car.price.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                              {filteredCars.length === 0 && (
                                <div className="p-4 text-[#8e8e8e] text-xs text-center">Ничего не найдено</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white h-9 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Отправить заявку
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-[#a8a8a8]">
              <Link href="/" onClick={closeModal} className="hover:underline">Главная</Link>
              <Link href="/catalog" onClick={closeModal} className="hover:underline">Каталог</Link>
              <Link href="https://vikup.belautocenter.by" onClick={closeModal} className="hover:underline text-nowrap">Выкуп авто</Link>
              <Link href="/warranty" onClick={closeModal} className="hover:underline">Гарантия</Link>
              <Link href="/about" onClick={closeModal} className="hover:underline text-nowrap">О нас</Link>
              <Link href="/contacts" onClick={closeModal} className="hover:underline">Контакты</Link>
              <Link href="/reviews" onClick={closeModal} className="hover:underline">Отзывы</Link>
              <Link href="/privacy" onClick={closeModal} className="hover:underline text-nowrap">Политика конфиденциальности</Link>
            </div>

            <div className="text-[12px] text-[#8e8e8e] pt-4">
              <p className="tracking-widest uppercase">© 2026 BELAUTOCENTER</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
