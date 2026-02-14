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

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
}

export function CreditLeasingModal() {
  const { isOpen, closeModal } = useCreditLeasingModal()
  const { showSuccess } = useNotification()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("+375")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadCars()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      // Reset state when closing
      setStep(1)
      setPhone("+375")
      setSearchQuery("")
      setSelectedCar(null)
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

  const handleContinue = () => {
    if (isPhoneValid(phone)) {
      setStep(2)
    }
  }

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
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-y-auto font-sans">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={step === 1 ? closeModal : () => setStep(1)} className="p-2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button onClick={closeModal} className="p-2 hover:opacity-70 transition-opacity">
          <X className="h-8 w-8" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-12 px-6 max-w-md mx-auto w-full">
        <div className="w-full text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Давайте подадим заявку на одобрение кредита</h1>

          {step === 1 ? (
            <div className="space-y-6 pt-2">
              <p className="text-[#a8a8a8] text-[14px] leading-snug">
                Оставьте свой номер телефона, чтобы мы могли связаться с вами для уточнения деталей.
              </p>
              <div className="relative pt-2">
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="Номер мобильного телефона"
                  className="bg-[#121212] border-[#262626] text-white h-11 rounded-xl focus:ring-1 focus:ring-blue-500 placeholder:text-[#8e8e8e] text-sm"
                />
                {isPhoneValid(phone) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!isPhoneValid(phone)}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white h-8 rounded-lg font-semibold transition-all text-sm"
              >
                Продолжить
              </Button>
            </div>
          ) : (
            <div className="space-y-6 w-full pt-2">
              <p className="text-[#a8a8a8] text-[14px] leading-snug">
                Выберите автомобиль из каталога или укажите свою сумму.
              </p>

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

                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-[#262626] rounded-xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                      <div
                        className="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#262626] text-left text-sm"
                        onClick={() => {
                          setSelectedCar(null)
                          setIsSearching(false)
                          setSearchQuery("")
                        }}
                      >
                        <span className="text-[#0095f6]">Своя сумма</span>
                      </div>
                      {filteredCars.map(car => (
                        <div
                          key={car.id}
                          className="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#262626] text-left flex justify-between text-sm"
                          onClick={() => {
                            setSelectedCar(car)
                            setIsSearching(false)
                            setSearchQuery("")
                          }}
                        >
                          <span>{car.make} {car.model}</span>
                          <span className="text-[#8e8e8e] text-xs">{car.year} г.</span>
                        </div>
                      ))}
                      {filteredCars.length === 0 && (
                        <div className="p-3 text-[#8e8e8e] text-xs">Ничего не найдено</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white h-8 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Отправить заявку
              </Button>
            </div>
          )}
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

        <div className="text-[12px] text-[#a8a8a8] space-y-3">
          <div className="flex items-center justify-center gap-1 cursor-pointer">
            <span>Русский</span>
            <span className="text-[10px]">⌄</span>
          </div>
          <p className="text-[#8e8e8e] tracking-widest text-[11px] uppercase">© {new Date().getFullYear()} BELAUTOCENTER FROM BELARUS</p>
        </div>
      </div>
    </div>
  )
}
