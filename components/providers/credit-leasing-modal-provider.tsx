"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface CreditLeasingModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const CreditLeasingModalContext = createContext<CreditLeasingModalContextType | undefined>(undefined)

export function CreditLeasingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <CreditLeasingModalContext.Provider value={{ isOpen, openModal, closeModal }}>
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
