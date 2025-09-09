export default function ContactsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 lg:mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <div className="h-3 sm:h-4 bg-gray-200/60 rounded w-12 animate-pulse"></div>
              </li>
              <li><div className="h-3 w-3 bg-gray-200/60 rounded animate-pulse"></div></li>
              <li><div className="h-3 sm:h-4 bg-gray-200/60 rounded w-16 animate-pulse"></div></li>
            </ol>
          </nav>

          {/* Title - Different for mobile and desktop */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200/60 rounded w-20 animate-pulse mb-1"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-200/60 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gray-200/60 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-200/60 rounded-2xl animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200/60 rounded w-32 animate-pulse mb-2"></div>
                <div className="h-5 bg-gray-200/60 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl lg:max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

          {/* Phone Card */}
          <div className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="h-4 bg-gray-200/60 rounded w-16 animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200/60 rounded w-32 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200/60 rounded w-28 animate-pulse"></div>
            </div>
          </div>

          {/* Email Card */}
          <div className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="h-4 bg-gray-200/60 rounded w-12 animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200/60 rounded w-40 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200/60 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl md:col-span-2 lg:col-span-1">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="h-4 bg-gray-200/60 rounded w-24 animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200/60 rounded w-10 animate-pulse"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200/60 rounded w-12 animate-pulse"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Contact Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Map Section */}
          <div className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl">
            <div className="p-0">
              <div className="w-full h-48 md:h-64 lg:h-80 bg-gray-200/60 animate-pulse rounded-t-2xl"></div>
              <div className="p-4 md:p-6">
                <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
                  <div className="min-w-0">
                    <div className="h-4 bg-gray-200/60 rounded w-20 animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200/60 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200/60 rounded w-36 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200/60 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="border-0 bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-2xl">
            <div className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200/60 rounded-2xl animate-pulse mr-2 md:mr-3 flex-shrink-0"></div>
                <div className="h-5 md:h-6 bg-gray-200/60 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="h-3 md:h-4 bg-gray-200/60 rounded w-16 animate-pulse mb-1"></div>
                  <div className="h-10 bg-gray-200/60 rounded-xl w-full animate-pulse"></div>
                </div>

                <div>
                  <div className="h-3 md:h-4 bg-gray-200/60 rounded w-24 animate-pulse mb-1"></div>
                  <div className="h-10 bg-gray-200/60 rounded-xl w-full animate-pulse"></div>
                </div>

                <div>
                  <div className="h-3 md:h-4 bg-gray-200/60 rounded w-20 animate-pulse mb-1"></div>
                  <div className="h-20 bg-gray-200/60 rounded-xl w-full animate-pulse"></div>
                </div>

                <div className="h-12 bg-gray-200/60 rounded-xl w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media - Neutral gray theme */}
      <section className="relative pt-12 pb-32 bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 rounded-t-[40px] -mb-20 overflow-hidden mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-3 mb-8">
              <div className="w-11 h-11 bg-white/60 rounded-2xl animate-pulse"></div>
              <div className="h-6 bg-white/70 rounded w-48 animate-pulse"></div>
            </div>

            <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-0 shadow-lg shadow-gray-900/5">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200/60 rounded-2xl animate-pulse flex-shrink-0"></div>
                    <div className="ml-5 flex-1">
                      <div className="h-5 bg-gray-200/60 rounded w-20 animate-pulse mb-1"></div>
                      <div className="h-4 bg-gray-200/60 rounded w-24 animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200/60 rounded w-36 animate-pulse"></div>
                    </div>
                    <div className="ml-4">
                      <div className="w-5 h-5 bg-gray-200/60 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
