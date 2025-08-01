"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  Calendar
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
      const aboutDoc = await getDoc(doc(db, "pages", "about"))
      if (aboutDoc.exists()) {
        const data = aboutDoc.data()

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
      console.error("Ошибка загрузки данных:", error)
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-slate-900 font-medium">О нас</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <Building2 className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">О компании</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
                <span>Узнайте больше о нас</span>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 border border-slate-700/50">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">О компании</h1>
                <p className="text-slate-600 mt-1">Узнайте больше о АвтоБел Центр</p>
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
            <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
                  {stat?.icon && <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-sm" />}
                </div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{stat?.value || ''}</div>
                <div className="text-xs md:text-sm text-slate-600 leading-tight">{stat?.label || ''}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">

          {/* History Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mr-2 md:mr-3 flex-shrink-0">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                {aboutData.history?.title || "Наша история"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3 text-slate-700 leading-relaxed text-sm md:text-base">
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
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 mr-2 md:mr-3 flex-shrink-0">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-white" />
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
                      default: return Shield
                    }
                  }
                  const IconComponent = getIcon(principle?.icon || 'shield')
                  const colors = [
                    { bg: "bg-blue-100", text: "text-blue-600" },
                    { bg: "bg-emerald-100", text: "text-emerald-600" },
                    { bg: "bg-amber-100", text: "text-amber-600" }
                  ]
                  const color = colors[index % colors.length]

                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconComponent className={`h-4 w-4 ${color.text}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">{principle?.title || ''}</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{principle?.description || ''}</p>
                      </div>
                    </div>
                  )
                }) || (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Надежность</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Гарантируем качество каждого автомобиля</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Клиентоориентированность</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Ваши потребности - наш приоритет</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Star className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Профессионализм</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Глубокие знания автомобильного рынка</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section - Modern macOS Style */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/25 border border-white/20 backdrop-blur-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {aboutData.services?.title || "Наши услуги"}
              </h2>
            </div>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Профессиональный сервис полного цикла для вашего комфорта
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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

              const gradients = [
                { from: "from-blue-500", to: "to-cyan-500", shadow: "shadow-blue-500/25", bg: "bg-blue-50/80" },
                { from: "from-emerald-500", to: "to-teal-500", shadow: "shadow-emerald-500/25", bg: "bg-emerald-50/80" },
                { from: "from-violet-500", to: "to-purple-500", shadow: "shadow-violet-500/25", bg: "bg-violet-50/80" },
                { from: "from-orange-500", to: "to-amber-500", shadow: "shadow-orange-500/25", bg: "bg-orange-50/80" },
                { from: "from-rose-500", to: "to-pink-500", shadow: "shadow-rose-500/25", bg: "bg-rose-50/80" },
                { from: "from-indigo-500", to: "to-blue-500", shadow: "shadow-indigo-500/25", bg: "bg-indigo-50/80" }
              ]
              const gradient = gradients[index % gradients.length]

              return (
                <Card key={index} className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className={`w-14 h-14 bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${gradient.shadow} group-hover:scale-110 transition-transform duration-300 border border-white/30`}>
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      {service?.title || ''}
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {service?.description || ''}
                    </p>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${gradient.bg} rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  </CardContent>
                </Card>
              )
            }) || (
              <>
                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <Car className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Продажа автомобилей
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Широкий выбор проверенных автомобилей с полной историей обслуживания и гарантией качества
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <CreditCard className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Кредитование
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Индивидуальные условия автокредитования с минимальным пакетом документов и быстрым решением
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <Handshake className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Трейд-ин
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Справедливая оценка вашего автомобиля и выгодный обмен на новый с прозрачным расчетом
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Гарантия качества
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Комплексная диагностика перед продажей и послепродажная поддержка для вашего спокойствия
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <Phone className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Консультации 24/7
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Круглосуточная поддержка клиентов и экспертные консультации по всем вопросам покупки
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-50/80 opacity-60"></div>
                  <CardContent className="relative p-6 md:p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
                      Оформление документов
                    </h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Полное юридическое сопровождение сделки и помощь в оформлении всех необходимых документов
                    </p>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/80 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Company Details Grid - Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">

          {/* Company Info */}
          <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/30"></div>
            <CardHeader className="relative pb-4 px-6 md:px-8 pt-6 md:pt-8">
              <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-700/30 mr-4 flex-shrink-0 border border-white/20">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Реквизиты компании</div>
                  <div className="text-sm text-slate-600 font-normal">Официальная информация</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative px-6 md:px-8 pb-6 md:pb-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Полное наименование</span>
                    <p className="font-bold text-slate-900 text-base">{aboutData?.companyInfo?.fullName || 'ООО "Белавто Центр"'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">УНП (Учетный номер плательщика)</span>
                    <p className="font-mono text-slate-900 font-bold text-base tracking-wider">{aboutData?.companyInfo?.unp || '191234567'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Юридический адрес</span>
                    <p className="font-semibold text-slate-900 text-base leading-relaxed">{aboutData?.companyInfo?.legalAddress || 'г. Минск, ул. Примерная, 123, офис 45'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Дата регистрации</span>
                    <p className="font-bold text-slate-900 text-base">{aboutData?.companyInfo?.registrationDate || '15.03.2012'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-white/30"></div>
            <CardHeader className="relative pb-4 px-6 md:px-8 pt-6 md:pt-8">
              <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-2xl flex items-center justify-center shadow-xl shadow-green-600/30 mr-4 flex-shrink-0 border border-white/20">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Банковские реквизиты</div>
                  <div className="text-sm text-slate-600 font-normal">Для безналичных платежей</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative px-6 md:px-8 pb-6 md:pb-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Расчетный счет</span>
                    <p className="font-mono text-slate-900 font-bold text-base tracking-wider break-all">{aboutData?.bankDetails?.account || 'BY12 ALFA 1234 5678 9012 3456 7890'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Наименование банка</span>
                    <p className="font-bold text-slate-900 text-base">{aboutData?.bankDetails?.bankName || 'ОАО "Альфа-Банк"'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">БИК (Банковский идентификационный код)</span>
                    <p className="font-mono text-slate-900 font-bold text-base tracking-wider">{aboutData?.bankDetails?.bik || 'ALFABY2X'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-500 font-medium block mb-1">Адрес банка</span>
                    <p className="font-semibold text-slate-900 text-base leading-relaxed">{aboutData?.bankDetails?.bankAddress || 'г. Минск, пр. Дзержинского, 1'}</p>
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
