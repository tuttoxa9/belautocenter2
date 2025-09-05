import { Car } from './car';

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface HomePageData {
    cars: Car[];
    settings: HomepageSettings;
}
