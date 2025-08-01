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
                      case "heart": return Heart
                      case "target": return Target
                      case "zap": return Zap
                      case "eye": return Eye
                      case "handshake": return Handshake
                      default: return Shield
                    }
                  }
                  const IconComponent = getIcon(principle?.icon || 'shield')
                  const colors = [
                    { bg: "bg-blue-100", text: "text-blue-600" },
                    { bg: "bg-emerald-100", text: "text-emerald-600" },
                    { bg: "bg-violet-100", text: "text-violet-600" },
                    { bg: "bg-orange-100", text: "text-orange-600" },
                    { bg: "bg-cyan-100", text: "text-cyan-600" },
                    { bg: "bg-rose-100", text: "text-rose-600" },
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
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Гарантируем качество каждого автомобиля и честность во всех сделках</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Heart className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Клиентоориентированность</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Ваши потребности и комфорт - наш главный приоритет</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Award className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Профессионализм</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Глубокие знания автомобильного рынка и экспертная оценка</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Eye className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Прозрачность</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Открытая информация о каждом автомобиле и честные цены</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Zap className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Оперативность</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Быстрое решение вопросов и минимальные сроки оформления</p>
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
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Wrench className="h-5 w-5 text-slate-600" />
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
                <Card key={index} className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <IconComponent className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2 leading-tight">
                      {service?.title || ''}
                    </h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                      {service?.description || ''}
                    </p>
                  </CardContent>
                </Card>
              )
            }) || (
              <>
                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <Car className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Продажа автомобилей</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Широкий выбор качественных автомобилей с пробегом. Все автомобили проходят тщательную проверку перед продажей.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <CreditCard className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Кредитование</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Помощь в оформлении автокредита на выгодных условиях. Работаем с ведущими банками Беларуси.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <Handshake className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Трейд-ин</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Обмен вашего автомобиля на более новый с доплатой. Честная оценка и прозрачные условия.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <Shield className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Гарантия качества</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Гарантия на каждый проданный автомобиль. Полная диагностика и техническая проверка.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Оформление документов</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Полное юридическое сопровождение сделки. Помощь в оформлении всех необходимых документов.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <Phone className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">Консультации</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Профессиональные консультации по выбору автомобиля. Экспертная оценка технического состояния.</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Company Info */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                  <Building className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                </div>
                Реквизиты компании
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Полное наименование</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.fullName || 'ООО "Белавто Центр"'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">УНП</span>
                    <p className="font-mono text-slate-900 font-semibold text-sm">{aboutData?.companyInfo?.unp || '191234567'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Юридический адрес</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.legalAddress || 'г. Минск, ул. Примерная, 123, офис 45'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Дата регистрации</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.companyInfo?.registrationDate || '15.03.2012'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                </div>
                Банковские реквизиты
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Расчетный счет</span>
                    <p className="font-mono text-slate-900 font-semibold text-xs md:text-sm break-all">{aboutData?.bankDetails?.account || 'BY12 ALFA 1234 5678 9012 3456 7890'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Банк</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.bankDetails?.bankName || 'ОАО "Альфа-Банк"'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">БИК</span>
                    <p className="font-mono text-slate-900 font-semibold text-sm">{aboutData?.bankDetails?.bik || 'ALFABY2X'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Адрес банка</span>
                    <p className="font-semibold text-slate-900 text-sm">{aboutData?.bankDetails?.bankAddress || 'г. Минск, пр. Дзержинского, 1'}</p>
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
