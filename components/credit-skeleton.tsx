export default function CreditSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Breadcrumbs skeleton */}
        <nav className="mb-6 md:mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-300 rounded w-24 animate-pulse"></div>
          </div>
        </nav>

        {/* Hero Section skeleton */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6 md:mb-8">
          <div className="relative bg-gradient-to-r from-slate-200 to-slate-300 px-4 py-6 md:px-8 md:py-12 animate-pulse">
            <div className="relative z-20">
              <div className="h-6 md:h-10 bg-slate-400 rounded w-64 md:w-96 mb-2 md:mb-4 animate-pulse"></div>
              <div className="h-4 md:h-6 bg-slate-300 rounded w-48 md:w-80 mb-2 md:mb-4 animate-pulse"></div>
              <div className="hidden md:block h-4 bg-slate-300 rounded w-72 animate-pulse"></div>
            </div>
          </div>

          {/* Main Content skeleton */}
          <div className="p-4 md:p-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">

            {/* Banks Partners Section - mobile */}
            <div className="lg:hidden mb-4">
              <div className="flex justify-between items-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-6 w-9 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Calculator Section skeleton */}
            <div className="lg:col-span-3 space-y-2 md:space-y-6">

              {/* Calculator Header */}
              <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 md:h-8 bg-slate-300 rounded w-32 animate-pulse"></div>
                  <div className="lg:hidden h-10 w-10 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="h-4 w-4 bg-slate-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              {/* Parameters Grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6">
                    <div className="flex items-center justify-between mb-1 md:mb-4">
                      <div className="h-3 md:h-4 bg-slate-300 rounded w-20 animate-pulse"></div>
                      <div className="h-3 md:h-5 bg-slate-400 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-2 bg-slate-300 rounded-full mb-1 md:mb-4 animate-pulse"></div>
                    <div className="h-7 md:h-10 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Bank Selection skeleton */}
              <div className="bg-slate-50 rounded-lg md:rounded-2xl p-2 md:p-6">
                <div className="h-3 md:h-4 bg-slate-300 rounded w-32 mb-1 md:mb-4 animate-pulse"></div>
                <div className="h-8 md:h-12 bg-slate-200 rounded animate-pulse"></div>
              </div>

              {/* Results Card skeleton */}
              <div className="bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg md:rounded-2xl p-3 md:p-6 animate-pulse">
                <div className="h-4 md:h-5 bg-slate-500 rounded w-32 mb-2 md:mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-slate-500/30 rounded-md md:rounded-xl p-2 md:p-4">
                      <div className="h-3 bg-slate-400 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-4 md:h-6 bg-slate-500 rounded w-24 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Form skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl md:rounded-3xl p-3 md:p-6 h-full shadow-lg border border-slate-200">
                <div className="h-5 md:h-6 bg-slate-300 rounded w-32 mb-3 md:mb-4 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-48 mb-3 md:hidden animate-pulse"></div>

                <div className="space-y-3 md:space-y-3">
                  {/* Form fields skeleton */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                      <div className="h-3 bg-slate-300 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                    </div>
                  ))}

                  {/* Grid fields skeleton */}
                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index}>
                        <div className="h-3 bg-slate-300 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Message field skeleton */}
                  <div>
                    <div className="h-3 bg-slate-300 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                  </div>

                  {/* Submit button skeleton */}
                  <div className="h-10 bg-blue-300 rounded-xl mt-3 animate-pulse"></div>

                  {/* Agreement text skeleton */}
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                  </div>

                  {/* Partners Section skeleton - desktop only */}
                  <div className="hidden lg:block mt-4 pt-4 border-t border-slate-200">
                    <div className="h-4 bg-slate-300 rounded w-32 mb-3 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section skeleton */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-8">
            <div className="h-5 md:h-6 bg-slate-300 rounded w-40 mb-4 md:mb-6 animate-pulse"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-300 rounded-lg md:rounded-xl animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-slate-300 rounded w-24 mb-1 md:mb-2 animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-full mb-1 animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
