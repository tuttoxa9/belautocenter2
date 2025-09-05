export interface CreditPageSettings {
  title: string;
  subtitle: string;
  description: string;
  benefits: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  partners: Array<{
    name: string;
    logoUrl: string;
    minRate: number;
    maxTerm: number;
  }>;
}
