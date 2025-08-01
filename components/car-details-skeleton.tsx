export default function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-6xl">
        {/* Хлебные крошки */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <li>
              <div className="h-4 bg-slate-300 rounded w-16 animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 bg-slate-300 rounded w-20 animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div>
            </li>
          </ol>
        </nav>

        {/* ЕДИНЫЙ ОСНОВНОЙ БЛОК */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">

          {/* Заголовок и цена - компактный верхний блок */}
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 p-3 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <div className="h-6 sm:h-8 lg:h-10 bg-slate-300 rounded w-64 sm:w-80 animate-pulse"></div>
                  <div className="h-6 bg-green-300 rounded-full w-20 animate-pulse"></div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
                  <div className="h-5 bg-slate-200 rounded-lg w-12 animate-pulse"></div>
                  <div className="h-5 bg-slate-200 rounded-lg w-16 animate-pulse"></div>
                  <div className="h-5 bg-slate-200 rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>

              {/* Цена справа */}
              <div className="text-left sm:text-right">
                <div className="h-8 sm:h-10 lg:h-12 bg-slate-300 rounded w-32 sm:w-40 animate-pulse mb-1"></div>
                <div className="h-4 sm:h-5 bg-slate-200 rounded w-24 sm:w-32 animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-20 sm:w-24 animate-pulse mt-1"></div>
              </div>
            </div>
          </div>

          {/* Основной контент - мобильная и десктопная версии */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Левая колонка: Галерея */}
            <div className="lg:col-span-7 lg:border-r border-slate-200/50">
              <div className="relative h-64 sm:h-72 md:h-80 lg:h-[400px] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 rounded-2xl mx-4 my-4 animate-pulse overflow-hidden">
                {/* Навигационные кнопки скелетона */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 rounded-full animate-pulse"></div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 rounded-full animate-pulse"></div>

                {/* Индикатор точек скелетона */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                </div>

                {/* Счетчик фотографий скелетона */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black/40 rounded-full px-3 py-1.5 animate-pulse">
                    <div className="h-3 bg-white/60 rounded w-8"></div>
                  </div>
                </div>
              </div>

              {/* Миниатюры внизу галереи */}
              <div className="p-4 bg-slate-50/50 border-b lg:border-b-0 border-slate-200/50">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-shrink-0 w-14 h-14 bg-slate-200 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Описание под галереей для десктопов */}
              <div className="hidden lg:block p-6 bg-slate-50/50 border-slate-200/50">
                <div className="h-5 bg-slate-300 rounded w-20 animate-pulse mb-3"></div>
                <div className="bg-white rounded-xl p-4 border border-slate-200/50 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Описание для мобильных устройств под галереей */}
            <div className="lg:hidden p-3 sm:p-4 bg-slate-50/50 border-b border-slate-200/50">
              <div className="h-4 sm:h-5 bg-slate-300 rounded w-20 animate-pulse mb-3"></div>
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/50 space-y-2">
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>

            {/* Правая колонка: Характеристики и действия */}
            <div className="lg:col-span-5">
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

                {/* Основные характеристики - компактный стиль */}
                <div>
                  <div className="h-4 lg:h-5 bg-slate-300 rounded w-32 animate-pulse mb-3 lg:mb-4"></div>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-200/50">
                        <div className="h-3 bg-slate-200 rounded w-12 animate-pulse mb-1"></div>
                        <div className="h-4 lg:h-5 bg-slate-300 rounded w-20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Комплектация */}
                <div>
                  <div className="h-4 sm:h-5 bg-slate-300 rounded w-24 animate-pulse mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-300 rounded-full animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Технические характеристики */}
                <div>
                  <div className="h-4 sm:h-5 bg-slate-300 rounded w-36 animate-pulse mb-3"></div>
                  <div className="space-y-1 sm:space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-xl border border-slate-200/50">
                        <div className="h-3 sm:h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-slate-300 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Финансирование - компактный блок */}
                <div>
                  <div className="h-4 sm:h-5 bg-slate-300 rounded w-28 animate-pulse mb-3"></div>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/50">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="text-center">
                        <div className="h-3 sm:h-4 bg-slate-200 rounded w-16 mx-auto animate-pulse mb-1"></div>
                        <div className="h-4 sm:h-5 bg-slate-300 rounded w-20 mx-auto animate-pulse"></div>
                      </div>
                      <div className="text-center">
                        <div className="h-3 sm:h-4 bg-slate-200 rounded w-16 mx-auto animate-pulse mb-1"></div>
                        <div className="h-4 sm:h-5 bg-slate-300 rounded w-20 mx-auto animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 sm:h-10 bg-slate-300 rounded-xl animate-pulse"></div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <div className="h-8 sm:h-10 bg-blue-200 rounded-xl animate-pulse"></div>
                    <div className="h-8 sm:h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Контактная информация внизу */}
          <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-4 sm:p-6 border-t border-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
              <div className="text-center md:text-left">
                <div className="h-4 sm:h-5 bg-blue-300 rounded w-40 mx-auto md:mx-0 animate-pulse mb-1"></div>
                <div className="h-3 sm:h-4 bg-blue-200 rounded w-48 mx-auto md:mx-0 animate-pulse"></div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-200 rounded animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-blue-200 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-blue-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end space-x-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-200 rounded animate-pulse"></div>
                  <div className="h-4 sm:h-5 bg-blue-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
