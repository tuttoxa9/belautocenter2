'use client'

import React from 'react'

interface YandexMapProps {
  address?: string
  className?: string
}

export default function YandexMap({ address, className }: YandexMapProps) {
  // Простая заглушка для карты с адресом
  return (
    <div className={`${className} bg-slate-100 flex items-center justify-center border border-slate-200`}>
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-slate-600 text-sm font-medium">Карта</p>
        {address && (
          <p className="text-slate-500 text-xs mt-2">{address}</p>
        )}
      </div>
    </div>
  )
}
