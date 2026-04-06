"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error'

interface SubmissionContextType {
  submitForm: (
    action: () => Promise<void>,
    onCloseCurrentModal?: () => void
  ) => Promise<void>
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined)

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<SubmissionStatus>('idle')

  const submitForm = async (action: () => Promise<void>, onCloseCurrentModal?: () => void) => {
    // Если уже идет отправка, игнорируем
    if (isOpen) return

    setIsOpen(true)
    setStatus('loading')

    // Закрываем предыдущее окно сразу
    if (onCloseCurrentModal) {
      onCloseCurrentModal()
    }

    try {
      // Запускаем действие и таймер минимум 1.8 секунд параллельно
      await Promise.all([
        action(),
        new Promise(resolve => setTimeout(resolve, 1800))
      ])

      setStatus('success')

      // Ждем 2 секунды перед закрытием модалки успеха
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Submission error:", error)
      setStatus('error')

      // Ждем 2 секунды перед закрытием модалки ошибки
      await new Promise(resolve => setTimeout(resolve, 2000))
    } finally {
      setIsOpen(false)
      setTimeout(() => setStatus('idle'), 300) // Даем время на анимацию скрытия
    }
  }

  return (
    <SubmissionContext.Provider value={{ submitForm }}>
      {children}
      <SubmissionModal isOpen={isOpen} status={status} />
    </SubmissionContext.Provider>
  )
}

export const useSubmission = () => {
  const context = useContext(SubmissionContext)
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider')
  }
  return context
}

// Meta-style Submission Modal
function SubmissionModal({ isOpen, status }: { isOpen: boolean, status: SubmissionStatus }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-32 h-32 bg-white dark:bg-[#1c1e21] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative overflow-hidden"
          >
            {status === 'loading' && (
              <svg className="w-10 h-10 animate-spin text-[#0064e0] dark:text-[#2374e1]" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90 150"
                  className="opacity-20"
                />
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90 150"
                  strokeDashoffset="0"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-12 h-12 bg-[#00a400] rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-12 h-12 bg-[#fa383e] rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
