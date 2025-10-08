import { parseFirestoreDoc } from './firestore-parser';
import type { Car } from '@/types/car';

// Define types for partners for clarity.
// This ensures data consistency.
export interface PartnerBank {
  id: number;
  name: string;
  logo: string;
  rate: number;
  minDownPayment: number;
  maxTerm: number;
  features: string[];
  color: string;
}

export interface LeasingCompany {
  name: string;
  logoUrl?: string;
  minAdvance: number;
  maxTerm: number;
  interestRate?: number;
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

/**
 * Generic helper to fetch a collection from Firestore.
 * Used exclusively on the server.
 */
async function getCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const response = await fetch(`${firestoreBaseUrl}/${collectionName}`, {
      headers: { 'User-Agent': 'NextJS-Server-Build/1.0' },
      // Use Next.js extended fetch for caching. Revalidate every hour.
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Firestore API error for collection ${collectionName}: ${response.statusText}`);
      return [];
    }

    const rawData = await response.json();
    if (!rawData.documents) {
      return [];
    }
    return rawData.documents.map((doc: any) => parseFirestoreDoc(doc));
  } catch (error) {
    console.error(`Error in getCollection for ${collectionName}:`, error);
    return [];
  }
}

/**
 * Generic helper to fetch a single document from Firestore.
 * Used exclusively on the server.
 */
async function getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
  try {
    const response = await fetch(`${firestoreBaseUrl}/${collectionName}/${documentId}`, {
       headers: { 'User-Agent': 'NextJS-Server-Build/1.0' },
       next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status !== 404) {
         console.error(`Firestore API error for doc ${collectionName}/${documentId}: ${response.statusText}`);
      }
      return null;
    }

    const rawData = await response.json();
    return parseFirestoreDoc(rawData) as T;
  } catch (error)
  {
    console.error(`Error in getDocument for ${collectionName}/${documentId}:`, error);
    return null;
  }
}

// --- Specific data-fetching functions for the application ---

export const getAllCars = () => getCollection<Car>('cars');

export const getCarById = (id: string) => getDocument<Car>('cars', id);

export async function getFinancialPartners(): Promise<{ banks: PartnerBank[], leasingCompanies: LeasingCompany[] }> {
    const creditPageData = await getDocument<any>('pages', 'credit');
    const leasingPageData = await getDocument<any>('pages', 'leasing');

    const banks = creditPageData?.partners || [];
    const leasingCompanies = leasingPageData?.leasingCompanies || leasingPageData?.partners || [];

    return { banks, leasingCompanies };
}