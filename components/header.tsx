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
import { Menu, Phone, Loader2, Check, ArrowRight, MapPin, Clock } from "lucide-react"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useNotification } from "@/components/providers/notification-provider"

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
  workingHours: string
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
      const settingsDoc = await getDoc(doc(db, "settings", "main"))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as Settings)
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Сохраняем в Firebase
      await addDoc(collection(db, "leads"), {
        ...formData,
        type: "callback",
        status: "new",
        createdAt: new Date(),
      })

      // Отправляем уведомление в Telegram
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'callback'
        })
      })

      setIsCallbackOpen(false)
      setFormData({ name: "", phone: "+375" })
      showSuccess("Заявка на обратный звонок отправлена! Мы свяжемся с вами в ближайшее время.")
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Логотип слева на всех устройствах */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src="/logo4.png"
            alt="Белавто Центр"
            width={120}
            height={40}
            className="h-8 w-auto sm:h-10"
            priority
          />
          <span className="font-display font-bold text-sm sm:text-lg text-gray-900 tracking-tight">Белавто Центр</span>
        </Link>

        {/* Мобильное меню (справа) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-white border-r border-gray-200">
            {/* Простой заголовок */}
            <div className="flex items-center justify-center p-4 border-b border-gray-100">
              {loading ? (
                <div className="flex items-center text-gray-600">
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
                    className="h-10 w-auto mb-2"
                    priority
                  />
                  <div className="w-12 h-px bg-gray-300"></div>
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
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 mx-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${
                        isActive ? 'text-blue-600 bg-blue-50' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Компактная секция контактов */}
            <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {loading ? (
                <div className="flex items-center text-gray-600 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Загрузка контактов...</span>
                </div>
              ) : (
                <a
                  href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                  className="block text-center text-white font-semibold text-base mb-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {settings?.phone || "+375 XX XXX-XX-XX"}
                </a>
              )}

              <Button
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg transition-colors mb-4"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsCallbackOpen(true)
                }}
              >
                Связаться с нами
              </Button>

              {/* Простая контактная информация */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{settings?.address || "г. Минск, ул. Примерная, 123"}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-start ml-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-bold tracking-wide transition-colors hover:text-blue-600 ${
                pathname === item.href ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Контакты и кнопка звонка для десктопа */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="hidden lg:flex flex-col items-end text-right mr-2">
            {loading ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-600">Загрузка...</span>
                  </div>
                </div>
                <div className="text-xs text-gray-900 font-semibold">
                  <div>Пн-Пт: 9:00-21:00</div>
                  <div>Сб-Вс: 10:00-20:00</div>
                </div>
              </div>
            ) : (
              <>
                <a href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`} className="text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">
                  {phoneLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Загрузка...</span>
                      </div>
                    </div>
                  ) : (
                    settings?.phone || "+375 XX XXX-XX-XX"
                  )}
                </a>
                <div className="text-xs text-gray-900 font-semibold">
                  <div>Пн-Пт: 9:00-21:00</div>
                  <div>Сб-Вс: 10:00-20:00</div>
                </div>
              </>
            )}
          </div>

          <Dialog open={isCallbackOpen} onOpenChange={(open) => { setIsCallbackOpen(open); if (!open) setPhoneLoading(false); }}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg text-sm px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-xl whitespace-nowrap"
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
