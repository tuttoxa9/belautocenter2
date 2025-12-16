"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";

const UsdBynRateContext = createContext<number | null>(null);

export const useUsdBynRate = () => useContext(UsdBynRateContext);

let globalRate: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 час

async function fetchNbrbRate(): Promise<number | null> {
  const now = Date.now();
  if (globalRate && (now - lastFetchTime) < CACHE_DURATION) {
    return globalRate;
  }

  try {
    const res = await fetch('https://api.nbrb.by/exrates/rates/431', {
      headers: { 'User-Agent': 'AutoBelCenter/1.0' }
    });
    if (!res.ok) return globalRate;
    const data = await res.json();
    const newRate = data.Cur_OfficialRate ?? null;
    if (newRate) {
      globalRate = newRate;
      lastFetchTime = now;
      if (typeof window !== 'undefined') {
        localStorage.setItem('usd-byn-rate', JSON.stringify({ rate: newRate, timestamp: now }));
      }
    }
    return newRate;
  } catch (error) {
    return globalRate;
  }
}

export function UsdBynRateProvider({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSettings();
  const [usdBynRate, setUsdBynRate] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRate = async () => {
      if (settingsLoading) return; // Ждем загрузки настроек

      if (settings?.finance.rateSource === 'custom') {
        setUsdBynRate(settings.finance.customRate);
        return;
      }

      // Логика для курса НБРБ с кэшированием
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('usd-byn-rate');
          if (cached) {
            const { rate, timestamp } = JSON.parse(cached);
            if ((Date.now() - timestamp) < CACHE_DURATION) {
              globalRate = rate;
              lastFetchTime = timestamp;
              if (isMounted) setUsdBynRate(rate);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to parse cached rate", e);
        }
      }

      const rate = await fetchNbrbRate();
      if (isMounted) {
        setUsdBynRate(rate);
      }
    };

    loadRate();

    return () => {
      isMounted = false;
    };
  }, [settings, settingsLoading]);

  return (
    <UsdBynRateContext.Provider value={usdBynRate}>
      {children}
    </UsdBynRateContext.Provider>
  );
}
