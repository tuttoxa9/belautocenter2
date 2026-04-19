"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PremiumLoaderProps {
  isVisible: boolean
  text?: string
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ 
  isVisible, 
  text = "Загрузка..." 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-xl"
        >
          <div className="relative">
            {/* Pulsing ring */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 -m-4 rounded-full border-4 border-blue-500/30 blur-sm"
            />
            
            {/* Main animation */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 rounded-2xl border-t-2 border-r-2 border-blue-600 shadow-lg shadow-blue-500/20"
              />
              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-10 h-10 rounded-xl border-b-2 border-l-2 border-emerald-500 opacity-70"
              />
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              БЕЛАВТО ЦЕНТР
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-80 animate-pulse">
              {text}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
