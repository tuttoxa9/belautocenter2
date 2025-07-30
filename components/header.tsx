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
          <SheetContent side="left" className="w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 shadow-2xl">
            {/* Элегантный заголовок */}
            <div className="relative p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30 rounded-2xl mx-4 mt-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
              {loading ? (
                <div className="relative flex items-center justify-center text-white">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  <span className="font-semibold">Загрузка...</span>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <Image
                    src="/logo4.png"
                    alt="Белавто Центр"
                    width={140}
                    height={48}
                    className="h-12 w-auto mb-3 drop-shadow-lg"
                    priority
                  />
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
                </div>
              )}
            </div>

            {/* Элегантное навигационное меню */}
            <div className="px-6 py-8">
              <div className="space-y-3">
                {navigation
                  .filter((item) => !["/", "/catalog", "/credit", "/contacts"].includes(item.href))
                  .map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 shadow-xl border border-blue-500/30"
                            : "bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-blue-600/30 hover:to-indigo-600/30 border border-slate-600/30 hover:border-blue-500/30 hover:shadow-lg"
                        }`}
                      >
                        {/* Современный индикатор */}
                        <div className={`relative w-3 h-8 mr-4 flex items-center ${
                          isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                        }`}>
                          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isActive
                              ? "bg-white shadow-lg scale-110"
                              : "bg-slate-300 group-hover:bg-white group-hover:scale-105"
                          }`}></div>
                          {isActive && (
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-white/50 animate-ping"></div>
                          )}
                        </div>

                        {/* Контент пункта меню */}
                        <div className="flex-1">
                          <div className={`font-semibold text-base transition-colors ${
                            isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}>
                            {item.name}
                          </div>
                          <div className={`text-xs transition-colors ${
                            isActive ? "text-blue-100" : "text-slate-400 group-hover:text-slate-300"
                          }`}>
                            {item.name === "Лизинг" && "Финансовые услуги"}
                            {item.name === "О нас" && "Информация о компании"}
                            {item.name === "Отзывы" && "Мнения клиентов"}
                          </div>
                        </div>

                        {/* Стрелка для активного элемента */}
                        {isActive && (
                          <div className="text-white">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Элегантная секция контактов */}
            <div className="mx-6 mb-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-2xl border border-slate-600/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-2xl pointer-events-none"></div>

              {loading ? (
                <div className="flex items-center text-white mb-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Загрузка контактов...</span>
                </div>
              ) : (
                <a
                  href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                  className="relative block text-center text-white font-bold text-lg mb-4 p-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"></div>
                  <span className="relative">{settings?.phone || "+375 XX XXX-XX-XX"}</span>
                </a>
              )}

              <Button
                className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] mb-6 border border-blue-500/30"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsCallbackOpen(true)
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"></div>
                <span className="relative">Связаться с нами</span>
              </Button>

              {/* Информация о контактах */}
              <div className="space-y-4 pt-4 border-t border-slate-600/50">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg border border-slate-500/30">
                    <MapPin className="w-4 h-4 text-slate-200" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 mb-1">Адрес:</div>
                    <div className="text-xs text-slate-300">{settings?.address || "г. Минск, ул. Примерная, 123"}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg border border-slate-500/30">
                    <Clock className="w-4 h-4 text-slate-200" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 mb-1">Время работы:</div>
                    <div className="text-xs text-slate-300">Пн-Пт: 9:00-21:00</div>
                    <div className="text-xs text-slate-300">Сб-Вс: 10:00-20:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Декоративный акцент внизу */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>
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
