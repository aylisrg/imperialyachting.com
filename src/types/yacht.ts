export interface YachtSpec {
  label: string;
  value: string;
}

export interface YachtAmenity {
  icon: string;
  label: string;
}

export interface SeasonPricing {
  season: string;
  period: string;
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
  dailyB2B?: number | null;
  weeklyB2B?: number | null;
  monthlyB2B?: number | null;
}

export interface Yacht {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  builder: string;
  year: number;
  refit?: number;
  length: { feet: number; meters: number };
  beam?: { feet: number; meters: number };
  capacity: number;
  cabins?: number;
  location: string;
  images: string[];
  heroImage: string;
  specs: YachtSpec[];
  amenities: YachtAmenity[];
  pricing: SeasonPricing[];
  included: string[];
  featured: boolean;
}
