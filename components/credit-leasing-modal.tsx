"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, Search, CheckCircle, Loader2, Gauge, Fuel, Settings2, Calendar } from "lucide-react"
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
  priceByn?: number
  currency: string
  imageUrls?: string[]
  isAvailable: boolean
  mileage: number
  engineVolume: number
  fuelType: string
  transmission: string
}

interface Partner {
  name: string
  logoUrl: string
}

export function CreditLeasingModal() {
  const { isOpen, type, closeModal } = useCreditLeasingModal()
  const { showSuccess } = useNotification()
  const [phone, setPhone] = useState("+375")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const isPhoneFieldValid = isPhoneValid(phone)
  const isLeasing = type === "leasing"

  useEffect(() => {
    if (isOpen) {
      loadCars()
      loadPartners()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      setPhone("+375")
      setSearchQuery("")
      setSelectedCar(null)
      setIsSearching(false)
      setShowDetails(false)
    }
  }, [isOpen, type])

  useEffect(() => {
    if (selectedCar) {
      setIsImageLoading(true)
    }
    if (contentRef.current) {
        contentRef.current.scrollTop = 0
    }
  }, [selectedCar, showDetails])

  const loadCars = async () => {
    try {
      const data = await firestoreApi.getCollection("cars")
      const availableCars = (data as Car[]).filter(car => car.isAvailable)
      setCars(availableCars)
    } catch (error) {
      console.error("Error loading cars:", error)
    }
  }

  const loadPartners = async () => {
    try {
      const pageId = isLeasing ? "leasing" : "credit"
      const data = await firestoreApi.getDocument("pages", pageId)
      if (data) {
        const partnerList = isLeasing ? data.leasingCompanies : data.partners
        setPartners(partnerList || [])
      }
    } catch (error) {
      console.error("Error loading partners:", error)
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
        type: isLeasing ? "leasing_request" : "credit_request",
        status: "new",
        createdAt: new Date()
      }

      await firestoreApi.addDocument("leads", data)

      await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      showSuccess(`Заявка на ${isLeasing ? 'лизинг' : 'кредит'} успешно отправлена!`)
      closeModal()
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMonthlyPayment = (car: Car) => {
    return Math.round(car.price * 0.0631)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden font-sans"
        >
          {/* Intense Halo Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(circle,rgba(249,115,22,0.2)_0%,transparent_70%)] blur-[50px]" />
             <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,transparent_70%)] blur-[80px]" />
          </div>

          {/* Controls */}
          <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
            <button
                onClick={showDetails ? () => setShowDetails(false) : closeModal}
                className="p-2 hover:opacity-70 transition-opacity pointer-events-auto"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
                onClick={closeModal}
                className="p-2 hover:opacity-70 transition-opacity pointer-events-auto"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Content Area */}
          <div ref={contentRef} className="relative z-10 flex-1 flex flex-col overflow-y-auto px-6 pb-12 custom-scrollbar">
            <div className={`w-full mx-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearching || showDetails ? 'max-w-6xl' : 'max-w-md'}`}>

              <AnimatePresence mode="wait" initial={false}>
                {!showDetails ? (
                  <motion.div
                    key="catalog-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center"
                  >
                    {/* Form Side */}
                    <div className={`w-full flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearching ? 'lg:w-[400px]' : 'items-center text-center'}`}>
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                        Подать заявку на {isLeasing ? 'лизинг' : 'кредит'}
                      </h1>
                      <p className="text-[#a8a8a8] text-sm leading-snug mb-8">
                        Нам понадобится ваш номер телефона
                      </p>

                      <div className="w-full space-y-6">
                        <div className="relative">
                          <Input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            placeholder="Номер мобильного телефона"
                            className="bg-[#121212] border-[#262626] text-white h-12 rounded-xl focus:ring-1 focus:ring-orange-500/50 placeholder:text-[#555] text-base"
                          />
                          {isPhoneFieldValid && (
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                          )}
                        </div>

                        <AnimatePresence mode="wait">
                          {isPhoneFieldValid && (
                            <motion.div
                              key="form-fields"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-6 overflow-visible"
                            >
                              <div className="relative group">
                                {!selectedCar && !isSearching ? (
                                  <button
                                    onClick={() => {
                                      setIsSearching(true)
                                      setTimeout(() => searchInputRef.current?.focus(), 100)
                                    }}
                                    className="w-full bg-[#121212] border border-[#262626] text-white h-12 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                                  >
                                    <span className="text-[#8e8e8e]">Выберите автомобиль</span>
                                    <Search className="h-5 w-5 text-[#8e8e8e]" />
                                  </button>
                                ) : selectedCar && !isSearching ? (
                                  <button
                                    onClick={() => {
                                      setIsSearching(true)
                                      setTimeout(() => searchInputRef.current?.focus(), 100)
                                    }}
                                    className="w-full bg-[#121212] border border-[#262626] text-white h-12 px-4 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
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
                                      placeholder="Поиск по каталогу..."
                                      className="bg-[#121212] border-[#262626] text-white h-12 rounded-xl focus:ring-1 focus:ring-orange-500/50 pl-11 text-base"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#444]" />
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-xl font-bold transition-all text-base flex items-center justify-center gap-2"
                              >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Отправить заявку"}
                              </Button>

                              {isSearching && (
                                <button
                                  onClick={() => setIsSearching(false)}
                                  className="w-full text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors lg:hidden"
                                >
                                  Свернуть каталог
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Partners */}
                        {partners.length > 0 && (
                          <div className="pt-12">
                            <h3 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-6 text-center">Наши партнеры</h3>
                            <div className="grid grid-cols-3 gap-6 items-center justify-items-center opacity-40">
                              {partners.slice(0, 6).map((partner, index) => (
                                <div key={index} className="w-16 h-8 relative grayscale">
                                  <img
                                    src={getCachedImageUrl(partner.logoUrl)}
                                    alt={partner.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Catalog Side */}
                    <AnimatePresence>
                      {isSearching && isPhoneFieldValid && (
                        <motion.div
                          initial={{ opacity: 0, y: 40, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 40, scale: 0.98 }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="flex-1 w-full lg:max-h-[70vh] flex flex-col"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white/90">Доступные автомобили</h3>
                            <span className="text-xs text-[#555]">{filteredCars.length}</span>
                          </div>

                          {/* Mobile Catalog */}
                          <div className="flex lg:hidden overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4">
                            <div
                                className={`flex-shrink-0 w-32 h-40 p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center items-center gap-2 ${!selectedCar ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626]'}`}
                                onClick={() => {
                                    setSelectedCar(null)
                                    setIsSearching(false)
                                    setSearchQuery("")
                                }}
                            >
                                <div className="text-orange-500 font-bold text-center text-sm">Своя сумма</div>
                            </div>
                            {filteredCars.map(car => (
                                <div
                                    key={car.id}
                                    className={`flex-shrink-0 w-40 p-2 rounded-2xl border transition-all cursor-pointer ${selectedCar?.id === car.id ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626]'}`}
                                    onClick={() => {
                                        setSelectedCar(car)
                                        setShowDetails(true)
                                    }}
                                >
                                    <div className="w-full h-24 relative bg-zinc-900 rounded-xl overflow-hidden mb-2">
                                        {car.imageUrls && car.imageUrls[0] ? (
                                            <Image
                                            src={getCachedImageUrl(car.imageUrls[0])}
                                            alt={`${car.make} ${car.model}`}
                                            fill
                                            quality={40}
                                            sizes="150px"
                                            className="object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="font-bold text-[10px] truncate mb-1">{car.make} {car.model}</div>
                                    <div className="text-orange-500 font-bold text-xs">${car.price.toLocaleString()}</div>
                                </div>
                            ))}
                          </div>

                          {/* Desktop Catalog */}
                          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                            <div
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center items-center gap-2 h-40 ${!selectedCar ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626] hover:bg-[#1a1a1a]'}`}
                            onClick={() => {
                                setSelectedCar(null)
                                setIsSearching(false)
                                setSearchQuery("")
                            }}
                            >
                              <div className="text-orange-500 font-bold text-lg">Своя сумма</div>
                            </div>

                            {filteredCars.map(car => (
                            <div
                                key={car.id}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${selectedCar?.id === car.id ? 'bg-orange-600/20 border-orange-500' : 'bg-[#121212] border-[#262626] hover:bg-[#1a1a1a]'}`}
                                onClick={() => {
                                    setSelectedCar(car)
                                    setShowDetails(true)
                                }}
                            >
                                  <div className="w-full h-28 relative bg-zinc-900 rounded-xl overflow-hidden shadow-inner">
                                      {car.imageUrls && car.imageUrls[0] ? (
                                          <Image
                                          src={getCachedImageUrl(car.imageUrls[0])}
                                          alt={`${car.make} ${car.model}`}
                                          fill
                                          quality={50}
                                          sizes="250px"
                                          className="object-cover"
                                          />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                              <Search className="h-5 w-5 text-zinc-800" />
                                          </div>
                                      )}
                                  </div>
                                  <div>
                                      <div className="font-bold text-xs truncate mb-1">{car.make} {car.model}</div>
                                      <div className="text-orange-500 font-bold text-sm">
                                          ${car.price.toLocaleString()}
                                      </div>
                                  </div>
                            </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="details-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col items-center"
                  >
                    {selectedCar && (
                      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0a0a0a] p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                          <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden">
                              {isImageLoading && (
                                  <div className="absolute inset-0 z-10 bg-zinc-800 animate-pulse" />
                              )}
                              {selectedCar.imageUrls && selectedCar.imageUrls[0] ? (
                                  <Image
                                      src={getCachedImageUrl(selectedCar.imageUrls[0])}
                                      alt={selectedCar.make}
                                      fill
                                      className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                      quality={85}
                                      onLoad={() => setIsImageLoading(false)}
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                      <Search className="h-12 w-12 text-zinc-800" />
                                  </div>
                              )}
                          </div>

                          <div className="space-y-6">
                              <div className="space-y-1">
                                  <h2 className="text-3xl font-bold tracking-tight uppercase leading-none">{selectedCar.make} {selectedCar.model}</h2>
                                  <p className="text-orange-500 font-bold text-2xl">${selectedCar.price.toLocaleString()}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { icon: Calendar, label: "Год", value: selectedCar.year },
                                    { icon: Gauge, label: "Пробег", value: `${selectedCar.mileage.toLocaleString()} км` },
                                    { icon: Fuel, label: "Объем", value: `${selectedCar.engineVolume} л` },
                                    { icon: Settings2, label: "КПП", value: selectedCar.transmission }
                                  ].map((spec, i) => (
                                    <div key={i} className="bg-[#121212] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                        <spec.icon className="h-4 w-4 text-orange-500" />
                                        <div>
                                            <div className="text-[10px] text-[#555] uppercase font-bold tracking-widest">{spec.label}</div>
                                            <div className="text-xs font-bold truncate">{spec.value}</div>
                                        </div>
                                    </div>
                                  ))}
                              </div>

                              <div className="p-5 bg-orange-600/10 border border-orange-600/20 rounded-2xl">
                                  <div className="text-[10px] text-orange-500 font-bold uppercase mb-2 tracking-widest">
                                      {isLeasing ? 'Лизинг' : 'Платёж в месяц'}
                                  </div>
                                  <div className="text-xl md:text-2xl font-bold text-white">
                                      {isLeasing ? (
                                          <span className="text-sm">Расчет можно получить у менеджера</span>
                                      ) : (
                                          <>{getMonthlyPayment(selectedCar).toLocaleString()} BYN</>
                                      )}
                                  </div>
                              </div>

                              <div className="flex gap-3">
                                  <button
                                      onClick={() => setShowDetails(false)}
                                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl h-12 font-bold transition-all text-xs"
                                  >
                                      Назад
                                  </button>
                                  <Button
                                      onClick={handleSubmit}
                                      disabled={isSubmitting}
                                      className="flex-[2] bg-white text-black hover:bg-zinc-200 h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                                  >
                                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "ПОДАТЬ ЗАЯВКУ"}
                                  </Button>
                              </div>
                          </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Footer */}
            <div className="mt-auto pt-20 text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-[#444] font-medium">
                <Link href="/" onClick={closeModal} className="hover:text-white">Главная</Link>
                <Link href="/catalog" onClick={closeModal} className="hover:text-white">Каталог</Link>
                <Link href="/about" onClick={closeModal} className="hover:text-white">О нас</Link>
                <Link href="/contacts" onClick={closeModal} className="hover:text-white">Контакты</Link>
                <Link href="/privacy" onClick={closeModal} className="hover:text-white">Конфиденциальность</Link>
              </div>
              <p className="text-[10px] text-[#333] tracking-[0.3em] font-bold">© 2026 BELAUTOCENTER</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
