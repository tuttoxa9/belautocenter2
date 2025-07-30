"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CreditCard, Phone } from "lucide-react"

const dockItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Каталог", href: "/catalog", icon: Car },
  { name: "Кредит", href: "/credit", icon: CreditCard },
  { name: "Контакты", href: "/contacts", icon: Phone },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg md:hidden">
      <div className="grid grid-cols-4 p-2">
        {dockItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-all duration-300 rounded-xl ${
                isActive
                  ? "text-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-md transform scale-105"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100/50"
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 transition-all duration-300 ${isActive ? "text-white" : "text-gray-600"}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
