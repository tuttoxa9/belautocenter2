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
import { Menu, Phone, Loader2, Check } from "lucide-react"
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
        {/* Кнопка звонка для мобильных (слева) - ЗАКОММЕНТИРОВАНО */}
        {/* <div className="md:hidden">
          <Dialog open={isCallbackOpen} onOpenChange={(open) => { setIsCallbackOpen(open); if (!open) setPhoneLoading(false); }}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-white hover:bg-gray-50 border-2 border-black text-xs w-8 h-8 p-0 rounded-full"
                onClick={() => setPhoneLoading(true)}
              >
                {phoneLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-black" />
                ) : (
                  <Phone className="h-4 w-4 text-black" />
                )}
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
        </div> */}

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
          <SheetContent side="left" className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 backdrop-blur-xl">
            {/* Premium Header with Logo */}
            <div className="flex items-center justify-center p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg mx-2 mt-4">
              {loading ? (
                <div className="flex items-center text-white">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  <span className="font-semibold">Загрузка...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image
                    src="/logo4.png"
                    alt="Белавто Центр"
                    width={140}
                    height={48}
                    className="h-12 w-auto mb-2 filter brightness-0 invert"
                    priority
                  />
                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
                </div>
              )}
            </div>

            {/* Professional Navigation Menu */}
            <div className="px-4 py-6">
              <div className="space-y-2">
                {navigation
                  .filter((item) => !["/", "/catalog", "/credit", "/contacts"].includes(item.href))
                  .map((item, index) => {
                    const gradients = [
                      "from-blue-600 via-indigo-600 to-purple-700",
                      "from-emerald-600 via-teal-600 to-cyan-700",
                      "from-amber-600 via-orange-600 to-red-700",
                      "from-violet-600 via-purple-600 to-indigo-700"
                    ];
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                          isActive
                            ? `bg-gradient-to-r ${gradients[index % gradients.length]} shadow-xl border border-white/10`
                            : "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50"
                        }`}
                      >
                        {/* Professional Icon Container */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all duration-300 ${
                          isActive
                            ? "bg-white/20 shadow-lg"
                            : "bg-slate-700/50 group-hover:bg-slate-600/50"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            isActive
                              ? "bg-white shadow-sm"
                              : "bg-slate-400 group-hover:bg-slate-300"
                          }`}></div>
                        </div>

                        {/* Menu Item Text */}
                        <div className="flex-1">
                          <div className={`font-semibold text-base transition-colors ${
                            isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}>
                            {item.name}
                          </div>
                          <div className={`text-xs transition-colors ${
                            isActive ? "text-white/80" : "text-slate-400 group-hover:text-slate-300"
                          }`}>
                            {item.name === "Лизинг" && "Финансовые услуги"}
                            {item.name === "О нас" && "Информация о компании"}
                            {item.name === "Отзывы" && "Мнения клиентов"}
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Premium Contact Section */}
            <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700/50 shadow-xl">
              {loading ? (
                <div className="flex items-center text-white mb-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Загрузка контактов...</span>
                </div>
              ) : (
                <a
                  href={`tel:${settings?.phone?.replace(/\s/g, "") || ""}`}
                  className="block text-center text-white font-bold text-lg mb-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {settings?.phone || "+375 XX XXX-XX-XX"}
                </a>
              )}

              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mb-4"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsCallbackOpen(true)
                }}
              >
                Связаться с нами
              </Button>

              {/* Contact Information */}
              <div className="space-y-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-1">Адрес:</div>
                    <div className="text-xs text-slate-400">{settings?.address || "г. Минск, ул. Примерная, 123"}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-1">Время работы:</div>
                    <div className="text-xs text-slate-400">Пн-Пт: 9:00-21:00</div>
                    <div className="text-xs text-slate-400">Сб-Вс: 10:00-20:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Bottom Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
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
