"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, Search, CheckCircle, Loader2, Gauge, Fuel, Settings2, Calendar, DollarSign, ArrowRight } from "lucide-react"
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

      showSuccess(`Заявка на ${isLeasing ? 'лизинг' : 'кредит'} успешно отправлена! Мы свяжемся с вами.`)
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden"
        >
          {/* Enhanced Halo Background Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[900px] bg-[radial-gradient(circle,rgba(249,115,22,0.25)_0%,transparent_70%)] blur-[80px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,transparent_70%)] blur-[100px]" />
          </div>

          {/* Controls */}
          <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
            <button
                onClick={showDetails ? () => setShowDetails(false) : closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-all pointer-events-auto active:scale-95"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-all pointer-events-auto active:scale-95"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Content Area */}
          <div ref={contentRef} className="relative z-10 flex-1 flex flex-col overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar scroll-smooth">
            <div className={`w-full mx-auto mt-2 md:mt-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSearching || showDetails ? 'max-w-6xl' : 'max-w-md'}`}>

              <AnimatePresence mode="wait" initial={false}>
                {!showDetails ? (
                  <motion.div
                    key="catalog-view"
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center"
                  >
                    {/* Form Section */}
                    <div className={`w-full flex flex-col transition-all duration-500 ${isSearching ? 'lg:w-[400px]' : 'items-center text-center'}`}>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none mb-4 uppercase">
                        {isLeasing ? 'Лизинг' : 'Кредит'} <span className="text-orange-500">авто</span>
                      </h1>
                      <p className="text-[#a8a8a8] text-sm md:text-base leading-snug mb-8 max-w-[300px]">
                        Нам понадобится ваш номер телефона для связи
                      </p>

                      <div className="w-full space-y-6">
                        <div className="relative group">
                          <Input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            placeholder="Номер телефона"
                            className="bg-[#121212]/80 backdrop-blur-sm border-[#262626] text-white h-14 rounded-2xl focus:ring-2 focus:ring-orange-500/30 placeholder:text-[#555] text-lg transition-all"
                          />
                          {isPhoneFieldValid && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </motion.div>
                          )}
                        </div>

                        <AnimatePresence mode="wait">
                          {isPhoneFieldValid && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-8"
                            >
                              <div className="relative group">
                                {!selectedCar && !isSearching ? (
                                  <button
                                    onClick={() => {
                                      setIsSearching(true)
                                      setTimeout(() => searchInputRef.current?.focus(), 100)
                                    }}
                                    className="w-full bg-[#121212]/80 backdrop-blur-sm border border-[#262626] text-[#8e8e8e] h-14 px-5 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] transition-all group"
                                  >
                                    <span className="group-hover:text-white transition-colors">Выберите автомобиль</span>
                                    <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                  </button>
                                ) : selectedCar && !isSearching ? (
                                  <button
                                    onClick={() => {
                                      setIsSearching(true)
                                      setTimeout(() => searchInputRef.current?.focus(), 100)
                                    }}
                                    className="w-full bg-orange-500/10 border border-orange-500/30 text-white h-14 px-5 rounded-2xl flex items-center justify-between hover:bg-orange-500/20 transition-all"
                                  >
                                    <span className="font-bold truncate mr-2">{selectedCar.make} {selectedCar.model}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-orange-500 font-bold">${selectedCar.price.toLocaleString()}</span>
                                        <X className="h-5 w-5 text-orange-500 hover:scale-125 transition-transform" onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedCar(null)
                                        }} />
                                    </div>
                                  </button>
                                ) : (
                                  <div className="relative w-full">
                                    <Input
                                      ref={searchInputRef}
                                      type="text"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      placeholder="Поиск по каталогу..."
                                      className="bg-[#121212]/80 backdrop-blur-sm border-[#262626] text-white h-14 rounded-2xl focus:ring-2 focus:ring-orange-500/30 pl-12 text-lg transition-all"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#444]" />
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white h-14 rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] active:scale-[0.98] flex items-center justify-center gap-3"
                              >
                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "ОТПРАВИТЬ ЗАЯВКУ"}
                              </Button>

                              {isSearching && (
                                <button
                                  onClick={() => setIsSearching(false)}
                                  className="w-full text-[#555] text-xs font-bold uppercase tracking-widest hover:text-[#888] transition-colors lg:hidden"
                                >
                                  Скрыть список
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Partners Section */}
                        {partners.length > 0 && (
                          <div className="pt-16 pb-4">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px flex-1 bg-white/5" />
                                <h3 className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Партнеры</h3>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
                              {partners.slice(0, 6).map((partner, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    className="w-16 h-10 relative opacity-30 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0"
                                >
                                  <img
                                    src={getCachedImageUrl(partner.logoUrl)}
                                    alt={partner.name}
                                    className="w-full h-full object-contain"
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini Catalog Section */}
                    {isSearching && isPhoneFieldValid && (
                      <div className="flex-1 w-full lg:max-h-[75vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6 px-1">
                          <h3 className="text-xl font-bold tracking-tight text-white/90">Выберите <span className="text-orange-500">модель</span></h3>
                          <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-full text-[#666]">{filteredCars.length} АВТО</span>
                        </div>

                        {/* Mobile Catalog */}
                        <div className="flex lg:hidden overflow-x-auto pb-6 gap-4 no-scrollbar -mx-4 px-4">
                          <div
                              className={`flex-shrink-0 w-36 h-48 p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-center items-center gap-3 active:scale-95 ${!selectedCar ? 'bg-orange-600/20 border-orange-500/50 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]' : 'bg-[#0a0a0a] border-white/5 shadow-xl'}`}
                              onClick={() => {
                                  setSelectedCar(null)
                                  setIsSearching(false)
                                  setSearchQuery("")
                              }}
                          >
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <DollarSign className={`h-6 w-6 ${!selectedCar ? 'text-orange-500' : 'text-white/20'}`} />
                              </div>
                              <div className={`font-black text-center leading-tight text-xs uppercase tracking-tight ${!selectedCar ? 'text-orange-500' : 'text-white/40'}`}>Своя<br/>сумма</div>
                          </div>
                          {filteredCars.map(car => (
                              <div
                                  key={car.id}
                                  className={`flex-shrink-0 w-44 p-3 rounded-3xl border transition-all cursor-pointer active:scale-95 flex flex-col gap-2 ${selectedCar?.id === car.id ? 'bg-orange-600/20 border-orange-500/50' : 'bg-[#0a0a0a] border-white/5'}`}
                                  onClick={() => {
                                      setSelectedCar(car)
                                      setShowDetails(true)
                                  }}
                              >
                                  <div className="w-full h-28 relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                                      {car.imageUrls && car.imageUrls[0] ? (
                                          <Image
                                          src={getCachedImageUrl(car.imageUrls[0])}
                                          alt={`${car.make} ${car.model}`}
                                          fill
                                          quality={40}
                                          sizes="180px"
                                          className="object-cover"
                                          />
                                      ) : null}
                                  </div>
                                  <div className="px-1">
                                    <div className="font-black text-[11px] truncate uppercase leading-none mb-1">{car.make} {car.model}</div>
                                    <div className="text-orange-500 font-black text-sm tracking-tighter">${car.price.toLocaleString()}</div>
                                  </div>
                              </div>
                          ))}
                        </div>

                        {/* Desktop Catalog */}
                        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-4 custom-scrollbar">
                          <div
                            className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col justify-center items-center gap-3 h-48 group hover:scale-[1.02] ${!selectedCar ? 'bg-orange-600/10 border-orange-500/40' : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'}`}
                            onClick={() => {
                                setSelectedCar(null)
                                setIsSearching(false)
                                setSearchQuery("")
                            }}
                          >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${!selectedCar ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                                <DollarSign className="h-7 w-7" />
                            </div>
                            <div className="text-center">
                                <div className={`font-black uppercase tracking-tight ${!selectedCar ? 'text-white' : 'text-white/40'}`}>Своя сумма</div>
                                <div className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">Любая цифра</div>
                            </div>
                          </div>

                          {filteredCars.map(car => (
                          <div
                              key={car.id}
                              className={`p-4 rounded-[2.5rem] border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group flex flex-col gap-3 ${selectedCar?.id === car.id ? 'bg-orange-600/10 border-orange-500/40' : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'}`}
                              onClick={() => {
                                  setSelectedCar(car)
                                  setShowDetails(true)
                              }}
                          >
                                <div className="w-full h-32 relative bg-zinc-900 rounded-[1.8rem] overflow-hidden shadow-2xl">
                                    {car.imageUrls && car.imageUrls[0] ? (
                                        <Image
                                        src={getCachedImageUrl(car.imageUrls[0])}
                                        alt={`${car.make} ${car.model}`}
                                        fill
                                        quality={60}
                                        sizes="300px"
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Search className="h-6 w-6 text-zinc-800" />
                                        </div>
                                    )}
                                </div>
                                <div className="px-2 pb-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-black text-xs uppercase leading-tight truncate flex-1">{car.make} {car.model}</div>
                                        <div className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full text-[#666]">{car.year}</div>
                                    </div>
                                    <div className="text-orange-500 font-black text-lg tracking-tighter mt-1">
                                        ${car.price.toLocaleString()}
                                    </div>
                                </div>
                          </div>
                          ))}

                          {filteredCars.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                <Search className="h-10 w-10 text-[#333]" />
                                <div className="text-[#666] text-sm font-black uppercase tracking-widest">Авто не найдено</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="details-view"
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex flex-col items-center"
                  >
                    {selectedCar && (
                      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

                          {/* Left Side: Cinematic Image */}
                          <div className="lg:col-span-3 w-full">
                            <div className="relative aspect-[4/3] md:aspect-video bg-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/5 group">
                                {isImageLoading && (
                                    <div className="absolute inset-0 z-10 bg-zinc-800 animate-pulse" />
                                )}
                                {selectedCar.imageUrls && selectedCar.imageUrls[0] ? (
                                    <Image
                                        src={getCachedImageUrl(selectedCar.imageUrls[0])}
                                        alt={selectedCar.make}
                                        fill
                                        className={`object-cover transition-all duration-1000 group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                        quality={90}
                                        onLoad={() => setIsImageLoading(false)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Search className="h-16 w-16 text-zinc-800" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">В наличии</div>
                                        <div className="text-xs font-black text-white">БЕЛАВТО ЦЕНТР</div>
                                    </div>
                                </div>
                            </div>
                          </div>

                          {/* Right Side: Information Glass Box */}
                          <div className="lg:col-span-2 space-y-8 flex flex-col justify-center">
                              <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium Selection</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.85]">{selectedCar.make}<br/><span className="text-white/40">{selectedCar.model}</span></h2>
                                  <p className="text-orange-500 font-black text-3xl tracking-tighter">${selectedCar.price.toLocaleString()}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { icon: Calendar, label: "Год", value: selectedCar.year },
                                    { icon: Gauge, label: "Пробег", value: `${selectedCar.mileage.toLocaleString()} км` },
                                    { icon: Fuel, label: "Объем", value: `${selectedCar.engineVolume} л` },
                                    { icon: Settings2, label: "КПП", value: selectedCar.transmission }
                                  ].map((spec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.05) }}
                                        className="bg-[#0a0a0a] p-4 rounded-[1.8rem] border border-white/5 flex items-center gap-3 group hover:border-white/10 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-all">
                                            <spec.icon className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">{spec.label}</div>
                                            <div className="text-[13px] font-black uppercase truncate">{spec.value}</div>
                                        </div>
                                    </motion.div>
                                  ))}
                              </div>

                              <div className="relative group">
                                <div className="absolute inset-0 bg-orange-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-[2rem] backdrop-blur-xl">
                                    <div className="text-[10px] text-orange-500 font-black uppercase mb-2 tracking-[0.2em]">
                                        {isLeasing ? 'Информация по лизингу' : 'Ежемесячный взнос'}
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-white leading-none">
                                        {isLeasing ? (
                                            <span className="text-sm md:text-base font-bold uppercase text-white/60">Расчет можно получить<br/>у менеджера</span>
                                        ) : (
                                            <div className="flex items-baseline gap-2">
                                                {getMonthlyPayment(selectedCar).toLocaleString()} <span className="text-lg">BYN</span>
                                                <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">/ месяц</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3">
                                  <button
                                      onClick={() => setShowDetails(false)}
                                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-[1.5rem] h-14 font-black uppercase text-[11px] tracking-widest transition-all active:scale-[0.98]"
                                  >
                                      Назад
                                  </button>
                                  <Button
                                      onClick={handleSubmit}
                                      disabled={isSubmitting}
                                      className="flex-[2] bg-white text-black hover:bg-zinc-200 h-14 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_15px_30px_-10px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
                                  >
                                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Оформить <ArrowRight className="h-4 w-4" /></>}
                                  </Button>
                              </div>
                          </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Compact Immersive Footer */}
            <div className="mt-auto pt-24 pb-8 flex flex-col items-center gap-8">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#333]">
                <Link href="/" onClick={closeModal} className="hover:text-white transition-colors">Главная</Link>
                <Link href="/catalog" onClick={closeModal} className="hover:text-white transition-colors">Каталог</Link>
                <Link href="/about" onClick={closeModal} className="hover:text-white transition-colors">О нас</Link>
                <Link href="/contacts" onClick={closeModal} className="hover:text-white transition-colors">Контакты</Link>
                <Link href="/privacy" onClick={closeModal} className="hover:text-white transition-colors">Privacy</Link>
              </div>

              <div className="text-[10px] text-[#222] tracking-[0.4em] font-black flex items-center gap-4">
                <div className="h-px w-8 bg-white/5" />
                <span>© 2026 BELAUTOCENTER</span>
                <div className="h-px w-8 bg-white/5" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
