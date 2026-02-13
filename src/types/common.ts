export interface FAQItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  text: string;
  rating: number;
  date: string;
}

export type DestinationCategory = "destination" | "experience" | "activity";

export interface Destination {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  sailingTime: string;
  bestFor: string[];
  image: string;
  coverImage: string;
  galleryImages: string[];
  highlights: string[];
  category: DestinationCategory;
  duration: string;
  priceFrom: number | null;
  latitude: number | null;
  longitude: number | null;
  mapLabel: string;
  videoUrl: string;
  featured: boolean;
  whatIncluded: string[];
  itinerary: string[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  href: string;
}
