export interface LeasingPageSettings {
  title: string;
  subtitle: string;
  description: string;
  benefits: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  leasingCompanies: Array<{
    name: string;
    logoUrl: string;
    minAdvance: number;
    maxTerm: number;
  }>;
}
