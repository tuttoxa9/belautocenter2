"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AboutSkeleton from "@/components/about-skeleton"
import { AboutData } from "@/types/about"
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

interface AboutClientProps {
    initialData: AboutData | null;
}

export default function AboutClient({ initialData }: AboutClientProps) {
  const [loading, setLoading] = useState(!initialData)
  const [aboutData, setAboutData] = useState(initialData)

  useEffect(() => {
    if (!initialData) {
        setLoading(true);
        // Тут можно было бы сделать фолбэк на клиентскую загрузку,
        // но мы рассчитываем, что данные всегда будут приходить с сервера.
        // Если initialData null, вероятно, произошла ошибка на сервере.
    } else {
        setAboutData(initialData);
        setLoading(false);
    }
  }, [initialData]);

  if (loading || !aboutData) {
    return <AboutSkeleton />
  }

  // Helper to get icon component from string
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
      case "car": return Car
      case "creditcard": return CreditCard
      case "phone": return Phone
      case "mappin": return MapPin
      case "clock": return Clock;
      default: return Shield
    }
  }

  const statsWithIcons = aboutData.stats.map((stat, index) => ({
      ...stat,
      icon: [Users, Award, Shield, Clock][index] || Users
  }));


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-gray-700 transition-colors duration-200">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-gray-900 font-medium">О нас</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3 h-12">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-900/10 border border-gray-200/60">
              <Building2 className="h-6 w-6 text-gray-700" />
            </div>
            <div className="flex-1 min-w-0 h-12 flex flex-col justify-center">
              <h1 className="text-xl font-semibold text-gray-900 truncate leading-5">О компании</h1>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600 h-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Узнайте больше о нас</span>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/10 border border-gray-200/60">
                <Building2 className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <div className="h-8 mb-1">
                  <h1 className="text-3xl font-semibold text-gray-900 leading-8">О компании</h1>
                </div>
                <div className="h-5">
                  <p className="text-gray-600 leading-5">Узнайте больше о Белавто Центр</p>
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
          {statsWithIcons.map((stat, index) => (
            <Card key={index} className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300 hover:-translate-y-1 h-[120px] md:h-[140px]">
              <CardContent className="p-4 md:p-6 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  {stat.icon && <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 h-6 md:h-8 flex items-center justify-center">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-600 leading-tight h-8 md:h-10 flex items-center justify-center">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">

          {/* History Card */}
          <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </div>
                {aboutData.history?.title || "Наша история"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm md:text-base">
                {aboutData.history?.content?.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Principles Card */}
          <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </div>
                {aboutData.principles?.title || "Наши принципы"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {aboutData.principles?.items?.map((principle, index) => {
                  const IconComponent = getIcon(principle.icon)
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm md:text-base mb-1">{principle.title}</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{principle.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                <Wrench className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {aboutData.services?.title || "Наши услуги"}
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600">
              Полный спектр услуг для комфортной покупки автомобиля
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {aboutData.services?.items?.map((service, index) => {
                const IconComponent = getIcon(service.icon)
                return (
                    <Card key={index} className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4 md:p-6">
                        <div className="w-10 h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 leading-tight">
                        {service.title}
                        </h3>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        {service.description}
                        </p>
                    </CardContent>
                    </Card>
                )
            })}
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Company Info */}
          <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <Building className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </div>
                Реквизиты компании
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Полное наименование</span>
                    <p className="font-medium text-gray-900 text-sm">{aboutData.companyInfo.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">УНП</span>
                    <p className="font-mono text-gray-900 font-medium text-sm">{aboutData.companyInfo.unp}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Юридический адрес</span>
                    <p className="font-medium text-gray-900 text-sm">{aboutData.companyInfo.legalAddress}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Дата регистрации</span>
                    <p className="font-medium text-gray-900 text-sm">{aboutData.companyInfo.registrationDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-2 md:mr-3 flex-shrink-0 shadow-sm">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </div>
                Банковские реквизиты
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Расчетный счет</span>
                    <p className="font-mono text-gray-900 font-medium text-xs md:text-sm break-all">{aboutData.bankDetails.account}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Банк</span>
                    <p className="font-medium text-gray-900 text-sm">{aboutData.bankDetails.bankName}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">БИК</span>
                    <p className="font-mono text-gray-900 font-medium text-sm">{aboutData.bankDetails.bik}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Адрес банка</span>
                    <p className="font-medium text-gray-900 text-sm">{aboutData.bankDetails.bankAddress}</p>
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
