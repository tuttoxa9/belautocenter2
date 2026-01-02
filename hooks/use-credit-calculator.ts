import { useMemo } from 'react';
import { useFinanceData, PartnerBank } from '@/hooks/use-finance-data';
import { useUsdBynRate } from '@/components/providers/usd-byn-rate-provider';

export function useCreditCalculator(priceUsd: number) {
  const { banks, loading: banksLoading } = useFinanceData();
  const usdBynRate = useUsdBynRate();

  const calculation = useMemo(() => {
    if (banksLoading || !usdBynRate || !banks.length || !priceUsd) {
      return null;
    }

    // 1. Find the best bank (lowest rate)
    const bestBank = banks.reduce((prev, current) => {
        const prevRate = prev.minRate ?? prev.rate;
        const currRate = current.minRate ?? current.rate;
        return (prevRate < currRate) ? prev : current;
    });

    const ratePercent = bestBank.minRate ?? bestBank.rate;
    const termMonths = bestBank.maxLoanTerm ?? bestBank.maxTerm ?? 120; // Default to 120 if missing

    // 2. Calculate Price in BYN
    const priceByn = priceUsd * usdBynRate;

    // 3. Calculate Annuity Payment
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
      bankName: bestBank.name,
      rate: ratePercent,
      termMonths,
      priceByn: Math.round(priceByn)
    };

  }, [banks, banksLoading, usdBynRate, priceUsd]);

  return {
    ...calculation,
    loading: banksLoading || !usdBynRate
  };
}
