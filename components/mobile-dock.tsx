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
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 md:hidden">
      <div className="grid grid-cols-4 p-2">
        {dockItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-all duration-300 rounded-xl ${
                isActive
                  ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25 transform scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 transition-all duration-300 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
