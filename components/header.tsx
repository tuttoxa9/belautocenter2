"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurImage } from "@/components/ui/blur-image"
import { Menu, Phone, Loader2, Check, ArrowRight, MapPin, Clock, Moon, Sun, Snowflake } from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"
import { useNotification } from "@/components/providers/notification-provider"
import { useSnow } from "@/components/providers/snow-provider"

const navigation = [
  { name: "Главная", href: "/" },
  { name: "Каталог", href: "/catalog" },
  { name: "Выкуп", href: "https://vikup.belautocenter.by" },
  { name: "Кредит", href: "/credit" },
  { name: "Лизинг", href: "/leasing" },
  { name: "Гарантия", href: "/warranty" },
  { name: "О нас", href: "/about" },
  { name: "Контакты", href: "/contacts" },
  { name: "Отзывы", href: "/reviews" },
]

interface Settings {
  companyName: string
  phone: string
  phone2?: string
  workingHours: string
  address?: string
}

export default function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { isSnowing, toggleSnow } = useSnow()
  const [isSnowButtonPulsating, setIsSnowButtonPulsating] = useState(false)
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "+375" })
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showSuccess } = useNotification()

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (isSnowing) {
      setIsSnowButtonPulsating(true)
      const timer = setTimeout(() => {
        setIsSnowButtonPulsating(false)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [isSnowing])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await firestoreApi.getDocument("settings", "main")
      if (data) {
        setSettings(data as Settings)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Сохраняем в Firebase через API
      await firestoreApi.addDocument("leads", {
        ...formData,
        type: "callback",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "callback",
        }),
      })

      setIsCallbackOpen(false)
      setFormData({ name: "", phone: "+375" })
      showSuccess(
        "Заявка на обратный звонок отправлена! Мы свяжемся с вами в ближайшее время."
      )
    } catch (error) {
      showSuccess("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setIsSubmitting(false)
    }
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
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-950">
      <div className="container flex h-14 items-center justify-between px-2 md:px-4">
        {/* Логотип слева на всех устройствах */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0" prefetch={true}>
          <Image
            src="/logo4.png"
            alt="Белавто Центр"
            width={120}
            height={40}
            className="h-8 w-auto sm:h-10 block dark:hidden object-contain"
            priority
          />
          <Image
            src="/logo_black.png"
            alt="Белавто Центр"
            width={120}
            height={40}
            className="h-8 w-auto sm:h-10 hidden dark:block object-contain"
            priority
          />
          <span className="font-display font-bold text-sm sm:text-lg text-gray-900 dark:text-white tracking-tight">Белавто Центр</span>
        </Link>

        {/* Мобильное меню (справа) */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSnow}
            className={`mr-1 ${isSnowButtonPulsating ? 'pulse-glow-animation rounded-full' : ''}`}
            aria-label="Переключить снег"
          >
            <Snowflake className={`h-5 w-5 transition-colors ${isSnowing ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <UniversalDrawer
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
          title="Меню"
          position="bottom"
          noPadding={true}
        >
          {/* Простой заголовок */}
          <div className="flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-800">
            {loading ? (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="font-medium">Загрузка...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Image
                  src="/logo4.png"
                  alt="Белавто Центр"
                  width={120}
                  height={40}
                  className="h-10 w-auto mb-2 block dark:hidden object-contain"
                  priority
                />
                <Image
                  src="/logo_black.png"
                  alt="Белавто Центр"
                  width={120}
                  height={40}
                  className="h-10 w-auto mb-2 hidden dark:block object-contain"
                  priority
                />
                <div className="w-12 h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>
            )}
          </div>

          {/* Компактное навигационное меню */}
          <div className="py-4">
            {navigation
              .filter((item) => !["/", "/catalog", "/credit", "/contacts"].includes(item.href))
              .map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 mx-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors ${
                      isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      isActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-700'
                    }`}></div>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
          </div>

          {/* Компактная секция контактов */}
          <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Загрузка контактов...</span>
              </div>
            ) : (
              <a
                href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                className="block text-center text-white font-semibold text-base mb-3 p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors"
              >
                {settings?.phone || "+375 XX XXX-XX-XX"}
              </a>
            )}

            <Button
              className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors mb-3"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setIsCallbackOpen(true)
              }}
            >
              Связаться с нами
            </Button>

            {/* Переключатель темы */}
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium py-2 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Светлая тема</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Тёмная тема</span>
                </>
              )}
            </Button>

            {/* Простая контактная информация */}
            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{settings?.address || "г. Минск, ул. Примерная, 123"}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{settings?.workingHours || "пн-вск: 9:00-21:00"}</span>
              </div>
            </div>
          </div>
        </UniversalDrawer>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6 flex-1 justify-start ml-2 lg:ml-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`text-sm font-bold tracking-wide transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? "bg-blue-600 text-white px-3 py-2 rounded-md"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Контакты и кнопка звонка для десктопа */}
        <div className="hidden md:flex items-center space-x-4 lg:-mr-4 xl:-mr-8">
          <div className="hidden lg:flex items-center text-right mr-2">
            {loading ? (
              <div className="flex flex-col items-end">
                <Skeleton className="h-5 w-[130px] bg-gray-200/60" />
                <Skeleton className="h-3 w-[100px] bg-gray-200/60 mt-1" />
              </div>
            ) : (
              <div>
                <a href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`} className="text-sm font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                  {settings?.phone || "+375 XX XXX-XX-XX"}
                </a>
                <div className="text-xs text-gray-900 dark:text-gray-300 font-semibold whitespace-nowrap">
                  {settings?.workingHours || "пн-вск: 9:00-21:00"}
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg text-sm px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-xl whitespace-nowrap"
            onClick={() => setIsCallbackOpen(true)}
          >
            <Phone className="h-4 w-4 mr-2" />
            <span>Заказать звонок</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className={`rounded-full p-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${isSnowButtonPulsating ? 'pulse-glow-animation' : ''}`}
            onClick={toggleSnow}
            aria-label="Переключить снег"
          >
            <Snowflake className={`h-4 w-4 transition-colors ${isSnowing ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full p-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-gray-900 dark:text-white" />
            ) : (
              <Moon className="h-4 w-4 text-gray-900 dark:text-white" />
            )}
          </Button>

          <UniversalDrawer
            open={isCallbackOpen}
            onOpenChange={setIsCallbackOpen}
            title="Заказать обратный звонок"
            footer={
              <Button type="submit" form="header-callback-form" className="w-full" loading={isSubmitting}>
                Жду звонка
              </Button>
            }
          >
            <form id="header-callback-form" onSubmit={handleCallbackSubmit} className="space-y-4">
              <div>
                <Label htmlFor="header-callback-name">Ваше имя</Label>
                <Input
                  id="header-callback-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
              <div>
                <Label htmlFor="header-callback-phone">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="header-callback-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="+375XXXXXXXXX"
                    required
                    className="pr-10"
                  />
                  {isPhoneValid(formData.phone) && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </form>
          </UniversalDrawer>
        </div>
      </div>
    </header>
  )
}
