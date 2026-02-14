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
  isAvailable: boolean
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
      setPhone("+375")
      setSearchQuery("")
      setSelectedCar(null)
      setIsSearching(false)
    }
  }, [isOpen])

  const loadCars = async () => {
    try {
      const data = await firestoreApi.getCollection("cars")
      // Только те, что в наличии
      const availableCars = (data as Car[]).filter(car => car.isAvailable)
      setCars(availableCars)
    } catch (error) {
      console.error("Error loading cars:", error)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCars(cars.slice(0, 20))
    } else {
      const filtered = cars.filter(car =>
        `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCars(filtered.slice(0, 20))
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden font-sans"
        >
          {/* Halo Background Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,transparent_70%)] blur-[60px]" />
          </div>

          {/* Header */}
          <div className="relative z-10 p-4 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
            <button onClick={closeModal} className="p-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={closeModal} className="p-2 hover:opacity-70 transition-opacity">
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col overflow-y-auto pt-8 pb-12 px-6">
            <div className={`w-full mx-auto transition-all duration-500 ease-in-out ${isSearching ? 'max-w-6xl' : 'max-w-md'}`}>

              <div className={`flex flex-col lg:flex-row gap-12 items-start justify-center ${isSearching ? 'lg:items-start' : 'items-center'}`}>

                {/* Left Side: Form */}
                <div className={`w-full flex flex-col transition-all duration-500 ${isSearching ? 'lg:w-[400px]' : 'items-center text-center'}`}>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-2">Давайте подадим заявку на одобрение кредита</h1>
                  <p className="text-[#a8a8a8] text-[14px] md:text-[16px] leading-snug mb-8">
                    Нам понадобится ваш номер телефона
                  </p>

                  <div className="w-full space-y-6">
                    <div className="relative">
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        placeholder="Номер мобильного телефона"
                        className="bg-[#121212] border-[#262626] text-white h-12 rounded-xl focus:ring-1 focus:ring-orange-500/50 placeholder:text-[#8e8e8e] text-base"
                      />
                      {isPhoneFieldValid && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {isPhoneFieldValid && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="relative group">
                            {!selectedCar && !isSearching ? (
                              <button
                                onClick={() => {
                                  setIsSearching(true)
                                  setTimeout(() => searchInputRef.current?.focus(), 100)
                                }}
                                className="w-full bg-[#121212] border border-[#262626] text-white h-12 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-base"
                              >
                                <span>Своя сумма</span>
                                <Search className="h-5 w-5 text-[#8e8e8e]" />
                              </button>
                            ) : selectedCar && !isSearching ? (
                              <button
                                onClick={() => {
                                  setIsSearching(true)
                                  setTimeout(() => searchInputRef.current?.focus(), 100)
                                }}
                                className="w-full bg-[#121212] border border-[#262626] text-white h-12 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-base"
                              >
                                <span className="font-medium truncate mr-2">{selectedCar.make} {selectedCar.model}</span>
                                <X className="h-5 w-5 text-[#8e8e8e] flex-shrink-0" onClick={(e) => {
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
                                  className="bg-[#121212] border-[#262626] text-white h-12 rounded-xl focus:ring-1 focus:ring-orange-500/50 pl-11 text-base"
                                  onBlur={() => {
                                    if (searchQuery === "" && !selectedCar) {
                                      // setTimeout(() => setIsSearching(false), 200)
                                    }
                                  }}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8e8e8e]" />
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-xl font-bold transition-all text-base shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                          >
                            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                            Отправить заявку
                          </Button>

                          {isSearching && (
                            <button
                              onClick={() => setIsSearching(false)}
                              className="w-full text-[#8e8e8e] text-sm hover:text-white transition-colors lg:hidden"
                            >
                              Свернуть каталог
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Side: Mini Catalog (Visible when searching or on large screens when phone is valid) */}
                <AnimatePresence>
                  {isSearching && isPhoneFieldValid && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex-1 w-full lg:max-h-[70vh] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white/90">Выберите автомобиль</h3>
                        <span className="text-xs text-[#8e8e8e]">Найдено: {filteredCars.length}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        <div
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center items-center gap-2 h-32 ${!selectedCar ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626] hover:bg-[#1a1a1a]'}`}
                          onClick={() => {
                            setSelectedCar(null)
                            setIsSearching(false)
                            setSearchQuery("")
                          }}
                        >
                          <div className="text-orange-500 font-bold text-lg">Своя сумма</div>
                          <div className="text-xs text-[#8e8e8e] text-center">Укажите желаемую сумму при звонке</div>
                        </div>

                        {filteredCars.map(car => (
                          <div
                            key={car.id}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-4 ${selectedCar?.id === car.id ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626] hover:bg-[#1a1a1a]'}`}
                            onClick={() => {
                              setSelectedCar(car)
                              setIsSearching(false)
                              setSearchQuery("")
                            }}
                          >
                            <div className="w-24 h-16 relative flex-shrink-0 bg-zinc-900 rounded-xl overflow-hidden shadow-inner">
                              {car.imageUrls && car.imageUrls[0] ? (
                                <Image
                                  src={getCachedImageUrl(car.imageUrls[0])}
                                  alt={`${car.make} ${car.model}`}
                                  fill
                                  quality={60}
                                  sizes="100px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search className="h-4 w-4 text-zinc-700" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="font-bold text-sm truncate text-white">{car.make} {car.model}</div>
                              <div className="text-[#8e8e8e] text-xs mb-1">{car.year} г.</div>
                              <div className="text-orange-500 font-black text-sm">
                                ${car.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}

                        {filteredCars.length === 0 && (
                          <div className="col-span-full py-12 text-[#8e8e8e] text-sm text-center bg-[#121212] rounded-3xl border border-dashed border-[#262626]">
                            Ничего не найдено. Попробуйте другой запрос.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 p-8 text-center space-y-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-[#a8a8a8] font-medium">
              <Link href="/" onClick={closeModal} className="hover:text-white transition-colors">Главная</Link>
              <Link href="/catalog" onClick={closeModal} className="hover:text-white transition-colors">Каталог</Link>
              <Link href="https://vikup.belautocenter.by" onClick={closeModal} className="hover:text-white transition-colors text-nowrap">Выкуп авто</Link>
              <Link href="/warranty" onClick={closeModal} className="hover:text-white transition-colors">Гарантия</Link>
              <Link href="/about" onClick={closeModal} className="hover:text-white transition-colors text-nowrap">О нас</Link>
              <Link href="/contacts" onClick={closeModal} className="hover:text-white transition-colors">Контакты</Link>
              <Link href="/reviews" onClick={closeModal} className="hover:text-white transition-colors">Отзывы</Link>
              <Link href="/privacy" onClick={closeModal} className="hover:text-white transition-colors text-nowrap">Конфиденциальность</Link>
            </div>

            <div className="text-[12px] text-[#8e8e8e] tracking-widest font-bold">
              <p>© 2026 BELAUTOCENTER</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
