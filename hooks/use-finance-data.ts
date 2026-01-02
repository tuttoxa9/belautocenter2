import { useState, useEffect } from 'react';
import { parseFirestoreDoc } from '@/lib/firestore-parser';

export interface PartnerBank {
  id: number;
  name: string;
  logo: string;
  rate: number;
  minRate?: number;
  minDownPayment: number;
  maxTerm: number;
  maxLoanTerm?: number;
  features: string[];
  color: string;
  logoUrl?: string;
}

interface CreditPageData {
  partners: PartnerBank[];
}

let financeCache: {
  banks?: PartnerBank[];
  lastLoadTime?: number;
} = {};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useFinanceData() {
  const [banks, setBanks] = useState<PartnerBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const now = Date.now();

      // Check cache first
      if (financeCache.lastLoadTime && (now - financeCache.lastLoadTime) < CACHE_DURATION && financeCache.banks) {
        setBanks(financeCache.banks);
        setLoading(false);
        return;
      }

      try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
        const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages`;

        const response = await fetch(`${baseUrl}/credit`);
        if (!response.ok) throw new Error('Failed to fetch credit data');

        const rawData = await response.json();
        const creditPageData = parseFirestoreDoc(rawData) as CreditPageData;
        const partners = creditPageData.partners || [];

        financeCache = {
          banks: partners,
          lastLoadTime: now
        };

        setBanks(partners);
      } catch (err) {
        console.error("Error loading finance data:", err);
        setError("Не удалось загрузить данные банков");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { banks, loading, error };
}
