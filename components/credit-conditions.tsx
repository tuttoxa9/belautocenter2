"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Percent, Clock, Building, CreditCard, CheckCircle, DollarSign, FileText, Users, Zap, Award, Target, Briefcase, TrendingUp, Handshake, CheckSquare, Coins, Timer, Shield, TrendingDown, Heart } from "lucide-react"

interface CreditCondition {
  id: string
  condition: string
  icon: string
  isActive: boolean
  order: number
  createdAt: Date
}

export default function CreditConditions() {
  const [conditions, setConditions] = useState<CreditCondition[]>([])
  const [loading, setLoading] = useState(true)

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "percent":
        return Percent
      case "clock":
        return Clock
      case "building":
        return Building
      case "creditcard":
        return CreditCard
      case "checkcircle":
        return CheckCircle
      case "dollar-sign":
        return DollarSign
      case "file-text":
        return FileText
      case "users":
        return Users
      case "zap":
        return Zap
      case "award":
        return Award
      case "target":
        return Target
      case "briefcase":
        return Briefcase
      case "trending-up":
        return TrendingUp
      case "handshake":
        return Handshake
      case "check-square":
        return CheckSquare
      case "coins":
        return Coins
      case "timer":
        return Timer
      case "heart":
        return Heart
      case "shield":
        return Shield
      case "trending-down":
        return TrendingDown
      default:
        return Percent
    }
  }

  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    try {
      const docRef = doc(db, "settings", "credit-conditions")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.conditions && Array.isArray(data.conditions)) {
          const activeConditions = data.conditions
            .filter((condition: CreditCondition) => condition.isActive)
            .sort((a: CreditCondition, b: CreditCondition) => a.order - b.order)
          setConditions(activeConditions)
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки условий кредита:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 md:space-y-4">
        <div>
          <div className="w-36 h-5 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="w-48 h-3 bg-slate-200 rounded animate-pulse mb-3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="w-3/4 h-3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!conditions.length) {
    return null
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <div>
        <h2 className="text-base md:text-xl font-semibold text-slate-900 mb-1 md:mb-2">Условия кредитования</h2>
        <p className="text-slate-600 text-xs md:text-sm">
          Основные условия получения автокредита
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {conditions.map((condition) => (
          <div
            key={condition.id}
            className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-slate-50 rounded-md md:rounded-xl hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="w-5 h-5 md:w-8 md:h-8 bg-slate-200 rounded-md md:rounded-xl flex items-center justify-center flex-shrink-0">
              {(() => {
                const IconComponent = getIcon(condition.icon)
                return <IconComponent className="h-3 w-3 md:h-4 md:w-4 text-slate-700" />
              })()}
            </div>
            <p className="text-slate-700 text-xs md:text-sm leading-relaxed flex-1">
              {condition.condition}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-md md:rounded-xl p-2 md:p-4 border border-slate-200">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-slate-700" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-xs md:text-sm mb-0.5 md:mb-1">Индивидуальный подход</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Каждая заявка рассматривается индивидуально для поиска оптимального решения
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
