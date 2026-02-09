import { Anchor } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sea-500/[0.04] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(201,168,76,0.8) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Container className="relative z-10 py-32 text-center">
        {/* Anchor icon */}
        <Anchor
          className="w-16 h-16 text-gold-500/30 mx-auto mb-8"
          strokeWidth={1}
        />

        {/* 404 heading */}
        <h1 className="font-heading text-8xl sm:text-9xl font-bold tracking-tight">
          <span className="text-gold-gradient">404</span>
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Page Not Found
        </h2>

        {/* Tagline */}
        <p className="mt-4 text-lg text-white/50 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for has sailed away.
        </p>

        {/* Decorative line */}
        <div className="gold-line mx-auto mt-8 mb-10" />

        {/* CTA */}
        <Button variant="primary" size="lg" href="/">
          <Anchor className="w-4 h-4" />
          Return to Harbour
        </Button>
      </Container>
    </section>
  );
}
