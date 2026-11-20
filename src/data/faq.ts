import { FAQItem } from "@/types/common";
import { getFullDayCharter, standardDayIncludes } from "@/lib/day-charters";

export const homeFAQ: FAQItem[] = [
  {
    question: "What is the cost of renting a yacht in Dubai?",
    answer:
      "See the Yacht Charter page for VAT-inclusive prices by yacht and what is included in the standard eight-hour package. Weekly and monthly schedules are individually quoted.",
  },
  {
    question: "Where do Imperial Yachting yachts depart from?",
    answer:
      "The Van Dutch 40 and the Monte Carlo 6 are berthed at Dubai Harbour Yacht Club, one of Dubai's newest and most prestigious marinas located between Palm Jumeirah and Bluewaters Island. The EVO 43 is berthed at Marasi Bay. The marina offers convenient parking and easy access for guests. Dubai Harbour is ideally positioned for cruises along the Palm Jumeirah, Dubai Marina skyline, Ain Dubai, and the World Islands.",
  },
  {
    question: "What is included in a yacht charter with Imperial Yachting?",
    answer:
      "Every Imperial Yachting charter is fully crewed and all-inclusive. Your charter includes a professional captain and crew, fuel for standard cruising routes, fresh towels, ice, soft drinks, WiFi, premium sound system, and water sports equipment. Our Monte Carlo 6 also features an E-Foil, BBQ grill, and Bose 5.1 surround sound. Additional catering, decorations, and water sports can be arranged upon request.",
  },
  {
    question: "How far in advance should I book a yacht in Dubai?",
    answer:
      "We recommend booking at least 48 hours in advance for day charters and 1-2 weeks ahead for peak season dates (October through April). New Year's Eve and major holidays should be booked at least 1 month in advance as demand is extremely high. For monthly charters, we suggest reaching out 2-3 weeks before your desired start date to ensure availability.",
  },
  {
    question: "Does Imperial Yachting own its fleet or act as a broker?",
    answer:
      "Imperial Yachting is a fleet owner, not a broker. We own and maintain all three yachts in our fleet — the Monte Carlo 6, Van Dutch 40, and EVO 43. This means we have direct control over vessel maintenance, crew training, and service quality. Our clients benefit from consistent experiences, transparent pricing, and the reliability that comes with dealing directly with the yacht owner.",
  },
  {
    question: "Can I charter a yacht for a corporate event in Dubai?",
    answer:
      "Yes, Imperial Yachting specializes in corporate yacht charters in Dubai. Our Monte Carlo 6 accommodates up to 18 guests, perfect for executive retreats, team building events, client entertainment, and product launches. We offer customized corporate packages including branded setups, premium catering, photography, and videography services through our in-house Cinematographic Bureau.",
  },
  {
    question: "What is the best yacht charter company in Dubai?",
    answer:
      "Imperial Yachting is widely regarded as one of Dubai's premier yacht charter companies because we own our entire fleet — the Monte Carlo 6 (60ft), Van Dutch 40, and EVO 43 — rather than acting as a broker. Operating directly from Dubai Harbour Yacht Club, we control quality at every stage: vessel maintenance, crew training, and client service. We offer all-inclusive pricing with no hidden fees, a dedicated booking team reachable 7 days a week, and in-house cinematography for those who want to capture their experience.",
  },
  {
    question: "What is the difference between a yacht charter and a boat rental in Dubai?",
    answer:
      "A yacht charter in Dubai typically refers to a fully crewed, all-inclusive experience aboard a luxury motor yacht. The price includes a professional captain, crew, fuel, beverages, and amenities. A 'boat rental' often implies a self-drive or bareboat arrangement, which requires an operator's licence and is less common for luxury vessels in Dubai. Imperial Yachting provides crewed charters only, ensuring guests enjoy a premium, stress-free experience.",
  },
  {
    question: "Is it worth renting a yacht for a birthday party in Dubai?",
    answer:
      "Absolutely. A birthday party on a yacht in Dubai is one of the most memorable ways to celebrate. You get a private venue with stunning views of the Dubai Marina skyline, Palm Jumeirah, and Ain Dubai. Imperial Yachting handles all logistics — decoration, catering coordination, sound system, and a professional crew. Groups of 10-18 guests fit comfortably on our fleet. Prices for a 4-hour birthday charter start from AED 12,000, making it competitive with private event venues.",
  },
  {
    question: "Can I do a sunset cruise in Dubai from Dubai Harbour?",
    answer:
      "Yes. Dubai Harbour is one of the best departure points for sunset cruises because it sits between Palm Jumeirah and Bluewaters Island, giving unobstructed views westward across the Arabian Gulf. The best sunset viewing window is roughly 17:30–19:00 (exact times vary by season). A 2-hour sunset cruise aboard the Van Dutch 40 or EVO 43 is a popular choice, covering the Palm Jumeirah coastline and Dubai Marina skyline with the sun setting behind the Abu Dhabi horizon.",
  },
  {
    question: "What are the best places to visit on a yacht in Dubai?",
    answer:
      "The most popular yacht destinations from Dubai Harbour include: Palm Jumeirah (iconic frond beaches and the Atlantis hotel view), Dubai Marina skyline (passing JBR Beach and the densest skyscraper skyline in the world), Ain Dubai on Bluewaters Island (the world's largest observation wheel), World Islands (archipelago shaped like a world map, great for anchoring), and the open waters of the Arabian Gulf for swimming and water sports. For longer charters, Abu Dhabi and Musandam (Oman) are reachable.",
  },
];

