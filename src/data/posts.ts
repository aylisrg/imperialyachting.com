export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPostFAQ {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  category: string;
  readingMinutes: number;
  coverImage?: string;
  sections: BlogPostSection[];
  faq?: BlogPostFAQ[];
}

const AUTHOR = "Imperial Yachting Team";

export const posts: BlogPost[] = [
  {
    slug: "yacht-rental-dubai-price-guide-2026",
    title: "Yacht Rental Dubai Price Guide 2026: What You'll Actually Pay",
    description:
      "How yacht charter pricing really works in Dubai — hourly vs daily rates, seasonal swings from October to September, what's included by default, and the hidden fees to check for before you book.",
    datePublished: "2026-08-03T08:00:00.000Z",
    dateModified: "2026-08-03T08:00:00.000Z",
    author: AUTHOR,
    category: "Pricing",
    readingMinutes: 7,
    sections: [
      {
        heading: "Hourly vs daily: which one you're actually buying",
        paragraphs: [
          "Almost every yacht charter quote in Dubai is really an hourly rate wearing a daily costume. A 40ft day cruiser like our Van Dutch 40 starts around AED 2,500–3,000 per hour on a weekday, and a 60ft flybridge like the Monte Carlo 6 runs closer to AED 4,000–5,500 per hour. When a broker or owner quotes you a flat 'day rate,' they've simply multiplied an hourly figure by a fixed block — usually 6 or 8 hours — and sometimes added a discount for the longer commitment.",
          "This matters because most guests don't need 8 hours. A sunset cruise, a birthday celebration, or a proposal photoshoot rarely needs more than 3–4 hours on the water. Booking hourly instead of accepting a pre-packaged 'full day' rate is the single easiest way to avoid overpaying — you pay for the time you'll use, not the time the operator wants to sell.",
        ],
      },
      {
        heading: "The three Dubai seasons that move your price",
        paragraphs: [
          "Dubai's yacht market runs on three pricing bands tied to weather and demand, and they shift by 15–30% between the cheapest and priciest windows of the year.",
        ],
        bullets: [
          "Peak season (October–April): comfortable outdoor temperatures, blue skies, and the highest demand of the year. Expect standard or slightly elevated rates, and book 5–10 days ahead for weekends.",
          "Low season (May–September): daytime heat pushes most charters to early morning or after 5pm. Operators discount daytime hourly slots by 10–20% to fill the boat — this is the best window for budget-conscious sunset cruises since the sunset itself doesn't change in quality.",
          "December super-peak (mid-December through New Year's Eve): demand from holidaymakers and NYE fireworks charters pushes prices 30–50% above the October baseline, and boats are often fully booked two to three weeks out.",
        ],
      },
      {
        heading: "What's already built into the hourly rate",
        paragraphs: [
          "Imperial Yachting's hourly rate is genuinely all-inclusive, and most reputable Dubai operators follow the same model: a licensed captain, a deckhand or two depending on the vessel, fuel for the standard cruising routes (Dubai Marina skyline, Palm Jumeirah, Atlantis, Bluewaters), soft drinks, bottled water, ice, fresh towels, and use of the onboard sound system and safety equipment. On the Monte Carlo 6, that also includes the BBQ grill and Bose surround sound.",
          "None of this should appear as a line item on top of your hourly rate. If a quote lists 'crew fee' or 'fuel surcharge' separately from the headline number, that's a sign the advertised rate isn't the real rate.",
        ],
      },
      {
        heading: "Hidden fees worth asking about before you sign anything",
        paragraphs: [
          "The published hourly or daily rate is rarely the full story with less transparent operators. Ask about each of these explicitly before confirming a booking.",
        ],
        bullets: [
          "Fuel surcharges for routes beyond the standard loop (e.g., trips toward Abu Dhabi or Musandam) — legitimate, but should be quoted upfront in AED, not left vague.",
          "Alcohol and premium catering — almost never included by default anywhere in Dubai; a proper mezze or BBQ spread typically adds AED 80–150 per person.",
          "VAT — UAE's 5% VAT should be shown separately or clearly stated as included; if a quote doesn't mention it at all, ask.",
          "Late return or overtime fees — usually billed at 1.25–1.5x the hourly rate per extra 30 minutes if you run past your slot.",
          "Weekend minimums — many yachts (including ours) require a 4-hour minimum on Fridays, Saturdays, and public holidays versus 2 hours on weekdays, which changes the real per-hour comparison between operators.",
        ],
      },
      {
        heading: "Real price examples from Dubai Harbour",
        paragraphs: [
          "To make this concrete: a 2-hour weekday sunset cruise on a 40ft day cruiser from Dubai Harbour runs roughly AED 5,000–6,000 all-in. A 4-hour weekend birthday charter on a 43ft yacht for 10–12 guests lands around AED 14,000–18,000 before catering extras. A full 6-hour corporate charter on a 60ft flybridge for up to 18 guests typically comes to AED 24,000–33,000, again before add-ons like a photographer or DJ.",
          "One structural discount worth knowing about across the Dubai market: many owner-operated fleets, including ours, run a 'book 4 hours, get 1 hour free' promotion on qualifying weekday slots. That's an effective 20% price reduction on the hourly rate without any negotiation — always ask if it applies to your date before you book.",
        ],
      },
      {
        heading: "How to compare two quotes properly",
        paragraphs: [
          "When two operators quote different numbers for what looks like the same yacht and duration, normalize both to an hourly figure, confirm what's included in each (fuel range, crew count, drinks), and check the deposit and cancellation terms. A 50% deposit with the balance due 48 hours before departure — our standard — is typical of established operators; asking for full payment upfront with no refund policy is a red flag regardless of how attractive the headline number looks.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the average cost of a yacht rental in Dubai per hour?",
        answer:
          "Expect roughly AED 2,500–3,000/hour for a 40ft day cruiser and AED 4,000–5,500/hour for a 60ft flybridge yacht, all-inclusive of crew, fuel on standard routes, and soft drinks.",
      },
      {
        question: "Is it cheaper to book a yacht for a full day or by the hour?",
        answer:
          "It depends on how many hours you actually need. Full-day packages offer a per-hour discount only if you use most of the 6–8 hours; for shorter events, booking the exact hours you need is almost always cheaper.",
      },
      {
        question: "Do yacht prices change with the season in Dubai?",
        answer:
          "Yes. Rates are lowest in the May–September low season, standard in the October–April peak season, and highest during the mid-December to New Year's Eve super-peak, with swings of 15–50% depending on the exact dates.",
      },
    ],
  },
  {
    slug: "how-many-hours-to-book-a-yacht-in-dubai",
    title: "How Many Hours Should You Book a Yacht for in Dubai?",
    description:
      "A practical breakdown of 2, 3, 4, and 6-hour yacht itineraries from Dubai Harbour — what you'll actually see in each timeframe, minute-by-minute, plus how the 4+1 bonus hour works.",
    datePublished: "2026-08-10T08:00:00.000Z",
    dateModified: "2026-08-10T08:00:00.000Z",
    author: AUTHOR,
    category: "Planning",
    readingMinutes: 6,
    sections: [
      {
        heading: "Start from the route, not the clock",
        paragraphs: [
          "The most common mistake first-time charter guests make is picking a duration first and then figuring out what fits. It works better the other way around: decide which landmarks you actually want to see, and the hours follow. From Dubai Harbour, the classic loop runs Marina skyline → Palm Jumeirah → Atlantis → Burj Al Arab → Bluewaters, and each leg takes a predictable amount of time at cruising speed.",
        ],
      },
      {
        heading: "2 hours: the essentials",
        paragraphs: [
          "A 2-hour charter (our weekday minimum) covers the Dubai Marina skyline and a pass along Palm Jumeirah's outer crescent — roughly 20–25 minutes each way from Dubai Harbour to the Palm, plus 15–20 minutes cruising the Marina skyline itself, leaving about 30–40 minutes to anchor, swim, or take photos before heading back. It's tight but genuinely enough for a quick celebration, a proposal, or a photo session — not enough to also reach Atlantis or Burj Al Arab comfortably.",
        ],
      },
      {
        heading: "3 hours: Palm Jumeirah plus Atlantis",
        paragraphs: [
          "Add one hour and you unlock Atlantis The Palm. From Dubai Harbour it's about 15 minutes to the Palm's crescent, another 10–15 minutes around to the Atlantis waterfront for photos, then 15–20 minutes back past the Marina skyline. That leaves close to an hour of free time for anchoring, swimming, or a light meal on board — a well-balanced option for a half-morning or pre-sunset outing that doesn't eat your whole afternoon.",
        ],
      },
      {
        heading: "4 hours: the full landmark loop — and the free bonus hour",
        paragraphs: [
          "Four hours is the sweet spot most of our guests choose, and it's also our weekend minimum. It comfortably covers Marina skyline (15–20 min), Palm Jumeirah crescent and Atlantis (25–30 min round trip with photo stops), a run past Burj Al Arab's iconic sail silhouette (20 min from the Palm), and a loop back via Bluewaters and Ain Dubai (20–25 min), with well over an hour left for swimming, water sports, lunch, or a birthday celebration.",
          "This is also the duration that triggers our 'book 4 hours, get 1 hour free' offer on qualifying weekday charters — effectively a 5th hour at no extra charge, which most guests use to extend the anchor time at Palm West Beach or squeeze in an extra swim stop.",
        ],
      },
      {
        heading: "6 hours: room for events, water sports, and a real meal",
        paragraphs: [
          "A 6-hour charter covers the entire landmark loop at a relaxed pace with time to spare — typically 2–2.5 hours of actual cruising and photo stops, leaving 3.5–4 hours for anchoring, swimming, wakeboarding or jet-ski add-ons, a full catered meal, and a proper birthday or corporate program with speeches, cake, and a DJ set. This is the duration we recommend for groups of 8 or more, or any event with a structured program rather than pure sightseeing.",
        ],
      },
      {
        heading: "Quick reference by group type",
        paragraphs: [
          "If you're still unsure, here's how our regular guests typically choose:",
        ],
        bullets: [
          "Couples / proposals / quick photos: 2 hours",
          "Small friend groups wanting sightseeing plus a swim: 3 hours",
          "Birthdays, anniversaries, sunset celebrations: 4 hours (plus the free bonus hour on weekdays)",
          "Corporate events, larger groups, water sports days: 6 hours",
        ],
      },
    ],
    faq: [
      {
        question: "How many hours do I need to see Palm Jumeirah and Atlantis from Dubai Harbour?",
        answer:
          "A 3-hour charter comfortably covers Palm Jumeirah's crescent and the Atlantis waterfront with time to anchor, while a 2-hour charter can reach Palm Jumeirah but leaves little room for a stop at Atlantis.",
      },
      {
        question: "What is the 4+1 bonus hour offer?",
        answer:
          "On qualifying weekday charters, booking 4 hours gets you a 5th hour free — effectively a 20% discount used most often to extend swimming or anchor time.",
      },
      {
        question: "Is 2 hours enough for a yacht charter in Dubai?",
        answer:
          "Yes for a focused outing like a proposal or quick celebration covering the Marina skyline and Palm Jumeirah, but it's tight if you also want to reach Atlantis, Burj Al Arab, and swim.",
      },
    ],
  },
  {
    slug: "dubai-harbour-vs-dubai-marina-yacht-departure",
    title: "Dubai Harbour vs Dubai Marina: Where Should Your Yacht Charter Depart From?",
    description:
      "Comparing Dubai's two main yacht departure points on parking, security, walking distance to the boat, and what you see first on the water — a practical guide for choosing where to start your charter.",
    datePublished: "2026-08-17T08:00:00.000Z",
    dateModified: "2026-08-17T08:00:00.000Z",
    author: AUTHOR,
    category: "Planning",
    readingMinutes: 6,
    sections: [
      {
        heading: "Two very different marinas, ten minutes apart",
        paragraphs: [
          "Dubai Harbour and Dubai Marina sit roughly 10–15 minutes apart by car, and both host yacht charters, but the on-the-ground experience of arriving and boarding is noticeably different. If you're comparing two quotes for what looks like the same route, where the boat actually leaves from is worth weighing as carefully as the price.",
        ],
      },
      {
        heading: "Parking and arrival",
        paragraphs: [
          "Dubai Harbour Yacht Club has a dedicated, purpose-built visitor car park directly adjacent to the marina walkway, typically a 2–4 minute walk to most berths, with valet options at the neighbouring hotels for an added fee. Dubai Marina, by contrast, is a dense residential and hospitality district — parking is usually in a public multi-storey structure or along Marina Walk, and depending on which berth your yacht occupies, the walk can run anywhere from 5 to 15 minutes, often through crowded pedestrian promenades, especially on weekend evenings.",
        ],
      },
      {
        heading: "Security and access control",
        paragraphs: [
          "Dubai Harbour is a newer, gated marina development with controlled pedestrian access points and marina staff checking guest lists at the yacht club entrance — helpful if you're bringing a larger group or valuables aboard. Dubai Marina's yacht clubs vary by operator: some berths sit inside gated clubs with similar controls, while others are accessed via open public walkways with no formal checkpoint, which is fine for most guests but worth knowing if privacy or security is a priority for a corporate or high-profile event.",
        ],
      },
      {
        heading: "What you see first on the water",
        paragraphs: [
          "This is where departure point genuinely changes your itinerary, not just your commute. Leaving from Dubai Harbour puts you immediately between Palm Jumeirah and Bluewaters Island — within 10–15 minutes you're already at the Palm's crescent or looking up at Ain Dubai, and the Dubai Marina skyline is a scenic backdrop you cruise past rather than a starting point.",
          "Leaving from Dubai Marina puts you inside that famous skyline from minute one — dense skyscrapers on both sides of the marina channel — but it takes roughly 15–20 minutes of transit through the marina and out past JBR Beach before you reach open water and can turn toward Palm Jumeirah, meaning less of your charter time reaches the postcard landmarks.",
        ],
      },
      {
        heading: "Which one should you pick",
        paragraphs: [
          "If your priority is Palm Jumeirah, Atlantis, Burj Al Arab, and Bluewaters — the landmarks most sunset cruises and birthday charters are built around — Dubai Harbour gets you there faster, leaving more of your booked hours for the actual experience rather than transit. If you specifically want the dense Marina skyline as your main visual and don't mind a longer transit to reach the Palm, Dubai Marina works well too. Imperial Yachting's entire fleet is based at Dubai Harbour Yacht Club specifically because it sits at this strategic midpoint — close to Palm Jumeirah, Atlantis, and Bluewaters, with the Marina skyline still visible on the outbound and return legs.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Dubai Harbour or Dubai Marina better for a yacht charter?",
        answer:
          "Dubai Harbour is better positioned for reaching Palm Jumeirah, Atlantis, and Bluewaters quickly since it sits between them, while Dubai Marina puts you inside the skyscraper skyline immediately but requires a longer transit to the Palm.",
      },
      {
        question: "Is parking easier at Dubai Harbour or Dubai Marina?",
        answer:
          "Dubai Harbour has a dedicated visitor car park a short walk from most berths, while Dubai Marina parking is usually in public structures with walk times that vary more by which berth you're assigned.",
      },
      {
        question: "Where does Imperial Yachting's fleet depart from?",
        answer:
          "All Imperial Yachting vessels are berthed at Dubai Harbour Yacht Club, between Palm Jumeirah and Bluewaters Island.",
      },
    ],
  },
  {
    slug: "birthday-party-on-a-yacht-in-dubai-checklist",
    title: "Birthday Party on a Yacht in Dubai: The Complete Planning Checklist",
    description:
      "A step-by-step checklist for planning a birthday charter in Dubai — timeline, guest count vs yacht capacity, catering and decor add-ons with AED price ranges, alcohol rules, and the best sunset timing by month.",
    datePublished: "2026-08-24T08:00:00.000Z",
    dateModified: "2026-08-24T08:00:00.000Z",
    author: AUTHOR,
    category: "Events",
    readingMinutes: 8,
    sections: [
      {
        heading: "Start with guest count, not the calendar",
        paragraphs: [
          "The yacht you can book depends entirely on how many people you're inviting, so lock the guest list before the date. Our Van Dutch 40 comfortably holds up to 10 guests for a seated celebration, the EVO 43 up to 12, and the Monte Carlo 6 up to 18 with its three-cabin layout and spacious flybridge. Squeezing more guests onto a smaller yacht than its rated capacity is both uncomfortable and, on a hot Dubai afternoon, genuinely unsafe — capacity ratings account for safe weight distribution, not just floor space.",
        ],
      },
      {
        heading: "A realistic 4-hour birthday timeline",
        paragraphs: [
          "Most birthday charters we run follow a similar rhythm, adjusted for guest count and whether there's a formal cake moment.",
        ],
        bullets: [
          "0:00–0:15 — Boarding, welcome drinks, safety briefing while the captain casts off",
          "0:15–1:00 — Cruise out via the Marina skyline toward Palm Jumeirah, photos and group shots while the light is still soft",
          "1:00–1:45 — Anchor near Palm West Beach or Bluewaters for swimming, music, and mingling",
          "1:45–2:30 — Catering service (lunch or light bites depending on time of day)",
          "2:30–2:50 — Cake cutting and speeches — plan this for calm anchored water, not while cruising",
          "2:50–3:40 — Free time: more swimming, water sports, dancing, or a slower cruise back past Burj Al Arab",
          "3:40–4:00 — Return to Dubai Harbour and disembark",
        ],
      },
      {
        heading: "Catering, decor, and photography — with real AED ranges",
        paragraphs: [
          "None of these are included in the base charter rate, but all can be arranged through us in advance so they're ready when guests board.",
        ],
        bullets: [
          "Catering: light mezze and finger food from roughly AED 80–120 per person; a full BBQ or seafood spread from AED 150–250 per person, depending on menu and headcount.",
          "Birthday cake: AED 250–600 depending on size and design, arranged through our partner bakeries with delivery to the yacht.",
          "Decoration (balloons, banners, table setup): AED 500–1,500 depending on theme complexity.",
          "Photographer or videographer (1–2 hours on board): AED 800–2,000 through our in-house Cinematographic Bureau, delivering edited highlights within days.",
          "DJ or sound host: AED 600–1,200 for a 3–4 hour set, on top of the yacht's standard sound system.",
        ],
      },
      {
        heading: "Alcohol rules you need to know before you plan",
        paragraphs: [
          "The UAE permits alcohol consumption on licensed vessels and in licensed venues, but yacht charters do not include alcohol by default anywhere in Dubai, including with us — soft drinks and water are standard, and alcohol must be brought aboard by the client or arranged separately with the operator's knowledge, since not every vessel holds the relevant permissions. Never assume alcohol is included in a quoted price, and always confirm with your operator before bringing any aboard so the crew can advise on quantities and any onboard restrictions.",
        ],
      },
      {
        heading: "Getting sunset timing right by month",
        paragraphs: [
          "If sunset photos are the centrepiece of the celebration, timing your boarding to the season matters. Dubai's sunset shifts by nearly two hours across the year: around 18:30–18:45 in June and July, moving earlier to roughly 17:30–17:45 by December and January, with March and September sitting near 18:00–18:15. For a 4-hour charter built around a golden-hour cake moment, board 2.5–3 hours before the sunset time for that month so the anchor-and-cake window lands in the best light.",
        ],
      },
      {
        heading: "A short pre-departure checklist",
        paragraphs: [
          "Confirm final guest count against the yacht's rated capacity, at least 1 week ahead. Order cake and confirm decor theme, at least 4–5 days ahead. Confirm catering menu and dietary restrictions, at least 3 days ahead. Pay the 50% deposit to lock the date, and settle the balance 48 hours before departure. Share a rough run-of-show with your captain the morning of, so cake timing and photo stops line up with calm water.",
        ],
      },
    ],
    faq: [
      {
        question: "How many guests fit on a birthday yacht charter in Dubai?",
        answer:
          "It depends on the yacht: up to 10 on a 40ft day cruiser, up to 12 on a 43ft transformable yacht, and up to 18 on a 60ft flybridge motor yacht like the Monte Carlo 6.",
      },
      {
        question: "Is alcohol included in a birthday yacht charter?",
        answer:
          "No. Standard charters include soft drinks, water, and ice; alcohol is not included by default and must be arranged or brought aboard with the operator's knowledge.",
      },
      {
        question: "How much does it cost to add catering and a photographer to a birthday charter?",
        answer:
          "Light catering starts around AED 80–120 per person, a full BBQ spread AED 150–250 per person, and a photographer for the event typically runs AED 800–2,000 depending on coverage length.",
      },
    ],
  },
  {
    slug: "whats-included-in-a-yacht-charter-and-extras",
    title: "What's Included in a Yacht Charter in Dubai — and What Costs Extra",
    description:
      "A clear breakdown of what's included in every Imperial Yachting charter versus paid extras like catering, DJ, jet ski, wakeboard, decor, and photography, with typical AED prices and how to add them.",
    datePublished: "2026-08-31T08:00:00.000Z",
    dateModified: "2026-08-31T08:00:00.000Z",
    author: AUTHOR,
    category: "Planning",
    readingMinutes: 6,
    sections: [
      {
        heading: "What's included in every charter, no exceptions",
        paragraphs: [
          "Every Imperial Yachting charter, regardless of yacht or duration, is booked as an all-inclusive package covering the essentials you need for a comfortable trip.",
        ],
        bullets: [
          "A licensed captain and crew for the full duration",
          "Fuel for standard cruising routes (Marina skyline, Palm Jumeirah, Atlantis, Burj Al Arab, Bluewaters)",
          "Soft drinks, bottled water, and ice throughout the charter",
          "Fresh towels and basic safety equipment for all guests",
          "Onboard sound system for your own playlist",
          "Standard water toys where fitted (varies by yacht — ask when booking)",
        ],
      },
      {
        heading: "Why these are included and extras aren't",
        paragraphs: [
          "The logic is simple: crew, fuel, and basic comfort items are fixed costs of running any charter and are the same whether you're celebrating a birthday or doing a quiet sightseeing trip, so they're baked into the hourly rate. Catering, entertainment, and add-on activities vary enormously by group — a couple wanting a quiet sunset cruise needs none of it, while a group of 18 celebrating a milestone birthday might want all of it — so pricing them separately keeps the base rate fair for everyone rather than forcing quiet charters to subsidise elaborate ones.",
        ],
      },
      {
        heading: "The extras menu, with typical prices",
        paragraphs: [
          "These are the add-ons our guests request most often, arranged in advance so everything is ready when you board.",
        ],
        bullets: [
          "Catering — light mezze/finger food AED 80–120 per person; full BBQ or seafood spread AED 150–250 per person",
          "DJ or sound host — AED 600–1,200 for a 3–4 hour set",
          "Jet ski rental (brought alongside) — AED 300–450 per 30 minutes, subject to weather and calm-water conditions",
          "Wakeboard or towable tube session — AED 250–400 per session, requires the crew to tow from the yacht",
          "Decoration and theming (balloons, table setup, banners) — AED 500–1,500 depending on complexity",
          "Photography or videography (1–2 hours) — AED 800–2,000 via our in-house Cinematographic Bureau, edited and delivered within days",
          "Birthday or celebration cake — AED 250–600 depending on size and design",
        ],
      },
      {
        heading: "How to add extras without last-minute stress",
        paragraphs: [
          "The best results come from confirming extras at least 3–5 days before your charter date, since catering and decor both need lead time from our partner vendors, and jet skis or wakeboard equipment need to be scheduled and confirmed as weather-dependent. When you book with us — by WhatsApp, phone, or the contact form — simply tell us which extras you're interested in alongside your date and guest count, and we'll send an itemised quote covering the base charter and every add-on before you pay the 50% deposit, so there are no surprises on the day.",
          "One tip: bundling extras into the initial booking, rather than adding them the day before, gives us more room to negotiate better rates with catering and entertainment partners on your behalf, since we can plan logistics further ahead.",
        ],
      },
    ],
    faq: [
      {
        question: "Are drinks included in a Dubai yacht charter?",
        answer:
          "Soft drinks, bottled water, and ice are included as standard in every charter. Alcohol and specialty beverages are not included and must be arranged separately.",
      },
      {
        question: "How much does catering cost on a yacht charter?",
        answer:
          "Light catering typically costs AED 80–120 per person, while a full BBQ or seafood spread runs AED 150–250 per person, depending on the menu and guest count.",
      },
      {
        question: "Can I add a photographer or DJ to my yacht charter?",
        answer:
          "Yes, both can be arranged in advance. A photographer or videographer typically costs AED 800–2,000 for 1–2 hours of coverage, and a DJ or sound host runs AED 600–1,200 for a 3–4 hour set.",
      },
    ],
  },
  {
    slug: "book-a-yacht-in-dubai-with-chatgpt-or-claude",
    title: "How to Book a Yacht in Dubai Using ChatGPT or Claude",
    description:
      "Imperial Yachting exposes a live AI connector (MCP) at imperialyachting.com/api/mcp so ChatGPT, Claude, and Perplexity can browse our fleet, check availability, build a quote, and generate a secure deposit payment link — directly inside your chat.",
    datePublished: "2026-09-07T08:00:00.000Z",
    dateModified: "2026-09-07T08:00:00.000Z",
    author: AUTHOR,
    category: "AI & Booking",
    readingMinutes: 7,
    sections: [
      {
        heading: "You can now book a yacht from inside a chat window",
        paragraphs: [
          "Imperial Yachting runs a live connector — a Model Context Protocol (MCP) server — at https://imperialyachting.com/api/mcp, which lets AI assistants like ChatGPT, Claude, and Perplexity read our real fleet data and availability directly, rather than guessing from a web search. Once connected, you can ask your assistant to find a yacht, check a specific date, and put together a full quote with extras, without leaving the conversation. Full setup and technical details also live on our dedicated /ai page.",
        ],
      },
      {
        heading: "What the assistant can actually do once connected",
        paragraphs: [
          "The connector exposes real, live tools — not a static description of our fleet — so the assistant is working with current data every time.",
        ],
        bullets: [
          "Browse the fleet — current yachts, capacity, specs, and hourly/daily rates by season",
          "Check availability for a specific date and time window against our real booking calendar",
          "Build a full quote including any extras you mention — catering, decor, photographer, DJ, jet ski",
          "Generate a secure Stripe payment link for the 50% deposit, so you can confirm the booking on the spot",
        ],
      },
      {
        heading: "Setting it up in ChatGPT",
        paragraphs: [
          "In ChatGPT, connectors are added from Settings → Connectors (on some plans this is labelled Developer Mode or Custom Connectors). Choose to add a custom connector, paste in the URL https://imperialyachting.com/api/mcp, give it a name such as 'Imperial Yachting,' and save. Once added, you can either mention it directly in a prompt or enable it for the current chat, and ChatGPT will call the connector's tools whenever your question touches yacht availability or pricing.",
        ],
      },
      {
        heading: "Setting it up in Claude",
        paragraphs: [
          "In Claude, go to Settings → Connectors → Add custom connector, and paste in the same URL, https://imperialyachting.com/api/mcp. Claude will confirm the connector's available tools before you start using it. From that point, you can simply ask Claude your yacht question in plain language and it will call the connector automatically when relevant.",
        ],
      },
      {
        heading: "Using it in Perplexity",
        paragraphs: [
          "Perplexity's connector support is rolling out progressively across plans; where available, connectors are added from account or space settings using the same MCP server URL. If your version of Perplexity doesn't yet expose custom MCP connectors, you can still ask Perplexity to fetch and summarise our /ai page directly, which documents the same capabilities in plain text.",
        ],
      },
      {
        heading: "Example prompts that actually work",
        paragraphs: [
          "Once connected, you don't need to phrase anything specially — plain, natural requests work well. A few examples our own guests have used successfully:",
        ],
        bullets: [
          "\"Find me a yacht for 8 people this Saturday from 4 to 8pm with a photographer.\"",
          "\"What's the cheapest yacht available for a 3-hour sunset cruise next Tuesday?\"",
          "\"Build a quote for the Monte Carlo 6 for a birthday party, 15 guests, next Friday afternoon, with BBQ catering.\"",
          "\"Is anything available this weekend for a 2-hour charter, and what's the deposit?\"",
        ],
      },
      {
        heading: "A note on privacy and payment",
        paragraphs: [
          "The connector only reads and writes booking-related data — fleet details, availability, quotes, and deposit checkout sessions — and never asks the assistant to handle your card details directly. When you're ready to confirm, the assistant generates a Stripe-hosted payment link for the 50% deposit; you complete payment on Stripe's own secure page, not inside the chat, and the balance is due 48 hours before departure as with any booking made through our website or WhatsApp. We don't receive your payment details through the AI conversation itself, only Stripe's confirmation that the deposit was paid.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the Imperial Yachting AI connector?",
        answer:
          "It's a live MCP (Model Context Protocol) server at https://imperialyachting.com/api/mcp that lets AI assistants such as ChatGPT and Claude browse our real fleet, check availability, and build quotes directly.",
      },
      {
        question: "How do I add the Imperial Yachting connector in Claude or ChatGPT?",
        answer:
          "In Claude, go to Settings → Connectors → Add custom connector; in ChatGPT, go to Settings → Connectors (or Developer Mode) and add a custom connector. In both cases, enter the URL https://imperialyachting.com/api/mcp.",
      },
      {
        question: "Can I actually pay a deposit through the AI chat?",
        answer:
          "The assistant can generate a secure Stripe payment link for the 50% deposit, but payment itself happens on Stripe's own hosted page, not inside the chat conversation.",
      },
    ],
  },
];
