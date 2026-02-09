import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service and charter conditions for ${SITE_CONFIG.name}. Review our booking, cancellation, liability, and payment terms.`,
  openGraph: {
    title: `Terms of Service | ${SITE_CONFIG.name}`,
    description: `Terms of service and charter conditions for ${SITE_CONFIG.name}. Review our booking, cancellation, liability, and payment terms.`,
    url: `${SITE_CONFIG.url}/terms`,
  },
};

const lastUpdated = "1 January 2025";

const sections = [
  {
    title: "1. Charter Terms & Conditions",
    content: [
      `These Terms of Service ("Terms") govern all charter bookings and services provided by ${SITE_CONFIG.legalName} ("Imperial Yachting", "we", "our", or "us"), a company registered in the United Arab Emirates. By booking a charter or using our services, you ("the Client", "you") agree to be bound by these Terms.`,
      "All charters are subject to vessel availability and weather conditions. Imperial Yachting reserves the right to substitute a vessel of equal or superior specification if the originally booked yacht becomes unavailable due to unforeseen circumstances, mechanical issues, or regulatory requirements.",
      "The maximum number of guests permitted on board is determined by the vessel's safety certification and must not be exceeded under any circumstances. The captain retains full authority over all safety-related decisions during the charter, including route changes, early return, or cancellation due to weather or sea conditions.",
      "All guests must comply with UAE maritime regulations and the instructions of the crew at all times. Any behaviour deemed unsafe, disruptive, or in violation of UAE law may result in immediate termination of the charter without refund.",
    ],
  },
  {
    title: "2. Booking & Cancellation",
    content: [
      "Booking Confirmation: A charter booking is confirmed only upon receipt of the required deposit and written confirmation from Imperial Yachting. A booking inquiry or verbal agreement does not constitute a confirmed reservation.",
      "Deposit: A non-refundable deposit of 50% of the total charter fee is required to secure your booking. The remaining balance is due no later than 48 hours prior to the scheduled departure time.",
      "Cancellation by Client: Cancellations made more than 7 days prior to the charter date are eligible for a credit note valid for 12 months, less the deposit. Cancellations made within 7 days of the charter date are subject to 100% of the total charter fee. No-shows or cancellations on the day of charter forfeit the full amount.",
      "Cancellation by Imperial Yachting: In the event that we must cancel a charter due to adverse weather conditions, vessel mechanical issues, or force majeure, we will offer a full reschedule to an alternative date or a complete refund of all payments made. Weather-related cancellations are determined by the captain based on maritime safety standards.",
      "Rescheduling: Rescheduling requests made more than 48 hours before departure will be accommodated subject to availability at no additional charge. Requests within 48 hours are treated as cancellations.",
    ],
  },
  {
    title: "3. Liability",
    content: [
      "Guest Responsibility: All guests board and participate in the charter at their own risk. Guests are responsible for their personal belongings, and Imperial Yachting accepts no liability for loss, theft, or damage to personal property during the charter.",
      "Vessel Damage: The Client is liable for any damage to the vessel, its fixtures, fittings, or equipment caused by the Client or any member of the Client's party during the charter, whether through negligence, misuse, or wilful conduct. The cost of repair or replacement will be charged to the Client.",
      "Personal Injury: While Imperial Yachting maintains comprehensive marine insurance and all vessels are equipped with safety equipment in compliance with UAE maritime regulations, we shall not be liable for personal injury, illness, or death arising from the Client's own negligence, failure to follow crew instructions, or pre-existing medical conditions not disclosed prior to boarding.",
      "Limitation of Liability: To the maximum extent permitted by applicable law, Imperial Yachting's total liability for any claim arising from or related to the charter shall not exceed the total charter fee paid by the Client for the specific booking in question.",
      "Force Majeure: Imperial Yachting shall not be liable for any failure or delay in performing our obligations where such failure or delay results from circumstances beyond our reasonable control, including but not limited to severe weather, natural disasters, government actions, civil unrest, or pandemic-related restrictions.",
    ],
  },
  {
    title: "4. Payment Terms",
    content: [
      "Currency: All charter fees and charges are quoted and payable in United Arab Emirates Dirhams (AED) unless otherwise agreed in writing.",
      "Accepted Methods: Payment may be made by bank transfer, credit card, or such other methods as we may accept from time to time. Bank transfer details are available on our Documents page or upon request.",
      "Charter Fee Inclusions: Unless otherwise specified in writing, the standard charter fee includes the vessel, professional crew, fuel for the agreed route, basic refreshments, and standard water sports equipment where available.",
      "Additional Charges: Additional services including but not limited to premium catering, extended route deviations, special decorations, photography services, or additional water sports equipment will be quoted separately and are payable prior to or on the day of the charter.",
      "Late Payment: Failure to make payment by the due date may result in cancellation of the booking. Imperial Yachting reserves the right to charge a late payment fee of 2% per week on any overdue amounts.",
    ],
  },
  {
    title: "5. Conduct & Prohibited Activities",
    content: [
      "All guests must conduct themselves in a responsible manner and comply with the following:",
      "Illegal substances are strictly prohibited on board all vessels. Violation will result in immediate termination of the charter and reporting to the relevant authorities.",
      "Smoking is only permitted in designated outdoor areas as indicated by the crew.",
      "Guests must follow all safety briefing instructions and wear life jackets when directed by the crew.",
      "Fishing is only permitted where expressly included in the charter agreement and in compliance with UAE fishing regulations.",
      "The use of drones is subject to UAE aviation regulations and requires prior approval from Imperial Yachting.",
    ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      `All content on the ${SITE_CONFIG.name} website, including text, images, logos, graphics, and design elements, is the property of ${SITE_CONFIG.legalName} and is protected by UAE and international copyright laws. No content may be reproduced, distributed, or used without prior written permission.`,
      "Photography and videography taken by our professional crew during charters remain the property of Imperial Yachting unless otherwise agreed. We may use such media for promotional purposes unless the Client provides written objection prior to the charter.",
    ],
  },
  {
    title: "7. Governing Law",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising out of or in connection with these Terms or any charter booking shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.",
      "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
    ],
  },
  {
    title: "8. Changes to These Terms",
    content: [
      "Imperial Yachting reserves the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised date. Continued use of our services following any changes constitutes acceptance of the revised Terms. It is the Client's responsibility to review these Terms periodically.",
    ],
  },
  {
    title: "9. Contact",
    content: [
      "For questions regarding these Terms of Service, please contact us:",
      `${SITE_CONFIG.legalName}`,
      `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.area}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`,
      `Email: ${SITE_CONFIG.email}`,
      `Phone: ${SITE_CONFIG.phone}`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="gold-line mb-8" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="mt-4 text-white/40 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-navy-900">
        <Container>
          <div className="max-w-3xl">
            <p className="text-white/60 leading-relaxed mb-12">
              Please read these Terms of Service carefully before booking a
              charter or using any services provided by{" "}
              {SITE_CONFIG.legalName}. By making a booking or engaging our
              services, you acknowledge that you have read, understood, and
              agree to be bound by these Terms.
            </p>

            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-white/55 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
