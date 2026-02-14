"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type ApplicationType = "credit" | "leasing"

interface CreditLeasingModalContextType {
  isOpen: boolean
  type: ApplicationType
  openModal: (type: ApplicationType) => void
  closeModal: () => void
}

const CreditLeasingModalContext = createContext<CreditLeasingModalContextType | undefined>(undefined)

export function CreditLeasingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<ApplicationType>("credit")

  const openModal = (newType: ApplicationType) => {
    setType(newType)
    setIsOpen(true)
  }
  const closeModal = () => setIsOpen(false)

  return (
    <CreditLeasingModalContext.Provider value={{ isOpen, type, openModal, closeModal }}>
      {children}
    </CreditLeasingModalContext.Provider>
  )
}

export function useCreditLeasingModal() {
  const context = useContext(CreditLeasingModalContext)
  if (context === undefined) {
    throw new Error("useCreditLeasingModal must be used within a CreditLeasingModalProvider")
  }
  return context
}
