import type { FAQItem } from "@/types/common";

/**
 * Evergreen copy for the /yachts-for-sale hub. It gives the (unlinked) section
 * real indexable content for "yacht for sale Dubai"-type searches and for AI
 * assistants, without cluttering the listing pages brokers actually use.
 */

export const SALES_HUB_INTRO =
  "Owner-direct yacht sales in Dubai. Every yacht here has been run and maintained by Imperial Yachting's own crew, lies at Dubai Harbour and can be viewed and sea-trialled by appointment. Brokers are welcome: each listing has a one-click material pack and client registration built in.";

/** How the section works — the part written for brokers. */
export const BROKER_STEPS: Array<{ title: string; text: string }> = [
  {
    title: "One link, always current",
    text: "Each yacht has a single page with live status, price and particulars. Forward the link instead of a PDF that goes stale.",
  },
  {
    title: "Material pack in one click",
    text: "Tick the spec sheet, photos and videos you need, enter your email once and the files download immediately. No requests, no waiting for a reply.",
  },
  {
    title: "Register your client as you download",
    text: "Add your client's name in the same form. You get a timestamped confirmation by email — the record of who introduced whom.",
  },
];

export const BUYING_GUIDE: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: "How buying a yacht in Dubai works",
    paragraphs: [
      "A typical purchase runs in five steps: shortlist and review the particulars, view the yacht, agree terms and sign a sale agreement with a deposit, complete the survey and sea trial, then pay the balance and transfer ownership and registration.",
      "The sale agreement usually makes the deposit refundable if the survey or sea trial reveals defects the parties cannot agree on, so the buyer is protected while inspecting the vessel. Completion follows once the survey is accepted.",
    ],
  },
  {
    title: "Viewing, survey and sea trial",
    paragraphs: [
      "All our listings lie at Dubai Harbour, so viewings are quick to arrange. Serious buyers can take the yacht out on a sea trial to check engines, systems and handling under way.",
      "We recommend an independent marine surveyor for any used yacht: hull and machinery condition, engine hours and service records matter more than the model year, especially in Gulf heat.",
    ],
  },
  {
    title: "Registration and paperwork",
    paragraphs: [
      "Our yachts are UAE-flagged and registered in Dubai. On completion the registration is transferred to the new owner with the Dubai maritime authority; buyers based abroad can also re-flag the vessel.",
      "We prepare the vessel documents and coordinate the transfer with the buyer and their broker or agent, so the handover can happen at the same berth.",
    ],
  },
  {
    title: "Running costs of ownership",
    paragraphs: [
      "Budget for berthing, insurance, routine maintenance and antifouling, crew or a captain, and fuel. A rule of thumb often used in the industry is around 10% of the yacht's value per year, depending on use.",
      "Owners who want the yacht to pay its way can keep her in charter under a management agreement: charter income offsets berthing and crew, while the manager handles bookings, crew and upkeep.",
    ],
  },
];

export const SALES_FAQ: FAQItem[] = [
  {
    question: "Do you work with brokers?",
    answer:
      "Yes. Co-brokerage is welcome. Download the material pack from any listing and register your client in the same form — you receive a timestamped confirmation by email.",
  },
  {
    question: "Can I view a yacht before buying?",
    answer:
      "Yes. All listed yachts lie at Dubai Harbour. Viewings are by appointment, and a sea trial can be arranged for serious buyers.",
  },
  {
    question: "Can a non-resident buy a yacht in Dubai?",
    answer:
      "Buyers based outside the UAE do purchase yachts in Dubai. The registration route depends on residency and on the flag the buyer chooses; we confirm the requirements for your case before you commit.",
  },
  {
    question: "Why buy a yacht from a charter operator?",
    answer:
      "Our yachts are used and serviced on a regular schedule by a professional crew, with service history on record. A yacht that is run and maintained is often in better mechanical shape than one that has sat idle in Gulf heat.",
  },
  {
    question: "How do I get the brochure and specifications?",
    answer:
      "Open the listing, tick the materials you need and enter your email. The files download immediately and a copy of the links is emailed to you.",
  },
];
