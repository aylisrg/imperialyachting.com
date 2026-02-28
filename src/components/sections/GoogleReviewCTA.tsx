import { Star, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/constants";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function GoogleReviewCTA() {
  return (
    <section className="py-16 sm:py-20 bg-sand-50 border-y border-navy-950/10">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white border border-navy-950/8 shadow-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              {/* Left: Google branding + stars */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <GoogleIcon />
                  <span className="text-sm font-semibold text-navy-900/60 tracking-wide">Google</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-6 h-6 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-2xl font-bold text-navy-950 font-heading">5.0</p>
                <p className="text-xs text-navy-950/40 -mt-1">Based on 6 reviews</p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-24 bg-navy-950/8" />
              <div className="sm:hidden w-full h-px bg-navy-950/8" />

              {/* Right: CTA text */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
                  Chartered with us? Share your experience
                </h3>
                <p className="mt-3 text-navy-950/55 text-base leading-relaxed max-w-md">
                  We&apos;re actively growing our Google reviews. Your feedback helps
                  other guests find us and means everything to our crew.
                </p>

                <a
                  href={SITE_CONFIG.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-white font-semibold px-7 py-3.5 text-sm transition-colors duration-200"
                >
                  <GoogleIcon />
                  Leave a Google Review
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
