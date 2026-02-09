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

export interface Destination {
  slug: string;
  name: string;
  description: string;
  sailingTime: string;
  bestFor: string[];
  image: string;
  highlights: string[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  href: string;
}
