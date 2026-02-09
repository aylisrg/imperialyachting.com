import { Destination } from "@/types/common";

export const destinations: Destination[] = [
  {
    slug: "dubai-harbour",
    name: "Dubai Harbour",
    description:
      "Our home base and one of Dubai's most prestigious marinas. Dubai Harbour is a world-class waterfront destination nestled between Palm Jumeirah and Bluewaters Island, offering stunning views of Ain Dubai and the city skyline.",
    sailingTime: "Departure point",
    bestFor: ["Departure", "Dining", "Marina walks"],
    image: "/media/destinations/dubai-harbour.jpg",
    highlights: [
      "Home berth for Imperial Yachting fleet",
      "Premium dining and retail",
      "Views of Ain Dubai",
      "Easy parking and access",
    ],
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    description:
      "Cruise around the iconic Palm Jumeirah, the world's largest man-made island. See the Atlantis The Royal, luxurious beachfront villas, and the stunning fronds from a perspective most people never experience.",
    sailingTime: "15-30 min from Dubai Harbour",
    bestFor: ["Sightseeing", "Photography", "Sunset cruise"],
    image: "/media/destinations/palm-jumeirah.jpg",
    highlights: [
      "Atlantis The Royal views",
      "Celebrity villa coastline",
      "Crystal clear swimming spots",
      "Iconic sunset backdrop",
    ],
  },
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    description:
      "Navigate through the stunning Dubai Marina canal surrounded by towering skyscrapers. The marina skyline at sunset is one of Dubai's most photographed vistas and an unforgettable experience from the water.",
    sailingTime: "10-20 min from Dubai Harbour",
    bestFor: ["Skyline views", "Photography", "Evening cruise"],
    image: "/media/destinations/dubai-marina.jpg",
    highlights: [
      "Iconic skyline backdrop",
      "Marina canal cruising",
      "JBR beach views",
      "Waterfront dining stops",
    ],
  },
  {
    slug: "world-islands",
    name: "The World Islands",
    description:
      "Venture to The World Islands, a collection of 300 man-made islands shaped like a world map. This exclusive destination offers pristine waters for swimming and snorkeling away from the city's bustle.",
    sailingTime: "45-60 min from Dubai Harbour",
    bestFor: ["Swimming", "Snorkeling", "Day trip", "Privacy"],
    image: "/media/destinations/world-islands.jpg",
    highlights: [
      "Crystal clear waters",
      "Exclusive island beaches",
      "Snorkeling opportunities",
      "Aerial photography spot",
    ],
  },
  {
    slug: "ain-dubai",
    name: "Ain Dubai & Bluewaters",
    description:
      "Sail past Ain Dubai, the world's largest observation wheel, standing 250 meters tall on Bluewaters Island. The views are spectacular both day and night when the wheel is illuminated.",
    sailingTime: "5-10 min from Dubai Harbour",
    bestFor: ["Photography", "Quick cruise", "Night views"],
    image: "/media/destinations/ain-dubai.jpg",
    highlights: [
      "World's largest observation wheel",
      "Bluewaters Island views",
      "Night illumination spectacle",
      "Close to departure point",
    ],
  },
];
