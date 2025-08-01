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
  Mail
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
      unp: "123456789",
      registrationDate: "15.03.2012",
      legalAddress: "г. Минск, ул. Примерная, 123",
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

        {/* Services Section */}
        <div className="mb-6 md:mb-8">
          <div className="text-center mb-4 md:mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                {aboutData.services?.title || "Наши услуги"}
              </h2>
            </div>
            <p className="text-sm md:text-base text-slate-600">
              Полный спектр услуг для комфортной покупки автомобиля
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {aboutData?.services?.items?.map((service, index) => (
              <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2 leading-tight">
                    {service?.title || ''}
                  </h3>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    {service?.description || ''}
                  </p>
                </CardContent>
              </Card>
            )) || (
              <>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Car className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Продажа автомобилей</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Широкий выбор качественных автомобилей с пробегом</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Кредитование</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Помощь в оформлении автокредита на выгодных условиях</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                      <Handshake className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Трейд-ин</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Обмен вашего автомобиля на более новый с доплатой</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Company Info */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-600/20 mr-2 md:mr-3 flex-shrink-0">
                  <Building className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                Реквизиты компании
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Полное наименование</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.fullName || ''}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">УНП</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.unp || ''}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Адрес</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.legalAddress || ''}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20 mr-2 md:mr-3 flex-shrink-0">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                Банковские реквизиты
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Расчетный счет</span>
                    <p className="font-mono text-slate-900 font-semibold text-xs md:text-sm">{aboutData?.bankDetails?.account || ''}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Банк</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.bankDetails?.bankName || ''}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">БИК</span>
                    <p className="font-mono text-slate-900 font-semibold text-sm">{aboutData?.bankDetails?.bik || ''}</p>
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
