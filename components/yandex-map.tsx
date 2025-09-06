'use client'

import React, { useEffect, useState } from 'react'
import { YMaps, Map, Placemark, useYMaps } from '@pbe/react-yandex-maps'
import { useSettings } from '@/hooks/use-settings'

interface YandexMapProps {
  address?: string
  className?: string
}

const MapPlaceholder = ({ className, address, loading, mapError, apiKeyMissing }: { className?: string, address?: string, loading: boolean, mapError: boolean, apiKeyMissing: boolean }) => (
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
         mapError ? 'Не удалось определить адрес' :
         apiKeyMissing ? 'Настройте API ключ в админке' : 'Карта'}
      </p>
      {address && (
        <p className="text-slate-500 text-xs mt-2">{address}</p>
      )}
    </div>
  </div>
);


const GeocodedMap = ({ address, className }: YandexMapProps) => {
  const ymaps = useYMaps()
  const [coordinates, setCoordinates] = useState<number[] | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ymaps && address) {
      setLoading(true);
      (ymaps as any).load(['package.geocode']).then(() => {
        (ymaps as any).geocode(address)
          .then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0)
            if (firstGeoObject) {
              setCoordinates(firstGeoObject.geometry.getCoordinates())
            } else {
              setError(true)
            }
          })
          .catch((err: any) => {
            console.error('Ошибка геокодирования:', err)
            setError(true)
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((err: any) => {
        console.error('Ошибка загрузки модуля гекодирования:', err);
        setError(true);
        setLoading(false);
      });
    }
  }, [ymaps, address])

  if (loading) {
    return <MapPlaceholder className={className} address={address} loading={true} mapError={false} apiKeyMissing={false} />;
  }

  if (error || !coordinates) {
    return <MapPlaceholder className={className} address={address} loading={false} mapError={true} apiKeyMissing={false} />;
  }

  return (
    <Map
      defaultState={{
        center: coordinates,
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl'],
      }}
      className="w-full h-full min-h-[200px]"
    >
      <Placemark
        geometry={coordinates}
        properties={{
          balloonContent: address,
          hintContent: address,
        }}
        options={{
          preset: 'islands#redIcon',
        }}
      />
    </Map>
  )
}

export default function YandexMap({ address, className }: YandexMapProps) {
  const { settings, loading: settingsLoading } = useSettings()
  const apiKey = settings?.main?.yandexMapsApiKey

  if (settingsLoading) {
    return <MapPlaceholder className={className} address={address} loading={true} mapError={false} apiKeyMissing={false} />;
  }

  if (!apiKey || !apiKey.trim()) {
    return <MapPlaceholder className={className} address={address} loading={false} mapError={false} apiKeyMissing={true} />;
  }

  if (!address) {
    // Or some other placeholder if address is not available
    return <MapPlaceholder className={className} address="Адрес не указан" loading={false} mapError={true} apiKeyMissing={false} />;
  }

  return (
    <div className={className}>
      <YMaps query={{ apikey: apiKey, lang: 'ru_RU' }}>
        <GeocodedMap address={address} className="w-full h-full min-h-[200px]" />
      </YMaps>
    </div>
  )
}
