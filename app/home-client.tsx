"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusButton } from "@/components/ui/status-button"
import Stories from "@/components/stories"
import CarCard from "@/components/car-card"
import CarCardSkeleton from "@/components/car-card-skeleton"
import DealOfTheDay from "@/components/deal-of-the-day"
import DealOfTheDaySkeleton from "@/components/deal-of-the-day-skeleton"
import DynamicSelection from "@/components/dynamic-selection"
import DynamicSelectionSkeleton from "@/components/dynamic-selection-skeleton"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { useSubmission } from "@/components/providers/submission-provider"
import { SellCarSheet } from "@/components/sell-car-sheet"
import { CheckCircle, Check } from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"
import { formatPhoneNumber, isPhoneValid } from "@/lib/validation"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PremiumLoader } from "@/components/ui/premium-loader"

interface HomepageSettings {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
}

interface HomeClientProps {
  initialSettings: HomepageSettings | null
  featuredCars: any[]
  allCars: any[]
}

export default function HomeClient({ initialSettings, featuredCars, allCars }: HomeClientProps) {
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
  const { submitForm } = useSubmission()
  const [isSellSheetOpen, setIsSellSheetOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showPremiumLoader, setShowPremiumLoader] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Handle /sale route and initial loading
  useEffect(() => {
    if (isInitialMount) {
      if (pathname === '/sale') {
        setShowPremiumLoader(true)
        // Delay opening the sheet slightly to allow the home page to "load" behind the loader
        const timer = setTimeout(() => {
          setIsSellSheetOpen(true)
          setShowPremiumLoader(false)
        }, 1500)
        return () => clearTimeout(timer)
      }
      setIsInitialMount(false)
    }
  }, [pathname, isInitialMount])

  // Sync URL with drawer state
  const handleOpenSellSheetChange = (open: boolean) => {
    setIsSellSheetOpen(open)
    if (open) {
      window.history.pushState(null, '', '/sale')
    } else {
      window.history.pushState(null, '', '/')
    }
  }

  const animatedTexts = [
    "Поможем с приобретением и продажей автомобиля",
    "Все автомобили доступны в кредит до 10 лет",
    "Быстрое оформление документов за 1 час",
    "Подберем автомобиль под ваш бюджет и запрос",
    "Гарантия юридической чистоты каждой сделки",
  ]
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [textAnimationClass, setTextAnimationClass] = useState("blur-in")

  useEffect(() => {
    const interval = setInterval(() => {
      setTextAnimationClass("blur-out") // Start fade out animation

      setTimeout(() => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % animatedTexts.length)
        setTextAnimationClass("blur-in") // Start fade in animation
      }, 1000) // Duration of the fade-out animation
    }, 4000) // 3 seconds for text visibility + 1 second for transition

    return () => clearInterval(interval)
  }, [animatedTexts.length])

  // Состояния для видео
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videosLoaded, setVideosLoaded] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const video1MobileRef = useRef<HTMLVideoElement>(null)
  const video2MobileRef = useRef<HTMLVideoElement>(null)

  const settings = initialSettings || {
    heroTitle: "Найди свой автомобиль надежным способом",
    heroSubtitle: "",
    heroButtonText: "Посмотреть каталог",
    ctaTitle: "Не нашли подходящий автомобиль?",
    ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
  }

  // Управление видео
  useEffect(() => {
    const videos = [
      { ref: video1Ref, src: '/jettavid2.mp4' },
      { ref: video2Ref, src: '/mazda6vid.mp4' },
      { ref: video1MobileRef, src: '/jettavid2.mp4' },
      { ref: video2MobileRef, src: '/mazda6vid.mp4' }
    ]

    let loadedCount = 0

    const handleVideoLoaded = () => {
      loadedCount++
      if (loadedCount === videos.length) {
        setVideosLoaded(true)
        setTimeout(() => {
          setShowVideo(true)
          if (video1Ref.current) {
            video1Ref.current.play().catch(() => {})
          }
          if (video1MobileRef.current) {
            video1MobileRef.current.play().catch(() => {})
          }
        }, 2000)
      }
    }

    videos.forEach(({ ref }) => {
      if (ref.current) {
        ref.current.addEventListener('loadeddata', handleVideoLoaded)
      }
    })

    return () => {
      videos.forEach(({ ref }) => {
        if (ref.current) {
          ref.current.removeEventListener('loadeddata', handleVideoLoaded)
        }
      })
    }
  }, [])

  // Переключение видео каждые 5 секунд
  useEffect(() => {
    if (!showVideo) return

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => {
        const next = prev === 0 ? 1 : 0

        // Плавное переключение для desktop и mobile
        if (next === 0) {
          if (video1Ref.current) {
            video1Ref.current.currentTime = 0
            video1Ref.current.play().catch(() => {})
          }
          if (video1MobileRef.current) {
            video1MobileRef.current.currentTime = 0
            video1MobileRef.current.play().catch(() => {})
          }
        } else {
          if (video2Ref.current) {
            video2Ref.current.currentTime = 0
            video2Ref.current.play().catch(() => {})
          }
          if (video2MobileRef.current) {
            video2MobileRef.current.currentTime = 0
            video2MobileRef.current.play().catch(() => {})
          }
        }

        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [showVideo])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPhoneValid(contactForm.phone)) {
      return
    }

    await submitForm(async () => {
      try {
        const now = Date.now();
        await firestoreApi.addDocument("leads", {
          name: contactForm.name || "Без имени",
          phone: contactForm.phone || "",
          car: "Подбор авто",
          source: "site",
          status: "new",
          notes: "",
          createdAt: now,
          updatedAt: now,
          history: [{
            status: "new",
            changedAt: now,
            changedBy: "system",
            comment: "Заявка с сайта (Подбор авто)"
          }],
          payload: {
            ...contactForm,
            type: "car_selection"
          }
        })
      } catch (error) {
      }

      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...contactForm,
          type: "car_selection",
        }),
      })
      if (!response.ok) throw new Error("Telegram failed");

      setContactForm({ name: "", phone: "+375" })
      showSuccess("Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.")
    }) // Здесь нет закрывающегося окна, поэтому onCloseCurrentModal не передаем
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black homepage -mt-14">
      <PremiumLoader isVisible={showPremiumLoader} text="Подготовка страницы..." />
      {/* Главный баннер */}
      <section className="relative min-h-[85vh] sm:min-h-[80vh] md:min-h-[75vh] lg:min-h-[80vh] xl:min-h-[85vh] flex items-center justify-center pt-14 bg-black dark:bg-black">

        {/* Фоновое изображение (показывается пока видео не загружено) */}
        <div
          className={`absolute hero-bg-desktop hidden md:block transition-opacity duration-1000 z-10 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '150px',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 70%',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div
          className={`absolute hero-bg-mobile block md:hidden transition-opacity duration-1000 z-10 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: '120px',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Видео фон - Desktop */}
        <div className="absolute hidden md:block z-5" style={{ top: 0, left: 0, right: 0, bottom: '150px', overflow: 'hidden' }}>
          <video
            ref={video1Ref}
            src="/jettavid2.mp4"
            muted
            playsInline
            loop
            preload="auto"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              showVideo && currentVideoIndex === 0 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectPosition: 'center 70%', filter: 'brightness(0.6)' }}
          />
          <video
            ref={video2Ref}
            src="/mazda6vid.mp4"
            muted
            playsInline
            loop
            preload="auto"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              showVideo && currentVideoIndex === 1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectPosition: 'center 70%', filter: 'brightness(0.6)' }}
          />
        </div>

        {/* Видео фон - Mobile */}
        <div className="absolute block md:hidden z-5" style={{ top: 0, left: 0, right: 0, bottom: '120px', overflow: 'hidden' }}>
          <video
            ref={video1MobileRef}
            src="/jettavid2.mp4"
            muted
            playsInline
            loop
            preload="auto"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              showVideo && currentVideoIndex === 0 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectPosition: 'center 30%', filter: 'brightness(0.6)' }}
          />
          <video
            ref={video2MobileRef}
            src="/mazda6vid.mp4"
            muted
            playsInline
            loop
            preload="auto"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              showVideo && currentVideoIndex === 1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectPosition: 'center 30%', filter: 'brightness(0.6)' }}
          />
        </div>

        <div className="relative z-30 text-center text-white max-w-4xl mx-auto px-4 pb-20 sm:pb-20 md:pb-20 lg:pb-20 xl:pb-20 hero-content">
          <h1 className={`text-hero text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight ${textAnimationClass}`}>
            {animatedTexts[currentTextIndex]}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-16 lg:mb-20 xl:mb-24 text-gray-100 font-medium leading-relaxed px-2">
            {settings.heroSubtitle}
          </p>

          <div className="relative z-50 flex flex-col gap-3 sm:gap-4 items-center w-full max-w-sm mx-auto sm:max-w-none">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm xs:text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link href="/catalog" prefetch={false}>{settings.heroButtonText}</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 text-sm xs:text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleOpenSellSheetChange(true)}
            >
              Продать автомобиль
            </Button>
          </div>
        </div>

        {/* Закругленный переход с Stories */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black rounded-t-[30px] z-20">
          {/* Блок "Свежие поступления и новости" интегрированный в закругление */}
          <div className="pt-3 pb-10 bg-gradient-to-b from-white to-gray-200 dark:from-gray-900 dark:to-black relative rounded-t-[30px]">
            <Stories />
          </div>
        </div>
      </section>

      {/* Блок Stories больше не нужен отдельно */}

      {/* Блок "Специальное предложение" */}
      <section className="pt-8 pb-20 bg-white dark:bg-black relative rounded-t-[30px] -mt-6">
        <div className="container px-4">

          {/* Featured Cars Grid */}
          {featuredCars && featuredCars.length > 0 ? (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white dark:bg-gray-900/50 dark:border dark:border-gray-800 rounded-3xl p-12 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-6">🚗</div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Скоро здесь появятся автомобили
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Мы работаем над наполнением каталога лучшими предложениями
                </p>
              </div>
            </div>
          )}

          {/* Блок Динамическая подборка */}
          {allCars.length > 0 ? (
             <DynamicSelection cars={allCars} />
          ) : null}

          {/* Блок Авто дня */}
          {allCars.length > 0 ? (
            <DealOfTheDay cars={allCars} />
          ) : null}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 dark:border-gray-700 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link href="/catalog" prefetch={false}>Посмотреть весь каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Блок призыва к действию */}
      <section className="relative pt-12 sm:pt-16 pb-32 sm:pb-40 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-t-[30px] sm:rounded-t-[50px] -mb-20 overflow-hidden">
        {/* Фоновое изображение автомобиля */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10 bg-no-repeat bg-center mix-blend-overlay bg-[length:90%] md:bg-[length:60%]"
          style={{
            backgroundImage: `url('/car.png')`,
            backgroundPosition: 'center 70%',
            filter: 'brightness(0) invert(1)'
          }}
        />

        <div className="container px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{settings.ctaTitle}</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 dark:text-gray-300">{settings.ctaSubtitle}</p>

            {/* Оптимизированная форма для мобильных */}
            <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center max-w-lg mx-auto">
              <div className="flex-1 sm:flex-none sm:w-32">
                <Input
                  placeholder="Имя"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/40 dark:border-gray-600 text-white placeholder:text-white/60 dark:placeholder:text-gray-400 focus:border-white/80 dark:focus:border-gray-500 focus:bg-white/20 dark:focus:bg-gray-700/50 h-10 sm:h-9 text-sm w-full"
                />
              </div>
              <div className="flex-1 sm:flex-none sm:w-40 relative">
                <Input
                  placeholder="+375XXXXXXXXX"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })}
                  required
                  className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border-white/40 dark:border-gray-600 text-white placeholder:text-white/60 dark:placeholder:text-gray-400 focus:border-white/80 dark:focus:border-gray-500 focus:bg-white/20 dark:focus:bg-gray-700/50 h-10 sm:h-9 text-sm w-full pr-8"
                />
                {isPhoneValid(contactForm.phone) && (
                  <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                className="bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 dark:hover:bg-gray-600/60 text-white border border-white/40 dark:border-gray-600 backdrop-blur-sm px-4 h-10 sm:h-9 text-sm whitespace-nowrap"
                disabled={!isPhoneValid(contactForm.phone) || !contactForm.name}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Отправить
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Sell car sheet */}

      <SellCarSheet
        open={isSellSheetOpen}
        onOpenChange={handleOpenSellSheetChange}
      />

    </div>
  )
}
