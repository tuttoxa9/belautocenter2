"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu, Phone, Loader2, Check, ArrowRight, MapPin, Clock } from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"
import { useNotification } from "@/components/providers/notification-provider"
import { ThemeSwitcher } from "./theme-switcher"

const navigation = [
  { name: "Главная", href: "/" },
  { name: "Каталог", href: "/catalog" },
  { name: "Кредит", href: "/credit" },
  { name: "Лизинг", href: "/leasing" },
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
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "+375" })
  const [settings, setSettings] = useState<Settings | null>(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showSuccess } = useNotification()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await firestoreApi.getDocument("settings", "main")
      if (data) {
        setSettings(data as Settings)
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Сохраняем в Firebase через API
    try {
      await firestoreApi.addDocument("leads", {
        ...formData,
        type: "callback",
        status: "new",
        createdAt: new Date(),
      })
    } catch (error) {
      console.warn("API save failed:", error)
    }

    // Отправляем уведомление в Telegram (всегда выполняется)
    try {
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
      console.error("Ошибка отправки заявки:", error)
      showSuccess("Произошла ошибка. Попробуйте еще раз.")
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
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-md">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Логотип слева на всех устройствах */}
        <Link href="/" className="flex flex-shrink-0 items-center space-x-2" prefetch={true}>
          <Image
            src="/logo4.png"
            alt="Белавто Центр"
            width={120}
            height={40}
            className="h-8 w-auto sm:h-10"
            priority
          />
          <span className="font-display text-sm font-bold tracking-tight sm:text-lg">Белавто Центр</span>
        </Link>

        {/* Мобильное меню (справа) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-r bg-background">
            {/* Простой заголовок */}
            <div className="flex items-center justify-center border-b p-4">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="font-medium">Загрузка...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image
                    src="/logo4.png"
                    alt="Белавто Центр"
                    width={120}
                    height={40}
                    className="mb-2 h-10 w-auto"
                    priority
                  />
                  <div className="h-px w-12 bg-border"></div>
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
                      className={`mx-2 flex items-center rounded-lg px-4 py-3 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground ${
                        isActive ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <div className={`mr-3 h-2 w-2 rounded-full ${
                        isActive ? 'bg-primary-foreground' : 'bg-border'
                      }`}></div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Компактная секция контактов */}
            <div className="mx-4 mt-4 rounded-lg border bg-muted/50 p-4">
              {loading ? (
                <div className="mb-3 flex items-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Загрузка контактов...</span>
                </div>
              ) : (
                <a
                  href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                  className="mb-3 block rounded-lg bg-primary p-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {settings?.phone || "+375 XX XXX-XX-XX"}
                </a>
              )}

              <Button
                className="mb-4 w-full rounded-lg bg-secondary-foreground py-2 font-medium text-secondary transition-colors hover:bg-secondary-foreground/90"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsCallbackOpen(true)
                }}
              >
                Связаться с нами
              </Button>

              {/* Простая контактная информация */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{settings?.address || "г. Минск, ул. Примерная, 123"}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{settings?.workingHours || "пн-вск: 9:00-21:00"}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Десктопное меню */}
        <nav className="hidden flex-1 items-center justify-start space-x-6 md:flex ml-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`text-sm font-bold tracking-wide transition-colors hover:text-primary ${
                pathname === item.href
                  ? "rounded-md bg-primary px-3 py-2 text-primary-foreground"
                  : "text-foreground/80"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Контакты и кнопка звонка для десктопа */}
        <div className="hidden items-center space-x-4 md:flex">
          <div className="mr-2 hidden text-right lg:flex items-center">
            {loading ? (
              <div className="flex flex-col items-end">
                <Skeleton className="h-5 w-[130px] bg-muted" />
                <Skeleton className="mt-1 h-3 w-[100px] bg-muted" />
              </div>
            ) : (
              <div>
                <a href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`} className="whitespace-nowrap text-sm font-bold tracking-tight">
                  {settings?.phone || "+375 XX XXX-XX-XX"}
                </a>
                <div className="whitespace-nowrap text-xs font-semibold">
                  {settings?.workingHours || "пн-вск: 9:00-21:00"}
                </div>
              </div>
            )}
          </div>
          <ThemeSwitcher />
          <Dialog open={isCallbackOpen} onOpenChange={(open) => { setIsCallbackOpen(open); if (!open) setPhoneLoading(false); }}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                onClick={() => setPhoneLoading(true)}
              >
                {phoneLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                <span>Заказать звонок</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Заказать обратный звонок</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCallbackSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Ваше имя</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Номер телефона</Label>
                  <div className="relative">
                    <Input
                      id="phone"
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
                <Button type="submit" className="w-full">
                  Заказать звонок
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
