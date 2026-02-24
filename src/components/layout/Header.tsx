"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SERVICE_NAV, SITE_CONFIG } from "@/lib/constants";
import { Container } from "./Container";
import { PromoBanner } from "@/components/promo/PromoBanner";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

interface HeaderProps {
  bannerVisible?: boolean;
  onBannerDismiss?: () => void;
}

export function Header({ bannerVisible = false, onBannerDismiss }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      setIsServicesOpen(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {bannerVisible && <PromoBanner onDismiss={onBannerDismiss} />}
        <header
          className={cn(
            "transition-all duration-500",
            isScrolled
              ? "bg-navy-950/95 backdrop-blur-xl border-b border-gold-500/10 py-3"
              : "bg-transparent py-5"
          )}
        >
        <Container>
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-gold-400 transition-colors">
                IMPERIAL
              </span>
              <span className="font-heading text-xl sm:text-2xl font-semibold tracking-wider text-gold-500">
                YACHTING
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.label === "Services" ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                        pathname.startsWith("/services")
                          ? "text-gold-400"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Link>
                    <div
                      className={cn(
                        "dropdown-menu absolute top-full left-0 mt-1 w-56 rounded-xl bg-navy-800/95 backdrop-blur-xl border border-gold-500/10 py-2 shadow-2xl",
                        isServicesOpen && "open"
                      )}
                    >
                      {SERVICE_NAV.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "block px-4 py-2.5 text-sm transition-colors",
                            pathname === sub.href
                              ? "text-gold-400 bg-white/5"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                      pathname === link.href || pathname.startsWith(link.href + "/")
                        ? "text-gold-400"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="hidden sm:flex items-center gap-2 text-sm text-white/70 hover:text-gold-400 transition-colors"
                onClick={() => trackPhoneClick("header")}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden md:inline">{SITE_CONFIG.phone}</span>
              </a>
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-gold-500/20"
                onClick={() => trackWhatsAppClick("header")}
              >
                Book Now
              </a>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </Container>
        </header>
      </div>

      {/* Mobile Menu — CSS slide transition, always in DOM */}
      <div
        className={cn(
          "mobile-menu fixed inset-0 z-40 bg-navy-950/98 backdrop-blur-xl lg:hidden",
          isMobileOpen && "open"
        )}
        aria-hidden={!isMobileOpen}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6 pt-20">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-2xl font-heading font-semibold transition-colors",
                pathname === link.href
                  ? "text-gold-400"
                  : "text-white/80 hover:text-white"
              )}
              tabIndex={isMobileOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold rounded-lg transition-all text-lg"
              tabIndex={isMobileOpen ? 0 : -1}
              onClick={() => trackWhatsAppClick("header_mobile")}
            >
              Book Now
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="text-white/60 hover:text-gold-400 transition-colors"
              tabIndex={isMobileOpen ? 0 : -1}
            >
              {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
