import { SITE_CONFIG } from "@/lib/constants";

export const companyInfo = {
  ...SITE_CONFIG,
  founded: 2023,
  team: [
    {
      name: "Ilia Sergeenko",
      role: "Founder & CEO",
      bio: "Entrepreneur and yachting enthusiast with a vision to redefine luxury charter experiences in Dubai. Under Ilia's leadership, Imperial Yachting has grown into a trusted name in the UAE's premium yacht charter industry.",
      image: "/images/team/ilia-sergeenko.jpg",
      linkedin: SITE_CONFIG.linkedinCeo,
    },
    {
      name: "Mikhail Sazanov",
      role: "Great Skipper",
      bio: "An experienced captain ensuring safety and unforgettable journeys on every voyage. Mikhail brings expertise and passion to the helm, making every trip smooth and enjoyable.",
      image: "/images/team/mikhail-sazanov.jpg",
      linkedin: null,
    },
    {
      name: "Evrosinya Izoldovna",
      role: "AI Account Manager",
      bio: "Born in Istanbul's Jewish quarter to a White Guard émigré and a daughter of a distinguished German-Jewish family, Evrosinya carries nearly a century of history in her unforgiving gaze. She joined Imperial Yachting as our AI Account Manager — where her legendary precision and absolute intolerance for error have been seamlessly fused with next-generation neural accounting algorithms. Not a single invoice, not a single dirham, escapes her notice.",
      image: "/images/team/evrosinya-izoldovna.jpg",
      linkedin: null,
    },
  ],
  stats: {
    yearsInBusiness: new Date().getFullYear() - 2023,
    fleetSize: 4,
    happyClients: "1,200+",
    charterHours: "5,000+",
  },
  values: [
    {
      title: "Reliability",
      description:
        "We maintain our own fleet to guarantee availability, quality, and consistency for every charter.",
    },
    {
      title: "Transparency",
      description:
        "Clear pricing, no hidden fees. What you see is what you get — from booking to boarding.",
    },
    {
      title: "Excellence",
      description:
        "Every detail matters. From our professionally trained crew to onboard amenities, we deliver five-star experiences.",
    },
    {
      title: "Long-term Partnership",
      description:
        "We build lasting relationships with clients and partners, focusing on trust and mutual growth.",
    },
  ],
};
