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
    externalUrl: "https://brandwave.imperialyachting.com/",
  },
];
