import { useMemo } from 'react';
import { useUsdBynRate } from '@/components/providers/usd-byn-rate-provider';

export function useCreditCalculator(priceUsd: number) {
  const usdBynRate = useUsdBynRate();

  const calculation = useMemo(() => {
    if (!usdBynRate || !priceUsd) {
      return null;
    }

    // Hardcoded values as per request
    const ratePercent = 19;
    const termMonths = 120;

    // Calculate Price in BYN
    const priceByn = priceUsd * usdBynRate;

    // Calculate Annuity Payment
    // Formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // where r is monthly rate (annual / 12 / 100)

    const monthlyRate = ratePercent / 12 / 100;

    let monthlyPayment = 0;

    if (monthlyRate === 0) {
        monthlyPayment = priceByn / termMonths;
    } else {
        const factor = Math.pow(1 + monthlyRate, termMonths);
        monthlyPayment = priceByn * (monthlyRate * factor) / (factor - 1);
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      rate: ratePercent,
      termMonths,
      priceByn: Math.round(priceByn)
    };

  }, [usdBynRate, priceUsd]);

  return {
    ...calculation,
    loading: !usdBynRate
  };
}
