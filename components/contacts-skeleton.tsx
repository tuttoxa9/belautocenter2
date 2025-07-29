import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ContactsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">

        {/* Хлебные крошки skeleton */}
        <nav className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <span>/</span>
            <Skeleton className="h-4 w-20" />
          </div>
        </nav>

        {/* Заголовок skeleton */}
        <div className="text-center mb-8 lg:mb-16">
          <Skeleton className="h-12 lg:h-16 w-48 lg:w-64 mx-auto mb-4 lg:mb-6" />
          <Skeleton className="h-6 lg:h-8 w-80 lg:w-96 mx-auto" />
        </div>

        {/* Основное содержимое skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-16">

          {/* Левая колонка skeleton */}
          <div className="space-y-6 lg:space-y-8">
            {/* Карта skeleton */}
            <Card className="overflow-hidden shadow-xl border-0 bg-white">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-lg">
                  <Skeleton className="h-64 lg:h-96 w-full" />
                </div>
                <div className="p-4 lg:p-6">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 lg:h-6 w-24 mb-2" />
                      <Skeleton className="h-4 lg:h-5 w-48 mb-1" />
                      <Skeleton className="h-3 lg:h-4 w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Контактная информация skeleton */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {/* Телефон skeleton */}
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center space-y-3 lg:space-y-4">
                    <Skeleton className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl mx-auto" />
                    <div>
                      <Skeleton className="h-4 lg:h-5 w-16 mx-auto mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-24 mx-auto mb-1" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email skeleton */}
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center space-y-3 lg:space-y-4">
                    <Skeleton className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl mx-auto" />
                    <div>
                      <Skeleton className="h-4 lg:h-5 w-12 mx-auto mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-32 mx-auto mb-1" />
                      <Skeleton className="h-3 w-24 mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Правая колонка skeleton */}
          <div className="space-y-6 lg:space-y-8">
            {/* Форма skeleton */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="pb-4 lg:pb-6">
                <div className="flex items-center">
                  <Skeleton className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                  <Skeleton className="h-6 lg:h-7 w-32" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 lg:space-y-6">
                  {/* Имя */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 lg:h-12 w-full" />
                  </div>

                  {/* Телефон */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 lg:h-12 w-full" />
                  </div>

                  {/* Сообщение */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-20 w-full" />
                  </div>

                  {/* Кнопка */}
                  <Skeleton className="h-12 lg:h-14 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Время работы skeleton */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3 lg:pb-4">
                <div className="flex items-center">
                  <Skeleton className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  <Skeleton className="h-5 lg:h-6 w-28" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full ml-2" />
                  </div>
                  <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full ml-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Социальные сети skeleton */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-4 lg:pb-6">
            <div className="flex items-center justify-center">
              <Skeleton className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              <Skeleton className="h-5 lg:h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex flex-col items-center space-y-2 lg:space-y-3 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
                >
                  <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl" />
                  <div className="text-center">
                    <Skeleton className="h-4 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