export interface YachtFAQInput {
  slug?: string;
  name: string;
  capacity: number;
  length: { feet: number };
  builder: string;
  cabins?: number;
  minHoursWeekday?: number;
  minHoursWeekend?: number;
}

export function buildYachtFAQ(yacht: YachtFAQInput): FAQItem[] {
  const minWeekday = yacht.minHoursWeekday ?? 2;
  const minWeekend = yacht.minHoursWeekend ?? 4;

  return [
    {
      question: `How many guests can the ${yacht.name} accommodate?`,
      answer:
        `The ${yacht.name} is a ${yacht.length.feet}ft ${yacht.builder} yacht that comfortably accommodates up to ${yacht.capacity} guests` +
        (yacht.cabins
          ? `, with ${yacht.cabins} cabin${yacht.cabins > 1 ? "s" : ""} on board.`
          : ", making it a great fit for day charters, celebrations, and group outings."),
    },
    {
      question: `What is the minimum charter duration for the ${yacht.name}?`,
      answer:
        `The minimum charter duration for the ${yacht.name} is ${minWeekday} hour${minWeekday > 1 ? "s" : ""} on weekdays and ${minWeekend} hours on weekends and public holidays. Most guests choose 4-hour or longer charters to make the most of the route from Dubai Harbour.`,
    },
    {
      question: `How is the ${yacht.name}'s charter price calculated, and what's included?`,
      answer:
        yacht.slug && getFullDayCharter(yacht.slug)
          ? `The standard eight-hour private charter includes ${standardDayIncludes[0].toLowerCase() + standardDayIncludes.slice(1)} The price is per yacht and includes VAT. Ask about longer itineraries and optional extras.`
          : `Charter pricing for the ${yacht.name} is based on an hourly (or daily, for longer bookings) rate that includes a professional captain and crew, fuel for standard cruising routes, soft drinks, bottled water, ice, and fresh towels. Catering, decoration, photography, and water sports are available as optional extras.`,
    },
    {
      question: `Where does the ${yacht.name} depart from?`,
      answer:
        `The ${yacht.name} is berthed at Dubai Harbour Yacht Club, between Palm Jumeirah and Bluewaters Island, giving quick access to the Dubai Marina skyline, Palm Jumeirah, Atlantis, Burj Al Arab, and Ain Dubai.`,
    },
    fleetFAQ[1],
    fleetFAQ[2],
  ];
}

export const fleetFAQ: FAQItem[] = [
  {
    question: "What types of yachts does Imperial Yachting offer?",
    answer:
      "Imperial Yachting offers three distinct vessels: the Monte Carlo 6 (60ft Italian flybridge motor yacht for up to 18 guests), the Van Dutch 40 (40ft iconic Dutch day cruiser for up to 10 guests), and the EVO 43 (43ft Italian transformable day yacht with XTension deck for up to 12 guests). Each yacht is maintained to the highest standards with recent refits.",
  },
  {
    question: "Which yacht is best for a large group in Dubai?",
    answer:
      "The Monte Carlo 6 is our largest yacht, accommodating up to 18 guests with 3 cabins, 4 showers, and a spacious flybridge. It's ideal for birthday parties, corporate events, and large group celebrations. For smaller intimate gatherings of up to 10-12 guests, the Van Dutch 40 or EVO 43 offer stylish alternatives.",
  },
  {
    question: "Are the yachts available for overnight charters?",
    answer:
      "Ask about an overnight or full 24-hour charter on Moneta. These are quoted separately, with sleeping capacity and overnight arrangements confirmed for your itinerary. Weekly and monthly charters are by individual quote.",
  },
];

