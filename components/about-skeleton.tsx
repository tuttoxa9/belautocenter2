import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Building2 } from "lucide-react"

export default function AboutSkeleton() {
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

        {/* Header skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-200/60 rounded-3xl mb-6 mx-auto"></div>
          <div className="h-12 bg-slate-200/60 rounded-xl w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-slate-200/60 rounded-lg w-1/2 mx-auto"></div>
        </div>

        {/* Main card skeleton */}
        <Card className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 overflow-hidden">
          <CardContent className="p-0">

            {/* Statistics skeleton */}
            <div className="p-8 lg:p-12 pb-0 animate-pulse">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center space-y-3">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-200/60 rounded-2xl mx-auto"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-16 mx-auto"></div>
                    <div className="h-4 bg-slate-200/60 rounded w-20 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mx-8 lg:mx-12 my-8 lg:my-12" />

            {/* Content skeleton */}
            <div className="px-8 lg:px-12 space-y-8 lg:space-y-12 animate-pulse">

              {/* History and Principles skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* History skeleton */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-48"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-200/60 rounded"></div>
                    <div className="h-4 bg-slate-200/60 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200/60 rounded w-4/6"></div>
                  </div>
                </div>

                {/* Principles skeleton */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-48"></div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-slate-100/50">
                        <div className="w-10 h-10 bg-slate-200/60 rounded-xl flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-slate-200/60 rounded w-32"></div>
                          <div className="h-4 bg-slate-200/60 rounded"></div>
                          <div className="h-4 bg-slate-200/60 rounded w-4/5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-8 lg:my-12" />

              {/* Services skeleton */}
              <div className="space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-48"></div>
                  </div>
                  <div className="h-6 bg-slate-200/60 rounded-lg w-96 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="group relative">
                      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 h-full">
                        <div className="w-12 h-12 bg-slate-200/60 rounded-xl mb-4"></div>
                        <div className="h-6 bg-slate-200/60 rounded w-32 mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200/60 rounded"></div>
                          <div className="h-4 bg-slate-200/60 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-8 lg:my-12" />

              {/* Company Details skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8">
                {/* Company Info skeleton */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-48"></div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-slate-200/60 rounded mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                          <div className="h-5 bg-slate-200/60 rounded w-48"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Details skeleton */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200/60 rounded-xl"></div>
                    <div className="h-8 bg-slate-200/60 rounded-lg w-48"></div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-slate-200/60 rounded mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                          <div className="h-5 bg-slate-200/60 rounded w-56"></div>
                        </div>
                      </div>
                    ))}
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
