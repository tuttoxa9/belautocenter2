"use client"

import { Car, Calendar, DollarSign, CheckCircle, Clock, CreditCard, Shield, Users, FileText } from "lucide-react"

export default function LeasingConditions() {
  const conditions = [
    {
      icon: "car",
      title: "Возраст автомобиля",
      description: "Автомобили от 2000 года выпуска"
    },
    {
      icon: "calendar",
      title: "Срок лизинга",
      description: "Срок лизинга до 10 лет"
    },
    {
      icon: "dollar-sign",
      title: "Валюта договора",
      description: "Валюта: USD, EUR"
    },
    {
      icon: "check-circle",
      title: "Досрочное погашение",
      description: "Досрочное погашение после 6 месяцев без штрафных санкций"
    }
  ]

  const additionalNote = "Все дополнительные вопросы обсуждаемы с каждым клиентом индивидуально"

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "car":
        return Car
      case "calendar":
        return Calendar
      case "dollar-sign":
        return DollarSign
      case "check-circle":
        return CheckCircle
      case "clock":
        return Clock
      case "credit-card":
        return CreditCard
      case "shield":
        return Shield
      case "users":
        return Users
      case "file-text":
        return FileText
      default:
        return CheckCircle
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 md:mb-3">Условия лизинга</h4>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 md:mb-4">
          Основные условия получения автомобиля в лизинг
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {conditions.map((condition, index) => {
          const IconComponent = getIcon(condition.icon)
          return (
            <div
              key={index}
              className="flex items-start space-x-3 p-2 md:p-3 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700 hover:border-slate-200 dark:hover:border-zinc-600 hover:bg-slate-50/30 dark:hover:bg-zinc-700/50 transition-all duration-200"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconComponent className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm mb-1">{condition.title}</h5>
                <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                  {condition.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {additionalNote && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 md:p-4 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="h-2 w-2 md:h-3 md:w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h6 className="font-semibold text-slate-900 dark:text-slate-100 text-xs md:text-sm mb-1">Индивидуальный подход</h6>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                {additionalNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
