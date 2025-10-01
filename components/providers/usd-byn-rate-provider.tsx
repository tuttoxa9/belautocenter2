"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const UsdBynRateContext = createContext<number | null>(null);

export const useUsdBynRate = () => useContext(UsdBynRateContext);

export function UsdBynRateProvider({ children }: { children: React.ReactNode }) {
  const [usdBynRate, setUsdBynRate] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRate = async () => {
      try {
        // Запрашиваем курс с нашего нового серверного API
        const response = await fetch('/api/rate', {
          // Next.js автоматически кэширует fetch запросы,
          // а наш API отдает правильные заголовки Cache-Control.
          // Это заменяет всю старую логику кэширования.
          next: {
            revalidate: 300 // Кэшировать на стороне клиента на 5 минут
          }
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setUsdBynRate(data.rate);
        }
      } catch (error) {
        console.error('Failed to fetch USD/BYN rate from internal API:', error);
        if (isMounted) {
          setUsdBynRate(null); // В случае ошибки устанавливаем null
        }
      }
    };

    loadRate();

    return () => {
      isMounted = false;
    };
  }, []); // Пустой массив зависимостей, чтобы выполнилось один раз при монтировании

  return (
    <UsdBynRateContext.Provider value={usdBynRate}>
      {children}
    </UsdBynRateContext.Provider>
  );
}
