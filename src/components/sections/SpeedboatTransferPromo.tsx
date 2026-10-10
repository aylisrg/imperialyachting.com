import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SPEEDBOAT_TRANSFER } from "@/lib/constants";

/** Home-page banner for Speedboat Transfer (IY-409, frame 2): between the hero and «Our Fleet». */
export function SpeedboatTransferPromo() {
  return (
    <section className="py-10 bg-navy-950">
      <Container>
        <Link
          href={SPEEDBOAT_TRANSFER.path}
          className="group flex flex-col sm:flex-row items-center gap-6 glass-card rounded-2xl p-6 sm:p-8 hover:border-gold-500/30 transition-all duration-500"
        >
          <div className="relative w-full sm:w-52 h-36 sm:h-32 shrink-0 overflow-hidden rounded-xl">
            <Image
              src="/images/speedboat/van-dutch.jpg"
              alt="Van Dutch speedboat transfer in Dubai"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 208px, 100vw"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400">New</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-white">
              Speedboat <span className="text-gold-400">Transfer</span>
            </h2>
            <p className="mt-2 text-white/60">
              A Van Dutch to your yacht, island or pier. {SPEEDBOAT_TRANSFER.pricePerHourAed.toLocaleString("en-US")} AED per hour, VAT included.
            </p>
          </div>
          <span className="inline-flex items-center px-8 py-3 bg-gold-500 group-hover:bg-gold-400 text-navy-950 font-semibold rounded-xl transition-all">
            Learn more
          </span>
        </Link>
      </Container>
    </section>
  );
}
