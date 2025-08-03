export default function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-6xl">
        {/* Хлебные крошки */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <li>
              <div className="h-4 bg-gray-200/60 rounded w-16 animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 w-4 bg-gray-200/60 rounded animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 bg-gray-200/60 rounded w-20 animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 w-4 bg-gray-200/60 rounded animate-pulse"></div>
            </li>
            <li>
              <div className="h-4 bg-gray-200/60 rounded w-32 animate-pulse"></div>
            </li>
          </ol>
        </nav>

        {/* ЕДИНЫЙ ОСНОВНОЙ БЛОК */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-900/5 border-0 overflow-hidden">

          {/* Заголовок и цена - скелетон */}
          <div className="bg-gradient-to-r from-gray-100/60 to-gray-50/60 border-b border-gray-200/60 p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3 lg:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <div className="h-5 sm:h-8 lg:h-10 bg-gray-200/60 rounded w-40 sm:w-64 animate-pulse"></div>
                  <div className="h-5 sm:h-6 bg-gray-200/60 rounded-full w-16 sm:w-20 animate-pulse self-start sm:self-auto"></div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="h-5 bg-gray-200/60 rounded-xl w-10 animate-pulse"></div>
                  <div className="h-5 bg-gray-200/60 rounded-xl w-14 animate-pulse"></div>
                  <div className="h-5 bg-gray-200/60 rounded-xl w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="h-5 sm:h-8 lg:h-10 bg-gray-200/60 rounded w-20 sm:w-32 animate-pulse mb-1"></div>
                <div className="h-3 sm:h-5 lg:h-6 bg-gray-200/60 rounded w-16 sm:w-24 animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-gray-200/60 rounded w-14 sm:w-20 animate-pulse mt-1"></div>
              </div>
            </div>
          </div>

          {/* Скелетон внутри единого блока */}
          <div className="p-4 md:p-8 space-y-6">

            {/* Галерея скелетон */}
            <div className="bg-gradient-to-br from-gray-100/60 to-gray-200/40 rounded-3xl h-64 md:h-80 lg:h-96 animate-pulse flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 bg-gray-200/60 rounded-full animate-pulse"></div>
            </div>

            {/* Характеристики скелетон */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100/60 backdrop-blur-sm rounded-2xl p-4 animate-pulse shadow-sm">
                  <div className="h-3 bg-gray-200/60 rounded w-16 mb-2"></div>
                  <div className="h-5 bg-gray-200/60 rounded w-24"></div>
                </div>
              ))}
            </div>

            {/* Описание скелетон */}
            <div className="bg-gray-100/60 backdrop-blur-sm rounded-2xl p-4 animate-pulse shadow-sm">
              <div className="h-5 bg-gray-200/60 rounded w-24 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200/60 rounded w-full"></div>
                <div className="h-4 bg-gray-200/60 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200/60 rounded w-4/6"></div>
              </div>
            </div>

            {/* Кнопки действий скелетон */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="h-12 bg-gray-200/60 rounded-2xl flex-1 animate-pulse"></div>
              <div className="h-12 bg-gray-200/60 rounded-2xl flex-1 animate-pulse"></div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
