export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  driveTrain: string;
  engineVolume?: number;
  bodyType?: string;
  color?: string;
  description?: string;
  imageUrls?: string[];
  isAvailable?: boolean;
  features?: string[];
  specifications?: Record<string, string>;
  tiktok_url?: string;
  youtube_url?: string;
  createdAt?: {
    seconds: number;
  };
}