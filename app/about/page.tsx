"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { firestoreApi } from "@/lib/firestore-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AboutSkeleton from "@/components/about-skeleton"
import {
  Shield,
  Users,
  Award,
  Clock,
  Car,
  Phone,
  MapPin,
  CheckCircle,
  Star,
  Wrench,
  CreditCard,
  DollarSign,
  FileText,
  Building,
  TrendingUp,
  Calculator,
  Handshake,
  Check,
  ArrowRight,
  Building2,
  Globe,
  Mail,
  Calendar,
  Heart,
  Target,
  Zap,
  Eye
} from "lucide-react"

export default function AboutPage() {
  const [loading, setLoading] = useState(true)
  const [aboutData, setAboutData] = useState({
    pageTitle: "О компании \"АвтоБел Центр\"",
    pageSubtitle: "Мы помогаем людям найти идеальный автомобиль уже более 12 лет. Наша миссия — сделать покупку автомобиля простой, безопасной и выгодной.",
    stats: [
      { icon: Users, label: "Довольных клиентов", value: "2500+" },
      { icon: Award, label: "Лет на рынке", value: "12" },
      { icon: Shield, label: "Проданных автомобилей", value: "5000+" },
      { icon: Clock, label: "Среднее время продажи", value: "7 дней" },
    ],
    companyInfo: {
      fullName: 'ООО "Белавто Центр"',
      unp: "191234567",
      registrationDate: "15.03.2012",
      legalAddress: "г. Минск, ул. Примерная, 123, офис 45",
    },
    bankDetails: {
      account: "BY12 ALFA 1234 5678 9012 3456 7890",
      bankName: 'ОАО "Альфа-Банк"',
      bik: "ALFABY2X",
      bankAddress: "г. Минск, пр. Дзержинского, 1",
    },
  })

  const loadAboutData = async () => {
    try {
      const data = await firestoreApi.getDocument("pages", "about")
      if (data) {
        // Merge data with proper null checks
        setAboutData(prev => ({
          ...prev,
          ...data,
          pageTitle: data?.pageTitle || prev.pageTitle,
          pageSubtitle: data?.pageSubtitle || prev.pageSubtitle,
          stats: data?.stats?.map((stat, index) => ({
            ...stat,
            icon: [Users, Award, Shield, Clock][index] || Users
          })) || prev.stats,
          history: data?.history || prev.history,
          principles: data?.principles || prev.principles,
          services: data?.services || prev.services,
          companyInfo: data?.companyInfo || prev.companyInfo,
          bankDetails: data?.bankDetails || prev.bankDetails
        }))
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAboutData()
  }, [])

  if (loading) {
    return <AboutSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-black dark:via-gray-950 dark:to-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200" prefetch={true}>
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-gray-900 dark:text-white font-medium">О нас</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3 h-12">
            <div className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-900/10 dark:shadow-black/30 border border-gray-200/60 dark:border-gray-700/60">
              <Building2 className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0 h-12 flex flex-col justify-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate leading-5">О компании</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600 dark:text-gray-400 h-4">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span>Узнайте больше о нас</span>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/10 dark:shadow-black/30 border border-gray-200/60 dark:border-gray-700/60">
                <Building2 className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <div className="h-8 mb-1">
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white leading-8">О компании</h1>
                </div>
                <div className="h-5">
                  <p className="text-gray-600 dark:text-gray-400 leading-5">Узнайте больше о Белавто Центр</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-6 lg:py-8">

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {aboutData?.stats?.map((stat, index) => (
            <Card key={index} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 h-[120px] md:h-[140px]">
              <CardContent className="p-4 md:p-6 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  {stat?.icon && <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-gray-600 dark:text-gray-300" />}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-1 h-6 md:h-8 flex items-center justify-center">{stat?.value || ''}</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-tight h-8 md:h-10 flex items-center justify-center">{stat?.label || ''}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">

          {/* History Card */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
                </div>
                {aboutData.history?.title || "Наша история"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                {aboutData.history?.content?.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                )) || (
                  <p>
                    Уже более 12 лет мы помогаем нашим клиентам найти идеальный автомобиль.
                    За это время мы продали тысячи автомобилей и заслужили доверие покупателей благодаря
                    честному подходу к бизнесу и качественному сервису.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Principles Card */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
                </div>
                {aboutData.principles?.title || "Наши принципы"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {aboutData?.principles?.items?.map((principle, index) => {
                  const getIcon = (iconName: string) => {
                    switch (iconName) {
                      case "shield": return Shield
                      case "award": return Award
                      case "users": return Users
                      case "star": return Star
                      case "heart": return Heart
                      case "target": return Target
                      case "zap": return Zap
                      case "eye": return Eye
                      case "handshake": return Handshake
                      default: return Shield
                    }
                  }
                  const IconComponent = getIcon(principle?.icon || 'shield')

                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">{principle?.title || ''}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">{principle?.description || ''}</p>
                      </div>
                    </div>
                  )
                }) || (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Shield className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">Надежность</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Гарантируем качество каждого автомобиля и честность во всех сделках</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">Клиентоориентированность</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Ваши потребности и комфорт - наш главный приоритет</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Award className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">Профессионализм</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Глубокие знания автомобильного рынка и экспертная оценка</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">Прозрачность</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Открытая информация о каждом автомобиле и честные цены</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Zap className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base mb-1">Оперативность</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Быстрое решение вопросов и минимальные сроки оформления</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                <Wrench className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                {aboutData.services?.title || "Наши услуги"}
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Полный спектр услуг для комфортной покупки автомобиля
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {aboutData?.services?.items?.map((service, index) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case "car": return Car
                  case "creditcard": return CreditCard
                  case "handshake": return Handshake
                  case "phone": return Phone
                  case "shield": return Shield
                  case "award": return Award
                  case "users": return Users
                  case "clock": return Clock
                  case "mappin": return MapPin
                  default: return Check
                }
              }
              const IconComponent = getIcon(service?.icon || 'check')

              return (
                <Card key={index} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2 leading-tight">
                      {service?.title || ''}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">
                      {service?.description || ''}
                    </p>
                  </CardContent>
                </Card>
              )
            }) || (
              <>
                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Car className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Продажа автомобилей</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Широкий выбор качественных автомобилей с пробегом. Все автомобили проходят тщательную проверку перед продажей.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Кредитование</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Помощь в оформлении автокредита на выгодных условиях. Работаем с ведущими банками Беларуси.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Handshake className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Трейд-ин</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Обмен вашего автомобиля на более новый с доплатой. Честная оценка и прозрачные условия.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Гарантия качества</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Гарантия на каждый проданный автомобиль. Полная диагностика и техническая проверка.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Оформление документов</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Полное юридическое сопровождение сделки. Помощь в оформлении всех необходимых документов.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">Консультации</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed">Профессиональные консультации по выбору автомобиля. Экспертная оценка технического состояния.</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Company Info */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Building className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
                </div>
                Реквизиты компании
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Полное наименование</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{aboutData?.companyInfo?.fullName || 'ООО "Белавто Центр"'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">УНП</span>
                    <p className="font-mono text-gray-900 dark:text-white font-medium text-sm">{aboutData?.companyInfo?.unp || '191234567'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Юридический адрес</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{aboutData?.companyInfo?.legalAddress || 'г. Минск, ул. Примерная, 123, офис 45'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Дата регистрации</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{aboutData?.companyInfo?.registrationDate || '15.03.2012'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-black/50 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
                </div>
                Банковские реквизиты
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Расчетный счет</span>
                    <p className="font-mono text-gray-900 dark:text-white font-medium text-xs md:text-sm break-all">{aboutData?.bankDetails?.account || 'BY12 ALFA 1234 5678 9012 3456 7890'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Банк</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{aboutData?.bankDetails?.bankName || 'ОАО "Альфа-Банк"'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">БИК</span>
                    <p className="font-mono text-gray-900 dark:text-white font-medium text-sm">{aboutData?.bankDetails?.bik || 'ALFABY2X'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Адрес банка</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{aboutData?.bankDetails?.bankAddress || 'г. Минск, пр. Дзержинского, 1'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
