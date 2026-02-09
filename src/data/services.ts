import { ServiceItem } from "@/types/common";

export const services: ServiceItem[] = [
  {
    title: "Yacht Charter",
    description:
      "Day, weekly, and monthly luxury yacht charters with professional crew. All-inclusive packages on our owned fleet of premium motor yachts.",
    icon: "ship",
    href: "/services/charter",
  },
  {
    title: "Yacht Management",
    description:
      "Comprehensive fleet management for yacht owners — from charter revenue optimization and crew management to maintenance and accounting.",
    icon: "settings",
    href: "/services/yacht-management",
  },
  {
    title: "Cinematography",
    description:
      "Professional yacht-based film production, drone footage, and content creation for brands, events, and social media through our Cinematographic Bureau.",
    icon: "video",
    href: "/services/cinematography",
  },
  {
    title: "Brandwave",
    description:
      "Full-service yacht branding and marketing — brand identity, yacht wrapping, digital campaigns, and luxury brand positioning.",
    icon: "palette",
    href: "/services/brandwave",
  },
];

export const charterTypes = [
  {
    title: "Day Charter",
    duration: "4-8 hours",
    description:
      "Perfect for sunset cruises, birthday celebrations, proposals, and sightseeing along Dubai's coastline.",
    priceFrom: "AED 12,000",
  },
  {
    title: "Weekly Charter",
    duration: "7 days",
    description:
      "Extended exploration of Dubai's waters with the flexibility to cruise further including Abu Dhabi coast.",
    priceFrom: "AED 18,000",
  },
  {
    title: "Monthly Charter",
    duration: "30 days",
    description:
      "Long-term yacht access for residents, seasonal visitors, or businesses seeking ongoing entertainment.",
    priceFrom: "AED 45,000",
  },
  {
    title: "Corporate Events",
    duration: "Custom",
    description:
      "Bespoke yacht experiences for team building, client entertainment, product launches, and executive retreats.",
    priceFrom: "Custom quote",
  },
];
