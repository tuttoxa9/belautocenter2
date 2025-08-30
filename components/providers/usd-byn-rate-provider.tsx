"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UsdBynRateContext = createContext<number | null>(null);

export const useUsdBynRate = () => useContext(UsdBynRateContext);

// Глобальный кэш курса валют
let globalRate: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 час

async function fetchRateWithCache(): Promise<number | null> {
  const now = Date.now();

  // Если курс уже кэширован и актуален
  if (globalRate && (now - lastFetchTime) < CACHE_DURATION) {
    return globalRate;
  }

  try {
    // Получаем курс напрямую от НБ РБ
    const res = await fetch('https://api.nbrb.by/exrates/rates/431', {
      headers: {
        'User-Agent': 'AutoBelCenter/1.0'
      }
    });

    if (!res.ok) return globalRate; // Возвращаем старый курс если не удалось обновить

    const data = await res.json();
    const newRate = data.Cur_OfficialRate ?? null;

    if (newRate) {
      globalRate = newRate;
      lastFetchTime = now;

      // Сохраняем в localStorage для персистентности
      if (typeof window !== 'undefined') {
        localStorage.setItem('usd-byn-rate', JSON.stringify({
          rate: newRate,
          timestamp: now
        }));
      }
    }

    return newRate;
  } catch (error) {
    console.error('Failed to fetch USD/BYN rate:', error);
    return globalRate; // Возвращаем старый курс при ошибке
  }
}

export function UsdBynRateProvider({ children }: { children: React.ReactNode }) {
  const [usdBynRate, setUsdBynRate] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRate = async () => {
      // Сначала пробуем загрузить из localStorage
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('usd-byn-rate');
          if (cached) {
            const { rate, timestamp } = JSON.parse(cached);
            const now = Date.now();

            // Если кэш актуален (младше 1 часа)
            if ((now - timestamp) < CACHE_DURATION) {
              globalRate = rate;
              lastFetchTime = timestamp;
              if (isMounted) {
                setUsdBynRate(rate);
              }
              return; // Не делаем запрос к API
            }
          }
        } catch (e) {
          // Игнорируем ошибки localStorage
        }
      }

      // Если нет актуального кэша - загружаем с сервера
      try {
        const rate = await fetchRateWithCache();
        if (isMounted) {
          setUsdBynRate(rate);
        }
      } catch (error) {
        console.error('Failed to fetch USD/BYN rate:', error);
        if (isMounted) {
          setUsdBynRate(null);
        }
      }
    };

    loadRate();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UsdBynRateContext.Provider value={usdBynRate}>
      {children}
    </UsdBynRateContext.Provider>
  );
}
