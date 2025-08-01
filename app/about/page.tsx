"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-700 transition-colors">
                Главная
              </Link>
            </li>
            <li><ArrowRight className="h-3 w-3" /></li>
            <li className="text-slate-900 font-medium">О нас</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl shadow-slate-800/25 mb-6 transform hover:scale-105 transition-transform duration-300">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {aboutData.pageTitle}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {aboutData.pageSubtitle}
          </p>
        </div>

        {/* Main unified card container */}
        <Card className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 overflow-hidden">
          <CardContent className="p-0">

            {/* Statistics Section */}
            <div className="p-8 lg:p-12 pb-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {aboutData?.stats?.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-slate-800/20 group-hover:shadow-slate-800/30 transform group-hover:scale-105 transition-all duration-300">
                        {stat?.icon && <stat.icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />}
                      </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{stat?.value || ''}</div>
                    <div className="text-sm lg:text-base text-slate-600 leading-tight">{stat?.label || ''}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mx-8 lg:mx-12 my-8 lg:my-12" />

            {/* Content Sections */}
            <div className="px-8 lg:px-12 space-y-8 lg:space-y-12">

              {/* History and Principles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* History */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {aboutData.history?.title || "Наша история"}
                    </h2>
                  </div>
                  <div className="space-y-4 text-slate-700 leading-relaxed">
                    {aboutData.history?.content?.map((paragraph, index) => (
                      <p key={index} className="text-base lg:text-lg">
                        {paragraph}
                      </p>
                    )) || (
                      <p className="text-base lg:text-lg">
                        Уже более 12 лет мы помогаем нашим клиентам найти идеальный автомобиль.
                        За это время мы продали тысячи автомобилей и заслужили доверие покупателей благодаря
                        честному подходу к бизнесу и качественному сервису.
                      </p>
                    )}
                  </div>
                </div>

                {/* Principles */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {aboutData.principles?.title || "Наши принципы"}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {aboutData?.principles?.items?.map((principle, index) => {
                      const getIcon = (iconName: string) => {
                        switch (iconName) {
                          case "shield": return Shield
                          case "award": return Award
                          case "users": return Users
                          case "car": return Car
                          case "phone": return Phone
                          case "mappin":
                          case "map-pin": return MapPin
                          case "clock": return Clock
                          case "checkcircle":
                          case "check-circle": return CheckCircle
                          case "star": return Star
                          case "wrench": return Wrench
                          case "credit-card":
                          case "creditcard": return CreditCard
                          case "dollar-sign":
                          case "dollarsign": return DollarSign
                          case "file-text":
                          case "filetext": return FileText
                          case "building": return Building
                          case "trending-up":
                          case "trendingup": return TrendingUp
                          case "calculator": return Calculator
                          case "handshake": return Handshake
                          default: return Shield
                        }
                      }
                      const IconComponent = getIcon(principle?.icon || 'shield')
                      const colors = [
                        { bg: "bg-blue-100", text: "text-blue-600" },
                        { bg: "bg-emerald-100", text: "text-emerald-600" },
                        { bg: "bg-amber-100", text: "text-amber-600" },
                        { bg: "bg-purple-100", text: "text-purple-600" }
                      ]
                      const color = colors[index % colors.length]

                      return (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <IconComponent className={`h-5 w-5 ${color.text}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-lg">{principle?.title || ''}</h3>
                            <p className="text-slate-600 leading-relaxed">{principle?.description || ''}</p>
                          </div>
                        </div>
                      )
                    }) || (
                      <>
                        <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Надежность</h3>
                            <p className="text-slate-600 leading-relaxed">Мы гарантируем качество каждого автомобиля и честность во всех сделках</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Users className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Клиентоориентированность</h3>
                            <p className="text-slate-600 leading-relaxed">Ваши потребности - наш приоритет. Мы поможем найти именно ваш автомобиль</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50/50">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Star className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Профессионализм</h3>
                            <p className="text-slate-600 leading-relaxed">Наша команда экспертов обладает глубокими знаниями автомобильного рынка</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-8 lg:my-12" />

              {/* Services */}
              <div className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {aboutData.services?.title || "Наши услуги"}
                    </h2>
                  </div>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Полный спектр услуг для комфортной покупки автомобиля
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aboutData?.services?.items?.map((service, index) => (
                    <div key={index} className="group relative">
                      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/25 hover:border-slate-300/50 transition-all duration-300 h-full transform group-hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 shadow-sm">
                          <Check className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3 leading-tight">
                          {service?.title || ''}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {service?.description || ''}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <>
                      <div className="group relative">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/25 transition-all duration-300 h-full transform group-hover:-translate-y-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <Car className="h-6 w-6 text-slate-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Продажа автомобилей</h3>
                          <p className="text-slate-600 leading-relaxed">Широкий выбор качественных автомобилей с пробегом по выгодным ценам</p>
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/25 transition-all duration-300 h-full transform group-hover:-translate-y-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <CreditCard className="h-6 w-6 text-slate-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Кредитование</h3>
                          <p className="text-slate-600 leading-relaxed">Помощь в оформлении автокредита на выгодных условиях</p>
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/25 transition-all duration-300 h-full transform group-hover:-translate-y-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <Handshake className="h-6 w-6 text-slate-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Трейд-ин</h3>
                          <p className="text-slate-600 leading-relaxed">Обмен вашего автомобиля на более новый с доплатой</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator className="my-8 lg:my-12" />

              {/* Company Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8">
                {/* Company Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-600/20">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Реквизиты компании</h3>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start space-x-3">
                        <Building2 className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">Полное наименование</span>
                          <p className="font-semibold text-slate-900">{aboutData?.companyInfo?.fullName || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">УНП</span>
                          <p className="font-semibold text-slate-900">{aboutData?.companyInfo?.unp || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">Адрес</span>
                          <p className="font-semibold text-slate-900">{aboutData?.companyInfo?.legalAddress || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Банковские реквизиты</h3>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start space-x-3">
                        <CreditCard className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">Расчетный счет</span>
                          <p className="font-mono text-slate-900 font-semibold">{aboutData?.bankDetails?.account || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">Банк</span>
                          <p className="font-semibold text-slate-900">{aboutData?.bankDetails?.bankName || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Globe className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-slate-500">БИК</span>
                          <p className="font-mono text-slate-900 font-semibold">{aboutData?.bankDetails?.bik || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
