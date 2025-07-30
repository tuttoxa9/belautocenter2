"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CreditCard, Phone, MessageSquare, FileText, Banknote } from "lucide-react"

const dockItems = [
  {
    name: "Главная",
    href: "/",
    icon: Home,
    gradient: "from-slate-700 via-slate-800 to-slate-900"
  },
  {
    name: "Каталог",
    href: "/catalog",
    icon: Car,
    gradient: "from-blue-600 via-indigo-700 to-slate-800"
  },
  {
    name: "Кредит",
    href: "/credit",
    icon: CreditCard,
    gradient: "from-emerald-600 via-teal-700 to-slate-800"
  },
  {
    name: "Лизинг",
    href: "/leasing",
    icon: Banknote,
    gradient: "from-amber-600 via-orange-700 to-slate-800"
  },
  {
    name: "Отзывы",
    href: "/reviews",
    icon: MessageSquare,
    gradient: "from-purple-600 via-violet-700 to-slate-800"
  },
  {
    name: "Контакты",
    href: "/contacts",
    icon: Phone,
    gradient: "from-red-600 via-rose-700 to-slate-800"
  },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-2 right-2 z-50 md:hidden">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-1">
        <div className="grid grid-cols-6 gap-1">
          {dockItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-3 px-1 transition-all duration-300 rounded-xl group relative overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-br ${item.gradient} shadow-xl transform scale-105 border border-white/10`
                    : "hover:bg-slate-800/50 hover:scale-105"
                }`}
              >
                {/* Background glow effect for active item */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 blur-sm`}></div>
                )}

                {/* Icon container with enhanced styling */}
                <div className={`relative z-10 p-1.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 shadow-lg"
                    : "group-hover:bg-white/5"
                }`}>
                  <item.icon className={`h-5 w-5 transition-all duration-300 ${
                    isActive
                      ? "text-white drop-shadow-sm"
                      : "text-slate-300 group-hover:text-white"
                  }`} />
                </div>

                {/* Label with professional typography */}
                <span className={`relative z-10 text-[10px] font-medium mt-1 transition-all duration-300 leading-tight text-center ${
                  isActive
                    ? "text-white drop-shadow-sm"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}>
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white/80 rounded-full shadow-sm z-10"></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Professional border accent */}
        <div className="absolute inset-0 rounded-2xl border border-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  )
}