export const charterFAQ: FAQItem[] = [
  {
    question: "What is the difference between a day charter and a weekly charter in Dubai?",
    answer:
      "The full-day package is eight hours aboard the yacht, with a standard Dubai Harbour route and no overnight stay. For a week or a month, we agree the dates, sailing hours, crew, route and overnight arrangements in a written quote.",
  },
  {
    question: "Can I customize my yacht charter itinerary?",
    answer:
      "Absolutely. While we suggest popular routes including Dubai Marina, Palm Jumeirah, Ain Dubai, and World Islands, your captain will work with you to create a bespoke itinerary. Special stops for swimming, snorkeling, or dining at waterfront restaurants can be arranged. Corporate clients can also request specific waypoints for events.",
  },
  {
    question: "What happens if weather conditions are bad on my charter day?",
    answer:
      "If Imperial cancels the charter for unsafe conditions, the booking terms provide for a reschedule or full refund. The captain makes the safety decision.",
  },
  {
    question: "How do I book a yacht charter in Dubai?",
    answer:
      "Booking a yacht charter with Imperial Yachting takes three steps: 1) Contact us via WhatsApp, phone (+971-52-8355939), or the booking form on our website to check availability for your preferred date and yacht. 2) Confirm the booking with a signed charter agreement and a 50% deposit (full payment accepted in AED, USD, EUR, or bank transfer). 3) Arrive at Dubai Harbour Yacht Club on the day — our crew will be ready to welcome you. Same-day bookings are occasionally possible subject to availability.",
  },
  {
    question: "What is the minimum charter duration for a yacht in Dubai?",
    answer:
      "The minimum charter duration with Imperial Yachting is typically 2 hours for weekday bookings and 4 hours on weekends and public holidays. Most guests choose 4–6 hour charters for a sunset cruise or half-day experience, while full-day charters of 8 hours are popular for corporate events, weddings, and birthday parties.",
  },
  {
    question: "Are food and drinks included in a Dubai yacht charter?",
    answer:
      "Standard charters include soft drinks, water, ice, and light snacks. Full catering packages — including BBQ, gourmet mezze, seafood, and customised menus — can be arranged at an additional cost through our partner catering teams. The Monte Carlo 6 is equipped with a full BBQ grill as standard. We can also coordinate birthday cakes, decorations, and themed setups on request.",
  },
];

export const managementFAQ: FAQItem[] = [
  {
    question: "What yacht management services does Imperial Yachting offer?",
    answer:
      "Imperial Yachting provides comprehensive yacht management including charter management and revenue optimization, crew recruitment and training, maintenance scheduling and oversight, financial reporting and accounting, marketing and listing management, and berth management at Dubai Harbour. We handle everything so owners can enjoy their investment without operational hassle.",
  },
  {
    question: "How much revenue can my yacht generate through charter management?",
    answer:
      "It depends on the yacht's size and condition, on the season, and on how much of the calendar you keep for yourself. We don't publish a monthly average — the only figure worth anything to you is the one for your vessel. Send us the specification and the weeks you want to block, and we'll come back with a projection you can check line by line: charter rates for that size and season, our commission, and the running costs.",
  },
  {
    question: "What percentage does Imperial Yachting charge for yacht management?",
    answer:
      "Imperial Yachting's management fee is structured as a performance-based commission on charter revenue, ensuring our interests are aligned with yours as the yacht owner. Contact us for a personalised management proposal tailored to your vessel's specifications, current condition, and your income expectations.",
  },
  {
    question: "What licences does Imperial Yachting hold for yacht management in Dubai?",
    answer:
      "Imperial Charter Yachting Services L.L.C. holds a Dubai trade licence (number 960574, company registration 2236727) and operates in full compliance with Dubai Maritime City Authority (DMCA) regulations. All managed vessels are fully insured and comply with UAE flag state requirements.",
  },
];
