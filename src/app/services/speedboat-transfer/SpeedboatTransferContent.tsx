import Image from "next/image";
import Link from "next/link";
import { Anchor, Users, ShieldCheck, Clock, CreditCard, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_CONFIG, SPEEDBOAT_TRANSFER } from "@/lib/constants";

// Copy: IY-406 (Copywriter); layout: IY-409 (Designer); offer: IY-358 (Lawyer).

const whatItIs = [
  {
    icon: Anchor,
    title: "From the water, not the street",
    description: "We collect you where you are on the water: a yacht at anchor, an island beach, a pier.",
  },
  {
    icon: ShieldCheck,
    title: "Private, not shared",
    description: "A private transfer by water, not a seat on a shared boat. The whole Van Dutch is yours for the hours you book.",
  },
  {
    icon: Users,
    title: `Up to ${SPEEDBOAT_TRANSFER.maxGuests} guests`,
    description: "Your party travels together, with up to 10 guests aboard.",
  },
];

const pickupNotes = [
  { title: "Your yacht, an island or a pier", description: "Tell us where you are, and we come alongside." },
  { title: "Burj Al Arab", description: "Closed to boats." },
  { title: "Private hotel waters and port areas", description: "Need approval first; we will contact you and clear it before the trip." },
  { title: "Dubai Harbour", description: "Where we drop you, unless you ask otherwise." },
];

const priceFacts = [
  { icon: Clock, text: "From 08:00 to 22:00; the boat leaves no sooner than 45 minutes after you order" },
  { icon: Clock, text: "Minimum one hour, counted from the moment the boat leaves Dubai Harbour until it is back" },
  { icon: CreditCard, text: "You pay in full in advance, by card, Apple Pay or Google Pay" },
  { icon: MapPin, text: "The app shows the exact figure before you pay" },
];

const steps = [
  { title: "Open the order", description: "Open the order in Telegram and tap Order a transfer." },
  { title: "Show where you are", description: "Share your location or move the pin to the water." },
  { title: "Choose time and drop-off", description: "Choose the time and the drop-off." },
  { title: "Check and pay", description: "Check the price and pay." },
];

const price = SPEEDBOAT_TRANSFER.pricePerHourAed.toLocaleString("en-US");

export function SpeedboatTransferContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-navy-950">
          <Image
            src="/images/speedboat/van-dutch.jpg"
            alt="Van Dutch speedboat on the water in Dubai"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={75}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/40" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-2xl">
            <div className="gold-line mb-6" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400">Water taxi · Dubai</p>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Speedboat Transfer in Dubai: <span className="text-gold-400">a Van Dutch to your yacht</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed">
              Van Dutch is the tender you see chosen at superyachts, and you can spot it from the deck far off.
              We run one as a water taxi. Tell us where you are, and we come alongside your yacht, an island or a
              beach-club pier, take your party of up to 10 guests to Dubai Harbour, or to another marina you name.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={SPEEDBOAT_TRANSFER.orderUrl} size="lg">Order in Telegram</Button>
              <Button href="#how" variant="secondary" size="lg">How to book</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* What it is */}
      <section id="what" className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="What it is"
            subtitle="A private transfer by water, not a seat on a shared boat."
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatItIs.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="h-full glass-card rounded-xl p-6 sm:p-8">
                  <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold-500/10 text-gold-400">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Where we pick you up */}
      <section id="zone" className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Where we pick you up"
            subtitle="Not every spot is reachable. If your point cannot be used, we offer the nearest one that can."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {pickupNotes.map((note) => (
              <div key={note.title} className="glass-card rounded-xl px-6 py-5">
                <h3 className="font-heading text-base font-bold text-white">{note.title}</h3>
                <p className="mt-1 text-sm text-white/50">{note.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* When and how much */}
      <section id="price" className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                <p className="font-heading text-5xl sm:text-6xl font-bold text-gold-400">{price} AED</p>
                <p className="mt-3 text-lg text-white/70">per hour · VAT included</p>
                <p className="mt-4 text-sm text-white/45">The minimum is one hour.</p>
              </div>
            </Reveal>
            <div>
              <SectionHeading title="When and how much" className="mb-8" />
              <ul className="space-y-4">
                {priceFacts.map((fact) => (
                  <li key={fact.text} className="flex gap-3 text-white/70">
                    <fact.icon className="w-5 h-5 mt-0.5 shrink-0 text-gold-400" />
                    <span>{fact.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* How to book */}
      <section id="how" className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading title="How to book" align="center" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="h-full glass-card rounded-xl p-6">
                  <p className="font-heading text-3xl font-bold text-gold-500/50">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-heading text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 max-w-3xl mx-auto text-center text-sm text-white/55 leading-relaxed">
            We confirm the point, or offer the nearest workable one, before the trip. Your booking exists once you
            receive our confirmation. A hard case goes to our duty manager, who contacts you; you pay nothing until
            it is settled.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button href={SPEEDBOAT_TRANSFER.orderUrl} size="lg">Order in Telegram</Button>
            <p className="text-xs text-white/45 text-center">
              Opens the ordering app in Telegram. No Telegram?{" "}
              <a href={SITE_CONFIG.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                Write to the manager on WhatsApp
              </a>
              {" · "}
              <Link href={SPEEDBOAT_TRANSFER.termsPath} className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                Terms of Service
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* If plans change */}
      <section id="cancellation" className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="If plans change" align="center" />
            <p className="text-white/65 leading-relaxed">
              Cancel more than 48 hours before the start and you get everything back. Between 24 and 48 hours, 50%.
              Less than 24 hours, or if you do not show up, nothing, unless we re-sell your slot, in which case we
              refund you in full. If we cancel because of weather, safety or the boat, you choose between a full
              refund and a new date. Refunds go to the card you paid with within 2 business days; your bank may show
              them after 5 to 10.
            </p>
            <p className="mt-6 text-white/65">
              Full terms:{" "}
              <Link href={SPEEDBOAT_TRANSFER.termsPath} className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                Terms of Service
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
