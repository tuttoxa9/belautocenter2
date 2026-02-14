"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, CreditCard, Phone } from "lucide-react"
import { useCreditLeasingModal } from "@/components/providers/credit-leasing-modal-provider"

const dockItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Каталог", href: "/catalog", icon: Car },
  { name: "Кредит", href: "/credit", icon: CreditCard },
  { name: "Контакты", href: "/contacts", icon: Phone },
]

export default function MobileDock() {
  const pathname = usePathname()
  const { openModal: openCreditModal } = useCreditLeasingModal()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-gray-800/50 rounded-2xl shadow-[0_0_35px_0px_rgba(0,0,0,0.4)] dark:shadow-[0_0_35px_0px_rgba(0,0,0,0.8)] md:hidden">
      <div className="grid grid-cols-4 p-2">
        {dockItems.map((item) => {
          const isActive = pathname === item.href
          const isCredit = item.href === "/credit"

          if (isCredit) {
            return (
              <button
                key={item.name}
                onClick={openCreditModal}
                className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-all duration-300 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-gray-800/80`}
              >
                <item.icon className={`h-6 w-6 mb-1 transition-all duration-300 text-slate-600 dark:text-gray-400`} />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-all duration-300 rounded-xl ${
                isActive
                  ? "text-white bg-slate-900 dark:bg-gray-700 shadow-lg shadow-slate-900/25 dark:shadow-black/60 transform scale-105"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-gray-800/80"
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 transition-all duration-300 ${isActive ? "text-white" : "text-slate-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
