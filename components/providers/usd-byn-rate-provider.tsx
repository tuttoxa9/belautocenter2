"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUsdBynRate } from "@/lib/utils";

const UsdBynRateContext = createContext<number | null>(null);

export const useUsdBynRate = () => useContext(UsdBynRateContext);

export function UsdBynRateProvider({ children }: { children: React.ReactNode }) {
  const [usdBynRate, setUsdBynRate] = useState<number | null>(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const rate = await fetchUsdBynRate();
        setUsdBynRate(rate);
      } catch (error) {
        console.error('Failed to fetch USD/BYN rate:', error);
        setUsdBynRate(null);
      }
    };
    loadRate();
  }, []);

  return (
    <UsdBynRateContext.Provider value={usdBynRate}>
      {children}
    </UsdBynRateContext.Provider>
  );
}
