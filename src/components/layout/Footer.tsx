"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Youtube,
  Linkedin,
  Anchor,
} from "lucide-react";
import { Container } from "./Container";
import { SITE_CONFIG, NAV_LINKS, SERVICE_NAV } from "@/lib/constants";
import { trackPhoneClick, trackEmailClick, trackWhatsAppClick } from "@/lib/analytics";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 border-t border-white/5">
      {/* Main Footer */}
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Anchor className="w-6 h-6 text-gold-500" />
              <span className="font-heading text-xl font-bold text-white">
                IMPERIAL{" "}
                <span className="text-gold-500">YACHTING</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {SITE_CONFIG.tagline}. Luxury yacht charter, management, and
              crewed experiences from Dubai Harbour.
            </p>
            <div className="flex gap-4">
              <a
                href={SITE_CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-gold-500/20 text-white/50 hover:text-gold-400 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONFIG.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-gold-500/20 text-white/50 hover:text-gold-400 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONFIG.linkedinCeo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-gold-500/20 text-white/50 hover:text-gold-400 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/documents"
                  className="text-sm text-white/50 hover:text-gold-400 transition-colors"
                >
                  Documents
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICE_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-start gap-3 text-sm text-white/50 hover:text-gold-400 transition-colors"
                  onClick={() => trackPhoneClick("footer")}
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-start gap-3 text-sm text-white/50 hover:text-gold-400 transition-colors"
                  onClick={() => trackEmailClick("footer")}
                >
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {SITE_CONFIG.harbour.name}
                    <br />
                    {SITE_CONFIG.harbour.area}, {SITE_CONFIG.harbour.city}
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-gold-500/20"
                onClick={() => trackWhatsAppClick("footer")}
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/30">
            &copy; {currentYear} {SITE_CONFIG.legalName}. All rights reserved.
            <span className="mx-2">|</span>
            License: {SITE_CONFIG.license}
          </div>
          <div className="flex gap-6 text-xs text-white/30">
            <Link
              href="/privacy"
              className="hover:text-white/50 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white/50 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
