import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Building2 } from "lucide-react"

export default function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-black dark:via-gray-950 dark:to-black">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                  Главная
                </Link>
              </li>
              <li><ArrowRight className="h-3 w-3" /></li>
              <li className="text-gray-900 dark:text-white font-medium">О нас</li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3 h-12">
            <div className="w-12 h-12 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl flex-shrink-0 animate-pulse"></div>
            <div className="flex-1 min-w-0 h-12 flex flex-col justify-center">
              <div className="h-6 flex items-center">
                <div className="h-5 bg-gray-200/60 dark:bg-gray-700/60 rounded w-32 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600 dark:text-gray-400 h-4">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <div className="h-3 bg-gray-200/60 dark:bg-gray-700/60 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between h-14">
            <div className="flex items-center space-x-4 h-14 animate-pulse">
              <div className="w-14 h-14 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl"></div>
              <div className="h-14 flex flex-col justify-center">
                <div className="h-8 flex items-center">
                  <div className="h-8 bg-gray-200/60 dark:bg-gray-700/60 rounded w-48 animate-pulse"></div>
                </div>
                <div className="mt-2 h-5">
                  <div className="h-5 bg-gray-200/60 dark:bg-gray-700/60 rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-6 lg:py-8">

        {/* Stats Cards Grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
              <CardContent className="p-4 md:p-6 text-center animate-pulse">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mx-auto mb-3 md:mb-4"></div>
                <div className="h-6 md:h-8 bg-gray-200/60 dark:bg-gray-700/80 rounded w-16 mx-auto mb-1"></div>
                <div className="h-3 md:h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-20 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">

          {/* History Card skeleton */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="flex items-center animate-pulse">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mr-2 md:mr-3 flex-shrink-0"></div>
                <div className="h-5 md:h-6 bg-gray-200/60 dark:bg-gray-700/80 rounded w-32"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded"></div>
                <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>

          {/* Principles Card skeleton */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="flex items-center animate-pulse">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mr-2 md:mr-3 flex-shrink-0"></div>
                <div className="h-5 md:h-6 bg-gray-200/60 dark:bg-gray-700/80 rounded w-36"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200/60 dark:bg-gray-700/80 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200/60 dark:bg-gray-700/80 rounded"></div>
                      <div className="h-3 bg-gray-200/60 dark:bg-gray-700/80 rounded w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4 md:mb-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl"></div>
              <div className="h-6 md:h-8 bg-gray-200/60 dark:bg-gray-700/80 rounded w-32"></div>
            </div>
            <div className="h-4 md:h-5 bg-gray-200/60 dark:bg-gray-700/80 rounded w-64"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
                <CardContent className="p-4 md:p-6 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mb-3 md:mb-4"></div>
                  <div className="h-4 md:h-5 bg-gray-200/60 dark:bg-gray-700/80 rounded w-32 mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded"></div>
                  <div className="h-3 md:h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-4/5"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Details Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Company Info skeleton */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="flex items-center animate-pulse">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mr-2 md:mr-3 flex-shrink-0"></div>
                <div className="h-5 md:h-6 bg-gray-200/60 dark:bg-gray-700/80 rounded w-40"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-4 h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200/60 dark:bg-gray-700/80 rounded w-24 mb-1"></div>
                      <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-48"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bank Details skeleton */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 rounded-2xl">
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="flex items-center animate-pulse">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 dark:bg-gray-700/80 rounded-2xl mr-2 md:mr-3 flex-shrink-0"></div>
                <div className="h-5 md:h-6 bg-gray-200/60 dark:bg-gray-700/80 rounded w-44"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-4 h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200/60 dark:bg-gray-700/80 rounded w-24 mb-1"></div>
                      <div className="h-4 bg-gray-200/60 dark:bg-gray-700/80 rounded w-56"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
