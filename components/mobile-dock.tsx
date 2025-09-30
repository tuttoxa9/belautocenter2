"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CreditCard, Phone, Palette } from "lucide-react"
import { ThemeSwitcher } from "./theme-switcher"

const dockItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Каталог", href: "/catalog", icon: Car },
  { name: "Кредит", href: "/credit", icon: CreditCard },
  { name: "Контакты", href: "/contacts", icon: Phone },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 p-2">
        {dockItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-xs transition-all duration-300 ${
                isActive
                  ? "transform scale-105 bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className={`mb-1 h-6 w-6 transition-all duration-300 ${isActive ? "text-primary-foreground" : ""}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        <div className="flex flex-col items-center justify-center px-2 py-3 text-xs">
            <ThemeSwitcher side="top" />
            <span className="mt-1 text-xs font-medium text-muted-foreground">Тема</span>
        </div>
      </div>
    </div>
  )
}
