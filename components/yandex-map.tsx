'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSettings } from '@/hooks/use-settings'

interface YandexMapProps {
  address?: string
  className?: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function YandexMap({ address, className }: YandexMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const { settings, loading } = useSettings()

  useEffect(() => {
    if (loading || !settings?.main?.yandexMapsApiKey || !address) {
      return
    }

    // Если API ключ не задан, показываем заглушку
    if (!settings.main.yandexMapsApiKey.trim()) {
      setMapError(true)
      return
    }

    // Загружаем Яндекс.Карты API
    const loadYandexMaps = () => {
      if (window.ymaps) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${settings.main.yandexMapsApiKey}&lang=ru_RU`
      script.onload = () => {
        window.ymaps.ready(initMap)
      }
      script.onerror = () => {
        console.error('Ошибка загрузки Яндекс.Карт')
        setMapError(true)
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!mapContainer.current) return

      try {
        // Геокодирование адреса
        window.ymaps.geocode(address).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0)
          const coords = firstGeoObject.geometry.getCoordinates()

          // Создание карты
          const map = new window.ymaps.Map(mapContainer.current, {
            center: coords,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
          })

          // Добавление метки
          const placemark = new window.ymaps.Placemark(coords, {
            balloonContent: address,
            hintContent: address
          }, {
            preset: 'islands#redIcon'
          })

          map.geoObjects.add(placemark)
          setMapLoaded(true)
        }).catch((error: any) => {
          console.error('Ошибка геокодирования:', error)
          setMapError(true)
        })
      } catch (error) {
        console.error('Ошибка инициализации карты:', error)
        setMapError(true)
      }
    }

    loadYandexMaps()
  }, [address, settings, loading])

  // Заглушка карты
  const MapPlaceholder = () => (
    <div className={`${className} bg-slate-100 flex items-center justify-center border border-slate-200`}>
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-slate-600 text-sm font-medium">
          {loading ? 'Загрузка карты...' :
           mapError ? 'Карта недоступна' :
           !settings?.main?.yandexMapsApiKey ? 'Настройте API ключ в админке' : 'Карта'}
        </p>
        {address && (
          <p className="text-slate-500 text-xs mt-2">{address}</p>
        )}
      </div>
    </div>
  )

  if (loading || mapError || !settings?.main?.yandexMapsApiKey?.trim() || !address) {
    return <MapPlaceholder />
  }

  return (
    <div className={className}>
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[200px]"
        style={{ display: mapLoaded ? 'block' : 'none' }}
      />
      {!mapLoaded && <MapPlaceholder />}
    </div>
  )
}
