"use client"
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Settings, Car, FileText, MessageSquare, Building, CreditCard, Star, Shield, Trash2, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import AdminSettings from "@/components/admin/admin-settings"
import AdminCars from "@/components/admin/admin-cars"
import AdminStories from "@/components/admin/admin-stories"
import AdminAbout from "@/components/admin/admin-about"
import AdminCredit from "@/components/admin/admin-credit"
import AdminContacts from "@/components/admin/admin-contacts"
import AdminReviews from "@/components/admin/admin-reviews"
import AdminPrivacy from "@/components/admin/admin-privacy"
import AdminLeasing from "@/components/admin/admin-leasing"
import AdminData from "@/components/admin/admin-data"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isCachePurging, setIsCachePurging] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoggingIn(true)
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
    } catch {
      setLoginError("Неверный email или пароль")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {

    }
  }

  const handleCachePurge = async () => {
    // Запрашиваем подтверждение пользователя
    const confirmed = window.confirm("Вы уверены, что хотите полностью очистить кэш сайта? Это может временно замедлить его работу.")
    if (!confirmed) return

    setIsCachePurging(true)

    try {
      // Получаем ID-токен текущего пользователя
      const token = await auth.currentUser?.getIdToken()

      if (!token) {
        toast({
          title: "Ошибка авторизации",
          description: "Не удалось получить токен авторизации",
          variant: "destructive"
        })
        return
      }

      // Формируем URL API на основе переменной окружения или значения по умолчанию
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'https://images.belautocenter.by'

      // Отправляем запрос на очистку кэша
      const response = await fetch(`${apiHost}/purge-everything`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка очистки кэша: ${response.status} ${response.statusText}`)
      }

      // Показываем уведомление об успехе
      toast({
        title: "Кэш очищается",
        description: "Задача по очистке кэша запущена. Изменения на сайте появятся в течение 30-60 секунд",
        variant: "default"
      })
    } catch (error) {

      toast({
        title: "Ошибка очистки кэша",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      })
    } finally {
      setIsCachePurging(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="text-center pb-6 pt-12 px-8">
            <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-6 border border-gray-200">
              <Image src="/logo.png" alt="Белавто Центр" width={70} height={70} className="object-contain" />
            </div>
            <CardTitle className="text-gray-900 text-2xl font-semibold mb-3">
              Панель администратора
            </CardTitle>
            <p className="text-gray-600 text-sm">Белавто Центр</p>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="bg-white border border-gray-300 text-gray-900 rounded-md h-11 px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="bg-white border border-gray-300 text-gray-900 rounded-md h-11 px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium py-3 px-4 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {loginError}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md mt-6"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Вход..." : "Войти"}
              </Button>
            </form>

            {/* Firebase Authentication Badge */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide">
                  Secured by Google Firebase Authentication
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      {/* Шапка админки */}
      <header className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Белавто Центр" width={40} height={40} className="object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">Админ-панель</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Белавто Центр</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline truncate max-w-[120px] md:max-w-none">{user.email}</span>
              <Button
                onClick={handleCachePurge}
                variant="outline"
                size="sm"
                className="border-gray-300 text-red-600 hover:bg-red-50 bg-white flex-shrink-0"
                disabled={isCachePurging}
              >
                <Trash2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Очистить кэш сайта</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white flex-shrink-0"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="container px-4 py-8">
        <Tabs defaultValue="settings" className="w-full">
          {/* Мобильная версия табов - вертикальная прокрутка */}
          <div className="md:hidden">
            <div className="overflow-x-auto pb-4">
              <TabsList className="flex w-max min-w-full space-x-2 bg-gray-100 border-gray-200 h-auto p-2">
                <TabsTrigger
                  value="settings"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Settings className="h-5 w-5 mb-1" />
                  <span>Настройки</span>
                </TabsTrigger>
                <TabsTrigger
                  value="cars"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Car className="h-5 w-5 mb-1" />
                  <span>Авто</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stories"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <FileText className="h-5 w-5 mb-1" />
                  <span>Новости</span>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Building className="h-5 w-5 mb-1" />
                  <span>О нас</span>
                </TabsTrigger>
                <TabsTrigger
                  value="credit"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span>Кредит</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span>Контакты</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Star className="h-5 w-5 mb-1" />
                  <span>Отзывы</span>
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Shield className="h-5 w-5 mb-1" />
                  <span>Политика</span>
                </TabsTrigger>
                <TabsTrigger
                  value="leasing"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Building className="h-5 w-5 mb-1" />
                  <span>Лизинг</span>
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="flex flex-col items-center justify-center min-w-[80px] h-16 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 text-xs px-2"
                >
                  <Database className="h-5 w-5 mb-1" />
                  <span>Данные</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Десктопная версия табов */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-12 bg-gray-100 border-gray-200">
              <TabsTrigger
                value="settings"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Настройки</span>
              </TabsTrigger>
              <TabsTrigger
                value="cars"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">Автомобили</span>
              </TabsTrigger>
              <TabsTrigger
                value="stories"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Новости</span>
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">О нас</span>
              </TabsTrigger>
              <TabsTrigger
                value="credit"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Кредит</span>
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Контакты</span>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Отзывы</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Политика</span>
              </TabsTrigger>
              <TabsTrigger
                value="leasing"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Лизинг</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Данные</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings />
          </TabsContent>
          <TabsContent value="cars" className="mt-6">
            <AdminCars />
          </TabsContent>
          <TabsContent value="stories" className="mt-6">
            <AdminStories />
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <AdminAbout />
          </TabsContent>
          <TabsContent value="credit" className="mt-6">
            <AdminCredit />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <AdminContacts />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <AdminReviews />
          </TabsContent>
          <TabsContent value="privacy" className="mt-6">
            <AdminPrivacy />
          </TabsContent>
          <TabsContent value="leasing" className="mt-6">
            <AdminLeasing />
          </TabsContent>
          <TabsContent value="data" className="mt-6">
            <AdminData />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
