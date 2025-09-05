"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusButton } from "@/components/ui/status-button"
import Stories from "@/components/stories"
import CarCard from "@/components/car-card"
import CarCardSkeleton from "@/components/car-card-skeleton"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import SaleModal from "@/app/sale/sale-modal"

import { CheckCircle, Check } from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"

interface HomepageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
}

export default function HomePage() {
  const [searchForm, setSearchForm] = useState({
    make: "",
    model: "",
    priceFrom: "",
    priceTo: "",
  })

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "+375",
  })

  const contactButtonState = useButtonState()
  const { showSuccess } = useNotification()
  const [isMounted, setIsMounted] = useState(true)
  const [showSaleModal, setShowSaleModal] = useState(false)

  const [cars, setCars] = useState<Array<any>>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [settings, setSettings] = useState<HomepageSettings>({
    heroTitle: "Найди свой автомобиль надежным способом",
    heroSubtitle: "",
    heroButtonText: "Посмотреть каталог",
    ctaTitle: "Не нашли подходящий автомобиль?",
    ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
  })

  const loadHomepageSettings = useCallback(async () => {
    try {
      const settingsDoc = await firestoreApi.getDocument("pages", "main")
      if (settingsDoc && isMounted) {
        const data = settingsDoc as Partial<HomepageSettings>
        setSettings((prev) => ({
          ...prev,
          ...data,
        }))
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек главной страницы:", error)
    }
  }, [isMounted])

  const loadFeaturedCars = useCallback(async () => {
    try {
      if (isMounted) {
        setLoadingCars(true)
      }

      console.log("Loading cars from API...")
      const allCars = await firestoreApi.getCollection("cars")
      console.log("Total cars loaded:", allCars.length)

      // Сортируем по дате создания (если она есть) и берем последние 4
      const featuredCars = allCars
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 4)

      console.log("Featured cars:", featuredCars)

      if (isMounted) {
        setCars(featuredCars)
        setLoadingCars(false)
      }
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error)
      if (isMounted) {
        setLoadingCars(false)
      }
    }
  }, [isMounted])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadHomepageSettings(), loadFeaturedCars()])
    }
    loadData()

    return () => {
      setIsMounted(false)
    }
  }, [loadHomepageSettings, loadFeaturedCars])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.make) params.set("make", searchForm.make)
    if (searchForm.model) params.set("model", searchForm.model)
    if (searchForm.priceFrom) params.set("priceFrom", searchForm.priceFrom)
    if (searchForm.priceTo) params.set("priceTo", searchForm.priceTo)

    window.location.href = `/catalog?${params.toString()}`
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await contactButtonState.execute(async () => {
      // Сохраняем в Firebase через API
      try {
        await firestoreApi.addDocument("leads", {
          ...contactForm,
          type: "car_selection",
          status: "new",
          createdAt: new Date(),
        })
      } catch (error) {
        console.warn("API save failed:", error)
      }

      // Отправляем уведомление в Telegram (всегда выполняется)
      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...contactForm,
          type: "car_selection",
        }),
      })

      setContactForm({ name: "", phone: "+375" })
      showSuccess(
        "Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время."
      )
    })
  }

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы кроме +
    let numbers = value.replace(/[^\d+]/g, "")

    // Если нет + в начале, добавляем +375
    if (!numbers.startsWith("+375")) {
      numbers = "+375"
    }

    // Берем только +375 и следующие 9 цифр максимум
    const prefix = "+375"
    const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)

    return prefix + afterPrefix
  }

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375")
  }

  return (
    <div className="min-h-screen bg-white homepage -mt-14">
      {/* Главный баннер */}
      <section className="relative min-h-[85vh] sm:min-h-[80vh] md:min-h-[75vh] lg:min-h-[80vh] xl:min-h-[85vh] flex items-center justify-center pt-14">

        {/* Фоновое изображение для ПК */}
        <div
          className="absolute hero-bg-desktop hidden md:block"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '150px', // Заканчиваем фон ДО блока историй
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/mercedes-new-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 90%',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Фоновое изображение для мобильных */}
        <div
          className="absolute hero-bg-mobile block md:hidden"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '120px', // Увеличиваем отступ снизу для лучшего перехода
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/mercedes-new-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top', // Изменяем позицию на center top
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-30 text-center text-white max-w-4xl mx-auto px-4 pb-40 sm:pb-32 md:pb-24 lg:pb-32 xl:pb-20 hero-content">
          <h1 className="text-hero text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight">
            Поможем с приобретением и продажей автомобиля
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-16 lg:mb-20 xl:mb-24 text-gray-100 font-medium leading-relaxed">
            {settings.heroSubtitle}
          </p>

          <div className="relative z-50 flex flex-col gap-4 items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link href="/catalog" prefetch={true}>{settings.heroButtonText}</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowSaleModal(true)}
            >
              Продать автомобиль
            </Button>
          </div>
        </div>

        {/* Закругленный переход с Stories */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[30px] z-20">
          {/* Блок "Свежие поступления и новости" интегрированный в закругление */}
          <div className="pt-3 pb-10 bg-gradient-to-b from-white to-gray-200 relative rounded-t-[30px]">
            <Stories />
          </div>
        </div>
      </section>

      {/* Блок Stories больше не нужен отдельно */}

      {/* Блок "Специальное предложение" */}
      <section className="pt-8 pb-20 bg-white relative rounded-t-[30px] -mt-6">
        <div className="container px-4">

          {loadingCars ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <CarCardSkeleton key={index} />
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-6">🚗</div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">
                  Скоро здесь появятся автомобили
                </h3>
                <p className="text-gray-600 mb-6">
                  Мы работаем над наполнением каталога лучшими предложениями
                </p>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link href="/catalog" prefetch={true}>Посмотреть весь каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Блок призыва к действию */}
      <section className="relative pt-12 sm:pt-16 pb-32 sm:pb-40 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-[30px] sm:rounded-t-[50px] -mb-20 overflow-hidden">
        {/* Фоновое изображение автомобиля */}
        <div
          className="absolute inset-0 opacity-20 bg-no-repeat bg-center mix-blend-overlay bg-[length:90%] md:bg-[length:60%]"
          style={{
            backgroundImage: `url('/car.png')`,
            backgroundPosition: 'center 70%',
            filter: 'brightness(0) invert(1)'
          }}
        />

        <div className="container px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{settings.ctaTitle}</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">{settings.ctaSubtitle}</p>

            {/* Оптимизированная форма для мобильных */}
            <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center max-w-lg mx-auto">
              <div className="flex-1 sm:flex-none sm:w-32">
                <Input
                  placeholder="Имя"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="bg-white/10 backdrop-blur-md border-white/40 text-white placeholder:text-white/60 focus:border-white/80 focus:bg-white/20 h-10 sm:h-9 text-sm w-full"
                />
              </div>
              <div className="flex-1 sm:flex-none sm:w-40 relative">
                <Input
                  placeholder="+375XXXXXXXXX"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                  required
                  className="bg-white/10 backdrop-blur-md border-white/40 text-white placeholder:text-white/60 focus:border-white/80 focus:bg-white/20 h-10 sm:h-9 text-sm w-full pr-8"
                />
                {isPhoneValid(contactForm.phone) && (
                  <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                )}
              </div>
              <StatusButton
                type="submit"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm px-4 h-10 sm:h-9 text-sm whitespace-nowrap"
                state={contactButtonState.state}
                loadingText="Отправляем..."
                successText="Отправлено!"
                errorText="Ошибка"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Отправить
              </StatusButton>
            </form>
          </div>
        </div>
      </section>

      {/* Модальное окно продажи автомобиля */}
      <SaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
      />

    </div>
  )
}
