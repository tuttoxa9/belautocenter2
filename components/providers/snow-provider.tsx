"use client"

import React, { createContext, useContext, useState, useMemo, useEffect } from "react"

interface SnowContextType {
  isSnowing: boolean
  toggleSnow: () => void
}

const SnowContext = createContext<SnowContextType | undefined>(undefined)

export const SnowProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSnowing, setIsSnowing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSnowing(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const toggleSnow = () => {
    setIsSnowing((prev) => !prev)
  }

  const value = useMemo(() => ({ isSnowing, toggleSnow }), [isSnowing])

  return <SnowContext.Provider value={value}>{children}</SnowContext.Provider>
}

export const useSnow = () => {
  const context = useContext(SnowContext)
  if (context === undefined) {
    throw new Error("useSnow must be used within a SnowProvider")
  }
  return context
}
